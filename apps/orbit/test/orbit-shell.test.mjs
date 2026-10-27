import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(testDir, '..')

test('M40-01: @moonwitness/orbit package and boundary integrity', () => {
  const pkgPath = resolve(appRoot, 'package.json')
  assert.ok(existsSync(pkgPath), 'package.json must exist in apps/orbit')

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  assert.equal(pkg.name, '@moonwitness/orbit')
  assert.equal(pkg.private, true)

  // Verify scripts
  assert.ok(pkg.scripts?.dev?.includes('3007'), 'dev script must bind to port 3007')
  assert.ok(pkg.scripts?.build, 'build script must exist')
  assert.ok(pkg.scripts?.typecheck, 'typecheck script must exist')
  assert.ok(pkg.scripts?.test, 'test script must exist')

  // Verify strict frontend boundary: ZERO SQL or database owners
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  }
  const forbiddenDeps = ['drizzle-orm', 'postgres', 'pg', 'mysql', 'sqlite', 'better-sqlite3']
  for (const dep of forbiddenDeps) {
    assert.equal(allDeps[dep], undefined, `ORBIT must not depend on database library ${dep}`)
  }
})

test('M40-01: Next.js and web-config configuration integrity', () => {
  const nextConfigPath = resolve(appRoot, 'next.config.mjs')
  assert.ok(existsSync(nextConfigPath), 'next.config.mjs must exist')

  const tsconfigPath = resolve(appRoot, 'tsconfig.json')
  assert.ok(existsSync(tsconfigPath), 'tsconfig.json must exist')

  const configContent = readFileSync(nextConfigPath, 'utf8')
  assert.ok(configContent.includes('loadRootEnv'), 'next.config.mjs must use loadRootEnv')
  assert.ok(configContent.includes('NON_FRAMING_HEADERS'), 'next.config.mjs must enforce NON_FRAMING_HEADERS')
})

test('M40-01: Offline deterministic simulated fixtures', async () => {
  const fixturePath = resolve(appRoot, 'src/fixtures/simulated-operations.ts')
  assert.ok(existsSync(fixturePath), 'simulated-operations.ts fixture must exist')

  const fixtureContent = readFileSync(fixturePath, 'utf8')
  assert.ok(
    fixtureContent.includes("provenance: 'SIMULATED'"),
    'Fixtures must explicitly mark provenance as SIMULATED',
  )
  assert.ok(
    fixtureContent.includes('SIMULATED_LOCAL') || fixtureContent.includes('OFFLINE'),
    'Fixtures must declare simulated or offline connection status',
  )
})

test('M40-01: Layout and Page consume @moonwitness/moonui without hardcoded hex', () => {
  const pagePath = resolve(appRoot, 'src/app/page.tsx')
  assert.ok(existsSync(pagePath), 'src/app/page.tsx must exist')

  const pageContent = readFileSync(pagePath, 'utf8')
  assert.ok(
    pageContent.includes("@moonwitness/moonui"),
    'Page must import and consume @moonwitness/moonui',
  )

  const cssPath = resolve(appRoot, 'src/app/globals.css')
  assert.ok(existsSync(cssPath), 'src/app/globals.css must exist')

  const cssContent = readFileSync(cssPath, 'utf8')
  // Check that no rogue hex color patterns exist
  const rogueHexPatterns = [
    /#00e5ff\b/i,
    /#00ffff\b/i,
    /#ff2a85\b/i,
    /#ff1493\b/i,
    /#10b981\b/i,
    /#f59e0b\b/i,
  ]
  for (const pattern of rogueHexPatterns) {
    assert.equal(pattern.test(cssContent), false, `CSS must not contain rogue hex ${pattern}`)
  }
})
