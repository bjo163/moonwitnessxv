#!/usr/bin/env node
/**
 * M25-06 validator — comparative-cosmos tradition-context ledger.
 *
 * Dependency-free. Reads docs/data/M25-06-cosmos-tradition-context.json, every
 * cited repository line, and nothing else. No network. No writes.
 *
 * What it enforces:
 *   1. every EVIDENCED/PARTIAL row resolves a repository locator and its short
 *      verbatim quote appears on that exact line;
 *   2. ABSENT rows carry no locator and no evidence kind but NONE;
 *   3. NEEDS_SOURCE rows state what is missing (a non-trivial `missing` string);
 *   4. every claimType is one of PHYSICAL_READING / SIMULATION / ASTRONOMY /
 *      STORY, every tradition is in the declared enum, and all four claim types
 *      appear at least once;
 *   5. no row mixes categories: a STORY row may not carry instrument, model or
 *      astronomy evidence; an ASTRONOMY row may not cite scripture or corpus
 *      metadata; a scripture tradition is STORY only; no statement may assert a
 *      measurement/proof from a scriptural text;
 *   6. declared tallies (total, by status, claim type, tradition, evidence kind)
 *      equal the row counts, so a silent edit is detected.
 *
 * A category is a label, not a truth verdict. The validator proves that this
 * repository's own evidence is cited honestly; it does not prove the accuracy of
 * any published translation, commentary, history or astronomical value.
 *
 * Usage:
 *   node scripts/check-m25-06-cosmos-tradition-context.mjs
 *   node scripts/check-m25-06-cosmos-tradition-context.mjs --self-test
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const DATA_FILE = path.join(ROOT, 'docs', 'data', 'M25-06-cosmos-tradition-context.json')

const TASK = 'M25-06'
const STATUSES = ['EVIDENCED', 'PARTIAL', 'NEEDS_SOURCE', 'ABSENT']
const CLAIM_TYPES = ['PHYSICAL_READING', 'SIMULATION', 'ASTRONOMY', 'STORY']
const TRADITIONS = [
  'islamic-quran',
  'islamic-commentary',
  'historical-near-east',
  'abrahamic-torah',
  'abrahamic-zabur',
  'abrahamic-injil',
  'modern-astronomy',
  'comparative-method',
]
const EVIDENCE_KINDS = [
  'CORPUS_METADATA',
  'SCRIPTURE_TEXT',
  'COMMENTARY_TEXT',
  'HISTORICAL_RECORD',
  'PROJECT_POLICY',
  'AUDIT_FINDING',
  'ASTRONOMY_REFERENCE',
  'INSTRUMENT_RECORD',
  'MODEL_OUTPUT',
  'NONE',
]
const SCRIPTURE_TRADITIONS = new Set([
  'islamic-quran',
  'islamic-commentary',
  'historical-near-east',
  'abrahamic-torah',
  'abrahamic-zabur',
  'abrahamic-injil',
])
const SCRIPTURE_EVIDENCE = new Set(['SCRIPTURE_TEXT', 'COMMENTARY_TEXT', 'CORPUS_METADATA'])
const READING_EVIDENCE = new Set(['INSTRUMENT_RECORD', 'MODEL_OUTPUT', 'ASTRONOMY_REFERENCE'])
const ALLOWED_EVIDENCE = {
  STORY: new Set([...EVIDENCE_KINDS.filter((kind) => !READING_EVIDENCE.has(kind))]),
  ASTRONOMY: new Set(['ASTRONOMY_REFERENCE', 'AUDIT_FINDING', 'PROJECT_POLICY', 'NONE']),
  PHYSICAL_READING: new Set(['INSTRUMENT_RECORD', 'NONE']),
  SIMULATION: new Set(['MODEL_OUTPUT', 'NONE']),
}
const REQUIRED_GUARDS = [
  'quote_resolves_at_line',
  'declared_tallies_equal_rows',
  'no_absent_row_with_locator',
  'evidenced_and_partial_rows_have_locator',
  'needs_source_rows_state_the_gap',
  'scripture_rows_are_story_only',
  'no_story_row_carries_reading_evidence',
  'no_astronomy_row_cites_scripture',
  'no_statement_asserts_measurement_from_scripture',
  'all_four_claim_types_present',
  'no_external_fetch',
  'no_writes',
]
const MAX_QUOTE = 120
const MAX_STATEMENT = 400
const MIN_GAP = 30

// A positive measurement/proof predicate. A sentence that also carries a
// negation is treated as a denial, not an assertion, so "does not prove" and
// "not a measurement" are allowed while "proves the measured value" is not.
const MEASUREMENT_VERBS = /\b(measures?|measured|measurement|proves?|proven|demonstrates?|confirms?)\b/i
const NEGATION = /\b(not|no|never|cannot|neither|nor|without)\b/i
// No Arabic script in an authored statement: this ledger paraphrases and does
// not reproduce scripture.
const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/

const err = (code, message) => ({ code, message })

function makeReader(root) {
  const cache = new Map()
  return function read(rel) {
    if (typeof rel !== 'string' || !rel || rel.startsWith('/') || /^[A-Za-z]:/.test(rel) || rel.split(/[\\/]/).includes('..')) {
      return { error: 'PATH_UNSAFE' }
    }
    if (cache.has(rel)) return cache.get(rel)
    const abs = path.join(root, rel)
    let text
    try {
      text = fs.readFileSync(abs, 'utf8')
    } catch {
      const miss = { error: 'FILE_MISSING' }
      cache.set(rel, miss)
      return miss
    }
    const entry = { lines: text.split(/\r?\n/) }
    cache.set(rel, entry)
    return entry
  }
}

function assertsMeasurement(statement) {
  return statement
    .split(/[.!?]\s+/)
    .some((sentence) => MEASUREMENT_VERBS.test(sentence) && !NEGATION.test(sentence))
}

function checkLocator(read, locator, where, errs, required) {
  if (locator === null || locator === undefined) {
    if (required) errs.push(err('LOCATOR_MISSING', `${where}: this row requires a repository locator`))
    return false
  }
  if (typeof locator !== 'object' || Array.isArray(locator)) {
    errs.push(err('LOCATOR_MISSING', `${where}: locator must be an object with file, line and quote`))
    return false
  }
  const { file, line, quote } = locator
  if (typeof file !== 'string' || !file) {
    errs.push(err('LOCATOR_MISSING', `${where}: locator.file must be a non-empty string`))
    return false
  }
  if (!Number.isInteger(line) || line < 1) {
    errs.push(err('LOCATOR_MISSING', `${where}: locator.line must be a positive integer`))
    return false
  }
  if (typeof quote !== 'string' || !quote.trim()) {
    errs.push(err('LOCATOR_MISSING', `${where}: locator.quote must be a non-empty string`))
    return false
  }
  if (quote.length > MAX_QUOTE) {
    errs.push(err('QUOTE_TOO_LONG', `${where}: quote is ${quote.length} chars; locator quotes stay minimal (<= ${MAX_QUOTE})`))
    return false
  }
  const doc = read(file)
  if (doc.error === 'PATH_UNSAFE') {
    errs.push(err('PATH_UNSAFE', `${where}: locator.file must be a repository-relative path`))
    return false
  }
  if (doc.error === 'FILE_MISSING') {
    errs.push(err('FILE_MISSING', `${where}: ${file} does not exist`))
    return false
  }
  if (line > doc.lines.length) {
    errs.push(err('LINE_OUT_OF_RANGE', `${where}: ${file}:${line} is outside the file (${doc.lines.length} lines)`))
    return false
  }
  if (!doc.lines[line - 1].includes(quote)) {
    errs.push(err('QUOTE_MISMATCH', `${where}: quote not found verbatim at ${file}:${line}`))
    return false
  }
  return true
}

function expectedTallies(rows) {
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]))
  const byClaimType = Object.fromEntries(CLAIM_TYPES.map((c) => [c, 0]))
  const byTradition = Object.fromEntries(TRADITIONS.map((t) => [t, 0]))
  const byEvidenceKind = Object.fromEntries(EVIDENCE_KINDS.map((k) => [k, 0]))
  for (const row of rows) {
    if (row && typeof row === 'object') {
      if (Object.hasOwn(byStatus, row.sourceStatus)) byStatus[row.sourceStatus] += 1
      if (Object.hasOwn(byClaimType, row.claimType)) byClaimType[row.claimType] += 1
      if (Object.hasOwn(byTradition, row.tradition)) byTradition[row.tradition] += 1
      if (Object.hasOwn(byEvidenceKind, row.evidenceKind)) byEvidenceKind[row.evidenceKind] += 1
    }
  }
  return { total: rows.length, byStatus, byClaimType, byTradition, byEvidenceKind }
}

function checkEnum(data, key, expected, errs) {
  const value = data[key]
  if (!Array.isArray(value)) {
    errs.push(err('SHAPE', `${key} must be an array`))
    return
  }
  for (const token of expected) {
    if (!value.includes(token)) errs.push(err('SHAPE', `${key} is missing ${token}`))
  }
  for (const token of value) {
    if (!expected.includes(token)) errs.push(err('SHAPE', `${key} has unknown token ${JSON.stringify(token)}`))
  }
}

function compareMap(declared, actual, labels, label, errs) {
  if (!declared || typeof declared !== 'object' || Array.isArray(declared)) {
    errs.push(err('TALLY_MISMATCH', `declared_counts.${label} must be an object`))
    return
  }
  for (const key of labels) {
    if (declared[key] !== actual[key]) {
      errs.push(err('TALLY_MISMATCH', `${label}.${key} declared ${JSON.stringify(declared[key])} != ${actual[key]}`))
    }
  }
  for (const key of Object.keys(declared)) {
    if (!labels.includes(key)) errs.push(err('TALLY_MISMATCH', `${label} has unknown key ${key}`))
  }
}

function validate(data, read) {
  const errs = []
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { errors: [err('SHAPE', 'dataset must be a JSON object')], stats: null }
  }
  if (data.task !== TASK) errs.push(err('SHAPE', `task must be "${TASK}" (got ${JSON.stringify(data.task)})`))
  checkEnum(data, 'status_enum', STATUSES, errs)
  checkEnum(data, 'claim_type_enum', CLAIM_TYPES, errs)
  checkEnum(data, 'tradition_enum', TRADITIONS, errs)
  checkEnum(data, 'evidence_kind_enum', EVIDENCE_KINDS, errs)

  if (!data.guards || typeof data.guards !== 'object') {
    errs.push(err('SHAPE', 'guards object is required'))
  } else {
    for (const key of REQUIRED_GUARDS) {
      if (data.guards[key] !== true) errs.push(err('GUARD_FALSE', `guard ${key} must be true`))
    }
  }
  if (!data.declared_counts || typeof data.declared_counts !== 'object') {
    errs.push(err('SHAPE', 'declared_counts object is required'))
  }

  if (!Array.isArray(data.rows) || data.rows.length === 0) {
    return { errors: errs.concat(err('SHAPE', 'rows must be a non-empty array')), stats: null }
  }

  const ids = new Set()
  const rows = data.rows
  rows.forEach((row, index) => {
    const where = `rows[${index}]`
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      errs.push(err('SHAPE', `${where}: row must be an object`))
      return
    }
    if (typeof row.id !== 'string' || !row.id.trim()) {
      errs.push(err('SHAPE', `${where}: id is required`))
    } else if (!/^[a-z0-9][a-z0-9-]*$/.test(row.id)) {
      errs.push(err('SHAPE', `${where}: id must be lower-case kebab-case`))
    } else if (ids.has(row.id)) {
      errs.push(err('DUPLICATE_ID', `${where}: duplicate id ${row.id}`))
    } else {
      ids.add(row.id)
    }

    const traditionKnown = TRADITIONS.includes(row.tradition)
    if (!traditionKnown) errs.push(err('TRADITION_UNKNOWN', `${where}: tradition ${JSON.stringify(row.tradition)} is not in tradition_enum`))
    const claimKnown = CLAIM_TYPES.includes(row.claimType)
    if (!claimKnown) errs.push(err('CLAIM_TYPE_UNKNOWN', `${where}: claimType ${JSON.stringify(row.claimType)} is not one of the four`))
    const evidenceKnown = EVIDENCE_KINDS.includes(row.evidenceKind)
    if (!evidenceKnown) errs.push(err('EVIDENCE_KIND_UNKNOWN', `${where}: evidenceKind ${JSON.stringify(row.evidenceKind)} is not in evidence_kind_enum`))
    const statusKnown = STATUSES.includes(row.sourceStatus)
    if (!statusKnown) errs.push(err('STATUS_UNKNOWN', `${where}: sourceStatus ${JSON.stringify(row.sourceStatus)} is not in status_enum`))

    if (typeof row.statement !== 'string' || !row.statement.trim()) {
      errs.push(err('STATEMENT_INVALID', `${where}: statement is required`))
    } else {
      if (row.statement.length > MAX_STATEMENT) {
        errs.push(err('STATEMENT_INVALID', `${where}: statement is ${row.statement.length} chars; paraphrase briefly (<= ${MAX_STATEMENT})`))
      }
      if (ARABIC_SCRIPT.test(row.statement)) {
        errs.push(err('STATEMENT_INVALID', `${where}: statement must be authored prose, not reproduced scripture`))
      }
    }

    const locatorIsObject = row.locator && typeof row.locator === 'object' && !Array.isArray(row.locator)
    if (statusKnown) {
      if (row.sourceStatus === 'ABSENT') {
        if (row.locator !== null && row.locator !== undefined) {
          errs.push(err('ABSENT_WITH_LOCATOR', `${where}: ABSENT rows record no source and carry no locator`))
        }
        if (row.evidenceKind !== 'NONE') {
          errs.push(err('ABSENT_WITH_EVIDENCE', `${where}: ABSENT rows carry evidenceKind NONE`))
        }
      } else if (row.sourceStatus === 'EVIDENCED' || row.sourceStatus === 'PARTIAL') {
        if (row.evidenceKind === 'NONE') {
          errs.push(err('EVIDENCED_WITHOUT_EVIDENCE', `${where}: ${row.sourceStatus} rows name the evidence kind they rely on`))
        }
        checkLocator(read, row.locator, where, errs, true)
      } else if (row.sourceStatus === 'NEEDS_SOURCE') {
        if (typeof row.missing !== 'string' || row.missing.trim().length < MIN_GAP) {
          errs.push(err('NEEDS_SOURCE_WITHOUT_GAP', `${where}: NEEDS_SOURCE must state what is missing (>= ${MIN_GAP} chars)`))
        }
        if (row.evidenceKind !== 'NONE') {
          checkLocator(read, row.locator, where, errs, true)
        } else if (row.locator !== null && row.locator !== undefined) {
          checkLocator(read, row.locator, where, errs, false)
        }
      }
    }

    if (claimKnown && evidenceKnown && !ALLOWED_EVIDENCE[row.claimType].has(row.evidenceKind)) {
      errs.push(err('EVIDENCE_MISMATCH', `${where}: ${row.claimType} cannot be carried by ${row.evidenceKind} evidence`))
    }
    if (row.claimType === 'STORY' && READING_EVIDENCE.has(row.evidenceKind)) {
      errs.push(err('STORY_WITH_READING_EVIDENCE', `${where}: a STORY row may not carry instrument, model or astronomy evidence`))
    }
    if (row.claimType === 'ASTRONOMY' && SCRIPTURE_EVIDENCE.has(row.evidenceKind)) {
      errs.push(err('ASTRONOMY_CITING_SCRIPTURE', `${where}: an ASTRONOMY row may not cite scripture or corpus metadata as a measurement`))
    }
    if (traditionKnown && SCRIPTURE_TRADITIONS.has(row.tradition) && row.claimType !== 'STORY') {
      errs.push(err('SCRIPTURE_NON_STORY', `${where}: a scripture tradition may only be recorded as STORY`))
    }
    if (claimKnown && locatorIsObject && typeof row.locator.file === 'string' && row.locator.file.includes('moonql-corpus') && row.claimType !== 'STORY') {
      errs.push(err('SCRIPTURE_NON_STORY', `${where}: corpus scripture may only be recorded as STORY, not ${row.claimType}`))
    }

    const scriptureBacked = (traditionKnown && SCRIPTURE_TRADITIONS.has(row.tradition)) || SCRIPTURE_EVIDENCE.has(row.evidenceKind)
    if (row.claimType !== 'PHYSICAL_READING' && scriptureBacked && typeof row.statement === 'string' && assertsMeasurement(row.statement)) {
      errs.push(err('SCRIPTURE_AS_MEASUREMENT', `${where}: statement asserts a measurement or proof from scriptural material`))
    }
  })

  for (const claimType of CLAIM_TYPES) {
    if (!rows.some((row) => row && row.claimType === claimType)) {
      errs.push(err('MISSING_CLAIM_TYPE', `no row uses claimType ${claimType}; the four modes must stay distinguishable`))
    }
  }

  const actual = expectedTallies(rows)
  if (data.declared_counts && typeof data.declared_counts === 'object') {
    const declared = data.declared_counts
    if (declared.total !== actual.total) {
      errs.push(err('TALLY_MISMATCH', `declared total ${JSON.stringify(declared.total)} != ${actual.total} rows`))
    }
    compareMap(declared.by_status, actual.byStatus, STATUSES, 'by_status', errs)
    compareMap(declared.by_claim_type, actual.byClaimType, CLAIM_TYPES, 'by_claim_type', errs)
    compareMap(declared.by_tradition, actual.byTradition, TRADITIONS, 'by_tradition', errs)
    compareMap(declared.by_evidence_kind, actual.byEvidenceKind, EVIDENCE_KINDS, 'by_evidence_kind', errs)
  }

  const stats = {
    total: actual.total,
    byStatus: actual.byStatus,
    byClaimType: actual.byClaimType,
    byTradition: actual.byTradition,
    quotes: rows.filter((row) => row && row.locator && typeof row.locator === 'object').length,
  }
  return { errors: errs, stats }
}

function report(errors, stats, label) {
  if (errors.length === 0) {
    const statuses = STATUSES.map((s) => `${s}=${stats.byStatus[s]}`).join(' ')
    const claims = CLAIM_TYPES.map((c) => `${c}=${stats.byClaimType[c]}`).join(' ')
    const traditions = TRADITIONS.map((t) => `${t}=${stats.byTradition[t]}`).join(' ')
    console.log(`PASS ${label}: rows=${stats.total} ${statuses}`)
    console.log(`  claim_types: ${claims}`)
    console.log(`  traditions: ${traditions}`)
    console.log(`  locators: ${stats.quotes}/${stats.quotes} resolved, quotes <= ${MAX_QUOTE} chars`)
    return
  }
  console.log(`FAIL ${label}: ${errors.length} error(s)`)
  for (const e of errors) console.log(`  ${e.code}: ${e.message}`)
}

function baseFixture() {
  return {
    task: TASK,
    status_enum: [...STATUSES],
    claim_type_enum: [...CLAIM_TYPES],
    tradition_enum: [...TRADITIONS],
    evidence_kind_enum: [...EVIDENCE_KINDS],
    guards: Object.fromEntries(REQUIRED_GUARDS.map((k) => [k, true])),
    rows: [
      {
        id: 'fixture-quran-address',
        tradition: 'islamic-quran',
        claimType: 'STORY',
        evidenceKind: 'CORPUS_METADATA',
        statement: 'Fixture: the corpus indexes the QS 2:82 address as a passage row.',
        sourceStatus: 'EVIDENCED',
        locator: { file: 'packages/moonql-corpus/src/index.ts', line: 243, quote: "citationKey: 'QS 2:82'," },
      },
      {
        id: 'fixture-torah-inventory',
        tradition: 'abrahamic-torah',
        claimType: 'STORY',
        evidenceKind: 'HISTORICAL_RECORD',
        statement: 'Fixture: a Torah edition is inventoried but no passage is seeded.',
        sourceStatus: 'PARTIAL',
        locator: { file: 'docs/audit/M07-01-editions-licenses-inventory.md', line: 18, quote: 'Leningrad Codex (B19a, 1008 CE)' },
      },
      {
        id: 'fixture-tafsir-gap',
        tradition: 'islamic-commentary',
        claimType: 'STORY',
        evidenceKind: 'PROJECT_POLICY',
        statement: 'Fixture: no tafsir text is present, so a commentary row needs a licensed edition.',
        sourceStatus: 'NEEDS_SOURCE',
        missing: 'Fixture gap: a licensed tafsir edition record plus a reviewed passage locator.',
        locator: { file: 'docs/vision/MASTER_VISION_NARRATIVE_XV.md', line: 817, quote: 'quran-tafsir-sample' },
      },
      {
        id: 'fixture-near-east-absent',
        tradition: 'historical-near-east',
        claimType: 'STORY',
        evidenceKind: 'NONE',
        statement: 'Fixture: no ancient Near Eastern text is ingested.',
        sourceStatus: 'ABSENT',
      },
      {
        id: 'fixture-lunar-arithmetic',
        tradition: 'modern-astronomy',
        claimType: 'ASTRONOMY',
        evidenceKind: 'AUDIT_FINDING',
        statement: 'Fixture: the phase value is arithmetic, not a pinned ephemeris.',
        sourceStatus: 'EVIDENCED',
        locator: { file: 'docs/audit/M25-01-mtime-antikythera-audit.md', line: 62, quote: 'unvalidated mean-synodic approximation' },
      },
      {
        id: 'fixture-instrument-absent',
        tradition: 'modern-astronomy',
        claimType: 'PHYSICAL_READING',
        evidenceKind: 'NONE',
        statement: 'Fixture: no instrument record exists for this comparison.',
        sourceStatus: 'ABSENT',
      },
      {
        id: 'fixture-simulation-absent',
        tradition: 'modern-astronomy',
        claimType: 'SIMULATION',
        evidenceKind: 'NONE',
        statement: 'Fixture: no cosmological model with declared inputs exists.',
        sourceStatus: 'ABSENT',
      },
    ],
    declared_counts: {
      total: 7,
      by_status: { EVIDENCED: 2, PARTIAL: 1, NEEDS_SOURCE: 1, ABSENT: 3 },
      by_claim_type: { PHYSICAL_READING: 1, SIMULATION: 1, ASTRONOMY: 1, STORY: 4 },
      by_tradition: {
        'islamic-quran': 1,
        'islamic-commentary': 1,
        'historical-near-east': 1,
        'abrahamic-torah': 1,
        'abrahamic-zabur': 0,
        'abrahamic-injil': 0,
        'modern-astronomy': 3,
        'comparative-method': 0,
      },
      by_evidence_kind: {
        CORPUS_METADATA: 1,
        SCRIPTURE_TEXT: 0,
        COMMENTARY_TEXT: 0,
        HISTORICAL_RECORD: 1,
        PROJECT_POLICY: 1,
        AUDIT_FINDING: 1,
        ASTRONOMY_REFERENCE: 0,
        INSTRUMENT_RECORD: 0,
        MODEL_OUTPUT: 0,
        NONE: 3,
      },
    },
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function selfTest() {
  const read = makeReader(ROOT)
  const cases = []
  const valid = baseFixture()
  const validResult = validate(valid, read)
  cases.push({ name: 'valid fixture accepted', ok: validResult.errors.length === 0, detail: validResult.errors[0]?.code ?? '0 errors' })

  const inventedQuote = clone(valid)
  inventedQuote.rows[0].locator.quote = "citationKey: 'QS 9:99',"
  cases.push({ name: 'invented quote rejected', ok: validate(inventedQuote, read).errors.some((e) => e.code === 'QUOTE_MISMATCH') })

  const badLocator = clone(valid)
  badLocator.rows[0].locator.line = 99999
  cases.push({ name: 'locator line beyond the file rejected', ok: validate(badLocator, read).errors.some((e) => e.code === 'LINE_OUT_OF_RANGE') })

  const unknownType = clone(valid)
  unknownType.rows[0].claimType = 'HISTORY'
  cases.push({ name: 'unknown claimType rejected', ok: validate(unknownType, read).errors.some((e) => e.code === 'CLAIM_TYPE_UNKNOWN') })

  const storyWithReading = clone(valid)
  storyWithReading.rows[0].evidenceKind = 'INSTRUMENT_RECORD'
  cases.push({
    name: 'STORY row with instrument evidence rejected',
    ok: validate(storyWithReading, read).errors.some((e) => e.code === 'STORY_WITH_READING_EVIDENCE'),
  })

  const astronomyCitesScripture = clone(valid)
  astronomyCitesScripture.rows[4].evidenceKind = 'CORPUS_METADATA'
  astronomyCitesScripture.rows[4].locator = { file: 'packages/moonql-corpus/src/index.ts', line: 243, quote: "citationKey: 'QS 2:82'," }
  cases.push({
    name: 'ASTRONOMY row citing scripture rejected',
    ok: validate(astronomyCitesScripture, read).errors.some((e) => e.code === 'ASTRONOMY_CITING_SCRIPTURE'),
  })

  const scriptureNonStory = clone(valid)
  scriptureNonStory.rows[0].claimType = 'ASTRONOMY'
  cases.push({ name: 'scripture tradition as non-STORY rejected', ok: validate(scriptureNonStory, read).errors.some((e) => e.code === 'SCRIPTURE_NON_STORY') })

  const scriptureMeasurement = clone(valid)
  scriptureMeasurement.rows[0].statement = 'The verse proves the measured cosmic distance.'
  cases.push({
    name: 'measurement asserted from scripture rejected',
    ok: validate(scriptureMeasurement, read).errors.some((e) => e.code === 'SCRIPTURE_AS_MEASUREMENT'),
  })

  const absentWithSource = clone(valid)
  absentWithSource.rows[3].locator = { file: 'docs/vision/MASTER_VISION_NARRATIVE_XV.md', line: 493, quote: 'astronomical observation' }
  cases.push({ name: 'ABSENT row with locator rejected', ok: validate(absentWithSource, read).errors.some((e) => e.code === 'ABSENT_WITH_LOCATOR') })

  const gapMissing = clone(valid)
  delete gapMissing.rows[2].missing
  cases.push({ name: 'NEEDS_SOURCE without a stated gap rejected', ok: validate(gapMissing, read).errors.some((e) => e.code === 'NEEDS_SOURCE_WITHOUT_GAP') })

  const quoteTooLong = clone(valid)
  quoteTooLong.rows[0].locator.quote = 'x'.repeat(MAX_QUOTE + 1)
  cases.push({ name: 'over-long quote rejected', ok: validate(quoteTooLong, read).errors.some((e) => e.code === 'QUOTE_TOO_LONG') })

  const tallyDrift = clone(valid)
  tallyDrift.declared_counts.total = 8
  cases.push({ name: 'tally drift rejected', ok: validate(tallyDrift, read).errors.some((e) => e.code === 'TALLY_MISMATCH') })

  const typeDropped = clone(valid)
  typeDropped.rows[6].claimType = 'STORY'
  cases.push({ name: 'dropped claim type rejected', ok: validate(typeDropped, read).errors.some((e) => e.code === 'MISSING_CLAIM_TYPE') })

  const unknownTradition = clone(valid)
  unknownTradition.rows[0].tradition = 'zoroastrian'
  cases.push({ name: 'unknown tradition rejected', ok: validate(unknownTradition, read).errors.some((e) => e.code === 'TRADITION_UNKNOWN') })

  let failed = 0
  console.log('SELF-TEST M25-06 cosmos tradition context')
  for (const c of cases) {
    if (c.ok) {
      console.log(`PASS  ${c.name}${c.detail ? ` (${c.detail})` : ''}`)
    } else {
      failed += 1
      console.log(`FAIL  ${c.name}`)
    }
  }
  const tampered = cases.length - 1
  console.log(`${failed === 0 ? 'PASS' : 'FAIL'}  ${cases.length - failed}/${cases.length} cases; valid fixture accepted, ${tampered} tampered fixtures rejected`)
  return failed === 0
}

function main() {
  const args = process.argv.slice(2)
  const unknown = args.filter((a) => a !== '--self-test')
  if (unknown.length > 0) {
    console.error(`Unknown argument(s): ${unknown.join(' ')}`)
    console.error('Usage: node scripts/check-m25-06-cosmos-tradition-context.mjs [--self-test]')
    process.exitCode = 2
    return
  }
  if (args.includes('--self-test')) {
    process.exitCode = selfTest() ? 0 : 1
    return
  }
  let data
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch (error) {
    console.log(`FAIL M25-06 cosmos tradition context: cannot read/parse docs/data/M25-06-cosmos-tradition-context.json (${error.message})`)
    process.exitCode = 1
    return
  }
  const { errors, stats } = validate(data, makeReader(ROOT))
  report(errors, stats, 'M25-06 cosmos tradition context')
  process.exitCode = errors.length === 0 ? 0 : 1
}

main()
