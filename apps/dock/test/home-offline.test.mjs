/* global setTimeout, clearTimeout */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { once } from 'node:events'
import process from 'node:process'
import { URL } from 'node:url'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import test from 'node:test'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

async function availablePort() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  await new Promise((resolveClose, rejectClose) => server.close((error) => error ? rejectClose(error) : resolveClose()))
  return address.port
}

test('localized Dock landing stays useful when the Hub is unreachable', async (t) => {
  const port = await availablePort()
  const baseUrl = `http://127.0.0.1:${port}`
  const nextBin = resolve(appRoot, 'node_modules/next/dist/bin/next')
  const server = spawn(process.execPath, [nextBin, 'dev', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: appRoot,
    env: { ...process.env, RADIO_API_URL: 'http://127.0.0.1:65535/api/v1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let serverOutput = ''
  server.stdout.setEncoding('utf8').on('data', (chunk) => { serverOutput += chunk })
  server.stderr.setEncoding('utf8').on('data', (chunk) => { serverOutput += chunk })

  t.after(async () => {
    if (server.exitCode !== null || server.signalCode !== null) return
    const exited = new Promise((resolveExit) => {
      const timer = setTimeout(() => resolveExit(false), 5000)
      server.once('exit', () => {
        clearTimeout(timer)
        resolveExit(true)
      })
    })
    server.kill('SIGTERM')
    if (await exited) return
    server.kill('SIGKILL')
  })

  let root
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Next dev exited before becoming ready: ${serverOutput}`)
    try {
      root = await globalThis.fetch(`${baseUrl}/`, { redirect: 'manual' })
      if (root.status === 307) break
    } catch {
      // The dev server has not opened its listener yet.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100))
  }
  assert.equal(root?.status, 307, `Next dev should redirect / after startup. Output: ${serverOutput}`)

  for (const [locale, expectedMission, expectedNotice] of [
    ['id', 'Partisipasi bersifat sukarela', 'Data stasiun dan jadwal sementara tidak tersedia'],
    ['en', 'Participation is voluntary', 'Live station and schedule data is temporarily unavailable'],
  ]) {
    let response
    try {
      response = await globalThis.fetch(`${baseUrl}/${locale}`)
    } catch (error) {
      throw new Error(`GET /${locale} did not return an HTTP response while the Hub was unavailable`, { cause: error })
    }
    const html = await response.text()
    assert.equal(response.status, 200, `/${locale} should render without the Hub`)
    assert.ok(html.includes(expectedMission), `/${locale} keeps the curated mission visible`)
    assert.ok(html.includes(expectedNotice), `/${locale} distinguishes an outage from an empty catalog`)
    assert.doesNotMatch(html, /STATIONS IN CATALOG|STASIUN DALAM KATALOG/, 'unavailable live counts are not shown as zero')
  }

  root = await globalThis.fetch(`${baseUrl}/?from=locale-probe`, {
    headers: { 'accept-language': 'id-ID,en;q=0.8' },
    redirect: 'manual',
  })
  assert.equal(root.status, 307, 'the unprefixed root negotiates a canonical locale')
  assert.equal(new URL(root.headers.get('location'), baseUrl).pathname, '/id')
  assert.equal(new URL(root.headers.get('location'), baseUrl).search, '?from=locale-probe')
  assert.equal(root.headers.get('vary'), 'Accept-Language')

  const unsupported = await globalThis.fetch(`${baseUrl}/fr`, { redirect: 'manual' })
  assert.equal(unsupported.status, 404, 'an unavailable Hub does not remap unsupported locales')
})
