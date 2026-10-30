import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskRegister } from '../../scripts/planning/task-register-validator.mjs';

const root = 'C:/fixture/repo';
const todo = `| Status | Task | Priority | Difficulty | Depends on | Acceptance |
|---|---|---|---|---|---|
| - [x] | **M01-01** — First | P0 | D1 | — | [guide](docs/guide.md#start) |
| - [ ] | **M01-02** — Second | P1 | D1 | M01-01 | [same](docs/guide.md#start) |
| - [ ] | **M01-03** — Third | P1 | D1 | M01-01..02 | [external](https://example.com) |
| - [ ] | **M02-01** — Fourth | P1 | D1 | M01 | [mail](mailto:team@example.com) |`;
const docs = [
  { path: 'TODO.md', content: todo },
  { path: 'docs/guide.md', content: '# Start\n\nSee [home](../README.md#home), [self](#start), [encoded](source%20file.ts?raw=1), [hash-name](source%23file.ts), [question-name](source%3Ffile.ts), and [root](/README.md#home).\n' },
  { path: 'docs/source file.ts', content: undefined },
  { path: 'docs/source#file.ts', content: undefined },
  { path: 'docs/source?file.ts', content: undefined },
  { path: 'README.md', content: '# Home\n' },
];

test('positive: accepts unique TODO IDs, task/milestone/range dependencies, and valid local/external links', () => {
  const result = validateTaskRegister({ todoMarkdown: todo, markdownFiles: docs, root });
  assert.deepEqual(result, { ok: true, taskCount: 4, errors: [] });
});

test('negative: reports malformed/duplicate IDs, missing dependencies, cycles, and broken local paths/fragments', () => {
  const invalidTodo = `| Status | Task | Priority | Difficulty | Depends on | Acceptance |
|---|---|---|---|---|---|
| - [ ] | **M01-01** — First | P0 | D1 | M01-02,M09 | [bad](missing.md) |
| - [ ] | **M01-03** — Duplicate | P0 | D1 | — | [fragment](README.md#absent) |
| - [ ] | **NOPE** — Malformed | P0 | D1 | M01-01 | [escape](../private.md) |
| - [ ] | **M01-02** — Second | P1 | D1 | M01-01 | [encoded](bad%ZZ.md) |
| - [ ] | **M01-03** — Duplicate again | P0 | D1 | — | no link |`;
  const result = validateTaskRegister({
    todoMarkdown: invalidTodo,
    markdownFiles: [{ path: 'TODO.md', content: invalidTodo }, { path: 'README.md', content: '# Present\n' }],
    root,
  });
  const codes = result.errors.map(error => error.code);
  assert.equal(result.ok, false);
  assert.ok(codes.includes('TASK_ID_DUPLICATE'));
  assert.ok(codes.includes('TASK_ID_INVALID'));
  assert.ok(codes.includes('DEPENDENCY_INVALID'));
  assert.ok(codes.includes('DEPENDENCY_CYCLE'));
  assert.ok(codes.includes('LINK_MISSING'));
  assert.ok(codes.includes('LINK_FRAGMENT_MISSING'));
  assert.ok(codes.includes('LINK_UNSAFE'));
  assert.ok(codes.includes('LINK_MALFORMED'));
  assert.ok(result.errors.every(error => Number.isInteger(error.line) && error.line > 0));
});
