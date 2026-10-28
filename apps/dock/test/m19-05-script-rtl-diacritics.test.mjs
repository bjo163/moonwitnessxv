/**
 * M19-05 contract: Arabic, Hebrew and Greek keep their script, direction and
 * diacritics in the Corpus Reader.
 *
 * Evidence here is static (source contracts over `src/ui/components/reader.tsx`
 * and `src/data/queries/reader.ts`) plus synthetic Unicode fixtures built from
 * code points. It proves that the reader's `lang`/`dir` attributes are
 * data-driven and that combining marks survive a transport round-trip; it does
 * not prove a browser painted the text, and it carries no scripture text.
 *
 * Negative fixtures mutate the real sources and must fail the same predicates,
 * so a hardcoded direction or a mark-stripping normalisation cannot land green.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(testDir, '..')
// Tracked sources use CRLF in this working tree; every contract below is written
// against LF, so line endings are normalised before matching.
const read = (...segments) =>
  fs.readFileSync(path.resolve(appRoot, ...segments), 'utf8').replace(/\r\n/g, '\n')

const viewSource = read('src', 'ui', 'components', 'reader.tsx')
const querySource = read('src', 'data', 'queries', 'reader.ts')

/** Contract predicates. Each is also run against a mutated source below. */
const contract = {
  /** The source passage takes `lang` and `dir` from the projection, not from a literal. */
  arabicAttributes: (source) =>
    /<p className="dk-reader-arabic" lang=\{result\.arabic\.language\} dir=\{result\.arabic\.direction\}>/.test(
      source,
    ),
  /** The Arabic direction is the literal `'rtl'`; it cannot be 'ltr' or optional. */
  arabicDirectionIsRtl: (source) => /interface ReaderArabic \{[\s\S]*?\n {2}direction: 'rtl'\n\}/.test(source),
  /** The reading order is also stated in words, so meaning does not hang on painting alone. */
  arabicDirectionIsStated: (source) => /\{result\.arabic\.direction\.toUpperCase\(\)\}/.test(source),
  /** A translation row declares its own language and orientation. */
  translationAttributes: (source) =>
    /<p lang=\{row\.languageCode\} dir=\{row\.direction \?\? 'auto'\}>/.test(source),
  /** Legacy rows may carry no recorded direction at all. */
  translationDirectionAllowsNull: (source) =>
    /interface ReaderTranslation \{[\s\S]*?\n {2}direction: 'ltr' \| 'rtl' \| null\n/.test(source),
  /** Text is a JSX child expression: no markup injection, no hand-written entity. */
  textIsRenderedVerbatim: (source) =>
    /\{result\.arabic\.text\}/.test(source) &&
    /\{row\.text\}/.test(source) &&
    !/dangerouslySetInnerHTML/.test(source),
  /** Nothing between projection and DOM may normalise text or strip combining marks. */
  textIsNotNormalised: (source) =>
    !source.includes('.normalize(') && !source.includes('\\p{M}') && !source.includes('\\p{Mn}'),
}

/** Synthetic samples only: three base letters each, carrying their own combining marks. */
const SAMPLES = {
  // ALEF + FATHA, BEH + KASRA, TEH + DAMMA
  arabic: String.fromCodePoint(0x0627, 0x064e, 0x0628, 0x0650, 0x062a, 0x064f),
  // ALEF + PATAH, BET + HIRIQ, GIMEL + HOLAM
  hebrew: String.fromCodePoint(0x05d0, 0x05b7, 0x05d1, 0x05b4, 0x05d2, 0x05b9),
  // ALPHA + COMBINING COMMA ABOVE, BETA, GAMMA + COMBINING ACUTE
  greek: String.fromCodePoint(0x03b1, 0x0313, 0x03b2, 0x03b3, 0x0301),
}

const BIDI_CONTROLS = /[\u202A-\u202E\u2066-\u2069]/
const HTML_ENTITY = /&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#x[0-9a-fA-F]{1,6});/
const MARKS = /\p{M}/gu

const markCount = (value) => (value.match(MARKS) ?? []).length
/** The reader payload crosses JSON, so this is the transport round-trip it must survive. */
const roundTrip = (value) => JSON.parse(JSON.stringify(value))
/** A hostile normaliser of the kind this contract forbids: NFD, then drop every mark. */
const stripMarks = (value) => value.normalize('NFD').replace(MARKS, '')
/** The only fallback the view may use when the row records no direction. */
const declaredDirection = (row) => row.direction ?? 'auto'

test('M19-05: the Arabic source paragraph takes language and direction from the projection', () => {
  assert.ok(contract.arabicAttributes(viewSource), 'lang/dir must read result.arabic.language/direction')
  assert.ok(contract.arabicDirectionIsRtl(querySource), "ReaderArabic.direction must be the literal 'rtl'")
  assert.ok(contract.arabicDirectionIsStated(viewSource), 'the direction must also be stated as text')
  assert.match(querySource, /interface ReaderArabic \{\n {2}text: string\n {2}language: string\n {2}script: string/)
})

test('M19-05: translation rows declare their own language and fall back to auto, never ltr', () => {
  assert.ok(contract.translationAttributes(viewSource), 'a row must use row.languageCode and row.direction')
  assert.ok(
    contract.translationDirectionAllowsNull(querySource),
    'legacy rows keep a null direction instead of a guessed one',
  )
  // A literal direction on the translation paragraph would override Hebrew and Greek rows.
  assert.doesNotMatch(viewSource, /dir="(?:ltr|rtl)"/, 'no text element may pin a literal direction')
  assert.doesNotMatch(viewSource, /\?\?\s*'ltr'|\|\|\s*'ltr'/, 'no fallback may guess ltr')
  // A declared union may mention 'ltr'; a sole 'ltr' type or default is the forbidden shape.
  assert.doesNotMatch(querySource, /direction\??: 'ltr'(?!\s*\|)/, 'no projection may default a direction to ltr')
})

test('M19-05: reader text reaches the DOM verbatim — no markup and no normalisation step', () => {
  assert.ok(contract.textIsRenderedVerbatim(viewSource))
  for (const [name, source] of Object.entries({ 'reader.tsx': viewSource, 'queries/reader.ts': querySource })) {
    assert.ok(contract.textIsNotNormalised(source), `${name} must not normalise or strip marks`)
  }
  // Unicode bidi controls are not needed: direction is an attribute, not invisible characters.
  assert.doesNotMatch(viewSource, BIDI_CONTROLS)
  assert.doesNotMatch(querySource, BIDI_CONTROLS)
})

test('M19-05: Arabic and Hebrew samples keep every combining mark through a transport round-trip', () => {
  for (const [script, sample] of [
    ['arabic', SAMPLES.arabic],
    ['hebrew', SAMPLES.hebrew],
  ]) {
    const received = roundTrip(sample)
    assert.equal(received, sample, `${script} sample must arrive unchanged`)
    assert.deepEqual([...received], [...sample], `${script} code points must not be rewritten`)
    assert.ok(markCount(sample) > 0, `${script} sample must actually carry marks`)
    assert.equal(markCount(received), markCount(sample), `${script} marks must survive the round-trip`)
  }
})

test('M19-05: Greek marks survive, and canonical equivalence is preserved without rewriting', () => {
  const sample = SAMPLES.greek
  const received = roundTrip(sample)
  assert.equal(received, sample)
  assert.equal(markCount(received), markCount(sample))
  // NFC may compose alpha + psili + acute; that is canonical equivalence, not loss.
  assert.equal(sample.normalize('NFC').normalize('NFD'), sample.normalize('NFD'))
  assert.deepEqual(
    [...sample.normalize('NFC').normalize('NFD')],
    [...sample.normalize('NFD')],
    'composing under NFC must reverse under NFD without losing a mark',
  )
})

test('M19-05: the samples need no HTML entity and no bidi control character to display', () => {
  for (const [script, sample] of Object.entries(SAMPLES)) {
    assert.doesNotMatch(sample, BIDI_CONTROLS, `${script} sample must not smuggle bidi controls`)
    assert.doesNotMatch(sample, HTML_ENTITY, `${script} sample must not encode text as entities`)
    assert.ok(!sample.includes('&'), `${script} sample must be plain text`)
  }
})

test('M19-05: a row with direction null falls back to auto, never to a hardcoded ltr', () => {
  assert.equal(declaredDirection({ direction: null }), 'auto')
  assert.equal(declaredDirection({ direction: undefined }), 'auto')
  assert.equal(declaredDirection({}), 'auto')
  assert.equal(declaredDirection({ direction: 'rtl' }), 'rtl')
  assert.equal(declaredDirection({ direction: 'ltr' }), 'ltr')
  assert.notEqual(declaredDirection({ direction: null }), 'ltr')
})

test('M19-05 negative: a hardcoded dir="ltr" on the Arabic paragraph fails the contract', () => {
  const mutated = viewSource.replace(
    'dir={result.arabic.direction}',
    'dir="ltr"',
  )
  assert.notEqual(mutated, viewSource, 'the mutation must actually apply')
  assert.equal(contract.arabicAttributes(mutated), false)
})

test('M19-05 negative: a direction default of ltr fails the contract', () => {
  const rowDefault = viewSource.replace("dir={row.direction ?? 'auto'}", "dir={row.direction ?? 'ltr'}")
  assert.notEqual(rowDefault, viewSource, 'the mutation must actually apply')
  assert.equal(contract.translationAttributes(rowDefault), false)

  for (const mutated of [
    querySource.replace("direction: 'rtl'\n}", "direction: 'ltr'\n}"),
    querySource.replace("direction: 'rtl'\n}", "direction: 'ltr' | 'rtl'\n}"),
  ]) {
    assert.notEqual(mutated, querySource, 'the mutation must actually apply')
    assert.equal(contract.arabicDirectionIsRtl(mutated), false)
  }
})

test('M19-05 negative: a normalisation step that removes combining marks fails the contract', () => {
  const mutated = viewSource.replace(
    '{result.arabic.text}',
    "{result.arabic.text.normalize('NFD').replace(/\\p{M}/gu, '')}",
  )
  assert.notEqual(mutated, viewSource, 'the mutation must actually apply')
  assert.equal(contract.textIsRenderedVerbatim(mutated), false)
  assert.equal(contract.textIsNotNormalised(mutated), false)

  // And the fixture itself detects such a step: it is not a no-op on these samples.
  for (const [script, sample] of Object.entries(SAMPLES)) {
    assert.notEqual(stripMarks(sample), sample, `${script} sample must expose mark stripping`)
    assert.equal(markCount(stripMarks(sample)), 0)
  }
})
