/* global document */
import { expect, test } from '@playwright/test'

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]

const SURFACES = [
  { key: 'reader', path: '/reader', form: '.dk-reader-form', field: 'citation', value: 'M19-03-SYNTHETIC-CITATION' },
  { key: 'terms', path: '/terms', form: '.dk-terms-filter-form', field: 'q', value: 'M19-03-SYNTHETIC-TERM' },
  { key: 'stations', path: '/stations', form: 'form.m-row[role="search"]', field: 'q', value: 'M19-03-SYNTHETIC-STATION' },
  { key: 'missions', path: '/missions', form: '.dk-actors-filter-form', field: 'q', value: 'M19-03-SYNTHETIC-MISSION' },
]

for (const locale of ['id', 'en']) {
  for (const viewport of VIEWPORTS) {
    for (const surface of SURFACES) {
      test(`${surface.key} search submits locale-preserving GET at ${viewport.width}px · ${locale}`, async ({ page }) => {
        await page.setViewportSize(viewport)
        await page.goto(`/${locale}${surface.path}`, { waitUntil: 'domcontentloaded' })
        await expect(page.locator('html')).toHaveAttribute('lang', locale)

        const form = page.locator(surface.form)
        await expect(form).toBeVisible()
        await expect(form).toHaveAttribute('method', 'get')
        await expect(form).toHaveAttribute('role', 'search')
        const action = await form.getAttribute('action')
        expect(action).toMatch(new RegExp(`^/${locale}${surface.path.replaceAll('/', '\\/')}$`))

        await expect(page.locator('header form[role="search"], header input[type="search"]')).toHaveCount(0)
        const geometry = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        }))
        expect(geometry.scrollWidth - geometry.width).toBeLessThanOrEqual(1)

        const queryInput = form.locator(`[name="${surface.field}"]`)
        await expect(queryInput).toBeVisible()
        await queryInput.fill(surface.value)
        await form.locator('button[type="submit"]').click()

        await expect(page).toHaveURL((url) => {
          return url.pathname === `/${locale}${surface.path}`
            && url.searchParams.get(surface.field) === surface.value
        })
        await expect(form.locator(`[name="${surface.field}"]`)).toHaveValue(surface.value)
        await expect(page.locator('main [role="alert"]').first()).toBeVisible()
        const alertTexts = await page.locator('main [role="alert"]').allTextContents()
        expect(alertTexts.length).toBeGreaterThan(0)
        expect(alertTexts.every((text) => text.trim().length > 0)).toBe(true)

        const settledGeometry = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        }))
        expect(settledGeometry.scrollWidth - settledGeometry.width).toBeLessThanOrEqual(1)
      })
    }
  }
}
