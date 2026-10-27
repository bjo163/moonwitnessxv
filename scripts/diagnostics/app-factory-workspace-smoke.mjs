import assert from 'node:assert/strict'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { runAppCreate } from '../../scripts/app-create.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const fixtureRoot = mkdtempSync(join(tmpdir(), 'moonwitness-app-workspace-'))
const pnpmWorkspace = [
  "packages:",
  "  - 'apps/*'",
  "  - 'packages/*'",
  '',
  'catalog:',
  '  eslint: ^9.39.5',
  '  typescript-eslint: ^8.72.0',
  '  eslint-plugin-react-hooks: ^7.1.1',
  '',
].join('\n')

function runPnpm(args) {
  const pnpmCli = join(dirname(process.execPath), 'node_modules', 'corepack', 'dist', 'pnpm.js')
  const result = spawnSync(process.execPath, [pnpmCli, ...args], {
    cwd: fixtureRoot,
    encoding: 'utf8',
    env: { ...process.env, CI: '1' },
  })
  assert.equal(result.status, 0, `pnpm ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`)
  return result.stdout
}

function generatedApp(slug, variant) {
  const errors = []
  const result = runAppCreate({
    argv: [slug, '--variant', variant],
    root: fixtureRoot,
    env: {},
    stdout: () => {},
    stderr: (message) => errors.push(message),
  })
  assert.equal(result, 0, `generator failed: ${errors.join('\n')}`)
  return join(fixtureRoot, 'apps', slug)
}

try {
  writeFileSync(join(fixtureRoot, 'package.json'), JSON.stringify({
    name: 'moonwitness-app-factory-smoke',
    version: '0.0.0',
    private: true,
    packageManager: 'pnpm@10.33.4',
    devDependencies: {
      '@eslint/js': '^10.0.1',
      '@moonwitness/eslint-config': 'workspace:*',
      eslint: 'catalog:',
      'eslint-plugin-react-hooks': 'catalog:',
      'typescript-eslint': 'catalog:',
    },
  }, null, 2))
  writeFileSync(join(fixtureRoot, 'pnpm-workspace.yaml'), pnpmWorkspace)
  cpSync(join(repoRoot, 'eslint.config.mjs'), join(fixtureRoot, 'eslint.config.mjs'))
  writeFileSync(join(fixtureRoot, 'tsconfig.base.json'), readFileSync(join(repoRoot, 'tsconfig.base.json')))
  mkdirSync(join(fixtureRoot, 'apps'), { recursive: true })
  mkdirSync(join(fixtureRoot, 'packages'), { recursive: true })

  cpSync(join(repoRoot, 'packages', 'core'), join(fixtureRoot, 'packages', 'core'), {
    recursive: true,
    filter: (source) => !source.split(/[\\/]/).includes('node_modules') && !source.split(/[\\/]/).includes('dist'),
  })
  cpSync(join(repoRoot, 'packages', 'moonui'), join(fixtureRoot, 'packages', 'moonui'), {
    recursive: true,
    filter: (source) => !source.split(/[\\/]/).includes('node_modules') && !source.split(/[\\/]/).includes('dist'),
  })
  cpSync(join(repoRoot, 'packages', 'eslint-config'), join(fixtureRoot, 'packages', 'eslint-config'), { recursive: true })
  for (const packageName of ['core', 'moonui']) {
    cpSync(join(repoRoot, 'packages', packageName, 'dist'), join(fixtureRoot, 'packages', packageName, 'dist'), { recursive: true })
  }
  const negativeMessages = []
  const invalid = runAppCreate({
    argv: ['../escape', '--variant', 'frontend'],
    root: fixtureRoot,
    env: {},
    stdout: () => {},
    stderr: (message) => negativeMessages.push(message),
  })
  assert.equal(invalid, 1, 'traversal slugs must be rejected')
  assert.deepEqual(readdirSync(join(fixtureRoot, 'apps')), [], 'invalid slugs must leave workspace apps unchanged')
  assert.match(negativeMessages.join('\n'), /path traversal|traversal/i)

  const frontend = generatedApp('factory-frontend', 'frontend')
  const worker = generatedApp('factory-worker', 'worker')

  // Resolve all manifests automatically, then require a frozen install from that lock.
  runPnpm(['install', '--offline', '--lockfile-only', '--ignore-scripts'])
  assert.ok(existsSync(join(fixtureRoot, 'pnpm-lock.yaml')), 'pnpm must generate the lock from workspace manifests')
  runPnpm(['install', '--frozen-lockfile', '--ignore-scripts'])
  runPnpm(['--filter', '@moonwitness/factory-frontend', 'typecheck'])
  runPnpm(['--filter', '@moonwitness/factory-frontend', 'build'])
  runPnpm(['--filter', '@moonwitness/factory-frontend', 'test'])
  runPnpm(['--filter', '@moonwitness/factory-frontend', 'lint'])
  runPnpm(['--filter', '@moonwitness/factory-worker', 'typecheck'])
  runPnpm(['--filter', '@moonwitness/factory-worker', 'build'])
  process.stdout.write('Generated frontend and worker resolved from workspace manifests; automatic lockfile generation, frozen install, typechecks, Vite build, route tests, lint and worker build passed.\n')
  process.stdout.write(`Generated apps: ${frontend} and ${worker}\n`)
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true })
}
