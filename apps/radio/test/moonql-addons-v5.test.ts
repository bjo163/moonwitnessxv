import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest, type AnyAddon } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import stations from '@moonwitness/moonql-stations'
import schedule from '@moonwitness/moonql-schedule'
import playlog from '@moonwitness/moonql-playlog'
import envelope from '../src/plugins/envelope.js'

async function makeApp(addons: AnyAddon[] = [base, stations, schedule, playlog]) {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({ addons, seedPolicy: 'off', log: { info: () => {}, warn: () => {} } })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql, introspectionAcl: 'public' })
  await app.ready()
  return { app, moonql }
}

test('beacon: POST /listen is public, writes a play and feeds topStations', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())

  const station = (await app.inject().get('/orm/stations?limit=1&order=name').end()).json().data[0]

  const beacon = await app.inject().post('/orm/listen').body({ stationRef: station.id, event: 'start', listener: 'dock' }).end()
  assert.equal(beacon.statusCode, 201)
  assert.equal(beacon.json().data.stationRef, station.id)

  const plays = await app.inject().get(`/orm/playlogs?where=${encodeURIComponent(JSON.stringify({ stationRef: station.id }))}`).end()
  assert.equal(plays.statusCode, 401, 'the raw playlog model stays admin-only')

  const chart = await app.inject().get('/orm/topStations').end()
  assert.equal(chart.statusCode, 200)
  const rows = chart.json().data as Array<Record<string, any>>
  assert.ok(rows.length >= 1)
  assert.ok(rows.every((row) => typeof row.stationRefRecord?.name === 'string'))
})

test('catalog: stationCatalog is public, active-only and carries the country', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())

  const res = await app.inject().get('/orm/stationCatalog').end()
  assert.equal(res.statusCode, 200)
  const rows = res.json().data as Array<Record<string, any>>

  assert.ok(rows.length >= 11, 'thirty-six seeded stations, one inactive')
  for (const row of rows) {
    assert.equal(row.status, 'live')
    assert.equal(typeof row.name, 'string')
    assert.equal(typeof row.countryRefRecord?.code, 'string')
    assert.ok(row.id)
  }
  assert.ok(!rows.some((row) => row.name === 'Amandit 93.9 FM'), 'inactive stations are filtered out')
})

test('catalog: the genre chart groups the catalog', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())

  const res = await app.inject().get('/orm/stationCountByGenre').end()
  assert.equal(res.statusCode, 200)
  const rows = res.json().data as Array<Record<string, any>>
  assert.ok(rows.length >= 2)
  const news = rows.find((row) => row.genre === 'news')!
  assert.equal(news.stations, 10)
})

test('schedule: weeklySchedule carries station names, nowPlaying carries its station record', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())

  const week = await app.inject().get('/orm/weeklySchedule').end()
  assert.equal(week.statusCode, 200)
  const slots = week.json().data as Array<Record<string, any>>
  assert.equal(slots.length, 14)
  assert.ok(slots.every((slot) => typeof slot.stationRefRecord?.name === 'string'))

  const live = await app.inject().get('/orm/nowPlaying').end()
  const now = live.json().data as Array<Record<string, any>>
  assert.ok(now.length >= 1, 'the demo grid is never empty')
  assert.equal(typeof now[0]!.stationRefRecord?.name, 'string')
})
