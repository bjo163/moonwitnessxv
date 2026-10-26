import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, defineAddon, defineModel, m2o, moonqlRest, str, bool, type AnyAddon } from '@moonwitness/moonql'
import envelope from '../src/plugins/envelope.js'

/**
 * The REST surface's own ACL rules: `?expand=` and `x-total-count`.
 *
 * Both were ways around the access rules rather than features of them — an expanded
 * relation read the target table without asking whether the caller may, and the
 * total header counted rows the caller was not allowed to see.
 */

const quiet = { info: () => {}, warn: () => {} }

const privateOwners = defineAddon({
  name: 'aclprobe',
  // a header-driven identity, so the test can be two different callers without
  // standing up the auth addon: `x-test-role: admin`
  provides: {
    resolveUser: () => (request) => {
      const roles = String(request.headers['x-test-role'] ?? '')
        .split(',')
        .map((role) => role.trim())
        .filter(Boolean)
      return roles.length ? { id: 'tester', roles } : null
    },
  },
  models: {
    owners: defineModel({
      label: 'Owner',
      fields: { name: str({ maxLength: 40 }) },
      rest: true,
      seedless: true,
      acl: { list: ['admin'], get: ['admin'], create: ['admin'], update: ['admin'], remove: ['admin'] },
    }),
    things: defineModel({
      label: 'Thing',
      fields: { label: str({ maxLength: 40 }), ownerRef: m2o('owners') },
      rest: true,
      seedless: true,
      acl: { list: 'public', create: ['admin'], update: ['admin'], remove: ['admin'] },
    }),
    // a row rule: authenticated, but only the rows this caller is allowed to see
    memos: defineModel({
      label: 'Memo',
      fields: { body: str({ maxLength: 40 }), shared: bool() },
      rest: true,
      seedless: true,
      acl: {
        list: { roles: 'auth', row: (_user, row) => row.shared === true },
        create: ['admin'],
        update: ['admin'],
        remove: ['admin'],
      },
    }),
  },
})

async function makeApp(addons: AnyAddon[] = [privateOwners]) {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({ addons, seedPolicy: 'off', cronEnabled: false, log: quiet })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql, introspectionAcl: 'public' })
  await app.ready()
  return { app, moonql }
}

const admin = { 'x-test-role': 'admin' }

test('expand: a relation to an admin-only model is null for anonymous callers', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())

  const owner = await moonql.model('owners').create({ name: 'Ada' })
  const thing = await moonql.model('things').create({ label: 'turntable', ownerRef: owner.id })

  const anon = await app.inject().get('/orm/things?expand=ownerRef').end()
  assert.equal(anon.statusCode, 200)
  const anonRow = anon.json().data[0] as Record<string, unknown>
  assert.equal(anonRow.ownerRef, owner.id, 'the id is part of the things row itself')
  assert.equal(anonRow.ownerRefRecord, null, 'but the owners row may not be filled in for a caller who cannot list owners')

  const ownerList = await app.inject().get('/orm/owners').headers(admin).end()
  assert.equal(ownerList.statusCode, 200, 'the admin identity itself is accepted by the model')

  // the same request through the repository with an actor that passes: proof that
  // the null above is the ACL at work, not a missing relation
  const asAdmin = await moonql.model('things').list({
    expand: ['ownerRef'],
    actor: { id: 'u1', roles: ['admin'] },
  })
  assert.equal((asAdmin.find((r) => r.id === thing.id)?.ownerRefRecord as { name?: string })?.name, 'Ada')
})

test('x-total-count: not sent when a row rule filtered the page', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())

  await moonql.model('memos').create({ body: 'public note', shared: true })
  await moonql.model('memos').create({ body: 'private note', shared: false })

  // role gate: 'auth' — without a user the request is refused outright
  const anon = await app.inject().get('/orm/memos?total=true').end()
  assert.equal(anon.statusCode, 401)

  const res = await app.inject().get('/orm/memos?total=true&limit=10').headers(admin).end()
  assert.equal(res.statusCode, 200)
  assert.equal((res.json().data as unknown[]).length, 1, 'the row rule keeps the caller to visible rows')
  assert.equal(res.headers['x-total-count'], undefined, 'a pre-filter total would be an oracle for the hidden row')
})

test('x-total-count: still sent when nothing filtered the page', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())

  for (const name of ['Ada', 'Grace', 'Alan']) await moonql.model('owners').create({ name })

  const res = await app.inject().get('/orm/owners?total=true&limit=2').headers(admin).end()
  assert.equal(res.statusCode, 200)
  assert.equal((res.json().data as unknown[]).length, 2)
  assert.equal(res.headers['x-total-count'], '3', 'the count still answers when no row rule is involved')

  const withoutHeader = await app.inject().get('/orm/owners?limit=2').headers(admin).end()
  assert.equal(withoutHeader.headers['x-total-count'], undefined, 'the count pass is opt-in')
})
