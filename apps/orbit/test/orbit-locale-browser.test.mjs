import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { after, before, test } from 'node:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { chromium } from '@playwright/test'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let serverProcess
let browser
let baseUrl
let output = ''

async function reservePort() {
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const { port } = server.address()
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  return port
}

async function waitForServer() {
  const deadline = Date.now() + 180_000
  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`ORBIT dev server exited (${serverProcess.exitCode}): ${output.slice(-4000)}`)
    }
    try {
      const response = await globalThis.fetch(baseUrl, { redirect: 'manual' })
      if (response.status === 200) return
    } catch {
      // Next.js is still starting.
    }
    await new Promise((resolve) => globalThis.setTimeout(resolve, 300))
  }
  throw new Error(`ORBIT dev server did not become ready: ${output.slice(-4000)}`)
}

function childEnvironment() {
  const env = {}
  for (const key of [
    'PATH', 'Path', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'HOME', 'USERPROFILE',
    'APPDATA', 'LOCALAPPDATA', 'HOMEDRIVE', 'HOMEPATH', 'LANG', 'TMPDIR',
  ]) {
    if (process.env[key] !== undefined) env[key] = process.env[key]
  }
  env.NODE_ENV = 'development'
  env.NEXT_TELEMETRY_DISABLED = '1'
  env.ORBIT_SIMULATED = 'true'
  return env
}

before(async () => {
  const port = await reservePort()
  baseUrl = `http://127.0.0.1:${port}`
  const command = process.platform === 'win32' ? process.env.ComSpec ?? 'cmd.exe' : 'pnpm'
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `pnpm --filter @moonwitness/orbit exec next dev --hostname 127.0.0.1 --port ${port}`]
    : ['--filter', '@moonwitness/orbit', 'exec', 'next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)]
  serverProcess = spawn(command, args, { cwd: appRoot, env: childEnvironment(), stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
  for (const stream of [serverProcess.stdout, serverProcess.stderr]) {
    stream.on('data', (chunk) => { output = `${output}${chunk.toString()}`.slice(-8000) })
  }
  await waitForServer()
  browser = await chromium.launch({ headless: true })
}, { timeout: 210_000 })

after(async () => {
  await browser?.close().catch(() => undefined)
  if (!serverProcess || serverProcess.exitCode !== null) return
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(serverProcess.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true })
    await new Promise((resolve) => killer.once('exit', resolve))
  } else {
    serverProcess.kill('SIGTERM')
  }
})

test('ORBIT renders visible id/en copy and fails unsupported locale hints back to English', async () => {
  const context = await browser.newContext({ locale: 'en-US' })
  const page = await context.newPage()
  await page.goto(baseUrl)

  assert.equal(await page.locator('html').getAttribute('lang'), 'en')
  await page.getByText('Spatial Agent Operations', { exact: true }).waitFor({ state: 'visible' })
  await page.getByRole('navigation', { name: 'Language selection' }).getByRole('link', { name: 'ID' }).click()
  await page.getByText('Operasi Agen Spasial', { exact: true }).waitFor({ state: 'visible' })
  assert.equal(await page.locator('html').getAttribute('lang'), 'id')
  assert.equal(await page.locator('a[href="?locale=id"]').getAttribute('aria-current'), 'true')
  await page.getByText('Stasiun Kerja', { exact: true }).first().waitFor({ state: 'visible' })

  await page.goto(`${baseUrl}/?locale=fr`)
  assert.equal(await page.locator('html').getAttribute('lang'), 'en')
  await page.getByText('Spatial Agent Operations', { exact: true }).waitFor({ state: 'visible' })
  assert.doesNotMatch(await page.locator('body').innerText(), /Operasi Agen Spasial/)
  await context.close()
})
