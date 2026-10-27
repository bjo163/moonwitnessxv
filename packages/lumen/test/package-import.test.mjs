import test from 'node:test';
import assert from 'node:assert/strict';

test('positive: @moonwitness/lumen exports documented public entries and ports', async () => {
  const lumen = await import('../dist/index.js');

  // Verify exported sets and constants
  assert.ok(lumen.VALID_RUN_STATES.has('RUNNING'));
  assert.ok(lumen.TERMINAL_RUN_STATES.has('COMPLETED'));
  assert.equal(typeof lumen.MAX_STEP_PAYLOAD_BYTES, 'number');

  // Verify exported validation functions
  assert.equal(typeof lumen.validateRunTransition, 'function');
  assert.equal(typeof lumen.validateLease, 'function');
  assert.equal(typeof lumen.validateStepPayload, 'function');
  assert.equal(typeof lumen.validateApprovalResume, 'function');
  assert.equal(typeof lumen.validateCheckpointVersion, 'function');

  // Verify transition execution
  assert.equal(lumen.validateRunTransition('QUEUED', 'CLAIMED'), true);
  assert.equal(lumen.validateRunTransition('CLAIMED', 'RUNNING'), true);

  // Demonstrate mock implementation of port interfaces without side effects
  const mockGateway = {
    async requestInference(req) {
      return { content: `Echo: ${req.messages[0]?.content}` };
    }
  };
  const mockResponse = await mockGateway.requestInference({
    messages: [{ role: 'user', content: 'test ping' }]
  });
  assert.equal(mockResponse.content, 'Echo: test ping');
});

test('negative: importing package causes no network/timer/server side effects and rejects invalid inputs', async () => {
  // Capture active handles before and after import
  const handles = typeof process._getActiveHandles === 'function' ? process._getActiveHandles() : [];
  const lumen = await import('../dist/index.js');
  const postHandles = typeof process._getActiveHandles === 'function' ? process._getActiveHandles() : [];

  // No new timers, sockets, or servers created merely by importing
  assert.equal(
    postHandles.length,
    handles.length,
    'Importing @moonwitness/lumen must not create lingering handles or background loops'
  );

  // Contract rejection checks
  assert.throws(
    () => lumen.validateRunTransition('QUEUED', 'COMPLETED'),
    /INVALID_RUN_STATE_TRANSITION/
  );
  assert.throws(
    () => lumen.validateRunTransition('COMPLETED', 'RUNNING'),
    /INVALID_RUN_STATE_TRANSITION/
  );
  assert.throws(
    () => lumen.validateCheckpointVersion('3.0.0', '1.0.0'),
    /INCOMPATIBLE_CHECKPOINT_VERSION/
  );
});
