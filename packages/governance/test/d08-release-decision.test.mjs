import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decideRelease, readDecision } from '../src/index.ts'

// Every fixture is synthetic. CANARIES are attached to evidence refs and to
// request fields on purpose: no refusal may echo them, whether it succeeds or
// refuses. The decision itself may carry the opaque refs it was given.
const CANARY_RIGHTS = 'CANARY-rights-evidence-ref'
const CANARY_CONSENT = 'CANARY-consent-evidence-ref'
const CANARY_SOURCE = 'CANARY-source-evidence-ref'
const CANARY_REVIEW = 'CANARY-review-evidence-ref'
const CANARY_ACTOR = 'CANARY-actor-principal'
const CANARY_BODY = 'CANARY-raw-source-bytes'

const DIGEST = `sha256:${'a'.repeat(64)}`
const OTHER_DIGEST = `sha256:${'c'.repeat(64)}`
const MANIFEST = `sha256:${'b'.repeat(64)}`
const OTHER_MANIFEST = `sha256:${'d'.repeat(64)}`

const RELEASE_ID = 'release_fixture_d08_001'
const REVISION_ID = 'revision_fixture_d08_001'
const REQUEST_ID = 'request_fixture_d08_001'
const REVIEWER = 'principal:fixture:reviewer-001'
const OTHER_REVIEWER = 'principal:fixture:reviewer-002'
const AUTHOR = 'principal:fixture:author-001'
const RIGHTS_OWNER = 'principal:fixture:rights-holder-001'

const NOW = '2026-10-29T10:00:00.000Z'
const VERIFIED_AT = '2026-10-29T09:00:00.000Z'
const REQUESTED_AT = '2026-10-29T09:30:00.000Z'
const GRANTED_AT = '2026-10-01T00:00:00.000Z'
const GRANT_EXPIRES_AT = '2027-01-01T00:00:00.000Z'
const CONSENT_EXPIRES_AT = '2027-01-01T00:00:00.000Z'

function makeRequest(overrides = {}) {
  return {
    requestId: REQUEST_ID,
    releaseId: RELEASE_ID,
    domain: 'D05_RESEARCH',
    recordId: RELEASE_ID,
    revisionId: REVISION_ID,
    contentDigest: DIGEST,
    contentType: 'TEXT',
    scope: 'public',
    classification: 'UNCLASSIFIED',
    fields: ['title', 'summary'],
    rightsRef: CANARY_RIGHTS,
    consentRef: CANARY_CONSENT,
    sourceRef: CANARY_SOURCE,
    reviewRef: CANARY_REVIEW,
    manifestHash: MANIFEST,
    submittedBy: AUTHOR,
    conflictPrincipalRefs: [],
    requestedAt: REQUESTED_AT,
    ...overrides,
  }
}

function makeEvidence(overrides = {}) {
  return {
    ref: CANARY_RIGHTS,
    kind: 'RIGHTS',
    domain: 'D05_RESEARCH',
    recordId: RELEASE_ID,
    revisionId: REVISION_ID,
    contentDigest: DIGEST,
    scope: 'public',
    state: 'CLEARED',
    ownerRefs: [RIGHTS_OWNER],
    expiresAt: null,
    updatedAt: '2026-10-20T00:00:00.000Z',
    ...overrides,
  }
}

function makeConsent(overrides = {}) {
  return makeEvidence({
    ref: CANARY_CONSENT,
    kind: 'CONSENT',
    ownerRefs: [],
    expiresAt: CONSENT_EXPIRES_AT,
    ...overrides,
  })
}

function makeEvidenceList() {
  return [
    makeEvidence(),
    makeConsent(),
    makeEvidence({ ref: CANARY_SOURCE, kind: 'SOURCE', ownerRefs: [] }),
    makeEvidence({ ref: CANARY_REVIEW, kind: 'REVIEW', ownerRefs: [] }),
  ]
}

function makeGrant(overrides = {}) {
  return {
    grantRef: 'grant_fixture_d08_001',
    principalRef: REVIEWER,
    role: 'RELEASE_REVIEWER',
    domains: ['D05_RESEARCH'],
    scopes: ['public'],
    grantedAt: GRANTED_AT,
    expiresAt: GRANT_EXPIRES_AT,
    revokedAt: null,
    ...overrides,
  }
}

function makeContext(overrides = {}) {
  return {
    now: NOW,
    actor: {
      principalRef: REVIEWER,
      kind: 'HUMAN',
      verifiedAt: VERIFIED_AT,
      verificationRef: 'd00:session:fixture-001',
    },
    grants: [makeGrant()],
    evidence: makeEvidenceList(),
    withdrawal: {
      releaseId: RELEASE_ID,
      revisionId: REVISION_ID,
      state: 'NONE',
      decidedAt: null,
    },
    integrity: {
      manifestHash: MANIFEST,
      releaseRef: 'fixture:release:research-001',
      releaseVersion: 1,
      recordId: RELEASE_ID,
      revisionId: REVISION_ID,
      contentDigest: DIGEST,
    },
    allowlist: {
      domain: 'D05_RESEARCH',
      scope: 'public',
      fields: ['title', 'summary'],
    },
    priorDecisions: [],
    ...overrides,
  }
}

function decide(requestOverrides = {}, contextOverrides = {}) {
  return decideRelease(makeRequest(requestOverrides), makeContext(contextOverrides))
}

function assertRefused(result, reason) {
  assert.equal(result.approved, false)
  assert.equal(result.reason, reason)
  assert.deepEqual(Object.keys(result).sort(), ['approved', 'reason', 'releaseId', 'requestId'])
}

function assertUnavailable(result, reason) {
  assert.equal(result.available, false)
  assert.equal(result.reason, reason)
  assert.deepEqual(Object.keys(result).sort(), ['available', 'reason', 'releaseId'])
}

test('one verified human approves exactly one revision and cannot publish it', () => {
  const result = decide()
  assert.equal(result.approved, true)
  const decision = result.decision

  assert.equal(decision.schemaVersion, '1.0.0')
  assert.equal(decision.kind, 'moonwitness.release-decision')
  assert.equal(decision.state, 'APPROVED_WITHIN_SCOPE')
  assert.equal(decision.activation, 'DISABLED')
  assert.notEqual(decision.state, 'PUBLISHED')
  assert.equal(decision.reviewerRef, REVIEWER)
  assert.equal(decision.revisionId, REVISION_ID)
  assert.equal(decision.contentDigest, DIGEST)
  assert.equal(decision.manifestHash, MANIFEST)
  assert.deepEqual(decision.fields, ['summary', 'title'])
  assert.match(decision.decisionHash, /^sha256:[a-f0-9]{64}$/)
  assert.ok(Object.isFrozen(decision))
  assert.ok(Object.isFrozen(decision.fields))
  assert.ok(Object.isFrozen(decision.evidenceRefs))

  const reread = readDecision(decision, makeContext())
  assert.deepEqual(reread, {
    available: true,
    activation: 'DISABLED',
    releaseId: RELEASE_ID,
    revisionId: REVISION_ID,
    contentDigest: DIGEST,
    contentType: 'TEXT',
    scope: 'public',
    fields: ['summary', 'title'],
    decisionHash: decision.decisionHash,
  })
  assert.ok(Object.isFrozen(reread))

  const again = decide()
  assert.equal(again.approved, true)
  assert.equal(again.decision.decisionHash, decision.decisionHash, 'deterministic for identical inputs')
})

test('a stale digest or a different manifest is never accepted', () => {
  assertRefused(decide({ contentDigest: OTHER_DIGEST }), 'INTEGRITY_MISMATCH')
  assertRefused(decide({ manifestHash: OTHER_MANIFEST }), 'INTEGRITY_MISMATCH')
  assertRefused(
    decide({}, { integrity: { ...makeContext().integrity, contentDigest: OTHER_DIGEST } }),
    'INTEGRITY_MISMATCH',
  )
  assertRefused(
    decide({}, { integrity: { ...makeContext().integrity, revisionId: 'revision_other' } }),
    'INTEGRITY_MISMATCH',
  )
})

test('a scope other than the requested exact scope is refused', () => {
  assertRefused(decide({ scope: 'internal' }), 'SCOPE_INVALID')
  assertRefused(
    decide({}, { allowlist: { ...makeContext().allowlist, scope: 'internal' } }),
    'SCOPE_MISMATCH',
  )
  assertRefused(decide({}, { grants: [makeGrant({ scopes: ['internal'] })] }), 'REVIEWER_SCOPE_MISMATCH')
  const evidence = makeEvidenceList().map((entry) =>
    entry.kind === 'RIGHTS' ? { ...entry, scope: 'internal' } : entry,
  )
  assertRefused(decide({}, { evidence }), 'RIGHTS_SCOPE_MISMATCH')
})

test('missing, withdrawn, pending, stale or unbound rights and consent deny', () => {
  const without = (kind) => makeEvidenceList().filter((entry) => entry.kind !== kind)

  assertRefused(decide({}, { evidence: without('RIGHTS') }), 'RIGHTS_MISSING')
  assertRefused(decide({}, { evidence: without('CONSENT') }), 'CONSENT_MISSING')
  assertRefused(
    decide({}, {
      evidence: makeEvidenceList().map((entry) => (entry.kind === 'RIGHTS' ? { ...entry, state: 'WITHDRAWN' } : entry)),
    }),
    'RIGHTS_WITHDRAWN',
  )
  assertRefused(
    decide({}, {
      evidence: makeEvidenceList().map((entry) => (entry.kind === 'CONSENT' ? { ...entry, state: 'WITHDRAWN' } : entry)),
    }),
    'CONSENT_WITHDRAWN',
  )
  assertRefused(
    decide({}, {
      evidence: makeEvidenceList().map((entry) => (entry.kind === 'RIGHTS' ? { ...entry, state: 'PENDING' } : entry)),
    }),
    'EVIDENCE_PENDING',
  )
  assertRefused(
    decide({}, {
      evidence: makeEvidenceList().map((entry) => (entry.kind === 'CONSENT' ? { ...entry, state: 'CONFLICTING' } : entry)),
    }),
    'EVIDENCE_CONFLICTING',
  )
  assertRefused(
    decide({}, {
      evidence: makeEvidenceList().map((entry) => (entry.kind === 'RIGHTS' ? { ...entry, state: 'UNVERIFIED' } : entry)),
    }),
    'EVIDENCE_UNVERIFIABLE',
  )
  assertRefused(
    decide({}, {
      evidence: makeEvidenceList().map((entry) => (entry.kind === 'CONSENT' ? { ...entry, expiresAt: NOW } : entry)),
    }),
    'CONSENT_EXPIRED',
  )
  assertRefused(
    decide({}, {
      evidence: makeEvidenceList().map((entry) => (entry.kind === 'CONSENT' ? { ...entry, expiresAt: null } : entry)),
    }),
    'CONSENT_MISSING',
  )
  assertRefused(
    decide({}, {
      evidence: makeEvidenceList().map((entry) => (entry.kind === 'RIGHTS' ? { ...entry, contentDigest: OTHER_DIGEST } : entry)),
    }),
    'EVIDENCE_STALE',
  )
  assertRefused(
    decide({}, {
      evidence: makeEvidenceList().map((entry) => (entry.kind === 'CONSENT' ? { ...entry, revisionId: 'revision_other' } : entry)),
    }),
    'EVIDENCE_STALE',
  )
  const duplicated = [...makeEvidenceList(), makeConsent()]
  assertRefused(decide({}, { evidence: duplicated }), 'EVIDENCE_AMBIGUOUS')
})

test('self-review and conflicts of interest cannot approve', () => {
  assertRefused(
    decide({}, { actor: { ...makeContext().actor, principalRef: AUTHOR } }),
    'SELF_REVIEW',
  )
  assertRefused(decide({ conflictPrincipalRefs: [REVIEWER] }), 'REVIEWER_CONFLICT')
  const evidence = makeEvidenceList().map((entry) =>
    entry.kind === 'CONSENT' ? { ...entry, ownerRefs: [REVIEWER] } : entry,
  )
  assertRefused(decide({}, { evidence }), 'REVIEWER_CONFLICT')
})

test('only a verified human holding a live reviewer grant decides', () => {
  assertRefused(
    decide({}, { actor: { ...makeContext().actor, kind: 'MACHINE' } }),
    'ACTOR_NOT_HUMAN',
  )
  assertRefused(decide({}, { grants: [] }), 'REVIEWER_NOT_GRANTED')
  assertRefused(decide({}, { grants: [makeGrant({ principalRef: OTHER_REVIEWER })] }), 'REVIEWER_NOT_GRANTED')
  assertRefused(decide({}, { grants: [makeGrant({ revokedAt: '2026-10-15T00:00:00.000Z' })] }), 'REVIEWER_GRANT_REVOKED')
  assertRefused(decide({}, { grants: [makeGrant({ expiresAt: '2026-10-20T00:00:00.000Z' })] }), 'REVIEWER_GRANT_EXPIRED')
  assertRefused(decide({}, { grants: [makeGrant({ domains: ['D07_STORY'] })] }), 'REVIEWER_SCOPE_MISMATCH')
  assertRefused(
    decide({}, { actor: { ...makeContext().actor, verifiedAt: 'not-a-timestamp' } }),
    'IDENTITY_UNVERIFIED',
  )
  assertRefused(
    decide({}, { actor: { ...makeContext().actor, verifiedAt: '2026-10-30T00:00:00.000Z' } }),
    'IDENTITY_UNVERIFIED',
  )
  assertRefused(decide({}, { grants: [{ ...makeGrant(), role: 'ADMIN' }] }), 'CONTEXT_INVALID')
})

test('the same request or the same exact release revision cannot be replayed', () => {
  const first = decide()
  assert.equal(first.approved, true)
  assertRefused(decide({}, { priorDecisions: [first.decision] }), 'REPLAY')
  assertRefused(
    decide({ requestId: 'request_fixture_d08_002' }, { priorDecisions: [first.decision] }),
    'REPLAY',
  )
})

test('pending, accepted and quarantined withdrawal states deny approval', () => {
  const withdrawal = (state) => ({ ...makeContext().withdrawal, state })
  assertRefused(decide({}, { withdrawal: withdrawal('PENDING') }), 'WITHDRAWAL_PENDING')
  assertRefused(decide({}, { withdrawal: withdrawal('WITHDRAWN') }), 'RELEASE_WITHDRAWN')
  assertRefused(decide({}, { withdrawal: withdrawal('CORRECTED') }), 'RELEASE_CORRECTED')
  assertRefused(decide({}, { withdrawal: withdrawal('TAKEDOWN') }), 'RELEASE_TAKEDOWN')
  assertRefused(decide({}, { withdrawal: withdrawal('UNKNOWN') }), 'RELEASE_STATE_UNKNOWN')
  assertRefused(
    decide({}, {
      withdrawal: { ...makeContext().withdrawal, releaseId: 'release_other' },
    }),
    'RELEASE_STATE_UNKNOWN',
  )
})

test('unknown fields are denied at the request, context and decision boundary', () => {
  assertRefused(decide({ contentRef: CANARY_BODY }), 'REQUEST_UNKNOWN_FIELD')
  assertRefused(decide({}, { activation: 'ENABLED' }), 'CONTEXT_UNKNOWN_FIELD')
  assertRefused(
    decide({}, { actor: { ...makeContext().actor, roles: ['admin'] } }),
    'CONTEXT_UNKNOWN_FIELD',
  )
  const decision = decide()
  assert.equal(decision.approved, true)
  const withExtra = { ...decision.decision, rawSource: CANARY_BODY }
  assertUnavailable(readDecision(withExtra, makeContext()), 'DECISION_UNKNOWN_FIELD')
})

test('restricted and unknown classifications stay withheld', () => {
  assertRefused(decide({ classification: 'RESTRICTED' }), 'CLASSIFICATION_RESTRICTED')
  assertRefused(decide({ classification: 'UNKNOWN' }), 'CLASSIFICATION_UNKNOWN')
  assertRefused(decide({ classification: 'PUBLIC' }), 'CLASSIFICATION_INVALID')
})

test('the projection allowlist denies by default', () => {
  assertRefused(decide({ fields: ['title', 'body'] }), 'FIELD_NOT_ALLOWLISTED')
  assertRefused(decide({ fields: [] }), 'FIELDS_INVALID')
  assertRefused(decide({ fields: ['title', 'title'] }), 'FIELDS_INVALID')
  assertRefused(decide({ fields: ['title', ''] }), 'FIELDS_INVALID')
  assertRefused(
    decide({}, { allowlist: { ...makeContext().allowlist, fields: [] } }),
    'FIELD_NOT_ALLOWLISTED',
  )
})

test('a sealed decision cannot be altered or moved to PUBLISHED', () => {
  const decision = decide()
  assert.equal(decision.approved, true)

  const altered = { ...decision.decision, reviewerRef: OTHER_REVIEWER }
  assertUnavailable(readDecision(altered, makeContext()), 'DECISION_TAMPERED')

  const republished = { ...decision.decision, state: 'PUBLISHED' }
  assertUnavailable(readDecision(republished, makeContext()), 'DECISION_INVALID')

  const activated = { ...decision.decision, activation: 'ENABLED' }
  assertUnavailable(readDecision(activated, makeContext()), 'DECISION_INVALID')

  const missingHash = { ...decision.decision }
  delete missingHash.decisionHash
  assertUnavailable(readDecision(missingHash, makeContext()), 'DECISION_INVALID')

  assert.throws(() => {
    decision.decision.reviewerRef = OTHER_REVIEWER
  }, TypeError)
})

test('readDecision re-checks evidence, grant, withdrawal and fields on every read', () => {
  const decision = decide()
  assert.equal(decision.approved, true)
  assert.equal(readDecision(decision.decision, makeContext()).available, true)

  const staleEvidence = makeEvidenceList().map((entry) =>
    entry.kind === 'RIGHTS' ? { ...entry, contentDigest: OTHER_DIGEST } : entry,
  )
  assertUnavailable(readDecision(decision.decision, makeContext({ evidence: staleEvidence })), 'EVIDENCE_STALE')

  const expiredConsent = makeEvidenceList().map((entry) =>
    entry.kind === 'CONSENT' ? { ...entry, expiresAt: NOW } : entry,
  )
  assertUnavailable(readDecision(decision.decision, makeContext({ evidence: expiredConsent })), 'CONSENT_EXPIRED')

  assertUnavailable(
    readDecision(decision.decision, makeContext({ withdrawal: { ...makeContext().withdrawal, state: 'WITHDRAWN' } })),
    'RELEASE_WITHDRAWN',
  )
  assertUnavailable(
    readDecision(decision.decision, makeContext({ grants: [makeGrant({ revokedAt: '2026-10-29T09:59:00.000Z' })] })),
    'REVIEWER_GRANT_REVOKED',
  )
  assertUnavailable(
    readDecision(decision.decision, makeContext({ allowlist: { ...makeContext().allowlist, fields: ['title'] } })),
    'FIELD_NOT_ALLOWLISTED',
  )
  assertUnavailable(
    readDecision(decision.decision, makeContext({ integrity: { ...makeContext().integrity, contentDigest: OTHER_DIGEST } })),
    'INTEGRITY_MISMATCH',
  )
})

test('context time is caller-supplied and a future request is refused', () => {
  assertRefused(
    decide({}, { now: '2026-10-29T09:15:00.000Z' }),
    'REQUEST_TIMESTAMP_INVALID',
  )
  assertRefused(decide({}, { now: 'not-a-time' }), 'CONTEXT_TIME_INVALID')
  assertRefused(
    decide({ requestedAt: '2026-10-29T11:00:00.000Z' }),
    'REQUEST_TIMESTAMP_INVALID',
  )
})

test('no refusal or unavailable result echoes evidence refs, raw body or actor ids', () => {
  const decision = decide()
  assert.equal(decision.approved, true)

  const refusals = [
    decide({ contentRef: CANARY_BODY }),
    decide({}, { evidence: makeEvidenceList().filter((entry) => entry.kind !== 'RIGHTS') }),
    decide({}, { evidence: makeEvidenceList().filter((entry) => entry.kind !== 'CONSENT') }),
    decide({}, { grants: [] }),
    decide({}, { actor: { ...makeContext().actor, principalRef: CANARY_ACTOR } }),
    decide({}, { withdrawal: { ...makeContext().withdrawal, state: 'TAKEDOWN' } }),
    decide({}, { now: 'invalid' }),
  ]
  const unavailableResults = [
    readDecision({ ...decision.decision, reviewerRef: OTHER_REVIEWER }, makeContext()),
    readDecision(decision.decision, makeContext({ evidence: [] })),
    readDecision(decision.decision, makeContext({ withdrawal: { ...makeContext().withdrawal, state: 'WITHDRAWN' } })),
  ]

  for (const result of [...refusals, ...unavailableResults]) {
    const serialized = JSON.stringify(result)
    for (const canary of [CANARY_RIGHTS, CANARY_CONSENT, CANARY_SOURCE, CANARY_REVIEW, CANARY_ACTOR, CANARY_BODY]) {
      assert.equal(serialized.includes(canary), false, `refusal leaked ${canary}`)
    }
    assert.equal(serialized.includes('rawSource'), false)
  }
})
