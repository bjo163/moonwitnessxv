import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const out = join(dirname(fileURLToPath(import.meta.url)), '../out')
const titles = {
  id: ['Tentang proyek', 'Sumber dan kebijakan editorial', 'Privasi pilot'],
  en: ['About the project', 'Sources and editorial policy', 'Pilot privacy'],
}
for (const locale of ['id', 'en']) {
  const home = readFileSync(join(out, `${locale}.html`), 'utf8')
  assert.match(home, /href="#content"/)
  assert.match(home, /<main id="content" tabindex="-1">/)
  for (const [i, section] of ['about', 'sources', 'privacy'].entries()) {
    assert.ok(home.includes(`href="/${locale}/${section}"`))
    const html = readFileSync(join(out, locale, `${section}.html`), 'utf8')
    assert.ok(html.includes(`<h1>${titles[locale][i]}</h1>`))
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/)
    assert.equal((html.match(/<main[ >]/g) ?? []).length, 1)
    assert.ok(html.includes(`lang="${locale}"`))
    const other = locale === 'id' ? 'en' : 'id'
    assert.ok(html.includes(`href="/${other}/${section}"`))
    assert.ok(html.includes('aria-current="page"'))
    assert.doesNotMatch(html, /<form[ >]|<iframe[ >]|https?:\/\/[^"<> ]+\.a-l-l-a-h\.com/)
  }
}
console.info('PASS: six exported information pages, locale links, headings, main landmarks, noindex, and no forms/embeds.')
