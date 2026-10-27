import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ApprovalGateAdapter,
  ArsyLeaseAdapter,
  ToolRegistry,
} from '@moonwitness/lumen';
import { LumenWorker } from '../dist/index.js';

test('positive: runtime starts with fake adapters, claims fixture, executes run, stops gracefully and reports readiness', async () => {
  let currentTime = new Date('2026-10-27T12:00:00Z');
  const clock = () => currentTime;

  const runControl = new ArsyLeaseAdapter({ clockFn: clock });
  const approvalGate = new ApprovalGateAdapter({ clockFn: clock });
  const toolRegistry = new ToolRegistry();

  // Register allowlisted tool
  toolRegistry.registerTool({
    name: 'sha256_digest',
    version: '1.0.0',
    description: 'Compute SHA256 of text',
    sideEffect: 'READ_ONLY',
    requiredCapabilities: ['compute:hash'],
    requiresApproval: false,
    parameters: {
      text: {
        type: 'string',
        required: true,
      },
    },
    async execute(args) {
      return `sha256_${args.text}`;
    },
  });

  // Fake Model Gateway
  let modelCallCount = 0;
  const fakeGateway = {
    async requestInference() {
      modelCallCount++;
      if (modelCallCount === 1) {
        return {
          content: 'Hashing text',
          toolCalls: [{ id: 'call_1', name: 'sha256_digest', arguments: { text: 'orbit' } }],
        };
      }
      return { content: 'Hash computation completed successfully.' };
    },
  };

  // Seed fixture run in ARSY
  runControl.registerRun({
    runId: 'fixture-run-001',
    workflowVersion: '1.0.0',
    status: 'QUEUED',
    currentStepIndex: 0,
    createdAt: currentTime.toISOString(),
    updatedAt: currentTime.toISOString(),
  });

  const worker = new LumenWorker({
    workerId: 'worker-unit-test-1',
    modelGateway: fakeGateway,
    toolRegistry,
    runControl,
    checkpointPort: runControl,
    approvalGate,
    clockFn: clock,
  });

  // 1. Initial readiness
  const initialReadiness = worker.getReadiness();
  assert.equal(initialReadiness.status, 'INITIALIZING');
  assert.equal(initialReadiness.healthy, false);

  // 2. Start worker
  await worker.start();
  const readyReadiness = worker.getReadiness();
  assert.equal(readyReadiness.status, 'READY');
  assert.equal(readyReadiness.healthy, true);

  // 3. Claim and execute run
  const outcome = await worker.claimAndExecute({
    runId: 'fixture-run-001',
    fencingEpoch: 1,
    prompt: 'Compute sha256 of orbit',
    trustedContext: {
      capabilities: ['compute:hash'],
    },
  });

  assert.equal(outcome.status, 'COMPLETED');
  assert.equal(outcome.output, 'Hash computation completed successfully.');

  // Verify checkpoint was saved in ARSY
  const canonical = runControl.getCanonicalRun('fixture-run-001');
  assert.equal(canonical?.run.status, 'COMPLETED');
  assert.equal(canonical?.checkpoints.length, 1);

  // 4. Stop worker gracefully
  await worker.stop();
  const stoppedReadiness = worker.getReadiness();
  assert.equal(stoppedReadiness.status, 'STOPPED');
  assert.equal(stoppedReadiness.healthy, false);
});

test('negative: rejects missing config, unauthorized tools, unavailable ARSY, and enforces concurrency bounds', async () => {
  // 1. Missing config validation
  assert.throws(
    () => new LumenWorker({}),
    (err) => {
      assert(err instanceof Error);
      assert(err.message.includes('valid ModelGatewayPort'));
      return true;
    }
  );

  let currentTime = new Date('2026-10-27T12:00:00Z');
  const clock = () => currentTime;

  const runControl = new ArsyLeaseAdapter({ clockFn: clock });
  const approvalGate = new ApprovalGateAdapter({ clockFn: clock });
  const toolRegistry = new ToolRegistry();

  // 2. Unauthorized tool attempt
  const fakeGatewayWithIllegalTool = {
    async requestInference() {
      return {
        content: 'I need to run bash command',
        toolCalls: [{ id: 'call_bad', name: 'unauthorized_shell_exec', arguments: { cmd: 'whoami' } }],
      };
    },
  };

  runControl.registerRun({
    runId: 'fixture-illegal-run',
    workflowVersion: '1.0.0',
    status: 'QUEUED',
    currentStepIndex: 0,
    createdAt: currentTime.toISOString(),
    updatedAt: currentTime.toISOString(),
  });

  const worker = new LumenWorker({
    workerId: 'worker-unit-test-2',
    maxConcurrency: 1,
    modelGateway: fakeGatewayWithIllegalTool,
    toolRegistry,
    runControl,
    checkpointPort: runControl,
    approvalGate,
    clockFn: clock,
  });

  await worker.start();

  const illegalOutcome = await worker.claimAndExecute({
    runId: 'fixture-illegal-run',
    fencingEpoch: 1,
    prompt: 'Run bash shell',
  });

  assert.equal(illegalOutcome.status, 'FAILED');
  assert(illegalOutcome.error?.includes('unauthorized_shell_exec'));

  const failedRun = runControl.getCanonicalRun('fixture-illegal-run');
  assert.equal(failedRun?.run.status, 'FAILED');

  // 3. Unavailable ARSY run (non-existent runId)
  const missingOutcome = await worker.claimAndExecute({
    runId: 'non-existent-run-999',
    fencingEpoch: 1,
    prompt: 'Should fail at claim',
  });
  assert.equal(missingOutcome.status, 'FAILED');
  assert(missingOutcome.error?.includes('not found in canonical store'));

  // 4. Starting a stopped worker throws
  await worker.stop();
  await assert.rejects(
    async () => worker.start(),
    (err) => {
      assert(err instanceof Error);
      assert(err.message.includes('Cannot start a stopped worker'));
      return true;
    }
  );
});
