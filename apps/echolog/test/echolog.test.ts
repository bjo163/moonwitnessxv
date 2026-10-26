import assert from 'node:assert/strict'
import { createServer } from 'node:net'
import { test } from 'node:test'
import { sha256Hex } from '@moonwitness/echolog-core'
import { parseConfig } from '../src/config.js'
import { createEchologServer } from '../src/server.js'

async function getAvailablePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve())
  })
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  return address.port
}

void test('ECHOLOG boots on an explicit port and exposes only honest health surfaces', async (t) => {
  const port = await getAvailablePort()
  const config = parseConfig({}, ['--port', String(port)])
  const app = createEchologServer(config)
  t.after(async () => app.close())

  const address = await app.listen({ host: config.host, port: config.port })
  const health = await fetch(`${address}/health`)
  assert.equal(health.status, 200)
  assert.deepEqual(await health.json(), { status: 'ok', app: 'echolog', port })

  const ready = await fetch(`${address}/health/ready`)
  assert.equal(ready.status, 503)
  assert.deepEqual(await ready.json(), {
    status: 'not_ready',
    app: 'echolog',
    reason: 'no driver configured',
  })

  assert.equal(app.printRoutes(), '└── /\n    └── health (GET, HEAD)\n        └── /ready (GET, HEAD)\n')
})

void test('ECHOLOG config rejects an invalid port with a readable message', () => {
  assert.throws(
    () => parseConfig({ ECHOLOG_PORT: '70000' }),
    /Invalid ECHOLOG configuration: port: Too big: expected number to be <=65535/,
  )
  assert.throws(
    () => parseConfig({}, ['--port', 'not-a-port']),
    /Invalid ECHOLOG configuration: port:/,
  )
})

void test('ECHOLOG core computes SHA-256 using the Web Crypto API', async () => {
  assert.equal(
    await sha256Hex(new TextEncoder().encode('abc')),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  )
})
