import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The workspace topology contract.
 *
 * One fact — "this package exists, and the hub uses it" — used to be written in
 * ten places that nothing tied together: the package's manifest, its tsconfig
 * references, apps/arsy's dependencies, apps/arsy/src/addons.ts, its reference
 * in ARSY's tsconfig, the root build scripts, and both Dockerfiles. `docs/audit/M13-research-contracts.md`
 * records the cost honestly: adding @moonwitness/moonql-research meant editing the
 * Dockerfiles by hand "agar gate image tetap lengkap".
 *
 * This test binds the pieces that can be derived mechanically. The Dockerfile
 * layer list is guarded by `dockerfile-contract.test.ts`; here the concern is
 * that a member's own package definition stays internally honest, that no source
 * file escapes its package, and that the hub's addon list is the truth.
 *
 * Read as text with no TypeScript-program dependency: fast, and it runs before a
 * build exists.
 */

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const readRepoText = (rel: string): string => readFileSync(join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n')

interface Manifest {
  name: string
  private?: boolean
  description?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  exports?: Record<string, unknown>
}

/** Every workspace member: dir (`packages/core`), manifest, parsed once. */
const members: { dir: string; pkg: Manifest }[] = []
for (const group of ['apps', 'packages']) {
  for (const entry of readdirSync(join(ROOT, group), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = `${group}/${entry.name}`
    const manifest = join(dir, 'package.json')
    if (!existsSync(join(ROOT, manifest))) continue
    members.push({ dir, pkg: JSON.parse(readRepoText(manifest)) as Manifest })
  }
}
const byName = new Map(members.map((m) => [m.pkg.name, m]))

/** Source files of a member (ts/tsx/mjs), the same walk as workspace-deps.test.ts. */
function sources(dir: string): string[] {
  const base = join(ROOT, dir, 'src')
  const out: string[] = []
  if (!existsSync(base)) return out
  const walk = (d: string): void => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(ts|tsx|mjs)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) out.push(full)
    }
  }
  walk(base)
  return out
}

/** Source and config files across a member, excluding compiled/dependency output. */
function memberSources(dir: string): string[] {
  const base = join(ROOT, dir)
  const out: string[] = []
  if (!existsSync(base)) return out
  const ignoredDirectories = new Set(['node_modules', 'dist', '.next', 'coverage'])
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) walk(join(directory, entry.name))
      } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        out.push(join(directory, entry.name))
      }
    }
  }
  walk(base)
  return out
}

test('topology: no source file reaches outside its own package', () => {
  // `apps/dock/src/middleware.ts` used to import `../../../scripts/security-headers.mjs`,
  // and `scripts/security-headers.mjs` re-exported `../packages/core/dist/index.js`:
  // two boundaries crossed by path, so a package's private layout became API and
  // the image had to COPY repo-root scripts to survive `next start`.
  const offenders: string[] = []
  const memberRoot = (dir: string): string => join(ROOT, dir) + sep
  for (const { dir } of members) {
    for (const file of sources(dir)) {
      const fileDir = dirname(file)
      for (const match of readFileSync(file, 'utf8').matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g)) {
        const target = resolve(fileDir, match[1])
        if (!target.startsWith(memberRoot(dir))) {
          offenders.push(`${relative(ROOT, file)} imports ${match[1]} — outside ${dir}`)
        }
      }
    }
  }
  assert.deepEqual(offenders, [], offenders.join('\n'))
})

test('topology: a tsc -b member references every workspace dependency it declares', () => {
  // Without a reference, `tsc -b` compiles against whatever dist happens to exist.
  // Build order then works by accident: it holds while the root script lists the
  // packages in the right order, and breaks for anyone building one package alone.
  const offenders: string[] = []
  for (const { dir, pkg } of members) {
    if (!/tsc -b/.test(pkg.scripts?.build ?? '')) continue
    const tsconfigPath = join(ROOT, dir, 'tsconfig.json')
    if (!existsSync(tsconfigPath)) {
      offenders.push(`${dir} builds with tsc -b but has no tsconfig.json`)
      continue
    }
    const refs = [...readRepoText(relative(ROOT, tsconfigPath)).matchAll(/"path":\s*"([^"]+)"/g)].map((m) => m[1]!)
    const prefix = dir.startsWith('apps/') ? '../../packages/' : '../'
    for (const dep of Object.keys(pkg.dependencies ?? {})) {
      if (!dep.startsWith('@moonwitness/')) continue
      const target = byName.get(dep)
      if (!target) continue // an app member: radio's deps on apps are dev-only
      const expected = `${prefix}${target.dir.split('/')[1]}`
      if (!refs.includes(expected)) offenders.push(`${dir} declares ${dep} but tsconfig has no reference to "${expected}"`)
    }
  }
  assert.deepEqual(offenders, [], offenders.join('\n'))
})

test('topology: addons.ts is exactly the addons the hub depends on', () => {
  // `addons.ts` calls itself "THE single wiring point"; this keeps the manifest
  // honest to that claim, so a dependency can no longer be declared and forgotten.
  const addonsFile = readRepoText('apps/arsy/src/addons.ts')
  const imported = [...addonsFile.matchAll(/from '(@moonwitness\/[a-z0-9-]+)'/g)]
    .map((m) => m[1]!)
    .filter((name) => name !== '@moonwitness/moonql') // the ORM itself, not an addon
  const declared = Object.keys(byName.get('@moonwitness/arsy')!.pkg.dependencies ?? {})
    .filter((name) => name.startsWith('@moonwitness/'))
    .filter((name) => name !== '@moonwitness/moonql' && name !== '@moonwitness/core')
    // whatsapp/denpa are channels mounted outside the addon registry
    .filter((name) => name !== '@moonwitness/skylink-whatsapp' && name !== '@moonwitness/denpa')

  assert.deepEqual(
    [...new Set(imported)].sort(),
    declared.sort(),
    'addons.ts imports and ARSY\'s addon dependencies must be the same set',
  )
})

function hubRuntimeOwners(workspaces: { dir: string; pkg: Manifest }[]): string[] {
  return workspaces
    .filter(({ dir, pkg }) => dir.startsWith('apps/') && ['@moonwitness/arsy', '@moonwitness/radio'].includes(pkg.name))
    .map(({ dir, pkg }) => `${dir}:${pkg.name}`)
}

test('topology: the runtime has one ARSY Hub identity and no duplicate Radio app', () => {
  const expectedHub = ['apps/arsy:@moonwitness/arsy']
  assert.deepEqual(hubRuntimeOwners(members), expectedHub)
  assert.equal(existsSync(join(ROOT, 'apps/radio/package.json')), false, 'the old app path must not remain as a second workspace')
  assert.throws(() => {
    assert.deepEqual(
      hubRuntimeOwners([...members, { dir: 'apps/radio', pkg: { name: '@moonwitness/radio' } }]),
      expectedHub,
    )
  }, 'a duplicate legacy Radio Hub workspace must fail the topology gate')
})

test('topology: every library package states its own packaging standard', () => {
  // One convention, machine-checked: `private` until ADR-0003 clears rights,
  // an exports map so deep imports cannot become API by accident, and a
  // typecheck script so `pnpm -r typecheck` cannot silently skip a package.
  const offenders: string[] = []
  for (const { dir, pkg } of members) {
    if (!dir.startsWith('packages/')) continue
    if (pkg.private !== true) offenders.push(`${dir} must set "private": true (publishing is gated on ADR-0003)`)
    if (!pkg.exports) offenders.push(`${dir} must declare an exports map`)
    if (pkg.scripts?.build && !pkg.scripts.typecheck) offenders.push(`${dir} builds but has no typecheck script (pnpm -r skips it)`)
  }
  assert.deepEqual(offenders, [], offenders.join('\n'))
})

test('topology: SQL drivers are imported only by MoonQL and the SKYLINK store', () => {
  const owners = new Set<string>()
  const driverNames = new Set(['drizzle-orm', 'postgres'])
  const importPattern = /(?:from\s*|import\s*\(\s*)['"](drizzle-orm(?:\/[^'"]*)?|postgres)['"]/g

  for (const { dir, pkg } of members) {
    const manifestDependencies = [pkg.dependencies, pkg.devDependencies, pkg.peerDependencies]
      .flatMap((dependencies) => Object.keys(dependencies ?? {}))
    if (manifestDependencies.some((name) => driverNames.has(name))) owners.add(dir)

    if (memberSources(dir).some((file) => importPattern.test(readFileSync(file, 'utf8')))) owners.add(dir)
    importPattern.lastIndex = 0
  }

  assert.deepEqual(
    [...owners].sort(),
    ['packages/moonql', 'packages/skylink-store'],
    'no app or third package may import drizzle-orm or postgres',
  )
})

test('topology: the root build scripts are derived, not enumerated', () => {
  const root = JSON.parse(readRepoText('package.json')) as { scripts: Record<string, string> }
  // `build:libs` used to list 12 of 24 packages by name, so every new library
  // needed a hand edit before the image would build. Derive it from the workspace.
  assert.match(
    root.scripts['build:libs'] ?? '',
    /--filter "\.\/packages\/\*\*" build/,
    'build:libs must select the packages glob rather than naming packages',
  )
  assert.doesNotMatch(root.scripts['build:libs'] ?? '', /--filter @moonwitness\//, 'no per-package filters in build:libs')
  assert.ok(root.scripts.build.includes('build:libs'), 'build must reuse build:libs rather than repeat the list')
  for (const app of ['arsy', 'aigateway', 'sentinel', 'cockpit', 'skylink', 'echolog']) {
    assert.ok(root.scripts.build.includes(`@moonwitness/${app} build`), `build must cover @moonwitness/${app}`)
  }
  // the two Next apps are deliberately elsewhere: root `build` is the API/image
  // chain and `build:web` owns the Next production builds
  assert.doesNotMatch(root.scripts.build, /--filter @moonwitness\/(dock|headquarters) build/, 'Next apps stay in build:web')
})
