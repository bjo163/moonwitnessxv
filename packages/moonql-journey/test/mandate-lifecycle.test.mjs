import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  actionableBy,
  issueMandate,
  publishableTo,
  recordDelivery,
  resolveStatus,
  responsibleOperator,
  revokeMandate,
} from '../dist/mandate-lifecycle.js'

const NOW = '2026-10-30T00:00:00.000Z'
const MILESTONE = { pathRef: 'path-protection', journeyRef: 'journey-xii', milestoneRef: 'patch-019' }

const base = {
  id: 'mandate-019',
  milestone: MILESTONE,
  operatorPseudonym: 'archivist_prime',
  deliverable: 'Provenance verification harness for passage citations.',
  consent: { holderRef: 'member-a', scope: 'COMMUNITY', consentedAt: '2026-01-01T00:00:00.000Z' },
  expiresAt: '2027-12-31T23:59:59.000Z',
}

void test('positive: consent, responsible operator and revoke are all recorded facts', () => {
  const issued = issueMandate(base, NOW)
  assert.equal(issued.ok, true, `issue must pass, got ${JSON.stringify(issued)}`)
  const mandate = issued.value

  assert.equal(responsibleOperator(mandate), 'archivist_prime')
  assert.deepEqual(mandate.consent, { holderRef: 'member-a', scope: 'COMMUNITY', consentedAt: '2026-01-01T00:00:00.000Z' })
  assert.deepEqual(mandate.milestone, MILESTONE)
  assert.equal(resolveStatus(mandate, NOW), 'ACTIVE')

  const revoked = revokeMandate(mandate, 'member-a', '2026-06-01T00:00:00.000Z', 'the holder withdrew consent', NOW)
  assert.equal(revoked.ok, true)
  assert.deepEqual(revoked.value.events, [{ kind: 'revoked', by: 'member-a', at: '2026-06-01T00:00:00.000Z', reason: 'the holder withdrew consent' }])
  assert.equal(resolveStatus(revoked.value, NOW), 'REVOKED')
  assert.equal(mandate.events.length, 0, 'a transition must not mutate the record it was handed')
})

void test('expiry is computed from the deadline, never from a stored status', () => {
  const mandate = issueMandate(base, NOW).value
  assert.equal(resolveStatus(mandate, '2027-12-31T23:59:58.000Z'), 'ACTIVE')
  assert.equal(resolveStatus(mandate, '2027-12-31T23:59:59.000Z'), 'EXPIRED')
  assert.equal(resolveStatus(mandate, '2030-01-01T00:00:00.000Z'), 'EXPIRED')
  const delivered = recordDelivery(mandate, 'archivist_prime', '2026-09-01T00:00:00.000Z', NOW)
  assert.equal(delivered.ok, true)
  assert.equal(resolveStatus(delivered.value, '2030-01-01T00:00:00.000Z'), 'DELIVERED', 'a delivered mandate stays delivered')
})

void test('negative: an unaccountable or unconsented mandate cannot be issued', () => {
  const cases = [
    [{ ...base, operatorPseudonym: '   ' }, 'NO_RESPONSIBLE_OPERATOR'],
    [{ ...base, id: '' }, 'MISSING_IDENTIFIER'],
    [{ ...base, milestone: { ...MILESTONE, journeyRef: '' } }, 'MISSING_MILESTONE_PATH'],
    [{ ...base, deliverable: '' }, 'NO_DELIVERABLE'],
    [{ ...base, consent: { ...base.consent, scope: 'EVERYONE' } }, 'CONSENT_SCOPE_UNREADABLE'],
    [{ ...base, consent: { ...base.consent, consentedAt: 'not-a-date' } }, 'CONSENT_NOT_RECORDED'],
    [{ ...base, consent: { ...base.consent, holderRef: '' } }, 'CONSENT_NOT_RECORDED'],
    [{ ...base, expiresAt: 'someday' }, 'CONSENT_NOT_RECORDED'],
    [{ ...base, consent: { ...base.consent, consentedAt: '2028-01-01T00:00:00.000Z' } }, 'CONSENT_AFTER_EXPIRY'],
    [{ ...base, consent: { ...base.consent, consentedAt: '2026-12-01T00:00:00.000Z' } }, 'FUTURE_TIMESTAMP'],
  ]
  for (const [input, code] of cases) {
    assert.deepEqual(issueMandate(input, NOW), { ok: false, code }, `issue of ${code}`)
  }
})

void test('negative: a revoke without an actor or reason is refused and a terminal mandate is frozen', () => {
  const mandate = issueMandate(base, NOW).value
  for (const [by, reason, at] of [['', 'reason', '2026-02-01T00:00:00.000Z'], ['member-a', '  ', '2026-02-01T00:00:00.000Z'], ['member-a', 'reason', 'whenever']]) {
    assert.deepEqual(revokeMandate(mandate, by, at, reason, NOW), { ok: false, code: 'REVOKE_NEEDS_ACTOR_AND_REASON' })
  }
  assert.deepEqual(revokeMandate(mandate, 'member-a', '2027-02-01T00:00:00.000Z', 'late', NOW), { ok: false, code: 'FUTURE_TIMESTAMP' })

  const revoked = revokeMandate(mandate, 'member-a', '2026-02-01T00:00:00.000Z', 'withdrawn', NOW).value
  assert.deepEqual(recordDelivery(revoked, 'archivist_prime', '2026-03-01T00:00:00.000Z', NOW), { ok: false, code: 'ALREADY_TERMINAL' })
  assert.deepEqual(revokeMandate(revoked, 'member-a', '2026-03-01T00:00:00.000Z', 'again', NOW), { ok: false, code: 'ALREADY_TERMINAL' })
})

void test('a mandate never travels wider than the audience its holder consented to', () => {
  const selfMandate = issueMandate({ ...base, consent: { ...base.consent, scope: 'SELF' } }, NOW).value
  assert.equal(publishableTo(selfMandate, 'GLOBAL'), false, 'global must not out-widen a self consent')
  assert.equal(publishableTo(selfMandate, 'COMMUNITY'), false)
  assert.equal(publishableTo(selfMandate, 'SELF'), true)
  assert.equal(publishableTo(issueMandate(base, NOW).value, 'COMMUNITY'), true, 'the consented audience is publishable')
  assert.equal(publishableTo(issueMandate(base, NOW).value, 'SELF'), true, 'a narrower audience is always inside the consent')
  assert.equal(publishableTo(issueMandate(base, NOW).value, 'GLOBAL'), false, 'a community consent never implies the global audience')
  assert.equal(publishableTo(issueMandate(base, NOW).value, 'PLANET'), false, 'an unknown audience is not publishable')
})

void test('acting on a mandate is the holder alone, whatever the actor consents to', () => {
  const mandate = issueMandate(base, NOW).value
  assert.equal(actionableBy(mandate, 'member-a', 'GLOBAL'), true)
  for (const scope of ['SELF', 'COMMUNITY', 'GLOBAL']) {
    assert.equal(actionableBy(mandate, 'member-c', scope), false, `${scope} must not act on another member's mandate`)
  }
})

void test('a refusal carries only its code and no member or operator reference', () => {
  const rendered = JSON.stringify([
    issueMandate({ ...base, operatorPseudonym: '' }, NOW),
    revokeMandate(issueMandate(base, NOW).value, '', '2026-02-01T00:00:00.000Z', '', NOW),
    issueMandate({ ...base, consent: { ...base.consent, scope: 'EVERYONE' } }, NOW),
  ])
  for (const marker of ['member-a', 'archivist_prime', 'path-protection', 'Provenance']) {
    assert.ok(!rendered.includes(marker), `the refusal payload leaked ${marker}`)
  }
})
