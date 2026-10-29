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

/**
 * Every guard here anchors on a line start, and this repo's files are not
 * guaranteed LF: pnpm writes the lockfile with the platform's line ending (this
 * checkout's pnpm-lock.yaml is CRLF), and git warns it will convert on checkout.
 * An un-normalized `\r` makes a contract either throw at parse time or match
 * nothing — a green test that checks nothing. Normalize once, at the read.
 */
const readRepoText = (rel: string): string => readFileSync(`${ROOT}/${rel}`, 'utf8').replace(/\r\n/g, '\n')

const dockerfile = readRepoText('Dockerfile')
const dockerfileWeb = readRepoText('Dockerfile.web')
const lockfile = readRepoText('pnpm-lock.yaml')
const dockerignore = readRepoText('.dockerignore')
const radioManifest = JSON.parse(readRepoText('apps/arsy/package.json')) as {
  dependencies: Record<string, string>
}

/** Every workspace member pnpm-lock.yaml knows about, as `apps/x` / `packages/y`. */
function lockfileImporters(): string[] {
  const norm = lockfile.replace(/\r\n/g, '\n')
  const start = norm.indexOf('\nimporters:\n')
  assert.ok(start >= 0, 'pnpm-lock.yaml has an importers: block')
  const rest = norm.slice(start + '\nimporters:\n'.length)
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

test('docker: the install stages derive the member manifests', () => {
  // Enumeration is what broke twice (see the header note). The stages must build
  // the manifest set from the context, so a new workspace member needs no
  // Dockerfile edit at all — and a reappearing hand list must fail the suite.
  for (const [file, source] of [['Dockerfile', dockerfile], ['Dockerfile.web', dockerfileWeb]] as const) {
    const byStage = stages(source)
    for (const stage of ['deps', 'prod-deps']) {
      const text = byStage.get(stage)
      assert.ok(text, `${file} has a ${stage} stage`)
      assert.ok(text!.includes('COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./'), `${file} ${stage} must install from the root manifests`)
      assert.match(text!, /--mount=type=bind,source=\.,target=\/ctx/, `${file} ${stage} must bind-mount the context to reach member manifests`)
      assert.match(text!, /find apps packages -mindepth 2 -maxdepth 2 -name package\.json/, `${file} ${stage} must derive the manifest set`)
      assert.doesNotMatch(text!, /^COPY (?:apps|packages)\/[\w-]+\/package\.json/m, `${file} ${stage} enumerates member manifests again — derive them`)
    }
  }
})

test('docker: the hub image ships the dist of every dependency it declares', () => {
  const runtime = stages(dockerfile).get('runtime')
  assert.ok(runtime, 'Dockerfile has a runtime stage')

  const packageDirectory = (packageName: string): string => {
    const matches = membersOnDisk()
      .filter((member) => member.startsWith('packages/'))
      .filter((member) => JSON.parse(readRepoText(`${member}/package.json`)).name === packageName)
    assert.equal(matches.length, 1, `${packageName} must resolve to exactly one packages/* workspace directory`)
    return matches[0]!.slice('packages/'.length)
  }
  const workspaceDeps = Object.entries(radioManifest.dependencies)
    .filter(([, spec]) => spec === 'workspace:*')
    .map(([name]) => ({ name, directory: packageDirectory(name) }))
  assert.ok(workspaceDeps.length >= 15, `only found ${workspaceDeps.length} workspace deps — manifest read wrong?`)

  const missing = workspaceDeps.filter(({ directory }) =>
    !runtime!.includes(`COPY --from=build /repo/packages/${directory}/dist packages/${directory}/dist`),
  )
  assert.deepEqual(
    missing,
    [],
    `apps/arsy declares these as runtime dependencies but their dist is never copied:\n  ${missing.map(({ name, directory }) => `${name} (${directory})`).join('\n  ')}`,
  )
  assert.ok(runtime!.includes('COPY --from=build /repo/apps/arsy/dist apps/arsy/dist'), 'the ARSY hub itself is copied')
  // migrations are read off disk at boot (packages/moonql/src/client.ts)
  assert.ok(runtime!.includes('COPY --from=build /repo/packages/moonql/migrations packages/moonql/migrations'), 'moonql migrations ship with the image')
})

test('docker: the web image copies what next start reads off disk', () => {
  const runtime = stages(dockerfileWeb).get('runtime')
  assert.ok(runtime, 'Dockerfile.web has a runtime stage')
  // public/ is not bundled into .next: artwork and the PWA icon 404 without it
  assert.ok(runtime!.includes('COPY --from=build /repo/apps/${APP}/public apps/${APP}/public'), 'public/ is served by next start')
  assert.ok(runtime!.includes('COPY --from=build /repo/apps/${APP}/.next apps/${APP}/.next'), 'the build output is copied')
  // next.config.mjs imports @moonwitness/web-config, and `next start` re-reads that
  // config: the package's dist has to exist, exactly like core's and moonui's.
  assert.ok(runtime!.includes('COPY --from=build /repo/packages/web-config/dist packages/web-config/dist'), 'web-config ships as a package')
  // ... and repo-root scripts must NOT be dragged in to substitute for one
  assert.doesNotMatch(runtime!, /COPY --from=build \/repo\/scripts/, 'runtime must not depend on repo-root scripts/')
})

test('docker: the radio build stage compiles only what it copied', () => {
  const build = stages(dockerfile).get('build')
  assert.ok(build, 'Dockerfile has a build stage')
  // the root `pnpm build` also builds cockpit/aigateway/sentinel, whose sources
  // are not in this stage: the filter would match nothing and the build fails.
  assert.doesNotMatch(build!, /^RUN pnpm build$/m, 'do not run the root build from a partial copy')
  assert.ok(build!.includes('COPY packages ./packages'), 'the whole library tree is one COPY, so no package can be forgotten')
})

test('docker: the hub SDK tool dependency is built before the hub', () => {
  const build = stages(dockerfile).get('build')
  assert.ok(build, 'Dockerfile has a build stage')
  const cliBuild = build!.indexOf('pnpm --filter @moonwitness/cli build')
  const hubBuild = build!.indexOf('pnpm --filter @moonwitness/arsy build')
  assert.ok(cliBuild >= 0, 'the SDK generator CLI dependency is compiled in the image build stage')
  assert.ok(hubBuild > cliBuild, 'ARSY is compiled after the CLI declarations exist')
})

test('docker: the build context excludes generated output', () => {
  const lines = dockerignore.split(/\r?\n/).map((line) => line.trim())
  for (const pattern of ['**/node_modules', '**/dist', '**/.next']) {
    assert.ok(lines.includes(pattern), `.dockerignore must exclude ${pattern}`)
  }
  assert.ok(lines.includes('.env'), 'secrets never enter the build context')
})

/**
 * The per-app service images (ECHOLOG, AI Gateway, SENTINEL) repeat the hub's
 * contract: derive the manifest set, copy the dist of every workspace dependency
 * the app declares, and run the compiled entry point. They exist so a deployment
 * platform builds one image per service; a dependency added without its dist copy
 * would fail at container import time, long after a green build.
 */
const SERVICE_IMAGES = [
  { file: 'Dockerfile.echolog', app: 'echolog', entry: 'apps/echolog/dist/index.js' },
  { file: 'Dockerfile.aigateway', app: 'aigateway', entry: 'apps/aigateway/dist/index.js' },
  { file: 'Dockerfile.sentinel', app: 'sentinel', entry: 'apps/sentinel/dist/index.js' },
] as const

function workspaceDirectory(packageName: string): string {
  const matches = membersOnDisk()
    .filter((member) => member.startsWith('packages/'))
    .filter((member) => JSON.parse(readRepoText(`${member}/package.json`)).name === packageName)
  assert.equal(matches.length, 1, `${packageName} must resolve to exactly one packages/* workspace directory`)
  return matches[0]!.slice('packages/'.length)
}

test('docker: each service image copies the dist of its declared workspace dependencies', () => {
  for (const { file, app, entry } of SERVICE_IMAGES) {
    const source = readRepoText(file)
    const byStage = stages(source)
    const runtime = byStage.get('runtime')
    assert.ok(runtime, `${file} has a runtime stage`)

    // same manifest-derivation rule as the hub and web images
    for (const stage of ['deps', 'prod-deps']) {
      const text = byStage.get(stage)
      assert.ok(text, `${file} has a ${stage} stage`)
      assert.match(text!, /find apps packages -mindepth 2 -maxdepth 2 -name package\.json/, `${file} ${stage} must derive the manifest set`)
      assert.doesNotMatch(text!, /^COPY (?:apps|packages)\/[\w-]+\/package\.json/m, `${file} ${stage} enumerates member manifests again — derive them`)
    }

    const manifest = JSON.parse(readRepoText(`apps/${app}/package.json`)) as {
      dependencies: Record<string, string>
    }
    const workspaceDeps = Object.entries(manifest.dependencies)
      .filter(([, spec]) => spec === 'workspace:*')
      .map(([name]) => ({ name, directory: workspaceDirectory(name) }))
    assert.ok(workspaceDeps.length > 0, `apps/${app} declares workspace dependencies — manifest read wrong?`)

    const missing = workspaceDeps.filter(({ directory }) =>
      !runtime!.includes(`COPY --from=build /repo/packages/${directory}/dist packages/${directory}/dist`),
    )
    assert.deepEqual(
      missing,
      [],
      `${file} never copies these declared dependencies:\n  ${missing.map(({ name, directory }) => `${name} (${directory})`).join('\n  ')}`,
    )
    assert.ok(source.includes(entry), `${file} must run ${entry}`)
  }
})

test('docker: no service image runs the root build from a partial copy', () => {
  for (const { file } of SERVICE_IMAGES) {
    const build = stages(readRepoText(file)).get('build')
    assert.ok(build, `${file} has a build stage`)
    assert.doesNotMatch(build!, /^RUN pnpm build$/m, `${file} must build its own filter, not the root build`)
    assert.ok(build!.includes('COPY packages ./packages'), `${file} copies the whole library tree`)
  }
})

/**
 * apps/empire-web runs with `output: 'export'`, so it has no Next runtime to start.
 * Its image therefore ships the exported folder behind a static server; the three
 * things that must never drift are the exported-file copy, the static-server
 * choice, and the edge header set ADR-0016 defines for the canonical host.
 */
test('docker: the static pilot ships the export behind a static server with the ADR-0016 headers', () => {
  const source = readRepoText('Dockerfile.empire-web')
  const byStage = stages(source)
  assert.ok(byStage.get('build'), 'the export is produced in a build stage')
  assert.ok(source.includes('pnpm --filter @moonwitness/empire-web build'), 'the export comes from the app build')

  const runtime = byStage.get('runtime')
  assert.ok(runtime, 'Dockerfile.empire-web has a runtime stage')
  // `stages()` slices the text after the FROM line, so the image assertion reads
  // the whole file: the runtime must be a static server, never a Next server.
  assert.match(source, /^FROM nginx:\S+ AS runtime$/m, 'the runtime is a static server')
  assert.ok(
    runtime!.includes('COPY --from=build /repo/apps/empire-web/out /usr/share/nginx/html'),
    'the exported files are what ships',
  )
  assert.doesNotMatch(source, /next start/, 'a static export has no Next runtime')

  const nginx = readRepoText('apps/empire-web/nginx.conf')
  assert.match(nginx, /listen 3010/, 'nginx listens on the registered pilot port')
  assert.match(nginx, /try_files \$uri \$uri\.html/, 'extensionless routes resolve to the exported .html file')
  // ADR-0016: indexing is decided per route by robots.ts/sitemap.ts, so a global
  // noindex header here would silently contradict them. HSTS marks the canonical host.
  assert.match(nginx, /Strict-Transport-Security "max-age=15552000"/, 'the canonical host sends HSTS')
  assert.doesNotMatch(nginx, /add_header\s+X-Robots-Tag/, 'a blanket noindex header must not override the new indexing decision')
  assert.match(nginx, /X-Content-Type-Options "nosniff"/, 'the security headers survive the change')
  assert.match(nginx, /X-Frame-Options "DENY"/, 'the frame denial survives the change')
})
