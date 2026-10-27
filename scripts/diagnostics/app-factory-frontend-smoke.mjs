import assert from 'node:assert/strict'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { runAppCreate } from '../../scripts/app-create.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const pnpmStore = join(repoRoot, 'node_modules', '.pnpm')
const fixtureRoot = mkdtempSync(join(tmpdir(), 'moonwitness-app-factory-'))

function findPnpmEntry(prefix) {
  const entry = readdirSync(pnpmStore).find((name) => name.startsWith(prefix))
  assert.ok(entry, `pnpm install must contain ${prefix}`)
  return join(pnpmStore, entry, 'node_modules')
}

try {
  mkdirSync(join(fixtureRoot, 'apps'), { recursive: true })
  copyFileSync(join(repoRoot, 'tsconfig.base.json'), join(fixtureRoot, 'tsconfig.base.json'))
  const result = runAppCreate({
    argv: ['factory-smoke', '--variant', 'frontend'],
    root: fixtureRoot,
    env: {},
    stdout: () => {},
    stderr: (line) => { throw new Error(line) },
  })
  assert.equal(result, 0, 'App Factory must generate the fixture')

  const appRoot = join(fixtureRoot, 'apps', 'factory-smoke')
  const appModules = join(appRoot, 'node_modules')
  const moonwitnessModules = join(appModules, '@moonwitness')
  mkdirSync(moonwitnessModules, { recursive: true })
  symlinkSync(join(repoRoot, 'packages', 'core'), join(moonwitnessModules, 'core'), 'junction')
  symlinkSync(join(repoRoot, 'packages', 'moonui'), join(moonwitnessModules, 'moonui'), 'junction')

  const packageLinks = [
    ['react', 'react@'],
    ['react-dom', 'react-dom@'],
    ['vite', 'vite@'],
    ['@vitejs/plugin-react', '@vitejs+plugin-react@'],
    ['tsx', 'tsx@'],
  ]
  for (const [packageName, storePrefix] of packageLinks) {
    const source = join(findPnpmEntry(storePrefix), packageName)
    assert.ok(existsSync(source), `installed ${packageName} package must exist`)
    const linkPath = join(appModules, packageName)
    mkdirSync(dirname(linkPath), { recursive: true })
    symlinkSync(source, linkPath, 'junction')
  }

  const viteBin = join(findPnpmEntry('vite@'), 'vite', 'bin', 'vite.js')
  const build = spawnSync(process.execPath, [viteBin, 'build'], { cwd: appRoot, encoding: 'utf8' })
  assert.equal(build.status, 0, `generated Vite build failed:\n${build.stdout}\n${build.stderr}`)
  assert.ok(existsSync(join(appRoot, 'dist', 'index.html')), 'generated build must emit dist/index.html')
  const tsxCli = join(findPnpmEntry('tsx@'), 'tsx', 'dist', 'cli.mjs')
  const routes = spawnSync(process.execPath, [tsxCli, '--test', join(appRoot, 'test', 'router.test.ts')], { cwd: appRoot, encoding: 'utf8' })
  assert.equal(routes.status, 0, `generated route tests failed:\n${routes.stdout}\n${routes.stderr}`)

  const preview = spawn(process.execPath, [viteBin, 'preview', '--host', '127.0.0.1', '--port', '4187', '--strictPort'], {
    cwd: appRoot,
    stdio: 'ignore',
    windowsHide: true,
  })
  let browser
  try {
    const baseUrl = 'http://127.0.0.1:4187'
    let ready = false
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const response = await fetch(`${baseUrl}/en`)
        ready = response.ok
        if (ready) break
      } catch {
        await delay(100)
      }
    }
    assert.equal(ready, true, 'generated Vite preview must serve the built app')
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    const pageErrors = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.goto(`${baseUrl}/en`, { waitUntil: 'networkidle' })
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    assert.equal(await nav.getByRole('button', { name: 'Home' }).getAttribute('aria-current'), 'page')
    const about = nav.getByRole('button', { name: 'About' })
    await about.focus()
    await about.press('Enter')
    await page.waitForURL('**/en/about')
    assert.equal(await about.getAttribute('aria-current'), 'page')
    await page.getByRole('combobox', { name: 'Language' }).selectOption('id')
    await page.waitForURL('**/id/about')
    await page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('button', { name: 'Tentang' }).waitFor()
    await page.goBack()
    await page.waitForURL('**/en/about')
    assert.equal(await page.getByRole('combobox', { name: 'Language' }).inputValue(), 'en')
    assert.equal(await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'About' }).getAttribute('aria-current'), 'page')
    await page.goForward()
    await page.waitForURL('**/id/about')
    assert.equal(await page.getByRole('combobox', { name: 'Bahasa' }).inputValue(), 'id')
    assert.equal(await page.getByRole('navigation', { name: 'Navigasi utama' }).getByRole('button', { name: 'Tentang' }).getAttribute('aria-current'), 'page')
    assert.deepEqual(pageErrors, [], 'generated UI must not emit runtime exceptions')
  } finally {
    await browser?.close()
    preview.kill()
    await new Promise((resolveExit) => {
      if (preview.exitCode !== null) resolveExit()
      else preview.once('exit', resolveExit)
    })
  }
  process.stdout.write('Generated Vite build and browser navigation/locale checks passed.\n')
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true })
}
