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
  DockSiteHeader,
  DockFooter,
  isRouteActive,
  getLocalizedNavHref,
  normalizePath,
  NAV_LINKS,
} = shellMod

test('header navigation assigns aria-current="page" and dk-nav-active only to the active route', () => {
  // The brand owns HOME; the four primary spaces follow in the agreed order.
  const homeHtml = renderToStaticMarkup(
    createElement(DockSiteHeader, {
      initialPath: '/id',
      initialSearch: '',
      initialLocale: 'id',
    })
  )

  assert.match(homeHtml, /<a\s+href="\/id"[^>]*class="m-brand-link"/)
  const desktop = /<nav class="dk-nav"[\s\S]*?<\/nav>/.exec(homeHtml)?.[0] ?? ''
  assert.deepEqual([...desktop.matchAll(/<a\s+([^>]+)>([\s\S]*?)<\/a>/g)].filter((match) => /class="dk-nav-primary-link/.test(match[1])).map((match) => [(/href="([^"]+)"/.exec(match[1]) ?? [])[1], match[2].replace(/<[^>]+>/g, '').trim()]), [
    ['/id/reader', 'BACA · NYATA'],
    ['/id/terms', 'JELAJAHI · NYATA'],
    ['/id/stations', 'SINYAL · NYATA'],
    ['/id/studio', 'CIPTA · DEMO'],
  ])
  assert.doesNotMatch(desktop, />HOME<|>CREW<|>ABOUT</)
  assert.equal((homeHtml.match(/· NYATA/g) ?? []).length, 6, 'all three real destinations are labeled in desktop and drawer')
  assert.equal((homeHtml.match(/· DEMO/g) ?? []).length, 2, 'Create is marked demo in desktop and drawer')

  // Case 2: Active on English Signals page (/en/stations)
  const stationsHtml = renderToStaticMarkup(
    createElement(DockSiteHeader, {
      initialPath: '/en/stations',
      initialSearch: '',
      initialLocale: 'en',
    })
  )

  assert.match(stationsHtml, /<a\s+[^>]*href="\/en\/stations"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*aria-current="page"[^>]*>SIGNAL<span class="dk-nav-status"> · REAL<\/span><\/a>/)
  assert.equal((stationsHtml.match(/· REAL/g) ?? []).length, 6, 'all three real destinations are labeled in both nav surfaces')
  assert.equal((stationsHtml.match(/· DEMO/g) ?? []).length, 2, 'Create is marked demo in both nav surfaces')
  assert.doesNotMatch(stationsHtml, /<a\s+[^>]*href="\/en"[^>]*aria-current="page"/)

  // Case 3: Active on sub-path (/id/reader/compare matches READER)
  const readerSubHtml = renderToStaticMarkup(
    createElement(DockSiteHeader, {
      initialPath: '/id/reader/compare',
      initialSearch: '',
      initialLocale: 'id',
    })
  )
  assert.match(
    readerSubHtml,
    /<a\s+[^>]*href="\/id\/reader"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*aria-current="page"[^>]*>BACA<span class="dk-nav-status"> · NYATA<\/span><\/a>/
  )
  assert.doesNotMatch(readerSubHtml, /<a\s+[^>]*href="\/id"[^>]*aria-current="page"/)
  assert.doesNotMatch(readerSubHtml, /<a\s+[^>]*href="\/id\/stations"[^>]*aria-current="page"/)

  // Terms uses the EXPLORE label and remains locale-aware.
  const termsHtml = renderToStaticMarkup(
    createElement(DockSiteHeader, {
      initialPath: '/en/terms',
      initialSearch: '',
      initialLocale: 'en',
    })
  )
  assert.match(
    termsHtml,
    /<a\s+[^>]*href="\/en\/terms"[^>]*class="[^"]*dk-nav-active[^"]*"[^>]*aria-current="page"[^>]*>EXPLORE<span class="dk-nav-status"> · REAL<\/span><\/a>/
  )
  assert.doesNotMatch(termsHtml, /<a\s+[^>]*href="\/en"[^>]*aria-current="page"/)
})

test('primary and index routes preserve locale prefix; home section links live in the footer', () => {
  // Indonesian locale
  const idHtml = renderToStaticMarkup(
    createElement(DockSiteHeader, {
      initialPath: '/id',
      initialSearch: '',
      initialLocale: 'id',
    })
  )

  // BrandLogo carries /id
  assert.match(idHtml, /<a\s+href="\/id"[^>]*class="m-brand-link"/)
  for (const href of ['/id/reader', '/id/terms', '/id/stations', '/id/studio', '/id/figures', '/id/missions', '/id/constellation', '/id/prisms', '/id/timeline', '/id/patches', '/id/schedule', '/id/denpa', '/id/research']) {
    assert.ok(idHtml.includes(`href="${href}"`), `${href} remains in the localized primary or Index routes`)
  }
  assert.doesNotMatch(idHtml, /class="dk-icon-btn"[^>]*>SRC<|>NET<\/a>/)

  // English locale
  const enHtml = renderToStaticMarkup(
    createElement(DockSiteHeader, {
      initialPath: '/en/stations',
      initialSearch: '',
      initialLocale: 'en',
    })
  )

  // BrandLogo carries /en
  assert.match(enHtml, /<a\s+href="\/en"[^>]*class="m-brand-link"/)
  for (const href of ['/en/reader', '/en/terms', '/en/stations', '/en/studio', '/en/figures', '/en/missions', '/en/constellation', '/en/prisms', '/en/timeline', '/en/patches', '/en/schedule', '/en/denpa', '/en/research']) {
    assert.ok(enHtml.includes(`href="${href}"`), `${href} remains in the localized primary or Index routes`)
  }
  assert.doesNotMatch(enHtml, /class="dk-icon-btn"[^>]*>SRC<|>NET<\/a>/)

  const idFooter = renderToStaticMarkup(createElement(DockFooter, { initialLocale: 'id' }))
  const enFooter = renderToStaticMarkup(createElement(DockFooter, { initialLocale: 'en' }))
  assert.match(idFooter, /href="\/id#constellation"[^>]*>KRU<\/a>/)
  assert.match(idFooter, /href="\/id#zine-poster"[^>]*>TENTANG<\/a>/)
  assert.match(enFooter, /href="\/en#constellation"[^>]*>CREW<\/a>/)
  assert.match(enFooter, /href="\/en#zine-poster"[^>]*>ABOUT<\/a>/)
})

test('header Join CTA points directly to in-page footer anchor #join-crew without resetting route', () => {
  const headerHtml = renderToStaticMarkup(
    createElement(DockSiteHeader, {
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

  // DockFooter has id="join-crew"
  const footerHtml = renderToStaticMarkup(createElement(DockFooter, { initialLocale: 'en' }))
  assert.match(footerHtml, /<footer\s+class="dk-footer"\s+id="join-crew">/)
  // Footer CTA is locale-aware
  assert.match(footerHtml, /href="\/en\/stations"/)
})

test('mobile menu trigger and drawer declare valid ARIA accessibility attributes', () => {
  const html = renderToStaticMarkup(
    createElement(DockSiteHeader, {
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

  // Drawer contains the four primary routes and a collapsed Index disclosure.
  assert.match(html, /<nav\s+class="dk-mobile-nav"/)
  assert.match(html, /aria-expanded="false"[^>]*aria-controls="dk-index-mobile"/)
  assert.match(html, /id="dk-index-mobile"[^>]*hidden=""/)
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

  assert.deepEqual(NAV_LINKS.map((item) => item.href), ['/reader', '/terms', '/stations', '/studio'])
})
