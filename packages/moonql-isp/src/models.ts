import { bool, defineModel, int, sel, str, text, ts } from '@moonwitness/moonql'

const ACCESS_STATES = ['enabled', 'disabled', 'suspended'] as const
const GRANT_CAPABILITIES = ['read', 'manage', 'network'] as const
export const SERVICE_CAPABILITIES = [
  'radius.resolve',
  'radius.authorize',
  'radius.accounting',
  'radius.session-action',
] as const

export const models = {
  isp_tenants: defineModel({
    label: 'ISP tenant',
    seedless: true,
    rest: false,
    fields: {
      slug: str({ maxLength: 64, minLength: 2 }),
      name: str({ maxLength: 160, minLength: 2 }),
      status: sel(['active', 'suspended', 'closed'], { default: 'active', index: true }),
    },
    unique: [['slug']],
  }),

  isp_operator_grants: defineModel({
    label: 'ISP operator grant',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      userRef: str({ maxLength: 36, index: true }),
      capability: sel(GRANT_CAPABILITIES, { index: true }),
      active: bool({ default: true, index: true }),
      expiresAt: ts({ null: true, index: true }),
    },
    unique: [['tenantRef', 'userRef', 'capability']],
  }),

  isp_service_grants: defineModel({
    label: 'ISP service grant',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      apiKeyRef: str({ maxLength: 36, index: true }),
      capability: sel(SERVICE_CAPABILITIES, { index: true }),
      active: bool({ default: true, index: true }),
      expiresAt: ts({ null: true, index: true }),
    },
    unique: [['tenantRef', 'apiKeyRef', 'capability']],
  }),

  isp_radius_profiles: defineModel({
    label: 'RADIUS profile',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      code: str({ maxLength: 64 }),
      name: str({ maxLength: 120 }),
      status: sel(ACCESS_STATES, { default: 'enabled', index: true }),
      uploadKbps: int({ default: 0 }),
      downloadKbps: int({ default: 0 }),
      sessionLimit: int({ default: 1 }),
      addressPool: str({ maxLength: 120, null: true }),
      ipv6PrefixPool: str({ maxLength: 120, null: true }),
      delegatedIpv6PrefixPool: str({ maxLength: 120, null: true }),
      vendorDomain: str({ maxLength: 120, null: true }),
    },
    unique: [['tenantRef', 'code']],
  }),

  isp_radius_users: defineModel({
    label: 'RADIUS user',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      username: str({ maxLength: 128, minLength: 1 }),
      credentialHash: str({ private: true, maxLength: 256 }),
      status: sel(ACCESS_STATES, { default: 'enabled', index: true }),
    },
    unique: [['tenantRef', 'username']],
  }),

  isp_access_bindings: defineModel({
    label: 'ISP access binding',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      radiusUserRef: str({ maxLength: 36, index: true }),
      profileRef: str({ maxLength: 36, index: true }),
      subscriptionRef: str({ maxLength: 36, index: true }),
      status: sel(ACCESS_STATES, { default: 'enabled', index: true }),
    },
    unique: [['radiusUserRef'], ['subscriptionRef']],
  }),

  isp_nas: defineModel({
    label: 'Network access server',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      nasId: str({ maxLength: 128 }),
      displayName: str({ maxLength: 120 }),
      address: str({ maxLength: 255 }),
      secretRef: str({ private: true, maxLength: 160 }),
      status: sel(ACCESS_STATES, { default: 'enabled', index: true }),
      radsecEnabled: bool({ default: false }),
    },
    unique: [['tenantRef', 'nasId']],
  }),

  isp_sessions: defineModel({
    label: 'ISP access session',
    seedless: true,
    rest: false,
    audit: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      sessionKey: str({ maxLength: 160 }),
      radiusUserRef: str({ maxLength: 36, index: true }),
      nasRef: str({ maxLength: 36, index: true }),
      status: sel(['started', 'active', 'stopped'], { index: true }),
      startedAt: ts(),
      lastEventAt: ts(),
      stoppedAt: ts({ null: true }),
      inputOctets: int({ default: 0 }),
      outputOctets: int({ default: 0 }),
    },
    unique: [['tenantRef', 'sessionKey']],
    indexes: [['tenantRef', 'status'], ['tenantRef', 'lastEventAt']],
  }),

  isp_accounting_events: defineModel({
    label: 'RADIUS accounting event',
    seedless: true,
    rest: false,
    audit: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      eventKey: str({ maxLength: 200 }),
      sessionKey: str({ maxLength: 160, index: true }),
      nasRef: str({ maxLength: 36, index: true }),
      username: str({ maxLength: 128, index: true }),
      eventType: sel(['start', 'interim', 'stop']),
      eventAt: ts(),
      inputOctets: int({ default: 0 }),
      outputOctets: int({ default: 0 }),
      sessionSeconds: int({ default: 0 }),
    },
    unique: [['eventKey']],
    indexes: [['tenantRef', 'eventAt']],
  }),

  isp_session_actions: defineModel({
    label: 'RADIUS session action',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      sessionRef: str({ maxLength: 36, index: true }),
      actionKey: str({ maxLength: 160 }),
      action: sel(['disconnect', 'coa']),
      state: sel(['pending', 'ack', 'nak', 'timeout'], { default: 'pending', index: true }),
      requestedBy: str({ maxLength: 36 }),
      resultDetail: str({ maxLength: 200, null: true }),
      attempts: int({ default: 0 }),
    },
    unique: [['tenantRef', 'actionKey']],
  }),

  isp_network_nodes: defineModel({
    label: 'ISP network node',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      code: str({ maxLength: 64 }),
      name: str({ maxLength: 120 }),
      role: sel(['nas', 'router', 'switch', 'olt', 'odp', 'other']),
      managementAddress: str({ maxLength: 255, null: true }),
      status: sel(['active', 'disabled'], { default: 'active', index: true }),
    },
    unique: [['tenantRef', 'code']],
  }),

  isp_ipam_pools: defineModel({
    label: 'ISP IPAM pool',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      name: str({ maxLength: 120 }),
      prefix: str({ maxLength: 64 }),
      family: sel(['ipv4', 'ipv6']),
      status: sel(['active', 'disabled'], { default: 'active', index: true }),
      notes: text({ null: true }),
    },
    unique: [['tenantRef', 'name']],
  }),

  isp_monitor_targets: defineModel({
    label: 'ISP monitoring target',
    seedless: true,
    rest: false,
    audit: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      nodeRef: str({ maxLength: 36, index: true }),
      probeKind: sel(['icmp', 'snmp-read', 'http-read']),
      targetRef: str({ maxLength: 255 }),
      enabled: bool({ default: true, index: true }),
      status: sel(['unknown', 'healthy', 'degraded', 'unreachable'], { default: 'unknown', index: true }),
      checkedAt: ts({ null: true }),
      freshnessSeconds: int({ default: 300 }),
    },
    unique: [['tenantRef', 'nodeRef', 'probeKind']],
  }),

  isp_incidents: defineModel({
    label: 'ISP network incident',
    seedless: true,
    rest: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      nodeRef: str({ maxLength: 36, null: true, index: true }),
      severity: sel(['critical', 'major', 'minor', 'info'], { index: true }),
      status: sel(['open', 'acknowledged', 'resolved'], { default: 'open', index: true }),
      summary: str({ maxLength: 240 }),
      openedAt: ts(),
      resolvedAt: ts({ null: true }),
      // The alert leg is durable because the process that sends it can restart:
      // an open incident the operator was never told about must come back as
      // pending, not as silently notified.
      notifyState: sel(['none', 'pending', 'sent', 'failed'], { default: 'pending', index: true }),
      notifyAttempts: int({ default: 0 }),
      notifiedAt: ts({ null: true }),
      notifyDetail: str({ maxLength: 200, null: true }),
    },
    indexes: [['tenantRef', 'status', 'openedAt']],
  }),

  isp_syslog_events: defineModel({
    label: 'ISP syslog event',
    seedless: true,
    rest: false,
    audit: false,
    fields: {
      tenantRef: str({ maxLength: 36, index: true }),
      nodeRef: str({ maxLength: 36, null: true, index: true }),
      facility: int(),
      severity: int(),
      receivedAt: ts({ index: true }),
      message: text({ private: true }),
    },
    indexes: [['tenantRef', 'receivedAt']],
  }),
}
