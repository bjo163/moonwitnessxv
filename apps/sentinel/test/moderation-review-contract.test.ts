import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluateModerationAction, type ModerationIntent } from './moderation-review-contract.js'

function reviewedIntent(overrides: Partial<ModerationIntent> = {}): ModerationIntent {
  return {
    actor: 'HUMAN_REVIEWER',
    action: 'NOTIFICATION',
    humanApproval: true,
    classificationBasis: 'HUMAN_REVIEW',
    claimType: 'SOCIAL_SIGNAL',
    ...overrides,
  }
}

void test('permits a human-approved notification that carries no platform action', () => {
  assert.deepEqual(evaluateModerationAction(reviewedIntent()), {
    allowed: true,
    reason: 'PERMITTED_BY_REVIEW_POLICY',
  })
})

void test('permits an automated notification of a source-backed physical observation', () => {
  const result = evaluateModerationAction(reviewedIntent({
    actor: 'AUTOMATED',
    humanApproval: false,
    classificationBasis: 'SOURCE_BACKED_PHYSICAL',
    claimType: 'PHYSICAL_OBSERVATION',
  }))
  assert.deepEqual(result, { allowed: true, reason: 'PERMITTED_BY_REVIEW_POLICY' })
})

void test('permits an uncertainty-qualified theological-adjacent statement as a notification', () => {
  const result = evaluateModerationAction(reviewedIntent({ claimType: 'THEOLOGICAL_UNCERTAINTY' }))
  assert.equal(result.allowed, true)
  assert.equal(result.reason, 'PERMITTED_BY_REVIEW_POLICY')
})

void test('permits one human-approved notification webhook but denies an automated one', () => {
  assert.equal(evaluateModerationAction(reviewedIntent({ action: 'ALERT_WEBHOOK' })).allowed, true)
  assert.equal(
    evaluateModerationAction(reviewedIntent({ action: 'ALERT_WEBHOOK', actor: 'AUTOMATED' })).reason,
    'HUMAN_APPROVAL_REQUIRED',
  )
})

void test('denies automated takedown, platform reports, hiding, and demonetization as punitive', () => {
  for (const action of ['REPORT_TO_PLATFORM', 'TAKEDOWN', 'HIDE_CONTENT', 'DEMONETIZE'] as const) {
    assert.equal(
      evaluateModerationAction(reviewedIntent({ action, actor: 'AUTOMATED', classificationBasis: 'SOURCE_BACKED_PHYSICAL' })).reason,
      'PUNITIVE_ACTION_FORBIDDEN',
    )
    assert.equal(evaluateModerationAction(reviewedIntent({ action })).reason, 'PUNITIVE_ACTION_FORBIDDEN')
  }
})

void test('denies AI-only and unreviewed classification before any notification is sent', () => {
  for (const classificationBasis of ['AI_ONLY', 'UNREVIEWED'] as const) {
    assert.equal(
      evaluateModerationAction(reviewedIntent({ classificationBasis, claimType: 'PHYSICAL_OBSERVATION' })).reason,
      'AI_ONLY_CLASSIFICATION_FORBIDDEN',
    )
  }
})

void test('denies a punitive webhook request even when a human reviewer approved it', () => {
  assert.equal(
    evaluateModerationAction(reviewedIntent({ action: 'PUNITIVE_WEBHOOK' })).reason,
    'PUNITIVE_ACTION_FORBIDDEN',
  )
})

void test('denies a "certain" theological assertion regardless of actor or approval', () => {
  assert.equal(
    evaluateModerationAction(reviewedIntent({ claimType: 'THEOLOGICAL_CERTAINTY' })).reason,
    'THEOLOGICAL_CERTAINTY_FORBIDDEN',
  )
  assert.equal(
    evaluateModerationAction(reviewedIntent({ claimType: 'THEOLOGICAL_CERTAINTY', actor: 'AUTOMATED' })).reason,
    'THEOLOGICAL_CERTAINTY_FORBIDDEN',
  )
})

void test('denies unknown claim types and unknown actions before deciding', () => {
  assert.equal(evaluateModerationAction(reviewedIntent({ claimType: 'UNCLASSIFIED_CLAIM' })).reason, 'UNKNOWN_CLAIM_TYPE')
  assert.equal(evaluateModerationAction(reviewedIntent({ action: 'SHADOW_BAN' })).reason, 'UNKNOWN_MODERATION_ACTION')
  assert.equal(evaluateModerationAction(reviewedIntent({ actor: 'THIRD_PARTY' })).reason, 'UNKNOWN_MODERATION_ACTOR')
})
