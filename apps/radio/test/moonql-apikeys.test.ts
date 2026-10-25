import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import auth from '@moonwitness/moonql-auth'
import stations from '@moonwitness/moonql-stations'
import apikeys from '@moonwitness/moonql-apikeys'
import playlog from '@moonwitness/moonql-playlog'
import envelope from '../src/plugins/envelope.js'

// the real addons: proves the resolveUser chain end to end —
// session bearer (auth) and x-api-key (apikeys) coexist on one instance.
async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [auth, stations, apikeys, playlog],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: 'ci-weapon-selenium' },
    cronEnabled: false,
    log: app.log,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()
  return { app, moonql }
}

async function adminToken(app: ReturnType<typeof Fastify>) {
  const login = await app.inject().post('/orm/auth/login').body({ login: 'admin', password: 'ci-weapon-selenium' }).end()
  assert.equal(login.statusCode, 200)
  return login.json().data.token as string
}

test('apikeys: admin issues a key once, bot identity reaches acl-auth routes', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())
  const token = await adminToken(app)

  const created = await app
    .inject()
    .post('/orm/api-keys')
    .headers({ authorization: `Bearer ${token}` })
    .body({ name: 'ci-bot' })
    .end()
  assert.equal(created.statusCode, 201)
  const key = created.json().data.key as string
  assert.equal(key.length, 48)
  assert.equal(created.json().data.name, 'ci-bot')
  const keyId = created.json().data.id as string

  // x-api-key resolves to a bot user -> may hit acl 'auth' create on playlogs
  const spin = await app
    .inject()
    .post('/orm/playlogs')
    .headers({ 'x-api-key': key })
    .body({ event: 'start' })
    .end()
  assert.equal(spin.statusCode, 201)

  // list endpoint hides the private hash
  const list = await app.inject().get('/orm/api-keys').headers({ authorization: `Bearer ${token}` }).end()
  assert.equal(list.statusCode, 200)
  assert.equal(list.json().data.length, 1)
  assert.equal(list.json().data[0].keyHash, undefined)
  assert.equal(list.json().data[0].name, 'ci-bot')

  await app.inject().delete(`/orm/api-keys/${keyId}`).headers({ authorization: `Bearer ${token}` }).end()
  const after = await app.inject().post('/orm/playlogs').headers({ 'x-api-key': key }).body({ event: 'stop' }).end()
  assert.equal(after.statusCode, 401, 'revoked key must stop resolving')
})

test('apikeys: wrong key is anonymous, session bearer still works in the chain', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())
  const token = await adminToken(app)

  const wrong = await app.inject().post('/orm/playlogs').headers({ 'x-api-key': 'deadbeef'.repeat(6) }).body({ event: 'start' }).end()
  assert.equal(wrong.statusCode, 401)

  const me = await app.inject().get('/orm/auth/me').headers({ authorization: `Bearer ${token}` }).end()
  assert.equal(me.statusCode, 200)
  assert.equal(me.json().data.login, 'admin')
})

test('apikeys: key management requires admin role', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())
  const admin = await adminToken(app)
  const created = await app.inject().post('/orm/api-keys').headers({ authorization: `Bearer ${admin}` }).body({ name: 'pleb' }).end()
  const key = created.json().data.key as string

  // bot role is not admin -> cannot manage keys
  const list = await app.inject().get('/orm/api-keys').headers({ 'x-api-key': key }).end()
  assert.equal(list.statusCode, 403)
})
