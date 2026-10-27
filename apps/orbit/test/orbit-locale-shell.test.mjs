import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  orbitCatalog,
  orbitCopy,
  resolveOrbitLocale,
  ORBIT_NAV_ITEMS,
} from '../src/lib/orbit-copy.ts'

const testDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(testDir, '..')

test('M40-02: orbitCatalog exposes identical complete key sets in English and Indonesian', () => {
  const englishKeys = Object.keys(orbitCatalog.en).sort()
  const indonesianKeys = Object.keys(orbitCatalog.id).sort()

  assert.deepEqual(
    indonesianKeys,
    englishKeys,
    'English and Indonesian dictionaries must have identical keys',
  )
  assert.ok(englishKeys.length >= 25, 'Catalog must contain complete shell key set')
})

test('M40-02: Every key in both locales contains non-empty translated string', () => {
  for (const locale of ['en', 'id']) {
    const copy = orbitCopy(locale)
    for (const [key, value] of Object.entries(copy)) {
      assert.equal(typeof value, 'string', `${locale}.${key} must be a string`)
      assert.ok(value.trim().length > 0, `${locale}.${key} must not be empty`)
      assert.notEqual(value, key, `${locale}.${key} must not fall back to raw key name`)
    }
  }

  // Verify real translations occurred for chrome
  assert.notEqual(orbitCatalog.en.brandSubtitle, orbitCatalog.id.brandSubtitle)
  assert.notEqual(orbitCatalog.en.navOverview, orbitCatalog.id.navOverview)
  assert.notEqual(orbitCatalog.en.workstationsHeading, orbitCatalog.id.workstationsHeading)
  assert.notEqual(orbitCatalog.en.agentLoopsHeading, orbitCatalog.id.agentLoopsHeading)
  assert.notEqual(orbitCatalog.en.taskQueuesHeading, orbitCatalog.id.taskQueuesHeading)
  assert.notEqual(orbitCatalog.en.auditTracesHeading, orbitCatalog.id.auditTracesHeading)
})

test('M40-02: Required navigation keys are present and distinct across locales', () => {
  for (const navKey of ORBIT_NAV_ITEMS) {
    assert.ok(navKey in orbitCatalog.en, `en.${navKey} must exist`)
    assert.ok(navKey in orbitCatalog.id, `id.${navKey} must exist`)
    assert.notEqual(
      orbitCatalog.en[navKey],
      orbitCatalog.id[navKey],
      `Navigation item ${navKey} must have distinct translations in en and id`,
    )
  }
})

test('M40-02: resolveOrbitLocale complies with ADR-0005 precedence and fails safe', () => {
  // Explicit URL locale wins
  assert.equal(resolveOrbitLocale({ urlLocale: 'id', persistedLocale: 'en' }), 'id')
  assert.equal(resolveOrbitLocale({ urlLocale: 'en', persistedLocale: 'id' }), 'en')

  // Persisted cookie wins over header
  assert.equal(resolveOrbitLocale({ persistedLocale: 'id', acceptLanguage: 'en' }), 'id')
  assert.equal(resolveOrbitLocale({ persistedLocale: 'en', acceptLanguage: 'id' }), 'en')

  // Accept-language fallback
  assert.equal(resolveOrbitLocale({ acceptLanguage: 'id-ID,id;q=0.9,en;q=0.8' }), 'id')
  assert.equal(resolveOrbitLocale({ acceptLanguage: 'en-US,en;q=0.9' }), 'en')

  // Unsupported or invalid locales fall back safely to DEFAULT_LOCALE ('en')
  assert.equal(resolveOrbitLocale({ urlLocale: 'fr', persistedLocale: 'de' }), 'en')
  assert.equal(resolveOrbitLocale({ acceptLanguage: 'ja-JP,ja;q=0.9' }), 'en')
  assert.equal(resolveOrbitLocale({}), 'en')
})

test('M40-02: Shell accessibility landmarks, skip link, and reduced motion', () => {
  const layoutPath = resolve(appRoot, 'src/app/layout.tsx')
  assert.ok(existsSync(layoutPath), 'layout.tsx must exist')
  const layoutContent = readFileSync(layoutPath, 'utf8')
  assert.ok(
    layoutContent.includes('orbit-skip-link'),
    'layout.tsx must render accessible skip link',
  )
  assert.ok(
    layoutContent.includes('href="#main-content"'),
    'Skip link must target main content id',
  )

  const cssPath = resolve(appRoot, 'src/app/globals.css')
  assert.ok(existsSync(cssPath), 'globals.css must exist')
  const cssContent = readFileSync(cssPath, 'utf8')
  assert.ok(
    cssContent.includes(':focus-visible'),
    'globals.css must specify accessible :focus-visible styling',
  )
  assert.ok(
    cssContent.includes('@media (prefers-reduced-motion: reduce)'),
    'globals.css must support prefers-reduced-motion',
  )
})

test('M40-02: Monorepo isolation boundaries and zero private HQ imports', () => {
  const srcDir = resolve(appRoot, 'src')
  const checkFiles = [
    resolve(srcDir, 'app/layout.tsx'),
    resolve(srcDir, 'app/page.tsx'),
    resolve(srcDir, 'components/OrbitShellHeader.tsx'),
    resolve(srcDir, 'components/OrbitNav.tsx'),
    resolve(srcDir, 'lib/orbit-copy.ts'),
    resolve(srcDir, 'lib/request-locale.ts'),
  ]

  for (const file of checkFiles) {
    if (!existsSync(file)) continue
    const content = readFileSync(file, 'utf8')
    assert.equal(
      content.includes('apps/headquarters'),
      false,
      `${file} must not import from apps/headquarters internals`,
    )
    assert.equal(
      content.includes('apps/dock'),
      false,
      `${file} must not import from apps/dock internals`,
    )
  }
})

test('M40-10: a URL locale reaches the server render and nothing else can', async () => {
  const { NextRequest } = await import('next/server.js')
  const { middleware } = await import('../src/middleware.ts')
  const forwarded = (url, headers) =>
    middleware(new NextRequest(url, headers ? { headers } : {}))
      .headers.get('x-middleware-request-x-orbit-locale')
  const overridden = (url, headers) =>
    middleware(new NextRequest(url, headers ? { headers } : {}))
      .headers.get('x-middleware-override-headers')

  assert.equal(forwarded('http://127.0.0.1:3007/?locale=id'), 'id')
  assert.equal(forwarded('http://127.0.0.1:3007/?locale=en'), 'en')
  assert.equal(forwarded('http://127.0.0.1:3007/?locale=fr'), '', 'unsupported locale is not forwarded')
  assert.equal(forwarded('http://127.0.0.1:3007/'), '')
  // A hand-written header must never survive: the value is rewritten every request.
  assert.equal(overridden('http://127.0.0.1:3007/', { 'x-orbit-locale': 'id' }), 'x-orbit-locale')
  assert.equal(forwarded('http://127.0.0.1:3007/', { 'x-orbit-locale': 'id' }), '')
})

test('M40-10: the root layout sets the document language from the forwarded locale', () => {
  const layout = readFileSync(resolve(appRoot, 'src/app/layout.tsx'), 'utf8').replace(/\r\n/g, '\n')
  assert.match(layout, /ORBIT_LOCALE_HEADER/, 'layout must read the edge-forwarded locale')
  assert.match(layout, /getRequestLocale\(forwarded === '' \? null : forwarded\)/)
  assert.match(layout, /<html lang=\{locale\}/, 'document language must follow the resolved locale')

  const header = readFileSync(resolve(appRoot, 'src/lib/orbit-locale-header.ts'), 'utf8')
  assert.match(header, /export const ORBIT_LOCALE_HEADER = 'x-orbit-locale'/)
})
