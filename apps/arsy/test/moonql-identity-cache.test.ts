import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { ADMIN_FULL, bootMoonQl, defineAddon, defineModel, moonqlRest, str, type MoonQlInstance } from '@moonwitness/moonql'
import auth from '@moonwitness/moonql-auth'
import envelope from '../src/plugins/envelope.js'

/** A surface only admins may read, so a demotion has a consequence to assert. */
const vaultAddon = defineAddon({
  name: 'vaultcache',
  models: {
    vault_items: defineModel({
      label: 'Vault item',
      fields: { name: str({ maxLength: 50 }) },
      rest: true,
      seedless: true,
      acl: ADMIN_FULL,
    }),
  },
})

/**
 * F2.3: identity resolution is cached, and cache correctness is the risky part of
 * a performance change. These tests count the actual store reads behind a request
 * (so "it's faster" is a measurement, not a claim) and then attack the two ways a
 * cache lies: revocation that arrives too late, and a permission change that is
 * remembered after it was taken away.
 */
async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [auth, vaultAddon],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: 's3cret-cache' },
    log: { info: () => {}, warn: () => {} } as never,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/api/v1', instance: moonql })
  await app.ready()
  return { app, moonql }
}

/** every read the resolver would perform, counted */
function measureReads(moonql: MoonQlInstance) {
  let reads = 0
  const sessions = moonql.model('auth_sessions')
  const users = moonql.model('auth_users')
  const searchOriginal = sessions.search.bind(sessions)
  const getOriginal = users.get.bind(users)
  sessions.search = ((query: never) => {
    reads += 1
    return searchOriginal(query)
  }) as typeof sessions.search
  users.get = ((id: string, expand?: string[]) => {
    reads += 1
    return getOriginal(id, expand)
  }) as typeof users.get
  return { reads: () => reads }
}

const login = async (app: FastifyInstance): Promise<string> => {
  const res = await app.inject().post('/api/v1/auth/login').body({ login: 'admin', password: 's3cret-cache' }).end()
  return res.json<{ data: { token: string } }>().data.token
}

test('identity: the second request is answered from cache, not from the store', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())
  const counter = measureReads(moonql)

  const token = await login(app)
  const readsAfterLogin = counter.reads() // login itself resolves nothing via the bearer path

  const first = await app.inject().get('/api/v1/auth/me').headers({ authorization: `Bearer ${token}` }).end()
  assert.equal(first.statusCode, 200)
  const coldReads = counter.reads() - readsAfterLogin
  // 3 = session search + user get for the identity, plus the /me handler's own read
  assert.equal(coldReads, 3, 'a cold token costs two identity reads and one for the route')

  const second = await app.inject().get('/api/v1/auth/me').headers({ authorization: `Bearer ${token}` }).end()
  assert.equal(second.statusCode, 200)
  // only the handler's read is left: identity came from the cache
  assert.equal(counter.reads() - readsAfterLogin - coldReads, 1, 'the warm request paid no identity reads')

  // and the cached answer is the same identity, not merely a 200
  assert.deepEqual(second.json().data, first.json().data)
})

test('identity: logout reaches the cache — the token dies on the next request', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())

  const token = await login(app)
  const headers = { authorization: `Bearer ${token}` }
  await app.inject().get('/api/v1/auth/me').headers(headers).end() // warm the cache

  const out = await app.inject().post('/api/v1/auth/logout').headers(headers).end()
  assert.equal(out.statusCode, 200)

  const after = await app.inject().get('/api/v1/auth/me').headers(headers).end()
  assert.equal(after.statusCode, 401, 'a revoked token must not be served from cache')
})

test('identity: a role change is not remembered after it is gone', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())
  const counter = measureReads(moonql)

  const token = await login(app)
  const headers = { authorization: `Bearer ${token}` }
  const before = await app.inject().get('/api/v1/auth/me').headers(headers).end()
  assert.equal(before.json().data.role, 'admin')
  // admin may read the vault; this warms the identity cache on that path too
  assert.equal((await app.inject().get('/api/v1/vault_items?limit=1').headers(headers).end()).statusCode, 200)
  const warm = counter.reads()

  // `auth_users` is not REST-writable (rest:false), so the demotion goes through the
  // model exactly as an internal handler would: the write emits on the bus, and the
  // bus is what tells the cache to forget this identity.
  await moonql.model('auth_users').update(String(before.json().data.id as string), { role: 'user' })

  const me = await app.inject().get('/api/v1/auth/me').headers(headers).end()
  assert.equal(me.json().data.role, 'user', 'the cached identity was dropped, not reused')
  assert.ok(counter.reads() > warm, 'the demotion forced a fresh read')

  // and the permission follows immediately: this token is no longer an admin
  assert.equal((await app.inject().get('/api/v1/vault_items?limit=1').headers(headers).end()).statusCode, 403)
})

test('identity: an unknown token is not cached, so a later login works immediately', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())

  const bogus = await app.inject().get('/api/v1/auth/me').headers({ authorization: 'Bearer not-a-session' }).end()
  assert.equal(bogus.statusCode, 401)

  const token = await login(app)
  const live = await app.inject().get('/api/v1/auth/me').headers({ authorization: `Bearer ${token}` }).end()
  assert.equal(live.statusCode, 200, 'a real token is not poisoned by a cached miss')
})
