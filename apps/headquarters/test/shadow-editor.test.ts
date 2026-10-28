/**
 * M17-05 — SHADOW private-draft and revision-permission contract.
 *
 * Positive flows: an editor creates a private draft, revises it monotonically,
 * and shares it with an explicit per-draft grant. Negative flows: anonymous and
 * non-human callers, a non-editor role, a non-owner without a grant, a read-only
 * grantee trying to revise, a stale expected revision, a cross-draft read and
 * malformed input. All refusals are checked for shape: opaque id + reason only,
 * never a draft body or an identity value.
 *
 * Two structural checks pin the host wiring: the contract stays import-free, and
 * the HQ page renders only through the contract (no local permission logic, no
 * server action, no publish control).
 */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { shadowCopy } from '../src/app/(admin)/shadow/locale-copy.js'
import {
  EMPTY_SHADOW_STORE,
  PUBLICATION_AVAILABLE,
  SHADOW_AUTHOR_ROLES,
  SHADOW_DRAFT_ACCESS_ROLES,
  SHADOW_LIMITS,
  authorizeDraft,
  canAuthorShadow,
  canOpenShadowWorkspace,
  createDraft,
  describeWorkspace,
  grantAccess,
  readDraft,
  reviseDraft,
  type ShadowCaller,
  type ShadowDecision,
  type ShadowReadResult,
  type ShadowReason,
  type ShadowRefusal,
  type ShadowStore,
  type ShadowWriteResult,
} from '../src/lib/shadow-editor.js'

const OWNER: ShadowCaller = {
  authenticated: true,
  actor: { id: 'user-synthetic-owner', role: 'editor', kind: 'human' },
}
const OTHER_EDITOR: ShadowCaller = {
  authenticated: true,
  actor: { id: 'user-synthetic-other-editor', role: 'editor', kind: 'human' },
}
const REVIEWER: ShadowCaller = {
  authenticated: true,
  actor: { id: 'user-synthetic-reviewer', role: 'reviewer', kind: 'human' },
}
const VIEWER: ShadowCaller = {
  authenticated: true,
  actor: { id: 'user-synthetic-viewer', role: 'viewer', kind: 'human' },
}
const SERVICE: ShadowCaller = {
  authenticated: true,
  actor: { id: 'service-synthetic-worker', role: 'editor', kind: 'service' },
}
const ANONYMOUS: ShadowCaller = { authenticated: false }

/** synthetic markers: nothing here is a witness body or a credential */
const BODY_V1 = 'synthetic private draft body v1'
const BODY_V2 = 'synthetic private draft body v2'
const BODY_V3 = 'synthetic private draft body v3'
const ALPHA = 'draft-alpha'
const BETA = 'draft-beta'

type AnyShadowResult = ShadowDecision | ShadowReadResult | ShadowWriteResult

function expectAllowedWrite(result: ShadowWriteResult): Extract<ShadowWriteResult, { allowed: true }> {
  if (!result.allowed) assert.fail(`expected an allowed write, refused with ${result.reason}`)
  return result
}

function expectRefusal(result: AnyShadowResult, reason: ShadowReason): ShadowRefusal {
  assert.equal(result.allowed, false, `expected refusal ${reason}`)
  if (result.allowed) assert.fail(`expected refusal ${reason}`)
  assert.equal(result.reason, reason)
  assert.deepEqual(
    Object.keys(result).sort(),
    ['allowed', 'draftId', 'reason'],
    'a refusal carries only an opaque draft id and a stable reason',
  )
  return result
}

function seeded(): { store: ShadowStore; ref: Extract<ShadowWriteResult, { allowed: true }> } {
  const created = expectAllowedWrite(createDraft(EMPTY_SHADOW_STORE, OWNER, { draftId: ALPHA, body: BODY_V1 }))
  return { store: created.store, ref: created }
}

const SECRET_MARKERS = [
  BODY_V1,
  BODY_V2,
  BODY_V3,
  OWNER.authenticated ? OWNER.actor.id : '',
  REVIEWER.authenticated ? REVIEWER.actor.id : '',
  'Bearer',
  'token=',
  'password=',
]

function assertNoDraftData(refusal: ShadowRefusal, label: string): void {
  const rendered = JSON.stringify(refusal)
  for (const marker of SECRET_MARKERS) {
    assert.ok(marker.length > 0 && !rendered.includes(marker), `${label} leaked ${marker}`)
  }
}

// ------------------------------------------------- 1. create: positive and negative

void test('an authenticated human editor creates a private draft at revision 1', () => {
  const created = expectAllowedWrite(createDraft(EMPTY_SHADOW_STORE, OWNER, { draftId: ALPHA, body: BODY_V1 }))

  assert.deepEqual(created.draft, { id: ALPHA, revision: 1 })
  assert.equal(created.store.drafts.length, 1)
  const draft = created.store.drafts[0]
  assert.equal(draft.id, ALPHA)
  assert.equal(draft.ownerId, 'user-synthetic-owner')
  assert.equal(draft.visibility, 'private', 'the only visibility this contract can create is private')
  assert.deepEqual(draft.grants, [], 'no implicit sharing on creation')
  assert.deepEqual(draft.revisions, [{ revision: 1, body: BODY_V1, authorId: 'user-synthetic-owner' }])

  assert.equal(EMPTY_SHADOW_STORE.drafts.length, 0, 'the caller-supplied store is never mutated')
})

void test('only an authenticated human editor may create: every other caller is refused before input', () => {
  const cases: ReadonlyArray<{ caller: ShadowCaller; reason: ShadowReason }> = [
    { caller: ANONYMOUS, reason: 'unauthenticated' },
    { caller: SERVICE, reason: 'not_human' },
    { caller: VIEWER, reason: 'role_not_permitted' },
    { caller: REVIEWER, reason: 'role_not_permitted' },
  ]

  for (const { caller, reason } of cases) {
    // a malformed body must not change the refusal: identity is decided first
    const result = createDraft(EMPTY_SHADOW_STORE, caller, { draftId: ALPHA, body: '' })
    expectRefusal(result, reason)
    assert.ok(!('store' in result), 'a refused create returns no store')
  }
  assert.equal(EMPTY_SHADOW_STORE.drafts.length, 0, 'nothing was written')
})

// ---------------------------------------------- 2. owner read/revise and monotonicity

void test('the owner reads the current revision and revisions increase monotonically', () => {
  const { store } = seeded()

  const first = readDraft(store, OWNER, ALPHA)
  if (!first.allowed) assert.fail(`owner read refused: ${first.reason}`)
  assert.deepEqual(first.draft, { id: ALPHA, revision: 1, body: BODY_V1 })

  const second = expectAllowedWrite(reviseDraft(store, OWNER, { draftId: ALPHA, expectedRevision: 1, body: BODY_V2 }))
  assert.deepEqual(second.draft, { id: ALPHA, revision: 2 })
  assert.equal(store.drafts[0].revisions.length, 1, 'the revision is appended to a new store, not the old one')

  const third = expectAllowedWrite(reviseDraft(second.store, OWNER, { draftId: ALPHA, expectedRevision: 2, body: BODY_V3 }))
  assert.deepEqual(third.draft, { id: ALPHA, revision: 3 })

  const current = readDraft(third.store, OWNER, ALPHA)
  if (!current.allowed) assert.fail(`owner read refused: ${current.reason}`)
  assert.deepEqual(current.draft, { id: ALPHA, revision: 3, body: BODY_V3 })
  assert.deepEqual(
    third.store.drafts[0].revisions.map((revision) => revision.revision),
    [1, 2, 3],
    'revision numbers are append-only and strictly increasing',
  )
})

void test('a write built on a stale or future revision is refused and changes nothing', () => {
  const { store } = seeded()
  const second = expectAllowedWrite(reviseDraft(store, OWNER, { draftId: ALPHA, expectedRevision: 1, body: BODY_V2 }))

  // current revision is 2: an older snapshot and a future number are both stale
  for (const expectedRevision of [1, 99]) {
    const refusal = expectRefusal(
      reviseDraft(second.store, OWNER, { draftId: ALPHA, expectedRevision, body: BODY_V3 }),
      'stale_revision',
    )
    assert.equal(refusal.draftId, ALPHA, 'the refusal names only the opaque draft handle')
  }
  // a value that is not a revision number is malformed, not stale
  for (const expectedRevision of [0, 1.5, '2', null, undefined]) {
    expectRefusal(
      reviseDraft(second.store, OWNER, { draftId: ALPHA, expectedRevision, body: BODY_V3 }),
      'invalid_input',
    )
  }
  assert.equal(second.store.drafts[0].revisions.length, 2, 'no stale write appended a revision')
})

// ------------------------------------------------- 3. explicit grants and cross-draft

void test('a non-owner needs an explicit grant; read never implies revise, and grants are per draft', () => {
  const { store } = seeded()

  expectRefusal(readDraft(store, OTHER_EDITOR, ALPHA), 'not_owner_or_grantee')
  expectRefusal(reviseDraft(store, OTHER_EDITOR, { draftId: ALPHA, expectedRevision: 1, body: BODY_V2 }), 'not_owner_or_grantee')

  const readGrant = expectAllowedWrite(
    grantAccess(store, OWNER, { draftId: ALPHA, granteeId: 'user-synthetic-reviewer', permission: 'read' }),
  )
  const shared = readDraft(readGrant.store, REVIEWER, ALPHA)
  if (!shared.allowed) assert.fail(`grantee read refused: ${shared.reason}`)
  assert.deepEqual(shared.draft, { id: ALPHA, revision: 1, body: BODY_V1 }, 'an explicit read grant is sufficient to read')

  expectRefusal(
    reviseDraft(readGrant.store, REVIEWER, { draftId: ALPHA, expectedRevision: 1, body: BODY_V2 }),
    'insufficient_grant',
  )

  const writeGrant = expectAllowedWrite(
    grantAccess(readGrant.store, OWNER, { draftId: ALPHA, granteeId: 'user-synthetic-reviewer', permission: 'revise' }),
  )
  const revised = expectAllowedWrite(
    reviseDraft(writeGrant.store, REVIEWER, { draftId: ALPHA, expectedRevision: 1, body: BODY_V2 }),
  )
  assert.deepEqual(revised.draft, { id: ALPHA, revision: 2 })
  assert.deepEqual(
    revised.store.drafts[0].grants,
    [{ granteeId: 'user-synthetic-reviewer', permission: 'revise' }],
    'a second grant to the same identity replaces the first instead of stacking',
  )
  assert.equal(revised.store.drafts[0].revisions[1].authorId, 'user-synthetic-reviewer', 'the revision records its author')

  // a grant on ALPHA opens exactly ALPHA
  const beta = expectAllowedWrite(createDraft(revised.store, OTHER_EDITOR, { draftId: BETA, body: BODY_V1 }))
  expectRefusal(readDraft(beta.store, REVIEWER, BETA), 'not_owner_or_grantee')
  expectRefusal(readDraft(beta.store, OWNER, BETA), 'not_owner_or_grantee')
  expectRefusal(
    reviseDraft(beta.store, REVIEWER, { draftId: BETA, expectedRevision: 1, body: BODY_V2 }),
    'not_owner_or_grantee',
  )

  // granting is the owner's act, and a grant cannot widen the role allow-list
  expectRefusal(
    grantAccess(beta.store, REVIEWER, { draftId: ALPHA, granteeId: 'user-synthetic-other-editor', permission: 'revise' }),
    'not_owner',
  )
  const viewerGrant = expectAllowedWrite(
    grantAccess(beta.store, OWNER, { draftId: ALPHA, granteeId: 'user-synthetic-viewer', permission: 'read' }),
  )
  expectRefusal(readDraft(viewerGrant.store, VIEWER, ALPHA), 'role_not_permitted')
})

// ------------------------------------------------------ 4. publish is never available

void test('publish is refused for everyone and this module exposes no publication path', async () => {
  const { store } = seeded()

  for (const caller of [OWNER, OTHER_EDITOR, REVIEWER, ANONYMOUS]) {
    const decision = authorizeDraft(store, caller, ALPHA, 'publish')
    expectRefusal(decision, caller === ANONYMOUS ? 'unauthenticated' : 'publish_not_available')
  }
  expectRefusal(authorizeDraft(store, OWNER, 'draft-missing', 'publish'), 'publish_not_available')
  assert.equal(PUBLICATION_AVAILABLE, false)
  assert.equal(store.drafts[0].visibility, 'private')

  const module = (await import('../src/lib/shadow-editor.js')) as unknown as Record<string, unknown>
  const publishFunctions = Object.keys(module).filter(
    (name) => /publish/i.test(name) && typeof module[name] === 'function',
  )
  assert.deepEqual(publishFunctions, [], 'the only publication answer is authorizeDraft(..., publish)')
})

// ------------------------------------------------------- 5. refusals carry no draft data

void test('every refusal carries only an opaque id and a stable reason', () => {
  const { store } = seeded()
  const refusals: ShadowRefusal[] = [
    expectRefusal(readDraft(store, ANONYMOUS, ALPHA), 'unauthenticated'),
    expectRefusal(readDraft(store, SERVICE, ALPHA), 'not_human'),
    expectRefusal(readDraft(store, VIEWER, ALPHA), 'role_not_permitted'),
    expectRefusal(readDraft(store, OTHER_EDITOR, ALPHA), 'not_owner_or_grantee'),
    expectRefusal(readDraft(store, OWNER, 'draft-missing'), 'draft_not_found'),
    expectRefusal(reviseDraft(store, OTHER_EDITOR, { draftId: ALPHA, expectedRevision: 1, body: BODY_V2 }), 'not_owner_or_grantee'),
    expectRefusal(createDraft(store, OWNER, { draftId: ALPHA, body: BODY_V1 }), 'draft_exists'),
    expectRefusal(createDraft(store, OWNER, { draftId: 'x', body: BODY_V1 }), 'invalid_input'),
  ]

  for (const refusal of refusals) {
    assertNoDraftData(refusal, `refusal ${refusal.reason}`)
  }
  const decision = expectRefusal(authorizeDraft(store, OTHER_EDITOR, ALPHA, 'read'), 'not_owner_or_grantee')
  assertNoDraftData(decision, 'the read decision')
})

// ------------------------------------------------------------------ 6. malformed input

void test('malformed drafts, revisions and grants are refused as invalid input', () => {
  const { store } = seeded()
  const invalidCreates: ReadonlyArray<{ draftId: unknown; body: unknown }> = [
    { draftId: 'ab', body: BODY_V1 },
    { draftId: ` ${ALPHA}`, body: BODY_V1 },
    { draftId: 'd'.repeat(SHADOW_LIMITS.maxDraftIdLength + 1), body: BODY_V1 },
    { draftId: 42, body: BODY_V1 },
    { draftId: ALPHA, body: '' },
    { draftId: ALPHA, body: '   ' },
    { draftId: ALPHA, body: null },
    { draftId: ALPHA, body: 'x'.repeat(SHADOW_LIMITS.maxBodyLength + 1) },
  ]
  for (const input of invalidCreates) {
    expectRefusal(createDraft(store, OWNER, input), 'invalid_input')
  }

  for (const body of ['', '  ', 7]) {
    expectRefusal(reviseDraft(store, OWNER, { draftId: ALPHA, expectedRevision: 1, body }), 'invalid_input')
  }

  const invalidGrants: ReadonlyArray<{ granteeId: unknown; permission: unknown }> = [
    { granteeId: '', permission: 'read' },
    { granteeId: 'user-synthetic-owner', permission: 'read' },
    { granteeId: 'user-synthetic-reviewer', permission: 'admin' },
    { granteeId: 'user-synthetic-reviewer', permission: '__proto__' },
  ]
  for (const input of invalidGrants) {
    expectRefusal(grantAccess(store, OWNER, { draftId: ALPHA, ...input }), 'invalid_input')
  }
  assert.equal(store.drafts[0].grants.length, 0, 'no malformed grant was written')
})

// --------------------------------------------------------- 7. workspace summary filtering

void test('the workspace summary lists only readable drafts and reports authoring honestly', () => {
  const { store } = seeded()
  const shared = expectAllowedWrite(
    grantAccess(store, OWNER, { draftId: ALPHA, granteeId: 'user-synthetic-reviewer', permission: 'read' }),
  )

  assert.deepEqual(describeWorkspace(shared.store, OWNER), {
    canAuthor: true,
    authoringReason: null,
    drafts: [{ id: ALPHA, revision: 1 }],
  })
  assert.deepEqual(describeWorkspace(shared.store, REVIEWER), {
    canAuthor: false,
    authoringReason: 'role_not_permitted',
    drafts: [{ id: ALPHA, revision: 1 }],
  })
  assert.deepEqual(describeWorkspace(shared.store, OTHER_EDITOR), {
    canAuthor: true,
    authoringReason: null,
    drafts: [],
  })
  assert.deepEqual(describeWorkspace(shared.store, VIEWER), {
    canAuthor: false,
    authoringReason: 'role_not_permitted',
    drafts: [],
  })
  assert.deepEqual(describeWorkspace(shared.store, ANONYMOUS), {
    canAuthor: false,
    authoringReason: 'unauthenticated',
    drafts: [],
  })
  assert.deepEqual(describeWorkspace(shared.store, SERVICE), {
    canAuthor: false,
    authoringReason: 'not_human',
    drafts: [],
  })
  assert.equal(describeWorkspace(EMPTY_SHADOW_STORE, OWNER).drafts.length, 0)

  assert.equal(canAuthorShadow({ role: SHADOW_AUTHOR_ROLES[0] }), true)
  assert.equal(canAuthorShadow({ role: 'reviewer' }), false)
  assert.equal(canOpenShadowWorkspace({ role: SHADOW_DRAFT_ACCESS_ROLES[1] }), true)
  assert.equal(canOpenShadowWorkspace({ role: 'viewer' }), false)
})

// ------------------------------------------------------------- 8. structural host wiring

void test('the contract stays import-free and pure', async () => {
  const source = await readFile(new URL('../src/lib/shadow-editor.ts', import.meta.url), 'utf8')

  assert.doesNotMatch(source, /^\s*import\s/m, 'no module imports: the contract must not acquire a data or auth owner')
  assert.doesNotMatch(source, /\brequire\s*\(/, 'no CommonJS require')
  assert.doesNotMatch(source, /\bnew Date\b|\bDate\.now\b|\bMath\.random\b/, 'no clock or randomness')
  assert.doesNotMatch(source, /visibility:\s*'public'/, 'public visibility cannot be constructed')
  assert.doesNotMatch(source, /process\.env/, 'no environment or secret is read')
})

void test('the HQ page renders through the contract only', async () => {
  const source = await readFile(new URL('../src/app/(admin)/shadow/page.tsx', import.meta.url), 'utf8')

  assert.match(source, /from '@\/lib\/shadow-editor'/, 'the page imports the contract')
  assert.match(source, /describeWorkspace\(EMPTY_SHADOW_STORE, caller\)/, 'draft state comes from the contract')
  assert.match(source, /decideAccess\(/, 'the session/ACL gate is the existing server-side one')
  assert.match(source, /canOpenShadowWorkspace/, 'the role gate is the contract allow-list')
  assert.match(source, /redirect\('\/login\?error=expired'\)/, 'anonymous never renders the workspace')
  assert.doesNotMatch(source, /'use client'/, 'the page is a server component')
  assert.doesNotMatch(source, /'use server'/, 'this slice adds no server action and writes nothing')
  assert.doesNotMatch(source, /ownerId|granteeId|revisions\s*[:=]/, 'the page holds no permission logic of its own')
  assert.doesNotMatch(source, /12 active projects|4 in review/, 'no fabricated draft counters')
})

void test('SHADOW copy has 1:1 en/id keys and every message is non-empty', () => {
  const en = shadowCopy('en')
  const id = shadowCopy('id')

  assert.deepEqual(Object.keys(en).sort(), Object.keys(id).sort(), 'ADR-0005 requires identical key sets')
  for (const [key, value] of Object.entries(en)) {
    assert.ok(value.trim().length > 0, `en.${key} is non-empty`)
  }
  for (const [key, value] of Object.entries(id)) {
    assert.ok(value.trim().length > 0, `id.${key} is non-empty`)
  }
})
