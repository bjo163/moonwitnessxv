#!/usr/bin/env node
/**
 * M33-02 SHADOW host placement decision validator (dependency-free).
 *
 * Checks docs/design/M33-02-shadow-host-placement.md:
 *   - the artifact declares itself a RECOMMENDATION, not an accepted decision;
 *   - every required section is present, once, in order;
 *   - the shared constraints (identity authority, SQL owner, Hub, session, locale)
 *     are still stated and the artifact does not create apps/shadow;
 *   - exactly one HOST-* option is marked Recommended and the
 *     **Recommendation:** line names that same option;
 *   - every evidence anchor quote resolves verbatim at its cited file:line;
 *   - anchors cover the source families the decision depends on.
 *
 * Read-only: no network, no writes. Exit 0 on pass, 1 on failure.
 * Usage:
 *   node scripts/check-m33-02-shadow-host-placement.mjs
 *   node scripts/check-m33-02-shadow-host-placement.mjs --self-test
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_DOC = join(ROOT, 'docs', 'design', 'M33-02-shadow-host-placement.md')

const SECTIONS = [
  '## 1. Question and scope',
  '## 2. Options compared',
  '## 3. Recommendation',
  '## 4. Shared constraints that bind either host',
  '## 5. Consequences',
  '## 6. Prerequisites before either option is implemented',
  '## 7. Evidence anchors',
  '## 8. Non-goals and stop conditions',
  '## 9. Limitations and evidence status',
]

/** Exact phrases the decision loses its meaning without. */
const INVARIANTS = [
  { id: 'IDENTITY_AUTHORITY', needle: 'ARSY remains the sole identity authority' },
  { id: 'NO_SECOND_LOGIN', needle: 'no second login' },
  { id: 'NO_NEW_SQL_OWNER', needle: 'No new SQL owner.' },
  { id: 'NO_SECOND_HUB', needle: 'No second Hub.' },
  { id: 'SHARED_SESSION', needle: 'One shared auth/session boundary.' },
  { id: 'LOCALE', needle: '`id`/`en`' },
  { id: 'NO_APPS_SHADOW', needle: 'No `apps/shadow` workspace is created by this artifact' },
  { id: 'NO_STATUS_CHANGE', needle: 'No TODO row, ADR or application source is changed' },
]

/** Evidence must come from these source families, not just one document. */
const REQUIRED_ANCHOR_PREFIXES = [
  ['BLUEPRINT.md', 2],
  ['TODO.md', 2],
  ['docs/decisions/', 2],
  ['apps/headquarters/', 2],
  ['apps/dock/', 1],
]

const MIN_ANCHORS = 10
const MIN_QUOTE = 12
const OPTION_ROW = /^\|\s*`(HOST-[A-Z-]+)`\s*\|/
const ANCHOR_ROW = /^\|\s*A\d{2}\s*\|/

function normaliseRelative(file) {
  return normalize(file).split('\\').join('/')
}

function parseCells(line) {
  return line.split('|').map((cell) => cell.trim())
}

export function validate(text, options = {}) {
  const root = options.root ?? ROOT
  const errors = []
  const add = (code, message) => errors.push({ code, message })
  const report = { sections: 0, options: [], recommended: null, anchors: 0 }

  if (typeof text !== 'string' || text.trim() === '') {
    add('DOC_EMPTY', 'document is empty')
    return { errors, report }
  }

  const lines = text.split(/\r?\n/)

  // 1. Status must stay a recommendation, never an accepted decision.
  const statusLine = lines.find((line) => line.startsWith('**Status:**'))
  if (statusLine === undefined) {
    add('STATUS_MISSING', 'a **Status:** line is required')
  } else if (!/^\*\*Status:\*\*\s+RECOMMENDATION\b/.test(statusLine)) {
    if (/\b(ACCEPTED|RATIFIED|APPROVED)\b/.test(statusLine)) {
      add('STATUS_NOT_RECOMMENDATION', 'status claims an accepted/ratified decision; a leaf artifact may only recommend')
    } else {
      add('STATUS_SHAPE', 'status must start with "**Status:** RECOMMENDATION"')
    }
  }

  // 2. Required sections, exactly once, in order.
  const sectionIndex = new Map()
  for (const heading of SECTIONS) {
    const matches = lines.reduce((acc, line, index) => (line.trim() === heading ? [...acc, index] : acc), [])
    if (matches.length === 0) {
      add('SECTION_MISSING', `missing section "${heading}"`)
    } else if (matches.length > 1) {
      add('SECTION_DUPLICATE', `section "${heading}" appears ${matches.length} times`)
    } else {
      sectionIndex.set(heading, matches[0])
    }
  }
  report.sections = sectionIndex.size
  const ordered = SECTIONS.map((heading) => sectionIndex.get(heading)).filter((index) => index !== undefined)
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index] <= ordered[index - 1]) {
      add('SECTION_ORDER', 'required sections are out of order')
      break
    }
  }

  // 3. Shared constraints survive editing.
  for (const invariant of INVARIANTS) {
    if (!text.includes(invariant.needle)) {
      add('INVARIANT_MISSING', `required shared constraint "${invariant.id}" is missing: ${invariant.needle}`)
    }
  }

  // 4. Exactly one recommended option, agreeing with the recommendation line.
  const optionRows = lines.filter((line) => OPTION_ROW.test(line))
  if (optionRows.length < 2) {
    add('OPTION_COUNT', `at least two HOST-* options are required, found ${optionRows.length}`)
  }
  const recommended = []
  for (const line of optionRows) {
    const id = OPTION_ROW.exec(line)[1]
    const cells = parseCells(line)
    const decision = [...cells].reverse().find((cell) => cell !== '') ?? ''
    const normalised = decision.replace(/\*/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
    let verdict
    if (normalised === 'recommended') {
      verdict = 'recommended'
      recommended.push(id)
    } else if (normalised.startsWith('not recommended') || normalised.startsWith('rejected')) {
      verdict = 'not-recommended'
    } else {
      add('OPTION_DECISION_INVALID', `${id} decision cell must be "**Recommended**" or "Not recommended ...", got "${decision}"`)
      continue
    }
    report.options.push({ id, verdict })
  }
  if (optionRows.length > 0 && recommended.length !== 1) {
    add('RECOMMENDATION_AMBIGUOUS', `exactly one option must be Recommended, found ${recommended.length}`)
  }

  const recommendationLines = lines.filter((line) => line.startsWith('**Recommendation:**'))
  if (recommendationLines.length === 0) {
    add('RECOMMENDATION_MISSING', 'a **Recommendation:** line is required')
  } else if (recommendationLines.length > 1) {
    add('RECOMMENDATION_DUPLICATE', 'only one **Recommendation:** line is allowed')
  } else {
    const match = /^\*\*Recommendation:\*\*\s+`?(HOST-[A-Z-]+)`?/.exec(recommendationLines[0])
    if (!match) {
      add('RECOMMENDATION_SHAPE', 'the recommendation line must name one HOST-* option')
    } else if (recommended.length === 1 && match[1] !== recommended[0]) {
      add('RECOMMENDATION_MISMATCH', `recommendation names ${match[1]} but ${recommended[0]} is marked Recommended`)
    } else {
      report.recommended = match[1]
    }
  }

  // 5. Evidence anchors resolve verbatim.
  const anchorStart = sectionIndex.get('## 7. Evidence anchors')
  const anchorEnd = sectionIndex.get('## 8. Non-goals and stop conditions')
  const anchorLines =
    anchorStart === undefined ? [] : lines.slice(anchorStart + 1, anchorEnd ?? lines.length).filter((line) => ANCHOR_ROW.test(line))
  if (anchorStart !== undefined && anchorLines.length < MIN_ANCHORS) {
    add('ANCHOR_COUNT', `at least ${MIN_ANCHORS} evidence anchors are required, found ${anchorLines.length}`)
  }
  report.anchors = anchorLines.length

  const seenIds = new Set()
  const resolvedPaths = []
  const lineCache = new Map()
  for (const line of anchorLines) {
    const cells = parseCells(line)
    if (cells.length !== 5) {
      add('ANCHOR_ROW_SHAPE', `anchor row must have exactly three cells: ${line}`)
      continue
    }
    const id = cells[1]
    const locator = cells[2]
    const quote = cells[3]
    if (seenIds.has(id)) {
      add('ANCHOR_DUPLICATE_ID', `anchor id ${id} is duplicated`)
    }
    seenIds.add(id)

    const locatorMatch = /^`([^`]+):(\d+)`$/.exec(locator)
    if (!locatorMatch) {
      add('ANCHOR_LOCATOR', `${id} locator must be \`path:line\`, got "${locator}"`)
      continue
    }
    const file = locatorMatch[1]
    const lineNumber = Number(locatorMatch[2])

    if (quote.length < MIN_QUOTE) {
      add('ANCHOR_QUOTE_SHORT', `${id} quote must be at least ${MIN_QUOTE} characters`)
      continue
    }
    if (isAbsolute(file) || /^[A-Za-z]:/.test(file) || file.includes('\\')) {
      add('ANCHOR_PATH_SHAPE', `${id} must cite a repo-relative POSIX path`)
      continue
    }
    const relative = normaliseRelative(file)
    const segments = relative.split('/')
    if (relative.startsWith('/') || segments.includes('..') || segments.includes('.')) {
      add('ANCHOR_PATH_SHAPE', `${id} path must not escape the repository`)
      continue
    }
    if (relative.includes('node_modules') || relative.includes('.next/') || relative.includes('dist/')) {
      add('ANCHOR_PATH_SHAPE', `${id} must cite source, not build output`)
      continue
    }
    resolvedPaths.push(relative)

    const absolute = join(root, relative)
    if (!existsSync(absolute) || !statSync(absolute).isFile()) {
      add('ANCHOR_PATH_MISSING', `${id} cites a file that does not exist: ${relative}`)
      continue
    }
    if (!lineCache.has(absolute)) {
      lineCache.set(absolute, readFileSync(absolute, 'utf8').split(/\r?\n/))
    }
    const sourceLines = lineCache.get(absolute)
    if (lineNumber < 1 || lineNumber > sourceLines.length) {
      add('ANCHOR_LINE_RANGE', `${id} line ${lineNumber} exceeds ${relative} (${sourceLines.length} lines)`)
    } else if (!sourceLines[lineNumber - 1].includes(quote)) {
      add('ANCHOR_QUOTE_MISMATCH', `${id} quote does not resolve at ${relative}:${lineNumber}`)
    }
  }

  for (const [prefix, minimum] of REQUIRED_ANCHOR_PREFIXES) {
    const count = resolvedPaths.filter((path) => path.startsWith(prefix)).length
    if (count < minimum) {
      add('ANCHOR_COVERAGE', `expected at least ${minimum} anchor(s) under ${prefix}, found ${count}`)
    }
  }

  return { errors, report }
}

function hasCode(result, code) {
  return result.errors.some((error) => error.code === code)
}

function runSelfTest() {
  const raw = readFileSync(DEFAULT_DOC, 'utf8')
  const failures = []

  const base = validate(raw)
  if (base.errors.length > 0) {
    failures.push(`valid document rejected: ${base.errors.map((error) => error.code).join(', ')}`)
  }

  const expectRejection = (label, mutate, code) => {
    const mutated = mutate(raw)
    if (mutated === raw) {
      failures.push(`${label}: fixture mutation did not apply`)
      return
    }
    const result = validate(mutated)
    if (!hasCode(result, code)) {
      const codes = result.errors.map((error) => error.code).join(', ') || 'none'
      failures.push(`${label} was not rejected with ${code} (got: ${codes})`)
    }
  }

  expectRejection(
    'missing section',
    (text) => text.replace('## 6. Prerequisites before either option is implemented', '### Prerequisites (retitled)'),
    'SECTION_MISSING',
  )
  expectRejection(
    'anchor quote drift',
    (text) => text.replace('SHADOW workspace consumes it', 'THIS ANCHOR QUOTE IS NOT PRESENT IN ANY CITED FILE'),
    'ANCHOR_QUOTE_MISMATCH',
  )
  expectRejection(
    'accepted status',
    (text) => text.replace('**Status:** RECOMMENDATION', '**Status:** ACCEPTED'),
    'STATUS_NOT_RECOMMENDATION',
  )
  expectRejection(
    'recommendation drift',
    (text) => text.replace('**Recommendation:** `HOST-HQ`', '**Recommendation:** `HOST-APP`'),
    'RECOMMENDATION_MISMATCH',
  )
  expectRejection(
    'double recommendation',
    (text) => text.replace('| Not recommended now |', '| **Recommended** |'),
    'RECOMMENDATION_AMBIGUOUS',
  )
  expectRejection(
    'dropped shared constraint',
    (text) => text.replace('No second Hub.', 'A second Hub would be acceptable.'),
    'INVARIANT_MISSING',
  )
  expectRejection(
    'fabricated anchor path',
    (text) => text.replace('`BLUEPRINT.md:83`', '`docs/design/m33-02-fabricated-anchor.md:1`'),
    'ANCHOR_PATH_MISSING',
  )
  expectRejection(
    'anchor coverage gap',
    (text) =>
      text
        .split(/\r?\n/)
        .filter((line) => !line.includes('apps/headquarters/'))
        .join('\n'),
    'ANCHOR_COVERAGE',
  )

  if (failures.length > 0) {
    console.error('M33-02 self-test: FAIL')
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exitCode = 1
    return
  }
  console.log('M33-02 self-test: PASS')
  console.log('  valid document accepted')
  console.log('  missing section rejected (SECTION_MISSING)')
  console.log('  anchor quote drift rejected (ANCHOR_QUOTE_MISMATCH)')
  console.log('  accepted status rejected (STATUS_NOT_RECOMMENDATION)')
  console.log('  recommendation drift rejected (RECOMMENDATION_MISMATCH)')
  console.log('  double recommendation rejected (RECOMMENDATION_AMBIGUOUS)')
  console.log('  dropped shared constraint rejected (INVARIANT_MISSING)')
  console.log('  fabricated anchor path rejected (ANCHOR_PATH_MISSING)')
  console.log('  anchor coverage gap rejected (ANCHOR_COVERAGE)')
}

function main(argv) {
  if (argv.includes('--self-test')) {
    runSelfTest()
    return
  }

  const target = argv.find((argument) => !argument.startsWith('--')) ?? DEFAULT_DOC
  const { errors, report } = validate(readFileSync(target, 'utf8'))
  if (errors.length > 0) {
    console.error(`M33-02 placement check: FAIL (${errors.length} error(s))`)
    for (const error of errors) console.error(`  - ${error.code}: ${error.message}`)
    process.exitCode = 1
    return
  }
  console.log('M33-02 placement check: PASS')
  console.log(
    `  sections=${report.sections} options=${report.options.length} recommended=${report.recommended} anchors=${report.anchors}`,
  )
}

main(process.argv.slice(2))
