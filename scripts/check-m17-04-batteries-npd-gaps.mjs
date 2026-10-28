#!/usr/bin/env node
/**
 * M17-04 validator — four-book THE BATTERIES and NPD variant gap ledger.
 *
 * Dependency-free. Reads docs/data/M17-04-batteries-npd-gaps.json and every
 * cited repository line. No network. No writes.
 *
 * Usage:
 *   node scripts/check-m17-04-batteries-npd-gaps.mjs
 *   node scripts/check-m17-04-batteries-npd-gaps.mjs --self-test
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const DATA_FILE = path.join(ROOT, 'docs', 'data', 'M17-04-batteries-npd-gaps.json')

const TASK = 'M17-04'
const STATUSES = ['EVIDENCED', 'PARTIAL', 'NEEDS_SOURCE', 'ABSENT']
const SETS = ['BATTERIES_FOUR_BOOK', 'NPD_WORKS', 'BATTERIES_NPD_SEPARATION']
const KINDS = [
  'ensemble_label',
  'chapter_band',
  'count',
  'title_gap',
  'order_gap',
  'page_gap',
  'npd_label_set',
  'chapter_mapping_gap',
  'variant_gap',
  'artifact_gap',
  'relation_gap',
]
const REQUIRED_GUARDS = [
  'quote_resolves_at_line',
  'declared_tallies_equal_rows',
  'no_absent_row_with_source',
  'no_invented_book_title',
  'no_npd_merged_into_batteries',
  'every_evidenced_row_has_locator',
  'four_book_count_recorded_as_a_count',
  'book_rows_zero',
  'no_external_fetch',
  'no_writes',
]
const MAX_QUOTE = 320

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

function checkSource(read, source, where, errs) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    errs.push(err('SOURCE_MISSING', `${where}: source must be an object with file, line and quote`))
    return false
  }
  const { file, line, quote } = source
  if (typeof file !== 'string' || !file) {
    errs.push(err('SOURCE_MISSING', `${where}: source.file must be a non-empty string`))
    return false
  }
  if (!Number.isInteger(line) || line < 1) {
    errs.push(err('SOURCE_MISSING', `${where}: source.line must be a positive integer`))
    return false
  }
  if (typeof quote !== 'string' || !quote.trim()) {
    errs.push(err('SOURCE_MISSING', `${where}: source.quote must be a non-empty string`))
    return false
  }
  if (quote.length > MAX_QUOTE) {
    errs.push(err('QUOTE_TOO_LONG', `${where}: quote is ${quote.length} chars; locator quotes stay minimal (<= ${MAX_QUOTE})`))
    return false
  }
  const doc = read(file)
  if (doc.error === 'PATH_UNSAFE') {
    errs.push(err('PATH_UNSAFE', `${where}: source.file must be a repository-relative path`))
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
  const bySet = Object.fromEntries(SETS.map((s) => [s, 0]))
  for (const row of rows) {
    if (row && typeof row === 'object') {
      if (Object.hasOwn(byStatus, row.status)) byStatus[row.status] += 1
      if (Object.hasOwn(bySet, row.set)) bySet[row.set] += 1
    }
  }
  const bookRows = rows.filter((r) => r && r.kind === 'book').length
  const bookTitles = rows.filter((r) => r && typeof r.book_title === 'string' && r.book_title.trim()).length
  const countRows = rows.filter((r) => r && r.kind === 'count')
  const labelSets = rows.filter((r) => r && r.kind === 'npd_label_set')
  const variantRows = rows.filter((r) => r && r.kind === 'variant_gap')
  const reportedBooks = countRows.length === 1 ? countRows[0].count_reported : null
  const namedLabels = labelSets.length === 1 ? labelSets[0].count_reported : null
  const namedVariants = variantRows.reduce((sum, r) => sum + (Number.isInteger(r.named_instances) ? r.named_instances : 0), 0)
  const sequenced = countRows.filter((r) => r && r.sequence).length
  return {
    total: rows.length,
    byStatus,
    bySet,
    bookRows,
    bookTitles,
    reportedBooks,
    namedLabels,
    namedVariants,
    sequenced,
  }
}

function validate(data, read) {
  const errs = []
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { errors: [err('SHAPE', 'dataset must be a JSON object')], stats: null }
  }
  if (data.task !== TASK) errs.push(err('SHAPE', `task must be "${TASK}" (got ${JSON.stringify(data.task)})`))
  if (!Array.isArray(data.rows) || data.rows.length === 0) {
    return { errors: errs.concat(err('SHAPE', 'rows must be a non-empty array')), stats: null }
  }
  if (!Array.isArray(data.status_enum) || !Array.isArray(data.set_enum) || !Array.isArray(data.kind_enum)) {
    errs.push(err('SHAPE', 'status_enum, set_enum and kind_enum must be arrays'))
  } else {
    for (const status of STATUSES) if (!data.status_enum.includes(status)) errs.push(err('SHAPE', `status_enum is missing ${status}`))
    for (const set of SETS) if (!data.set_enum.includes(set)) errs.push(err('SHAPE', `set_enum is missing ${set}`))
  }
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

  const ids = new Set()
  const rows = data.rows
  rows.forEach((row, index) => {
    const where = `rows[${index}]`
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      errs.push(err('SHAPE', `${where}: row must be an object`))
      return
    }
    if (typeof row.id !== 'string' || !row.id.trim()) errs.push(err('SHAPE', `${where}: id is required`))
    else if (ids.has(row.id)) errs.push(err('DUPLICATE_ID', `${where}: duplicate id ${row.id}`))
    else ids.add(row.id)
    if (!SETS.includes(row.set)) errs.push(err('SET_UNKNOWN', `${where}: set ${JSON.stringify(row.set)} is not in set_enum`))
    if (!KINDS.includes(row.kind)) errs.push(err('KIND_UNKNOWN', `${where}: kind ${JSON.stringify(row.kind)} is not in kind_enum`))
    if (!STATUSES.includes(row.status)) errs.push(err('STATUS_UNKNOWN', `${where}: status ${JSON.stringify(row.status)} is not in status_enum`))
    if (typeof row.label !== 'string' || !row.label.trim()) errs.push(err('SHAPE', `${where}: label is required`))
    if (typeof row.referent !== 'string' || !row.referent.trim()) errs.push(err('SHAPE', `${where}: referent is required`))
    if (typeof row.gap !== 'string' || !row.gap.trim()) errs.push(err('SHAPE', `${where}: gap is required`))
    if (row.kind === 'book') errs.push(err('INVENTED_BOOK', `${where}: this ledger holds zero book rows; a count is not a book`))
    if (row.book_title !== undefined && row.book_title !== null) {
      errs.push(err('INVENTED_BOOK_TITLE', `${where}: no book title may be asserted (got ${JSON.stringify(row.book_title)})`))
    }
    if (row.set === 'BATTERIES_FOUR_BOOK' && /npd/i.test(`${row.id} ${row.label} ${row.referent}`)) {
      errs.push(err('NPD_MERGED_INTO_BATTERIES', `${where}: an NPD row is placed in the four-book set`))
    }
    if (row.status === 'ABSENT') {
      if (row.source !== null && row.source !== undefined) {
        errs.push(err('ABSENT_WITH_SOURCE', `${where}: ABSENT rows record an empty set and carry no source`))
      }
    } else {
      checkSource(read, row.source, where, errs)
    }
    if (row.status === 'EVIDENCED' && (!row.source || typeof row.source !== 'object')) {
      errs.push(err('EVIDENCED_WITHOUT_LOCATOR', `${where}: EVIDENCED requires a resolving locator`))
    }
  })

  const actual = expectedTallies(rows)
  if (data.declared_counts && typeof data.declared_counts === 'object') {
    const declared = data.declared_counts
    if (declared.total !== actual.total) {
      errs.push(err('TALLY_MISMATCH', `declared total ${JSON.stringify(declared.total)} != ${actual.total} rows`))
    }
    if (!declared.by_status || typeof declared.by_status !== 'object') {
      errs.push(err('TALLY_MISMATCH', 'declared_counts.by_status is required'))
    } else {
      for (const status of STATUSES) {
        if (declared.by_status[status] !== actual.byStatus[status]) {
          errs.push(err('TALLY_MISMATCH', `by_status.${status} declared ${JSON.stringify(declared.by_status[status])} != ${actual.byStatus[status]}`))
        }
      }
      for (const key of Object.keys(declared.by_status)) {
        if (!STATUSES.includes(key)) errs.push(err('TALLY_MISMATCH', `by_status has unknown key ${key}`))
      }
    }
    if (!declared.by_set || typeof declared.by_set !== 'object') {
      errs.push(err('TALLY_MISMATCH', 'declared_counts.by_set is required'))
    } else {
      for (const set of SETS) {
        if (declared.by_set[set] !== actual.bySet[set]) {
          errs.push(err('TALLY_MISMATCH', `by_set.${set} declared ${JSON.stringify(declared.by_set[set])} != ${actual.bySet[set]}`))
        }
      }
      for (const key of Object.keys(declared.by_set)) {
        if (!SETS.includes(key)) errs.push(err('TALLY_MISMATCH', `by_set has unknown key ${key}`))
      }
    }
    const four = declared.four_book
    if (!four || typeof four !== 'object') {
      errs.push(err('TALLY_MISMATCH', 'declared_counts.four_book is required'))
    } else {
      if (four.reported !== actual.reportedBooks) {
        errs.push(err('TALLY_MISMATCH', `four_book.reported ${JSON.stringify(four.reported)} != count row value ${JSON.stringify(actual.reportedBooks)}`))
      }
      if (four.reported !== 4) {
        errs.push(err('FOUR_BOOK_COUNT_DRIFT', `four-book count must stay 4 (got ${JSON.stringify(four.reported)})`))
      }
      if (four.book_rows !== actual.bookRows || actual.bookRows !== 0) {
        errs.push(err('INVENTED_BOOK', `four_book.book_rows ${JSON.stringify(four.book_rows)} != enumerated book rows ${actual.bookRows} (must be 0)`))
      }
      if (four.book_titles !== actual.bookTitles || actual.bookTitles !== 0) {
        errs.push(err('INVENTED_BOOK_TITLE', `four_book.book_titles ${JSON.stringify(four.book_titles)} != enumerated titles ${actual.bookTitles} (must be 0)`))
      }
      if (four.sequenced !== actual.sequenced || actual.sequenced !== 0) {
        errs.push(err('TALLY_MISMATCH', `four_book.sequenced ${JSON.stringify(four.sequenced)} != enumerated sequences ${actual.sequenced} (must be 0)`))
      }
    }
    if (declared.book_rows !== actual.bookRows) {
      errs.push(err('TALLY_MISMATCH', `book_rows declared ${JSON.stringify(declared.book_rows)} != ${actual.bookRows}`))
    }
    if (declared.book_titles !== actual.bookTitles) {
      errs.push(err('TALLY_MISMATCH', `book_titles declared ${JSON.stringify(declared.book_titles)} != ${actual.bookTitles}`))
    }
    const npd = declared.npd
    if (!npd || typeof npd !== 'object') {
      errs.push(err('TALLY_MISMATCH', 'declared_counts.npd is required'))
    } else {
      if (npd.named_labels !== actual.namedLabels) {
        errs.push(err('TALLY_MISMATCH', `npd.named_labels ${JSON.stringify(npd.named_labels)} != label-set row value ${JSON.stringify(actual.namedLabels)}`))
      }
      if (npd.named_variants !== actual.namedVariants) {
        errs.push(err('TALLY_MISMATCH', `npd.named_variants ${JSON.stringify(npd.named_variants)} != ${actual.namedVariants}`))
      }
      if (npd.merged_into_batteries !== 0) {
        errs.push(err('NPD_MERGED_INTO_BATTERIES', `npd.merged_into_batteries must be 0 (got ${JSON.stringify(npd.merged_into_batteries)})`))
      }
    }
  }

  if (!rows.some((r) => r && r.kind === 'page_gap' && r.status === 'NEEDS_SOURCE')) {
    errs.push(err('ACCEPTANCE_UNMET', 'missing scene/pages must be recorded as a page_gap row marked NEEDS_SOURCE'))
  }

  const stats = {
    total: actual.total,
    byStatus: actual.byStatus,
    bySet: actual.bySet,
    fourBook: {
      reported: actual.reportedBooks,
      book_rows: actual.bookRows,
      book_titles: actual.bookTitles,
      sequenced: actual.sequenced,
    },
    npd: {
      named_labels: actual.namedLabels,
      named_variants: actual.namedVariants,
      merged_into_batteries: errs.some((e) => e.code === 'NPD_MERGED_INTO_BATTERIES') ? 1 : 0,
    },
    quotes: rows.filter((r) => r && r.source && typeof r.source === 'object').length,
  }
  return { errors: errs, stats }
}

function report(errors, stats, label) {
  if (errors.length === 0) {
    const statuses = STATUSES.map((s) => `${s}=${stats.byStatus[s]}`).join(' ')
    const sets = SETS.map((s) => `${s}=${stats.bySet[s]}`).join(' ')
    console.log(`PASS ${label}: rows=${stats.total} ${statuses}`)
    console.log(`  sets: ${sets}`)
    console.log(`  four_book: reported=${stats.fourBook.reported} book_rows=${stats.fourBook.book_rows} book_titles=${stats.fourBook.book_titles} sequenced=${stats.fourBook.sequenced}`)
    console.log(`  npd: named_labels=${stats.npd.named_labels} named_variants=${stats.npd.named_variants} merged_into_batteries=${stats.npd.merged_into_batteries}`)
    console.log(`  quotes: ${stats.quotes}/${stats.quotes} resolved`)
    return
  }
  console.log(`FAIL ${label}: ${errors.length} error(s)`)
  for (const e of errors) console.log(`  ${e.code}: ${e.message}`)
}

function baseFixture() {
  return {
    task: TASK,
    status_enum: [...STATUSES],
    kind_enum: [...KINDS],
    set_enum: [...SETS],
    guards: Object.fromEntries(REQUIRED_GUARDS.map((k) => [k, true])),
    rows: [
      {
        id: 'fixture_batteries_label',
        set: 'BATTERIES_FOUR_BOOK',
        kind: 'ensemble_label',
        label: 'THE BATTERIES',
        referent: 'Fixture ensemble label.',
        status: 'EVIDENCED',
        book_title: null,
        source: { file: 'docs/vision/MASTER_VISION_NARRATIVE_XV.md', line: 368, quote: 'Fictional ensemble: **THE BATTERIES**' },
        gap: 'Fixture gap: no book artifact.',
      },
      {
        id: 'fixture_four_book_count',
        set: 'BATTERIES_FOUR_BOOK',
        kind: 'count',
        label: 'four-book count',
        referent: 'Fixture count only.',
        status: 'PARTIAL',
        book_title: null,
        count_reported: 4,
        count_unit: 'books',
        source: { file: 'docs/vision/MASTER_VISION_NARRATIVE_XV.md', line: 973, quote: 'four-book narrative structure' },
        gap: 'Fixture gap: count is not books.',
      },
      {
        id: 'fixture_pages_gap',
        set: 'BATTERIES_FOUR_BOOK',
        kind: 'page_gap',
        label: 'book pages',
        referent: 'Fixture pages.',
        status: 'NEEDS_SOURCE',
        book_title: null,
        source: { file: 'docs/audit/M26-03-batteries-npd-recovery.md', line: 53, quote: 'No title, page count, page range, scene list, edition or transcript exists.' },
        gap: 'Fixture gap: missing pages.',
      },
      {
        id: 'fixture_npd_labels',
        set: 'NPD_WORKS',
        kind: 'npd_label_set',
        label: 'NPD labels',
        referent: 'Fixture NPD labels.',
        status: 'PARTIAL',
        book_title: null,
        count_reported: 3,
        count_unit: 'labels',
        source: { file: 'docs/vision/MASTER_VISION_NARRATIVE_XV.md', line: 370, quote: 'NPD TEAM 24:27' },
        gap: 'Fixture gap: labels only.',
      },
      {
        id: 'fixture_npd_variants',
        set: 'NPD_WORKS',
        kind: 'variant_gap',
        label: 'NPD variants',
        referent: 'Fixture variant set.',
        status: 'ABSENT',
        book_title: null,
        named_instances: 0,
        source: null,
        gap: 'Fixture gap: no named variant.',
      },
    ],
    declared_counts: {
      total: 5,
      by_status: { EVIDENCED: 1, PARTIAL: 2, NEEDS_SOURCE: 1, ABSENT: 1 },
      by_set: { BATTERIES_FOUR_BOOK: 3, NPD_WORKS: 2, BATTERIES_NPD_SEPARATION: 0 },
      four_book: { reported: 4, book_rows: 0, book_titles: 0, sequenced: 0 },
      npd: { named_labels: 3, named_variants: 0, merged_into_batteries: 0 },
      book_rows: 0,
      book_titles: 0,
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

  const quoteDrift = clone(valid)
  quoteDrift.rows[0].source.quote = 'THE BATTERIES ARE FULLY RECOVERED'
  cases.push({ name: 'quote drift rejected', ok: validate(quoteDrift, read).errors.some((e) => e.code === 'QUOTE_MISMATCH') })

  const tallyDrift = clone(valid)
  tallyDrift.declared_counts.total = 6
  cases.push({ name: 'tally drift rejected', ok: validate(tallyDrift, read).errors.some((e) => e.code === 'TALLY_MISMATCH') })

  const absentSource = clone(valid)
  absentSource.rows[4].source = {
    file: 'docs/vision/MASTER_VISION_NARRATIVE_XV.md',
    line: 973,
    quote: 'NPD 24:27, 24:37 and 25:50 are different works.',
  }
  cases.push({ name: 'absent-with-source rejected', ok: validate(absentSource, read).errors.some((e) => e.code === 'ABSENT_WITH_SOURCE') })

  const inventedTitle = clone(valid)
  inventedTitle.rows[2].book_title = 'The First Battery'
  cases.push({ name: 'invented book title rejected', ok: validate(inventedTitle, read).errors.some((e) => e.code === 'INVENTED_BOOK_TITLE') })

  const merged = clone(valid)
  merged.rows[3].set = 'BATTERIES_FOUR_BOOK'
  cases.push({ name: 'NPD merged into book set rejected', ok: validate(merged, read).errors.some((e) => e.code === 'NPD_MERGED_INTO_BATTERIES') })

  const noLocator = clone(valid)
  noLocator.rows[0].source = null
  cases.push({ name: 'EVIDENCED without locator rejected', ok: validate(noLocator, read).errors.some((e) => e.code === 'EVIDENCED_WITHOUT_LOCATOR' || e.code === 'SOURCE_MISSING') })

  let failed = 0
  console.log('SELF-TEST M17-04 gap ledger')
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
    console.error('Usage: node scripts/check-m17-04-batteries-npd-gaps.mjs [--self-test]')
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
    console.log(`FAIL M17-04 gaps: cannot read/parse docs/data/M17-04-batteries-npd-gaps.json (${error.message})`)
    process.exitCode = 1
    return
  }
  const { errors, stats } = validate(data, makeReader(ROOT))
  report(errors, stats, 'M17-04 gaps')
  process.exitCode = errors.length === 0 ? 0 : 1
}

main()
