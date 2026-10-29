/**
 * M18-08 D08 release decision boundary.
 *
 * Implements the decision half of the release authority accepted by
 * [ADR-0013](docs/decisions/ADR-0013-d08-release-authority.md): a verified
 * human reviewer may mark one exact content revision eligible within one exact
 * scope, using opaque references to D01/D05/D06/D07 evidence that this module
 * never owns, copies or returns. `readDecision` re-checks the same references,
 * the exact revision binding, the reviewer grant and the M18-04 withdrawal
 * state on every read.
 *
 * Deliberately pure apart from `node:crypto`: no database, HTTP, route,
 * environment lookup or wall clock. Time, identity, grants, evidence,
 * withdrawal state and integrity records are caller-supplied snapshots that a
 * future authorized store would load; this module decides over them and fails
 * closed.
 *
 * Boundaries kept by construction:
 *   - the decision state is always `APPROVED_WITHIN_SCOPE`, never `PUBLISHED`;
 *   - `activation` is always `DISABLED`, so a decision cannot publish anything;
 *   - the M18-03 manifest hash is integrity evidence only and is never treated
 *     as approval;
 *   - refusals carry an opaque request/release id and a stable reason only.
 *
 * See docs/audit/M18-08-d08-release-decision.md for evidence and non-claims.
 */

import { createHash } from 'node:crypto'

export const GOVERNANCE_POLICY_VERSION = '1.0.0'

export const RELEASE_DECISION_SCHEMA_VERSION = '1.0.0'

export const RELEASE_DECISION_KIND = 'moonwitness.release-decision'

/** Only usage scope this contract can decide; mirrors the M18-03 public scope. */
export const DECIDABLE_RELEASE_SCOPE = 'public'

export const RELEASE_DOMAINS = ['D05_RESEARCH', 'D06_WITNESS', 'D07_STORY'] as const

export type ReleaseDomain = (typeof RELEASE_DOMAINS)[number]

/**
 * Content classification. Only `UNCLASSIFIED` is decidable under the ratified
 * conservative position; `RESTRICTED` and unknown classes stay withheld until
 * the D08/privacy owners ratify a taxonomy and quorum.
 */
export const RELEASE_CLASSIFICATIONS = ['UNCLASSIFIED', 'RESTRICTED', 'UNKNOWN'] as const

export type ReleaseClassification = (typeof RELEASE_CLASSIFICATIONS)[number]

/** Mirrors the M18-03 content vocabulary without importing its module. */
export const DECISION_CONTENT_TYPES = ['TEXT', 'TESTIMONY', 'STORY'] as const

export type DecisionContentType = (typeof DECISION_CONTENT_TYPES)[number]

/** D12 mandate label. It is not a D00 role and grants nothing by itself. */
export const REVIEWER_ROLES = ['RELEASE_REVIEWER'] as const

export type ReviewerRole = (typeof REVIEWER_ROLES)[number]

export const PRINCIPAL_KINDS = ['HUMAN', 'MACHINE'] as const

export type PrincipalKind = (typeof PRINCIPAL_KINDS)[number]

export const EVIDENCE_KINDS = ['RIGHTS', 'CONSENT', 'SOURCE', 'REVIEW'] as const

export type EvidenceKind = (typeof EVIDENCE_KINDS)[number]

export const EVIDENCE_STATES = ['CLEARED', 'PENDING', 'WITHDRAWN', 'CONFLICTING', 'UNVERIFIED'] as const

export type EvidenceState = (typeof EVIDENCE_STATES)[number]

/** M18-04 release state for the exact release revision. */
export const WITHDRAWAL_STATES = ['NONE', 'PENDING', 'WITHDRAWN', 'CORRECTED', 'TAKEDOWN', 'UNKNOWN'] as const

export type WithdrawalState = (typeof WITHDRAWAL_STATES)[number]

/** No lifecycle state beyond approval-within-scope is producible here. */
export const DECISION_STATE = 'APPROVED_WITHIN_SCOPE'

/** Ratified: activation stays off until an authorized writer is implemented. */
export const ACTIVATION_STATE = 'DISABLED'

/** Reviewer identity derived from a verified D00 session, never a caller string. */
export interface VerifiedActor {
  readonly principalRef: string
  readonly kind: PrincipalKind
  readonly verifiedAt: string
  /** Opaque D00 verification/session reference. */
  readonly verificationRef: string
}

/** A D12 reviewer grant bound to one D00 principal. */
export interface ReviewerGrant {
  readonly grantRef: string
  readonly principalRef: string
  readonly role: ReviewerRole
  readonly domains: readonly ReleaseDomain[]
  readonly scopes: readonly string[]
  readonly grantedAt: string
  readonly expiresAt: string | null
  readonly revokedAt: string | null
}

/**
 * Caller-loaded, exact-version evidence snapshot. D08 neither owns nor copies
 * the underlying record; only these opaque facts are evaluated.
 */
export interface EvidenceSnapshot {
  readonly ref: string
  readonly kind: EvidenceKind
  readonly domain: ReleaseDomain
  readonly recordId: string
  readonly revisionId: string
  readonly contentDigest: string
  readonly scope: string | null
  readonly state: EvidenceState
  /** Opaque principal refs with authority over this evidence (self-review check). */
  readonly ownerRefs: readonly string[]
  readonly expiresAt: string | null
  readonly updatedAt: string
}

/** M18-04 state for the exact release/revision, as loaded by the caller. */
export interface WithdrawalSnapshot {
  readonly releaseId: string
  readonly revisionId: string
  readonly state: WithdrawalState
  readonly decidedAt: string | null
}

/** M18-03 integrity record. A matching hash is integrity evidence, not approval. */
export interface ReleaseIntegrity {
  readonly manifestHash: string
  readonly releaseRef: string
  readonly releaseVersion: number
  readonly recordId: string
  readonly revisionId: string
  readonly contentDigest: string
}

/** Ratified per-domain projection allowlist. Absent entries deny by default. */
export interface ProjectionAllowlist {
  readonly domain: ReleaseDomain
  readonly scope: string
  readonly fields: readonly string[]
}

export interface DecisionContext {
  /** Caller-supplied instant; the module never reads a clock. */
  readonly now: string
  readonly actor: VerifiedActor
  /** Verified D00/D12 grants. An empty list grants no reviewer authority. */
  readonly grants: readonly ReviewerGrant[]
  readonly evidence: readonly EvidenceSnapshot[]
  readonly withdrawal: WithdrawalSnapshot
  readonly integrity: ReleaseIntegrity
  readonly allowlist: ProjectionAllowlist
  /** Decisions already issued, used only to refuse replay. */
  readonly priorDecisions: readonly unknown[]
}

/** A request to approve one exact revision for one exact scope. */
export interface ReleaseDecisionRequest {
  readonly requestId: string
  readonly releaseId: string
  readonly domain: ReleaseDomain
  readonly recordId: string
  readonly revisionId: string
  readonly contentDigest: string
  readonly contentType: DecisionContentType
  readonly scope: string
  readonly classification: ReleaseClassification
  readonly fields: readonly string[]
  readonly rightsRef: string
  readonly consentRef: string
  readonly sourceRef: string
  readonly reviewRef: string
  readonly manifestHash: string
  readonly submittedBy: string
  readonly conflictPrincipalRefs: readonly string[]
  readonly requestedAt: string
}

export type ReleaseDecisionRefusal =
  // request/context shape
  | 'REQUEST_INVALID'
  | 'REQUEST_UNKNOWN_FIELD'
  | 'REQUEST_FIELD_MISSING'
  | 'REQUEST_FIELD_INVALID'
  | 'REQUEST_TIMESTAMP_INVALID'
  | 'CONTEXT_INVALID'
  | 'CONTEXT_UNKNOWN_FIELD'
  | 'CONTEXT_TIME_INVALID'
  // exact revision, scope, classification and integrity
  | 'DOMAIN_UNKNOWN'
  | 'CONTENT_TYPE_UNKNOWN'
  | 'CONTENT_DIGEST_INVALID'
  | 'SCOPE_INVALID'
  | 'SCOPE_MISMATCH'
  | 'CLASSIFICATION_INVALID'
  | 'CLASSIFICATION_RESTRICTED'
  | 'CLASSIFICATION_UNKNOWN'
  | 'INTEGRITY_MISMATCH'
  // reviewer identity and authority
  | 'IDENTITY_UNVERIFIED'
  | 'ACTOR_NOT_HUMAN'
  | 'REVIEWER_NOT_GRANTED'
  | 'REVIEWER_GRANT_REVOKED'
  | 'REVIEWER_GRANT_EXPIRED'
  | 'REVIEWER_SCOPE_MISMATCH'
  | 'SELF_REVIEW'
  | 'REVIEWER_CONFLICT'
  // evidence
  | 'EVIDENCE_MISSING'
  | 'EVIDENCE_AMBIGUOUS'
  | 'EVIDENCE_KIND_MISMATCH'
  | 'EVIDENCE_STALE'
  | 'EVIDENCE_SCOPE_MISMATCH'
  | 'EVIDENCE_PENDING'
  | 'EVIDENCE_WITHDRAWN'
  | 'EVIDENCE_CONFLICTING'
  | 'EVIDENCE_UNVERIFIABLE'
  | 'RIGHTS_MISSING'
  | 'RIGHTS_WITHDRAWN'
  | 'RIGHTS_SCOPE_MISMATCH'
  | 'CONSENT_MISSING'
  | 'CONSENT_WITHDRAWN'
  | 'CONSENT_SCOPE_MISMATCH'
  | 'CONSENT_EXPIRED'
  // withdrawal and replay
  | 'WITHDRAWAL_PENDING'
  | 'RELEASE_WITHDRAWN'
  | 'RELEASE_CORRECTED'
  | 'RELEASE_TAKEDOWN'
  | 'RELEASE_STATE_UNKNOWN'
  | 'REPLAY'
  // projection fields
  | 'FIELDS_INVALID'
  | 'FIELD_NOT_ALLOWLISTED'
  // read-time decision integrity
  | 'DECISION_INVALID'
  | 'DECISION_UNKNOWN_FIELD'
  | 'DECISION_TAMPERED'

export interface DecisionEvidenceRefs {
  readonly rights: string
  readonly consent: string
  readonly source: string
  readonly review: string
}

/** Sealed decision. Contains opaque references and ids only, never content. */
export interface ReleaseDecision {
  readonly schemaVersion: typeof RELEASE_DECISION_SCHEMA_VERSION
  readonly kind: typeof RELEASE_DECISION_KIND
  readonly policyVersion: typeof GOVERNANCE_POLICY_VERSION
  readonly requestId: string
  readonly releaseId: string
  readonly domain: ReleaseDomain
  readonly recordId: string
  readonly revisionId: string
  readonly contentDigest: string
  readonly contentType: DecisionContentType
  readonly scope: string
  readonly classification: ReleaseClassification
  readonly fields: readonly string[]
  readonly reviewerRef: string
  readonly evidenceRefs: DecisionEvidenceRefs
  readonly manifestHash: string
  readonly state: typeof DECISION_STATE
  readonly activation: typeof ACTIVATION_STATE
  readonly decidedAt: string
  /** sha256 over the decision content, excluding this field. */
  readonly decisionHash: string
}

export interface RefusedReleaseDecision {
  readonly approved: false
  readonly requestId: string | null
  readonly releaseId: string | null
  readonly reason: ReleaseDecisionRefusal
}

export interface ApprovedReleaseDecision {
  readonly approved: true
  readonly decision: ReleaseDecision
}

export type ReleaseDecisionResult = ApprovedReleaseDecision | RefusedReleaseDecision

export interface AvailableReleaseDecision {
  readonly available: true
  readonly activation: typeof ACTIVATION_STATE
  readonly releaseId: string
  readonly revisionId: string
  readonly contentDigest: string
  readonly contentType: DecisionContentType
  readonly scope: string
  readonly fields: readonly string[]
  readonly decisionHash: string
}

export interface UnavailableReleaseDecision {
  readonly available: false
  readonly releaseId: string | null
  readonly reason: ReleaseDecisionRefusal
}

export type ReleaseDecisionRead = AvailableReleaseDecision | UnavailableReleaseDecision

type UnknownRecord = Record<string, unknown>

const REQUEST_KEYS: readonly string[] = [
  'requestId',
  'releaseId',
  'domain',
  'recordId',
  'revisionId',
  'contentDigest',
  'contentType',
  'scope',
  'classification',
  'fields',
  'rightsRef',
  'consentRef',
  'sourceRef',
  'reviewRef',
  'manifestHash',
  'submittedBy',
  'conflictPrincipalRefs',
  'requestedAt',
]

const CONTEXT_KEYS: readonly string[] = [
  'now',
  'actor',
  'grants',
  'evidence',
  'withdrawal',
  'integrity',
  'allowlist',
  'priorDecisions',
]

const ACTOR_KEYS: readonly string[] = ['principalRef', 'kind', 'verifiedAt', 'verificationRef']
const GRANT_KEYS: readonly string[] = [
  'grantRef',
  'principalRef',
  'role',
  'domains',
  'scopes',
  'grantedAt',
  'expiresAt',
  'revokedAt',
]
const EVIDENCE_KEYS: readonly string[] = [
  'ref',
  'kind',
  'domain',
  'recordId',
  'revisionId',
  'contentDigest',
  'scope',
  'state',
  'ownerRefs',
  'expiresAt',
  'updatedAt',
]
const WITHDRAWAL_KEYS: readonly string[] = ['releaseId', 'revisionId', 'state', 'decidedAt']
const INTEGRITY_KEYS: readonly string[] = [
  'manifestHash',
  'releaseRef',
  'releaseVersion',
  'recordId',
  'revisionId',
  'contentDigest',
]
const ALLOWLIST_KEYS: readonly string[] = ['domain', 'scope', 'fields']

const DECISION_KEYS: readonly string[] = [
  'schemaVersion',
  'kind',
  'policyVersion',
  'requestId',
  'releaseId',
  'domain',
  'recordId',
  'revisionId',
  'contentDigest',
  'contentType',
  'scope',
  'classification',
  'fields',
  'reviewerRef',
  'evidenceRefs',
  'manifestHash',
  'state',
  'activation',
  'decidedAt',
  'decisionHash',
]

const EVIDENCE_REF_KEYS: readonly string[] = ['rights', 'consent', 'source', 'review']

const EVIDENCE_REASONS: Record<
  EvidenceKind,
  { readonly missing: ReleaseDecisionRefusal; readonly withdrawn: ReleaseDecisionRefusal; readonly scope: ReleaseDecisionRefusal }
> = {
  RIGHTS: {
    missing: 'RIGHTS_MISSING',
    withdrawn: 'RIGHTS_WITHDRAWN',
    scope: 'RIGHTS_SCOPE_MISMATCH',
  },
  CONSENT: {
    missing: 'CONSENT_MISSING',
    withdrawn: 'CONSENT_WITHDRAWN',
    scope: 'CONSENT_SCOPE_MISMATCH',
  },
  SOURCE: {
    missing: 'EVIDENCE_MISSING',
    withdrawn: 'EVIDENCE_WITHDRAWN',
    scope: 'EVIDENCE_SCOPE_MISMATCH',
  },
  REVIEW: {
    missing: 'EVIDENCE_MISSING',
    withdrawn: 'EVIDENCE_WITHDRAWN',
    scope: 'EVIDENCE_SCOPE_MISMATCH',
  },
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

function isNonEmptyStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.length > 0 && value.every((entry) => isNonEmptyString(entry))
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value)
}

function isKnown<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value)
}

function hasUnknownKey(raw: UnknownRecord, keys: readonly string[]): boolean {
  return Object.keys(raw).some((key) => !keys.includes(key))
}

function textCompare(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

/** Canonical JSON: sorted keys, stable order, undefined rejected. */
function canonicalJson(value: unknown): string {
  if (value === undefined) throw new TypeError('decision contains an undefined value')
  if (value === null || typeof value === 'boolean' || typeof value === 'number') {
    return JSON.stringify(value)
  }
  if (typeof value === 'string') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`
  if (isRecord(value)) {
    const keys = Object.keys(value).sort(textCompare)
    const members = keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    return `{${members.join(',')}}`
  }
  throw new TypeError('decision contains a non-canonical value')
}

function sha256Of(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex')}`
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  Object.freeze(value)
  for (const nested of Object.values(value as UnknownRecord)) deepFreeze(nested)
  return value
}

function refused(request: unknown, reason: ReleaseDecisionRefusal): RefusedReleaseDecision {
  const record = isRecord(request) ? request : {}
  return Object.freeze({
    approved: false,
    requestId: isNonEmptyString(record.requestId) ? record.requestId : null,
    releaseId: isNonEmptyString(record.releaseId) ? record.releaseId : null,
    reason,
  })
}

function unavailable(releaseId: unknown, reason: ReleaseDecisionRefusal): UnavailableReleaseDecision {
  return Object.freeze({
    available: false,
    releaseId: isNonEmptyString(releaseId) ? releaseId : null,
    reason,
  })
}

interface Binding {
  readonly domain: ReleaseDomain
  readonly recordId: string
  readonly revisionId: string
  readonly contentDigest: string
  readonly scope: string
}

function checkWithdrawal(withdrawal: WithdrawalSnapshot, binding: Binding): ReleaseDecisionRefusal | null {
  if (withdrawal.releaseId !== binding.recordId || withdrawal.revisionId !== binding.revisionId) {
    return 'RELEASE_STATE_UNKNOWN'
  }
  switch (withdrawal.state) {
    case 'NONE':
      return null
    case 'PENDING':
      return 'WITHDRAWAL_PENDING'
    case 'WITHDRAWN':
      return 'RELEASE_WITHDRAWN'
    case 'CORRECTED':
      return 'RELEASE_CORRECTED'
    case 'TAKEDOWN':
      return 'RELEASE_TAKEDOWN'
    default:
      return 'RELEASE_STATE_UNKNOWN'
  }
}

interface EvidenceCheck {
  readonly ok: true
  readonly evidence: EvidenceSnapshot
}

interface EvidenceRefusal {
  readonly ok: false
  readonly reason: ReleaseDecisionRefusal
}

function checkEvidence(
  ref: string,
  kind: EvidenceKind,
  binding: Binding,
  evidence: readonly EvidenceSnapshot[],
  nowMs: number,
): EvidenceCheck | EvidenceRefusal {
  const reasons = EVIDENCE_REASONS[kind]
  const matches = evidence.filter((entry) => entry.ref === ref)
  if (matches.length === 0) return { ok: false, reason: reasons.missing }
  if (matches.length > 1) return { ok: false, reason: 'EVIDENCE_AMBIGUOUS' }
  const entry = matches[0] as EvidenceSnapshot
  if (entry.kind !== kind) return { ok: false, reason: 'EVIDENCE_KIND_MISMATCH' }
  if (
    entry.domain !== binding.domain ||
    entry.recordId !== binding.recordId ||
    entry.revisionId !== binding.revisionId ||
    entry.contentDigest !== binding.contentDigest
  ) {
    return { ok: false, reason: 'EVIDENCE_STALE' }
  }
  if (entry.scope !== binding.scope) return { ok: false, reason: reasons.scope }
  switch (entry.state) {
    case 'CLEARED':
      break
    case 'WITHDRAWN':
      return { ok: false, reason: reasons.withdrawn }
    case 'PENDING':
      return { ok: false, reason: 'EVIDENCE_PENDING' }
    case 'CONFLICTING':
      return { ok: false, reason: 'EVIDENCE_CONFLICTING' }
    default:
      return { ok: false, reason: 'EVIDENCE_UNVERIFIABLE' }
  }
  if (kind === 'CONSENT') {
    if (entry.expiresAt === null) return { ok: false, reason: 'CONSENT_MISSING' }
    if (Date.parse(entry.expiresAt) <= nowMs) return { ok: false, reason: 'CONSENT_EXPIRED' }
  }
  return { ok: true, evidence: entry }
}

type GrantCheck = { readonly ok: true; readonly grant: ReviewerGrant } | { readonly ok: false; readonly reason: ReleaseDecisionRefusal }

function checkGrant(
  principalRef: string,
  binding: Binding,
  grants: readonly ReviewerGrant[],
  nowMs: number,
): GrantCheck {
  const candidates = grants.filter(
    (grant) => grant.principalRef === principalRef && grant.role === 'RELEASE_REVIEWER',
  )
  if (candidates.length === 0) return { ok: false, reason: 'REVIEWER_NOT_GRANTED' }
  const revoked = candidates.some((grant) => grant.revokedAt !== null)
  const live = candidates.filter((grant) => grant.revokedAt === null)
  if (live.length === 0) return { ok: false, reason: revoked ? 'REVIEWER_GRANT_REVOKED' : 'REVIEWER_NOT_GRANTED' }
  const unexpired = live.filter((grant) => grant.expiresAt === null || Date.parse(grant.expiresAt) > nowMs)
  if (unexpired.length === 0) return { ok: false, reason: 'REVIEWER_GRANT_EXPIRED' }
  const scoped = unexpired.filter(
    (grant) => grant.domains.includes(binding.domain) && grant.scopes.includes(binding.scope),
  )
  if (scoped.length === 0) return { ok: false, reason: 'REVIEWER_SCOPE_MISMATCH' }
  return { ok: true, grant: scoped[0] as ReviewerGrant }
}

type ContextCheck = { readonly ok: true; readonly context: DecisionContext } | { readonly ok: false; readonly reason: ReleaseDecisionRefusal }

function checkActor(raw: unknown, nowMs: number): ReleaseDecisionRefusal | null {
  if (!isRecord(raw)) return 'IDENTITY_UNVERIFIED'
  if (hasUnknownKey(raw, ACTOR_KEYS)) return 'CONTEXT_UNKNOWN_FIELD'
  if (!isNonEmptyString(raw.principalRef)) return 'IDENTITY_UNVERIFIED'
  if (!isKnown(PRINCIPAL_KINDS, raw.kind)) return 'IDENTITY_UNVERIFIED'
  if (raw.kind === 'MACHINE') return 'ACTOR_NOT_HUMAN'
  if (!isIsoTimestamp(raw.verifiedAt)) return 'IDENTITY_UNVERIFIED'
  if (Date.parse(raw.verifiedAt) > nowMs) return 'IDENTITY_UNVERIFIED'
  if (!isNonEmptyString(raw.verificationRef)) return 'IDENTITY_UNVERIFIED'
  return null
}

function checkGrants(raw: unknown): ReleaseDecisionRefusal | null {
  if (!Array.isArray(raw)) return 'CONTEXT_INVALID'
  for (const grant of raw) {
    if (!isRecord(grant)) return 'CONTEXT_INVALID'
    if (hasUnknownKey(grant, GRANT_KEYS)) return 'CONTEXT_UNKNOWN_FIELD'
    if (!isNonEmptyString(grant.grantRef)) return 'CONTEXT_INVALID'
    if (!isNonEmptyString(grant.principalRef)) return 'CONTEXT_INVALID'
    if (!isKnown(REVIEWER_ROLES, grant.role)) return 'CONTEXT_INVALID'
    if (!isStringArray(grant.domains)) return 'CONTEXT_INVALID'
    if (!grant.domains.every((domain) => isKnown(RELEASE_DOMAINS, domain))) return 'CONTEXT_INVALID'
    if (!isStringArray(grant.scopes)) return 'CONTEXT_INVALID'
    if (!isIsoTimestamp(grant.grantedAt)) return 'CONTEXT_INVALID'
    if (grant.expiresAt !== null && !isIsoTimestamp(grant.expiresAt)) return 'CONTEXT_INVALID'
    if (grant.revokedAt !== null && !isIsoTimestamp(grant.revokedAt)) return 'CONTEXT_INVALID'
  }
  return null
}

function checkEvidenceList(raw: unknown): ReleaseDecisionRefusal | null {
  if (!Array.isArray(raw)) return 'CONTEXT_INVALID'
  for (const entry of raw) {
    if (!isRecord(entry)) return 'CONTEXT_INVALID'
    if (hasUnknownKey(entry, EVIDENCE_KEYS)) return 'CONTEXT_UNKNOWN_FIELD'
    if (!isNonEmptyString(entry.ref)) return 'CONTEXT_INVALID'
    if (!isKnown(EVIDENCE_KINDS, entry.kind)) return 'CONTEXT_INVALID'
    if (!isKnown(RELEASE_DOMAINS, entry.domain)) return 'CONTEXT_INVALID'
    if (!isNonEmptyString(entry.recordId)) return 'CONTEXT_INVALID'
    if (!isNonEmptyString(entry.revisionId)) return 'CONTEXT_INVALID'
    if (!isSha256(entry.contentDigest)) return 'CONTEXT_INVALID'
    if (entry.scope !== null && typeof entry.scope !== 'string') return 'CONTEXT_INVALID'
    if (!isKnown(EVIDENCE_STATES, entry.state)) return 'CONTEXT_INVALID'
    if (!isStringArray(entry.ownerRefs)) return 'CONTEXT_INVALID'
    if (entry.expiresAt !== null && !isIsoTimestamp(entry.expiresAt)) return 'CONTEXT_INVALID'
    if (!isIsoTimestamp(entry.updatedAt)) return 'CONTEXT_INVALID'
  }
  return null
}

function checkNestedContext(context: UnknownRecord): ReleaseDecisionRefusal | null {
  if (!isRecord(context.actor)) return 'CONTEXT_INVALID'
  const actorReason = checkActor(context.actor, Date.parse(context.now as string))
  if (actorReason !== null) return actorReason

  if (!Array.isArray(context.grants)) return 'CONTEXT_INVALID'
  const grantReason = checkGrants(context.grants)
  if (grantReason !== null) return grantReason

  const evidenceReason = checkEvidenceList(context.evidence)
  if (evidenceReason !== null) return evidenceReason

  const withdrawal = context.withdrawal
  if (!isRecord(withdrawal) || hasUnknownKey(withdrawal, WITHDRAWAL_KEYS)) return 'CONTEXT_INVALID'
  if (!isNonEmptyString(withdrawal.releaseId)) return 'CONTEXT_INVALID'
  if (!isNonEmptyString(withdrawal.revisionId)) return 'CONTEXT_INVALID'
  if (!isKnown(WITHDRAWAL_STATES, withdrawal.state)) return 'CONTEXT_INVALID'
  if (withdrawal.decidedAt !== null && !isIsoTimestamp(withdrawal.decidedAt)) return 'CONTEXT_INVALID'

  const integrity = context.integrity
  if (!isRecord(integrity) || hasUnknownKey(integrity, INTEGRITY_KEYS)) return 'CONTEXT_INVALID'
  if (!isSha256(integrity.manifestHash)) return 'CONTEXT_INVALID'
  if (!isNonEmptyString(integrity.releaseRef)) return 'CONTEXT_INVALID'
  if (typeof integrity.releaseVersion !== 'number' || !Number.isInteger(integrity.releaseVersion) || integrity.releaseVersion < 1) {
    return 'CONTEXT_INVALID'
  }
  if (!isNonEmptyString(integrity.recordId)) return 'CONTEXT_INVALID'
  if (!isNonEmptyString(integrity.revisionId)) return 'CONTEXT_INVALID'
  if (!isSha256(integrity.contentDigest)) return 'CONTEXT_INVALID'

  const allowlist = context.allowlist
  if (!isRecord(allowlist) || hasUnknownKey(allowlist, ALLOWLIST_KEYS)) return 'CONTEXT_INVALID'
  if (!isKnown(RELEASE_DOMAINS, allowlist.domain)) return 'CONTEXT_INVALID'
  if (!isNonEmptyString(allowlist.scope)) return 'CONTEXT_INVALID'
  if (!isStringArray(allowlist.fields)) return 'CONTEXT_INVALID'

  return null
}

function parseContext(raw: unknown): ContextCheck {
  if (!isRecord(raw)) return { ok: false, reason: 'CONTEXT_INVALID' }
  if (hasUnknownKey(raw, CONTEXT_KEYS)) return { ok: false, reason: 'CONTEXT_UNKNOWN_FIELD' }
  if (!isIsoTimestamp(raw.now)) return { ok: false, reason: 'CONTEXT_TIME_INVALID' }
  if (!Array.isArray(raw.grants)) return { ok: false, reason: 'CONTEXT_INVALID' }
  if (!Array.isArray(raw.evidence)) return { ok: false, reason: 'CONTEXT_INVALID' }
  if (!Array.isArray(raw.priorDecisions)) return { ok: false, reason: 'CONTEXT_INVALID' }
  const nested = checkNestedContext(raw)
  if (nested !== null) return { ok: false, reason: nested }
  return { ok: true, context: raw as unknown as DecisionContext }
}

function parseDecisionRefs(raw: unknown): DecisionEvidenceRefs | null {
  if (!isRecord(raw)) return null
  if (hasUnknownKey(raw, EVIDENCE_REF_KEYS)) return null
  if (
    !isNonEmptyString(raw.rights) ||
    !isNonEmptyString(raw.consent) ||
    !isNonEmptyString(raw.source) ||
    !isNonEmptyString(raw.review)
  ) {
    return null
  }
  return { rights: raw.rights, consent: raw.consent, source: raw.source, review: raw.review }
}

function decisionCore(decision: ReleaseDecision): Omit<ReleaseDecision, 'decisionHash'> {
  const payload: UnknownRecord = {}
  for (const key of DECISION_KEYS) {
    if (key === 'decisionHash') continue
    payload[key] = (decision as unknown as UnknownRecord)[key]
  }
  return payload as unknown as Omit<ReleaseDecision, 'decisionHash'>
}

function sortedUniqueFields(fields: readonly string[]): readonly string[] | null {
  if (fields.length === 0) return null
  if (!fields.every((field) => isNonEmptyString(field))) return null
  const sorted = [...fields].sort(textCompare)
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] === sorted[index - 1]) return null
  }
  return sorted
}

function fieldsAllowed(fields: readonly string[], allowlist: ProjectionAllowlist): boolean {
  return fields.every((field) => allowlist.fields.includes(field))
}

interface PriorDecisionRecord {
  readonly requestId: string
  readonly releaseId: string
  readonly revisionId: string
  readonly scope: string
}

function readPriorDecision(raw: unknown): PriorDecisionRecord | null {
  if (!isRecord(raw)) return null
  if (
    !isNonEmptyString(raw.requestId) ||
    !isNonEmptyString(raw.releaseId) ||
    !isNonEmptyString(raw.revisionId) ||
    !isNonEmptyString(raw.scope)
  ) {
    return null
  }
  return { requestId: raw.requestId, releaseId: raw.releaseId, revisionId: raw.revisionId, scope: raw.scope }
}

function checkReplay(
  priorDecisions: readonly unknown[],
  request: PriorDecisionRecord,
): ReleaseDecisionRefusal | null {
  for (const raw of priorDecisions) {
    const prior = readPriorDecision(raw)
    if (prior === null) return 'CONTEXT_INVALID'
    if (prior.requestId === request.requestId) return 'REPLAY'
    if (
      prior.releaseId === request.releaseId &&
      prior.revisionId === request.revisionId &&
      prior.scope === request.scope
    ) {
      return 'REPLAY'
    }
  }
  return null
}

/**
 * Decide whether one exact revision may be approved within one exact scope.
 *
 * Checks run in a fixed order: request shape and keys, context shape and time,
 * exact-revision integrity binding, reviewer identity, replay, self-review and
 * conflicts, reviewer grant, classification, scope, withdrawal state, evidence
 * re-check, then the projection allowlist. Only a verified human holding a
 * live `RELEASE_REVIEWER` grant scoped to this domain/scope can produce a
 * decision; the returned state is `APPROVED_WITHIN_SCOPE` with activation
 * `DISABLED` in every case.
 */
export function decideRelease(request: unknown, context: unknown): ReleaseDecisionResult {
  if (!isRecord(request)) return refused(request, 'REQUEST_INVALID')
  if (hasUnknownKey(request, REQUEST_KEYS)) return refused(request, 'REQUEST_UNKNOWN_FIELD')
  if (
    !isNonEmptyString(request.requestId) ||
    !isNonEmptyString(request.releaseId) ||
    !isNonEmptyString(request.recordId) ||
    !isNonEmptyString(request.revisionId) ||
    !isNonEmptyString(request.rightsRef) ||
    !isNonEmptyString(request.consentRef) ||
    !isNonEmptyString(request.sourceRef) ||
    !isNonEmptyString(request.reviewRef) ||
    !isNonEmptyString(request.submittedBy)
  ) {
    return refused(request, 'REQUEST_FIELD_MISSING')
  }
  if (!isKnown(RELEASE_DOMAINS, request.domain)) return refused(request, 'DOMAIN_UNKNOWN')
  if (!isKnown(DECISION_CONTENT_TYPES, request.contentType)) return refused(request, 'CONTENT_TYPE_UNKNOWN')
  if (!isSha256(request.contentDigest)) return refused(request, 'CONTENT_DIGEST_INVALID')
  if (!isSha256(request.manifestHash)) return refused(request, 'INTEGRITY_MISMATCH')
  if (!isIsoTimestamp(request.requestedAt)) return refused(request, 'REQUEST_TIMESTAMP_INVALID')
  if (!isStringArray(request.conflictPrincipalRefs)) return refused(request, 'REQUEST_FIELD_INVALID')

  const parsed = parseContext(context)
  if (!parsed.ok) return refused(request, parsed.reason)
  const ctx = parsed.context
  const nowMs = Date.parse(ctx.now)
  if (Date.parse(request.requestedAt) > nowMs) return refused(request, 'REQUEST_TIMESTAMP_INVALID')
  if (!isNonEmptyString(request.scope) || request.scope !== DECIDABLE_RELEASE_SCOPE) {
    return refused(request, 'SCOPE_INVALID')
  }

  const binding: Binding = {
    domain: request.domain as ReleaseDomain,
    recordId: request.recordId,
    revisionId: request.revisionId,
    contentDigest: request.contentDigest,
    scope: request.scope,
  }

  if (
    ctx.integrity.recordId !== binding.recordId ||
    ctx.integrity.revisionId !== binding.revisionId ||
    ctx.integrity.contentDigest !== binding.contentDigest ||
    ctx.integrity.manifestHash !== request.manifestHash
  ) {
    return refused(request, 'INTEGRITY_MISMATCH')
  }

  const actorReason = checkActor(ctx.actor, nowMs)
  if (actorReason !== null) return refused(request, actorReason)

  const replayReason = checkReplay(ctx.priorDecisions, {
    requestId: request.requestId,
    releaseId: request.releaseId,
    revisionId: request.revisionId,
    scope: request.scope,
  })
  if (replayReason !== null) return refused(request, replayReason)

  if (ctx.actor.principalRef === request.submittedBy) return refused(request, 'SELF_REVIEW')
  if (request.conflictPrincipalRefs.includes(ctx.actor.principalRef)) return refused(request, 'REVIEWER_CONFLICT')
  for (const entry of ctx.evidence) {
    if (entry.ownerRefs.includes(ctx.actor.principalRef)) return refused(request, 'REVIEWER_CONFLICT')
  }

  const grant = checkGrant(ctx.actor.principalRef, binding, ctx.grants, nowMs)
  if (!grant.ok) return refused(request, grant.reason)

  if (request.classification === 'RESTRICTED') return refused(request, 'CLASSIFICATION_RESTRICTED')
  if (request.classification === 'UNKNOWN') return refused(request, 'CLASSIFICATION_UNKNOWN')
  if (!isKnown(RELEASE_CLASSIFICATIONS, request.classification)) {
    return refused(request, 'CLASSIFICATION_INVALID')
  }

  if (ctx.allowlist.domain !== binding.domain || ctx.allowlist.scope !== binding.scope) {
    return refused(request, 'SCOPE_MISMATCH')
  }
  const fields = sortedUniqueFields(request.fields as readonly string[])
  if (fields === null) return refused(request, 'FIELDS_INVALID')
  if (!fieldsAllowed(fields, ctx.allowlist)) return refused(request, 'FIELD_NOT_ALLOWLISTED')

  const withdrawalReason = checkWithdrawal(ctx.withdrawal, binding)
  if (withdrawalReason !== null) return refused(request, withdrawalReason)

  const rights = checkEvidence(request.rightsRef, 'RIGHTS', binding, ctx.evidence, nowMs)
  if (!rights.ok) return refused(request, rights.reason)
  const consent = checkEvidence(request.consentRef, 'CONSENT', binding, ctx.evidence, nowMs)
  if (!consent.ok) return refused(request, consent.reason)
  const source = checkEvidence(request.sourceRef, 'SOURCE', binding, ctx.evidence, nowMs)
  if (!source.ok) return refused(request, source.reason)
  const review = checkEvidence(request.reviewRef, 'REVIEW', binding, ctx.evidence, nowMs)
  if (!review.ok) return refused(request, review.reason)

  const core: Omit<ReleaseDecision, 'decisionHash'> = {
    schemaVersion: RELEASE_DECISION_SCHEMA_VERSION,
    kind: RELEASE_DECISION_KIND,
    policyVersion: GOVERNANCE_POLICY_VERSION,
    requestId: request.requestId,
    releaseId: request.releaseId,
    domain: binding.domain,
    recordId: binding.recordId,
    revisionId: binding.revisionId,
    contentDigest: binding.contentDigest,
    contentType: request.contentType,
    scope: binding.scope,
    classification: request.classification,
    fields,
    reviewerRef: ctx.actor.principalRef,
    evidenceRefs: {
      rights: request.rightsRef,
      consent: request.consentRef,
      source: request.sourceRef,
      review: request.reviewRef,
    },
    manifestHash: request.manifestHash,
    state: DECISION_STATE,
    activation: ACTIVATION_STATE,
    decidedAt: ctx.now,
  }
  const decision = deepFreeze({ ...core, decisionHash: sha256Of(core) })
  return Object.freeze({ approved: true, decision })
}

function parseDecision(raw: unknown): { readonly decision: ReleaseDecision } | { readonly reason: ReleaseDecisionRefusal } {
  if (!isRecord(raw)) return { reason: 'DECISION_INVALID' }
  if (hasUnknownKey(raw, DECISION_KEYS)) return { reason: 'DECISION_UNKNOWN_FIELD' }
  if (raw.schemaVersion !== RELEASE_DECISION_SCHEMA_VERSION) return { reason: 'DECISION_INVALID' }
  if (raw.kind !== RELEASE_DECISION_KIND) return { reason: 'DECISION_INVALID' }
  if (raw.policyVersion !== GOVERNANCE_POLICY_VERSION) return { reason: 'DECISION_INVALID' }
  if (
    !isNonEmptyString(raw.requestId) ||
    !isNonEmptyString(raw.releaseId) ||
    !isNonEmptyString(raw.recordId) ||
    !isNonEmptyString(raw.revisionId) ||
    !isNonEmptyString(raw.scope) ||
    !isNonEmptyString(raw.reviewerRef) ||
    !isNonEmptyString(raw.decidedAt)
  ) {
    return { reason: 'DECISION_INVALID' }
  }
  if (!isKnown(RELEASE_DOMAINS, raw.domain)) return { reason: 'DECISION_INVALID' }
  if (!isKnown(DECISION_CONTENT_TYPES, raw.contentType)) return { reason: 'DECISION_INVALID' }
  if (!isKnown(RELEASE_CLASSIFICATIONS, raw.classification)) return { reason: 'DECISION_INVALID' }
  if (!isSha256(raw.contentDigest) || !isSha256(raw.manifestHash)) return { reason: 'DECISION_INVALID' }
  if (!isNonEmptyStringArray(raw.fields)) return { reason: 'DECISION_INVALID' }
  const evidenceRefs = parseDecisionRefs(raw.evidenceRefs)
  if (evidenceRefs === null) return { reason: 'DECISION_INVALID' }
  if (raw.state !== DECISION_STATE || raw.activation !== ACTIVATION_STATE) return { reason: 'DECISION_INVALID' }
  if (!isSha256(raw.decisionHash)) return { reason: 'DECISION_INVALID' }
  if (!isIsoTimestamp(raw.decidedAt)) return { reason: 'DECISION_INVALID' }
  let recomputed: string
  try {
    recomputed = sha256Of(decisionCore(raw as unknown as ReleaseDecision))
  } catch {
    return { reason: 'DECISION_INVALID' }
  }
  if (recomputed !== raw.decisionHash) return { reason: 'DECISION_TAMPERED' }
  return { decision: raw as unknown as ReleaseDecision }
}

/**
 * Re-check a sealed decision immediately before a projection read.
 *
 * The exact revision binding, reviewer grant, withdrawal state, evidence
 * references and projection allowlist are re-evaluated against fresh
 * caller-supplied snapshots. A positive result still reports
 * `activation: 'DISABLED'`: reading a decision never activates a public
 * projection. Refusals return only the opaque release id and a stable reason.
 */
export function readDecision(decision: unknown, context: unknown): ReleaseDecisionRead {
  const parsedDecision = parseDecision(decision)
  if ('reason' in parsedDecision) {
    const record = isRecord(decision) ? decision : {}
    return unavailable(record.releaseId, parsedDecision.reason)
  }
  const sealed = parsedDecision.decision

  const parsedContext = parseContext(context)
  if (!parsedContext.ok) return unavailable(sealed.releaseId, parsedContext.reason)
  const ctx = parsedContext.context
  const nowMs = Date.parse(ctx.now)

  const binding: Binding = {
    domain: sealed.domain,
    recordId: sealed.recordId,
    revisionId: sealed.revisionId,
    contentDigest: sealed.contentDigest,
    scope: sealed.scope,
  }

  if (
    ctx.integrity.recordId !== binding.recordId ||
    ctx.integrity.revisionId !== binding.revisionId ||
    ctx.integrity.contentDigest !== binding.contentDigest ||
    ctx.integrity.manifestHash !== sealed.manifestHash
  ) {
    return unavailable(sealed.releaseId, 'INTEGRITY_MISMATCH')
  }

  const grant = checkGrant(sealed.reviewerRef, binding, ctx.grants, nowMs)
  if (!grant.ok) return unavailable(sealed.releaseId, grant.reason)

  if (ctx.allowlist.domain !== binding.domain || ctx.allowlist.scope !== binding.scope) {
    return unavailable(sealed.releaseId, 'SCOPE_MISMATCH')
  }
  if (!fieldsAllowed(sealed.fields, ctx.allowlist)) return unavailable(sealed.releaseId, 'FIELD_NOT_ALLOWLISTED')

  const withdrawalReason = checkWithdrawal(ctx.withdrawal, binding)
  if (withdrawalReason !== null) return unavailable(sealed.releaseId, withdrawalReason)

  const rights = checkEvidence(sealed.evidenceRefs.rights, 'RIGHTS', binding, ctx.evidence, nowMs)
  if (!rights.ok) return unavailable(sealed.releaseId, rights.reason)
  const consent = checkEvidence(sealed.evidenceRefs.consent, 'CONSENT', binding, ctx.evidence, nowMs)
  if (!consent.ok) return unavailable(sealed.releaseId, consent.reason)
  const source = checkEvidence(sealed.evidenceRefs.source, 'SOURCE', binding, ctx.evidence, nowMs)
  if (!source.ok) return unavailable(sealed.releaseId, source.reason)
  const review = checkEvidence(sealed.evidenceRefs.review, 'REVIEW', binding, ctx.evidence, nowMs)
  if (!review.ok) return unavailable(sealed.releaseId, review.reason)

  return Object.freeze({
    available: true,
    activation: ACTIVATION_STATE,
    releaseId: sealed.releaseId,
    revisionId: sealed.revisionId,
    contentDigest: sealed.contentDigest,
    contentType: sealed.contentType,
    scope: sealed.scope,
    fields: sealed.fields,
    decisionHash: sealed.decisionHash,
  })
}
