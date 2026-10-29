/**
 * UI-P05b contract: the Corpus Reader's accessible static structure.
 *
 * Reference screen 05 asks for a WORKS / CONTENTS rail (source catalog, editions,
 * passage index, translations, citation export) and a provenance rail that states
 * EDITION / RIGHTS / LANGUAGE / INTERPRETATION / EXPORT. The D1 audit
 * (docs/audit/ui-screen-audits-d54ad43.md §3.5) recorded that none of those five
 * panels existed and that two of the five status rows were missing or implicit.
 * These assertions are source contracts over the real route and view files — they
 * prove the structure and its labelling, not that a browser painted it.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { readerCopy } from '../src/lib/reader-copy.ts'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(testDir, '..')
const read = (...segments) => fs.readFileSync(path.resolve(appRoot, ...segments), 'utf8')

const railSource = read('src', 'ui', 'components', 'reader-rail.tsx')
const pageSource = read('src', 'app', 'reader', 'page.tsx')
const viewSource = read('src', 'ui', 'components', 'reader.tsx')
const querySource = read('src', 'data', 'queries', 'reader.ts')
const css = read('src', 'app', 'globals.css')

/** The five groups reference screen 05 names, in the catalogue keys that back them. */
const RAIL_GROUPS = [
  ['railSourceCatalog', 'dk-reader-rail-works'],
  ['railEditions', 'dk-reader-rail-editions'],
  ['railPassageIndex', 'dk-reader-rail-passages'],
  ['railTranslations', 'dk-reader-rail-translations'],
  ['railCitationExport', 'dk-reader-rail-export'],
]

test('UI-P05b: the contents rail really renders all five reference panels', () => {
  for (const [key, headingId] of RAIL_GROUPS) {
    assert.match(
      railSource,
      new RegExp(`headingId="${headingId}"[\\s\\S]{0,120}title=\\{copy\\.${key}\\}`),
      `the ${key} panel must be a labelled rail group with id ${headingId}`,
    )
    assert.ok(readerCopy.en[key] !== undefined && readerCopy.id[key] !== undefined, `${key} must exist in both locales`)
  }
})

test('UI-P05b: every rail group is named by the heading it is labelled with', () => {
  assert.match(railSource, /<section className="dk-reader-rail-group" aria-labelledby=\{headingId\}>/)
  assert.match(railSource, /<h3 id=\{headingId\} className="dk-reader-rail-heading">/)
  // the nav takes its name from its own heading, so a screen reader gets one title, not two
  assert.match(railSource, /<nav className="dk-reader-rail" aria-labelledby="dk-reader-rail-title">/)
  assert.match(railSource, /<h2 id="dk-reader-rail-title" className="dk-reader-rail-title">/)
  assert.doesNotMatch(railSource, /<nav className="dk-reader-rail" aria-label=\{[^}]+\\} aria-labelledby=/)
})

test('UI-P05b: heading levels stay ordered on the route — h1 page, h2 panels, h3 groups', () => {
  const levels = (source) =>
    [...source.matchAll(/<h([1-6])(\s|>)/g)].map((match) => Number(match[1])).sort((a, b) => a - b)
  // PageHeader supplies the single h1 from MoonUI; the route must not add another.
  assert.deepEqual(levels(pageSource), [], 'the route itself must not hand-author a heading')
  assert.deepEqual(levels(railSource), [2, 3], 'the rail is one h2 title over its h3 groups')
  assert.match(css, /\.dk-reader-rail-title\s*\{/)
  assert.match(css, /\.dk-reader-rail-heading\s*\{/)
})

test('UI-P05b: a row with no defensible target stays a row instead of becoming a dead link', () => {
  const worksBlock = railSource.slice(railSource.indexOf('railSourceCatalog'), railSource.indexOf('copy.railEditions'))
  const translationsBlock = railSource.slice(
    railSource.indexOf('copy.railTranslations'),
    railSource.indexOf('copy.railCitationExport'),
  )
  for (const [label, block] of [['source catalog', worksBlock], ['translations', translationsBlock]]) {
    assert.ok(!block.includes('<a '), `the ${label} rows carry no address the hub can resolve, so they must not link`)
  }
  // editions and addresses DO have a resolvable target: the same citation in that edition
  assert.match(railSource, /href=\{addressHref\(href, browse\.citation, edition\.code, browse\.edition\)}/)
  assert.match(railSource, /href=\{addressHref\(href, passage\.citationKey, passage\.editionCode, browse\.edition\)}/)
  assert.match(railSource, /const edition = editionCode \?\? currentEdition/)
})

test('UI-P05b: rail links are locale-bound through the single prefix writer, and the export row is an in-page anchor', () => {
  assert.match(railSource, /const href = dockHrefFor\(locale\)/)
  assert.match(railSource, /return href\('\/reader', `\?\$\{params\.toString\(\)\}`\)/)
  assert.match(railSource, /href=\{href\('\/reader', '', '#reader-citation'\)\}/)
  assert.doesNotMatch(railSource, /['"]\/id\b|['"]\/en\b|`\$\{locale\}/, 'a rail link must never name a locale itself')
  assert.match(viewSource, /<div id="reader-citation" className="dk-reader-export-anchor">/)
})

test('UI-P05b: an address row that is on screen says so, and the active edition is marked', () => {
  assert.match(
    railSource,
    /aria-current=\{passage\.citationKey === browse\.citation \? 'true' : undefined\}/,
  )
  assert.match(railSource, /selected=\{edition\.code === selectedEditionCode\}/)
  assert.match(railSource, /\{selected \? <Badge tone="cyan">\{copy\.editionSelected\}<\/Badge> : null\}/)
})

test('UI-P05b: the rails are metadata-only — no text field exists to render', () => {
  for (const source of [querySource, railSource]) {
    assert.doesNotMatch(source, /arabicText|translationText/, 'the browse surface must not carry source text')
  }
  assert.match(querySource, /export async function readBrowse/)
  assert.match(querySource, /serverClient\(\)\.call<BrowseResult>\('\/corpus\/browse'/)
  // the only text-bearing read stays the rights-vetoed reader projection
  assert.match(querySource, /serverClient\(\)\.call<ReaderResult>\('\/corpus\/reader'/)
})

test('UI-P05b: the reading record states all five governed statuses', () => {
  for (const key of ['rowEdition', 'rowRights', 'rowLanguage', 'rowInterpretation', 'rowExport']) {
    assert.match(railSource, new RegExp(`\\{copy\\.${key}\\}</dt>`), `${key} must be a named row`)
    assert.ok(readerCopy.en[key] !== undefined && readerCopy.id[key] !== undefined, `${key} needs both locales`)
  }
  assert.match(railSource, /<dl className="dk-reader-record">/)
  assert.match(railSource, /<dt>\{copy\.rowEdition\}<\/dt>/)
  assert.match(railSource, /copy\.editionUnselected/)
  // rights wording is the shared vocabulary, never a local re-spelling
  assert.match(railSource, /import \{ getProvenanceCopy, rightsLabel \} from '@\/lib\/provenance-copy'/)
  assert.match(railSource, /\{rightsLabel\(rightsStatus, locale\)\}/)
})

test('UI-P05b: the hub keeps its own explanation — an unregistered interpretation lane is stated, not glossed', () => {
  assert.match(
    railSource,
    /browse\.interpretation\.available[\s\S]{0,40}\?[\s\S]{0,40}copy\.interpretationRegistered[\s\S]{0,40}:[\s\S]{0,40}copy\.interpretationNone/,
  )
  assert.match(railSource, /<span className="dk-reader-record-reason">\{browse\.interpretation\.reason\}<\/span>/)
  assert.match(railSource, /<span className="dk-reader-record-reason">\{browse\.export\.reason\}<\/span>/)
  assert.match(railSource, /browse\.export\.textExportAllowed/)
})

test('UI-P05b: the rails survive a withheld passage — the contents read is independent of the text read', () => {
  assert.match(pageSource, /const \[outcome, browseOutcome\] = await Promise\.all\(\[/)
  assert.match(pageSource, /readPanel\(\s*\(\) => readBrowse\(citation, edition\),/)
  assert.match(pageSource, /browseIsEmpty,/, 'an empty corpus inventory is stated as empty, not rendered as a blank panel')
  // the record rail tolerates a failed browse read and says the rows are not stated
  assert.match(railSource, /browse: BrowseResult \| null/)
  assert.match(railSource, /browse === null[\s\S]{0,40}\?[\s\S]{0,40}copy\.browseUnavailable/)
  assert.match(pageSource, /<ReaderRecordRail result=\{result\} browse=\{browse\} locale=\{locale\} \/>/)
})

test('UI-P05b: reading order puts the passage before the browse list on a narrow screen', () => {
  const main = pageSource.indexOf('<div className="dk-reader-main">')
  const contents = pageSource.indexOf('<ReaderContentsRail')
  const record = pageSource.indexOf('<ReaderRecordRail')
  assert.ok(main !== -1 && contents !== -1 && record !== -1, 'the three layout regions must exist')
  assert.ok(main < contents, 'the passage column precedes the contents rail in DOM order')
  assert.ok(contents < record, 'the reading record is the last region')
  assert.match(css, /\.dk-reader-layout\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1\.7fr\) minmax\(0, 200px\) minmax\(0, 230px\)/)
  assert.match(css, /@media \(max-width: 900px\) \{\s*\.dk-reader-layout \{\s*grid-template-columns: 1fr;/)
})

test('M19-07: the passage column owns its space and only splits when the column can host both panes', () => {
  // A fixed-width export track inside a narrower reading column collapsed the
  // passage to 0 px at 1440 px; the default must be a single content column.
  assert.match(css, /\.dk-reader-grid\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\);/)
  assert.match(css, /@container \(min-width: 640px\) \{\s*\.dk-reader-grid \{/)
  assert.match(css, /\.dk-reader-main\s*\{[^}]*min-width: 0;[^}]*container-type: inline-size;/)
})

test('UI-P05b: rail rows are keyboard-visible and use tokens, not one-off colours', () => {
  assert.match(css, /\.dk-reader-rail-link:hover,\s*\.dk-reader-rail-link:focus-visible \{\s*outline: 2px solid var\(--cyan\)/)
  const railBlock = css.slice(css.indexOf('.dk-reader-rail {'), css.indexOf('.dk-reader-record {'))
  assert.match(railBlock, /var\(--border\)/)
  assert.match(railBlock, /var\(--surface\)/)
  assert.doesNotMatch(railBlock, /#[0-9a-f]{3,6}\b/i, 'the rail must paint with tokens only')
})

test('UI-P05b: the rail catalogue is 1:1 between en and id', () => {
  const enKeys = Object.keys(readerCopy.en).sort()
  const idKeys = Object.keys(readerCopy.id).sort()
  assert.deepEqual(idKeys, enKeys, 'every rail label needs both locales or the view renders English in an Indonesian page')
  assert.ok(enKeys.length >= 30, `the rail vocabulary should be substantial, got ${enKeys.length}`)
  assert.equal(readerCopy.id.railTitle, 'Karya / Isi')
  assert.equal(readerCopy.en.editionUnselected, 'UNSELECTED')
})
