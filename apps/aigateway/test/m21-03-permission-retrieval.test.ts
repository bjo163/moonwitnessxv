import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MODEL_CONTEXT_SCOPE,
  evaluateSourceCandidate,
  selectAuthorizedSources,
  type AuthorizedSourceDecision,
  type DeniedSourceDecision,
  type RetrievalDecision,
  type RetrievalDenialReason,
  type RetrievalRequester,
  type SourceCandidate,
} from '../src/retrieval.js'

// Every fixture here is synthetic. This string is a canary: it may appear in
// an authorized result but must never appear in any denial record.
const CANARY_BODY = 'SYNTHETIC-CANARY-7f3a restricted source bytes for M21-03 tests only'
const NOW = '2026-10-27T12:00:00.000Z'
const PAST = '2026-10-26T12:00:00.000Z'
const FUTURE = '2027-10-27T12:00:00.000Z'
const REQUESTER_PRINCIPAL = 'principal:fixture:reader-001'
const SOURCE_ID = 'src_public_001'

function publicCandidate(overrides: Partial<SourceCandidate> = {}): SourceCandidate {
  return {
    id: SOURCE_ID,
    ownerPrincipalRef: 'principal:fixture:public-archive',
    visibility: 'PUBLIC',
    rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
    rightsScope: MODEL_CONTEXT_SCOPE,
    consentScope: MODEL_CONTEXT_SCOPE,
    consentExpiresAt: FUTURE,
    sourceLocator: 'fixture://sources/public-001',
    body: CANARY_BODY,
    ...overrides,
  }
}

function requester(overrides: Partial<RetrievalRequester> = {}): RetrievalRequester {
  return {
    principalRef: REQUESTER_PRINCIPAL,
    roles: ['user'],
    scopes: [MODEL_CONTEXT_SCOPE],
    grants: [],
    requestedScope: MODEL_CONTEXT_SCOPE,
    evaluatedAt: NOW,
    ...overrides,
  }
}

function rawCandidate(overrides: Record<string, unknown>): unknown {
  return { ...publicCandidate(), ...overrides }
}

function rawRequester(overrides: Record<string, unknown>): unknown {
  return { ...requester(), ...overrides }
}

function assertAuthorized(decision: RetrievalDecision): asserts decision is AuthorizedSourceDecision {
  assert.equal(decision.authorized, true, `expected authorization, got ${JSON.stringify(decision)}`)
  if (!decision.authorized) throw new Error('unreachable')
}

function assertNoSourceText(decision: DeniedSourceDecision): void {
  assert.equal(Object.hasOwn(decision, 'body'), false)
  assert.equal(Object.hasOwn(decision, 'snippet'), false)
  assert.equal(Object.hasOwn(decision, 'text'), false)
  assert.equal(Object.hasOwn(decision, 'content'), false)
  assert.equal(Object.hasOwn(decision, 'sourceLocator'), false)
  const serialized = JSON.stringify(decision)
  assert.equal(serialized.includes(CANARY_BODY), false)
  assert.equal(serialized.includes('SYNTHETIC-CANARY'), false)
}

function assertDenied(
  decision: RetrievalDecision,
  reason: RetrievalDenialReason,
): asserts decision is DeniedSourceDecision {
  assert.equal(decision.authorized, false, `expected denial ${reason}`)
  if (decision.authorized) throw new Error('unreachable')
  assert.equal(decision.reason, reason)
  assertNoSourceText(decision)
}

test('M21-03 positive: cleared, consent-covered public source is authorized with body and locator', () => {
  const decision = evaluateSourceCandidate(publicCandidate(), requester())

  assertAuthorized(decision)
  assert.equal(decision.sourceId, SOURCE_ID)
  assert.equal(decision.body, CANARY_BODY)
  assert.equal(decision.sourceLocator, 'fixture://sources/public-001')
  assert.equal(decision.visibility, 'PUBLIC')
  assert.equal(decision.rightsStatus, 'RIGHTS_EXACT_VERSION_CLEARED')
})

test('M21-03 positive: RESTRICTED opens only through a matching principal and scope grant', () => {
  const source = publicCandidate({ id: 'src_restricted_001', visibility: 'RESTRICTED' })
  const decision = evaluateSourceCandidate(
    source,
    requester({
      grants: [
        {
          sourceId: 'src_restricted_001',
          principalRef: REQUESTER_PRINCIPAL,
          scope: MODEL_CONTEXT_SCOPE,
          expiresAt: FUTURE,
        },
      ],
    }),
  )

  assertAuthorized(decision)
  assert.equal(decision.body, CANARY_BODY)
})

test('M21-03 negative: PRIVATE is denied even for its owner holding admin roles', () => {
  const source = publicCandidate({
    visibility: 'PRIVATE',
    ownerPrincipalRef: REQUESTER_PRINCIPAL,
  })
  const decision = evaluateSourceCandidate(
    source,
    requester({ roles: ['admin'], scopes: ['admin:full', MODEL_CONTEXT_SCOPE] }),
  )

  assertDenied(decision, 'SOURCE_PRIVATE')
  assert.equal(decision.sourceId, SOURCE_ID)
})

test('M21-03 negative: RESTRICTED without a grant is denied', () => {
  const decision = evaluateSourceCandidate(publicCandidate({ visibility: 'RESTRICTED' }), requester())

  assertDenied(decision, 'SOURCE_RESTRICTED_NO_GRANT')
})

test('M21-03 negative: RESTRICTED grant issued to another principal is denied', () => {
  const decision = evaluateSourceCandidate(
    publicCandidate({ visibility: 'RESTRICTED' }),
    requester({
      grants: [
        {
          sourceId: SOURCE_ID,
          principalRef: 'principal:fixture:someone-else',
          scope: MODEL_CONTEXT_SCOPE,
        },
      ],
    }),
  )

  assertDenied(decision, 'SOURCE_RESTRICTED_GRANT_OTHER_PRINCIPAL')
})

test('M21-03 negative: RESTRICTED grant for a different scope is denied', () => {
  const decision = evaluateSourceCandidate(
    publicCandidate({ visibility: 'RESTRICTED' }),
    requester({
      grants: [
        {
          sourceId: SOURCE_ID,
          principalRef: REQUESTER_PRINCIPAL,
          scope: 'publication',
        },
      ],
    }),
  )

  assertDenied(decision, 'SOURCE_RESTRICTED_GRANT_SCOPE_MISMATCH')
})

test('M21-03 negative: expired RESTRICTED grant is denied', () => {
  const decision = evaluateSourceCandidate(
    publicCandidate({ visibility: 'RESTRICTED' }),
    requester({
      grants: [
        {
          sourceId: SOURCE_ID,
          principalRef: REQUESTER_PRINCIPAL,
          scope: MODEL_CONTEXT_SCOPE,
          expiresAt: PAST,
        },
      ],
    }),
  )

  assertDenied(decision, 'SOURCE_RESTRICTED_GRANT_EXPIRED')
})

test('M21-03 negative: RIGHTS_UNKNOWN never yields bytes', () => {
  const decision = evaluateSourceCandidate(
    publicCandidate({ rightsStatus: 'RIGHTS_UNKNOWN', rightsScope: 'METADATA_ONLY' }),
    requester(),
  )

  assertDenied(decision, 'RIGHTS_UNKNOWN')
})

test('M21-03 negative: rights scope that does not cover the requested scope is denied', () => {
  const decision = evaluateSourceCandidate(publicCandidate({ rightsScope: 'publication' }), requester())

  assertDenied(decision, 'RIGHTS_SCOPE_MISMATCH')
})

test('M21-03 negative: missing consent scope is denied', () => {
  const decision = evaluateSourceCandidate(publicCandidate({ consentScope: null }), requester())

  assertDenied(decision, 'CONSENT_MISSING')
})

test('M21-03 negative: expired consent is denied', () => {
  const decision = evaluateSourceCandidate(publicCandidate({ consentExpiresAt: PAST }), requester())

  assertDenied(decision, 'CONSENT_EXPIRED')
})

test('M21-03 negative: consent scope that does not cover the requested scope is denied', () => {
  const decision = evaluateSourceCandidate(publicCandidate({ consentScope: 'publication' }), requester())

  assertDenied(decision, 'CONSENT_SCOPE_MISMATCH')
})

test('M21-03 negative: WITHDRAWN is denied despite consent and a valid grant', () => {
  const decision = evaluateSourceCandidate(
    publicCandidate({ visibility: 'WITHDRAWN' }),
    requester({
      roles: ['admin', 'reviewer'],
      grants: [
        {
          sourceId: SOURCE_ID,
          principalRef: REQUESTER_PRINCIPAL,
          scope: MODEL_CONTEXT_SCOPE,
        },
      ],
    }),
  )

  assertDenied(decision, 'SOURCE_WITHDRAWN')
})

test('M21-03 negative: roles alone never override source permission', () => {
  const source = publicCandidate({ visibility: 'RESTRICTED' })
  const privileged = evaluateSourceCandidate(
    source,
    requester({ roles: ['admin', 'editor', 'reviewer'], scopes: ['admin:full', MODEL_CONTEXT_SCOPE] }),
  )
  const anonymous = evaluateSourceCandidate(source, requester({ roles: [], scopes: [] }))

  assertDenied(privileged, 'SOURCE_RESTRICTED_NO_GRANT')
  assert.deepEqual(privileged, anonymous)
})

test('M21-03 negative: malformed or missing source fields fail closed', () => {
  const cases: ReadonlyArray<readonly [string, unknown, RetrievalDenialReason, string | null]> = [
    ['missing id', rawCandidate({ id: undefined }), 'SOURCE_FIELD_MISSING', null],
    ['missing owner', rawCandidate({ ownerPrincipalRef: '' }), 'SOURCE_FIELD_MISSING', SOURCE_ID],
    ['missing visibility', rawCandidate({ visibility: undefined }), 'SOURCE_FIELD_MISSING', SOURCE_ID],
    ['unknown visibility', rawCandidate({ visibility: 'SECRET' }), 'SOURCE_VISIBILITY_INVALID', SOURCE_ID],
    ['missing rights status', rawCandidate({ rightsStatus: undefined }), 'SOURCE_FIELD_MISSING', SOURCE_ID],
    [
      'unknown rights status',
      rawCandidate({ rightsStatus: 'MAYBE' }),
      'SOURCE_RIGHTS_STATUS_INVALID',
      SOURCE_ID,
    ],
    ['missing rights scope', rawCandidate({ rightsScope: '' }), 'SOURCE_FIELD_MISSING', SOURCE_ID],
    ['missing locator', rawCandidate({ sourceLocator: undefined }), 'SOURCE_FIELD_MISSING', SOURCE_ID],
    ['non-string body', rawCandidate({ body: 42 }), 'SOURCE_FIELD_INVALID', SOURCE_ID],
    ['non-object candidate', null, 'SOURCE_FIELD_MISSING', null],
  ]

  for (const [label, candidate, reason, expectedSourceId] of cases) {
    const decision = evaluateSourceCandidate(candidate, requester())
    assertDenied(decision, reason)
    assert.equal(decision.sourceId, expectedSourceId, `${label} must report only an opaque source id`)
  }
})

test('M21-03 negative: malformed requests deny every candidate', () => {
  const source = publicCandidate()
  const cases: ReadonlyArray<readonly [string, unknown, RetrievalDenialReason]> = [
    ['missing principal', rawRequester({ principalRef: '' }), 'REQUEST_FIELD_MISSING'],
    ['missing requested scope', rawRequester({ requestedScope: undefined }), 'REQUEST_FIELD_MISSING'],
    ['invalid evaluatedAt', rawRequester({ evaluatedAt: 'not-a-timestamp' }), 'REQUEST_TIMESTAMP_INVALID'],
    ['invalid grant list', rawRequester({ grants: 'all' }), 'REQUEST_FIELD_INVALID'],
    ['invalid grant entry', rawRequester({ grants: [{ sourceId: SOURCE_ID }] }), 'REQUEST_FIELD_INVALID'],
  ]

  for (const [label, badRequester, reason] of cases) {
    const decision = evaluateSourceCandidate(source, badRequester)
    assertDenied(decision, reason)
    assert.equal(decision.sourceId, SOURCE_ID, `${label} denial should keep the opaque source id only`)
  }
})

test('M21-03 negative: no denial result carries source text across a mixed batch', () => {
  const candidates = [
    publicCandidate({ id: 'src_private', visibility: 'PRIVATE' }),
    publicCandidate({ id: 'src_restricted', visibility: 'RESTRICTED' }),
    publicCandidate({ id: 'src_withdrawn', visibility: 'WITHDRAWN' }),
    publicCandidate({ id: 'src_unknown', rightsStatus: 'RIGHTS_UNKNOWN' }),
    publicCandidate({ id: 'src_no_consent', consentScope: null }),
    publicCandidate({ id: 'src_expired_consent', consentExpiresAt: PAST }),
  ]
  const decisions = selectAuthorizedSources(candidates, requester())

  assert.equal(decisions.length, candidates.length)
  for (const decision of decisions) {
    assert.equal(decision.authorized, false)
    if (decision.authorized) throw new Error('unreachable')
    assertNoSourceText(decision)
  }
  assert.deepEqual(
    decisions.map((decision) => decision.sourceId),
    candidates.map((candidate) => candidate.id),
  )
})

test('M21-03: selection is deterministic and preserves candidate order', () => {
  const candidates = [
    publicCandidate({ id: 'src_a' }),
    publicCandidate({ id: 'src_b', visibility: 'RESTRICTED' }),
    publicCandidate({ id: 'src_c', visibility: 'WITHDRAWN' }),
  ]
  const first = selectAuthorizedSources(candidates, requester())
  const second = selectAuthorizedSources(candidates, requester())

  assert.deepEqual(first, second)
  assert.deepEqual(
    first.map((decision) => [decision.sourceId, decision.authorized]),
    [
      ['src_a', true],
      ['src_b', false],
      ['src_c', false],
    ],
  )
})
