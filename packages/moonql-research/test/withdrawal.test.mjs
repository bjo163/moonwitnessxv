import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  applyAcceptedRequest,
  beginWithdrawalReview,
  decideWithdrawalRequest,
  evaluatePublicAvailability,
  submitWithdrawalRequest,
} from '../src/withdrawal.ts'

// Every fixture is synthetic. These canaries are attached to the release and to
// request inputs on purpose: no result may echo them, whether it succeeds or
// refuses.
const CANARIES = [
  'CANARY-private-witness-text',
  'https://canary.invalid/secret-source',
  'echolog://canary/secret-object',
  'CANARY-payload-bytes',
  'CANARY-free-text',
]

const RELEASE_ID = 'release_fixture_001'
const RELEASE_REF = 'fixture:release:research-001'
const RIGHTS_REF = 'fixture:rights:001'
const CONSENT_REF = 'fixture:consent:001'
const OWNER = 'principal:fixture:rights-holder-001'
const WITNESS = 'principal:fixture:witness-001'
const REVIEWER = 'principal:fixture:reviewer-001'
const REVIEWER_TWO = 'principal:fixture:reviewer-002'
const GOVERNANCE = 'principal:fixture:governance-001'
const STRANGER = 'principal:fixture:stranger-001'

const SUBMITTED_AT = '2026-10-28T08:00:00.000Z'
const DECIDED_AT = '2026-10-28T10:00:00.000Z'
const APPEAL_SUBMITTED_AT = '2026-10-28T11:00:00.000Z'
const APPEAL_DECIDED_AT = '2026-10-28T12:00:00.000Z'
const EARLY = '2026-10-28T07:00:00.000Z'

const REQUEST_KEYS = [
  'decidedAt',
  'decidedBy',
  'decidedByRole',
  'kind',
  'policyVersion',
  'reasonCode',
  'releaseId',
  'requestedBy',
  'requestedScope',
  'requesterRole',
  'requestId',
  'state',
  'submittedAt',
  'targetRequestId',
].sort()

const AVAILABLE_KEYS = [
  'available',
  'consentReference',
  'policyVersion',
  'releaseId',
  'rightsReference',
].sort()

const release = (overrides = {}) => ({
  releaseId: RELEASE_ID,
  releaseRef: RELEASE_REF,
  state: 'PUBLISHED',
  publicScope: 'public',
  rightsReference: RIGHTS_REF,
  rightsScope: 'public',
  consentReference: CONSENT_REF,
  consentScope: 'public',
  rightsHolderRefs: [OWNER],
  witnessRefs: [WITNESS],
  contentText: CANARIES[0],
  sourceUrl: CANARIES[1],
  locator: CANARIES[2],
  payload: CANARIES[3],
  note: CANARIES[4],
  ...overrides,
})

const requester = (overrides = {}) => ({
  principalRef: OWNER,
  role: 'RIGHTS_HOLDER',
  scope: 'public',
  ...overrides,
})

const actor = (roles = ['REVIEWER'], principalRef = REVIEWER) => ({ principalRef, roles })

const input = (kind, requestId, overrides = {}) => ({
  requestId,
  kind,
  submittedAt: SUBMITTED_AT,
  requestedScope: 'public',
  sourceText: CANARIES[0],
  note: CANARIES[4],
  ...overrides,
})

const decision = (action, reasonCode, decidedAt = DECIDED_AT) => ({ action, reasonCode, decidedAt })

const defaultReason = (kind) => {
  if (kind === 'WITHDRAWAL') return 'CONSENT_WITHDRAWN'
  if (kind === 'CORRECTION') return 'CORRECTION_REQUIRED'
  if (kind === 'TAKEDOWN') return 'COPYRIGHT_COMPLAINT_UPHELD'
  return 'APPEAL_UPHELD'
}

/** A stored request record with hostile extra fields, for ledger-level tests. */
const requestRecord = (overrides = {}) => ({
  policyVersion: '1.0.0',
  requestId: 'req-stored-0001',
  kind: 'WITHDRAWAL',
  releaseId: RELEASE_ID,
  requestedBy: OWNER,
  requesterRole: 'RIGHTS_HOLDER',
  requestedScope: 'public',
  targetRequestId: null,
  state: 'ACCEPTED',
  submittedAt: SUBMITTED_AT,
  decidedBy: REVIEWER,
  decidedByRole: 'REVIEWER',
  decidedAt: DECIDED_AT,
  reasonCode: 'CONSENT_WITHDRAWN',
  sourceText: CANARIES[0],
  note: CANARIES[4],
  ...overrides,
})

const pendingRecord = (overrides = {}) => ({
  policyVersion: '1.0.0',
  requestId: 'req-pending-0001',
  kind: 'WITHDRAWAL',
  releaseId: RELEASE_ID,
  requestedBy: OWNER,
  requesterRole: 'RIGHTS_HOLDER',
  requestedScope: 'public',
  targetRequestId: null,
  state: 'SUBMITTED',
  submittedAt: SUBMITTED_AT,
  decidedBy: null,
  decidedByRole: null,
  decidedAt: null,
  reasonCode: null,
  sourceText: CANARIES[0],
  note: CANARIES[4],
  ...overrides,
})

function assertNoCanaries(value) {
  const serialized = JSON.stringify(value)
  for (const canary of CANARIES) {
    assert.equal(serialized.includes(canary), false, `result leaked ${canary}`)
  }
}

function assertAcceptedRequest(result) {
  assert.equal(result.accepted, true, `expected acceptance, got ${JSON.stringify(result)}`)
  assert.equal(Object.isFrozen(result), true)
  assert.equal(Object.isFrozen(result.request), true)
  assert.deepEqual(Object.keys(result.request).sort(), REQUEST_KEYS)
  assertNoCanaries(result)
  return result.request
}

function assertRequestRefused(result, reason, requestId = undefined) {
  assert.equal(result.accepted, false, `expected refusal ${reason}, got ${JSON.stringify(result)}`)
  assert.equal(result.reason, reason)
  if (requestId !== undefined) assert.equal(result.requestId, requestId)
  assert.deepEqual(Object.keys(result).sort(), ['accepted', 'reason', 'requestId'])
  assertNoCanaries(result)
}

function assertUnavailable(result, reason) {
  assert.equal(result.available, false, `expected unavailable ${reason}, got ${JSON.stringify(result)}`)
  assert.equal(result.reason, reason)
  assert.deepEqual(Object.keys(result).sort(), ['available', 'reason', 'releaseId'])
  assertNoCanaries(result)
}

function assertAvailable(result, releaseId = RELEASE_ID) {
  assert.equal(result.available, true, `expected available, got ${JSON.stringify(result)}`)
  assert.equal(result.releaseId, releaseId)
  assert.equal(result.rightsReference, RIGHTS_REF)
  assert.equal(result.consentReference, CONSENT_REF)
  assert.deepEqual(Object.keys(result).sort(), AVAILABLE_KEYS)
  assertNoCanaries(result)
}

/** Submit, begin review and decide in one step for positive workflows. */
function runDecision(kind, requestId, options = {}) {
  const {
    action = 'ACCEPT',
    reasonCode = defaultReason(kind),
    releaseOverrides = {},
    requesterOverrides = {},
    actorRoles = ['REVIEWER'],
    actorRef = REVIEWER,
    submittedAt = SUBMITTED_AT,
    decidedAt = DECIDED_AT,
    existing = [],
    targetRequestId = null,
  } = options
  const inputOverrides = { submittedAt }
  if (targetRequestId !== null) inputOverrides.targetRequestId = targetRequestId
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(
      release(releaseOverrides),
      requester(requesterOverrides),
      input(kind, requestId, inputOverrides),
      existing,
    ),
  )
  const reviewed = assertAcceptedRequest(
    beginWithdrawalReview(submitted, actor(actorRoles, actorRef), [...existing, submitted]),
  )
  const decided = assertAcceptedRequest(
    decideWithdrawalRequest(
      reviewed,
      actor(actorRoles, actorRef),
      { action, reasonCode, decidedAt },
      [...existing, reviewed],
    ),
  )
  assert.equal(decided.state, action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED')
  return decided
}

function acceptedTakedown(requestId = 'req-takedown-0001', options = {}) {
  return runDecision('TAKEDOWN', requestId, {
    requesterOverrides: { principalRef: GOVERNANCE, role: 'GOVERNANCE' },
    ...options,
  })
}

// ---------------------------------------------------------------------------
// Positive path
// ---------------------------------------------------------------------------

test('positive: a published release with rights and consent references is available', () => {
  assertAvailable(evaluatePublicAvailability(release(), []))
})

test('positive: withdrawal moves SUBMITTED -> UNDER_REVIEW -> ACCEPTED and blocks public availability', () => {
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(release(), requester(), input('WITHDRAWAL', 'req-withdrawal-0001')),
  )
  assert.equal(submitted.state, 'SUBMITTED')
  assert.equal(submitted.kind, 'WITHDRAWAL')

  const reviewed = assertAcceptedRequest(beginWithdrawalReview(submitted, actor(), [submitted]))
  assert.equal(reviewed.state, 'UNDER_REVIEW')
  assert.equal(reviewed.decidedBy, null)

  const decided = assertAcceptedRequest(
    decideWithdrawalRequest(
      reviewed,
      actor(),
      decision('ACCEPT', 'CONSENT_WITHDRAWN'),
      [reviewed],
    ),
  )
  assert.equal(decided.state, 'ACCEPTED')
  assert.equal(decided.decidedBy, REVIEWER)
  assert.equal(decided.decidedByRole, 'REVIEWER')
  assert.equal(decided.reasonCode, 'CONSENT_WITHDRAWN')
  assert.equal(decided.decidedAt, DECIDED_AT)

  assertUnavailable(evaluatePublicAvailability(release(), [decided]), 'RELEASE_WITHDRAWN')
})

test('positive: applying an accepted withdrawal moves the release to WITHDRAWN and keeps its references', () => {
  const withdrawal = runDecision('WITHDRAWAL', 'req-withdrawal-0002')
  const applied = applyAcceptedRequest(release(), withdrawal, [withdrawal])
  assert.equal(applied.applied, true, JSON.stringify(applied))
  assert.equal(applied.release.state, 'WITHDRAWN')
  assert.equal(applied.release.rightsReference, RIGHTS_REF)
  assert.equal(applied.release.consentReference, CONSENT_REF)
  assert.equal(Object.isFrozen(applied.release), true)
  assertUnavailable(evaluatePublicAvailability(applied.release, [withdrawal]), 'RELEASE_WITHDRAWN')
})

test('positive: an accepted correction supersedes the old release; a new release needs its own approval', () => {
  const correction = runDecision('CORRECTION', 'req-correction-0001')
  assertUnavailable(evaluatePublicAvailability(release(), [correction]), 'RELEASE_CORRECTED')

  const applied = applyAcceptedRequest(release(), correction, [correction])
  assert.equal(applied.applied, true)
  assert.equal(applied.release.state, 'CORRECTED')

  assertAvailable(
    evaluatePublicAvailability(
      release({ releaseId: 'release_fixture_002', releaseRef: 'fixture:release:research-002' }),
      [],
    ),
    'release_fixture_002',
  )
})

test('positive: an accepted takedown quarantines the release without mutating its record', () => {
  const takedown = acceptedTakedown()
  assertUnavailable(evaluatePublicAvailability(release(), [takedown]), 'RELEASE_TAKEDOWN')

  const applied = applyAcceptedRequest(release(), takedown, [takedown])
  assert.equal(applied.applied, false)
  assert.equal(applied.reason, 'REQUEST_KIND_NOT_APPLICABLE')
})

test('positive: an accepted appeal by an independent reviewer with a recorded reason reinstates the release', () => {
  const takedown = acceptedTakedown('req-takedown-0002')
  const appeal = runDecision('APPEAL', 'req-appeal-0001', {
    targetRequestId: takedown.requestId,
    existing: [takedown],
    submittedAt: APPEAL_SUBMITTED_AT,
    decidedAt: APPEAL_DECIDED_AT,
    actorRef: REVIEWER_TWO,
    reasonCode: 'APPEAL_UPHELD',
  })
  assert.equal(appeal.decidedBy, REVIEWER_TWO)
  assert.equal(appeal.reasonCode, 'APPEAL_UPHELD')
  assertAvailable(evaluatePublicAvailability(release(), [takedown, appeal]))
})

test('positive: a pending appeal does not outrank an accepted takedown', () => {
  const takedown = acceptedTakedown('req-takedown-0003')
  const appeal = assertAcceptedRequest(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('APPEAL', 'req-appeal-0002', {
        submittedAt: APPEAL_SUBMITTED_AT,
        targetRequestId: takedown.requestId,
      }),
      [takedown],
    ),
  )
  assert.equal(appeal.state, 'SUBMITTED')
  assertUnavailable(evaluatePublicAvailability(release(), [takedown, appeal]), 'RELEASE_TAKEDOWN')
})

test('positive: a rejected appeal leaves the accepted takedown in force', () => {
  const takedown = acceptedTakedown('req-takedown-0004')
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('APPEAL', 'req-appeal-0003', {
        submittedAt: APPEAL_SUBMITTED_AT,
        targetRequestId: takedown.requestId,
      }),
      [takedown],
    ),
  )
  const reviewed = assertAcceptedRequest(
    beginWithdrawalReview(submitted, actor(['REVIEWER'], REVIEWER_TWO), [takedown, submitted]),
  )
  const rejected = assertAcceptedRequest(
    decideWithdrawalRequest(
      reviewed,
      actor(['REVIEWER'], REVIEWER_TWO),
      decision('REJECT', 'APPEAL_DENIED', APPEAL_DECIDED_AT),
      [takedown, reviewed],
    ),
  )
  assert.equal(rejected.state, 'REJECTED')
  assertUnavailable(evaluatePublicAvailability(release(), [takedown, rejected]), 'RELEASE_TAKEDOWN')
})

test('positive: a rejected takedown leaves the release available', () => {
  const rejected = acceptedTakedown('req-takedown-0005', {
    action: 'REJECT',
    reasonCode: 'COMPLAINT_NOT_UPHELD',
  })
  assert.equal(rejected.state, 'REJECTED')
  assertAvailable(evaluatePublicAvailability(release(), [rejected]))
})

test('positive: a witness may submit a withdrawal within the exact public scope', () => {
  const withdrawal = runDecision('WITHDRAWAL', 'req-withdrawal-0003', {
    requesterOverrides: { principalRef: WITNESS, role: 'WITNESS' },
  })
  assert.equal(withdrawal.requestedBy, WITNESS)
  assert.equal(withdrawal.requesterRole, 'WITNESS')
  assertUnavailable(evaluatePublicAvailability(release(), [withdrawal]), 'RELEASE_WITHDRAWN')
})

test('positive: accepted requests and availability results carry no text, URL or locator', () => {
  const takedown = acceptedTakedown('req-takedown-0006')
  const appeal = runDecision('APPEAL', 'req-appeal-0004', {
    targetRequestId: takedown.requestId,
    existing: [takedown],
    submittedAt: APPEAL_SUBMITTED_AT,
    decidedAt: APPEAL_DECIDED_AT,
    actorRef: REVIEWER_TWO,
  })
  assertNoCanaries(takedown)
  assertNoCanaries(appeal)
  assertAvailable(evaluatePublicAvailability(release(), [takedown, appeal]))
})

test('positive: a rejected request does not block availability even when its historical requester is unbound', () => {
  const rejected = requestRecord({
    requestId: 'req-rejected-stranger',
    requestedBy: STRANGER,
    state: 'REJECTED',
    reasonCode: 'APPEAL_DENIED',
  })
  assertAvailable(evaluatePublicAvailability(release(), [rejected]))
})

// ---------------------------------------------------------------------------
// Negative path: release shape, state, scope, rights and consent
// ---------------------------------------------------------------------------

test('negative: an unknown release state is refused', () => {
  assertUnavailable(evaluatePublicAvailability(release({ state: 'RETRACTED' }), []), 'RELEASE_STATE_UNKNOWN')
})

test('negative: a non-public scope is refused', () => {
  assertUnavailable(evaluatePublicAvailability(release({ publicScope: 'internal' }), []), 'PUBLIC_SCOPE_INVALID')
})

test('negative: missing rights or consent references are refused', () => {
  assertUnavailable(
    evaluatePublicAvailability(release({ rightsReference: null }), []),
    'RIGHTS_REFERENCE_MISSING',
  )
  assertUnavailable(
    evaluatePublicAvailability(release({ consentReference: null }), []),
    'CONSENT_REFERENCE_MISSING',
  )
})

test('negative: rights or consent cleared for another scope are refused', () => {
  assertUnavailable(evaluatePublicAvailability(release({ rightsScope: 'internal' }), []), 'RIGHTS_SCOPE_MISMATCH')
  assertUnavailable(evaluatePublicAvailability(release({ consentScope: 'internal' }), []), 'CONSENT_SCOPE_MISMATCH')
})

test('negative: a WITHDRAWN or CORRECTED release is never public, whatever the ledger says', () => {
  assertUnavailable(evaluatePublicAvailability(release({ state: 'WITHDRAWN' }), []), 'RELEASE_WITHDRAWN')
  assertUnavailable(evaluatePublicAvailability(release({ state: 'CORRECTED' }), []), 'RELEASE_CORRECTED')
})

// ---------------------------------------------------------------------------
// Negative path: request ledger shape, replay and unknown states
// ---------------------------------------------------------------------------

test('negative: a malformed request ledger is refused', () => {
  assertUnavailable(evaluatePublicAvailability(release(), 'not-a-list'), 'REQUEST_LIST_INVALID')
  assertUnavailable(evaluatePublicAvailability(release(), [null]), 'REQUEST_FIELD_MISSING')
  assertUnavailable(evaluatePublicAvailability(release(), [{ state: 'ACCEPTED' }]), 'REQUEST_ID_MISSING')
})

test('negative: unknown request kinds and states are refused', () => {
  assertUnavailable(
    evaluatePublicAvailability(release(), [requestRecord({ kind: 'RETRACTION' })]),
    'REQUEST_KIND_UNKNOWN',
  )
  assertUnavailable(
    evaluatePublicAvailability(release(), [requestRecord({ state: 'RETRACTED' })]),
    'REQUEST_STATE_UNKNOWN',
  )
})

test('negative: duplicate request ids in one ledger are a replay', () => {
  assertUnavailable(
    evaluatePublicAvailability(release(), [
      requestRecord({ requestId: 'req-duplicate-0001' }),
      requestRecord({ requestId: 'req-duplicate-0001', state: 'REJECTED', reasonCode: 'APPEAL_DENIED' }),
    ]),
    'REQUEST_ID_REPLAY',
  )
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('WITHDRAWAL', 'req-duplicate-0002'),
      [pendingRecord({ requestId: 'req-duplicate-0002' })],
    ),
    'REQUEST_ID_REPLAY',
    'req-duplicate-0002',
  )
})

test('negative: a second open request of the same kind is refused', () => {
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('WITHDRAWAL', 'req-new-0001'),
      [pendingRecord({ requestId: 'req-existing-0001' })],
    ),
    'DUPLICATE_REQUEST',
    'req-new-0001',
  )
})

test('negative: a request bound to another release is refused', () => {
  assertUnavailable(
    evaluatePublicAvailability(release(), [requestRecord({ releaseId: 'release_fixture_999' })]),
    'REQUEST_RELEASE_MISMATCH',
  )
})

test('negative: a pending withdrawal or takedown blocks availability', () => {
  assertUnavailable(
    evaluatePublicAvailability(release(), [pendingRecord({ requestId: 'req-pending-0002' })]),
    'REQUEST_PENDING',
  )
  assertUnavailable(
    evaluatePublicAvailability(release(), [
      pendingRecord({
        requestId: 'req-pending-0003',
        kind: 'TAKEDOWN',
        requestedBy: GOVERNANCE,
        requesterRole: 'GOVERNANCE',
      }),
    ]),
    'REQUEST_PENDING',
  )
})

// ---------------------------------------------------------------------------
// Negative path: requester, actor and self-review
// ---------------------------------------------------------------------------

test('negative: a missing, unknown or mismatched requester is refused', () => {
  assertRequestRefused(
    submitWithdrawalRequest(release(), null, input('WITHDRAWAL', 'req-requester-0001')),
    'REQUESTER_MISSING',
  )
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester({ role: 'ADMIN' }),
      input('WITHDRAWAL', 'req-requester-0002'),
    ),
    'REQUESTER_ROLE_UNKNOWN',
  )
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester({ scope: 'internal' }),
      input('WITHDRAWAL', 'req-requester-0003'),
    ),
    'REQUESTER_SCOPE_MISMATCH',
  )
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester({ principalRef: STRANGER }),
      input('WITHDRAWAL', 'req-requester-0004'),
    ),
    'REQUESTER_NOT_BOUND',
  )
  assertUnavailable(
    evaluatePublicAvailability(release(), [
      requestRecord({ requestId: 'req-requester-forged-0001', requestedBy: STRANGER }),
    ]),
    'REQUESTER_NOT_BOUND',
  )
})

test('negative: a requester role that does not match the request kind is refused', () => {
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester({ principalRef: REVIEWER, role: 'REVIEWER' }),
      input('WITHDRAWAL', 'req-requester-0005'),
    ),
    'REQUESTER_NOT_AUTHORIZED',
  )
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('TAKEDOWN', 'req-requester-0006'),
    ),
    'REQUESTER_NOT_AUTHORIZED',
  )
})

test('negative: a missing or unknown actor is refused', () => {
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(release(), requester(), input('WITHDRAWAL', 'req-actor-0001')),
  )
  const reviewed = assertAcceptedRequest(beginWithdrawalReview(submitted, actor(), [submitted]))
  assertRequestRefused(
    decideWithdrawalRequest(reviewed, null, decision('ACCEPT', 'CONSENT_WITHDRAWN'), [reviewed]),
    'ACTOR_MISSING',
    'req-actor-0001',
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      { principalRef: REVIEWER, roles: ['ADMIN'] },
      decision('ACCEPT', 'CONSENT_WITHDRAWN'),
      [reviewed],
    ),
    'ACTOR_ROLE_UNKNOWN',
    'req-actor-0001',
  )
})

test('negative: an actor without a deciding role is refused', () => {
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(release(), requester(), input('WITHDRAWAL', 'req-actor-0002')),
  )
  const reviewed = assertAcceptedRequest(beginWithdrawalReview(submitted, actor(), [submitted]))
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(['RIGHTS_HOLDER']),
      decision('ACCEPT', 'CONSENT_WITHDRAWN'),
      [reviewed],
    ),
    'ACTOR_NOT_AUTHORIZED',
    'req-actor-0002',
  )
})

test('negative: the requester cannot begin or decide their own request', () => {
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(release(), requester(), input('WITHDRAWAL', 'req-self-0001')),
  )
  assertRequestRefused(
    beginWithdrawalReview(submitted, actor(['REVIEWER'], OWNER), [submitted]),
    'SELF_REVIEW_FORBIDDEN',
    'req-self-0001',
  )
  const reviewed = assertAcceptedRequest(beginWithdrawalReview(submitted, actor(), [submitted]))
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(['REVIEWER'], OWNER),
      decision('ACCEPT', 'CONSENT_WITHDRAWN'),
      [reviewed],
    ),
    'SELF_REVIEW_FORBIDDEN',
    'req-self-0001',
  )
})

// ---------------------------------------------------------------------------
// Negative path: decisions and replay
// ---------------------------------------------------------------------------

test('negative: a withdrawal cannot be rejected', () => {
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(release(), requester(), input('WITHDRAWAL', 'req-withdrawal-0004')),
  )
  const reviewed = assertAcceptedRequest(beginWithdrawalReview(submitted, actor(), [submitted]))
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(),
      decision('REJECT', 'RIGHTS_HOLDER_REQUEST'),
      [reviewed],
    ),
    'WITHDRAWAL_IS_A_RIGHT',
    'req-withdrawal-0004',
  )
})

test('negative: a decision before review or a replayed decision is refused', () => {
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(release(), requester(), input('WITHDRAWAL', 'req-decide-0001')),
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      submitted,
      actor(),
      decision('ACCEPT', 'CONSENT_WITHDRAWN'),
      [submitted],
    ),
    'REQUEST_NOT_UNDER_REVIEW',
    'req-decide-0001',
  )
  const reviewed = assertAcceptedRequest(beginWithdrawalReview(submitted, actor(), [submitted]))
  assertRequestRefused(
    beginWithdrawalReview(reviewed, actor(), [reviewed]),
    'REQUEST_ALREADY_IN_REVIEW',
    'req-decide-0001',
  )
  const decided = assertAcceptedRequest(
    decideWithdrawalRequest(
      reviewed,
      actor(),
      decision('ACCEPT', 'CONSENT_WITHDRAWN'),
      [reviewed],
    ),
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      decided,
      actor(),
      decision('ACCEPT', 'CONSENT_WITHDRAWN'),
      [decided],
    ),
    'REQUEST_ALREADY_DECIDED',
    'req-decide-0001',
  )
  assertRequestRefused(
    beginWithdrawalReview(decided, actor(), [decided]),
    'REQUEST_ALREADY_DECIDED',
    'req-decide-0001',
  )
})

test('negative: a stale request copy that diverges from the ledger record is a replay', () => {
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(release(), requester(), input('WITHDRAWAL', 'req-stale-0001')),
  )
  const reviewed = assertAcceptedRequest(beginWithdrawalReview(submitted, actor(), [submitted]))
  const decided = assertAcceptedRequest(
    decideWithdrawalRequest(reviewed, actor(), decision('ACCEPT', 'CONSENT_WITHDRAWN'), [reviewed]),
  )

  assertRequestRefused(
    beginWithdrawalReview(
      submitted,
      actor(),
      [
        pendingRecord({
          requestId: 'req-stale-0001',
          state: 'UNDER_REVIEW',
          decidedBy: null,
          decidedByRole: null,
          decidedAt: null,
          reasonCode: null,
        }),
      ],
    ),
    'REQUEST_ID_REPLAY',
    'req-stale-0001',
  )
  assertRequestRefused(
    decideWithdrawalRequest(reviewed, actor(), decision('ACCEPT', 'CONSENT_WITHDRAWN'), [decided]),
    'REQUEST_ID_REPLAY',
    'req-stale-0001',
  )
  const divergent = applyAcceptedRequest(release(), decided, [reviewed])
  assert.equal(divergent.applied, false)
  assert.equal(divergent.reason, 'REQUEST_ID_REPLAY')
})

test('negative: missing, unknown or invalid decision input is refused', () => {
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(release(), requester(), input('WITHDRAWAL', 'req-decision-0001')),
  )
  const reviewed = assertAcceptedRequest(beginWithdrawalReview(submitted, actor(), [submitted]))
  assertRequestRefused(
    decideWithdrawalRequest(reviewed, actor(), null, [reviewed]),
    'DECISION_INVALID',
    'req-decision-0001',
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(),
      { action: 'APPROVE', reasonCode: 'CONSENT_WITHDRAWN', decidedAt: DECIDED_AT },
      [reviewed],
    ),
    'DECISION_INVALID',
    'req-decision-0001',
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(),
      { action: 'ACCEPT', decidedAt: DECIDED_AT },
      [reviewed],
    ),
    'DECISION_REASON_MISSING',
    'req-decision-0001',
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(),
      { action: 'ACCEPT', reasonCode: 'FREE_TEXT_NOTE', decidedAt: DECIDED_AT },
      [reviewed],
    ),
    'DECISION_REASON_UNKNOWN',
    'req-decision-0001',
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(),
      decision('ACCEPT', 'CONSENT_WITHDRAWN', EARLY),
      [reviewed],
    ),
    'REQUEST_TIMESTAMP_INVALID',
    'req-decision-0001',
  )
})

// ---------------------------------------------------------------------------
// Negative path: appeals
// ---------------------------------------------------------------------------

test('negative: an appeal requires an accepted takedown target', () => {
  assertRequestRefused(
    submitWithdrawalRequest(release(), requester(), input('APPEAL', 'req-appeal-0005')),
    'APPEAL_TARGET_MISSING',
    'req-appeal-0005',
  )
  const takedown = acceptedTakedown('req-takedown-0007')
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('APPEAL', 'req-appeal-0006', { targetRequestId: 'req-missing-0001' }),
      [takedown],
    ),
    'APPEAL_TARGET_UNKNOWN',
    'req-appeal-0006',
  )
  const pendingTakedown = pendingRecord({
    requestId: 'req-takedown-pending-0001',
    kind: 'TAKEDOWN',
    requestedBy: GOVERNANCE,
    requesterRole: 'GOVERNANCE',
  })
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('APPEAL', 'req-appeal-0007', { targetRequestId: 'req-takedown-pending-0001' }),
      [pendingTakedown],
    ),
    'APPEAL_TARGET_INVALID',
    'req-appeal-0007',
  )
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('APPEAL', 'req-appeal-0008', { targetRequestId: 'req-takedown-other-release' }),
      [
        requestRecord({
          requestId: 'req-takedown-other-release',
          kind: 'TAKEDOWN',
          releaseId: 'release_fixture_999',
          requestedBy: GOVERNANCE,
          requesterRole: 'GOVERNANCE',
          reasonCode: 'COPYRIGHT_COMPLAINT_UPHELD',
        }),
      ],
    ),
    'APPEAL_TARGET_OTHER_RELEASE',
    'req-appeal-0008',
  )
})

test('negative: an appeal cannot be submitted or decided by the takedown reviewer', () => {
  const takedown = acceptedTakedown('req-takedown-0008', { actorRef: OWNER })
  assert.equal(takedown.decidedBy, OWNER)
  assertRequestRefused(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('APPEAL', 'req-appeal-0009', {
        submittedAt: APPEAL_SUBMITTED_AT,
        targetRequestId: takedown.requestId,
      }),
      [takedown],
    ),
    'APPEAL_SELF_REVIEW',
    'req-appeal-0009',
  )

  const independentTakedown = acceptedTakedown('req-takedown-0009')
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('APPEAL', 'req-appeal-0010', {
        submittedAt: APPEAL_SUBMITTED_AT,
        targetRequestId: independentTakedown.requestId,
      }),
      [independentTakedown],
    ),
  )
  const reviewed = assertAcceptedRequest(
    beginWithdrawalReview(submitted, actor(['REVIEWER'], REVIEWER_TWO), [independentTakedown, submitted]),
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(['REVIEWER'], REVIEWER),
      decision('ACCEPT', 'APPEAL_UPHELD', APPEAL_DECIDED_AT),
      [independentTakedown, reviewed],
    ),
    'APPEAL_SELF_REVIEW',
    'req-appeal-0010',
  )
})

test('negative: an appeal cannot be decided by its requester or by governance alone', () => {
  const takedown = acceptedTakedown('req-takedown-0010')
  const submitted = assertAcceptedRequest(
    submitWithdrawalRequest(
      release(),
      requester(),
      input('APPEAL', 'req-appeal-0011', {
        submittedAt: APPEAL_SUBMITTED_AT,
        targetRequestId: takedown.requestId,
      }),
      [takedown],
    ),
  )
  const reviewed = assertAcceptedRequest(
    beginWithdrawalReview(submitted, actor(['REVIEWER'], REVIEWER_TWO), [takedown, submitted]),
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(['REVIEWER'], OWNER),
      decision('ACCEPT', 'APPEAL_UPHELD', APPEAL_DECIDED_AT),
      [takedown, reviewed],
    ),
    'APPEAL_SELF_REVIEW',
    'req-appeal-0011',
  )
  assertRequestRefused(
    decideWithdrawalRequest(
      reviewed,
      actor(['GOVERNANCE'], GOVERNANCE),
      decision('ACCEPT', 'APPEAL_UPHELD', APPEAL_DECIDED_AT),
      [takedown, reviewed],
    ),
    'APPEAL_REVIEWER_REQUIRED',
    'req-appeal-0011',
  )
})

test('negative: a forged accepted appeal without a reinstatement reason, an independent reviewer or correct order is refused', () => {
  const takedown = requestRecord({
    requestId: 'req-takedown-0011',
    kind: 'TAKEDOWN',
    requestedBy: GOVERNANCE,
    requesterRole: 'GOVERNANCE',
    reasonCode: 'COPYRIGHT_COMPLAINT_UPHELD',
  })
  const appeal = (overrides) =>
    requestRecord({
      requestId: 'req-appeal-forged-0001',
      kind: 'APPEAL',
      targetRequestId: takedown.requestId,
      submittedAt: APPEAL_SUBMITTED_AT,
      decidedAt: APPEAL_DECIDED_AT,
      decidedBy: REVIEWER_TWO,
      decidedByRole: 'REVIEWER',
      reasonCode: 'APPEAL_UPHELD',
      ...overrides,
    })

  assertUnavailable(
    evaluatePublicAvailability(release(), [takedown, appeal({ reasonCode: 'APPEAL_DENIED' })]),
    'REINSTATEMENT_REASON_MISSING',
  )
  assertUnavailable(
    evaluatePublicAvailability(release(), [takedown, appeal({ decidedBy: OWNER })]),
    'APPEAL_SELF_REVIEW',
  )
  assertUnavailable(
    evaluatePublicAvailability(release(), [takedown, appeal({ decidedBy: GOVERNANCE, decidedByRole: 'GOVERNANCE' })]),
    'APPEAL_REVIEWER_REQUIRED',
  )
  assertUnavailable(
    evaluatePublicAvailability(release(), [
      takedown,
      appeal({ submittedAt: EARLY, decidedAt: '2026-10-28T09:00:00.000Z' }),
    ]),
    'APPEAL_BEFORE_TAKEDOWN',
  )
})

test('negative: an appeal cannot revive an accepted withdrawal', () => {
  const withdrawal = runDecision('WITHDRAWAL', 'req-withdrawal-0005')
  const takedown = acceptedTakedown('req-takedown-0012', { existing: [withdrawal] })
  const appeal = runDecision('APPEAL', 'req-appeal-0012', {
    targetRequestId: takedown.requestId,
    existing: [withdrawal, takedown],
    submittedAt: APPEAL_SUBMITTED_AT,
    decidedAt: APPEAL_DECIDED_AT,
    actorRef: REVIEWER_TWO,
  })
  assertUnavailable(
    evaluatePublicAvailability(release(), [withdrawal, takedown, appeal]),
    'RELEASE_WITHDRAWN',
  )
})

// ---------------------------------------------------------------------------
// Negative path: release-state application
// ---------------------------------------------------------------------------

test('negative: applying to an already terminal or mismatched release is refused', () => {
  const withdrawal = runDecision('WITHDRAWAL', 'req-withdrawal-0006')
  const terminal = applyAcceptedRequest(release({ state: 'WITHDRAWN' }), withdrawal, [withdrawal])
  assert.equal(terminal.applied, false)
  assert.equal(terminal.reason, 'RELEASE_WITHDRAWN')

  const otherRelease = requestRecord({ requestId: 'req-withdrawal-other', releaseId: 'release_fixture_999' })
  const mismatched = applyAcceptedRequest(release(), otherRelease, [otherRelease])
  assert.equal(mismatched.applied, false)
  assert.equal(mismatched.reason, 'REQUEST_RELEASE_MISMATCH')

  const pending = pendingRecord({ requestId: 'req-withdrawal-pending' })
  const notAccepted = applyAcceptedRequest(release(), pending, [pending])
  assert.equal(notAccepted.applied, false)
  assert.equal(notAccepted.reason, 'REQUEST_NOT_ACCEPTED')

  const accepted = requestRecord({ requestId: 'req-withdrawal-unrecorded' })
  const unrecorded = applyAcceptedRequest(release(), accepted, [])
  assert.equal(unrecorded.applied, false)
  assert.equal(unrecorded.reason, 'REQUEST_FIELD_MISSING')
})
