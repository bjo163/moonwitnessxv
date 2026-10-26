import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'

test('M22-02 public listen beacon rejects unsupported events without persisting listener input', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const catalog = await app.inject().get('/api/v1/stations?limit=1').end()
  assert.equal(catalog.statusCode, 200)
  const stationRef = catalog.json().data[0]?.id as string | undefined
  assert.ok(stationRef)

  const typedLabel = 'm22-02-synthetic-invalid-event'
  const invalid = await app.inject()
    .post('/api/v1/listen')
    .body({ stationRef, event: 'pause', listener: typedLabel })
    .end()
  assert.equal(invalid.statusCode, 400)
  assert.equal(invalid.json().ok, false)
  assert.equal(invalid.body.includes(typedLabel), false, 'validation response does not echo listener input')

  const headers = await adminHeaders(app)
  const recentPlays = await app.inject().get('/api/v1/recentPlays?limit=20').headers(headers).end()
  assert.equal(recentPlays.statusCode, 200)
  assert.equal(JSON.stringify(recentPlays.json()).includes(typedLabel), false)
  assert.equal(
    (recentPlays.json().data as Array<Record<string, unknown>>).some((row) => row.event === 'pause'),
    false,
    'the rejected beacon creates no playlog row',
  )
})
