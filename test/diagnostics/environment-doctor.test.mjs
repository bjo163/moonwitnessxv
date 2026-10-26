import test from 'node:test';
import assert from 'node:assert/strict';
import { compareRequirements, commandInfo, inspectEnvironment, parseArgs } from '../../scripts/diagnostics/environment-doctor.mjs';

test('snapshot discovers script text without executing it or reading environment values', async () => {
  const calls = [];
  const reads = [];
  const report = await inspectEnvironment({
    root: '.',
    run: async (file, args) => {
      calls.push([file, args]);
      if (args.includes('--show-toplevel')) return { ok: true, stdout: '/fixture/repo' };
      if (file === 'pnpm') return { ok: true, stdout: '10.33.4' };
      if (file === 'docker') return { ok: false, status: 'NOT_FOUND' };
      return { ok: true, stdout: 'fixture-version' };
    },
    read: async (path) => {
      reads.push(path);
      return JSON.stringify({ name: 'fixture', engines: { node: '>=24 <25' }, packageManager: 'pnpm@10.33.4', scripts: { surprise: 'delete-everything', build: 'do-not-run-this' } });
    },
  });
  assert.equal(report.tools.docker.status, 'NOT_FOUND');
  assert.equal(report.commands[0].definition, 'delete-everything');
  assert.equal(report.commands[0].execution, 'NOT_RUN');
  assert.equal(report.compatibility.pnpm.status, 'MATCH');
  assert.equal(reads.length, 1);
  assert.ok(reads[0].endsWith('package.json'));
  assert.ok(calls.every(([file, args]) => file === 'git' || args.join(' ') === '--version'));
  assert.ok(!calls.some(([, args]) => args.includes('delete-everything') || args.includes('do-not-run-this')));
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(report)));
});

test('compatibility preserves unknown requirements and reports version mismatches', () => {
  assert.equal(compareRequirements({ engines: { node: '>=24 <25' } }, { node: { version: 'v22.0.0' } }).node.status, 'MISMATCH');
  assert.equal(compareRequirements({ engines: { node: '^24' } }, { node: { version: 'v24.0.0' } }).node.status, 'UNKNOWN');
  assert.equal(compareRequirements({}, {}).pnpm.status, 'UNKNOWN');
  assert.equal(commandInfo('ports:free', 'node scripts/free-ports.mjs').effect, 'TERMINATES_PROCESSES');
  assert.equal(commandInfo('docker:up', 'docker compose up --build').effect, 'BUILDS_IMAGES_AND_STARTS_SERVICES');
  assert.equal(commandInfo('unrecognized', 'anything').effect, 'REVIEW_REQUIRED');
  assert.throws(() => parseArgs(['--run', 'build']), /Unknown/);
});

test('missing manifest and inaccessible Git produce a report instead of inferred success', async () => {
  const report = await inspectEnvironment({
    root: '.',
    run: async () => ({ ok: false, status: 'NOT_ACCESSIBLE' }),
    read: async () => { throw new Error('missing'); },
  });
  assert.equal(report.project.manifestStatus, 'NOT_ACCESSIBLE');
  assert.equal(report.git.head, null);
  assert.equal(report.repositoryRootVerified, false);
  assert.deepEqual(report.commands, []);
  assert.equal(report.compatibility.pnpm.status, 'UNKNOWN');
});
