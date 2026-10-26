import { test } from 'node:test'
import assert from 'node:assert/strict'
import { installAddons, defineAddon, defineModel, defineView, str } from '@moonwitness/moonql'
import { currentDocument, renderSdk } from '../src/tools/gen-sdk.js'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'

test('M05-01: OpenAPI, envelope and error contracts adhere to standard structure', async (t) => {
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  // Standard Success Envelope: { ok: true, data: ..., timestamp: ... }
  const healthRes = await app.inject().get('/api/v1/health').end()
  assert.equal(healthRes.statusCode, 200)
  const healthJson = healthRes.json()
  assert.equal(healthJson.ok, true)
  assert.ok(healthJson.timestamp)
  assert.ok(healthJson.data)

  // Standard Error Envelope: { ok: false, error: { message: ... } }
  const notFoundRes = await app.inject().get('/api/v1/non-existent-endpoint-test').end()
  assert.equal(notFoundRes.statusCode, 404)
  const errJson = notFoundRes.json()
  assert.equal(errJson.ok, false)
  assert.ok(errJson.error)
})

test('M05-02: Collision rejection: duplicate models, views, and manual route collisions fail fast', () => {
  // 1. Model collision
  const addonA = defineAddon({
    name: 'addon_a',
    models: { clash_model: defineModel({ fields: { a: str() }, seedless: true }) },
  })
  const addonB = defineAddon({
    name: 'addon_b',
    models: { clash_model: defineModel({ fields: { b: str() }, seedless: true }) },
  })
  assert.throws(
    () => installAddons([addonA, addonB]),
    /model "clash_model" is defined by both addons/,
    'Duplicate model across addons must fail boot',
  )

  // 2. View collision
  const viewAddonA = defineAddon({
    name: 'view_a',
    models: { source_m: defineModel({ fields: { a: str() }, seedless: true }) },
    views: { clashView: defineView('clashView', { from: 'source_m', select: { a: 'a' } }) },
  })
  const viewAddonB = defineAddon({
    name: 'view_b',
    depends: ['view_a'],
    models: {},
    views: { clashView: defineView('clashView', { from: 'source_m', select: { a: 'a' } }) },
  })
  assert.throws(
    () => installAddons([viewAddonA, viewAddonB]),
    /duplicate view "clashView"/,
    'Duplicate view across addons must fail boot',
  )

  // 3. Reserved path collision (REST model colliding with handwritten module directory)
  assert.throws(
    () =>
      installAddons(
        [
          defineAddon({
            name: 'reserved_addon',
            models: { stations: defineModel({ rest: true, fields: { name: str() }, seedless: true }) },
          }),
        ],
        { reservedPaths: ['stations'] },
      ),
    /exposes REST but a handwritten module folder "stations" already claims that path/,
    'Model claiming a reserved module path must fail boot',
  )
})

test('M05-04: SDK codegen deterministic output and hash stability', () => {
  const doc1 = currentDocument()
  const doc2 = currentDocument()
  assert.equal(doc1.schemaHash, doc2.schemaHash, 'Consecutive schema hashing must be 100% deterministic')

  const code1 = renderSdk()
  const code2 = renderSdk()
  assert.equal(code1, code2, 'SDK source generation must be byte-for-byte identical')
})
