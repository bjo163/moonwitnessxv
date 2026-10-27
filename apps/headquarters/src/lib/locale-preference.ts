import { isLocale, type Locale } from '@moonwitness/core'

/** Return a canonical supported locale, rejecting all other cookie values. */
export function validateLocalePreference(value: unknown): Locale | null {
  return isLocale(value) ? value : null
}

/** Keep the current path, query, and hash while changing only the locale cookie. */
export function currentRelativeUrl(location: Pick<Location, 'pathname' | 'search' | 'hash'>): string {
  const path = location.pathname.startsWith('/') && !location.pathname.startsWith('//') ? location.pathname : '/'
  return `${path}${location.search}${location.hash}`
}

/** Validate a configured sibling Dock URL; credentials and non-HTTP protocols are forbidden. */
export function validatedDockUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
    return url.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

