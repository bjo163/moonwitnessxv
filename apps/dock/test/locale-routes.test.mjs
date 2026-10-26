import assert from 'node:assert/strict'
import process from 'node:process'
import test from 'node:test'
import { NextRequest } from 'next/server.js'
import { config, middleware } from '../src/middleware.ts'
import {
  currentDockLocale,
  DOCK_ROUTE_PATH_HEADER,
  DOCK_ROUTE_SEARCH_HEADER,
  localizedDockHref,
  persistDockLocalePreference,
} from '../src/lib/locale-context.mjs'

function request(path, headers = {}) {
  return new NextRequest(`http://localhost:3001${path}`, { headers })
}

test('root negotiates a canonical locale and preserves the query string', () => {
  const indonesian = middleware(request('/?from=home', { 'accept-language': 'id-ID,en;q=0.8' }))
  assert.equal(indonesian.status, 307)
  assert.equal(indonesian.headers.get('location'), 'http://localhost:3001/id?from=home')
  assert.equal(indonesian.headers.get('vary'), 'Accept-Language')

  const persisted = middleware(request('/', { cookie: 'mw_locale=id', 'accept-language': 'en' }))
  assert.equal(persisted.headers.get('location'), 'http://localhost:3001/id')
  assert.equal(persisted.headers.get('cache-control'), 'private, no-store')
  assert.equal(persisted.headers.get('vary'), 'Accept-Language, Cookie')

  const invalidPreference = middleware(request('/', { cookie: 'mw_locale=fr', 'accept-language': 'fr' }))
  assert.equal(invalidPreference.headers.get('location'), 'http://localhost:3001/en')
})

test('canonical locale paths rewrite to existing routes without losing query data', () => {
  const home = middleware(request('/id/?section=reader'))
  assert.equal(home.headers.get('x-middleware-rewrite'), 'http://localhost:3001/?section=reader')

  const page = middleware(request('/en/reader?chapter=2'))
  assert.equal(page.headers.get('x-middleware-rewrite'), 'http://localhost:3001/reader?chapter=2')
})

test('localized rewrites overwrite untrusted internal locale headers', () => {
  for (const locale of ['id', 'en']) {
    const response = middleware(request(`/${locale}/reader`, { 'x-mw-locale': 'fr' }))
    assert.equal(response.headers.get('x-middleware-request-x-mw-locale'), locale)
    assert.equal(response.headers.get('x-mw-locale'), null)
    const overridden = response.headers.get('x-middleware-override-headers')?.split(',').map((name) => name.trim().toLowerCase()) ?? []
    assert.ok(overridden.includes('x-mw-locale'))
  }
})

test('trusted route middleware metadata supplies initial language href values and overwrites client values', () => {
  const localized = middleware(request('/id/reader/compare?edition=one', {
    'x-mw-locale': 'en',
    'x-mw-route-path': '/en/fake',
    'x-mw-route-search': '?token=untrusted',
  }))
  const localizedForwarded = localized.headers.get('x-middleware-override-headers')?.split(',').map((name) => name.trim().toLowerCase()) ?? []
  assert.ok(localizedForwarded.includes(DOCK_ROUTE_PATH_HEADER))
  assert.ok(localizedForwarded.includes(DOCK_ROUTE_SEARCH_HEADER))
  assert.equal(localized.headers.get(`x-middleware-request-${DOCK_ROUTE_PATH_HEADER}`), '/id/reader/compare')
  assert.equal(localized.headers.get(`x-middleware-request-${DOCK_ROUTE_SEARCH_HEADER}`), '?edition=one')
  assert.equal(localized.headers.get('x-middleware-request-x-mw-locale'), 'id')
  assert.equal(localized.headers.get(DOCK_ROUTE_PATH_HEADER), null)

  const legacy = middleware(request('/reader?section=terms', {
    'x-mw-route-path': '/id/fake',
    'x-mw-route-search': '?token=untrusted',
    'accept-language': 'id-ID,en;q=0.8',
  }))
  assert.equal(legacy.headers.get(`x-middleware-request-${DOCK_ROUTE_PATH_HEADER}`), '/reader')
  assert.equal(legacy.headers.get(`x-middleware-request-${DOCK_ROUTE_SEARCH_HEADER}`), '?section=terms')
  assert.equal(legacy.headers.get('x-middleware-request-x-mw-locale'), 'id')
  assert.equal(legacy.headers.get('vary'), 'Accept-Language')
  assert.equal(localizedDockHref('/id/reader/compare', '?edition=one', '', 'en'), '/en/reader/compare?edition=one')

  const persisted = middleware(request('/reader?section=terms', {
    cookie: 'mw_locale=id',
    'accept-language': 'en',
  }))
  assert.equal(persisted.headers.get('cache-control'), 'private, no-store')
  assert.equal(persisted.headers.get('vary'), 'Accept-Language, Cookie')
})

test('unsupported locale prefixes fail closed and never remap to a supported locale', () => {
  for (const path of ['/fr', '/fr/reader', '/id-ID/reader', '/en/api/listen']) {
    const response = middleware(request(path))
    assert.equal(response.status, 404, path)
    const contentSecurityPolicy = response.headers.get('content-security-policy') ?? ''
    assert.match(contentSecurityPolicy, /frame-ancestors /)
    assert.doesNotMatch(contentSecurityPolicy, /partner\.example/)
  }
})

test('unprefixed API and framework asset traffic keeps its original path', () => {
  const api = middleware(request('/api/on-air'))
  assert.equal(api.headers.get('x-middleware-next'), '1')

  const legacy = middleware(request('/reader'))
  assert.equal(legacy.headers.get('x-middleware-next'), '1')
  assert.equal(legacy.headers.get('x-middleware-rewrite'), null)

  const metadata = middleware(request('/id/manifest.webmanifest'))
  assert.equal(metadata.headers.get('x-middleware-rewrite'), 'http://localhost:3001/manifest.webmanifest')

  const asset = middleware(request('/_next/static/app.js'))
  assert.equal(asset.headers.get('x-middleware-next'), '1')
  assert.equal(asset.headers.get('x-middleware-rewrite'), null)
  assert.match(config.matcher[0], /_next\//)
})

test('localized embed routes retain embed framing policy on the rewritten destination', () => {
  process.env.EMBED_ORIGINS = 'https://partner.example'
  try {
    const response = middleware(request('/id/embed/station-1'))
    assert.equal(response.headers.get('x-middleware-rewrite'), 'http://localhost:3001/embed/station-1')
    assert.match(response.headers.get('content-security-policy') ?? '', /frame-ancestors https:\/\/partner\.example/)
  } finally {
    delete process.env.EMBED_ORIGINS
  }
})

test('language links preserve the localized route, query, and fragment in both directions', () => {
  assert.equal(localizedDockHref('/id/reader/compare', '?edition=one', '#translation', 'en'), '/en/reader/compare?edition=one#translation')
  assert.equal(localizedDockHref('/en/stations', '?country=ID', '', 'id'), '/id/stations?country=ID')
  assert.equal(localizedDockHref('/id', '?from=home', '', 'en'), '/en?from=home')
})

test('language links prefix legacy routes and do not preserve unsupported locale paths', () => {
  assert.equal(localizedDockHref('/reader', '?page=2', '', 'id'), '/id/reader?page=2')
  assert.equal(localizedDockHref('/fr/reader', '?page=2', '', 'id'), '/id?page=2')
  assert.equal(localizedDockHref('//outside.example/path', '', '', 'id'), '/id')
  assert.equal(localizedDockHref('/reader', 'page=2', 'translation', 'fr'), '/en/reader')
})

test('the route locale wins over the saved preference and invalid values default to English', () => {
  assert.equal(currentDockLocale('/id/reader', 'mw_locale=en'), 'id')
  assert.equal(currentDockLocale('/reader', 'other=value; mw_locale=id'), 'id')
  assert.equal(currentDockLocale('/reader', 'mw_locale=fr'), 'en')
})

test('a selected locale persists for the root route with a same-site preference cookie', () => {
  const cookieStore = { cookie: '' }
  assert.equal(persistDockLocalePreference('id', cookieStore, true), true)
  assert.equal(cookieStore.cookie, 'mw_locale=id; Path=/; Max-Age=31536000; SameSite=Lax; Secure')

  const previousCookie = cookieStore.cookie
  assert.equal(persistDockLocalePreference('fr', cookieStore, false), false)
  assert.equal(cookieStore.cookie, previousCookie)
})

test('middleware re-entry serves internal destination without redirect loops or context loss', () => {
  // Root re-entry from /id:
  const rootReentry = middleware(request('/', {
    'x-mw-locale': 'id',
    'x-mw-route-path': '/id',
    'x-mw-route-search': '',
  }))
  assert.equal(rootReentry.headers.get('x-middleware-next'), '1')
  assert.equal(rootReentry.headers.get('location'), null)
  assert.equal(rootReentry.headers.get('x-middleware-rewrite'), null)

  // Root re-entry with query string from /en?from=probe:
  const rootReentryQuery = middleware(request('/?from=probe', {
    'x-mw-locale': 'en',
    'x-mw-route-path': '/en',
    'x-mw-route-search': '?from=probe',
  }))
  assert.equal(rootReentryQuery.headers.get('x-middleware-next'), '1')
  assert.equal(rootReentryQuery.headers.get('location'), null)

  // Subpath re-entry from /id/terms:
  const subpathReentry = middleware(request('/terms', {
    'x-mw-locale': 'id',
    'x-mw-route-path': '/id/terms',
    'x-mw-route-search': '',
  }))
  assert.equal(subpathReentry.headers.get('x-middleware-next'), '1')
  assert.equal(subpathReentry.headers.get('location'), null)
  assert.equal(subpathReentry.headers.get('x-middleware-rewrite'), null)
  // Subpath re-entry preserves existing forwarded headers without re-resolving or overwriting:
  assert.equal(subpathReentry.headers.get('x-middleware-request-x-mw-locale'), null)

  // Subpath re-entry with query from /en/reader?chapter=2:
  const subpathReentryQuery = middleware(request('/reader?chapter=2', {
    'x-mw-locale': 'en',
    'x-mw-route-path': '/en/reader',
    'x-mw-route-search': '?chapter=2',
  }))
  assert.equal(subpathReentryQuery.headers.get('x-middleware-next'), '1')
  assert.equal(subpathReentryQuery.headers.get('location'), null)

  // Mismatched query or path does not bypass normal negotiation/resolution:
  const mismatchedSearch = middleware(request('/?from=other', {
    'x-mw-locale': 'id',
    'x-mw-route-path': '/id',
    'x-mw-route-search': '?from=original',
  }))
  assert.equal(mismatchedSearch.status, 307)
  assert.equal(mismatchedSearch.headers.get('location'), 'http://localhost:3001/en?from=other')

  const mismatchedPath = middleware(request('/terms', {
    'x-mw-locale': 'id',
    'x-mw-route-path': '/id/other',
    'x-mw-route-search': '',
  }))
  assert.equal(mismatchedPath.headers.get('x-middleware-request-x-mw-locale'), 'en')
})
