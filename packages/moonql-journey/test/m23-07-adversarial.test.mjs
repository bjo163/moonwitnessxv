import assert from 'node:assert/strict'
import { test } from 'node:test'
import journey, {
  CONSENT_SCOPES,
  MANDATE_STATUSES,
  PATCH_STATUSES,
  THEMATIC_FOCUSES,
  WORLD_PATCH_SEED,
} from '../dist/index.js'
import { actionableBy, issueMandate, recordDelivery, revokeMandate } from '../dist/mandate-lifecycle.js'
import {
  authoriseScopeAction,
  impliesAuthorityOverOthers,
  SCOPE_ORDER,
} from '../dist/consent-scope.js'
import { applyStep, automatable, openMission, rollBackStep, stepState } from '../dist/mission-checklist.js'

/**
 * M23-07 — the adversarial suite for this domain.
 *
 * Two attacks are run against the published shape rather than against a
 * description of it: that a person could be RANKED by the system (the metaphoric
 * AETHERION realms/levels leaking into human standing, the boundary M23-06
 * states), and that a mission action could happen WITHOUT the accountable human
 * (unauthorized action). Both are exhaustive: every field, enum and view for the
 * first, every principal × channel × step for the second.
 */

const NOW = '2026-10-30T00:00:00.000Z'
const RANK_VOCABULARY = /rank|realm|level|\bxp\b|grade|holiness|salvation|heaven|seniority|score|division/i

const mandateOf = (overrides = {}) =>
  issueMandate(
    {
      id: 'mandate-019',
      milestone: { pathRef: 'path-protection', journeyRef: 'journey-xii', milestoneRef: 'patch-019' },
      operatorPseudonym: 'archivist_prime',
      deliverable: 'Publish the provenance verification for passage 019.',
      consent: { holderRef: 'member-a', scope: 'COMMUNITY', consentedAt: '2026-01-01T00:00:00.000Z' },
      expiresAt: '2027-12-31T23:59:59.000Z',
      ...overrides,
    },
    NOW,
  ).value

void test('nothing a member can be stored against ranks them', () => {
  const models = Object.entries(journey.models)
  assert.equal(models.length, 2, 'the domain publishes exactly the patch and mandate models')
  const fieldNames = models.flatMap(([name, model]) => Object.keys(model.fields).map((field) => `${name}.${field}`))
  const ranked = fieldNames.filter((name) => RANK_VOCABULARY.test(name))
  assert.deepEqual(ranked, [], `these fields would rank a person: ${ranked.join(', ')}`)

  const enums = { PATCH_STATUSES, THEMATIC_FOCUSES, CONSENT_SCOPES, MANDATE_STATUSES }
  for (const [label, values] of Object.entries(enums)) {
    assert.deepEqual(values.filter((value) => RANK_VOCABULARY.test(value)), [], `${label} carries ranking vocabulary`)
  }

  for (const row of WORLD_PATCH_SEED) {
    assert.deepEqual(Object.keys(row).filter((key) => RANK_VOCABULARY.test(key)), [], `patch ${row.slot} gained a ranking field`)
  }

  const views = Object.entries(journey.views)
  assert.ok(views.length > 0, 'the published views are part of the surface under test')
  assert.deepEqual(JSON.stringify(views).match(RANK_VOCABULARY) ?? [], [], 'a view ranks a person')
})

void test('every consented audience is an audience, never authority over another member', () => {
  for (const scope of SCOPE_ORDER) {
    assert.equal(impliesAuthorityOverOthers(scope), false, `${scope} must never imply authority`)
  }

  const personal = []
  const shared = []
  for (const scope of SCOPE_ORDER) {
    for (const action of ['read', 'publish', 'act']) {
      for (const kind of ['personal-account', 'shared-record']) {
        const decision = authoriseScopeAction(
          action,
          { kind, ownerRef: 'member-a', declaredScope: 'GLOBAL' },
          { principalRef: 'member-c', scope, state: 'ACTIVE' },
        )
        if (decision.allowed) (kind === 'personal-account' ? personal : shared).push(`${scope}/${action}`)
      }
    }
  }
  assert.deepEqual(personal.sort(), [], 'no consented audience reaches another member\'s own account')
  assert.deepEqual(shared.sort(), ['GLOBAL/act', 'GLOBAL/publish', 'GLOBAL/read'].sort(), 'only a global grant touches globally declared shared material, never a community one')
})

void test('no channel but a named human can apply a world patch', () => {
  const mission = openMission(
    {
      id: 'mission-019',
      patchRef: 'patch-019',
      mandate: mandateOf(),
      steps: [
        { id: 's1', title: 'Collect the citation evidence', consequence: 'REVERSIBLE', rollbackPlan: '' },
        { id: 's2', title: 'Apply world patch 019', consequence: 'HIGH', rollbackPlan: 'Restore the pre-patch record' },
      ],
    },
    NOW,
  ).value

  const refusals = []
  const successes = []
  for (const stepId of ['s1', 's2']) {
    for (const kind of ['human', 'automated']) {
      for (const by of ['member-a', 'member-c', 'worker-1', '  ']) {
        const result = applyStep(mission, { stepId, by, at: '2026-04-01T00:00:00.000Z', kind, now: NOW })
        if (result.ok) successes.push(`${stepId}/${kind}/${by}`)
        else refusals.push(result.code)
      }
    }
  }

  assert.deepEqual(
    successes,
    ['s1/human/member-a', 's1/automated/member-a', 's1/automated/member-c', 's1/automated/worker-1', 's2/human/member-a'],
    'only evidence collection may run unattended, and the patch has exactly one door',
  )
  const patchAttacks = refusals.filter((code) => code === 'AUTOMATION_PROHIBITED')
  assert.equal(patchAttacks.length, 4, 'every automated channel against the patch step is refused')
  assert.equal(refusals.filter((code) => code === 'NOT_THE_MANDATE_HOLDER').length, 4, 'no stranger may act on either step, patch or not')
  assert.equal(refusals.filter((code) => code === 'NEEDS_HUMAN_ACTOR').length, 3, 'an unattributed act is refused even on the reversible step')
  assert.equal(stepState(mission, 's2'), 'PENDING', 'none of the attacks left the patch applied')
  assert.equal(automatable(mission, NOW), false)
})

void test('a mandate that no longer lives stops every act', () => {
  const live = mandateOf()
  const revoked = revokeMandate(live, 'member-a', '2026-02-01T00:00:00.000Z', 'withdrawn', NOW).value
  const delivered = recordDelivery(live, 'archivist_prime', '2026-02-01T00:00:00.000Z', NOW).value
  const patchStep = { id: 's2', title: 'Apply world patch 019', consequence: 'HIGH', rollbackPlan: 'Restore the pre-patch record' }

  for (const [label, mandate] of Object.entries({ revoked, delivered })) {
    const opened = openMission({ id: 'm', patchRef: 'patch-019', mandate, steps: [patchStep] }, NOW)
    assert.deepEqual(opened, { ok: false, code: 'MANDATE_NOT_ACTIVE' }, `${label} must not open a mission`)
  }

  const mission = openMission(
    {
      id: 'mission-019',
      patchRef: 'patch-019',
      mandate: live,
      steps: [{ id: 's2', title: 'Apply world patch 019', consequence: 'HIGH', rollbackPlan: 'Restore the pre-patch record' }],
    },
    NOW,
  ).value
  const applied = applyStep(mission, { stepId: 's2', by: 'member-a', at: '2026-04-01T00:00:00.000Z', kind: 'human', now: NOW }).value

  const postMortem = { ...applied, mandate: revoked }
  assert.deepEqual(rollBackStep(postMortem, { stepId: 's2', by: 'member-a', at: '2026-05-01T00:00:00.000Z', kind: 'human', now: NOW }), { ok: false, code: 'MANDATE_NOT_ACTIVE' }, 'a revoked mandate cannot even undo')
  assert.deepEqual(applyStep(postMortem, { stepId: 's2', by: 'member-a', at: '2026-05-01T00:00:00.000Z', kind: 'human', now: NOW }), { ok: false, code: 'ALREADY_APPLIED' })
  assert.deepEqual(rollBackStep(applied, { stepId: 's2', by: 'member-a', at: '2028-01-01T00:00:00.000Z', kind: 'human', now: '2028-01-01T00:00:00.000Z' }), { ok: false, code: 'MANDATE_NOT_ACTIVE' }, 'an expired mandate cannot act')
})

void test('the suite refuses without repeating the material it protects', () => {
  const live = mandateOf()
  const mission = openMission(
    {
      id: 'mission-019',
      patchRef: 'patch-019',
      mandate: live,
      steps: [{ id: 's2', title: 'Apply world patch 019', consequence: 'HIGH', rollbackPlan: 'Restore the pre-patch record' }],
    },
    NOW,
  ).value

  const payloads = JSON.stringify([
    applyStep(mission, { stepId: 's2', by: 'member-c', at: '2026-04-01T00:00:00.000Z', kind: 'human', now: NOW }),
    applyStep(mission, { stepId: 's2', by: 'worker-1', at: '2026-04-01T00:00:00.000Z', kind: 'automated', now: NOW }),
    openMission({ id: 'm', patchRef: 'p', mandate: revokeMandate(live, 'member-a', '2026-02-01T00:00:00.000Z', 'withdrawn', NOW).value, steps: [] }, NOW),
    authoriseScopeAction('act', { kind: 'personal-account', ownerRef: 'member-a', declaredScope: 'GLOBAL' }, { principalRef: 'member-c', scope: 'GLOBAL', state: 'ACTIVE' }),
    actionableBy(live, 'member-c', 'GLOBAL'),
  ])

  assert.equal(JSON.parse(payloads).every((entry) => entry === false || entry.allowed === false || typeof entry.code === 'string'), true, 'every probe refused')
  for (const marker of ['member-a', 'archivist_prime', 'patch-019', 'provenance', 'Restore the pre-patch record', 'path-protection']) {
    assert.ok(!payloads.includes(marker), `a refusal repeated ${marker}`)
  }
})
