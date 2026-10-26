import assert from 'node:assert/strict'
import test from 'node:test'
import { preferredLocale, resolveLocale } from '../dist/locale-resolution.js'

test('locale preference precedence is URL, persisted, account, header, then default', () => {
  assert.deepEqual(resolveLocale({
    urlLocale: 'id', persistedLocale: 'en', accountLocale: 'en', acceptLanguage: 'en',
  }), { locale: 'id', source: 'url' })
  assert.deepEqual(resolveLocale({
    persistedLocale: 'id', accountLocale: 'en', acceptLanguage: 'en',
  }), { locale: 'id', source: 'persisted' })
  assert.deepEqual(resolveLocale({ accountLocale: 'id', acceptLanguage: 'en' }), {
    locale: 'id', source: 'account',
  })
  assert.deepEqual(resolveLocale({ acceptLanguage: 'en' }), { locale: 'en', source: 'accept-language' })
  assert.deepEqual(resolveLocale({}), { locale: 'en', source: 'default' })
})

test('valid region tags map to supported languages; malformed values fail safely', () => {
  assert.equal(preferredLocale('id-ID,en;q=0.8'), 'id')
  assert.equal(preferredLocale('en-US'), 'en')
  assert.equal(preferredLocale('fr;q=1,id;q=0.8,en;q=0.7'), 'id')
  assert.equal(preferredLocale('en;q=0.4,id;q=0.8'), 'id')
  assert.equal(preferredLocale('id,en'), 'id')
  assert.equal(preferredLocale('en,id'), 'en')
  assert.equal(preferredLocale('id;q=0,en;q=0.8'), 'en')
  assert.equal(preferredLocale('*'), undefined)
  assert.equal(preferredLocale('id;q=2,en'), 'en')
  assert.equal(preferredLocale('id;q=0.1234,en'), 'en')
  assert.equal(preferredLocale('bad_tag,id'), 'id')
  assert.deepEqual(resolveLocale({ persistedLocale: 'fr', accountLocale: 'ID', acceptLanguage: 'fr' }), {
    locale: 'en', source: 'default',
  })
})

test('unsupported explicit route locales are returned for rejection, never remapped', () => {
  assert.deepEqual(resolveLocale({ urlLocale: 'fr', persistedLocale: 'id', acceptLanguage: 'id' }), {
    status: 'unsupported-url-locale',
  })
  assert.deepEqual(resolveLocale({ urlLocale: 'id-ID', acceptLanguage: 'en' }), {
    status: 'unsupported-url-locale',
  })
})
