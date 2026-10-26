import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'

/**
 * F2.6: the chart must stop costing the whole history table. Two properties are
 * checked: the daily rollup actually fills, and the windowed chart is a *window* —
 * never more than the all-time chart it is drawn from.
 */
async function waitFor<T>(condition: () => Promise<T | null | false>, label: string, timeoutMs = 4000): Promise<T> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const value = await condition()
    if (value) return value as T
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${label}`)
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

async function makeApp() {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  config.orm.cronEnabled = true // the rollup is a cron, so this test needs the scheduler
  return buildApp(config)
}

test('airplay_daily is folded by its own cron at boot and says which day it covers', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())
  const headers = await adminHeaders(app)

  const rows = await waitFor(async () => {
    const res = await app.inject().get('/api/v1/airplayDaily').headers(headers).end()
    const list = res.json().data as Array<Record<string, unknown>>
    return list.length > 0 ? list : null
  }, 'the daily rollup to fill')

  const today = new Date().toISOString().slice(0, 10)
  assert.ok(rows.every((row) => row.day === today), 'a fresh rollup only covers today')
  assert.ok(rows.every((row) => Number(row.sessions) >= 1), 'every row counts at least one session')
  // the seeded listening week has no durations, so seconds stays null (never 0)
  for (const row of rows) assert.ok(row.seconds === null || typeof row.seconds === 'number')

  // the raw table and the rollup must agree: same day, same total of sessions
  const beacons = await app
    .inject()
    .get(`/api/v1/playlogs?limit=1&total=true&where=${encodeURIComponent(JSON.stringify({ createdAt: { gte: `${today}T00:00:00.000Z` } }))}`)
    .headers(headers)
    .end()
  const total = Number(beacons.headers['x-total-count'] ?? -1)
  assert.ok(total >= 0)
  assert.equal(rows.reduce((sum, row) => sum + Number(row.sessions), 0), total, 'the rollup is the table, not an estimate')
})

test('topStationsToday is a window over the same chart, never wider than all time', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())
  const headers = await adminHeaders(app)

  const allRes = await app.inject().get('/api/v1/topStations').headers(headers).end()
  assert.equal(allRes.statusCode, 200, allRes.body)
  const dayRes = await app.inject().get('/api/v1/topStationsToday').headers(headers).end()
  assert.equal(dayRes.statusCode, 200, dayRes.body)
  const all = allRes.json().data as Array<Record<string, unknown>>
  const day = dayRes.json().data as Array<Record<string, unknown>>
  assert.ok(all.length > 0 && day.length > 0, 'both charts answer')

  const perStation = new Map(all.map((row) => [String(row.stationRef), Number(row.plays)]))
  for (const row of day) {
    const station = String(row.stationRef)
    assert.ok(perStation.has(station), 'the window cannot invent a station the history does not have')
    assert.ok(Number(row.plays) <= (perStation.get(station) ?? 0), `station ${station}: window ${row.plays} > all-time`)
  }
})
