import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  comparePages,
  loadAllowlistedSources,
  parseArgs,
  runWikiPublisher,
  validatePageTitle,
  validateSourceLinks,
} from '../../scripts/governance/wiki-publish.mjs';

const sourceText = '# Contributing\n\n## Before you start\n\nSee [README](README.md).\n\n## Pull requests\n';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'moonwitness-publisher-test-'));
  writeFileSync(join(root, 'CONTRIBUTING.md'), sourceText);
  writeFileSync(join(root, 'README.md'), '# Fixture\n');
  return root;
}

function sourceMap(sourcePath = 'CONTRIBUTING.md') {
  return [{ title: 'Contribution-and-Pull-Requests', sourcePath, requiredHeadings: ['# Contributing', '## Before you start', '## Pull requests'] }];
}

const canonicalSource = async () => ({ ready: true, defaultBranch: 'main', headSha: 'a'.repeat(40), reason: 'fixture source is clean' });

test('allowlist validates source files, headings, links, and safe page names', () => {
  const root = fixture();
  try {
    const loaded = loadAllowlistedSources({ root, sourceMap: sourceMap() });
    assert.deepEqual(loaded.errors, []);
    assert.equal(loaded.pages[0].title, 'Contribution-and-Pull-Requests');
    assert.match(loaded.pages[0].content, /https:\/\/github\.com\/bjo163\/moonwitnessxv\/blob\/main\/README\.md/);
    assert.equal(validatePageTitle('../Home'), false);
    assert.equal(validatePageTitle('Home'), true);
    assert.deepEqual(validateSourceLinks('CONTRIBUTING.md', '[safe](missing.md)', root), ['Missing local link: missing.md']);
    assert.match(loadAllowlistedSources({ root, sourceMap: sourceMap('missing.md') }).errors.join('\n'), /Missing allowlisted source/);
    assert.match(loadAllowlistedSources({ root, sourceMap: sourceMap('../CONTRIBUTING.md') }).errors.join('\n'), /not an allowlisted relative path/);
  } finally {
    rmSync(resolve(root), { recursive: true, force: true });
  }
});

test('page comparison distinguishes create, no change, managed update, and human conflict', () => {
  const root = fixture();
  try {
    const page = loadAllowlistedSources({ root, sourceMap: sourceMap() }).pages[0];
    assert.equal(comparePages([page], new Map())[0].action, 'CREATE');
    assert.equal(comparePages([page], new Map([[page.file, page.content]]))[0].action, 'NO_CHANGE');
    const managedOld = page.content.replace(/sha256=[a-f0-9]+/, `sha256=${'0'.repeat(64)}`).replace('## Pull requests', '## Prior pull requests');
    assert.equal(comparePages([page], new Map([[page.file, managedOld]]))[0].action, 'UPDATE_CANDIDATE');
    assert.equal(comparePages([page], new Map([[page.file, '# Human-authored page\n']]))[0].action, 'CONFLICT');
    assert.equal(comparePages([page], new Map([['contribution-and-pull-requests.md', '# Case collision']]))[0].action, 'CONFLICT');
  } finally {
    rmSync(resolve(root), { recursive: true, force: true });
  }
});

test('dry-run never writes; inaccessible Wiki and missing confirmation block apply', async () => {
  const root = fixture();
  try {
    let writes = 0;
    const inaccessible = { async readPages() { return { accessible: false, reason: 'fixture access denied' }; }, async addPages() { writes += 1; } };
    const blocked = await runWikiPublisher({ root, sourceMap: sourceMap(), wiki: inaccessible, sourceState: canonicalSource });
    assert.equal(blocked.pages[0].action, 'BLOCKED');
    assert.equal(writes, 0);

    const writable = { async readPages() { return { accessible: true, files: new Map() }; }, async addPages() { writes += 1; return { published: [] }; } };
    const dry = await runWikiPublisher({ root, sourceMap: sourceMap(), wiki: writable, sourceState: canonicalSource });
    assert.equal(dry.pages[0].action, 'CREATE');
    assert.equal(writes, 0);
    const unconfirmed = await runWikiPublisher({ root, sourceMap: sourceMap(), wiki: writable, sourceState: canonicalSource, apply: true });
    assert.match(unconfirmed.applyBlocked, /Explicitly confirm/);
    assert.equal(writes, 0);
    const confirmed = await runWikiPublisher({ root, sourceMap: sourceMap(), wiki: writable, sourceState: canonicalSource, apply: true, confirmedPages: ['Contribution-and-Pull-Requests'] });
    assert.equal(confirmed.pages[0].action, 'PUBLISHED');
    assert.equal(writes, 1);
  } finally {
    rmSync(resolve(root), { recursive: true, force: true });
  }
});

test('publisher blocks malformed allowlists and conflicts without writing', async () => {
  const root = fixture();
  try {
    let writes = 0;
    const wiki = {
      async readPages() { return { accessible: true, files: new Map([['Contribution-and-Pull-Requests.md', '# Human page\n']]) }; },
      async addPages() { writes += 1; return { published: [] }; },
    };
    const malformed = await runWikiPublisher({ root, sourceMap: [{ title: '../unsafe', sourcePath: 'CONTRIBUTING.md' }], wiki, sourceState: canonicalSource });
    assert.equal(malformed.pages[0].action, 'BLOCKED');
    const conflict = await runWikiPublisher({ root, sourceMap: sourceMap(), wiki, sourceState: canonicalSource, apply: true, confirmedPages: ['Contribution-and-Pull-Requests'] });
    assert.equal(conflict.pages[0].action, 'CONFLICT');
    assert.ok(conflict.applyBlocked);
    assert.equal(writes, 0);
    assert.equal(parseArgs(['--apply', '--confirm-page', 'Contribution-and-Pull-Requests']).apply, true);
    assert.throws(() => parseArgs(['--confirm-page', '../unsafe']), /Unsafe Wiki page title/);
  } finally {
    rmSync(resolve(root), { recursive: true, force: true });
  }
});

test('publisher refuses to stage sources that are not on the live default branch', async () => {
  const root = fixture();
  try {
    let writes = 0;
    const wiki = {
      async readPages() { return { accessible: true, files: new Map() }; },
      async addPages() { writes += 1; return { published: [] }; },
    };
    const report = await runWikiPublisher({
      root,
      sourceMap: sourceMap(),
      wiki,
      sourceState: async () => ({ ready: false, defaultBranch: 'main', reason: 'Source is untracked.' }),
      apply: true,
      confirmedPages: ['Contribution-and-Pull-Requests'],
    });
    assert.equal(report.pages[0].action, 'BLOCKED');
    assert.equal(report.pages[0].candidateAction, 'CREATE');
    assert.equal(writes, 0);
  } finally {
    rmSync(resolve(root), { recursive: true, force: true });
  }
});
