/**
 * M24-04 prototype: one feature-flagged, read-only provider adapter.
 *
 * This module is deliberately NOT wired into `src/index.ts`. It is a guard
 * prototype for a single synthetic provider: one GET, no credentials, no
 * retry, no redirect following, no fallback provider, no cache.
 *
 * The M24-03 decision model lives in `test/egress-policy-contract.ts`.
 * `apps/sentinel/tsconfig.json` sets `rootDir: "./src"` and includes only
 * `src`, so a `src/` module cannot import `test/` code (TS6059/TS6307,
 * recorded in the M24-04 audit). Copying the model is forbidden, so the
 * decision function is injected through `deps.decideIntent` instead:
 * production code never imports test code, and a caller that omits the
 * decision function fails closed before any network operation.
 *
 * A failed call returns only `{ ok: false, reason }`: never the URL, request
 * headers, response body or provider payload. A successful call returns the
 * payload's own `observedAt`; the wall clock is never substituted.
 */

export type ProviderRights = 'CLEARED' | 'UNKNOWN' | 'EXPIRED'

/** Codes the M24-03 decision model can return for a provider intent. */
const POLICY_REASONS = [
  'EGRESS_DISABLED',
  'UNKNOWN_CAPABILITY',
  'CAPABILITY_DISABLED',
  'FALLBACK_FORBIDDEN',
  'RETRY_LIMIT_EXCEEDED',
  'RIGHTS_NOT_CLEARED',
  'BUDGET_EXHAUSTED',
  'REDIRECT_DENIED',
  'DNS_UNRESOLVED',
  'INVALID_URL',
  'URL_CREDENTIALS_OR_FRAGMENT',
  'HTTPS_REQUIRED',
  'ORIGIN_NOT_ALLOWED',
  'PATH_NOT_ALLOWED',
  'PROVIDER_METHOD_NOT_READ_ONLY',
  'ALERT_METHOD_INVALID',
  'PUNITIVE_ALERT_FORBIDDEN',
  'ALERT_CONTENT_NOT_APPROVED',
  'ALERT_DUPLICATE',
  'ALERT_RETRY_FORBIDDEN',
  'NON_PUBLIC_ADDRESS',
  'NON_IDEMPOTENT_RETRY_FORBIDDEN',
] as const

export type ProviderPolicyReason = (typeof POLICY_REASONS)[number]

const POLICY_REASON_SET: ReadonlySet<string> = new Set(POLICY_REASONS)

export type ProviderAdapterReason =
  | ProviderPolicyReason
  | 'FEATURE_FLAG_DISABLED'
  | 'TERMS_NOT_APPROVED'
  | 'RIGHTS_UNKNOWN'
  | 'RIGHTS_EXPIRED'
  | 'PROVIDER_NOT_CONFIGURED'
  | 'FALLBACK_PROVIDER_FORBIDDEN'
  | 'DECISION_MODEL_MISSING'
  | 'REQUEST_BUDGET_INVALID'
  | 'DNS_RESOLUTION_FAILED'
  | 'REQUEST_TIMEOUT'
  | 'TRANSPORT_FAILED'
  | 'HTTP_STATUS_REJECTED'
  | 'RESPONSE_TOO_LARGE'
  | 'RESPONSE_NOT_JSON'
  | 'PAYLOAD_CONTRACT_INVALID'
  | 'POLICY_DENIED'

export interface ProviderRequestBudget {
  readonly maxRequests: number
  readonly requestsUsed: number
}

/**
 * Caller-supplied configuration. The feature flag defaults to disabled: only
 * a literal `true` enables the adapter. `egressEnabled` and `capabilityEnabled`
 * are separate gates because M24-03 requires more than one switch.
 */
export interface ProviderAdapterConfig {
  readonly enabled: boolean
  readonly egressEnabled: boolean
  readonly capabilityEnabled: boolean
  readonly providerId: string
  readonly allowedOrigins: string[]
  readonly allowedPaths: string[]
  readonly rights: ProviderRights
  readonly termsApproved: boolean
  readonly requestTimeoutMs: number
  readonly maxResponseBytes: number
  readonly budget: ProviderRequestBudget
}

export interface ProviderObservationInput {
  /** Must equal `config.providerId`; a different provider is a fallback attempt. */
  readonly providerId: string
  readonly url: string
}

/**
 * Structural subset of the M24-03 `OutboundIntent` consumed by the injected
 * decision function. Keeping the shape here avoids importing test code.
 */
export interface ProviderOutboundIntent {
  capability: 'READ_ONLY_PROVIDER'
  egressEnabled: boolean
  capabilityEnabled: boolean
  rights: ProviderRights
  method: 'GET'
  url: string
  allowedOrigins: string[]
  allowedPaths: string[]
  resolvedAddresses: string[]
  redirects: string[]
  budgetAvailable: boolean
  fallbackProvider: false
}

export interface ProviderPolicyDecision {
  allowed: boolean
  reason: string
}

export type ProviderPolicyDecider = (intent: ProviderOutboundIntent) => ProviderPolicyDecision

export interface ProviderAdapterDeps {
  readonly fetchImpl: typeof fetch
  readonly resolveHost: (hostname: string) => Promise<string[]>
  /** The M24-03 decision model, injected so `src/` never imports `test/`. */
  readonly decideIntent: ProviderPolicyDecider
}

export interface ProviderObservationSource {
  id: string
  name: string
}

export interface ProviderObservation {
  providerId: string
  source: ProviderObservationSource
  metadata: Record<string, unknown>
  /** Copied verbatim from the payload; never derived from the wall clock. */
  observedAt: string
  data: unknown
}

export type ProviderAdapterFailure = { ok: false; reason: ProviderAdapterReason }
export type ProviderAdapterResult = { ok: true; observation: ProviderObservation } | ProviderAdapterFailure

/**
 * Public documentation address (TEST-NET-3) used only to satisfy the decision
 * model's non-empty address slot before DNS resolution. The real address
 * decision is the second call, made with the resolved addresses.
 */
const PRE_DNS_PLACEHOLDER_ADDRESS = '203.0.113.10'

const MAX_REQUEST_TIMEOUT_MS = 60_000
const MAX_RESPONSE_BYTES = 5_000_000
const RFC3339_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

function deny(reason: ProviderAdapterReason): ProviderAdapterFailure {
  return { ok: false, reason }
}

function toPolicyReason(reason: string): ProviderAdapterReason {
  return POLICY_REASON_SET.has(reason) ? (reason as ProviderPolicyReason) : 'POLICY_DENIED'
}

function budgetAvailable(budget: ProviderRequestBudget | undefined): boolean {
  if (!budget) return false
  const { maxRequests, requestsUsed } = budget
  return Number.isInteger(maxRequests) && Number.isInteger(requestsUsed) &&
    maxRequests > 0 && requestsUsed >= 0 && requestsUsed < maxRequests
}

function requestBudgetValid(requestTimeoutMs: number, maxResponseBytes: number): boolean {
  return Number.isFinite(requestTimeoutMs) && requestTimeoutMs > 0 && requestTimeoutMs <= MAX_REQUEST_TIMEOUT_MS &&
    Number.isInteger(maxResponseBytes) && maxResponseBytes > 0 && maxResponseBytes <= MAX_RESPONSE_BYTES
}

function buildIntent(
  input: ProviderObservationInput,
  config: ProviderAdapterConfig,
  resolvedAddresses: string[],
): ProviderOutboundIntent {
  return {
    capability: 'READ_ONLY_PROVIDER',
    egressEnabled: config.egressEnabled === true,
    capabilityEnabled: config.capabilityEnabled === true,
    rights: config.rights,
    method: 'GET',
    url: input.url,
    allowedOrigins: Array.isArray(config.allowedOrigins) ? config.allowedOrigins : [],
    allowedPaths: Array.isArray(config.allowedPaths) ? config.allowedPaths : [],
    resolvedAddresses,
    redirects: [],
    budgetAvailable: budgetAvailable(config.budget),
    fallbackProvider: false,
  }
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
}

/** Reads at most `maxBytes`; returns `null` as soon as the body exceeds it. */
async function readBoundedBody(response: Response, maxBytes: number): Promise<Uint8Array | null> {
  const body = response.body
  if (!body) return new Uint8Array(0)
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value || value.byteLength === 0) continue
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined)
        return null
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

/** Structural payload validation; returns `null` instead of inventing fields. */
function readObservation(providerId: string, parsed: unknown): ProviderObservation | null {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
  const record = parsed as Record<string, unknown>

  const rawSource = record.source
  if (typeof rawSource !== 'object' || rawSource === null || Array.isArray(rawSource)) return null
  const source = rawSource as Record<string, unknown>
  const id = source.id
  const name = source.name
  if (typeof id !== 'string' || id.trim().length === 0) return null
  if (typeof name !== 'string' || name.trim().length === 0) return null

  const observedAt = record.observedAt
  if (typeof observedAt !== 'string' || !RFC3339_WITH_ZONE.test(observedAt) || !Number.isFinite(Date.parse(observedAt))) {
    return null
  }

  const rawMetadata = record.metadata
  if (rawMetadata !== undefined && (typeof rawMetadata !== 'object' || rawMetadata === null || Array.isArray(rawMetadata))) {
    return null
  }

  return {
    providerId,
    source: { id, name },
    metadata: rawMetadata === undefined ? {} : (rawMetadata as Record<string, unknown>),
    observedAt,
    data: record.data ?? null,
  }
}

/**
 * Decision order: flag -> terms -> rights -> provider -> capability/egress
 * (via the injected model) -> URL allowlist (pre-DNS) -> DNS/address ->
 * timeout/size budget -> one GET -> bounded JSON parse.
 *
 * Every denial returns before `fetchImpl` is called. `requestsUsed` is not
 * mutated here; the caller owns the counter and increments it after a call.
 */
export async function fetchObservation(
  input: ProviderObservationInput,
  config: ProviderAdapterConfig,
  deps: ProviderAdapterDeps,
): Promise<ProviderAdapterResult> {
  if (typeof deps?.decideIntent !== 'function') return deny('DECISION_MODEL_MISSING')
  if (config?.enabled !== true) return deny('FEATURE_FLAG_DISABLED')
  if (config.termsApproved !== true) return deny('TERMS_NOT_APPROVED')
  if (config.rights === 'UNKNOWN') return deny('RIGHTS_UNKNOWN')
  if (config.rights === 'EXPIRED') return deny('RIGHTS_EXPIRED')
  if (config.rights !== 'CLEARED') return deny('RIGHTS_UNKNOWN')
  if (typeof config.providerId !== 'string' || config.providerId.trim().length === 0) return deny('PROVIDER_NOT_CONFIGURED')
  if (typeof input.providerId !== 'string' || input.providerId !== config.providerId) {
    return deny('FALLBACK_PROVIDER_FORBIDDEN')
  }

  let preDecision: ProviderPolicyDecision
  try {
    preDecision = deps.decideIntent(buildIntent(input, config, [PRE_DNS_PLACEHOLDER_ADDRESS]))
  } catch {
    return deny('POLICY_DENIED')
  }
  if (!preDecision.allowed) return deny(toPolicyReason(preDecision.reason))

  let target: URL
  try {
    target = new URL(input.url)
  } catch {
    return deny('INVALID_URL')
  }

  let resolvedAddresses: string[]
  try {
    const resolved = await deps.resolveHost(target.hostname)
    resolvedAddresses = Array.isArray(resolved) ? resolved : []
  } catch {
    return deny('DNS_RESOLUTION_FAILED')
  }

  let decision: ProviderPolicyDecision
  try {
    decision = deps.decideIntent(buildIntent(input, config, resolvedAddresses))
  } catch {
    return deny('POLICY_DENIED')
  }
  if (!decision.allowed) return deny(toPolicyReason(decision.reason))

  if (!requestBudgetValid(config.requestTimeoutMs, config.maxResponseBytes)) return deny('REQUEST_BUDGET_INVALID')

  let response: Response
  try {
    response = await deps.fetchImpl(input.url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(config.requestTimeoutMs),
      headers: { accept: 'application/json' },
    })
  } catch (error) {
    return deny(isTimeoutError(error) ? 'REQUEST_TIMEOUT' : 'TRANSPORT_FAILED')
  }

  // Redirects are never followed; `redirect: 'manual'` surfaces them as 3xx.
  if (!response.ok) return deny('HTTP_STATUS_REJECTED')

  const bytes = await readBoundedBody(response, config.maxResponseBytes)
  if (bytes === null) return deny('RESPONSE_TOO_LARGE')

  let parsed: unknown
  try {
    parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  } catch {
    return deny('RESPONSE_NOT_JSON')
  }

  const observation = readObservation(config.providerId, parsed)
  if (!observation) return deny('PAYLOAD_CONTRACT_INVALID')
  return { ok: true, observation }
}
