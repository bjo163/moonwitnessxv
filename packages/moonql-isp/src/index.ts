import { badRequest, conflict, forbidden, notFound } from '@moonwitness/core'
import {
  bool,
  defineAddon,
  int,
  sel,
  str,
  ts,
  type EndpointCtx,
  type ModelRepo,
  type Row,
} from '@moonwitness/moonql'
import { hashRadiusPassword, verifyRadiusPassword } from './credentials.js'
import { models, SERVICE_CAPABILITIES } from './models.js'
import { sweepMonitorTargets } from './monitoring.js'

export { hashRadiusPassword, verifyRadiusPassword } from './credentials.js'
export { models } from './models.js'
export { sweepMonitorTargets, type SweepDeps, type SweepSummary } from './monitoring.js'
export { probeTarget, monitoringUrl, type Measure, type ProbeDeps, type ProbeOutcome } from './probes.js'

const repo = (ctx: EndpointCtx, model: string): ModelRepo => ctx.orm.model(model) as ModelRepo
const stringOf = (value: unknown): string => (typeof value === 'string' ? value : '')
const activeAt = (row: Row, now = Date.now()): boolean => {
  if (row.active !== true) return false
  if (typeof row.expiresAt !== 'string') return true
  const expiresAt = Date.parse(row.expiresAt)
  return Number.isFinite(expiresAt) && expiresAt > now
}
const responseRow = (row: Row): Record<string, unknown> => ({ ...row })

async function requireOperator(ctx: EndpointCtx, tenantId: string, capability: 'read' | 'manage' | 'network'): Promise<void> {
  if (!ctx.user) throw forbidden()
  const tenant = await repo(ctx, 'isp_tenants').search({ limit: 1, where: { id: tenantId, status: 'active' } })
  if (!tenant.rows[0]) throw forbidden('ISP tenant is unavailable')
  const grants = await repo(ctx, 'isp_operator_grants').search({
    limit: 100,
    where: { tenantRef: tenantId, userRef: ctx.user.id, active: true },
  })
  const now = Date.now()
  const granted = grants.rows.some((grant) => {
    if (!activeAt(grant, now)) return false
    const actual = String(grant.capability)
    return actual === capability || (capability === 'read' && actual === 'manage')
  })
  if (!granted) throw forbidden('A tenant-scoped ISP operator grant is required')
}

async function serviceHasGrant(ctx: EndpointCtx, tenantId: string, capability: string): Promise<boolean> {
  const user = ctx.user
  const keyId = user?.meta?.keyId
  if (!user?.roles.includes('isp-radius') || typeof keyId !== 'string') {
    throw forbidden('A D00 ISP RADIUS service credential is required')
  }
  const grants = await repo(ctx, 'isp_service_grants').search({
    limit: 100,
    where: { tenantRef: tenantId, apiKeyRef: keyId, capability, active: true },
  })
  return grants.rows.some((grant) => activeAt(grant))
}

async function nasForService(ctx: EndpointCtx, nasId: string, capability: string): Promise<Row | null> {
  const found = await repo(ctx, 'isp_nas').search({ limit: 100, where: { nasId, status: 'enabled' }, raw: true })
  const authorized: Row[] = []
  for (const nas of found.rows) {
    const tenantId = String(nas.tenantRef)
    const tenant = await repo(ctx, 'isp_tenants').search({ limit: 1, where: { id: tenantId, status: 'active' } })
    if (tenant.rows[0] && await serviceHasGrant(ctx, tenantId, capability)) authorized.push(nas)
  }
  // NAS identifiers may be duplicated across tenants. The service grant must
  // resolve exactly one candidate or the adapter fails closed.
  return authorized.length === 1 ? authorized[0]! : null
}

async function createAccountingSession(ctx: EndpointCtx, payload: {
  tenantRef: string
  nasRef: string
  radiusUserRef: string
  sessionKey: string
  eventType: 'start' | 'interim' | 'stop'
  eventAt: string
  inputOctets: number
  outputOctets: number
  sessionSeconds: number
}) {
  const sessions = repo(ctx, 'isp_sessions')
  const found = await sessions.search({ limit: 1, where: { tenantRef: payload.tenantRef, sessionKey: payload.sessionKey } })
  const previous = found.rows[0]
  const currentTime = previous ? Date.parse(String(previous.lastEventAt)) : 0
  const incomingTime = Date.parse(payload.eventAt)
  if (!previous) {
    try {
      await sessions.create({
        tenantRef: payload.tenantRef,
        nasRef: payload.nasRef,
        radiusUserRef: payload.radiusUserRef,
        sessionKey: payload.sessionKey,
        status: payload.eventType === 'stop' ? 'stopped' : payload.eventType === 'start' ? 'started' : 'active',
        startedAt: payload.eventType === 'start' ? payload.eventAt : new Date(incomingTime).toISOString(),
        lastEventAt: payload.eventAt,
        stoppedAt: payload.eventType === 'stop' ? payload.eventAt : null,
        inputOctets: payload.inputOctets,
        outputOctets: payload.outputOctets,
      })
      return
    } catch (err) {
      const raced = await sessions.search({ limit: 1, where: { tenantRef: payload.tenantRef, sessionKey: payload.sessionKey } })
      if (!raced.rows[0]) throw err
      return createAccountingSession(ctx, payload)
    }
  }
  if (Number.isFinite(incomingTime) && incomingTime >= currentTime) {
    const status = previous.status === 'stopped'
      ? 'stopped'
      : payload.eventType === 'stop'
        ? 'stopped'
        : payload.eventType === 'interim'
          ? 'active'
          : String(previous.status)
    await sessions.update(String(previous.id), {
      status,
      lastEventAt: payload.eventAt,
      stoppedAt: payload.eventType === 'stop' ? payload.eventAt : previous.stoppedAt,
      inputOctets: Math.max(Number(previous.inputOctets ?? 0), payload.inputOctets),
      outputOctets: Math.max(Number(previous.outputOctets ?? 0), payload.outputOctets),
    })
  }
}

const isp = defineAddon({
  name: 'isp',
  version: '1.0.0',
  depends: ['auth', 'apikeys'],
  models,
  endpoints: {
    listTenants: {
      path: '/isp/tenants',
      method: 'GET',
      requires: 'auth',
      handler: async (ctx) => {
        const { user } = ctx
        if (!user) throw forbidden()
        const grants = await repo(ctx, 'isp_operator_grants').search({
          limit: 500,
          where: { userRef: user.id, active: true },
        })
        const now = Date.now()
        const tenantIds = [...new Set(grants.rows.filter((grant) => activeAt(grant, now)).map((grant) => String(grant.tenantRef)))]
        const tenants = repo(ctx, 'isp_tenants')
        const rows: Row[] = []
        for (const id of tenantIds) {
          const found = await tenants.search({ limit: 1, where: { id, status: 'active' } })
          if (found.rows[0]) rows.push(found.rows[0])
        }
        return rows.map(responseRow)
      },
    },
    createTenant: {
      path: '/isp/tenants',
      method: 'POST',
      requires: ['admin'],
      body: { slug: str({ minLength: 2, maxLength: 64 }), name: str({ minLength: 2, maxLength: 160 }) },
      handler: async (ctx) => {
        const { body } = ctx
        return repo(ctx, 'isp_tenants').create({ slug: body.slug, name: body.name, status: 'active' })
      },
    },
    createOperatorGrant: {
      path: '/isp/tenants/:tenantId/operator-grants',
      method: 'POST',
      requires: ['admin'],
      body: {
        userRef: str({ minLength: 1, maxLength: 36 }),
        capability: sel(['read', 'manage', 'network']),
        expiresAt: ts({ null: true }),
      },
      handler: async (ctx) => {
        const { body, params } = ctx
        const tenants = repo(ctx, 'isp_tenants')
        const tenant = await tenants.search({ limit: 1, where: { id: params.tenantId, status: 'active' } })
        if (!tenant.rows[0]) throw notFound('ISP tenant not found')
        const users = repo(ctx, 'auth_users')
        try {
          await users.get(stringOf(body.userRef))
        } catch {
          throw notFound('D00 operator not found')
        }
        return repo(ctx, 'isp_operator_grants').create({
          tenantRef: params.tenantId,
          userRef: body.userRef,
          capability: body.capability,
          active: true,
          expiresAt: body.expiresAt,
        })
      },
    },
    createServiceGrant: {
      path: '/isp/tenants/:tenantId/service-grants',
      method: 'POST',
      requires: ['admin'],
      body: {
        apiKeyRef: str({ minLength: 1, maxLength: 36 }),
        capability: sel(SERVICE_CAPABILITIES),
        expiresAt: ts({ null: true }),
      },
      handler: async (ctx) => {
        const { body, params } = ctx
        const tenants = repo(ctx, 'isp_tenants')
        const tenant = await tenants.search({ limit: 1, where: { id: params.tenantId, status: 'active' } })
        if (!tenant.rows[0]) throw notFound('ISP tenant not found')
        const key = await repo(ctx, 'api_keys').get(stringOf(body.apiKeyRef))
        const keyRoles = String(key.roles).split(',').map((role) => role.trim()).filter(Boolean)
        if (key.active !== true || keyRoles.length !== 1 || keyRoles[0] !== 'isp-radius') {
          throw badRequest('D00 API key must be active and carry only the isp-radius service role')
        }
        return repo(ctx, 'isp_service_grants').create({
          tenantRef: params.tenantId,
          apiKeyRef: body.apiKeyRef,
          capability: body.capability,
          active: true,
          expiresAt: body.expiresAt,
        })
      },
    },
    listProfiles: {
      path: '/isp/tenants/:tenantId/radius/profiles',
      method: 'GET',
      requires: 'auth',
      handler: async (ctx) => {
        const { params } = ctx
        await requireOperator(ctx, params.tenantId!, 'read')
        return (await repo(ctx, 'isp_radius_profiles').search({
          limit: 500,
          where: { tenantRef: params.tenantId },
        })).rows
      },
    },
    createProfile: {
      path: '/isp/tenants/:tenantId/radius/profiles',
      method: 'POST',
      requires: 'auth',
      body: {
        code: str({ minLength: 1, maxLength: 64 }),
        name: str({ minLength: 1, maxLength: 120 }),
        uploadKbps: int(),
        downloadKbps: int(),
        sessionLimit: int(),
        addressPool: str({ maxLength: 120, null: true }),
        ipv6PrefixPool: str({ maxLength: 120, null: true }),
        delegatedIpv6PrefixPool: str({ maxLength: 120, null: true }),
        vendorDomain: str({ maxLength: 120, null: true }),
      },
      handler: async (ctx) => {
        const { body, params } = ctx
        await requireOperator(ctx, params.tenantId!, 'manage')
        const rates = [Number(body.uploadKbps), Number(body.downloadKbps), Number(body.sessionLimit)]
        if (rates.some((value) => !Number.isSafeInteger(value) || value < 0) || rates[2] === 0) {
          throw badRequest('RADIUS rates must be non-negative safe integers and sessionLimit must be positive')
        }
        return repo(ctx, 'isp_radius_profiles').create({
          tenantRef: params.tenantId,
          ...body,
          status: 'enabled',
        })
      },
    },
    listNas: {
      path: '/isp/tenants/:tenantId/nas',
      method: 'GET',
      requires: 'auth',
      handler: async (ctx) => {
        const { params } = ctx
        await requireOperator(ctx, params.tenantId!, 'read')
        return (await repo(ctx, 'isp_nas').search({
          limit: 500,
          where: { tenantRef: params.tenantId },
        })).rows
      },
    },
    createNas: {
      path: '/isp/tenants/:tenantId/nas',
      method: 'POST',
      requires: 'auth',
      body: {
        nasId: str({ minLength: 1, maxLength: 128 }),
        displayName: str({ minLength: 1, maxLength: 120 }),
        address: str({ minLength: 1, maxLength: 255 }),
        secretRef: str({ minLength: 1, maxLength: 160 }),
        radsecEnabled: bool(),
      },
      handler: async (ctx) => {
        const { body, params } = ctx
        await requireOperator(ctx, params.tenantId!, 'manage')
        return repo(ctx, 'isp_nas').create({
          tenantRef: params.tenantId,
          ...body,
          status: 'enabled',
        })
      },
    },
    listNetworkNodes: {
      path: '/isp/tenants/:tenantId/network/nodes',
      method: 'GET',
      requires: 'auth',
      handler: async (ctx) => {
        const { params } = ctx
        await requireOperator(ctx, params.tenantId!, 'read')
        return (await repo(ctx, 'isp_network_nodes').search({
          limit: 500,
          where: { tenantRef: params.tenantId },
        })).rows
      },
    },
    createNetworkNode: {
      path: '/isp/tenants/:tenantId/network/nodes',
      method: 'POST',
      requires: 'auth',
      body: {
        code: str({ minLength: 1, maxLength: 64 }),
        name: str({ minLength: 1, maxLength: 120 }),
        role: sel(['nas', 'router', 'switch', 'olt', 'odp', 'other']),
        managementAddress: str({ maxLength: 255, null: true }),
      },
      handler: async (ctx) => {
        const { body, params } = ctx
        await requireOperator(ctx, params.tenantId!, 'manage')
        return repo(ctx, 'isp_network_nodes').create({
          tenantRef: params.tenantId,
          ...body,
          status: 'active',
        })
      },
    },
    createMonitorTarget: {
      path: '/isp/tenants/:tenantId/network/targets',
      method: 'POST',
      requires: 'auth',
      body: {
        nodeRef: str({ minLength: 1, maxLength: 36 }),
        probeKind: sel(['icmp', 'snmp-read', 'http-read']),
        freshnessSeconds: int(),
      },
      handler: async (ctx) => {
        const { body, params } = ctx
        await requireOperator(ctx, params.tenantId!, 'manage')
        const nodes = await repo(ctx, 'isp_network_nodes').search({
          limit: 1,
          where: { id: body.nodeRef, tenantRef: params.tenantId, status: 'active' },
        })
        const node = nodes.rows[0]
        if (!node || typeof node.managementAddress !== 'string' || node.managementAddress.length === 0) {
          throw badRequest('Monitoring requires an active, tenant-owned node with a registered management address')
        }
        const freshnessSeconds = Number(body.freshnessSeconds)
        if (!Number.isInteger(freshnessSeconds) || freshnessSeconds < 30 || freshnessSeconds > 86_400) {
          throw badRequest('Monitoring freshnessSeconds must be between 30 and 86400')
        }
        return repo(ctx, 'isp_monitor_targets').create({
          tenantRef: params.tenantId,
          nodeRef: body.nodeRef,
          probeKind: body.probeKind,
          targetRef: node.managementAddress,
          enabled: true,
          status: 'unknown',
          checkedAt: null,
          freshnessSeconds,
        })
      },
    },
    listNetworkHealth: {
      path: '/isp/tenants/:tenantId/network/health',
      method: 'GET',
      requires: 'auth',
      handler: async (ctx) => {
        const { params } = ctx
        await requireOperator(ctx, params.tenantId!, 'read')
        const targets = await repo(ctx, 'isp_monitor_targets').search({
          limit: 500,
          where: { tenantRef: params.tenantId, enabled: true },
        })
        const now = Date.now()
        return targets.rows.map((target) => {
          const checkedAt = typeof target.checkedAt === 'string' ? Date.parse(target.checkedAt) : NaN
          const threshold = Number(target.freshnessSeconds) * 1000
          const age = now - checkedAt
          const freshness = !Number.isFinite(checkedAt) ? 'never-checked' : age < 0 ? 'unknown' : age > threshold ? 'stale' : 'fresh'
          return { ...target, freshness }
        })
      },
    },
    listSessions: {
      path: '/isp/tenants/:tenantId/sessions',
      method: 'GET',
      requires: 'auth',
      handler: async (ctx) => {
        const { params } = ctx
        await requireOperator(ctx, params.tenantId!, 'read')
        return (await repo(ctx, 'isp_sessions').search({
          limit: 500,
          where: { tenantRef: params.tenantId },
        })).rows
      },
    },
    createRadiusUser: {
      path: '/isp/tenants/:tenantId/radius/users',
      method: 'POST',
      requires: 'auth',
      body: {
        username: str({ minLength: 1, maxLength: 128 }),
        password: str({ minLength: 12, maxLength: 128 }),
        profileRef: str({ minLength: 1, maxLength: 36 }),
        subscriptionRef: str({ minLength: 1, maxLength: 36 }),
      },
      handler: async (ctx) => {
        const { body, params } = ctx
        await requireOperator(ctx, params.tenantId!, 'manage')
        const profiles = await repo(ctx, 'isp_radius_profiles').search({
          limit: 1,
          where: { id: body.profileRef, tenantRef: params.tenantId, status: 'enabled' },
        })
        if (!profiles.rows[0]) throw badRequest('RADIUS profile must be enabled and belong to this tenant')
        const password = stringOf(body.password)
        return repo(ctx, 'isp_radius_users').create({
          tenantRef: params.tenantId,
          username: body.username,
          credentialHash: await hashRadiusPassword(password),
          status: 'enabled',
        }).then(async (user) => {
          try {
            await repo(ctx, 'isp_access_bindings').create({
              tenantRef: params.tenantId,
              radiusUserRef: user.id,
              profileRef: body.profileRef,
              subscriptionRef: body.subscriptionRef,
              status: 'enabled',
            })
          } catch (err) {
            await repo(ctx, 'isp_radius_users').remove(String(user.id))
            throw err
          }
          return user
        })
      },
    },
    requestSessionAction: {
      path: '/isp/tenants/:tenantId/sessions/:sessionId/actions',
      method: 'POST',
      requires: 'auth',
      body: { actionKey: str({ minLength: 1, maxLength: 160 }), action: sel(['disconnect', 'coa']) },
      handler: async (ctx) => {
        const { body, params, user } = ctx
        await requireOperator(ctx, params.tenantId!, 'network')
        const sessions = await repo(ctx, 'isp_sessions').search({
          limit: 1,
          where: { id: params.sessionId, tenantRef: params.tenantId },
        })
        const session = sessions.rows[0]
        if (!session) throw notFound('ISP session not found')
        if (session.status === 'stopped') throw conflict('A stopped session cannot receive a network action')
        const actions = repo(ctx, 'isp_session_actions')
        const prior = await actions.search({ limit: 1, where: { tenantRef: params.tenantId, actionKey: body.actionKey } })
        if (prior.rows[0]) {
          if (prior.rows[0].sessionRef !== params.sessionId || prior.rows[0].action !== body.action) {
            throw conflict('Action idempotency key was already used for a different action')
          }
          return prior.rows[0]
        }
        return actions.create({
          tenantRef: params.tenantId,
          sessionRef: params.sessionId,
          actionKey: body.actionKey,
          action: body.action,
          state: 'pending',
          requestedBy: user?.id ?? '',
          attempts: 0,
          resultDetail: null,
        })
      },
    },
    resolveNas: {
      path: '/isp-radius/nas/resolve',
      method: 'POST',
      requires: ['isp-radius'],
      body: { nasId: str({ minLength: 1, maxLength: 128 }) },
      handler: async (ctx) => {
        const { body } = ctx
        const nas = await nasForService(ctx, stringOf(body.nasId), 'radius.resolve')
        if (!nas) return { resolved: false as const }
        // The protocol runtime needs the tenant decision and the location of the
        // mounted secret, never the secret itself.
        return {
          resolved: true as const,
          tenantRef: String(nas.tenantRef),
          nasRef: String(nas.id),
          nasId: String(nas.nasId),
          // The runtime aims dynamic authorisation at this address; the protocol
          // peer that sent the packet is not always the management address.
          nasAddress: String(nas.address),
          radsecEnabled: nas.radsecEnabled === true,
          secretRef: stringOf(nas.secretRef),
        }
      },
    },
    authorizeRadiusUser: {
      path: '/isp-radius/authorize',
      method: 'POST',
      requires: ['isp-radius'],
      body: {
        nasId: str({ minLength: 1, maxLength: 128 }),
        username: str({ minLength: 1, maxLength: 128 }),
        password: str({ minLength: 1, maxLength: 128 }),
      },
      handler: async (ctx) => {
        const { body } = ctx
        const nas = await nasForService(ctx, stringOf(body.nasId), 'radius.authorize')
        if (!nas) {
          await verifyRadiusPassword(stringOf(body.password), null)
          return { decision: 'reject' as const }
        }
        const users = await repo(ctx, 'isp_radius_users').search({
          limit: 1,
          where: { tenantRef: nas.tenantRef, username: body.username, status: 'enabled' },
          raw: true,
        })
        const user = users.rows[0]
        const bindings = user ? await repo(ctx, 'isp_access_bindings').search({
          limit: 1,
          where: { tenantRef: nas.tenantRef, radiusUserRef: user.id, status: 'enabled' },
        }) : { rows: [] as Row[] }
        const binding = bindings.rows[0]
        const profile = binding ? await repo(ctx, 'isp_radius_profiles').search({
          limit: 1,
          where: { id: binding.profileRef, tenantRef: nas.tenantRef, status: 'enabled' },
        }) : { rows: [] as Row[] }
        const passwordOk = await verifyRadiusPassword(stringOf(body.password), user ? stringOf(user.credentialHash) : null)
        if (!user || !binding || !profile.rows[0] || !passwordOk) return { decision: 'reject' as const }
        const allowed = profile.rows[0]
        return {
          decision: 'accept' as const,
          attributes: {
            sessionLimit: allowed.sessionLimit,
            uploadKbps: allowed.uploadKbps,
            downloadKbps: allowed.downloadKbps,
            addressPool: allowed.addressPool,
            ipv6PrefixPool: allowed.ipv6PrefixPool,
            delegatedIpv6PrefixPool: allowed.delegatedIpv6PrefixPool,
            vendorDomain: allowed.vendorDomain,
          },
        }
      },
    },
    storeRadiusAccounting: {
      path: '/isp-radius/accounting',
      method: 'POST',
      requires: ['isp-radius'],
      body: {
        nasId: str({ minLength: 1, maxLength: 128 }),
        username: str({ minLength: 1, maxLength: 128 }),
        sessionKey: str({ minLength: 1, maxLength: 160 }),
        eventKey: str({ minLength: 1, maxLength: 200 }),
        eventType: sel(['start', 'interim', 'stop']),
        eventAt: ts(),
        inputOctets: int(),
        outputOctets: int(),
        sessionSeconds: int(),
      },
      handler: async (ctx) => {
        const { body } = ctx
        const nas = await nasForService(ctx, stringOf(body.nasId), 'radius.accounting')
        if (!nas) throw notFound('Enabled NAS not found')
        const users = await repo(ctx, 'isp_radius_users').search({
          limit: 1,
          where: { tenantRef: nas.tenantRef, username: body.username },
        })
        if (!users.rows[0]) throw notFound('RADIUS user not found')
        const event = {
          tenantRef: String(nas.tenantRef),
          eventKey: stringOf(body.eventKey),
          sessionKey: stringOf(body.sessionKey),
          nasRef: String(nas.id),
          username: stringOf(body.username),
          eventType: body.eventType as 'start' | 'interim' | 'stop',
          eventAt: stringOf(body.eventAt),
          inputOctets: Number(body.inputOctets),
          outputOctets: Number(body.outputOctets),
          sessionSeconds: Number(body.sessionSeconds),
        }
        const events = repo(ctx, 'isp_accounting_events')
        // `eventAt` is deliberately not part of the identity check: the runtime stamps
        // it with its own receive clock, so a retransmitted packet carries a new value
        // for the same event. The first observation wins.
        const sameEvent = (old: Row): boolean =>
          old.tenantRef === event.tenantRef && old.sessionKey === event.sessionKey && old.nasRef === event.nasRef &&
          old.username === event.username && old.eventType === event.eventType &&
          old.inputOctets === event.inputOctets && old.outputOctets === event.outputOctets &&
          old.sessionSeconds === event.sessionSeconds
        const prior = await events.search({ limit: 1, where: { eventKey: event.eventKey } })
        if (prior.rows[0]) {
          if (!sameEvent(prior.rows[0])) throw conflict('Accounting idempotency key was already used for a different event')
        } else {
          try {
            await events.create(event)
          } catch (err) {
            const raced = await events.search({ limit: 1, where: { eventKey: event.eventKey } })
            const old = raced.rows[0]
            if (!old) throw err
            if (!sameEvent(old)) throw conflict('Accounting idempotency key was already used for a different event')
          }
        }
        await createAccountingSession(ctx, {
          ...event,
          radiusUserRef: String(users.rows[0]!.id),
        })
        return { acknowledged: true, eventKey: event.eventKey }
      },
    },
    listPendingSessionActions: {
      path: '/isp-radius/session-actions',
      method: 'GET',
      requires: ['isp-radius'],
      handler: async (ctx) => {
        const { query } = ctx
        const nas = await nasForService(ctx, stringOf(query.nasId), 'radius.session-action')
        if (!nas) return []
        const pending = await repo(ctx, 'isp_session_actions').search({ limit: 500, where: { tenantRef: nas.tenantRef } })
        const sessions = repo(ctx, 'isp_sessions')
        const users = repo(ctx, 'isp_radius_users')
        const rows: Record<string, unknown>[] = []
        for (const action of pending.rows) {
          const retryable = action.state === 'pending' || (action.state === 'timeout' && Number(action.attempts) < 3)
          if (!retryable) continue
          const found = await sessions.search({ limit: 1, where: { id: action.sessionRef, tenantRef: nas.tenantRef, nasRef: nas.id } })
          const session = found.rows[0]
          if (!session) continue
          // RFC 5176 identifies the session by Acct-Session-Id plus User-Name, so the
          // runtime needs both alongside the action it must deliver.
          const owner = await users.search({ limit: 1, where: { id: session.radiusUserRef, tenantRef: nas.tenantRef } })
          rows.push({ ...action, sessionKey: String(session.sessionKey), username: stringOf(owner.rows[0]?.username) })
        }
        return rows
      },
    },
    reportSessionActionResult: {
      path: '/isp-radius/session-actions',
      method: 'POST',
      requires: ['isp-radius'],
      body: {
        nasId: str({ minLength: 1, maxLength: 128 }),
        actionId: str({ minLength: 1, maxLength: 36 }),
        result: sel(['ack', 'nak', 'timeout']),
        detail: str({ maxLength: 200, null: true }),
      },
      handler: async (ctx) => {
        const { body } = ctx
        const nas = await nasForService(ctx, stringOf(body.nasId), 'radius.session-action')
        if (!nas) throw notFound('Enabled NAS not found')
        const actions = await repo(ctx, 'isp_session_actions').search({
          limit: 1,
          where: { id: stringOf(body.actionId), tenantRef: nas.tenantRef },
        })
        const action = actions.rows[0]
        if (!action) throw notFound('Pending session action not found')
        if (action.state === 'ack' || action.state === 'nak') {
          if (action.state === body.result) return action
          throw conflict('A completed network action cannot be changed')
        }
        if (Number(action.attempts) >= 3) throw conflict('Network action retry limit has been reached')
        const sessions = await repo(ctx, 'isp_sessions').search({
          limit: 1,
          where: { id: action.sessionRef, tenantRef: nas.tenantRef, nasRef: nas.id },
        })
        if (!sessions.rows[0]) throw forbidden('Action does not belong to the authorized NAS')
        return repo(ctx, 'isp_session_actions').update(String(action.id), {
          state: body.result,
          resultDetail: body.detail,
          attempts: Number(action.attempts ?? 0) + 1,
        })
      },
    },
  },
  cron: [
    {
      // Freshness is only meaningful while somebody actually looks, so the sweep
      // cadence and the per-target freshness window are separate numbers on
      // purpose: an operator who widens a window does not slow down the checks.
      name: 'monitor-sweep',
      every: '2m',
      run: async ({ orm, budgetMs }) => sweepMonitorTargets(orm, { budgetMs }),
    },
  ],
})

export default isp
