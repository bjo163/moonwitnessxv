/* global document, window */
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const testDir = dirname(fileURLToPath(import.meta.url))
const cockpitRoot = resolve(testDir, '..')
const storageKey = 'mw_cockpit_locale'

let viteServer
let browser
let appUrl

before(async () => {
  viteServer = await createServer({
    configFile: resolve(cockpitRoot, 'vite.config.mjs'),
    logLevel: 'error',
    server: { host: '127.0.0.1', port: 0, strictPort: false, open: false },
  })
  await viteServer.listen()

  const address = viteServer.httpServer?.address()
  assert.ok(address && typeof address === 'object', 'Vite must bind an ephemeral local port')
  appUrl = `http://127.0.0.1:${String(address.port)}`
  browser = await chromium.launch()
})

after(async () => {
  await browser?.close()
  await viteServer?.close()
})

async function openSyntheticPage(initialLocale) {
  const page = await browser.newPage()
  await page.addInitScript(({ key, locale }) => {
    if (window.localStorage.getItem(key) === null) window.localStorage.setItem(key, locale)
  }, { key: storageKey, locale: initialLocale })
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname === '/api/logs/stream') {
      await route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
      return
    }

    const body = pathname === '/api/config'
      ? { port: 0, services: [] }
      : pathname === '/api/status'
        ? { services: [], portStatus: {}, system: { uptime: 1 } }
        : pathname === '/api/channels'
          ? []
          : { ok: true }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
  return page
}

async function focusWithTab(page, locator, maxTabs = 60) {
  for (let index = 0; index < maxTabs; index += 1) {
    if (await locator.evaluate((element) => element === document.activeElement)) return
    await page.keyboard.press('Tab')
  }
  assert.fail('Language control was not reachable with Tab')
}

test('Cockpit locale is visible, keyboard-operable, synchronized to html lang, and persisted', async () => {
  const page = await openSyntheticPage('en')
  const requests = []
  page.on('request', (request) => requests.push(new URL(request.url()).origin))

  try {
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' })
    const selectIndonesian = page.getByRole('button', { name: 'ID', exact: true })
    const selectEnglish = page.getByRole('button', { name: 'EN', exact: true })

    await page.getByText('MOONWITNESS COCKPIT', { exact: true }).waitFor({ state: 'visible' })
    await page.getByText('Terminal & Logs', { exact: true }).waitFor({ state: 'visible' })
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')

    await focusWithTab(page, selectIndonesian)
    assert.equal(await selectIndonesian.evaluate((element) => element === document.activeElement), true)
    const focusStyle = await selectIndonesian.evaluate((element) => {
      const style = window.getComputedStyle(element)
      return { outlineStyle: style.outlineStyle, outlineWidth: Number.parseFloat(style.outlineWidth) }
    })
    assert.notEqual(focusStyle.outlineStyle, 'none', 'keyboard focus must remain visibly indicated')
    assert.ok(focusStyle.outlineWidth > 0, 'keyboard focus outline must have visible width')
    await page.keyboard.press('Enter')

    await page.getByText('KONSOL COCKPIT MOONWITNESS', { exact: true }).waitFor({ state: 'visible' })
    await page.getByText('Terminal & Log', { exact: true }).waitFor({ state: 'visible' })
    assert.equal(await page.locator('html').getAttribute('lang'), 'id')
    assert.equal(await selectIndonesian.getAttribute('aria-pressed'), 'true')
    assert.equal(await page.evaluate((key) => window.localStorage.getItem(key), storageKey), 'id')

    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByText('KONSOL COCKPIT MOONWITNESS', { exact: true }).waitFor({ state: 'visible' })
    assert.equal(await page.locator('html').getAttribute('lang'), 'id')

    await focusWithTab(page, selectEnglish)
    assert.equal(await selectEnglish.evaluate((element) => element === document.activeElement), true)
    await page.keyboard.press('Space')
    await page.getByText('MOONWITNESS COCKPIT', { exact: true }).waitFor({ state: 'visible' })
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')
    assert.equal(await page.evaluate((key) => window.localStorage.getItem(key), storageKey), 'en')

    assert.ok(requests.every((origin) => origin === appUrl), 'the browser must use only the local app and synthetic API stubs')
  } finally {
    await page.close()
  }
})

test('Cockpit rejects an unsupported saved locale and keeps the document English', async () => {
  const page = await openSyntheticPage('fr')
  try {
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' })
    await page.getByText('MOONWITNESS COCKPIT', { exact: true }).waitFor({ state: 'visible' })
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')
    assert.equal(await page.evaluate((key) => window.localStorage.getItem(key), storageKey), 'fr')
  } finally {
    await page.close()
  }
})
