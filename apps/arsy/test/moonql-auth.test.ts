import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest, defineAddon, defineModel, str } from '@moonwitness/moonql'
import auth, { hashPassword } from '@moonwitness/moonql-auth'
import envelope from '../src/plugins/envelope.js'

// A model guarded by roles — proves auth's resolveUser powers acl everywhere.
const vaultAddon = defineAddon({
  name: 'vault',
  models: {
    vault_items: defineModel({
      label: 'Vault item',
      fields: { name: str({ maxLength: 50 }) },
      rest: true,
      acl: { list: 'auth', get: 'auth', create: ['admin'], update: ['admin'], remove: ['admin'] },
    }),
  },
})

async function makeAuthApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [auth, vaultAddon],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: 's3cret-admin' },
    log: app.log,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/api/v1', instance: moonql })
  await app.ready()
  return { app, moonql }
}

test('auth flow: seeded admin logs in, /me works, logout revokes', async (t) => {
  const { app } = await makeAuthApp()
  t.after(() => app.close())

  const login = await app.inject()
    .post('/api/v1/auth/login')
    .body({ login: 'admin', password: 's3cret-admin' })
    .end()
  assert.equal(login.statusCode, 200)
  const { token, user } = login.json().data
  assert.ok(token)
  assert.equal(user.login, 'admin')
  assert.equal(user.role, 'admin')
  assert.equal(user.passwordHash, undefined) // private field never leaves the ORM

  const bearer = { authorization: `Bearer ${token}` }

  const me = await app.inject().get('/api/v1/auth/me').headers(bearer).end()
  assert.equal(me.statusCode, 200)
  assert.equal(me.json().data.login, 'admin')

  // acl on ANOTHER addon is now enforced by this identity
  const created = await app.inject().post('/api/v1/vault_items').body({ name: 'diamond' }).headers(bearer).end()
  assert.equal(created.statusCode, 201)
  assert.ok(created.json().data.id)
  const itemId = String(created.json().data.id)
  const updated = await app.inject()
    .patch(`/api/v1/vault_items/${itemId}`)
    .body({ name: 'diamond-updated' })
    .headers(bearer)
    .end()
  assert.equal(updated.statusCode, 200)
  assert.equal(updated.json().data.name, 'diamond-updated')
  const listed = await app.inject().get('/api/v1/vault_items').headers(bearer).end()
  assert.equal(listed.statusCode, 200)
  const removed = await app.inject().delete(`/api/v1/vault_items/${itemId}`).headers(bearer).end()
  assert.equal(removed.statusCode, 204)

  const logout = await app.inject().post('/api/v1/auth/logout').headers(bearer).end()
  assert.equal(logout.statusCode, 200)

  const afterLogout = await app.inject().get('/api/v1/auth/me').headers(bearer).end()
  assert.equal(afterLogout.statusCode, 401) // opaque token: instant revocation
})

test('auth: bad password and unknown user get the identical 401 (no enumeration)', async (t) => {
  const { app } = await makeAuthApp()
  t.after(() => app.close())

  const wrongPw = await app.inject().post('/api/v1/auth/login').body({ login: 'admin', password: 'nope' }).end()
  const wrongUser = await app.inject().post('/api/v1/auth/login').body({ login: 'ghost', password: 'nope' }).end()
  assert.equal(wrongPw.statusCode, 401)
  assert.equal(wrongUser.statusCode, 401)
  assert.equal(wrongPw.json().error.message, wrongUser.json().error.message)
  assert.equal(wrongPw.json().ok, false)
})

test('auth: anonymous and low-privilege callers are blocked by acl', async (t) => {
  const { app, moonql } = await makeAuthApp()
  t.after(() => app.close())

  // anonymous -> 401 on an 'auth' rule
  const anonList = await app.inject().get('/api/v1/vault_items').end()
  assert.equal(anonList.statusCode, 401)

  // create a plain 'user' directly through the ORM (hashing via the addon's exported helper)
  await moonql.model('auth_users').create({
    login: 'viewer',
    displayName: 'View Only',
    passwordHash: hashPassword('view-pw'),
    role: 'user',
  })
  const login = await app.inject().post('/api/v1/auth/login').body({ login: 'viewer', password: 'view-pw' }).end()
  assert.equal(login.statusCode, 200)
  const bearer = { authorization: `Bearer ${login.json().data.token}` }

  // Seed a row as admin so viewer UPDATE and REMOVE exercise real existing data.
  const adminLogin = await app.inject().post('/api/v1/auth/login').body({ login: 'admin', password: 's3cret-admin' }).end()
  assert.equal(adminLogin.statusCode, 200)
  const adminBearer = { authorization: `Bearer ${adminLogin.json().data.token}` }
  const seeded = await app.inject().post('/api/v1/vault_items').body({ name: 'protected' }).headers(adminBearer).end()
  assert.equal(seeded.statusCode, 201)
  assert.ok(seeded.json().data.id)
  const itemId = String(seeded.json().data.id)

  // Anonymous callers cannot write; an authenticated 'user' may LIST but cannot
  // CREATE, UPDATE or REMOVE operations whose published rule is admin-only.
  const anonCreate = await app.inject().post('/api/v1/vault_items').body({ name: 'anonymous' }).end()
  const anonUpdate = await app.inject().patch(`/api/v1/vault_items/${itemId}`).body({ name: 'anonymous' }).end()
  const anonRemove = await app.inject().delete(`/api/v1/vault_items/${itemId}`).end()
  assert.equal(anonCreate.statusCode, 401)
  assert.equal(anonUpdate.statusCode, 401)
  assert.equal(anonRemove.statusCode, 401)

  const listed = await app.inject().get('/api/v1/vault_items').headers(bearer).end()
  assert.equal(listed.statusCode, 200)
  const forbiddenCreate = await app.inject().post('/api/v1/vault_items').body({ name: 'nope' }).headers(bearer).end()
  const forbiddenUpdate = await app.inject().patch(`/api/v1/vault_items/${itemId}`).body({ name: 'nope' }).headers(bearer).end()
  const forbiddenRemove = await app.inject().delete(`/api/v1/vault_items/${itemId}`).headers(bearer).end()
  assert.equal(forbiddenCreate.statusCode, 403)
  assert.equal(forbiddenUpdate.statusCode, 403)
  assert.equal(forbiddenRemove.statusCode, 403)
  const unchanged = await app.inject().get(`/api/v1/vault_items/${itemId}`).headers(adminBearer).end()
  assert.equal(unchanged.statusCode, 200)
  assert.equal(unchanged.json().data.name, 'protected', 'denied writes leave the row unchanged')
  const afterDeniedWrites = await app.inject().get('/api/v1/vault_items').headers(adminBearer).end()
  assert.equal(afterDeniedWrites.statusCode, 200)
  assert.equal(afterDeniedWrites.json().data.length, 1, 'denied create attempts do not add rows')
})
