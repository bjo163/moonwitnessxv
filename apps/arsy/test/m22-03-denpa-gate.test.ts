import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { withTestAdmin } from './helpers/auth.js'

const waitForAsyncWrite = () => new Promise((resolve) => setTimeout(resolve, 80))

test('M22-03: inbound DENPA requires opt-in token and rejects invalid payloads before writing', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = true
  config.denpa.token = 'm22-03-synthetic-inbound-token'
  const app = await buildApp(config)
  t.after(() => app.close())

  const marker = 'M22-03 synthetic DENPA marker'
  const noToken = await app.inject()
    .post('/api/v1/denpa')
    .body({ msg: marker })
    .end()
  assert.equal(noToken.statusCode, 401)
  assert.equal(noToken.body.includes(marker), false, 'unauthorized response does not echo payload')

  const wrongToken = await app.inject()
    .post('/api/v1/denpa')
    .headers({ 'x-denpa-key': 'm22-03-wrong-synthetic-token' })
    .body({ msg: marker })
    .end()
  assert.equal(wrongToken.statusCode, 401)
  assert.equal(wrongToken.body.includes(marker), false, 'unauthorized response does not echo payload')

  const publicBefore = await app.inject().get('/api/v1/publicLiveTransmissions').end()
  assert.equal(publicBefore.statusCode, 200)
  assert.equal(
    (publicBefore.json().data as Array<Record<string, unknown>>).some((row) => row.message === marker),
    false,
    'missing and wrong tokens create no public transmission',
  )

  const invalidPayload = await app.inject()
    .post('/api/v1/denpa')
    .headers({ 'x-denpa-key': config.denpa.token })
    .body(['not', 'an', 'object'])
    .end()
  assert.equal(invalidPayload.statusCode, 400, 'non-object JSON payload is rejected')

  const accepted = await app.inject()
    .post('/api/v1/denpa')
    .headers({ 'x-denpa-key': config.denpa.token })
    .body({ msg: marker })
    .end()
  assert.equal(accepted.statusCode, 202)
  await waitForAsyncWrite()

  const publicAfter = await app.inject().get('/api/v1/publicLiveTransmissions').end()
  assert.equal(publicAfter.statusCode, 200)
  assert.equal(
    (publicAfter.json().data as Array<Record<string, unknown>>).some((row) => row.message === marker),
    true,
    'the configured synthetic token accepts and records the object payload',
  )
})
