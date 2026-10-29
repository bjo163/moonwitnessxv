/* global document, getComputedStyle */
import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { BASE_URL, expectsOfflineBranch, hubRun } from './global-setup.mjs'
import { SCREENS_DIR } from './paths.mjs'

const modes = [
  { name: 'reader', route: '/reader', maxWidth: '72rem', measure: '68ch', density: 'comfortable', bodySize: '17px', headingSize: '28px' },
  { name: 'research', route: '/terms', maxWidth: '88rem', measure: '84ch', density: 'compact', bodySize: '14px', headingSize: '22px' },
  { name: 'story', route: '/studio', maxWidth: '66rem', measure: '62ch', density: 'airy', bodySize: '18px', headingSize: '56px' },
]

test.describe('M19-06 existing Dock experience modes', () => {
  for (const mode of modes) for (const locale of ['en', 'id']) {
    test(`${mode.name}/${locale}: existing route, applied tokens, behavior and screenshots`, async ({ page }) => {
      fs.mkdirSync(SCREENS_DIR, { recursive: true })
      await page.setViewportSize({ width: 1440, height: 900 })
      const route = `/${locale}${mode.route}`
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' })
      expect(response?.status()).toBe(200)

      const main = page.locator('main.dk-main')
      await expect(main).toHaveAttribute('data-experience', mode.name)
      await expect(page.locator('nav.dk-nav')).toHaveCount(1)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(main.locator('h1')).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      const styles = await main.evaluate((element) => {
        const style = getComputedStyle(element)
        const title = element.querySelector('h1')
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
        const expectedLineHeight = `${parseFloat(style.fontSize) * parseFloat(style.getPropertyValue('--experience-line-height'))}px`
        return {
          maxWidth: style.getPropertyValue('--experience-max-width').trim(),
          measure: style.getPropertyValue('--experience-measure').trim(),
          density: style.getPropertyValue('--experience-density').trim(),
          bodySize: style.getPropertyValue('--experience-body-size').trim(),
          lineHeight: style.getPropertyValue('--experience-line-height').trim(),
          appliedMaxWidth: style.maxWidth,
          appliedBodySize: style.fontSize,
          appliedLineHeight: style.lineHeight,
          appliedHeadingSize: title ? getComputedStyle(title).fontSize : null,
          expectedMaxWidth: `${parseFloat(style.getPropertyValue('--experience-max-width')) * rootFontSize}px`,
          expectedLineHeight,
        }
      })
      expect(styles).toMatchObject({
        maxWidth: mode.maxWidth,
        measure: mode.measure,
        density: mode.density,
        bodySize: mode.bodySize,
        appliedBodySize: mode.bodySize,
        appliedHeadingSize: mode.headingSize,
      })
      expect(styles.appliedMaxWidth).toBe(styles.expectedMaxWidth)
      expect(styles.appliedLineHeight).toBe(styles.expectedLineHeight)
      await expect(page.locator('a[aria-current="page"]:visible').first()).toHaveAttribute('href', route)

      if (mode.name === 'reader' || mode.name === 'research') {
        const search = page.getByRole('search').first()
        await expect(search).toBeVisible()
        await expect(search).toHaveAttribute('method', 'get')
        await expect(search).toHaveAttribute('action', route)
        await search.locator('input').first().focus()
        await expect(search.locator('input').first()).toBeFocused()
      }
      if (mode.name === 'story') await expect(page.getByRole('tab').first()).toBeVisible()

      const desktopGeometry = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      }))
      expect(desktopGeometry.scroll).toBeLessThanOrEqual(desktopGeometry.client + 1)
      const offline = expectsOfflineBranch(hubRun().mode)
      if (offline && mode.name !== 'story') await expect(page.locator('[role="alert"]').first()).toBeVisible()
      await page.screenshot({ path: path.join(SCREENS_DIR, `m19-06-${mode.name}-${locale}-1440.png`), fullPage: true })

      if (mode.name === 'story') {
        const nextTab = page.getByRole('tab').nth(1)
        await nextTab.click()
        await expect(nextTab).toHaveAttribute('aria-selected', 'true')
      }

      await page.setViewportSize({ width: 390, height: 844 })
      await page.reload({ waitUntil: 'domcontentloaded' })
      const mobileGeometry = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      }))
      expect(mobileGeometry.scroll).toBeLessThanOrEqual(mobileGeometry.client + 1)
      await page.screenshot({ path: path.join(SCREENS_DIR, `m19-06-${mode.name}-${locale}-390.png`), fullPage: true })
    })
  }
})
