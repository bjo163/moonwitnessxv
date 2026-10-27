import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { TimeshiftRingBuffer, MAX_STATIONS } from '../src/modules/timeshift/buffer.js'
import type { RadioConfig } from '../src/config.js'

async function makeApp(override?: (c: RadioConfig) => void) {
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  override?.(config)
  return buildApp(config)
}

// B1 — the ring buffer bounds distinct caller-supplied station ids.
void test('B1: timeshift buffer caps distinct stations at MAX_STATIONS (LRU)', () => {
  const buffer = new TimeshiftRingBuffer()
  const ids = Array.from({ length: MAX_STATIONS + 50 }, (_, i) => `station-${String(i)}`)
  for (const id of ids) buffer.pushChunk(id, 1000, 1024)

  assert.ok(buffer.stationCount <= MAX_STATIONS, `retained ${String(buffer.stationCount)} stations over cap ${String(MAX_STATIONS)}`)
  assert.equal(buffer.stationCount, MAX_STATIONS, 'the cap is fully exercised')
  // The very first station was the least-recently-used and must have been evicted.
  assert.equal(buffer.getWindow('station-0').chunkCount, 0, 'the oldest station was evicted')
  // The most recent is still present.
  assert.equal(buffer.getWindow(ids[ids.length - 1] as string).chunkCount, 1)
})

// B1/B2 — the public write routes stay public but are metered per ip.
void test('B1: the public beacon is rate-limited per ip (429 after max)', async (t) => {
  const app = await makeApp((c) => {
    c.security.rateLimit = { max: 2, windowMs: 600_000 }
  })
  t.after(() => app.close())

  const url = '/api/v1/timeshift/stations/st-1/timeshift/beacon'
  const first = await app.inject({ method: 'POST', url, remoteAddress: '203.0.113.7', body: { durationMs: 1000, byteLength: 1024 } })
  assert.equal(first.statusCode, 200, 'the beacon remains public')
  await app.inject({ method: 'POST', url, remoteAddress: '203.0.113.7', body: {} })
  const third = await app.inject({ method: 'POST', url, remoteAddress: '203.0.113.7', body: {} })
  assert.equal(third.statusCode, 429, 'a rapid beacon from one ip is refused')
})

void test('B2: /denpa/transmit is rate-limited per ip', async (t) => {
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = 'test-token'
    c.security.rateLimit = { max: 2, windowMs: 600_000 }
  })
  t.after(() => app.close())

  const post = () => app.inject({
    method: 'POST',
    url: '/api/v1/denpa/transmit',
    remoteAddress: '198.51.100.9',
    body: { message: 'metered transmission' },
  })
  assert.equal((await post()).statusCode, 201)
  await post()
  assert.equal((await post()).statusCode, 429, 'the third transmit from one ip in the window is refused')
})

// B2 — the 400 reason survives the envelope, and a bogus station ref is dropped.
void test('B2: empty transmit returns its reason through the envelope error shape', async (t) => {
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = 'test-token'
  })
  t.after(() => app.close())

  const res = await app.inject({ method: 'POST', url: '/api/v1/denpa/transmit', body: { message: '   ' } })
  assert.equal(res.statusCode, 400)
  const body = res.json() as { ok: boolean; error?: { statusCode?: number; message?: string } }
  assert.equal(body.ok, false)
  assert.equal(body.error?.message, 'message cannot be empty', 'the envelope must preserve the specific reason')
  assert.equal(body.error?.statusCode, 400)
})

void test('B2: an unresolvable stationRef is dropped, not stored as a dangling ref', async (t) => {
  const app = await makeApp((c) => {
    c.denpa.enabled = true
    c.denpa.token = 'test-token'
  })
  t.after(() => app.close())

  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/denpa/transmit',
    body: { message: 'valid text', stationRef: 'no-such-station-zzz' },
  })
  assert.equal(res.statusCode, 201)
  const body = res.json() as { data?: { stationRef?: string | null } }
  assert.ok(
    body.data?.stationRef === null || body.data?.stationRef === undefined,
    `a bogus ref must resolve to null, got ${String(body.data?.stationRef)}`,
  )
})
