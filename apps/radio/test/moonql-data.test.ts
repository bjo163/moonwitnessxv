import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import {
  bootMoonQl,
  moonqlRest,
  installAddons,
  defineAddon,
  defineModel,
  syncModelData,
  createRefResolver,
  m2o,
  str,
  type AnyAddon,
  type MoonQlInstance,
} from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import stations from '@moonwitness/moonql-stations'
import schedule from '@moonwitness/moonql-schedule'
import envelope from '../src/plugins/envelope.js'

function capLog() {
  const warns: string[] = []
  const infos: string[] = []
  const log = {
    info: (obj: unknown, msg: string) => infos.push(msg),
    warn: (obj: unknown, msg: string) => warns.push(msg),
  }
  return { log, warns, infos }
}

async function makeApp(addons: AnyAddon[], opts?: { seedPolicy?: 'off' | 'warn' | 'require'; introspectionAcl?: 'public' }) {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({ addons, seedPolicy: opts?.seedPolicy ?? 'off', log: capLog().log })
  await app.register(envelope)
  await app.register(moonqlRest, {
    prefix: '/orm',
    instance: moonql,
    ...(opts?.introspectionAcl ? { introspectionAcl: opts.introspectionAcl as never } : {}),
  })
  await app.ready()
  return { app, moonql }
}

/** re-run a reference sync against the live engine of the same instance */
async function resync(moonql: MoonQlInstance, modelName: string, rows: Array<Record<string, unknown>>, noupdate = false) {
  const engine = moonql.engines.get(modelName)!
  const resolver = createRefResolver((name) => {
    const c = moonql.registry.models.get(name)
    const e = moonql.engines.get(name)
    return c && e ? { name, unique: c.unique, engine: e } : null
  })
  const ctx = { orm: { model: moonql.model }, resolveRef: async (r: string) => (await resolver.resolve(r, true)) ?? '' }
  const { log } = capLog()
  return syncModelData({ name: modelName, softDelete: false, data: { rows, matchBy: ['code'], noupdate } }, engine, ctx, resolver, log)
}

const matsAddon = defineAddon({
  name: 'datalab',
  models: {
    mats: defineModel({
      label: 'Material',
      rest: true,
      fields: { code: str({ maxLength: 8 }), name: str({ maxLength: 40 }), note: str({ maxLength: 40, null: true }) },
      unique: [['code']],
      data: { rows: [{ code: 'a', name: 'Alpha' }, { code: 'b', name: 'Beta' }] },
    }),
  },
})

test('data tier: diff sync inserts new + updates changed, never deletes, unmanaged columns survive', async (t) => {
  const { app, moonql } = await makeApp([matsAddon])
  t.after(() => app.close())

  const before = await app.inject().get('/orm/mats').end()
  assert.equal(before.json().data.length, 2)

  // user edits: change a NOTE (not part of the authored data row)
  const idA = before.json().data.find((r: { code: string }) => r.code === 'a').id as string
  await app.inject().patch(`/orm/mats/${idA}`).body({ note: 'my note' }).end()

  const result = await resync(moonql, 'mats', [
    { code: 'a', name: 'ALPHA v2' }, // changed managed field -> update
    { code: 'b', name: 'Beta' }, // identical -> unchanged
    { code: 'c', name: 'Gamma' }, // new -> insert
  ])
  assert.deepEqual({ ...result }, { created: 1, updated: 1, unchanged: 1 })

  const after = await app.inject().get('/orm/mats?order=code').end()
  const rows = after.json().data as Array<Record<string, unknown>>
  assert.equal(rows.length, 3) // 'b' was NEVER deleted despite absence changes elsewhere
  assert.equal(rows[0]!.name, 'ALPHA v2')
  assert.equal(rows[0]!.note, 'my note') // unmanaged column survived the re-sync
})

test('data tier: noupdate protects local edits', async (t) => {
  const guardAddon = defineAddon({
    name: 'guardlab',
    models: {
      guards: defineModel({
        label: 'Guard',
        rest: true,
        fields: { code: str({ maxLength: 8 }), name: str({ maxLength: 40 }) },
        unique: [['code']],
        data: { rows: [{ code: 'x', name: 'X1' }], noupdate: true },
      }),
    },
  })
  const { app, moonql } = await makeApp([guardAddon])
  t.after(() => app.close())

  const row = (await app.inject().get('/orm/guards').end()).json().data[0]
  await app.inject().patch(`/orm/guards/${row.id}`).body({ name: 'user renamed' }).end()

  await resync(moonql, 'guards', [{ code: 'x', name: 'X2' }], true)
  const again = (await app.inject().get('/orm/guards').end()).json().data[0]
  assert.equal(again.name, 'user renamed') // noupdate: authored changes never overwrite existing rows
})

test('data validation: matchBy needs a unique pair; data without any unique fails', () => {
  assert.throws(
    () =>
      defineModel({
        label: 'NoKey',
        fields: { name: str() },
        data: { rows: [{ name: 'x' }] },
      }),
    /matchBy key or a single-column unique/,
  )
  assert.throws(
    () =>
      defineModel({
        label: 'BadKey',
        fields: { name: str() },
        unique: [['name']],
        data: { rows: [{ name: 'x' }], matchBy: ['other'] },
      }),
    /must name a declared unique pair/,
  )
})

test('@ref: seeds resolve, malformed refs die at compile, strict data refs fail boot', async (t) => {
  const tagsPosts = defineAddon({
    name: 'reflab',
    depends: ['datalab'],
    models: {
      tags: defineModel({
        label: 'Tag',
        rest: true,
        fields: { code: str({ maxLength: 8 }) },
        unique: [['code']],
        seedless: true,
        seed: [{ code: 'red' }],
      }),
      posts: defineModel({
        label: 'Post',
        rest: true,
        fields: { title: str({ maxLength: 40 }), tagRef: m2o('tags') },
        unique: [['title']],
        seed: [{ title: 'hello', tagRef: '@tags:red' }],
      }),
    },
  })
  const { app } = await makeApp([matsAddon, tagsPosts])
  t.after(() => app.close())
  const post = (await app.inject().get('/orm/posts').end()).json().data[0]
  const tag = (await app.inject().get('/orm/tags').end()).json().data[0]
  assert.equal(post.tagRef, tag.id) // resolved at seed time

  // malformed ref -> compile throw
  const broken = defineAddon({
    name: 'brokentags',
    depends: ['reflab'],
    models: {
      bps: defineModel({
        label: 'Broken',
        fields: { t: str(), r: m2o('tags') },
        seed: [{ t: 'x', r: '@tags' }],
      }),
    },
  })
  assert.throws(() => installAddons([matsAddon, tagsPosts, broken]), /malformed reference/)
})

test('seed policy: require fails boot listing offenders; warn logs instead', async () => {
  const naked = defineAddon({
    name: 'nakedlab',
    models: {
      bare: defineModel({ label: 'Bare', rest: true, fields: { x: str() } }),
    },
  })
  const { log, warns } = capLog()
  await assert.rejects(
    () => bootMoonQl({ addons: [naked], seedPolicy: 'require', log }),
    /seed policy.*bare/s,
  )
  const { log: log2, warns: warns2 } = capLog()
  const mq = await bootMoonQl({ addons: [naked], seedPolicy: 'warn', log: log2 })
  await mq.close()
  assert.ok(warns2.some((w) => w.includes('default data')))
  void warns
})

test('MIN_DEMO_ROWS: small demo seeds warn under warn policy', async () => {
  const small = defineAddon({
    name: 'smallseed',
    models: {
      things: defineModel({
        label: 'Thing',
        rest: true,
        fields: { name: str() },
        unique: [['name']],
        seed: [{ name: 'one' }, { name: 'two' }, { name: 'three' }],
      }),
    },
  })
  const { log, warns } = capLog()
  const mq = await bootMoonQl({ addons: [small], seedPolicy: 'warn', log })
  await mq.close()
  assert.ok(warns.some((w) => w.includes('below minimum')), `warns: ${warns.join('|')}`)
})

test('moonql-base: complete ISO data + view + resolved references', async (t) => {
  const { app } = await makeApp([base, stations])
  t.after(() => app.close())

  const totals: Record<string, number> = {}
  for (const [name, min] of [['countries', 240], ['currencies', 150], ['languages', 150]] as const) {
    const res = await app.inject().get(`/orm/${name}?limit=1&total=true`).end()
    assert.equal(res.statusCode, 200)
    totals[name] = Number(res.headers['x-total-count'])
    assert.ok(totals[name]! >= min, `${name} count ${totals[name]} < ${min}`)
  }

  const opts = await app.inject().get('/orm/countryOptions?limit=3').end()
  assert.deepEqual(Object.keys(opts.json().data[0]).sort(), ['calling', 'code', 'name'])

  const id = await app.inject().get('/orm/countries?expand=currencyRef&where=' + encodeURIComponent(JSON.stringify({ code: 'id' }))).end()
  const row = id.json().data[0]
  assert.equal(row.name, 'Indonesia')
  assert.equal(row.currencyRefRecord.code, 'idr') // '@currencies:idr' resolved during reference sync

  // stations demo seed with country refs
  const sts = await app.inject().get('/orm/stations?limit=50').end()
  assert.equal(sts.json().data.length, 36)
  assert.ok(sts.json().data.every((r: { statusLabel: string }) => r.statusLabel === 'live' || r.statusLabel === 'off'))
  const perCountry = await app.inject().get('/orm/stationCountByCountry').end()
  assert.equal(perCountry.statusCode, 200)
  assert.ok(perCountry.json().data.length >= 5) // aggregate over seeded countryRefs
})

test('schedule demo grid: nowPlaying is never empty at any hour', async (t) => {
  const { app } = await makeApp([base, stations, schedule])
  t.after(() => app.close())
  const np = await app.inject().get('/orm/nowPlaying').end()
  assert.ok(np.json().data.length >= 1, 'a seeded full-day slot must cover this instant')
  const up = await app.inject().get('/orm/upcoming?limit=24').end()
  assert.equal(up.json().data.length, 14)
  const days = new Set(up.json().data.map((r: { weekday: string }) => r.weekday))
  assert.equal(days.size, 7)
})

test('_schema exposes dataTier + minDemoRows', async (t) => {
  const { app } = await makeApp([base, stations], { introspectionAcl: 'public' })
  t.after(() => app.close())
  const doc = (await app.inject().get('/orm/_schema').end()).json().data
  assert.equal(doc.minDemoRows, 10)
  assert.equal(doc.models.countries.dataTier, 'reference')
  assert.equal(doc.models.stations.dataTier, 'demo')
})
