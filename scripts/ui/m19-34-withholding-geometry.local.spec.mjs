/* global document, getComputedStyle */
import { expect, test } from '@playwright/test'

const widths = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]

for (const locale of ['en', 'id']) {
  for (const viewport of widths) {
    test('withheld term 404 geometry · ' + locale + ' · ' + viewport.width, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/' + locale + '/terms/P001')
      const title = locale === 'en' ? 'Frequency Not Found (404)' : 'Frekuensi Tidak Ditemukan (404)'
      await expect(page.locator('h1')).toHaveText(title)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      const geometry = await page.evaluate(() => {
        const width = document.documentElement.clientWidth
        const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
        const outside = []
        for (const el of document.querySelectorAll('body *')) {
          const rect = el.getBoundingClientRect()
          if (rect.width === 0 && rect.height === 0) continue
          const style = getComputedStyle(el)
          if (style.display === 'none' || style.visibility === 'hidden') continue
          if (rect.left < -1 || rect.right > width + 1) {
            outside.push({ left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) })
          }
        }
        return {
          viewportWidth: width,
          documentWidth: scrollWidth,
          horizontalOverflowPx: Math.max(0, scrollWidth - width),
          elementsOutsideViewport: outside.length,
          outsideSamples: outside.slice(0, 3),
          mainCount: document.querySelectorAll('main').length,
          headingCount: document.querySelectorAll('h1').length,
          detailContainers: document.querySelectorAll('.dk-terms-detail,.dk-terms-sources,.dk-terms-reviews').length,
        }
      })
      console.log('WITHHOLDING_GEOMETRY ' + JSON.stringify({ locale, ...viewport, ...geometry }))
      expect(geometry.horizontalOverflowPx).toBeLessThanOrEqual(1)
      expect(geometry.elementsOutsideViewport).toBe(0)
      expect(geometry.mainCount).toBe(1)
      expect(geometry.headingCount).toBe(1)
      expect(geometry.detailContainers).toBe(0)
    })
  }
}
