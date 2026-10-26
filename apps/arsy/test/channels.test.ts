import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'
import type { Channel } from '../src/lib/channels.js'

async function makeApp() {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  return buildApp(config)
}

const fakeChannel: Channel = {
  id: 'fake',
  label: 'Fake IM',
  status: () => ({ state: 'open' }),
  send: async ({ to, text }) => ({ channel: 'fake', to, ok: true, id: `msg-${text.length}` }),
}

test('health reports active channel count', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())
  const res = await app.inject().get('/api/v1/health').end()
  assert.equal(res.statusCode, 200)
  assert.equal(res.json().data.channels, 0) // whatsapp disabled by default
})

test('channels: control plane is admin-only, empty until one is registered', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())

  const anon = await app.inject().get('/api/v1/channels').end()
  assert.equal(anon.statusCode, 401, 'status/QR/send are not public')

  const headers = await adminHeaders(app)
  const empty = await app.inject().get('/api/v1/channels').headers(headers).end()
  assert.equal(empty.statusCode, 200)
  assert.equal(empty.json().data.length, 0)

  // Register a fake channel at runtime and see it through the REST API.        
  app.channels.register(fakeChannel)

  const list = await app.inject().get('/api/v1/channels').headers(headers).end()
  assert.equal(list.json().data.length, 1)
  assert.equal(list.json().data[0].id, 'fake')

  const send = await app.inject()
    .post('/api/v1/channels/fake/send')
    .headers(headers)
    .body({ to: 'user-1', text: 'hi' })
    .end()
  assert.equal(send.statusCode, 200)
  assert.equal(send.json().data.ok, true)

  const bcast = await app.inject()
    .post('/api/v1/channels/broadcast')
    .headers(headers)
    .body({ to: 'user-1', text: 'yo' })
    .end()
  assert.equal(bcast.statusCode, 200)
  assert.equal(bcast.json().data.length, 1)
})

test('unknown channel -> 404, bad body -> 400', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())
  const headers = await adminHeaders(app)

  const missing = await app.inject().post('/api/v1/channels/nope/send').headers(headers).body({ to: 'x', text: 'y' }).end()
  assert.equal(missing.statusCode, 404)

  const bad = await app.inject().post('/api/v1/channels/fake/send').headers(headers).body({ to: 'x' }).end()
  assert.equal(bad.statusCode, 400)
})
