/**
 * MoonWitness XV — LUMEN Canonical Contract & State Validator (M41-02)
 *
 * Implements canonical state transitions, lease fencing, step verification,
 * and human approval validation for the LUMEN framework.
 */

import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

export const VALID_RUN_STATES = new Set([
  'QUEUED',
  'CLAIMED',
  'RUNNING',
  'PAUSED_APPROVAL',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
]);

export const TERMINAL_RUN_STATES = new Set([
  'COMPLETED',
  'FAILED',
  'CANCELLED'
]);

export const LEGAL_RUN_TRANSITIONS = {
  QUEUED: new Set(['CLAIMED', 'CANCELLED']),
  CLAIMED: new Set(['RUNNING', 'CANCELLED']),
  RUNNING: new Set(['PAUSED_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED']),
  PAUSED_APPROVAL: new Set(['RUNNING', 'FAILED', 'CANCELLED']),
  COMPLETED: new Set(),
  FAILED: new Set(),
  CANCELLED: new Set()
};

export const MAX_STEP_PAYLOAD_BYTES = 256 * 1024; // 256 KB hard limit

/**
 * Validates a run state transition according to the LUMEN state machine.
 */
export function validateRunTransition(currentState, nextState) {
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

/**
 * Validates lease fencing and freshness.
 */
export function validateLease(activeLease, incomingLease, currentTime = new Date()) {
  const now = currentTime instanceof Date ? currentTime.getTime() : new Date(currentTime).getTime();
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

/**
 * Validates step payload size, indexing, and input hash.
 */
export function validateStepPayload(step) {
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

/**
 * Validates approval resumption against original paused argument hash and expiration.
 */
export function validateApprovalResume(pauseRecord, resumeRecord, currentTime = new Date()) {
  const now = currentTime instanceof Date ? currentTime.getTime() : new Date(currentTime).getTime();
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

/**
 * Validates checkpoint schema version compatibility.
 */
export function validateCheckpointVersion(checkpointVersion, supportedVersion = '1.0.0') {
  const [chkMajor] = checkpointVersion.split('.').map(Number);
  const [supMajor] = supportedVersion.split('.').map(Number);

  if (chkMajor !== supMajor) {
    throw new Error(
      `INCOMPATIBLE_CHECKPOINT_VERSION: Checkpoint major version ${chkMajor} is incompatible with supported major version ${supMajor}`
    );
  }

  return true;
}
