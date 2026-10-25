import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'

async function makeApp(frontends?: { dock: string; headquarters: string }) {
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  if (frontends) config.frontends = frontends
  return buildApp(config)
}

test('service index advertises both frontends and the live engine', async (t) => {
  const app = await makeApp({ dock: 'http://dock.test', headquarters: 'http://hq.test' })
  t.after(() => app.close())

  const res = await app.inject().get('/').end()
  assert.equal(res.statusCode, 200)
  assert.equal(res.json().ok, true)

  const data = res.json().data
  assert.equal(data.engine, 'memory')
  assert.equal(data.api, '/api/v1')
  assert.deepEqual(data.frontends, { dock: 'http://dock.test', headquarters: 'http://hq.test' })
  assert.equal(data.health, '/api/v1/health')
  assert.equal(data.metrics, '/api/v1/metrics')
  assert.equal(data.studio, '/api/v1/studio')

  // an advertised path must exist, and the spec must be usable as advertised
  assert.equal(data.openapi, '/docs/json')
  const spec = await app.inject().get('/docs/json').end()
  assert.equal(spec.statusCode, 200)
  // assert on the shape, not on route-by-route internals: what F3.7 promises is
  // that the advertised document exists, is live and describes this hub
  const doc = spec.json() as { openapi?: string; info?: { title?: string; version?: string }; paths?: Record<string, unknown>; servers?: unknown[] }
  assert.ok(doc.openapi, 'it is an OpenAPI document')
  assert.ok(Object.keys(doc.paths ?? {}).length > 10, 'and not an empty skeleton')
  assert.deepEqual(doc.servers, [{ url: '/' }], 'servers are relative, not localhost:PORT')
})
