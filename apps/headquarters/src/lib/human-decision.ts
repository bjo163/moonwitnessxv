export type ActorKind = 'human' | 'model' | 'service'

export type DecisionRequest = {
  actionId: string
  irreversible: boolean
  actor: { id: string; kind: ActorKind }
  approver?: { id: string; role: string } | null
  autoExecute?: boolean
}

export type DecisionVerdict = {
  actionId: string
  outcome: 'requires-named-human' | 'requires-explicit-approval'
  executable: false
}

export type HumanDecisionCode =
  | 'AUTO_EXECUTION_PROHIBITED'
  | 'SUPERNATURAL_MANDATE_REFUSED'
  | 'HUMAN_APPROVAL_REQUIRED'
  | 'SELF_APPROVAL_PROHIBITED'
  | 'APPROVER_ROLE_NOT_RECOGNIZED'

export const HUMAN_DECISION_ROLES = ['admin', 'operator'] as const

const NON_HUMAN_PREFIXES = ['model-', 'model_', 'worker-', 'worker_', 'agent-', 'agent_', 'service-', 'service_', 'system-', 'system_']

export const looksNonHuman = (id: string): boolean => {
  const value = id.trim().toLowerCase()
  return value.length === 0 || NON_HUMAN_PREFIXES.some((prefix) => value.startsWith(prefix))
}

export class HumanDecisionError extends Error {
  readonly code: HumanDecisionCode

  constructor(code: HumanDecisionCode, message: string) {
    super(message)
    this.name = 'HumanDecisionError'
    this.code = code
  }
}

/**
 * Classifies an ordinary human task or incident decision. The contract never
 * returns an executable verdict: execution stays with the caller after a named
 * human has been recorded, and every irreversible action needs explicit approval.
 */
export function classifyDecision(request: DecisionRequest): DecisionVerdict {
  if (request.autoExecute) {
    throw new HumanDecisionError('AUTO_EXECUTION_PROHIBITED', `Action "${request.actionId}" requested automatic execution`)
  }

  if (request.actor.kind !== 'human' || looksNonHuman(request.actor.id)) {
    throw new HumanDecisionError('SUPERNATURAL_MANDATE_REFUSED', `Actor "${request.actor.id}" is not a named human`)
  }

  const approver = request.approver
  if (!approver || looksNonHuman(approver.id) || approver.id.trim().toLowerCase() === request.actor.id.trim().toLowerCase()) {
    throw new HumanDecisionError('HUMAN_APPROVAL_REQUIRED', `Action "${request.actionId}" has no separate named human approver`)
  }

  if (!(HUMAN_DECISION_ROLES as readonly string[]).includes(approver.role.trim().toLowerCase())) {
    throw new HumanDecisionError('APPROVER_ROLE_NOT_RECOGNIZED', `Approver role "${approver.role}" cannot decide action "${request.actionId}"`)
  }

  return {
    actionId: request.actionId,
    outcome: request.irreversible ? 'requires-explicit-approval' : 'requires-named-human',
    executable: false,
  }
}
