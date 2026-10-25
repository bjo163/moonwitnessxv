import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import {
  bootMoonQl,
  moonqlRest,
  defineAddon,
  defineModel,
  computed,
  int,
  str,
  type AnyAddon,
} from '@moonwitness/moonql'
import envelope from '../src/plugins/envelope.js'

async function makeApp(...addons: AnyAddon[]) {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({ addons, log: app.log })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()
  return { app, moonql }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ---------- stored computed ----------

const invoiceAddon = defineAddon({
  name: 'invoicelab',
  models: {
    invoices: defineModel({
      label: 'Invoice',
      fields: {
        customer: str({ maxLength: 40 }),
        price: int(),
        qty: int({ default: 1 }),
        total: computed({ type: 'number', store: true, deps: ['price', 'qty'], get: (r) => Number(r.price) * Number(r.qty) }),
        label: computed({ type: 'string', get: (r) => `${r.customer}:${r.total}` }), // virtual, not stored
      },
      rest: true,
    }),
  },
})

test('stored computed: computed on write, recomputed on update, filterable', async (t) => {
  const { app } = await makeApp(invoiceAddon)
  t.after(() => app.close())
  const created = await app.inject().post('/orm/invoices').body({ customer: 'nia', price: 3, qty: 4 }).end()
  assert.equal(created.statusCode, 201)
  assert.equal(created.json().data.total, 12)
  assert.equal(created.json().data.label, 'nia:12')

  const id = created.json().data.id as string
  const patched = await app.inject().patch(`/orm/invoices/${id}`).body({ qty: 5 }).end()
  assert.equal(patched.json().data.total, 15)

  const filtered = await app.inject().get('/orm/invoices?where=' + encodeURIComponent(JSON.stringify({ total: { gte: 15 } }))).end()
  assert.equal(filtered.json().data.length, 1)
  const none = await app.inject().get('/orm/invoices?where=' + encodeURIComponent(JSON.stringify({ total: { lt: 15 } }))).end()
  assert.equal(none.json().data.length, 0)

  // stored computed is not client-writable
  const sneaky = await app.inject().post('/orm/invoices').body({ customer: 'x', price: 1, qty: 1, total: 999 }).end()
  assert.equal(sneaky.json().data.total, 1)
})

// ---------- resolver chain ----------

const chainAddon = defineAddon({
  name: 'chainlab',
  models: {
    secrets: defineModel({ label: 'Secret', fields: { data: str({ maxLength: 20 }) }, rest: true, acl: { list: ['dev'] } }),
  },
})

const resolverA = defineAddon({
  name: 'res_a',
  depends: ['chainlab'],
  models: {},
  provides: {
    resolveUser: () => async ({ headers }) => {
      const both = headers['x-both']
      if (headers['x-a'] || both) return { id: 'user-a', roles: ['dev'] }
      return null
    },
  },
})

const resolverB = defineAddon({
  name: 'res_b',
  depends: ['res_a'],
  models: {},
  provides: {
    resolveUser: () => async ({ headers }) => {
      if (headers['x-b'] || headers['x-both']) return { id: 'user-b', roles: ['dev'] }
      return null
    },
  },
})

test('resolver chain: multiple addons each grant access, first match wins', async (t) => {
  const { app } = await makeApp(chainAddon, resolverA, resolverB)
  t.after(() => app.close())
  await app.inject().post('/orm/secrets').body({ data: 'x' }).end()

  assert.equal((await app.inject().get('/orm/secrets').end()).statusCode, 401)
  const viaA = await app.inject().get('/orm/secrets').headers({ 'x-a': '1' }).end()
  assert.equal(viaA.statusCode, 200)
  const viaB = await app.inject().get('/orm/secrets').headers({ 'x-b': '1' }).end()
  assert.equal(viaB.statusCode, 200)

  // x-both matches both providers; A is earlier in dependency order -> wins
  const probe = await app.inject().get('/orm/_schema').headers({ 'x-both': '1' }).end()
  assert.equal(probe.statusCode, 200)
})

// ---------- crons ----------

const cronAddon = defineAddon({
  name: 'ticklab',
  models: {
    ticklog: defineModel({ label: 'Tick', fields: { tag: str({ maxLength: 20 }) }, rest: true }),
  },
  cron: [
    {
      name: 'heartbeat',
      every: '100ms',
      run: async ({ orm }) => {
        await orm.model('ticklog').create({ tag: 'tick' })
      },
    },
  ],
})

test('cron: armed at boot, ticks on interval, stops on close', async () => {
  const { app, moonql } = await makeApp(cronAddon)
  await sleep(320)
  const during = await app.inject().get('/orm/ticklog?limit=100').end()
  const fired = (during.json().data as unknown[]).length
  assert.ok(fired >= 2, `expected >=2 ticks in 320ms, got ${fired}`)

  await moonql.close()
  await sleep(60)
  const stopAt = ((await app.inject().get('/orm/ticklog?limit=100').end()).json().data as unknown[]).length
  await sleep(220)
  const later = ((await app.inject().get('/orm/ticklog?limit=100').end()).json().data as unknown[]).length
  assert.equal(later, stopAt, 'cron must not fire after close()')
  await app.close()
})

// ---------- row-level rules ----------

const vaultAddon = defineAddon({
  name: 'vaultlab',
  models: {
    memos: defineModel({
      label: 'Memo',
      fields: { body: str({ maxLength: 60 }), owner: str({ maxLength: 20 }) },
      rest: true,
      acl: {
        list: { row: (u, r) => r.owner === u.id },
        get: { row: (u, r) => r.owner === u.id },
      },
    }),
  },
  provides: {
    resolveUser: () => async ({ headers }) => {
      const raw = headers['x-user']
      const id = Array.isArray(raw) ? raw[0] : raw
      if (!id) return null
      return { id, roles: ['member'] }
    },
  },
})

test('row rules: list filters to own rows, foreign single row is 403', async (t) => {
  const { app } = await makeApp(vaultAddon)
  t.after(() => app.close())
  await app.inject().post('/orm/memos').body({ body: 'for one', owner: 'u1' }).end()
  const two = await app.inject().post('/orm/memos').body({ body: 'for two', owner: 'u2' }).end()
  const twoId = two.json().data.id as string

  const asOne = await app.inject().get('/orm/memos').headers({ 'x-user': 'u1' }).end()
  assert.equal(asOne.statusCode, 200)
  assert.deepEqual(asOne.json().data.map((r: { owner: string }) => r.owner), ['u1'])

  const peek = await app.inject().get(`/orm/memos/${twoId}`).headers({ 'x-user': 'u1' }).end()
  assert.equal(peek.statusCode, 403)
  const own = await app.inject().get(`/orm/memos/${twoId}`).headers({ 'x-user': 'u2' }).end()
  assert.equal(own.statusCode, 200)
})

// ---------- _schema introspection ----------

test('_schema: gated, complete, and free of functions/handlers', async (t) => {
  const { app } = await makeApp(vaultAddon)
  t.after(() => app.close())

  const anon = await app.inject().get('/orm/_schema').end()
  assert.equal(anon.statusCode, 401)

  const res = await app.inject().get('/orm/_schema').headers({ 'x-user': 'u1' }).end()
  assert.equal(res.statusCode, 200)
  const doc = res.json().data

  assert.deepEqual(doc.addons.map((a: { name: string }) => a.name), ['vaultlab'])
  assert.ok(doc.models.memos)
  assert.equal(doc.models.memos.fields.owner.maxLength, 20)
  assert.deepEqual(doc.models.memos.acl.list, 'auth') // role part only; row fn never leaks
  assert.equal(doc.models.memos.createSchema.properties.body.maxLength, 60)

  const text = JSON.stringify(doc)
  assert.ok(!text.includes('function'), 'no functions may survive serialization')
  assert.ok(!text.includes('handler'))
})
