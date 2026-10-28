/**
 * UI-P06c contract · the ontology↔UNILEX bridge on `/constellation`.
 *
 * `docs/audit/ui-screen-audits-d54ad43.md` §4.5 named this the single
 * highest-value P06c item: `onto_entities.unilexStableId` is the only
 * cross-namespace key the projections carry, and the node card printed it as
 * inert text while `/terms/[stableId]` was the route that could actually open
 * it. A reader looking at an ACTOR node had no way to reach the term it maps to,
 * and a reader looking at a term had no way back.
 *
 * The contract below is deliberately narrow. It proves the bridge is a real,
 * locale-carrying link, that it only appears when the mapping exists, and that
 * it did not need a new stylesheet hook or a second projection — the node
 * payload already carried `unilexStableId` before this change.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(testDir, '..')
const read = (...segments) => fs.readFileSync(path.resolve(appRoot, ...segments), 'utf8')

const viewSource = read('src', 'ui', 'components', 'constellation.tsx')
const querySource = read('src', 'data', 'queries', 'constellation.ts')
const projectionSource = read('src', 'data', 'queries', 'graph-projection.ts')
const css = read('src', 'app', 'globals.css')

function nodeCard(source, signature) {
  const start = source.indexOf(signature)
  assert.notEqual(start, -1, `${signature} must exist`)
  const rest = source.slice(start)
  const end = rest.search(/\n\}(?=\n)/)
  return end === -1 ? rest : rest.slice(0, end + 2)
}

const nodeCardSource = nodeCard(viewSource, 'function NodeCard(')

test('UI-P06c the UNILEX key on a constellation node is a link, not printed text', () => {
  assert.match(
    nodeCardSource,
    /href=\{localeHref\(`\/terms\/\$\{node\.unilexStableId\}`\)\}/,
    'the mapping must open the term route that already exists',
  )
  assert.match(nodeCardSource, /const localeHref = dockHrefFor\(locale\)/)
  assert.match(viewSource, /import \{ dockHrefFor \} from '@\/lib\/locale-context\.mjs'/)
  assert.match(
    nodeCardSource,
    /aria-label=\{`Open the UNILEX entry \$\{node\.unilexStableId\}`\}/,
    'the link text is a bare code, so its accessible name must say what it opens',
  )
  // The prefix is written by the locale seam and nowhere else.
  assert.doesNotMatch(nodeCardSource, /href=["'`]\/(?:id|en)\//, 'no hardcoded locale prefix in a component href')
})

test('UI-P06c the bridge appears only when the projection actually carries a mapping', () => {
  assert.match(nodeCardSource, /\{node\.unilexStableId \? \(/)
  assert.match(nodeCardSource, /no term mapping/, 'an unmapped node says so instead of rendering a dead link')
  assert.match(projectionSource, /unilexStableId: string \| null/, 'the null branch is the projected shape, not a local guess')
  assert.doesNotMatch(nodeCardSource, /href=\{localeHref\(`\/terms\/`\)\}/, 'an empty stable id must never build a bare /terms href')
})

test('UI-P06c the bridge reuses an existing link hook and adds no second data owner', () => {
  assert.match(nodeCardSource, /className="dk-graph-source-link"/)
  assert.match(css, /\.dk-graph-source-link\s*\{/, 'the reused hook must exist in the Dock stylesheet')
  assert.match(css, /\.dk-graph-source-link:hover,\s*\.dk-graph-source-link:focus-visible/)
  // One endpoint, unchanged: the node card links with data it already had.
  const endpoints = [...querySource.matchAll(/\.call<\w+>\(\s*[`'"]([^`'"?]+)[^`'"]*[`'"]/g)].map((m) => m[1])
  assert.deepEqual([...new Set(endpoints)], ['/ontology/constellation'])
})
