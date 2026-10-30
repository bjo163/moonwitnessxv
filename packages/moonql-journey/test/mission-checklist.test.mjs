import assert from 'node:assert/strict'
import { test } from 'node:test'
import { issueMandate, revokeMandate } from '../dist/mandate-lifecycle.js'
import {
  applyStep,
  automatable,
  highConsequenceSteps,
  openMission,
  outstandingSteps,
  rollBackStep,
  stepState,
} from '../dist/mission-checklist.js'

const NOW = '2026-10-30T00:00:00.000Z'

const mandate = issueMandate(
  {
    id: 'mandate-019',
    milestone: { pathRef: 'path-protection', journeyRef: 'journey-xii', milestoneRef: 'patch-019' },
    operatorPseudonym: 'archivist_prime',
    deliverable: 'Publish the provenance verification for passage 019.',
    consent: { holderRef: 'member-a', scope: 'COMMUNITY', consentedAt: '2026-01-01T00:00:00.000Z' },
    expiresAt: '2027-12-31T23:59:59.000Z',
  },
  NOW,
).value

const steps = [
  { id: 's1', title: 'Collect the citation evidence', consequence: 'REVERSIBLE', rollbackPlan: '' },
  { id: 's2', title: 'Apply world patch 019', consequence: 'HIGH', rollbackPlan: 'Restore the pre-patch record from patch-019.json' },
]

const open = () => openMission({ id: 'mission-019', patchRef: 'patch-019', mandate, steps }, NOW).value

void test('positive: a high-consequence world patch has no automated path at all', () => {
  const mission = open()
  assert.deepEqual(highConsequenceSteps(mission).map((step) => step.id), ['s2'])
  assert.equal(automatable(mission, NOW), false, 'a patch-bearing mission is never left to a scheduler')

  const attempted = applyStep(mission, { stepId: 's2', by: 'worker-1', at: '2026-04-01T00:00:00.000Z', kind: 'automated', now: NOW })
  assert.deepEqual(attempted, { ok: false, code: 'AUTOMATION_PROHIBITED' })
  assert.equal('value' in attempted, false, 'a refusal never produces a mutated mission')
  assert.equal(stepState(mission, 's2'), 'PENDING', 'the record still says the patch was never applied')

  const applied = applyStep(mission, { stepId: 's2', by: 'member-a', at: '2026-04-01T00:00:00.000Z', kind: 'human', now: NOW })
  assert.equal(applied.ok, true, `a named human act must be accepted, got ${JSON.stringify(applied)}`)
  assert.deepEqual(applied.value.log, [{ stepId: 's2', action: 'applied', by: 'member-a', at: '2026-04-01T00:00:00.000Z', kind: 'human' }])
  assert.equal(stepState(applied.value, 's2'), 'APPLIED')
})

void test('a reversible step may run unattended, and the mission automates only when the patch is done', () => {
  const mission = open()
  const s1 = applyStep(mission, { stepId: 's1', by: 'worker-1', at: '2026-03-01T00:00:00.000Z', kind: 'automated', now: NOW })
  assert.equal(s1.ok, true)
  assert.equal(stepState(s1.value, 's1'), 'APPLIED')
  assert.deepEqual(outstandingSteps(s1.value).map((step) => step.id), ['s2'], 'the high-consequence step is still owed by a human')
  assert.equal(automatable(s1.value, NOW), false)

  const s2 = applyStep(s1.value, { stepId: 's2', by: 'member-a', at: '2026-04-01T00:00:00.000Z', kind: 'human', now: NOW })
  assert.equal(automatable(s2.value, NOW), true, 'with nothing high-consequence outstanding the checklist is finished')
  assert.deepEqual(outstandingSteps(s2.value), [])
})

void test('rollback: an applied step is undone by a later act and the state is derived', () => {
  const mission = open()
  const applied = applyStep(mission, { stepId: 's2', by: 'member-a', at: '2026-04-01T00:00:00.000Z', kind: 'human', now: NOW }).value

  const undone = rollBackStep(applied, { stepId: 's2', by: 'member-a', at: '2026-05-01T00:00:00.000Z', kind: 'human', now: NOW })
  assert.equal(undone.ok, true)
  assert.equal(stepState(undone.value, 's2'), 'ROLLED_BACK')
  assert.deepEqual(highConsequenceSteps(undone.value).map((step) => step.id), ['s2'])

  const reApplied = applyStep(undone.value, { stepId: 's2', by: 'member-a', at: '2026-06-01T00:00:00.000Z', kind: 'human', now: NOW })
  assert.equal(reApplied.ok, true, 'a rolled-back step can be owned again')
  assert.equal(stepState(reApplied.value, 's2'), 'APPLIED')
  assert.equal(mission.log.length, 0, 'no act ever mutated the mission it was handed')

  assert.deepEqual(rollBackStep(mission, { stepId: 's2', by: 'member-a', at: '2026-04-02T00:00:00.000Z', kind: 'human', now: NOW }), { ok: false, code: 'NOT_APPLIED' })
  assert.deepEqual(rollBackStep(applied, { stepId: 's2', by: 'worker-1', at: '2026-05-01T00:00:00.000Z', kind: 'automated', now: NOW }), { ok: false, code: 'AUTOMATION_PROHIBITED' })
})

void test('negative: a mission plan without a rollback or an accountable holder never opens', () => {
  const cases = [
    [{ id: '', patchRef: 'patch-019', mandate, steps }, 'MISSING_IDENTIFIER'],
    [{ id: 'm', patchRef: '', mandate, steps }, 'MISSING_PATCH_REF'],
    [{ id: 'm', patchRef: 'p', mandate, steps: [] }, 'NO_STEPS'],
    [{ id: 'm', patchRef: 'p', mandate, steps: [steps[0], steps[0]] }, 'DUPLICATE_STEP_ID'],
    [{ id: 'm', patchRef: 'p', mandate, steps: [{ ...steps[1], title: '  ' }] }, 'STEP_NEEDS_A_TITLE'],
    [{ id: 'm', patchRef: 'p', mandate, steps: [{ ...steps[1], consequence: 'SCARY' }] }, 'CONSEQUENCE_UNREADABLE'],
    [{ id: 'm', patchRef: 'p', mandate, steps: [{ ...steps[1], rollbackPlan: '' }] }, 'ROLLBACK_PLAN_REQUIRED'],
  ]
  for (const [input, code] of cases) {
    assert.deepEqual(openMission(input, NOW), { ok: false, code }, `open of ${input}`)
  }

  const revoked = revokeMandate(mandate, 'member-a', '2026-02-01T00:00:00.000Z', 'the holder withdrew', NOW).value
  assert.deepEqual(openMission({ id: 'm', patchRef: 'p', mandate: revoked, steps }, NOW), { ok: false, code: 'MANDATE_NOT_ACTIVE' })
  assert.deepEqual(openMission({ id: 'm', patchRef: 'p', mandate, steps }, '2030-01-01T00:00:00.000Z'), { ok: false, code: 'MANDATE_NOT_ACTIVE' })
})

void test('negative: an unowned, undocumented or late act is refused and nothing is applied', () => {
  const mission = open()
  const human = { stepId: 's2', by: 'member-a', at: '2026-04-01T00:00:00.000Z', kind: 'human', now: NOW }
  const applied = applyStep(mission, human).value

  const cases = [
    [applyStep(mission, { ...human, stepId: 's9' }), 'UNKNOWN_STEP'],
    [applyStep(applied, human), 'ALREADY_APPLIED'],
    [applyStep(mission, { ...human, by: '  ' }), 'NEEDS_HUMAN_ACTOR'],
    [applyStep(mission, { ...human, at: 'next thursday' }), 'NEEDS_HUMAN_ACTOR'],
    [applyStep(mission, { ...human, at: '2027-04-01T00:00:00.000Z' }), 'FUTURE_TIMESTAMP'],
    [applyStep(mission, { ...human, by: 'member-c' }), 'NOT_THE_MANDATE_HOLDER'],
  ]
  for (const [result, code] of cases) {
    assert.deepEqual(result, { ok: false, code }, `act refused with ${code}`)
  }

  const lateNow = '2028-01-01T00:00:00.000Z'
  assert.deepEqual(applyStep(mission, { ...human, now: lateNow }), { ok: false, code: 'MANDATE_NOT_ACTIVE' }, 'an expired mandate stops the checklist')
  const afterRevoke = revokeMandate(mandate, 'member-a', '2026-03-01T00:00:00.000Z', 'withdrawn mid-mission', NOW).value
  const revived = { ...mission, mandate: afterRevoke }
  assert.deepEqual(applyStep(revived, human), { ok: false, code: 'MANDATE_NOT_ACTIVE' })
  assert.equal(stepState(revived, 's2'), 'PENDING')
})

void test('a refusal carries only its code and no member, operator or patch text', () => {
  const mission = open()
  const rendered = JSON.stringify([
    applyStep(mission, { stepId: 's2', by: '', at: '2026-04-01T00:00:00.000Z', kind: 'human', now: NOW }),
    applyStep(mission, { stepId: 's2', by: 'worker-1', at: '2026-04-01T00:00:00.000Z', kind: 'automated', now: NOW }),
    openMission({ id: 'm', patchRef: 'p', mandate, steps: [{ ...steps[1], rollbackPlan: '' }] }, NOW),
  ])
  for (const marker of ['member-a', 'archivist_prime', 'patch-019', 'Restore the pre-patch record', 'Apply world patch']) {
    assert.ok(!rendered.includes(marker), `the refusal payload leaked ${marker}`)
  }
  assert.equal(rendered.includes('"code"'), true)
})
