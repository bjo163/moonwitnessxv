/**
 * M31-05 — LIGHTHOUSE gateway links, permission boundary and offline fallback.
 *
 * This is a static audit at an exact repository SHA. It reads the real Dock source,
 * the accepted M31-02 journey design and the shared locale authority; it starts no
 * server, follows no redirect, fetches no Hub URL and exercises no real permission
 * system. Every detector is also fed synthetic violations so a passing run proves
 * the checks are capable of failing.
 *
 * Design: docs/design/M31-02-gateway-journeys.md (21 rows, 14 AVAILABLE / 7 PLANNED).
 * Decision: docs/decisions/ADR-0011-lighthouse-dock-runtime.md (Dock is the runtime;
 * the gateway may remove surfaces but never widen).
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { NextRequest } from 'next/server.js'
import { middleware } from '../src/middleware.ts'
import { landingCopy } from '../src/lib/landing-copy.ts'
import { localizedDockHref } from '../src/lib/locale-context.mjs'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.resolve(testDir, '..')
const repoDir = path.resolve(appDir, '..', '..')

function read(...segments) {
  return fs.readFileSync(path.join(...segments), 'utf8')
}

const shellSource = read(appDir, 'src', 'ui', 'components', 'shell.tsx')
const sitemapSource = read(appDir, 'src', 'app', 'sitemap.ts')
const homeSource = read(appDir, 'src', 'app', 'page.tsx')
const middlewareSource = read(appDir, 'src', 'middleware.ts')
const manifestSource = read(appDir, 'src', 'app', 'manifest.ts')
const localeSwitcherSource = read(appDir, 'src', 'ui', 'components', 'locale-switcher.tsx')
const researchPageSource = read(appDir, 'src', 'app', 'research', 'page.tsx')
const coreLocaleSource = read(repoDir, 'packages', 'core', 'src', 'locale.ts')
const designSource = read(repoDir, 'docs', 'design', 'M31-02-gateway-journeys.md')

const APP_ROUTE_DIR = path.join(appDir, 'src', 'app')
const SRC_DIR = path.join(appDir, 'src')

function walkFiles(dir) {
  const out = []
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else out.push(full)
    }
  }
  walk(dir)
  return out
}

/** Every real `page.tsx` route under src/app, e.g. `/`, `/terms/[stableId]`. */
function discoverPageRoutes() {
  const routes = []
  for (const file of walkFiles(APP_ROUTE_DIR)) {
    if (path.basename(file) !== 'page.tsx') continue
    const segments = path.relative(APP_ROUTE_DIR, path.dirname(file)).split(path.sep).filter(Boolean)
    routes.push(segments.length === 0 ? '/' : `/${segments.join('/')}`)
  }
  return routes.sort()
}

const pageRoutes = discoverPageRoutes()

function parseNavHrefs(source) {
  const start = source.indexOf('export const NAV_LINKS')
  const end = source.indexOf('as const', start)
  const block = source.slice(start, end === -1 ? source.length : end)
  return [...block.matchAll(/\{ href: '([^']+)'/g)].map((match) => match[1])
}

function parseSitemapRoutes(source) {
  const start = source.indexOf('DOCK_SITEMAP_ROUTES')
  const open = source.indexOf('[', start)
  const close = source.indexOf('] as const', open)
  const block = source.slice(open, close === -1 ? source.length : close)
  return [...block.matchAll(/'([^']*)'/g)].map((match) => match[1])
}

/** Parses the M31-02 journey matrix rows: id, state cell (without decoration), evidence. */
function parseJourneyRows(source) {
  const rows = []
  for (const line of source.split(/\r?\n/)) {
    if (!line.startsWith('| J')) continue
    const cells = line.split('|').map((cell) => cell.trim())
    if (cells.length < 8 || !/^J\d+$/.test(cells[1])) continue
    const state = cells[5].replace(/\*/g, '').trim()
    rows.push({ id: cells[1], state, evidence: cells[6] })
  }
  return rows
}

const journeys = parseJourneyRows(designSource)
const navHrefs = parseNavHrefs(shellSource)
const indexStart = shellSource.indexOf('export const INDEX_GROUPS')
const indexEnd = shellSource.indexOf('] as const', indexStart)
const indexHrefs = [...shellSource.slice(indexStart, indexEnd).matchAll(/\{ href: '([^']+)'/g)].map((match) => match[1])
const sitemapRoutes = parseSitemapRoutes(sitemapSource)

/**
 * Routes each AVAILABLE journey renders today. Chrome-only journeys (header, drawer,
 * spaces, footer, offline branch) are anchored on `/`; the navigation test below
 * additionally proves that every one of the 13 route links resolves to a page.
 * J19/J21 are route-independent framework behaviours whose files are asserted too.
 */
const JOURNEY_ROUTES = {
  J1: ['/'],
  J2: ['/'],
  J4: ['/'],
  J5: ['/'],
  J7: ['/'],
  J8: ['/reader'],
  J9: [
    '/terms',
    '/terms/[stableId]',
    '/figures',
    '/figures/[figureCode]',
    '/constellation',
    '/constellation/relations/[relationCode]',
  ],
  J10: ['/research'],
  J12: ['/reader/compare'],
  J13: ['/stations', '/terms', '/missions', '/reader'],
  J15: ['/'],
  J18: ['/'],
  J19: ['/'],
  J21: ['/'],
}

const JOURNEY_FRAMEWORK_FILES = {
  J19: ['src/app/loading.tsx', 'src/app/error.tsx', 'src/app/not-found.tsx', 'src/ui/components/states.tsx'],
  J21: ['src/app/not-found.tsx', 'src/middleware.ts'],
}

/**
 * Each PLANNED journey would need one of these routes to become navigable. The
 * design names no route; these are the obvious paths its described surface would
 * occupy, so a future route file cannot quietly turn PLANNED into AVAILABLE.
 * J20 is PLANNED because Dock deliberately ships no service worker.
 */
const PLANNED_SURFACE_ROUTES = {
  J3: ['/lighthouse', '/a-l-l-a-h'],
  J6: ['/lighthouse', '/gateway'],
  J11: ['/research/cases', '/research/witnesses', '/research/hypotheses', '/research/explorer'],
  J14: ['/search'],
  J16: ['/account', '/login', '/signin', '/signup', '/register', '/newsletter', '/subscribe', '/community', '/join'],
  J17: ['/harbor'],
  J20: [],
}

const offlineStart = homeSource.indexOf('function OfflineLanding')
const offlineEnd = homeSource.indexOf('export default async function HomePage')
const offlineBlock = offlineStart > -1 && offlineEnd > offlineStart ? homeSource.slice(offlineStart, offlineEnd) : ''

/* ------------------------------------------------------------------ */
/* Detectors (pure, so they can be self-tested with synthetic inputs)  */
/* ------------------------------------------------------------------ */

const PRIVATE_SURFACE = /\b(headquarters|cockpit|arsy|skylink|echolog)\b|\/admin\b/i

function privateSurfaceHits(values) {
  return values.filter((value) => PRIVATE_SURFACE.test(value))
}

const ABSOLUTE_HREF = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i

function absoluteHrefHits(values) {
  return values.filter((value) => ABSOLUTE_HREF.test(value))
}

/** A PLANNED path is violated by an exact route or by any child route beneath it. */
function plannedRouteViolations(plannedRoutes, routes) {
  return plannedRoutes.filter((planned) =>
    routes.some((route) => route === planned || route.startsWith(`${planned}/`)),
  )
}

function routePathOf(href) {
  const [withoutHash] = href.split('#')
  const [pathname] = withoutHash.split('?')
  return pathname === '' ? '/' : pathname
}

function gatewayLocaleOf(href) {
  const match = /^\/(id|en)(?=\/|$|#|\?)/.exec(href)
  return match ? match[1] : null
}

function liveClaimHits(values) {
  const badge = /(?:^|[^A-Za-z])LIVE(?:[^A-Za-z]|$)/
  const deployment = /\b(deployed|deployment|production|now live|is live|in production)\b/i
  return values.filter((value) => badge.test(value) || deployment.test(value))
}

const SERVICE_WORKER_FILE = /(?:^|[-_.])(sw|service-worker|serviceworker)(?:[-_.]|$)/i

function isServiceWorkerFile(name) {
  return SERVICE_WORKER_FILE.test(name)
}

function codeOnly(source) {
  return source
    .split(/\r?\n/)
    .filter((line) => !/^\s*(?:\/\/|\/\*|\*)/.test(line))
    .join('\n')
}

function literalHrefs(source) {
  return [...codeOnly(source).matchAll(/\bhref="([^"]*)"/g)].map((match) => match[1])
}

const sourceFiles = walkFiles(SRC_DIR).filter((file) => /\.(?:ts|tsx|mjs)$/.test(file))
const privateReferences = []
for (const file of sourceFiles) {
  const rel = path.relative(appDir, file).split(path.sep).join('/')
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((line, index) => {
    if (PRIVATE_SURFACE.test(line)) privateReferences.push(`${rel}:${index + 1}`)
  })
}

/* ------------------------------------------------------------------ */
/* Design facts                                                        */
/* ------------------------------------------------------------------ */

test('M31-02 fixes 21 journeys: 14 AVAILABLE and 7 PLANNED', () => {
  assert.equal(journeys.length, 21, 'the M31-02 journey matrix must still enumerate every row')
  for (const row of journeys) {
    assert.ok(row.evidence.length > 0, `${row.id} must keep file:line evidence`)
    assert.notEqual(row.state, '', `${row.id} must carry a state`)
  }

  const available = journeys.filter((row) => row.state.startsWith('AVAILABLE')).map((row) => row.id)
  const planned = journeys.filter((row) => row.state.startsWith('PLANNED')).map((row) => row.id)

  assert.equal(available.length, 14, 'M31-02 fixes 14 AVAILABLE journeys')
  assert.equal(planned.length, 7, 'M31-02 fixes 7 PLANNED journeys')
  assert.deepEqual(available, ['J1', 'J2', 'J4', 'J5', 'J7', 'J8', 'J9', 'J10', 'J12', 'J13', 'J15', 'J18', 'J19', 'J21'])
  assert.deepEqual(planned, ['J3', 'J6', 'J11', 'J14', 'J16', 'J17', 'J20'])
})

test('every AVAILABLE journey maps to a real Dock page route', () => {
  assert.equal(pageRoutes.length, 20, 'M31-02 inventories 20 page.tsx routes at the pinned baseline')

  const available = journeys.filter((row) => row.state.startsWith('AVAILABLE')).map((row) => row.id)
  assert.deepEqual(
    Object.keys(JOURNEY_ROUTES).sort(),
    [...available].sort(),
    'every AVAILABLE journey must declare the route it renders, and no PLANNED journey may be mapped',
  )

  for (const [id, routes] of Object.entries(JOURNEY_ROUTES)) {
    assert.ok(routes.length > 0, `${id} must name at least one route`)
    for (const route of routes) {
      assert.ok(
        pageRoutes.includes(route),
        `${id}: ${route} has no apps/dock/src/app${route === '/' ? '' : route}/page.tsx`,
      )
    }
  }

  for (const [id, files] of Object.entries(JOURNEY_FRAMEWORK_FILES)) {
    for (const file of files) {
      assert.ok(fs.existsSync(path.join(appDir, file)), `${id}: missing framework file ${file}`)
    }
  }
})

test('every PLANNED journey has no route file and is absent from nav and sitemap', () => {
  const planned = journeys.filter((row) => row.state.startsWith('PLANNED')).map((row) => row.id)
  assert.deepEqual(
    Object.keys(PLANNED_SURFACE_ROUTES).sort(),
    [...planned].sort(),
    'each PLANNED journey needs an explicit non-navigation boundary',
  )

  const navigable = [...navHrefs, ...sitemapRoutes.map((route) => (route === '' ? '/' : route))]
  for (const [id, forbiddenRoutes] of Object.entries(PLANNED_SURFACE_ROUTES)) {
    assert.deepEqual(
      plannedRouteViolations(forbiddenRoutes, pageRoutes),
      [],
      `${id} is PLANNED but gained a routable page`,
    )
    for (const href of navigable) {
      const pathname = routePathOf(href)
      const leaked = forbiddenRoutes.find((route) => pathname === route || pathname.startsWith(`${route}/`))
      assert.equal(leaked, undefined, `${id} is PLANNED but ${href} navigates to it`)
    }
  }

  // J11: the explorer exists in source but the research page never imports it.
  assert.ok(
    fs.existsSync(path.join(appDir, 'src', 'ui', 'client', 'ResearchExplorer.tsx')),
    'J11 evidence: ResearchExplorer source must still exist to keep the PLANNED claim honest',
  )
  assert.doesNotMatch(researchPageSource, /ResearchExplorer/, 'J11 is PLANNED: /research must not render the explorer')

  // J20: offline catalog browsing is deliberately unimplemented.
  const workerFiles = [...walkFiles(SRC_DIR), ...walkFiles(path.join(appDir, 'public'))]
    .filter((file) => isServiceWorkerFile(path.basename(file)))
    .map((file) => path.relative(appDir, file).split(path.sep).join('/'))
  assert.deepEqual(workerFiles, [], 'J20 is PLANNED: a service worker would make offline catalog browsing real')
  assert.match(manifestSource, /service worker/i, 'J20 evidence: the manifest must state why there is no worker')
  assert.match(manifestSource, /deliberately not one/i, 'J20 evidence: absence of a worker is deliberate')
})

/* ------------------------------------------------------------------ */
/* Navigation and sitemap                                             */
/* ------------------------------------------------------------------ */

test('navigation exposes four primary links and nine Index routes; every route resolves', () => {
  assert.equal(navHrefs.length, 4, 'the header exposes four primary destinations')
  assert.deepEqual(navHrefs, ['/reader', '/terms', '/stations', '/studio'])
  assert.equal(indexHrefs.length, 9, 'Index groups the remaining nine routes')
  const routeHrefs = [...navHrefs, ...indexHrefs]
  assert.equal(new Set(routeHrefs).size, 13, 'all public destinations are represented once')

  assert.deepEqual(absoluteHrefHits(routeHrefs), [], 'navigation may not carry an absolute external URL')
  for (const href of routeHrefs) {
    assert.ok(href.startsWith('/') && !href.startsWith('//'), `${href} must be a same-origin path`)
  }

  const sitemapPaths = sitemapRoutes.map((route) => (route === '' ? '/' : route))
  for (const href of routeHrefs) {
    const pathname = routePathOf(href)
    assert.ok(pageRoutes.includes(pathname), `${href} has no page.tsx`)
    assert.ok(sitemapPaths.includes(pathname), `${href} is navigable but missing from the sitemap`)
  }

  const shellLiteralHrefs = literalHrefs(shellSource)
  assert.deepEqual(absoluteHrefHits(shellLiteralHrefs), [], 'literal header hrefs must stay internal')
  for (const href of shellLiteralHrefs) {
    assert.ok(href.startsWith('/') || href.startsWith('#'), `${href} is neither a path nor an in-page anchor`)
  }
})

test('sitemap lists 15 real public routes and none is a private destination', () => {
  assert.equal(sitemapRoutes.length, 15, 'DOCK_SITEMAP_ROUTES keeps 15 public routes')
  assert.equal(new Set(sitemapRoutes).size, 15, 'no sitemap route may be duplicated')
  assert.deepEqual(privateSurfaceHits(sitemapRoutes), [], 'the sitemap may not advertise a private surface')

  for (const route of sitemapRoutes) {
    assert.ok(route === '' || route.startsWith('/'), `${route} must be a path fragment, not an origin`)
    assert.ok(!route.startsWith('//'), `${route} may not be protocol-relative`)
    const pathname = route === '' ? '/' : route
    assert.ok(pageRoutes.includes(pathname), `sitemap entry ${route} has no page.tsx`)
  }
})

/* ------------------------------------------------------------------ */
/* Permission boundary                                                */
/* ------------------------------------------------------------------ */

test('no navigation, sitemap, journey or Dock source names a private surface', () => {
  const journeyRoutes = Object.values(JOURNEY_ROUTES).flat()
  assert.deepEqual(
    privateSurfaceHits([...navHrefs, ...indexHrefs, ...sitemapRoutes, ...journeyRoutes]),
    [],
    'nav, sitemap and journey links must not expose headquarters, cockpit, ARSY, SKYLINK, ECHOLOG or /admin',
  )
  assert.deepEqual(
    privateReferences,
    [],
    `Dock src references a private surface: ${privateReferences.slice(0, 5).join(', ')}`,
  )
})

test('every internal navigation href is a same-origin path', () => {
  assert.deepEqual(absoluteHrefHits([...navHrefs, ...indexHrefs]), [])
  assert.deepEqual(absoluteHrefHits(sitemapRoutes), [])
  assert.deepEqual(absoluteHrefHits([...Object.values(JOURNEY_ROUTES).flat()]), [])

  const header = codeOnly(shellSource).slice(
    shellSource.indexOf('<header className="dk-header">'),
    shellSource.indexOf('</header>'),
  )
  assert.doesNotMatch(header, /https?:\/\//i, 'the header may not hardcode an external origin')
})

/* ------------------------------------------------------------------ */
/* Locale contract                                                    */
/* ------------------------------------------------------------------ */

test('locale-prefixed gateway links stay inside the id/en contract', () => {
  assert.match(coreLocaleSource, /SUPPORTED_LOCALES = \['id', 'en'\] as const/)

  const switcherLocales = [...localeSwitcherSource.matchAll(/locale: '(id|en)'/g)].map((match) => match[1])
  assert.deepEqual(switcherLocales, ['id', 'en'], 'the switcher offers exactly the two supported locales')

  for (const href of [...navHrefs, ...indexHrefs]) {
    const [pathnamePart, hashPart = ''] = href.split('#')
    const pathname = pathnamePart === '' ? '/' : pathnamePart
    const hash = hashPart ? `#${hashPart}` : ''
    for (const locale of ['id', 'en']) {
      const generated = localizedDockHref(pathname, '', hash, locale)
      assert.equal(gatewayLocaleOf(generated), locale, `${href} under ${locale} produced ${generated}`)
      assert.ok(generated.startsWith(`/${locale}`), `${generated} must start with /${locale}`)
    }
  }

  assert.equal(localizedDockHref('/reader', '', '', 'fr'), '/en/reader', 'an unsupported locale falls back to en')
  assert.equal(localizedDockHref('//outside.example/path', '', '', 'id'), '/id', 'protocol-relative input is discarded')
  assert.equal(gatewayLocaleOf('/fr/reader'), null, 'no third locale prefix is valid')

  assert.match(middlewareSource, /!isLocale\(localeSegment\)/, 'middleware must reject an unsupported locale segment')
  assert.ok(
    middlewareSource.includes("new NextResponse('Not Found', { status: 404 })"),
    'an unsupported locale segment must 404 rather than silently remap',
  )
  assert.ok(sitemapSource.includes('${baseUrl}/id${route}'), 'the sitemap emits Indonesian URLs')
  assert.ok(sitemapSource.includes('${baseUrl}/en${route}'), 'the sitemap emits English URLs')
})

test('the root negotiates id/en and an unsupported locale segment never remaps', () => {
  const request = (pathname, headers = {}) => new NextRequest(`http://localhost:3001${pathname}`, { headers })

  const indonesian = middleware(request('/', { 'accept-language': 'id-ID,en;q=0.8' }))
  assert.equal(indonesian.status, 307)
  assert.equal(indonesian.headers.get('location'), 'http://localhost:3001/id')
  assert.equal(indonesian.headers.get('vary'), 'Accept-Language')

  const english = middleware(request('/', { 'accept-language': 'en-GB,en;q=0.9' }))
  assert.equal(english.status, 307)
  assert.equal(english.headers.get('location'), 'http://localhost:3001/en')

  const localized = middleware(request('/id/reader'))
  assert.equal(localized.headers.get('x-middleware-rewrite'), 'http://localhost:3001/reader')

  for (const pathname of ['/fr', '/fr/reader', '/id-ID/reader']) {
    assert.equal(middleware(request(pathname)).status, 404, `${pathname} must fail closed, not remap`)
  }
})

/* ------------------------------------------------------------------ */
/* Offline fallback                                                   */
/* ------------------------------------------------------------------ */

test('offline landing branch renders localized copy without a live or deployment claim', () => {
  assert.ok(offlineBlock.length > 0, 'the OfflineLanding branch must exist')

  assert.match(offlineBlock, /<Tape tone="accent">\{copy\.heroEyebrow\}<\/Tape>/, 'offline hero keeps the localized label')
  assert.match(offlineBlock, /role="status"/, 'the outage sentence is announced as status')
  assert.match(offlineBlock, /\{copy\.liveDataUnavailable\}/, 'the outage sentence comes from the locale catalog')
  assert.doesNotMatch(offlineBlock, /<LiveDot/, 'an offline page must not show a live indicator')

  assert.match(homeSource, /if \(!payload\.liveDataAvailable\)/, 'the offline branch is gated by the payload flag')
  assert.match(homeSource, /<OfflineLanding copy=\{copy\} \/>/, 'the offline branch renders OfflineLanding')
  assert.match(homeSource, /<SpaceGrid locale=\{locale\} \/>/, 'the four-space entry survives the outage')
  assert.match(homeSource, /const copy = getLandingCopy\(locale\)/, 'copy is resolved for the negotiated locale')
  assert.match(
    homeSource,
    /localeFromMiddlewareHeader\(requestHeaders\.get\(DOCK_LOCALE_HEADER\)\)/,
    'the locale comes from the trusted middleware header',
  )

  assert.equal(
    landingCopy.en.liveDataUnavailable,
    'Live station and schedule data is temporarily unavailable. The mission information remains available.',
  )
  assert.equal(
    landingCopy.id.liveDataUnavailable,
    'Data stasiun dan jadwal sementara tidak tersedia. Informasi misi tetap dapat dibaca.',
  )
  assert.notEqual(
    landingCopy.en.liveDataUnavailable,
    landingCopy.id.liveDataUnavailable,
    'the offline sentence must be localized, not copied between locales',
  )

  assert.deepEqual(
    liveClaimHits([landingCopy.en.liveDataUnavailable, landingCopy.id.liveDataUnavailable, offlineBlock]),
    [],
    'the offline fallback may not claim a live state, deployment or production availability',
  )
})

test('the offline fallback keeps the four spaces but never shows live counts as zero', () => {
  assert.doesNotMatch(offlineBlock, /counts/, 'unavailable counts must not be rendered, not even as zero')
  assert.doesNotMatch(offlineBlock, /payload\./, 'the offline branch reads no live payload fields')
  assert.doesNotMatch(offlineBlock, /\{\s*0\s*\}/, 'no hardcoded zero may stand in for an unavailable count')

  const branchStart = homeSource.indexOf('if (!payload.liveDataAvailable)')
  const branchEnd = homeSource.indexOf('const live =')
  assert.ok(branchStart > -1 && branchEnd > branchStart, 'the offline branch must precede the live rendering path')
  const branch = homeSource.slice(branchStart, branchEnd)
  assert.match(branch, /<OfflineLanding copy=\{copy\} \/>/)
  assert.match(branch, /<SpaceGrid locale=\{locale\} \/>/)
})

/* ------------------------------------------------------------------ */
/* Negative fixtures: prove the detectors can fail                    */
/* ------------------------------------------------------------------ */

test('negative fixtures prove private, external, planned-route and live-claim checks can fail', () => {
  const privateFixtures = [
    '/admin/queues',
    '/id/cockpit',
    'https://headquarters.example/review',
    '/skylink/health',
    '/echolog/attachments',
  ]
  assert.deepEqual(privateSurfaceHits(privateFixtures), privateFixtures)
  assert.deepEqual(privateSurfaceHits(['/reader', '/id/stations', '/research']), [])

  const externalFixtures = ['https://example.com/stations', '//cdn.example.org/x', 'mailto:press@example.com']
  assert.deepEqual(absoluteHrefHits(externalFixtures), externalFixtures)
  assert.deepEqual(absoluteHrefHits(['/stations', '#join-crew', '/id#zine-poster']), [])

  assert.deepEqual(plannedRouteViolations(['/harbor'], [...pageRoutes, '/harbor']), ['/harbor'])
  assert.deepEqual(plannedRouteViolations(['/research/cases'], [...pageRoutes, '/research/cases']), ['/research/cases'])
  assert.deepEqual(plannedRouteViolations(['/harbor'], pageRoutes), [])

  assert.equal(isServiceWorkerFile('sw.js'), true)
  assert.equal(isServiceWorkerFile('service-worker.js'), true)
  assert.equal(isServiceWorkerFile('icon.svg'), false)

  assert.deepEqual(liveClaimHits(['DEPLOYED', 'LIVE STATUS', 'now live in production']), [
    'DEPLOYED',
    'LIVE STATUS',
    'now live in production',
  ])
  assert.deepEqual(liveClaimHits(['Live station data is temporarily unavailable.']), [])

  assert.equal(gatewayLocaleOf('/id/reader'), 'id')
  assert.equal(gatewayLocaleOf('/en'), 'en')
  assert.equal(gatewayLocaleOf('/fr/reader'), null)
  assert.equal(gatewayLocaleOf('/id-ID/reader'), null)
})
