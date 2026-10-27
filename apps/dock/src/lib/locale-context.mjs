/* global document, window */
import { isLocale } from '@moonwitness/core'

/** @typedef {import('@moonwitness/core').Locale} Locale */

/** Internal request-only context set by Dock middleware; callers cannot choose it directly. */
export const DOCK_LOCALE_HEADER = 'x-mw-locale'
export const DOCK_ROUTE_PATH_HEADER = 'x-mw-route-path'
export const DOCK_ROUTE_SEARCH_HEADER = 'x-mw-route-search'

/** Fail safely to the accepted default if the framework header is absent or invalid. */
/** @param {string | null | undefined} value @returns {Locale} */
export function localeFromMiddlewareHeader(value) {
  return isLocale(value) ? value : 'en'
}

/** @param {string} pathname @param {string} search @param {string} hash @param {string} requestedLocale */
export function localizedDockHref(pathname, search, hash, requestedLocale) {
  const locale = isLocale(requestedLocale) ? requestedLocale : 'en'
  const safePathname = pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/'
  const localeSegment = /^\/([A-Za-z]{2}(?:-[A-Za-z0-9]{2,8})*)(?=\/|$)/.exec(safePathname)?.[1]
  let localizedPath

  if (localeSegment !== undefined && isLocale(localeSegment)) {
    const remainder = safePathname.slice(localeSegment.length + 1) || ''
    localizedPath = `/${locale}${remainder}`
  } else if (localeSegment !== undefined) {
    // An unsupported explicit locale has no equivalent route to preserve.
    localizedPath = `/${locale}`
  } else {
    localizedPath = `/${locale}${safePathname === '/' ? '' : safePathname}`
  }

  const safeSearch = search.startsWith('?') ? search : ''
  const safeHash = hash.startsWith('#') ? hash : ''
  return `${localizedPath}${safeSearch}${safeHash}`
}

/**
 * Binds one trusted request locale so a component can build internal links without
 * repeating the locale argument. `localizedDockHref` above stays the only place a
 * `/id` or `/en` prefix is produced.
 * @param {Locale} locale
 * @returns {(pathname: string, search?: string, hash?: string) => string}
 */
export function dockHrefFor(locale) {
  const resolved = isLocale(locale) ? locale : 'en'
  return (pathname, search = '', hash = '') => localizedDockHref(pathname, search, hash, resolved)
}

/** @param {string} pathname @param {string} cookieHeader @returns {Locale} */
export function currentDockLocale(pathname, cookieHeader) {
  const routeLocale = /^\/(id|en)(?=\/|$)/.exec(pathname)?.[1]
  if (isLocale(routeLocale)) return routeLocale

  const preference = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('mw_locale='))
    ?.slice('mw_locale='.length)
  return isLocale(preference) ? preference : 'en'
}

/** @typedef {{ cookie: string }} CookieStore */
/**
 * Client-side locale read for interactive islands that must navigate without waiting
 * for a server render. It mirrors the rendered document language, then the pathname
 * prefix, and only then the accepted default. Server components keep using the
 * middleware header, which is the trusted source.
 * @returns {Locale}
 */
export function clientDockLocale() {
  if (typeof document !== 'undefined') {
    const lang = document.documentElement.lang
    if (isLocale(lang)) return lang
    if (window.location.pathname.startsWith('/id')) return 'id'
  }
  return 'en'
}

/** @param {string} requestedLocale @param {CookieStore} cookieStore @param {boolean} secure @returns {boolean} */
export function persistDockLocalePreference(requestedLocale, cookieStore, secure) {
  if (!isLocale(requestedLocale)) return false
  const secureAttribute = secure ? '; Secure' : ''
  cookieStore.cookie = `mw_locale=${requestedLocale}; Path=/; Max-Age=31536000; SameSite=Lax${secureAttribute}`
  return true
}
