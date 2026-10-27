import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  UMBRELLA_TASKS,
  UMBRELLA_CHILD_MAP,
  getTaskRole,
  parseAndClassifyTodo,
  validateTaskClaim
} from '../../scripts/planning/task-classifier.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

test('positive: classify all 360 tasks in TODO.md into LEAF and UMBRELLA', () => {
  const todoPath = path.join(REPO_ROOT, 'TODO.md');
  const todoContent = fs.readFileSync(todoPath, 'utf8');

  const tasks = parseAndClassifyTodo(todoContent);
  assert.equal(tasks.length, 360, 'TODO.md must contain exactly 360 task rows');

  const uniqueIds = new Set(tasks.map(t => t.id));
  assert.equal(uniqueIds.size, 360, 'All 360 task IDs must be unique');

  const umbrellas = tasks.filter(t => t.role === 'UMBRELLA');
  const leaves = tasks.filter(t => t.role === 'LEAF');

  assert.deepEqual(
    Object.keys(UMBRELLA_CHILD_MAP).sort(),
    [...UMBRELLA_TASKS].sort(),
    'Every umbrella must have exactly one child mapping and there must be no extra mappings'
  );

  assert.equal(umbrellas.length, 21, 'There must be exactly 21 UMBRELLA tasks (7 in M19, 7 in M27, 7 in M28)');
  assert.equal(leaves.length, 339, 'There must be exactly 339 LEAF tasks');

  // Verify all umbrellas have defined child leaves
  for (const umbrella of umbrellas) {
    const children = UMBRELLA_CHILD_MAP[umbrella.id];
    assert.ok(children && children.length > 0, `Umbrella ${umbrella.id} must have mapped child leaves`);
    for (const childId of children) {
      const child = tasks.find(task => task.id === childId);
      assert.ok(child, `Mapped child ${childId} for ${umbrella.id} must exist in TODO.md`);
      assert.equal(child.role, 'LEAF', `Mapped child ${childId} for ${umbrella.id} must be a leaf`);
      assert.equal(child.id.split('-')[0], umbrella.id.split('-')[0], `Mapped child ${childId} must share its parent's milestone`);
    }
  }

  // Verify legitimate leaf claims succeed
  const claimLeaf1 = validateTaskClaim('M29-01', { asLeaf: true });
  assert.equal(claimLeaf1.ok, true);
  assert.equal(claimLeaf1.role, 'LEAF');

  const claimLeaf2 = validateTaskClaim('M41-01', { asLeaf: true });
  assert.equal(claimLeaf2.ok, true);
  assert.equal(claimLeaf2.role, 'LEAF');
});

test('negative: reject invalid task claims, umbrella execution, and conflicting parent-child claims', () => {
  // 1. Attempting to claim an UMBRELLA task as an executable leaf must fail
  assert.throws(
    () => validateTaskClaim('M28-01', { asLeaf: true }),
    /CONTRACT_VIOLATION.*Cannot claim UMBRELLA task "M28-01" as an executable leaf/
  );
  assert.throws(
    () => validateTaskClaim('M19-01', { asLeaf: true }),
    /CONTRACT_VIOLATION.*Cannot claim UMBRELLA task "M19-01" as an executable leaf/
  );
  assert.throws(
    () => validateTaskClaim('M27-01', { asLeaf: true }),
    /CONTRACT_VIOLATION.*Cannot claim UMBRELLA task "M27-01" as an executable leaf/
  );

  // 2. Malformed or invalid task IDs must fail format validation
  assert.throws(() => getTaskRole('NOT_A_TASK'), /Invalid task ID format/);
  assert.throws(() => getTaskRole(''), /Invalid task ID format/);
  assert.throws(() => getTaskRole(123), /Invalid task ID format/);
  assert.throws(() => validateTaskClaim('M99-99'), /UNKNOWN_TASK.*not present in TODO\.md/);

  // 3. Attempting to claim child leaf when parent umbrella is already held must fail
  assert.throws(
    () => validateTaskClaim('M28-08', { asLeaf: true, existingClaims: ['M28-01'] }),
    /CONFLICT_VIOLATION.*Cannot claim child leaf "M28-08" when parent umbrella "M28-01" is already held/
  );

  // 4. Attempting to claim parent umbrella when child leaf is already held must fail
  assert.throws(
    () => validateTaskClaim('M28-01', { asLeaf: false, existingClaims: ['M28-08'] }),
    /CONFLICT_VIOLATION.*Cannot claim parent umbrella "M28-01" when child leaf "M28-08" is already held/
  );
});
