import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ApprovalGateAdapter,
  LumenApprovalError,
} from '../dist/index.js';

test('positive: human approval pause, decision, and exact argument resume flow', async () => {
  let currentTime = new Date('2026-10-27T12:00:00Z');
  const clock = () => currentTime;

  const adapter = new ApprovalGateAdapter({ clockFn: clock, defaultTtlMs: 10 * 60 * 1000 });

  const runId = 'run-approval-pos';
  const toolCall = {
    name: 'deploy_telemetry_patch',
    arguments: { patchId: 'PATCH-99', cluster: 'node-eu-west' },
  };

  // 1. Request approval
  const req = await adapter.requestApproval(runId, toolCall, {
    toolVersion: '1.2.0',
    requiredRole: '100CENTER_OPERATOR',
  });

  assert.ok(req.token.startsWith('appr_'));
  assert.equal(req.expiresAt, '2026-10-27T12:10:00.000Z');

  // 2. Status is pending
  const initialStatus = await adapter.checkApprovalStatus(req.token);
  assert.equal(initialStatus, 'PENDING');

  // 3. Authorized operator reviews and approves
  currentTime = new Date('2026-10-27T12:02:00Z');
  await adapter.submitDecision(req.token, 'APPROVED', {
    decidedBy: 'operator_human_42',
    approverRole: '100CENTER_OPERATOR',
  });

  const updatedStatus = await adapter.checkApprovalStatus(req.token);
  assert.equal(updatedStatus, 'APPROVED');

  // 4. Resume validation passes with exact arguments
  const resumeOk = await adapter.validateAndConsumeApproval({
    token: req.token,
    runId,
    toolName: 'deploy_telemetry_patch',
    arguments: { patchId: 'PATCH-99', cluster: 'node-eu-west' },
  });

  assert.equal(resumeOk, true);

  const record = adapter.getRecord(req.token);
  assert.equal(record?.consumed, true);
});

test('negative: rejects self-approval, insufficient roles, replays, tampering, expiration, and mismatch', async () => {
  let currentTime = new Date('2026-10-27T12:00:00Z');
  const clock = () => currentTime;

  const adapter = new ApprovalGateAdapter({ clockFn: clock, defaultTtlMs: 5 * 60 * 1000 });

  const runId = 'run-approval-neg';
  const toolCall = {
    name: 'publish_security_advisory',
    arguments: { advisoryId: 'ADV-101', severity: 'CRITICAL' },
  };

  const req = await adapter.requestApproval(runId, toolCall, {
    requiredRole: '100CENTER_OPERATOR',
  });

  // 1. Self-approval by AI agent / model is strictly rejected
  await assert.rejects(
    async () =>
      adapter.submitDecision(req.token, 'APPROVED', {
        decidedBy: 'model-gemini-2.5-flash',
        approverRole: '100CENTER_OPERATOR',
      }),
    (err) => {
      assert(err instanceof LumenApprovalError);
      assert.equal(err.code, 'SELF_APPROVAL_PROHIBITED');
      return true;
    }
  );

  // 2. Insufficient role rejected
  await assert.rejects(
    async () =>
      adapter.submitDecision(req.token, 'APPROVED', {
        decidedBy: 'viewer_guest_user',
        approverRole: 'GUEST_VIEWER',
      }),
    (err) => {
      assert(err instanceof LumenApprovalError);
      assert.equal(err.code, 'INSUFFICIENT_PERMISSIONS');
      return true;
    }
  );

  // 3. Proper operator approves
  await adapter.submitDecision(req.token, 'APPROVED', {
    decidedBy: 'human_operator_sandra',
    approverRole: '100CENTER_OPERATOR',
  });

  // 4. Argument tampering rejected: attacker modified severity from CRITICAL to LOW
  await assert.rejects(
    async () =>
      adapter.validateAndConsumeApproval({
        token: req.token,
        runId,
        toolName: 'publish_security_advisory',
        arguments: { advisoryId: 'ADV-101', severity: 'LOW' }, // Altered!
      }),
    (err) => {
      assert(err instanceof LumenApprovalError);
      assert.equal(err.code, 'ARGUMENT_HASH_MISMATCH');
      return true;
    }
  );

  // 5. Tool name mismatch rejected
  await assert.rejects(
    async () =>
      adapter.validateAndConsumeApproval({
        token: req.token,
        runId,
        toolName: 'delete_database_table', // Wrong tool!
        arguments: { advisoryId: 'ADV-101', severity: 'CRITICAL' },
      }),
    (err) => {
      assert(err instanceof LumenApprovalError);
      assert.equal(err.code, 'TOOL_NAME_MISMATCH');
      return true;
    }
  );

  // 6. Run ID mismatch rejected
  await assert.rejects(
    async () =>
      adapter.validateAndConsumeApproval({
        token: req.token,
        runId: 'different-run-id', // Wrong run!
        toolName: 'publish_security_advisory',
        arguments: { advisoryId: 'ADV-101', severity: 'CRITICAL' },
      }),
    (err) => {
      assert(err instanceof LumenApprovalError);
      assert.equal(err.code, 'RUN_ID_MISMATCH');
      return true;
    }
  );

  // 7. Legitimate resume succeeds
  const success = await adapter.validateAndConsumeApproval({
    token: req.token,
    runId,
    toolName: 'publish_security_advisory',
    arguments: { advisoryId: 'ADV-101', severity: 'CRITICAL' },
  });
  assert.equal(success, true);

  // 8. Replay attack: consuming again is rejected
  await assert.rejects(
    async () =>
      adapter.validateAndConsumeApproval({
        token: req.token,
        runId,
        toolName: 'publish_security_advisory',
        arguments: { advisoryId: 'ADV-101', severity: 'CRITICAL' },
      }),
    (err) => {
      assert(err instanceof LumenApprovalError);
      assert.equal(err.code, 'APPROVAL_ALREADY_CONSUMED');
      return true;
    }
  );

  // 9. Expired request test
  const expReq = await adapter.requestApproval(runId, toolCall, { ttlMs: 1000 });
  currentTime = new Date(currentTime.getTime() + 5000); // Fast forward 5s

  const expStatus = await adapter.checkApprovalStatus(expReq.token);
  assert.equal(expStatus, 'EXPIRED');

  await assert.rejects(
    async () =>
      adapter.submitDecision(expReq.token, 'APPROVED', {
        decidedBy: 'human_operator_sandra',
        approverRole: '100CENTER_OPERATOR',
      }),
    (err) => {
      assert(err instanceof LumenApprovalError);
      assert.equal(err.code, 'APPROVAL_EXPIRED');
      return true;
    }
  );
});
