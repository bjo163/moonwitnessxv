import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTaskRegister } from '../../scripts/planning/task-register-validator.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDirectory, '../..');
const fixtureRoot = 'test/planning/fixtures/task-register';
const fixturePath = name => `${fixtureRoot}/${name}`;

function readFixture(name) {
  return fs.readFileSync(path.join(root, fixturePath(name)), 'utf8');
}

function markdown(name) {
  return { path: fixturePath(name), content: readFixture(name) };
}

function codesAt(result) {
  return result.errors.map(({ code, line }) => `${code}:${line}`);
}

test('positive fixture: valid IDs, task/milestone/range dependencies and local links pass', () => {
  const todoMarkdown = readFixture('valid-todo.md');
  const markdownFiles = [
    { path: fixturePath('valid-todo.md'), content: todoMarkdown },
    markdown('valid-links.md'),
    markdown('folder/README.md'),
  ];
  const before = markdownFiles.map(file => [file.path, file.content]);

  const result = validateTaskRegister({
    todoMarkdown,
    todoPath: fixturePath('valid-todo.md'),
    markdownFiles,
    root,
  });

  assert.deepEqual(result, { ok: true, taskCount: 4, errors: [] });
  assert.deepEqual(markdownFiles.map(file => [file.path, file.content]), before);
  for (const file of markdownFiles) assert.equal(readFixture(file.path.slice(fixtureRoot.length + 1)), file.content);
});

test('negative ID fixture: duplicate and malformed IDs return stable line diagnostics', () => {
  const todoMarkdown = readFixture('invalid-task-ids.md');
  const result = validateTaskRegister({ todoMarkdown, todoPath: fixturePath('invalid-task-ids.md'), root });

  assert.equal(result.ok, false);
  assert.deepEqual(codesAt(result), ['TASK_ID_DUPLICATE:4', 'TASK_ID_INVALID:5']);
  assert.equal(readFixture('invalid-task-ids.md'), todoMarkdown, 'validator must not mutate the fixture');
});

test('negative dependency fixture: rejects self, cyclic, unresolved and malformed references', () => {
  const todoMarkdown = readFixture('invalid-dependencies.md');
  const result = validateTaskRegister({ todoMarkdown, todoPath: fixturePath('invalid-dependencies.md'), root });

  assert.equal(result.ok, false);
  assert.deepEqual(codesAt(result), [
    'DEPENDENCY_SELF:3',
    'DEPENDENCY_INVALID:6',
    'DEPENDENCY_INVALID:7',
    'DEPENDENCY_INVALID:8',
    'DEPENDENCY_INVALID:9',
    'DEPENDENCY_INVALID:10',
    'DEPENDENCY_CYCLE:3',
    'DEPENDENCY_CYCLE:4',
  ]);
  assert.equal(readFixture('invalid-dependencies.md'), todoMarkdown, 'validator must not mutate the fixture');
});

test('negative Markdown fixture: rejects missing targets/fragments, malformed paths, escapes, and unsafe schemes', () => {
  const source = markdown('invalid-links.md');
  const markdownFiles = [source, markdown('valid-links.md')];
  const before = markdownFiles.map(file => [file.path, file.content]);
  const result = validateTaskRegister({
    todoMarkdown: readFixture('valid-todo.md'),
    todoPath: fixturePath('valid-todo.md'),
    markdownFiles,
    root,
  });

  assert.equal(result.ok, false);
  assert.deepEqual(codesAt(result), [
    'LINK_MISSING:3',
    'LINK_FRAGMENT_MISSING:4',
    'LINK_MALFORMED:5',
    'LINK_UNSAFE:6',
    'LINK_UNSAFE:7',
  ]);
  assert.deepEqual(markdownFiles.map(file => [file.path, file.content]), before);
  assert.equal(readFixture('invalid-links.md'), source.content, 'validator must not mutate the fixture');
});
