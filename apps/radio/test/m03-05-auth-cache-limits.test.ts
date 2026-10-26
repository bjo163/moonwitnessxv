import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { ADMIN_FULL, bootMoonQl, defineAddon, defineModel, moonqlRest, str, type MoonQlInstance } from '@moonwitness/moonql'
import auth from '@moonwitness/moonql-auth'
import { clearKeyCache, getCachedApiKeyUser, setCachedApiKeyUser } from '@moonwitness/moonql-apikeys'
import envelope from '../src/plugins/envelope.js'

const vaultAddon = defineAddon({
  name: 'm0305vault',
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

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [auth, vaultAddon],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: 'synthetic-test-password' },
    log: { info: () => {}, warn: () => {} } as never,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/api/v1', instance: moonql })
  await app.ready()
  return { app, moonql }
}

function measureIdentityReads(moonql: MoonQlInstance) {
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

async function createSession(moonql: MoonQlInstance, token: string, expiresAt: Date): Promise<void> {
  const users = await moonql.model('auth_users').search({ limit: 1 })
  const admin = users.rows[0]
  assert.ok(admin)
  await moonql.model('auth_sessions').create({
    userRef: admin.id,
    token,
    expiresAt: expiresAt.toISOString(),
  })
}

async function fetchMe(app: FastifyInstance, token: string) {
  return app.inject().get('/api/v1/auth/me').headers({ authorization: `Bearer ${token}` }).end()
}

test('M03-05: an expired session is rejected even while its cached identity is warm', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())

  const token = 'synthetic-session-expiry-case'
  await createSession(moonql, token, new Date(Date.now() + 250))
  const beforeExpiry = await fetchMe(app, token)
  assert.equal(beforeExpiry.statusCode, 200)

  await new Promise((resolve) => setTimeout(resolve, 350))
  const afterExpiry = await fetchMe(app, token)
  assert.equal(afterExpiry.statusCode, 401, 'an expired session must not be accepted from the identity cache')
})

test('M03-05: identity cache evicts the oldest token when its 500-entry ceiling is reached', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())
  const counter = measureIdentityReads(moonql)
  const totalTokens = 501
  const tokens = Array.from({ length: totalTokens }, (_, index) => `synthetic-cache-cap-${index}`)
  const farFuture = new Date(Date.now() + 60_000)

  for (const token of tokens) await createSession(moonql, token, farFuture)
  for (const token of tokens) {
    const response = await fetchMe(app, token)
    assert.equal(response.statusCode, 200)
  }

  const readsBeforeOldest = counter.reads()
  assert.equal((await fetchMe(app, tokens[0]!)).statusCode, 200)
  assert.equal(counter.reads() - readsBeforeOldest, 3, 'the oldest identity was evicted and resolved from the store again')

  const readsBeforeNewest = counter.reads()
  assert.equal((await fetchMe(app, tokens.at(-1)!)).statusCode, 200)
  assert.equal(counter.reads() - readsBeforeNewest, 1, 'the newest identity remains cached')
})

test('M03-05: API key cache expires entries and stays within its 5,000-entry ceiling', () => {
  clearKeyCache()
  try {
    const originalNow = Date.now
    const start = originalNow()
    const firstHash = 'synthetic-api-key-hash-0'
    setCachedApiKeyUser(firstHash, { id: 'synthetic-user-0', roles: ['bot'], meta: { keyId: 'synthetic-key-0', name: 'fixture' } })
    Date.now = () => start + 60_001
    try {
      assert.equal(getCachedApiKeyUser(firstHash), null, 'an API key identity older than 60 seconds must expire')
    } finally {
      Date.now = originalNow
    }

    const capacity = 5_000
    for (let index = 0; index <= capacity; index += 1) {
      const suffix = String(index)
      setCachedApiKeyUser(`synthetic-api-key-hash-${suffix}`, {
        id: `synthetic-user-${suffix}`,
        roles: ['bot'],
        meta: { keyId: `synthetic-key-${suffix}`, name: 'fixture' },
      })
    }

    assert.equal(getCachedApiKeyUser(`synthetic-api-key-hash-${capacity}`)?.id, `synthetic-user-${capacity}`)
    assert.equal(getCachedApiKeyUser('synthetic-api-key-hash-0'), null, 'the oldest entry must be evicted at capacity')
  } finally {
    clearKeyCache()
  }
})
