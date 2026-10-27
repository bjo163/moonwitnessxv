import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import journey from '@moonwitness/moonql-journey'
import ops from '@moonwitness/moonql-ops'
import envelope from '../src/plugins/envelope.js'

const ADMIN_PASSWORD = 'journey-test-pass'

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, journey, ops],
    seedPolicy: 'require',
    env: { MOONQL_AUTH_ADMIN_PASSWORD: ADMIN_PASSWORD },
    log: { info: () => {}, warn: () => {} },
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()

  const login = await app.inject().post('/orm/auth/login').body({ login: 'admin', password: ADMIN_PASSWORD }).end()
  const token = login.json().data.token as string
  const headers = { authorization: `Bearer ${token}` }
  return { app, moonql, token, headers }
}

test('journey: seeded patches contain 33 slots and historical sources', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())

  const patches = await moonql.model('journey_patches').list({ limit: 100 })
  assert.ok(patches.length >= 34, `Expected at least 34 patches, got ${patches.length}`)

  // Verify Slot 014 numbering conflict is preserved open per §21A.8
  const slot014 = patches.find((p) => p.slot === '014')
  assert.ok(slot014, 'Slot 014 must exist in registry')
  assert.equal(slot014.title, 'FAMILY WITHOUT FEAR')
  assert.equal(slot014.disputedTitle, 'THE WRONG WAY / HELLROAD')
  assert.equal(slot014.status, 'UNRESOLVED_NUMBERING_CONFLICT')

  // Verify Slot 033 user submission status
  const slot033 = patches.find((p) => p.slot === '033')
  assert.ok(slot033, 'Slot 033 must exist')
  assert.equal(slot033.status, 'USER_SUBMITTED_IN_CHAT')

  // Verify historical unnumbered entries
  const hist = patches.find((p) => p.slot === 'UNNUMBERED-01')
  assert.ok(hist, 'UNNUMBERED-01 must exist')
  assert.equal(hist.status, 'UNNUMBERED_HISTORICAL')
  // model rows are Record<string, unknown>, so the text column is narrowed before use
  const historicalNotes = hist.historicalNotes
  assert.ok(typeof historicalNotes === 'string', 'historicalNotes is a text column')
  assert.ok(historicalNotes.includes('early season notebooks'), 'Historical notes must cite provenance')
})

test('journey: view journeyPatchesOverview returns public projection', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())

  const res = await app.inject().get('/orm/journeyPatchesOverview?limit=50').end()
  assert.equal(res.statusCode, 200)

  const body = res.json() as { data: Array<{ slot: string; title: string; status: string }> }
  assert.ok(Array.isArray(body.data))
  assert.ok(body.data.length >= 33)

  const slot014 = body.data.find((p) => p.slot === '014')
  assert.ok(slot014)
  assert.equal(slot014.status, 'UNRESOLVED_NUMBERING_CONFLICT')
})

test('journey: mandate creation and activeMandates view', async (t) => {
  const { app, moonql, headers } = await makeApp()
  t.after(() => app.close())

  const patches = await moonql.model('journey_patches').list({ limit: 5 })
  const firstPatch = patches[0]
  assert.ok(firstPatch, 'At least one patch must exist')

  const createRes = await app.inject().post('/orm/journey_mandates').headers(headers).body({
    patchRef: firstPatch.id,
    title: 'Establish Solar Grid Telemetry',
    operatorPseudonym: 'Op_Antigravity',
    deliverableDesc: 'Broadcast frequency lock on shortwave beacon',
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  }).end()

  assert.equal(createRes.statusCode, 201)

  const viewRes = await app.inject().get('/orm/activeMandates').end()
  assert.equal(viewRes.statusCode, 200)
  const mandates = (viewRes.json() as { data: Array<{ title: string }> }).data
  assert.ok(mandates.some((m) => m.title === 'Establish Solar Grid Telemetry'))
})

test('ops: empire systems model and view', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(() => app.close())

  const systems = await moonql.model('empire_systems').list({ limit: 50 })
  assert.ok(systems.length >= 14, `Expected at least 14 Empire systems, got ${systems.length}`)

  const mwOs = systems.find((s) => s.code === 'sys_moonwitness_os')
  assert.ok(mwOs, 'System MoonWitness OS must exist')
  assert.equal(mwOs.name, 'MoonWitness OS')
  assert.equal(mwOs.category, 'GOVERNANCE')
  assert.equal(mwOs.status, 'ACTIVE')

  const viewRes = await app.inject().get('/orm/empireSystemsOverview').end()
  assert.equal(viewRes.statusCode, 200)
  const viewData = (viewRes.json() as { data: Array<{ code: string }> }).data
  assert.ok(viewData.some((s) => s.code === 'sys_moonwitness_os'))
})
