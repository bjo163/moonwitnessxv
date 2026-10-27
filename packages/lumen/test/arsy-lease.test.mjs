import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ArsyLeaseAdapter,
  LumenLeaseError,
} from '../dist/index.js';

test('positive: fake-ARSY contract completes, pauses, resumes and recovers run using saved steps', async () => {
  let currentTime = new Date('2026-10-27T12:00:00Z');
  const clock = () => currentTime;

  const adapter = new ArsyLeaseAdapter({ clockFn: clock });

  // 1. Seed initial queued run
  adapter.registerRun({
    runId: 'run-101',
    workflowVersion: '1.0.0',
    status: 'QUEUED',
    currentStepIndex: 0,
    createdAt: currentTime.toISOString(),
    updatedAt: currentTime.toISOString(),
  });

  // 2. Worker A claims run with fencing epoch 1
  const leaseA = {
    leaseToken: 'token-worker-a-1',
    workerId: 'worker-a',
    fencingEpoch: 1,
    expiresAt: new Date('2026-10-27T12:05:00Z').toISOString(),
  };

  const claimed = await adapter.claimRun('run-101', leaseA);
  assert.equal(claimed, true);

  const initialRecord = adapter.getCanonicalRun('run-101');
  assert.equal(initialRecord?.run.status, 'CLAIMED');
  assert.equal(initialRecord?.run.lease?.workerId, 'worker-a');

  // 3. Heartbeat extends active state
  currentTime = new Date('2026-10-27T12:01:00Z');
  const hbOk = await adapter.heartbeat('run-101', 'token-worker-a-1');
  assert.equal(hbOk, true);

  // 4. Record successful step 1
  await adapter.recordStep('run-101', {
    stepId: 'step-1',
    stepIndex: 1,
    type: 'MODEL_REQUEST',
    status: 'COMPLETED',
    startedAt: currentTime.toISOString(),
    completedAt: currentTime.toISOString(),
    payload: { prompt: 'Verify satellite signal' },
  });

  const steps = await adapter.getSteps('run-101');
  assert.equal(steps.length, 1);
  assert.equal(steps[0].stepId, 'step-1');
  assert.ok(steps[0].payloadHash);

  // 5. Save checkpoint at step 1
  await adapter.saveCheckpoint({
    checkpointId: 'chk-1',
    runId: 'run-101',
    schemaVersion: '1.0.0',
    stepIndex: 1,
    snapshot: { lastCompletedStep: 'step-1', progress: 50 },
    createdAt: currentTime.toISOString(),
  });

  // 6. Pause run for approval (releases worker A lease)
  await adapter.pauseRunForApproval('run-101', 'approval-tok-xyz');
  const pausedRecord = adapter.getCanonicalRun('run-101');
  assert.equal(pausedRecord?.run.status, 'PAUSED_APPROVAL');
  assert.equal(pausedRecord?.run.lease, undefined);

  // 7. Worker B resumes run with monotonically incremented fencing epoch 2
  currentTime = new Date('2026-10-27T12:02:00Z');
  const leaseB = {
    leaseToken: 'token-worker-b-2',
    workerId: 'worker-b',
    fencingEpoch: 2,
    expiresAt: new Date('2026-10-27T12:10:00Z').toISOString(),
  };

  await adapter.claimRun('run-101', leaseB);

  // 8. Recover execution state (proves step 1 is skipped and checkpoint state restored)
  const recovered = await adapter.recoverExecutionState('run-101');
  assert.equal(recovered.run.status, 'CLAIMED');
  assert.equal(recovered.checkpoint?.checkpointId, 'chk-1');
  assert.equal(recovered.completedSteps.has('step-1'), true);

  // 9. Complete step 2 and complete run
  await adapter.recordStep('run-101', {
    stepId: 'step-2',
    stepIndex: 2,
    type: 'TOOL_EXECUTION',
    status: 'COMPLETED',
    startedAt: currentTime.toISOString(),
    completedAt: currentTime.toISOString(),
    payload: { result: 'Signal confirmed' },
  });

  await adapter.completeRun('run-101', { summary: 'Mission accomplished' });
  const completedRecord = adapter.getCanonicalRun('run-101');
  assert.equal(completedRecord?.run.status, 'COMPLETED');
  assert.equal(completedRecord?.run.lease, undefined);
});

test('negative: rejects stale fencing token, expired lease, active claim conflict, and large payload', async () => {
  let currentTime = new Date('2026-10-27T12:00:00Z');
  const clock = () => currentTime;

  const adapter = new ArsyLeaseAdapter({ clockFn: clock });

  adapter.registerRun({
    runId: 'run-negative',
    workflowVersion: '1.0.0',
    status: 'QUEUED',
    currentStepIndex: 0,
    createdAt: currentTime.toISOString(),
    updatedAt: currentTime.toISOString(),
  });

  // Claim with epoch 5
  await adapter.claimRun('run-negative', {
    leaseToken: 'token-epoch-5',
    workerId: 'worker-prime',
    fencingEpoch: 5,
    expiresAt: new Date('2026-10-27T12:05:00Z').toISOString(),
  });

  // 1. Competing worker attempts claim with lower or equal epoch -> STALE_FENCING_TOKEN or RUN_ALREADY_CLAIMED
  await assert.rejects(
    async () =>
      adapter.claimRun('run-negative', {
        leaseToken: 'token-epoch-4',
        workerId: 'worker-stale',
        fencingEpoch: 4,
        expiresAt: new Date('2026-10-27T12:06:00Z').toISOString(),
      }),
    (err) => {
      assert(err instanceof LumenLeaseError);
      assert.equal(err.code, 'RUN_ALREADY_CLAIMED');
      return true;
    }
  );

  // 2. Heartbeat with invalid token fails safely
  const wrongTokenHb = await adapter.heartbeat('run-negative', 'wrong-token');
  assert.equal(wrongTokenHb, false);

  // 3. Advancing time past expiration causes operations to fail with LEASE_EXPIRED
  currentTime = new Date('2026-10-27T12:06:00Z'); // expired 1 minute ago

  await assert.rejects(
    async () => adapter.heartbeat('run-negative', 'token-epoch-5'),
    (err) => {
      assert(err instanceof LumenLeaseError);
      assert.equal(err.code, 'LEASE_EXPIRED');
      return true;
    }
  );

  await assert.rejects(
    async () =>
      adapter.recordStep('run-negative', {
        stepId: 'step-fail',
        stepIndex: 1,
        type: 'TOOL_EXECUTION',
        status: 'COMPLETED',
        startedAt: currentTime.toISOString(),
      }),
    (err) => {
      assert(err instanceof LumenLeaseError);
      assert.equal(err.code, 'LEASE_EXPIRED');
      return true;
    }
  );

  // 4. Re-claiming expired run with equal epoch 5 rejected with STALE_FENCING_TOKEN
  await assert.rejects(
    async () =>
      adapter.claimRun('run-negative', {
        leaseToken: 'token-epoch-5-retry',
        workerId: 'worker-stale',
        fencingEpoch: 5, // Not strictly greater than 5!
        expiresAt: new Date('2026-10-27T12:10:00Z').toISOString(),
      }),
    (err) => {
      assert(err instanceof LumenLeaseError);
      assert.equal(err.code, 'STALE_FENCING_TOKEN');
      return true;
    }
  );

  // 5. Claim with new epoch 6 succeeds
  await adapter.claimRun('run-negative', {
    leaseToken: 'token-epoch-6',
    workerId: 'worker-fresh',
    fencingEpoch: 6,
    expiresAt: new Date('2026-10-27T12:15:00Z').toISOString(),
  });

  // 6. Step payload exceeding 256 KB rejected with PAYLOAD_TOO_LARGE
  const giantPayload = { data: 'x'.repeat(260 * 1024) };
  await assert.rejects(
    async () =>
      adapter.recordStep('run-negative', {
        stepId: 'step-giant',
        stepIndex: 2,
        type: 'TOOL_EXECUTION',
        status: 'COMPLETED',
        startedAt: currentTime.toISOString(),
        payload: giantPayload,
      }),
    (err) => {
      assert(err instanceof LumenLeaseError);
      assert.equal(err.code, 'PAYLOAD_TOO_LARGE');
      return true;
    }
  );

  // 7. Incompatible checkpoint schema version rejected
  await assert.rejects(
    async () =>
      adapter.saveCheckpoint({
        checkpointId: 'chk-v2',
        runId: 'run-negative',
        schemaVersion: '2.0.0', // Incompatible major version!
        stepIndex: 1,
        snapshot: {},
        createdAt: currentTime.toISOString(),
      }),
    (err) => {
      assert(err instanceof Error);
      assert(err.message.includes('INCOMPATIBLE_CHECKPOINT_VERSION'));
      return true;
    }
  );
});
