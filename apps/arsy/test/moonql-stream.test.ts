import { test } from 'node:test'
import assert from 'node:assert/strict'
import { busStream, createBus } from '@moonwitness/moonql'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'

/**
 * Streaming is the one part of the hub where a bug is a leak instead of an error:
 * a generator that never ends keeps a socket, a bus subscription and (on pg) a
 * pool connection alive. These tests hold it to the two properties that matter.
 */

const collect = async (it: AsyncGenerator<unknown>, max = 10): Promise<unknown[]> => {
  const out: unknown[] = []
  for await (const value of it) {
    out.push(value)
    if (out.length >= max) break
  }
  return out
}

test('busStream only forwards the models a stream asked for', async () => {
  const bus = createBus()
  const controller = new AbortController()
  const stream = busStream(bus, { models: ['playlogs'], seconds: 5, limit: 1, signal: controller.signal })

  setTimeout(() => {
    bus.emit('model.created', { model: 'stations', id: 'nope', row: { name: 'other table' } })
    bus.emit('model.created', { model: 'playlogs', id: 'yes', row: { event: 'start' } })
  }, 20)

  const frames = await collect(stream)
  assert.equal(frames.length, 1, 'the foreign model never reaches the wire')
  const frame = frames[0] as { event: string; payload: { model: string; id: string } }
  assert.equal(frame.event, 'model.created')
  assert.equal(frame.payload.model, 'playlogs')
  assert.equal(frame.payload.id, 'yes')
})

test('busStream ends on its own clock when nothing happens', async () => {
  const bus = createBus()
  const controller = new AbortController()
  const started = Date.now()
  // no events at all: a quiet feed must still release the socket
  const frames = await collect(busStream(bus, { seconds: 1, signal: controller.signal }))
  assert.equal(frames.length, 0)
  const elapsed = Date.now() - started
  assert.ok(elapsed >= 900 && elapsed < 3_000, `closed on the deadline, took ${elapsed}ms`)
})

test('busStream releases its subscription as soon as the consumer aborts', async () => {
  const bus = createBus()
  const controller = new AbortController()
  const stream = busStream(bus, { seconds: 0, signal: controller.signal })
  const lap = stream.next()
  controller.abort()
  assert.equal((await lap).done, true)
  // and it never wakes again: the handler is gone from the bus
  bus.emit('model.created', { model: 'playlogs', id: 'x', row: {} })
  assert.equal((await stream.next()).done, true)
})

test('the public on-air frame carries no internal columns', async (t) => {
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const catalog = await app.inject().get('/api/v1/stations?limit=1').end()
  const stationRef = catalog.json().data[0].id as string

  // anonymous, and no credentials anywhere: this is the listener-facing feed
  const pending = app.inject().get('/api/v1/on-air?limit=1&seconds=5').end()
  await new Promise((resolve) => setTimeout(resolve, 60)) // subscriber attached
  await app.inject().post('/api/v1/listen').body({ stationRef, event: 'stop', seconds: 120, listener: 'alice' }).end()

  const res = await pending
  assert.equal(res.statusCode, 200)
  assert.match(String(res.headers['content-type']), /text\/event-stream/)

  const frames = res.body.split('\n\n').filter((chunk) => chunk.startsWith('data: '))
  assert.equal(frames.length, 1)
  const frame = JSON.parse(frames[0]!.slice('data: '.length)) as Record<string, unknown>
  assert.equal(frame.kind, 'listen')
  assert.equal(frame.stationRef, stationRef)
  assert.equal(frame.event, 'stop')
  assert.equal(frame.seconds, 120)
  assert.equal('listener' in frame, false, 'the pseudonym stays off a public stream')
  assert.equal('id' in frame, false, 'row ids stay off a public stream')
})

test('the on-air feed is in the contract and open to anonymous callers', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())

  const headers = await adminHeaders(app)
  const doc = (await app.inject().get('/api/v1/_schema').headers(headers).end()).json().data
  const onAir = (doc.endpoints as Array<Record<string, unknown>>).find((e) => e.path === '/on-air')
  assert.ok(onAir, 'the feed is part of the metadata contract')
  assert.equal(onAir!.stream, true)

  // and it really answers without credentials: a 401 here would be the whole bug
  const anon = await app.inject().get('/api/v1/on-air?limit=1&seconds=1').end()
  assert.equal(anon.statusCode, 200)
})
