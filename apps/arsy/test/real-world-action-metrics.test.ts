import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateRealWorldActionMetrics, type RealWorldActionRecord } from '@moonwitness/moonql-journey'

function action(overrides: Partial<RealWorldActionRecord> = {}): RealWorldActionRecord {
  return {
    id: 'action-1',
    validSafePlan: true,
    voluntary: true,
    started: false,
    completed: false,
    barrierObserved: false,
    barrierResponse: null,
    benefitEvidence: 'NOT_ASSESSED',
    ...overrides,
  }
}

test('CONFIDENT metrics: zero denominators are N/A, never zero percent', () => {
  const result = calculateRealWorldActionMetrics([])
  for (const metric of [
    result.initiationRate,
    result.barrierResponseRate,
    result.completionRate,
    result.practicalBenefitRate,
  ]) {
    assert.equal(metric.denominator, 0)
    assert.equal(metric.numerator, 0)
    assert.equal(metric.percent, null)
    assert.equal(metric.status, 'NOT_APPLICABLE')
  }
})

test('CONFIDENT metrics: rates use explicit denominators and keep unknown benefits separate', () => {
  const result = calculateRealWorldActionMetrics([
    action({
      id: 'started-completed',
      started: true,
      completed: true,
      barrierObserved: true,
      barrierResponse: 'ADAPTED_SAFELY',
      benefitEvidence: 'VERIFIED_BENEFIT',
    }),
    action({
      id: 'started-not-completed',
      started: true,
      barrierObserved: true,
      barrierResponse: 'UNSAFE',
      benefitEvidence: 'NO_VERIFIED_BENEFIT',
    }),
    action({ id: 'not-started', benefitEvidence: 'UNKNOWN' }),
    action({ id: 'not-assessed', validSafePlan: false, voluntary: true }),
  ])

  assert.equal(result.eligibleActionCount, 3)
  assert.equal(result.startedActionCount, 2)
  assert.equal(result.completedActionCount, 1)
  assert.equal(result.initiationRate.percent, 66.67)
  assert.equal(result.completionRate.percent, 33.33)

  assert.equal(result.observedBarrierCount, 2)
  assert.equal(result.safeBarrierResponseCount, 1)
  assert.equal(result.barrierResponseRate.percent, 50)

  assert.equal(result.evaluatedBenefitCount, 2)
  assert.equal(result.verifiedBenefitCount, 1)
  assert.equal(result.practicalBenefitRate.percent, 50)
  assert.equal(result.unknownBenefitCount, 1)
  assert.equal(result.unassessedBenefitCount, 1)
})

test('CONFIDENT metrics: invalid and duplicate IDs are excluded deterministically', () => {
  const result = calculateRealWorldActionMetrics([
    action({ id: 'same', started: true }),
    action({ id: 'same', started: false }),
    action({ id: '   ', started: true }),
    action({ id: 'valid-2', started: false }),
  ])

  assert.equal(result.inputCount, 4)
  assert.equal(result.acceptedRecordCount, 2)
  assert.equal(result.invalidIdCount, 1)
  assert.equal(result.duplicateIdCount, 1)
  assert.equal(result.eligibleActionCount, 2)
  assert.equal(result.startedActionCount, 1)
  assert.equal(result.initiationRate.percent, 50)
})

test('CONFIDENT metrics: non-voluntary or unsafe plans cannot inflate action rates', () => {
  const result = calculateRealWorldActionMetrics([
    action({ id: 'safe-voluntary', started: true }),
    action({ id: 'unsafe-plan', validSafePlan: false, started: true, completed: true }),
    action({ id: 'not-voluntary', voluntary: false, started: true, completed: true }),
  ])

  assert.equal(result.eligibleActionCount, 1)
  assert.equal(result.startedActionCount, 1)
  assert.equal(result.completedActionCount, 0)
  assert.equal(result.initiationRate.percent, 100)
  assert.equal(result.completionRate.percent, 0)
})

test('CONFIDENT metrics: safe stop counts as a safe barrier response, not as completion', () => {
  const result = calculateRealWorldActionMetrics([
    action({
      id: 'safe-stop',
      barrierObserved: true,
      barrierResponse: 'STOPPED_SAFELY',
      completed: false,
    }),
  ])

  assert.equal(result.safeBarrierResponseCount, 1)
  assert.equal(result.barrierResponseRate.percent, 100)
  assert.equal(result.completedActionCount, 0)
  assert.equal(result.completionRate.percent, 0)
})
