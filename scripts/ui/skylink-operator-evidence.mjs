import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const baseUrl = process.env.SKYLINK_EVIDENCE_URL ?? 'http://127.0.0.1:13005'
const screenshotPath = resolve('docs/audit/screens/m38-13-skylink-operator-ui.png')
const timestamp = '2026-10-27T03:00:00.000Z'
const envelope = (data) => ({ ok: true, data, timestamp })

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url())
    let data = []
    if (url.pathname === '/api/v1/channels') {
      data = [{ id: 'telegram-default', label: 'Telegram', state: 'disconnected' }]
    } else if (url.pathname === '/api/v1/conversations') {
      data = [{
        id: 'conv-demo', channelAccountId: 'account-demo', externalId: 'contact-demo',
        title: 'Demo conversation', status: 'open', lastMessageAt: timestamp,
        createdAt: timestamp, updatedAt: timestamp,
      }]
    } else if (url.pathname.endsWith('/messages')) {
      data = [{
        id: 'message-demo', conversationId: 'conv-demo', externalMessageId: null,
        direction: 'outbound', senderId: 'operator-demo',
        body: 'Synthetic browser QA message; no external source.', status: 'accepted', createdAt: timestamp,
      }]
    } else if (url.pathname.endsWith('/delivery-attempts')) {
      data = [{ id: 'attempt-demo', messageId: 'message-demo', attemptNumber: 1, status: 'accepted', attemptedAt: timestamp }]
    } else if (route.request().method() === 'POST') {
      data = { id: 'telegram-default', state: 'connecting' }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(envelope(data)) })
  })

  await page.goto(`${baseUrl}/`)
  await page.getByLabel('ARSY session bearer token').fill('synthetic-session-for-local-qa')
  await page.getByRole('button', { name: 'Use session' }).click()
  await page.getByRole('heading', { name: 'Demo conversation' }).waitFor()
  await page.getByText('Attempt 1').waitFor()

  const start = page.getByRole('button', { name: 'Start / pair' })
  await start.focus()
  assert.equal(await start.evaluate((element) => element === element.ownerDocument.activeElement), true)
  await page.keyboard.press('Enter')
  const confirmation = page.getByRole('alertdialog')
  await confirmation.waitFor()
  assert.equal(await confirmation.getByRole('button', { name: 'Start channel' }).count(), 1)
  await page.keyboard.press('Escape')
  await confirmation.waitFor({ state: 'detached' })
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(JSON.stringify({
    screenshot: screenshotPath,
    viewport: '1440x1000',
    syntheticFixtures: true,
    deliveryAttemptDisplayed: true,
    keyboardFocus: true,
    enterOpenedConfirmation: true,
    escapeCancelled: true,
  }, null, 2))
} finally {
  await browser.close()
}
