/**
 * MoonWitness XV — Low-Context Agent Handoff Validator (M29-05)
 *
 * Verifies that a low-context task handoff envelope satisfies all
 * contract, scope, leaf-only, positive/negative evidence, and security rules.
 */

import { getTaskRole, parseAndClassifyTodo } from './task-classifier.mjs';

const REQUIRED_FIELDS = [
  'task_id',
  'baseline_sha',
  'result_sha',
  'worker',
  'claimed_paths',
  'actual_changed_paths',
  'positive_test',
  'negative_test',
  'security_rights_privacy',
  'reviewer',
  'rollback_plan',
  'limitations',
  'next_eligible_task'
];

function isWithinClaim(actualPath, claimedPath) {
  return actualPath === claimedPath || actualPath.startsWith(`${claimedPath}/`);
}

function isSafeRepoPath(value) {
  return typeof value === 'string' && value.length > 0 &&
    !value.startsWith('/') && !value.startsWith('\\') && !/^[a-z]:/i.test(value) &&
    !value.includes('\\') && value.split('/').every(segment => segment && segment !== '.' && segment !== '..');
}

/**
 * Validates and normalizes a handoff envelope object.
 */
export function createHandoffEnvelope(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('HANDOFF_INCOMPLETE: Envelope must be an object');
  }

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new Error(`HANDOFF_INCOMPLETE: Missing required field "${field}"`);
    }
  }
  if (!Array.isArray(data.claimed_paths) || !Array.isArray(data.actual_changed_paths) ||
      typeof data.positive_test !== 'object' || data.positive_test === null || Array.isArray(data.positive_test) ||
      typeof data.negative_test !== 'object' || data.negative_test === null || Array.isArray(data.negative_test) ||
      typeof data.security_rights_privacy !== 'object' || data.security_rights_privacy === null ||
      Array.isArray(data.security_rights_privacy)) {
    throw new Error('HANDOFF_INCOMPLETE: Path, test, and security evidence must use their structured object shapes');
  }
  for (const field of ['task_id', 'baseline_sha', 'result_sha', 'worker', 'reviewer', 'rollback_plan', 'limitations', 'next_eligible_task']) {
    if (typeof data[field] !== 'string') throw new Error('HANDOFF_INCOMPLETE: Required metadata must be strings');
  }

  return { ...data };
}

/**
 * Verifies a handoff envelope against the multi-agent contract rules.
 */
export function verifyAgentHandoff(envelope, { todoMarkdown } = {}) {
  // 1. Completeness validation
  const validEnvelope = createHandoffEnvelope(envelope);
  if (typeof todoMarkdown !== 'string') {
    throw new Error('HANDOFF_INCOMPLETE: todoMarkdown is required to verify task IDs');
  }
  const tasks = parseAndClassifyTodo(todoMarkdown);
  const tasksById = new Map(tasks.map(task => [task.id, task]));

  // 2. Leaf-only validation
  const role = getTaskRole(validEnvelope.task_id);
  if (!tasksById.has(validEnvelope.task_id)) {
    throw new Error(`INVALID_HANDOFF_METADATA: Unknown task_id "${validEnvelope.task_id}"`);
  }
  if (role === 'UMBRELLA') {
    throw new Error(
      `CONTRACT_VIOLATION: Cannot perform handoff for UMBRELLA task "${validEnvelope.task_id}". Only LEAF tasks can be handed off.`
    );
  }

  // 3. Baseline & Result SHA formatting
  const shaRegex = /^[a-f0-9]{40}$/i;
  if (!shaRegex.test(validEnvelope.baseline_sha)) {
    throw new Error(`INVALID_HANDOFF_METADATA: baseline_sha must be a 40-character hex string: "${validEnvelope.baseline_sha}"`);
  }
  if (validEnvelope.result_sha !== 'worktree-only' && !shaRegex.test(validEnvelope.result_sha)) {
    throw new Error(`INVALID_HANDOFF_METADATA: result_sha must be a 40-character hex string or "worktree-only": "${validEnvelope.result_sha}"`);
  }

  // 4. Test evidence presence
  if (typeof validEnvelope.positive_test.command !== 'string' || !validEnvelope.positive_test.command ||
      typeof validEnvelope.positive_test.observed_output !== 'string' || !validEnvelope.positive_test.observed_output) {
    throw new Error('HANDOFF_INCOMPLETE: positive_test must contain command and observed_output');
  }
  if (typeof validEnvelope.negative_test.command !== 'string' || !validEnvelope.negative_test.command ||
      typeof validEnvelope.negative_test.observed_output !== 'string' || !validEnvelope.negative_test.observed_output) {
    throw new Error('HANDOFF_INCOMPLETE: negative_test must contain command and observed_output');
  }

  // 5. Path scope confinement
  if (!Array.isArray(validEnvelope.claimed_paths) || !Array.isArray(validEnvelope.actual_changed_paths) ||
      !validEnvelope.claimed_paths.length || !validEnvelope.actual_changed_paths.length ||
      !validEnvelope.claimed_paths.every(isSafeRepoPath) || !validEnvelope.actual_changed_paths.every(isSafeRepoPath)) {
    throw new Error('INVALID_HANDOFF_METADATA: paths must be safe repository-relative paths');
  }
  const outside = validEnvelope.actual_changed_paths.filter(
    actual => !validEnvelope.claimed_paths.some(claimed => isWithinClaim(actual, claimed))
  );
  if (outside.length > 0) {
    throw new Error(`OUT_OF_SCOPE_HANDOFF: Actual changed paths exceed claimed scope: ${outside.join(', ')}`);
  }

  // 6. Security and deployment claim invariants
  const srp = validEnvelope.security_rights_privacy;
  if (!srp || typeof srp !== 'object' || Array.isArray(srp) ||
      srp.no_secrets !== true || srp.no_private_witness_leak !== true || srp.preserved_source_rights !== true) {
    throw new Error('SECURITY_VIOLATION: Security, privacy, and source-rights invariants must all be affirmed');
  }
  if (srp.no_fabricated_deployment !== true) {
    throw new Error('UNVERIFIED_DEPLOYMENT_CLAIM: Envelope falsely claims unobserved live deployment');
  }

  // 7. Successor validation
  const nextRole = getTaskRole(validEnvelope.next_eligible_task);
  if (!nextRole || !tasksById.has(validEnvelope.next_eligible_task)) {
    throw new Error(`INVALID_HANDOFF_METADATA: Invalid next_eligible_task "${validEnvelope.next_eligible_task}"`);
  }

  return {
    ok: true,
    taskId: validEnvelope.task_id,
    worker: validEnvelope.worker,
    baselineSha: validEnvelope.baseline_sha,
    resultSha: validEnvelope.result_sha,
    nextEligibleTask: validEnvelope.next_eligible_task,
    verifiedAt: new Date().toISOString()
  };
}
