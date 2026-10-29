import process from 'node:process'
import { expect, test } from '@playwright/test'

// The UNILEX detail endpoint is admin-only until an approved public projection
// exists. A local admin positive control proves the fixture resolves; the Dock
// browser request stays anonymous and must fail closed in both supported locales.
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]

for (const locale of ['en', 'id']) {
  test(`anonymous term detail stays withheld in ${locale}`, async ({ page }) => {
    const hubUrl = process.env.UI_HUB_URL
    const adminPassword = process.env.MOONQL_AUTH_ADMIN_PASSWORD
    if (!hubUrl) throw new Error('UI_HUB_URL is required for the in-memory evidence Hub.')
    const hub = new URL(hubUrl)
    expect(hub.protocol).toBe('http:')
    expect(['127.0.0.1', 'localhost']).toContain(hub.hostname)
    expect(hub.pathname).toBe('/api/v1')
    const serviceResponse = await page.request.get(hub.origin)
    expect(serviceResponse.status()).toBe(200)
    const serviceInfo = await serviceResponse.json()
    expect(serviceInfo.data.name).toBe('M19-34 Evidence Hub')
    expect(adminPassword).toBeTruthy()

    const adminLogin = await page.request.post(`${hubUrl}/auth/login`, {
      data: { login: 'admin', password: adminPassword },
    })
    expect(adminLogin.status()).toBe(200)
    const loginBody = await adminLogin.json()
    expect(loginBody.data.token).toBeTruthy()
    const adminResponse = await page.request.get(`${hubUrl}/unilex/term?stableId=P001`, {
      headers: { authorization: `Bearer ${loginBody.data.token}` },
    })
    expect(adminResponse.status()).toBe(200)

    const apiResponse = await page.request.get(`${hubUrl}/unilex/term?stableId=P001`)
    expect(apiResponse.status()).toBe(401)

    const notFoundTitle = locale === 'en' ? 'Frequency Not Found (404)' : 'Frekuensi Tidak Ditemukan (404)'
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport)
      await page.goto(`/${locale}/terms/P001`)

      await expect(page.locator('h1')).toHaveText(notFoundTitle)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('.dk-terms-detail')).toHaveCount(0)
      await expect(page.locator('.dk-terms-sources')).toHaveCount(0)
      await expect(page.locator('.dk-terms-reviews')).toHaveCount(0)
    }
  })
}
