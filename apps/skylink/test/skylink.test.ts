import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parseConfig } from '../src/config.js'
import { createSkylinkServer } from '../src/server.js'

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  dependencies: Record<string, string>
}

void test('SKYLINK accepts the default, environment and command-line ports', () => {
  const defaults = {
    host: '127.0.0.1', port: 3005, databaseUrl: '', arsyUrl: 'http://127.0.0.1:3000',
    serviceKey: '', telegramBotToken: '', telegramWebhookSecret: '',
  }
  assert.deepEqual(parseConfig({}), defaults)
  assert.deepEqual(parseConfig({ HOST: '0.0.0.0', PORT: '3015' }), { ...defaults, host: '0.0.0.0', port: 3015 })
  assert.deepEqual(parseConfig({ PORT: '3015' }, ['--port', '3025']), { ...defaults, port: 3025 })
  assert.deepEqual(parseConfig({}, ['--port=3035']), { ...defaults, port: 3035 })
})

void test('SKYLINK rejects invalid ports with a concise configuration error', () => {
  for (const port of ['abc', '0', '65536', '2.5', '']) {
    assert.throws(
      () => parseConfig({ PORT: port }),
      /Invalid SKYLINK configuration: PORT:/,
    )
  }
  assert.throws(() => parseConfig({}, ['--port']), /--port requires an integer/)
})

void test('SKYLINK validates service keys and paired Telegram webhook credentials', () => {
  assert.throws(() => parseConfig({ SKYLINK_SERVICE_KEY: 'short' }), /at least 32 characters/)
  assert.throws(() => parseConfig({ SKYLINK_SERVICE_KEY: 'x'.repeat(257) }), /256 characters/)
  assert.throws(() => parseConfig({ SKYLINK_TELEGRAM_BOT_TOKEN: 'synthetic-token' }), /configured together/)
  assert.throws(() => parseConfig({ NODE_ENV: 'production' }), /production configuration/)
  assert.doesNotThrow(() => parseConfig({
    SKYLINK_SERVICE_KEY: 'synthetic-service-key-value-123456',
    SKYLINK_TELEGRAM_BOT_TOKEN: 'synthetic-token',
    SKYLINK_TELEGRAM_WEBHOOK_SECRET: 'synthetic-webhook-secret-value-123456',
  }))
})

void test('health endpoint identifies SKYLINK without implying configured providers', async () => {
  const app = createSkylinkServer({
    host: '127.0.0.1', port: 3005, databaseUrl: '', arsyUrl: 'http://127.0.0.1:3000',
    serviceKey: '', telegramBotToken: '', telegramWebhookSecret: '',
  })
  try {
    await app.ready()
    const response = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { status: 'ok', app: 'skylink', port: 3005 })
    assert.equal(response.body.includes('provider'), false)
    assert.match(app.printRoutes(), /send \(POST\)/)
    assert.match(app.printRoutes(), /ws/)
  } finally {
    await app.close()
  }
})

void test('SKYLINK declares its API, store and Telegram runtime dependencies', () => {
  assert.deepEqual(Object.keys(manifest.dependencies).sort(), [
    '@fastify/websocket',
    '@moonwitness/skylink-core',
    '@moonwitness/skylink-store',
    '@moonwitness/skylink-telegram',
    'fastify',
    'zod',
  ])
})
