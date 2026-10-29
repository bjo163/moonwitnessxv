import { test, expect } from '@playwright/test'
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../out')
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
}
let server
let origin

test.beforeAll(async () => {
  server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    let file = resolve(out, `.${path === '/' ? '/index.html' : path}`)
    if (!file.startsWith(out + sep)) { res.writeHead(403).end(); return }
    if (!extname(file)) file += '.html'
    if (!existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' }).end(readFileSync(resolve(out, '404.html')))
      return
    }
    res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${server.address().port}`
})
test.afterAll(async () => { if (server) await new Promise(resolve => server.close(resolve)) })

// The Story Universe pilot renders the localized home; the information pages keep
// the earlier `emp-*` shell. Both are asserted through the markup each one ships.
const NARROW_WIDTH = 820

for (const width of [390, 1440]) {
  for (const locale of ['id', 'en']) {
    test(`${locale} navigation at ${width}px`, async ({ page }) => {
      const errors = []
      const external = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('request', request => { if (!request.url().startsWith(origin)) external.push(request.url()) })
      await page.setViewportSize({ width, height: 900 })

      const response = await page.goto(`${origin}/${locale}`)
      expect(response.status()).toBe(200)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)

      // The skip link is the first focusable element and must move focus to the
      // main landmark, not merely scroll to it.
      await page.keyboard.press('Tab')
      await expect(page.locator('.su-skip')).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(page.locator('#su-main')).toBeFocused()

      // Primary navigation is inline on wide viewports and behind the menu
      // button below the documented 820px breakpoint.
      const nav = page.locator('#su-primary-nav')
      if (width > NARROW_WIDTH) {
        await expect(nav).toBeVisible()
      } else {
        await expect(nav).toBeHidden()
        const menu = page.locator('.su-mobile-menu-button')
        await expect(menu).toBeVisible()
        await menu.click()
        await expect(nav).toBeVisible()
      }
      expect(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth)).toBe(true)

      for (const section of ['about', 'ecosystem', 'values', 'roadmap', 'sources', 'privacy']) {
        // Each section starts from the home page: the footer info links only exist
        // there, and every iteration must prove its own route.
        await page.goto(`${origin}/${locale}`)
        const link = page.locator(`.su-footer-info a[href="/${locale}/${section}"]`)
        await link.scrollIntoViewIfNeeded()
        await link.click()
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('html')).toHaveAttribute('lang', locale)

        const other = locale === 'id' ? 'en' : 'id'
        await page.locator('.emp-lang').click()
        await expect(page).toHaveURL(`${origin}/${other}/${section}`)
        await expect(page.locator('html')).toHaveAttribute('lang', other)
        await page.locator('.emp-lang').click()
        expect(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth)).toBe(true)
      }

      const missing = await page.goto(`${origin}/fr/privacy`)
      expect(missing.status()).toBe(404)
      await expect(page.locator('a[href="/en"]')).toBeVisible()
      expect(errors).toEqual([])
      expect(external).toEqual([])
    })
  }
}
