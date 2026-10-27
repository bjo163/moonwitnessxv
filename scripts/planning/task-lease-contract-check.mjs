import { validateTaskClaim } from './task-classifier.mjs';

const TASKS = new Map([
  ['M29-02', { dependencies: ['M29-01'], paths: ['docs/planning/MULTI_AGENT_TASK_LEASE_CONTRACT.md'] }],
  ['M29-03', { dependencies: ['M29-02'], paths: ['scripts/planning/task-validator.mjs'] }],
  ['M29-04', { dependencies: ['M29-03'], paths: ['test/planning/task-validator.test.mjs'] }],
  ['M29-05', { dependencies: ['M29-04'], paths: ['docs/audit/M29-05-handoff.md', 'docs/planning/LOW_CONTEXT_AGENT_HANDOFF.md', 'scripts/planning/agent-handoff-validator.mjs', 'scripts/planning/task-lease-contract-check.mjs', 'test/planning/agent-handoff.test.mjs'] }]
]);

function overlaps(left, right) {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

export function claimTask(taskId, { worker, baselineSha, completed = [], claims = [] }) {
  validateTaskClaim(taskId, { asLeaf: true, existingClaims: claims.map(claim => claim.taskId) });
  const task = TASKS.get(taskId);
  if (!task) throw new Error(`UNKNOWN_TASK: ${taskId}`);
  if (!worker || !baselineSha) throw new Error('CLAIM_METADATA_REQUIRED');
  const missing = task.dependencies.filter(dependency => !completed.includes(dependency));
  if (missing.length) throw new Error(`DEPENDENCY_NOT_VERIFIED: ${missing.join(',')}`);
  if (claims.some(claim => claim.paths.some(path => task.paths.some(candidate => overlaps(path, candidate))))) {
    throw new Error('SCOPE_CONFLICT');
  }
  if (claims.some(claim => claim.worker === worker)) throw new Error('WORKER_ALREADY_HAS_ACTIVE_CLAIM');
  return { taskId, worker, baselineSha, paths: [...task.paths], state: 'CLAIMED' };
}

export function validateReportedPaths(claim, changedPaths) {
  const outside = changedPaths.filter(path => !claim.paths.some(allowed => overlaps(path, allowed)));
  if (outside.length) throw new Error(`OUT_OF_SCOPE_WRITE: ${outside.join(',')}`);
  return true;
}
