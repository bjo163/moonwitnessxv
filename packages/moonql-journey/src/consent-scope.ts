/**
 * The three published audiences, restated here deliberately: `seed.ts` owns the
 * model declaration and this contract must be importable without dragging the
 * addon definition (and therefore the whole `@moonwitness/moonql` runtime) into
 * a caller that only needs the consent rule. The test keeps the two lists equal.
 */
export const SCOPE_ORDER = ['SELF', 'COMMUNITY', 'GLOBAL'] as const

export type ConsentScope = (typeof SCOPE_ORDER)[number]

/**
 * @moonwitness/moonql-journey — M23-02 consent scopes as a pure contract.
 *
 * `SELF`, `COMMUNITY` and `GLOBAL` name an AUDIENCE, never a power. The whole
 * point of the three labels is how far a member's own material may travel; they
 * say nothing about what a member may do to somebody else. A `GLOBAL` grant is
 * therefore the widest reach a member consents to for their own records and the
 * narrowest possible claim on anyone else's: it cannot be read upward into
 * authority over another member's personal account, and it cannot widen a
 * record that its owner declared `SELF`.
 *
 * No store, no request context, no identity provider — the caller supplies the
 * grant and the target, and every refusal names its own reason.
 */

export type ScopeAction = 'read' | 'publish' | 'act'

/** the two target shapes whose consent is decided differently */
export type ScopeTargetKind = 'personal-account' | 'shared-record'

export type ScopeTarget = {
  kind: ScopeTargetKind
  /** who the record or account belongs to */
  ownerRef: string
  /** the audience the owner declared for this exact target */
  declaredScope: ConsentScope
}

export type ScopeGrant = {
  /** the principal holding the grant */
  principalRef: string
  /** the widest audience this principal consented to for their OWN material */
  scope: ConsentScope
  /** `MANDATE_STATUSES` minus the terminal-but-not-consent states */
  state: 'ACTIVE' | 'REVOKED' | 'EXPIRED'
}

export type ScopeDenialCode = 'GRANT_NOT_ACTIVE' | 'PERSONAL_AUTHORITY_PROHIBITED' | 'SCOPE_TOO_NARROW' | 'GRANT_SCOPE_UNREADABLE'

export type ScopeDecision =
  | { allowed: true; basis: 'owner' | 'declared-scope' }
  | { allowed: false; code: ScopeDenialCode }

const isScope = (value: unknown): value is ConsentScope => (SCOPE_ORDER as readonly string[]).includes(String(value))

/** audience rank; unknown scopes rank below everything so they can never win a comparison */
const rank = (scope: ConsentScope): number => SCOPE_ORDER.indexOf(scope)

/**
 * Decide one action against one target for one grant.
 *
 * Order matters: a dead grant is refused before its scope is even looked at, a
 * personal account is protected before any audience comparison, and only then
 * does the declared audience decide.
 */
export function authoriseScopeAction(action: ScopeAction, target: ScopeTarget, grant: ScopeGrant): ScopeDecision {
  if (!isScope(grant.scope) || !isScope(target.declaredScope)) return { allowed: false, code: 'GRANT_SCOPE_UNREADABLE' }

  if (grant.state !== 'ACTIVE') return { allowed: false, code: 'GRANT_NOT_ACTIVE' }

  const owned = grant.principalRef === target.ownerRef

  if (target.kind === 'personal-account' && !owned) {
    /**
     * The M23-02 acceptance in one line: a `GLOBAL` grant is the widest audience
     * its own holder consented to and confers nothing over another member's
     * personal account, for reading, publishing or acting.
     */
    return { allowed: false, code: 'PERSONAL_AUTHORITY_PROHIBITED' }
  }

  if (!owned) {
    // a non-owner may only ever surface a record to the audience its owner declared
    return rank(grant.scope) >= rank(target.declaredScope) && target.declaredScope !== 'SELF'
      ? { allowed: true, basis: 'declared-scope' }
      : { allowed: false, code: 'SCOPE_TOO_NARROW' }
  }

  if (action === 'publish' && rank(grant.scope) < rank(target.declaredScope)) {
    // the owner cannot publish their own record wider than they consented to
    return { allowed: false, code: 'SCOPE_TOO_NARROW' }
  }

  return { allowed: true, basis: 'owner' }
}

/**
 * The one widening this contract refuses to imply: does `scope` authorize
 * anything beyond the holder's own material? Never — kept as a named question so
 * callers cannot accidentally treat the label as a role.
 */
export const impliesAuthorityOverOthers = (scope: ConsentScope): boolean => {
  void scope
  return false
}
