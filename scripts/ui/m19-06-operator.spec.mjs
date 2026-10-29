/* global getComputedStyle */
import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const screensDir = process.env.UI_SCREENS_DIR
  ? path.resolve(process.env.UI_SCREENS_DIR)
  : path.resolve('docs/audit/screens')

test('operator: existing Cockpit UI consumes tokens and preserves keyboard controls', async ({ page }) => {
  fs.mkdirSync(screensDir, { recursive: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const root = page.locator('#root')
  await expect(root).toHaveAttribute('data-experience', 'operator')
  const values = await root.evaluate((element) => {
    const rootStyle = getComputedStyle(element)
    const shell = element.querySelector('.cockpit-shell')
    const shellStyle = shell ? getComputedStyle(shell) : null
    return {
      measure: rootStyle.getPropertyValue('--experience-measure').trim(),
      maxWidth: rootStyle.getPropertyValue('--experience-max-width').trim(),
      density: rootStyle.getPropertyValue('--experience-density').trim(),
      bodySize: rootStyle.getPropertyValue('--experience-body-size').trim(),
      lineHeight: shellStyle?.lineHeight,
      appliedBodySize: shellStyle?.fontSize,
    }
  })
  expect(values).toMatchObject({
    measure: 'none',
    maxWidth: '100%',
    density: 'dense',
    bodySize: '12px',
    lineHeight: '15.6px',
    appliedBodySize: '12px',
  })
  await expect(page.getByRole('tab').first()).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus-visible')).toHaveCount(1)
  await page.screenshot({ path: path.join(screensDir, 'm19-06-operator-offline-1440.png'), fullPage: true })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('#root')).toHaveAttribute('data-experience', 'operator')
  await page.screenshot({ path: path.join(screensDir, 'm19-06-operator-offline-390.png'), fullPage: true })
})
