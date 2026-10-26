import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'
import type { RadioConfig } from '../src/config.js'

async function makeApp(override?: (c: RadioConfig) => void) {
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  override?.(config)
  return buildApp(config)
}

const INBOUND_KEY = 'inbound-key'

test('denpa: receive, list, and fetch a transmission (token-gated)', async (t) => {
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = INBOUND_KEY
  })
  t.after(() => app.close())
  const key = { 'x-denpa-key': INBOUND_KEY }

  const sent = await app.inject()
    .post('/api/v1/denpa')
    .headers(key)
    .body({ msg: 'hello denpa', seq: 1 })
    .end()
  assert.equal(sent.statusCode, 202)
  assert.equal(sent.json().ok, true)
  const { id } = sent.json().data
  assert.ok(id)

  const list = await app.inject().get('/api/v1/denpa').headers(key).end()
  assert.equal(list.statusCode, 200)
  assert.equal(list.json().data.length, 1)
  assert.deepEqual(list.json().data[0].payload, { msg: 'hello denpa', seq: 1 })

  const one = await app.inject().get(`/api/v1/denpa/${id}`).headers(key).end()
  assert.equal(one.statusCode, 200)
  assert.equal(one.json().data.id, id)

  const gone = await app.inject().get('/api/v1/denpa/00000000-0000-0000-0000-000000000000').headers(key).end()
  assert.equal(gone.statusCode, 404)
  assert.equal(gone.json().ok, false)
  assert.equal(gone.json().error.statusCode, 404)
})

test('denpa: optional shared-secret gate (x-denpa-key)', async (t) => {
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = 's3cret'
  })
  t.after(() => app.close())

  const denied = await app.inject()
    .post('/api/v1/denpa')
    .body({ any: 'thing' })
    .end()
  assert.equal(denied.statusCode, 401)

  const accepted = await app.inject()
    .post('/api/v1/denpa')
    .headers({ 'x-denpa-key': 's3cret' })
    .body({ any: 'thing' })
    .end()
  assert.equal(accepted.statusCode, 202)
})

test('denpa: disabled by config mounts nothing', async (t) => {
  const app = await makeApp((c) => { c.denpa.enabled = false })
  t.after(() => app.close())

  const res = await app.inject().post('/api/v1/denpa').body({ x: 1 }).end()
  assert.equal(res.statusCode, 404)
})

test('denpa: enabled without a token mounts nothing (no public writer)', async (t) => {
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = ''
  })
  t.after(() => app.close())

  const res = await app.inject().post('/api/v1/denpa').body({ x: 1 }).end()
  assert.equal(res.statusCode, 404, 'the open-receiver default is refused, not mounted')
})

const settle = () => new Promise((resolve) => setTimeout(resolve, 80)) // fire-and-forget write

test('denpa: a transmission becomes a listener request, sender pseudonymised', async (t) => {
  withTestAdmin()
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = INBOUND_KEY
  })
  t.after(() => app.close())

  const catalog = await app.inject().get('/api/v1/stations?limit=1').end()
  const station = catalog.json().data[0] as Record<string, unknown>

  const sent = await app
    .inject()
    .post('/api/v1/denpa')
    .headers({ 'x-denpa-key': INBOUND_KEY })
    .body({ msg: 'play Fracture', station: station.name })
    .end()
  assert.equal(sent.statusCode, 202, 'the webhook answers before the write lands')
  await settle()

  const headers = await adminHeaders(app)
  const rows = (await app.inject().get('/api/v1/requests?limit=5').headers(headers).end()).json().data as Array<Record<string, unknown>>
  assert.equal(rows.length, 1)
  assert.equal(rows[0]!.message, 'play Fracture')
  assert.equal(rows[0]!.status, 'new')
  assert.equal(rows[0]!.stationRef, station.id, 'the named station resolved to its row')
  assert.match(String(rows[0]!.sender), /^dn_[0-9a-f]{16}$/, 'the origin is never stored in the clear')

  // the DJ-facing view is the same queue, filtered to what is still open
  const queue = await app.inject().get('/api/v1/requestQueue').headers(headers).end()
  assert.equal(queue.statusCode, 200)
  assert.equal(queue.json().data.length, 1)

  // and it is not world-readable
  const anon = await app.inject().get('/api/v1/requestQueue').end()
  assert.equal(anon.statusCode, 401)
})

test('denpa: closing the queue from settings stops the writes, not the webhook', async (t) => {
  withTestAdmin()
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = INBOUND_KEY
  })
  t.after(() => app.close())
  const headers = await adminHeaders(app)

  const gate = await app
    .inject()
    .get(`/api/v1/settings_entries?limit=1&where=${encodeURIComponent(JSON.stringify({ key: 'requests_open' }))}`)
    .headers(headers)
    .end()
  assert.equal(gate.json().data.length, 1, 'the announce group carries the switch')
  await app
    .inject()
    .patch(`/api/v1/settings_entries/${gate.json().data[0].id}`)
    .headers(headers)
    .body({ value: 'false' })
    .end()

  const sent = await app
    .inject()
    .post('/api/v1/denpa')
    .headers({ 'x-denpa-key': INBOUND_KEY })
    .body({ msg: 'too late' })
    .end()
  assert.equal(sent.statusCode, 202, 'the signal is still caught')
  await settle()

  const rows = (await app.inject().get('/api/v1/requests?limit=5').headers(headers).end()).json().data as unknown[]
  assert.equal(rows.length, 0, 'but it is not queued as a request')
})
