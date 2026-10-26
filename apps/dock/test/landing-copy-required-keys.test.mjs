import assert from 'node:assert/strict'
import test from 'node:test'
import { assertRequiredLocaleKeys } from '@moonwitness/core'
import { landingCopy } from '../src/lib/landing-copy.ts'
import { REQUIRED_LANDING_UI_KEYS } from './required-landing-ui-keys.mjs'

test('Dock home catalog contains required UI labels in both locales', () => {
  assert.doesNotThrow(() => assertRequiredLocaleKeys(landingCopy, REQUIRED_LANDING_UI_KEYS))
})

test('a missing required Indonesian label fails with its key identified', () => {
  const id = { ...landingCopy.id }
  delete id.stationMapAlt

  assert.throws(
    () => assertRequiredLocaleKeys({ en: landingCopy.en, id }, REQUIRED_LANDING_UI_KEYS),
    /id\.stationMapAlt/,
  )
})

test('optional long-form content may remain English without blocking the required-label gate', () => {
  const optionalLongForm = 'A longer editorial explanation that has not been translated yet.'
  const catalog = {
    en: { ...landingCopy.en, optionalEditorialNote: optionalLongForm },
    id: { ...landingCopy.id, optionalEditorialNote: optionalLongForm },
  }

  assert.doesNotThrow(() => assertRequiredLocaleKeys(catalog, REQUIRED_LANDING_UI_KEYS))
})
