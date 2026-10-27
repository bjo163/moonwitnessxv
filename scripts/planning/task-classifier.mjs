import fs from 'node:fs';

/**
 * MoonWitness XV — Task Granularity & Role Classifier (M29-01)
 *
 * Classifies every task in TODO.md into LEAF or UMBRELLA according to
 * monorepo architecture rules and AI execution contracts.
 */

export const UMBRELLA_TASKS = new Set([
  // M19 Frontend/A11y roll-ups (subdivided into M19-08..35)
  'M19-01', 'M19-02', 'M19-03', 'M19-04', 'M19-05', 'M19-06', 'M19-07',
  // M27 Full-stack acceptance roll-ups (subdivided into M27-08..19)
  'M27-01', 'M27-02', 'M27-03', 'M27-04', 'M27-05', 'M27-06', 'M27-07',
  // M28 ARSY Hub rename acceptance roll-ups (subdivided into M28-08..15)
  'M28-01', 'M28-02', 'M28-03', 'M28-04', 'M28-05', 'M28-06', 'M28-07'
]);

export const UMBRELLA_CHILD_MAP = {
  'M28-01': ['M28-08', 'M28-09'],
  'M28-02': ['M28-08', 'M28-09'],
  'M28-03': ['M28-10'],
  'M28-04': ['M28-11'],
  'M28-05': ['M28-12'],
  'M28-06': ['M28-13', 'M28-14'],
  'M28-07': ['M28-15'],
  'M19-01': ['M19-08', 'M19-09', 'M19-10', 'M19-11'],
  'M19-02': ['M19-12', 'M19-13', 'M19-14', 'M19-15'],
  'M19-03': ['M19-16', 'M19-17', 'M19-18', 'M19-19'],
  'M19-04': ['M19-20', 'M19-21', 'M19-22', 'M19-23'],
  'M19-05': ['M19-24', 'M19-25', 'M19-26', 'M19-27'],
  'M19-06': ['M19-28', 'M19-29', 'M19-30', 'M19-31'],
  'M19-07': ['M19-32', 'M19-33', 'M19-34', 'M19-35'],
  'M27-01': ['M27-08', 'M27-09'],
  'M27-02': ['M27-10', 'M27-11'],
  'M27-03': ['M27-12'],
  'M27-04': ['M27-13', 'M27-14'],
  'M27-05': ['M27-15', 'M27-16'],
  'M27-06': ['M27-17', 'M27-18'],
  'M27-07': ['M27-19']
};

/**
 * Returns role for a valid task ID: 'UMBRELLA' or 'LEAF'.
 */
export function getTaskRole(taskId) {
  if (typeof taskId !== 'string' || !/^[A-Z0-9]+-[0-9]+$/.test(taskId)) {
    throw new Error(`Invalid task ID format: "${taskId}"`);
  }
  return UMBRELLA_TASKS.has(taskId) ? 'UMBRELLA' : 'LEAF';
}

/**
 * Parses markdown TODO content and classifies all tasks.
 */
export function parseAndClassifyTodo(todoMarkdown) {
  const taskRegex = /\|\s*-\s*\[([ x])\]\s*\|\s*\*\*([A-Z0-9]+-[0-9]+)\*\*\s*(?:—|-)?\s*([^|]+)?\|\s*([^|]+)?\|\s*([^|]+)?\|\s*([^|]+)?\|\s*([^|]+)?\|/g;
  const tasks = [];
  let match;

  while ((match = taskRegex.exec(todoMarkdown)) !== null) {
    const [, checked, id, title, priority, difficulty, dependsOn, acceptance] = match;
    const role = getTaskRole(id);
    tasks.push({
      id,
      checked: checked === 'x',
      title: title ? title.trim() : '',
      priority: priority ? priority.trim() : '',
      difficulty: difficulty ? difficulty.trim() : '',
      dependsOn: dependsOn ? dependsOn.trim() : '',
      acceptance: acceptance ? acceptance.trim() : '',
      role
    });
  }

  return tasks;
}

/**
 * Validates whether a claim of a task conforms to the execution contract.
 * - An umbrella task cannot be claimed as an atomic implementation leaf.
 * - Unknown tasks are rejected.
 * - An agent cannot claim both parent umbrella and child leaf simultaneously.
 */
export function validateTaskClaim(claimedTaskId, { asLeaf = true, existingClaims = [], todoMarkdown } = {}) {
  const register = todoMarkdown ?? fs.readFileSync(new URL('../../TODO.md', import.meta.url), 'utf8');
  const tasks = parseAndClassifyTodo(register);
  if (!tasks.some(task => task.id === claimedTaskId)) {
    throw new Error(`UNKNOWN_TASK: Task "${claimedTaskId}" is not present in TODO.md`);
  }
  const role = getTaskRole(claimedTaskId);

  if (asLeaf && role === 'UMBRELLA') {
    throw new Error(
      `CONTRACT_VIOLATION: Cannot claim UMBRELLA task "${claimedTaskId}" as an executable leaf. Implement child leaves instead.`
    );
  }

  for (const existingId of existingClaims) {
    // Check if claimed is child of existing umbrella claim
    const childList = UMBRELLA_CHILD_MAP[existingId] || [];
    if (childList.includes(claimedTaskId)) {
      throw new Error(
        `CONFLICT_VIOLATION: Cannot claim child leaf "${claimedTaskId}" when parent umbrella "${existingId}" is already held.`
      );
    }
    // Check if claimed is parent of existing child claim
    const reverseChildList = UMBRELLA_CHILD_MAP[claimedTaskId] || [];
    if (reverseChildList.includes(existingId)) {
      throw new Error(
        `CONFLICT_VIOLATION: Cannot claim parent umbrella "${claimedTaskId}" when child leaf "${existingId}" is already held.`
      );
    }
  }

  return { ok: true, taskId: claimedTaskId, role };
}
