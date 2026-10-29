import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  confirmGrant,
  deriveGrantState,
  loadReviewerGrants,
  requestGrant,
  revokeGrant,
} from '../src/index.ts'

// Synthetic fixtures only. No witness testimony, consent record, credential or
// production row is represented here.
const ADMIN_A = 'principal:fixture:admin-a'
const ADMIN_B = 'principal:fixture:admin-b'
const GRANTEE = 'principal:fixture:user-u'
const GRANTEE_TWO = 'principal:fixture:user-u2'
const GUEST = 'principal:fixture:guest-g'
const MACHINE = 'principal:fixture:machine-m'
const INACTIVE = 'principal:fixture:inactive-i'
const UNNAMED = 'principal:fixture:unnamed-n'
const CONTROL = 'system:fixture:account-control'

const NOW = '2026-10-29T10:00:00.000Z'
const LATER = '2026-10-29T11:00:00.000Z'
const TOO_LATE = '2026-10-30T11:00:00.000Z'
const EXPIRES = '2027-01-01T00:00:00.000Z'
const EXPIRED_AT = '2027-01-02T00:00:00.000Z'
const TTL = 24 * 60 * 60 * 1000

const CANARY = 'CANARY-caller-supplied-reviewer-string'

function account(overrides) {
  return {
    accountRef: GRANTEE,
    kind: 'HUMAN',
    loginRole: 'user',
    displayName: 'Fixture User',
    active: true,
    ...overrides,
  }
}

const ACCOUNTS = [
  account({ accountRef: ADMIN_A, loginRole: 'admin', displayName: 'Admin A' }),
  account({ accountRef: ADMIN_B, loginRole: 'admin', displayName: 'Admin B' }),
  account({ accountRef: GRANTEE }),
  account({ accountRef: GRANTEE_TWO }),
  account({ accountRef: GUEST, loginRole: 'guest', displayName: 'Guest G' }),
  account({ accountRef: MACHINE, kind: 'MACHINE', displayName: 'Machine M' }),
  account({ accountRef: INACTIVE, active: false }),
  account({ accountRef: UNNAMED, displayName: null }),
]

function store(grants = []) {
  return { accounts: ACCOUNTS, grants }
}

function context(grants, actorRef = ADMIN_A, now = NOW) {
  return {
    accounts: ACCOUNTS,
    grants,
    now,
    actor: { principalRef: actorRef, kind: 'HUMAN' },
    pendingTtlMs: TTL,
  }
}

function request(overrides = {}) {
  return {
    requestId: 'request:fixture:001',
    grantRef: 'grant:fixture:001',
    accountRef: GRANTEE,
    grantKind: 'author',
    lane: 'D05.RESEARCH',
    expiresAt: EXPIRES,
    reasonRef: 'reason:fixture:001',
    supersedesRef: null,
    ...overrides,
  }
}

function ledger() {
  return { grants: [], events: [] }
}

function commit(result, book) {
  assert.equal(result.accepted, true, `expected acceptance, got ${result.reason}`)
  for (const event of result.events) book.events.push(event)
  if (result.grant !== null) {
    const index = book.grants.findIndex((entry) => entry.grantRef === result.grant.grantRef)
    if (index >= 0) book.grants[index] = result.grant
    else book.grants.push(result.grant)
  }
}

function stateOf(grant, book, now = NOW) {
  return deriveGrantState(grant, { grants: book.grants, now, pendingTtlMs: TTL })
}

test('T1 admin A issues an author grant directly as ACTIVE', () => {
  const book = ledger()
  const result = requestGrant(request(), context(book.grants))
  assert.equal(result.accepted, true)
  assert.equal(result.grant.grantKind, 'author')
  assert.equal(result.grant.issuedByRef, ADMIN_A)
  assert.equal(result.events.length, 1)
  assert.equal(result.events[0].action, 'ISSUED')
  commit(result, book)
  assert.equal(stateOf(book.grants[0], book), 'ACTIVE')
})

test('T2 two distinct admins issue an approve grant', () => {
  const book = ledger()
  commit(
    requestGrant(request({ grantKind: 'approve', lane: 'D06.WITNESS' }), context(book.grants)),
    book,
  )
  assert.equal(stateOf(book.grants[0], book), 'PENDING_CONFIRMATION')
  const confirmed = confirmGrant(
    { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:002' },
    context(book.grants, ADMIN_B, LATER),
  )
  commit(confirmed, book)
  assert.deepEqual(
    book.events.map((event) => event.action),
    ['REQUESTED', 'CONFIRMED'],
  )
  assert.equal(book.grants[0].confirmedByRef, ADMIN_B)
  assert.equal(stateOf(book.grants[0], book, LATER), 'ACTIVE')
})

test('T3 the issuing admin cannot confirm their own approve request', () => {
  const book = ledger()
  commit(requestGrant(request({ grantKind: 'approve' }), context(book.grants)), book)
  const denied = confirmGrant(
    { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:002' },
    context(book.grants, ADMIN_A, LATER),
  )
  assert.equal(denied.accepted, false)
  assert.equal(denied.reason, 'GRANT_CONFIRM_SELF')
  assert.equal(denied.grant, null)
  assert.equal(stateOf(book.grants[0], book), 'PENDING_CONFIRMATION')
})

test('T4 an admin cannot grant themselves a scope', () => {
  const book = ledger()
  const result = requestGrant(request({ accountRef: ADMIN_A }), context(book.grants))
  assert.equal(result.accepted, false)
  assert.equal(result.reason, 'GRANT_SELF_ASSIGNMENT')
  assert.equal(book.grants.length, 0)
})

test('T5 guest, machine and unknown accounts cannot be grantees', () => {
  const cases = [
    [GUEST, 'GRANT_ACCOUNT_INELIGIBLE'],
    [MACHINE, 'GRANT_ACCOUNT_INELIGIBLE'],
    ['principal:fixture:ghost', 'GRANT_ACCOUNT_UNKNOWN'],
  ]
  for (const [accountRef, reason] of cases) {
    const result = requestGrant(request({ accountRef }), context([]))
    assert.equal(result.accepted, false, accountRef)
    assert.equal(result.reason, reason, accountRef)
    assert.equal(result.grant, null)
  }
})

test('T6 an inactive or unnamed grantee is refused', () => {
  for (const [accountRef, reason] of [
    [INACTIVE, 'GRANT_ACCOUNT_INACTIVE'],
    [UNNAMED, 'GRANT_ACCOUNT_UNNAMED'],
  ]) {
    const result = requestGrant(request({ accountRef }), context([]))
    assert.equal(result.accepted, false, accountRef)
    assert.equal(result.reason, reason, accountRef)
  }
})

test('T7 unknown kind, unknown lane and wildcard lane are refused', () => {
  for (const [overrides, reason] of [
    [{ grantKind: 'reviewer' }, 'GRANT_KIND_UNKNOWN'],
    [{ lane: 'D99.UNKNOWN' }, 'GRANT_LANE_UNKNOWN'],
    [{ lane: '*' }, 'GRANT_LANE_UNKNOWN'],
  ]) {
    const result = requestGrant(request(overrides), context([]))
    assert.equal(result.accepted, false)
    assert.equal(result.reason, reason)
  }
})

test('T8 missing or non-future expiry is refused', () => {
  for (const expiresAt of [undefined, null, 'not-a-date', NOW, '2026-01-01T00:00:00.000Z']) {
    const result = requestGrant(request({ expiresAt }), context([]))
    assert.equal(result.accepted, false, String(expiresAt))
    assert.equal(result.reason, 'GRANT_EXPIRY_INVALID', String(expiresAt))
  }
})

test('T9 one account cannot hold author and approve in one lane', () => {
  const book = ledger()
  commit(requestGrant(request(), context(book.grants)), book)
  const denied = requestGrant(
    request({ grantRef: 'grant:fixture:002', grantKind: 'approve' }),
    context(book.grants, ADMIN_B),
  )
  assert.equal(denied.accepted, false)
  assert.equal(denied.reason, 'GRANT_CONFLICT')
})

test('T10 a second live grant needs explicit supersession', () => {
  const book = ledger()
  commit(requestGrant(request(), context(book.grants)), book)
  const duplicate = requestGrant(
    request({ grantRef: 'grant:fixture:002', reasonRef: 'reason:fixture:002' }),
    context(book.grants, ADMIN_B),
  )
  assert.equal(duplicate.accepted, false)
  assert.equal(duplicate.reason, 'GRANT_ALREADY_LIVE')

  const replaced = requestGrant(
    request({
      grantRef: 'grant:fixture:003',
      reasonRef: 'reason:fixture:003',
      supersedesRef: 'grant:fixture:001',
    }),
    context(book.grants, ADMIN_B),
  )
  assert.equal(replaced.events.map((event) => event.action).join(','), 'SUPERSEDED,ISSUED')
  commit(replaced, book)
  assert.equal(stateOf(book.grants.find((grant) => grant.grantRef === 'grant:fixture:001'), book), 'SUPERSEDED')
  assert.equal(stateOf(book.grants.find((grant) => grant.grantRef === 'grant:fixture:003'), book), 'ACTIVE')
})

test('T10b an unconfirmed approve replacement leaves the predecessor live', () => {
  const book = ledger()
  commit(requestGrant(request({ grantKind: 'approve', lane: 'D05.RESEARCH' }), context(book.grants)), book)
  commit(
    confirmGrant(
      { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:002' },
      context(book.grants, ADMIN_B, LATER),
    ),
    book,
  )

  const replacement = requestGrant(
    request({
      grantRef: 'grant:fixture:002',
      grantKind: 'approve',
      lane: 'D05.RESEARCH',
      reasonRef: 'reason:fixture:003',
      supersedesRef: 'grant:fixture:001',
    }),
    context(book.grants, ADMIN_A, '2026-10-29T12:00:00.000Z'),
  )
  commit(replacement, book)
  const atRequest = '2026-10-29T12:00:00.000Z'
  assert.equal(stateOf(book.grants.find((grant) => grant.grantRef === 'grant:fixture:001'), book, atRequest), 'ACTIVE')
  assert.equal(stateOf(book.grants.find((grant) => grant.grantRef === 'grant:fixture:002'), book, atRequest), 'PENDING_CONFIRMATION')

  const stillOld = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'public', at: atRequest },
    store(book.grants),
  )
  assert.equal(stillOld.ok, true)
  assert.deepEqual(stillOld.grants.map((grant) => grant.grantRef), ['grant:fixture:001'])

  commit(
    confirmGrant(
      { grantRef: 'grant:fixture:002', reasonRef: 'reason:fixture:004' },
      context(book.grants, ADMIN_B, '2026-10-29T13:00:00.000Z'),
    ),
    book,
  )
  const atConfirm = '2026-10-29T13:00:00.000Z'
  assert.equal(stateOf(book.grants.find((grant) => grant.grantRef === 'grant:fixture:001'), book, atConfirm), 'SUPERSEDED')
  assert.equal(stateOf(book.grants.find((grant) => grant.grantRef === 'grant:fixture:002'), book, atConfirm), 'ACTIVE')

  const nowNew = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'public', at: atConfirm },
    store(book.grants),
  )
  assert.equal(nowNew.ok, true)
  assert.deepEqual(nowNew.grants.map((grant) => grant.grantRef), ['grant:fixture:002'])
})

test('T11 confirmation after the pending TTL never activates the grant', () => {
  const book = ledger()
  commit(requestGrant(request({ grantKind: 'approve', lane: 'D07.STORY' }), context(book.grants)), book)
  const late = confirmGrant(
    { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:002' },
    context(book.grants, ADMIN_B, TOO_LATE),
  )
  assert.equal(late.accepted, false)
  assert.equal(late.reason, 'GRANT_PENDING_EXPIRED')
  assert.equal(late.grant, null)

  const loaded = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D07_STORY', scope: 'public', at: TOO_LATE },
    store(book.grants),
  )
  assert.equal(loaded.ok, false)
  assert.equal(loaded.grants.length, 0)
  assert.equal(loaded.reason, 'REVIEWER_NOT_GRANTED')
})

test('T12 a non-admin cannot confirm an approve request', () => {
  const book = ledger()
  commit(requestGrant(request({ grantKind: 'approve' }), context(book.grants)), book)
  const denied = confirmGrant(
    { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:002' },
    context(book.grants, GRANTEE, LATER),
  )
  assert.equal(denied.accepted, false)
  assert.equal(denied.reason, 'GRANT_ACTOR_NOT_ADMIN')
})

test('T13 issuer, another admin and account control can revoke', () => {
  const book = ledger()
  for (const [grantRef, lane] of [
    ['grant:fixture:r1', 'D05.RESEARCH'],
    ['grant:fixture:r2', 'D06.WITNESS'],
    ['grant:fixture:r3', 'D07.STORY'],
  ]) {
    commit(requestGrant(request({ grantRef, lane }), context(book.grants, ADMIN_A)), book)
  }

  const byIssuer = revokeGrant(
    { grantRef: 'grant:fixture:r1', reasonRef: 'reason:fixture:revoke' },
    context(book.grants, ADMIN_A, LATER),
  )
  assert.equal(byIssuer.accepted, true)
  commit(byIssuer, book)

  const byOtherAdmin = revokeGrant(
    { grantRef: 'grant:fixture:r2', reasonRef: 'reason:fixture:revoke' },
    context(book.grants, ADMIN_B, LATER),
  )
  assert.equal(byOtherAdmin.accepted, true)
  commit(byOtherAdmin, book)

  const byControl = revokeGrant(
    { grantRef: 'grant:fixture:r3', reasonRef: 'reason:fixture:revoke' },
    { ...context(book.grants, CONTROL, LATER), actor: { principalRef: CONTROL, kind: 'ACCOUNT_CONTROL' } },
  )
  assert.equal(byControl.accepted, true)
  commit(byControl, book)

  for (const grantRef of ['grant:fixture:r1', 'grant:fixture:r2', 'grant:fixture:r3']) {
    assert.equal(stateOf(book.grants.find((grant) => grant.grantRef === grantRef), book, LATER), 'REVOKED')
  }
})

test('T14 a non-admin cannot revoke', () => {
  const book = ledger()
  commit(requestGrant(request(), context(book.grants)), book)
  const denied = revokeGrant(
    { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:revoke' },
    context(book.grants, GRANTEE, LATER),
  )
  assert.equal(denied.accepted, false)
  assert.equal(denied.reason, 'GRANT_REVOKE_FORBIDDEN')
})

test('T15 an expired approval grant never reaches the loader', () => {
  const book = ledger()
  commit(requestGrant(request({ grantKind: 'approve', lane: 'D05.RESEARCH' }), context(book.grants)), book)
  commit(
    confirmGrant(
      { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:002' },
      context(book.grants, ADMIN_B, LATER),
    ),
    book,
  )
  const loaded = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'public', at: EXPIRED_AT },
    store(book.grants),
  )
  assert.equal(loaded.ok, false)
  assert.equal(loaded.grants.length, 0)
  assert.equal(loaded.reason, 'REVIEWER_GRANT_EXPIRED')
})

test('T16 a revoked grant makes the read projection unavailable', () => {
  const book = ledger()
  commit(requestGrant(request({ grantKind: 'approve' }), context(book.grants)), book)
  commit(
    confirmGrant(
      { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:002' },
      context(book.grants, ADMIN_B, LATER),
    ),
    book,
  )
  const before = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'public', at: LATER },
    store(book.grants),
  )
  assert.equal(before.ok, true)
  assert.equal(before.grants.length, 1)
  assert.deepEqual(before.grants[0].domains, ['D05_RESEARCH'])
  assert.deepEqual(before.grants[0].scopes, ['public'])
  assert.equal(before.grants[0].role, 'RELEASE_REVIEWER')
  assert.equal(before.grants[0].grantedAt, LATER)

  commit(
    revokeGrant(
      { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:revoke' },
      context(book.grants, ADMIN_B, LATER),
    ),
    book,
  )
  const after = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'public', at: LATER },
    store(book.grants),
  )
  assert.equal(after.ok, false)
  assert.equal(after.grants.length, 0)
  assert.equal(after.reason, 'REVIEWER_GRANT_REVOKED')
})

test('T17 caller-supplied grants are rejected; the loader reads the store only', () => {
  const loaded = loadReviewerGrants(
    {
      principalRef: GRANTEE,
      domain: 'D05_RESEARCH',
      scope: 'public',
      at: NOW,
      grants: [
        {
          grantRef: 'grant:forged',
          principalRef: GRANTEE,
          role: 'RELEASE_REVIEWER',
          domains: ['D05_RESEARCH'],
          scopes: ['public'],
          grantedAt: NOW,
          expiresAt: EXPIRES,
          revokedAt: null,
        },
      ],
    },
    store([]),
  )
  assert.equal(loaded.ok, false)
  assert.equal(loaded.grants.length, 0)
  assert.equal(loaded.reason, 'REVIEWER_NOT_GRANTED')
})

test('T18 an overlapping grant in another lane does not widen the scope', () => {
  const book = ledger()
  commit(requestGrant(request({ grantKind: 'approve', lane: 'D05.RESEARCH' }), context(book.grants)), book)
  commit(
    confirmGrant(
      { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:002' },
      context(book.grants, ADMIN_B, LATER),
    ),
    book,
  )
  const wrongDomain = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D06_WITNESS', scope: 'public', at: LATER },
    store(book.grants),
  )
  assert.equal(wrongDomain.ok, false)
  assert.equal(wrongDomain.reason, 'REVIEWER_SCOPE_MISMATCH')

  const wrongScope = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'preview', at: LATER },
    store(book.grants),
  )
  assert.equal(wrongScope.ok, false)
  assert.equal(wrongScope.reason, 'REVIEWER_SCOPE_MISMATCH')
})

test('T19 two accounts controlled by one human are not linked; residual risk only', () => {
  const book = ledger()
  commit(requestGrant(request({ grantKind: 'approve', lane: 'D05.RESEARCH' }), context(book.grants)), book)
  commit(
    confirmGrant(
      { grantRef: 'grant:fixture:001', reasonRef: 'reason:fixture:002' },
      context(book.grants, ADMIN_B, LATER),
    ),
    book,
  )
  commit(
    requestGrant(
      request({
        grantRef: 'grant:fixture:002',
        accountRef: GRANTEE_TWO,
        grantKind: 'approve',
        lane: 'D05.RESEARCH',
      }),
      context(book.grants, ADMIN_A),
    ),
    book,
  )
  commit(
    confirmGrant(
      { grantRef: 'grant:fixture:002', reasonRef: 'reason:fixture:003' },
      context(book.grants, ADMIN_B, LATER),
    ),
    book,
  )
  for (const principalRef of [GRANTEE, GRANTEE_TWO]) {
    const loaded = loadReviewerGrants(
      { principalRef, domain: 'D05_RESEARCH', scope: 'public', at: LATER },
      store(book.grants),
    )
    assert.equal(loaded.ok, true, principalRef)
    assert.equal(loaded.grants.length, 1)
  }
  // ADR-0015 §9 ratifies the residual risk: no account-linkage mechanism
  // exists, so two distinct accounts are treated as two distinct humans here.
})

test('T20 a legacy caller-supplied reviewer field is rejected and never echoed', () => {
  const result = requestGrant(request({ reviewer: CANARY }), context([]))
  assert.equal(result.accepted, false)
  assert.equal(result.reason, 'GRANT_UNKNOWN_FIELD')
  assert.equal(result.grant, null)
  assert.equal(JSON.stringify(result).includes(CANARY), false)
})

test('T21 an inconsistent store fails closed', () => {
  const duplicates = [
    requestGrant(request(), context([])).grant,
    requestGrant(request(), context([])).grant,
  ]
  const dupLoaded = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'public', at: NOW },
    store(duplicates),
  )
  assert.equal(dupLoaded.ok, false)
  assert.equal(dupLoaded.grants.length, 0)

  const malformed = { ...requestGrant(request({ grantKind: 'approve' }), context([])).grant, issuedAt: 'not-a-time' }
  const badLoaded = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'public', at: NOW },
    store([malformed]),
  )
  assert.equal(badLoaded.ok, false)
  assert.equal(badLoaded.grants.length, 0)
})

test('a pending request never loads and a malformed input fails closed', () => {
  const book = ledger()
  commit(requestGrant(request({ grantKind: 'approve' }), context(book.grants)), book)
  const pending = loadReviewerGrants(
    { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'public', at: NOW },
    store(book.grants),
  )
  assert.equal(pending.ok, false)
  assert.equal(pending.reason, 'REVIEWER_NOT_GRANTED')

  for (const input of [null, 'grant', {}, { principalRef: GRANTEE, domain: 'D05_RESEARCH', scope: 'public' }]) {
    const loaded = loadReviewerGrants(input, store(book.grants))
    assert.equal(loaded.ok, false)
    assert.deepEqual(loaded.grants, [])
  }
})
