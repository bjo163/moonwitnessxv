import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  HumanDecisionError,
  classifyDecision,
  looksNonHuman,
  type ActorKind,
  type DecisionRequest,
  type HumanDecisionCode,
} from '../src/lib/human-decision.js'

const request = (overrides: Partial<DecisionRequest> = {}): DecisionRequest => ({
  actionId: 'rights-review-edition-1',
  irreversible: false,
  actor: { id: 'bjo', kind: 'human' },
  approver: { id: 'reviewer-siti', role: 'operator' },
  ...overrides,
})

const codeOf = (fn: () => unknown): HumanDecisionCode => {
  try {
    fn()
  } catch (error) {
    assert.ok(error instanceof HumanDecisionError, 'refusal is a HumanDecisionError')
    return error.code
  }
  assert.fail('decision was not refused')
}

void test('positive: a named human decision is never executable', () => {
  const reversible = classifyDecision(request())
  assert.deepEqual(reversible, {
    actionId: 'rights-review-edition-1',
    outcome: 'requires-named-human',
    executable: false,
  })

  const irreversible = classifyDecision(request({ irreversible: true }))
  assert.equal(irreversible.outcome, 'requires-explicit-approval')
  assert.equal(irreversible.executable, false)
})

void test('negative: automatic execution, non-human mandates and self-approval are refused', () => {
  assert.equal(codeOf(() => classifyDecision(request({ autoExecute: true }))), 'AUTO_EXECUTION_PROHIBITED')

  for (const kind of ['model', 'service'] as ActorKind[]) {
    assert.equal(codeOf(() => classifyDecision(request({ actor: { id: 'runtime', kind } }))), 'SUPERNATURAL_MANDATE_REFUSED')
  }

  assert.equal(codeOf(() => classifyDecision(request({ actor: { id: 'model-runner', kind: 'human' } }))), 'SUPERNATURAL_MANDATE_REFUSED')
  assert.equal(codeOf(() => classifyDecision(request({ approver: null }))), 'HUMAN_APPROVAL_REQUIRED')
  assert.equal(codeOf(() => classifyDecision(request({ approver: { id: 'bjo', role: 'operator' } }))), 'HUMAN_APPROVAL_REQUIRED')
  assert.equal(codeOf(() => classifyDecision(request({ approver: { id: 'worker-7', role: 'operator' } }))), 'HUMAN_APPROVAL_REQUIRED')
  assert.equal(codeOf(() => classifyDecision(request({ approver: { id: 'reviewer-siti', role: 'guest' } }))), 'APPROVER_ROLE_NOT_RECOGNIZED')
})

void test('sweep: no combination produces an executable verdict', () => {
  const kinds: ActorKind[] = ['human', 'model', 'service']
  const approvers = [null, { id: 'reviewer-siti', role: 'admin' }, { id: 'bjo', role: 'user' }]
  let accepted = 0
  for (const irreversible of [false, true]) {
    for (const kind of kinds) {
      for (const autoExecute of [false, true]) {
        for (const approver of approvers) {
          try {
            const verdict = classifyDecision({ actionId: 'a', irreversible, actor: { id: 'bjo', kind }, approver, autoExecute })
            accepted += 1
            assert.equal(verdict.executable, false)
          } catch (error) {
            assert.ok(error instanceof HumanDecisionError)
          }
        }
      }
    }
  }
  assert.equal(accepted, 2, 'only the two human/admin decisions are accepted')
})

void test('actor ids that look automated are treated as non-human', () => {
  for (const id of ['model-x', 'worker-1', 'agent-9', 'service-api', 'system-clock', '  ']) {
    assert.equal(looksNonHuman(id), true)
  }
  assert.equal(looksNonHuman('bjo'), false)
})
