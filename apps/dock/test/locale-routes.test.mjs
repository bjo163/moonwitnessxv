import assert from 'node:assert/strict'
import process from 'node:process'
import test from 'node:test'
import { NextRequest } from 'next/server.js'
import { config, middleware } from '../src/middleware.ts'

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
