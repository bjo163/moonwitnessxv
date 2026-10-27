import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MoonApiError } from '@moonwitness/moonql-client'
import { loginCopy, loginErrorCode, loginErrorMessage } from '../src/lib/login-copy.js'

void test('HQ login copy provides the same complete key set in Indonesian and English', () => {
  const english = loginCopy('en')
  const indonesian = loginCopy('id')

  assert.deepEqual(Object.keys(indonesian).sort(), Object.keys(english).sort())
  assert.equal(english.loginLabel, 'Email or username')
  assert.equal(indonesian.loginLabel, 'Email atau nama pengguna')
  assert.equal(english.passwordLabel, 'Password')
  assert.equal(indonesian.passwordLabel, 'Kata sandi')
  assert.equal(english.leftTagline, 'PEOPLE · PLACES · IDEAS · CULTURES · BEYOND BORDERS.')
  assert.equal(indonesian.leftTagline, 'ORANG · TEMPAT · GAGASAN · BUDAYA · MELAMPAUI BATAS.')
  assert.equal(loginErrorMessage('en', 'expired'), 'Your session has expired. Sign in again to continue.')
  assert.equal(loginErrorMessage('id', 'expired'), 'Sesi Anda telah berakhir. Masuk kembali untuk melanjutkan.')
})

void test('auth layout renders the localized tagline from the shared login catalog', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/layouts/auth.tsx', import.meta.url), 'utf8'),
  )
  assert.match(source, /\{copy\.leftTagline\}/)
  assert.doesNotMatch(source, /PEOPLE · PLACES · IDEAS · CULTURES · BEYOND BORDERS\./)
})

void test('only stable known error codes select localized login notices', () => {
  assert.equal(loginErrorMessage('en', 'required'), 'Enter your email or username and password to continue.')
  assert.equal(loginErrorMessage('id', 'invalid'), 'Data masuk tidak diterima. Periksa kembali lalu coba lagi.')
  assert.equal(loginErrorMessage('en', 'service unavailable'), null)
  assert.equal(loginErrorMessage('en', 'toString'), null)
  assert.equal(loginErrorMessage('en', 'password=private-token'), null)
})

void test('upstream error details and credential-like values never become redirect error codes', () => {
  const denied = new MoonApiError(401, 'unknown user: admin; password=do-not-reflect')
  const outage = new MoonApiError(503, 'database=private; token=do-not-reflect')
  const runtime = new Error('authorization=private; password=do-not-reflect')

  assert.equal(loginErrorCode(denied), 'invalid')
  assert.equal(loginErrorCode(outage), 'unavailable')
  assert.equal(loginErrorCode(runtime), 'unavailable')

  for (const error of [denied, outage, runtime]) {
    const code = loginErrorCode(error)
    assert.ok(!code.includes('private'))
    assert.ok(!code.includes('password'))
    assert.ok(loginErrorMessage('en', code))
  }
})
