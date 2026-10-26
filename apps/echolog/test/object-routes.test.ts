import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Writable } from 'node:stream'
import { test } from 'node:test'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import auth, { newToken } from '@moonwitness/moonql-auth'
import { parseConfig } from '../src/config.js'
import { createEchologServer } from '../src/server.js'
import { safeStoredFilename } from '../src/limits.js'

const SERVICE_KEY = 'echolog-test-service-key-00000000000000000001'
const GRANT_SECRET = 'echolog-test-grant-secret-00000000000000000001'

async function createArsyVerifier() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [auth],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: 'test-only-password' },
    log: app.log,
  })
  app.addHook('onClose', async () => moonql.close())
  await app.register(moonqlRest, { prefix: '/api/v1', instance: moonql })
  const address = await app.listen({ host: '127.0.0.1', port: 0 })
  return { app, moonql, url: address }
}

function createConfig(storageRoot: string, arsyUrl: string) {
  return parseConfig({
    ECHOLOG_ARSY_URL: arsyUrl,
    ECHOLOG_SERVICE_KEY: SERVICE_KEY,
    ECHOLOG_GRANT_SECRET: GRANT_SECRET,
    ECHOLOG_STORAGE_ROOT: storageRoot,
    ECHOLOG_STORAGE_QUOTA_BYTES: '1024',
    ECHOLOG_MAX_UPLOAD_BYTES: '8',
    ECHOLOG_ALLOWED_MIME_TYPES: 'image/png,application/pdf',
    NODE_ENV: 'test',
  })
}

async function makeExpiredSession(moonql: Awaited<ReturnType<typeof bootMoonQl>>): Promise<string> {
  const users = await moonql.model('auth_users').search({ limit: 1, where: { login: 'admin' } })
  const user = users.rows[0]
  assert.ok(user)
  const token = newToken()
  await moonql.model('auth_sessions').create({
    userRef: user.id,
    token,
    expiresAt: new Date(0).toISOString(),
  })
  return token
}

void test('ECHOLOG objects enforce two auth modes, bounds, and private download grants', async (t) => {
  const arsy = await createArsyVerifier()
  const root = await mkdtemp(join(tmpdir(), 'echolog-routes-'))
  const logChunks: string[] = []
  const logStream = new Writable({
    write(chunk: Buffer | string, _encoding, callback) {
      logChunks.push(chunk.toString())
      callback()
    },
  })
  const app = createEchologServer(createConfig(root, arsy.url), {
    logger: { level: 'trace', stream: logStream },
  })
  t.after(async () => {
    await app.close()
    await arsy.app.close()
    await rm(root, { recursive: true, force: true })
  })

  const login = await arsy.app.inject().post('/api/v1/auth/login')
    .body({ login: 'admin', password: 'test-only-password' }).end()
  assert.equal(login.statusCode, 200)
  const loginBody = login.json() as { token?: string; data?: { token?: string } }
  const token = loginBody.data?.token ?? loginBody.token
  assert.ok(token)
  const expiredToken = await makeExpiredSession(arsy.moonql)

  const anonymous = await app.inject().get('/api/v1/objects/sha256/' + 'a'.repeat(64) + '/meta')
  assert.equal(anonymous.statusCode, 401)

  const invalidService = await app.inject().get('/api/v1/objects/sha256/' + 'a'.repeat(64) + '/meta')
    .headers({ 'x-echolog-key': 'wrong-service-key' })
  assert.equal(invalidService.statusCode, 401)

  const body = Buffer.from('hello')
  const upload = await app.inject({
    method: 'POST',
    url: '/api/v1/objects',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'image/png',
      'x-filename': '../private-name.png',
    },
    payload: body,
  })
  assert.equal(upload.statusCode, 201)
  const sidecar = upload.json() as { object_key: string; digest: string; filename: string; uploader: string; content_type: string }
  assert.equal(sidecar.object_key, `sha256/${sidecar.digest}`)
  assert.equal(sidecar.filename, 'private-name.png')
  assert.equal(sidecar.uploader, 'admin')
  assert.equal(sidecar.content_type, 'image/png')

  const meta = await app.inject({
    method: 'GET',
    url: `/api/v1/objects/sha256/${sidecar.digest}/meta`,
    headers: { authorization: `Bearer ${token}` },
  })
  assert.equal(meta.statusCode, 200)
  assert.deepEqual(meta.json(), sidecar)

  const expired = await app.inject({
    method: 'GET',
    url: `/api/v1/objects/sha256/${sidecar.digest}/meta`,
    headers: { authorization: `Bearer ${expiredToken}` },
  })
  assert.equal(expired.statusCode, 401)

  const grantResponse = await app.inject({
    method: 'GET',
    url: `/api/v1/objects/sha256/${sidecar.digest}`,
    headers: { 'x-echolog-key': SERVICE_KEY },
  })
  assert.equal(grantResponse.statusCode, 200)
  const grant = grantResponse.json() as { url: string; expires_at: string }
  const ttlMs = Date.parse(grant.expires_at) - Date.now()
  assert.ok(ttlMs > 0 && ttlMs <= 5 * 60 * 1000)
  assert.equal(safeStoredFilename('../unsafe\r\nname.png'), 'unsafe__name.png')

  const downloaded = await app.inject({ method: 'GET', url: grant.url })
  assert.equal(downloaded.statusCode, 200)
  assert.equal(downloaded.body, body.toString())
  assert.match(downloaded.headers['content-disposition'] as string, /^attachment;/)
  assert.doesNotMatch(downloaded.headers['content-disposition'] as string, /[\r\n/]/)
  assert.equal(downloaded.headers['content-type'], 'image/png')

  const tamperedGrant = await app.inject({ method: 'GET', url: `${grant.url}x` })
  assert.equal(tamperedGrant.statusCode, 401)

  const oversize = await app.inject({
    method: 'POST',
    url: '/api/v1/objects',
    headers: { 'x-echolog-key': SERVICE_KEY, 'content-type': 'image/png' },
    payload: Buffer.from('123456789'),
  })
  assert.equal(oversize.statusCode, 413)

  const disallowed = await app.inject({
    method: 'POST',
    url: '/api/v1/objects',
    headers: { 'x-echolog-key': SERVICE_KEY, 'content-type': 'text/plain' },
    payload: Buffer.from('text'),
  })
  assert.equal(disallowed.statusCode, 415)

  const heldUpload = await app.inject({
    method: 'POST',
    url: '/api/v1/objects',
    headers: {
      'x-echolog-key': SERVICE_KEY,
      'content-type': 'application/pdf',
      'x-filename': 'held.pdf',
      'x-echolog-legal-hold': 'true',
    },
    payload: Buffer.from('hold'),
  })
  assert.equal(heldUpload.statusCode, 201)
  const heldKey = heldUpload.json().object_key as string
  const heldDigest = heldKey.slice('sha256/'.length)
  const heldDelete = await app.inject({
    method: 'DELETE',
    url: `/api/v1/objects/sha256/${heldDigest}`,
    headers: { 'x-echolog-key': SERVICE_KEY },
  })
  assert.equal(heldDelete.statusCode, 409)

  const garbageCollection = await app.inject({
    method: 'POST',
    url: '/api/v1/gc',
    headers: { 'x-echolog-key': SERVICE_KEY },
  })
  assert.equal(garbageCollection.statusCode, 200)
  assert.ok(garbageCollection.json().held.some((item: { object_key: string }) => item.object_key === heldKey))

  const invalidPathKey = await app.inject({
    method: 'GET',
    url: '/api/v1/objects/sha256/not-a-digest/meta',
    headers: { 'x-echolog-key': SERVICE_KEY },
  })
  assert.notEqual(invalidPathKey.statusCode, 200)

  assert.equal(logChunks.join('').includes(token), false)
  assert.equal(logChunks.join('').includes(expiredToken), false)
  assert.equal(logChunks.join('').includes(grant.url), false)
  assert.equal(logChunks.join('').includes(body.toString()), false)
})

