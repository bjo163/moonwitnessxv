import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  factoryCopy,
  factoryMessage,
  planFiles,
  runAppCreate,
  validateAppSlug,
} from '../../scripts/app-create.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function makeRoot() {
  const root = mkdtempSync(join(tmpdir(), 'app-create-'));
  mkdirSync(join(root, 'apps'));
  return root;
}

// The temp root has no node_modules, so the generated source cannot resolve
// its workspace/react deps by itself. For the "sample app builds" proof we run
// the repository's own tsc over the generated files with a harness tsconfig
// that maps `@moonwitness/*` and the React type packages back to the real
// install (paths/typeRoots) and extends the repository tsconfig.base.json.
function findPnpmEntry(prefix) {
  const pnpm = join(repoRoot, 'node_modules', '.pnpm');
  if (!existsSync(pnpm)) return null;
  for (const name of readdirSync(pnpm)) {
    if (name.startsWith(prefix)) return name;
  }
  return null;
}

function frontendTypecheck(root, slug) {
  const tsName = findPnpmEntry('typescript@');
  const reactName = findPnpmEntry('@types+react@');
  const domName = findPnpmEntry('@types+react-dom@');
  const nodeName = findPnpmEntry('@types+node@');
  assert.ok(tsName && reactName && domName && nodeName, 'repository typescript/@types must be installed');
  const tscBin = join(repoRoot, 'node_modules', '.pnpm', tsName, 'node_modules', 'typescript', 'bin', 'tsc');
  assert.ok(existsSync(tscBin), `tsc entrypoint present at ${tscBin}`);
  const reactTypesRoot = join(repoRoot, 'node_modules', '.pnpm', reactName, 'node_modules', '@types');
  const domTypesRoot = join(repoRoot, 'node_modules', '.pnpm', domName, 'node_modules', '@types');
  const nodeTypesRoot = join(repoRoot, 'node_modules', '.pnpm', nodeName, 'node_modules', '@types');
  const harness = {
    extends: `${repoRoot.replace(/\\/g, '/')}/tsconfig.base.json`,
    compilerOptions: {
      noEmit: true,
      composite: false,
      incremental: false,
      declaration: false,
      declarationMap: false,
      module: 'ESNext',
      moduleResolution: 'Bundler',
      jsx: 'react-jsx',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      types: ['react', 'react-dom', 'node'],
      typeRoots: [reactTypesRoot, domTypesRoot, nodeTypesRoot],
      baseUrl: repoRoot,
      paths: {
        '@moonwitness/core': ['packages/core/dist/index.d.ts'],
        '@moonwitness/moonui': ['packages/moonui/dist/index.d.ts'],
        react: [`node_modules/.pnpm/${reactName}/node_modules/@types/react`],
        'react/jsx-runtime': [`node_modules/.pnpm/${reactName}/node_modules/@types/react/jsx-runtime`],
        'react-dom': [`node_modules/.pnpm/${domName}/node_modules/@types/react-dom`],
        'react-dom/client': [`node_modules/.pnpm/${domName}/node_modules/@types/react-dom/client`],
      },
    },
    include: ['src/**/*.ts', 'src/**/*.tsx'],
  };
  const harnessPath = join(root, 'apps', slug, 'tsconfig.harness.json');
  writeFileSync(harnessPath, `${JSON.stringify(harness, null, 2)}\n`, 'utf8');
  return spawnSync(process.execPath, [tscBin, '-p', harnessPath], { encoding: 'utf8' });
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
  assert.equal(first.length, 5);
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
  assert.match(out.at(-1), /created 5 file\(s\)/);
  for (const file of planFiles('new-app', 'worker')) {
    const written = readFileSync(join(root, file.relPath), 'utf8');
    assert.equal(written, file.content);
  }
  const manifest = JSON.parse(readFileSync(join(root, 'apps', 'new-app', 'package.json'), 'utf8'));
  assert.equal(manifest.name, '@moonwitness/new-app');
  assert.equal(manifest.private, true);
});

test('M05-20: worker has in-process health, graceful signals and stable machine failure code', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(run(['sample-worker'], root).code, 0);
  const typecheck = frontendTypecheck(root, 'sample-worker');
  assert.equal(typecheck.status, 0, `generated worker typecheck failed:\n${typecheck.stdout}\n${typecheck.stderr}`);
  const plan = planFiles('sample-worker', 'worker');
  const entry = plan.find((file) => file.relPath.replaceAll('\\', '/').endsWith('/src/index.ts')).content;
  const runtime = plan.find((file) => file.relPath.replaceAll('\\', '/').endsWith('/src/worker-runtime.ts')).content;
  const manifest = JSON.parse(plan.find((file) => file.relPath.endsWith('package.json')).content);

  assert.match(entry, /SIGINT/);
  assert.match(entry, /SIGTERM/);
  assert.match(entry, /WORKER_ERROR:\$\{code\}/);
  assert.match(entry, /process\.exitCode = 1/);
  assert.match(runtime, /getWorkerHealth/);
  assert.match(runtime, /WORKER_FAILED/);
  assert.deepEqual(Object.keys(manifest.dependencies), ['@moonwitness/core']);
  assert.equal(plan.some((file) => /\\.(tsx|jsx)$/.test(file.relPath)), false);
  assert.doesNotMatch(plan.map((file) => file.content).join('\n'), /\.listen\(|createServer|process\.env\.PORT|postgres|drizzle/i);

  const generatedRoot = join(root, 'apps', 'sample-worker');
  const runtimeUrl = pathToFileURL(join(generatedRoot, 'src', 'worker-runtime.ts')).href;
  const script = `
    const runtime = await import(${JSON.stringify(runtimeUrl)});
    const controller = new AbortController();
    let duringTask;
    const running = runtime.runWorker(async (signal) => {
      duringTask = runtime.getWorkerHealth();
      controller.abort();
      await new Promise((resolve) => {
        signal.addEventListener('abort', resolve, { once: true });
        if (signal.aborted) resolve();
      });
    }, controller.signal);
    await running;
    const stopped = runtime.getWorkerHealth();
    const failureController = new AbortController();
    let failureCode;
    try { await runtime.runWorker(async () => { throw new Error('private detail'); }, failureController.signal); }
    catch (error) { failureCode = error.code; }
    console.log(JSON.stringify({ duringTask, stopped, failureCode, failedHealth: runtime.getWorkerHealth() }));
  `;
  const result = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '--eval', script], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.deepEqual(JSON.parse(result.stdout.trim()), {
    duringTask: { status: 'ready', healthy: true },
    stopped: { status: 'stopped', healthy: false },
    failureCode: 'WORKER_FAILED',
    failedHealth: { status: 'failed', healthy: false },
  });
  assert.doesNotMatch(result.stdout, /private detail/);
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

test('negative: failed generation removes only files created by this run', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const factoryUrl = pathToFileURL(join(repoRoot, 'scripts', 'app-create.mjs')).href;
  const source = [
    "import fs from 'node:fs'",
    "import { syncBuiltinESMExports } from 'node:module'",
    "import { join } from 'node:path'",
    'const originalWriteFileSync = fs.writeFileSync',
    'let writes = 0',
    'fs.writeFileSync = (file, ...args) => {',
    '  writes += 1',
    '  if (writes === 2) {',
    "    originalWriteFileSync(join(process.argv[1], 'apps', 'new-app', 'concurrent.txt'), 'keep', 'utf8')",
    "    throw new Error('simulated write failure')",
    '  }',
    '  return originalWriteFileSync(file, ...args)',
    '}',
    'syncBuiltinESMExports()',
    'const { runAppCreate } = await import(process.argv[2])',
    "const result = runAppCreate({ argv: ['new-app'], root: process.argv[1], env: {}, stdout: () => {}, stderr: () => {} })",
    'process.stdout.write(String(result))',
  ].join('\n');
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', source, root, factoryUrl], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '1');
  const appRoot = join(root, 'apps', 'new-app');
  assert.deepEqual(readdirSync(appRoot), ['concurrent.txt']);
  assert.equal(readFileSync(join(appRoot, 'concurrent.txt'), 'utf8'), 'keep');
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

test('positive: frontend variant dry-run lists the skeleton files and writes nothing', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { code, out } = run(['new-app', '--variant', 'frontend', '--dry-run'], root);
  assert.equal(code, 0);
  assert.match(out[0], /DRY RUN/);
  const printed = out.slice(1).map((line) => resolve(root, line.trim()));
  const plan = planFiles('new-app', 'frontend');
  assert.deepEqual(printed, plan.map((file) => join(root, file.relPath)));
  assert.deepEqual(readdirSync(join(root, 'apps')), []);
});

test('positive: frontend write mode produces a skeleton that typechecks (tsc --noEmit)', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { code } = run(['sample-app', '--variant', 'frontend'], root);
  assert.equal(code, 0);
  for (const file of planFiles('sample-app', 'frontend')) {
    assert.ok(existsSync(join(root, file.relPath)), `${file.relPath} must be written`);
  }
  const result = frontendTypecheck(root, 'sample-app');
  assert.equal(result.status, 0, `tsc --noEmit failed:\n${result.stdout}\n${result.stderr}`);
});

test('positive: frontend emits valid JSON fixtures and syntactically parseable config', () => {
  const plan = planFiles('sample-app', 'frontend');
  const manifest = JSON.parse(plan.find((f) => f.relPath.endsWith('package.json')).content);
  assert.equal(manifest.name, '@moonwitness/sample-app');
  assert.equal(manifest.private, true);
  assert.ok(manifest.dependencies['@moonwitness/core'], 'inherits the shared i18n package');
  assert.ok(manifest.dependencies['@moonwitness/moonui'], 'inherits MoonUI');
  for (const script of ['dev', 'build', 'lint', 'test', 'typecheck']) {
    assert.equal(typeof manifest.scripts[script], 'string', `frontend must emit a ${script} script`);
  }
  const tsconfig = JSON.parse(plan.find((f) => f.relPath.endsWith('tsconfig.json')).content);
  assert.equal(tsconfig.compilerOptions.jsx, 'react-jsx');
  assert.deepEqual(tsconfig.include, ['src']);
});

test('positive: frontend inherits the shared i18n catalog (id+en keys) with a selector and a11y labels', () => {
  const plan = planFiles('sample-app', 'frontend');
  const read = (suffix) => plan.find((f) => f.relPath.replace(/\\/g, '/').endsWith(suffix)).content;

  // Inheritance, not duplication: the catalog is built by @moonwitness/core.
  const locale = read('src/locale.ts');
  assert.match(locale, /from '@moonwitness\/core'/);
  assert.match(locale, /defineLocaleCatalog/);
  assert.match(locale, /getLocaleMessage/);
  assert.doesNotMatch(locale, /class .*Translator|new Map\(\)|function translate\(/, 'no second i18n engine');

  // Both locales present with the same stable keys (LocaleCatalog<AppCopyKey> enforces parity).
  const enBlock = /en: \{([\s\S]*?)\n\s+\}/.exec(locale)[1];
  const idBlock = /id: \{([\s\S]*?)\n\s+\}/.exec(locale)[1];
  const keys = (block) => [...block.matchAll(/^\s+(\w+):/gm)].map((m) => m[1]).sort();
  assert.ok(keys(enBlock).length >= 8);
  assert.deepEqual(keys(idBlock), keys(enBlock));

  // MoonUI consumed from the shared design system.
  assert.match(read('src/App.tsx'), /from '@moonwitness\/moonui'/);

  // Working id/en selector with an accessibility label.
  const selector = read('LocaleSelector.tsx');
  assert.match(selector, /SelectInput/);
  assert.match(selector, /aria-label=/);
  assert.match(selector, /SUPPORTED_LOCALES\.map/);

  // Routing scaffold present and locale-aware.
  const router = read('src/router.ts');
  assert.match(router, /export const ROUTES/);
  assert.match(router, /function matchRoute/);
  assert.match(router, /function localizedPath/);
  assert.match(read('test/router.test.ts'), /locale-prefixed routes match supported locales/);

  // App renders a11y labels on the nav and current route.
  const app = read('src/App.tsx');
  assert.match(app, /aria-label=\{copy\(locale, 'navigationLabel'\)\}/);
  assert.match(app, /aria-current=/);
  assert.match(app, /window\.history\.pushState/);
  assert.match(app, /addEventListener\('popstate'/);
  assert.match(app, /localStorage\.getItem/);
  assert.match(app, /catch \{/);
});

test('negative: frontend rejects an invalid slug before writing anything', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const bad of ['../escape', 'UPPER', 'a/b', 'radio']) {
    const { code } = run([bad, '--variant', 'frontend', '--dry-run'], root);
    assert.equal(code, 1, `${bad} must be rejected`);
  }
  assert.deepEqual(readdirSync(join(root, 'apps')), []);
});

test('negative: frontend refuses an existing app directory with no overwrite', (t) => {
  const root = makeRoot();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'apps', 'sample-app'));
  writeFileSync(join(root, 'apps', 'sample-app', 'keep.txt'), 'untouched', 'utf8');
  const { code, err } = run(['sample-app', '--variant', 'frontend'], root);
  assert.equal(code, 1);
  assert.match(err.join('\n'), /refusing to overwrite/i);
  assert.equal(readFileSync(join(root, 'apps', 'sample-app', 'keep.txt'), 'utf8'), 'untouched');
  assert.equal(existsSync(join(root, 'apps', 'sample-app', 'src')), false);
});

test('negative: frontend template fabricates no port/DB/Hub and no Docker/Compose/runner wiring', () => {
  // Scan emitted source/config, not the README (whose prose documents the very
  // boundary we are asserting here, mentioning "Docker/Compose/Hub/port").
  const combined = planFiles('sample-app', 'frontend')
    .filter((file) => !file.relPath.replace(/\\/g, '/').endsWith('README.md'))
    .map((file) => `${file.relPath}\n${file.content}`)
    .join('\n');
  const forbidden = [
    /docker/i,
    /compose/i,
    /dev\.mjs/,
    /\bcreateServer\b/,
    /\.listen\(/,
    /\bprocess\.env\.PORT\b/,
    /\bport:\s*\d/i,
    /:\d{4}\b/,
    /drizzle|postgres|mysql/i,
    /second hub|\bhub\b.*=|headquarters client/i,
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(combined), false, `frontend template must not contain ${pattern}`);
  }
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
