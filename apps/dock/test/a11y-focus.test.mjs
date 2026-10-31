import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFileSync(join(appDir, relativePath), 'utf8')
const css = read('src/app/globals.css')
// ADR-0017: the space card is a MoonUI component, so its markup and focus ring
// are asserted against the shared package rather than a Dock copy.
const moonCss = read('../../packages/moonui/moon.css')
const spaces = read('../../packages/moonui/src/spaces.tsx')
const reader = read('src/ui/components/reader.tsx')
const terms = read('src/ui/components/terms.tsx')
const states = read('src/ui/components/states.tsx')
const appError = read('src/app/error.tsx')
const globalError = read('src/app/global-error.tsx')
const researchPage = read('src/app/research/page.tsx')
const comparePage = read('src/app/reader/compare/page.tsx')
const denpa = read('src/ui/client/DenpaTransceiver.tsx')
const player = read('src/ui/client/Player.tsx')

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
  const spaceRule = cssRule(moonCss, '.m-space-card:focus-visible')
  assert.ok(spaceRule, '.m-space-card:focus-visible must have a focus-visible rule')
  assert.match(spaceRule, /outline:\s*[^;]+/i, '.m-space-card:focus-visible must show a visible outline')
  for (const selector of [
    '.dk-provenance > summary:focus-visible',
    '.dk-term-index > summary:focus-visible',
  ]) {
    const rule = cssRule(css, selector)
    assert.ok(rule, `${selector} must have a focus-visible rule`)
    assert.match(rule, /outline:\s*[^;]+/i, `${selector} must show a visible outline`)
  }
})

test('space cards remain native anchors without custom keyboard overrides', () => {
  const start = spaces.indexOf('export function SpaceCard(')
  const end = spaces.indexOf('export function SpaceGrid(', start)
  const component = spaces.slice(start, end)
  assert.match(component, /<a className="m-space-card"[^>]*href=\{href\}>/)
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

test('term table index remains a native keyboard-operable disclosure', () => {
  const start = terms.indexOf('export function TermIndexTable(')
  const end = terms.indexOf('export function TermList(', start)
  const component = terms.slice(start, end)
  assert.match(component, /<details className="dk-term-index">\s*<summary>/)
  assert.doesNotMatch(component, /\b(?:onClick|role|tabIndex)\s*=/)
})

test('loading and error states announce status while empty term states use locale catalog copy', () => {
  // ADR-0017: the state renderer is MoonUI's `PanelState`; Dock keeps only the
  // read resolver and re-exports the shared contract.
  const moonStates = read('../../packages/moonui/src/states.tsx')
  assert.match(moonStates, /role="status"[\s\S]*?aria-live="polite"/)
  assert.match(moonStates, /role="alert"/)
  assert.match(states, /export \{ OutcomePanel, PanelState \} from '@moonwitness\/moonui'/)
  assert.match(reader, /result\.state === 'rights_blocked'[\s\S]*?<div role="alert">[\s\S]*?<Alert tone="hot">/)
  assert.match(terms, /const states = getStatesCopy\(locale\)/)
  assert.match(terms, /title=\{states\.emptyTermsSearchTitle\}/)
  assert.match(terms, /hint=\{states\.emptyTermsSearchHint\}/)
  assert.doesNotMatch(terms, /No term matches that filter|Search matches stable IDs/)
})

test('remaining Dock error surfaces use assertive announcements', () => {
  assert.match(appError, /<div role="alert">\s*<Alert tone="hot">/)
  assert.match(globalError, /<div role="alert">\s*<h2/)
  assert.match(researchPage, /<div role="alert">\s*<Alert tone="hot">/)
  assert.match(comparePage, /<div role="alert">\s*<Alert tone="hot">/)
  assert.match(terms, /<div role="alert">\s*<Alert tone="hot">\s*Deprecated:/)
  assert.match(denpa, /role=\{statusMsg\.tone === 'hot' \? 'alert' : 'status'\}/)
  assert.match(denpa, /aria-live=\{statusMsg\.tone === 'hot' \? 'assertive' : 'polite'\}/)
  assert.match(player, /role=\{streamFault \|\| beacon === 'failed' \? 'alert' : 'status'\}/)
  assert.match(player, /aria-live=\{streamFault \|\| beacon === 'failed' \? 'assertive' : 'polite'\}/)
  assert.match(player, /<span role="status" aria-live="polite">\s*<Badge tone="hot">\{copy\.statusFailoverAmbient\}/)
})
