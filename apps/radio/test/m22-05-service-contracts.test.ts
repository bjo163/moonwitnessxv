import { test } from 'node:test'
import assert from 'node:assert/strict'
import { API_PREFIX, PORTS } from '@moonwitness/core'
import { MODEL_NAMES, VIEW_NAMES } from '@moonwitness/moonql-client'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'

test('M22-05 preserves root discovery, OpenAPI paths, and generated SDK identities', async (t) => {
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const rootResponse = await app.inject().get('/').end()
  assert.equal(rootResponse.statusCode, 200)
  const root = rootResponse.json().data as Record<string, unknown>
  assert.equal(PORTS.hub, 3000)
  assert.equal(root.api, API_PREFIX)
  assert.equal(root.docs, '/docs')
  assert.equal(root.openapi, '/docs/json')
  assert.equal(root.health, `${API_PREFIX}/health`)
  assert.equal(root.metrics, `${API_PREFIX}/metrics`)
  assert.equal(root.studio, `${API_PREFIX}/studio`)

  const specResponse = await app.inject().get('/docs/json').end()
  assert.equal(specResponse.statusCode, 200)
  const spec = specResponse.json() as {
    paths?: Record<string, unknown>
    servers?: Array<{ url?: string }>
  }
  const paths = spec.paths ?? {}
  assert.ok(paths[`${API_PREFIX}/stations`], 'OpenAPI retains the stations API path')
  assert.ok(paths[`${API_PREFIX}/stationCatalog`], 'OpenAPI retains the station catalog view')
  assert.ok(paths[`${API_PREFIX}/weeklySchedule`], 'OpenAPI retains the weekly schedule view')
  assert.ok(paths[`${API_PREFIX}/health/`], 'OpenAPI retains the health path under the API prefix')
  assert.deepEqual(spec.servers, [{ url: '/' }], 'OpenAPI uses a relative server URL')

  const modelNames: readonly string[] = MODEL_NAMES
  const viewNames: readonly string[] = VIEW_NAMES
  assert.ok(modelNames.includes('stations'), 'SDK keeps the stations model name')
  assert.ok(viewNames.includes('stationCatalog'), 'SDK keeps the stationCatalog view name')
  assert.ok(viewNames.includes('weeklySchedule'), 'SDK keeps the weeklySchedule view name')
  assert.equal(modelNames.includes('radioStations'), false, 'SDK does not publish a renamed model alias')
  assert.equal(viewNames.includes('radioStationCatalog'), false, 'SDK does not publish a renamed view alias')
})

test('M22-05 does not add unprefixed or renamed Radio REST aliases', async (t) => {
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const unprefixed = await app.inject().get('/stations').end()
  const renamed = await app.inject().get(`${API_PREFIX}/radioStations`).end()
  assert.equal(unprefixed.statusCode, 404)
  assert.equal(renamed.statusCode, 404)
})
