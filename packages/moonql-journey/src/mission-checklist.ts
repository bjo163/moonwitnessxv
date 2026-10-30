import {
  actionableBy,
  resolveStatus,
  type MandateErrorCode,
  type MandateRecord,
} from './mandate-lifecycle.js'

/**
 * @moonwitness/moonql-journey — M23-05 human-owned mission checklist.
 *
 * A world patch is the highest-consequence write this domain has: it changes what
 * the record says about a passage. M23-03 made the mandate behind such work
 * expiring and revocable; this contract is the checklist that carries it out, and
 * its load-bearing rule is that a high-consequence step has no automated path at
 * all. An `automated` act on one is refused before anything else is considered,
 * so no scheduler, retry or import can ever apply a patch — only a named human
 * moment, recorded as an act, can.
 *
 * The other rule is that a step is never rolled forward by wishful thinking: each
 * `HIGH` step must carry its rollback plan when the mission opens, and every
 * applied step can be rolled back by a later act. As in the mandate contract, the
 * state of a step is DERIVED from the act log, so nothing can claim to be applied
 * after its mandate was revoked or its patch was rolled back.
 *
 * Pure and store-free: this prototype opens no database and applies no patch.
 */

export type ConsequenceClass = 'REVERSIBLE' | 'HIGH'

export const CONSEQUENCE_CLASSES: readonly ConsequenceClass[] = ['REVERSIBLE', 'HIGH']

export type StepSpec = {
  id: string
  title: string
  consequence: ConsequenceClass
  /** required for a HIGH step before it can exist at all */
  rollbackPlan: string
}

export type StepAct = {
  stepId: string
  action: 'applied' | 'rolled-back'
  /** who performed it — always a pseudonym of a voluntary human */
  by: string
  at: string
  kind: 'human' | 'automated'
}

export type Mission = {
  id: string
  patchRef: string
  mandate: MandateRecord
  steps: readonly StepSpec[]
  log: readonly StepAct[]
}

export type StepState = 'PENDING' | 'APPLIED' | 'ROLLED_BACK'

export type MissionErrorCode =
  | 'MISSING_IDENTIFIER'
  | 'MISSING_PATCH_REF'
  | 'NO_STEPS'
  | 'DUPLICATE_STEP_ID'
  | 'STEP_NEEDS_A_TITLE'
  | 'CONSEQUENCE_UNREADABLE'
  | 'ROLLBACK_PLAN_REQUIRED'
  | 'MANDATE_NOT_ACTIVE'
  | 'UNKNOWN_STEP'
  | 'ALREADY_APPLIED'
  | 'NOT_APPLIED'
  | 'AUTOMATION_PROHIBITED'
  | 'NEEDS_HUMAN_ACTOR'
  | 'NOT_THE_MANDATE_HOLDER'
  | 'FUTURE_TIMESTAMP'

export type MissionResult<T> = { ok: true; value: T } | { ok: false; code: MissionErrorCode | MandateErrorCode }

const ok = <T,>(value: T): MissionResult<T> => ({ ok: true, value })
const fail = (code: MissionErrorCode): MissionResult<never> => ({ ok: false, code })

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const isTimestamp = (value: string): boolean => !Number.isNaN(Date.parse(value))

export type MissionInput = { id: string; patchRef: string; mandate: MandateRecord; steps: readonly StepSpec[] }

/** validate the plan before any act exists: every high-consequence step is born with a rollback */
export function openMission(input: MissionInput, now: string): MissionResult<Mission> {
  if (!isText(input.id)) return fail('MISSING_IDENTIFIER')
  if (!isText(input.patchRef)) return fail('MISSING_PATCH_REF')
  if (resolveStatus(input.mandate, now) !== 'ACTIVE') return fail('MANDATE_NOT_ACTIVE')
  if (input.steps.length === 0) return fail('NO_STEPS')

  const seen = new Set<string>()
  for (const step of input.steps) {
    if (seen.has(step.id)) return fail('DUPLICATE_STEP_ID')
    seen.add(step.id)
    if (!isText(step.id) || !isText(step.title)) return fail('STEP_NEEDS_A_TITLE')
    if (!(CONSEQUENCE_CLASSES as readonly string[]).includes(String(step.consequence))) return fail('CONSEQUENCE_UNREADABLE')
    if (step.consequence === 'HIGH' && !isText(step.rollbackPlan)) return fail('ROLLBACK_PLAN_REQUIRED')
  }

  return ok({
    id: input.id.trim(),
    patchRef: input.patchRef.trim(),
    mandate: input.mandate,
    steps: input.steps.map((step) => ({ ...step })),
    log: [],
  })
}

/** the step's state is read from the tail of the act log, never stored */
export function stepState(mission: Mission, stepId: string): StepState {
  let state: StepState = 'PENDING'
  for (const act of mission.log) {
    if (act.stepId !== stepId) continue
    state = act.action === 'applied' ? 'APPLIED' : 'ROLLED_BACK'
  }
  return state
}

function refusal(mission: Mission, act: ActRequest): MissionErrorCode | null {
  if (!isText(act.by)) return 'NEEDS_HUMAN_ACTOR'
  if (!isTimestamp(act.at)) return 'NEEDS_HUMAN_ACTOR'
  if (Date.parse(act.at) > Date.parse(act.now)) return 'FUTURE_TIMESTAMP'
  if (resolveStatus(mission.mandate, act.now) !== 'ACTIVE') return 'MANDATE_NOT_ACTIVE'
  return null
}

export type ActRequest = { stepId: string; by: string; at: string; kind: StepAct['kind']; now: string }

/**
 * Perform a step. The order of the guards is the point: an automated request
 * against a `HIGH` step is refused before the actor, the clock or the mandate is
 * consulted, because the prohibition is on the channel, not on the person. An
 * act that does not even name who performed it is refused before it can be
 * compared against the mandate holder.
 */
export function applyStep(mission: Mission, request: ActRequest): MissionResult<Mission> {
  const step = mission.steps.find((candidate) => candidate.id === request.stepId)
  if (!step) return fail('UNKNOWN_STEP')
  if (step.consequence === 'HIGH' && request.kind !== 'human') return fail('AUTOMATION_PROHIBITED')
  if (stepState(mission, step.id) === 'APPLIED') return fail('ALREADY_APPLIED')
  const reason = refusal(mission, request)
  if (reason) return fail(reason)
  if (request.kind === 'human' && !actionableBy(mission.mandate, request.by, mission.mandate.consent.scope)) {
    return fail('NOT_THE_MANDATE_HOLDER')
  }

  return ok({
    ...mission,
    log: [...mission.log, { stepId: step.id, action: 'applied', by: request.by.trim(), at: request.at, kind: request.kind }],
  })
}

/** undo an applied step — the rollback plan is what makes this a decision and not a guess */
export function rollBackStep(mission: Mission, request: ActRequest): MissionResult<Mission> {
  const step = mission.steps.find((candidate) => candidate.id === request.stepId)
  if (!step) return fail('UNKNOWN_STEP')
  if (stepState(mission, step.id) !== 'APPLIED') return fail('NOT_APPLIED')
  if (step.consequence === 'HIGH' && request.kind !== 'human') return fail('AUTOMATION_PROHIBITED')
  const reason = refusal(mission, request)
  if (reason) return fail(reason)

  return ok({
    ...mission,
    log: [...mission.log, { stepId: step.id, action: 'rolled-back', by: request.by.trim(), at: request.at, kind: request.kind }],
  })
}

/** the steps no scheduler may ever touch — what a worker is allowed to do alone */
export const highConsequenceSteps = (mission: Mission): readonly StepSpec[] =>
  mission.steps.filter((step) => step.consequence === 'HIGH')

/** open work a human still has to own, for a queue or a checklist render */
export const outstandingSteps = (mission: Mission): readonly StepSpec[] =>
  mission.steps.filter((step) => stepState(mission, step.id) !== 'APPLIED')

/**
 * Can anything about this mission run unattended? Only a mission with no
 * high-consequence step left to do, so a patch-bearing mission is always a human
 * one.
 */
export function automatable(mission: Mission, now: string): boolean {
  if (resolveStatus(mission.mandate, now) !== 'ACTIVE') return false
  return outstandingSteps(mission).every((step) => step.consequence !== 'HIGH')
}
