import assert from 'node:assert/strict'
import { test } from 'node:test'
import { currentRelativeUrl, dockUrlForLocale, validatedDockUrl, validateLocalePreference } from '../src/lib/locale-preference.js'

void test('locale preference accepts only canonical supported values', () => {
  assert.equal(validateLocalePreference('id'), 'id')
  assert.equal(validateLocalePreference('en'), 'en')
  for (const value of ['ID', 'en-US', '', null, 1, 'hq_token=secret']) {
    assert.equal(validateLocalePreference(value), null)
  }
})

void test('locale change preserves the current route, query, and hash without accepting protocol-relative paths', () => {
  assert.equal(currentRelativeUrl({ pathname: '/models', search: '?q=moon&page=2', hash: '#results' }), '/models?q=moon&page=2#results')
  assert.equal(currentRelativeUrl({ pathname: '//evil.test', search: '?next=/', hash: '' }), '/?next=/')
})

void test('changing locale writes only its own preference cookie and leaves an existing session cookie untouched', () => {
  const cookies = new Map([['hq_token', 'synthetic-session-marker']])
  const documentCookie = 'mw_locale=id; Path=/; Max-Age=31536000; SameSite=Lax'
  const [nameValue] = documentCookie.split(';', 1)
  const separator = nameValue.indexOf('=')
  cookies.set(nameValue.slice(0, separator), nameValue.slice(separator + 1))

  assert.equal(cookies.get('mw_locale'), 'id')
  assert.equal(cookies.get('hq_token'), 'synthetic-session-marker')
})

void test('Dock links require a credential-free HTTP(S) URL', () => {
  assert.equal(validatedDockUrl('https://dock.example/path/'), 'https://dock.example/path')
  for (const value of [undefined, '', 'not a url', 'javascript:alert(1)', 'https://user:pass@dock.example']) {
    assert.equal(validatedDockUrl(value), null)
  }
})

void test('HQ-to-Dock links carry only the supported UI locale and never copy HQ query or fragment data', async () => {
  const configured = 'https://dock.example/base/en/?token=private&return=%2Fmodels#record-7'
  assert.equal(dockUrlForLocale(configured, 'id'), 'https://dock.example/base/id')
  assert.equal(dockUrlForLocale(configured, 'en'), 'https://dock.example/base/en')
  assert.equal(dockUrlForLocale('https://dock.example/id', 'en'), 'https://dock.example/en')
  for (const locale of ['fr', 'en-US', '', null]) {
    assert.equal(dockUrlForLocale(configured, locale), null)
  }
  for (const value of [undefined, 'javascript:alert(1)', 'https://user:pass@dock.example']) {
    assert.equal(dockUrlForLocale(value, 'id'), null)
  }

  const authLayout = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/layouts/auth.tsx', import.meta.url), 'utf8'),
  )
  const verticalLayout = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/layouts/vertical.tsx', import.meta.url), 'utf8'),
  )
  for (const source of [authLayout, verticalLayout]) {
    assert.match(source, /dockUrlForLocale\(DOCK_URL, locale\)/)
    assert.doesNotMatch(source, /href=\{DOCK_URL\}/)
  }
})

void test('locale preference is isolated from Hub session cookie and session denial behavior', async () => {
  const sessionTest = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('./session-auth.test.ts', import.meta.url), 'utf8'),
  )
  const guardTest = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('./hq-authz-guard.test.ts', import.meta.url), 'utf8'),
  )
  const selector = await import('node:fs/promises').then(({ readFile }) =>
    readFile(new URL('../src/ui/client/LocaleSelector.tsx', import.meta.url), 'utf8'),
  )

  assert.match(selector, /mw_locale=/)
  assert.doesNotMatch(selector, /hq_token|role|api\/session/)
  assert.match(sessionTest, /expired opaque cookie is rejected by the Hub/)
  assert.match(guardTest, /no-session|expired/i)
})
