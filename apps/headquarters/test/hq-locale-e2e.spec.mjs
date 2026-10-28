import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { once } from 'node:events'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'
import { after, before, test } from 'node:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { chromium } from '@playwright/test'

const testDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(testDir, '../../..')
const currenciesModel = {
  label: 'Currency',
  addon: 'synthetic',
  route: '/currencies',
  operations: { list: true, get: true, create: true, update: true, remove: false },
  delete: 'soft',
  unique: ['code'],
  maxLimit: 25,
  dataTier: 'reference',
  acl: { list: ['admin'], get: ['admin'], create: ['admin'], update: ['admin'], remove: 'none' },
  fields: {
    name: { kind: 'str', required: true },
    code: { kind: 'str', required: true },
  },
  createSchema: { type: 'object', properties: { name: { type: 'string' }, code: { type: 'string' } }, required: ['name', 'code'] },
  updateSchema: { type: 'object', properties: { name: { type: 'string' }, code: { type: 'string' } }, required: ['name', 'code'] },
  readSchema: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, code: { type: 'string' } } },
}
const schema = {
  schemaHash: 'synthetic-hq-e2e-schema',
  apiVersion: '2.0.0',
  minDemoRows: 0,
  addons: [{ name: 'synthetic', version: '1.0.0', depends: [] }],
  models: { currencies: currenciesModel },
  views: {},
  endpoints: [],
  crons: [],
  menu: [],
}
const users = {
  'synthetic-admin-token': {
    id: 'synthetic-admin-id',
    login: 'synthetic-admin',
    displayName: 'Synthetic Admin',
    email: null,
    role: 'admin',
  },
  'synthetic-viewer-token': {
    id: 'synthetic-viewer-id',
    login: 'synthetic-viewer',
    displayName: 'Synthetic Viewer',
    email: null,
    role: 'viewer',
  },
}
const modelReads = []

let hubServer
let hqProcess
let browser
let hqUrl
let hubUrl
let hqOutput = ''

function envelope(response, status, data, headers = {}) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers })
  response.end(JSON.stringify({ ok: status < 400, ...(status < 400 ? { data } : { error: { message: 'synthetic denial' } }) }))
}

async function bodyJson(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

async function handleHub(request, response) {
  const url = new URL(request.url ?? '/', hubUrl)
  const route = url.pathname.replace(/^\/api\/v1/, '')
  const authorization = request.headers.authorization ?? ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : ''

  if (route === '/auth/login' && request.method === 'POST') {
    const credentials = await bodyJson(request)
    const tokenForUser = credentials.login === 'synthetic-admin' && credentials.password === 'synthetic-admin-password'
      ? 'synthetic-admin-token'
      : credentials.login === 'synthetic-viewer' && credentials.password === 'synthetic-viewer-password'
        ? 'synthetic-viewer-token'
        : null
    if (!tokenForUser) return envelope(response, 401, undefined)
    return envelope(response, 200, { token: tokenForUser, user: users[tokenForUser] })
  }

  if (route === '/auth/logout' && request.method === 'POST') {
    response.writeHead(204)
    return response.end()
  }

  if (route === '/auth/me' && request.method === 'GET') {
    if (token === 'synthetic-expired-token') return envelope(response, 401, undefined)
    const user = users[token]
    return user ? envelope(response, 200, user) : envelope(response, 401, undefined)
  }

  if (route === '/_schema' && request.method === 'GET') return envelope(response, 200, schema)

  if (route === '/currencies' && request.method === 'GET') {
    modelReads.push(users[token]?.role ?? 'anonymous')
    if (users[token]?.role !== 'admin') return envelope(response, 403, undefined)
    return envelope(response, 200, [], { 'x-total-count': '0' })
  }

  if (route.startsWith('/currencies/')) return envelope(response, 404, undefined)
  return envelope(response, 404, undefined)
}

function listen(server, host = '127.0.0.1') {
  return new Promise((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, host, () => {
      server.removeListener('error', reject)
      resolveListen(server.address().port)
    })
  })
}

async function reservePort() {
  const server = createServer()
  const port = await listen(server)
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()))
  return port
}

function childEnvironment() {
  const environment = {}
  for (const key of [
    'PATH', 'Path', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'HOME', 'USERPROFILE',
    'APPDATA', 'LOCALAPPDATA', 'HOMEDRIVE', 'HOMEPATH', 'LANG', 'TMPDIR',
  ]) {
    if (process.env[key] !== undefined) environment[key] = process.env[key]
  }
  environment.NODE_ENV = 'development'
  environment.NEXT_TELEMETRY_DISABLED = '1'
  environment.NEXT_DISABLE_ESLINT = '1'
  environment.ARSY_API_URL = hubUrl
  environment.RADIO_API_URL = hubUrl
  environment.SITE_NAME = 'Synthetic HQ E2E'
  environment.DOCK_URL = 'https://dock.invalid'
  environment.HQ_COOKIE_SECURE = 'false'
  return environment
}

async function waitForHq() {
  const deadline = Date.now() + 180_000
  while (Date.now() < deadline) {
    if (hqProcess.exitCode !== null) {
      throw new Error(`Synthetic HQ process exited before becoming ready (${hqProcess.exitCode}).`)
    }
    try {
      const response = await globalThis.fetch(`${hqUrl}/login`, { redirect: 'manual' })
      if (response.status === 200) return
    } catch {
      // The isolated local server is still starting.
    }
    await delay(500)
  }
  throw new Error(`Synthetic HQ did not become ready in time. Captured ${hqOutput.length} bytes of local process output.`)
}

async function stopHq() {
  if (!hqProcess || hqProcess.exitCode !== null) return
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(hqProcess.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true })
    await once(killer, 'exit').catch(() => undefined)
  } else {
    hqProcess.kill('SIGTERM')
  }
  await Promise.race([once(hqProcess, 'exit'), delay(10_000)])
  if (hqProcess.exitCode === null) hqProcess.kill('SIGKILL')
}

before(async () => {
  hubServer = createServer((request, response) => {
    void handleHub(request, response).catch(() => {
      if (!response.headersSent) envelope(response, 500, undefined)
      else response.destroy()
    })
  })
  const hubPort = await listen(hubServer)
  hubUrl = `http://127.0.0.1:${hubPort}/api/v1`
  hqUrl = `http://127.0.0.1:${await reservePort()}`

  const command = process.platform === 'win32' ? process.env.ComSpec ?? 'cmd.exe' : 'pnpm'
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `pnpm --filter @moonwitness/headquarters exec next dev --hostname 127.0.0.1 --port ${new URL(hqUrl).port}`]
    : ['--filter', '@moonwitness/headquarters', 'exec', 'next', 'dev', '--hostname', '127.0.0.1', '--port', new URL(hqUrl).port]
  hqProcess = spawn(
    command,
    args,
    { cwd: repoRoot, env: childEnvironment(), stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
  )
  const capture = (chunk) => { hqOutput = `${hqOutput}${chunk.toString()}`.slice(-12_000) }
  hqProcess.stdout.on('data', capture)
  hqProcess.stderr.on('data', capture)

  await waitForHq()
  browser = await chromium.launch({ headless: true })
}, { timeout: 210_000 })

after(async () => {
  await browser?.close().catch(() => undefined)
  await stopHq().catch(() => undefined)
  if (hubServer?.listening) {
    hubServer.closeAllConnections()
    await new Promise((resolveClose) => hubServer.close(() => resolveClose()))
  }
})

test('HQ browser flow preserves id/en locale, session boundaries, denial, and model UI', async () => {
  const context = await browser.newContext({ locale: 'en-US' })
  const page = await context.newPage()

  await page.goto(`${hqUrl}/login?next=${encodeURIComponent('/models/currencies')}`)
  assert.equal(await page.locator('html').getAttribute('lang'), 'en')
  await page.getByLabel('Language').selectOption('id')
  await page.getByText('Email atau nama pengguna').waitFor({ state: 'visible' })
  assert.equal(new URL(page.url()).pathname, '/login')
  assert.equal(new URL(page.url()).searchParams.get('next'), '/models/currencies')
  assert.equal((await context.cookies()).find((cookie) => cookie.name === 'mw_locale')?.value, 'id')
  await page.reload()
  await page.getByText('Email atau nama pengguna').waitFor({ state: 'visible' })
  assert.equal(await page.locator('html').getAttribute('lang'), 'id')
  assert.equal(await page.locator('a[href="https://dock.invalid/id"]').count(), 1)

  await page.locator('input[name="login"]').fill('synthetic-unknown')
  await page.locator('input[name="password"]').fill('synthetic-wrong-password')
  await page.locator('button[type="submit"]').click()
  await page.getByText('Data masuk tidak diterima. Periksa kembali lalu coba lagi.').waitFor({ state: 'visible' })
  assert.equal((await context.cookies()).some((cookie) => cookie.name === 'hq_token'), false)

  await page.goto(`${hqUrl}/login?next=${encodeURIComponent('/models/currencies')}`)
  await page.getByText('Email atau nama pengguna').waitFor({ state: 'visible' })
  await page.locator('input[name="login"]').fill('synthetic-admin')
  await page.locator('input[name="password"]').fill('synthetic-admin-password')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(`${hqUrl}/models/currencies`)
  await page.waitForLoadState('networkidle')
  const listHtml = await page.locator('body').innerText()
  assert.match(listHtml, /Belum ada baris currencies\./, 'model listing should show the synthetic empty state')
  assert.equal(await page.locator('html').getAttribute('lang'), 'id')

  await page.goto(`${hqUrl}/models/currencies/new?error=invalid`)
  await page.getByText('Permintaan tidak diterima. Periksa isian lalu coba lagi.').waitFor({ state: 'visible' })
  await page.getByLabel('Language').selectOption('en')
  await page.getByText('The request was not accepted. Check the values and try again.').waitFor({ state: 'visible' })
  assert.equal(new URL(page.url()).pathname, '/models/currencies/new')
  assert.equal(new URL(page.url()).searchParams.get('error'), 'invalid')
  assert.equal((await context.cookies()).find((cookie) => cookie.name === 'mw_locale')?.value, 'en')
  assert.equal(await page.locator('input[name="name::str"]').count(), 1)
  assert.equal(await page.locator('input[name="code::str"]').count(), 1)
  assert.equal(await page.locator('html').getAttribute('lang'), 'en')

  const viewerContext = await browser.newContext({ locale: 'id-ID' })
  await viewerContext.addCookies([
    { name: 'hq_token', value: 'synthetic-viewer-token', url: hqUrl, httpOnly: true, sameSite: 'Lax' },
    { name: 'mw_locale', value: 'id', url: hqUrl, sameSite: 'Lax' },
  ])
  const viewerPage = await viewerContext.newPage()
  modelReads.length = 0
  await viewerPage.goto(`${hqUrl}/models/currencies`)
  await viewerPage.getByRole('heading', { name: 'Tidak berwenang' }).first().waitFor({ state: 'visible' })
  await viewerPage.getByText('Akun Anda tidak memiliki peran yang dibutuhkan area ini. Tidak ada data yang dimuat.').waitFor({ state: 'visible' })
  assert.deepEqual(modelReads, [], 'a viewer denial must happen before the Hub model-list request')
  assert.doesNotMatch(await viewerPage.locator('body').innerText(), /synthetic-session|hq_token|synthetic-viewer-id/)

  const expiredContext = await browser.newContext({ locale: 'id-ID' })
  await expiredContext.addCookies([
    { name: 'hq_token', value: 'synthetic-expired-token', url: hqUrl, httpOnly: true, sameSite: 'Lax' },
    { name: 'mw_locale', value: 'id', url: hqUrl, sameSite: 'Lax' },
  ])
  const expiredPage = await expiredContext.newPage()
  await expiredPage.goto(`${hqUrl}/models/currencies`)
  await expiredPage.waitForURL(/\/login\?error=expired/)
  await expiredPage.getByText('Sesi Anda telah berakhir. Masuk kembali untuk melanjutkan.').waitFor({ state: 'visible' })

  const anonymousContext = await browser.newContext()
  const anonymousPage = await anonymousContext.newPage()
  await anonymousPage.goto(`${hqUrl}/models/currencies`)
  await anonymousPage.waitForURL(/\/login\?next=%2Fmodels%2Fcurrencies/)

  await anonymousContext.close()
  await expiredContext.close()
  await viewerContext.close()
  await context.close()
}, { timeout: 180_000 })
