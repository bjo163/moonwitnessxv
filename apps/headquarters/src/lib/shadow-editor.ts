/**
 * M17-05 — SHADOW private-draft and revision-permission contract.
 *
 * This module is the whole authorization surface for a SHADOW draft. It is
 * deliberately **import-free** (no Next, no Hub client, no database, no time,
 * no randomness) so the same rules can be executed by a plain `node:test`
 * process without a request context, and so it cannot quietly acquire a second
 * identity store, a SQL owner or a publication path.
 *
 * What it decides:
 *  - only an authenticated human with the canonical `editor` role (M03-04) may
 *    create a private draft, and the creator becomes its owner;
 *  - a non-owner may read or revise a draft only through an explicit per-draft
 *    grant written by the owner (`read` and `revise` are distinct; `revise`
 *    implies read);
 *  - revisions are append-only and the number is monotonic, so a write built
 *    on an older snapshot is refused as stale;
 *  - every refusal carries only an opaque draft id and a stable reason — never
 *    a draft body, owner identity or grant list;
 *  - nothing becomes public here: a draft's visibility is the literal
 *    `'private'` and there is no publish transition. D08 owns publication
 *    (ADR-0003/M14-01), so `publish` is refused with one stable reason.
 *
 * Durable storage is out of scope. The caller supplies an immutable `ShadowStore`
 * and receives a new one; HQ does not persist it (there is no D07 store yet).
 */

/** Roles that may author a draft: the canonical author role from M03-04. */
export const SHADOW_AUTHOR_ROLES = ['editor'] as const

/**
 * Roles that may hold a per-draft grant and open the workspace shell. It never
 * grants a draft by itself — a grant row is still required per draft.
 */
export const SHADOW_DRAFT_ACCESS_ROLES = ['editor', 'reviewer'] as const

/** Bounded input; an unbounded body is a denial-of-storage shape, not a draft. */
export const SHADOW_LIMITS = Object.freeze({ maxBodyLength: 20000, maxDraftIdLength: 120 })

/** Publication is D08's authority; this contract cannot offer it. */
export const PUBLICATION_AVAILABLE = false as const

export type ShadowOperation = 'read' | 'revise' | 'grant' | 'publish'

export type ShadowReason =
  | 'unauthenticated'
  | 'not_human'
  | 'role_not_permitted'
  | 'invalid_input'
  | 'draft_exists'
  | 'draft_not_found'
  | 'not_owner_or_grantee'
  | 'insufficient_grant'
  | 'not_owner'
  | 'stale_revision'
  | 'publish_not_available'

export interface ShadowActor {
  readonly id: string
  readonly role: string
  readonly kind: 'human' | 'service'
}

/**
 * The request's identity as HQ resolved it. `authenticated: false` is explicit
 * rather than an optional actor, so an absent session can never fall through
 * to an owner comparison with `undefined`.
 */
export type ShadowCaller =
  | { readonly authenticated: true; readonly actor: ShadowActor }
  | { readonly authenticated: false }

export type ShadowGrantPermission = 'read' | 'revise'

export interface ShadowRevision {
  /** Always `previous + 1`; revision 1 is the creation revision. */
  readonly revision: number
  readonly body: string
  /** The identity that wrote this revision (owner or an explicit `revise` grantee). */
  readonly authorId: string
}

export interface ShadowGrant {
  readonly granteeId: string
  readonly permission: ShadowGrantPermission
}

export interface ShadowDraft {
  readonly id: string
  readonly ownerId: string
  /** There is no other member of this union, by design. */
  readonly visibility: 'private'
  readonly revisions: readonly ShadowRevision[]
  readonly grants: readonly ShadowGrant[]
}

export interface ShadowStore {
  readonly drafts: readonly ShadowDraft[]
}

/** The only store this deployment can honestly show: nothing is persisted. */
export const EMPTY_SHADOW_STORE: ShadowStore = Object.freeze({ drafts: Object.freeze([]) })

export interface ShadowDraftRef {
  readonly id: string
  readonly revision: number
}

export interface ShadowDraftView extends ShadowDraftRef {
  readonly body: string
}

/**
 * A refusal is the only failure shape: an opaque draft handle (echoed from the
 * caller's own input, never looked up for display) and one stable reason code.
 */
export interface ShadowRefusal {
  readonly allowed: false
  readonly reason: ShadowReason
  readonly draftId: string | null
}

export type ShadowDecision =
  | {
      readonly allowed: true
      readonly draft: ShadowDraft
      readonly actor: ShadowActor
      readonly via: 'owner' | 'grant:read' | 'grant:revise'
    }
  | ShadowRefusal

export type ShadowReadResult =
  | { readonly allowed: true; readonly draft: ShadowDraftView }
  | ShadowRefusal

export type ShadowWriteResult =
  | { readonly allowed: true; readonly store: ShadowStore; readonly draft: ShadowDraftRef }
  | ShadowRefusal

export interface ShadowWorkspaceSummary {
  readonly canAuthor: boolean
  /** Null when authoring is allowed; otherwise the same stable refusal code. */
  readonly authoringReason: ShadowReason | null
  /** Only drafts the caller may read; owner and grant filtering happens here. */
  readonly drafts: readonly ShadowDraftRef[]
}

const OPERATIONS: readonly string[] = ['read', 'revise', 'grant', 'publish']

function roleHeld(roles: readonly string[], role: unknown): boolean {
  return typeof role === 'string' && roles.includes(role)
}

/** May this actor create a private draft? The canonical editor role only. */
export function canAuthorShadow(actor: Pick<ShadowActor, 'role'>): boolean {
  return roleHeld(SHADOW_AUTHOR_ROLES, actor.role)
}

/** May this actor open the workspace (own drafts or drafts granted to it)? */
export function canOpenShadowWorkspace(actor: Pick<ShadowActor, 'role'>): boolean {
  return roleHeld(SHADOW_DRAFT_ACCESS_ROLES, actor.role)
}

function refuse(reason: ShadowReason, draftId: unknown): ShadowRefusal {
  return {
    allowed: false,
    reason,
    draftId: typeof draftId === 'string' && draftId.length > 0 ? draftId : null,
  }
}

function isOperation(value: unknown): value is ShadowOperation {
  return typeof value === 'string' && OPERATIONS.includes(value)
}

function isDraftId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim() === value &&
    value.length >= 3 &&
    value.length <= SHADOW_LIMITS.maxDraftIdLength
  )
}

function isDraftBody(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= SHADOW_LIMITS.maxBodyLength
  )
}

function isRevisionNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
}

function currentRevision(draft: ShadowDraft): ShadowRevision | undefined {
  return draft.revisions[draft.revisions.length - 1]
}

function findDraft(store: ShadowStore, draftId: unknown): ShadowDraft | undefined {
  if (typeof draftId !== 'string' || draftId.length === 0) return undefined
  return store.drafts.find((draft) => draft.id === draftId)
}

/** The authoring gate, expressed once so create and the summary cannot drift. */
function authoringRefusal(caller: ShadowCaller): ShadowReason | null {
  if (!caller.authenticated) return 'unauthenticated'
  if (caller.actor.kind !== 'human') return 'not_human'
  if (!canAuthorShadow(caller.actor)) return 'role_not_permitted'
  return null
}

/**
 * The single permission decision for an existing draft. Read, revise and grant
 * all pass through here; no caller re-implements ownership or grant matching.
 *
 * Check order is intentional: authentication and human-ness are decided before
 * the draft is even considered, and `publish` is refused before/after the lookup
 * with the same code, so it is not an existence oracle.
 */
export function authorizeDraft(
  store: ShadowStore,
  caller: ShadowCaller,
  draftId: unknown,
  operation: ShadowOperation,
): ShadowDecision {
  const draft = findDraft(store, draftId)
  const subject = draft ? draft.id : draftId

  if (!caller.authenticated) return refuse('unauthenticated', subject)
  if (caller.actor.kind !== 'human') return refuse('not_human', subject)
  if (!isOperation(operation)) return refuse('invalid_input', subject)
  if (operation === 'publish') return refuse('publish_not_available', subject)
  if (!draft) return refuse('draft_not_found', subject)
  if (caller.actor.id === draft.ownerId) {
    return { allowed: true, draft, actor: caller.actor, via: 'owner' }
  }
  if (operation === 'grant') return refuse('not_owner', subject)
  if (!canOpenShadowWorkspace(caller.actor)) return refuse('role_not_permitted', subject)

  const grant = draft.grants.find((entry) => entry.granteeId === caller.actor.id)
  if (!grant) return refuse('not_owner_or_grantee', subject)
  if (operation === 'read') {
    return {
      allowed: true,
      draft,
      actor: caller.actor,
      via: grant.permission === 'revise' ? 'grant:revise' : 'grant:read',
    }
  }
  if (grant.permission !== 'revise') return refuse('insufficient_grant', subject)
  return { allowed: true, draft, actor: caller.actor, via: 'grant:revise' }
}

/** Create a private draft owned by an authenticated human editor. */
export function createDraft(
  store: ShadowStore,
  caller: ShadowCaller,
  input: { readonly draftId: unknown; readonly body: unknown },
): ShadowWriteResult {
  const authoring = authoringRefusal(caller)
  if (authoring) return refuse(authoring, input.draftId)
  if (!caller.authenticated) return refuse('unauthenticated', input.draftId)
  if (!isDraftId(input.draftId)) return refuse('invalid_input', input.draftId)
  if (!isDraftBody(input.body)) return refuse('invalid_input', input.draftId)
  if (findDraft(store, input.draftId)) return refuse('draft_exists', input.draftId)

  const draft: ShadowDraft = {
    id: input.draftId,
    ownerId: caller.actor.id,
    visibility: 'private',
    revisions: [{ revision: 1, body: input.body, authorId: caller.actor.id }],
    grants: [],
  }
  return {
    allowed: true,
    store: { drafts: [...store.drafts, draft] },
    draft: { id: draft.id, revision: 1 },
  }
}

/** Read the current revision of a draft the caller owns or was granted. */
export function readDraft(store: ShadowStore, caller: ShadowCaller, draftId: unknown): ShadowReadResult {
  const decision = authorizeDraft(store, caller, draftId, 'read')
  if (!decision.allowed) return decision
  const revision = currentRevision(decision.draft)
  if (!revision) return refuse('invalid_input', decision.draft.id)
  return {
    allowed: true,
    draft: { id: decision.draft.id, revision: revision.revision, body: revision.body },
  }
}

/**
 * Append a revision. `expectedRevision` must equal the current revision, so a
 * write built on a stale snapshot is refused instead of overwriting newer work.
 */
export function reviseDraft(
  store: ShadowStore,
  caller: ShadowCaller,
  input: { readonly draftId: unknown; readonly expectedRevision: unknown; readonly body: unknown },
): ShadowWriteResult {
  const decision = authorizeDraft(store, caller, input.draftId, 'revise')
  if (!decision.allowed) return decision
  if (!isRevisionNumber(input.expectedRevision) || !isDraftBody(input.body)) {
    return refuse('invalid_input', decision.draft.id)
  }
  const current = currentRevision(decision.draft)
  if (!current) return refuse('invalid_input', decision.draft.id)
  if (input.expectedRevision !== current.revision) {
    return refuse('stale_revision', decision.draft.id)
  }

  const nextDraft: ShadowDraft = {
    ...decision.draft,
    revisions: [
      ...decision.draft.revisions,
      { revision: current.revision + 1, body: input.body, authorId: decision.actor.id },
    ],
  }
  const nextStore: ShadowStore = {
    drafts: store.drafts.map((draft) => (draft.id === nextDraft.id ? nextDraft : draft)),
  }
  return {
    allowed: true,
    store: nextStore,
    draft: { id: nextDraft.id, revision: current.revision + 1 },
  }
}

/**
 * Write (or replace) one explicit per-draft grant. The owner is the only party
 * who may share a draft; granting to the owner is refused as meaningless, and a
 * second grant to the same identity replaces the first rather than stacking.
 */
export function grantAccess(
  store: ShadowStore,
  caller: ShadowCaller,
  input: { readonly draftId: unknown; readonly granteeId: unknown; readonly permission: unknown },
): ShadowWriteResult {
  const decision = authorizeDraft(store, caller, input.draftId, 'grant')
  if (!decision.allowed) return decision
  if (!isDraftId(input.granteeId)) return refuse('invalid_input', decision.draft.id)
  if (input.granteeId === decision.draft.ownerId) return refuse('invalid_input', decision.draft.id)
  if (input.permission !== 'read' && input.permission !== 'revise') {
    return refuse('invalid_input', decision.draft.id)
  }

  const grants: readonly ShadowGrant[] = [
    ...decision.draft.grants.filter((entry) => entry.granteeId !== input.granteeId),
    { granteeId: input.granteeId, permission: input.permission },
  ]
  const nextDraft: ShadowDraft = { ...decision.draft, grants }
  const nextStore: ShadowStore = {
    drafts: store.drafts.map((draft) => (draft.id === nextDraft.id ? nextDraft : draft)),
  }
  const revision = currentRevision(nextDraft)
  return {
    allowed: true,
    store: nextStore,
    draft: { id: nextDraft.id, revision: revision ? revision.revision : 0 },
  }
}

/**
 * What the workspace page may render: whether this caller can author, and only
 * the drafts it is allowed to read. Filtering uses the same decision function as
 * every read, so the page cannot show a private draft the contract refuses.
 */
export function describeWorkspace(store: ShadowStore, caller: ShadowCaller): ShadowWorkspaceSummary {
  const authoring = authoringRefusal(caller)
  const drafts: ShadowDraftRef[] = []
  for (const draft of store.drafts) {
    if (!authorizeDraft(store, caller, draft.id, 'read').allowed) continue
    const revision = currentRevision(draft)
    drafts.push({ id: draft.id, revision: revision ? revision.revision : 0 })
  }
  return { canAuthor: authoring === null, authoringReason: authoring, drafts }
}
