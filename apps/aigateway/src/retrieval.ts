/**
 * M21-03 prototype source-permission gate.
 *
 * This module is deliberately pure: no imports, no network, no database, no
 * wall clock and no provider/server dependency. It answers one question for a
 * candidate source document — may these bytes enter a model context for this
 * requester? — and returns either an authorized descriptor or a denial with a
 * stable reason code and no source text.
 *
 * The policy is deny-by-default. Roles and scopes are recorded on the
 * requester but are never consulted: only an explicit, principal-bound,
 * scope-bound source grant can unlock a RESTRICTED source. PRIVATE and
 * WITHDRAWN sources are never released by this prototype, and non-cleared
 * rights never yield bytes. This is a prototype gate, not an integrated
 * retrieval pipeline; see docs/audit/M21-03-permission-retrieval.md.
 */

export const RETRIEVAL_POLICY_VERSION = '1.0.0'

/** Exact usage scope this prototype understands: bytes placed in a model context. */
export const MODEL_CONTEXT_SCOPE = 'model-context'

export type SourceVisibility = 'PRIVATE' | 'RESTRICTED' | 'PUBLIC' | 'WITHDRAWN'

export type SourceRightsStatus = 'RIGHTS_UNKNOWN' | 'RIGHTS_EXACT_VERSION_CLEARED'

/**
 * A source document descriptor. `body` is optional and is only ever emitted
 * by an authorized decision. `consentScope === null` means no usable consent
 * was supplied; `consentExpiresAt` absent/null means no expiry was recorded.
 */
export interface SourceCandidate {
  readonly id: string
  readonly ownerPrincipalRef: string
  readonly visibility: SourceVisibility
  readonly rightsStatus: SourceRightsStatus
  /** Usage scope covered by the rights clearance; exact string match. */
  readonly rightsScope: string
  readonly consentScope: string | null
  readonly consentExpiresAt?: string | null
  readonly sourceLocator: string
  readonly body?: string
}

/** An explicit, principal-bound, scope-bound permission for one source. */
export interface SourceGrant {
  readonly sourceId: string
  readonly principalRef: string
  readonly scope: string
  readonly expiresAt?: string | null
}

export interface RetrievalRequester {
  readonly principalRef: string
  /** Recorded for audit only; roles never authorize source bytes. */
  readonly roles?: readonly string[]
  /** Recorded for audit only; scopes never authorize source bytes. */
  readonly scopes?: readonly string[]
  readonly grants?: readonly SourceGrant[]
  /** Exact scope the caller asks to place in a model context. */
  readonly requestedScope: string
  /** Caller-supplied clock (ISO-8601); no wall clock is read. */
  readonly evaluatedAt: string
}

export type RetrievalDenialReason =
  | 'REQUEST_FIELD_MISSING'
  | 'REQUEST_FIELD_INVALID'
  | 'REQUEST_TIMESTAMP_INVALID'
  | 'SOURCE_LIST_INVALID'
  | 'SOURCE_FIELD_MISSING'
  | 'SOURCE_FIELD_INVALID'
  | 'SOURCE_VISIBILITY_INVALID'
  | 'SOURCE_RIGHTS_STATUS_INVALID'
  | 'SOURCE_PRIVATE'
  | 'SOURCE_WITHDRAWN'
  | 'SOURCE_RESTRICTED_NO_GRANT'
  | 'SOURCE_RESTRICTED_GRANT_OTHER_PRINCIPAL'
  | 'SOURCE_RESTRICTED_GRANT_SCOPE_MISMATCH'
  | 'SOURCE_RESTRICTED_GRANT_EXPIRED'
  | 'RIGHTS_UNKNOWN'
  | 'RIGHTS_SCOPE_MISMATCH'
  | 'CONSENT_MISSING'
  | 'CONSENT_EXPIRED'
  | 'CONSENT_TIMESTAMP_INVALID'
  | 'CONSENT_SCOPE_MISMATCH'

export interface AuthorizedSourceDecision {
  readonly sourceId: string
  readonly authorized: true
  readonly visibility: SourceVisibility
  readonly rightsStatus: SourceRightsStatus
  readonly sourceLocator: string
  /** Present only when the authorized candidate carried bytes. */
  readonly body?: string
}

/**
 * A denial never carries `body`, `snippet`, `text`, `content` or the source
 * locator. `sourceId` is the only source-identifying field.
 */
export interface DeniedSourceDecision {
  readonly sourceId: string | null
  readonly authorized: false
  readonly reason: RetrievalDenialReason
}

export type RetrievalDecision = AuthorizedSourceDecision | DeniedSourceDecision

interface NormalizedRequester {
  readonly principalRef: string
  readonly requestedScope: string
  readonly evaluatedAtMs: number
  readonly grants: readonly SourceGrant[]
}

type NormalizedRequesterResult =
  | { readonly ok: true; readonly requester: NormalizedRequester }
  | { readonly ok: false; readonly reason: RetrievalDenialReason }

type CandidateValidation =
  | { readonly ok: true; readonly candidate: SourceCandidate }
  | {
      readonly ok: false
      readonly sourceId: string | null
      readonly reason: RetrievalDenialReason
    }

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

function parseTimestamp(value: unknown): number | null {
  if (!isNonEmptyString(value)) return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function isVisibility(value: unknown): value is SourceVisibility {
  return value === 'PRIVATE' || value === 'RESTRICTED' || value === 'PUBLIC' || value === 'WITHDRAWN'
}

function isRightsStatus(value: unknown): value is SourceRightsStatus {
  return value === 'RIGHTS_UNKNOWN' || value === 'RIGHTS_EXACT_VERSION_CLEARED'
}

function notExpired(expiresAt: unknown, atMs: number): boolean {
  if (expiresAt === undefined || expiresAt === null) return true
  if (typeof expiresAt !== 'string') return false
  const expiryMs = parseTimestamp(expiresAt)
  return expiryMs !== null && expiryMs > atMs
}

function denied(sourceId: string | null, reason: RetrievalDenialReason): DeniedSourceDecision {
  return { sourceId, authorized: false, reason }
}

function sourceIdOf(candidate: unknown): string | null {
  if (!isRecord(candidate)) return null
  return isNonEmptyString(candidate.id) ? candidate.id : null
}

function normalizeGrants(raw: unknown): readonly SourceGrant[] | null {
  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw)) return null
  const grants: SourceGrant[] = []
  for (const entry of raw) {
    if (!isRecord(entry)) return null
    if (!isNonEmptyString(entry.sourceId)) return null
    if (!isNonEmptyString(entry.principalRef)) return null
    if (!isNonEmptyString(entry.scope)) return null
    if (entry.expiresAt !== undefined && entry.expiresAt !== null) {
      if (typeof entry.expiresAt !== 'string') return null
      if (parseTimestamp(entry.expiresAt) === null) return null
    }
    grants.push({
      sourceId: entry.sourceId,
      principalRef: entry.principalRef,
      scope: entry.scope,
      ...(typeof entry.expiresAt === 'string' ? { expiresAt: entry.expiresAt } : {}),
    })
  }
  return grants
}

function normalizeRequester(raw: unknown): NormalizedRequesterResult {
  if (!isRecord(raw)) return { ok: false, reason: 'REQUEST_FIELD_MISSING' }
  if (!isNonEmptyString(raw.principalRef)) return { ok: false, reason: 'REQUEST_FIELD_MISSING' }
  if (!isNonEmptyString(raw.requestedScope)) return { ok: false, reason: 'REQUEST_FIELD_MISSING' }
  const evaluatedAtMs = parseTimestamp(raw.evaluatedAt)
  if (evaluatedAtMs === null) return { ok: false, reason: 'REQUEST_TIMESTAMP_INVALID' }
  if (raw.roles !== undefined && !isStringArray(raw.roles)) {
    return { ok: false, reason: 'REQUEST_FIELD_INVALID' }
  }
  if (raw.scopes !== undefined && !isStringArray(raw.scopes)) {
    return { ok: false, reason: 'REQUEST_FIELD_INVALID' }
  }
  const grants = normalizeGrants(raw.grants)
  if (grants === null) return { ok: false, reason: 'REQUEST_FIELD_INVALID' }
  return {
    ok: true,
    requester: {
      principalRef: raw.principalRef,
      requestedScope: raw.requestedScope,
      evaluatedAtMs,
      grants,
    },
  }
}

function validateCandidate(raw: unknown): CandidateValidation {
  if (!isRecord(raw)) return { ok: false, sourceId: null, reason: 'SOURCE_FIELD_MISSING' }
  if (!isNonEmptyString(raw.id)) return { ok: false, sourceId: null, reason: 'SOURCE_FIELD_MISSING' }
  const id = raw.id
  if (!isNonEmptyString(raw.ownerPrincipalRef)) {
    return { ok: false, sourceId: id, reason: 'SOURCE_FIELD_MISSING' }
  }
  if (typeof raw.visibility !== 'string') {
    return { ok: false, sourceId: id, reason: 'SOURCE_FIELD_MISSING' }
  }
  if (!isVisibility(raw.visibility)) {
    return { ok: false, sourceId: id, reason: 'SOURCE_VISIBILITY_INVALID' }
  }
  if (typeof raw.rightsStatus !== 'string') {
    return { ok: false, sourceId: id, reason: 'SOURCE_FIELD_MISSING' }
  }
  if (!isRightsStatus(raw.rightsStatus)) {
    return { ok: false, sourceId: id, reason: 'SOURCE_RIGHTS_STATUS_INVALID' }
  }
  if (!isNonEmptyString(raw.rightsScope)) {
    return { ok: false, sourceId: id, reason: 'SOURCE_FIELD_MISSING' }
  }
  if (!isNonEmptyString(raw.sourceLocator)) {
    return { ok: false, sourceId: id, reason: 'SOURCE_FIELD_MISSING' }
  }
  if (raw.consentScope !== undefined && raw.consentScope !== null && typeof raw.consentScope !== 'string') {
    return { ok: false, sourceId: id, reason: 'SOURCE_FIELD_INVALID' }
  }
  if (raw.consentExpiresAt !== undefined && raw.consentExpiresAt !== null) {
    if (typeof raw.consentExpiresAt !== 'string') {
      return { ok: false, sourceId: id, reason: 'SOURCE_FIELD_INVALID' }
    }
    if (parseTimestamp(raw.consentExpiresAt) === null) {
      return { ok: false, sourceId: id, reason: 'CONSENT_TIMESTAMP_INVALID' }
    }
  }
  if (raw.body !== undefined && raw.body !== null && typeof raw.body !== 'string') {
    return { ok: false, sourceId: id, reason: 'SOURCE_FIELD_INVALID' }
  }

  return {
    ok: true,
    candidate: {
      id,
      ownerPrincipalRef: raw.ownerPrincipalRef,
      visibility: raw.visibility,
      rightsStatus: raw.rightsStatus,
      rightsScope: raw.rightsScope,
      consentScope: isNonEmptyString(raw.consentScope) ? raw.consentScope : null,
      sourceLocator: raw.sourceLocator,
      ...(typeof raw.consentExpiresAt === 'string' ? { consentExpiresAt: raw.consentExpiresAt } : {}),
      ...(typeof raw.body === 'string' ? { body: raw.body } : {}),
    },
  }
}

function restrictedGrantFailure(
  source: SourceCandidate,
  requester: NormalizedRequester,
): RetrievalDenialReason | null {
  const sourceGrants = requester.grants.filter((grant) => grant.sourceId === source.id)
  if (sourceGrants.length === 0) return 'SOURCE_RESTRICTED_NO_GRANT'
  const principalGrants = sourceGrants.filter((grant) => grant.principalRef === requester.principalRef)
  if (principalGrants.length === 0) return 'SOURCE_RESTRICTED_GRANT_OTHER_PRINCIPAL'
  const scopedGrants = principalGrants.filter((grant) => grant.scope === requester.requestedScope)
  if (scopedGrants.length === 0) return 'SOURCE_RESTRICTED_GRANT_SCOPE_MISMATCH'
  const liveGrants = scopedGrants.filter((grant) => notExpired(grant.expiresAt, requester.evaluatedAtMs))
  if (liveGrants.length === 0) return 'SOURCE_RESTRICTED_GRANT_EXPIRED'
  return null
}

function authorized(source: SourceCandidate): AuthorizedSourceDecision {
  const base: AuthorizedSourceDecision = {
    sourceId: source.id,
    authorized: true,
    visibility: source.visibility,
    rightsStatus: source.rightsStatus,
    sourceLocator: source.sourceLocator,
  }
  return source.body === undefined ? base : { ...base, body: source.body }
}

function evaluateNormalized(raw: unknown, requester: NormalizedRequester): RetrievalDecision {
  const validation = validateCandidate(raw)
  if (!validation.ok) return denied(validation.sourceId, validation.reason)
  const source = validation.candidate

  if (source.visibility === 'WITHDRAWN') return denied(source.id, 'SOURCE_WITHDRAWN')
  if (source.visibility === 'PRIVATE') return denied(source.id, 'SOURCE_PRIVATE')
  if (source.visibility === 'RESTRICTED') {
    const grantFailure = restrictedGrantFailure(source, requester)
    if (grantFailure !== null) return denied(source.id, grantFailure)
  }

  if (source.rightsStatus === 'RIGHTS_UNKNOWN') return denied(source.id, 'RIGHTS_UNKNOWN')
  if (source.rightsScope !== requester.requestedScope) return denied(source.id, 'RIGHTS_SCOPE_MISMATCH')

  if (source.consentScope === null) return denied(source.id, 'CONSENT_MISSING')
  if (source.consentScope !== requester.requestedScope) return denied(source.id, 'CONSENT_SCOPE_MISMATCH')
  if (!notExpired(source.consentExpiresAt, requester.evaluatedAtMs)) {
    return denied(source.id, 'CONSENT_EXPIRED')
  }

  return authorized(source)
}

/**
 * Evaluate one candidate. The candidate and requester are accepted as
 * `unknown` because a gate at a trust boundary must reject malformed input
 * rather than trust a caller-side type.
 */
export function evaluateSourceCandidate(candidate: unknown, requester: unknown): RetrievalDecision {
  const normalized = normalizeRequester(requester)
  if (!normalized.ok) return denied(sourceIdOf(candidate), normalized.reason)
  return evaluateNormalized(candidate, normalized.requester)
}

/**
 * Evaluate every candidate in order. This never throws for malformed
 * candidate payloads and never returns candidate bytes for a denied source.
 */
export function selectAuthorizedSources(
  candidates: readonly unknown[],
  requester: unknown,
): RetrievalDecision[] {
  if (!Array.isArray(candidates)) return [denied(null, 'SOURCE_LIST_INVALID')]
  const normalized = normalizeRequester(requester)
  if (!normalized.ok) {
    return candidates.map((candidate) => denied(sourceIdOf(candidate), normalized.reason))
  }
  return candidates.map((candidate) => evaluateNormalized(candidate, normalized.requester))
}
