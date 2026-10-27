import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import envelope from '../src/plugins/envelope.js'
import circuitBreaker from '../src/plugins/circuit-breaker.js'
import { renderLaunchpadHtml, type LaunchpadData } from '../src/lib/launchpad.js'

// B4 — the circuit breaker must not leave its timeout timer armed after a fast call.
void test('B4: circuit breaker clears the timeout timer once the race settles', async (t) => {
  const app = Fastify({ logger: false })
  t.after(() => app.close())
  await app.register(circuitBreaker)
  await app.ready()

  const realSetTimeout = globalThis.setTimeout
  const realClearTimeout = globalThis.clearTimeout
  const armed = new Set<ReturnType<typeof setTimeout>>()
  let cleared = 0
  // Only wrap the timer entry points for the duration of this one call.
  globalThis.setTimeout = ((fn: Parameters<typeof setTimeout>[0], ms?: number, ...rest: unknown[]) => {
    const id = realSetTimeout(fn, ms, ...(rest as []))
    armed.add(id)
    return id
  }) as typeof setTimeout
  globalThis.clearTimeout = ((id?: ReturnType<typeof setTimeout>) => {
    if (id !== undefined && armed.delete(id)) cleared += 1
    return realClearTimeout(id)
  }) as typeof clearTimeout
  try {
    const result = await app.circuitBreaker.execute<string>('svc', async () => 'done', 'fallback', 5_000)
    assert.equal(result, 'done', 'the action wins the race and its value is returned')
    assert.ok(cleared >= 1, 'the armed timeout must be cleared once the race settles')
  } finally {
    globalThis.setTimeout = realSetTimeout
    globalThis.clearTimeout = realClearTimeout
  }
})

// B6 — a bare JSON primitive 2xx response still carries the {ok,data,timestamp} contract.
void test('B6: a numeric JSON response is enveloped, not passed through raw', async (t) => {
  const app = Fastify({ logger: false })
  t.after(() => app.close())
  await app.register(envelope)
  app.get('/num', async () => 42)

  const res = await app.inject({ method: 'GET', url: '/num' })
  assert.match(String(res.headers['content-type']), /application\/json/)
  const body = res.json() as { ok: boolean; data: number; timestamp?: string }
  assert.equal(body.ok, true)
  assert.equal(body.data, 42)
  assert.ok(body.timestamp, 'the envelope timestamp is present')
})

// B5 — the launchpad derives its ports from shared PORTS and escapes config strings.
const baseData: LaunchpadData = {
  name: 'Hub', version: '1.0.0', engine: 'sqlite', api: '/api/v1', docs: '/docs',
  openapi: '/docs/json', health: '/api/v1/health', metrics: '/api/v1/metrics', studio: '/api/v1/studio',
}

void test('B5: launchpad escapes config-derived strings and hard-codes no ports', () => {
  const html = renderLaunchpadHtml({ ...baseData, name: '<script>alert(1)</script>' }, 'en')
  assert.equal(html.includes('<script>alert(1)</script>'), false, 'a markup title must not be injected raw')
  assert.ok(html.includes('&lt;script&gt;'), 'the interpolated title is escaped')

  const source = readFileSync(fileURLToPath(new URL('../src/lib/launchpad.ts', import.meta.url)), 'utf8')
  assert.match(source, /PORTS\.hub/, 'the status bar derives from the shared PORTS contract')
  for (const literal of [':3000', ':3001', ':3002', ':3003']) {
    assert.equal(source.includes(literal), false, `${literal} must not be hard-coded in the launchpad`)
  }
})
