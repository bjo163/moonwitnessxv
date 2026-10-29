/* global document */
import { expect, test } from '@playwright/test'

// Synthetic copy only: this exercises navigation layout without using witness
// material or changing the application's localized catalogues.
const LONG_LABELS = {
  en: 'AN EXCEPTIONALLY LONG ACCESSIBLE NAVIGATION DESTINATION LABEL THAT MUST WRAP WITHOUT CLIPPING OR HIDING ITS CONTROL',
  id: 'LABEL TUJUAN NAVIGASI YANG SANGAT PANJANG DAN TETAP HARUS TERBACA TANPA TERPOTONG ATAU MENUTUPI KONTROL',
}

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]

for (const locale of ['en', 'id']) {
  for (const viewport of VIEWPORTS) {
    test(`long navigation label stays accessible and in bounds · ${locale} · ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto(`/${locale}`)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)

      // Closed drawer links must stay hidden from both the visual and tab order.
      await expect(page.locator('.dk-mobile-drawer')).toBeHidden()
      await expect(page.locator('.dk-mobile-nav a').first()).toBeHidden()

      if (viewport.width <= 1040) {
        const toggle = page.locator('.dk-mobile-menu-toggle')
        await expect(toggle).toBeVisible()
        await expect(toggle).toHaveAccessibleName(locale === 'id' ? 'Buka navigasi' : 'Open navigation')
        const drawerLinkFocus = []
        for (let step = 0; step < 12; step += 1) {
          await page.keyboard.press('Tab')
          drawerLinkFocus.push(await page.evaluate(() => Boolean(
            document.activeElement?.closest('.dk-mobile-nav a'),
          )))
        }
        expect(drawerLinkFocus).not.toContain(true)
        await toggle.click()

        const drawer = page.locator('.dk-mobile-drawer')
        const link = page.locator('.dk-mobile-nav a').first()
        await expect(drawer).toBeVisible()
        await link.evaluate((element, label) => { element.textContent = label }, LONG_LABELS[locale])
        await expect(link).toHaveAccessibleName(LONG_LABELS[locale])
        await expect(link).toHaveAttribute('href', new RegExp(`^/${locale}/`))

        const geometry = await page.evaluate(() => {
          const width = document.documentElement.clientWidth
          const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
          const drawer = document.querySelector('.dk-mobile-drawer').getBoundingClientRect()
          const link = document.querySelector('.dk-mobile-nav a').getBoundingClientRect()
          return {
            overflow: Math.max(0, scrollWidth - width),
            drawerLeft: drawer.left,
            drawerRight: drawer.right,
            linkLeft: link.left,
            linkRight: link.right,
          }
        })
        expect(geometry.overflow).toBeLessThanOrEqual(1)
        expect(geometry.drawerLeft).toBeGreaterThanOrEqual(-1)
        expect(geometry.drawerRight).toBeLessThanOrEqual(viewport.width + 1)
        expect(geometry.linkLeft).toBeGreaterThanOrEqual(-1)
        expect(geometry.linkRight).toBeLessThanOrEqual(viewport.width + 1)

        await page.keyboard.press('Escape')
        await expect(drawer).toBeHidden()
        await expect(toggle).toBeFocused()
      } else {
        const nav = page.locator('.dk-nav')
        const link = nav.locator('a.dk-nav-primary-link').first()
        await expect(nav).toBeVisible()
        await expect(nav).toHaveAttribute('aria-label', /.+/)
        await link.evaluate((element, label) => { element.textContent = label }, LONG_LABELS[locale])
        await expect(link).toHaveAccessibleName(LONG_LABELS[locale])
        await expect(link).toHaveAttribute('href', new RegExp(`^/${locale}/`))

        const geometry = await page.evaluate(() => {
          const width = document.documentElement.clientWidth
          const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
          const nav = document.querySelector('.dk-nav').getBoundingClientRect()
          const outsideLinks = [...document.querySelectorAll('.dk-nav a.dk-nav-primary-link')].filter((element) => {
            const rect = element.getBoundingClientRect()
            return rect.left < -1 || rect.right > width + 1
          }).length
          return {
            overflow: Math.max(0, scrollWidth - width),
            navLeft: nav.left,
            navRight: nav.right,
            outsideLinks,
          }
        })
        expect(geometry.overflow).toBeLessThanOrEqual(1)
        expect(geometry.navLeft).toBeGreaterThanOrEqual(-1)
        expect(geometry.navRight).toBeLessThanOrEqual(viewport.width + 1)
        expect(geometry.outsideLinks).toBe(0)
      }
    })
  }
}
