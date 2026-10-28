import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  REVIEW_INBOX_POLICY_VERSION,
  evaluateCanonicalAction,
  evaluateReviewInbox,
  type AllowedCanonicalActionDecision,
  type CanonicalActionDecision,
  type CanonicalActionRequest,
  type ClaimSuggestion,
  type RefusedCanonicalActionDecision,
  type ReviewInboxDenialReason,
  type ReviewInboxPolicy,
  type ReviewerAuthorization,
  type ReviewerDecision,
} from '../src/review-inbox.js'

// Every fixture here is synthetic. CANARY includes a URL-shaped string: it
// may appear in the input suggestion but must never appear in a refusal.
const CANARY = 'SYNTHETIC-M21-05-CANARY-4b2e https://payload.example/claim'
const NOW = '2026-10-27T12:00:00.000Z'
const PAST = '2026-10-26T12:00:00.000Z'
const FUTURE = '2027-10-27T12:00:00.000Z'
const SUGGESTION_ID = 'suggestion:fixture-001'
const SOURCE_ID = 'src_fixture_001'
const PROPOSER = 'principal:fixture:model-run-001'
const REVIEWER = 'principal:fixture:reviewer-001'
const REQUIRED_ROLE = 'canonical-reviewer'

function suggestion(
  overrides: Partial<ClaimSuggestion> = {},
): ClaimSuggestion {
  return {
    id: SUGGESTION_ID,
    kind: 'CLAIM',
    sourceId: SOURCE_ID,
    proposedBy: PROPOSER,
    proposedAt: NOW,
    payloadSummary: `${CANARY} Proposed claim wording for review only.`,
    status: 'APPROVED',
    ...overrides,
  }
}

function authorization(
  overrides: Partial<ReviewerAuthorization> = {},
): ReviewerAuthorization {
  return {
    principalRef: REVIEWER,
    principalKind: 'HUMAN',
    role: REQUIRED_ROLE,
    expiresAt: FUTURE,
    ...overrides,
  }
}

function policy(overrides: Partial<ReviewInboxPolicy> = {}): ReviewInboxPolicy {
  return {
    requiredRole: REQUIRED_ROLE,
    reviewerAuthorizations: [authorization()],
    evaluatedAt: NOW,
    ...overrides,
  }
}

function decision(
  overrides: Partial<ReviewerDecision> = {},
): ReviewerDecision {
  return {
    actor: REVIEWER,
    role: REQUIRED_ROLE,
    decision: 'APPROVE',
    decidedAt: NOW,
    note: 'Reviewed the payload in the inbox.',
    ...overrides,
  }
}

function request(
  overrides: Partial<CanonicalActionRequest> = {},
): CanonicalActionRequest {
  return {
    suggestion: suggestion(),
    decisions: [decision()],
    ...overrides,
  }
}

function rawRequest(overrides: Record<string, unknown>): unknown {
  return { ...request(), ...overrides }
}

function rawSuggestion(overrides: Record<string, unknown>): unknown {
  return { ...suggestion(), ...overrides }
}

function rawPolicy(overrides: Record<string, unknown>): unknown {
  return { ...policy(), ...overrides }
}

function assertAllowed(
  result: CanonicalActionDecision,
): asserts result is AllowedCanonicalActionDecision {
  assert.equal(
    result.allowed,
    true,
    `expected authorization, got ${JSON.stringify(result)}`,
  )
  if (!result.allowed) throw new Error('unreachable')
}

function assertNoSuggestionContent(
  result: RefusedCanonicalActionDecision,
): void {
  for (const key of [
    'payloadSummary',
    'note',
    'sourceId',
    'proposedBy',
    'suggestion',
    'decisions',
    'decision',
    'text',
    'content',
    'snippet',
    'body',
    'url',
  ]) {
    assert.equal(Object.hasOwn(result, key), false, `refusal must not carry ${key}`)
  }
  const serialized = JSON.stringify(result)
  assert.equal(serialized.includes('SYNTHETIC-M21-05-CANARY'), false)
  assert.equal(serialized.includes('payload.example'), false)
  assert.equal(serialized.includes('://'), false)
  assert.equal(serialized.includes(SOURCE_ID), false)
  assert.equal(serialized.includes(PROPOSER), false)
  assert.equal(serialized.includes(REVIEWER), false)
}

function assertRefused(
  result: CanonicalActionDecision,
  reason: ReviewInboxDenialReason,
): asserts result is RefusedCanonicalActionDecision {
  assert.equal(
    result.allowed,
    false,
    `expected refusal ${reason}, got ${JSON.stringify(result)}`,
  )
  if (result.allowed) throw new Error('unreachable')
  assert.equal(result.reason, reason)
  assert.equal(result.policyVersion, REVIEW_INBOX_POLICY_VERSION)
  assertNoSuggestionContent(result)
}

test('M21-05 positive: an authorized human reviewer who is not the proposer approves and canonical action is allowed', () => {
  const result = evaluateCanonicalAction(request(), policy())

  assertAllowed(result)
  assert.equal(result.suggestionId, SUGGESTION_ID)
  assert.equal(result.kind, 'CLAIM')
  assert.equal(result.sourceId, SOURCE_ID)
  assert.equal(result.reviewerPrincipalRef, REVIEWER)
  assert.equal(result.reviewerRole, REQUIRED_ROLE)
  assert.equal(result.approvedAt, NOW)
  assert.equal(result.evaluatedAt, NOW)
  assert.equal(result.policyVersion, REVIEW_INBOX_POLICY_VERSION)
  assert.equal(Object.hasOwn(result, 'payloadSummary'), false)
  assert.equal(JSON.stringify(result).includes('SYNTHETIC-M21-05-CANARY'), false)
})

test('M21-05 positive: an EDIT suggestion with a live role-scoped grant passes', () => {
  const result = evaluateCanonicalAction(
    request({ suggestion: suggestion({ id: 'suggestion:fixture-002', kind: 'EDIT' }) }),
    policy({
      reviewerAuthorizations: [
        authorization({ role: 'viewer', expiresAt: FUTURE }),
        authorization({ expiresAt: FUTURE }),
      ],
    }),
  )

  assertAllowed(result)
  assert.equal(result.kind, 'EDIT')
  assert.equal(result.suggestionId, 'suggestion:fixture-002')
})

test('M21-05 positive: a mixed inbox returns one ordered decision per request', () => {
  const results = evaluateReviewInbox(
    [
      request(),
      request({
        suggestion: suggestion({ id: 'suggestion:fixture-002', status: 'WITHDRAWN' }),
      }),
    ],
    policy(),
  )

  assert.equal(results.length, 2)
  const first = results[0]
  const second = results[1]
  if (first === undefined || second === undefined) throw new Error('unreachable')
  assertAllowed(first)
  assertRefused(second, 'SUGGESTION_WITHDRAWN')
})

test('M21-05 negative: an approved suggestion with no recorded decision cannot become canonical', () => {
  const result = evaluateCanonicalAction(request({ decisions: [] }), policy())

  assertRefused(result, 'DECISION_MISSING')
  assert.equal(result.suggestionId, SUGGESTION_ID)
})

test('M21-05 negative: pending, withdrawn and rejected suggestions never pass', () => {
  const cases: ReadonlyArray<
    readonly [string, ClaimSuggestion, ReviewInboxDenialReason]
  > = [
    ['pending', suggestion({ status: 'PENDING' }), 'SUGGESTION_PENDING'],
    ['withdrawn', suggestion({ status: 'WITHDRAWN' }), 'SUGGESTION_WITHDRAWN'],
    ['rejected', suggestion({ status: 'REJECTED' }), 'SUGGESTION_REJECTED'],
  ]

  for (const [label, pendingSuggestion, reason] of cases) {
    const result = evaluateCanonicalAction(
      request({ suggestion: pendingSuggestion }),
      policy(),
    )
    assert.equal(result.allowed, false, label)
    assertRefused(result, reason)
    assert.equal(result.suggestionId, SUGGESTION_ID, label)
  }
})

test('M21-05 negative: non-approve decisions cannot become canonical', () => {
  for (const value of ['REJECT', 'REQUEST_CHANGES'] as const) {
    const result = evaluateCanonicalAction(
      request({ decisions: [decision({ decision: value })] }),
      policy(),
    )
    assertRefused(result, 'DECISION_NOT_APPROVE')
  }
})

test('M21-05 negative: a reviewer without a live exact-role authorization fails closed', () => {
  const unlisted = authorization({ principalRef: 'principal:fixture:someone-else' })
  const wrongRole = authorization({ role: 'viewer' })
  const expired = authorization({ expiresAt: PAST })
  const cases: ReadonlyArray<
    readonly [string, CanonicalActionRequest, ReviewInboxPolicy, ReviewInboxDenialReason]
  > = [
    [
      'no matching authorization',
      request({ decisions: [decision({ actor: 'principal:fixture:unlisted-human' })] }),
      policy(),
      'REVIEWER_NOT_AUTHORIZED',
    ],
    [
      'decision role is not the required role',
      request({ decisions: [decision({ role: 'viewer' })] }),
      policy(),
      'REVIEWER_ROLE_MISSING',
    ],
    [
      'authorization holds a different role',
      request(),
      policy({ reviewerAuthorizations: [wrongRole] }),
      'REVIEWER_NOT_AUTHORIZED',
    ],
    [
      'expired authorization',
      request(),
      policy({ reviewerAuthorizations: [expired] }),
      'REVIEWER_AUTHORIZATION_EXPIRED',
    ],
    [
      'only another principal is authorized',
      request(),
      policy({ reviewerAuthorizations: [unlisted] }),
      'REVIEWER_NOT_AUTHORIZED',
    ],
  ]

  for (const [label, requestFixture, policyFixture, reason] of cases) {
    const result = evaluateCanonicalAction(requestFixture, policyFixture)
    assert.equal(result.allowed, false, label)
    assertRefused(result, reason)
  }
})

test('M21-05 negative: the proposer cannot approve its own suggestion even with a valid grant', () => {
  const result = evaluateCanonicalAction(
    request({ decisions: [decision({ actor: PROPOSER })] }),
    policy({
      reviewerAuthorizations: [authorization({ principalRef: PROPOSER })],
    }),
  )

  assertRefused(result, 'REVIEWER_IS_PROPOSER')
})

test('M21-05 negative: an AI principal can never approve, even when granted the required role', () => {
  const aiActor = 'principal:fixture:auto-summarizer'
  const aiAuthorized = evaluateCanonicalAction(
    request({ decisions: [decision({ actor: aiActor })] }),
    policy({
      reviewerAuthorizations: [
        authorization({ principalRef: aiActor, principalKind: 'AI_AGENT' }),
      ],
    }),
  )
  assertRefused(aiAuthorized, 'REVIEWER_NOT_HUMAN')

  const disguisedActor = 'principal:agent:007'
  const disguised = evaluateCanonicalAction(
    request({ decisions: [decision({ actor: disguisedActor })] }),
    policy({
      reviewerAuthorizations: [
        authorization({ principalRef: disguisedActor, principalKind: 'HUMAN' }),
      ],
    }),
  )
  assertRefused(disguised, 'REVIEWER_NOT_HUMAN')
})

test('M21-05 negative: a declared conflict of interest fails closed', () => {
  const result = evaluateCanonicalAction(
    request({ decisions: [decision({ conflictOfInterest: true })] }),
    policy(),
  )

  assertRefused(result, 'REVIEWER_CONFLICT_OF_INTEREST')
})

test('M21-05 negative: duplicate decisions are refused instead of the later decision overriding', () => {
  const duplicateApprovals = evaluateCanonicalAction(
    request({ decisions: [decision(), decision()] }),
    policy(),
  )
  assertRefused(duplicateApprovals, 'DUPLICATE_DECISION')

  const replayAfterApproval = evaluateCanonicalAction(
    request({
      decisions: [decision(), decision({ decision: 'REJECT' })],
    }),
    policy(),
  )
  assertRefused(replayAfterApproval, 'DUPLICATE_DECISION')
})

test('M21-05 negative: malformed suggestions and decisions fail closed without echoing input', () => {
  const cases: ReadonlyArray<
    readonly [string, unknown, ReviewInboxDenialReason, string | null]
  > = [
    ['non-object request', null, 'REQUEST_MISSING', null],
    ['missing suggestion', rawRequest({ suggestion: undefined }), 'SUGGESTION_MISSING', null],
    [
      'non-object suggestion',
      rawRequest({ suggestion: 'suggestion' }),
      'SUGGESTION_FIELD_MISSING',
      null,
    ],
    [
      'missing suggestion id',
      rawRequest({ suggestion: rawSuggestion({ id: undefined }) }),
      'SUGGESTION_FIELD_MISSING',
      null,
    ],
    [
      'URL-shaped suggestion id',
      rawRequest({ suggestion: rawSuggestion({ id: 'https://payload.example/claim' }) }),
      'SUGGESTION_ID_INVALID',
      null,
    ],
    [
      'unknown suggestion kind',
      rawRequest({ suggestion: rawSuggestion({ kind: 'DELETE' }) }),
      'SUGGESTION_KIND_INVALID',
      SUGGESTION_ID,
    ],
    [
      'missing source id',
      rawRequest({ suggestion: rawSuggestion({ sourceId: undefined }) }),
      'SUGGESTION_FIELD_MISSING',
      SUGGESTION_ID,
    ],
    [
      'URL-shaped source id',
      rawRequest({
        suggestion: rawSuggestion({ sourceId: 'https://payload.example/source' }),
      }),
      'SUGGESTION_SOURCE_ID_INVALID',
      SUGGESTION_ID,
    ],
    [
      'missing proposer',
      rawRequest({ suggestion: rawSuggestion({ proposedBy: '' }) }),
      'SUGGESTION_FIELD_MISSING',
      SUGGESTION_ID,
    ],
    [
      'invalid proposal timestamp',
      rawRequest({ suggestion: rawSuggestion({ proposedAt: 'not-a-timestamp' }) }),
      'SUGGESTION_TIMESTAMP_INVALID',
      SUGGESTION_ID,
    ],
    [
      'non-string payload summary',
      rawRequest({ suggestion: rawSuggestion({ payloadSummary: 42 }) }),
      'SUGGESTION_FIELD_INVALID',
      SUGGESTION_ID,
    ],
    [
      'blank payload summary',
      rawRequest({ suggestion: rawSuggestion({ payloadSummary: '   ' }) }),
      'SUGGESTION_FIELD_MISSING',
      SUGGESTION_ID,
    ],
    [
      'unknown suggestion status',
      rawRequest({ suggestion: rawSuggestion({ status: 'UNREVIEWED' }) }),
      'SUGGESTION_STATUS_INVALID',
      SUGGESTION_ID,
    ],
    ['decision list not an array', rawRequest({ decisions: 'yes' }), 'DECISIONS_INVALID', SUGGESTION_ID],
    ['non-object decision', rawRequest({ decisions: [null] }), 'DECISION_INVALID', SUGGESTION_ID],
    [
      'missing reviewer',
      rawRequest({ decisions: [decision({ actor: '' })] }),
      'REVIEWER_MISSING',
      SUGGESTION_ID,
    ],
    [
      'missing reviewer role',
      rawRequest({ decisions: [decision({ role: '' })] }),
      'REVIEWER_ROLE_MISSING',
      SUGGESTION_ID,
    ],
    [
      'unknown decision value',
      rawRequest({ decisions: [decision({ decision: 'PUBLISH' as ReviewerDecision['decision'] })] }),
      'DECISION_INVALID',
      SUGGESTION_ID,
    ],
    [
      'invalid decision timestamp',
      rawRequest({ decisions: [decision({ decidedAt: 'soon' })] }),
      'DECISION_TIMESTAMP_INVALID',
      SUGGESTION_ID,
    ],
    [
      'non-string note',
      rawRequest({ decisions: [decision({ note: 42 as unknown as string })] }),
      'DECISION_INVALID',
      SUGGESTION_ID,
    ],
    [
      'non-boolean conflict flag',
      rawRequest({
        decisions: [decision({ conflictOfInterest: 'yes' as unknown as boolean })],
      }),
      'DECISION_INVALID',
      SUGGESTION_ID,
    ],
  ]

  for (const [label, requestFixture, reason, expectedId] of cases) {
    const result = evaluateCanonicalAction(requestFixture, policy())
    assert.equal(result.allowed, false, label)
    assertRefused(result, reason)
    assert.equal(result.suggestionId, expectedId, label)
  }
})

test('M21-05 negative: malformed or missing policy fails closed before any approval', () => {
  const cases: ReadonlyArray<readonly [string, unknown, ReviewInboxDenialReason]> = [
    ['missing policy', undefined, 'POLICY_MISSING'],
    ['non-object policy', 'policy', 'POLICY_MISSING'],
    ['missing required role', rawPolicy({ requiredRole: undefined }), 'POLICY_MISSING'],
    [
      'missing reviewer authorizations',
      rawPolicy({ reviewerAuthorizations: undefined }),
      'POLICY_MISSING',
    ],
    ['missing evaluatedAt', rawPolicy({ evaluatedAt: undefined }), 'POLICY_TIMESTAMP_INVALID'],
    ['invalid evaluatedAt', rawPolicy({ evaluatedAt: 'not-a-timestamp' }), 'POLICY_TIMESTAMP_INVALID'],
    [
      'authorization list not an array',
      rawPolicy({ reviewerAuthorizations: 'all' }),
      'REVIEWER_AUTHORIZATION_INVALID',
    ],
    [
      'unknown principal kind',
      rawPolicy({
        reviewerAuthorizations: [
          authorization({ principalKind: 'ROBOT' as unknown as 'HUMAN' }),
        ],
      }),
      'REVIEWER_AUTHORIZATION_INVALID',
    ],
    [
      'authorization without a role',
      rawPolicy({ reviewerAuthorizations: [authorization({ role: '' })] }),
      'REVIEWER_AUTHORIZATION_INVALID',
    ],
    [
      'authorization with an invalid expiry',
      rawPolicy({ reviewerAuthorizations: [authorization({ expiresAt: 'soon' })] }),
      'REVIEWER_AUTHORIZATION_INVALID',
    ],
  ]

  for (const [label, policyFixture, reason] of cases) {
    const result = evaluateCanonicalAction(request(), policyFixture)
    assert.equal(result.allowed, false, label)
    assertRefused(result, reason)
    assert.equal(result.suggestionId, SUGGESTION_ID, label)
    assert.equal(result.evaluatedAt, null, label)
  }
})

test('M21-05 negative: no refusal in a mixed inbox carries payload, note, source id or URL', () => {
  const results = evaluateReviewInbox(
    [
      request({ suggestion: suggestion({ status: 'PENDING' }) }),
      request({ decisions: [decision({ actor: PROPOSER })] }),
      request({
        decisions: [decision({ actor: 'principal:fixture:auto-summarizer' })],
      }),
      request({ decisions: [decision(), decision()] }),
      rawRequest({ suggestion: rawSuggestion({ id: 'https://payload.example/claim' }) }),
    ],
    policy(),
  )

  assert.equal(results.length, 5)
  for (const result of results) {
    assert.equal(result.allowed, false)
    if (result.allowed) throw new Error('unreachable')
    assertNoSuggestionContent(result)
  }
})

test('M21-05: repeated evaluation is deterministic', () => {
  const allowed = request()
  const denied = request({ decisions: [] })

  assert.deepEqual(
    evaluateCanonicalAction(allowed, policy()),
    evaluateCanonicalAction(allowed, policy()),
  )
  assert.deepEqual(
    evaluateCanonicalAction(denied, policy()),
    evaluateCanonicalAction(denied, policy()),
  )
})
