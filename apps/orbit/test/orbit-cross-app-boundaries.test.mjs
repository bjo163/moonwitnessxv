/**
 * apps/orbit/test/orbit-cross-app-boundaries.test.mjs
 *
 * M40-09 — Cross-app auth, deployment and extraction boundaries.
 *
 * ORBIT is a frontend with no authority of its own. These tests bind it to
 * that description: one hub and one review surface, both resolved server-side;
 * denial when the hub says unauthorized, forbidden, unavailable or expired;
 * no credential in a config, a log line or a bundle; no database, no identity
 * and no import from another app's private internals.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { resolve, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { fetchOrbitOperationalState } from '../src/lib/server/arsy-runtime-client.ts'
import { resolveReviewSurface } from '../src/lib/server/review-surface.ts'

const appRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repoRoot = resolve(appRoot, '../..')
// A Windows checkout stores every source file with CRLF, so a multi-line
// contract assertion would pass in the working copy and fail on a fresh clone.
// All reads normalize; assertions below can then be written in LF.
const normalize = (text) => text.replace(/\r\n/g, '\n')
const read = (relative, root = appRoot) => normalize(readFileSync(join(root, relative), 'utf8'))

/** KEY=value lines of a real env file; used to prove no value reaches a chunk. */
function parseEnvFile(path) {
  const parsed = {}
  for (const line of normalize(readFileSync(path, 'utf8')).split('\n')) {
    const pair = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line)
    if (pair) parsed[pair[1]] = pair[2]
  }
  return parsed
}

const toPosix = (path) => path.split('\\').join('/')

/** Every source file under src/, build output excluded on purpose. */
function sourceFiles(dir = 'src', acc = []) {
  for (const entry of readdirSync(join(appRoot, dir), { withFileTypes: true })) {
    const path = toPosix(join(dir, entry.name))
    if (entry.isDirectory()) sourceFiles(path, acc)
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(path)
  }
  return acc
}
const SRC = sourceFiles()

/**
 * Start a throwaway stand-in for the ARSY hub so a real HTTP status reaches the
 * adapter instead of a mocked promise. Passing HANG keeps the socket open without
 * ever answering, which is how a hung hub actually behaves.
 */
function withHub(handler) {
  return new Promise((start) => {
    const hits = []
    const server = createServer((req, res) => {
      hits.push(req.url)
      if (handler === HANG) return
      const reply = handler(req)
      res.writeHead(reply.status, { 'content-type': 'application/json', ...(reply.headers ?? {}) })
      res.end(typeof reply.body === 'string' ? reply.body : JSON.stringify(reply.body))
    })
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      start({
        port,
        hits,
        env: { ARSY_API_URL: `http://127.0.0.1:${port}/api/v1`, ORBIT_SIMULATED: undefined },
        close: () => new Promise((done) => server.close(done)),
      })
    })
  })
}

const HANG = Symbol('hang')

test('M40-09: dependency ownership — no SQL driver, no second backend', () => {
  const pkg = JSON.parse(read('package.json'))
  const allowed = new Set([
    '@moonwitness/core',
    '@moonwitness/moonql-client',
    '@moonwitness/moonui',
    '@moonwitness/web-config',
    '@react-three/fiber',
    'next',
    'react',
    'react-dom',
    'three',
  ])
  for (const name of Object.keys(pkg.dependencies ?? {})) {
    assert.ok(allowed.has(name), `unexpected runtime dependency in ORBIT: ${name}`)
  }
  for (const banned of ['pg', 'mysql2', 'sqlite3', 'better-sqlite3', 'knex', 'drizzle-orm', 'prisma', '@aws-sdk/client-s3']) {
    assert.equal(
      Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }).includes(banned),
      false,
      `${banned} would make ORBIT a data owner`,
    )
  }
  assert.equal(pkg.private, true)
  assert.equal(Object.hasOwn(pkg.scripts ?? {}, 'migrate'), false)
})

test('M40-09: no database, migration or identity artifact inside ORBIT', () => {
  const artifacts = []
  const walk = (dir) => {
    for (const entry of readdirSync(join(appRoot, dir), { withFileTypes: true })) {
      if (entry.name === '.next' || entry.name === 'node_modules') continue
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/\.(sql|prisma|ddl)$/.test(entry.name) || /migration/i.test(entry.name)) artifacts.push(path)
    }
  }
  walk('.')
  assert.deepEqual(artifacts, [], 'ORBIT owns no schema')

  const claims = SRC.filter((file) => /\bD20\b|CREATE TABLE|CREATE INDEX/.test(read(file)))
  assert.deepEqual(claims, [], 'no domain-ownership or SQL claim in ORBIT source')

  const identity = SRC.filter((file) => /auth_users|createSession|issueToken|verifyPassword/.test(read(file)))
  assert.deepEqual(identity, [], 'D00/ARSY stays the only identity owner')
})

test('M40-09: no import escapes the package except shared workspace packages', () => {
  const escapes = []
  const crossApp = []
  for (const file of SRC) {
    for (const match of read(file).matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const spec = match[1]
      if (spec.startsWith('.') && spec.includes('/../../')) escapes.push(`${file}: ${spec}`)
      if (/headquarters|100center|\/apps\//i.test(spec)) crossApp.push(`${file}: ${spec}`)
    }
  }
  assert.deepEqual(escapes, [], 'ORBIT must not reach into another app by relative path')
  assert.deepEqual(crossApp, [], 'no private 100CENTER/HQ import is allowed')

  const external = new Set()
  const alias = []
  for (const file of SRC) {
    for (const match of read(file).matchAll(/from\s+['"]([^'".][^'"]*)['"]/g)) {
      const spec = match[1]
      if (spec.startsWith('@/')) {
        alias.push(`${file}: ${spec}`)
        assert.ok(
          existsSync(join(appRoot, 'src', toPosix(spec.slice(2)))),
          `${spec} must resolve inside ORBIT's own src tree`,
        )
        continue
      }
      if (!spec.startsWith('@moonwitness/')) external.add(spec.split('/')[0])
    }
  }
  for (const name of external) {
    assert.ok(
      ['next', 'react', 'three', '@react-three'].includes(name),
      `unexpected external import owner: ${name}`,
    )
  }
  assert.deepEqual(alias, ['src/app/api/ops/state/route.ts: @/lib/server/arsy-runtime-client.ts'], 'the package alias is used only by the BFF route')
})

test('M40-09: no browser-reachable import chain reaches the server directory', () => {
  const clients = SRC.filter((file) => /^'use client'/m.test(read(file)))
  assert.ok(clients.length > 0, 'the client components under test must still exist')

  const resolveSpec = (fromFile, spec) => {
    if (spec.startsWith('@/')) return `src/${toPosix(spec.slice(2))}`
    if (!spec.startsWith('.')) return null
    const joined = toPosix(resolve(join(appRoot, fromFile, '..'), spec))
    const relative = joined.startsWith(`${toPosix(appRoot)}/src/`)
      ? joined.slice(toPosix(appRoot).length + 1)
      : null
    if (relative === null) return null
    if (/\.(ts|tsx)$/.test(relative)) return relative
    return [`${relative}.tsx`, `${relative}.ts`, `${relative}/index.tsx`, `${relative}/index.ts`]
      .find((candidate) => existsSync(join(appRoot, candidate)))
  }

  const reaches = (start) => {
    const seen = new Set()
    const queue = [start]
    while (queue.length > 0) {
      const file = queue.shift()
      if (file === undefined || seen.has(file) || !existsSync(join(appRoot, file))) continue
      seen.add(file)
      for (const match of read(file).matchAll(/import\s+([\s\S]*?)\s+from\s*['"]([^'"]+)['"]/g)) {
        if (match[1].trim().startsWith('type')) continue
        const next = resolveSpec(file, match[2])
        if (next !== null) queue.push(next)
      }
    }
    return [...seen]
  }

  for (const client of clients) {
    const graph = reaches(client)
    const serverFiles = graph.filter((file) => file.startsWith('src/lib/server/'))
    assert.deepEqual(
      serverFiles,
      [],
      `${client} would ship the server resolver ${serverFiles.join(', ')} to the browser`,
    )
  }

  // Guard against a vacuous walk: the inspector really does import the handoff
  // builder, so the traversal above is following actual edges.
  assert.ok(
    reaches('src/components/OrbitNodeInspector.tsx').includes('src/lib/handoff/approval-handoff.ts'),
    'the import walk resolved no edges at all',
  )
})

test('M40-09: hub and review surface are resolved server-side only, without credentials', () => {
  const envReaders = SRC.filter((file) => read(file).includes('process.env'))
  assert.deepEqual(
    envReaders.sort(),
    ['src/lib/server/arsy-runtime-client.ts', 'src/lib/server/review-surface.ts'].sort(),
    'only modules under src/lib/server may read configuration',
  )
  assert.equal(
    read('src/lib/handoff/approval-handoff.ts').includes('process.env'),
    false,
    'the client-safe handoff builder must receive the surface as data, never resolve it',
  )

  const ALLOWED_ENV = new Set(['ARSY_API_URL', 'RADIO_API_URL', 'ORBIT_SIMULATED', 'NEXT_PUBLIC_HEADQUARTERS_URL'])
  const readKeys = new Set()
  for (const file of envReaders) {
    for (const match of read(file).matchAll(/env\.([A-Z0-9_]+)/g)) readKeys.add(match[1])
    for (const match of read(file).matchAll(/env\.(\w+)/g)) readKeys.add(match[1])
  }
  for (const key of readKeys) {
    assert.ok(ALLOWED_ENV.has(key), `ORBIT reads an undeclared variable: ${key}`)
    assert.equal(/KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL/.test(key), false, `${key} would be a credential`)
  }

  const client = read('src/lib/server/arsy-runtime-client.ts')
  assert.ok(client.includes("import { apiBaseUrl } from '@moonwitness/moonql-client'"))
  assert.ok(client.includes('apiBaseUrl(env)'), 'one shared hub resolver, no local port invention')
  assert.equal(/headers:\s*{[^}]*(authorization|cookie|api[_-]?key)/is.test(client), false, 'the hub probe carries no credential header')
  assert.equal(/fetch\([^)]*authorization/is.test(client), false)

  const browserSide = SRC.filter((file) => file.startsWith('src/components') || file.startsWith('src/app'))
  assert.deepEqual(browserSide.filter((file) => /fetch\(/.test(read(file))), [], 'the browser never dials the hub directly')

  // The env contract is only closed if it is written down: an operator who has
  // to guess invents variables, and the guess that gets made is a credential.
  const readme = read('README.md')
  assert.match(readme, /environment contract/i)
  const documented = new Set([...readme.matchAll(/`(ARSY_API_URL|RADIO_API_URL|ORBIT_SIMULATED|NEXT_PUBLIC_HEADQUARTERS_URL)`/g)].map((m) => m[1]))
  assert.deepEqual([...documented].sort(), [...ALLOWED_ENV].sort(), 'README documents exactly the variables ORBIT reads')
})

test('M40-09: expired or unauthenticated hub session denies live state', async () => {
  for (const status of [401, 403]) {
    const hub = await withHub(() => ({ status, body: { error: status === 401 ? 'SESSION_EXPIRED' : 'FORBIDDEN' } }))
    try {
      const state = await fetchOrbitOperationalState({ env: hub.env, now: Date.now() })
      assert.equal(state.connectionStatus, 'UNAUTHORIZED', `HTTP ${status} must not render live state`)
      assert.deepEqual(state.workstations, [])
      assert.deepEqual(state.agents, [])
      assert.deepEqual(state.taskQueue, [])
      assert.match(state.errorMessage ?? '', /unauthorized/i)
      assert.ok(
        state.recentTraces.some((t) => t.level === 'SECURITY'),
        'a denied session is recorded as a security event, not hidden',
      )
      assert.equal(state.freshness, 'UNKNOWN', 'an unauthorized read cannot claim freshness')
    } finally {
      await hub.close()
    }
  }
})

test('M40-09: outage, refusal and timeout all fail to an honest OFFLINE', async () => {
  const unavailable = await withHub(() => ({ status: 503, body: { error: 'SERVICE_UNAVAILABLE' } }))
  try {
    const state = await fetchOrbitOperationalState({ env: unavailable.env, now: Date.now() })
    assert.equal(state.connectionStatus, 'OFFLINE')
    assert.equal(state.freshness, 'UNKNOWN')
    assert.deepEqual(state.workstations, [])
  } finally {
    await unavailable.close()
  }

  const refused = await fetchOrbitOperationalState({
    env: { ARSY_API_URL: 'http://127.0.0.1:1/api/v1', ORBIT_SIMULATED: undefined },
    now: Date.now(),
    timeoutMs: 500,
  })
  assert.equal(refused.connectionStatus, 'OFFLINE', 'a closed port is an outage, not a simulation')

  const slow = await withHub(HANG)
  try {
    const timedOut = await fetchOrbitOperationalState({ env: slow.env, now: Date.now(), timeoutMs: 120 })
    assert.equal(timedOut.connectionStatus, 'OFFLINE', 'a hung hub is an outage')
    assert.match(timedOut.errorMessage ?? '', /abort|timeout|terminated/i)
  } finally {
    await slow.close()
  }
})

test('M40-09: a redirect away from the resolved hub is refused, not followed', async () => {
  // The decoy answers with a perfectly healthy payload. Following the redirect
  // would render it as verified live state even though nobody authorised it.
  const decoy = await withHub(() => ({
    status: 200,
    body: { status: 'ok', channels: 99, timestamp: new Date().toISOString() },
  }))
  const redirector = await withHub(() => ({
    status: 302,
    headers: { location: `http://127.0.0.1:${decoy.port}/api/v1/health` },
    body: '',
  }))
  try {
    const state = await fetchOrbitOperationalState({ env: redirector.env, now: Date.now() })
    assert.equal(state.connectionStatus, 'OFFLINE', 'a redirected probe cannot produce live state')
    assert.equal(state.freshness, 'UNKNOWN')
    assert.deepEqual(state.workstations, [])
    assert.equal(decoy.hits.length, 0, 'ORBIT never dials the redirect target')
    assert.match(state.errorMessage ?? '', /redirect/i)
  } finally {
    await redirector.close()
    await decoy.close()
  }
})

test('M40-09: conflicting hub configuration fails closed instead of picking a second hub', async () => {
  const state = await fetchOrbitOperationalState({
    env: {
      ARSY_API_URL: 'http://127.0.0.1:1/api/v1',
      RADIO_API_URL: 'http://127.0.0.1:2/api/v1',
      ORBIT_SIMULATED: undefined,
    },
    now: Date.now(),
    timeoutMs: 500,
  })
  assert.equal(state.connectionStatus, 'OFFLINE', 'two disagreeing hub URLs are an outage, not a choice')
  assert.equal(state.freshness, 'UNKNOWN')
  assert.deepEqual(state.workstations, [])
  assert.match(state.errorMessage ?? '', /conflict/i)
})

test('M40-09: corrupt or unrecognised hub output degrades without throwing', async () => {
  const bodies = [
    { status: 200, body: 'not json at all' },
    { status: 200, body: { workstations: 'oops', agents: 42, taskQueue: { not: 'an array' } } },
    { status: 200, body: { connectionStatus: 'MUSEUM', agents: [{ id: '', state: 'TELEPATHY' }] } },
  ]
  for (const fixture of bodies) {
    const hub = await withHub(() => fixture)
    try {
      const state = await fetchOrbitOperationalState({ env: hub.env, now: Date.now() })
      assert.ok(
        ['OFFLINE', 'SIMULATED_LOCAL', 'LIVE_CONNECTED', 'UNAUTHORIZED', 'UNKNOWN'].includes(state.connectionStatus),
        `connection status stays inside the contract: ${state.connectionStatus}`,
      )
      for (const agent of state.agents) {
        assert.ok(['IDLE', 'EXECUTING', 'WAITING_APPROVAL', 'PAUSED', 'FAILED', 'UNKNOWN'].includes(agent.state))
      }
      assert.ok(Array.isArray(state.taskQueue) && Array.isArray(state.recentTraces))
    } finally {
      await hub.close()
    }
  }
})

test('M40-09: a healthy hub is required before any LIVE claim', async () => {
  const fresh = new Date().toISOString()
  const hub = await withHub(() => ({ status: 200, body: { status: 'ok', channels: 3, timestamp: fresh } }))
  try {
    const state = await fetchOrbitOperationalState({ env: hub.env, now: Date.now() })
    assert.equal(state.connectionStatus, 'LIVE_CONNECTED')
    assert.equal(state.freshness, 'FRESH')
    for (const row of [...state.workstations, ...state.agents, ...state.taskQueue, ...state.recentTraces]) {
      assert.equal(row.provenance, 'LIVE', 'a live connection is the only source of LIVE provenance')
    }
  } finally {
    await hub.close()
  }

  const aged = await withHub(() => ({
    status: 200,
    body: { status: 'ok', channels: 1, timestamp: new Date(Date.now() - 11 * 60_000).toISOString() },
  }))
  try {
    const stale = await fetchOrbitOperationalState({ env: aged.env, now: Date.now() })
    assert.equal(stale.freshness, 'STALE', 'an old timestamp is stale even on a working hub')
  } finally {
    await aged.close()
  }
})

test('M40-09: the BFF route is read-only, cache-free and maps denial to 401', () => {
  const route = read('src/app/api/ops/state/route.ts')
  assert.ok(route.includes('export async function GET'), 'only a read verb is exported')
  for (const verb of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal(route.includes(`export async function ${verb}`), false, `${verb} would make ORBIT a writer`)
  }
  assert.ok(route.includes("state.connectionStatus === 'UNAUTHORIZED' ? 401 : 200"))
  assert.ok(route.includes("'cache-control': 'no-store, no-cache, must-revalidate'"))
  assert.equal(/authorization|cookie/i.test(route), false, 'no browser credential is ever relayed to the hub')
  assert.deepEqual(readdirSync(join(appRoot, 'src/app/api/ops/state')), ['route.ts'])
})

test('M40-09: deployment contract — one registered port and shared config rules', () => {
  const registry = read('scripts/apps.registry.mjs', repoRoot)
  assert.match(registry, /tag: 'orbit',[\s\S]{0,120}port: 3007/)
  const core = read('packages/core/src/workspace.ts', repoRoot)
  assert.match(core, /orbit: 3007/)

  const nextConfig = read('next.config.mjs')
  assert.ok(nextConfig.includes("from '@moonwitness/web-config'"), 'headers come from the shared owner')
  assert.ok(nextConfig.includes('loadRootEnv(process.cwd())'))
  assert.ok(nextConfig.includes('NON_FRAMING_HEADERS'))
  assert.ok(nextConfig.includes('poweredByHeader: false'))
  assert.equal(/SECURITY_HEADERS|frame-ancestors/.test(nextConfig), false, 'ORBIT must not invent its own CSP')

  const trackedSecrets = SRC.filter((file) =>
    /(SERVICE_KEY|API_KEY|SECRET|PASSWORD|TOKEN)\s*[:=]\s*['"][^'"]{6,}['"]/.test(read(file)))
  assert.deepEqual(trackedSecrets, [], 'no credential literal is configured inside ORBIT')
})

test('M40-09: nothing logs, because a log line is a bundle-shaped leak', () => {
  const noisy = SRC.filter((file) => /console\.(log|info|warn|error|debug|table)/.test(read(file)))
  assert.deepEqual(noisy, [], 'ORBIT writes no log lines that could echo a URL, header or payload')
})

test('M40-09: extraction boundary — ORBIT is described as a frontend everywhere it is named', () => {
  const readme = read('README.md')
  assert.match(readme, /frontend/i)
  const milestone = read('docs/milestones/M40.md', repoRoot)
  assert.match(milestone, /ORBIT is a frontend, not a service\/domain|frontend/i)
  assert.equal(read('BLUEPRINT.md', repoRoot).includes('D20.'), false, 'no ORBIT domain number was invented')
})

/**
 * Client-chunk scan. Opt-in because it needs a build artefact.
 *
 * A shape-only grep is noise: the WHATWG URL parser shipped inside Next assigns
 * `password:""` and React's input allowlist contains `password:!0`, and both are
 * framework code, not a leak. So the decisive test is value-based — every secret
 * that actually exists on this machine must be absent from the bundle — with the
 * shape grep kept as a narrower backstop. Failure messages name files and variable
 * names only; a value is never echoed into test output.
 */
test('M40-09: built client bundle carries no credential (run with ORBIT_SCAN_BUNDLE=1 after a build)', () => {
  if (process.env.ORBIT_SCAN_BUNDLE !== '1') return
  const staticDir = join(appRoot, '.next/static')
  assert.ok(existsSync(staticDir), 'run `pnpm --filter @moonwitness/orbit build` first')
  const chunks = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/\.(js|mjs|css|html)$/.test(entry.name) && statSync(path).size < 8_000_000) chunks.push(path)
    }
  }
  walk(staticDir)
  assert.ok(chunks.length > 0, 'the bundle produced scannable files')
  const text = chunks.map((path) => ({ path, body: readFileSync(path, 'utf8') }))

  const shapes = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /AKIA[0-9A-Z]{16}/,
    /eyJ[A-Za-z0-9_-]{12,}\.eyJ[A-Za-z0-9_-]{12,}/,
    /\bBearer\s+[A-Za-z0-9._+/-]{24,}/,
    /(password|service_key|grant_secret|api_key)\s*[:=]\s*["'][^"']{12,}["']/i,
  ]
  const shapeHits = text
    .filter((file) => shapes.some((pattern) => pattern.test(file.body)))
    .map((file) => file.path.replace(appRoot, ''))
  assert.deepEqual(shapeHits, [], 'a secret-shaped literal is present in a client chunk')

  const envFile = join(repoRoot, '.env')
  const rootEnv = existsSync(envFile) ? parseEnvFile(envFile) : {}

  const secretNames = Object.entries(rootEnv)
    .filter(([name, value]) => !name.startsWith('NEXT_PUBLIC_') && value.length >= 12)
    .filter(([, value]) => text.some((file) => file.body.includes(value)))
    .map(([name]) => name)
  assert.deepEqual(secretNames, [], 'the local .env holds values that reached the browser bundle')

  const hqOrigin = resolveReviewSurface(rootEnv).origin
  if (hqOrigin !== undefined) {
    const inlined = text.filter((file) => file.body.includes(hqOrigin)).map((file) => file.path.replace(appRoot, ''))
    assert.deepEqual(inlined, [], 'the review origin is resolved server-side and must not be inlined into a chunk')
  }
})
