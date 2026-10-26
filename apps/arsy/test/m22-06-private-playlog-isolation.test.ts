import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'

test('private playlogs and recent-play search stay admin-only while public catalogue stays projected', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const catalogue = await app.inject().get('/api/v1/stationCatalog').end()
  assert.equal(catalogue.statusCode, 200)
  const stations = catalogue.json().data as Array<Record<string, unknown>>
  assert.ok(stations.length > 0, 'the curated public station catalogue remains readable')
  for (const row of stations) {
    for (const privateField of ['listener', 'event', 'seconds', 'message', 'tokenHash']) {
      assert.equal(privateField in row, false, `station catalogue must not project private playlog field ${privateField}`)
    }
  }

  const stationRef = String(stations[0]!.id)
  const rawListener = 'm22-06-private-listener@example.invalid'
  const beacon = await app.inject()
    .post('/api/v1/listen')
    .body({ stationRef, event: 'stop', listener: rawListener })
    .end()
  assert.equal(beacon.statusCode, 201)
  assert.equal(beacon.body.includes(rawListener), false, 'the public beacon does not echo the submitted identity')

  const admin = await adminHeaders(app)
  const recent = await app.inject().get('/api/v1/recentPlays?limit=20').headers(admin).end()
  assert.equal(recent.statusCode, 200, 'an administrator can use the curated private playlog view')
  const plays = recent.json().data as Array<Record<string, unknown>>
  const privatePlay = plays.find(
    (row) => row.station === stationRef && row.event === 'stop' && typeof row.listener === 'string' && String(row.listener).startsWith('lp_'),
  )
  assert.ok(privatePlay, 'the admin view contains the stored pseudonymous play event')
  const pseudonym = String(privatePlay.listener)
  assert.notEqual(pseudonym, rawListener)

  const encodedWhere = encodeURIComponent(JSON.stringify({ listener: pseudonym }))
  const blockedRequests = [
    app.inject().get('/api/v1/playlogs?limit=100').end(),
    app.inject().get(`/api/v1/playlogs?where=${encodedWhere}`).end(),
    app.inject().get(`/api/v1/recentPlays?where=${encodedWhere}`).end(),
  ]
  for (const response of await Promise.all(blockedRequests)) {
    assert.equal(response.statusCode, 401, 'anonymous list and filtered search requests must be denied')
    assert.equal(response.body.includes(rawListener), false)
    assert.equal(response.body.includes(pseudonym), false)
  }

  const catalogueBody = JSON.stringify(catalogue.json().data)
  assert.equal(catalogueBody.includes(rawListener), false, 'the public catalogue contains no listener identity')
  assert.equal(catalogueBody.includes(pseudonym), false, 'the public catalogue contains no private playlog pseudonym')

  const anonymousMetrics = await app.inject().get('/api/v1/metrics').end()
  assert.equal(anonymousMetrics.statusCode, 401, 'metrics remain admin-only')
  const metrics = await app.inject().get('/api/v1/metrics').headers(admin).end()
  assert.equal(metrics.statusCode, 200)
  assert.equal(metrics.body.includes(rawListener), false, 'admin metrics do not expose request payload identity')
  assert.equal(metrics.body.includes(pseudonym), false, 'admin metrics do not expose private playlog values')
})
