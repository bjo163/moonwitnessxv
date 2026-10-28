#!/usr/bin/env node
/**
 * scripts/check-m23-06-aetherion-boundaries.mjs
 *
 * M23-06 gate: AETHERION's ten realms and one hundred levels remain a
 * fictional game system. The boundary ledger is internally consistent, every
 * quoted locator resolves to real repository text at the cited line, and no
 * row equates XP or game levels with human age, holiness, heaven or
 * supernatural authority.
 *
 * What this proves:
 *   1. Rows have unique ids and use only the declared enums.
 *   2. Every row locator resolves to an existing file:line whose text
 *      contains the quoted string.
 *   3. The declared 10-realm and 100-level structure matches the rows: zero
 *      named members, zero missing-member arithmetic errors, no duplicate or
 *      out-of-range ordinal, and no claim of an implemented game.
 *   4. Every forbidden-equivalence predicate is false, every boundary
 *      predicate has its declared value, and each forbidden equivalence names
 *      existing guarding rows.
 *   5. No row asserts an XP/level/realm equivalence to human age, holiness or
 *      heaven, and no row claims supernatural or divine authority. This is
 *      checked both in structured fields and in the quoted text, with a
 *      negation guard so boundary statements such as "XP never equated with
 *      human age" are accepted.
 *
 * What this does not prove: that any AETHERION design, realm roster, level
 * table, XP formula or game exists. Zero realm and level names are evidenced;
 * the counts 10 and 100 are references, not enumerations.
 *
 * Run:            node scripts/check-m23-06-aetherion-boundaries.mjs
 * Negative test:  node scripts/check-m23-06-aetherion-boundaries.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { existsSync, readFileSync } from 'node:fs'

const LEDGER = 'docs/data/M23-06-aetherion-boundaries.json'

const EXPECTED_REALMS = 10
const EXPECTED_LEVELS = 100

const EVIDENCE_STATUSES = ['REPO_EVIDENCE', 'REPORTED_HISTORY']
const CLAIM_NATURES = ['POLICY', 'PLAN', 'OBSERVATION', 'ACCEPTANCE', 'EDITORIAL_LABEL']
const IMPLEMENTATION_STATUSES = ['ABSENT', 'DOC_ONLY', 'PRESENT']
const REFERENCE_KINDS = [
  'aggregate_reference',
  'domain_surface',
  'disambiguation',
  'editorial_slot',
  'boundary_statement',
  'acceptance_criterion',
  'audit_observation',
]
const REGISTERS = ['realm', 'level', 'both', 'none']
const RISKS = [
  'AGE_JUXTAPOSITION',
  'EDITORIAL_LABEL_AS_EVIDENCE',
  'NUMERIC_REGISTER_GROUPING',
  'UNQUALIFIED_REALM_COUNT',
]

const REQUIRED_PREDICATES = {
  xp_implies_human_age: false,
  xp_implies_holiness: false,
  xp_implies_heaven: false,
  xp_is_a_spiritual_measure: false,
  level_implies_human_age: false,
  level_implies_holiness: false,
  level_implies_heaven: false,
  level_implies_eschatological_stage: false,
  game_progress_implies_salvation: false,
  realm_implies_wings_division: false,
  realm_implies_supernatural_authority: false,
  realm_implies_cosmological_place: false,
  aetherion_quest_implies_divine_approval: false,
  fiction_character_is_theological_referent: false,
  human_agency_remains_with_human: true,
  participation_is_voluntary: true,
}

// Affirmative equations only. A copula or equivalence phrase must sit between
// the game term and the human-age/holiness/heaven term. A negation guard is
// applied to the matched window before a row is rejected.
const EQUIVALENCE_PATTERNS = [
  {
    id: 'xp-age',
    re: /\bxp\b[^.|;\n]{0,60}\b(?:is|are|equals?|means|implies|represents|measures?|equated with|equivalent to|same as)\b[^.|;\n]{0,40}\b(?:human age|age|years old)\b/i,
  },
  {
    id: 'xp-holiness',
    re: /\bxp\b[^.|;\n]{0,60}\b(?:is|are|equals?|means|implies|represents|measures?|equated with|equivalent to|same as)\b[^.|;\n]{0,40}\b(?:holiness|holy|sanctity|sainthood)\b/i,
  },
  {
    id: 'xp-heaven',
    re: /\bxp\b[^.|;\n]{0,60}\b(?:is|are|equals?|means|implies|represents|measures?|equated with|equivalent to|same as)\b[^.|;\n]{0,40}\b(?:heaven|paradise|jannah|afterlife)\b/i,
  },
  {
    id: 'level-age',
    re: /\b(?:level|levels|realm|realms)\b[^.|;\n]{0,60}\b(?:is|are|equals?|means|implies|represents|measures?|equated with|equivalent to|same as)\b[^.|;\n]{0,40}\b(?:human age|age|years old)\b/i,
  },
  {
    id: 'level-holiness',
    re: /\b(?:level|levels|realm|realms)\b[^.|;\n]{0,60}\b(?:is|are|equals?|means|implies|represents|measures?|equated with|equivalent to|same as)\b[^.|;\n]{0,40}\b(?:holiness|holy|sanctity|sainthood)\b/i,
  },
  {
    id: 'level-heaven',
    re: /\b(?:level|levels|realm|realms)\b[^.|;\n]{0,60}\b(?:is|are|equals?|means|implies|represents|measures?|equated with|equivalent to|same as)\b[^.|;\n]{0,40}\b(?:heaven|paradise|jannah|afterlife|eschatological)\b/i,
  },
]

const AUTHORITY_PATTERNS = [
  {
    id: 'game-term-grants-supernatural-authority',
    re: /\b(?:aetherion|realm|realms|level|levels|xp|quest)\b[^.|;\n]{0,60}\b(?:grants?|confers?|bestows?|carries?|is|are|has|have)\b[^.|;\n]{0,40}\b(?:supernatural|divine|sacred|spiritual)\s+(?:authority|power|rank|status|station)\b/i,
  },
  {
    id: 'game-term-is-divinity',
    re: /\b(?:aetherion|realm|realms|level|levels|xp|quest)\b[^.|;\n]{0,40}\b(?:is|are)\s+(?:an?\s+)?(?:angel|angelic|divine|divinity|god|deity)\b/i,
  },
]

const NEGATION = /\b(?:no|not|never|nor|without|cannot|zero|distinct|separate|separated|forbids?|prohibits?)\b/i

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

function scanQuote(row, fail) {
  const quote = typeof row.quote === 'string' ? row.quote : ''
  for (const pattern of EQUIVALENCE_PATTERNS) {
    const match = pattern.re.exec(quote)
    if (!match) continue
    const window = quote.slice(Math.max(0, match.index - 50), match.index + match[0].length)
    if (!NEGATION.test(window)) {
      fail(`row ${row.id} quote asserts ${pattern.id} equivalence: ${JSON.stringify(match[0])}`)
    }
  }
  for (const pattern of AUTHORITY_PATTERNS) {
    const match = pattern.re.exec(quote)
    if (!match) continue
    const window = quote.slice(Math.max(0, match.index - 50), match.index + match[0].length)
    if (!NEGATION.test(window)) {
      fail(`row ${row.id} quote asserts ${pattern.id}: ${JSON.stringify(match[0])}`)
    }
  }
}

function checkInventory(name, declared, rows, ordinalKey, expected, fail) {
  if (!declared || typeof declared !== 'object') {
    fail(`declared_structure.${name} is missing`)
    return
  }
  if (declared.expected !== expected) {
    fail(`declared_structure.${name}.expected ${declared.expected} !== task count ${expected}`)
  }
  const ordinals = []
  for (const row of rows) {
    const ordinal = row[ordinalKey]
    if (ordinal === null) continue
    if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > expected) {
      fail(`row ${row.id} ${ordinalKey} ${JSON.stringify(ordinal)} is outside 1-${expected}`)
      continue
    }
    ordinals.push(ordinal)
    if (name === 'realms' && !['realm', 'both'].includes(row.registers)) {
      fail(`row ${row.id} names a realm ordinal but registers ${JSON.stringify(row.registers)}`)
    }
    if (name === 'levels' && !['level', 'both'].includes(row.registers)) {
      fail(`row ${row.id} names a level ordinal but registers ${JSON.stringify(row.registers)}`)
    }
  }
  if (new Set(ordinals).size !== ordinals.length) {
    fail(`declared_structure.${name} has duplicate ordinals`)
  }
  const evidenced = ordinals.length
  if (declared.evidenced !== evidenced) {
    fail(`declared_structure.${name}.evidenced ${declared.evidenced} !== rows ${evidenced}`)
  }
  if (declared.missing !== expected - evidenced) {
    fail(`declared_structure.${name}.missing ${declared.missing} !== ${expected - evidenced}`)
  }
  if (declared.enumerated !== (evidenced === expected)) {
    fail(`declared_structure.${name}.enumerated does not match evidenced ${evidenced}/${expected}`)
  }
}

function validate(doc, readLines, stats = { locatorChecks: 0 }) {
  const errors = []
  const fail = (msg) => errors.push(msg)

  const rows = Array.isArray(doc.rows) ? doc.rows : []
  if (rows.length === 0) fail('rows is empty or not an array')

  if (!sameList(doc.evidence_status_enum, EVIDENCE_STATUSES)) {
    fail('evidence_status_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.claim_nature_enum, CLAIM_NATURES)) {
    fail('claim_nature_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.implementation_status_enum, IMPLEMENTATION_STATUSES)) {
    fail('implementation_status_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.reference_kind_enum, REFERENCE_KINDS)) {
    fail('reference_kind_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.registers_enum, REGISTERS)) {
    fail('registers_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.risk_enum, RISKS)) {
    fail('risk_enum does not match the ledger vocabulary')
  }

  const predicates = doc.boundary_predicates
  if (!predicates || typeof predicates !== 'object') {
    fail('boundary_predicates is missing')
  } else {
    for (const [key, expected] of Object.entries(REQUIRED_PREDICATES)) {
      if (!Object.prototype.hasOwnProperty.call(predicates, key)) {
        fail(`boundary_predicates.${key} is missing`)
      } else if (predicates[key] !== expected) {
        fail(`boundary_predicates.${key}=${predicates[key]} must be ${expected}`)
      }
    }
    for (const key of Object.keys(predicates)) {
      if (!Object.prototype.hasOwnProperty.call(REQUIRED_PREDICATES, key)) {
        fail(`boundary_predicates has undeclared key ${JSON.stringify(key)}`)
      }
    }
  }

  const ids = new Set()
  for (const row of rows) {
    if (typeof row.id !== 'string' || row.id.trim() === '') {
      fail(`row at index ${rows.indexOf(row)} has no id`)
      continue
    }
    if (ids.has(row.id)) fail(`duplicate id ${row.id}`)
    ids.add(row.id)

    if (!REFERENCE_KINDS.includes(row.reference_kind)) {
      fail(`row ${row.id} reference_kind ${JSON.stringify(row.reference_kind)} is not declared`)
    }
    if (!CLAIM_NATURES.includes(row.claim_nature)) {
      fail(`row ${row.id} claim_nature ${JSON.stringify(row.claim_nature)} is not declared`)
    }
    if (!EVIDENCE_STATUSES.includes(row.evidence_status)) {
      fail(`row ${row.id} evidence_status ${JSON.stringify(row.evidence_status)} is not declared`)
    }
    if (!IMPLEMENTATION_STATUSES.includes(row.implementation_status)) {
      fail(`row ${row.id} implementation_status ${JSON.stringify(row.implementation_status)} is not declared`)
    }
    if (row.implementation_status === 'PRESENT') {
      fail(`row ${row.id} claims a PRESENT AETHERION implementation; none exists`)
    }
    if (!REGISTERS.includes(row.registers)) {
      fail(`row ${row.id} registers ${JSON.stringify(row.registers)} is not declared`)
    }
    if (row.risk !== null && !RISKS.includes(row.risk)) {
      fail(`row ${row.id} risk ${JSON.stringify(row.risk)} is not declared`)
    }
    if (row.risk !== null && (typeof row.risk_note !== 'string' || row.risk_note.trim() === '')) {
      fail(`row ${row.id} declares risk ${row.risk} without a risk_note`)
    }
    if (!Array.isArray(row.asserted_equivalences)) {
      fail(`row ${row.id} asserted_equivalences must be an array`)
    } else if (row.asserted_equivalences.length > 0) {
      fail(`row ${row.id} asserts forbidden equivalence(s) ${JSON.stringify(row.asserted_equivalences)}`)
    }
    if (row.supernatural_authority_claim !== false) {
      fail(`row ${row.id} must set supernatural_authority_claim false`)
    }
    if (row.realm_ordinal !== null && !Number.isInteger(row.realm_ordinal)) {
      fail(`row ${row.id} realm_ordinal must be null or an integer`)
    }
    if (row.level_ordinal !== null && !Number.isInteger(row.level_ordinal)) {
      fail(`row ${row.id} level_ordinal must be null or an integer`)
    }
    checkLocator(row.locator, row.quote, readLines, stats, fail, `row ${row.id}`)
    scanQuote(row, fail)
  }

  const structure = doc.declared_structure
  if (!structure || typeof structure !== 'object') {
    fail('declared_structure is missing')
  } else {
    checkInventory('realms', structure.realms, rows, 'realm_ordinal', EXPECTED_REALMS, fail)
    checkInventory('levels', structure.levels, rows, 'level_ordinal', EXPECTED_LEVELS, fail)
    if (structure.counts_are_referenced_only !== true) {
      fail('declared_structure.counts_are_referenced_only must be true while both inventories are empty')
    }
  }

  const gaps = doc.gaps
  if (!gaps || typeof gaps !== 'object') {
    fail('gaps is missing')
  } else {
    if (structure && structure.realms && gaps.realm_names_evidenced !== structure.realms.evidenced) {
      fail('gaps.realm_names_evidenced does not match declared realm evidence')
    }
    if (structure && structure.levels && gaps.level_names_evidenced !== structure.levels.evidenced) {
      fail('gaps.level_names_evidenced does not match declared level evidence')
    }
    if (gaps.xp_definition_present !== false) {
      fail('gaps.xp_definition_present must be false; no XP term is defined in this repository')
    }
    if (gaps.progression_rules_present !== false) {
      fail('gaps.progression_rules_present must be false')
    }
    if (!Array.isArray(gaps.game_runtime_artifacts) || gaps.game_runtime_artifacts.length > 0) {
      fail('gaps.game_runtime_artifacts must be an empty array')
    }
  }

  const equivalences = doc.forbidden_equivalences
  if (!Array.isArray(equivalences) || equivalences.length === 0) {
    fail('forbidden_equivalences is empty or not an array')
  } else {
    const equivalenceIds = new Set()
    for (const item of equivalences) {
      if (!item || typeof item.id !== 'string' || item.id.trim() === '') {
        fail('forbidden equivalence without an id')
        continue
      }
      if (equivalenceIds.has(item.id)) fail(`duplicate forbidden equivalence id ${item.id}`)
      equivalenceIds.add(item.id)
      if (typeof item.left !== 'string' || item.left.trim() === '') {
        fail(`forbidden equivalence ${item.id} has no left term`)
      }
      if (typeof item.right !== 'string' || item.right.trim() === '') {
        fail(`forbidden equivalence ${item.id} has no right term`)
      }
      if (item.asserted_anywhere !== false) {
        fail(`forbidden equivalence ${item.id} must have asserted_anywhere false`)
      }
      if (!Array.isArray(item.guarded_by) || item.guarded_by.length === 0) {
        fail(`forbidden equivalence ${item.id} has no guarding row`)
      } else {
        for (const guard of item.guarded_by) {
          if (!ids.has(guard)) fail(`forbidden equivalence ${item.id} guarded_by unknown row ${guard}`)
        }
      }
    }
  }

  if (!Array.isArray(doc.non_claims) || doc.non_claims.length === 0) {
    fail('non_claims is empty or not an array')
  } else if (doc.non_claims.some((claim) => typeof claim !== 'string' || claim.trim() === '')) {
    fail('non_claims contains an empty entry')
  }

  const counts = doc.declared_counts
  if (!counts || typeof counts !== 'object') {
    fail('declared_counts is missing')
    return errors
  }
  if (counts.total !== rows.length) {
    fail(`declared total ${counts.total} !== rows ${rows.length}`)
  }

  compareTally('by_reference_kind', counts.by_reference_kind, tally(rows, 'reference_kind', REFERENCE_KINDS), REFERENCE_KINDS, fail)
  compareTally('by_claim_nature', counts.by_claim_nature, tally(rows, 'claim_nature', CLAIM_NATURES), CLAIM_NATURES, fail)
  compareTally(
    'by_evidence_status',
    counts.by_evidence_status,
    tally(rows, 'evidence_status', EVIDENCE_STATUSES),
    EVIDENCE_STATUSES,
    fail,
  )
  compareTally(
    'by_implementation_status',
    counts.by_implementation_status,
    tally(rows, 'implementation_status', IMPLEMENTATION_STATUSES),
    IMPLEMENTATION_STATUSES,
    fail,
  )
  compareTally('by_registers', counts.by_registers, tally(rows, 'registers', REGISTERS), REGISTERS, fail)
  compareTally(
    'by_risk',
    counts.by_risk,
    tally(rows, 'risk', RISKS),
    RISKS,
    fail,
  )

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
  const firstRow = (d) => d.rows[0]
  const realmRow = (d) => d.rows.find((r) => r.registers === 'realm')

  const cases = [
    {
      name: 'duplicate id is rejected',
      mutate: (d) => {
        d.rows[1].id = d.rows[0].id
      },
    },
    {
      name: 'locator file that does not exist is rejected',
      mutate: (d) => {
        firstRow(d).locator = 'docs/vision/NOT-A-FILE.md:1'
      },
    },
    {
      name: 'locator line outside the file is rejected',
      mutate: (d) => {
        firstRow(d).locator = 'docs/vision/MASTER_VISION_NARRATIVE_XV.md:99999'
      },
    },
    {
      name: 'quote absent from the cited line is rejected',
      mutate: (d) => {
        firstRow(d).quote = 'AETHERION IS A REAL COSMOLOGICAL REALM'
      },
    },
    {
      name: 'declared realm count other than 10 is rejected',
      mutate: (d) => {
        d.declared_structure.realms.expected = 9
      },
    },
    {
      name: 'declared level count other than 100 is rejected',
      mutate: (d) => {
        d.declared_structure.levels.expected = 99
      },
    },
    {
      name: 'declared realm evidence that does not match rows is rejected',
      mutate: (d) => {
        d.declared_structure.realms.evidenced = 10
      },
    },
    {
      name: 'realm ordinal outside 1-10 is rejected',
      mutate: (d) => {
        realmRow(d).realm_ordinal = 11
      },
    },
    {
      name: 'duplicate realm ordinal is rejected',
      mutate: (d) => {
        const rows = d.rows.filter((r) => r.registers === 'realm')
        rows[0].realm_ordinal = 1
        rows[1].realm_ordinal = 1
        d.declared_structure.realms.evidenced = 2
        d.declared_structure.realms.missing = 8
      },
    },
    {
      name: 'structured XP-to-age equivalence is rejected',
      mutate: (d) => {
        firstRow(d).asserted_equivalences = [{ left: 'AETHERION_XP', right: 'HUMAN_AGE' }]
      },
    },
    {
      name: 'supernatural authority claim is rejected',
      mutate: (d) => {
        firstRow(d).supernatural_authority_claim = true
      },
    },
    {
      name: 'flipped xp_implies_human_age predicate is rejected',
      mutate: (d) => {
        d.boundary_predicates.xp_implies_human_age = true
      },
    },
    {
      name: 'missing boundary predicate is rejected',
      mutate: (d) => {
        delete d.boundary_predicates.xp_implies_heaven
      },
    },
    {
      name: 'quoted XP-to-age equivalence is rejected',
      direct: () => {
        const errors = []
        scanQuote({ id: 'TEXT-PROBE', quote: 'XP equals human age' }, (message) => errors.push(message))
        return errors
      },
    },
    {
      name: 'quoted level-to-holiness equivalence is rejected',
      direct: () => {
        const errors = []
        scanQuote(
          { id: 'TEXT-PROBE', quote: 'Each AETHERION level is a measure of holiness' },
          (message) => errors.push(message),
        )
        return errors
      },
    },
    {
      name: 'quoted AETHERION supernatural authority is rejected',
      direct: () => {
        const errors = []
        scanQuote({ id: 'TEXT-PROBE', quote: 'AETHERION grants divine authority' }, (message) => errors.push(message))
        return errors
      },
    },
    {
      name: 'unknown evidence status is rejected',
      mutate: (d) => {
        firstRow(d).evidence_status = 'CONFIRMED'
      },
    },
    {
      name: 'risk without a risk_note is rejected',
      mutate: (d) => {
        delete d.rows.find((r) => r.risk === 'AGE_JUXTAPOSITION').risk_note
      },
    },
    {
      name: 'misdeclared total is rejected',
      mutate: (d) => {
        d.declared_counts.total = 33
      },
    },
    {
      name: 'misdeclared register tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_registers.none = 0
      },
    },
    {
      name: 'forbidden equivalence asserted in the ledger is rejected',
      mutate: (d) => {
        d.forbidden_equivalences[0].asserted_anywhere = true
      },
    },
    {
      name: 'enumerated structure with zero evidence is rejected',
      mutate: (d) => {
        d.declared_structure.realms.enumerated = true
      },
    },
    {
      name: 'gap count that contradicts the structure is rejected',
      mutate: (d) => {
        d.gaps.realm_names_evidenced = 10
      },
    },
    {
      name: 'PRESENT implementation status is rejected',
      mutate: (d) => {
        firstRow(d).implementation_status = 'PRESENT'
      },
    },
  ]

  let failed = 0
  for (const c of cases) {
    let errors
    if (typeof c.direct === 'function') {
      errors = c.direct()
    } else {
      const mutated = clone()
      c.mutate(mutated)
      errors = validate(mutated, readLines, { locatorChecks: 0 })
    }
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
const structure = doc.declared_structure
console.log(`PASS rows=${doc.rows.length} unique ids=${new Set(doc.rows.map((r) => r.id)).size}`)
console.log(
  `PASS evidence REPO_EVIDENCE=${counts.by_evidence_status.REPO_EVIDENCE} REPORTED_HISTORY=${counts.by_evidence_status.REPORTED_HISTORY}`,
)
console.log(
  `PASS registers realm=${counts.by_registers.realm} level=${counts.by_registers.level} both=${counts.by_registers.both} none=${counts.by_registers.none}`,
)
console.log(
  `PASS structure realms ${structure.realms.evidenced}/${structure.realms.expected} levels ${structure.levels.evidenced}/${structure.levels.expected} (referenced only)`,
)
console.log(
  `PASS risks AGE_JUXTAPOSITION=${counts.by_risk.AGE_JUXTAPOSITION} EDITORIAL_LABEL_AS_EVIDENCE=${counts.by_risk.EDITORIAL_LABEL_AS_EVIDENCE} NUMERIC_REGISTER_GROUPING=${counts.by_risk.NUMERIC_REGISTER_GROUPING} UNQUALIFIED_REALM_COUNT=${counts.by_risk.UNQUALIFIED_REALM_COUNT}`,
)
console.log(`PASS ${stats.locatorChecks} locator quotes resolved at the cited file:line`)
console.log('PASS zero rows assert XP/level to age, holiness or heaven equivalence')
console.log('PASS zero rows assert supernatural or divine authority')
console.log('PASS declared counts match rows; all boundary predicates hold')
console.log('NOTE zero realm and level names evidenced: 10 and 100 are references, not enumerations')
