import assert from 'node:assert/strict'
import test from 'node:test'
import { assertRequiredLocaleKeys } from '../src/locale.ts'

const REQUIRED_UI_KEYS = ['navigation.home', 'player.play', 'errors.generic']

test('required UI labels are present in both locale dictionaries', () => {
  const catalog = {
    en: { 'navigation.home': 'Home', 'player.play': 'Play', 'errors.generic': 'Something went wrong' },
    id: { 'navigation.home': 'Beranda', 'player.play': 'Putar', 'errors.generic': 'Terjadi kesalahan' },
  }
  assert.doesNotThrow(() => assertRequiredLocaleKeys(catalog, REQUIRED_UI_KEYS))
})

test('missing required UI labels fail, while optional long-form content is not gated', () => {
  const catalog = {
    en: { 'navigation.home': 'Home', 'player.play': 'Play', 'errors.generic': 'Something went wrong' },
    id: { 'navigation.home': 'Beranda', 'player.play': 'Putar' },
  }
  assert.throws(
    () => assertRequiredLocaleKeys(catalog, REQUIRED_UI_KEYS),
    /id\.errors\.generic/,
  )
  assert.doesNotThrow(() => assertRequiredLocaleKeys(catalog, ['navigation.home']))
})
