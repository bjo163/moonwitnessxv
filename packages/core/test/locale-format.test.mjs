import assert from 'node:assert/strict'
import test from 'node:test'
import { formatLocaleCurrency, formatLocaleDate, formatLocaleNumber } from '../dist/locale-format.js'

test('dates, numbers, and explicitly selected currencies format for id and en', () => {
  assert.equal(formatLocaleNumber(1234.5, 'id'), '1.234,5')
  assert.equal(formatLocaleNumber(1234.5, 'en'), '1,234.5')
  assert.equal(formatLocaleCurrency(12.5, 'USD', 'id'), 'US$12,50')
  assert.equal(formatLocaleCurrency(12.5, 'USD', 'en'), '$12.50')

  const date = new Date('2026-10-27T12:00:00.000Z')
  assert.equal(formatLocaleDate(date, 'id', { dateStyle: 'medium', timeZone: 'UTC' }), '27 Okt 2026')
  assert.equal(formatLocaleDate(date, 'en', { dateStyle: 'medium', timeZone: 'UTC' }), 'Oct 27, 2026')
})

test('invalid values, identifiers, source text, currencies, locales, and timezones are rejected', () => {
  assert.throws(() => formatLocaleNumber(Number.NaN, 'id'), RangeError)
  assert.throws(() => formatLocaleNumber(Infinity, 'en'), RangeError)
  assert.throws(() => formatLocaleNumber('edition-123', 'id'), RangeError)
  assert.throws(() => formatLocaleCurrency(1, 'US', 'en'), RangeError)
  assert.throws(() => formatLocaleCurrency(1, 'USD', 'fr'), RangeError)
  assert.throws(() => formatLocaleDate(Number.NaN, 'en', { timeZone: 'UTC' }), RangeError)
  assert.throws(() => formatLocaleDate('source quote', 'en', { timeZone: 'UTC' }), TypeError)
  assert.throws(() => formatLocaleDate(0, 'en', {}), TypeError)
  assert.throws(() => formatLocaleDate(0, 'en', { timeZone: 'Invalid/Zone' }), RangeError)
})

test('the supplied timezone controls display independently of UI language', () => {
  const lateUtc = new Date('2026-10-27T23:30:00.000Z')
  assert.equal(formatLocaleDate(lateUtc, 'id', { dateStyle: 'medium', timeZone: 'UTC' }), '27 Okt 2026')
  assert.equal(formatLocaleDate(lateUtc, 'id', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' }), '28 Okt 2026')
})
