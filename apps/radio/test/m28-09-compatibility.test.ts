import { test } from 'node:test'
import assert from 'node:assert/strict'
import { API_PREFIX, PORTS } from '@moonwitness/core'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'
import { M28_09_RADIO_COMPATIBILITY as fixture } from './fixtures/m28-09-radio-compatibility.js'

function asRecord(value: unknown): Record<string, unknown> {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value))
  return value as Record<string, unknown>
}

function assertSuccessEnvelope(response: { statusCode: number; json(): unknown }, statusCode = 200) {
  assert.equal(response.statusCode, statusCode)
  const body = asRecord(response.json())
  assert.deepEqual(Object.keys(body).sort(), fixture.hub.successEnvelopeKeys)
  assert.equal(body.ok, true)
  assert.equal(typeof body.timestamp, 'string')
  assert.ok(Number.isFinite(Date.parse(String(body.timestamp))))
  return body.data
}

function assertErrorEnvelope(response: { statusCode: number; json(): unknown }, statusCode: number) {
  assert.equal(response.statusCode, statusCode)
  const body = asRecord(response.json())
  assert.deepEqual(Object.keys(body).sort(), fixture.hub.errorEnvelopeKeys)
  assert.equal(body.ok, false)
  const error = asRecord(body.error)
  assert.equal(error.statusCode, statusCode)
  assert.equal(typeof error.message, 'string')
}

test('M28-09: frozen Radio routes, seeds, envelope, player, WhatsApp and DENPA remain compatible', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.port = fixture.hub.port
  config.api.prefix = fixture.hub.apiPrefix
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = true
  config.denpa.token = 'm28-09-synthetic-test-token'
  const app = await buildApp(config)
  t.after(() => app.close())

  assert.equal(PORTS.hub, fixture.hub.port)
  assert.equal(API_PREFIX, fixture.hub.apiPrefix)

  const stationResponse = await app.inject().get(fixture.stations.listPath).end()
  const stations = assertSuccessEnvelope(stationResponse) as Array<Record<string, unknown>>
  assert.equal(stations.length, fixture.stations.seedCount)
  const sampleStation = stations.find((station) => station.name === fixture.stations.sampleNaturalKey)
  assert.ok(sampleStation)
  assert.equal(sampleStation.active, true)
  assert.equal(sampleStation.probeOk, null, 'stored active status is not live-audio evidence')
  assert.equal(typeof sampleStation.streamUrl, 'string')
  const stationId = String(sampleStation.id)

  const missingStation = await app.inject()
    .get('/api/v1/stations/00000000-0000-0000-0000-000000000000')
    .end()
  assertErrorEnvelope(missingStation, 404)
  assert.equal(asRecord(asRecord(missingStation.json()).error).message, 'Station not found')

  const anonymousWrite = await app.inject().post('/api/v1/stations')
    .body({ name: 'M28-09 synthetic station', streamUrl: 'https://stream.example.invalid/live' })
    .end()
  assertErrorEnvelope(anonymousWrite, 401)

  const catalogResponse = await app.inject().get(fixture.stations.activeCatalogPath).end()
  const catalog = assertSuccessEnvelope(catalogResponse) as Array<Record<string, unknown>>
  assert.equal(catalog.length, fixture.stations.activeCount)
  assert.equal(catalog.some((station) => station.name === fixture.stations.inactiveNaturalKey), false)

  const scheduleResponse = await app.inject().get(fixture.stations.schedulePath).end()
  const schedule = assertSuccessEnvelope(scheduleResponse) as Array<Record<string, unknown>>
  assert.equal(schedule.length, fixture.stations.scheduleCount)

  const playerResponse = await app.inject()
    .get(fixture.player.timeshiftPathTemplate.replace('{id}', stationId))
    .end()
  const nestedPlayerEnvelope = asRecord(assertSuccessEnvelope(playerResponse))
  assert.equal(nestedPlayerEnvelope.ok, true)
  const playerWindow = asRecord(nestedPlayerEnvelope.data)
  assert.equal(playerWindow.stationId, stationId)
  assert.equal(playerWindow.chunkCount, 0)

  const beaconResponse = await app.inject()
    .post(fixture.player.timeshiftBeaconPathTemplate.replace('{id}', stationId))
    .body({ durationMs: 1000, byteLength: 1024 })
    .end()
  const nestedBeaconEnvelope = asRecord(assertSuccessEnvelope(beaconResponse))
  assert.equal(nestedBeaconEnvelope.ok, true)
  const beaconWindow = asRecord(nestedBeaconEnvelope.data)
  assert.equal(beaconWindow.stationId, stationId)
  assert.equal(beaconWindow.chunkCount, 1)

  const onAirPending = app.inject().get(fixture.player.streamPath).end()
  await new Promise((resolve) => setTimeout(resolve, 30))
  const listen = await app.inject().post('/api/v1/listen')
    .body({ stationRef: stationId, event: 'stop', seconds: 7, listener: 'm28-09-synthetic-listener' })
    .end()
  assert.equal(listen.statusCode, 201)
  const onAir = await onAirPending
  assert.equal(onAir.statusCode, 200)
  assert.match(String(onAir.headers['content-type']), /text\/event-stream/)
  const frameText = onAir.body.split('\n\n').find((frame) => frame.startsWith('data: '))
  assert.ok(frameText)
  const frame = JSON.parse(frameText.slice('data: '.length)) as Record<string, unknown>
  assert.equal(frame.kind, 'listen')
  assert.equal(frame.stationRef, stationId)
  assert.equal('listener' in frame, false)
  assert.equal('id' in frame, false)

  const anonymousChannels = await app.inject().get(fixture.whatsapp.channelsPath).end()
  assertErrorEnvelope(anonymousChannels, fixture.whatsapp.anonymousStatus)
  const admin = await adminHeaders(app)
  const channels = await app.inject().get(fixture.whatsapp.channelsPath).headers(admin).end()
  assert.deepEqual(assertSuccessEnvelope(channels), [], 'disabled WhatsApp adds no active channel or network action')
  assert.equal(fixture.whatsapp.disabledChannelCount, 0)

  const invalidStation = await app.inject().post('/api/v1/stations').headers(admin)
    .body({ name: 'M28-09 invalid synthetic station', streamUrl: 'not a URI' })
    .end()
  assertErrorEnvelope(invalidStation, 400)

  const noKey = await app.inject().post(fixture.denpa.inboundPath).body({ msg: 'synthetic signal' }).end()
  assertErrorEnvelope(noKey, fixture.denpa.unauthorizedStatus)
  const wrongKey = await app.inject().post(fixture.denpa.inboundPath)
    .headers({ 'x-denpa-key': 'wrong-synthetic-test-token' })
    .body({ msg: 'synthetic signal' })
    .end()
  assertErrorEnvelope(wrongKey, fixture.denpa.unauthorizedStatus)
  const accepted = await app.inject().post(fixture.denpa.inboundPath)
    .headers({ 'x-denpa-key': 'm28-09-synthetic-test-token' })
    .body({ msg: 'synthetic signal' })
    .end()
  assert.equal(accepted.statusCode, fixture.denpa.acceptedStatus)

  const emptyTransmit = await app.inject().post(fixture.denpa.transmitPath).body({ message: '   ' }).end()
  assertErrorEnvelope(emptyTransmit, 400)
  const transmit = await app.inject().post(fixture.denpa.transmitPath)
    .body({ message: 'M28-09 compatibility fixture', pseudonym: 'synthetic-test-sender' })
    .end()
  assertSuccessEnvelope(transmit, fixture.denpa.publicTransmitStatus)

  await new Promise((resolve) => setTimeout(resolve, 50))
  const publicTransmissions = await app.inject().get(fixture.denpa.publicViewPath).end()
  const transmissions = assertSuccessEnvelope(publicTransmissions) as Array<Record<string, unknown>>
  const fixtureTransmission = transmissions.find((row) => row.message === 'M28-09 compatibility fixture')
  assert.ok(fixtureTransmission)
  assert.equal('tokenHash' in fixtureTransmission, false)
})
