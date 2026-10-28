#!/usr/bin/env node
/**
 * M33-01 generator inventory validator (dependency-free).
 *
 * Checks docs/data/M33-01-generator-inventory.json:
 *   - every cited quote resolves verbatim at its file:line;
 *   - declared tallies equal the actual rows;
 *   - every IMPLEMENTED row cites executable source;
 *   - PLANNED and ABSENT rows cite non-executable planning/audit evidence;
 *   - no PLANNED row is presented as built;
 *   - no source path is absolute, escaping, or invented.
 *
 * Read-only: no network, no writes. Exit 0 on pass, 1 on failure.
 * Usage:
 *   node scripts/check-m33-01-generator-inventory.mjs
 *   node scripts/check-m33-01-generator-inventory.mjs --self-test
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_LEDGER = join(ROOT, 'docs', 'data', 'M33-01-generator-inventory.json')
const STATUSES = ['IMPLEMENTED', 'PLANNED', 'ABSENT', 'NEEDS_SOURCE']
const EXECUTABLE = /\.(?:ts|tsx|mjs|cjs|js|jsx)$/i
const BUILT_CLAIM = /\b(?:is|are|was|were|now|already)\s+(?:implemented|built|shipped|live|complete)\b/i
const MIN_QUOTE = 16

function isExecutableSource(file) {
  return EXECUTABLE.test(file)
}

function normaliseRelative(file) {
  return normalize(file).split('\\').join('/')
}

function readLines(abs, cache) {
  if (!cache.has(abs)) {
    cache.set(abs, readFileSync(abs, 'utf8').split(/\r?\n/))
  }
  return cache.get(abs)
}

export function validate(doc, options = {}) {
  const root = options.root ?? ROOT
  const errors = []
  const add = (code, message) => errors.push({ code, message })

  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    add('DOC_SHAPE', 'ledger must be a JSON object')
    return { errors, tallies: {} }
  }
  if (doc.schema !== 'moonwitness-m33-01-generator-inventory-v1') {
    add('SCHEMA', 'unexpected schema value')
  }
  if (doc.task !== 'M33-01') {
    add('TASK', 'task must be M33-01')
  }
  if (!Array.isArray(doc.rows) || doc.rows.length === 0) {
    add('ROWS', 'rows must be a non-empty array')
    return { errors, tallies: {} }
  }

  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]))
  const seenIds = new Set()
  const lineCache = new Map()

  doc.rows.forEach((row, index) => {
    const at = `rows[${index}]`
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      add('ROW_SHAPE', `${at} must be an object`)
      return
    }
    for (const key of ['id', 'surface', 'claim']) {
      if (typeof row[key] !== 'string' || row[key].trim() === '') {
        add('FIELD', `${at}.${key} must be a non-empty string`)
      }
    }
    if (!STATUSES.includes(row.status)) {
      add('STATUS', `${at}.status must be one of ${STATUSES.join(', ')}`)
    } else {
      counts[row.status] += 1
    }
    if (typeof row.id === 'string') {
      if (seenIds.has(row.id)) {
        add('DUPLICATE_ID', `${at}.id duplicates ${row.id}`)
      }
      seenIds.add(row.id)
    }

    const source = row.source
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      add('SOURCE_SHAPE', `${at}.source must be an object`)
      return
    }
    const { file, line, quote } = source
    if (typeof file !== 'string' || file.trim() === '') {
      add('SOURCE_FILE', `${at}.source.file must be a non-empty string`)
      return
    }
    if (!Number.isInteger(line) || line < 1) {
      add('SOURCE_LINE', `${at}.source.line must be a positive integer`)
      return
    }
    if (typeof quote !== 'string' || quote.trim().length < MIN_QUOTE) {
      add('QUOTE_SHORT', `${at}.source.quote must be at least ${MIN_QUOTE} characters`)
      return
    }
    if (/[\r\n]/.test(quote)) {
      add('QUOTE_MULTILINE', `${at}.source.quote must stay on one line`)
    }
    if (isAbsolute(file) || /^[A-Za-z]:/.test(file) || /\\/.test(file)) {
      add('PATH_SHAPE', `${at}.source.file must be a repo-relative POSIX path`)
      return
    }
    const relative = normaliseRelative(file)
    const segments = relative.split('/')
    if (segments.includes('..') || segments.includes('.') || relative.startsWith('/')) {
      add('PATH_SHAPE', `${at}.source.file must not escape the repository`)
      return
    }
    if (relative.includes('node_modules') || relative.includes('.next/') || relative.includes('dist/')) {
      add('PATH_SHAPE', `${at}.source.file must cite source, not build output`)
      return
    }

    const abs = join(root, relative)
    if (!existsSync(abs) || !statSync(abs).isFile()) {
      add('PATH_MISSING', `${at}.source.file does not exist: ${relative}`)
      return
    }
    const lines = readLines(abs, lineCache)
    if (line > lines.length) {
      add('LINE_RANGE', `${at}.source.line ${line} exceeds ${relative} (${lines.length} lines)`)
    } else if (!lines[line - 1].includes(quote)) {
      add('QUOTE_MISMATCH', `${at}.source.quote does not resolve at ${relative}:${line}`)
    }

    const executable = isExecutableSource(relative)
    if (row.status === 'IMPLEMENTED' && !executable) {
      add('SOURCE_NOT_EXECUTABLE', `${at} is IMPLEMENTED but cites non-executable ${relative}`)
    }
    if ((row.status === 'PLANNED' || row.status === 'ABSENT') && executable) {
      add('SOURCE_NOT_PLANNING', `${at} is ${row.status} but cites executable ${relative}`)
    }
    if (row.status === 'PLANNED' && BUILT_CLAIM.test(`${row.claim ?? ''} ${row.notes ?? ''}`)) {
      add('PLANNED_PRESENTED_AS_BUILT', `${at} is PLANNED but its text claims a built state`)
    }
  })

  const tallies = doc.tallies
  if (!tallies || typeof tallies !== 'object' || Array.isArray(tallies)) {
    add('TALLY_MISSING', 'tallies object is required')
  } else {
    for (const status of STATUSES) {
      if (tallies[status] !== counts[status]) {
        add('TALLY_MISMATCH', `declared ${status}=${tallies[status]} but rows contain ${counts[status]}`)
      }
    }
    if (tallies.total !== doc.rows.length) {
      add('TALLY_MISMATCH', `declared total=${tallies.total} but rows contain ${doc.rows.length}`)
    }
    const declaredSum = STATUSES.reduce(
      (sum, status) => sum + (Number.isInteger(tallies[status]) ? tallies[status] : 0),
      0,
    )
    if (declaredSum !== tallies.total) {
      add('TALLY_SUM', `status tallies sum to ${declaredSum}, not total=${tallies.total}`)
    }
  }

  return { errors, tallies: counts }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function hasCode(result, code) {
  return result.errors.some((error) => error.code === code)
}

function runSelfTest() {
  const raw = readFileSync(DEFAULT_LEDGER, 'utf8')
  const base = JSON.parse(raw)
  const failures = []

  const valid = validate(base)
  if (valid.errors.length > 0) {
    failures.push(`valid fixture rejected: ${valid.errors.map((e) => e.code).join(', ')}`)
  }

  const quoteDrift = clone(base)
  quoteDrift.rows[0].source.quote = 'THIS QUOTE IS NOT PRESENT IN THE CITED FILE AT ALL'
  const quoteResult = validate(quoteDrift)
  if (!hasCode(quoteResult, 'QUOTE_MISMATCH')) {
    failures.push('quote drift was not rejected with QUOTE_MISMATCH')
  }

  const upgrade = clone(base)
  const planned = upgrade.rows.find((row) => row.status === 'PLANNED')
  if (!planned) {
    failures.push('no PLANNED row available for the status-upgrade fixture')
  } else {
    planned.status = 'IMPLEMENTED'
    upgrade.tallies.PLANNED -= 1
    upgrade.tallies.IMPLEMENTED += 1
    const upgradeResult = validate(upgrade)
    if (!hasCode(upgradeResult, 'SOURCE_NOT_EXECUTABLE')) {
      failures.push('PLANNED-to-IMPLEMENTED upgrade was not rejected with SOURCE_NOT_EXECUTABLE')
    }
  }

  const tallyDrift = clone(base)
  tallyDrift.tallies.total -= 1
  const tallyResult = validate(tallyDrift)
  if (!hasCode(tallyResult, 'TALLY_MISMATCH') && !hasCode(tallyResult, 'TALLY_SUM')) {
    failures.push('tally drift was not rejected with TALLY_MISMATCH/TALLY_SUM')
  }

  const fabricated = clone(base)
  fabricated.rows[0].source.file = 'apps/dock/src/m33-01-fabricated-generator.tsx'
  fabricated.rows[0].source.line = 1
  const fabricatedResult = validate(fabricated)
  if (!hasCode(fabricatedResult, 'PATH_MISSING')) {
    failures.push('fabricated path was not rejected with PATH_MISSING')
  }

  if (failures.length > 0) {
    console.error('M33-01 self-test: FAIL')
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exitCode = 1
    return
  }
  console.log('M33-01 self-test: PASS')
  console.log('  valid fixture accepted')
  console.log('  quote drift rejected (QUOTE_MISMATCH)')
  console.log('  PLANNED-to-IMPLEMENTED upgrade rejected (SOURCE_NOT_EXECUTABLE)')
  console.log('  tally drift rejected (TALLY_MISMATCH/TALLY_SUM)')
  console.log('  fabricated path rejected (PATH_MISSING)')
}

function main(argv) {
  const selfTest = argv.includes('--self-test')
  if (selfTest) {
    runSelfTest()
    return
  }

  const target = argv.find((arg) => !arg.startsWith('--')) ?? DEFAULT_LEDGER
  const doc = JSON.parse(readFileSync(target, 'utf8'))
  const { errors, tallies } = validate(doc)
  if (errors.length > 0) {
    console.error(`M33-01 inventory check: FAIL (${errors.length} error(s))`)
    for (const error of errors) console.error(`  - ${error.code}: ${error.message}`)
    process.exitCode = 1
    return
  }
  console.log('M33-01 inventory check: PASS')
  console.log(
    `  rows=${doc.rows.length} implemented=${tallies.IMPLEMENTED} planned=${tallies.PLANNED} ` +
      `absent=${tallies.ABSENT} needs_source=${tallies.NEEDS_SOURCE}`,
  )
}

main(process.argv.slice(2))
