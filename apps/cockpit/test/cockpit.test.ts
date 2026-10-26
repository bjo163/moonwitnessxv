import { test } from 'node:test'
import assert from 'node:assert/strict'
import { statSync } from 'node:fs'
import { loadMoondeckConfig, DEFAULT_CONFIG } from '../src/config.js'
import { ProcessSupervisor } from '../src/supervisor.js'
import { ProgressTracker } from '../src/progressTracker.js'
import { resolveRegisterPath } from '../src/paths.js'
import type { ProgressPayload } from '../src/progressTracker.js'
import { createCockpitServer } from '../src/server.js'

void test('Moondeck Config: loads configuration with 5 services and port 3004', async () => {
  const config = await loadMoondeckConfig()
  assert.equal(config.port, 3004)
  assert.ok(Array.isArray(config.services))
  assert.equal(config.services.length, 5)

  const tags = config.services.map((s) => s.tag)
  assert.deepEqual(tags, ['radio', 'dock', 'hq', 'ai', 'sentinel'])
})

void test('ProcessSupervisor: initializes states for all services', () => {
  const supervisor = new ProcessSupervisor(DEFAULT_CONFIG)
  const states = supervisor.getStates()
  assert.equal(states.length, 5)
  for (const s of states) {
    assert.equal(s.status, 'STOPPED')
    assert.equal(s.uptimeSeconds, 0)
    assert.equal(s.restarts, 0)
  }
})

void test('Cockpit Fastify Server: serves API and static assets', async () => {
  const supervisor = new ProcessSupervisor(DEFAULT_CONFIG)
  const registerPath = resolveRegisterPath()
  const registerBefore = statSync(registerPath)
  const tracker = new ProgressTracker({ filePath: registerPath })
  tracker.start()
  const app = createCockpitServer(DEFAULT_CONFIG, supervisor, tracker)

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
  assert.equal(statusBody.services.length, 5)

  // /api/errors
  const errorsRes = await app.inject({ method: 'GET', url: '/api/errors' })
  assert.equal(errorsRes.statusCode, 200)

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

  const deltaRes = await app.inject({
    method: 'GET',
    url: `/api/progress?since=${encodeURIComponent(new Date(Date.now() - 60_000).toISOString())}`,
  })
  assert.equal(deltaRes.statusCode, 200)
  assert.ok('delta' in (JSON.parse(deltaRes.body) as Record<string, unknown>))

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

  await app.close()
  tracker.stop()
})
