import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHandoffEnvelope, verifyAgentHandoff } from '../../scripts/planning/agent-handoff-validator.mjs';

const TODO = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../TODO.md'), 'utf8');

const VALID_ENVELOPE = {
  task_id: 'M29-05',
  baseline_sha: 'fee8334ee599c3c3b86d8cabe8389b2f7ab64f11',
  result_sha: 'worktree-only',
  worker: 'root integrator',
  claimed_paths: [
    'docs/planning/LOW_CONTEXT_AGENT_HANDOFF.md',
    'scripts/planning/agent-handoff-validator.mjs',
    'scripts/planning/task-lease-contract-check.mjs',
    'test/planning/agent-handoff.test.mjs',
    'docs/audit/M29-05-handoff.md'
  ],
  actual_changed_paths: [
    'test/planning/agent-handoff.test.mjs'
  ],
  positive_test: {
    command: 'node --test test/planning/agent-handoff.test.mjs',
    observed_output: 'The positive envelope test accepts M29-05 and binds the currently selected M28-13 successor; exact output is recorded in the audit.'
  },
  negative_test: {
    command: 'node --test --test-name-pattern=negative test/planning/agent-handoff.test.mjs',
    observed_output: 'Negative cases reject malformed/incomplete metadata, umbrella and unknown IDs, invalid paths, scope violations, invalid SHA, fabricated deployment, and false security/rights declarations.'
  },
  security_rights_privacy: {
    no_secrets: true,
    no_private_witness_leak: true,
    preserved_source_rights: true,
    no_fabricated_deployment: true
  },
  reviewer: 'Independent low-context receiver (see audit)',
  rollback_plan: 'Revert only test/planning/agent-handoff.test.mjs from this task result; preserve unrelated changes.',
  limitations: 'Local handoff verification only; the receiver separately checks predecessor evidence and successor eligibility; no live deployment is claimed.',
  next_eligible_task: 'M28-13'
};

test('positive: valid low-context handoff envelope is verified and binds an existing successor ID', () => {
  const result = verifyAgentHandoff(VALID_ENVELOPE, { todoMarkdown: TODO });
  assert.equal(result.ok, true);
  assert.equal(result.taskId, 'M29-05');
  assert.equal(result.nextEligibleTask, 'M28-13');
  assert.ok(result.verifiedAt);
});

test('negative: reject malformed evidence structures and non-string metadata', () => {
  assert.throws(() => createHandoffEnvelope({ ...VALID_ENVELOPE, claimed_paths: 'TODO.md' }), /structured object shapes/);
  assert.throws(() => createHandoffEnvelope({ ...VALID_ENVELOPE, worker: 42 }), /metadata must be strings/);
});

test('negative: reject incomplete envelope, umbrella task, scope breach, invalid SHA, and fabricated deployment', () => {
  // 1. Incomplete envelope (missing rollback_plan)
  const missingField = { ...VALID_ENVELOPE, rollback_plan: '' };
  assert.throws(() => verifyAgentHandoff(missingField, { todoMarkdown: TODO }), /HANDOFF_INCOMPLETE/);

  // 2. Umbrella task cannot be handed off
  const umbrellaTask = { ...VALID_ENVELOPE, task_id: 'M28-01' };
  assert.throws(() => verifyAgentHandoff(umbrellaTask, { todoMarkdown: TODO }), /CONTRACT_VIOLATION.*Cannot perform handoff for UMBRELLA task "M28-01"/);

  // 3. Out-of-scope write
  const scopeBreach = {
    ...VALID_ENVELOPE,
    actual_changed_paths: [...VALID_ENVELOPE.actual_changed_paths, 'apps/arsy/src/index.ts']
  };
  assert.throws(() => verifyAgentHandoff(scopeBreach, { todoMarkdown: TODO }), /OUT_OF_SCOPE_HANDOFF.*Actual changed paths exceed claimed scope/);
  const narrowerClaim = { ...VALID_ENVELOPE, claimed_paths: VALID_ENVELOPE.claimed_paths.map(claimed => `${claimed}/child`) };
  assert.throws(() => verifyAgentHandoff(narrowerClaim, { todoMarkdown: TODO }), /OUT_OF_SCOPE_HANDOFF/);

  // 4. Invalid baseline SHA format
  const badSha = { ...VALID_ENVELOPE, baseline_sha: 'invalid-sha' };
  assert.throws(() => verifyAgentHandoff(badSha, { todoMarkdown: TODO }), /INVALID_HANDOFF_METADATA/);

  // 5. Fabricated deployment claim rejected
  const fakeDeploy = {
    ...VALID_ENVELOPE,
    security_rights_privacy: { ...VALID_ENVELOPE.security_rights_privacy, no_fabricated_deployment: false }
  };
  assert.throws(() => verifyAgentHandoff(fakeDeploy, { todoMarkdown: TODO }), /UNVERIFIED_DEPLOYMENT_CLAIM/);

  // 6. Unknown task and successor IDs cannot be syntactically plausible substitutes.
  assert.throws(() => verifyAgentHandoff({ ...VALID_ENVELOPE, task_id: 'M88-88' }, { todoMarkdown: TODO }), /Unknown task_id/);
  assert.throws(() => verifyAgentHandoff({ ...VALID_ENVELOPE, next_eligible_task: 'M88-88' }, { todoMarkdown: TODO }), /Invalid next_eligible_task/);

  // 7. Rights and privacy declarations must all be affirmatively true.
  for (const field of ['no_secrets', 'no_private_witness_leak', 'preserved_source_rights']) {
    const unsafe = { ...VALID_ENVELOPE, security_rights_privacy: { ...VALID_ENVELOPE.security_rights_privacy, [field]: false } };
    assert.throws(() => verifyAgentHandoff(unsafe, { todoMarkdown: TODO }), /SECURITY_VIOLATION/);
    const wrongType = { ...VALID_ENVELOPE, security_rights_privacy: { ...VALID_ENVELOPE.security_rights_privacy, [field]: 'false' } };
    assert.throws(() => verifyAgentHandoff(wrongType, { todoMarkdown: TODO }), /SECURITY_VIOLATION/);
  }
  const falseDeploymentText = { ...VALID_ENVELOPE, security_rights_privacy: { ...VALID_ENVELOPE.security_rights_privacy, no_fabricated_deployment: 'false' } };
  assert.throws(() => verifyAgentHandoff(falseDeploymentText, { todoMarkdown: TODO }), /UNVERIFIED_DEPLOYMENT_CLAIM/);

  // 8. Paths cannot escape the repository or disguise traversal through prefixes.
  const traversal = { ...VALID_ENVELOPE, actual_changed_paths: ['docs/../TODO.md'] };
  assert.throws(() => verifyAgentHandoff(traversal, { todoMarkdown: TODO }), /safe repository-relative paths/);
  for (const unsafePath of ['/TODO.md', '\\TODO.md', 'docs\\TODO.md', 'C:/TODO.md']) {
    const unsafeClaim = { ...VALID_ENVELOPE, claimed_paths: [unsafePath] };
    assert.throws(() => verifyAgentHandoff(unsafeClaim, { todoMarkdown: TODO }), /safe repository-relative paths/);
  }
});
