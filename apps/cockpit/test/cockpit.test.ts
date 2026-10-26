import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadMoondeckConfig, DEFAULT_CONFIG } from '../src/config.js'
import { ProcessSupervisor } from '../src/supervisor.js'
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
  const app = createCockpitServer(DEFAULT_CONFIG, supervisor)

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
})
