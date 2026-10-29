import console from 'node:console'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const out = join(dirname(fileURLToPath(import.meta.url)), '../out')
const titles = {
  id: ['Tentang proyek', 'Peta ekosistem', 'Nilai dan tanggung jawab', 'Roadmap pilot', 'Sumber dan kebijakan editorial', 'Privasi pilot'],
  en: ['About the project', 'Ecosystem map', 'Values and accountability', 'Pilot roadmap', 'Sources and editorial policy', 'Pilot privacy'],
}
for (const locale of ['id', 'en']) {
  const home = readFileSync(join(out, `${locale}.html`), 'utf8')
  assert.ok(home.includes(`<html lang="${locale}">`))
  assert.match(home, /href="#content"/)
  assert.match(home, /<main id="content" tabindex="-1">/)
  for (const [i, section] of ['about', 'ecosystem', 'values', 'roadmap', 'sources', 'privacy'].entries()) {
    assert.ok(home.includes(`href="/${locale}/${section}"`))
    const html = readFileSync(join(out, locale, `${section}.html`), 'utf8')
    assert.ok(html.includes(`<h1>${titles[locale][i]}</h1>`))
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/)
    assert.equal((html.match(/<main[ >]/g) ?? []).length, 1)
    assert.ok(html.includes(`<html lang="${locale}">`))
    const other = locale === 'id' ? 'en' : 'id'
    assert.ok(html.includes(`href="/${other}/${section}"`))
    assert.ok(html.includes('aria-current="page"'))
    assert.doesNotMatch(html, /<form[ >]|<iframe[ >]|https?:\/\/[^"<> ]+\.a-l-l-a-h\.com/)
  }
}
console.info('PASS: twelve exported information pages, locale links, headings, main landmarks, noindex, and no forms/embeds.')

// Walk every exported page: local navigation must resolve and fragment targets must exist.
import { existsSync, readdirSync } from 'node:fs'
const files = readdirSync(out, { recursive: true }).filter(file => file.endsWith('.html'))
for (const file of files) {
  const html = readFileSync(join(out, file), 'utf8')
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (!href.startsWith('/') && !href.startsWith('#')) continue
    const [path, fragment] = href.split('#')
    const target = path ? join(out, path === '/' ? 'index.html' : `${path}.html`) : join(out, file)
    assert.ok(existsSync(target), `${file}: broken destination ${href}`)
    if (fragment) assert.ok(readFileSync(target, 'utf8').includes(`id="${fragment}"`), `${file}: missing anchor ${href}`)
  }
}
assert.match(readFileSync(join(out, 'index.html'), 'utf8'), /<html lang="en">/)
assert.equal(existsSync(join(out, 'fr.html')), false)
console.info(`PASS: navigation destinations and anchors across ${files.length} exported HTML files; unsupported locales are not exported.`)

const missing = readFileSync(join(out, '404.html'), 'utf8')
assert.ok(missing.includes('href="/id"') && missing.includes('href="/en"'))
console.info('PASS: global 404 offers both supported home routes.')
