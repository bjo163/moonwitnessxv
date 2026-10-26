import { requireLocale, type Locale } from './locale.js'

/** Format an already-numeric UI value; locale never supplies a currency. */
export function formatLocaleNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  assertFiniteNumber(value)
  return new Intl.NumberFormat(requireLocale(locale), options).format(value)
}

/** Format money only when both canonical UI locale and currency are explicit. */
export function formatLocaleCurrency(
  value: number,
  currency: string,
  locale: Locale,
  options: Omit<Intl.NumberFormatOptions, 'currency' | 'style'> = {},
): string {
  assertFiniteNumber(value)
  const code = currency.toUpperCase()
  if (!/^[A-Z]{3}$/.test(code)) throw new RangeError(`Unsupported currency code: ${currency}`)
  return new Intl.NumberFormat(requireLocale(locale), { ...options, style: 'currency', currency: code }).format(value)
}

/**
 * Format a date using an explicit timezone as well as an explicit UI locale.
 * A region or locale never chooses a timezone or makes a country claim.
 */
export function formatLocaleDate(
  value: Date | number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions & { timeZone: string },
): string {
  if (!(value instanceof Date) && typeof value !== 'number') {
    throw new TypeError('Date formatting requires a Date or epoch-millisecond number')
  }
  if (typeof options?.timeZone !== 'string' || options.timeZone.length === 0) {
    throw new TypeError('Date formatting requires an explicit timezone')
  }
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) throw new RangeError('Cannot format an invalid date')
  return new Intl.DateTimeFormat(requireLocale(locale), options).format(date)
}

function assertFiniteNumber(value: number): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError('Locale formatting requires a finite number')
  }
}
