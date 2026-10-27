import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.resolve(testDir, '..')
const termsComponent = fs.readFileSync(
  path.resolve(appDir, 'src', 'ui', 'components', 'terms.tsx'),
  'utf8',
)
const termsPage = fs.readFileSync(
  path.resolve(appDir, 'src', 'app', 'terms', 'page.tsx'),
  'utf8',
)
const css = fs.readFileSync(path.resolve(appDir, 'src', 'app', 'globals.css'), 'utf8')

test('the terms page exposes a keyboard-reachable table index', () => {
  assert.match(termsPage, /import \{ MatchPreviewView, TermIndexTable, TermList \} from '@\/ui\/components\/terms'/)
  assert.match(
    termsPage,
    /<TermIndexTable page=\{termsPage\} locale=\{locale\} \/>\s+<TermList page=\{termsPage\} locale=\{locale\} \/>/,
    'the index and the list must receive the rendered locale, never default to English',
  )
})

test('the index is a native disclosure over MoonUI DataTable, not a custom widget', () => {
  const start = termsComponent.indexOf('export function TermIndexTable')
  const end = termsComponent.indexOf('export function TermList')
  assert.ok(start > -1 && end > start, 'TermIndexTable must exist before TermList')
  const index = termsComponent.slice(start, end)
  assert.match(index, /<details className="dk-term-index">/)
  assert.match(index, /<summary>/)
  assert.match(index, /<DataTable/)
  assert.match(index, /rowKey=\{\(row\) => row\.stableId\}/)
  assert.doesNotMatch(index, /onClick|role="button"|tabIndex=/, 'no custom keyboard handling is needed')
})

test('the index lists the evidence columns a reader needs to judge a term', () => {
  const start = termsComponent.indexOf('export function TermIndexTable')
  const end = termsComponent.indexOf('export function TermList')
  const index = termsComponent.slice(start, end)
  for (const column of ['Stable ID', 'Indonesian', 'Lane', 'Status', 'Senses', 'Sources', 'Relations']) {
    assert.ok(index.includes(`label: '${column}'`), `index must show a ${column} column`)
  }
  assert.match(
    index,
    /localeHref\(`\/terms\/\$\{row\.stableId\}`\)/,
    'rows must link to the stable-id route through the locale helper',
  )
})

test('the index summary states its own scope and the empty state is explicit', () => {
  const start = termsComponent.indexOf('export function TermIndexTable')
  const end = termsComponent.indexOf('export function TermList')
  const index = termsComponent.slice(start, end)
  assert.match(index, /Table index · \{page\.terms\.length\} of \{page\.total\} terms on this page/)
  assert.match(index, /empty=\{\n?\s*<EmptyState/)
  assert.match(css, /\.dk-term-index > summary:focus-visible \{[^}]*outline: 2px solid var\(--cyan\)/)
})
