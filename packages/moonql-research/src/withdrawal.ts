/**
 * M18-04 prototype withdrawal, correction, takedown and appeal lifecycle.
 *
 * This module is deliberately pure: no imports, no database, no HTTP, no
 * network, no wall clock and no dependency on the D08 store, the MoonQL ORM or
 * this package's barrel. It records a request lifecycle —
 *
 *   SUBMITTED -> UNDER_REVIEW -> ACCEPTED | REJECTED
 *
 * — for four request kinds (WITHDRAWAL, CORRECTION, TAKEDOWN, APPEAL) and
 * answers one question for a public read: may this exact release be publicly
 * available right now?
 *
 * The policy is deny-by-default and follows the accepted decisions:
 * - ADR-0003: a withdrawn source leaves public projections immediately while
 *   the audit trail is retained.
 * - M03-06: a rights holder/witness may withdraw at any time; a takedown is a
 *   quarantine of the material, not destruction of the underlying record.
 * - M18-01/M18-03: approval stays on the single human path; this module never
 *   approves, publishes or reinstates by itself. A correction is a new release
 *   that must pass the existing approval path, never an in-place edit.
 *
 * Hard rules:
 * - A WITHDRAWN or CORRECTED release is never publicly available; no appeal can
 *   revive it. A new, separately approved release is required.
 * - An accepted TAKEDOWN outranks a pending, rejected or malformed APPEAL. Only
 *   an APPEAL that a different REVIEWER accepted, after the takedown and with a
 *   recorded reinstatement reason code, restores availability.
 * - The requester must hold the role and the exact public scope appropriate to
 *   the request kind, and (except for TAKEDOWN) be bound to the release.
 * - Unknown kinds, states, roles or reason codes fail closed; so do missing
 *   actors, duplicate request ids, duplicate open requests, decision replays,
 *   missing rights/consent references and appeal self-review.
 *
 * A refusal never carries request text, a URL, a locator, content bytes or a
 * payload. The only identifying output is the opaque `requestId` or
 * `releaseId` plus a stable reason code.
 *
 * Not wired to any route, store, schema, migration or UI. See
 * docs/audit/M18-04-withdrawal-correction-takedown-appeal.md for evidence and
 * explicit non-claims.
 */

export const WITHDRAWAL_POLICY_VERSION = '1.0.0'

/** The only usage scope this module evaluates. Matches M18-03's public scope. */
export const PUBLIC_AVAILABILITY_SCOPE = 'public'

export const WITHDRAWAL_REQUEST_KINDS = ['WITHDRAWAL', 'CORRECTION', 'TAKEDOWN', 'APPEAL'] as const

export type WithdrawalRequestKind = (typeof WITHDRAWAL_REQUEST_KINDS)[number]

/**
 * `REJECTED` is terminal but harmless: a rejected request never blocks public
 * availability. `ACCEPTED` is terminal and has an effect that depends on kind.
 */
export const WITHDRAWAL_REQUEST_STATES = ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'] as const

export type WithdrawalRequestState = (typeof WITHDRAWAL_REQUEST_STATES)[number]

/**
 * Recorded release state. A takedown deliberately does not appear here: it is a
 * reversible quarantine recorded on the request ledger, not a destructive
 * change to the release record (M03-06 §3.2).
 */
export const RELEASE_PUBLICATION_STATES = ['PUBLISHED', 'WITHDRAWN', 'CORRECTED'] as const

export type ReleasePublicationState = (typeof RELEASE_PUBLICATION_STATES)[number]

export const WITHDRAWAL_ACTOR_ROLES = ['RIGHTS_HOLDER', 'WITNESS', 'REVIEWER', 'GOVERNANCE'] as const

export type WithdrawalActorRole = (typeof WITHDRAWAL_ACTOR_ROLES)[number]

export const DECISION_ACTIONS = ['ACCEPT', 'REJECT'] as const

export type DecisionAction = (typeof DECISION_ACTIONS)[number]

/**
 * Recorded decision reasons. These are stable codes, never free text, so a
 * refusal or a record cannot become a channel for witness or source content.
 */
export const DECISION_REASON_CODES = [
  'RIGHTS_HOLDER_REQUEST',
  'CONSENT_WITHDRAWN',
  'COPYRIGHT_COMPLAINT_UPHELD',
  'COMPLAINT_NOT_UPHELD',
  'CORRECTION_REQUIRED',
  'APPEAL_UPHELD',
  'APPEAL_DENIED',
  'TAKEDOWN_RESOLVED',
  'RIGHTS_RESTORED',
  'ERROR_CORRECTED',
] as const

export type DecisionReasonCode = (typeof DECISION_REASON_CODES)[number]

/** Reasons that may reinstate a quarantined release through a successful appeal. */
export const REINSTATEMENT_REASON_CODES: readonly DecisionReasonCode[] = [
  'APPEAL_UPHELD',
  'TAKEDOWN_RESOLVED',
  'RIGHTS_RESTORED',
  'ERROR_CORRECTED',
]

/** Roles that may record any decision. Appeals additionally require REVIEWER. */
const DECIDING_ROLES: readonly WithdrawalActorRole[] = ['REVIEWER', 'GOVERNANCE']

/** Roles that may ask to withdraw, correct or appeal on behalf of a release. */
const BOUND_REQUESTER_ROLES: readonly WithdrawalActorRole[] = ['RIGHTS_HOLDER', 'WITNESS']

/** One release as supplied to this module. Opaque references only. */
export interface GovernedRelease {
  readonly releaseId: string
  readonly releaseRef: string
  readonly state: ReleasePublicationState
  readonly publicScope: string
  /** Opaque reference to the rights decision; null means unrecorded. */
  readonly rightsReference: string | null
  /** Exact scope covered by that rights decision; null means unrecorded. */
  readonly rightsScope: string | null
  /** Opaque reference to the consent record; null means unrecorded. */
  readonly consentReference: string | null
  /** Exact scope covered by that consent; null means unrecorded. */
  readonly consentScope: string | null
  /** Principal refs that may withdraw/correct/appeal for this release. */
  readonly rightsHolderRefs: readonly string[]
  /** Witness principal refs bound to this release. */
  readonly witnessRefs: readonly string[]
}

/**
 * Who is asking. A requester has exactly one role and one exact scope; it is
 * not a reviewer and gains no decision authority from this record.
 */
export interface WithdrawalRequester {
  readonly principalRef: string
  readonly role: WithdrawalActorRole
  readonly scope: string
}

/** Who is deciding. Roles are checked; there is no implied superuser. */
export interface WithdrawalActor {
  readonly principalRef: string
  readonly roles: readonly WithdrawalActorRole[]
}

/** Input for a new request. `targetRequestId` is required only for APPEAL. */
export interface WithdrawalRequestInput {
  readonly requestId: string
  readonly kind: WithdrawalRequestKind
  readonly submittedAt: string
  readonly requestedScope: string
  readonly targetRequestId?: string | null
}

/** Input for a decision. Every decision needs a recorded stable reason code. */
export interface WithdrawalDecisionInput {
  readonly action: DecisionAction
  readonly reasonCode: DecisionReasonCode
  readonly decidedAt: string
}

/** An immutable, frozen request record. */
export interface WithdrawalRequest {
  readonly policyVersion: typeof WITHDRAWAL_POLICY_VERSION
  readonly requestId: string
  readonly kind: WithdrawalRequestKind
  readonly releaseId: string
  readonly requestedBy: string
  readonly requesterRole: WithdrawalActorRole
  readonly requestedScope: string
  /** Appeal target; null for every other kind. */
  readonly targetRequestId: string | null
  readonly state: WithdrawalRequestState
  readonly submittedAt: string
  readonly decidedBy: string | null
  readonly decidedByRole: WithdrawalActorRole | null
  readonly decidedAt: string | null
  readonly reasonCode: DecisionReasonCode | null
}

export type WithdrawalRefusalReason =
  // release shape, state, scope and rights/consent references
  | 'RELEASE_FIELD_MISSING'
  | 'RELEASE_FIELD_INVALID'
  | 'RELEASE_STATE_UNKNOWN'
  | 'RELEASE_NOT_PUBLISHED'
  | 'RELEASE_WITHDRAWN'
  | 'RELEASE_CORRECTED'
  | 'RELEASE_TAKEDOWN'
  | 'PUBLIC_SCOPE_INVALID'
  | 'RIGHTS_REFERENCE_MISSING'
  | 'CONSENT_REFERENCE_MISSING'
  | 'RIGHTS_SCOPE_MISMATCH'
  | 'CONSENT_SCOPE_MISMATCH'
  // request records and ledger
  | 'REQUEST_LIST_INVALID'
  | 'REQUEST_FIELD_MISSING'
  | 'REQUEST_FIELD_INVALID'
  | 'REQUEST_ID_MISSING'
  | 'REQUEST_ID_REPLAY'
  | 'REQUEST_KIND_UNKNOWN'
  | 'REQUEST_STATE_UNKNOWN'
  | 'REQUEST_TIMESTAMP_INVALID'
  | 'REQUEST_RELEASE_MISMATCH'
  | 'REQUEST_ALREADY_DECIDED'
  | 'REQUEST_ALREADY_IN_REVIEW'
  | 'REQUEST_NOT_UNDER_REVIEW'
  | 'REQUEST_NOT_ACCEPTED'
  | 'REQUEST_KIND_NOT_APPLICABLE'
  | 'DUPLICATE_REQUEST'
  | 'REQUEST_PENDING'
  // requester and actor
  | 'REQUESTER_MISSING'
  | 'REQUESTER_ROLE_UNKNOWN'
  | 'REQUESTER_NOT_AUTHORIZED'
  | 'REQUESTER_NOT_BOUND'
  | 'REQUESTER_SCOPE_MISMATCH'
  | 'ACTOR_MISSING'
  | 'ACTOR_ROLE_UNKNOWN'
  | 'ACTOR_NOT_AUTHORIZED'
  | 'SELF_REVIEW_FORBIDDEN'
  | 'APPEAL_SELF_REVIEW'
  | 'APPEAL_REVIEWER_REQUIRED'
  // decisions and appeals
  | 'DECISION_INVALID'
  | 'DECISION_REASON_MISSING'
  | 'DECISION_REASON_UNKNOWN'
  | 'REINSTATEMENT_REASON_MISSING'
  | 'WITHDRAWAL_IS_A_RIGHT'
  | 'APPEAL_TARGET_MISSING'
  | 'APPEAL_TARGET_UNKNOWN'
  | 'APPEAL_TARGET_INVALID'
  | 'APPEAL_TARGET_OTHER_RELEASE'
  | 'APPEAL_BEFORE_TAKEDOWN'

/** Submission/triage/decision refusal: opaque id plus stable code only. */
export interface RefusedWithdrawalRequest {
  readonly accepted: false
  readonly requestId: string | null
  readonly reason: WithdrawalRefusalReason
}

export interface AcceptedWithdrawalRequest {
  readonly accepted: true
  readonly request: WithdrawalRequest
}

export type WithdrawalRequestResult = AcceptedWithdrawalRequest | RefusedWithdrawalRequest

/** Release-state application refusal: opaque id plus stable code only. */
export interface RefusedReleaseApplication {
  readonly applied: false
  readonly releaseId: string | null
  readonly reason: WithdrawalRefusalReason
}

export interface AppliedReleaseChange {
  readonly applied: true
  readonly release: GovernedRelease
}

export type ReleaseApplicationResult = AppliedReleaseChange | RefusedReleaseApplication

/** A public read that may be served. Carries references, never content. */
export interface AvailableRelease {
  readonly available: true
  readonly releaseId: string
  readonly rightsReference: string
  readonly consentReference: string
  readonly policyVersion: typeof WITHDRAWAL_POLICY_VERSION
}

/** A public read that must not be served: opaque id plus stable code only. */
export interface UnavailableRelease {
  readonly available: false
  readonly releaseId: string | null
  readonly reason: WithdrawalRefusalReason
}

export type PublicAvailability = AvailableRelease | UnavailableRelease

type UnknownRecord = Record<string, unknown>

interface NormalizedRelease {
  readonly releaseId: string
  readonly releaseRef: string
  readonly state: ReleasePublicationState
  readonly publicScope: string
  readonly rightsReference: string | null
  readonly rightsScope: string | null
  readonly consentReference: string | null
  readonly consentScope: string | null
  readonly rightsHolderRefs: readonly string[]
  readonly witnessRefs: readonly string[]
}

type ReleaseParse =
  | { readonly ok: true; readonly release: NormalizedRelease }
  | { readonly ok: false; readonly releaseId: string | null; readonly reason: WithdrawalRefusalReason }

type RequestParse =
  | { readonly ok: true; readonly request: WithdrawalRequest }
  | { readonly ok: false; readonly requestId: string | null; readonly reason: WithdrawalRefusalReason }

type LedgerParse =
  | { readonly ok: true; readonly requests: readonly WithdrawalRequest[] }
  | { readonly ok: false; readonly requestId: string | null; readonly reason: WithdrawalRefusalReason }

type ActorParse =
  | { readonly ok: true; readonly principalRef: string; readonly roles: readonly WithdrawalActorRole[] }
  | { readonly ok: false; readonly reason: WithdrawalRefusalReason }

type RequesterParse =
  | { readonly ok: true; readonly requester: WithdrawalRequester }
  | { readonly ok: false; readonly reason: WithdrawalRefusalReason }

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isKnown<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value)
}

function parseTimestamp(value: unknown): number | null {
  if (!isNonEmptyString(value)) return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  Object.freeze(value)
  for (const nested of Object.values(value as UnknownRecord)) deepFreeze(nested)
  return value
}

function requestRefused(requestId: string | null, reason: WithdrawalRefusalReason): RefusedWithdrawalRequest {
  return Object.freeze({ accepted: false, requestId, reason })
}

function applicationRefused(releaseId: string | null, reason: WithdrawalRefusalReason): RefusedReleaseApplication {
  return Object.freeze({ applied: false, releaseId, reason })
}

function unavailable(releaseId: string | null, reason: WithdrawalRefusalReason): UnavailableRelease {
  return Object.freeze({ available: false, releaseId, reason })
}

function stringList(value: unknown): readonly string[] | null {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) return null
  const entries: string[] = []
  for (const entry of value) {
    if (!isNonEmptyString(entry)) return null
    entries.push(entry)
  }
  return entries
}

function parseRelease(raw: unknown): ReleaseParse {
  if (!isRecord(raw)) return { ok: false, releaseId: null, reason: 'RELEASE_FIELD_MISSING' }
  const releaseId = isNonEmptyString(raw.releaseId) ? raw.releaseId : null
  if (releaseId === null) return { ok: false, releaseId: null, reason: 'RELEASE_FIELD_MISSING' }
  if (!isNonEmptyString(raw.releaseRef)) return { ok: false, releaseId, reason: 'RELEASE_FIELD_MISSING' }
  if (typeof raw.state !== 'string') return { ok: false, releaseId, reason: 'RELEASE_FIELD_MISSING' }
  if (!isKnown(RELEASE_PUBLICATION_STATES, raw.state)) {
    return { ok: false, releaseId, reason: 'RELEASE_STATE_UNKNOWN' }
  }
  if (!isNonEmptyString(raw.publicScope)) return { ok: false, releaseId, reason: 'RELEASE_FIELD_MISSING' }
  if (raw.publicScope !== PUBLIC_AVAILABILITY_SCOPE) {
    return { ok: false, releaseId, reason: 'PUBLIC_SCOPE_INVALID' }
  }
  const rightsReference = optionalReference(raw.rightsReference)
  if (rightsReference === undefined) return { ok: false, releaseId, reason: 'RELEASE_FIELD_INVALID' }
  const rightsScope = optionalReference(raw.rightsScope)
  if (rightsScope === undefined) return { ok: false, releaseId, reason: 'RELEASE_FIELD_INVALID' }
  const consentReference = optionalReference(raw.consentReference)
  if (consentReference === undefined) return { ok: false, releaseId, reason: 'RELEASE_FIELD_INVALID' }
  const consentScope = optionalReference(raw.consentScope)
  if (consentScope === undefined) return { ok: false, releaseId, reason: 'RELEASE_FIELD_INVALID' }
  const rightsHolderRefs = stringList(raw.rightsHolderRefs)
  if (rightsHolderRefs === null) return { ok: false, releaseId, reason: 'RELEASE_FIELD_INVALID' }
  const witnessRefs = stringList(raw.witnessRefs)
  if (witnessRefs === null) return { ok: false, releaseId, reason: 'RELEASE_FIELD_INVALID' }
  return {
    ok: true,
    release: deepFreeze({
      releaseId,
      releaseRef: raw.releaseRef,
      state: raw.state,
      publicScope: raw.publicScope,
      rightsReference,
      rightsScope,
      consentReference,
      consentScope,
      rightsHolderRefs,
      witnessRefs,
    }),
  }
}

/** `undefined` means malformed; `null` means recorded as absent. */
function optionalReference(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null
  if (!isNonEmptyString(value)) return undefined
  return value
}

function referenceFailure(release: NormalizedRelease): WithdrawalRefusalReason | null {
  if (release.rightsReference === null) return 'RIGHTS_REFERENCE_MISSING'
  if (release.rightsScope !== release.publicScope) return 'RIGHTS_SCOPE_MISMATCH'
  if (release.consentReference === null) return 'CONSENT_REFERENCE_MISSING'
  if (release.consentScope !== release.publicScope) return 'CONSENT_SCOPE_MISMATCH'
  return null
}

function parseRequester(raw: unknown): RequesterParse {
  if (!isRecord(raw) || !isNonEmptyString(raw.principalRef)) {
    return { ok: false, reason: 'REQUESTER_MISSING' }
  }
  if (!isKnown(WITHDRAWAL_ACTOR_ROLES, raw.role)) {
    return { ok: false, reason: 'REQUESTER_ROLE_UNKNOWN' }
  }
  if (!isNonEmptyString(raw.scope)) return { ok: false, reason: 'REQUESTER_SCOPE_MISMATCH' }
  return { ok: true, requester: { principalRef: raw.principalRef, role: raw.role, scope: raw.scope } }
}

function parseActor(raw: unknown): ActorParse {
  if (!isRecord(raw) || !isNonEmptyString(raw.principalRef)) return { ok: false, reason: 'ACTOR_MISSING' }
  if (raw.roles === undefined || raw.roles === null) return { ok: false, reason: 'ACTOR_NOT_AUTHORIZED' }
  if (!Array.isArray(raw.roles)) return { ok: false, reason: 'ACTOR_ROLE_UNKNOWN' }
  if (raw.roles.length === 0) return { ok: false, reason: 'ACTOR_NOT_AUTHORIZED' }
  const roles: WithdrawalActorRole[] = []
  for (const role of raw.roles) {
    if (!isKnown(WITHDRAWAL_ACTOR_ROLES, role)) return { ok: false, reason: 'ACTOR_ROLE_UNKNOWN' }
    roles.push(role)
  }
  return { ok: true, principalRef: raw.principalRef, roles }
}

function parseRequestInput(
  raw: unknown,
  release: NormalizedRelease,
  requester: WithdrawalRequester,
): RequestParse {
  if (!isRecord(raw)) return { ok: false, requestId: null, reason: 'REQUEST_FIELD_MISSING' }
  const requestId = isNonEmptyString(raw.requestId) ? raw.requestId : null
  if (requestId === null) return { ok: false, requestId: null, reason: 'REQUEST_ID_MISSING' }
  if (typeof raw.kind !== 'string') return { ok: false, requestId, reason: 'REQUEST_FIELD_MISSING' }
  if (!isKnown(WITHDRAWAL_REQUEST_KINDS, raw.kind)) {
    return { ok: false, requestId, reason: 'REQUEST_KIND_UNKNOWN' }
  }
  if (!isNonEmptyString(raw.requestedScope)) {
    return { ok: false, requestId, reason: 'REQUESTER_SCOPE_MISMATCH' }
  }
  const submittedAt = isNonEmptyString(raw.submittedAt) ? raw.submittedAt : null
  if (submittedAt === null) return { ok: false, requestId, reason: 'REQUEST_TIMESTAMP_INVALID' }
  const submittedAtMs = parseTimestamp(submittedAt)
  if (submittedAtMs === null) return { ok: false, requestId, reason: 'REQUEST_TIMESTAMP_INVALID' }
  const targetRequestId = optionalReference(raw.targetRequestId)
  if (raw.kind === 'APPEAL') {
    if (targetRequestId === null) {
      return { ok: false, requestId, reason: 'APPEAL_TARGET_MISSING' }
    }
  } else if (targetRequestId !== null) {
    return { ok: false, requestId, reason: 'REQUEST_FIELD_INVALID' }
  }
  const request: WithdrawalRequest = deepFreeze({
    policyVersion: WITHDRAWAL_POLICY_VERSION,
    requestId,
    kind: raw.kind,
    releaseId: release.releaseId,
    requestedBy: requester.principalRef,
    requesterRole: requester.role,
    requestedScope: raw.requestedScope,
    targetRequestId: targetRequestId ?? null,
    state: 'SUBMITTED',
    submittedAt,
    decidedBy: null,
    decidedByRole: null,
    decidedAt: null,
    reasonCode: null,
  })
  return { ok: true, request }
}

/** Parse a request record that is already stored, never trusting its shape. */
function parseRequest(raw: unknown): RequestParse {
  if (!isRecord(raw)) return { ok: false, requestId: null, reason: 'REQUEST_FIELD_MISSING' }
  const requestId = isNonEmptyString(raw.requestId) ? raw.requestId : null
  if (requestId === null) return { ok: false, requestId: null, reason: 'REQUEST_ID_MISSING' }
  if (
    raw.policyVersion !== undefined &&
    raw.policyVersion !== null &&
    raw.policyVersion !== WITHDRAWAL_POLICY_VERSION
  ) {
    return { ok: false, requestId, reason: 'REQUEST_FIELD_INVALID' }
  }
  if (!isNonEmptyString(raw.releaseId)) return { ok: false, requestId, reason: 'REQUEST_FIELD_MISSING' }
  if (!isNonEmptyString(raw.requestedBy)) return { ok: false, requestId, reason: 'REQUEST_FIELD_MISSING' }
  if (typeof raw.kind !== 'string') return { ok: false, requestId, reason: 'REQUEST_FIELD_MISSING' }
  if (!isKnown(WITHDRAWAL_REQUEST_KINDS, raw.kind)) {
    return { ok: false, requestId, reason: 'REQUEST_KIND_UNKNOWN' }
  }
  if (typeof raw.state !== 'string') return { ok: false, requestId, reason: 'REQUEST_FIELD_MISSING' }
  if (!isKnown(WITHDRAWAL_REQUEST_STATES, raw.state)) {
    return { ok: false, requestId, reason: 'REQUEST_STATE_UNKNOWN' }
  }
  if (!isKnown(WITHDRAWAL_ACTOR_ROLES, raw.requesterRole)) {
    return { ok: false, requestId, reason: 'REQUESTER_ROLE_UNKNOWN' }
  }
  if (!isNonEmptyString(raw.requestedScope)) {
    return { ok: false, requestId, reason: 'REQUESTER_SCOPE_MISMATCH' }
  }
  const submittedAt = isNonEmptyString(raw.submittedAt) ? raw.submittedAt : null
  if (submittedAt === null) return { ok: false, requestId, reason: 'REQUEST_TIMESTAMP_INVALID' }
  const submittedAtMs = parseTimestamp(submittedAt)
  if (submittedAtMs === null) return { ok: false, requestId, reason: 'REQUEST_TIMESTAMP_INVALID' }

  const targetRequestId = optionalReference(raw.targetRequestId)
  if (raw.kind === 'APPEAL') {
    if (targetRequestId === null) {
      return { ok: false, requestId, reason: 'APPEAL_TARGET_MISSING' }
    }
  } else if (targetRequestId !== null) {
    return { ok: false, requestId, reason: 'REQUEST_FIELD_INVALID' }
  }

  const decidedBy = optionalReference(raw.decidedBy)
  if (decidedBy === undefined) return { ok: false, requestId, reason: 'REQUEST_FIELD_INVALID' }
  const decidedByRoleRaw = raw.decidedByRole
  let decidedByRole: WithdrawalActorRole | null = null
  if (decidedByRoleRaw !== undefined && decidedByRoleRaw !== null) {
    if (!isKnown(WITHDRAWAL_ACTOR_ROLES, decidedByRoleRaw)) {
      return { ok: false, requestId, reason: 'ACTOR_ROLE_UNKNOWN' }
    }
    decidedByRole = decidedByRoleRaw
  }
  if (raw.decidedAt !== undefined && raw.decidedAt !== null && typeof raw.decidedAt !== 'string') {
    return { ok: false, requestId, reason: 'REQUEST_FIELD_INVALID' }
  }
  const decidedAt: string | null = typeof raw.decidedAt === 'string' ? raw.decidedAt : null
  if (decidedAt !== null) {
    const decidedAtMs = parseTimestamp(decidedAt)
    if (decidedAtMs === null) return { ok: false, requestId, reason: 'REQUEST_TIMESTAMP_INVALID' }
    if (decidedAtMs < submittedAtMs) return { ok: false, requestId, reason: 'REQUEST_TIMESTAMP_INVALID' }
  }
  const reasonCodeRaw = raw.reasonCode
  let reasonCode: DecisionReasonCode | null = null
  if (reasonCodeRaw !== undefined && reasonCodeRaw !== null) {
    if (!isKnown(DECISION_REASON_CODES, reasonCodeRaw)) {
      return { ok: false, requestId, reason: 'DECISION_REASON_UNKNOWN' }
    }
    reasonCode = reasonCodeRaw
  }

  const pending = raw.state === 'SUBMITTED' || raw.state === 'UNDER_REVIEW'
  if (pending) {
    if (decidedBy !== null || decidedByRole !== null || decidedAt !== null || reasonCode !== null) {
      return { ok: false, requestId, reason: 'REQUEST_FIELD_INVALID' }
    }
  } else if (decidedBy === null || decidedByRole === null || decidedAt === null || reasonCode === null) {
    return { ok: false, requestId, reason: 'REQUEST_FIELD_INVALID' }
  }

  return {
    ok: true,
    request: deepFreeze({
      policyVersion: WITHDRAWAL_POLICY_VERSION,
      requestId,
      kind: raw.kind,
      releaseId: raw.releaseId,
      requestedBy: raw.requestedBy,
      requesterRole: raw.requesterRole,
      requestedScope: raw.requestedScope,
      targetRequestId: targetRequestId ?? null,
      state: raw.state,
      submittedAt,
      decidedBy,
      decidedByRole,
      decidedAt,
      reasonCode,
    }),
  }
}

function parseLedger(raw: unknown): LedgerParse {
  if (!Array.isArray(raw)) return { ok: false, requestId: null, reason: 'REQUEST_LIST_INVALID' }
  const requests: WithdrawalRequest[] = []
  const seen = new Set<string>()
  for (const entry of raw) {
    const parsed = parseRequest(entry)
    if (!parsed.ok) return parsed
    if (seen.has(parsed.request.requestId)) {
      return { ok: false, requestId: parsed.request.requestId, reason: 'REQUEST_ID_REPLAY' }
    }
    seen.add(parsed.request.requestId)
    requests.push(parsed.request)
  }
  return { ok: true, requests }
}

function requesterAuthorityFailure(
  release: NormalizedRelease,
  request: WithdrawalRequest,
): WithdrawalRefusalReason | null {
  if (request.requestedScope !== release.publicScope) return 'REQUESTER_SCOPE_MISMATCH'
  if (request.kind === 'TAKEDOWN') {
    if (request.requesterRole !== 'GOVERNANCE' && request.requesterRole !== 'REVIEWER') {
      return 'REQUESTER_NOT_AUTHORIZED'
    }
    return null
  }
  if (!BOUND_REQUESTER_ROLES.includes(request.requesterRole)) return 'REQUESTER_NOT_AUTHORIZED'
  const bound =
    request.requesterRole === 'RIGHTS_HOLDER'
      ? release.rightsHolderRefs.includes(request.requestedBy)
      : release.witnessRefs.includes(request.requestedBy)
  return bound ? null : 'REQUESTER_NOT_BOUND'
}

function decisionShapeFailure(request: WithdrawalRequest): WithdrawalRefusalReason | null {
  if (request.state === 'SUBMITTED' || request.state === 'UNDER_REVIEW') return null
  if (
    request.decidedBy === null ||
    request.decidedByRole === null ||
    request.decidedAt === null ||
    request.reasonCode === null
  ) {
    return 'REQUEST_FIELD_INVALID'
  }
  const selfReview = request.decidedBy === request.requestedBy
  if (request.kind === 'APPEAL') {
    if (selfReview) return 'APPEAL_SELF_REVIEW'
    if (request.decidedByRole !== 'REVIEWER') return 'APPEAL_REVIEWER_REQUIRED'
    return null
  }
  if (selfReview) return 'SELF_REVIEW_FORBIDDEN'
  if (!DECIDING_ROLES.includes(request.decidedByRole)) return 'ACTOR_NOT_AUTHORIZED'
  return null
}

function appealTargetFailure(
  request: WithdrawalRequest,
  byId: ReadonlyMap<string, WithdrawalRequest>,
): WithdrawalRefusalReason | null {
  if (request.targetRequestId === null) return 'APPEAL_TARGET_MISSING'
  const target = byId.get(request.targetRequestId)
  if (!target) return 'APPEAL_TARGET_UNKNOWN'
  if (target.kind !== 'TAKEDOWN' || target.state !== 'ACCEPTED') return 'APPEAL_TARGET_INVALID'
  if (target.releaseId !== request.releaseId) return 'APPEAL_TARGET_OTHER_RELEASE'
  if (request.state !== 'ACCEPTED') return null
  if (request.reasonCode === null || !REINSTATEMENT_REASON_CODES.includes(request.reasonCode)) {
    return 'REINSTATEMENT_REASON_MISSING'
  }
  if (request.decidedAt === null || target.decidedAt === null) return 'REQUEST_FIELD_INVALID'
  if (parseTimestamp(request.decidedAt) === null || parseTimestamp(target.decidedAt) === null) {
    return 'REQUEST_TIMESTAMP_INVALID'
  }
  const appealedAt = Date.parse(request.decidedAt)
  const takedownAt = Date.parse(target.decidedAt)
  if (appealedAt <= takedownAt) return 'APPEAL_BEFORE_TAKEDOWN'
  if (request.decidedBy === target.decidedBy) return 'APPEAL_SELF_REVIEW'
  return null
}

function actorRolesFailure(roles: readonly WithdrawalActorRole[], appeal: boolean): WithdrawalRefusalReason | null {
  if (appeal) return roles.includes('REVIEWER') ? null : 'APPEAL_REVIEWER_REQUIRED'
  return roles.some((role) => DECIDING_ROLES.includes(role)) ? null : 'ACTOR_NOT_AUTHORIZED'
}

function recordedRole(roles: readonly WithdrawalActorRole[]): WithdrawalActorRole {
  return roles.includes('REVIEWER') ? 'REVIEWER' : 'GOVERNANCE'
}

function duplicateRequest(
  existing: readonly WithdrawalRequest[],
  release: NormalizedRelease,
  kind: WithdrawalRequestKind,
  targetRequestId: string | null,
): boolean {
  return existing.some((entry) => {
    if (entry.releaseId !== release.releaseId) return false
    if (entry.kind !== kind) return false
    if (kind === 'APPEAL' && entry.targetRequestId !== targetRequestId) return false
    return entry.state !== 'REJECTED'
  })
}

function sameRequest(left: WithdrawalRequest, right: WithdrawalRequest): boolean {
  return (
    left.policyVersion === right.policyVersion &&
    left.requestId === right.requestId &&
    left.kind === right.kind &&
    left.releaseId === right.releaseId &&
    left.requestedBy === right.requestedBy &&
    left.requesterRole === right.requesterRole &&
    left.requestedScope === right.requestedScope &&
    left.targetRequestId === right.targetRequestId &&
    left.state === right.state &&
    left.submittedAt === right.submittedAt &&
    left.decidedBy === right.decidedBy &&
    left.decidedByRole === right.decidedByRole &&
    left.decidedAt === right.decidedAt &&
    left.reasonCode === right.reasonCode
  )
}

/** The passed request must be the exact record the ledger stores, not a stale copy. */
function recordedRequestFailure(
  requests: readonly WithdrawalRequest[],
  request: WithdrawalRequest,
): WithdrawalRefusalReason | null {
  const recorded = requests.find((entry) => entry.requestId === request.requestId)
  if (!recorded) return 'REQUEST_FIELD_MISSING'
  return sameRequest(recorded, request) ? null : 'REQUEST_ID_REPLAY'
}

/**
 * Submit one withdrawal, correction, takedown or appeal request.
 *
 * The release must be `PUBLISHED`, carry non-null rights and consent
 * references for the exact `public` scope, and the requester must hold a role
 * and scope that match the kind. Submitting an APPEAL additionally requires an
 * accepted TAKEDOWN of the same release and a requester different from that
 * takedown's decider. Duplicate request ids and duplicate open requests are
 * refused. The returned request is frozen in `SUBMITTED`.
 */
export function submitWithdrawalRequest(
  release: unknown,
  requesterInput: unknown,
  input: unknown,
  existingInput: unknown = [],
): WithdrawalRequestResult {
  const releaseParsed = parseRelease(release)
  if (!releaseParsed.ok) return requestRefused(null, releaseParsed.reason)
  const releaseRecord = releaseParsed.release
  if (releaseRecord.state === 'WITHDRAWN') return requestRefused(null, 'RELEASE_WITHDRAWN')
  if (releaseRecord.state === 'CORRECTED') return requestRefused(null, 'RELEASE_CORRECTED')
  if (releaseRecord.state !== 'PUBLISHED') return requestRefused(null, 'RELEASE_NOT_PUBLISHED')
  const referenceReason = referenceFailure(releaseRecord)
  if (referenceReason !== null) return requestRefused(null, referenceReason)

  const requesterParsed = parseRequester(requesterInput)
  if (!requesterParsed.ok) return requestRefused(null, requesterParsed.reason)
  if (requesterParsed.requester.scope !== releaseRecord.publicScope) {
    return requestRefused(null, 'REQUESTER_SCOPE_MISMATCH')
  }

  const requestParsed = parseRequestInput(input, releaseRecord, requesterParsed.requester)
  if (!requestParsed.ok) return requestRefused(requestParsed.requestId, requestParsed.reason)
  const request = requestParsed.request

  const authorityReason = requesterAuthorityFailure(releaseRecord, request)
  if (authorityReason !== null) return requestRefused(request.requestId, authorityReason)

  const ledgerParsed = parseLedger(existingInput)
  if (!ledgerParsed.ok) return requestRefused(request.requestId, ledgerParsed.reason)
  const existing = ledgerParsed.requests

  if (existing.some((entry) => entry.requestId === request.requestId)) {
    return requestRefused(request.requestId, 'REQUEST_ID_REPLAY')
  }
  if (duplicateRequest(existing, releaseRecord, request.kind, request.targetRequestId)) {
    return requestRefused(request.requestId, 'DUPLICATE_REQUEST')
  }

  if (request.kind === 'APPEAL') {
    const byId = new Map(existing.map((entry) => [entry.requestId, entry] as const))
    const appealReason = appealTargetFailure(request, byId)
    if (appealReason !== null) return requestRefused(request.requestId, appealReason)
    const target = request.targetRequestId === null ? undefined : byId.get(request.targetRequestId)
    if (target && (target.decidedBy === requesterParsed.requester.principalRef)) {
      return requestRefused(request.requestId, 'APPEAL_SELF_REVIEW')
    }
  }

  return Object.freeze({ accepted: true, request })
}

/**
 * Move a `SUBMITTED` request to `UNDER_REVIEW`.
 *
 * A named reviewer or governance actor other than the requester must start the
 * review. A request that is already under review or already decided is refused
 * so a caller cannot replay the transition. The passed request must be the
 * exact record the ledger stores; a stale or divergent copy is a replay.
 */
export function beginWithdrawalReview(
  requestInputRaw: unknown,
  actorInput: unknown,
  existingInput: unknown = [],
): WithdrawalRequestResult {
  const requestParsed = parseRequest(requestInputRaw)
  if (!requestParsed.ok) return requestRefused(requestParsed.requestId, requestParsed.reason)
  const request = requestParsed.request
  if (request.state === 'UNDER_REVIEW') return requestRefused(request.requestId, 'REQUEST_ALREADY_IN_REVIEW')
  if (request.state === 'ACCEPTED' || request.state === 'REJECTED') {
    return requestRefused(request.requestId, 'REQUEST_ALREADY_DECIDED')
  }

  const actorParsed = parseActor(actorInput)
  if (!actorParsed.ok) return requestRefused(request.requestId, actorParsed.reason)
  const rolesReason = actorRolesFailure(actorParsed.roles, request.kind === 'APPEAL')
  if (rolesReason !== null) return requestRefused(request.requestId, rolesReason)
  if (actorParsed.principalRef === request.requestedBy) {
    return requestRefused(
      request.requestId,
      request.kind === 'APPEAL' ? 'APPEAL_SELF_REVIEW' : 'SELF_REVIEW_FORBIDDEN',
    )
  }

  const ledgerParsed = parseLedger(existingInput)
  if (!ledgerParsed.ok) return requestRefused(request.requestId, ledgerParsed.reason)
  const recordedReason = recordedRequestFailure(ledgerParsed.requests, request)
  if (recordedReason !== null) return requestRefused(request.requestId, recordedReason)
  if (request.kind === 'APPEAL') {
    const byId = new Map(ledgerParsed.requests.map((entry) => [entry.requestId, entry] as const))
    const appealReason = appealTargetFailure(request, byId)
    if (appealReason !== null) return requestRefused(request.requestId, appealReason)
    const target = request.targetRequestId === null ? undefined : byId.get(request.targetRequestId)
    if (target && target.decidedBy === actorParsed.principalRef) {
      return requestRefused(request.requestId, 'APPEAL_SELF_REVIEW')
    }
  }

  return Object.freeze({
    accepted: true,
    request: deepFreeze({ ...request, state: 'UNDER_REVIEW' as const }),
  })
}

/**
 * Record a reviewer decision on an `UNDER_REVIEW` request.
 *
 * The actor must hold REVIEWER or GOVERNANCE and must not be the requester; an
 * appeal additionally requires REVIEWER and a decider different from the
 * original takedown reviewer. Every decision records a stable reason code and
 * an ISO-8601 decision instant. A withdrawal cannot be rejected: M03-06 gives
 * the rights holder the right to withdraw at any time. An accepted appeal must
 * use a reinstatement reason code and must be decided after its takedown. The
 * passed request must be the exact record the ledger stores.
 */
export function decideWithdrawalRequest(
  requestInputRaw: unknown,
  actorInput: unknown,
  decisionInput: unknown,
  existingInput: unknown = [],
): WithdrawalRequestResult {
  const requestParsed = parseRequest(requestInputRaw)
  if (!requestParsed.ok) return requestRefused(requestParsed.requestId, requestParsed.reason)
  const request = requestParsed.request
  if (request.state === 'ACCEPTED' || request.state === 'REJECTED') {
    return requestRefused(request.requestId, 'REQUEST_ALREADY_DECIDED')
  }
  if (request.state === 'SUBMITTED') return requestRefused(request.requestId, 'REQUEST_NOT_UNDER_REVIEW')

  const actorParsed = parseActor(actorInput)
  if (!actorParsed.ok) return requestRefused(request.requestId, actorParsed.reason)
  const rolesReason = actorRolesFailure(actorParsed.roles, request.kind === 'APPEAL')
  if (rolesReason !== null) return requestRefused(request.requestId, rolesReason)
  if (actorParsed.principalRef === request.requestedBy) {
    return requestRefused(
      request.requestId,
      request.kind === 'APPEAL' ? 'APPEAL_SELF_REVIEW' : 'SELF_REVIEW_FORBIDDEN',
    )
  }

  const ledgerParsed = parseLedger(existingInput)
  if (!ledgerParsed.ok) return requestRefused(request.requestId, ledgerParsed.reason)
  const recordedReason = recordedRequestFailure(ledgerParsed.requests, request)
  if (recordedReason !== null) return requestRefused(request.requestId, recordedReason)
  const byId = new Map(ledgerParsed.requests.map((entry) => [entry.requestId, entry] as const))
  if (request.kind === 'APPEAL') {
    const appealReason = appealTargetFailure(request, byId)
    if (appealReason !== null) return requestRefused(request.requestId, appealReason)
    const target = request.targetRequestId === null ? undefined : byId.get(request.targetRequestId)
    if (target && target.decidedBy === actorParsed.principalRef) {
      return requestRefused(request.requestId, 'APPEAL_SELF_REVIEW')
    }
  }

  if (!isRecord(decisionInput)) return requestRefused(request.requestId, 'DECISION_INVALID')
  if (!isKnown(DECISION_ACTIONS, decisionInput.action)) {
    return requestRefused(request.requestId, 'DECISION_INVALID')
  }
  const decidedAt = isNonEmptyString(decisionInput.decidedAt) ? decisionInput.decidedAt : null
  if (decidedAt === null) return requestRefused(request.requestId, 'REQUEST_TIMESTAMP_INVALID')
  const decidedAtMs = parseTimestamp(decidedAt)
  if (decidedAtMs === null) return requestRefused(request.requestId, 'REQUEST_TIMESTAMP_INVALID')
  if (decidedAtMs < Date.parse(request.submittedAt)) {
    return requestRefused(request.requestId, 'REQUEST_TIMESTAMP_INVALID')
  }
  if (decisionInput.reasonCode === undefined || decisionInput.reasonCode === null) {
    return requestRefused(request.requestId, 'DECISION_REASON_MISSING')
  }
  if (!isKnown(DECISION_REASON_CODES, decisionInput.reasonCode)) {
    return requestRefused(request.requestId, 'DECISION_REASON_UNKNOWN')
  }
  if (request.kind === 'WITHDRAWAL' && decisionInput.action === 'REJECT') {
    return requestRefused(request.requestId, 'WITHDRAWAL_IS_A_RIGHT')
  }
  if (
    request.kind === 'APPEAL' &&
    decisionInput.action === 'ACCEPT' &&
    !REINSTATEMENT_REASON_CODES.includes(decisionInput.reasonCode)
  ) {
    return requestRefused(request.requestId, 'REINSTATEMENT_REASON_MISSING')
  }
  if (request.kind === 'APPEAL' && decisionInput.action === 'ACCEPT') {
    const target = request.targetRequestId === null ? undefined : byId.get(request.targetRequestId)
    if (!target || target.decidedAt === null) {
      return requestRefused(request.requestId, 'APPEAL_TARGET_INVALID')
    }
    if (decidedAtMs <= Date.parse(target.decidedAt)) {
      return requestRefused(request.requestId, 'APPEAL_BEFORE_TAKEDOWN')
    }
  }

  return Object.freeze({
    accepted: true,
    request: deepFreeze({
      ...request,
      state: decisionInput.action === 'ACCEPT' ? ('ACCEPTED' as const) : ('REJECTED' as const),
      decidedBy: actorParsed.principalRef,
      decidedByRole: recordedRole(actorParsed.roles),
      decidedAt,
      reasonCode: decisionInput.reasonCode,
    }),
  })
}

/**
 * Apply an accepted WITHDRAWAL or CORRECTION to the release record.
 *
 * WITHDRAWAL moves the release to `WITHDRAWN`; CORRECTION moves it to
 * `CORRECTED` (the superseded version is no longer available and the corrected
 * version needs its own approved release). TAKEDOWN and APPEAL do not mutate
 * the release record: quarantine is reversible and is evaluated from the
 * request ledger by `evaluatePublicAvailability`. The passed request must be
 * the exact accepted record the ledger stores.
 */
export function applyAcceptedRequest(
  release: unknown,
  requestInputRaw: unknown,
  existingInput: unknown = [],
): ReleaseApplicationResult {
  const releaseParsed = parseRelease(release)
  if (!releaseParsed.ok) return applicationRefused(releaseParsed.releaseId, releaseParsed.reason)
  const releaseRecord = releaseParsed.release
  if (releaseRecord.state === 'WITHDRAWN') return applicationRefused(releaseRecord.releaseId, 'RELEASE_WITHDRAWN')
  if (releaseRecord.state === 'CORRECTED') return applicationRefused(releaseRecord.releaseId, 'RELEASE_CORRECTED')
  const referenceReason = referenceFailure(releaseRecord)
  if (referenceReason !== null) return applicationRefused(releaseRecord.releaseId, referenceReason)

  const requestParsed = parseRequest(requestInputRaw)
  if (!requestParsed.ok) return applicationRefused(releaseRecord.releaseId, requestParsed.reason)
  const request = requestParsed.request
  if (request.releaseId !== releaseRecord.releaseId) {
    return applicationRefused(releaseRecord.releaseId, 'REQUEST_RELEASE_MISMATCH')
  }
  if (request.state !== 'ACCEPTED') return applicationRefused(releaseRecord.releaseId, 'REQUEST_NOT_ACCEPTED')
  if (request.kind !== 'WITHDRAWAL' && request.kind !== 'CORRECTION') {
    return applicationRefused(releaseRecord.releaseId, 'REQUEST_KIND_NOT_APPLICABLE')
  }

  const authorityReason = requesterAuthorityFailure(releaseRecord, request)
  if (authorityReason !== null) return applicationRefused(releaseRecord.releaseId, authorityReason)
  const decisionReason = decisionShapeFailure(request)
  if (decisionReason !== null) return applicationRefused(releaseRecord.releaseId, decisionReason)

  const ledgerParsed = parseLedger(existingInput)
  if (!ledgerParsed.ok) return applicationRefused(releaseRecord.releaseId, ledgerParsed.reason)
  const recordedReason = recordedRequestFailure(ledgerParsed.requests, request)
  if (recordedReason !== null) return applicationRefused(releaseRecord.releaseId, recordedReason)

  const nextState: ReleasePublicationState = request.kind === 'WITHDRAWAL' ? 'WITHDRAWN' : 'CORRECTED'
  return Object.freeze({
    applied: true,
    release: deepFreeze({ ...releaseRecord, state: nextState }),
  })
}

/**
 * Decide whether a release may be publicly available.
 *
 * Fixed order:
 *   1. release shape, known state, exact `public` scope;
 *   2. a `WITHDRAWN` or `CORRECTED` release is always unavailable;
 *   3. rights and consent references exist and cover `public`;
 *   4. the request ledger is well formed, single-id and bound to this release;
 *   5. every non-rejected request has an authorized requester, and every
 *      decided request has an independent decider with a recorded reason;
 *   6. any pending withdrawal/correction/takedown blocks availability;
 *   7. an accepted withdrawal or correction blocks availability permanently;
 *   8. an accepted takedown blocks availability unless an accepted, independent,
 *      later appeal with a reinstatement reason code overturned that exact
 *      takedown;
 *   9. otherwise the release may be served.
 *
 * A refusal has no request, revision or content field at all.
 */
export function evaluatePublicAvailability(
  release: unknown,
  requestsInput: unknown,
): PublicAvailability {
  const releaseParsed = parseRelease(release)
  if (!releaseParsed.ok) return unavailable(releaseParsed.releaseId, releaseParsed.reason)
  const releaseRecord = releaseParsed.release
  if (releaseRecord.state === 'WITHDRAWN') return unavailable(releaseRecord.releaseId, 'RELEASE_WITHDRAWN')
  if (releaseRecord.state === 'CORRECTED') return unavailable(releaseRecord.releaseId, 'RELEASE_CORRECTED')
  const referenceReason = referenceFailure(releaseRecord)
  if (referenceReason !== null) return unavailable(releaseRecord.releaseId, referenceReason)

  const ledgerParsed = parseLedger(requestsInput)
  if (!ledgerParsed.ok) return unavailable(releaseRecord.releaseId, ledgerParsed.reason)
  const requests = ledgerParsed.requests
  if (requests.some((entry) => entry.releaseId !== releaseRecord.releaseId)) {
    return unavailable(releaseRecord.releaseId, 'REQUEST_RELEASE_MISMATCH')
  }

  const byId = new Map(requests.map((entry) => [entry.requestId, entry] as const))
  for (const request of requests) {
    // A rejected request is terminal and has no effect; it cannot block a
    // release merely because its historical requester is no longer bound.
    if (request.state === 'REJECTED') continue
    const authorityReason = requesterAuthorityFailure(releaseRecord, request)
    if (authorityReason !== null) return unavailable(releaseRecord.releaseId, authorityReason)
    const decisionReason = decisionShapeFailure(request)
    if (decisionReason !== null) return unavailable(releaseRecord.releaseId, decisionReason)
    if (request.kind === 'APPEAL') {
      const appealReason = appealTargetFailure(request, byId)
      if (appealReason !== null) return unavailable(releaseRecord.releaseId, appealReason)
    }
  }

  const pendingBlocking = requests.find(
    (entry) =>
      (entry.state === 'SUBMITTED' || entry.state === 'UNDER_REVIEW') && entry.kind !== 'APPEAL',
  )
  if (pendingBlocking) return unavailable(releaseRecord.releaseId, 'REQUEST_PENDING')

  const acceptedWithdrawal = requests.find(
    (entry) => entry.kind === 'WITHDRAWAL' && entry.state === 'ACCEPTED',
  )
  if (acceptedWithdrawal) return unavailable(releaseRecord.releaseId, 'RELEASE_WITHDRAWN')

  const acceptedCorrection = requests.find(
    (entry) => entry.kind === 'CORRECTION' && entry.state === 'ACCEPTED',
  )
  if (acceptedCorrection) return unavailable(releaseRecord.releaseId, 'RELEASE_CORRECTED')

  const reinstated = new Set<string>()
  for (const request of requests) {
    if (request.kind !== 'APPEAL' || request.state !== 'ACCEPTED') continue
    if (request.targetRequestId !== null) reinstated.add(request.targetRequestId)
  }
  const unresolvedTakedown = requests.find(
    (entry) => entry.kind === 'TAKEDOWN' && entry.state === 'ACCEPTED' && !reinstated.has(entry.requestId),
  )
  if (unresolvedTakedown) return unavailable(releaseRecord.releaseId, 'RELEASE_TAKEDOWN')

  return Object.freeze({
    available: true,
    releaseId: releaseRecord.releaseId,
    rightsReference: releaseRecord.rightsReference as string,
    consentReference: releaseRecord.consentReference as string,
    policyVersion: WITHDRAWAL_POLICY_VERSION,
  })
}
