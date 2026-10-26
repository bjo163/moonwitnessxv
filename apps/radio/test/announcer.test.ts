import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'
import type { Channel, SendInput, SendResult } from '../src/lib/channels.js'

/**
 * The announcer has no routes, so it is tested through the two events it exists
 * for: a listener request that should reach the DJ's messenger, and a cron that
 * failed and must not stay invisible. The channel is a stub that records sends —
 * no real messenger, no network, and no test that depends on one.
 */
function stubChannel(sent: Array<{ to: string; text: string }>): Channel {
  return {
    id: 'stub',
    label: 'Stub channel',
    status: () => ({ state: 'open' }),
    async send(input: SendInput): Promise<SendResult> {
      sent.push({ to: input.to, text: input.text })
      return { channel: 'stub', to: input.to, ok: true }
    },
  }
}

async function makeApp(sent: Array<{ to: string; text: string }>) {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = true
  config.denpa.token = 'announce-key'
  const app = await buildApp(config)
  app.channels.register(stubChannel(sent))
  return app
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 120))

const setDestination = async (app: Awaited<ReturnType<typeof makeApp>>, value: string): Promise<void> => {
  const headers = await adminHeaders(app)
  const found = await app
    .inject()
    .get(`/api/v1/settings_entries?limit=1&where=${encodeURIComponent(JSON.stringify({ key: 'announce_to' }))}`)
    .headers(headers)
    .end()
  assert.equal(found.json().data.length, 1, 'the announce group carries the destination')
  await app.inject().patch(`/api/v1/settings_entries/${found.json().data[0].id}`).headers(headers).body({ value }).end()
}

test('announcer: a listener request is announced to the configured destination', async (t) => {
  const sent: Array<{ to: string; text: string }> = []
  const app = await makeApp(sent)
  t.after(() => app.close())
  await setDestination(app, 'studio-control')

  const catalog = await app.inject().get('/api/v1/stations?limit=1').end()
  const station = catalog.json().data[0] as Record<string, unknown>
  await app
    .inject()
    .post('/api/v1/denpa')
    .headers({ 'x-denpa-key': 'announce-key' })
    .body({ msg: 'play Fracture please', station: station.name })
    .end()
  await settle()

  assert.equal(sent.length, 1, 'exactly one announcement for one request')
  assert.equal(sent[0]!.to, 'studio-control')
  assert.match(sent[0]!.text, /play Fracture please/)
  assert.match(sent[0]!.text, new RegExp(String(station.name)), 'the station is named, not an id')
  assert.match(sent[0]!.text, /dn_[0-9a-f]{16}/, 'the sender is the pseudonym, never an origin')
})

test('announcer: no destination means silence, not a failed write', async (t) => {
  const sent: Array<{ to: string; text: string }> = []
  const app = await makeApp(sent)
  t.after(() => app.close())

  const beacon = await app
    .inject()
    .post('/api/v1/denpa')
    .headers({ 'x-denpa-key': 'announce-key' })
    .body({ msg: 'nobody to tell' })
    .end()
  await settle()

  assert.equal(beacon.statusCode, 202, 'the webhook still answers')
  assert.equal(sent.length, 0, 'and nothing is sent anywhere')
  const headers = await adminHeaders(app)
  const rows = (await app.inject().get('/api/v1/requests?limit=5').headers(headers).end()).json().data as unknown[]
  assert.equal(rows.length, 1, 'the request itself was still stored')
})

test('announcer: a failed cron raises an alert on the same leg', async (t) => {
  const sent: Array<{ to: string; text: string }> = []
  const app = await makeApp(sent)
  t.after(() => app.close())
  await setDestination(app, 'studio-control')

  app.moonql.bus.emit('cron.run', {
    addon: 'playlog',
    cron: 'purge-playlog',
    status: 'error',
    durationMs: 42,
    detail: 'relation "playlogs" does not exist',
  })
  await settle()

  assert.equal(sent.length, 1)
  assert.match(sent[0]!.text, /cron playlog\/purge-playlog failed/)
  assert.match(sent[0]!.text, /does not exist/)

  // a healthy tick must not page anyone
  app.moonql.bus.emit('cron.run', { addon: 'playlog', cron: 'purge-playlog', status: 'ok', durationMs: 7, detail: null })
  await settle()
  assert.equal(sent.length, 1, 'success is silent')
})

test('announcer: critical sentinel intel signal raises an on-air intel flash', async (t) => {
  const sent: Array<{ to: string; text: string }> = []
  const app = await makeApp(sent)
  t.after(() => app.close())
  await setDestination(app, 'studio-control')

  app.moonql.bus.emit('model.created', {
    model: 'monitor_signals',
    id: 'sig-test-1',
    row: {
      title: 'Satellite Uplink Frequency Anomaly',
      urgencyScore: 92,
      sentiment: 'critical',
      platform: 'youtube',
    },
  })
  await settle()

  assert.equal(sent.length, 1, 'critical intel signal triggers flash')
  assert.match(sent[0]!.text, /\[INTEL FLASH\] \(YOUTUBE URGENCY 92%\)/)
  assert.match(sent[0]!.text, /Satellite Uplink Frequency Anomaly/)
})
