/* global document */
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const testDir = dirname(fileURLToPath(import.meta.url))
const cockpitRoot = resolve(testDir, '..')
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

async function openSyntheticPage() {
  const page = await browser.newPage()
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

test('M19-04 help dialog contains keyboard focus and restores its opener', async () => {
  const page = await openSyntheticPage()
  try {
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' })
    const opener = page.getByRole('button', { name: '?', exact: true })
    await page.getByText('MOONWITNESS COCKPIT', { exact: true }).waitFor({ state: 'visible' })
    await opener.focus()
    await opener.click()

    const dialog = page.getByRole('dialog', { name: /operator guide/i })
    const first = dialog.locator('button').first()
    const last = dialog.locator('button').last()
    await last.waitFor({ state: 'visible' })
    assert.equal(await first.getAttribute('aria-label'), 'CLOSE [ESC]')
    assert.equal(await first.evaluate((element) => element === document.activeElement), true)

    await page.keyboard.press('Shift+Tab')
    assert.equal(await last.evaluate((element) => element === document.activeElement), true)
    await page.keyboard.press('Tab')
    assert.equal(await first.evaluate((element) => element === document.activeElement), true)

    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'detached' })
    assert.equal(await opener.evaluate((element) => element === document.activeElement), true)
  } finally {
    await page.close()
  }
})
