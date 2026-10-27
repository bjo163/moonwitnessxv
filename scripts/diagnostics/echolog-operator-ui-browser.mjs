import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { chromium } from '@playwright/test'

const baseUrl = process.env.ECHOLOG_UI_URL ?? 'http://127.0.0.1:3106/'
const digest = 'a'.repeat(64)
const reference = { object_key: `sha256/${digest}`, digest, size: 2048, content_type: 'image/png' }
const sidecar = {
  ...reference,
  filename: 'fixture.png',
  uploader: 'synthetic-ui-evidence',
  created_at: '2026-10-27T00:00:00.000Z',
  retention_until: null,
  legal_hold: true,
  scan: 'skipped',
  tags: [],
}

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(7000)
  const pageErrors = []
  let deleteRequests = 0
  let uploadRequests = 0
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (request.method() === 'POST' && url.pathname === '/api/v1/objects') uploadRequests += 1
  })
  await page.addInitScript(({ value }) => {
    globalThis.localStorage.setItem('echolog.operator.watchlist.v1', JSON.stringify([value]))
  }, { value: reference })
  await page.route('**/api/v1/objects/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (request.method() === 'GET' && url.pathname.endsWith('/meta')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sidecar) })
      return
    }
    if (request.method() === 'DELETE') {
      deleteRequests += 1
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'legal_hold', message: 'Object is protected by retention policy.' } }),
      })
      return
    }
    if (request.method() === 'POST' && url.pathname === '/api/v1/objects') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ...reference, filename: 'fixture.png' }) })
      return
    }
    await route.continue()
  })
  await page.route('**/api/v1/objects', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { code: 'unexpected_upload', message: 'Upload is outside this interaction test.' } }) })
      return
    }
    await route.continue()
  })

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.getByText('reachable on this origin').waitFor()
  await page.getByRole('textbox', { name: 'ARSY session bearer token' }).fill('synthetic-session-token')
  await page.getByRole('textbox', { name: 'ARSY session bearer token' }).press('Enter')
  await page.getByRole('button', { name: /sha256\/aaaaaaaaaa/i }).click()
  await page.getByText('legal hold: on — deletion refused').waitFor()

  const legalHoldToggle = page.getByRole('checkbox', { name: 'Apply legal hold at ingest (requires confirmation)' })
  await page.getByLabel('File').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: Buffer.from('synthetic legal hold upload') })
  await legalHoldToggle.focus()
  await page.keyboard.press('Space')
  const holdDialog = page.getByRole('dialog', { name: 'Confirm legal hold on upload' })
  await holdDialog.waitFor()
  assert.equal(
    await page.getByRole('button', { name: 'Apply legal hold' }).evaluate((element) => element === globalThis.document.activeElement),
    true,
    'focus starts on the confirmation action for legal hold',
  )
  await page.keyboard.press('Escape')
  await holdDialog.waitFor({ state: 'detached' })
  assert.equal(await legalHoldToggle.isChecked(), false, 'Escape cancels legal hold')
  assert.equal(await legalHoldToggle.evaluate((element) => element === globalThis.document.activeElement), true, 'focus returns to the legal hold toggle')
  await page.keyboard.press('Space')
  await holdDialog.waitFor()
  await page.keyboard.press('Enter')
  assert.equal(await legalHoldToggle.isChecked(), true, 'Enter confirms legal hold')
  assert.equal(uploadRequests, 0, 'confirmation does not upload the fixture')

  const deleteButton = page.getByRole('button', { name: 'Delete object' })
  const dialog = page.getByRole('dialog', { name: 'Confirm object deletion' })
  await deleteButton.click()
  await dialog.waitFor()
  assert.equal(
    await page.getByRole('button', { name: 'Delete permanently' }).evaluate((element) => element === globalThis.document.activeElement),
    true,
    'focus starts on the destructive action inside the dialog',
  )
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'detached' })
  assert.equal(deleteRequests, 0, 'Escape cancels without sending a delete request')
  assert.equal(
    await deleteButton.evaluate((element) => element === globalThis.document.activeElement),
    true,
    'focus returns to the dialog opener',
  )

  await deleteButton.click()
  await dialog.waitFor()
  await page.keyboard.press('Enter')
  await page.getByText('Object is protected by retention policy.', { exact: true }).waitFor()
  assert.equal(deleteRequests, 1)
  assert.deepEqual(pageErrors, [])

  console.log(JSON.stringify({
    health: 'reachable on the real loopback ECHOLOG service',
    metadata: 'synthetic held object fixture',
    deleteResponse: 'synthetic HTTP 409 legal_hold fixture',
    confirmationDialog: 'opened; focus entered; Escape cancelled without a request; focus returned; Enter confirmed',
    legalHoldConfirmation: 'keyboard Space opens; Escape cancels and restores focus; Space opens again; Enter confirms; no upload sent',
    refusalText: 'rendered verbatim',
    deleteRequests,
    uploadRequests,
    pageErrors,
  }))
} finally {
  await browser.close()
}
