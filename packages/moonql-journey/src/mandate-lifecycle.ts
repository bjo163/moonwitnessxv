import { authoriseScopeAction, SCOPE_ORDER, type ConsentScope } from './consent-scope.js'

/**
 * @moonwitness/moonql-journey — M23-03 human mandate lifecycle.
 *
 * The published `journey_mandates` model already carries a responsible operator,
 * a status and an expiry, but it cannot say HOW it got there: who consented, at
 * which audience, when, and who revoked it and why. This contract is that model —
 * Path → Journey → Milestone → Mandate, with the consent and the revoke kept as
 * recorded events rather than as a status someone typed in.
 *
 * Two rules are load-bearing. First, `status` is never trusted as an input:
 * expiry is computed from `expiresAt` against the clock the caller supplies, so
 * a record cannot claim to be ACTIVE one second after it expired, and a revoke
 * only ever exists as an event with an actor and a reason. Second, the mandate's
 * own audience is checked through the M23-02 consent contract, so publishing a
 * mandate wider than its holder consented to is refused for the same reason a
 * personal account is protected.
 *
 * Pure and store-free: nothing here opens a database or widens an ACL. Persisting
 * these records is a separate, separately authorized schema step.
 */

export type MilestoneRef = { pathRef: string; journeyRef: string; milestoneRef: string }

export type MandateConsent = {
  holderRef: string
  scope: ConsentScope
  consentedAt: string
}

export type MandateEvent =
  | { kind: 'delivered'; by: string; at: string }
  | { kind: 'revoked'; by: string; at: string; reason: string }

export type MandateRecord = {
  id: string
  milestone: MilestoneRef
  /** the accountable voluntary human, always a pseudonym */
  operatorPseudonym: string
  deliverable: string
  consent: MandateConsent
  expiresAt: string
  events: readonly MandateEvent[]
}

export type ResolvedStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'DELIVERED'

export type MandateIssueInput = {
  id: string
  milestone: MilestoneRef
  operatorPseudonym: string
  deliverable: string
  consent: MandateConsent
  expiresAt: string
}

export type MandateErrorCode =
  | 'MISSING_IDENTIFIER'
  | 'MISSING_MILESTONE_PATH'
  | 'NO_RESPONSIBLE_OPERATOR'
  | 'NO_DELIVERABLE'
  | 'CONSENT_SCOPE_UNREADABLE'
  | 'CONSENT_NOT_RECORDED'
  | 'CONSENT_AFTER_EXPIRY'
  | 'FUTURE_TIMESTAMP'
  | 'UNRECOGNISED_EVENT'
  | 'ALREADY_TERMINAL'
  | 'REVOKE_NEEDS_ACTOR_AND_REASON'
  | 'AUDIENCE_BEYOND_CONSENT'

export type MandateResult<T> = { ok: true; value: T } | { ok: false; code: MandateErrorCode }

const ok = <T,>(value: T): MandateResult<T> => ({ ok: true, value })
const fail = (code: MandateErrorCode): MandateResult<never> => ({ ok: false, code })

const isTimestamp = (value: string): boolean => !Number.isNaN(Date.parse(value))
const isPseudonym = (value: string): boolean => typeof value === 'string' && value.trim().length > 0

/** validate and freeze the mandate's origin: consent, operator and expiry */
export function issueMandate(input: MandateIssueInput, now: string): MandateResult<MandateRecord> {
  if (!isPseudonym(input.id)) return fail('MISSING_IDENTIFIER')
  if (!isPseudonym(input.milestone.pathRef) || !isPseudonym(input.milestone.journeyRef) || !isPseudonym(input.milestone.milestoneRef)) {
    return fail('MISSING_MILESTONE_PATH')
  }
  if (!isPseudonym(input.operatorPseudonym)) return fail('NO_RESPONSIBLE_OPERATOR')
  if (!isPseudonym(input.deliverable)) return fail('NO_DELIVERABLE')
  if (!(SCOPE_ORDER as readonly string[]).includes(String(input.consent.scope))) return fail('CONSENT_SCOPE_UNREADABLE')
  if (!isTimestamp(input.consent.consentedAt) || !isPseudonym(input.consent.holderRef)) return fail('CONSENT_NOT_RECORDED')
  if (!isTimestamp(input.expiresAt)) return fail('CONSENT_NOT_RECORDED')
  if (Date.parse(input.expiresAt) < Date.parse(input.consent.consentedAt)) return fail('CONSENT_AFTER_EXPIRY')
  if (Date.parse(input.consent.consentedAt) > Date.parse(now)) return fail('FUTURE_TIMESTAMP')

  return ok({
    id: input.id,
    milestone: { ...input.milestone },
    operatorPseudonym: input.operatorPseudonym.trim(),
    deliverable: input.deliverable,
    consent: { ...input.consent },
    expiresAt: input.expiresAt,
    events: [],
  })
}

/**
 * The status is derived, never stored: a revoke wins, then delivery, then the
 * clock. An unparseable expiry can only ever be ACTIVE until someone revokes it,
 * because a missing deadline is not evidence that the mandate ended.
 */
export function resolveStatus(mandate: MandateRecord, now: string): ResolvedStatus {
  if (mandate.events.some((event) => event.kind === 'revoked')) return 'REVOKED'
  if (mandate.events.some((event) => event.kind === 'delivered')) return 'DELIVERED'
  const expires = Date.parse(mandate.expiresAt)
  const at = Date.parse(now)
  if (!Number.isNaN(expires) && !Number.isNaN(at) && at >= expires) return 'EXPIRED'
  return 'ACTIVE'
}

function append(mandate: MandateRecord, event: MandateEvent, now: string): MandateResult<MandateRecord> {
  const terminal = resolveStatus(mandate, now)
  if (terminal === 'REVOKED' || terminal === 'DELIVERED') return fail('ALREADY_TERMINAL')
  if (Date.parse(event.at) > Date.parse(now)) return fail('FUTURE_TIMESTAMP')
  return ok({ ...mandate, events: [...mandate.events, event] })
}

/** a revoke is a recorded act: an actor, a moment and a reason, or nothing */
export function revokeMandate(mandate: MandateRecord, by: string, at: string, reason: string, now: string): MandateResult<MandateRecord> {
  if (!isPseudonym(by) || !isPseudonym(reason) || !isTimestamp(at)) return fail('REVOKE_NEEDS_ACTOR_AND_REASON')
  return append(mandate, { kind: 'revoked', by: by.trim(), at, reason: reason.trim() }, now)
}

export function recordDelivery(mandate: MandateRecord, by: string, at: string, now: string): MandateResult<MandateRecord> {
  if (!isPseudonym(by) || !isTimestamp(at)) return fail('UNRECOGNISED_EVENT')
  return append(mandate, { kind: 'delivered', by: by.trim(), at }, now)
}

/**
 * May this mandate's text be surfaced to `audience`? The holder's own consented
 * scope is the ceiling: a `SELF` mandate never reaches the community or the
 * world, whatever the platform's reach is. The audience ordering is the one the
 * M23-02 consent contract publishes, so the two cannot drift apart.
 */
export function publishableTo(mandate: MandateRecord, audience: ConsentScope): boolean {
  if (!(SCOPE_ORDER as readonly string[]).includes(String(audience))) return false
  return SCOPE_ORDER.indexOf(audience) <= SCOPE_ORDER.indexOf(mandate.consent.scope)
}

/**
 * May `principalRef` act on the mandate itself? Answered by the M23-02 contract,
 * so a wider audience is never mistaken for authority over someone else's
 * account: only the holder may act on their own mandate.
 */
export function actionableBy(mandate: MandateRecord, principalRef: string, scope: ConsentScope): boolean {
  const decision = authoriseScopeAction(
    'act',
    { kind: 'personal-account', ownerRef: mandate.consent.holderRef, declaredScope: mandate.consent.scope },
    { principalRef, scope, state: 'ACTIVE' },
  )
  return decision.allowed
}

/** the accountable human behind a mandate, for a queue or audit line */
export const responsibleOperator = (mandate: MandateRecord): string => mandate.operatorPseudonym
