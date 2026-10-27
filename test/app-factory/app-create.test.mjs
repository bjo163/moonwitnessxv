import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  factoryCopy,
  factoryMessage,
  planFiles,
  runAppCreate,
  validateAppSlug,
} from '../../scripts/app-create.mjs';

function makeRoot() {
  const root = mkdtempSync(join(tmpdir(), 'app-create-'));
  mkdirSync(join(root, 'apps'));
  return root;
}

function collect() {
  const out = [];
  const err = [];
  return {
    stdout: (line) => out.push(line),
    stderr: (line) => err.push(line),
    out,
    err,
  };
}

function run(argv, root, env = {}) {
  const sink = collect();
  const code = runAppCreate({ argv, root, env, stdout: sink.stdout, stderr: sink.stderr });
  return { code, out: sink.out, err: sink.err };
}

test('positive: valid slug is accepted and plan is deterministic', () => {
  assert.deepEqual(validateAppSlug('new-app'), { ok: true });
  const first = planFiles('new-app', 'worker');
  const second = planFiles('new-app', 'worker');
  assert.deepEqual(first.map((f) => f.relPath), second.map((f) => f.relPath));
  assert.deepEqual(first, second);
  assert.equal(first.length, 4);
});

test('positive: dry-run prints the exact rendered file list and writes nothing', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { code, out } = run(['new-app', '--dry-run'], root);
  assert.equal(code, 0);
  assert.match(out[0], /DRY RUN/);
  const printed = out.slice(1).map((line) => resolve(root, line.trim()));
  const plan = planFiles('new-app', 'worker');
  assert.deepEqual(printed, plan.map((file) => join(root, file.relPath)));
  assert.deepEqual(readdirSync(join(root, 'apps')), []);
});

test('positive: write mode creates exactly the planned files with planned content', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { code, out } = run(['new-app'], root);
  assert.equal(code, 0);
  assert.match(out.at(-1), /created 4 file\(s\)/);
  for (const file of planFiles('new-app', 'worker')) {
    const written = readFileSync(join(root, file.relPath), 'utf8');
    assert.equal(written, file.content);
  }
  const manifest = JSON.parse(readFileSync(join(root, 'apps', 'new-app', 'package.json'), 'utf8'));
  assert.equal(manifest.name, '@moonwitness/new-app');
  assert.equal(manifest.private, true);
});

test('negative: path traversal and absolute paths are rejected with no writes', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const hostile = [
    '../escape',
    '..\\escape',
    '..',
    'a/b',
    'a\\b',
    '/tmp/evil',
    'C:\\temp\\evil',
    '..%2fevil',
    '%2e%2e/victim',
    'new-app/../../victim',
  ];
  for (const slug of hostile) {
    const { code, err } = run([slug, '--dry-run'], root);
    assert.equal(code, 1, `${slug} must be rejected`);
    assert.match(err.join('\n'), /traversal|absolute/i);
    assert.equal(validateAppSlug(slug).reason, 'traversal');
  }
  assert.deepEqual(readdirSync(join(root, 'apps')), []);
});

test('negative: invalid characters and shapes are rejected', () => {
  const invalid = ['A New App', 'UPPER', '_lead', 'trail-', 'a--b', 'a_b', 'app!', 'a', 'x'.repeat(41)];
  for (const slug of invalid) {
    const result = validateAppSlug(slug);
    assert.equal(result.ok, false, `${slug} must be rejected`);
    assert.ok(['length', 'invalid'].includes(result.reason));
  }
  assert.equal(validateAppSlug(undefined).reason, 'missingSlug');
  assert.equal(validateAppSlug('').reason, 'missingSlug');
});

test('negative: reserved and existing names are rejected with no writes', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'apps', 'myapp'));
  writeFileSync(join(root, 'apps', 'myapp', 'keep.txt'), 'untouched', 'utf8');
  const { code, err } = run(['myapp'], root);
  assert.equal(code, 1);
  assert.match(err.join('\n'), /refusing to overwrite/i);
  assert.equal(readFileSync(join(root, 'apps', 'myapp', 'keep.txt'), 'utf8'), 'untouched');
  for (const reservedName of ['radio', 'api', 'core', 'packages', 'node_modules']) {
    assert.equal(validateAppSlug(reservedName).reason, 'reserved');
  }
});

test('negative: unknown option, unknown variant, missing slug, and bad locale all exit 1', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(run(['--force'], root).code, 1);
  assert.equal(run(['new-app', '--variant', 'service'], root).code, 1);
  assert.equal(run([], root).code, 1);
  const badLocale = run(['new-app', '--locale', 'fr'], root);
  assert.equal(badLocale.code, 1);
  assert.match(badLocale.err.join('\n'), /Unsupported locale|tidak didukung/);
  assert.deepEqual(readdirSync(join(root, 'apps')), []);
});

test('negative: frontend variant is refused as planned-by-M05-19 with no writes', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { code, err } = run(['new-app', '--variant', 'frontend', '--dry-run'], root);
  assert.equal(code, 1);
  assert.match(err.join('\n'), /M05-19/);
  assert.deepEqual(readdirSync(join(root, 'apps')), []);
});

test('negative: missing apps/ directory is refused with no writes', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'app-create-noapps-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { code, err } = run(['new-app', '--dry-run'], root);
  assert.equal(code, 1);
  assert.match(err.join('\n'), /apps\//);
  assert.deepEqual(readdirSync(root), []);
});

test('locale: --locale id and MW_LOCALE id print Indonesian copy; en stays default', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const idRun = run(['new-app', '--dry-run', '--locale', 'id'], root);
  assert.equal(idRun.code, 0);
  assert.match(idRun.out[0], /PRATINJAU/);
  const envRun = run(['new-app', '--dry-run'], root, { MW_LOCALE: 'id' });
  assert.equal(envRun.code, 0);
  assert.match(envRun.out[0], /PRATINJAU/);
  const defaultRun = run(['new-app', '--dry-run'], root, { MW_LOCALE: 'fr' });
  assert.equal(defaultRun.code, 0);
  assert.match(defaultRun.out[0], /DRY RUN/);
  const explicitWins = run(['new-app', '--dry-run', '--locale=en'], root, { MW_LOCALE: 'id' });
  assert.match(explicitWins.out[0], /DRY RUN/);
});

test('catalog: id and en catalogs carry exactly the same stable keys', () => {
  assert.deepEqual(Object.keys(factoryCopy.id).sort(), Object.keys(factoryCopy.en).sort());
  assert.match(factoryMessage('id', 'refusedReserved', { slug: 'radio' }), /radio/);
});
