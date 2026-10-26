import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { URL, pathToFileURL } from 'node:url'

const req = createRequire(new URL('../package.json', import.meta.url))
const ts = req('typescript')
const { renderToStaticMarkup } = req('react-dom/server')
const { createElement } = req('react')

// Resolve paths
const shellTsxUrl = new URL('../src/ui/components/shell.tsx', import.meta.url)
let code = readFileSync(shellTsxUrl, 'utf8')

// Map @/ aliases to absolute file URLs for Node ESM execution
const srcDir = path.resolve(new URL('../src', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))
code = code.replace(/from ['"]@\/([^'"]+)['"]/g, (match, subpath) => {
  let target = path.join(srcDir, subpath)
  if (!target.endsWith('.mjs') && !target.endsWith('.ts') && !target.endsWith('.tsx')) {
    target += '.ts'
  }
  return `from '${pathToFileURL(target).href}'`
})

// Stub client LocaleSwitcher for SSR static markup rendering
code = code.replace(/import\s*\{\s*LocaleSwitcher\s*\}\s*from\s*['"]\.\/locale-switcher['"]/, 'const LocaleSwitcher = () => null;')

const res = ts.transpileModule(code, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  },
})

const tempPath = path.resolve(srcDir, 'ui/components/.temp-header-semantics-test.mjs')
writeFileSync(tempPath, res.outputText)

let shellMod
try {
  shellMod = await import(pathToFileURL(tempPath).href)
} finally {
  try {
    unlinkSync(tempPath)
  } catch {
    // ignore cleanup error
  }
}

const {
  SiteHeader,
  SiteFooter,
  isRouteActive,
  getLocalizedNavHref,
  normalizePath,
  NAV_LINKS,
} = shellMod

test('header navigation assigns aria-current="page" and dk-nav-active only to the active route', () => {
  // Case 1: Active on Indonesian home page (/id)
  const homeHtml = renderToStaticMarkup(
    createElement(SiteHeader, {
      initialPath: '/id',
      initialSearch: '',
      initialLocale: 'id',
    })
  )

  // Home link must have aria-current="page" and dk-nav-active
  assert.match(
    homeHtml,
    /<a\s+[^>]*href="\/id"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*aria-current="page"[^>]*>HOME<\/a>|<a\s+[^>]*href="\/id"[^>]*aria-current="page"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*>HOME<\/a>/
  )
  // Non-active links must not have aria-current="page" or dk-nav-active
  assert.match(homeHtml, /<a\s+href="\/id\/stations"[^>]*>SIGNALS<\/a>/)
  assert.doesNotMatch(homeHtml, /<a\s+[^>]*href="\/id\/stations"[^>]*aria-current="page"/)
  assert.doesNotMatch(homeHtml, /<a\s+[^>]*href="\/id\/stations"[^>]*dk-nav-active/)
  assert.match(homeHtml, /<a\s+href="\/id\/reader"[^>]*>READER<\/a>/)
  assert.doesNotMatch(homeHtml, /<a\s+[^>]*href="\/id\/reader"[^>]*aria-current="page"/)
  assert.match(homeHtml, /<a\s+href="\/id\/terms"[^>]*>TERMS<\/a>/)
  assert.doesNotMatch(homeHtml, /<a\s+[^>]*href="\/id\/terms"[^>]*aria-current="page"/)

  // Case 2: Active on English Signals page (/en/stations)
  const stationsHtml = renderToStaticMarkup(
    createElement(SiteHeader, {
      initialPath: '/en/stations',
      initialSearch: '',
      initialLocale: 'en',
    })
  )

  // Signals link must be active
  assert.match(
    stationsHtml,
    /<a\s+[^>]*href="\/en\/stations"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*aria-current="page"[^>]*>SIGNALS<\/a>|<a\s+[^>]*href="\/en\/stations"[^>]*aria-current="page"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*>SIGNALS<\/a>/
  )
  // Home link must NOT be active
  assert.match(stationsHtml, /<a\s+href="\/en"[^>]*>HOME<\/a>/)
  assert.doesNotMatch(stationsHtml, /<a\s+[^>]*href="\/en"[^>]*aria-current="page"/)
  assert.doesNotMatch(stationsHtml, /<a\s+[^>]*href="\/en"[^>]*dk-nav-active/)

  // Case 3: Active on sub-path (/id/reader/compare matches READER)
  const readerSubHtml = renderToStaticMarkup(
    createElement(SiteHeader, {
      initialPath: '/id/reader/compare',
      initialSearch: '',
      initialLocale: 'id',
    })
  )
  assert.match(
    readerSubHtml,
    /<a\s+[^>]*href="\/id\/reader"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*aria-current="page"[^>]*>READER<\/a>|<a\s+[^>]*href="\/id\/reader"[^>]*aria-current="page"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*>READER<\/a>/
  )
  assert.doesNotMatch(readerSubHtml, /<a\s+[^>]*href="\/id"[^>]*aria-current="page"/)
  assert.doesNotMatch(readerSubHtml, /<a\s+[^>]*href="\/id\/stations"[^>]*aria-current="page"/)

  // Case 4: Active on English Terms page (/en/terms)
  const termsHtml = renderToStaticMarkup(
    createElement(SiteHeader, {
      initialPath: '/en/terms',
      initialSearch: '',
      initialLocale: 'en',
    })
  )
  assert.match(
    termsHtml,
    /<a\s+[^>]*href="\/en\/terms"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*aria-current="page"[^>]*>TERMS<\/a>|<a\s+[^>]*href="\/en\/terms"[^>]*aria-current="page"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*>TERMS<\/a>/
  )
  assert.doesNotMatch(termsHtml, /<a\s+[^>]*href="\/en"[^>]*aria-current="page"/)
})

test('header navigation links preserve active locale prefix across id and en', () => {
  // Indonesian locale
  const idHtml = renderToStaticMarkup(
    createElement(SiteHeader, {
      initialPath: '/id',
      initialSearch: '',
      initialLocale: 'id',
    })
  )

  // BrandLogo carries /id
  assert.match(idHtml, /<a\s+href="\/id"[^>]*class="m-brand-link"/)
  // Nav links carry /id prefix
  assert.match(idHtml, /href="\/id\/stations"/)
  assert.match(idHtml, /href="\/id\/reader"/)
  assert.match(idHtml, /href="\/id\/terms"/)
  assert.match(idHtml, /href="\/id\/research"/)
  assert.match(idHtml, /href="\/id\/schedule"/)
  assert.match(idHtml, /href="\/id#constellation"/)
  assert.match(idHtml, /href="\/id#zine-poster"/)
  // Icon buttons carry /id prefix
  assert.match(idHtml, /<a\s+href="\/id\/stations"[^>]*class="dk-icon-btn"[^>]*>SRC<\/a>/)
  assert.match(idHtml, /<a\s+href="\/id#constellation"[^>]*class="dk-icon-btn"[^>]*>NET<\/a>/)

  // English locale
  const enHtml = renderToStaticMarkup(
    createElement(SiteHeader, {
      initialPath: '/en/stations',
      initialSearch: '',
      initialLocale: 'en',
    })
  )

  // BrandLogo carries /en
  assert.match(enHtml, /<a\s+href="\/en"[^>]*class="m-brand-link"/)
  // Nav links carry /en prefix
  assert.match(enHtml, /href="\/en\/stations"/)
  assert.match(enHtml, /href="\/en\/reader"/)
  assert.match(enHtml, /href="\/en\/terms"/)
  assert.match(enHtml, /href="\/en\/research"/)
  assert.match(enHtml, /href="\/en\/schedule"/)
  assert.match(enHtml, /href="\/en#constellation"/)
  assert.match(enHtml, /href="\/en#zine-poster"/)
  // Icon buttons carry /en prefix
  assert.match(enHtml, /<a\s+href="\/en\/stations"[^>]*class="dk-icon-btn"[^>]*>SRC<\/a>/)
  assert.match(enHtml, /<a\s+href="\/en#constellation"[^>]*class="dk-icon-btn"[^>]*>NET<\/a>/)
})

test('header Join CTA points directly to in-page footer anchor #join-crew without resetting route', () => {
  const headerHtml = renderToStaticMarkup(
    createElement(SiteHeader, {
      initialPath: '/en/reader',
      initialSearch: '',
      initialLocale: 'en',
    })
  )

  // Header CTA links directly to in-page anchor #join-crew
  assert.match(
    headerHtml,
    /<a\s+[^>]*href="#join-crew"[^>]*>[\s\S]*?JOIN THE CREW[\s\S]*?<\/a>/
  )
  assert.match(
    headerHtml,
    /<a\s+[^>]*data-variant="paper"[^>]*href="#join-crew"|<a\s+[^>]*href="#join-crew"[^>]*data-variant="paper"/
  )
  // Must NOT link to /#join-crew or root
  assert.doesNotMatch(headerHtml, /href="\/#join-crew"/)
  assert.doesNotMatch(headerHtml, /href="\/en#join-crew"/)

  // SiteFooter has id="join-crew"
  const footerHtml = renderToStaticMarkup(createElement(SiteFooter, { initialLocale: 'en' }))
  assert.match(footerHtml, /<footer\s+class="dk-footer"\s+id="join-crew">/)
  // Footer CTA is locale-aware
  assert.match(footerHtml, /href="\/en\/stations"/)
})

test('mobile menu trigger and drawer declare valid ARIA accessibility attributes', () => {
  const html = renderToStaticMarkup(
    createElement(SiteHeader, {
      initialPath: '/id',
      initialSearch: '',
      initialLocale: 'id',
    })
  )

  // Toggle button has aria-expanded="false" and aria-controls="dk-mobile-menu"
  assert.match(
    html,
    /<button\s+[^>]*class="[^"]*dk-mobile-menu-toggle[^"]*"[^>]*aria-expanded="false"[^>]*aria-controls="dk-mobile-menu"/
  )
  assert.match(html, /aria-label="Buka navigasi"/)

  // Drawer has id="dk-mobile-menu", role="dialog", aria-modal="true"
  assert.match(
    html,
    /<div\s+[^>]*id="dk-mobile-menu"[^>]*role="dialog"[^>]*aria-modal="true"/
  )
  assert.match(html, /aria-label="Navigasi seluler"/)
  // Drawer is hidden by default
  assert.match(html, /<div\s+[^>]*id="dk-mobile-menu"[^>]*hidden=""/)

  // Drawer contains responsive mobile navigation items
  assert.match(html, /<nav\s+class="dk-mobile-nav"/)
})

test('route normalization and active route computation logic covers subroutes and fragments', () => {
  assert.equal(normalizePath('/'), '/')
  assert.equal(normalizePath('/id'), '/')
  assert.equal(normalizePath('/en'), '/')
  assert.equal(normalizePath('/id/'), '/')
  assert.equal(normalizePath('/en/stations'), '/stations')
  assert.equal(normalizePath('/id/reader/compare'), '/reader/compare')
  assert.equal(normalizePath('/terms/'), '/terms')

  // isRouteActive tests
  assert.equal(isRouteActive('/', '/'), true)
  assert.equal(isRouteActive('/id', '/'), true)
  assert.equal(isRouteActive('/en', '/'), true)
  assert.equal(isRouteActive('/id', '/stations'), false)
  assert.equal(isRouteActive('/en/stations', '/stations'), true)
  assert.equal(isRouteActive('/en/stations/station-123', '/stations'), true)
  assert.equal(isRouteActive('/id/reader/compare', '/reader'), true)
  assert.equal(isRouteActive('/id/reader/compare', '/stations'), false)
  assert.equal(isRouteActive('/id', '/#constellation'), false)
  assert.equal(isRouteActive('/en', '/#zine-poster'), false)

  // getLocalizedNavHref tests
  assert.equal(getLocalizedNavHref('/', 'id'), '/id')
  assert.equal(getLocalizedNavHref('/', 'en'), '/en')
  assert.equal(getLocalizedNavHref('/stations', 'id'), '/id/stations')
  assert.equal(getLocalizedNavHref('/stations', 'en'), '/en/stations')
  assert.equal(getLocalizedNavHref('/#constellation', 'id'), '/id#constellation')
  assert.equal(getLocalizedNavHref('/#zine-poster', 'en'), '/en#zine-poster')

  // All 15 nav links declared
  assert.equal(NAV_LINKS.length, 15)
})
