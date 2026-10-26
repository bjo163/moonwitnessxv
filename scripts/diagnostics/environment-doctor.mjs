#!/usr/bin/env node
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { release, arch } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const execFile = promisify(execFileCallback);
const VERSION_COMMANDS = Object.freeze({
  git: ['git', ['--version']],
  gh: ['gh', ['--version']],
  codex: ['codex', ['--version']],
  docker: ['docker', ['--version']],
  npm: ['npm', ['--version']],
  pnpm: ['pnpm', ['--version']],
});

export async function runCommand(file, args, cwd) {
  // Only fixed version commands use cmd.exe on Windows; user paths are passed as cwd.
  const shim = process.platform === 'win32' && ['npm', 'pnpm'].includes(file);
  try {
    const result = await execFile(shim ? 'cmd.exe' : file,
      shim ? ['/d', '/s', '/c', `${file} --version`] : args, {
        cwd, timeout: 10_000, maxBuffer: 1024 * 1024, windowsHide: true,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0', COREPACK_ENABLE_NETWORK: '0', COREPACK_ENABLE_DOWNLOAD_PROMPT: '0' },
      });
    return { ok: true, stdout: result.stdout.trimEnd() };
  } catch (error) {
    return { ok: false, status: error.code === 'ENOENT' ? 'NOT_FOUND' : 'NOT_ACCESSIBLE' };
  }
}

export function commandInfo(name, definition) {
  let effect = 'REVIEW_REQUIRED';
  let purpose = 'Inspect the current command definition before use.';
  let protectedWork = 'Check the relevant TODO packet before execution.';
  if (name === 'clean') effect = 'DELETES_BUILD_OUTPUT';
  else if (name === 'ports:free') effect = 'TERMINATES_PROCESSES';
  else if (name === 'lint:fix' || name === 'gen:sdk') effect = 'WRITES_REPOSITORY_FILES';
  else if (name.startsWith('db:')) effect = 'DATABASE_OR_SERVICE_OPERATION';
  else if (/docker|^verify$|^build/.test(name)) effect = 'BUILD_OR_INTEGRATION_OUTPUT';
  else if (/^dev|^start|^gui$|^moon$/.test(name)) effect = 'STARTS_SERVICE_OR_INTERACTIVE_CLI';
  else if (name === 'typecheck') effect = 'COMPILER_CHECK_MAY_WRITE_CACHE';
  else if (['lint', 'ui:check', 'gen:sdk:check', 'test'].includes(name)) effect = 'EXECUTES_CHECK_CODE';

  if (name === 'docker:up') effect = 'BUILDS_IMAGES_AND_STARTS_SERVICES';
  if (/^build/.test(name)) purpose = 'Compile the named application or workspace packages.';
  else if (name === 'verify' || name === 'verify:docker') purpose = 'Run the existing integration or container verification sequence.';
  else if (name.startsWith('db:')) purpose = 'Operate the existing database service or schema tooling.';
  else if (name === 'test') purpose = 'Run the existing Radio test suite.';
  else if (name === 'lint' || name === 'lint:fix') purpose = 'Check code style, optionally rewriting files.';
  else if (name === 'typecheck') purpose = 'Run workspace TypeScript checks.';
  else if (name === 'ui:check') purpose = 'Inspect existing UI consistency rules.';
  else if (name.startsWith('gen:sdk')) purpose = 'Generate or compare the SDK snapshot.';
  else if (name === 'ports:free') purpose = 'Free development ports by terminating processes.';
  else if (name === 'clean') purpose = 'Remove generated build output and compiler state.';
  else if (name.startsWith('docker:')) purpose = 'Build container images or start the existing Compose services.';
  else if (/^dev|^start|^gui$|^moon$/.test(name)) purpose = 'Start the selected development/runtime service or CLI.';

  if (/docker|^verify$|^build/.test(name)) protectedWork = 'M27 build/container/release acceptance; other package-specific tasks may also apply.';
  else if (name.startsWith('db:')) protectedWork = 'M04/M27 database and service boundaries; consult the exact packet.';
  else if (name.startsWith('gen:sdk')) protectedWork = 'M01-04 SDK drift gate; inspect exact scope.';
  else if (name === 'test') protectedWork = 'Existing application acceptance tests, including M22 regression and M27 integration.';

  const filters = [...definition.matchAll(/--filter\s+(?:"([^"]+)"|(\S+))/g)].map((match) => match[1] ?? match[2]);
  return {
    name, definition, purpose, effect,
    scope: filters.length ? filters : ['repository; inspect nested script definitions'],
    protectedWork,
    execution: 'NOT_RUN',
    authorization: 'No root package script is executed by this tool. Review scope and obtain separate execution authorization during preparation-only work.',
  };
}

export function compareRequirements(manifest, tools) {
  const observedNode = tools.node?.version;
  const nodeRange = manifest?.engines?.node;
  const supported = typeof nodeRange === 'string' ? /^>=(\d+)\s+<(\d+)$/.exec(nodeRange.trim()) : null;
  const major = /^v?(\d+)\./.exec(observedNode ?? '')?.[1];
  const nodeStatus = supported && major
    ? (Number(major) >= Number(supported[1]) && Number(major) < Number(supported[2]) ? 'MATCH' : 'MISMATCH')
    : 'UNKNOWN';
  const pnpmRequirement = /^pnpm@([^+]+)(?:\+.*)?$/.exec(manifest?.packageManager ?? '')?.[1];
  const observedPnpm = tools.pnpm?.version;
  return {
    node: { declared: nodeRange ?? null, observed: observedNode ?? null, status: nodeStatus },
    pnpm: {
      declared: manifest?.packageManager ?? null,
      observed: observedPnpm ?? null,
      status: pnpmRequirement && observedPnpm ? (pnpmRequirement === observedPnpm ? 'MATCH' : 'MISMATCH') : 'UNKNOWN',
    },
  };
}

export async function inspectEnvironment({ root = process.cwd(), run = runCommand, read = readFile } = {}) {
  const requestedRoot = resolve(root);
  const rootResult = await run('git', ['rev-parse', '--show-toplevel'], requestedRoot);
  const repositoryRoot = rootResult.ok ? rootResult.stdout : requestedRoot;
  const gitFields = [
    ['branch', ['branch', '--show-current']],
    ['head', ['rev-parse', 'HEAD']],
    ['workingTree', ['status', '--short']],
  ];
  const [versions, gitResults] = await Promise.all([
    Promise.all(Object.entries(VERSION_COMMANDS).map(async ([name, [file, args]]) => {
      const result = await run(file, args, repositoryRoot);
      return [name, result.ok
        ? { status: 'OBSERVED', version: result.stdout.split(/\r?\n/)[0] }
        : { status: result.status ?? 'NOT_ACCESSIBLE', version: null }];
    })),
    Promise.all(gitFields.map(async ([name, args]) => [name, await run('git', args, repositoryRoot)])),
  ]);
  const tools = { node: { status: 'OBSERVED', version: process.version }, ...Object.fromEntries(versions) };
  let manifest;
  try { manifest = JSON.parse(await read(resolve(repositoryRoot, 'package.json'), 'utf8')); } catch { manifest = null; }
  const git = Object.fromEntries(gitResults.map(([name, result]) => [name, result.ok ? result.stdout : null]));
  return {
    mode: 'READ_ONLY_OBSERVATION',
    generatedAt: new Date().toISOString(),
    host: { platform: process.platform, release: release(), architecture: arch(), shell: 'NOT_INSPECTED: report the host shell version separately.' },
    repositoryRoot,
    repositoryRootVerified: rootResult.ok,
    git,
    tools,
    project: { name: manifest?.name ?? null, manifestStatus: manifest ? 'OBSERVED' : 'NOT_ACCESSIBLE' },
    compatibility: compareRequirements(manifest, tools),
    commands: Object.entries(manifest?.scripts ?? {}).map(([name, definition]) => commandInfo(name, String(definition))),
    limitations: ['Version availability does not establish application behavior or deployment readiness.', 'No environment-file values or package script bodies were executed.'],
  };
}

export function formatHuman(report, includeCommands = false) {
  const lines = [
    `Environment Doctor — ${report.project.name ?? '(manifest unavailable)'}`,
    `Root: ${report.repositoryRoot}`,
    `Branch: ${report.git.branch ?? 'UNKNOWN'}; HEAD: ${report.git.head ?? 'UNKNOWN'}`,
    `Working tree:\n${report.git.workingTree ?? 'UNKNOWN'}`,
  ];
  for (const [name, tool] of Object.entries(report.tools)) lines.push(`${name}: ${tool.version ?? tool.status}`);
  for (const [name, check] of Object.entries(report.compatibility)) lines.push(`${name} requirement: ${check.declared ?? 'UNKNOWN'} — ${check.status}`);
  lines.push(`Root scripts discovered: ${report.commands.length}; none executed.`);
  if (includeCommands) for (const item of report.commands) {
    lines.push(`\n${item.name}: ${item.definition}`, `  Purpose: ${item.purpose}`, `  ${item.effect}; ${item.protectedWork}`, `  Scope: ${item.scope.join(', ')}`, `  ${item.authorization}`);
  }
  return lines.join('\n');
}

export function parseArgs(args) {
  const options = { json: false, commands: false, help: false, root: process.cwd() };
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--json') options.json = true;
    else if (args[i] === '--commands') options.commands = true;
    else if (args[i] === '--help' || args[i] === '-h') options.help = true;
    else if (args[i] === '--root' && args[i + 1]) options.root = args[++i];
    else throw new Error(`Unknown or incomplete option: ${args[i]}`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Usage: node scripts/diagnostics/environment-doctor.mjs [--json] [--commands] [--root PATH]\nRead-only versions, Git metadata, and manifest discovery. No application scripts are executed.\n');
    return;
  }
  const report = await inspectEnvironment(options);
  process.stdout.write(`${options.json ? JSON.stringify(report, null, 2) : formatHuman(report, options.commands)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { process.stderr.write(`Environment Doctor: ${error.message}\n`); process.exitCode = 1; });
}
