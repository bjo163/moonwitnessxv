/* global document, window, location, requestAnimationFrame, HTMLElement */
// Dock visual harness — todo-ui.md UI-F18.
//
// What this proves: the covered screens render, at four widths, in both locales,
// with zero horizontal document overflow, exactly one landmark set each, an
// honest state branch (offline / empty / error / loading / ready) recorded as
// measured, and one committed PNG screenshot per case.
//
// What this never does: it does not stub, seed or fake hub data to make a
// screenshot look populated. By default the harness starts its own Dock server
// with the hub pointed at a closed port, so every data-backed screen is captured
// on the branch it actually renders today, and that branch name is written into
// geometry.json. Point UI_HUB_URL at a reachable hub to capture the live branch
// instead — the expectation moves with the mode, it is never relaxed silently.
//
// Run: pnpm exec playwright test --config scripts/ui/playwright.config.mjs
// Options: UI_PORT=<free port >= 3101>, UI_HUB_URL=<reachable hub>, UI_SCREENSHOT=viewport.
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { expect, test } from '@playwright/test'

import { BASE_URL, OFFLINE_HUB_URL, UI_PORT, expectsOfflineBranch, hubRun } from './global-setup.mjs'
import {
  DESIGN_BASELINE,
  GEOMETRY_PATH,
  SCREENS_DIR,
  appendRecord,
  mkdirScreens,
  pngName,
  readRecords,
  statusWordVocabulary,
} from './paths.mjs'

/**
 * The hub condition, as measured by global-setup before the first test ran —
 * never inferred from the shape of the URL. `offline-forced` and
 * `hub-unreachable` both render the outage branch; only a `live-hub` probe lets
 * a data-backed screenshot evidence the ready branch. The mode is recorded in
 * geometry.json either way, because a number is only evidence with its condition.
 */
const RUN = hubRun()
const HUB_MODE = RUN.mode
const EXPECTED_HOME_BRANCH = expectsOfflineBranch(HUB_MODE) ? 'offline' : 'ready'

const WIDTHS = [
  { width: 390, height: 844 },  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]
const LOCALES = ['en', 'id']
const VOCAB = statusWordVocabulary()
/** `viewport` keeps the committed evidence small; the default is the whole page. */
const SHOT_MODE = process.env.UI_SCREENSHOT === 'viewport' ? 'viewport' : 'fullPage'

/** Screens with a route and an owner today. `/` is addressed as /{locale}: locale is middleware-driven, not a route segment. */
const SCREENS = [
  { key: 'home', title: 'Lighthouse / Dock home (UI-P01)', route: (locale) => `/${locale}` },
  { key: 'reader', title: 'Corpus Reader (UI-P05)', route: (locale) => `/${locale}/reader` },
  { key: 'terms', title: 'UNILEX terms index (UI-P06)', route: (locale) => `/${locale}/terms` },
  { key: 'constellation', title: 'Constellation ontology (UI-P06)', route: (locale) => `/${locale}/constellation` },
]

/**
 * Runs inside the page. Must stay self-contained: page.evaluate serializes this
 * function, so it closes over nothing from this module.
 */
async function measureInPage() {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready
    } catch {
      // font readiness polishes the screenshot; never a failure on its own
    }
  }
  await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))

  const docEl = document.documentElement
  const clientWidth = docEl.clientWidth
  const scrollWidth = Math.max(docEl.scrollWidth, document.body ? document.body.scrollWidth : 0)
  const label = (el) => {
    const tag = el.tagName.toLowerCase()
    const id = el.id ? `#${el.id}` : ''
    const cls = typeof el.className === 'string' && el.className.trim()
      ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
      : ''
    return `${tag}${id}${cls}`
  }

  const outside = []
  const interactiveOutside = []
  for (const el of document.querySelectorAll('body *')) {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) continue
    const style = window.getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden') continue
    if (rect.right > clientWidth + 1 || rect.left < -1) {
      const entry = { selector: label(el), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) }
      outside.push(entry)
      if (el.matches('a[href], button, input, select, textarea, [role="button"], [role="dialog"]')) {
        interactiveOutside.push(entry)
      }
    }
  }

  const grid = document.querySelector('.dk-space-grid')
  const gridStyle = grid ? window.getComputedStyle(grid) : null
  const columns = gridStyle && gridStyle.gridTemplateColumns !== 'none'
    ? gridStyle.gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length
    : null

  const cardTapes = [...document.querySelectorAll('.dk-space-card .m-tape')].map((el) => el.textContent.trim())
  const h1 = [...document.querySelectorAll('h1')]
  const alertTexts = [...document.querySelectorAll('.m-alert')].map((el) => el.textContent.trim().slice(0, 240)).slice(0, 3)

  const stateBranch = (() => {
    if (document.querySelector('#offline-home-title')) return 'offline'
    // The route-level error boundary (app/error.tsx) is a Panel + Alert with no
    // page heading; naming it separately keeps "error" for the data panels.
    if (h1.length === 0 && (document.querySelector('.m-alert') || document.querySelector('div[style*="max-width: 640"]'))) {
      return 'error-boundary'
    }
    if (document.querySelector('[role="alert"]')) return 'error'
    if (document.querySelector('.m-empty')) return 'empty'
    if (document.querySelector('.m-spinner')) return 'loading'
    return 'ready'
  })()

  return {
    url: location.href,
    htmlLang: docEl.getAttribute('lang'),
    documentScrollWidth: scrollWidth,
    viewportClientWidth: clientWidth,
    horizontalOverflowPx: Math.max(0, scrollWidth - clientWidth),
    documentHeight: Math.max(docEl.scrollHeight, document.body ? document.body.scrollHeight : 0),
    htmlOverflowX: window.getComputedStyle(docEl).overflowX,
    bodyOverflowX: document.body ? window.getComputedStyle(document.body).overflowX : null,
    elementsOutsideViewport: outside.length,
    interactiveElementsOutsideViewport: interactiveOutside.length,
    outsideSamples: outside.slice(0, 8),
    interactiveOutsideSamples: interactiveOutside.slice(0, 8),
    spaceGridColumns: columns,
    spaceGridWidth: grid ? Math.round(grid.getBoundingClientRect().width) : null,
    spaceCardCount: document.querySelectorAll('.dk-space-card').length,
    statusWords: cardTapes,
    stateBranch,
    alertCount: document.querySelectorAll('[role="alert"]').length,
    alertTexts,
    emptyPanelCount: document.querySelectorAll('.m-empty').length,
    spinnerCount: document.querySelectorAll('.m-spinner').length,
    landmarks: {
      h1: h1.length,
      h1Text: h1.length === 1 ? h1[0].textContent.trim().slice(0, 60) : null,
      main: document.querySelectorAll('main').length,
      primaryNav: document.querySelectorAll('nav.dk-nav').length,
      navTotal: document.querySelectorAll('nav').length,
      // A <header> nested in main/section/article/aside/nav is a generic section,
      // not the banner landmark, so the invariant is one *banner*, not one tag.
      banner: [...document.querySelectorAll('header')].filter(
        (el) => !el.closest('main, article, aside, nav, section'),
      ).length,
      headerTotal: document.querySelectorAll('header').length,
      footer: document.querySelectorAll('footer').length,
    },
    activeLinks: [...document.querySelectorAll('a[aria-current="page"]')].map((el) => ({
      text: el.textContent.trim().slice(0, 40),
      href: el.getAttribute('href'),
      visible: el.getBoundingClientRect().width > 0,
    })),
    title: document.title,
  }
}

/**
 * The reduced-motion contract, read from computed styles rather than from the
 * stylesheet: what the browser actually applied is the evidence. Playwright's
 * emulation turns the media query on for real.
 */
async function measureReducedMotionInPage() {
  const LIMIT_MS = 0.05
  const toMs = (value) =>
    String(value || '')
      .split(',')
      .map((part) => {
        const raw = part.trim()
        if (raw.endsWith('ms')) return Number.parseFloat(raw)
        if (raw.endsWith('s')) return Number.parseFloat(raw) * 1000
        return 0
      })
  const name = (el) => `${el.tagName.toLowerCase()}${el.classList && el.classList[0] ? `.${el.classList[0]}` : ''}`

  const violations = []
  const nodes = [...document.querySelectorAll('body *')]
  for (const el of nodes.slice(0, 4000)) {
    const style = window.getComputedStyle(el)
    if (style.display === 'none') continue
    for (const ms of toMs(style.animationDuration)) {
      if (ms > LIMIT_MS) violations.push({ selector: name(el), property: 'animation-duration', value: `${ms}ms` })
    }
    for (const raw of style.animationIterationCount.split(',')) {
      const value = raw.trim()
      if (value === 'infinite' || Number.parseFloat(value) > 1) {
        violations.push({ selector: name(el), property: 'animation-iteration-count', value })
      }
    }
    for (const ms of toMs(style.transitionDuration)) {
      if (ms > LIMIT_MS) violations.push({ selector: name(el), property: 'transition-duration', value: `${ms}ms` })
    }
  }

  const running = document.getAnimations().filter((animation) => animation.playState === 'running')
  const runningLong = running.filter((animation) => {
    const timing = animation.effect && animation.effect.getTiming ? animation.effect.getTiming() : {}
    const duration = Number(timing.activeDuration ?? timing.duration ?? 0)
    return Number.isFinite(duration) && duration > LIMIT_MS
  })

  return {
    matchedReducedMotionQuery: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    elementsScanned: Math.min(nodes.length, 4000),
    violationCount: violations.length,
    violations: violations.slice(0, 10),
    runningAnimations: running.length,
    runningLongerThanLimit: runningLong.length,
    spinnerCount: document.querySelectorAll('.m-spinner').length,
  }
}

async function openPage(browser, { width, height, locale, motion }) {
  const context = await browser.newContext({
    viewport: { width, height },
    locale,
    deviceScaleFactor: 1,
    reducedMotion: motion === 'reduce' ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const logs = { errors: [], warnings: [], failedRequests: [] }
  page.on('console', (message) => {
    if (message.type() === 'error') logs.errors.push(message.text().slice(0, 300))
    if (message.type() === 'warning') logs.warnings.push(message.text().slice(0, 300))
  })
  page.on('pageerror', (error) => logs.errors.push(`pageerror: ${String(error).slice(0, 300)}`))
  page.on('requestfailed', (request) => logs.failedRequests.push(`${request.method()} ${request.url().slice(0, 160)}`))
  return { context, page, logs }
}

async function gotoSettled(page, route) {
  const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load', timeout: 240_000 })
  if (!response) {
    throw new Error(`Navigation to ${BASE_URL}${route} produced no response at all — the server the harness spawned is not answering.`)
  }
  return response
}

/**
 * Next streams the route: `load` can fire while `app/loading.tsx` is still on
 * screen and the real content is on its way. Measuring then would record the
 * shell as if it were the page — so wait for the document to stop changing and
 * for any spinner to resolve, and keep how long that took as evidence.
 */
async function settlePage(page, timeoutMs = 60_000) {
  const started = Date.now()
  let previous = null
  let stable = 0
  let sawLoadingFallback = false
  let snapshot = null
  while (Date.now() - started < timeoutMs) {
    snapshot = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      nodes: document.getElementsByTagName('*').length,
      spinners: document.querySelectorAll('.m-spinner').length,
      routeFallback: Boolean(document.querySelector('.dk-loading, .dk-route-loading')),
    }))
    sawLoadingFallback = sawLoadingFallback || snapshot.routeFallback || snapshot.spinners > 0
    const key = `${snapshot.height}|${snapshot.nodes}|${snapshot.spinners}`
    stable = key === previous ? stable + 1 : 0
    previous = key
    if (stable >= 3 && snapshot.spinners === 0) break
    if (stable >= 12) break
    await page.waitForTimeout(250)
  }
  return {
    settleMs: Date.now() - started,
    stableSamples: stable,
    sawLoadingFallback,
    stillLoading: (snapshot && snapshot.spinners > 0) === true,
  }
}

/** The Next dev overlay is framework chrome pinned to the viewport, not app UI. */
const HIDE_DEV_OVERLAY = 'nextjs-portal{display:none !important}'

async function hideDevOverlay(page) {
  await page.addStyleTag({ content: HIDE_DEV_OVERLAY })
}

function evaluateCase(measured, { locale, expectStatusGrid }) {
  const failures = []
  if (measured.horizontalOverflowPx !== 0) {
    failures.push(
      `horizontal overflow is ${measured.horizontalOverflowPx}px (scrollWidth ${measured.documentScrollWidth} > clientWidth ${measured.viewportClientWidth})`,
    )
  }
  if (measured.interactiveElementsOutsideViewport !== 0) {
    failures.push(
      `${measured.interactiveElementsOutsideViewport} interactive element(s) sit outside the viewport and are clipped: ${JSON.stringify(measured.interactiveOutsideSamples)}`,
    )
  }
  for (const [name, expected] of [['h1', 1], ['main', 1], ['primaryNav', 1], ['banner', 1], ['footer', 1]]) {
    if (measured.landmarks[name] !== expected) {
      failures.push(`${name} count is ${measured.landmarks[name]}, expected exactly ${expected}`)
    }
  }
  if (expectStatusGrid) {
    if (measured.spaceCardCount !== 4) failures.push(`space grid rendered ${measured.spaceCardCount} cards, expected 4`)
    if (measured.spaceGridColumns === null) failures.push('space grid has no computed column count')
    if (measured.stateBranch !== EXPECTED_HOME_BRANCH) {
      failures.push(
        `home rendered the "${measured.stateBranch}" branch; this run uses the ${HUB_MODE} hub at ${OFFLINE_HUB_URL}, so the honest branch is "${EXPECTED_HOME_BRANCH}"`,
      )
    }
    const allowed = VOCAB[locale]
    for (const word of measured.statusWords) {
      if (!allowed.includes(word)) {
        failures.push(`status word "${word}" is not in the ${locale} vocabulary (${allowed.join(', ')})`)
      }
    }
    const demoWord = allowed[2]
    const demoCount = measured.statusWords.filter((word) => word === demoWord).length
    if (demoCount !== 1) failures.push(`expected exactly one "${demoWord}"-labelled space card, found ${demoCount}`)
  }
  return failures
}

async function runCase(testInfo, browser, spec) {
  const { screen, locale, width, height, motion, passLabel } = spec
  const { context, page, logs } = await openPage(browser, { width, height, locale, motion })
  try {
    const response = await gotoSettled(page, screen.route(locale))
    const status = response.status()
    if (status >= 500) {
      throw new Error(`${screen.route(locale)} answered ${status} — a server error, not a state branch.`)
    }

    const settle = await settlePage(page)
    await hideDevOverlay(page)
    const measured = await page.evaluate(measureInPage)
    const motionReport = motion === 'reduce' ? await page.evaluate(measureReducedMotionInPage) : null

    const file = passLabel === 'reduced-motion'
      ? `${screen.key}-${locale}-reduce-${width}.png`
      : pngName(screen.key, locale, width)
    mkdirScreens()
    const shotPath = `${SCREENS_DIR}/${file}`
    await page.screenshot({ path: shotPath, fullPage: SHOT_MODE === 'fullPage' })

    const failures = evaluateCase(measured, { locale, expectStatusGrid: screen.key === 'home' })
    if (measured.stateBranch === 'error-boundary') {
      failures.unshift(
        `the route rendered app/error.tsx instead of the screen (no page heading; first alert: "${String(measured.alertTexts[0] ?? '').slice(0, 160)}")`,
      )
    }
    if (measured.stateBranch === 'loading') {
      failures.push(`still on the loading fallback after ${settle.settleMs}ms — no data state was reached, so nothing below it can be evidenced`)
    }
    if (motionReport) {
      if (!motionReport.matchedReducedMotionQuery) failures.push('prefers-reduced-motion: reduce did not match inside the page')
      if (motionReport.violationCount > 0) {
        failures.push(`${motionReport.violationCount} motion rule(s) above the 0.05ms suppression contract, e.g. ${JSON.stringify(motionReport.violations.slice(0, 3))}`)
      }
      if (motionReport.runningLongerThanLimit > 0) {
        failures.push(`${motionReport.runningLongerThanLimit} running animation(s) longer than 0.05ms`)
      }
    }

    const record = {
      pass: passLabel,
      screen: screen.key,
      screenTitle: screen.title,
      locale,
      width,
      height,
      requestedRoute: screen.route(locale),
      httpStatus: status,
      screenshot: path.relative(process.cwd(), shotPath).replaceAll('\\', '/'),
      screenshotBytes: fs.statSync(shotPath).size,
      screenshotMode: SHOT_MODE,
      hubMode: HUB_MODE,
      ...settle,
      ...measured,
      ...(motionReport ? { motion: motionReport } : {}),
      consoleErrors: logs.errors.slice(0, 5),
      consoleWarningCount: logs.warnings.length,
      failedRequests: logs.failedRequests.slice(0, 5),
      failures,
    }
    // Written immediately: a worker that dies later cannot swallow this evidence.
    appendRecord(passLabel === 'reduced-motion' ? 'motion' : 'geometry', record)

    testInfo.annotations.push({
      type: 'state branch',
      description: `${measured.stateBranch} (${measured.alertCount} alert / ${measured.emptyPanelCount} empty / ${measured.spinnerCount} loading panels)`,
    })
    if (record.elementsOutsideViewport > 0) {
      testInfo.annotations.push({ type: 'clipped content', description: `${record.elementsOutsideViewport} element(s) outside the viewport` })
    }

    expect(failures, `${screen.key} · ${locale} · ${width}px · ${passLabel}`).toEqual([])
  } finally {
    await context.close()
  }
}

test.beforeAll(async () => {
  mkdirScreens()
  // Guard: the harness must fail — never silently pass — when its own server is gone.
  let response
  try {
    response = await fetch(`${BASE_URL}/en`, { redirect: 'manual' })
  } catch (error) {
    throw new Error(`Preflight failed: the Dock server this harness spawned is not reachable on ${BASE_URL} (${error.message}).`)
  }
  if (response.status === 0 || response.status >= 500) {
    throw new Error(`Preflight failed: ${BASE_URL}/en answered ${response.status} instead of rendering.`)
  }
})

test('preflight · the spawned server answers and locale routing is middleware-driven', async ({ request }) => {
  const home = await request.get('/en', { headers: { 'accept-language': 'en-US,en;q=0.9' } })
  expect(home.status(), 'GET /en renders').toBe(200)
  const bare = await request.get('/', { maxRedirects: 0, headers: { 'accept-language': 'id-ID,en;q=0.8' } })
  expect(bare.status(), 'GET / negotiates a locale instead of rendering a route segment').toBe(307)
  expect(new URL(bare.headers()['location'], BASE_URL).pathname).toBe('/id')
  const homeText = await home.text()
  const outageStated = homeText.includes('Live station and schedule data is temporarily unavailable')
  if (expectsOfflineBranch(HUB_MODE)) {
    expect(outageStated, `the hub was measured as "${HUB_MODE}" at ${OFFLINE_HUB_URL}, so home must state the outage`).toBe(true)
  } else {
    // In live mode the same sentence would mean the hub never answered, which
    // invalidates every screenshot below — fail loudly instead of capturing it.
    expect(
      outageStated,
      `home fell back to the outage notice although UI_HUB_URL points at a reachable hub (${OFFLINE_HUB_URL}); the live branch is not being measured`,
    ).toBe(false)
  }
})

test.describe('screens at every breakpoint, both locales', () => {
  for (const screen of SCREENS) {
    for (const locale of LOCALES) {
      for (const { width, height } of WIDTHS) {
        test(`${screen.key} · ${locale} · ${width}x${height}`, async ({ browser }, testInfo) => {
          await runCase(testInfo, browser, { screen, locale, width, height, motion: 'no-preference', passLabel: 'matrix' })
        })
      }
    }
  }
})

test.describe('term detail (UI-P06)', () => {
  // Serial mode is what makes a runtime skip legal: the id only exists once the
  // index has rendered, and it legitimately may not exist at all offline.
  test.describe.configure({ mode: 'serial' })
  let detailRoute = null
  let discoveryBranch = null

  test('discover a stable term id from the index', async ({ browser }) => {
    const { context, page } = await openPage(browser, { width: 1440, height: 900, locale: 'en', motion: 'no-preference' })
    let href = null
    let stateBranch = null
    try {
      await gotoSettled(page, '/en/terms')
      await settlePage(page)
      const measured = await page.evaluate(measureInPage)
      stateBranch = measured.stateBranch
      href = await page.$$eval('a[href]', (anchors) => {
        for (const anchor of anchors) {
          const value = anchor.getAttribute('href') || ''
          if (/^\/(?:en|id)\/terms\/[^/?#]+$/.test(value) || /^\/terms\/[^/?#]+$/.test(value)) return value
        }
        return null
      })
    } finally {
      await context.close()
    }
    if (href) detailRoute = href.startsWith('/terms/') ? `/en${href}` : href
    discoveryBranch = stateBranch
    appendRecord('discovery', { screen: 'term-detail', stateBranch, href, route: detailRoute })
  })

  test('capture at every breakpoint, both locales', async ({ browser }, testInfo) => {
    if (!detailRoute) {
      const reason =
        `/en/terms exposed no term id, so /terms/<stableId> cannot be reached: the index rendered the ` +
        `"${discoveryBranch}" branch with the hub in ${HUB_MODE} mode at ${OFFLINE_HUB_URL}. ` +
        'Recorded as a skip with a reason instead of a green tile; the detail screen needs a running hub (or a seeded fixture) before it can be evidenced.'
      appendRecord('skip', { screen: 'term-detail', locales: LOCALES, widths: WIDTHS.map((w) => w.width), reason, renderedBranch: discoveryBranch })
      testInfo.annotations.push({ type: 'skip-with-reason', description: reason })
      test.skip(true, reason)
      return
    }
    const screen = {
      key: 'term-detail',
      title: 'UNILEX term detail (UI-P06)',
      route: (locale) => detailRoute.replace(/^\/en(?=\/|$)/, `/${locale}`),
    }
    for (const locale of LOCALES) {
      for (const { width, height } of WIDTHS) {
        await runCase(testInfo, browser, { screen, locale, width, height, motion: 'no-preference', passLabel: 'term-detail' })
      }
    }
  })
})

test.describe('reduced-motion pass', () => {
  for (const screen of SCREENS) {
    for (const width of [390, 1440]) {
      const { height } = WIDTHS.find((entry) => entry.width === width)
      test(`${screen.key} · en · ${width} · reduce`, async ({ browser }, testInfo) => {
        await runCase(testInfo, browser, { screen, locale: 'en', width, height, motion: 'reduce', passLabel: 'reduced-motion' })
      })
    }
  }
})

test('keyboard pass · drawer at 390px and primary/index semantics at 1440px', async ({ browser }, testInfo) => {
  const report = { route: '/en', drawerViewport: '390x844', desktopViewport: '1440x900' }

  const { context, page, logs } = await openPage(browser, { width: 390, height: 844, locale: 'en', motion: 'no-preference' })
  try {
    await gotoSettled(page, '/en')
    const settle = await settlePage(page)
    await hideDevOverlay(page)
    report.settleMs = settle.settleMs
    report.stateBranch = (await page.evaluate(measureInPage)).stateBranch

    const trigger = page.locator('.dk-mobile-menu-toggle')
    await expect(trigger, 'the drawer trigger is displayed at 390px').toBeVisible()

    let reached = false
    let hops = 0
    for (; hops < 30 && !reached; hops += 1) {
      await page.keyboard.press('Tab')
      reached = await page.evaluate(
        () => document.activeElement instanceof HTMLElement && document.activeElement.classList.contains('dk-mobile-menu-toggle'),
      )
    }
    report.tabStopsToTrigger = reached ? hops : null
    expect(reached, `Tab must reach the drawer trigger (stopped after ${hops} presses)`).toBe(true)

    // The trigger only answers the keyboard once the client tree is hydrated; a
    // press that lands too early is retried instead of being reported as broken.
    const drawer = page.locator('#dk-mobile-menu')
    let attempts = 0
    let opened = false
    while (attempts < 4 && !opened) {
      attempts += 1
      await page.keyboard.press('Enter')
      opened = await drawer.isVisible().catch(() => false)
      if (!opened) await page.waitForTimeout(1000)
    }
    report.enterActivationAttempts = attempts
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(drawer, `Enter opens the drawer (after ${attempts} attempt(s))`).toBeVisible()
    report.enterOpensDrawer = true
    report.drawerRole = await drawer.getAttribute('role')
    report.drawerAriaModal = await drawer.getAttribute('aria-modal')
    report.focusMovedIntoDrawer = await page.evaluate(() => {
      const menu = document.getElementById('dk-mobile-menu')
      return Boolean(menu && document.activeElement && menu.contains(document.activeElement))
    })

    await page.keyboard.press('Escape')
    await expect(drawer, 'Escape closes the drawer').toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    report.escapeClosesDrawer = true
    report.focusRestoredToTrigger = await page.evaluate(() => document.activeElement === document.querySelector('.dk-mobile-menu-toggle'))

    // The trigger is a real <button>, so Space must activate it too.
    await page.keyboard.press('Space')
    await expect(drawer, 'Space opens the drawer').toBeVisible()
    report.spaceOpensDrawer = true
    report.activeLinkInsideDrawer = await page.evaluate(() => {
      const link = document.querySelector('#dk-mobile-menu a[aria-current="page"]')
      return link ? { text: link.textContent.trim().slice(0, 30), href: link.getAttribute('href') } : null
    })
    mkdirScreens()
    const drawerScreenshot = `${SCREENS_DIR}/drawer-en-390-open.png`
    await page.screenshot({ path: drawerScreenshot, fullPage: false })
    report.drawerScreenshot = path.relative(process.cwd(), drawerScreenshot).replaceAll('\\', '/')
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()

    expect(report.focusMovedIntoDrawer, 'opening the drawer moves focus into it').toBe(true)
    expect(report.focusRestoredToTrigger, 'Escape returns focus to the trigger').toBe(true)
    expect(report.drawerRole, 'the drawer is a dialog').toBe('dialog')
    expect(report.drawerAriaModal, 'the drawer is modal').toBe('true')
    expect(report.spaceOpensDrawer, 'Space activates the drawer trigger').toBe(true)
    expect(report.activeLinkInsideDrawer, 'the home brand owns the home destination; no drawer route is active').toBeNull()

    await gotoSettled(page, '/en/reader')
    await settlePage(page)
    await trigger.click()
    await expect(drawer, 'the drawer opens on the Reader route').toBeVisible()
    report.activeReaderLinkInsideDrawer = await page.evaluate(() => {
      const link = document.querySelector('#dk-mobile-menu a[aria-current="page"]')
      return link ? { text: link.textContent.trim().slice(0, 30), href: link.getAttribute('href') } : null
    })
    expect(report.activeReaderLinkInsideDrawer?.href, 'Reader is the active destination in the drawer').toBe('/en/reader')

    const mobileIndexTrigger = page.locator('#dk-mobile-menu .dk-mobile-nav .dk-nav-index-trigger')
    const mobileIndexPanel = page.locator('#dk-index-mobile')
    const firstMobileIndexLink = mobileIndexPanel.locator('a[href]').first()
    await expect(firstMobileIndexLink, 'collapsed Index routes are hidden from the drawer').toBeHidden()
    await mobileIndexTrigger.focus()
    await page.keyboard.press('Tab')
    const drawerJoin = page.locator('#dk-mobile-menu a[href="#join-crew"]')
    await expect(drawerJoin, 'Tab skips the collapsed Index routes and reaches Join').toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(mobileIndexTrigger, 'Shift+Tab returns to the Index trigger, not hidden links').toBeFocused()

    await page.keyboard.press('Enter')
    await expect(mobileIndexTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(firstMobileIndexLink, 'Enter opens mobile Index routes').toBeVisible()
    await expect(firstMobileIndexLink, 'opening mobile Index moves focus into the group').toBeFocused()
    expect(await firstMobileIndexLink.getAttribute('href')).toBe('/en/figures')
    await page.keyboard.press('Escape')
    await expect(mobileIndexTrigger, 'Escape closes mobile Index').toHaveAttribute('aria-expanded', 'false')
    await expect(mobileIndexTrigger, 'Escape restores focus to the mobile Index trigger').toBeFocused()
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    report.consoleErrors = logs.errors.slice(0, 5)
  } finally {
    await context.close()
  }

  const desktop = await openPage(browser, { width: 1440, height: 900, locale: 'en', motion: 'no-preference' })
  try {
    await gotoSettled(desktop.page, '/en')
    await settlePage(desktop.page)
    await hideDevOverlay(desktop.page)
    report.activeLinkOnDesktopNav = await desktop.page.evaluate(() => {
      const link = document.querySelector('nav.dk-nav a[aria-current="page"]')
      return link
        ? { text: link.textContent.trim(), href: link.getAttribute('href'), visible: link.getBoundingClientRect().width > 0 }
        : null
    })
    report.desktopActiveLinkCount = await desktop.page.locator('nav.dk-nav a[aria-current="page"]').count()
    expect(report.activeLinkOnDesktopNav, 'the brand owns home, so no route link is falsely active').toBeNull()
    expect(report.desktopActiveLinkCount, 'home has no active route link in primary navigation').toBe(0)

    const readLink = desktop.page.locator('nav.dk-nav a.dk-nav-primary-link').first()
    report.desktopReadHref = await readLink.getAttribute('href')
    expect(report.desktopReadHref, 'READ is the first primary destination').toBe('/en/reader')

    const indexTrigger = desktop.page.locator('nav.dk-nav .dk-nav-index-trigger')
    await indexTrigger.focus()
    await desktop.page.keyboard.press('Enter')
    await expect(indexTrigger).toHaveAttribute('aria-expanded', 'true')
    const firstIndexLink = desktop.page.locator('#dk-index-desktop a[href]').first()
    await expect(firstIndexLink, 'opening INDEX exposes grouped routes').toBeVisible()
    await expect(firstIndexLink, 'opening INDEX moves focus to its first route').toBeFocused()
    report.firstIndexHref = await firstIndexLink.getAttribute('href')
    expect(report.firstIndexHref).toBe('/en/figures')
    await desktop.page.keyboard.press('Escape')
    await expect(indexTrigger, 'Escape closes INDEX and restores focus').toHaveAttribute('aria-expanded', 'false')
    await expect(indexTrigger).toBeFocused()

    await gotoSettled(desktop.page, '/en/reader')
    await settlePage(desktop.page)
    report.activeLinkOnReader = await desktop.page.locator('nav.dk-nav a[aria-current="page"]').evaluate((link) => ({
      text: link.textContent.trim(),
      href: link.getAttribute('href'),
      visible: link.getBoundingClientRect().width > 0,
    }))
    expect(report.activeLinkOnReader.href).toBe('/en/reader')
    expect(report.activeLinkOnReader.text).toContain('READ')
    expect(report.activeLinkOnReader.visible).toBe(true)
    expect(await desktop.page.locator('nav.dk-nav a[aria-current="page"]').count()).toBe(1)
  } finally {
    await desktop.context.close()
  }

  appendRecord('keyboard', report)
  testInfo.annotations.push({ type: 'keyboard', description: JSON.stringify(report) })
})

test.afterAll(() => {
  mkdirScreens()
  const records = readRecords()
  const geometry = records.filter((entry) => entry.kind === 'geometry')
  const motion = records.filter((entry) => entry.kind === 'motion')
  const keyboardRecord = records.find((entry) => entry.kind === 'keyboard')
  const byKey = (a, b) =>
    String(a.pass).localeCompare(String(b.pass)) ||
    a.screen.localeCompare(b.screen) ||
    a.locale.localeCompare(b.locale) ||
    a.width - b.width
  const all = [...geometry, ...motion]

  const report = {
    schemaVersion: 1,
    // No timestamp and no date in any field or file name: a later re-run, after the
    // concurrent Dock/HQ edits land, simply overwrites this evidence set.
    baseline: { design: DESIGN_BASELINE, runHead: process.env.UI_RUN_HEAD ?? 'unknown' },
    server: {
      baseUrl: BASE_URL,
      port: UI_PORT,
      hubMode: HUB_MODE,
      hubUrl: OFFLINE_HUB_URL,
      note:
        'The harness spawns and stops its own Dock dev server. Ports 3000/3001 belong to another local project and are never bound, probed or killed. ' +
        (expectsOfflineBranch(HUB_MODE)
          ? `The probe of ${OFFLINE_HUB_URL} measured "${HUB_MODE}", so every data-backed screen below was captured on the hub-offline branch — the live branch is NOT covered by these numbers.`
          : `The probe of ${OFFLINE_HUB_URL} answered, so data-backed screens are measured on their live branch. This run's hub is whatever ${HUB_MODE} reached — not necessarily the deployed one.`),
    },
    breakpoints: WIDTHS.map((w) => w.width),
    locales: LOCALES,
    statusVocabulary: VOCAB,
    screenshotMode: SHOT_MODE,
    totals: {
      matrixRecords: geometry.length,
      reducedMotionRecords: motion.length,
      skips: records.filter((entry) => entry.kind === 'skip').length,
      recordsWithFailures: all.filter((entry) => entry.failures.length > 0).length,
      maxHorizontalOverflowPx: all.reduce((max, entry) => Math.max(max, entry.horizontalOverflowPx), 0),
      maxInteractiveElementsOutsideViewport: all.reduce((max, entry) => Math.max(max, entry.interactiveElementsOutsideViewport), 0),
      maxElementsOutsideViewport: all.reduce((max, entry) => Math.max(max, entry.elementsOutsideViewport), 0),
    },
    results: geometry.sort(byKey),
    reducedMotion: motion.sort(byKey),
    keyboard: keyboardRecord ?? null,
    termDetailDiscovery: records.find((entry) => entry.kind === 'discovery') ?? null,
    skips: records
      .filter((entry) => entry.kind === 'skip')
      .map((entry) => ({
        screen: entry.screen,
        locales: entry.locales,
        widths: entry.widths,
        reason: entry.reason,
        renderedBranch: entry.renderedBranch,
      })),
  }
  fs.writeFileSync(GEOMETRY_PATH, `${JSON.stringify(report, null, 2)}\n`)
})
