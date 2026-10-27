import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSkylinkServer } from '../src/server.js'
import type { SkylinkConfig } from '../src/config.js'

const config: SkylinkConfig = {
  host: '127.0.0.1', port: 3005, databaseUrl: '', arsyUrl: 'http://127.0.0.1:3000',
  serviceKey: '', telegramBotToken: '', telegramWebhookSecret: '',
}

void test('SKYLINK serves built operator HTML and confines static asset paths', async () => {
  const app = createSkylinkServer(config)
  try {
    await app.ready()
    const root = await app.inject({ method: 'GET', url: '/' })
    assert.equal(root.statusCode, 200)
    assert.match(root.body, /SKYLINK \/\/ Operator Inbox/)
    const traversal = await app.inject({ method: 'GET', url: '/assets/%2e%2e%2f..%2f..%2fpackage.json' })
    assert.equal(traversal.statusCode, 404)
    const apiStillRegistered = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(apiStillRegistered.statusCode, 200)
  } finally { await app.close() }
})

void test('operator client sends only bearer credentials, omits cookies, and keeps token in memory', async () => {
  const { fetchChannels, fetchDeliveryAttempts } = await import('../client/lib/api.js')
  const originalFetch = globalThis.fetch
  let observed: RequestInit | undefined
  globalThis.fetch = async (_input, init) => {
    observed = init
    return new Response(JSON.stringify({ ok: true, data: [], timestamp: 'now' }), { status: 200 })
  }
  try {
    await fetchChannels('arsy-session-example', new AbortController().signal)
    const headers = new Headers(observed?.headers)
    assert.equal(headers.get('authorization'), 'Bearer arsy-session-example')
    assert.equal(headers.has('x-skylink-key'), false)
    assert.equal(observed?.credentials, 'omit')
    assert.equal(observed?.redirect, 'error')
  let requestedPath = ''
  globalThis.fetch = async (input, init) => {
    requestedPath = String(input)
    observed = init
    return new Response(JSON.stringify({ ok: true, data: [], timestamp: 'now' }), { status: 200 })
  }
  await fetchDeliveryAttempts('conversation/one', 'arsy-session-example', new AbortController().signal)
  assert.equal(requestedPath, '/api/v1/conversations/conversation%2Fone/delivery-attempts?limit=100')
  assert.equal(new Headers(observed?.headers).get('authorization'), 'Bearer arsy-session-example')
  } finally { globalThis.fetch = originalFetch }
})
