/**
 * apps/orbit/test/orbit-runtime-smoke.test.mjs
 *
 * M40-10: the release-acceptance walkthrough, as an opt-in runtime gate.
 *
 * The unit and boundary suites prove the projection functions; this one proves the
 * shipped artifact: it starts a real `next start` server against throw-away
 * `node:http` hub stand-ins and reads the HTTP responses a browser would get.
 * Gated like the bundle scan because it needs `pnpm --filter @moonwitness/orbit build`
 * first and binds a port:
 *
 *   ORBIT_RUNTIME_SMOKE=1 pnpm --filter @moonwitness/orbit test
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 3107

const listen = (handler) =>
  new Promise((done) => {
    const server = createServer(handler)
    server.listen(0, '127.0.0.1', () => done({ server, port: server.address().port }))
  })

const freePort = async () => {
  const { server, port } = await listen(() => {})
  await new Promise((done) => server.close(done))
  return port
}

const startServer = (port) => {
  const child = spawn(
    process.execPath,
    [join(appRoot, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)],
    {
      cwd: appRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1' },
    },
  )
  let log = ''
  child.stdout.on('data', (d) => { log += d })
  child.stderr.on('data', (d) => { log += d })
  return { child, getLog: () => log }
}

const waitUp = async () => {
  for (let i = 0; i < 120; i += 1) {
    try {
      const response = await globalThis.fetch(`http://127.0.0.1:${PORT}/api/ops/state`, { cache: 'no-store' })
      if (response.status === 200 || response.status === 401) return
    } catch { /* the server is still binding */ }
    await new Promise((done) => globalThis.setTimeout(done, 250))
  }
  throw new Error('next start did not answer on its port')
}

/**
 * One acceptance run: a hub stand-in, a production server, then the checks.
 *
 * Both hub variables are set to the same value because the repository root `.env`
 * always supplies `RADIO_API_URL`, and a differing pair is a deliberate conflict.
 */
async function withRuntime(hubPort, run, envOverride = {}) {
  const url = `http://127.0.0.1:${hubPort}/api/v1`
  const keys = ['ARSY_API_URL', 'RADIO_API_URL', ...Object.keys(envOverride)]
  const previous = Object.fromEntries(keys.map((k) => [k, process.env[k]]))
  // Both hub variables are set to the same value because the repository root `.env`
  // always supplies `RADIO_API_URL`, and a differing pair is a deliberate conflict.
  process.env.ARSY_API_URL = url
  process.env.RADIO_API_URL = url
  Object.assign(process.env, envOverride)
  const server = startServer(PORT)
  try {
    await waitUp()
    return await run({ url })
  } finally {
    server.child.kill('SIGTERM')
    await new Promise((done) => globalThis.setTimeout(done, 1200))
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
  }
}

const getState = async () => {
  const response = await globalThis.fetch(`http://127.0.0.1:${PORT}/api/ops/state`, { cache: 'no-store' })
  const body = await response.json()
  return { status: response.status, cacheControl: response.headers.get('cache-control'), body }
}

const getPage = async (path = '/') => {
  const response = await globalThis.fetch(`http://127.0.0.1:${PORT}${path}`, { cache: 'no-store' })
  const html = await response.text()
  return { status: response.status, html, lang: /<html[^>]*lang="([^"]+)"/.exec(html)?.[1] }
}

const hubJson = (status, body) => async (_req, res) => {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

const healthyBody = () => ({ status: 'ok', channels: 4, timestamp: new Date().toISOString() })

test('M40-10: the production server states the truth it is given (ORBIT_RUNTIME_SMOKE=1)', async () => {
  if (process.env.ORBIT_RUNTIME_SMOKE !== '1') return
  assert.ok(existsSync(join(appRoot, '.next/BUILD_ID')), 'run `pnpm --filter @moonwitness/orbit build` first')
  const buildId = readFileSync(join(appRoot, '.next/BUILD_ID'), 'utf8')
  assert.ok(buildId.trim().length > 0, 'the build id identifies the artifact under test')

  // 1. A hub that denies the session: 401, no rows, no live claim.
  const denied = await listen(hubJson(401, { error: 'SESSION_EXPIRED' }))
  await withRuntime(denied.port, async () => {
    const api = await getState()
    assert.equal(api.status, 401, 'the BFF mirrors the hub denial')
    assert.equal(api.body.connectionStatus, 'UNAUTHORIZED')
    assert.equal(api.body.freshness, 'UNKNOWN')
    assert.deepEqual([api.body.workstations, api.body.agents, api.body.taskQueue], [[], [], []])
    assert.equal(api.cacheControl, 'no-store, no-cache, must-revalidate')

    const page = await getPage()
    assert.match(page.html, /ARSY: 401\/403/, 'the denial is named in the status bar')
    assert.doesNotMatch(page.html, /LIVE_CONNECTED/, 'a denied session is never rendered as live')
    assert.doesNotMatch(page.html, />FRESH</, 'a denied session never claims freshness')
    assert.match(page.html, /orbit-spatial-container/)
    assert.match(page.html, /orbit-2d-grid/, 'the 2D surface is in the same document as the 3D one')
  })
  denied.server.close()

  // 2. A hub that answers: live state, both locales, both render paths.
  const live = await listen(hubJson(200, healthyBody()))
  await withRuntime(live.port, async ({ url }) => {
    const api = await getState()
    assert.equal(api.body.connectionStatus, 'LIVE_CONNECTED')
    assert.equal(api.body.freshness, 'FRESH')
    assert.match(api.body.dataSource, /ARSY Hub Verified/)
    assert.ok(api.body.workstations.length > 0 && api.body.taskQueue.length > 0)

    const english = await getPage()
    assert.equal(english.lang, 'en')
    assert.match(english.html, /Data Source/)
    assert.match(english.html, />FRESH</)
    assert.ok(english.html.includes(url), 'the verified hub is named, not a guessed origin')
    assert.doesNotMatch(english.html, /\[SIMULATED\]/, 'live state carries no simulated badge')

    const indonesian = await getPage('/?locale=id')
    assert.equal(indonesian.lang, 'id', 'the document language follows the URL locale')
    assert.match(indonesian.html, /Sumber Data/)
    assert.doesNotMatch(indonesian.html, /Data Source/, 'one document does not mix both labels')

    // An unsupported value must not become a language: precedence falls through.
    const unsupported = await getPage('/?locale=fr')
    assert.equal(unsupported.lang, 'en')
    assert.doesNotMatch(unsupported.html, /Sumber Data/)

    const simulated = await getPage('/?mode=simulated')
    assert.match(simulated.html, /SIMULATED/)
    assert.match(simulated.html, /orbit-handoff-inline/, 'the approval handoff is marked without selection')
  })
  live.server.close()

  // 3. A hub whose answer is old: connected, but not fresh.
  const stale = await listen(hubJson(200, {
    status: 'ok', channels: 1, timestamp: new Date(Date.now() - 11 * 60_000).toISOString(),
  }))
  await withRuntime(stale.port, async () => {
    const api = await getState()
    assert.equal(api.body.connectionStatus, 'LIVE_CONNECTED')
    assert.equal(api.body.freshness, 'STALE')
    const page = await getPage()
    assert.match(page.html, />STALE</)
    assert.doesNotMatch(page.html, />FRESH</)
  })
  stale.server.close()

  // 4. No hub at all: an outage, stated as one.
  const gone = await freePort()
  await withRuntime(gone, async () => {
    const api = await getState()
    assert.equal(api.body.connectionStatus, 'OFFLINE')
    assert.equal(api.body.freshness, 'UNKNOWN')
    assert.match(api.body.dataSource, /Unreachable/)
    const page = await getPage()
    assert.match(page.html, /role="alert"/)
    assert.doesNotMatch(page.html, /LIVE_CONNECTED/)
  })

  // 5. Two hub URLs that disagree: fail closed instead of choosing one.
  const conflict = await listen(hubJson(200, healthyBody()))
  await withRuntime(conflict.port, async () => {
    const api = await getState()
    assert.equal(api.body.connectionStatus, 'OFFLINE', 'a contested hub origin is not a hub')
    assert.doesNotMatch(api.body.dataSource, /Verified/)
    const page = await getPage()
    assert.doesNotMatch(page.html, /LIVE_CONNECTED/)
    assert.doesNotMatch(page.html, />FRESH</)
  }, { ARSY_API_URL: 'http://127.0.0.1:1/api/v1', RADIO_API_URL: 'http://127.0.0.1:2/api/v1' })
  conflict.server.close()

  // 6. A hub that only points somewhere else: refused, and the other origin is untouched.
  let decoyHits = 0
  const decoy = await listen(() => { decoyHits += 1 })
  const redirecting = await listen((_req, res) => {
    res.writeHead(302, { location: `http://127.0.0.1:${decoy.port}/api/v1/health` })
    res.end()
  })
  await withRuntime(redirecting.port, async () => {
    const api = await getState()
    assert.equal(api.body.connectionStatus, 'OFFLINE', 'a redirect is not a verified hub')
    assert.doesNotMatch(api.body.dataSource, /Verified/)
    assert.equal(decoyHits, 0, 'ORBIT must not follow a hub redirect to another origin')
  })
  redirecting.server.close()
  decoy.server.close()
})
