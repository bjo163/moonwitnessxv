import assert from 'node:assert/strict'
import test from 'node:test'
import { assertRequiredLocaleKeys } from '@moonwitness/core'
import { statesCopy, getStatesCopy } from '../src/lib/states-copy.ts'
import { REQUIRED_STATES_UI_KEYS } from './required-states-ui-keys.mjs'

test('M19-15 states copy catalog has full 1:1 key parity between English and Indonesian', () => {
  const englishKeys = Object.keys(statesCopy.en).sort()
  const indonesianKeys = Object.keys(statesCopy.id).sort()

  assert.equal(englishKeys.length, 145)
  assert.equal(indonesianKeys.length, 145)
  assert.deepEqual(indonesianKeys, englishKeys)
})

test('M19-15 states copy catalog satisfies all 145 REQUIRED_STATES_UI_KEYS', () => {
  assert.equal(REQUIRED_STATES_UI_KEYS.length, 145)
  assert.doesNotThrow(() => assertRequiredLocaleKeys(statesCopy, REQUIRED_STATES_UI_KEYS))

  // Sample check across categories
  assert.equal(statesCopy.en.formSearch, 'Search')
  assert.equal(statesCopy.id.formSearch, 'Pencarian')

  assert.equal(statesCopy.en.loadingTransmissions, 'Loading transmissions and signals...')
  assert.equal(statesCopy.id.loadingTransmissions, 'Memuat siaran dan sinyal...')

  assert.equal(statesCopy.en.errorBoundaryTitle, 'Transmission Interrupted')
  assert.equal(statesCopy.id.errorBoundaryTitle, 'Transmisi Terputus')

  assert.equal(statesCopy.en.emptyNoStations, 'No stations match that filter.')
  assert.equal(statesCopy.id.emptyNoStations, 'Tidak ada stasiun yang cocok dengan filter ini.')
})

test('M19-15 missing required key in id throws TypeError identifying missing key', () => {
  const id = { ...statesCopy.id }
  delete id.emptyReaderInvalidTitle

  assert.throws(
    () => assertRequiredLocaleKeys({ en: statesCopy.en, id }, REQUIRED_STATES_UI_KEYS),
    {
      name: 'TypeError',
      message: /Missing required locale messages: id\.emptyReaderInvalidTitle/,
    },
  )
})

test('M19-15 missing required key in en throws TypeError identifying missing key', () => {
  const en = { ...statesCopy.en }
  delete en.errorBoundaryTitle

  assert.throws(
    () => assertRequiredLocaleKeys({ en, id: statesCopy.id }, REQUIRED_STATES_UI_KEYS),
    {
      name: 'TypeError',
      message: /Missing required locale messages: en\.errorBoundaryTitle/,
    },
  )
})

test('M19-15 getStatesCopy resolves copy safely for both locales', () => {
  assert.equal(getStatesCopy('en').formFilter, 'Filter')
  assert.equal(getStatesCopy('id').formFilter, 'Saring')
  assert.equal(getStatesCopy('en').formReset, 'Reset')
  assert.equal(getStatesCopy('id').formReset, 'Atur Ulang')
})

test('M19-15 states copy contains no unresolved placeholders or TODO tokens', () => {
  for (const locale of ['en', 'id']) {
    for (const [key, value] of Object.entries(statesCopy[locale])) {
      assert.ok(
        typeof value === 'string' && value.length > 0,
        `Expected key ${key} in ${locale} to be a non-empty string`,
      )
      assert.doesNotMatch(
        value,
        /\[TODO\]|\[TBD\]|undefined|null/i,
        `Key ${key} in ${locale} contains unresolved placeholder`,
      )
    }
  }
})
