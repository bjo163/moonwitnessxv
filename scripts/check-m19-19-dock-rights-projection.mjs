#!/usr/bin/env node
/**
 * scripts/check-m19-19-dock-rights-projection.mjs
 *
 * M19-19 gate: the Dock public research/reader projection ledger is internally
 * consistent and every quoted source resolves verbatim at its cited file:line.
 *
 * What this proves:
 *   1. Every claim id is unique and every status is from the declared vocabulary.
 *   2. Every source.quote resolves verbatim on the cited line of the cited file.
 *   3. Declared tallies (total and per status) equal the actual rows.
 *   4. Every required invariant is declared and backed by at least one EVIDENCED row.
 *   5. ABSENT rows carry a check that really shows the absence:
 *        - file_absent: the path does not exist
 *        - no_match:    a pattern occurs nowhere under the listed files/dirs
 *   6. --self-test proves the validator rejects quote drift, tally mismatch, a
 *      missing invariant, a fabricated source file, and a false file_absent
 *      check; it also accepts a valid in-memory fixture.
 *
 * What this does not prove: that a browser or deployed Dock instance behaves as
 * the source says. The runtime evidence is the focused node:test runs recorded
 * in docs/audit/M19-19-dock-rights-projection.md. No network, no filesystem
 * writes.
 *
 * Run:            node scripts/check-m19-19-dock-rights-projection.mjs
 * Negative test:  node scripts/check-m19-19-dock-rights-projection.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_LEDGER = 'docs/data/M19-19-dock-rights-projection.json'
const STATUSES = ['EVIDENCED', 'ABSENT', 'NEEDS_SOURCE']
const REQUIRED_INVARIANTS = [
  'rights_status_gate',
  'consent_clearance_gate',
  'blocked_state_path',
  'compare_page_no_text',
]
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.js', '.json', '.md'])
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'coverage', '.git'])

function isFilled(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function isHexSha(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value)
}

function normalizeRel(value) {
  if (!isFilled(value)) return null
  const clean = value.replace(/\\/g, '/').replace(/^\.\//, '')
  if (clean.startsWith('/') || /^[A-Za-z]:/.test(clean)) return null
  if (clean.split('/').includes('..')) return null
  return clean
}

function readLinesOf(io, file) {
  return io.readFile(file).split(/\r?\n/)
}

function makeRealIo() {
  const walk = (rel) => {
    const absolute = resolve(ROOT, rel)
    if (!existsSync(absolute)) return []
    const info = statSync(absolute)
    if (info.isFile()) return [rel.replace(/\\/g, '/')]
    const found = []
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue
      const child = join(rel, entry.name).replace(/\\/g, '/')
      if (entry.isDirectory()) found.push(...walk(child))
      else if (TEXT_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf('.')))) found.push(child)
    }
    return found
  }
  return {
    exists: (rel) => existsSync(resolve(ROOT, rel)),
    readFile: (rel) => readFileSync(resolve(ROOT, rel), 'utf8'),
    listFiles: (rel) => walk(rel),
  }
}

/** In-memory filesystem for --self-test. Keys are repo-relative POSIX paths. */
function makeMemoryIo(files) {
  return {
    exists: (rel) => Object.prototype.hasOwnProperty.call(files, rel),
    readFile: (rel) => files[rel],
    listFiles: (rel) => {
      const prefix = rel === '.' ? '' : `${rel.replace(/\/$/, '')}/`
      return Object.keys(files)
        .filter((key) => key === rel || key.startsWith(prefix))
        .sort()
    },
  }
}

function addCheck(io, check, where, fail, stats) {
  if (!check || typeof check !== 'object') {
    fail(`${where} has no check object`)
    return
  }
  if (check.kind === 'file_absent') {
    const path = normalizeRel(check.path)
    if (!path) {
      fail(`${where} file_absent check has an unsafe or empty path`)
      return
    }
    if (io.exists(path)) fail(`${where} claims ${path} is absent, but it exists`)
    stats.fileAbsentChecks++
    return
  }
  if (check.kind === 'no_match') {
    let pattern
    try {
      pattern = new RegExp(check.pattern)
    } catch {
      fail(`${where} no_match check has an invalid pattern`)
      return
    }
    if (!Array.isArray(check.files) || check.files.length === 0) {
      fail(`${where} no_match check needs a non-empty files array`)
      return
    }
    let scanned = 0
    for (const entry of check.files) {
      const rel = normalizeRel(entry)
      if (!rel) {
        fail(`${where} no_match check has an unsafe path ${JSON.stringify(entry)}`)
        continue
      }
      for (const file of io.listFiles(rel)) {
        const lines = readLinesOf(io, file)
        scanned++
        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i])) {
            fail(`${where} no_match ${pattern} found at ${file}:${i + 1}`)
          }
        }
      }
    }
    if (scanned === 0) fail(`${where} no_match check scanned no files under ${check.files.join(', ')}`)
    stats.noMatchChecks++
    stats.filesScanned += scanned
    return
  }
  fail(`${where} has unknown check kind ${JSON.stringify(check.kind)}`)
}

function validate(doc, io) {
  const errors = []
  const fail = (message) => errors.push(message)
  const stats = { quoteChecks: 0, fileAbsentChecks: 0, noMatchChecks: 0, filesScanned: 0 }

  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    return { errors: ['ledger is not a JSON object'], stats }
  }
  if (doc.task !== 'M19-19') fail(`task ${JSON.stringify(doc.task)} !== "M19-19"`)
  if (!isHexSha(doc.baseline_sha)) fail(`baseline_sha ${JSON.stringify(doc.baseline_sha)} is not a 40-character hex SHA`)
  if (!Array.isArray(doc.status_enum) || doc.status_enum.join('|') !== STATUSES.join('|')) {
    fail('status_enum does not match the validator vocabulary')
  }

  const rows = Array.isArray(doc.claims) ? doc.claims : []
  if (rows.length === 0) fail('claims is empty or not an array')

  const required = Array.isArray(doc.required_invariants) ? doc.required_invariants : []
  if (required.length === 0) fail('required_invariants is empty or not an array')
  if (new Set(required).size !== required.length) fail('required_invariants contains duplicates')
  for (const invariant of REQUIRED_INVARIANTS) {
    if (!required.includes(invariant)) fail(`required invariant ${invariant} is not declared`)
  }
  for (const invariant of required) {
    if (!REQUIRED_INVARIANTS.includes(invariant)) fail(`unknown required invariant ${JSON.stringify(invariant)}`)
  }

  const ids = new Set()
  const perInvariant = new Map()
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const where = row && isFilled(row.id) ? `row ${row.id}` : `row at index ${index}`
    if (!row || typeof row !== 'object') {
      fail(`row at index ${index} is not an object`)
      continue
    }
    if (!isFilled(row.id) || !/^[A-Z][A-Za-z0-9-]*$/.test(row.id)) {
      fail(`${where} id must match ^[A-Z][A-Za-z0-9-]*$`)
    } else if (ids.has(row.id)) {
      fail(`duplicate id ${row.id}`)
    } else {
      ids.add(row.id)
    }
    if (!STATUSES.includes(row.status)) {
      fail(`${where} status ${JSON.stringify(row.status)} is not in ${STATUSES.join('|')}`)
    }
    if (!isFilled(row.invariant)) fail(`${where} has no invariant`)
    if (!isFilled(row.claim)) fail(`${where} has no claim text`)
    if (isFilled(row.invariant)) {
      const tally = perInvariant.get(row.invariant) ?? { total: 0, evidenced: 0 }
      tally.total++
      if (row.status === 'EVIDENCED') tally.evidenced++
      perInvariant.set(row.invariant, tally)
    }

    const source = row.source
    if (!source || typeof source !== 'object') {
      fail(`${where} has no source object`)
    } else {
      const file = normalizeRel(source.file)
      if (!file) {
        fail(`${where} source.file is empty or unsafe`)
      } else if (!io.exists(file)) {
        fail(`${where} source file ${file} does not exist`)
      } else if (!Number.isInteger(source.line) || source.line < 1) {
        fail(`${where} source.line must be a positive integer`)
      } else if (!isFilled(source.quote)) {
        fail(`${where} source.quote is empty`)
      } else {
        const lines = readLinesOf(io, file)
        if (source.line > lines.length) {
          fail(`${where} source.line ${source.line} is outside ${file} lines 1-${lines.length}`)
        } else {
          const quote = source.quote.trim()
          if (!lines[source.line - 1].includes(quote)) {
            fail(`${where} quote ${JSON.stringify(quote)} not found verbatim at ${file}:${source.line}`)
          } else {
            stats.quoteChecks++
          }
        }
      }
    }

    if (row.status === 'ABSENT' && !row.check) {
      fail(`${where} is ABSENT but carries no check proving the absence`)
    }
    if (row.check) addCheck(io, row.check, where, fail, stats)
  }

  for (const invariant of required) {
    const tally = perInvariant.get(invariant)
    if (!tally || tally.total === 0) fail(`required invariant ${invariant} has no rows`)
    else if (tally.evidenced === 0) fail(`required invariant ${invariant} has no EVIDENCED row`)
  }

  const tallies = doc.tallies
  const expected = {
    total: rows.length,
    EVIDENCED: rows.filter((row) => row && row.status === 'EVIDENCED').length,
    ABSENT: rows.filter((row) => row && row.status === 'ABSENT').length,
    NEEDS_SOURCE: rows.filter((row) => row && row.status === 'NEEDS_SOURCE').length,
  }
  if (!tallies || typeof tallies !== 'object') {
    fail('tallies is missing')
  } else {
    const expectedKeys = ['total', ...STATUSES]
    for (const key of expectedKeys) {
      if (tallies[key] !== expected[key]) {
        fail(`declared tallies.${key}=${tallies[key]} !== actual ${expected[key]}`)
      }
    }
    for (const key of Object.keys(tallies)) {
      if (!expectedKeys.includes(key)) fail(`tallies has unknown key ${JSON.stringify(key)}`)
    }
  }

  return { errors, stats, perInvariant, tallies: expected }
}

function loadLedger(path) {
  return JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'))
}

function selfTest() {
  const files = {
    'packages/a.ts': ["export const CLEARED = 'X'", 'const blocked = true'].join('\n'),
    'apps/b.tsx': '<Alert tone="hot">{copy.errorResearchUnavailable}</Alert>',
  }
  const io = makeMemoryIo(files)
  const base = () => ({
    schema: 'm19-19-dock-rights-projection/1',
    task: 'M19-19',
    baseline_sha: '0123456789abcdef0123456789abcdef01234567',
    status_enum: [...STATUSES],
    required_invariants: [...REQUIRED_INVARIANTS],
    tallies: { total: 4, EVIDENCED: 4, ABSENT: 0, NEEDS_SOURCE: 0 },
    claims: [
      {
        id: 'C1-RIGHTS',
        invariant: 'rights_status_gate',
        status: 'EVIDENCED',
        claim: 'clearance token exists',
        source: { file: 'packages/a.ts', line: 1, quote: "export const CLEARED = 'X'" },
      },
      {
        id: 'C2-REVIEW',
        invariant: 'consent_clearance_gate',
        status: 'EVIDENCED',
        claim: 'withholding alert exists',
        source: {
          file: 'apps/b.tsx',
          line: 1,
          quote: '<Alert tone="hot">{copy.errorResearchUnavailable}</Alert>',
        },
      },
      {
        id: 'C3-BLOCKED',
        invariant: 'blocked_state_path',
        status: 'EVIDENCED',
        claim: 'blocked flag exists',
        source: { file: 'packages/a.ts', line: 2, quote: 'const blocked = true' },
      },
      {
        id: 'C4-COMPARE',
        invariant: 'compare_page_no_text',
        status: 'EVIDENCED',
        claim: 'compare page is alert-only',
        source: {
          file: 'apps/b.tsx',
          line: 1,
          quote: '<Alert tone="hot">{copy.errorResearchUnavailable}</Alert>',
        },
      },
    ],
  })

  const cases = [
    {
      name: 'valid fixture is accepted',
      expect: null,
      mutate: () => {},
    },
    {
      name: 'valid ABSENT fixture with a passing file_absent check is accepted',
      expect: null,
      mutate: (doc) => {
        doc.claims.push({
          id: 'A1-MISSING',
          invariant: 'negative_surface',
          status: 'ABSENT',
          claim: 'the module is absent',
          source: { file: 'packages/a.ts', line: 2, quote: 'const blocked = true' },
          check: { kind: 'file_absent', path: 'packages/ghost.ts' },
        })
        doc.tallies = { total: 5, EVIDENCED: 4, ABSENT: 1, NEEDS_SOURCE: 0 }
      },
    },
    {
      name: 'quote drift is rejected',
      expect: 'not found verbatim',
      mutate: (doc) => {
        doc.claims[0].source.quote = "export const CLEARED = 'NOT-THIS'"
      },
    },
    {
      name: 'tally mismatch is rejected',
      expect: 'declared tallies.total',
      mutate: (doc) => {
        doc.tallies.total = 99
      },
    },
    {
      name: 'missing required invariant is rejected',
      expect: 'has no rows',
      mutate: (doc) => {
        doc.claims = doc.claims.filter((row) => row.invariant !== 'compare_page_no_text')
        doc.tallies = { total: 3, EVIDENCED: 3, ABSENT: 0, NEEDS_SOURCE: 0 }
      },
    },
    {
      name: 'fabricated source file is rejected',
      expect: 'does not exist',
      mutate: (doc) => {
        doc.claims[0].source.file = 'packages/ghost.ts'
      },
    },
    {
      name: 'false file_absent check is rejected',
      expect: 'but it exists',
      mutate: (doc) => {
        doc.claims.push({
          id: 'A2-LIAR',
          invariant: 'negative_surface',
          status: 'ABSENT',
          claim: 'the module is absent',
          source: { file: 'packages/a.ts', line: 1, quote: "export const CLEARED = 'X'" },
          check: { kind: 'file_absent', path: 'packages/a.ts' },
        })
        doc.tallies = { total: 5, EVIDENCED: 4, ABSENT: 1, NEEDS_SOURCE: 0 }
      },
    },
  ]

  let failed = 0
  for (const testCase of cases) {
    const doc = base()
    testCase.mutate(doc)
    const { errors } = validate(doc, io)
    const shouldAccept = testCase.expect === null
    const behaved = shouldAccept ? errors.length === 0 : errors.some((error) => error.includes(testCase.expect))
    console.log(`${behaved ? 'PASS' : 'FAIL'}  ${shouldAccept ? 'accept' : 'reject'}: ${testCase.name}`)
    if (!behaved) {
      failed++
      console.log(`      expected ${shouldAccept ? 'no errors' : JSON.stringify(testCase.expect)}`)
      console.log(`      observed: ${errors.length === 0 ? '(no errors)' : errors.slice(0, 3).join(' | ')}`)
    }
  }
  console.log(
    failed === 0
      ? `SELF-TEST PASS: ${cases.length}/${cases.length} fixtures behaved as expected`
      : `SELF-TEST FAIL: ${failed}/${cases.length} fixture(s) misbehaved`,
  )
  return failed
}

const args = process.argv.slice(2)
if (args.includes('--self-test')) {
  process.exit(selfTest() === 0 ? 0 : 1)
}

const ledgerArg = args.find((arg) => arg.startsWith('--ledger='))
const ledgerPath = ledgerArg ? ledgerArg.slice('--ledger='.length) : DEFAULT_LEDGER
let doc
try {
  doc = loadLedger(ledgerPath)
} catch (error) {
  console.error(`FAIL: cannot read ${ledgerPath}: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}

const { errors, stats, perInvariant, tallies } = validate(doc, makeRealIo())
if (errors.length > 0) {
  for (const error of errors) console.error(`VIOLATION ${error}`)
  console.error(`FAIL: ${errors.length} violation(s)`)
  process.exit(1)
}
console.log(`PASS ledger=${ledgerPath} rows=${tallies.total} unique_ids=${new Set(doc.claims.map((row) => row.id)).size}`)
console.log(
  `PASS tallies total=${tallies.total} EVIDENCED=${tallies.EVIDENCED} ABSENT=${tallies.ABSENT} NEEDS_SOURCE=${tallies.NEEDS_SOURCE}`,
)
console.log(
  `PASS invariants ${REQUIRED_INVARIANTS.map((name) => `${name}=${perInvariant.get(name)?.evidenced ?? 0}`).join(' ')}`,
)
console.log(`PASS ${stats.quoteChecks} quotes resolved verbatim at their cited file:line`)
console.log(
  `PASS checks file_absent=${stats.fileAbsentChecks} no_match=${stats.noMatchChecks} files_scanned=${stats.filesScanned}`,
)
