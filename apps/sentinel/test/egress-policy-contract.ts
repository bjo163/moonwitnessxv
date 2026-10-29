/** Test-only policy model; production request paths do not import this module. */
export type EgressCapability = 'INTERNAL_SERVICE' | 'READ_ONLY_PROVIDER' | 'ALERT_SINK'

export interface OutboundIntent {
  capability: EgressCapability | string
  egressEnabled: boolean
  capabilityEnabled: boolean
  rights: 'CLEARED' | 'UNKNOWN' | 'EXPIRED'
  method: string
  url: string
  allowedOrigins: string[]
  allowedPaths: string[]
  resolvedAddresses: string[]
  redirects?: string[]
  budgetAvailable: boolean
  retryAttempt?: number
  alertAlreadySent?: boolean
  contentApproved?: boolean
  alertAction?: 'NOTIFICATION' | 'PUNITIVE'
  fallbackProvider?: boolean
}

export interface PolicyDecision {
  allowed: boolean
  reason: string
}

function isPrivateOrReservedAddress(address: string): boolean {
  const value = address.toLowerCase().replace(/^\[|\]$/g, '')
  if (value === '::' || value === '::1' || value.startsWith('fe80:') || value.startsWith('fc') || value.startsWith('fd')) return true
  const octets = value.split('.').map(Number)
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true
  const [first = 0, second = 0] = octets
  return first === 0 || first === 10 || first === 127 || first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && (second === 0 || second === 168)) ||
    (first === 198 && (second === 18 || second === 19))
}

/** Pure design model; it must never be treated as a production SSRF guard. */
export function decideOutboundIntent(intent: OutboundIntent): PolicyDecision {
  if (!intent.egressEnabled) return { allowed: false, reason: 'EGRESS_DISABLED' }
  if (!['INTERNAL_SERVICE', 'READ_ONLY_PROVIDER', 'ALERT_SINK'].includes(intent.capability)) {
    return { allowed: false, reason: 'UNKNOWN_CAPABILITY' }
  }
  if (!intent.capabilityEnabled) return { allowed: false, reason: 'CAPABILITY_DISABLED' }
  if (intent.fallbackProvider) return { allowed: false, reason: 'FALLBACK_FORBIDDEN' }
  const retryAttempt = intent.retryAttempt ?? 0
  if (!Number.isInteger(retryAttempt) || retryAttempt < 0 || retryAttempt > 2) {
    return { allowed: false, reason: 'RETRY_LIMIT_EXCEEDED' }
  }
  if (intent.capability !== 'INTERNAL_SERVICE' && intent.rights !== 'CLEARED') {
    return { allowed: false, reason: 'RIGHTS_NOT_CLEARED' }
  }
  if (!intent.budgetAvailable) return { allowed: false, reason: 'BUDGET_EXHAUSTED' }
  if ((intent.redirects?.length ?? 0) > 0) return { allowed: false, reason: 'REDIRECT_DENIED' }
  if (!Array.isArray(intent.resolvedAddresses) || intent.resolvedAddresses.length === 0) {
    return { allowed: false, reason: 'DNS_UNRESOLVED' }
  }

  let target: URL
  try {
    target = new URL(intent.url)
  } catch {
    return { allowed: false, reason: 'INVALID_URL' }
  }
  if (target.username || target.password || target.hash) return { allowed: false, reason: 'URL_CREDENTIALS_OR_FRAGMENT' }
  if (intent.capability !== 'INTERNAL_SERVICE' && target.protocol !== 'https:') {
    return { allowed: false, reason: 'HTTPS_REQUIRED' }
  }
  if (!intent.allowedOrigins.includes(target.origin)) return { allowed: false, reason: 'ORIGIN_NOT_ALLOWED' }
  if (!intent.allowedPaths.includes(target.pathname)) return { allowed: false, reason: 'PATH_NOT_ALLOWED' }
  if (intent.capability === 'READ_ONLY_PROVIDER' && !['GET', 'HEAD'].includes(intent.method.toUpperCase())) {
    return { allowed: false, reason: 'PROVIDER_METHOD_NOT_READ_ONLY' }
  }
  if (intent.capability === 'ALERT_SINK' && intent.method.toUpperCase() !== 'POST') {
    return { allowed: false, reason: 'ALERT_METHOD_INVALID' }
  }
  if (intent.capability === 'ALERT_SINK' && intent.alertAction !== 'NOTIFICATION') {
    return { allowed: false, reason: 'PUNITIVE_ALERT_FORBIDDEN' }
  }
  if (intent.capability === 'ALERT_SINK' && intent.contentApproved !== true) {
    return { allowed: false, reason: 'ALERT_CONTENT_NOT_APPROVED' }
  }
  if (intent.capability === 'ALERT_SINK' && intent.alertAlreadySent) {
    return { allowed: false, reason: 'ALERT_DUPLICATE' }
  }
  if (intent.capability === 'ALERT_SINK' && retryAttempt > 0) {
    return { allowed: false, reason: 'ALERT_RETRY_FORBIDDEN' }
  }
  if (intent.capability !== 'INTERNAL_SERVICE' && intent.resolvedAddresses.some(isPrivateOrReservedAddress)) {
    return { allowed: false, reason: 'NON_PUBLIC_ADDRESS' }
  }
  if (retryAttempt > 0 && intent.capability !== 'ALERT_SINK' &&
      !['GET', 'HEAD'].includes(intent.method.toUpperCase())) {
    return { allowed: false, reason: 'NON_IDEMPOTENT_RETRY_FORBIDDEN' }
  }
  return { allowed: true, reason: 'PERMITTED_BY_DESIGN' }
}
