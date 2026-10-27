import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword } from '@moonwitness/moonql-auth'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import { withTestAdmin } from './helpers/auth.js'

async function makeApp() {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  const app = await buildApp(config)
  return app
}

test('M05-14: launchpad and Studio negotiate id/en without changing their routes or identifiers', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())

  const idLaunchpad = await app.inject().get('/').headers({ accept: 'text/html', 'accept-language': 'id-ID,en;q=0.8' }).end()
  assert.equal(idLaunchpad.statusCode, 200)
  assert.equal(idLaunchpad.headers.vary, 'Accept-Language')
  assert.match(idLaunchpad.body, /<html lang="id">/)
  assert.match(idLaunchpad.body, /Pusat Kendali/)
  assert.match(idLaunchpad.body, /Dasbor kendali/)
  assert.match(idLaunchpad.body, /\/api\/v1\/studio/)

  const enLaunchpad = await app.inject().get('/').headers({ accept: 'text/html', 'accept-language': 'fr, en-US;q=0.8' }).end()
  assert.match(enLaunchpad.body, /<html lang="en">/)
  assert.match(enLaunchpad.body, /Mission Control/)
  assert.match(enLaunchpad.body, /Mission control dashboard/)

  const idStudio = await app.inject().get('/api/v1/studio').headers({ 'accept-language': 'id-ID,en;q=0.8' }).end()
  assert.equal(idStudio.statusCode, 200)
  assert.equal(idStudio.headers.vary, 'Accept-Language')
  assert.match(idStudio.body, /<html lang="id">/)
  assert.match(idStudio.body, /nama pengguna/)
  assert.match(idStudio.body, /Masuk/)
  assert.match(idStudio.body, /"createButton":"Buat"/)
  assert.match(idStudio.body, /"viewOf":"dari"/)
  assert.match(idStudio.body, /"from":"dari"/)
  assert.match(idStudio.body, /"actions":"aksi"/)
  assert.match(idStudio.body, /"aggregate":"agregasi"/)
  assert.match(idStudio.body, /\/auth\/login/)

  const defaultStudio = await app.inject().get('/api/v1/studio').end()
  assert.match(defaultStudio.body, /<html lang="en">/)
  assert.match(defaultStudio.body, /Sign in/)
})

test('M05-14: safe 400/401/403 messages localize while API status, envelope, auth and details stay stable', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())

  const invalidEn = await app.inject().post('/api/v1/auth/login').body({ login: 'admin', password: 'wrong' }).end()
  const invalidId = await app.inject().post('/api/v1/auth/login').headers({ 'accept-language': 'id-ID' }).body({ login: 'admin', password: 'wrong' }).end()
  assert.equal(invalidEn.statusCode, 401)
  assert.equal(invalidId.statusCode, 401)
  assert.deepEqual(Object.keys(invalidId.json()).sort(), ['error', 'ok', 'timestamp'])
  assert.equal(invalidEn.json().error.message, 'Invalid credentials')
  assert.equal(invalidId.json().error.message, 'Nama pengguna atau kata sandi tidak valid.')
  assert.equal(invalidId.headers.vary, 'Accept-Language')

  const missingRoute = await app.inject().get('/api/v1/machine-identifier').headers({ 'accept-language': 'id' }).end()
  assert.equal(missingRoute.statusCode, 404)
  assert.equal(missingRoute.json().error.message, 'Route GET /api/v1/machine-identifier not found')
  assert.equal(missingRoute.headers.vary, 'Accept-Language')

  const invalidBody = await app.inject().post('/api/v1/auth/login').headers({ 'accept-language': 'id' }).body({}).end()
  assert.equal(invalidBody.statusCode, 400)
  assert.equal(invalidBody.json().error.message, 'Permintaan tidak valid.')
  assert.ok(invalidBody.json().error.details)

  await app.moonql.model('auth_users').create({
    login: 'm05-viewer',
    displayName: 'M05 Locale Viewer',
    passwordHash: hashPassword('m05-viewer-pw'),
    role: 'user',
  })
  const userLogin = await app.inject().post('/api/v1/auth/login').body({ login: 'm05-viewer', password: 'm05-viewer-pw' }).end()
  assert.equal(userLogin.statusCode, 200)
  const forbidden = await app.inject().post('/api/v1/api-keys').headers({
    authorization: `Bearer ${userLogin.json().data.token}`,
    'accept-language': 'id',
  }).body({ name: 'not-authorized', roles: null }).end()
  assert.equal(forbidden.statusCode, 403)
  assert.equal(forbidden.json().error.message, 'Akses ditolak.')
  assert.equal(forbidden.headers.vary, 'Accept-Language')
})
