import { isLocale } from '@moonwitness/core'

/** @typedef {import('@moonwitness/core').Locale} Locale */

/** Internal request-only context set by Dock middleware; callers cannot choose it directly. */
export const DOCK_LOCALE_HEADER = 'x-mw-locale'

/** Fail safely to the accepted default if the framework header is absent or invalid. */
/** @param {string | null | undefined} value @returns {Locale} */
export function localeFromMiddlewareHeader(value) {
  return isLocale(value) ? value : 'en'
}
