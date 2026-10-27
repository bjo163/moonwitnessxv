import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  validateRunTransition,
  validateLease,
  validateStepPayload,
  validateApprovalResume,
  validateCheckpointVersion
} from '../../scripts/lumen/contract-validator.mjs';

test('positive: valid run lifecycle transitions, monotonic lease fencing, step hashing and approval resume', () => {
  // 1. Normal run lifecycle
  assert.equal(validateRunTransition('QUEUED', 'CLAIMED'), true);
  assert.equal(validateRunTransition('CLAIMED', 'RUNNING'), true);
  assert.equal(validateRunTransition('RUNNING', 'PAUSED_APPROVAL'), true);
  assert.equal(validateRunTransition('PAUSED_APPROVAL', 'RUNNING'), true);
  assert.equal(validateRunTransition('RUNNING', 'COMPLETED'), true);

  // 2. Cancellation from non-terminal states
  assert.equal(validateRunTransition('QUEUED', 'CANCELLED'), true);
  assert.equal(validateRunTransition('CLAIMED', 'CANCELLED'), true);
  assert.equal(validateRunTransition('RUNNING', 'CANCELLED'), true);
  assert.equal(validateRunTransition('PAUSED_APPROVAL', 'CANCELLED'), true);

  // 3. Monotonic lease validation
  const baseTime = new Date('2026-10-27T12:00:00.000Z');
  const activeLease = { fencingEpoch: 1, expiresAt: '2026-10-27T12:05:00.000Z' };
  const incomingLease = { fencingEpoch: 2 };
  assert.equal(validateLease(activeLease, incomingLease, baseTime), true);

  // 4. Step payload validation
  const validStep = { stepIndex: 0, payload: { message: 'hello world', data: [1, 2, 3] } };
  const stepResult = validateStepPayload(validStep);
  assert.equal(stepResult.valid, true);
  assert.ok(stepResult.computedHash);

  // 5. Approval resume with exact argument hash
  const args = { targetStation: 'station_01', action: 'DEPLOY_RADIO' };
  const argumentHash = crypto.createHash('sha256').update(JSON.stringify(args)).digest('hex');
  const pauseRecord = { argumentHash, expiresAt: '2026-10-27T12:10:00.000Z' };
  const resumeRecord = { arguments: args };
  assert.equal(validateApprovalResume(pauseRecord, resumeRecord, baseTime), true);

  // 6. Compatible checkpoint semver
  assert.equal(validateCheckpointVersion('1.2.0', '1.0.0'), true);
});

test('negative: reject illegal state transitions, terminal escapes, stale fencing, expired leases, tampered approvals, and oversize payloads', () => {
  // 1. Illegal transition: QUEUED directly to COMPLETED
  assert.throws(
    () => validateRunTransition('QUEUED', 'COMPLETED'),
    /INVALID_RUN_STATE_TRANSITION.*Illegal transition from "QUEUED" to "COMPLETED"/
  );

  // 2. Cannot escape terminal state COMPLETED
  assert.throws(
    () => validateRunTransition('COMPLETED', 'RUNNING'),
    /INVALID_RUN_STATE_TRANSITION.*Cannot transition out of terminal state "COMPLETED"/
  );

  // 3. Unknown state rejected
  assert.throws(
    () => validateRunTransition('UNKNOWN_STATE', 'RUNNING'),
    /INVALID_RUN_STATE/
  );

  // 4. Stale fencing epoch rejected
  const activeLease = { fencingEpoch: 5, expiresAt: '2026-10-27T12:05:00.000Z' };
  const staleLease = { fencingEpoch: 4 };
  assert.throws(
    () => validateLease(activeLease, staleLease, new Date('2026-10-27T12:00:00.000Z')),
    /STALE_FENCING_EPOCH.*is strictly less than active epoch/
  );

  // 5. Expired lease rejected
  const expiredLease = { fencingEpoch: 5, expiresAt: '2026-10-27T11:59:00.000Z' };
  assert.throws(
    () => validateLease(expiredLease, { fencingEpoch: 6 }, new Date('2026-10-27T12:00:00.000Z')),
    /LEASE_EXPIRED/
  );

  // 6. Oversized step payload rejected (>256 KB)
  const hugeString = 'x'.repeat(260 * 1024);
  assert.throws(
    () => validateStepPayload({ stepIndex: 1, payload: { hugeString } }),
    /PAYLOAD_SIZE_EXCEEDED/
  );

  // 7. Tampered approval arguments rejected
  const originalArgs = { action: 'UPDATE_CONFIG', safe: true };
  const tamperedArgs = { action: 'UPDATE_CONFIG', safe: false };
  const originalHash = crypto.createHash('sha256').update(JSON.stringify(originalArgs)).digest('hex');
  const pauseRecord = { argumentHash: originalHash, expiresAt: '2026-10-27T12:10:00.000Z' };
  assert.throws(
    () => validateApprovalResume(pauseRecord, { arguments: tamperedArgs }, new Date('2026-10-27T12:00:00.000Z')),
    /APPROVAL_TAMPERED/
  );

  // 8. Expired approval token rejected
  const expiredPause = { argumentHash: originalHash, expiresAt: '2026-10-27T11:50:00.000Z' };
  assert.throws(
    () => validateApprovalResume(expiredPause, { arguments: originalArgs }, new Date('2026-10-27T12:00:00.000Z')),
    /APPROVAL_EXPIRED/
  );

  // 9. Incompatible checkpoint semver rejected
  assert.throws(
    () => validateCheckpointVersion('2.0.0', '1.0.0'),
    /INCOMPATIBLE_CHECKPOINT_VERSION/
  );
});
