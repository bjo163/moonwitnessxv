/**
 * @moonwitness/lumen — Bounded Agent Framework
 *
 * Core public contracts, ports, and state validation for the LUMEN framework.
 * Importing this module MUST have zero network, database, timer, or environment side effects.
 */

import crypto from 'node:crypto';

// --- Canonical State Types ---

export type RunStatus =
  | 'QUEUED'
  | 'CLAIMED'
  | 'RUNNING'
  | 'PAUSED_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type StepType =
  | 'MODEL_REQUEST'
  | 'TOOL_PROPOSAL'
  | 'TOOL_EXECUTION'
  | 'APPROVAL_PAUSE'
  | 'CHECKPOINT';

export type StepStatus =
  | 'PENDING'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'INTERRUPTED';

export interface LumenLease {
  leaseToken: string;
  workerId: string;
  fencingEpoch: number;
  expiresAt: string; // ISO 8601
}

export interface LumenStep {
  stepId: string;
  stepIndex: number;
  type: StepType;
  status: StepStatus;
  startedAt: string;
  completedAt?: string;
  payload?: Record<string, unknown>;
  payloadHash?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface LumenRun {
  runId: string;
  workflowVersion: string;
  status: RunStatus;
  lease?: LumenLease;
  currentStepIndex: number;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

export interface LumenCheckpoint {
  checkpointId: string;
  runId: string;
  schemaVersion: string;
  stepIndex: number;
  snapshot: Record<string, unknown>;
  createdAt: string;
}

export interface LumenEvent {
  eventId: string;
  runId: string;
  stepId?: string;
  timestamp: string;
  eventType: string;
  data: Record<string, unknown>;
}

// --- Dependency-Injected Ports ---

export interface ModelRequest {
  model?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  tools?: Array<{ name: string; description: string; parameters: Record<string, unknown> }>;
}

export interface ModelResponse {
  content: string;
  toolCalls?: Array<{ id: string; name: string; arguments: Record<string, unknown> }>;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export interface ModelGatewayPort {
  requestInference(request: ModelRequest): Promise<ModelResponse>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiresApproval: boolean;
}

export interface ToolRegistryPort {
  getTool(name: string): ToolDefinition | undefined;
  listTools(): ToolDefinition[];
  executeTool(name: string, args: Record<string, unknown>, context: Record<string, unknown>): Promise<unknown>;
}

export interface RunControlPort {
  claimRun(runId: string, lease: LumenLease): Promise<boolean>;
  heartbeat(runId: string, leaseToken: string): Promise<boolean>;
  completeRun(runId: string, result: Record<string, unknown>): Promise<void>;
  failRun(runId: string, error: { code: string; message: string }): Promise<void>;
}

export interface CheckpointPort {
  saveCheckpoint(checkpoint: LumenCheckpoint): Promise<void>;
  loadCheckpoint(runId: string): Promise<LumenCheckpoint | undefined>;
}

export interface ApprovalGatePort {
  requestApproval(runId: string, toolCall: { name: string; arguments: Record<string, unknown> }): Promise<{ token: string; expiresAt: string }>;
  checkApprovalStatus(token: string): Promise<'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'>;
}

export interface EventSinkPort {
  emitEvent(event: LumenEvent): Promise<void>;
}

export interface ClockPort {
  now(): Date;
}

export interface BudgetPort {
  consumeBudget(tokens: number): Promise<boolean>;
  getRemainingBudget(): Promise<number>;
}

// --- Canonical Constants & Validation Logic ---

export const VALID_RUN_STATES = new Set<RunStatus>([
  'QUEUED',
  'CLAIMED',
  'RUNNING',
  'PAUSED_APPROVAL',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
]);

export const TERMINAL_RUN_STATES = new Set<RunStatus>([
  'COMPLETED',
  'FAILED',
  'CANCELLED'
]);

export const LEGAL_RUN_TRANSITIONS: Record<RunStatus, Set<RunStatus>> = {
  QUEUED: new Set(['CLAIMED', 'CANCELLED']),
  CLAIMED: new Set(['RUNNING', 'CANCELLED']),
  RUNNING: new Set(['PAUSED_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED']),
  PAUSED_APPROVAL: new Set(['RUNNING', 'FAILED', 'CANCELLED']),
  COMPLETED: new Set(),
  FAILED: new Set(),
  CANCELLED: new Set()
};

export const MAX_STEP_PAYLOAD_BYTES = 256 * 1024; // 256 KB hard limit

export function validateRunTransition(currentState: RunStatus, nextState: RunStatus): boolean {
  if (!VALID_RUN_STATES.has(currentState)) {
    throw new Error(`INVALID_RUN_STATE: Unknown current state "${currentState}"`);
  }
  if (!VALID_RUN_STATES.has(nextState)) {
    throw new Error(`INVALID_RUN_STATE: Unknown next state "${nextState}"`);
  }
  if (TERMINAL_RUN_STATES.has(currentState)) {
    throw new Error(
      `INVALID_RUN_STATE_TRANSITION: Cannot transition out of terminal state "${currentState}" to "${nextState}"`
    );
  }

  const allowedNext = LEGAL_RUN_TRANSITIONS[currentState] || new Set();
  if (!allowedNext.has(nextState)) {
    throw new Error(
      `INVALID_RUN_STATE_TRANSITION: Illegal transition from "${currentState}" to "${nextState}"`
    );
  }

  return true;
}

export function validateLease(activeLease: LumenLease, incomingLease: { fencingEpoch: number }, currentTime: Date = new Date()): boolean {
  const now = currentTime.getTime();
  const expiresAt = new Date(activeLease.expiresAt).getTime();

  if (now > expiresAt) {
    throw new Error(`LEASE_EXPIRED: Active lease expired at ${activeLease.expiresAt}`);
  }

  if (incomingLease.fencingEpoch < activeLease.fencingEpoch) {
    throw new Error(
      `STALE_FENCING_EPOCH: Incoming fencing epoch ${incomingLease.fencingEpoch} is strictly less than active epoch ${activeLease.fencingEpoch}`
    );
  }

  return true;
}

export function validateStepPayload(step: { stepIndex: number; payload?: Record<string, unknown> }): { valid: boolean; payloadBytes: number; computedHash: string } {
  if (!step || typeof step !== 'object') {
    throw new Error('INVALID_STEP: Step must be an object');
  }

  if (typeof step.stepIndex !== 'number' || step.stepIndex < 0) {
    throw new Error('INVALID_STEP: stepIndex must be a non-negative integer');
  }

  const payloadString = JSON.stringify(step.payload || {});
  const payloadBytes = Buffer.byteLength(payloadString, 'utf8');

  if (payloadBytes > MAX_STEP_PAYLOAD_BYTES) {
    throw new Error(
      `PAYLOAD_SIZE_EXCEEDED: Step payload size (${payloadBytes} bytes) exceeds maximum allowable limit of ${MAX_STEP_PAYLOAD_BYTES} bytes`
    );
  }

  return {
    valid: true,
    payloadBytes,
    computedHash: crypto.createHash('sha256').update(payloadString).digest('hex')
  };
}

export function validateApprovalResume(
  pauseRecord: { argumentHash: string; expiresAt: string },
  resumeRecord: { arguments?: Record<string, unknown> },
  currentTime: Date = new Date()
): boolean {
  const now = currentTime.getTime();
  const expiresAt = new Date(pauseRecord.expiresAt).getTime();

  if (now > expiresAt) {
    throw new Error(`APPROVAL_EXPIRED: Human approval token expired at ${pauseRecord.expiresAt}`);
  }

  const resumePayloadHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(resumeRecord.arguments || {}))
    .digest('hex');

  if (resumePayloadHash !== pauseRecord.argumentHash) {
    throw new Error(
      `APPROVAL_TAMPERED: Resume arguments hash "${resumePayloadHash}" does not match approved hash "${pauseRecord.argumentHash}"`
    );
  }

  return true;
}

export function validateCheckpointVersion(checkpointVersion: string, supportedVersion: string = '1.0.0'): boolean {
  const [chkMajor] = checkpointVersion.split('.').map(Number);
  const [supMajor] = supportedVersion.split('.').map(Number);

  if (chkMajor !== supMajor) {
    throw new Error(
      `INCOMPATIBLE_CHECKPOINT_VERSION: Checkpoint major version ${chkMajor} is incompatible with supported major version ${supMajor}`
    );
  }

  return true;
}

export * from './agent-loop.js';
export * from './tool-registry.js';
export * from './adapters/ai-gateway.js';
export * from './adapters/arsy-lease.js';
export * from './adapters/approval-gate.js';
export * from './telemetry.js';
