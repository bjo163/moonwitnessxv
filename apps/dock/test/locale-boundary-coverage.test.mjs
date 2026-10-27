/**
 * UI2-G10 contract · the Dock locale boundary and catalogue coverage outside the homepage.
 *
 * Two languages are in play on this app and they are NOT the same axis:
 *   - the UI locale is `id` or `en`, chosen by middleware, carried by
 *     `localeFromMiddlewareHeader`, and printed on `<html lang>`;
 *   - a SOURCE surface (a headword, an alias, a passage, a witness message) keeps
 *     its own language and its own text direction, and must be attributed with
 *     `lang`/`dir` so an Arabic or Hebrew run never inherits the document's LTR
 *     reading order.
 * The DoD reads "id/en per UI, source script retains its own dir; missing-key
 * tests", so this file asserts the boundary, the coverage of the four catalogues,
 * and the key parity — it does not translate anything by itself.
 *
 * These are source contracts, not rendering proofs. The test directory runs
 * `node --experimental-strip-types --test`, which strips types from `.ts` but
 * cannot compile `.tsx`; the only component ever rendered here is `shell.tsx`, via
 * a bespoke transpile in `header-navigation-semantics.test.mjs`. Every claim below
 * therefore names the element and the projected field it is built from, in the
 * same style as `relation-inspector.test.mjs`.
 *
 * Where the hub projection cannot carry a claim, this file asserts the narrower
 * documented rule instead of a detector: `PublicLiveTransmissionsOutput` has
 * neither `language` nor `direction`. The Corpus reader now supplies translation
 * direction explicitly; the Denpa attribution gap remains separate.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { defineLocaleCatalog } from '@moonwitness/core'
import { landingCopy } from '../src/lib/landing-copy.ts'
import { provenanceCopy } from '../src/lib/provenance-copy.ts'
import { readerCopy } from '../src/lib/reader-copy.ts'
import { statesCopy } from '../src/lib/states-copy.ts'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(testDir, '..')
const repoRoot = path.resolve(appRoot, '..', '..')
const read = (...segments) => fs.readFileSync(path.resolve(appRoot, ...segments), 'utf8')
const readRepo = (...segments) => fs.readFileSync(path.resolve(repoRoot, ...segments), 'utf8')

/** Every catalogue the Dock owns, keyed by the `src/lib` file that builds it. */
const CATALOGUES = {
  'landing-copy': landingCopy,
  'provenance-copy': provenanceCopy,
  'reader-copy': readerCopy,
  'states-copy': statesCopy,
}

/** The gate's own surfaces: the reader, terms and denpa pages plus the views they render. */
const AUDITED = [
  'src/app/reader/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/terms/[stableId]/page.tsx',
  'src/app/denpa/page.tsx',
  'src/ui/components/reader.tsx',
  'src/ui/components/reader-rail.tsx',
  'src/ui/components/terms.tsx',
  'src/ui/client/DenpaTransceiver.tsx',
]

/**
 * A value that is legitimately spelled the same in both locales: an Indonesian
 * word identical to English, a citation identifier, or a technical/proper label
 * the product carries verbatim. Anything else that matches across locales is
 * untranslated copy, so the list may only shrink with a decision, not silently grow.
 */
const IDENTICAL_VALUE_EXCEPTIONS = {
  'states-copy': ['formGenre', 'formCitationPlaceholder'],
  'landing-copy': ['shadow', 'stationPinGlobal', 'radar', 'statusDemo'],
  'provenance-copy': [],
  'reader-copy': [],
}

/** Every variable name a catalogue is bound to in a view (`copy`, `states`, `rail`, `provenance`). */
const COPY_BINDINGS = /\bconst (copy|states|rail|provenance) = get(?:States|Provenance|Reader|Landing)Copy\(/g
const COPY_PROP_BINDINGS = /\b(copy|states|rail|provenance): (States|Provenance|Reader|Landing)Copy\b/g

// --- 1 · the catalogue inventory, and its id/en key parity ---------------------

test('UI2-G10 the catalogue inventory is complete: every defineLocaleCatalog file is asserted here', () => {
  const discovered = fs
    .readdirSync(path.resolve(appRoot, 'src', 'lib'))
    .filter((name) => /\.ts$/.test(name))
    .filter((name) => read('src', 'lib', name).includes('defineLocaleCatalog('))
    .map((name) => name.replace(/\.ts$/, ''))
    .sort()

  assert.deepEqual(
    discovered,
    Object.keys(CATALOGUES).sort(),
    'a fifth catalogue is a new locale surface: add it to this audit instead of routing around it',
  )
})

test('UI2-G10 every catalogue exposes identical id and en key sets', () => {
  for (const [name, catalog] of Object.entries(CATALOGUES)) {
    const en = Object.keys(catalog.en).sort()
    const id = Object.keys(catalog.id).sort()
    assert.deepEqual(id, en, `${name}: a key in one locale and not the other renders nothing on a real page`)
    assert.ok(en.length > 0, `${name} must carry copy`)
  }
})

test('UI2-G10 every catalogue value is stated copy in both locales', () => {
  for (const [name, catalog] of Object.entries(CATALOGUES)) {
    for (const key of Object.keys(catalog.en)) {
      for (const locale of ['en', 'id']) {
        const value = catalog[locale][key]
        assert.equal(typeof value, 'string', `${name}.${key} in ${locale} must be a string`)
        assert.ok(value.length > 0, `${name}.${key} in ${locale} must not be empty`)
        assert.doesNotMatch(value, /\[TODO\]|\[TBD\]|\bundefined\b/, `${name}.${key} holds an unresolved placeholder`)
      }
      const same = catalog.en[key] === catalog.id[key]
      const allowed = IDENTICAL_VALUE_EXCEPTIONS[name] ?? []
      assert.ok(
        !same || allowed.includes(key),
        `${name}.${key} is identical in id and en: that is untranslated copy, not a locale`,
      )
    }
  }
})

test('UI2-G10 a key present in one locale and absent in the other fails at construction', () => {
  // The DoD's testable half: parity is enforced where the catalogue is built, so a
  // missing key is a boot failure, not a blank label a visitor finds later.
  assert.throws(
    () => defineLocaleCatalog({ en: { alpha: 'One', beta: 'Two' }, id: { alpha: 'Satu' } }),
    { name: 'TypeError', message: /identical keys/ },
    'a key missing from id must throw',
  )
  assert.throws(
    () => defineLocaleCatalog({ en: { alpha: 'One' }, id: { alpha: 'Satu', beta: 'Dua' } }),
    { name: 'TypeError', message: /identical keys/ },
    'a key missing from en must throw the same way',
  )
  assert.doesNotThrow(() => defineLocaleCatalog({ en: { alpha: 'One' }, id: { alpha: 'Satu' } }))

  // The real catalogues are frozen, so no view can patch a locale in at render time.
  assert.ok(Object.isFrozen(statesCopy.id) && Object.isFrozen(statesCopy.en))
})

test('UI2-G10 every catalogue key a view names resolves in both locales', () => {
  for (const rel of AUDITED) {
    const source = read(...rel.split('/'))
    const catalogues = cataloguesBoundIn(source)
    if (catalogues.length === 0) continue

    for (const key of referencedKeys(source)) {
      const home = catalogues.find(([, catalog]) => key in catalog.en)
      assert.ok(
        home,
        `${rel} renders copy.${key}, which no catalogue it binds carries — the element prints nothing`,
      )
      const [name, catalog] = home
      assert.ok(key in catalog.id, `${name}.${key} exists in en only: an Indonesian page renders undefined`)
      assert.ok(catalog.en[key].length > 0 && catalog.id[key].length > 0, `${name}.${key} must be filled in`)
    }
  }
})

// --- 2 · the UI locale never leaks into a source claim, or the reverse ---------

test('UI2-G10 the document language is always the UI locale, never a source language', () => {
  const LOCALE_SOURCES = {
    // A server render reads the trusted middleware header; a boundary element
    // cannot, so it mirrors the rendered document language instead. Both are the
    // shared helper — neither may pick a source language for the document.
    'src/app/layout.tsx': /localeFromMiddlewareHeader\(requestHeaders\.get\(DOCK_LOCALE_HEADER\)\)/,
    'src/app/global-error.tsx': /useState<Locale>\(clientDockLocale\)|clientDockLocale\(\)/,
  }
  for (const [rel, sourceRule] of Object.entries(LOCALE_SOURCES)) {
    const source = read(...rel.split('/'))
    assert.match(source, /<html lang=\{locale\}>/, `${rel} must print the negotiated locale as the document language`)
    assert.match(source, sourceRule, `${rel} must take its locale from the shared helper`)
    assert.doesNotMatch(source, /<html[^>]*\bdir=/, 'no Dock document may pin a direction for the UI locale')
  }
  // Both supported UI locales are LTR, so a hardcoded direction anywhere in src is a bug.
  const offenders = sourceFiles('src').filter((rel) => /<(p|span|div|dd|li|pre)\b[^>]*\bdir="(ltr|rtl)"/.test(read(rel)))
  assert.deepEqual(offenders, [], 'a fixed dir on a text element would override a source script that has its own')
})

test('UI2-G10 every attributed source span takes both lang and dir from the projection', () => {
  const SPANS = [
    {
      file: 'src/ui/components/terms.tsx',
      what: 'a UNILEX headword keeps its own script',
      span: /<span className="dk-terms-headword" lang=\{form\.languageCode\} dir=\{form\.direction\}>/,
      projection: 'src/data/queries/terms.ts',
      fields: [/export interface TermForm \{[\s\S]*?\n\}/],
    },
    {
      file: 'src/ui/components/terms.tsx',
      what: 'a match-preview surface keeps its own direction',
      span: /<span className="dk-terms-match-raw" lang=\{side\.language \?\? undefined\} dir=\{side\.direction\}>/,
      projection: 'src/data/queries/terms.ts',
      fields: [/direction: 'ltr' \| 'rtl'; language: string \| null/],
    },
    {
      file: 'src/ui/components/constellation.tsx',
      what: 'an ontology alias keeps its own script',
      span: /<span className="dk-terms-alias|<span className="dk-graph-alias-surface" lang=\{alias\.languageCode\} dir=\{alias\.direction\}>/,
      projection: 'src/data/queries/constellation.ts',
      fields: [/export interface GraphAlias \{[\s\S]*?direction: 'ltr' \| 'rtl'/],
    },
    {
      file: 'src/ui/components/reader.tsx',
      what: 'the source passage keeps the direction the corpus states',
      span: /<p className="dk-reader-arabic" lang=\{result\.arabic\.language\} dir=\{result\.arabic\.direction\}>/,
      projection: 'src/data/queries/reader.ts',
      fields: [/export interface ReaderArabic \{[\s\S]*?direction: 'rtl'/],
    },
  ]

  for (const { file, what, span, projection, fields } of SPANS) {
    const source = read(...file.split('/'))
    assert.match(source, span, `${file}: ${what} — the span must carry both attributes`)
    const querySource = read(...projection.split('/'))
    for (const field of fields) {
      assert.match(querySource, field, `${projection} must project the field ${what} is attributed from`)
    }
  }
})

test('UI2-G10 translation direction comes from the authoritative Corpus projection', () => {
  const translations = /export interface ReaderTranslation \{([\s\S]*?)\n\}/.exec(read('src', 'data', 'queries', 'reader.ts'))
  assert.ok(translations, 'ReaderTranslation must stay an exported projection interface')
  assert.match(translations[1], /languageCode: string/, 'the row must keep the language the span is attributed with')
  assert.match(translations[1], /direction: 'ltr' \| 'rtl' \| null/, 'direction is explicit when known and unknown for legacy rows')

  assert.match(
    read('src', 'ui', 'components', 'reader.tsx'),
    /<p lang=\{row\.languageCode\} dir=\{row\.direction \?\? 'auto'\}>/,
    'known direction comes from Corpus and legacy unknown direction uses bidi auto',
  )
  assert.doesNotMatch(sourceFiles('src').map((rel) => read(rel)).join('\n'), /languageCode\s*===\s*['"][^'"]+['"]\s*\?\s*['"](?:rtl|ltr)['"]/, 'Dock must not infer direction from language codes')
})

test('UI2-G10 the Denpa deck renders witness text unattributed and must not guess a language', () => {
  const view = read('src', 'ui', 'client', 'DenpaTransceiver.tsx')
  const messageLine = view.split('\n').findIndex((line) => line.includes('{t.message}'))
  assert.ok(messageLine > 0, 'the feed must render the transmission message')
  const opening = view.split('\n').slice(messageLine - 2, messageLine).join(' ')
  assert.doesNotMatch(opening, /\blang=|\bdir=/, 'GAP: witness text inherits the document direction (see the audit note)')

  // The projection is the reason, and it is asserted from its owner, not from memory.
  const generated = readRepo('packages', 'moonql-client', 'src', 'generated.ts')
  const row = /export interface PublicLiveTransmissionsOutput \{([\s\S]*?)\n\}/.exec(generated)
  assert.ok(row, 'the Denpa feed type must stay an exported projection interface')
  assert.match(row[1], /message: string/)
  assert.doesNotMatch(row[1], /language|direction|script/, 'no language field exists to attribute from; the fix belongs to the hub contract')

  // Honesty clause: the gap may not be papered over with a homegrown detector.
  assert.doesNotMatch(view, /\p{Script=Arabic}|\p{Script=Hebrew}|getComputedStyle|Intl\.Locale|isRTL/iu, 'the Dock must not grow a language detector')

  // The remaining Denpa gap must stay written down where a reviewer can find it.
  const notes = auditNotes()
  assert.ok(notes.length > 0, 'UI2-G10 requires an audit note beside this test')
  assert.match(notes[0], /GAP-DENPA-UNATTRIBUTED/, 'the unattributed witness text must be recorded as a gap, not a pass')
})

// --- 3 · locale prefixes stay the helper's, on the gate's own surfaces --------

test('UI2-G10 no audited surface writes a locale prefix into a link', () => {
  for (const rel of AUDITED) {
    const source = read(...rel.split('/'))
    const code = source
      .split('\n')
      .filter((line) => !/^\s*(\/\/|\/\*|\*)/.test(line))
      .join('\n')
    assert.doesNotMatch(code, /['"`]\/(?:id|en)(?:\/|['"`])/, `${rel} hardcodes a locale segment; localizedDockHref is the only writer`)
    assert.doesNotMatch(code, /\/\$\{locale\}/, `${rel} interpolates a locale into a path instead of calling the helper`)
  }
  // Only the helper and the edge router may build a prefix at all.
  const prefixWriters = sourceFiles('src').filter((rel) => {
    const source = read(rel)
    return /\/\$\{(?:locale|resolution\.locale)\}/.test(source) && !/^\s*(\/\/|\*)/.test(source)
  })
  assert.deepEqual(
    prefixWriters.sort(),
    ['src/lib/locale-context.mjs', 'src/middleware.ts'],
    'a second prefix writer would be a second locale rule nobody audited',
  )
})

test('UI2-G10 each source-bearing view is handed the rendered locale by its route', () => {
  const reader = read('src', 'app', 'reader', 'page.tsx')
  assert.match(reader, /<ReaderView result=\{ready\} citation=\{citation\} copy=\{copy\} locale=\{locale\} \/>/)
  assert.match(reader, /<ReaderContentsRail[\s\S]*?locale=\{locale\}/)
  assert.match(reader, /<ReaderRecordRail result=\{result\} browse=\{browse\} locale=\{locale\} \/>/)

  const terms = read('src', 'app', 'terms', 'page.tsx')
  assert.match(terms, /<TermIndexTable page=\{termsPage\} locale=\{locale\} \/>/)
  assert.match(terms, /<TermList page=\{termsPage\} locale=\{locale\} \/>/)

  const detail = read('src', 'app', 'terms', '[stableId]', 'page.tsx')
  assert.match(detail, /<TermDetailView detail=\{detail\} locale=\{locale\} \/>/)

  const denpa = read('src', 'app', 'denpa', 'page.tsx')
  assert.match(denpa, /<DenpaTransceiver initialTransmissions=\{transmissions\} stations=\{stations\} locale=\{locale\} \/>/)

  // The form-chip list renders headwords, so it must receive the locale too.
  const view = read('src', 'ui', 'components', 'terms.tsx')
  assert.match(view, /function FormChips\(\{ forms, locale,/, 'FormChips renders source forms and an empty-state sentence')
  assert.match(view, /<FormChips forms=\{term\.forms\} locale=\{locale\} compact \/>/)
  assert.match(view, /<FormChips forms=\{detail\.forms\} locale=\{locale\} \/>/)
})

// --- 4 · catalogue coverage outside the homepage ------------------------------

test('UI2-G10 the Reader route takes its citation form from the states catalogue', () => {
  const source = read('src', 'app', 'reader', 'page.tsx')
  for (const key of [
    'formCitation',
    'formCitationHint',
    'formCitationPlaceholder',
    'formEdition',
    'formEditionHint',
    'formReadSource',
    'formComparativeWorkbench',
  ]) {
    assert.match(source, new RegExp(`\\bcopy\\.${key}\\b`), `the Reader form must render ${key} from the catalogue`)
    assert.ok(
      statesCopy.en[key] !== statesCopy.id[key] || IDENTICAL_VALUE_EXCEPTIONS['states-copy'].includes(key),
      `${key} must be translated for the /id route to differ, or be a documented same-spelling label`,
    )
  }
})

test('UI2-G10 the terms views take their empty-state sentences from the states catalogue', () => {
  const source = read('src', 'ui', 'components', 'terms.tsx')
  for (const key of [
    'emptyTermsTitle',
    'emptyTermsSubtitle',
    'emptyTermsSearchTitle',
    'emptyTermsSearchHint',
    'emptyFormsRecorded',
    'emptySensesRecorded',
  ]) {
    assert.ok(
      new RegExp(`\\b(?:copy|states)\\.${key}\\b`).test(source),
      `terms.tsx must show ${key} through the catalogue, not typed out`,
    )
    assert.notEqual(statesCopy.en[key], statesCopy.id[key], `${key} must be translated, not copied`)
  }
  assert.match(source, /import \{ getStatesCopy \} from '@\/lib\/states-copy'/)
  assert.match(
    read('src', 'ui', 'components', 'reader.tsx'),
    /\b(?:rail|copy)\.unresolvedEdition\b/,
    'the edition-unresolved fallback is UI copy, and reader-copy already owns the sentence',
  )
})

test('UI2-G10 no audited surface still types out a sentence a catalogue owns', () => {
  for (const rel of AUDITED) {
    const source = read(...rel.split('/'))
    for (const line of source.split('\n')) {
      if (/\b(?:copy|states|rail|provenance)\.[A-Za-z]/.test(line)) continue
      for (const [name, catalog] of Object.entries(CATALOGUES)) {
        for (const [key, value] of Object.entries(catalog.en)) {
          if (value.length < 8) continue
          const quoted = [`"${value}"`, `'${value}'`, `>${value}<`, `\`${value}\``]
          const hit = quoted.some((form) => line.includes(form))
          assert.ok(!hit, `${rel} repeats ${name}.${key} as a literal; the catalogue is the writer of that sentence`)
        }
      }
    }
  }
})

/** The catalogues a file binds, by constructor call or by a typed prop. */
function cataloguesBoundIn(source) {
  const names = new Set()
  for (const match of source.matchAll(COPY_BINDINGS)) names.add(match[1])
  for (const match of source.matchAll(COPY_PROP_BINDINGS)) names.add(match[1])
  const entries = Object.entries(CATALOGUES)
  const getters = [...source.matchAll(/get(States|Provenance|Reader|Landing)Copy\(/g)].map((match) => match[1].toLowerCase())
  const types = [...source.matchAll(/(States|Provenance|Reader|Landing)Copy\b/g)].map((match) => match[1].toLowerCase())
  const wanted = new Set([...getters, ...types])
  if (wanted.size === 0) return entries.map(([, catalog]) => ['all', catalog])
  return entries.filter(([name]) => wanted.has(name.replace(/-copy$/, '')) || wanted.has(name))
}

/** Every `copy.KEY`-style reference in a file, ignoring another object of the same shape. */
function referencedKeys(source) {
  const keys = new Set()
  for (const match of source.matchAll(/\b(?:copy|states|rail|provenance)\.([A-Za-z][A-Za-z0-9_]*)\b/g)) keys.add(match[1])
  return [...keys]
}

/** All Dock source files under a repo-relative directory, as `src/ui/components/x.tsx`. */
function sourceFiles(relDir) {
  const out = []
  const walk = (absDir, relPrefix) => {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) walk(path.join(absDir, entry.name), rel)
      else if (/\.(ts|tsx|mjs)$/.test(entry.name)) out.push(rel)
    }
  }
  walk(path.resolve(appRoot, relDir), relDir)
  return out
}

/** The UI2-G10 audit note, found by name so its SHA suffix stays irrelevant. */
function auditNotes() {
  const dir = path.resolve(repoRoot, 'docs', 'audit')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((name) => /^ui2-g10-locale-boundary-[0-9a-f]+\.md$/.test(name))
    .map((name) => fs.readFileSync(path.join(dir, name), 'utf8'))
}
