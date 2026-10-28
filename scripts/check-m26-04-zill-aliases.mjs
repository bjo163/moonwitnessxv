#!/usr/bin/env node
/**
 * scripts/check-m26-04-zill-aliases.mjs
 *
 * M26-04 gate: ZILL origins, Honey/Queen R and story alias variants are
 * recorded as separate ledger rows, and no row silently merges two origins or
 * promotes a disputed identity to canonical status without evidence.
 *
 * What this proves:
 *   1. Rows have unique ids and a status from the declared M26-04 vocabulary;
 *      declared totals and tallies equal the rows.
 *   2. Every quoted locator resolves to real repository text at the cited line.
 *   3. CANONICAL rows carry a registry reference and an identity status; a
 *      CONTESTED identity must also name what it is distinct from and carry a
 *      reviewer decision.
 *   4. ALIAS rows point at an existing CANONICAL term; NEEDS_SOURCE rows carry
 *      no registry stable id; FALSE_ALIAS_REJECTED rows carry a REJECTED
 *      decision.
 *   5. No row may merge two distinct origins. An identity_claim that considers
 *      sameAs is never CANONICAL or ALIAS, and the ledger may not hold an
 *      approved sameAs claim.
 *
 * What this does not prove: that any ambiguous referent has been resolved, or
 * that a vision label is a manuscript. The ledger records treatment and
 * absence; it does not mint identity, rename a source spelling or decide rights.
 *
 * Run:            node scripts/check-m26-04-zill-aliases.mjs
 * Negative test:  node scripts/check-m26-04-zill-aliases.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { existsSync, readFileSync } from 'node:fs'

const LEDGER = 'docs/data/M26-04-zill-aliases.json'

const STATUSES = ['CANONICAL', 'ALIAS', 'DISPUTED', 'FALSE_ALIAS_REJECTED', 'NEEDS_SOURCE']
const KINDS = ['term', 'identity_claim']
const IDENTITY_STATUSES = ['REVIEWED', 'CONTESTED', 'MERGED']
const ASSERTIONS = {
  thematic_similarity_is_not_identity: true,
  disputed_identities_not_merged_or_renamed: true,
  no_approved_same_as: true,
}

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

function checkEvidence(list, rowId, readLines, stats, fail, label) {
  if (!Array.isArray(list) || list.length === 0) {
    fail(`row ${rowId} has no ${label} locators`)
    return
  }
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (!item || typeof item.locator !== 'string' || typeof item.quote !== 'string') {
      fail(`row ${rowId} ${label}[${i}] needs locator+quote strings`)
      continue
    }
    checkLocator(item.locator, item.quote, readLines, stats, fail, `row ${rowId} ${label}[${i}]`)
  }
}

function validate(doc, readLines, stats = { locatorChecks: 0 }) {
  const errors = []
  const fail = (msg) => errors.push(msg)

  const rows = Array.isArray(doc.rows) ? doc.rows : []
  if (rows.length === 0) fail('rows is empty or not an array')

  if (!sameList(doc.status_enum, STATUSES)) fail('status_enum does not match the M26-04 vocabulary')
  if (!sameList(doc.kind_enum, KINDS)) fail('kind_enum does not match the ledger vocabulary')
  for (const status of STATUSES) {
    if (!doc.status_definitions || typeof doc.status_definitions[status] !== 'string') {
      fail(`status_definitions.${status} is missing`)
    }
  }
  for (const [key, expected] of Object.entries(ASSERTIONS)) {
    if (!doc.assertions || doc.assertions[key] !== expected) {
      fail(`assertions.${key} must be ${expected}`)
    }
  }
  if (!Array.isArray(doc.same_as_claims) || doc.same_as_claims.length > 0) {
    fail('same_as_claims must be an empty array; the ledger may not hold an approved sameAs claim')
  }

  const byId = new Map()
  const terms = new Map()
  for (const row of rows) {
    if (typeof row.id !== 'string' || row.id.trim() === '') {
      fail(`row at index ${rows.indexOf(row)} has no id`)
      continue
    }
    if (byId.has(row.id)) fail(`duplicate id ${row.id}`)
    byId.set(row.id, row)
  }

  for (const row of rows) {
    const where = `row ${row.id}`
    if (!byId.has(row.id)) continue

    if (!KINDS.includes(row.kind)) {
      fail(`${where} kind ${JSON.stringify(row.kind)} is not in ${KINDS.join('|')}`)
    }
    if (!STATUSES.includes(row.status)) {
      fail(`${where} status ${JSON.stringify(row.status)} is not in ${STATUSES.join('|')}`)
    }
    if (typeof row.term !== 'string' || row.term.trim() === '') {
      fail(`${where} has no term label`)
    }
    if (row.identity_status !== null && row.identity_status !== undefined) {
      if (!IDENTITY_STATUSES.includes(row.identity_status)) {
        fail(`${where} identity_status ${JSON.stringify(row.identity_status)} is not in ${IDENTITY_STATUSES.join('|')}`)
      }
    }

    // Rule 5a: no row may hold two origins at once.
    if (row.merged_origins !== undefined) {
      if (!Array.isArray(row.merged_origins)) {
        fail(`${where} merged_origins must be an array`)
      } else if (row.merged_origins.length > 0) {
        fail(`${where} merges ${row.merged_origins.length} distinct origins into one identity; record the claim as a rejected/disputed pair instead`)
      }
    }

    checkEvidence(row.evidence, row.id, readLines, stats, fail, 'evidence')
    if (row.review_evidence !== undefined) {
      checkEvidence(row.review_evidence, row.id, readLines, stats, fail, 'review_evidence')
    }

    if (row.kind === 'term') {
      terms.set(row.id, row)
      if (row.status === 'CANONICAL') {
        const registry = row.registry_ref && typeof row.registry_ref === 'object' ? row.registry_ref : null
        const hasRegistryId =
          registry &&
          ['ontology', 'unilex'].some((key) => typeof registry[key] === 'string' && registry[key].trim() !== '')
        if (!hasRegistryId) fail(`${where} is CANONICAL without an ontology or unilex registry id`)
        if (!row.identity_status) fail(`${where} is CANONICAL without an identity_status`)
        if (row.identity_status === 'CONTESTED') {
          if (!Array.isArray(row.distinct_from) || row.distinct_from.length === 0) {
            fail(`${where} is CANONICAL with a CONTESTED identity but names nothing it is distinct from`)
          }
          const decisions = Array.isArray(row.review_evidence) ? row.review_evidence : []
          if (!decisions.some((entry) => entry && typeof entry.decision === 'string' && entry.decision !== '')) {
            fail(`${where} is CANONICAL with a CONTESTED identity but carries no reviewer decision`)
          }
        }
      } else if (row.status === 'ALIAS') {
        const target = byId.get(row.anchor_ref)
        if (!target || target.kind !== 'term') {
          fail(`${where} is ALIAS but anchor_ref ${JSON.stringify(row.anchor_ref)} is not a term row`)
        }
        if (typeof row.alias_of !== 'string' || row.alias_of.trim() === '') {
          fail(`${where} is ALIAS without an alias_of surface form`)
        }
        if (row.identity_status) fail(`${where} is ALIAS but claims identity_status ${JSON.stringify(row.identity_status)}`)
      } else if (row.status === 'DISPUTED') {
        if (typeof row.open_question !== 'string' || row.open_question.trim().length < 40) {
          fail(`${where} is DISPUTED without a stated open_question`)
        }
      } else if (row.status === 'FALSE_ALIAS_REJECTED') {
        const decisions = Array.isArray(row.review_evidence) ? row.review_evidence : []
        if (!decisions.some((entry) => entry && entry.decision === 'REJECTED')) {
          fail(`${where} is FALSE_ALIAS_REJECTED without a REJECTED reviewer decision`)
        }
      } else if (row.status === 'NEEDS_SOURCE') {
        if (row.registry_ref !== null) {
          fail(`${where} is NEEDS_SOURCE but carries registry_ref ${JSON.stringify(row.registry_ref)}`)
        }
        if (typeof row.missing !== 'string' || row.missing.trim().length < 20) {
          fail(`${where} is NEEDS_SOURCE without a stated missing source`)
        }
      }
    } else if (row.kind === 'identity_claim') {
      const left = byId.get(row.left_ref)
      const right = byId.get(row.right_ref)
      if (!left || left.kind !== 'term') fail(`${where} left_ref ${JSON.stringify(row.left_ref)} is not a term row`)
      if (!right || right.kind !== 'term') fail(`${where} right_ref ${JSON.stringify(row.right_ref)} is not a term row`)
      if (row.left_ref === row.right_ref) fail(`${where} points at the same term twice`)
      if (typeof row.relation_considered !== 'string' || row.relation_considered.trim() === '') {
        fail(`${where} has no relation_considered`)
      }
      if (row.relation_considered === 'sameAs' && ['CANONICAL', 'ALIAS'].includes(row.status)) {
        fail(`${where} considers sameAs but is marked ${row.status}; an identity claim may not be canonical or an alias`)
      }
      if (row.status === 'DISPUTED') {
        if (typeof row.open_question !== 'string' || row.open_question.trim().length < 40) {
          fail(`${where} is DISPUTED without a stated open_question`)
        }
      }
      if (row.status === 'FALSE_ALIAS_REJECTED') {
        const decisions = Array.isArray(row.review_evidence) ? row.review_evidence : []
        if (!decisions.some((entry) => entry && entry.decision === 'REJECTED')) {
          fail(`${where} is FALSE_ALIAS_REJECTED without a REJECTED reviewer decision`)
        }
      }
      if (row.status === 'NEEDS_SOURCE' && (typeof row.missing !== 'string' || row.missing.trim().length < 20)) {
        fail(`${where} is NEEDS_SOURCE without a stated missing source`)
      }
      if (row.registry_ref !== undefined && row.registry_ref !== null) {
        fail(`${where} is an identity claim and must not carry its own registry_ref`)
      }
    }
  }

  const seenTerms = new Map()
  for (const row of rows) {
    if (row.kind !== 'term' || row.status === 'ALIAS') continue
    const key = String(row.term).normalize('NFKC').toLowerCase()
    if (seenTerms.has(key)) fail(`duplicate term ${JSON.stringify(row.term)} at ${seenTerms.get(key)}+${row.id}`)
    else seenTerms.set(key, row.id)
  }

  const counts = doc.declared_counts
  if (!counts || typeof counts !== 'object') {
    fail('declared_counts is missing')
    return errors
  }
  if (counts.total !== rows.length) fail(`declared total ${counts.total} !== rows ${rows.length}`)
  compareTally('by_status', counts.by_status, tally(rows, 'status', STATUSES), STATUSES, fail)
  compareTally('by_kind', counts.by_kind, tally(rows, 'kind', KINDS), KINDS, fail)

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
  const row = (d, id) => d.rows.find((r) => r.id === id)

  const cases = [
    {
      name: 'a row merging two distinct origins is rejected',
      mutate: (d) => {
        row(d, 'ZILL-01').merged_origins = ['ZILL — Shadow Witness', 'ZILL — Ahluz Zikir / Tasawuf']
      },
    },
    {
      name: 'a disputed identity marked CANONICAL without evidence is rejected',
      mutate: (d) => {
        const target = row(d, 'ZILL-03')
        target.status = 'CANONICAL'
        target.evidence = []
        target.registry_ref = null
        target.identity_status = null
      },
    },
    {
      name: 'a disputed sameAs claim marked CANONICAL is rejected',
      mutate: (d) => {
        const target = row(d, 'ZILL-05')
        target.status = 'CANONICAL'
        delete target.open_question
        target.review_evidence = []
      },
    },
    {
      name: 'FALSE_ALIAS_REJECTED without a REJECTED decision is rejected',
      mutate: (d) => {
        row(d, 'ZILL-04').review_evidence[0].decision = 'APPROVED'
        row(d, 'ZILL-04').review_evidence[1].decision = 'APPROVED'
      },
    },
    {
      name: 'an alias without an existing anchor term is rejected',
      mutate: (d) => {
        row(d, 'ZILL-06').anchor_ref = 'ZILL-999'
      },
    },
    {
      name: 'an alias claiming an identity status is rejected',
      mutate: (d) => {
        row(d, 'ZILL-06').identity_status = 'REVIEWED'
      },
    },
    {
      name: 'NEEDS_SOURCE carrying a registry stable id is rejected',
      mutate: (d) => {
        row(d, 'HONEY-01').registry_ref = { ontology: 'O099' }
      },
    },
    {
      name: 'a quote absent from the cited line is rejected',
      mutate: (d) => {
        row(d, 'HONEY-01').evidence[0].quote = 'HONEY is canonically QUEEN R'
      },
    },
    {
      name: 'a term row with no evidence is rejected',
      mutate: (d) => {
        row(d, 'HONEY-06').evidence = []
      },
    },
    {
      name: 'an identity claim pointing at itself is rejected',
      mutate: (d) => {
        row(d, 'ZILL-04').right_ref = 'ZILL-04'
      },
    },
    {
      name: 'an approved sameAs claim anywhere is rejected',
      mutate: (d) => {
        d.same_as_claims.push({ left: 'ZILL-01', right: 'ZILL-03', decision: 'APPROVED' })
      },
    },
    {
      name: 'a weakened assertion flag is rejected',
      mutate: (d) => {
        d.assertions.thematic_similarity_is_not_identity = false
      },
    },
    {
      name: 'duplicate id is rejected',
      mutate: (d) => {
        d.rows[1].id = d.rows[0].id
      },
    },
    {
      name: 'a unknown status is rejected',
      mutate: (d) => {
        row(d, 'HONEY-02').status = 'CANONICAL_ALIAS'
      },
    },
    {
      name: 'misdeclared status tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_status.NEEDS_SOURCE = 3
      },
    },
    {
      name: 'misdeclared total is rejected',
      mutate: (d) => {
        d.declared_counts.total = 12
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
  `PASS statuses CANONICAL=${counts.by_status.CANONICAL} ALIAS=${counts.by_status.ALIAS} DISPUTED=${counts.by_status.DISPUTED} FALSE_ALIAS_REJECTED=${counts.by_status.FALSE_ALIAS_REJECTED} NEEDS_SOURCE=${counts.by_status.NEEDS_SOURCE}`,
)
console.log(`PASS kinds term=${counts.by_kind.term} identity_claim=${counts.by_kind.identity_claim}`)
console.log(`PASS ${stats.locatorChecks} locator quotes resolved at the cited file:line`)
console.log('PASS zero rows merge two distinct origins')
console.log('PASS zero approved sameAs claims; sameAs candidates stay DISPUTED/FALSE_ALIAS_REJECTED/NEEDS_SOURCE')
console.log('NOTE the ledger records treatment and absence; it does not resolve any ambiguous referent')
