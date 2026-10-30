import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth, { hashPasswordAsync } from '@moonwitness/moonql-auth'
import apikeys from '@moonwitness/moonql-apikeys'
import ops from '@moonwitness/moonql-ops'
import isp, { hashRadiusPassword } from '@moonwitness/moonql-isp'
import envelope from '../src/plugins/envelope.js'
import { TEST_ADMIN_PASSWORD } from './helpers/auth.js'

const quiet = { info: () => {}, warn: () => {} }

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, apikeys, ops, isp],
    seedPolicy: 'off',
    aclPolicy: 'off',
    env: { NODE_ENV: 'test', MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
    log: quiet,
  })
  app.addHook('onClose', async () => moonql.close())
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/api/v1', instance: moonql })
  await app.ready()
  return { app, moonql }
}

const dataOf = <T,>(response: { json(): unknown }): T => (response.json() as { data: T }).data
type TestApp = Awaited<ReturnType<typeof makeApp>>['app']

function call(
  app: TestApp,
  method: 'get' | 'post',
  path: string,
  headers?: Record<string, string>,
  body?: Record<string, unknown>,
) {
  const chain = method === 'get' ? app.inject().get(path) : app.inject().post(path)
  const request = chain.headers(headers ?? {})
  return (body === undefined ? request : request.body(body)).end()
}

test('D20 grants isolate operator and RADIUS service access by tenant', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())

  const login = await call(app, 'post', '/api/v1/auth/login', undefined, { login: 'admin', password: TEST_ADMIN_PASSWORD })
  assert.equal(login.statusCode, 200)
  const operatorHeaders = { authorization: `Bearer ${dataOf<{ token: string }>(login).token}` }
  const admin = dataOf<{ user: { id: string } }>(login).user

  const tenantAResult = await call(app, 'post', '/api/v1/isp/tenants', operatorHeaders, { slug: 'synthetic-a', name: 'Synthetic ISP A' })
  const tenantBResult = await call(app, 'post', '/api/v1/isp/tenants', operatorHeaders, { slug: 'synthetic-b', name: 'Synthetic ISP B' })
  assert.equal(tenantAResult.statusCode, 200)
  assert.equal(tenantBResult.statusCode, 200)
  const tenantA = dataOf<{ id: string }>(tenantAResult)
  const tenantB = dataOf<{ id: string }>(tenantBResult)

  for (const capability of ['manage', 'network'] as const) {
    const grant = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/operator-grants`, operatorHeaders, {
      userRef: admin.id,
      capability,
      expiresAt: null,
    })
    assert.equal(grant.statusCode, 200)
  }
  const absentTenant = await call(app, 'get', `/api/v1/isp/tenants/${tenantB.id}/radius/profiles`, operatorHeaders)
  assert.equal(absentTenant.statusCode, 403, 'a grant for tenant A does not authorize tenant B')

  const profileResult = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/radius/profiles`, operatorHeaders, {
    code: 'basic',
    name: 'Basic synthetic profile',
    uploadKbps: 1024,
    downloadKbps: 4096,
    sessionLimit: 1,
    addressPool: 'test-pool-v4',
    ipv6PrefixPool: null,
    delegatedIpv6PrefixPool: null,
    vendorDomain: null,
  })
  assert.equal(profileResult.statusCode, 200)
  const profile = dataOf<{ id: string }>(profileResult)

  const nasResult = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/nas`, operatorHeaders, {
    nasId: 'synthetic-nas-a',
    displayName: 'Fake NAS A',
    address: '192.0.2.10',
    secretRef: 'mounted://synthetic/nas-a',
    radsecEnabled: false,
  })
  assert.equal(nasResult.statusCode, 200)
  assert.equal(JSON.stringify(nasResult.json()).includes('mounted://synthetic'), false, 'NAS secret references are not returned')
  const nas = dataOf<{ id: string }>(nasResult)

  const arbitraryTarget = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/network/targets`, operatorHeaders, {
    nodeRef: 'not-registered',
    probeKind: 'icmp',
    freshnessSeconds: 60,
  })
  assert.equal(arbitraryTarget.statusCode, 400, 'monitoring cannot register an unowned or unknown target')
  const nodeResult = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/network/nodes`, operatorHeaders, {
    code: 'synthetic-edge-1',
    name: 'Synthetic edge node',
    role: 'router',
    managementAddress: '192.0.2.12',
  })
  const node = dataOf<{ id: string }>(nodeResult)
  const targetResult = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/network/targets`, operatorHeaders, {
    nodeRef: node.id,
    probeKind: 'icmp',
    freshnessSeconds: 60,
  })
  assert.equal(targetResult.statusCode, 200)
  assert.equal(dataOf<{ targetRef: string }>(targetResult).targetRef, '192.0.2.12')
  const health = await call(app, 'get', `/api/v1/isp/tenants/${tenantA.id}/network/health`, operatorHeaders)
  assert.equal(dataOf<Array<{ status: string; freshness: string }>>(health)[0]?.status, 'unknown')
  assert.equal(dataOf<Array<{ status: string; freshness: string }>>(health)[0]?.freshness, 'never-checked')

  const radiusUserResult = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/radius/users`, operatorHeaders, {
    username: 'synthetic-user',
    password: 'not-a-real-subscriber-password',
    profileRef: profile.id,
    subscriptionRef: 'synthetic-d15-subscription-a',
  })
  assert.equal(radiusUserResult.statusCode, 200)
  assert.equal(JSON.stringify(radiusUserResult.json()).includes('credentialHash'), false)

  const keyResult = await call(app, 'post', '/api/v1/api-keys', operatorHeaders, { name: 'synthetic RADIUS service', roles: 'isp-radius' })
  assert.equal(keyResult.statusCode, 201)
  const key = dataOf<{ id: string; key: string }>(keyResult)
  const serviceHeaders = { 'x-api-key': key.key }
  for (const capability of ['radius.resolve', 'radius.authorize', 'radius.accounting', 'radius.session-action']) {
    const grant = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/service-grants`, operatorHeaders, {
      apiKeyRef: key.id,
      capability,
      expiresAt: null,
    })
    assert.equal(grant.statusCode, 200)
  }

  const resolved = await call(app, 'post', '/api/v1/isp-radius/nas/resolve', serviceHeaders, { nasId: 'synthetic-nas-a' })
  assert.equal(resolved.statusCode, 200)
  assert.deepEqual(dataOf<{ resolved: boolean; tenantRef: string; nasId: string; secretRef: string }>(resolved), {
    resolved: true,
    tenantRef: tenantA.id,
    nasRef: nas.id,
    nasId: 'synthetic-nas-a',
    radsecEnabled: false,
    secretRef: 'mounted://synthetic/nas-a',
  })

  const accepted = await call(app, 'post', '/api/v1/isp-radius/authorize', serviceHeaders, {
    nasId: 'synthetic-nas-a',
    username: 'synthetic-user',
    password: 'not-a-real-subscriber-password',
  })
  assert.equal(accepted.statusCode, 200)
  assert.equal(dataOf<{ decision: string }>(accepted).decision, 'accept')
  const rejected = await call(app, 'post', '/api/v1/isp-radius/authorize', serviceHeaders, {
    nasId: 'synthetic-nas-a',
    username: 'synthetic-user',
    password: 'incorrect-password',
  })
  assert.equal(dataOf<{ decision: string }>(rejected).decision, 'reject')

  const nasB = await moonql.model('isp_nas').create({
    tenantRef: tenantB.id,
    nasId: 'synthetic-nas-b',
    displayName: 'Fake NAS B',
    address: '192.0.2.11',
    secretRef: 'mounted://synthetic/nas-b',
    status: 'enabled',
    radsecEnabled: false,
  })
  assert.ok(nasB.id)
  const crossTenant = await call(app, 'post', '/api/v1/isp-radius/authorize', serviceHeaders, {
    nasId: 'synthetic-nas-b',
    username: 'synthetic-user',
    password: 'not-a-real-subscriber-password',
  })
  assert.equal(dataOf<{ decision: string }>(crossTenant).decision, 'reject', 'a service key sees no NAS outside its D20 grant')
  const crossResolve = await call(app, 'post', '/api/v1/isp-radius/nas/resolve', serviceHeaders, { nasId: 'synthetic-nas-b' })
  assert.equal(dataOf<{ resolved: boolean }>(crossResolve).resolved, false, 'resolve fails closed for a NAS outside the service grant')

  const startedAt = '2026-10-30T03:00:00.000Z'
  const accounting = (eventKey: string, eventType: 'start' | 'interim' | 'stop', eventAt: string, inputOctets: number) => call(
    app,
    'post',
    '/api/v1/isp-radius/accounting',
    serviceHeaders,
    {
      nasId: 'synthetic-nas-a',
      username: 'synthetic-user',
      sessionKey: 'synthetic-session-a',
      eventKey,
      eventType,
      eventAt,
      inputOctets,
      outputOctets: inputOctets * 2,
      sessionSeconds: 10,
    },
  )
  assert.equal((await accounting('event-start', 'start', startedAt, 10)).statusCode, 200)
  assert.equal((await accounting('event-start', 'start', startedAt, 10)).statusCode, 200, 'same accounting event is safely idempotent')
  assert.equal((await accounting('event-interim', 'interim', '2026-10-30T03:01:00.000Z', 20)).statusCode, 200)
  const sessionsBeforeStop = await moonql.model('isp_sessions').search({ where: { tenantRef: tenantA.id, sessionKey: 'synthetic-session-a' } })
  const action = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/sessions/${sessionsBeforeStop.rows[0]!.id}/actions`, operatorHeaders, {
    actionKey: 'disconnect-synthetic-1',
    action: 'disconnect',
  })
  assert.equal(action.statusCode, 200)
  assert.equal(dataOf<{ state: string }>(action).state, 'pending')
  const pendingActions = await call(app, 'get', '/api/v1/isp-radius/session-actions?nasId=synthetic-nas-a', serviceHeaders)
  assert.equal(pendingActions.statusCode, 200)
  assert.equal(dataOf<Array<{ id: string }>>(pendingActions).length, 1, 'the network runtime only sees the persisted pending action')
  const actionId = dataOf<{ id: string }>(action).id
  const timeoutResult = await call(app, 'post', '/api/v1/isp-radius/session-actions', serviceHeaders, {
    nasId: 'synthetic-nas-a',
    actionId,
    result: 'timeout',
    detail: 'synthetic timeout',
  })
  assert.equal(timeoutResult.statusCode, 200)
  assert.equal(dataOf<{ state: string }>(timeoutResult).state, 'timeout')
  const retryActions = dataOf<Array<{ id: string }>>(await call(app, 'get', '/api/v1/isp-radius/session-actions?nasId=synthetic-nas-a', serviceHeaders))
  assert.equal(retryActions.length, 1, 'a timed-out action is requeued for bounded retry')
  const actionResult = await call(app, 'post', '/api/v1/isp-radius/session-actions', serviceHeaders, {
    nasId: 'synthetic-nas-a',
    actionId,
    result: 'ack',
    detail: 'synthetic ACK',
  })
  assert.equal(actionResult.statusCode, 200)
  assert.equal(dataOf<{ state: string; attempts: number }>(actionResult).state, 'ack')
  assert.equal(dataOf<{ state: string; attempts: number }>(actionResult).attempts, 2)
  assert.equal((await accounting('event-stop', 'stop', '2026-10-30T03:02:00.000Z', 30)).statusCode, 200)
  const conflictingReplay = await accounting('event-stop', 'stop', '2026-10-30T03:02:00.000Z', 31)
  assert.equal(conflictingReplay.statusCode, 409, 'same key with changed payload is rejected')
  const sessions = await moonql.model('isp_sessions').search({ where: { tenantRef: tenantA.id, sessionKey: 'synthetic-session-a' } })
  assert.equal(sessions.rows.length, 1)
  assert.equal(sessions.rows[0]?.status, 'stopped', 'later duplicate/interim events do not reopen a stopped session')

  const stoppedAction = await call(app, 'post', `/api/v1/isp/tenants/${tenantA.id}/sessions/${sessions.rows[0]!.id}/actions`, operatorHeaders, {
    actionKey: 'disconnect-synthetic-1',
    action: 'disconnect',
  })
  assert.equal(stoppedAction.statusCode, 409, 'stopped sessions cannot be sent network actions')
})

test('expired and absent operator grants deny tenant reads', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())
  const login = await call(app, 'post', '/api/v1/auth/login', undefined, { login: 'admin', password: TEST_ADMIN_PASSWORD })
  const adminHeaders = { authorization: `Bearer ${dataOf<{ token: string }>(login).token}` }
  const tenantResult = await call(app, 'post', '/api/v1/isp/tenants', adminHeaders, { slug: 'synthetic-expiry', name: 'Synthetic Expiry ISP' })
  const tenant = dataOf<{ id: string }>(tenantResult)
  const user = await moonql.model('auth_users').create({
    login: 'synthetic-expired-operator',
    displayName: 'Synthetic Expired Operator',
    email: null,
    passwordHash: await hashPasswordAsync('synthetic-expired-password'),
    role: 'user',
  })
  await moonql.model('isp_operator_grants').create({
    tenantRef: tenant.id,
    userRef: user.id,
    capability: 'read',
    active: true,
    expiresAt: '2020-01-01T00:00:00.000Z',
  })
  const guestLogin = await call(app, 'post', '/api/v1/auth/login', undefined, {
    login: 'synthetic-expired-operator',
    password: 'synthetic-expired-password',
  })
  assert.equal(guestLogin.statusCode, 200)
  const expiredHeaders = { authorization: `Bearer ${dataOf<{ token: string }>(guestLogin).token}` }
  const expired = await call(app, 'get', `/api/v1/isp/tenants/${tenant.id}/radius/profiles`, expiredHeaders)
  assert.equal(expired.statusCode, 403, 'an expired tenant grant cannot authorize reads')
  const absent = await call(app, 'get', `/api/v1/isp/tenants/${tenant.id}/radius/profiles`, adminHeaders)
  assert.equal(absent.statusCode, 403, 'a D00 admin without an explicit tenant grant cannot read the tenant')
})

test('D20 records stay off generic REST and hide private fields from ordinary reads', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())
  const login = await call(app, 'post', '/api/v1/auth/login', undefined, { login: 'admin', password: TEST_ADMIN_PASSWORD })
  const adminHeaders = { authorization: `Bearer ${dataOf<{ token: string }>(login).token}` }
  const tenant = dataOf<{ id: string }>(await call(app, 'post', '/api/v1/isp/tenants', adminHeaders, {
    slug: 'synthetic-private',
    name: 'Synthetic Private ISP',
  }))

  await moonql.model('isp_nas').create({
    tenantRef: tenant.id,
    nasId: 'synthetic-private-nas',
    displayName: 'Synthetic private NAS',
    address: '192.0.2.20',
    secretRef: 'mounted://synthetic/private-secret',
    status: 'enabled',
    radsecEnabled: false,
  })
  await moonql.model('isp_radius_users').create({
    tenantRef: tenant.id,
    username: 'synthetic-private-user',
    credentialHash: await hashRadiusPassword('synthetic-private-credential'),
    status: 'enabled',
  })
  await moonql.model('isp_syslog_events').create({
    tenantRef: tenant.id,
    nodeRef: null,
    facility: 16,
    severity: 6,
    receivedAt: '2026-10-30T03:00:00.000Z',
    message: 'synthetic raw syslog line with subscriber material',
  })

  for (const path of ['/api/v1/isp_nas', '/api/v1/isp_radius_users', '/api/v1/isp_syslog_events', '/api/v1/isp_tenants']) {
    const generic = await call(app, 'get', path, adminHeaders)
    assert.equal(generic.statusCode, 404, `${path} is not served by the generic auto-REST layer`)
  }

  const nasRows = (await moonql.model('isp_nas').search({ where: { tenantRef: tenant.id } })).rows
  assert.equal(nasRows[0]?.secretRef, undefined, 'an ordinary NAS read omits the secret reference')
  const rawNas = (await moonql.model('isp_nas').search({ where: { tenantRef: tenant.id }, raw: true })).rows
  assert.equal(rawNas[0]?.secretRef, 'mounted://synthetic/private-secret', 'the field exists and is filtered, not absent')

  const userRows = (await moonql.model('isp_radius_users').search({ where: { tenantRef: tenant.id } })).rows
  assert.equal(userRows[0]?.credentialHash, undefined, 'a credential hash never leaves an ordinary read')
  const syslogRows = (await moonql.model('isp_syslog_events').search({ where: { tenantRef: tenant.id } })).rows
  assert.equal(syslogRows[0]?.message, undefined, 'raw syslog text stays private')
})

test('RADIUS service routes reject a browser session and fail closed without the scoped grant', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())
  const login = await call(app, 'post', '/api/v1/auth/login', undefined, { login: 'admin', password: TEST_ADMIN_PASSWORD })
  const operatorHeaders = { authorization: `Bearer ${dataOf<{ token: string }>(login).token}` }
  const admin = dataOf<{ user: { id: string } }>(login).user
  const tenant = dataOf<{ id: string }>(await call(app, 'post', '/api/v1/isp/tenants', operatorHeaders, {
    slug: 'synthetic-scope',
    name: 'Synthetic Scope ISP',
  }))

  const browserOnly = await call(app, 'post', '/api/v1/isp-radius/authorize', operatorHeaders, {
    nasId: 'synthetic-scope-nas',
    username: 'synthetic-user',
    password: 'anything',
  })
  assert.ok([401, 403].includes(browserOnly.statusCode), 'a browser session is not a service credential')

  await call(app, 'post', `/api/v1/isp/tenants/${tenant.id}/operator-grants`, operatorHeaders, {
    userRef: admin.id,
    capability: 'manage',
    expiresAt: null,
  })
  await moonql.model('isp_nas').create({
    tenantRef: tenant.id,
    nasId: 'synthetic-scope-nas',
    displayName: 'Synthetic scope NAS',
    address: '192.0.2.21',
    secretRef: 'mounted://synthetic/scope-secret',
    status: 'enabled',
    radsecEnabled: false,
  })
  const key = dataOf<{ id: string; key: string }>(await call(app, 'post', '/api/v1/api-keys', operatorHeaders, {
    name: 'synthetic accounting-only service',
    roles: 'isp-radius',
  }))
  const scoped = { 'x-api-key': key.key }
  await call(app, 'post', `/api/v1/isp/tenants/${tenant.id}/service-grants`, operatorHeaders, {
    apiKeyRef: key.id,
    capability: 'radius.accounting',
    expiresAt: null,
  })

  const ungrantedKey = dataOf<{ key: string }>(await call(app, 'post', '/api/v1/api-keys', operatorHeaders, {
    name: 'synthetic ungranted service',
    roles: 'isp-radius',
  }))
  const noGrants = { 'x-api-key': ungrantedKey.key }
  const unauthorized = await call(app, 'post', '/api/v1/isp-radius/authorize', noGrants, {
    nasId: 'synthetic-scope-nas',
    username: 'synthetic-user',
    password: 'anything',
  })
  assert.equal(dataOf<{ decision: string }>(unauthorized).decision, 'reject', 'an isp-radius key without a tenant service grant authorizes nothing')
  const unauthorizedAccounting = await call(app, 'post', '/api/v1/isp-radius/accounting', noGrants, {
    nasId: 'synthetic-scope-nas',
    username: 'synthetic-user',
    sessionKey: 'synthetic-scope-session',
    eventKey: 'synthetic-scope-event',
    eventType: 'start',
    eventAt: '2026-10-30T03:00:00.000Z',
    inputOctets: 1,
    outputOctets: 2,
    sessionSeconds: 1,
  })
  assert.notEqual(unauthorizedAccounting.statusCode, 200, 'an ungranted key gets no accounting acknowledgement')

  const resolveWithoutScope = await call(app, 'post', '/api/v1/isp-radius/nas/resolve', scoped, { nasId: 'synthetic-scope-nas' })
  assert.equal(dataOf<{ resolved: boolean }>(resolveWithoutScope).resolved, false, 'accounting scope does not imply resolve scope')
  const authorizeWithoutScope = await call(app, 'post', '/api/v1/isp-radius/authorize', scoped, {
    nasId: 'synthetic-scope-nas',
    username: 'synthetic-user',
    password: 'anything',
  })
  assert.equal(dataOf<{ decision: string }>(authorizeWithoutScope).decision, 'reject', 'accounting scope does not imply authorize scope')
  const actionWithoutScope = await call(app, 'post', '/api/v1/isp-radius/session-actions', scoped, {
    nasId: 'synthetic-scope-nas',
    actionId: 'synthetic-action',
    result: 'ack',
    detail: null,
  })
  assert.equal(actionWithoutScope.statusCode, 404, 'accounting scope does not imply session-action scope')
})

test('D20 audits operator records and keeps machine telemetry out of the ops trail', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())

  const tenant = await moonql.model('isp_tenants').create({ slug: 'synthetic-audit', name: 'Synthetic Audit ISP', status: 'active' })
  const tenantRef = String(tenant.id)
  await moonql.model('isp_radius_profiles').create({
    tenantRef,
    code: 'audited',
    name: 'Audited synthetic profile',
    status: 'enabled',
    uploadKbps: 512,
    downloadKbps: 1024,
    sessionLimit: 2,
  })
  await moonql.model('isp_accounting_events').create({
    tenantRef,
    eventKey: 'synthetic-audit-event-1',
    sessionKey: 'synthetic-audit-session',
    nasRef: 'synthetic-nas-ref',
    username: 'synthetic-user',
    eventType: 'interim',
    eventAt: '2026-10-30T03:00:00.000Z',
    inputOctets: 120,
    outputOctets: 240,
    sessionSeconds: 30,
  })
  await moonql.model('isp_syslog_events').create({
    tenantRef,
    facility: 1,
    severity: 5,
    receivedAt: '2026-10-30T03:00:00.000Z',
    message: 'synthetic telemetry line',
  })

  const auditModels = async () => (await moonql.model('ops_audit').search({ limit: 500 })).rows.map((row) => String(row.model))
  let seen: string[] = []
  for (let attempt = 0; attempt < 40; attempt += 1) {
    seen = await auditModels()
    if (seen.includes('isp_radius_profiles')) break
    await new Promise((resolve) => setTimeout(resolve, 25))
  }

  assert.ok(seen.includes('isp_tenants'), 'an operator tenant write reaches the ops audit trail')
  assert.ok(seen.includes('isp_radius_profiles'), 'an operator RADIUS profile write reaches the ops audit trail')
  assert.equal(seen.includes('isp_accounting_events'), false, 'accounting telemetry writes its own event row instead of an audit row')
  assert.equal(seen.includes('isp_syslog_events'), false, 'syslog telemetry stays out of the human audit trail')
})
