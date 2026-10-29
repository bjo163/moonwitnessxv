/**
 * D12 reviewer-grant contract.
 *
 * Implements the pure lifecycle accepted by
 * [ADR-0015](docs/decisions/ADR-0015-d00-d12-reviewer-grants.md) and designed
 * in docs/design/M20-08-reviewer-grant-store-design.md: `author` and `approve`
 * scope grants bound to a D00 `auth_users.id`, two-admin issuance for approval
 * lanes, mandatory expiry, immediate one-way revocation, supersession, and a
 * fail-closed loader that projects live approval grants into the D08
 * `ReviewerGrant` shape.
 *
 * Deliberately pure: no database, HTTP, route, environment lookup, wall clock
 * or randomness. Time, actor identity, account rows, stored grants and pending
 * TTL are caller-supplied server-side snapshots that a future authorized store
 * would load; this module decides over them and refuses on any inconsistency.
 *
 * Boundaries kept by construction:
 *   - no schema, migration, route, UI or grant is created here;
 *   - login roles are unchanged; a grant is not a D00 role;
 *   - caller-supplied reviewer strings are never authority;
 *   - the loader returns only live `approve` grants and never writes anything;
 *   - D01.TEXT and D08.RIGHTS are not release domains and never load.
 *
 * See docs/audit/M20-09-reviewer-grant-contract.md for evidence and non-claims.
 */

export const REVIEW_GRANT_SCHEMA_VERSION = '1.0.0'

/** Mirrors the D08 release-domain vocabulary without importing its package. */
export const RELEASE_DOMAINS = ['D05_RESEARCH', 'D06_WITNESS', 'D07_STORY'] as const

export type ReleaseDomain = (typeof RELEASE_DOMAINS)[number]

/** Structurally identical to the D08 `ReviewerGrant` input contract. */
export interface ReviewerGrant {
  readonly grantRef: string
  readonly principalRef: string
  readonly role: 'RELEASE_REVIEWER'
  readonly domains: readonly ReleaseDomain[]
  readonly scopes: readonly string[]
  readonly grantedAt: string
  readonly expiresAt: string | null
  readonly revokedAt: string | null
}

/** Closed grant kinds. An approval grant is the only D08 reviewer authority. */
export const GRANT_KINDS = ['author', 'approve'] as const

export type GrantKind = (typeof GRANT_KINDS)[number]

export const GRANT_STATES = ['PENDING_CONFIRMATION', 'ACTIVE', 'EXPIRED', 'REVOKED', 'SUPERSEDED'] as const

export type GrantState = (typeof GRANT_STATES)[number]

export const GRANT_ACTIONS = ['REQUESTED', 'CONFIRMED', 'ISSUED', 'REVOKED', 'SUPERSEDED'] as const

export type GrantAction = (typeof GRANT_ACTIONS)[number]

export const GRANT_OUTCOMES = ['ACCEPTED', 'REJECTED'] as const

export type GrantOutcome = (typeof GRANT_OUTCOMES)[number]

/** Closed lane vocabulary. Wildcards and unknown lanes are refused. */
export const GRANT_LANES = ['D01.TEXT', 'D05.RESEARCH', 'D06.WITNESS', 'D07.STORY', 'D08.RIGHTS'] as const

export type GrantLane = (typeof GRANT_LANES)[number]

/** Ratified V10 mapping. `null` means the lane has no D08 release projection. */
export const LANE_PROJECTIONS: Readonly<Record<GrantLane, { readonly domain: ReleaseDomain; readonly scope: string } | null>> =
  Object.freeze({
    'D01.TEXT': null,
    'D05.RESEARCH': Object.freeze({ domain: 'D05_RESEARCH' as ReleaseDomain, scope: 'public' }),
    'D06.WITNESS': Object.freeze({ domain: 'D06_WITNESS' as ReleaseDomain, scope: 'public' }),
    'D07.STORY': Object.freeze({ domain: 'D07_STORY' as ReleaseDomain, scope: 'public' }),
    'D08.RIGHTS': null,
  })

/** D08 reviewer projection role. It is a mandate label, not a D00 role. */
export const GRANT_REVIEWER_ROLE: ReviewerGrant['role'] = 'RELEASE_REVIEWER'

export type AccountLoginRole = 'admin' | 'user' | 'guest'

export type AccountKind = 'HUMAN' | 'MACHINE'

/** Canonical D00 account row, as loaded by the server-side caller. */
export interface GrantAccount {
  readonly accountRef: string
  readonly kind: AccountKind
  readonly loginRole: AccountLoginRole
  readonly displayName: string | null
  readonly active: boolean
}

/** Verified acting principal. `ACCOUNT_CONTROL` is the automated revocation path. */
export interface GrantActor {
  readonly principalRef: string
  readonly kind: 'HUMAN' | 'ACCOUNT_CONTROL'
}

/** Immutable grant record. State is derived, never stored as authority. */
export interface ReviewScopeGrant {
  readonly schemaVersion: typeof REVIEW_GRANT_SCHEMA_VERSION
  readonly grantRef: string
  readonly accountRef: string
  readonly grantKind: GrantKind
  readonly lane: GrantLane
  readonly issuedByRef: string
  readonly issuedAt: string
  readonly expiresAt: string
  readonly confirmedByRef: string | null
  readonly confirmedAt: string | null
  readonly revokedAt: string | null
  readonly revokedByRef: string | null
  readonly reasonRef: string
  readonly supersedesRef: string | null
}

/** Append-only grant event. Contains no names, content or private evidence. */
export interface GrantEvent {
  readonly eventRef: string
  readonly grantRef: string
  readonly action: GrantAction
  readonly actorRef: string
  readonly at: string
  readonly reasonRef: string
  readonly outcome: GrantOutcome
  readonly refusal: GrantRefusal | null
}

export type GrantRefusal =
  // request shape and context
  | 'GRANT_REQUEST_INVALID'
  | 'GRANT_UNKNOWN_FIELD'
  | 'GRANT_CONTEXT_INVALID'
  | 'GRANT_TIME_INVALID'
  | 'GRANT_STORE_INVALID'
  // actor and account authority
  | 'GRANT_ACTOR_NOT_HUMAN'
  | 'GRANT_ACTOR_NOT_ADMIN'
  | 'GRANT_ACCOUNT_UNKNOWN'
  | 'GRANT_ACCOUNT_INACTIVE'
  | 'GRANT_ACCOUNT_UNNAMED'
  | 'GRANT_ACCOUNT_INELIGIBLE'
  | 'GRANT_SELF_ASSIGNMENT'
  // request semantics
  | 'GRANT_KIND_UNKNOWN'
  | 'GRANT_LANE_UNKNOWN'
  | 'GRANT_EXPIRY_INVALID'
  | 'GRANT_CONFLICT'
  | 'GRANT_ALREADY_LIVE'
  | 'GRANT_SUPERSEDE_INVALID'
  // state transitions
  | 'GRANT_NOT_FOUND'
  | 'GRANT_STATE_INVALID'
  | 'GRANT_CONFIRM_SELF'
  | 'GRANT_PENDING_EXPIRED'
  | 'GRANT_REVOKE_FORBIDDEN'
  // D08 loader vocabulary only
  | 'REVIEWER_NOT_GRANTED'
  | 'REVIEWER_GRANT_REVOKED'
  | 'REVIEWER_GRANT_EXPIRED'
  | 'REVIEWER_SCOPE_MISMATCH'
  | 'ACTOR_NOT_HUMAN'

export interface GrantRequestInput {
  readonly requestId: string
  /** Opaque grant id supplied by the server-side store, never by a request body. */
  readonly grantRef: string
  readonly accountRef: string
  readonly grantKind: GrantKind
  readonly lane: GrantLane
  readonly expiresAt: string
  readonly reasonRef: string
  readonly supersedesRef: string | null
}

export interface GrantConfirmInput {
  readonly grantRef: string
  readonly reasonRef: string
}

export interface GrantRevokeInput {
  readonly grantRef: string
  readonly reasonRef: string
}

export interface GrantStore {
  readonly accounts: readonly GrantAccount[]
  readonly grants: readonly ReviewScopeGrant[]
}

export interface GrantContext extends GrantStore {
  /** Server time; caller timestamps are never trusted. */
  readonly now: string
  readonly actor: GrantActor
  /** Bounded server-evaluated pending TTL. */
  readonly pendingTtlMs: number
}

export interface GrantOperationResult {
  readonly accepted: boolean
  readonly reason: GrantRefusal | null
  readonly grant: ReviewScopeGrant | null
  readonly events: readonly GrantEvent[]
}

export interface LoaderInput {
  readonly principalRef: string
  readonly domain: ReleaseDomain
  readonly scope: string
  /** Server time. */
  readonly at: string
}

export interface ReviewerGrantLoad {
  readonly ok: boolean
  readonly grants: readonly ReviewerGrant[]
  readonly reason: GrantRefusal | null
}

type UnknownRecord = Record<string, unknown>

const ACCOUNT_KEYS: readonly string[] = ['accountRef', 'kind', 'loginRole', 'displayName', 'active']
const GRANT_KEYS: readonly string[] = [
  'schemaVersion',
  'grantRef',
  'accountRef',
  'grantKind',
  'lane',
  'issuedByRef',
  'issuedAt',
  'expiresAt',
  'confirmedByRef',
  'confirmedAt',
  'revokedAt',
  'revokedByRef',
  'reasonRef',
  'supersedesRef',
]
const EVENT_KEYS: readonly string[] = [
  'eventRef',
  'grantRef',
  'action',
  'actorRef',
  'at',
  'reasonRef',
  'outcome',
  'refusal',
]
const CONTEXT_KEYS: readonly string[] = ['accounts', 'grants', 'now', 'actor', 'pendingTtlMs']
const ACTOR_KEYS: readonly string[] = ['principalRef', 'kind']
const REQUEST_KEYS: readonly string[] = [
  'requestId',
  'grantRef',
  'accountRef',
  'grantKind',
  'lane',
  'expiresAt',
  'reasonRef',
  'supersedesRef',
]
const CONFIRM_KEYS: readonly string[] = ['grantRef', 'reasonRef']
const REVOKE_KEYS: readonly string[] = ['grantRef', 'reasonRef']
const LOADER_INPUT_KEYS: readonly string[] = ['principalRef', 'domain', 'scope', 'at']

const DAY_MS = 24 * 60 * 60 * 1000

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isKnown<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value)
}

function hasUnknownKey(raw: UnknownRecord, keys: readonly string[]): boolean {
  return Object.keys(raw).some((key) => !keys.includes(key))
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  Object.freeze(value)
  for (const nested of Object.values(value as UnknownRecord)) deepFreeze(nested)
  return value
}

function frozen<T>(value: T): T {
  return deepFreeze(value)
}

function refused(reason: GrantRefusal, events: readonly GrantEvent[] = []): GrantOperationResult {
  return Object.freeze({ accepted: false, reason, grant: null, events: Object.freeze([...events]) })
}

function eventRefFor(grantRef: string, action: GrantAction, at: string): string {
  return `event:${grantRef}:${action}:${at}`
}

function makeEvent(input: {
  readonly grantRef: string;
  readonly action: GrantAction;
  readonly actorRef: string;
  readonly at: string;
  readonly reasonRef: string;
  readonly outcome: GrantOutcome;
  readonly refusal: GrantRefusal | null;
}): GrantEvent {
  return frozen({
    eventRef: eventRefFor(input.grantRef, input.action, input.at),
    grantRef: input.grantRef,
    action: input.action,
    actorRef: input.actorRef,
    at: input.at,
    reasonRef: input.reasonRef,
    outcome: input.outcome,
    refusal: input.refusal,
  })
}

function rejectedEvent(
  context: { readonly now: string; readonly actor: GrantActor },
  action: GrantAction,
  grantRef: unknown,
  reasonRef: unknown,
  reason: GrantRefusal,
): GrantEvent | null {
  if (!isNonEmptyString(grantRef) || !isNonEmptyString(reasonRef) || !isIsoTimestamp(context.now)) return null
  return makeEvent({
    grantRef,
    action,
    actorRef: context.actor.principalRef,
    at: context.now,
    reasonRef,
    outcome: 'REJECTED',
    refusal: reason,
  })
}

function parseAccount(raw: unknown): GrantAccount | null {
  if (!isRecord(raw) || hasUnknownKey(raw, ACCOUNT_KEYS)) return null
  if (!isNonEmptyString(raw.accountRef)) return null
  if (raw.kind !== 'HUMAN' && raw.kind !== 'MACHINE') return null
  if (!isKnown<AccountLoginRole>(['admin', 'user', 'guest'], raw.loginRole)) return null
  if (raw.displayName !== null && typeof raw.displayName !== 'string') return null
  if (typeof raw.active !== 'boolean') return null
  return {
    accountRef: raw.accountRef,
    kind: raw.kind,
    loginRole: raw.loginRole,
    displayName: raw.displayName,
    active: raw.active,
  }
}

function parseGrant(raw: unknown): ReviewScopeGrant | null {
  if (!isRecord(raw) || hasUnknownKey(raw, GRANT_KEYS)) return null
  if (raw.schemaVersion !== REVIEW_GRANT_SCHEMA_VERSION) return null
  if (
    !isNonEmptyString(raw.grantRef) ||
    !isNonEmptyString(raw.accountRef) ||
    !isNonEmptyString(raw.issuedByRef) ||
    !isNonEmptyString(raw.reasonRef)
  ) {
    return null
  }
  if (!isKnown(GRANT_KINDS, raw.grantKind) || !isKnown(GRANT_LANES, raw.lane)) return null
  if (!isIsoTimestamp(raw.issuedAt) || !isIsoTimestamp(raw.expiresAt)) return null
  if (Date.parse(raw.expiresAt) <= Date.parse(raw.issuedAt)) return null
  if (raw.confirmedByRef !== null && !isNonEmptyString(raw.confirmedByRef)) return null
  if (raw.confirmedAt !== null && !isIsoTimestamp(raw.confirmedAt)) return null
  if ((raw.confirmedByRef === null) !== (raw.confirmedAt === null)) return null
  if (raw.revokedAt !== null && !isIsoTimestamp(raw.revokedAt)) return null
  if (raw.revokedByRef !== null && !isNonEmptyString(raw.revokedByRef)) return null
  if ((raw.revokedAt === null) !== (raw.revokedByRef === null)) return null
  if (raw.supersedesRef !== null && !isNonEmptyString(raw.supersedesRef)) return null
  if (raw.grantKind === 'author' && raw.confirmedByRef !== null) return null
  if (raw.grantKind === 'approve' && raw.confirmedByRef !== null && raw.confirmedByRef === raw.issuedByRef) return null
  return {
    schemaVersion: REVIEW_GRANT_SCHEMA_VERSION,
    grantRef: raw.grantRef,
    accountRef: raw.accountRef,
    grantKind: raw.grantKind,
    lane: raw.lane,
    issuedByRef: raw.issuedByRef,
    issuedAt: raw.issuedAt,
    expiresAt: raw.expiresAt,
    confirmedByRef: raw.confirmedByRef,
    confirmedAt: raw.confirmedAt,
    revokedAt: raw.revokedAt,
    revokedByRef: raw.revokedByRef,
    reasonRef: raw.reasonRef,
    supersedesRef: raw.supersedesRef,
  }
}

function parseStore(store: unknown): GrantStore | null {
  if (!isRecord(store) || hasUnknownKey(store, ['accounts', 'grants'])) return null
  if (!Array.isArray(store.accounts) || !Array.isArray(store.grants)) return null
  const accounts: GrantAccount[] = []
  const accountRefs = new Set<string>()
  for (const raw of store.accounts) {
    const account = parseAccount(raw)
    if (account === null || accountRefs.has(account.accountRef)) return null
    accountRefs.add(account.accountRef)
    accounts.push(account)
  }
  const grants: ReviewScopeGrant[] = []
  const grantRefs = new Set<string>()
  for (const raw of store.grants) {
    const grant = parseGrant(raw)
    if (grant === null || grantRefs.has(grant.grantRef)) return null
    grantRefs.add(grant.grantRef)
    grants.push(grant)
  }
  for (const grant of grants) {
    if (!accountRefs.has(grant.accountRef) || !accountRefs.has(grant.issuedByRef)) return null
    if (grant.confirmedByRef !== null && !accountRefs.has(grant.confirmedByRef)) return null
    if (grant.revokedByRef !== null && !accountRefs.has(grant.revokedByRef)) return null
    if (grant.supersedesRef !== null && !grantRefs.has(grant.supersedesRef)) return null
  }
  return { accounts: frozen(accounts), grants: frozen(grants) }
}

function parseContext(raw: unknown): GrantContext | null {
  if (!isRecord(raw) || hasUnknownKey(raw, CONTEXT_KEYS)) return null
  if (!isIsoTimestamp(raw.now)) return null
  if (typeof raw.pendingTtlMs !== 'number' || !Number.isInteger(raw.pendingTtlMs) || raw.pendingTtlMs <= 0) {
    return null
  }
  if (raw.pendingTtlMs > 30 * DAY_MS) return null
  if (!isRecord(raw.actor) || hasUnknownKey(raw.actor, ACTOR_KEYS)) return null
  if (!isNonEmptyString(raw.actor.principalRef)) return null
  if (raw.actor.kind !== 'HUMAN' && raw.actor.kind !== 'ACCOUNT_CONTROL') return null
  const store = parseStore({ accounts: raw.accounts, grants: raw.grants })
  if (store === null) return null
  return {
    accounts: store.accounts,
    grants: store.grants,
    now: raw.now,
    actor: { principalRef: raw.actor.principalRef, kind: raw.actor.kind },
    pendingTtlMs: raw.pendingTtlMs,
  }
}

/**
 * Derive the lifecycle state from the record, supersession links, server time
 * and the bounded pending TTL. A pending request past its TTL is terminal and
 * carries no authority, so it derives as `EXPIRED`.
 */
export function deriveGrantState(
  grant: ReviewScopeGrant,
  context: { readonly grants: readonly ReviewScopeGrant[]; readonly now: string; readonly pendingTtlMs: number },
): GrantState {
  if (grant.revokedAt !== null) return 'REVOKED'
  if (context.grants.some((other) => other.supersedesRef === grant.grantRef)) return 'SUPERSEDED'
  const nowMs = Date.parse(context.now)
  if (nowMs >= Date.parse(grant.expiresAt)) return 'EXPIRED'
  if (grant.grantKind === 'approve' && grant.confirmedByRef === null) {
    if (nowMs - Date.parse(grant.issuedAt) > context.pendingTtlMs) return 'EXPIRED'
    return 'PENDING_CONFIRMATION'
  }
  return 'ACTIVE'
}

/** A pending or active record still occupies the account/kind/lane slot. */
function occupiesSlot(grant: ReviewScopeGrant, context: GrantContext): boolean {
  const state = deriveGrantState(grant, context)
  return state === 'ACTIVE' || state === 'PENDING_CONFIRMATION'
}

function accountReason(account: GrantAccount | undefined, requireAdmin: boolean): GrantRefusal | null {
  if (account === undefined) return 'GRANT_ACCOUNT_UNKNOWN'
  if (!account.active) return 'GRANT_ACCOUNT_INACTIVE'
  if (account.kind !== 'HUMAN') return 'GRANT_ACCOUNT_INELIGIBLE'
  if (!isNonEmptyString(account.displayName)) return 'GRANT_ACCOUNT_UNNAMED'
  if (account.loginRole !== 'user' && account.loginRole !== 'admin') return 'GRANT_ACCOUNT_INELIGIBLE'
  if (requireAdmin && account.loginRole !== 'admin') return 'GRANT_ACTOR_NOT_ADMIN'
  return null
}

function checkAdminActor(context: GrantContext): GrantRefusal | null {
  if (context.actor.kind !== 'HUMAN') return 'GRANT_ACTOR_NOT_HUMAN'
  const actorAccount = context.accounts.find((entry) => entry.accountRef === context.actor.principalRef)
  return accountReason(actorAccount, true)
}

/**
 * Request one grant for one account/kind/lane.
 *
 * `author` grants issue immediately (`ISSUED`). `approve` grants stay
 * `PENDING_CONFIRMATION` until a second, distinct admin confirms them. A live
 * grant for the same slot must be replaced through `supersedesRef`; a live
 * opposite-kind grant for the same lane is a conflict. Rejected attempts never
 * create or change a grant.
 */
export function requestGrant(request: unknown, context: unknown): GrantOperationResult {
  const ctx = parseContext(context)
  if (ctx === null) return refused('GRANT_CONTEXT_INVALID')
  if (!isRecord(request)) return refused('GRANT_REQUEST_INVALID')
  if (hasUnknownKey(request, REQUEST_KEYS)) return refused('GRANT_UNKNOWN_FIELD')
  const reasonRef = request.reasonRef
  const grantRef = request.grantRef

  const reject = (reason: GrantRefusal): GrantOperationResult => {
    const event = rejectedEvent(ctx, 'REQUESTED', grantRef, reasonRef, reason)
    return refused(reason, event === null ? [] : [event])
  }

  if (
    !isNonEmptyString(request.requestId) ||
    !isNonEmptyString(grantRef) ||
    !isNonEmptyString(request.accountRef) ||
    !isNonEmptyString(reasonRef)
  ) {
    return reject('GRANT_REQUEST_INVALID')
  }
  if (!isKnown(GRANT_KINDS, request.grantKind)) return reject('GRANT_KIND_UNKNOWN')
  if (!isKnown(GRANT_LANES, request.lane)) return reject('GRANT_LANE_UNKNOWN')
  if (!isIsoTimestamp(request.expiresAt)) return reject('GRANT_EXPIRY_INVALID')
  if (request.supersedesRef !== null && !isNonEmptyString(request.supersedesRef)) {
    return reject('GRANT_REQUEST_INVALID')
  }
  if (ctx.grants.some((grant) => grant.grantRef === grantRef)) return reject('GRANT_STORE_INVALID')

  if (Date.parse(request.expiresAt) <= Date.parse(ctx.now)) return reject('GRANT_EXPIRY_INVALID')

  const actorReason = checkAdminActor(ctx)
  if (actorReason !== null) return reject(actorReason)

  const grantee = ctx.accounts.find((entry) => entry.accountRef === request.accountRef)
  const granteeReason = accountReason(grantee, false)
  if (granteeReason !== null) return reject(granteeReason)

  if (request.accountRef === ctx.actor.principalRef) return reject('GRANT_SELF_ASSIGNMENT')

  const sameSlot = ctx.grants.filter(
    (grant) =>
      grant.accountRef === request.accountRef &&
      grant.grantKind === request.grantKind &&
      grant.lane === request.lane &&
      occupiesSlot(grant, ctx),
  )
  if (request.supersedesRef === null && sameSlot.length > 0) return reject('GRANT_ALREADY_LIVE')
  if (request.supersedesRef !== null) {
    const superseded = sameSlot.find((grant) => grant.grantRef === request.supersedesRef)
    if (superseded === undefined || sameSlot.length !== 1) return reject('GRANT_SUPERSEDE_INVALID')
    if (deriveGrantState(superseded, ctx) !== 'ACTIVE') return reject('GRANT_SUPERSEDE_INVALID')
  }

  const oppositeKind: GrantKind = request.grantKind === 'author' ? 'approve' : 'author'
  const conflict = ctx.grants.some(
    (grant) =>
      grant.accountRef === request.accountRef &&
      grant.lane === request.lane &&
      grant.grantKind === oppositeKind &&
      occupiesSlot(grant, ctx),
  )
  if (conflict) return reject('GRANT_CONFLICT')

  const grant: ReviewScopeGrant = frozen({
    schemaVersion: REVIEW_GRANT_SCHEMA_VERSION,
    grantRef,
    accountRef: request.accountRef,
    grantKind: request.grantKind,
    lane: request.lane,
    issuedByRef: ctx.actor.principalRef,
    issuedAt: ctx.now,
    expiresAt: request.expiresAt,
    confirmedByRef: null,
    confirmedAt: null,
    revokedAt: null,
    revokedByRef: null,
    reasonRef,
    supersedesRef: request.supersedesRef,
  })

  const events: GrantEvent[] = []
  if (request.supersedesRef !== null) {
    const superseded = ctx.grants.find((entry) => entry.grantRef === request.supersedesRef) as ReviewScopeGrant
    events.push(
      makeEvent({
        grantRef: superseded.grantRef,
        action: 'SUPERSEDED',
        actorRef: ctx.actor.principalRef,
        at: ctx.now,
        reasonRef,
        outcome: 'ACCEPTED',
        refusal: null,
      }),
    )
  }

  const action: GrantAction = request.grantKind === 'author' ? 'ISSUED' : 'REQUESTED'
  events.push(
    makeEvent({
      grantRef: grant.grantRef,
      action,
      actorRef: ctx.actor.principalRef,
      at: ctx.now,
      reasonRef,
      outcome: 'ACCEPTED',
      refusal: null,
    }),
  )

  return Object.freeze({ accepted: true, reason: null, grant, events: Object.freeze(events) })
}

/**
 * Confirm a pending `approve` grant.
 *
 * The confirmer is the verified D00 principal in the context, must be an
 * active admin, and must differ from both the issuer and the grantee. A
 * confirmation after the pending TTL is refused and the grant never activates.
 */
export function confirmGrant(request: unknown, context: unknown): GrantOperationResult {
  const ctx = parseContext(context)
  if (ctx === null) return refused('GRANT_CONTEXT_INVALID')
  if (!isRecord(request)) return refused('GRANT_REQUEST_INVALID')
  if (hasUnknownKey(request, CONFIRM_KEYS)) return refused('GRANT_UNKNOWN_FIELD')
  if (!isNonEmptyString(request.grantRef) || !isNonEmptyString(request.reasonRef)) {
    return refused('GRANT_REQUEST_INVALID')
  }

  const reject = (reason: GrantRefusal, grantRef: string): GrantOperationResult => {
    const event = rejectedEvent(ctx, 'CONFIRMED', grantRef, request.reasonRef as string, reason)
    return refused(reason, event === null ? [] : [event])
  }

  const grant = ctx.grants.find((entry) => entry.grantRef === request.grantRef)
  if (grant === undefined) return reject('GRANT_NOT_FOUND', request.grantRef)
  if (grant.grantKind !== 'approve') return reject('GRANT_STATE_INVALID', grant.grantRef)

  const nowMs = Date.parse(ctx.now)
  const elapsedMs = nowMs - Date.parse(grant.issuedAt)
  if (grant.confirmedByRef === null && nowMs < Date.parse(grant.expiresAt) && elapsedMs > ctx.pendingTtlMs) {
    return reject('GRANT_PENDING_EXPIRED', grant.grantRef)
  }
  const state = deriveGrantState(grant, ctx)
  if (state !== 'PENDING_CONFIRMATION') return reject('GRANT_STATE_INVALID', grant.grantRef)

  if (ctx.actor.kind !== 'HUMAN') return reject('GRANT_ACTOR_NOT_HUMAN', grant.grantRef)
  const confirmer = ctx.accounts.find((entry) => entry.accountRef === ctx.actor.principalRef)
  const actorReason = accountReason(confirmer, true)
  if (actorReason !== null) return reject(actorReason, grant.grantRef)

  if (ctx.actor.principalRef === grant.issuedByRef || ctx.actor.principalRef === grant.accountRef) {
    return reject('GRANT_CONFIRM_SELF', grant.grantRef)
  }

  const grantee = ctx.accounts.find((entry) => entry.accountRef === grant.accountRef)
  const granteeReason = accountReason(grantee, false)
  if (granteeReason !== null) return reject(granteeReason, grant.grantRef)
  if (nowMs >= Date.parse(grant.expiresAt)) return reject('GRANT_STATE_INVALID', grant.grantRef)

  const confirmed: ReviewScopeGrant = frozen({
    ...grant,
    confirmedByRef: ctx.actor.principalRef,
    confirmedAt: ctx.now,
  })
  const event = makeEvent({
    grantRef: grant.grantRef,
    action: 'CONFIRMED',
    actorRef: ctx.actor.principalRef,
    at: ctx.now,
    reasonRef: request.reasonRef,
    outcome: 'ACCEPTED',
    refusal: null,
  })
  return Object.freeze({ accepted: true, reason: null, grant: confirmed, events: Object.freeze([event]) })
}

/**
 * Revoke a pending or active grant. Allowed for an active admin (issuer or any
 * other admin) and for the automated account-control process. Revocation is
 * immediate, one-way and never clears an earlier revocation.
 */
export function revokeGrant(request: unknown, context: unknown): GrantOperationResult {
  const ctx = parseContext(context)
  if (ctx === null) return refused('GRANT_CONTEXT_INVALID')
  if (!isRecord(request)) return refused('GRANT_REQUEST_INVALID')
  if (hasUnknownKey(request, REVOKE_KEYS)) return refused('GRANT_UNKNOWN_FIELD')
  if (!isNonEmptyString(request.grantRef) || !isNonEmptyString(request.reasonRef)) {
    return refused('GRANT_REQUEST_INVALID')
  }

  const reject = (reason: GrantRefusal, grantRef: string): GrantOperationResult => {
    const event = rejectedEvent(ctx, 'REVOKED', grantRef, request.reasonRef as string, reason)
    return refused(reason, event === null ? [] : [event])
  }

  const grant = ctx.grants.find((entry) => entry.grantRef === request.grantRef)
  if (grant === undefined) return reject('GRANT_NOT_FOUND', request.grantRef)
  if (grant.revokedAt !== null) return reject('GRANT_STATE_INVALID', grant.grantRef)

  if (ctx.actor.kind === 'HUMAN') {
    const actorAccount = ctx.accounts.find((entry) => entry.accountRef === ctx.actor.principalRef)
    const actorReason = accountReason(actorAccount, true)
    if (actorReason !== null) {
      return reject(actorReason === 'GRANT_ACTOR_NOT_ADMIN' ? 'GRANT_REVOKE_FORBIDDEN' : actorReason, grant.grantRef)
    }
  }

  const state = deriveGrantState(grant, ctx)
  if (state !== 'ACTIVE' && state !== 'PENDING_CONFIRMATION') {
    return reject('GRANT_STATE_INVALID', grant.grantRef)
  }

  const revoked: ReviewScopeGrant = frozen({
    ...grant,
    revokedAt: ctx.now,
    revokedByRef: ctx.actor.principalRef,
  })
  const event = makeEvent({
    grantRef: grant.grantRef,
    action: 'REVOKED',
    actorRef: ctx.actor.principalRef,
    at: ctx.now,
    reasonRef: request.reasonRef,
    outcome: 'ACCEPTED',
    refusal: null,
  })
  return Object.freeze({ accepted: true, reason: null, grant: revoked, events: Object.freeze([event]) })
}

function loadRefused(reason: GrantRefusal): ReviewerGrantLoad {
  return Object.freeze({ ok: false, grants: Object.freeze([]), reason })
}

/**
 * Project live approval grants for one verified principal into the exact D08
 * `ReviewerGrant` shape. Read-only, request-scoped and fail-closed: an
 * unreadable or inconsistent store, an unknown lane, or any state other than
 * live `ACTIVE` yields no authority. Caller-supplied grants are never accepted.
 */
export function loadReviewerGrants(input: unknown, store: unknown): ReviewerGrantLoad {
  const parsedStore = parseStore(store)
  if (parsedStore === null) return loadRefused('REVIEWER_NOT_GRANTED')
  if (!isRecord(input) || hasUnknownKey(input, LOADER_INPUT_KEYS)) return loadRefused('REVIEWER_NOT_GRANTED')
  const principalRef = input.principalRef
  const domain = input.domain
  const scope = input.scope
  const at = input.at
  if (!isNonEmptyString(principalRef) || !isKnown(RELEASE_DOMAINS, domain) || !isNonEmptyString(scope) || !isIsoTimestamp(at)) {
    return loadRefused('REVIEWER_NOT_GRANTED')
  }

  const account = parsedStore.accounts.find((entry) => entry.accountRef === principalRef)
  if (account === undefined) return loadRefused('REVIEWER_NOT_GRANTED')
  if (account.kind !== 'HUMAN') return loadRefused('ACTOR_NOT_HUMAN')
  if (!account.active || !isNonEmptyString(account.displayName)) return loadRefused('REVIEWER_NOT_GRANTED')
  if (account.loginRole === 'guest') return loadRefused('REVIEWER_NOT_GRANTED')

  const approvalGrants = parsedStore.grants.filter(
    (grant) => grant.accountRef === principalRef && grant.grantKind === 'approve',
  )
  if (approvalGrants.length === 0) return loadRefused('REVIEWER_NOT_GRANTED')

  const derived = approvalGrants.map((grant) => ({
    grant,
    state: deriveGrantState(grant, {
      grants: parsedStore.grants,
      now: at,
      pendingTtlMs: Number.POSITIVE_INFINITY,
    }),
  }))
  const active = derived.filter((entry) => entry.state === 'ACTIVE')
  if (active.length === 0) {
    if (derived.some((entry) => entry.state === 'REVOKED')) return loadRefused('REVIEWER_GRANT_REVOKED')
    if (derived.some((entry) => entry.state === 'EXPIRED')) return loadRefused('REVIEWER_GRANT_EXPIRED')
    return loadRefused('REVIEWER_NOT_GRANTED')
  }

  const matched = active.filter((entry) => {
    const projection = LANE_PROJECTIONS[entry.grant.lane]
    return projection !== null && projection.domain === domain && projection.scope === scope
  })
  if (matched.length === 0) return loadRefused('REVIEWER_SCOPE_MISMATCH')

  const grants: ReviewerGrant[] = matched
    .map(({ grant }) => {
      const projection = LANE_PROJECTIONS[grant.lane]
      if (projection === null) throw new TypeError('unmapped lane reached the projection')
      return frozen({
        grantRef: grant.grantRef,
        principalRef: grant.accountRef,
        role: GRANT_REVIEWER_ROLE,
        domains: [projection.domain],
        scopes: [projection.scope],
        grantedAt: grant.confirmedAt as string,
        expiresAt: grant.expiresAt,
        revokedAt: grant.revokedAt,
      })
    })
    .sort((left, right) => (left.grantRef < right.grantRef ? -1 : left.grantRef > right.grantRef ? 1 : 0))

  return Object.freeze({ ok: true, grants: frozen(grants), reason: null })
}

/** Strict parse used by store adapters before persisting an event row. */
export function parseGrantEvent(raw: unknown): GrantEvent | null {
  if (!isRecord(raw) || hasUnknownKey(raw, EVENT_KEYS)) return null
  if (!isNonEmptyString(raw.eventRef) || !isNonEmptyString(raw.grantRef)) return null
  if (!isKnown(GRANT_ACTIONS, raw.action)) return null
  if (!isNonEmptyString(raw.actorRef) || !isIsoTimestamp(raw.at) || !isNonEmptyString(raw.reasonRef)) return null
  if (!isKnown(GRANT_OUTCOMES, raw.outcome)) return null
  if (raw.outcome === 'ACCEPTED' && raw.refusal !== null) return null
  if (raw.outcome === 'REJECTED' && typeof raw.refusal !== 'string') return null
  return frozen({
    eventRef: raw.eventRef,
    grantRef: raw.grantRef,
    action: raw.action,
    actorRef: raw.actorRef,
    at: raw.at,
    reasonRef: raw.reasonRef,
    outcome: raw.outcome,
    refusal: raw.refusal as GrantRefusal | null,
  })
}
