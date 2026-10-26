import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Contracts the two Dockerfiles have to keep with the rest of the workspace.
 *
 * These exist because the images drifted away from the monorepo silently, and
 * every one of the failures below is a build that stops before it produces a
 * container — or a container that dies at boot:
 *
 * - `pnpm install --frozen-lockfile` refuses to install when an importer in
 *   pnpm-lock.yaml has no `package.json` in the COPY layer, so a new workspace
 *   member breaks *both* manifests stages of *both* Dockerfiles at once;
 * - a declared dependency of the hub with no `dist` copy makes the container
 *   fail at import time, long after a green build;
 * - `next start` serves `public/` from disk, not out of `.next`, so an image
 *   without it renders a page of 404s;
 * - a build stage that runs the root `pnpm build` demands the sources of every
 *   app in the repo, including the ones an image never copies in.
 *
 * Read as text on purpose: no YAML/Dockerfile parser, only a few lines held to
 * their word. Companion to `compose-contract.test.ts`.
 */

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const dockerfile = readFileSync(`${ROOT}/Dockerfile`, 'utf8')
const dockerfileWeb = readFileSync(`${ROOT}/Dockerfile.web`, 'utf8')
const lockfile = readFileSync(`${ROOT}/pnpm-lock.yaml`, 'utf8')
const dockerignore = readFileSync(`${ROOT}/.dockerignore`, 'utf8')
const radioManifest = JSON.parse(readFileSync(`${ROOT}/apps/radio/package.json`, 'utf8')) as {
  dependencies: Record<string, string>
}

/** Every workspace member pnpm-lock.yaml knows about, as `apps/x` / `packages/y`. */
function lockfileImporters(): string[] {
  const start = lockfile.indexOf('\nimporters:\n')
  assert.ok(start >= 0, 'pnpm-lock.yaml has an importers: block')
  const rest = lockfile.slice(start + '\nimporters:\n'.length)
  // the block ends at the next top-level key (column 0)
  const end = rest.search(/^\S/m)
  const body = end >= 0 ? rest.slice(0, end) : rest
  // `m[0]` carries the two-space indent, so trim it: these paths are compared
  // against the workspace directories and pasted into COPY assertions.
  return [...body.matchAll(/^ {2}(?:apps|packages)\/[\w-]+(?=:$)/gm)].map((m) => m[0].trim())
}

/** Every `apps/*` and `packages/*` directory that actually has a manifest. */
function membersOnDisk(): string[] {
  const out: string[] = []
  for (const group of ['apps', 'packages']) {
    for (const entry of readdirSync(`${ROOT}/${group}`, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      if (existsSync(`${ROOT}/${group}/${entry.name}/package.json`)) out.push(`${group}/${entry.name}`)
    }
  }
  return out.sort()
}

/** stage name -> its text, from `FROM ... AS name` to the next `FROM`. */
function stages(source: string): Map<string, string> {
  const headers = [...source.matchAll(/^FROM [^\n]* AS ([\w-]+)$/gm)]
  assert.ok(headers.length > 0, 'the Dockerfile uses named stages')
  const out = new Map<string, string>()
  headers.forEach((header, i) => {
    const from = (header.index ?? 0) + header[0].length
    const to = i + 1 < headers.length ? headers[i + 1]!.index ?? source.length : source.length
    out.set(header[1]!, source.slice(from, to))
  })
  return out
}

const importers = lockfileImporters().sort()

test('docker: the importer scan is the workspace, not an empty match', () => {
  // Without this, a lockfile shape change could make the guard below match zero
  // paths and pass vacuously — the worst kind of green test.
  assert.deepEqual(importers, membersOnDisk(), 'pnpm-lock.yaml importers and the manifests on disk disagree')
  assert.ok(importers.length > 20, `only ${importers.length} importers parsed: the lockfile shape changed`)
})

test('docker: every workspace member has a manifest in both install stages', () => {
  for (const [file, source] of [['Dockerfile', dockerfile], ['Dockerfile.web', dockerfileWeb]] as const) {
    const byStage = stages(source)
    const missing: string[] = []
    for (const stage of ['deps', 'prod-deps']) {
      const text = byStage.get(stage)
      assert.ok(text, `${file} has a ${stage} stage`)
      for (const path of importers) {
        if (!text!.includes(`COPY ${path}/package.json ${path}/`)) missing.push(`${stage}: ${path}`)
      }
    }
    assert.deepEqual(
      missing,
      [],
      `${file} copies an incomplete workspace: pnpm refuses --frozen-lockfile when an\n` +
        `importer has no manifest. Add the missing COPY lines to ${file}:\n  ${missing.join('\n  ')}`,
    )
  }
})

test('docker: the hub image ships the dist of every dependency it declares', () => {
  const runtime = stages(dockerfile).get('runtime')
  assert.ok(runtime, 'Dockerfile has a runtime stage')

  const workspaceDeps = Object.entries(radioManifest.dependencies)
    .filter(([, spec]) => spec === 'workspace:*')
    .map(([name]) => name.replace('@moonwitness/', ''))
  assert.ok(workspaceDeps.length >= 15, `only found ${workspaceDeps.length} workspace deps — manifest read wrong?`)

  const missing = workspaceDeps.filter((dir) => !runtime!.includes(`COPY --from=build /repo/packages/${dir}/dist packages/${dir}/dist`))
  assert.deepEqual(
    missing,
    [],
    `apps/radio declares these as runtime dependencies but their dist is never copied:\n  ${missing.join('\n  ')}`,
  )
  assert.ok(runtime!.includes('COPY --from=build /repo/apps/radio/dist apps/radio/dist'), 'the hub itself is copied')
  // migrations are read off disk at boot (packages/moonql/src/client.ts)
  assert.ok(runtime!.includes('COPY --from=build /repo/packages/moonql/migrations packages/moonql/migrations'), 'moonql migrations ship with the image')
})

test('docker: the web image copies what next start reads off disk', () => {
  const runtime = stages(dockerfileWeb).get('runtime')
  assert.ok(runtime, 'Dockerfile.web has a runtime stage')
  // public/ is not bundled into .next: artwork and the PWA icon 404 without it
  assert.ok(runtime!.includes('COPY --from=build /repo/apps/${APP}/public apps/${APP}/public'), 'public/ is served by next start')
  assert.ok(runtime!.includes('COPY --from=build /repo/scripts ./scripts'), 'next.config.mjs imports the shared loader from scripts/')
  assert.ok(runtime!.includes('COPY --from=build /repo/apps/${APP}/.next apps/${APP}/.next'), 'the build output is copied')
})

test('docker: the radio build stage compiles only what it copied', () => {
  const build = stages(dockerfile).get('build')
  assert.ok(build, 'Dockerfile has a build stage')
  // the root `pnpm build` also builds cockpit/aigateway/sentinel, whose sources
  // are not in this stage: the filter would match nothing and the build fails.
  assert.doesNotMatch(build!, /^RUN pnpm build$/m, 'do not run the root build from a partial copy')
  assert.ok(build!.includes('COPY packages ./packages'), 'the whole library tree is one COPY, so no package can be forgotten')
})

test('docker: the build context excludes generated output', () => {
  const lines = dockerignore.split(/\r?\n/).map((line) => line.trim())
  for (const pattern of ['**/node_modules', '**/dist', '**/.next']) {
    assert.ok(lines.includes(pattern), `.dockerignore must exclude ${pattern}`)
  }
  assert.ok(lines.includes('.env'), 'secrets never enter the build context')
})
