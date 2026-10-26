import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import {
  bootMoonQl,
  moonqlRest,
  defineAddon,
  defineModel,
  defineView,
  installAddons,
  m2o,
  sel,
  str,
  type AnyAddon,
} from '@moonwitness/moonql'
import envelope from '../src/plugins/envelope.js'

/** the fields these assertions read from expanded view rows */
interface CountryRecord {
  id?: unknown
  code?: unknown
  name?: unknown
}

interface ExpandedRow {
  name?: unknown
  country?: unknown
  countryRefRecord: CountryRecord
  stations?: unknown
}

interface MenuItem {
  group?: unknown
  key?: unknown
  kind?: unknown
  route?: unknown
  method?: unknown
}

function capLog() {
  const warns: string[] = []
  const log = {
    info: () => {},
    warn: (_obj: unknown, msg: string) => {
      warns.push(msg)
    },
  }
  return { log, warns }
}

async function makeApp(addons: AnyAddon[], opts?: { introspectionAcl?: 'public' }) {
  const app = Fastify({ logger: false })
  const { log, warns } = capLog()
  const moonql = await bootMoonQl({ addons, seedPolicy: 'off', log })
  await app.register(envelope)
  await app.register(moonqlRest, {
    prefix: '/orm',
    instance: moonql,
    ...(opts?.introspectionAcl ? { introspectionAcl: opts.introspectionAcl } : {}),
  })
  await app.ready()
  return { app, moonql, warns }
}

// ---------- lab addon: relations, declared joins, menus, a finite stream ----------

const v5Addon = defineAddon({
  name: 'v5lab',
  models: {
    v5_countries: defineModel({
      label: 'Country',
      fields: { name: str({ maxLength: 40 }), code: str({ maxLength: 3 }) },
      unique: [['code']],
      rest: true,
      seed: [
        { name: 'Japan', code: 'JP' },
        { name: 'Germany', code: 'DE' },
      ],
    }),
    v5_stations: defineModel({
      label: 'Station',
      fields: {
        name: str({ maxLength: 40 }),
        genre: sel(['lofi', 'jazz'], { null: true }),
        countryRef: m2o('v5_countries'),
      },
      rest: true,
      menu: { group: 'Lab', icon: '📻', order: 10 },
      seed: [
        { name: 'Moon Wave', genre: 'lofi', countryRef: '@v5_countries:JP' },
        { name: 'Jazz Orbit', genre: 'jazz', countryRef: '@v5_countries:DE' },
        { name: 'Static', genre: 'lofi', countryRef: '@v5_countries:JP' },
      ],
    }),
  },
  views: {
    catalog: defineView('catalog', {
      label: 'Catalog',
      from: 'v5_stations',
      select: { name: 'name', country: 'countryRef' },
      expand: ['countryRef'],
      order: 'name',
      limit: 50,
      menu: { group: 'Lab', order: 5 },
    }),
    byCountry: defineView('byCountry', {
      label: 'By country',
      from: 'v5_stations',
      aggregate: { groupBy: ['countryRef'], metrics: { stations: { fn: 'count' } } },
      expand: ['countryRef'],
      order: '-stations',
      limit: 10,
    }),
  },
  endpoints: {
    ping: { path: '/v5/ping', method: 'GET', menu: { group: 'Lab', order: 90 }, handler: () => ({ pong: true }) },
    tickerStream: {
      path: '/v5/stream',
      method: 'GET',
      stream: true,
      handler: async function* () {
        yield { n: 1 }
        yield { n: 2 }
        yield { n: 3 }
      },
    },
  },
})

// ---------- 1/2: declared joins (select projection + aggregate) ----------

test('view expand: select projection keeps the alias AND the joined record', async (t) => {
  const { app } = await makeApp([v5Addon])
  t.after(() => app.close())

  const res = await app.inject().get('/orm/catalog').end()
  assert.equal(res.statusCode, 200)
  const rows = res.json().data as ExpandedRow[]
  assert.equal(rows.length, 3)

  const jazz = rows.find((r) => r.name === 'Jazz Orbit')!
  assert.deepEqual(Object.keys(jazz).sort(), ['country', 'countryRefRecord', 'name'])
  assert.equal(jazz.countryRefRecord.code, 'DE')
  assert.equal(jazz.country, jazz.countryRefRecord.id)
})

test('view expand: aggregate joins its groupBy key', async (t) => {
  const { app } = await makeApp([v5Addon])
  t.after(() => app.close())

  const res = await app.inject().get('/orm/byCountry').end()
  const rows = res.json().data as ExpandedRow[]
  assert.equal(rows.length, 2)
  assert.equal(rows[0]!.stations, 2)
  assert.equal(rows[0]!.countryRefRecord.code, 'JP')
  assert.equal(rows[0]!.countryRefRecord.name, 'Japan')
})

test('view expand: a non-m2o or non-grouped key fails the boot', () => {
  const badRelation = defineAddon({
    name: 'badexp',
    models: { things: defineModel({ fields: { name: str() }, rest: true }) },
    views: { broken: defineView('broken', { from: 'things', expand: ['name'] }) },
  })
  assert.throws(() => installAddons([badRelation]), /not an m2o relation/)

  const badAggregate = defineAddon({
    name: 'badagg',
    models: {
      owners: defineModel({ fields: { name: str() }, rest: true }),
      items: defineModel({ fields: { label: str(), ownerRef: m2o('owners') }, rest: true }),
    },
    views: {
      grouped: defineView('grouped', {
        from: 'items',
        aggregate: { groupBy: ['label'], metrics: { n: { fn: 'count' } } },
        expand: ['ownerRef'],
      }),
    },
  })
  assert.throws(() => installAddons([badAggregate]), /expand its groupBy keys/)
})

// ---------- 4: menu metadata ----------

test('_schema: menu is derived, grouped and sorted by (group, order, label)', async (t) => {
  const { app } = await makeApp([v5Addon], { introspectionAcl: 'public' })
  t.after(() => app.close())

  const res = await app.inject().get('/orm/_schema').end()
  assert.equal(res.statusCode, 200)
  const doc = res.json().data

  const lab = (doc.menu as MenuItem[]).filter((i) => i.group === 'Lab')
  assert.deepEqual(lab.map((i) => i.key), ['catalog', 'v5_stations', 'GET /v5/ping'])
  assert.deepEqual(lab.map((i) => i.kind), ['view', 'model', 'endpoint'])
  assert.equal(lab[0]!.route, '/catalog')
  assert.equal(lab[2]!.method, 'GET')
  assert.equal(doc.models.v5_stations.menu.group, 'Lab')
  assert.equal(doc.views.catalog.expand[0], 'countryRef')
  assert.ok(doc.models.v5_stations.readSchema.properties.countryRefRecord)
})

// ---------- 5/6: the bus ----------

test('bus: observers see model.created/updated/deleted in order', async (t) => {
  const seen: string[] = []
  const recorder = defineAddon({
    name: 'recorder',
    models: {},
    observe: (bus) => {
      bus.on('model.created', (p) => seen.push(`created:${p.model}:${p.id}`))
      bus.on('model.updated', (p) => seen.push(`updated:${p.model}:${p.id}`))
      bus.on('model.deleted', (p) => seen.push(`deleted:${p.model}:${p.id}`))
    },
  })
  const { app } = await makeApp([v5Addon, recorder])
  t.after(() => app.close())

  const created = await app.inject().post('/orm/v5_stations').body({ name: 'Fresh Signal' }).end()
  assert.equal(created.statusCode, 201)
  const id = created.json().data.id

  await app.inject().patch(`/orm/v5_stations/${id}`).body({ genre: 'jazz' }).end()
  await app.inject().delete(`/orm/v5_stations/${id}`).end()

  assert.deepEqual(seen, [`created:v5_stations:${id}`, `updated:v5_stations:${id}`, `deleted:v5_stations:${id}`])
})

test('bus: a throwing listener never fails the write (one warn instead)', async (t) => {
  const exploder = defineAddon({
    name: 'exploder',
    models: {},
    observe: (bus) => {
      bus.on('model.created', () => {
        throw new Error('listener exploded')
      })
    },
  })
  const { app, warns } = await makeApp([v5Addon, exploder])
  t.after(() => app.close())

  const res = await app.inject().post('/orm/v5_stations').body({ name: 'Still Written' }).end()
  assert.equal(res.statusCode, 201)
  assert.equal(warns.filter((w) => w.includes('moonql bus: listener failed')).length, 1)
})

// ---------- 7: cron.run ----------

test('cron: every tick lands on the bus with status + duration', async (t) => {
  const ticker = defineAddon({
    name: 'ticker',
    models: {},
    cron: [{ name: 'tick', every: '100ms', run: () => 'ok' }],
  })
  const app = Fastify({ logger: false })
  const { log } = capLog()
  const moonql = await bootMoonQl({ addons: [ticker], seedPolicy: 'off', log })
  t.after(() => app.close())

  const runs: Array<Record<string, unknown>> = []
  moonql.bus.on('cron.run', (p) => runs.push({ ...p }))
  await new Promise((resolve) => setTimeout(resolve, 260))
  await moonql.close()

  assert.ok(runs.length >= 2, `expected >=2 ticks, got ${runs.length}`)
  assert.equal(runs[0]!.addon, 'ticker')
  assert.equal(runs[0]!.cron, 'tick')
  assert.equal(runs[0]!.status, 'ok')
  assert.ok((runs[0]!.durationMs as number) >= 0)
  assert.equal(runs[0]!.detail, '"ok"')
})

// ---------- 8/9: stream endpoint + _schema contract ----------

test('stream: a finite generator becomes real SSE frames', async (t) => {
  const { app } = await makeApp([v5Addon])
  t.after(() => app.close())

  const res = await app.inject().get('/orm/v5/stream').end()
  assert.equal(res.statusCode, 200)
  assert.match(String(res.headers['content-type']), /text\/event-stream/)

  const frames = res.body.split('\n\n').filter((chunk) => chunk.startsWith('data: '))
  assert.equal(frames.length, 3)
  assert.deepEqual(JSON.parse(frames[0]!.slice('data: '.length)), { n: 1 })
  assert.ok(res.body.startsWith(':connected'))
})

test('_schema: still free of functions/handlers after v5 additions', async (t) => {
  const { app } = await makeApp([v5Addon], { introspectionAcl: 'public' })
  t.after(() => app.close())

  const doc = (await app.inject().get('/orm/_schema').end()).json().data
  const text = JSON.stringify(doc)
  assert.ok(!text.includes('function'), 'no functions may survive serialization')
  assert.ok(!text.includes('handler'))
})
