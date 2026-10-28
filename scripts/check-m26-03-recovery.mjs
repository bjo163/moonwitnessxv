#!/usr/bin/env node
/**
 * scripts/check-m26-03-recovery.mjs
 *
 * M26-03 gate: the THE BATTERIES / NPD / XII synopsis recovery ledger is
 * internally consistent, uses the M06-06 rights vocabulary, and every quoted
 * locator resolves to real repository text at the cited line.
 *
 * What this proves:
 *   1. Rows have unique ids and kinds/claim states/statuses from the declared
 *      enums; rights_status uses only the M06-06 vocabulary.
 *   2. No EVIDENCED row exists without a primary-artifact source_locator, and
 *      every row/evidence locator resolves to an existing file line whose text
 *      contains the quoted string.
 *   3. NEEDS_SOURCE rows carry no source_locator; REPORTED_ONLY rows point only
 *      at secondary reports and are never marked recovered.
 *   4. Declared totals and tallies by claim state, kind, rights, page,
 *      chronology and recovery equal the rows.
 *   5. Book and synopsis series indices are complete 1..N without duplicates.
 *
 * What this does not prove: that any book, scene or synopsis exists as a
 * manuscript. Zero rows are recovered; a label or a report is not source text.
 *
 * Run:            node scripts/check-m26-03-recovery.mjs
 * Negative test:  node scripts/check-m26-03-recovery.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { existsSync, readFileSync } from 'node:fs'

const LEDGER = 'docs/data/M26-03-batteries-npd-recovery.json'

const CLAIM_STATES = ['EVIDENCED', 'REPORTED_ONLY', 'NEEDS_SOURCE']
const KINDS = ['book', 'scene', 'synopsis', 'variant']
const TITLE_STATUSES = ['EVIDENCED_IN_REPOSITORY', 'NOT_NAMED_IN_REPOSITORY']
const LOCATOR_KINDS = ['PRIMARY_ARTIFACT', 'SECONDARY_REPORT']
const RIGHTS = [
  'RIGHTS_EXACT_VERSION_CLEARED',
  'RIGHTS_UNKNOWN',
  'PRIVATE_WITNESS',
  'MISSING_MEDIA',
]
const PAGE_STATUSES = ['NOT_RECOVERED', 'METADATA_ONLY', 'FRAGMENT_LOCATED', 'FULL_TEXT_LOCATED']
const CHRONOLOGY_STATUSES = ['UNRECORDED', 'LABEL_ONLY', 'PARTIAL', 'RECORDED']
const RECOVERY_STATES = ['NOT_RECOVERED', 'FRAGMENT_LOCATED', 'RECOVERED']

function loadLedger() {
  return JSON.parse(readFileSync(LEDGER, 'utf8'))
}

function makeLineReader() {
  const cache = new Map()
  return (file) => {
    if (!cache.has(file)) cache.set(file, readFileSync(file, 'utf8').split(/\r?\n/))
    return cache.get(file)
  }
}

function sameList(a, b) {
  return Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i])
}

function tally(rows, key, values) {
  return Object.fromEntries(values.map((v) => [v, rows.filter((r) => r[key] === v).length]))
}

function compareTally(name, declared, actual, values, fail) {
  if (!declared || typeof declared !== 'object') {
    fail(`declared_counts.${name} is missing`)
    return
  }
  for (const key of values) {
    if (declared[key] !== actual[key]) {
      fail(`declared ${name}.${key}=${declared[key]} !== rows ${actual[key]}`)
    }
  }
  for (const key of Object.keys(declared)) {
    if (!values.includes(key)) fail(`declared ${name} has unknown key ${JSON.stringify(key)}`)
  }
}

function checkLocator(locator, quote, readLines, stats, fail, where) {
  const match = typeof locator === 'string' ? /^(.+):(\d+)$/.exec(locator) : null
  if (!match) {
    fail(`${where} locator ${JSON.stringify(locator)} is not a file:line string`)
    return
  }
  const file = match[1]
  const lineNo = Number(match[2])
  if (!existsSync(file)) {
    fail(`${where} locator file ${file} does not exist`)
    return
  }
  const lines = readLines(file)
  if (lineNo < 1 || lineNo > lines.length) {
    fail(`${where} locator line ${lineNo} is outside ${file} lines 1-${lines.length}`)
    return
  }
  if (typeof quote !== 'string' || quote.trim() === '') {
    fail(`${where} has an empty quote`)
    return
  }
  if (!lines[lineNo - 1].includes(quote)) {
    fail(`${where} quote ${JSON.stringify(quote)} not found at ${locator}`)
    return
  }
  stats.locatorChecks++
}

function validate(doc, readLines, stats = { locatorChecks: 0 }) {
  const errors = []
  const fail = (msg) => errors.push(msg)

  const rows = Array.isArray(doc.rows) ? doc.rows : []
  if (rows.length === 0) fail('rows is empty or not an array')

  if (!sameList(doc.claim_state_enum, CLAIM_STATES)) {
    fail('claim_state_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.kind_enum, KINDS)) fail('kind_enum does not match the ledger vocabulary')
  if (!sameList(doc.title_status_enum, TITLE_STATUSES)) {
    fail('title_status_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.locator_kind_enum, LOCATOR_KINDS)) {
    fail('locator_kind_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.rights_enum, RIGHTS)) {
    fail('rights_enum does not match the M06-06 rights vocabulary')
  }
  if (!sameList(doc.page_status_enum, PAGE_STATUSES)) {
    fail('page_status_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.chronology_status_enum, CHRONOLOGY_STATUSES)) {
    fail('chronology_status_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.recovery_state_enum, RECOVERY_STATES)) {
    fail('recovery_state_enum does not match the ledger vocabulary')
  }

  const ids = new Set()
  for (const row of rows) {
    if (typeof row.id !== 'string' || row.id.trim() === '') {
      fail(`row at index ${rows.indexOf(row)} has no id`)
      continue
    }
    if (ids.has(row.id)) fail(`duplicate id ${row.id}`)
    ids.add(row.id)

    if (!KINDS.includes(row.kind)) {
      fail(`row ${row.id} kind ${JSON.stringify(row.kind)} is not in ${KINDS.join('|')}`)
    }
    if (!CLAIM_STATES.includes(row.claim_state)) {
      fail(`row ${row.id} claim_state ${JSON.stringify(row.claim_state)} is not in ${CLAIM_STATES.join('|')}`)
    }
    if (!TITLE_STATUSES.includes(row.title_status)) {
      fail(`row ${row.id} title_status ${JSON.stringify(row.title_status)} is not in ${TITLE_STATUSES.join('|')}`)
    } else if (row.title_status === 'EVIDENCED_IN_REPOSITORY') {
      if (typeof row.title !== 'string' || row.title.trim() === '') {
        fail(`row ${row.id} claims an evidenced title but title is ${JSON.stringify(row.title)}`)
      }
    } else if (row.title !== null) {
      fail(`row ${row.id} title_status is NOT_NAMED_IN_REPOSITORY but title is ${JSON.stringify(row.title)}`)
    }
    if (!PAGE_STATUSES.includes(row.page_status)) {
      fail(`row ${row.id} page_status ${JSON.stringify(row.page_status)} is not in ${PAGE_STATUSES.join('|')}`)
    }
    if (!CHRONOLOGY_STATUSES.includes(row.chronology_status)) {
      fail(`row ${row.id} chronology_status ${JSON.stringify(row.chronology_status)} is not in ${CHRONOLOGY_STATUSES.join('|')}`)
    }
    if (!RECOVERY_STATES.includes(row.recovery_state)) {
      fail(`row ${row.id} recovery_state ${JSON.stringify(row.recovery_state)} is not in ${RECOVERY_STATES.join('|')}`)
    }
    if (!RIGHTS.includes(row.rights_status)) {
      fail(`row ${row.id} rights_status ${JSON.stringify(row.rights_status)} is not in M06-06 vocabulary ${RIGHTS.join('|')}`)
    }

    if (row.claim_state === 'EVIDENCED') {
      if (typeof row.source_locator !== 'string' || row.source_locator.trim() === '') {
        fail(`row ${row.id} claims EVIDENCED without source_locator`)
      }
      if (row.locator_kind !== 'PRIMARY_ARTIFACT') {
        fail(`row ${row.id} claims EVIDENCED but locator_kind is ${JSON.stringify(row.locator_kind)}`)
      }
      if (row.recovery_state === 'NOT_RECOVERED') {
        fail(`row ${row.id} claims EVIDENCED but recovery_state is NOT_RECOVERED`)
      }
      if (!['FRAGMENT_LOCATED', 'FULL_TEXT_LOCATED'].includes(row.page_status)) {
        fail(`row ${row.id} claims EVIDENCED but page_status is ${JSON.stringify(row.page_status)}`)
      }
    } else if (row.claim_state === 'REPORTED_ONLY') {
      if (typeof row.source_locator !== 'string' || row.source_locator.trim() === '') {
        fail(`row ${row.id} claims REPORTED_ONLY without a report locator`)
      }
      if (row.locator_kind !== 'SECONDARY_REPORT') {
        fail(`row ${row.id} claims REPORTED_ONLY but locator_kind is ${JSON.stringify(row.locator_kind)}`)
      }
      if (row.recovery_state !== 'NOT_RECOVERED') {
        fail(`row ${row.id} claims REPORTED_ONLY but recovery_state is ${JSON.stringify(row.recovery_state)}`)
      }
    } else if (row.claim_state === 'NEEDS_SOURCE') {
      if (row.source_locator !== null) {
        fail(`row ${row.id} is NEEDS_SOURCE but carries source_locator ${JSON.stringify(row.source_locator)}`)
      }
      if (row.locator_kind !== null) {
        fail(`row ${row.id} is NEEDS_SOURCE but carries locator_kind ${JSON.stringify(row.locator_kind)}`)
      }
    }

    const evidence = row.evidence
    if (!Array.isArray(evidence) || evidence.length === 0) {
      fail(`row ${row.id} has no evidence locators`)
    } else {
      for (let i = 0; i < evidence.length; i++) {
        const item = evidence[i]
        if (!item || typeof item.locator !== 'string' || typeof item.quote !== 'string') {
          fail(`row ${row.id} evidence[${i}] needs locator+quote strings`)
          continue
        }
        checkLocator(item.locator, item.quote, readLines, stats, fail, `row ${row.id} evidence[${i}]`)
      }
      if (typeof row.source_locator === 'string' && row.source_locator.trim() !== '') {
        const repeated = evidence.some((item) => item && item.locator === row.source_locator)
        if (!repeated) {
          fail(`row ${row.id} source_locator is not repeated in evidence and cannot be quote-verified`)
        }
      }
    }
  }

  const targets = doc.declared_targets
  if (!targets || typeof targets !== 'object') {
    fail('declared_targets is missing')
  } else {
    for (const key of ['books', 'named_npd_works', 'synopses', 'named_variants']) {
      if (!Number.isInteger(targets[key]) || targets[key] < 0) {
        fail(`declared_targets.${key} must be a non-negative integer`)
      }
    }
  }

  const bookIndices = []
  const synopsisIndices = []
  for (const row of rows) {
    if (row.kind === 'book') {
      if (!Number.isInteger(row.series_index) || row.series_index < 1) {
        fail(`book ${row.id} series_index must be a positive integer`)
      } else {
        bookIndices.push(row.series_index)
      }
    } else if (row.kind === 'synopsis') {
      if (!Number.isInteger(row.series_index) || row.series_index < 1) {
        fail(`synopsis ${row.id} series_index must be a positive integer`)
      } else {
        synopsisIndices.push(row.series_index)
      }
    } else if (row.series_index !== null) {
      fail(`row ${row.id} kind ${row.kind} must have series_index null`)
    }
  }

  function checkSeries(label, values, expected) {
    const unique = new Set(values)
    if (unique.size !== values.length) fail(`${label} series_index has duplicates`)
    if (values.length !== expected) {
      fail(`${label} rows ${values.length} !== declared ${expected}`)
    }
    for (let n = 1; n <= expected; n++) {
      if (!unique.has(n)) fail(`${label} series_index missing ${n}`)
    }
  }

  if (targets && Number.isInteger(targets.books)) checkSeries('book', bookIndices, targets.books)
  if (targets && Number.isInteger(targets.synopses)) {
    checkSeries('synopsis', synopsisIndices, targets.synopses)
  }

  const counts = doc.declared_counts
  if (!counts || typeof counts !== 'object') {
    fail('declared_counts is missing')
    return errors
  }
  if (counts.total !== rows.length) {
    fail(`declared total ${counts.total} !== rows ${rows.length}`)
  }

  const claimTally = tally(rows, 'claim_state', CLAIM_STATES)
  const kindTally = tally(rows, 'kind', KINDS)
  const rightsTally = tally(rows, 'rights_status', RIGHTS)
  const pageTally = tally(rows, 'page_status', PAGE_STATUSES)
  const chronologyTally = tally(rows, 'chronology_status', CHRONOLOGY_STATUSES)
  const recoveryTally = tally(rows, 'recovery_state', RECOVERY_STATES)

  compareTally('by_claim_state', counts.by_claim_state, claimTally, CLAIM_STATES, fail)
  compareTally('by_kind', counts.by_kind, kindTally, KINDS, fail)
  compareTally('by_rights', counts.by_rights, rightsTally, RIGHTS, fail)
  compareTally('by_page_status', counts.by_page_status, pageTally, PAGE_STATUSES, fail)
  compareTally('by_chronology_status', counts.by_chronology_status, chronologyTally, CHRONOLOGY_STATUSES, fail)
  compareTally('by_recovery_state', counts.by_recovery_state, recoveryTally, RECOVERY_STATES, fail)

  if (targets && typeof targets === 'object') {
    if (targets.books !== kindTally.book) {
      fail(`declared_targets.books ${targets.books} !== book rows ${kindTally.book}`)
    }
    if (targets.named_npd_works !== kindTally.scene) {
      fail(`declared_targets.named_npd_works ${targets.named_npd_works} !== scene rows ${kindTally.scene}`)
    }
    if (targets.synopses !== kindTally.synopsis) {
      fail(`declared_targets.synopses ${targets.synopses} !== synopsis rows ${kindTally.synopsis}`)
    }
    if (targets.named_variants !== kindTally.variant) {
      fail(`declared_targets.named_variants ${targets.named_variants} !== variant rows ${kindTally.variant}`)
    }
  }

  return errors
}

function selfTest() {
  const base = loadLedger()
  const readLines = makeLineReader()
  const baseErrors = validate(base, readLines, { locatorChecks: 0 })
  if (baseErrors.length > 0) {
    console.log(`SELF-TEST FAIL: baseline ledger is invalid: ${baseErrors[0]}`)
    return 1
  }

  const clone = () => JSON.parse(JSON.stringify(base))
  const bookRow = (d) => d.rows.find((r) => r.kind === 'book')
  const synopsisRow = (d) => d.rows.find((r) => r.kind === 'synopsis')
  const sceneRow = (d) => d.rows.find((r) => r.kind === 'scene')

  function markEvidenced(row, locator, quote) {
    row.claim_state = 'EVIDENCED'
    row.locator_kind = 'PRIMARY_ARTIFACT'
    row.page_status = 'FRAGMENT_LOCATED'
    row.recovery_state = 'FRAGMENT_LOCATED'
    row.source_locator = locator
    row.evidence = [{ locator, quote }]
  }

  const cases = [
    {
      name: 'EVIDENCED row without source_locator is rejected',
      mutate: (d) => {
        const row = bookRow(d)
        row.claim_state = 'EVIDENCED'
        row.locator_kind = 'PRIMARY_ARTIFACT'
        row.page_status = 'FRAGMENT_LOCATED'
        row.recovery_state = 'FRAGMENT_LOCATED'
        row.source_locator = null
      },
    },
    {
      name: 'EVIDENCED row with a locator line outside the file is rejected',
      mutate: (d) => {
        markEvidenced(bookRow(d), 'docs/vision/MASTER_VISION_NARRATIVE_XV.md:99999', 'placeholder')
      },
    },
    {
      name: 'EVIDENCED row with a quote absent from the cited line is rejected',
      mutate: (d) => {
        markEvidenced(bookRow(d), 'TODO.md:419', 'THE BATTERIES ARE FULLY RECOVERED')
      },
    },
    {
      name: 'EVIDENCED row marked NOT_RECOVERED is rejected',
      mutate: (d) => {
        markEvidenced(bookRow(d), 'TODO.md:419', 'Record four-book THE BATTERIES')
        bookRow(d).recovery_state = 'NOT_RECOVERED'
        bookRow(d).page_status = 'NOT_RECOVERED'
      },
    },
    {
      name: 'rights_status outside the M06-06 vocabulary is rejected',
      mutate: (d) => {
        bookRow(d).rights_status = 'PUBLIC_DOMAIN'
      },
    },
    {
      name: 'redefined rights_enum is rejected',
      mutate: (d) => {
        d.rights_enum.push('PUBLIC_DOMAIN')
      },
    },
    {
      name: 'duplicate id is rejected',
      mutate: (d) => {
        d.rows[1].id = d.rows[0].id
      },
    },
    {
      name: 'misdeclared total is rejected',
      mutate: (d) => {
        d.declared_counts.total = 23
      },
    },
    {
      name: 'misdeclared claim-state tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_claim_state.REPORTED_ONLY = 4
      },
    },
    {
      name: 'misdeclared kind tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_kind.synopsis = 14
      },
    },
    {
      name: 'misdeclared rights tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_rights.RIGHTS_UNKNOWN = 21
      },
    },
    {
      name: 'NEEDS_SOURCE row carrying a source_locator is rejected',
      mutate: (d) => {
        synopsisRow(d).source_locator = 'TODO.md:419'
      },
    },
    {
      name: 'REPORTED_ONLY row pointing at a primary artifact is rejected',
      mutate: (d) => {
        sceneRow(d).locator_kind = 'PRIMARY_ARTIFACT'
      },
    },
    {
      name: 'evidenced title_status with a null title is rejected',
      mutate: (d) => {
        bookRow(d).title_status = 'EVIDENCED_IN_REPOSITORY'
      },
    },
    {
      name: 'unknown kind is rejected',
      mutate: (d) => {
        bookRow(d).kind = 'manuscript'
      },
    },
    {
      name: 'book without a series_index is rejected',
      mutate: (d) => {
        delete bookRow(d).series_index
      },
    },
    {
      name: 'duplicate book series_index is rejected',
      mutate: (d) => {
        d.rows[1].series_index = d.rows[0].series_index
      },
    },
  ]

  let failed = 0
  for (const c of cases) {
    const mutated = clone()
    c.mutate(mutated)
    const errors = validate(mutated, readLines, { locatorChecks: 0 })
    const rejected = errors.length > 0
    console.log(`${rejected ? 'PASS' : 'FAIL'}  negative: ${c.name}`)
    if (rejected) console.log(`      first error: ${errors[0]}`)
    else failed++
  }
  console.log(
    failed === 0
      ? `SELF-TEST PASS: all ${cases.length} invalid datasets rejected`
      : `SELF-TEST FAIL: ${failed} invalid dataset(s) accepted`,
  )
  return failed
}

const args = process.argv.slice(2)
if (args.includes('--self-test')) {
  process.exit(selfTest() === 0 ? 0 : 1)
}

const doc = loadLedger()
const stats = { locatorChecks: 0 }
const errors = validate(doc, makeLineReader(), stats)
if (errors.length > 0) {
  for (const error of errors) console.error('VIOLATION ' + error)
  console.error(`FAIL: ${errors.length} violation(s)`)
  process.exit(1)
}

const counts = doc.declared_counts
console.log(`PASS rows=${doc.rows.length} unique ids=${new Set(doc.rows.map((r) => r.id)).size}`)
console.log(
  `PASS claim states EVIDENCED=${counts.by_claim_state.EVIDENCED} REPORTED_ONLY=${counts.by_claim_state.REPORTED_ONLY} NEEDS_SOURCE=${counts.by_claim_state.NEEDS_SOURCE}`,
)
console.log(
  `PASS kinds book=${counts.by_kind.book} scene=${counts.by_kind.scene} synopsis=${counts.by_kind.synopsis} variant=${counts.by_kind.variant}`,
)
console.log(
  `PASS rights RIGHTS_UNKNOWN=${counts.by_rights.RIGHTS_UNKNOWN} of ${doc.rows.length} (M06-06 vocabulary)`,
)
console.log(
  `PASS chronology UNRECORDED=${counts.by_chronology_status.UNRECORDED} LABEL_ONLY=${counts.by_chronology_status.LABEL_ONLY}`,
)
console.log(`PASS page status NOT_RECOVERED=${counts.by_page_status.NOT_RECOVERED} of ${doc.rows.length}`)
console.log(`PASS ${stats.locatorChecks} locator quotes resolved at the cited file:line`)
console.log('PASS zero EVIDENCED rows without a primary-artifact source_locator')
console.log('PASS declared counts match rows; book 1-4 and synopsis 1-15 series complete')
console.log('NOTE zero rows recovered: labels and reports are not manuscripts')
