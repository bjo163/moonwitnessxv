import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_LOCALE,
  defineLocaleCatalog,
  getLocaleMessage,
  isLocale,
  requireLocale,
  SUPPORTED_LOCALES,
} from '../src/locale.ts'

test('one canonical registry validates both supported locales and retrieves messages', () => {
  assert.deepEqual(SUPPORTED_LOCALES, ['id', 'en'])
  assert.equal(DEFAULT_LOCALE, 'en')
  assert.equal(isLocale('id'), true)
  assert.equal(isLocale('en'), true)
  assert.equal(requireLocale('id'), 'id')

  const catalog = defineLocaleCatalog({
    en: { greeting: 'Hello' },
    id: { greeting: 'Halo' },
  })
  assert.equal(getLocaleMessage(catalog, 'en', 'greeting'), 'Hello')
  assert.equal(getLocaleMessage(catalog, 'id', 'greeting'), 'Halo')
  assert.equal(Object.isFrozen(catalog.en), true)
})

test('unsupported locale values and mismatched catalogs fail safely', () => {
  for (const value of ['fr', 'id-ID', '', null, 1]) {
    assert.equal(isLocale(value), false)
    assert.throws(() => requireLocale(value), RangeError)
  }

  assert.throws(() => defineLocaleCatalog({
    en: { greeting: 'Hello' },
    id: { welcome: 'Halo' },
  }), TypeError)
})
