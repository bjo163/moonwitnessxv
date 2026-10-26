#!/usr/bin/env node
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const execFile = promisify(execFileCallback);
const DEFAULT_REPO = 'bjo163/moonwitnessxv';
const SOURCE_MAP = Object.freeze([
  Object.freeze({
    title: 'Contribution-and-Pull-Requests',
    sourcePath: 'CONTRIBUTING.md',
    requiredHeadings: ['# Contributing', '## Before you start', '## Pull requests'],
  }),
]);
const BEGIN = '<!-- moonwitness-governance-publisher:begin';
const END = '<!-- moonwitness-governance-publisher:end -->';

function validateRepo(repo) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) || repo.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error('Repository must use owner/name form.');
  }
}

export function validatePageTitle(title) {
  return /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(title);
}

function insideRoot(root, relativePath) {
  const rootPath = resolve(root);
  const candidate = resolve(rootPath, relativePath);
  if (candidate !== rootPath && !candidate.startsWith(`${rootPath}${sep}`)) {
    throw new Error(`Source path escapes repository root: ${relativePath}`);
  }
  return candidate;
}

export function validateSourceLinks(sourcePath, markdown, root) {
  const errors = [];
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(linkPattern)) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith('#') || /^(https?:|mailto:|data:)/i.test(raw)) continue;
    let target;
    try { target = decodeURIComponent(raw.split('#', 1)[0]); } catch {
      errors.push(`Malformed local link: ${raw}`);
      continue;
    }
    try {
      if (!existsSync(insideRoot(root, join(dirname(sourcePath), target)))) errors.push(`Missing local link: ${raw}`);
    } catch {
      errors.push(`Unsafe local link: ${raw}`);
    }
  }
  return errors;
}

function canonicalUrl(repo, sourcePath, revision = 'main') {
  const path = sourcePath.split(sep).join('/').split('/').map(encodeURIComponent).join('/');
  return `https://github.com/${repo}/blob/${encodeURIComponent(revision)}/${path}`;
}

function renderSource(source, repo, sourceSha, revision = 'main') {
  const transformed = source.markdown.replace(/\]\(([^)]+)\)/g, (full, rawTarget) => {
    const target = rawTarget.trim();
    if (!target || target.startsWith('#') || /^(https?:|mailto:|data:)/i.test(target)) return full;
    const anchorIndex = target.indexOf('#');
    const pathPart = anchorIndex === -1 ? target : target.slice(0, anchorIndex);
    const anchor = anchorIndex === -1 ? '' : target.slice(anchorIndex);
    const repositoryPath = posix.normalize(posix.join(posix.dirname(source.sourcePath.split(sep).join('/')), pathPart.replaceAll('\\', '/')));
    return `](${canonicalUrl(repo, repositoryPath, revision)}${anchor})`;
  });
  return `${BEGIN} source=${source.sourcePath} sha256=${sourceSha} -->\n${transformed.trimEnd()}\n${END}\n`;
}

function pageFile(title) {
  if (!validatePageTitle(title)) throw new Error(`Unsafe Wiki page title: ${title}`);
  return `${title}.md`;
}

export function previewDiff(before, after, limit = 80) {
  const oldLines = before.split('\n');
  const newLines = after.split('\n');
  let prefix = 0;
  while (prefix < oldLines.length && prefix < newLines.length && oldLines[prefix] === newLines[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < oldLines.length - prefix && suffix < newLines.length - prefix
    && oldLines[oldLines.length - 1 - suffix] === newLines[newLines.length - 1 - suffix]) suffix += 1;
  const oldMiddle = oldLines.slice(prefix, oldLines.length - suffix);
  const newMiddle = newLines.slice(prefix, newLines.length - suffix);
  const rows = [
    `@@ lines ${prefix + 1} @@`,
    ...oldMiddle.map((line) => `-${line}`),
    ...newMiddle.map((line) => `+${line}`),
  ];
  if (rows.length > limit) return `${rows.slice(0, limit).join('\n')}\n… diff preview truncated …`;
  return rows.join('\n');
}

function sourceSha(markdown) {
  return createHash('sha256').update(markdown, 'utf8').digest('hex');
}

export function loadAllowlistedSources({ root = process.cwd(), repo = DEFAULT_REPO, sourceMap = SOURCE_MAP, revision = 'main' } = {}) {
  validateRepo(repo);
  const errors = [];
  const prepared = [];
  if (!Array.isArray(sourceMap)) {
    return { pages: [], errors: ['Malformed allowlist: expected an array of explicit source mappings.'], sourceMap: [] };
  }
  if (sourceMap.length === 0) errors.push('Empty allowlist: no Wiki pages are approved for publication.');
  const seenTitles = new Set();
  const seenSources = new Set();
  for (const entry of sourceMap) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push('Malformed allowlist entry: expected an object.');
      continue;
    }
    if (!validatePageTitle(entry.title)) {
      errors.push(`Unsafe Wiki page title: ${entry.title}`);
      continue;
    }
    if (seenTitles.has(entry.title.toLowerCase())) {
      errors.push(`Duplicate Wiki page title: ${entry.title}`);
      continue;
    }
    seenTitles.add(entry.title.toLowerCase());
    if (typeof entry.sourcePath !== 'string' || !entry.sourcePath) {
      errors.push(`Malformed source path for Wiki page: ${entry.title}`);
      continue;
    }
    if (seenSources.has(entry.sourcePath)) {
      errors.push(`Ambiguous source mapping: ${entry.sourcePath} appears more than once.`);
      continue;
    }
    seenSources.add(entry.sourcePath);
    if (!entry.sourcePath || entry.sourcePath.includes('..') || entry.sourcePath.startsWith('/') || entry.sourcePath.includes('\\')) {
      errors.push(`Source path is not an allowlisted relative path: ${entry.sourcePath}`);
      continue;
    }
    let absolutePath;
    try { absolutePath = insideRoot(root, entry.sourcePath); } catch {
      errors.push(`Unsafe source path: ${entry.sourcePath}`);
      continue;
    }
    if (!existsSync(absolutePath)) {
      errors.push(`Missing allowlisted source: ${entry.sourcePath}`);
      continue;
    }
    const markdown = readFileSync(absolutePath, 'utf8');
    if (entry.requiredHeadings !== undefined && !Array.isArray(entry.requiredHeadings)) {
      errors.push(`Malformed required headings for ${entry.title}: expected an array.`);
      continue;
    }
    for (const heading of entry.requiredHeadings ?? []) {
      if (typeof heading !== 'string' || !heading.startsWith('#')) {
        errors.push(`Malformed required heading for ${entry.title}.`);
        continue;
      }
      if (!markdown.split(/\r?\n/).includes(heading)) errors.push(`${entry.sourcePath} is missing required heading: ${heading}`);
    }
    errors.push(...validateSourceLinks(entry.sourcePath, markdown, resolve(root)));
    const sha256 = sourceSha(markdown);
    prepared.push({
      title: entry.title,
      file: pageFile(entry.title),
      sourcePath: entry.sourcePath,
      sourceSha256: sha256,
      content: renderSource({ ...entry, markdown }, repo, sha256, revision),
      url: `https://github.com/${repo}/wiki/${encodeURIComponent(entry.title)}`,
    });
  }
  return { pages: prepared, errors, sourceMap: sourceMap.map(({ title, sourcePath }) => ({ title, sourcePath })) };
}

function managedSource(existing, sourcePath) {
  const firstLine = existing.split(/\r?\n/, 1)[0];
  return firstLine.startsWith(`${BEGIN} source=${sourcePath} sha256=`) && existing.includes(END);
}

export function comparePages(preparedPages, wikiFiles) {
  const pages = wikiFiles instanceof Map ? wikiFiles : new Map(Object.entries(wikiFiles ?? {}));
  const names = [...pages.keys()];
  return preparedPages.map((page) => {
    const targetName = page.file;
    const collision = names.find((name) => name.toLowerCase() === targetName.toLowerCase());
    if (!collision) return { ...page, action: 'CREATE', reason: 'Target page does not exist; publication would add a new page.', diffPreview: previewDiff('', page.content) };
    const existing = pages.get(collision);
    if (collision === targetName && existing === page.content) return { ...page, action: 'NO_CHANGE', reason: 'Current Wiki page exactly matches its allowlisted source.' };
    if (collision === targetName && managedSource(existing, page.sourcePath)) {
      return { ...page, action: 'UPDATE_CANDIDATE', reason: 'Page is publisher-marked, but updates require a separate human review.', diffPreview: previewDiff(existing, page.content) };
    }
    return { ...page, action: 'CONFLICT', reason: `An existing Wiki page (${collision}) is not an exact publisher-owned match; it will not be overwritten.` };
  });
}

async function execute(file, args, { cwd, timeout = 30_000 } = {}) {
  try {
    const result = await execFile(file, args, {
      cwd, timeout, maxBuffer: 4 * 1024 * 1024, windowsHide: true,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
    return { ok: true, stdout: result.stdout.trim(), stderr: result.stderr.trim() };
  } catch (error) {
    return { ok: false, stdout: String(error.stdout ?? '').trim(), stderr: String(error.stderr ?? error.message ?? 'Command failed').trim() };
  }
}

export async function inspectCanonicalSource(root, sourceMap = SOURCE_MAP) {
  const sources = sourceMap.map((entry) => entry.sourcePath).filter(Boolean);
  const branch = await execute('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: root });
  const head = await execute('git', ['rev-parse', 'HEAD'], { cwd: root });
  const remote = await execute('git', ['ls-remote', '--symref', 'origin', 'HEAD'], { cwd: root });
  if (!branch.ok || !head.ok || !remote.ok) {
    return { ready: false, reason: 'Could not verify the current branch, commit, and origin default branch.' };
  }
  const refLine = remote.stdout.split(/\r?\n/).find((line) => line.startsWith('ref: refs/heads/') && line.endsWith('\tHEAD'));
  const headLine = remote.stdout.split(/\r?\n/).find((line) => /^[a-f0-9]{40,64}\tHEAD$/.test(line));
  const defaultBranch = refLine?.slice('ref: refs/heads/'.length).split('\t')[0];
  const remoteSha = headLine?.split('\t')[0];
  if (!defaultBranch || !remoteSha) return { ready: false, reason: 'Origin did not expose a readable symbolic default branch.' };
  if (branch.stdout !== defaultBranch) return { ready: false, defaultBranch, reason: `Current branch (${branch.stdout}) is not the remote default branch (${defaultBranch}).` };
  if (head.stdout !== remoteSha) return { ready: false, defaultBranch, headSha: head.stdout, reason: 'Local HEAD differs from the live origin default-branch SHA.' };
  for (const source of sources) {
    const tracked = await execute('git', ['ls-files', '--error-unmatch', '--', source], { cwd: root });
    if (!tracked.ok) return { ready: false, defaultBranch, headSha: head.stdout, reason: `Allowlisted source is not tracked in Git: ${source}.` };
    const status = await execute('git', ['status', '--porcelain=v1', '--untracked-files=all', '--', source], { cwd: root });
    if (!status.ok || status.stdout) return { ready: false, defaultBranch, headSha: head.stdout, reason: `Allowlisted source is modified or untracked: ${source}.` };
  }
  return { ready: true, defaultBranch, headSha: head.stdout, reason: 'Allowlisted sources are clean at the live origin default-branch SHA.' };
}

export function createWikiAdapter() {
  const remote = (repo) => `https://github.com/${repo}.wiki.git`;
  return {
    async readPages(repo) {
      const ls = await execute('git', ['-c', 'credential.interactive=never', 'ls-remote', remote(repo)]);
      if (!ls.ok) return { accessible: false, reason: 'Wiki Git repository could not be read; this does not prove that no pages exist.' };
      const tempRoot = resolve(tmpdir());
      const checkout = resolve(mkdtempSync(join(tempRoot, 'moonwitness-wiki-read-')));
      try {
        const cloned = await execute('git', ['-c', 'credential.interactive=never', 'clone', '--quiet', '--depth', '1', remote(repo), checkout]);
        if (!cloned.ok) return { accessible: false, reason: 'Wiki refs were visible but page contents could not be cloned.' };
        const files = new Map();
        for (const entry of readdirSync(checkout, { withFileTypes: true })) {
          if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
            files.set(entry.name, readFileSync(join(checkout, entry.name), 'utf8'));
          }
        }
        return { accessible: true, files };
      } finally {
        if (checkout.startsWith(`${tempRoot}${process.platform === 'win32' ? '\\' : '/'}`)) rmSync(checkout, { recursive: true, force: true });
      }
    },
    async addPages(repo, pages) {
      const tempRoot = resolve(tmpdir());
      const checkout = resolve(mkdtempSync(join(tempRoot, 'moonwitness-wiki-write-')));
      try {
        const cloned = await execute('git', ['-c', 'credential.interactive=never', 'clone', '--quiet', '--depth', '1', remote(repo), checkout]);
        if (!cloned.ok) throw new Error('Wiki clone failed; no pages were written.');
        for (const page of pages) {
          const destination = resolve(checkout, page.file);
          if (dirname(destination) !== checkout) throw new Error(`Unsafe target path: ${page.file}`);
          if (existsSync(destination)) throw new Error(`Wiki page appeared after dry-run: ${page.title}; no files were overwritten.`);
          writeFileSync(destination, page.content, { encoding: 'utf8', flag: 'wx' });
        }
        const added = await execute('git', ['add', '--', ...pages.map((page) => page.file)], { cwd: checkout });
        if (!added.ok) throw new Error(`Could not stage Wiki pages: ${added.stderr}`);
        const staged = await execute('git', ['diff', '--cached', '--name-only'], { cwd: checkout });
        const expected = pages.map((page) => page.file).sort();
        const actual = staged.stdout.split(/\r?\n/).filter(Boolean).sort();
        if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Staged Wiki paths differ from the allowlist; publication stopped.');
        const name = await execute('git', ['config', '--get', 'user.name'], { cwd: checkout });
        const email = await execute('git', ['config', '--get', 'user.email'], { cwd: checkout });
        if (!name.ok || !email.ok) throw new Error('Git author identity is not configured; no Wiki commit was created.');
        const committed = await execute('git', ['commit', '-m', 'docs(wiki): add approved governance page'], { cwd: checkout });
        if (!committed.ok) throw new Error(`Wiki commit failed: ${committed.stderr}`);
        const commit = await execute('git', ['rev-parse', 'HEAD'], { cwd: checkout });
        const pushed = await execute('git', ['push'], { cwd: checkout });
        if (!pushed.ok) {
          const error = new Error(`Wiki push failed; no force-push or retry was attempted: ${pushed.stderr}`);
          error.remoteWriteAttempted = true;
          throw error;
        }
        return { published: pages.map((page) => ({ title: page.title, file: page.file, sourcePath: page.sourcePath, url: page.url, sourceSha256: page.sourceSha256, wikiCommitSha: commit.stdout })) };
      } finally {
        if (checkout.startsWith(`${tempRoot}${process.platform === 'win32' ? '\\' : '/'}`)) rmSync(checkout, { recursive: true, force: true });
      }
    },
  };
}

export async function runWikiPublisher({
  repo = DEFAULT_REPO,
  root = process.cwd(),
  wiki = createWikiAdapter(),
  sourceMap = SOURCE_MAP,
  sourceState = inspectCanonicalSource,
  apply = false,
  confirmedPages = [],
} = {}) {
  validateRepo(repo);
  let canonicalState;
  try { canonicalState = await sourceState(root, sourceMap); } catch {
    canonicalState = { ready: false, reason: 'Canonical source state could not be verified.' };
  }
  const loaded = loadAllowlistedSources({ root, repo, sourceMap, revision: canonicalState.defaultBranch ?? 'main' });
  const report = {
    repository: repo,
    mode: apply ? 'apply' : 'dry-run',
    generatedAt: new Date().toISOString(),
    sourceMap: loaded.sourceMap,
    canonicalSource: canonicalState,
    sourceErrors: loaded.errors,
    pages: [],
    writes: [],
  };
  if (loaded.errors.length) {
    report.pages = loaded.pages.map((page) => ({ title: page.title, action: 'BLOCKED', sourcePath: page.sourcePath, reason: 'One or more allowlisted sources failed validation.' }));
    if (report.pages.length === 0) report.pages.push({ title: null, action: 'BLOCKED', reason: 'No valid allowlisted pages could be prepared.' });
    return report;
  }

  let remote;
  try { remote = await wiki.readPages(repo); } catch {
    remote = { accessible: false, reason: 'Wiki access failed; no absence or empty page set is inferred.' };
  }
  if (!remote?.accessible) {
    report.pages = loaded.pages.map((page) => ({
      title: page.title,
      url: page.url,
      sourcePath: page.sourcePath,
      action: 'BLOCKED',
      reason: remote?.reason ?? 'Wiki contents are not accessible.',
      sourceSha256: page.sourceSha256,
    }));
    if (apply) report.applyBlocked = 'Wiki access is unavailable; no remote write was attempted.';
    return report;
  }

  report.pages = comparePages(loaded.pages, remote.files);
  if (!canonicalState.ready) {
    report.pages = report.pages.map((page) => ({
      ...page,
      candidateAction: page.action,
      action: 'BLOCKED',
      reason: `${page.reason} ${canonicalState.reason}`.trim(),
    }));
    report.applyBlocked = 'Canonical source files must be clean on the live default branch before publication.';
    return report;
  }
  if (!apply) return report;
  const confirmSet = new Set(confirmedPages);
  const creates = report.pages.filter((page) => page.action === 'CREATE');
  const unsafe = report.pages.some((page) => !['CREATE', 'NO_CHANGE'].includes(page.action));
  const unconfirmed = creates.filter((page) => !confirmSet.has(page.title));
  if (unsafe || unconfirmed.length) {
    report.applyBlocked = unsafe
      ? 'Conflicts, update candidates, or blocked pages require human review; no page was written.'
      : `Explicitly confirm each new page with --confirm-page=${unconfirmed.map((page) => page.title).join(' --confirm-page=')}.`;
    return report;
  }
  if (!creates.length) {
    report.applyBlocked = 'All pages already match; no Wiki write was needed.';
    return report;
  }
  try {
    const result = await wiki.addPages(repo, creates);
    report.writes = result.published;
    report.remoteWriteOutcome = 'CONFIRMED_SUCCESS';
    for (const item of report.pages) if (item.action === 'CREATE') item.action = 'PUBLISHED';
  } catch (error) {
    report.applyBlocked = error.message || 'Wiki publication failed; no force-push was attempted.';
    if (error.remoteWriteAttempted) report.remoteWriteOutcome = 'UNKNOWN';
  }
  return report;
}

export function formatHuman(report) {
  const lines = [`Knowledge-to-Wiki Publisher — ${report.repository}`, `Mode: ${report.mode}`, `Generated: ${report.generatedAt}`, ''];
  for (const page of report.pages) {
    lines.push(`${page.action.padEnd(18)} ${page.title ?? '(allowlist)'}`);
    if (page.sourcePath) lines.push(`  Source: ${page.sourcePath}`);
    lines.push(`  ${page.reason ?? ''}`);
    if (page.diffPreview) lines.push(page.diffPreview);
  }
  for (const error of report.sourceErrors) lines.push(`SOURCE ERROR: ${error}`);
  if (report.applyBlocked) lines.push(`APPLY BLOCKED: ${report.applyBlocked}`);
  for (const write of report.writes) lines.push(`PUBLISHED: ${write.title} ${write.url}`);
  return lines.join('\n');
}

function help() {
  return [
    'Usage: node scripts/governance/wiki-publish.mjs [--dry-run] [--json] [--repo owner/name]',
    '       node scripts/governance/wiki-publish.mjs --apply --confirm-page Contribution-and-Pull-Requests',
    '',
    'The default mode is read-only. Only allowlisted governance pages are considered.',
    'Apply creates confirmed, absent pages only. Existing pages are never overwritten.',
    'Run and inspect the dry-run before using --apply. Wiki Git access must already be configured.',
    'Options: --dry-run (default), --apply, --json, --repo owner/name, --confirm-page TITLE, --help.',
  ].join('\n');
}

export function parseArgs(argv) {
  const options = { repo: DEFAULT_REPO, json: false, help: false, apply: false, confirmedPages: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.apply = false;
    else if (arg === '--apply') options.apply = true;
    else if (arg === '--repo' && argv[index + 1]) options.repo = argv[++index];
    else if (arg === '--confirm-page' && argv[index + 1]) options.confirmedPages.push(argv[++index]);
    else throw new Error(`Unknown or incomplete option: ${arg}`);
  }
  validateRepo(options.repo);
  if (options.confirmedPages.some((title) => !validatePageTitle(title))) throw new Error('Unsafe Wiki page title in confirmation.');
  return options;
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    process.stdout.write(`${help()}\n`);
    return;
  }
  const report = await runWikiPublisher(options);
  process.stdout.write(`${options.json ? JSON.stringify(report, null, 2) : formatHuman(report)}\n`);
  if (options.apply && (report.applyBlocked || report.pages.some((page) => page.action === 'BLOCKED'))) process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`Knowledge-to-Wiki Publisher: ${error.message}\nRun with --help for usage.\n`);
    process.exitCode = 1;
  });
}
