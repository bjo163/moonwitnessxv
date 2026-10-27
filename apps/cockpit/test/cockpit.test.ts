import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer, type AddressInfo } from 'node:net'
import { statSync } from 'node:fs'
import { join } from 'node:path'
import { loadMoondeckConfig, DEFAULT_CONFIG } from '../src/config.js'
import { ProcessSupervisor, probePortBusy, resolveServicePort } from '../src/supervisor.js'
import { ProgressTracker } from '../src/progressTracker.js'
import { findRepoRoot, resolveRegisterPath } from '../src/paths.js'
import type { ProgressPayload } from '../src/progressTracker.js'
import { createCockpitServer } from '../src/server.js'

void test('Moondeck Config: loads configuration with 8 supervised services and port 3004', async () => {
  const config = await loadMoondeckConfig()
  assert.equal(config.port, 3004)
  assert.ok(Array.isArray(config.services))
  assert.equal(config.services.length, 8)

  const tags = config.services.map((s) => s.tag)
  assert.deepEqual(tags, ['radio', 'dock', 'hq', 'ai', 'skylink', 'echolog', 'orbit', 'sentinel'])
  // Every new app must be reachable by its real package, not a copied string.
  assert.equal(config.services.find((s) => s.tag === 'orbit')?.pkg, '@moonwitness/orbit')
  assert.equal(config.services.find((s) => s.tag === 'skylink')?.port, 3005)
  assert.equal(config.services.find((s) => s.tag === 'echolog')?.port, 3006)
})

void test('ProcessSupervisor: initializes states for all services', () => {
  const supervisor = new ProcessSupervisor(DEFAULT_CONFIG)
  const states = supervisor.getStates()
  assert.equal(states.length, 8)
  for (const s of states) {
    assert.equal(s.status, 'STOPPED')
    assert.equal(s.uptimeSeconds, 0)
    assert.equal(s.restarts, 0)
  }
})

/** Occupy an ephemeral port on a given host so the test never races a real service. */
async function occupy(host: string): Promise<{ port: number; close: () => Promise<void> }> {
  const server = createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, host, () => resolve())
  })
  const { port } = server.address() as AddressInfo
  return {
    port,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  }
}

function configWithSkylinkPort(port: number) {
  return {
    ...DEFAULT_CONFIG,
    services: DEFAULT_CONFIG.services.map((svc) => (svc.tag === 'skylink' ? { ...svc, port } : svc)),
  }
}

// Both address families matter: `radio` binds 0.0.0.0 and `dock`/`hq`/`orbit` are
// wildcard Next servers, while SKYLINK/ECHOLOG bind loopback. A bind-based probe
// only saw the loopback case and let the wildcard ones through on Windows.
for (const host of ['127.0.0.1', '0.0.0.0']) {
  void test(`ProcessSupervisor: refuses to double-spawn when ${host} holds the port`, async () => {
    const holder = await occupy(host)
    const supervisor = new ProcessSupervisor(configWithSkylinkPort(holder.port))
    try {
      const started = await supervisor.start('skylink')
      assert.equal(started, false, 'a bound port must not be spawned twice')
      const state = supervisor.getState('skylink')
      assert.equal(state?.status, 'ERROR')
      assert.match(state?.lastError ?? '', /already in use/)
      assert.match(state?.lastError ?? '', /pnpm dev/, 'the message must name the likely cause')
    } finally {
      await holder.close()
      supervisor.stopAll()
    }
  })
}

void test('ProcessSupervisor: restart reports the real outcome instead of a fixed true', async () => {
  const holder = await occupy('127.0.0.1')
  const supervisor = new ProcessSupervisor(configWithSkylinkPort(holder.port))
  try {
    const restarted = await supervisor.restart('skylink')
    assert.equal(restarted, false, 'a restart that cannot bind must not claim success')
    assert.equal(supervisor.getState('skylink')?.status, 'ERROR')
  } finally {
    await holder.close()
    supervisor.stopAll()
  }
})

// Positive path: without this, deleting the probe's IPv6 half or inverting its
// "is busy" rule keeps the refusal-only tests green while every real start is
// refused. A free port must probe as free.
void test('probePortBusy: a released ephemeral port is free, not busy', async () => {
  const holder = await occupy('127.0.0.1')
  const port = holder.port
  await holder.close()
  assert.equal(await probePortBusy(port), false, 'a port with no listener must not read as busy')
})

void test('probePortBusy: an IPv6-only listener is still detected', async (t) => {
  let holder: { port: number; close: () => Promise<void> }
  try {
    holder = await occupy('::1')
  } catch {
    t.skip('IPv6 is unavailable on this host')
    return
  }
  try {
    assert.equal(await probePortBusy(holder.port), true, 'the ::1 probe must catch an IPv6-only listener')
  } finally {
    await holder.close()
  }
})

void test('resolveServicePort: honors the hub alias override and pins the generic-PORT service', () => {
  const radio = DEFAULT_CONFIG.services.find((s) => s.tag === 'radio')
  const skylink = DEFAULT_CONFIG.services.find((s) => s.tag === 'skylink')
  assert.ok(radio && skylink, 'radio and skylink must be seeded in DEFAULT_CONFIG')
  // The hub resolves an operator override through ARSY_PORT.
  assert.equal(resolveServicePort(radio, { ARSY_PORT: '3010' }), 3010)
  assert.equal(resolveServicePort(radio, {}), radio.port)
  // SKYLINK reads the generic PORT the hub also owns, so it deliberately does NOT
  // resolve through env; the guard pins its own port instead of probing 3000.
  assert.equal(resolveServicePort(skylink, { PORT: '3000' }), skylink.port)
  assert.equal(skylink.portPinKey, 'PORT')
})

void test('Cockpit Fastify Server: serves API and static assets', async () => {
  const supervisor = new ProcessSupervisor(DEFAULT_CONFIG)
  const registerPath = resolveRegisterPath()
  const registerBefore = statSync(registerPath)
  const tracker = new ProgressTracker({ filePath: registerPath })
  tracker.start()
  const app = createCockpitServer(DEFAULT_CONFIG, supervisor, tracker)

  // The tracker installs a non-unref'd poll on purpose; a failed assertion here
  // must not leave it running and hang the test process.
  try {
  // /health
  const healthRes = await app.inject({ method: 'GET', url: '/health' })
  assert.equal(healthRes.statusCode, 200)
  const healthBody = JSON.parse(healthRes.body)
  assert.equal(healthBody.status, 'ok')
  assert.equal(healthBody.app, 'moondeck')

  // /api/config
  const configRes = await app.inject({ method: 'GET', url: '/api/config' })
  assert.equal(configRes.statusCode, 200)
  const configBody = JSON.parse(configRes.body)
  assert.equal(configBody.port, 3004)

  // /api/status
  const statusRes = await app.inject({ method: 'GET', url: '/api/status' })
  assert.equal(statusRes.statusCode, 200)
  const statusBody = JSON.parse(statusRes.body)
  assert.equal(statusBody.services.length, 8)

  // /api/errors
  const errorsRes = await app.inject({ method: 'GET', url: '/api/errors' })
  assert.equal(errorsRes.statusCode, 200)
  const errorsBody = JSON.parse(errorsRes.body) as { path?: string }
  assert.equal(
    errorsBody.path,
    join(findRepoRoot(), 'dev-errors.log'),
    'the ledger must read the file the supervisor writes',
  )

  // Static files
  const htmlRes = await app.inject({ method: 'GET', url: '/' })
  assert.equal(htmlRes.statusCode, 200)
  assert.ok(htmlRes.headers['content-type']?.includes('text/html'))
  assert.ok(htmlRes.body.toLowerCase().includes('moondeck'))

  const cssRes = await app.inject({ method: 'GET', url: '/cockpit.css' })
  assert.equal(cssRes.statusCode, 200)
  assert.ok(cssRes.headers['content-type']?.includes('text/css'))

  const jsRes = await app.inject({ method: 'GET', url: '/cockpit.js' })
  assert.equal(jsRes.statusCode, 200)
  assert.ok(jsRes.headers['content-type']?.includes('application/javascript'))

  // BGM audio file
  const bgmRes = await app.inject({ method: 'GET', url: '/bgm.mp3' })
  assert.equal(bgmRes.statusCode, 200)
  assert.equal(bgmRes.headers['content-type'], 'audio/mpeg')

  // /api/channels (BGM, Radio, IPTV)
  const channelsRes = await app.inject({ method: 'GET', url: '/api/channels' })
  assert.equal(channelsRes.statusCode, 200)
  const channelsList = JSON.parse(channelsRes.body) as Array<{ name: string; type: string }>
  assert.ok(channelsList.length >= 10)
  assert.ok(channelsList.some((c) => c.type === 'bgm'))
  assert.ok(channelsList.some((c) => c.type === 'radio'))
  assert.ok(channelsList.some((c) => c.type === 'iptv'))

  // Add custom IPTV channel
  const addChannelRes = await app.inject({
    method: 'POST',
    url: '/api/channels',
    payload: {
      name: 'Custom Test Stream',
      type: 'iptv',
      streamUrl: 'https://test.stream/live.m3u8',
      genre: 'Test',
    },
  })
  assert.equal(addChannelRes.statusCode, 200)
  const addedBody = JSON.parse(addChannelRes.body) as { name: string; type: string }
  assert.equal(addedBody.name, 'Custom Test Stream')
  assert.equal(addedBody.type, 'iptv')

  // Validation rejection
  const invalidAction = await app.inject({ method: 'POST', url: '/api/services/radio/invalid' })
  assert.equal(invalidAction.statusCode, 400)

  // TODO register progress is a read-only projection of the real TODO.md
  const progressRes = await app.inject({ method: 'GET', url: '/api/progress' })
  assert.equal(progressRes.statusCode, 200)
  const progressBody = JSON.parse(progressRes.body) as ProgressPayload
  assert.ok(progressBody.total > 0, 'the register must parse')
  assert.equal(progressBody.done + progressBody.open, progressBody.total)
  assert.equal(typeof progressBody.percent, 'number')
  assert.ok(progressBody.milestones.length >= 29, 'every established milestone should appear')
  assert.equal(progressBody.source, 'TODO.md')
  assert.ok(progressBody.groups.length >= 8)
  assert.equal(
    progressBody.groups.reduce((sum, g) => sum + g.total, 0),
    progressBody.total,
    'group buckets must account for every row',
  )

  // The wire payload is a projection: lifetime flip counters, no row slice and
  // no absolute path. Rows come from /api/todo/tasks only.
  assert.ok(progressBody.flipTotals, 'lifetime flip counters must be present')
  assert.equal(typeof progressBody.flipTotals.closed, 'number')
  assert.equal(progressBody.registerLabel, 'TODO.md')
  assert.equal('tasks' in (progressBody as unknown as Record<string, unknown>), false, 'row slice must not ride the payload')
  assert.equal(
    'registerPath' in (progressBody as unknown as Record<string, unknown>),
    false,
    'absolute path must not leak',
  )

  const tasksRes = await app.inject({ method: 'GET', url: '/api/todo/tasks?milestone=M27&status=open' })
  assert.equal(tasksRes.statusCode, 200)
  const tasksBody = JSON.parse(tasksRes.body) as { rows: Array<{ milestone: string; status: string }> }
  assert.ok(tasksBody.rows.length > 0, 'M27 has open rows')
  assert.ok(tasksBody.rows.every((r) => r.milestone === 'M27' && r.status === 'open'))

  const closedRes = await app.inject({ method: 'GET', url: '/api/todo/tasks?milestone=M00&status=done' })
  assert.equal(closedRes.statusCode, 200)
  const closedBody = JSON.parse(closedRes.body) as { rows: Array<{ status: string }> }
  assert.ok(closedBody.rows.every((r) => r.status === 'done'))

  const oversizedRes = await app.inject({ method: 'GET', url: '/api/todo/tasks?status=all&limit=9999' })
  assert.equal(oversizedRes.statusCode, 200)
  const oversizedBody = JSON.parse(oversizedRes.body) as { returned: number }
  assert.ok(oversizedBody.returned <= 400, 'the drill-down must stay bounded')

  // A non-numeric limit used to become NaN and silently return no rows.
  const bogusLimitRes = await app.inject({ method: 'GET', url: '/api/todo/tasks?status=all&limit=abc' })
  assert.equal(bogusLimitRes.statusCode, 200)
  const bogusBody = JSON.parse(bogusLimitRes.body) as { returned: number; matched: number }
  assert.equal(typeof bogusBody.returned, 'number')
  assert.equal(bogusBody.returned, Math.min(bogusBody.matched, 400), 'a non-numeric limit must fall back to the cap')

  // Reading the register must never write to it
  const registerAfter = statSync(registerPath)
  assert.equal(registerAfter.size, registerBefore.size, 'TODO.md size must be untouched')
  assert.equal(registerAfter.mtimeMs, registerBefore.mtimeMs, 'TODO.md mtime must be untouched')

  // Vite Client bundle verification
  const scriptMatch = htmlRes.body.match(/src="(\/assets\/[^"]+\.js)"/)
  if (scriptMatch) {
    const assetUrl = scriptMatch[1]
    const bundleRes = await app.inject({ method: 'GET', url: assetUrl })
    assert.equal(bundleRes.statusCode, 200)
    assert.ok(bundleRes.headers['content-type']?.includes('javascript'))
    assert.equal(/ledgerErrors\b/.test(bundleRes.body), false, 'Bundle must not contain unreferenced ledgerErrors')
  }

  } finally {
    await app.close()
    tracker.stop()
  }
})
