import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parseConfig } from '../src/config.js'
import { createSkylinkServer } from '../src/server.js'

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  dependencies: Record<string, string>
}

void test('SKYLINK accepts the default, environment and command-line ports', () => {
  assert.deepEqual(parseConfig({}), { host: '127.0.0.1', port: 3005 })
  assert.deepEqual(parseConfig({ HOST: '0.0.0.0', PORT: '3015' }), { host: '0.0.0.0', port: 3015 })
  assert.deepEqual(parseConfig({ PORT: '3015' }, ['--port', '3025']), { host: '127.0.0.1', port: 3025 })
  assert.deepEqual(parseConfig({}, ['--port=3035']), { host: '127.0.0.1', port: 3035 })
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

void test('health endpoint identifies SKYLINK without implying configured providers', async () => {
  const app = createSkylinkServer({ host: '127.0.0.1', port: 3005 })
  try {
    await app.ready()
    assert.equal(app.hasDecorator('websocketServer'), true)
    assert.equal(app.printRoutes(), '└── /\n    └── health (GET, HEAD)\n')
    const response = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { status: 'ok', app: 'skylink', port: 3005 })
    assert.equal(response.body.includes('provider'), false)
  } finally {
    await app.close()
  }
})

void test('SKYLINK skeleton has no provider, database or UI runtime dependencies', () => {
  assert.deepEqual(Object.keys(manifest.dependencies).sort(), [
    '@fastify/websocket',
    '@moonwitness/skylink-core',
    'fastify',
    'zod',
  ])
})
