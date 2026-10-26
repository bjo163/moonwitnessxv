import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'

async function makeApp() {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  return buildApp(config)
}

test('health responds ok with the standard envelope', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())
  const res = await app.inject().get('/api/v1/health').end()
  assert.equal(res.statusCode, 200)
  const body = res.json()
  assert.equal(body.ok, true)
  assert.equal(body.data.status, 'ok')
  assert.ok(body.timestamp)
})

test('stations: reads are public, writes need admin', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())

  const anonWrite = await app.inject()
    .post('/api/v1/stations')
    .body({ name: 'Sneaky FM', streamUrl: 'https://example.com/live' })
    .end()
  assert.equal(anonWrite.statusCode, 401, 'anonymous catalog writes are refused')

  const read = await app.inject().get('/api/v1/stations').end()
  assert.equal(read.statusCode, 200, 'the public catalog stays readable')

  const channels = await app.inject().get('/api/v1/channels').end()
  assert.equal(channels.statusCode, 401, 'the channel control plane is admin-only')
})

test('stations CRUD lifecycle (enveloped, as admin)', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())
  const headers = await adminHeaders(app)

  const seeded = (await app.inject().get('/api/v1/stations').end()).json().data.length

  const created = await app.inject()
    .post('/api/v1/stations')
    .headers(headers)
    .body({ name: 'Moon FM', streamUrl: 'https://example.com/live', genre: 'lofi' })
    .end()
  assert.equal(created.statusCode, 201)
  assert.equal(created.json().ok, true)
  const id = created.json().data.id
  assert.ok(id)

  const list = await app.inject().get('/api/v1/stations').end()
  // the seeded demo catalog (v4 default-data guarantee) + the one created above
  assert.equal(list.json().data.length, seeded + 1)

  const patched = await app.inject()
    .patch(`/api/v1/stations/${id}`)
    .headers(headers)
    .body({ active: false })
    .end()
  assert.equal(patched.statusCode, 200)
  assert.equal(patched.json().data.active, false)

  // Validation error -> consistent error envelope with details.
  const bad = await app.inject()
    .post('/api/v1/stations')
    .headers(headers)
    .body({ genre: 'no-name-or-url' })
    .end()
  assert.equal(bad.statusCode, 400)
  assert.equal(bad.json().ok, false)
  assert.equal(bad.json().error.statusCode, 400)
  assert.ok(bad.json().error.details)

  const del = await app.inject().delete(`/api/v1/stations/${id}`).headers(headers).end()
  assert.equal(del.statusCode, 204)

  const gone = await app.inject().get(`/api/v1/stations/${id}`).end()
  assert.equal(gone.statusCode, 404)
  assert.equal(gone.json().ok, false)
  assert.equal(gone.json().error.message, 'Station not found')
})
