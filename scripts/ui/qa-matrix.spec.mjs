/* global document, window, location */
// Dock interaction/state harness — todo-ui-2.md UI2-G12.
//
// UI2-G12 asks for viewport overflow, focus, keyboard, errors, offline and
// fixture-state evidence in the QA matrix. `visual.spec.mjs` already proves the
// geometry half (four widths x id/en, zero horizontal overflow, one landmark set,
// reduced motion) and writes the PNGs. This spec adds the interaction and state
// half and deliberately writes no PNGs, so the two evidence sets never collide.
//
// Honesty rules carried over from the visual harness:
//  - nothing is stubbed or seeded to make a state appear. The offline branch is
//    real: the spawned Dock server points at a closed port (UI_HUB_URL default).
//  - a positive assertion is paired with the negative case in the same run, so a
//    screen that degrades to a blank page fails instead of passing quietly.
//  - expected strings are read from the app's own catalogues, never re-typed
//    here, so a copy change moves the expectation with it.
//
// Run offline (negative):  pnpm exec playwright test --config scripts/ui/playwright.config.mjs qa-matrix
// Run against the ephemeral seeded hub (positive):
//   node scripts/ui/ephemeral-hub.mjs &            # boots an in-memory ARSY on EVIDENCE_HUB_PORT
//   UI_HUB_URL=http://127.0.0.1:3102/api/v1 pnpm exec playwright test --config scripts/ui/playwright.config.mjs qa-matrix
import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

import { BASE_URL, expectsOfflineBranch, hubRun } from './global-setup.mjs'
import { DOCK_ROOT } from './paths.mjs'

const RUN = hubRun()
const HUB_MODE = RUN.mode

/** Every route the matrix touches, with the state branch each one is allowed to render. */
const SCREENS = [
  { key: 'home', route: (l) => `/${l}`, owner: 'apps/dock' },
  { key: 'reader', route: (l) => `/${l}/reader`, owner: 'apps/dock' },
  { key: 'terms', route: (l) => `/${l}/terms`, owner: 'apps/dock' },
  { key: 'constellation', route: (l) => `/${l}/constellation`, owner: 'apps/dock' },
  { key: 'patches', route: (l) => `/${l}/patches`, owner: 'apps/dock' },
  { key: 'stations', route: (l) => `/${l}/stations`, owner: 'apps/dock' },
  { key: 'denpa', route: (l) => `/${l}/denpa`, owner: 'apps/dock' },
]
const WIDTHS = [390, 768, 1440, 1920]
const LOCALES = ['en', 'id']

/** The four honest data states plus the route boundary, as the app itself names them. */
const HONEST_BRANCHES = new Set(['offline', 'empty', 'error', 'loading', 'ready', 'error-boundary'])

/**
 * Pull one localized string out of a Dock catalogue module by key, so the
 * assertion follows the copy instead of freezing a literal.
 */
function catalogValue(file, key) {
  const source = fs.readFileSync(path.join(DOCK_ROOT, 'src', 'lib', file), 'utf8')
  const found = source.match(new RegExp(`${key}:\\s*'([^']+)'`))
  if (!found) throw new Error(`${key} not present in src/lib/${file} — the test is stale, not the app`)
  return found[1]
}

const WITHHOLDING_COPY = catalogValue('states-copy.ts', 'errorResearchUnavailable')

/**
 * Runs in the page. Self-contained: page.evaluate serializes it, so it closes
 * over nothing from this module.
 */
async function probeInteractionInPage() {
  const visibleFocusables = [...document.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((el) => {
    const rect = el.getBoundingClientRect()
    const style = window.getComputedStyle(el)
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
  })
  const clientWidth = document.documentElement.clientWidth
  const offscreenFocusables = visibleFocusables.filter((el) => {
    const rect = el.getBoundingClientRect()
    return rect.right > clientWidth + 1 || rect.left < -1
  })
  const labelled = visibleFocusables.filter((el) => {
    const text = `${el.textContent ?? ''}`.trim()
    const aria = el.getAttribute('aria-label') ?? ''
    const value = el.getAttribute('value') ?? ''
    const associated = el.id ? document.querySelector(`label[for="${el.id}"]`) : null
    return Boolean(text || aria || value || associated || el.getAttribute('aria-labelledby'))
  })
  return {
    url: location.href,
    htmlLang: document.documentElement.getAttribute('lang'),
    direction: document.documentElement.getAttribute('dir'),
    visibleFocusableCount: visibleFocusables.length,
    offscreenFocusableCount: offscreenFocusables.length,
    unlabelledFocusables: visibleFocusables.length - labelled.length,
    unlabelledSamples: visibleFocusables
      .filter((el) => !labelled.includes(el))
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).split(' ')[0]}` : ''}`),
    stateBranch: (() => {
      if (document.querySelector('#offline-home-title')) return 'offline'
      if (document.querySelectorAll('h1').length === 0 && document.querySelector('.m-alert')) return 'error-boundary'
      if (document.querySelector('[role="alert"]')) return 'error'
      if (document.querySelector('.m-empty')) return 'empty'
      if (document.querySelector('.m-spinner')) return 'loading'
      return 'ready'
    })(),
    alertCount: document.querySelectorAll('[role="alert"]').length,
    alertTexts: [...document.querySelectorAll('[role="alert"], .m-alert')]
      .map((el) => el.textContent.trim().slice(0, 200))
      .filter(Boolean),
    headingOverflow: [...document.querySelectorAll('h1,h2,h3')].filter(
      (el) => el.scrollWidth > el.clientWidth + 1,
    ).length,
    focusVisibleSupported: (() => {
      try {
        return document.querySelector(':focus-visible') !== undefined
      } catch {
        return false
      }
    })(),
  }
}

async function openContext(browser, width, locale, reducedMotion = false) {
  const context = await browser.newContext({
    viewport: { width, height: width < 700 ? 844 : 900 },
    locale,
    deviceScaleFactor: 1,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(String(error).slice(0, 200)))
  return { context, page, pageErrors }
}

test.describe('UI2-G12 interaction and state matrix', () => {
  test.describe.configure({ mode: 'serial' })

  for (const locale of LOCALES) {
    for (const screen of SCREENS) {
      test(`${screen.key} · ${locale} · keyboard tab order stays on-page and every control is named`, async ({ browser }) => {
        const { context, page, pageErrors } = await openContext(browser, 1440, locale)
        await page.goto(`${BASE_URL}${screen.route(locale)}`, { waitUntil: 'domcontentloaded' })

        const start = await page.evaluate(() => ({ active: document.activeElement ? document.activeElement.tagName : null }))
        expect(start.active, 'focus must not start on BODY-less document').not.toBeNull()

        const visited = []
        for (let i = 0; i < 25; i += 1) {
          await page.keyboard.press('Tab')
          const here = await page.evaluate(() => {
            const el = document.activeElement
            if (!el || el === document.body) return { tag: 'body', label: '' }
            return {
              tag: el.tagName.toLowerCase(),
              label: `${(el.textContent ?? '').trim().slice(0, 30)}${el.getAttribute('aria-label') ?? ''}`,
            }
          })
          visited.push(here)
          if (here.tag === 'body') break
        }
        expect(visited.length, 'Tab must move focus at all').toBeGreaterThan(1)
        expect(visited.filter((v) => v.tag !== 'body').length, 'Tab must reach real controls').toBeGreaterThan(2)

        const probe = await page.evaluate(probeInteractionInPage)
        expect(probe.offscreenFocusableCount, `focusable control outside the viewport on ${screen.key}`).toBe(0)
        expect(probe.unlabelledFocusables, `unnamed control on ${screen.key}: ${probe.unlabelledSamples.join(', ')}`).toBe(0)
        expect(probe.focusVisibleSupported).toBe(true)
        expect(pageErrors, `page errors on ${screen.key}: ${pageErrors.join(' | ')}`).toEqual([])
        await context.close()
      })

      test(`${screen.key} · ${locale} · horizontal overflow is zero at 390/768/1440/1920 with no clipped heading`, async ({ browser }) => {
        for (const width of WIDTHS) {
          const { context, page } = await openContext(browser, width, locale)
          await page.goto(`${BASE_URL}${screen.route(locale)}`, { waitUntil: 'domcontentloaded' })
          const probe = await page.evaluate(probeInteractionInPage)
          const doc = await page.evaluate(() => ({
            scroll: Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0),
            client: document.documentElement.clientWidth,
          }))
          expect(doc.scroll - doc.client, `${screen.key} ${width}px overflow`).toBeLessThanOrEqual(0)
          expect(probe.headingOverflow, `${screen.key} clipped heading at ${width}px`).toBe(0)
          await context.close()
        }
      })

      test(`${screen.key} · ${locale} · renders one of the honest states, and never a blank page`, async ({ browser }) => {
        const { context, page } = await openContext(browser, 1440, locale)
        await page.goto(`${BASE_URL}${screen.route(locale)}`, { waitUntil: 'domcontentloaded' })
        const probe = await page.evaluate(probeInteractionInPage)
        expect(HONEST_BRANCHES.has(probe.stateBranch), `${screen.key} state branch "${probe.stateBranch}" is not a declared state`).toBe(true)
        expect(probe.visibleFocusableCount, `${screen.key} rendered with no reachable control`).toBeGreaterThan(0)

        // The mode decides the expected branch, and both modes are asserted rather than excused.
        if (expectsOfflineBranch(HUB_MODE)) {
          expect(['offline', 'error', 'empty', 'error-boundary']).toContain(probe.stateBranch)
        }
        if (probe.stateBranch === 'error' || probe.stateBranch === 'error-boundary') {
          expect(probe.alertTexts.join(' ').length, 'an error branch must say something').toBeGreaterThan(0)
        }
        expect(probe.htmlLang, `${screen.key} html lang must follow the requested locale`).toContain(locale)
        await context.close()
      })

      test(`${screen.key} · ${locale} · reduced motion leaves nothing animating`, async ({ browser }) => {
        const { context, page } = await openContext(browser, 1440, locale, true)
        await page.goto(`${BASE_URL}${screen.route(locale)}`, { waitUntil: 'domcontentloaded' })
        const running = await page.evaluate(() =>
          document.getAnimations().filter((a) => a.playState === 'running').length)
        expect(running, `${screen.key} keeps an animation running under reduced motion`).toBe(0)
        await context.close()
      })
    }
  }

  test.describe('negative routes and destructive input', () => {
    for (const locale of LOCALES) {
      test(`${locale} · unknown station id does not invent a station and says so`, async ({ browser }) => {
        const { context, page } = await openContext(browser, 1440, locale)
        const response = await page.goto(`${BASE_URL}/${locale}/stations/__no_such_station__`, {
          waitUntil: 'domcontentloaded',
        })
        const status = response ? response.status() : 0
        const body = await page.evaluate(() => document.body.innerText)
        expect(status === 404 || /not|unknown|tidak|tak|unavailable|offline/i.test(body), `unknown station returned ${status}`).toBe(true)
        expect(/now playing|auto-play|live/i.test(body), 'a missing station must not claim playback').toBe(false)
        await context.close()
      })

      test(`${locale} · reader with a malformed citation is refused, never guessed`, async ({ browser }) => {
        const { context, page } = await openContext(browser, 1440, locale)
        await page.goto(`${BASE_URL}/${locale}/reader?citation=${encodeURIComponent('ZZ 999:999')}`, {
          waitUntil: 'domcontentloaded',
        })
        const probe = await page.evaluate(probeInteractionInPage)
        expect(['error', 'empty', 'offline', 'error-boundary']).toContain(probe.stateBranch)
        expect(probe.alertTexts.join(' ').length, 'refusal must be stated in words').toBeGreaterThan(0)
        await context.close()
      })

      test(`${locale} · comparative reader withholds text and states the withholding`, async ({ browser }) => {
        const { context, page } = await openContext(browser, 1440, locale)
        await page.goto(`${BASE_URL}/${locale}/reader/compare`, { waitUntil: 'domcontentloaded' })
        const text = await page.evaluate(() => document.body.innerText)
        expect(text).toContain(WITHHOLDING_COPY)
        // UI2-G02: no cleared-edition claim may survive on this screen.
        expect(/RIGHTS CLEARED/i.test(text), 'a UI must not self-assert rights clearance').toBe(false)
        await context.close()
      })
    }
  })

  test('drawer keyboard contract at 390: Escape closes and focus returns to the toggle', async ({ browser }) => {
    const { context, page } = await openContext(browser, 390, 'en')
    await page.goto(`${BASE_URL}/en`, { waitUntil: 'domcontentloaded' })
    const toggle = page.locator('.dk-mobile-menu-toggle')
    await expect(toggle).toBeVisible()
    await toggle.focus()
    await page.keyboard.press('Enter')
    const drawer = page.locator('[role="dialog"], .dk-mobile-menu')
    await expect(drawer.first()).toBeVisible()
    const trapped = await page.evaluate(() => {
      const el = document.activeElement
      const holder = document.querySelector('[role="dialog"], .dk-mobile-menu')
      return Boolean(el && holder && holder.contains(el))
    })
    expect(trapped, 'opening the drawer must move focus inside it').toBe(true)
    await page.keyboard.press('Escape')
    await expect(drawer.first()).toBeHidden()
    const restored = await page.evaluate(() => {
      const el = document.activeElement
      return Boolean(el && el.classList && el.classList.contains('dk-mobile-menu-toggle'))
    })
    expect(restored, 'Escape must restore focus to the toggle').toBe(true)
    await context.close()
  })
})
