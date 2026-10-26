import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import type { RadioConfig } from '../src/config.js'

async function makeApp(override?: (c: RadioConfig) => void) {
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  override?.(config)
  return buildApp(config)
}

test('denpa: public web transmitter broadcasts on-air', async (t) => {
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = 'test-token'
  })
  t.after(() => app.close())

  // 1. Transmit valid signal
  const res = await app.inject().post('/api/v1/denpa/transmit').body({
    message: 'Shortwave test transmission from Moonwitness Dock',
    pseudonym: 'Pilot_Kopihitam',
  }).end()

  assert.equal(res.statusCode, 201)
  const body = res.json() as { ok: boolean; data: { id: string; message: string; pseudonym: string; status: string } }
  assert.equal(body.ok, true)
  assert.equal(body.data.message, 'Shortwave test transmission from Moonwitness Dock')
  assert.equal(body.data.pseudonym, 'Pilot_Kopihitam')
  assert.equal(body.data.status, 'ON_AIR')

  // 2. Verify projection in publicLiveTransmissions view
  const viewRes = await app.inject().get('/api/v1/publicLiveTransmissions').end()
  assert.equal(viewRes.statusCode, 200)
  const viewRows = (viewRes.json() as { data: Array<{ pseudonym: string; message: string; tokenHash?: string }> }).data
  assert.ok(Array.isArray(viewRows))
  const broadcast = viewRows.find((r) => r.pseudonym === 'Pilot_Kopihitam')
  assert.ok(broadcast, 'Broadcast must appear in publicLiveTransmissions view')
  assert.equal(broadcast.message, 'Shortwave test transmission from Moonwitness Dock')
  assert.equal(broadcast.tokenHash, undefined, 'tokenHash must never leak into public projection')

  // 3. Reject empty message
  const emptyRes = await app.inject().post('/api/v1/denpa/transmit').body({
    message: '   ',
  }).end()
  assert.equal(emptyRes.statusCode, 400)
})

test('denpa: inbound webhook records on-air transmission', async (t) => {
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = 'denpa-secret-key'
  })
  t.after(() => app.close())

  const webhookRes = await app.inject().post('/api/v1/denpa').headers({
    'x-denpa-key': 'denpa-secret-key',
  }).body({
    msg: 'Autonomous beacon heartbeat #42',
  }).end()

  assert.equal(webhookRes.statusCode, 202)

  // Give the async fire-and-forget worker a brief tick to persist
  await new Promise((r) => setTimeout(r, 80))

  const viewRes = await app.inject().get('/api/v1/publicLiveTransmissions').end()
  const viewRows = (viewRes.json() as { data: Array<{ message: string }> }).data
  assert.ok(viewRows.some((r) => r.message.includes('Autonomous beacon heartbeat #42')))
})
