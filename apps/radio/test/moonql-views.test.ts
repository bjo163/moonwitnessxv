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
  bool,
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

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const viewsAddon = defineAddon({
  name: 'viewslab',
  models: {
    slots: defineModel({
      label: 'Slot',
      fields: {
        title: str({ maxLength: 40 }),
        weekday: str({ maxLength: 3 }),
        startMin: int(),
        endMin: int(),
        live: bool({ default: true }),
      },
      rest: true,
    }),
    spins: defineModel({
      label: 'Spin',
      fields: { track: str({ maxLength: 40 }), duration: int() },
      rest: true,
    }),
  },
  views: {
    nowPlaying: defineView('nowPlaying', {
      label: 'On air now',
      from: 'slots',
      select: { title: 'title', windowStart: 'startMin' },
      where: ({ now }) => ({
        weekday: DAYS[now.getUTCDay()]!,
        startMin: { lte: now.getUTCHours() * 60 + now.getUTCMinutes() },
        endMin: { gt: now.getUTCHours() * 60 + now.getUTCMinutes() },
        live: true,
      }),
    }),
    liveSlots: defineView('liveSlots', {
      from: 'slots',
      select: { title: 'title', weekday: 'weekday', startMin: 'startMin' },
      where: { live: true },
      order: 'startMin',
      limit: 12,
    }),
    topTracks: defineView('topTracks', {
      from: 'spins',
      aggregate: {
        groupBy: ['track'],
        metrics: { n: { fn: 'count' }, total: { fn: 'sum', field: 'duration' }, avg: { fn: 'avg', field: 'duration' } },
      },
      order: '-n',
      limit: 5,
    }),
    spinsRecent: defineView('spinsRecent', {
      from: 'spins',
      select: { song: 'track', seconds: 'duration', loggedAt: 'createdAt' },
      order: '-createdAt',
      limit: 20,
    }),
  },
})

test('view: dynamic where(now) returns exactly the on-air slot', async (t) => {
  const { app } = await makeApp(viewsAddon)
  t.after(() => app.close())
  const today = DAYS[new Date().getUTCDay()]!
  const yesterday = DAYS[(new Date().getUTCDay() + 6) % 7]!
  // one all-day slot for today, one for another weekday
  await app.inject().post('/orm/slots').body({ title: 'Today Show', weekday: today, startMin: 0, endMin: 1440 }).end()
  await app.inject().post('/orm/slots').body({ title: 'Other Day', weekday: yesterday, startMin: 0, endMin: 1440 }).end()

  const res = await app.inject().get('/orm/nowPlaying').end()
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.json().data, [{ title: 'Today Show', windowStart: 0 }])
})

test('view: select projects and renames, audit column reachable', async (t) => {
  const { app } = await makeApp(viewsAddon)
  t.after(() => app.close())
  await app.inject().post('/orm/spins').body({ track: 'Moon Song', duration: 210 }).end()
  const res = await app.inject().get('/orm/spinsRecent').end()
  const row = res.json().data[0]
  assert.deepEqual(Object.keys(row).sort(), ['loggedAt', 'seconds', 'song'])
  assert.equal(row.song, 'Moon Song')
  assert.equal(row.seconds, 210)
  assert.ok(typeof row.loggedAt === 'string')
})

test('view: aggregate counts/sums/avg per group with default order', async (t) => {
  const { app } = await makeApp(viewsAddon)
  t.after(() => app.close())
  for (const d of [1, 2, 3]) await app.inject().post('/orm/spins').body({ track: 'A', duration: d }).end()
  await app.inject().post('/orm/spins').body({ track: 'B', duration: 10 }).end()

  const res = await app.inject().get('/orm/topTracks').end()
  assert.equal(res.statusCode, 200)
  const rows = res.json().data as Array<Record<string, unknown>>
  assert.equal(rows.length, 2)
  assert.equal(rows[0]!.track, 'A') // -n puts the 3-spin group first
  assert.equal(rows[0]!.n, 3)
  assert.equal(rows[0]!.total, 6)
  assert.equal(rows[0]!.avg, 2)
  assert.equal(rows[1]!.n, 1)
})

test('view: limit/order/total params over aliases', async (t) => {
  const { app } = await makeApp(viewsAddon)
  t.after(() => app.close())
  await app.inject().post('/orm/slots').body({ title: 'Early', weekday: 'mon', startMin: 300, endMin: 360 }).end()
  await app.inject().post('/orm/slots').body({ title: 'Late', weekday: 'tue', startMin: 1200, endMin: 1260 }).end()
  await app.inject().post('/orm/slots').body({ title: 'Hidden', weekday: 'wed', startMin: 0, endMin: 10, live: false }).end()

  const asc = await app.inject().get('/orm/liveSlots?total=true').end()
  assert.deepEqual(asc.json().data.map((r: { title: string }) => r.title), ['Early', 'Late'])
  assert.equal(asc.headers['x-total-count'], '2')

  const desc = await app.inject().get('/orm/liveSlots?order=-startMin&limit=1').end()
  assert.deepEqual(desc.json().data.map((r: { title: string }) => r.title), ['Late'])
})

test('view: read-only surface — POST is not routed', async (t) => {
  const { app } = await makeApp(viewsAddon)
  t.after(() => app.close())
  const res = await app.inject().post('/orm/topTracks').body({}).end()
  assert.equal(res.statusCode, 404)
})

test('view: boot rejects unknown source and name collisions', () => {
  const badSource = defineAddon({
    name: 'vsrc',
    views: { ghost: defineView('ghost', { from: 'nope' }) },
    models: {},
  })
  assert.throws(() => installAddons([badSource]), /unknown model/)

  const collide = defineAddon({
    name: 'vcol',
    models: { notes: defineModel({ fields: { x: str() }, rest: true }) },
    views: { notes: defineView('notes', { from: 'notes' }) },
  })
  assert.throws(() => installAddons([collide]), /collides with model/)
})
