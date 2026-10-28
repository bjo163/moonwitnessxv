import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFileSync(join(appDir, relativePath), 'utf8')
const css = read('src/app/globals.css')
const spaces = read('src/ui/components/spaces.tsx')
const reader = read('src/ui/components/reader.tsx')
const terms = read('src/ui/components/terms.tsx')
const states = read('src/ui/components/states.tsx')

function cssRule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escaped}\\s*\\{`))
  if (!match) return null

  const start = match.index + match[0].length
  let depth = 1
  let index = start
  while (index < source.length && depth > 0) {
    if (source[index] === '{') depth += 1
    if (source[index] === '}') depth -= 1
    index += 1
  }
  return source.slice(start, index - 1)
}

test('space cards and provenance summary have visible keyboard focus', () => {
  for (const selector of ['.dk-space-card:focus-visible', '.dk-provenance > summary:focus-visible']) {
    const rule = cssRule(css, selector)
    assert.ok(rule, `${selector} must have a focus-visible rule`)
    assert.match(rule, /outline:\s*[^;]+/i, `${selector} must show a visible outline`)
  }
})

test('space cards remain native anchors without custom keyboard overrides', () => {
  const start = spaces.indexOf('export function SpaceCard(')
  const end = spaces.indexOf('export function SpaceGrid(', start)
  const component = spaces.slice(start, end)
  assert.match(component, /<a className="dk-space-card"[^>]*href=\{href\}>/)
  assert.doesNotMatch(component, /\b(?:onClick|role|tabIndex)\s*=/)
})

test('reader provenance uses native details and summary as the first control', () => {
  const start = reader.indexOf('<details className="dk-provenance">')
  const end = reader.indexOf('</details>', start)
  assert.notEqual(start, -1, 'Reader provenance must use a native details element')
  assert.notEqual(end, -1, 'Reader provenance details must close')
  const disclosure = reader.slice(start, end)
  assert.match(disclosure, /^<details className="dk-provenance">\s*<summary>/)
  assert.match(disclosure, /<summary>[^<]+<\/summary>\s*(?:\{source \? <SourceIdentity)/)
  assert.doesNotMatch(disclosure, /\b(?:onClick|role|tabIndex)\s*=/)
})

test('loading and error states announce status while empty term states use locale catalog copy', () => {
  assert.match(states, /role="status"[\s\S]*?aria-live="polite"/)
  assert.match(states, /role="alert"/)
  assert.match(reader, /result\.state === 'rights_blocked'[\s\S]*?<div role="alert">[\s\S]*?<Alert tone="hot">/)
  assert.match(terms, /const states = getStatesCopy\(locale\)/)
  assert.match(terms, /title=\{states\.emptyTermsSearchTitle\}/)
  assert.match(terms, /hint=\{states\.emptyTermsSearchHint\}/)
  assert.doesNotMatch(terms, /No term matches that filter|Search matches stable IDs/)
})
