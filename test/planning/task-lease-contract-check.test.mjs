import test from 'node:test';
import assert from 'node:assert/strict';
import { claimTask, validateReportedPaths } from '../../scripts/planning/task-lease-contract-check.mjs';

const baselineSha = '2a3aaf16a19a01264de6f1cab4079a1ea65f6cec';
const claim = (taskId, worker, extra = {}) => claimTask(taskId, {
  worker,
  baselineSha,
  completed: ['M29-01', 'M29-02', 'M29-03'],
  claims: [],
  ...extra
});

test('positive: eligible leaf claim records worker, baseline, exclusive scope and validates its report', () => {
  const lease = claim('M29-02', 'worker-a', { completed: ['M29-01'] });
  assert.equal(lease.state, 'CLAIMED');
  assert.equal(lease.baselineSha, baselineSha);
  assert.deepEqual(lease.paths, [
    'docs/planning/MULTI_AGENT_TASK_LEASE_CONTRACT.md',
    'scripts/planning/task-lease-contract-check.mjs',
    'test/planning/task-lease-contract-check.test.mjs',
    'docs/audit/M29-02-multi-agent-lease-contract.md'
  ]);
  assert.equal(validateReportedPaths(lease, lease.paths), true);
});

test('positive: independent eligible leaves can run with disjoint scopes', () => {
  const first = claim('M29-02', 'worker-a', { completed: ['M29-01'] });
  const second = claimTask('M29-03', {
    worker: 'worker-b', baselineSha, completed: ['M29-01', 'M29-02'], claims: [first]
  });
  assert.notDeepEqual(first.paths, second.paths);
});

test('positive: validator task scope metadata matches artifacts and remains nonoverlapping', () => {
  const validator = claim('M29-03', 'worker-validator');
  const fixtures = claim('M29-04', 'worker-fixtures');

  assert.deepEqual(validator.paths, [
    'docs/planning/TASK_REGISTER_VALIDATOR.md',
    'scripts/planning/task-register-validator.mjs',
    'test/planning/task-register-validator.test.mjs',
    'docs/audit/M29-03-task-register-validator.md'
  ]);
  assert.deepEqual(fixtures.paths, [
    'test/planning/task-register-invalid-fixtures.test.mjs',
    'test/planning/fixtures/task-register',
    'docs/audit/M29-04-invalid-fixtures.md'
  ]);
  assert.equal(validator.paths.some(path => fixtures.paths.includes(path)), false);
  assert.equal(validateReportedPaths(validator, validator.paths), true);
  assert.equal(validateReportedPaths(fixtures, fixtures.paths), true);
});

test('negative: reject umbrella, duplicate task, unmet dependency, one worker double claim, and out-of-scope writes', () => {
  assert.throws(() => claim('M28-01', 'worker-a'), /CONTRACT_VIOLATION/);
  const first = claim('M29-02', 'worker-a', { completed: ['M29-01'] });
  assert.throws(() => claimTask('M29-02', {
    worker: 'worker-b', baselineSha, completed: ['M29-01'], claims: [first]
  }), /SCOPE_CONFLICT/);
  assert.throws(() => claimTask('M29-03', {
    worker: 'worker-b', baselineSha, completed: ['M29-01'], claims: []
  }), /DEPENDENCY_NOT_VERIFIED/);
  assert.throws(() => claimTask('M29-03', {
    worker: 'worker-a', baselineSha, completed: ['M29-01', 'M29-02'], claims: [first]
  }), /WORKER_ALREADY_HAS_ACTIVE_CLAIM/);
  assert.throws(() => validateReportedPaths(first, ['TODO.md']), /OUT_OF_SCOPE_WRITE/);
});
