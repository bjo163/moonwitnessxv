/**
 * M21-05 prototype HQ review-inbox enforcement for AI-suggested claims or
 * edits.
 *
 * This module is deliberately pure: no imports, no network, no database, no
 * filesystem and no wall clock. It answers one question for one canonical
 * action — may this AI suggestion become canonical? — and returns either an
 * authorization descriptor or a refusal with a stable reason code.
 *
 * The policy is deny-by-default. A suggestion can become canonical only when
 * every one of these holds:
 *
 * - the suggestion is in the `APPROVED` lifecycle state (pending, withdrawn,
 *   rejected and malformed suggestions never pass);
 * - its review history holds exactly one decision, and that decision is an
 *   explicit `APPROVE` (one decision per suggestion; a second decision is a
 *   replay and does not silently override the first);
 * - the recorded reviewer is a human principal, is not the proposer and is not
 *   in a declared conflict of interest;
 * - that principal holds a live, exact-role reviewer authorization supplied by
 *   the caller.
 *
 * AI/agent principals can never approve, including when an authorization entry
 * declares the required role. A refusal is constructed from a fixed field list
 * and carries only the opaque suggestion id, the reason code, the policy
 * version and the caller timestamp — never suggestion text, a payload summary,
 * a note, a source id or a URL.
 *
 * This is a prototype policy module, not an HQ inbox page, route, database or
 * notification system; see docs/audit/M21-05-review-inbox.md.
 */

export const REVIEW_INBOX_POLICY_VERSION = '1.0.0'

export type SuggestionKind = 'CLAIM' | 'EDIT'

export type SuggestionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'

export type ReviewerDecisionValue = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'

export type PrincipalKind = 'HUMAN' | 'AI_AGENT'

/** An AI-proposed claim or edit awaiting human review. */
export interface ClaimSuggestion {
  /** Opaque id; never a URL or a free-form locator. */
  readonly id: string
  readonly kind: SuggestionKind
  /** Opaque source id the suggestion refers to. */
  readonly sourceId: string
  /** Principal that produced the suggestion; may itself be an AI principal. */
  readonly proposedBy: string
  readonly proposedAt: string
  /** Human-readable summary for the reviewer; never copied into a refusal. */
  readonly payloadSummary: string
  readonly status: SuggestionStatus
}

/** One recorded reviewer decision for one suggestion. */
export interface ReviewerDecision {
  readonly actor: string
  readonly role: string
  readonly decision: ReviewerDecisionValue
  readonly decidedAt: string
  readonly note?: string
  /** A declared conflict of interest always refuses, regardless of role. */
  readonly conflictOfInterest?: boolean
}

/**
 * A caller-supplied reviewer authorization. `principalKind` is a declared
 * provenance label: this module does not authenticate it, but an `AI_AGENT`
 * entry can never satisfy a canonical approval.
 */
export interface ReviewerAuthorization {
  readonly principalRef: string
  readonly principalKind: PrincipalKind
  readonly role: string
  readonly expiresAt?: string | null
}

/** Caller-supplied review policy. Nothing here is read from ambient state. */
export interface ReviewInboxPolicy {
  /** Exact role a human reviewer must hold for a canonical approval. */
  readonly requiredRole: string
  readonly reviewerAuthorizations: readonly ReviewerAuthorization[]
  /** Caller-supplied clock (ISO-8601); no wall clock is read. */
  readonly evaluatedAt: string
}

/** A request to turn one reviewed suggestion into a canonical action. */
export interface CanonicalActionRequest {
  readonly suggestion: ClaimSuggestion
  /** Recorded decision history for this suggestion; exactly one is allowed. */
  readonly decisions: readonly ReviewerDecision[]
}

export type ReviewInboxDenialReason =
  | 'REQUEST_LIST_INVALID'
  | 'REQUEST_MISSING'
  | 'POLICY_MISSING'
  | 'POLICY_INVALID'
  | 'POLICY_TIMESTAMP_INVALID'
  | 'REVIEWER_AUTHORIZATION_INVALID'
  | 'SUGGESTION_MISSING'
  | 'SUGGESTION_FIELD_MISSING'
  | 'SUGGESTION_FIELD_INVALID'
  | 'SUGGESTION_ID_INVALID'
  | 'SUGGESTION_KIND_INVALID'
  | 'SUGGESTION_SOURCE_ID_INVALID'
  | 'SUGGESTION_TIMESTAMP_INVALID'
  | 'SUGGESTION_STATUS_INVALID'
  | 'SUGGESTION_PENDING'
  | 'SUGGESTION_WITHDRAWN'
  | 'SUGGESTION_REJECTED'
  | 'DECISIONS_INVALID'
  | 'DECISION_MISSING'
  | 'DECISION_INVALID'
  | 'DECISION_TIMESTAMP_INVALID'
  | 'DECISION_NOT_APPROVE'
  | 'DUPLICATE_DECISION'
  | 'REVIEWER_MISSING'
  | 'REVIEWER_ROLE_MISSING'
  | 'REVIEWER_NOT_HUMAN'
  | 'REVIEWER_NOT_AUTHORIZED'
  | 'REVIEWER_AUTHORIZATION_EXPIRED'
  | 'REVIEWER_IS_PROPOSER'
  | 'REVIEWER_CONFLICT_OF_INTEREST'

export interface AllowedCanonicalActionDecision {
  readonly suggestionId: string
  readonly allowed: true
  readonly kind: SuggestionKind
  readonly sourceId: string
  readonly reviewerPrincipalRef: string
  readonly reviewerRole: string
  /** Timestamp of the explicit APPROVE decision. */
  readonly approvedAt: string
  readonly policyVersion: typeof REVIEW_INBOX_POLICY_VERSION
  readonly evaluatedAt: string
}

/**
 * A refusal never carries `payloadSummary`, `note`, `sourceId`, `proposedBy`,
 * `text`, `content`, `snippet`, `body`, `url` or the decision list.
 * `suggestionId` is the only suggestion-identifying field.
 */
export interface RefusedCanonicalActionDecision {
  readonly suggestionId: string | null
  readonly allowed: false
  readonly reason: ReviewInboxDenialReason
  readonly policyVersion: typeof REVIEW_INBOX_POLICY_VERSION
  readonly evaluatedAt: string | null
}

export type CanonicalActionDecision =
  | AllowedCanonicalActionDecision
  | RefusedCanonicalActionDecision

interface NormalizedPolicy {
  readonly requiredRole: string
  readonly reviewerAuthorizations: readonly ReviewerAuthorization[]
  readonly evaluatedAt: string
  readonly evaluatedAtMs: number
}

type PolicyResult =
  | { readonly ok: true; readonly policy: NormalizedPolicy }
  | { readonly ok: false; readonly reason: ReviewInboxDenialReason }

type SuggestionResult =
  | { readonly ok: true; readonly suggestion: ClaimSuggestion }
  | {
      readonly ok: false
      readonly suggestionId: string | null
      readonly reason: ReviewInboxDenialReason
    }

type DecisionResult =
  | { readonly ok: true; readonly decision: ReviewerDecision }
  | { readonly ok: false; readonly reason: ReviewInboxDenialReason }

type UnknownRecord = Record<string, unknown>

/**
 * Opaque identifier shape: no slashes, schemes, query or fragment characters,
 * so an echoed id cannot smuggle a URL into a refusal.
 */
const SAFE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/

/**
 * Declared refs that name an AI/agent/model/bot/service principal. This is a
 * defence-in-depth heuristic, not authentication; the authorization's
 * declared `principalKind` is the primary signal.
 */
const NON_HUMAN_PRINCIPAL_PATTERN =
  /^(?:(?:principal|actor|user):)?(?:ai|agent|model|bot|service|robot):/i

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function parseTimestamp(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 0x1f || code === 0x7f) return true
  }
  return false
}

function isSafeId(value: unknown): value is string {
  return typeof value === 'string' && SAFE_ID_PATTERN.test(value)
}

function isPrincipalRef(value: unknown): value is string {
  return (
    isNonEmptyString(value) &&
    value.length <= 512 &&
    !hasControlCharacter(value)
  )
}

function isNonHumanPrincipalRef(value: string): boolean {
  return NON_HUMAN_PRINCIPAL_PATTERN.test(value)
}

function isSuggestionKind(value: unknown): value is SuggestionKind {
  return value === 'CLAIM' || value === 'EDIT'
}

function isSuggestionStatus(value: unknown): value is SuggestionStatus {
  return (
    value === 'PENDING' ||
    value === 'APPROVED' ||
    value === 'REJECTED' ||
    value === 'WITHDRAWN'
  )
}

function isDecisionValue(value: unknown): value is ReviewerDecisionValue {
  return value === 'APPROVE' || value === 'REJECT' || value === 'REQUEST_CHANGES'
}

function isPrincipalKind(value: unknown): value is PrincipalKind {
  return value === 'HUMAN' || value === 'AI_AGENT'
}

function notExpired(expiresAt: unknown, atMs: number): boolean {
  if (expiresAt === undefined || expiresAt === null) return true
  if (typeof expiresAt !== 'string') return false
  const expiryMs = parseTimestamp(expiresAt)
  return expiryMs !== null && expiryMs > atMs
}

function refused(
  suggestionId: string | null,
  reason: ReviewInboxDenialReason,
  evaluatedAt: string | null,
): RefusedCanonicalActionDecision {
  return {
    suggestionId,
    allowed: false,
    reason,
    policyVersion: REVIEW_INBOX_POLICY_VERSION,
    evaluatedAt,
  }
}

function normalizeAuthorizations(
  raw: unknown,
): readonly ReviewerAuthorization[] | null {
  if (!Array.isArray(raw)) return null
  const authorizations: ReviewerAuthorization[] = []
  for (const entry of raw) {
    if (!isRecord(entry)) return null
    if (!isPrincipalRef(entry.principalRef)) return null
    if (!isPrincipalKind(entry.principalKind)) return null
    if (!isNonEmptyString(entry.role)) return null
    if (entry.expiresAt !== undefined && entry.expiresAt !== null) {
      if (typeof entry.expiresAt !== 'string') return null
      if (parseTimestamp(entry.expiresAt) === null) return null
    }
    authorizations.push({
      principalRef: entry.principalRef,
      principalKind: entry.principalKind,
      role: entry.role,
      ...(typeof entry.expiresAt === 'string' ? { expiresAt: entry.expiresAt } : {}),
    })
  }
  return authorizations
}

function normalizePolicy(raw: unknown): PolicyResult {
  if (!isRecord(raw)) return { ok: false, reason: 'POLICY_MISSING' }
  if (!isNonEmptyString(raw.requiredRole)) {
    return { ok: false, reason: 'POLICY_MISSING' }
  }
  if (raw.reviewerAuthorizations === undefined || raw.reviewerAuthorizations === null) {
    return { ok: false, reason: 'POLICY_MISSING' }
  }
  if (
    typeof raw.evaluatedAt !== 'string' ||
    parseTimestamp(raw.evaluatedAt) === null
  ) {
    return { ok: false, reason: 'POLICY_TIMESTAMP_INVALID' }
  }
  const evaluatedAtMs = parseTimestamp(raw.evaluatedAt)
  if (evaluatedAtMs === null) {
    return { ok: false, reason: 'POLICY_TIMESTAMP_INVALID' }
  }
  const reviewerAuthorizations = normalizeAuthorizations(raw.reviewerAuthorizations)
  if (reviewerAuthorizations === null) {
    return { ok: false, reason: 'REVIEWER_AUTHORIZATION_INVALID' }
  }
  return {
    ok: true,
    policy: {
      requiredRole: raw.requiredRole,
      reviewerAuthorizations,
      evaluatedAt: raw.evaluatedAt,
      evaluatedAtMs,
    },
  }
}

function normalizeSuggestion(raw: unknown): SuggestionResult {
  if (!isRecord(raw)) {
    return { ok: false, suggestionId: null, reason: 'SUGGESTION_FIELD_MISSING' }
  }
  if (!isNonEmptyString(raw.id)) {
    return { ok: false, suggestionId: null, reason: 'SUGGESTION_FIELD_MISSING' }
  }
  if (!isSafeId(raw.id)) {
    return { ok: false, suggestionId: null, reason: 'SUGGESTION_ID_INVALID' }
  }
  const id = raw.id

  if (!isNonEmptyString(raw.kind)) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_FIELD_MISSING' }
  }
  if (!isSuggestionKind(raw.kind)) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_KIND_INVALID' }
  }
  if (!isNonEmptyString(raw.sourceId)) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_FIELD_MISSING' }
  }
  if (!isSafeId(raw.sourceId)) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_SOURCE_ID_INVALID' }
  }
  if (!isPrincipalRef(raw.proposedBy)) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_FIELD_MISSING' }
  }
  if (raw.proposedAt === undefined || raw.proposedAt === null) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_FIELD_MISSING' }
  }
  if (
    typeof raw.proposedAt !== 'string' ||
    parseTimestamp(raw.proposedAt) === null
  ) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_TIMESTAMP_INVALID' }
  }
  if (raw.payloadSummary === undefined || raw.payloadSummary === null) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_FIELD_MISSING' }
  }
  if (typeof raw.payloadSummary !== 'string') {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_FIELD_INVALID' }
  }
  if (raw.payloadSummary.trim().length === 0) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_FIELD_MISSING' }
  }
  if (!isNonEmptyString(raw.status)) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_FIELD_MISSING' }
  }
  if (!isSuggestionStatus(raw.status)) {
    return { ok: false, suggestionId: id, reason: 'SUGGESTION_STATUS_INVALID' }
  }

  return {
    ok: true,
    suggestion: {
      id,
      kind: raw.kind,
      sourceId: raw.sourceId,
      proposedBy: raw.proposedBy,
      proposedAt: raw.proposedAt,
      payloadSummary: raw.payloadSummary,
      status: raw.status,
    },
  }
}

function normalizeDecision(raw: unknown): DecisionResult {
  if (!isRecord(raw)) return { ok: false, reason: 'DECISION_INVALID' }
  if (!isNonEmptyString(raw.actor)) {
    return { ok: false, reason: 'REVIEWER_MISSING' }
  }
  if (!isPrincipalRef(raw.actor)) return { ok: false, reason: 'DECISION_INVALID' }
  if (!isNonEmptyString(raw.role)) {
    return { ok: false, reason: 'REVIEWER_ROLE_MISSING' }
  }
  if (!isDecisionValue(raw.decision)) {
    return { ok: false, reason: 'DECISION_INVALID' }
  }
  if (
    typeof raw.decidedAt !== 'string' ||
    parseTimestamp(raw.decidedAt) === null
  ) {
    return { ok: false, reason: 'DECISION_TIMESTAMP_INVALID' }
  }
  if (raw.note !== undefined && typeof raw.note !== 'string') {
    return { ok: false, reason: 'DECISION_INVALID' }
  }
  if (
    raw.conflictOfInterest !== undefined &&
    typeof raw.conflictOfInterest !== 'boolean'
  ) {
    return { ok: false, reason: 'DECISION_INVALID' }
  }
  return {
    ok: true,
    decision: {
      actor: raw.actor,
      role: raw.role,
      decision: raw.decision,
      decidedAt: raw.decidedAt,
      ...(typeof raw.note === 'string' ? { note: raw.note } : {}),
      ...(typeof raw.conflictOfInterest === 'boolean'
        ? { conflictOfInterest: raw.conflictOfInterest }
        : {}),
    },
  }
}

/** Read an opaque suggestion id from an untrusted request, for a refusal. */
function safeSuggestionIdOf(raw: unknown): string | null {
  if (!isRecord(raw) || !isRecord(raw.suggestion)) return null
  return isSafeId(raw.suggestion.id) ? raw.suggestion.id : null
}

function reviewerFailure(
  decision: ReviewerDecision,
  suggestion: ClaimSuggestion,
  policy: NormalizedPolicy,
): ReviewInboxDenialReason | null {
  if (isNonHumanPrincipalRef(decision.actor)) return 'REVIEWER_NOT_HUMAN'
  if (decision.actor === suggestion.proposedBy) return 'REVIEWER_IS_PROPOSER'
  if (decision.role !== policy.requiredRole) return 'REVIEWER_ROLE_MISSING'

  const authorizations = policy.reviewerAuthorizations.filter(
    (authorization) => authorization.principalRef === decision.actor,
  )
  if (authorizations.length === 0) return 'REVIEWER_NOT_AUTHORIZED'

  const human = authorizations.filter(
    (authorization) => authorization.principalKind === 'HUMAN',
  )
  if (human.length === 0) return 'REVIEWER_NOT_HUMAN'

  const roleScoped = human.filter(
    (authorization) => authorization.role === policy.requiredRole,
  )
  if (roleScoped.length === 0) return 'REVIEWER_NOT_AUTHORIZED'

  const live = roleScoped.filter((authorization) =>
    notExpired(authorization.expiresAt, policy.evaluatedAtMs),
  )
  if (live.length === 0) return 'REVIEWER_AUTHORIZATION_EXPIRED'

  return null
}

function evaluateNormalized(
  rawRequest: unknown,
  policy: NormalizedPolicy,
): CanonicalActionDecision {
  if (!isRecord(rawRequest)) {
    return refused(null, 'REQUEST_MISSING', policy.evaluatedAt)
  }
  if (rawRequest.suggestion === undefined || rawRequest.suggestion === null) {
    return refused(null, 'SUGGESTION_MISSING', policy.evaluatedAt)
  }

  const suggestionResult = normalizeSuggestion(rawRequest.suggestion)
  if (!suggestionResult.ok) {
    return refused(
      suggestionResult.suggestionId,
      suggestionResult.reason,
      policy.evaluatedAt,
    )
  }
  const suggestion = suggestionResult.suggestion

  if (suggestion.status === 'WITHDRAWN') {
    return refused(suggestion.id, 'SUGGESTION_WITHDRAWN', policy.evaluatedAt)
  }
  if (suggestion.status === 'REJECTED') {
    return refused(suggestion.id, 'SUGGESTION_REJECTED', policy.evaluatedAt)
  }
  if (suggestion.status === 'PENDING') {
    return refused(suggestion.id, 'SUGGESTION_PENDING', policy.evaluatedAt)
  }

  const rawDecisions = rawRequest.decisions
  if (rawDecisions === undefined || rawDecisions === null) {
    return refused(suggestion.id, 'DECISION_MISSING', policy.evaluatedAt)
  }
  if (!Array.isArray(rawDecisions)) {
    return refused(suggestion.id, 'DECISIONS_INVALID', policy.evaluatedAt)
  }
  if (rawDecisions.length === 0) {
    return refused(suggestion.id, 'DECISION_MISSING', policy.evaluatedAt)
  }
  if (rawDecisions.length > 1) {
    return refused(suggestion.id, 'DUPLICATE_DECISION', policy.evaluatedAt)
  }

  const decisionResult = normalizeDecision(rawDecisions[0])
  if (!decisionResult.ok) {
    return refused(suggestion.id, decisionResult.reason, policy.evaluatedAt)
  }
  const decision = decisionResult.decision

  if (decision.decision !== 'APPROVE') {
    return refused(suggestion.id, 'DECISION_NOT_APPROVE', policy.evaluatedAt)
  }
  if (decision.conflictOfInterest === true) {
    return refused(
      suggestion.id,
      'REVIEWER_CONFLICT_OF_INTEREST',
      policy.evaluatedAt,
    )
  }

  const reviewerReason = reviewerFailure(decision, suggestion, policy)
  if (reviewerReason !== null) {
    return refused(suggestion.id, reviewerReason, policy.evaluatedAt)
  }

  return {
    suggestionId: suggestion.id,
    allowed: true,
    kind: suggestion.kind,
    sourceId: suggestion.sourceId,
    reviewerPrincipalRef: decision.actor,
    reviewerRole: decision.role,
    approvedAt: decision.decidedAt,
    policyVersion: REVIEW_INBOX_POLICY_VERSION,
    evaluatedAt: policy.evaluatedAt,
  }
}

/**
 * Evaluate one canonical-action request. The request and policy are accepted
 * as `unknown` because a gate at a trust boundary must reject malformed input
 * rather than trust a caller-side type.
 */
export function evaluateCanonicalAction(
  request: unknown,
  policy: unknown,
): CanonicalActionDecision {
  const normalizedPolicy = normalizePolicy(policy)
  if (!normalizedPolicy.ok) {
    return refused(
      safeSuggestionIdOf(request),
      normalizedPolicy.reason,
      null,
    )
  }
  return evaluateNormalized(request, normalizedPolicy.policy)
}

/**
 * Evaluate every request in a review inbox in order. This never throws for a
 * malformed request and returns one decision per input request.
 */
export function evaluateReviewInbox(
  requests: readonly unknown[],
  policy: unknown,
): CanonicalActionDecision[] {
  if (!Array.isArray(requests)) {
    return [refused(null, 'REQUEST_LIST_INVALID', null)]
  }
  const normalizedPolicy = normalizePolicy(policy)
  if (!normalizedPolicy.ok) {
    return requests.map((request) =>
      refused(safeSuggestionIdOf(request), normalizedPolicy.reason, null),
    )
  }
  return requests.map((request) =>
    evaluateNormalized(request, normalizedPolicy.policy),
  )
}
