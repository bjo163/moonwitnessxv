import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import {
  bootMoonQl,
  moonqlRest,
  defineAddon,
  defineModel,
  installAddons,
  one2many,
  computed,
  sel,
  str,
  text,
  bool,
  m2o,
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

// ---------- simple addon: hooks + basics (kept from the v1 suite) ----------

const notesAddon = defineAddon({
  name: 'scratch',
  models: {
    notes: defineModel({
      label: 'Note',
      fields: { title: str({ maxLength: 100 }), done: bool({ default: false }) },
      rest: true,
    }),
  },
  hooks: {
    notes: { beforeCreate: (row) => ({ ...row, title: (row.title ?? '').toUpperCase() }) },
  },
})

test('hooks: beforeCreate mutates the payload', async (t) => {
  const { app } = await makeApp(notesAddon)
  t.after(() => app.close())
  const res = await app.inject().post('/orm/notes').body({ title: 'hello' }).end()
  assert.equal(res.statusCode, 201)
  assert.equal(res.json().data.title, 'HELLO')
  assert.equal(res.json().data.done, false)
})

test('registry rejects duplicate models and unknown deps', () => {
  const a = defineAddon({ name: 'one', models: { notes: defineModel({ fields: { x: str() } }) } })
  const b = defineAddon({ name: 'two', models: { notes: defineModel({ fields: { y: str() } }) } })
  assert.throws(() => installAddons([a, b]), /defined by both addons/)
  const c = defineAddon({ name: 'c', depends: ['missing'], models: {} })
  assert.throws(() => installAddons([c]), /depends on unknown addon/)
})

test('memory engine: update bumps updatedAt, list paginates, unknown fields stripped', async (t) => {
  const { app } = await makeApp(notesAddon)
  t.after(() => app.close())
  for (const title of ['a', 'b', 'c']) {
    await app.inject().post('/orm/notes').body({ title }).end()
  }
  const page = await app.inject().get('/orm/notes?limit=2&offset=1').end()
  assert.equal(page.json().data.length, 2)

  const ids = (await app.inject().get('/orm/notes').end()).json().data.map((r: { id: string }) => r.id)
  await new Promise((r) => setTimeout(r, 5))
  const patched = await app.inject().patch(`/orm/notes/${ids[0]}`).body({ done: true }).end()
  assert.notEqual(patched.json().data.updatedAt, patched.json().data.createdAt)

  const sneaky = await app.inject().post('/orm/notes').body({ title: 'x', sneaky: true }).end()
  assert.equal(sneaky.statusCode, 201)
  assert.equal(sneaky.json().data.sneaky, undefined)
})

// ---------- rich addon: sel/private/computed/unique/soft/expand/seed/acl/endpoints ----------

const qlabAddon = defineAddon({
  name: 'qlab',
  models: {
    qlab_authors: defineModel({
      label: 'Author',
      fields: { name: str({ maxLength: 50 }) },
      rest: true,
    }),
    qlab_posts: defineModel({
      label: 'Post',
      fields: {
        title: str({ maxLength: 50 }),
        body: text(),
        status: sel(['draft', 'pub'], { default: 'draft' }),
        secret: str({ private: true, null: true }),
        authorRef: m2o('qlab_authors'),
        comments: one2many('qlab_comments', 'postRef'),
        titleLength: computed({ type: 'number', deps: ['title'], get: (r) => String(r.title ?? '').length }),
      },
      unique: [['title']],
      delete: 'soft',
      rest: true,
    }),
    qlab_comments: defineModel({
      label: 'Comment',
      fields: { postRef: m2o('qlab_posts'), text: str({ maxLength: 100 }) },
      rest: true,
    }),
    qlab_secrets: defineModel({
      label: 'Secret',
      fields: { value: str() },
      rest: true,
      acl: { list: 'auth', create: ['admin'] },
    }),
    qlab_config: defineModel({
      label: 'Config',
      fields: { key: str(), val: str() },
      rest: true,
      seed: [{ key: 'theme', val: 'dark' }],
    }),
  },
  endpoints: {
    '/qlab/echo': {
      method: 'POST',
      body: { msg: str({ minLength: 1 }) },
      handler: ({ body }) => ({ echoed: body.msg }),
    },
    '/qlab/admin-only': {
      method: 'GET',
      requires: ['admin'],
      handler: ({ user }) => ({ who: user?.id ?? null }),
    },
  },
  provides: {
    // test identity: "x-test-user: <id>:<role>[:<role>]"
    resolveUser: () => async ({ headers }) => {
      const raw = headers['x-test-user']
      const value = Array.isArray(raw) ? raw[0] : raw
      if (!value) return null
      const [id, ...roles] = value.split(':')
      return { id: id ?? '', roles }
    },
  },
})

test('sel + private + computed: serialization contract', async (t) => {
  const { app } = await makeApp(qlabAddon)
  t.after(() => app.close())
  const created = await app.inject()
    .post('/orm/qlab_posts')
    .body({ title: 'First', body: 'hi', status: 'pub', secret: 'do-not-leak' })
    .end()
  assert.equal(created.statusCode, 201)
  const data = created.json().data
  assert.equal(data.secret, undefined) // private: never serialized
  assert.equal(data.titleLength, 5) // computed: always present
  assert.equal(data.status, 'pub')

  const bad = await app.inject()
    .post('/orm/qlab_posts')
    .body({ title: 'Second', body: 'x', status: 'bogus' })
    .end()
  assert.equal(bad.statusCode, 400) // sel -> enum violation
})

test('model unique constraint -> 409 envelope', async (t) => {
  const { app } = await makeApp(qlabAddon)
  t.after(() => app.close())
  const first = await app.inject().post('/orm/qlab_posts').body({ title: 'Dup', body: 'a' }).end()
  assert.equal(first.statusCode, 201)
  const second = await app.inject().post('/orm/qlab_posts').body({ title: 'Dup', body: 'b' }).end()
  assert.equal(second.statusCode, 409)
  assert.equal(second.json().ok, false)
  assert.match(second.json().error.message, /unique constraint \[title\]/)
})

test('soft delete: 204 then 404 and excluded from list/count', async (t) => {
  const { app } = await makeApp(qlabAddon)
  t.after(() => app.close())
  const a = await app.inject().post('/orm/qlab_posts').body({ title: 'Keep', body: 'k' }).end()
  const b = await app.inject().post('/orm/qlab_posts').body({ title: 'Drop', body: 'd' }).end()
  const del = await app.inject().delete(`/orm/qlab_posts/${b.json().data.id}`).end()
  assert.equal(del.statusCode, 204)
  const gone = await app.inject().get(`/orm/qlab_posts/${b.json().data.id}`).end()
  assert.equal(gone.statusCode, 404)
  const list = await app.inject().get('/orm/qlab_posts?total=true').end()
  assert.equal(list.json().data.length, 1)
  assert.equal(list.headers['x-total-count'], '1')
  assert.equal((await app.inject().get(`/orm/qlab_posts/${a.json().data.id}`).end()).statusCode, 200)
})

test('domain queries: where (eq/in/like/$or), order, unknown field -> 400', async (t) => {
  const { app } = await makeApp(qlabAddon)
  t.after(() => app.close())
  for (const [title, status] of [['Alpha', 'pub'], ['Beta', 'draft'], ['Gamma', 'pub']] as const) {
    await app.inject().post('/orm/qlab_posts').body({ title, body: title.toLowerCase(), status }).end()
  }
  const q = (where: unknown) => `/orm/qlab_posts?where=${encodeURIComponent(JSON.stringify(where))}`

  const eqRes = await app.inject().get(q({ status: 'pub' })).end()
  assert.equal(eqRes.json().data.length, 2)

  const inRes = await app.inject().get(q({ title: { in: ['Alpha', 'Beta'] } })).end()
  assert.equal(inRes.json().data.length, 2)

  const likeRes = await app.inject().get(q({ title: { like: 'mm' } })).end()
  assert.equal(likeRes.json().data[0].title, 'Gamma')

  const orRes = await app.inject().get(q({ $or: [{ title: 'Alpha' }, { title: 'Beta' }] })).end()
  assert.equal(orRes.json().data.length, 2)

  const ordered = await app.inject().get('/orm/qlab_posts?order=-title').end()
  assert.equal(ordered.json().data[0].title, 'Gamma')

  const bad = await app.inject().get(q({ nope: 1 })).end()
  assert.equal(bad.statusCode, 400)
  assert.match(bad.json().error.message, /unknown field "nope"/)
})

test('expand: m2o -> <key>Record, o2m -> array', async (t) => {
  const { app } = await makeApp(qlabAddon)
  t.after(() => app.close())
  const author = await app.inject().post('/orm/qlab_authors').body({ name: 'Nyanka' }).end()
  const post = await app.inject().post('/orm/qlab_posts').body({ title: 'Exp', body: 'b', authorRef: author.json().data.id }).end()
  await app.inject().post('/orm/qlab_comments').body({ postRef: post.json().data.id, text: 'first!' }).end()
  await app.inject().post('/orm/qlab_comments').body({ postRef: post.json().data.id, text: 'second!' }).end()

  const expanded = await app
    .inject()
    .get(`/orm/qlab_posts/${post.json().data.id}?expand=authorRef,comments`)
    .end()
  const data = expanded.json().data
  assert.equal(data.authorRefRecord?.name, 'Nyanka')
  assert.equal(data.authorRefRecord?.secret, undefined)
  assert.equal(data.comments?.length, 2)
})

test('seed: rows present when the table starts empty', async (t) => {
  const { app } = await makeApp(qlabAddon)
  t.after(() => app.close())
  const res = await app.inject().get('/orm/qlab_config').end()
  assert.equal(res.json().data.length, 1)
  assert.equal(res.json().data[0].key, 'theme')
})

test('acl: 401 anonymous, 200 authenticated, 403 wrong role', async (t) => {
  const { app } = await makeApp(qlabAddon)
  t.after(() => app.close())
  const anon = await app.inject().get('/orm/qlab_secrets').end()
  assert.equal(anon.statusCode, 401)

  await app.inject().post('/orm/qlab_secrets').body({ value: 'v1' }).headers({ 'x-test-user': 'u1:admin' })

  const asUser = await app.inject().get('/orm/qlab_secrets').headers({ 'x-test-user': 'u1:user' }).end()
  assert.equal(asUser.statusCode, 200)

  const asGuest = await app
    .inject()
    .post('/orm/qlab_secrets')
    .body({ value: 'v2' })
    .headers({ 'x-test-user': 'u2:guest' })
    .end()
  assert.equal(asGuest.statusCode, 403)

  const endpointAuth = await app.inject().get('/orm/qlab/admin-only').headers({ 'x-test-user': 'u9:admin' }).end()
  assert.equal(endpointAuth.json().data.who, 'u9')
  const endpointAnon = await app.inject().get('/orm/qlab/admin-only').end()
  assert.equal(endpointAnon.statusCode, 401)
})

test('declarative endpoints mount enveloped with body validation', async (t) => {
  const { app } = await makeApp(qlabAddon)
  t.after(() => app.close())
  const ok = await app.inject().post('/orm/qlab/echo').body({ msg: 'transmission' }).end()
  assert.equal(ok.statusCode, 200)
  assert.equal(ok.json().data.echoed, 'transmission')

  const bad = await app.inject().post('/orm/qlab/echo').body({ msg: '' }).end()
  assert.equal(bad.statusCode, 400) // minLength violated
})

test('registry: duplicate endpoint paths fail the boot', () => {
  const a = defineAddon({
    name: 'dup_a',
    models: {},
    endpoints: { '/x': { method: 'GET', handler: () => 1 } },
  })
  const b = defineAddon({
    name: 'dup_b',
    models: {},
    endpoints: { '/x': { method: 'GET', handler: () => 2 } },
  })
  assert.throws(() => installAddons([a, b]), /duplicate endpoint/)
})
