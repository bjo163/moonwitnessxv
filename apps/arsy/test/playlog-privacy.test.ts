import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'

const studioSource = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'modules', 'studio', 'index.ts')

/**
 * Fase 0 guards: the small, sharp regressions.
 */

test('studio uses one sessionStorage key (no mr/mw split)', () => {
  const html = readFileSync(studioSource, 'utf8')
  assert.equal(html.includes('mr_token'), false, 'studio still writes the pre-rebrand token key')
  assert.equal(html.includes('mw_token'), true, 'studio must read/write one consistent key')
})

test('public beacon stores a pseudonym, never the typed listener name', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const catalog = await app.inject().get('/api/v1/stations?limit=1').end()
  const stationRef = catalog.json().data[0].id as string

  const beacon = await app.inject()
    .post('/api/v1/listen')
    .body({ stationRef, event: 'start', listener: 'alice@example.com' })
    .end()
  assert.equal(beacon.statusCode, 201)

  const headers = await adminHeaders(app)
  const recent = await app.inject().get('/api/v1/recentPlays?limit=5').headers(headers).end()
  assert.equal(recent.statusCode, 200)
  const stored = recent.json().data.find((row: Record<string, unknown>) => row.station === stationRef)
  assert.ok(stored, 'the beacon row is visible to admin charts')
  assert.match(String(stored!.listener), /^lp_[0-9a-f]{16}$/, 'listener is stored pseudonymised')
  assert.notEqual(String(stored!.listener), 'alice@example.com')
})

test('the beacon keeps working without a listener label', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const catalog = await app.inject().get('/api/v1/stations?limit=1').end()
  const stationRef = catalog.json().data[0].id as string
  const res = await app.inject().post('/api/v1/listen').body({ stationRef }).end()
  assert.equal(res.statusCode, 201)
  assert.equal(res.json().data.listener, null)
})

test('a closing beacon stores the session length, clamped', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const catalog = await app.inject().get('/api/v1/stations?limit=1').end()
  const stationRef = catalog.json().data[0].id as string

  const stop = await app.inject().post('/api/v1/listen').body({ stationRef, event: 'stop', seconds: 137 }).end()
  assert.equal(stop.statusCode, 201)
  assert.equal(stop.json().data.seconds, 137)

  // the beacon is public, so a non-integer or an absurd duration is rejected or clamped
  const fractional = await app.inject().post('/api/v1/listen').body({ stationRef, event: 'stop', seconds: 137.6 }).end()
  assert.equal(fractional.statusCode, 400, 'seconds are whole seconds')
  const absurd = await app.inject().post('/api/v1/listen').body({ stationRef, event: 'skip', seconds: 999_999 }).end()
  assert.equal(absurd.json().data.seconds, 86_400, 'clamped to a day')
  assert.equal(absurd.json().data.event, 'skip')

  // and a beacon that never mentions seconds stays a null, not a fabricated 0
  const bare = await app.inject().post('/api/v1/listen').body({ stationRef, event: 'start' }).end()
  assert.equal(bare.json().data.seconds, null)
})

test('listenQuality splits each station by how the session ended', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const rows = await app.inject().get('/api/v1/listenQuality').end()
  assert.equal(rows.statusCode, 200)
  const list = rows.json().data as Array<Record<string, unknown>>
  assert.ok(list.length > 0, 'the seeded listening week produces outcomes')
  assert.ok(list.every((r) => typeof r.event === 'string' && typeof r.stationRef === 'string'))
  assert.ok(list.every((r) => Number(r.beacons) >= 1))
  // avg over a column of nulls is null, never 0 and never NaN
  for (const r of list) assert.ok(r.avgSeconds === null || typeof r.avgSeconds === 'number')
})
