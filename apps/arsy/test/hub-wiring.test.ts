import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { addons } from '../src/addons.js'

/**
 * The hub mounts exactly the addon list in src/addons.ts. A package can be
 * installed, built and fully tested on its own yet never appear on the live
 * server if that one line is missing — this guard boots the real list and
 * walks every model and endpoint it claims to ship.
 */
test('every wired addon contributes its models and endpoints to the real hub', async (t) => {
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  for (const addon of addons) {
    for (const model of Object.keys(addon.models)) {
      assert.ok(app.moonql.registry.models.has(model), `${addon.name}: model "${model}" never reached the hub registry`)
    }
    for (const [key, ep] of Object.entries(addon.endpoints)) {
      const url = `${config.api.prefix}${ep.path ?? key}`
      assert.ok(app.hasRoute({ method: ep.method, url }), `${addon.name}: ${ep.method} ${url} is not mounted`)
    }
  }

  const missions = await app.inject().get(`${config.api.prefix}/actors/missions`).end()
  assert.equal(missions.statusCode, 200, missions.body)
  const body = missions.json() as { data?: { counts?: { missions?: number } }; counts?: { missions?: number } }
  const counts = body.data?.counts ?? body.counts
  assert.equal(counts?.missions, 6, 'the seeded mission table is served by the real hub')
})
