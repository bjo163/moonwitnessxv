// M19-07 manual acceptance harness — J01/J03 browser pass against the ephemeral Hub.
//
// Not part of `pnpm test`: it boots the real hub app in-memory plus the Dock dev
// server and drives Chromium, so it stays an on-demand evidence run (owner keeps CI
// to one cheap build+test gate).
//
// Run from the repository root:   node scripts/ui/m19-07-acceptance.mjs
// Exits 0 only when every clause prints PASS; prints the measured geometry it used.
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { chromium } from '@playwright/test'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const arsyRoot = resolve(root, 'apps/arsy')
const dockRoot = resolve(root, 'apps/dock')
const nextBin = resolve(dockRoot, 'node_modules/next/dist/bin/next')
const hubScript = resolve(root, 'scripts/ui/ephemeral-hub.mjs')

const results = []
function check(clause, ok, detail) {
  results.push({ clause, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${clause}${detail ? ` — ${detail}` : ''}`)
}

async function availablePort() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const { port } = server.address()
  await new Promise((done, fail) => server.close((error) => (error ? fail(error) : done())))
  return port
}

function track(child, label) {
  let output = ''
  child.stdout?.setEncoding('utf8').on('data', (chunk) => { output += chunk })
  child.stderr?.setEncoding('utf8').on('data', (chunk) => { output += chunk })
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) console.error(`[${label}] exited with ${code}\n${output}`)
  })
  return () => output
}

async function stop(children) {
  for (const child of children) {
    if (child.exitCode !== null || child.signalCode !== null) continue
    const exited = new Promise((done) => {
      const timer = setTimeout(() => done(false), 5000)
      child.once('exit', () => { clearTimeout(timer); done(true) })
    })
    child.kill('SIGTERM')
    if (await exited) continue
    child.kill('SIGKILL')
  }
}

async function waitForHub(port, readOutput) {
  for (let attempt = 0; attempt < 900; attempt += 1) {
    if (readOutput().includes('EVIDENCE_HUB_READY')) return
    await new Promise((done) => setTimeout(done, 100))
  }
  throw new Error(`ephemeral hub did not report readiness:\n${readOutput()}`)
}

async function waitForDock(url) {
  let lastError = 'no response'
  for (let attempt = 0; attempt < 1800; attempt += 1) {
    try {
      const response = await fetch(`${url}/en/reader`)
      if (response.status === 200) return
      lastError = `status ${response.status}`
    } catch (error) {
      lastError = String(error)
    }
    await new Promise((done) => setTimeout(done, 100))
  }
  throw new Error(`Dock dev server did not answer: ${lastError}`)
}

async function measure(page) {
  return page.evaluate(() => {
    const box = (selector) => {
      const node = document.querySelector(selector)
      if (!node) return null
      const rect = node.getBoundingClientRect()
      return { width: Math.round(rect.width), height: Math.round(rect.height) }
    }
    return {
      lang: document.documentElement.lang,
      mains: document.querySelectorAll('main#main.dk-main').length,
      experience: document.querySelector('main#main')?.getAttribute('data-experience'),
      headers: document.querySelectorAll('header.dk-header').length,
      footers: document.querySelectorAll('footer.dk-footer').length,
      h1: document.querySelector('h1')?.textContent?.trim() ?? '',
      passage: box('article.dk-reader-passage'),
      arabic: box('p.dk-reader-arabic'),
      arabicCount: document.querySelectorAll('p.dk-reader-arabic').length,
      citation: box('#reader-citation'),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  })
}

// The reader route is force-dynamic and streams its panel, so a `load` event can
// precede the ready panel; measuring at that instant yields a 0x0 box that says
// nothing about layout. Wait for the passage to have a visible box first.
async function openReader(page, url) {
  const response = await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await page.locator('article.dk-reader-passage').waitFor({ state: 'visible', timeout: 120000 })
  return response
}

const children = []
let browser
let exitCode = 1

try {
  const hubPort = await availablePort()
  const dockPort = await availablePort()
  const hubUrl = `http://127.0.0.1:${hubPort}/api/v1`
  const dockUrl = `http://127.0.0.1:${dockPort}`

  const hub = spawn(process.execPath, [resolve(arsyRoot, 'node_modules/tsx/dist/cli.mjs'), hubScript], {
    cwd: arsyRoot,
    env: {
      ...process.env,
      MOONQL_AUTH_ADMIN_PASSWORD: 'm19-07-throwaway',
      ARSY_TITLE: 'Evidence Hub',
      RADIO_TITLE: 'Evidence Hub',
      API_TITLE: 'Evidence Hub',
      EVIDENCE_HUB_PORT: String(hubPort),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push(hub)
  const hubOutput = track(hub, 'hub')
  await waitForHub(hubPort, hubOutput)

  const dock = spawn(process.execPath, [nextBin, 'dev', '--hostname', '127.0.0.1', '--port', String(dockPort)], {
    cwd: dockRoot,
    env: { ...process.env, RADIO_API_URL: hubUrl },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push(dock)
  track(dock, 'dock')
  await waitForDock(dockUrl)

  browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  for (const locale of ['en', 'id']) {
    const response = await openReader(page, `${dockUrl}/${locale}/reader`)
    check(`J01 ${locale}: /${locale}/reader returns 200`, response?.status() === 200, `status ${response?.status()}`)

    const shell = await measure(page)
    check(`${locale}: one main#main.dk-main[data-experience=reader]`, shell.mains === 1 && shell.experience === 'reader', JSON.stringify({ mains: shell.mains, experience: shell.experience }))
    check(`${locale}: header and footer landmarks render`, shell.headers === 1 && shell.footers === 1, `header=${shell.headers} footer=${shell.footers}`)
    check(`${locale}: html lang matches the route`, shell.lang === locale, `lang=${shell.lang}`)
    check(`${locale}: page heading is present`, shell.h1.length > 0, shell.h1)

    const form = page.locator('main form[role="search"]')
    const method = await form.getAttribute('method')
    const action = await form.getAttribute('action')
    const citation = await page.locator('main form[role="search"] #citation').inputValue()
    check(`${locale}: J01 search form is visible, GETs /${locale}/reader`, await form.isVisible() && method === 'get' && action === `/${locale}/reader`, `method=${method} action=${action}`)
    check(`${locale}: J01 citation field is prefilled with QS 2:82`, citation === 'QS 2:82', citation)

    check(`${locale}: J01 Arabic source exists once`, shell.arabicCount === 1, `count=${shell.arabicCount}`)
    const arabic = page.locator('p.dk-reader-arabic')
    check(`${locale}: J01 Arabic source is visible with real width`, (await arabic.isVisible()) && (shell.arabic?.width ?? 0) > 240, `box=${JSON.stringify(shell.arabic)} passage=${JSON.stringify(shell.passage)}`)
    const translation = page.locator('main article.dk-reader-passage li.dk-reader-translation p').first()
    check(`${locale}: J01 licensed translation renders`, await translation.isVisible(), (await translation.textContent())?.trim().slice(0, 60))
    check(`${locale}: citation panel renders beside the passage`, (shell.citation?.width ?? 0) > 200 && await page.locator('#reader-citation').isVisible(), `box=${JSON.stringify(shell.citation)}`)

    if (locale === 'en') {
      const before = await arabic.boundingBox()
      await page.locator('main a[href$="/reader/compare"]').first().click()
      await page.waitForURL(`**/en/reader/compare`, { timeout: 120000 })
      const compareHeading = (await page.locator('h1').first().textContent())?.trim()
      const withheld = page.locator('[role="alert"]').first()
      const withheldText = (await withheld.textContent())?.trim() ?? ''
      check('J03: comparative route opens from the Reader', compareHeading === 'Comparative Reader', compareHeading)
      check('J03: comparison body is withheld, no fabricated names', await withheld.isVisible() && !/Elohim|YHWH/i.test(withheldText), withheldText.slice(0, 80))
      await page.goBack({ waitUntil: 'load', timeout: 120000 })
      await page.locator('article.dk-reader-passage').waitFor({ state: 'visible', timeout: 120000 })
      const after = await arabic.boundingBox()
      check('J03: the withheld comparison cannot block the Reader', (after?.width ?? 0) === (before?.width ?? 0) && (after?.width ?? 0) > 240, `before=${before?.width} after=${after?.width}`)

      await openReader(page, `${dockUrl}/en/reader`)
      await page.keyboard.press('Tab')
      const first = await page.evaluate(() => {
        const node = document.activeElement
        return { tag: node?.tagName?.toLowerCase(), className: node?.className, text: node?.textContent?.trim(), href: node?.getAttribute?.('href') }
      })
      check('a11y: the skip link is the first keyboard focus stop', first.tag === 'a' && first.className === 'dk-skip' && first.href === '#main', JSON.stringify(first))
      await page.keyboard.press('Enter')
      const target = await page.evaluate(() => ({
        hash: window.location.hash,
        activeId: document.activeElement?.id,
        focusable: document.querySelector('main#main')?.getAttribute('tabindex'),
      }))
      check('a11y: the skip link moves focus to main#main', target.hash === '#main' && target.activeId === 'main' && target.focusable === '-1', JSON.stringify(target))
    }
  }

  // The reader splits panes inside a container query at 640px and stacks its rails
  // at a 900px media query, so measure both sides of each boundary.
  for (const width of [390, 640, 768, 900, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await openReader(page, `${dockUrl}/en/reader`)
    const measured = await measure(page)
    const arabicAtWidth = page.locator('p.dk-reader-arabic')
    check(`${width}px: no horizontal overflow`, measured.scrollWidth <= measured.innerWidth + 1, `scrollWidth=${measured.scrollWidth} innerWidth=${measured.innerWidth}`)
    check(`${width}px: the passage and Arabic source keep real width`, (measured.passage?.width ?? 0) > 300 && await arabicAtWidth.isVisible(), `passage=${JSON.stringify(measured.passage)} arabic=${JSON.stringify(measured.arabic)}`)
  }

  console.log('J05 / Story: NOT RUN — Story is not in release scope (matches the M19-07 row).')
  exitCode = results.every((result) => result.ok) ? 0 : 1
  console.log(`\n${results.filter((result) => result.ok).length}/${results.length} clauses PASS`)
} catch (error) {
  console.error(error)
  exitCode = 1
} finally {
  await browser?.close()
  await stop(children)
  process.exit(exitCode)
}
