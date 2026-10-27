/**
 * UI-F15 contract: provenance, cited passage, edition, rights and review labels
 * survive into every public Dock view.
 *
 * The defect this replaces was four near-identical "source evidence" blocks that
 * had drifted apart: each one dropped the rows it had no value for, so a missing
 * citation, provenance SHA, source URI or approval note was invisible rather than
 * explicitly unrecorded, and only the Terms view ever showed the approval note.
 * The rows now come from one shared component, and the words naming them come
 * from one locale catalogue.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { provenanceCopy, getProvenanceCopy, reviewLabel, rightsLabel } from '../src/lib/provenance-copy.ts'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(testDir, '..')
const read = (...segments) => fs.readFileSync(path.resolve(appRoot, ...segments), 'utf8')

const component = (name) => read('src', 'ui', 'components', name)
const evidenceSource = component('provenance.tsx')
const readerSource = component('reader.tsx')

const VIEWS = [
  { file: 'src/ui/components/actors.tsx', prefix: 'dk-actors' },
  { file: 'src/ui/components/constellation.tsx', prefix: 'dk-graph' },
  { file: 'src/ui/components/graph-relation.tsx', prefix: 'dk-graph' },
  { file: 'src/ui/components/terms.tsx', prefix: 'dk-terms' },
]

for (const view of VIEWS) {
  test(`UI-F15 ${view.file} renders its source evidence through the shared block`, () => {
    const source = component(path.basename(view.file))
    assert.match(
      source,
      /import \{ SourceEvidence \} from '\.\/provenance'/,
      `${view.file} must import the shared evidence block`,
    )
    assert.match(
      source,
      new RegExp(`<SourceEvidence[\\s\\S]{0,160}?locale=\\{locale\\}[\\s\\S]{0,160}?classPrefix="${view.prefix}"`),
      `${view.file} must pass the rendered locale and its own class prefix`,
    )
    // The drifted hand-rolled blocks are the regression: a row that appears only
    // when a value exists is a row that hides missing provenance.
    assert.doesNotMatch(source, /function SourceLine\b/, `${view.file} must not keep a private SourceLine`)
    assert.doesNotMatch(source, /function SourceBlock\b/, `${view.file} must not keep a private SourceBlock`)
    assert.doesNotMatch(source, /UNKNOWN_TYPE/, `${view.file} must use the catalogue fallback, not a local one`)
  })
}

test('UI-F15 no public view keeps a private rights or review label map', () => {
  for (const name of fs.readdirSync(path.resolve(appRoot, 'src', 'ui', 'components'))) {
    const source = component(name)
    assert.doesNotMatch(source, /RIGHTS_LABEL/, `${name} must not declare its own rights label map`)
    assert.doesNotMatch(source, /REVIEW_LABEL/, `${name} must not declare its own review label map`)
  }
  assert.match(
    readerSource,
    /import \{ rightsLabel \} from '@\/lib\/provenance-copy'/,
    'the Reader names rights through the shared catalogue',
  )
  const terms = component('terms.tsx')
  assert.match(
    terms,
    /import \{ getProvenanceCopy, reviewLabel \} from '@\/lib\/provenance-copy'/,
    'Terms names the source review status through the shared catalogue',
  )
})

test('UI-F15 the provenance catalogue carries identical en and id key sets', () => {
  const englishKeys = Object.keys(provenanceCopy.en).sort()
  const indonesianKeys = Object.keys(provenanceCopy.id).sort()
  assert.ok(englishKeys.length >= 15, 'the catalogue must name every evidence row, right and review status')
  assert.deepEqual(indonesianKeys, englishKeys, 'en and id must expose the same keys')

  for (const key of englishKeys) {
    const en = provenanceCopy.en[key]
    const id = provenanceCopy.id[key]
    assert.ok(typeof en === 'string' && en.length > 0, `${key} must carry English copy`)
    assert.ok(typeof id === 'string' && id.length > 0, `${key} must carry Indonesian copy`)
    assert.doesNotMatch(en, /\[TODO\]|\[TBD\]|undefined|null/, `${key} holds an unresolved placeholder`)
    // Every value here is a phrase of human wording, so an Indonesian entry that
    // repeats the English string is untranslated copy, not a locale.
    assert.notEqual(id, en, `${key} must be translated into Indonesian, not copied from English`)
  }

  assert.equal(getProvenanceCopy('en').fieldCitation, 'Cited passage')
  assert.equal(getProvenanceCopy('id').fieldCitation, 'Kutipan yang dirujuk')
  assert.equal(getProvenanceCopy('id').unrecorded, 'BELUM TERCATAT')
})

test('UI-F15 every rights and review status in the projections has a label in both locales', () => {
  const rights = [
    'RIGHTS_EXACT_VERSION_CLEARED',
    'RIGHTS_UNKNOWN',
    'METADATA_ONLY',
    'RESTRICTED',
    'PUBLIC_DOMAIN',
  ]
  for (const status of rights) {
    const en = rightsLabel(status, 'en')
    const id = rightsLabel(status, 'id')
    assert.notEqual(en, status, `${status} must be named in words, not emitted as a bare code`)
    assert.notEqual(id, en, `${status} must have Indonesian wording`)
    assert.notEqual(id, status, `${status} must be translated, not left as the code`)
  }

  const review = ['PROPOSED', 'SOURCE_CHECKED', 'APPROVED_FOR_CITATION', 'DEPRECATED']
  for (const status of review) {
    assert.notEqual(reviewLabel(status, 'en'), status, `${status} must be named in words`)
    assert.notEqual(reviewLabel(status, 'id'), reviewLabel(status, 'en'), `${status} must have Indonesian wording`)
  }
  assert.equal(reviewLabel(null, 'en'), provenanceCopy.en.reviewUnreviewed)
  assert.equal(reviewLabel(undefined, 'id'), provenanceCopy.id.reviewUnreviewed)
})

test('UI-F15 an unknown status renders the raw code, never an empty string', () => {
  for (const locale of ['en', 'id']) {
    assert.equal(rightsLabel('RIGHTS_HYPOTHETICAL_FUTURE_STATE', locale), 'RIGHTS_HYPOTHETICAL_FUTURE_STATE')
    assert.equal(rightsLabel('', locale), '', 'an empty code is not a status; nothing may be invented for it')
    assert.equal(reviewLabel('SOME_NEW_REVIEW_STATE', locale), 'SOME_NEW_REVIEW_STATE')
  }
})

test('UI-F15 the shared block never renders a value-less row', () => {
  for (const field of ['citation', 'provenanceSha', 'approvalNote']) {
    assert.doesNotMatch(
      evidenceSource,
      new RegExp(`\\{source\\.${field} \\?`),
      `${field} must not be conditionally dropped when it is absent`,
    )
  }
  assert.match(evidenceSource, /\{copy\.fieldCitation\}: \{shown\(source\.citation\)\}/)
  assert.match(evidenceSource, /shown\(source\.provenanceSha\)/)
  assert.match(evidenceSource, /shown\(source\.approvalNote\)/)
  // The URI row may only switch between a link and the explicit unrecorded word.
  assert.match(
    evidenceSource,
    /source\.sourceUri \? \([\s\S]*?<a[\s\S]*?\) : \(\s*copy\.unrecorded\s*\)/,
    'a missing source URI must state the unrecorded word instead of vanishing',
  )
  assert.match(evidenceSource, /reviewLabel\(source\.reviewStatus, locale\)/)
  assert.match(evidenceSource, /rel="noreferrer noopener" target="_blank"/)
  assert.match(evidenceSource, /aria-label=\{copy\.provenanceShaAria\}/)
  assert.match(provenanceCopy.en.provenanceShaAria, /SHA-256/)
})

test('UI-F15 the shared block stays a server component: no next import, no function props', () => {
  assert.doesNotMatch(evidenceSource, /from ['"]next/, 'a source block must not reach into the router')
  assert.doesNotMatch(evidenceSource, /use client/, 'source evidence is rendered on the server, not hydrated')
  const props = /export interface SourceEvidenceProps \{([\s\S]*?)\n\}/.exec(evidenceSource)
  assert.ok(props, 'the block must declare its props as a data-only interface')
  assert.doesNotMatch(props[1], /=>/, 'a function-valued prop would crash its Server Component host')
  assert.deepEqual(
    [...props[1].matchAll(/^\s{2}(\w+)\??:/gm)].map((match) => match[1]).sort(),
    ['classPrefix', 'locale', 'source'],
  )
})

test('UI-F15 a relation detail page hands its rendered locale to the view that names provenance', () => {
  const page = read('src', 'app', 'constellation', 'relations', '[relationCode]', 'page.tsx')
  assert.match(page, /<RelationDetailView detail=\{detail\} locale=\{locale\} \/>/)
})

test('UI-F15 views use only the class names their own stylesheet already defines', () => {
  const css = read('src', 'app', 'globals.css')
  for (const hook of [
    'dk-actors-source',
    'dk-actors-citation',
    'dk-actors-hash',
    'dk-actors-source-link',
    'dk-graph-source',
    'dk-graph-citation',
    'dk-graph-hash',
    'dk-graph-source-link',
    'dk-terms-source',
    'dk-terms-citation',
    'dk-terms-hash',
    'dk-terms-source-link',
  ]) {
    assert.match(css, new RegExp(`\\.${hook}[\\s,{:]`), `${hook} must exist so the shared block adds no new CSS`)
  }
  assert.doesNotMatch(evidenceSource, /#[0-9a-f]{3,6}\b/i, 'the shared block must not name a color')
})
