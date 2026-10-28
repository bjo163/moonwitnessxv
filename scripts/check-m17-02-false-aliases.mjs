#!/usr/bin/env node
/**
 * scripts/check-m17-02-false-aliases.mjs
 *
 * M17-02 gate: false-alias prevention for Shadow/Batteries/Honey/ZILL and the
 * adjacent WINGS/AETHERION and numeric labels.
 *
 * What this proves:
 *   1. Every row pairs two declared referents and has a unique id. A row may
 *      not pair a referent with itself and two rows may not repeat a pair.
 *   2. Every decision is REJECTED, ALIAS_APPROVED, DISPUTED or NEEDS_SOURCE.
 *      REJECTED and DISPUTED rows may not approve a sameAs; ALIAS_APPROVED
 *      requires an explicit approved alias record and is never allowed on a
 *      row whose rules include a PHONETIC or MYSTICAL category.
 *   3. DISPUTED rows carry a PENDING sameAs candidate. NEEDS_SOURCE rows carry
 *      a missing statement. Neither may carry an approved record.
 *   4. Every evidence locator resolves to the cited file line and contains the
 *      quoted string verbatim. No row is accepted without evidence.
 *   5. Every rule forbids sameAs and the vocabulary keeps at least one
 *      PHONETIC and one MYSTICAL rule. Declared tallies (decision, basis,
 *      rule, rejected pairs, evidence items) equal the rows.
 *   6. same_as_claims and alias_approvals are empty. Any claim that names a
 *      REJECTED pair is reported as an equivalence between rejected referents.
 *   7. Every declared referent is used at least once; no row may cite an
 *      invented referent; no referent may be classified as a real person.
 *
 * What this does not prove: that any NEEDS_SOURCE pair is distinct, that ZIIL
 * has one referent, or that an alias database, API or UI consumes this ledger.
 *
 * Run:            node scripts/check-m17-02-false-aliases.mjs
 * Negative test:  node scripts/check-m17-02-false-aliases.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { existsSync, readFileSync } from 'node:fs'

const LEDGER = 'docs/data/M17-02-false-alias-decisions.json'

const DECISIONS = ['REJECTED', 'ALIAS_APPROVED', 'DISPUTED', 'NEEDS_SOURCE']
const BASES = ['REGISTRY_DECISION', 'RATIFIED_POLICY', 'MISSING_SOURCE']
const REF_KINDS = [
  'character',
  'workspace',
  'historical_taxonomy',
  'divine_referent',
  'project_acronym',
  'ensemble',
  'character_or_alias',
  'editorial_label',
  'archive_label',
  'series_label',
  'divine_name_reference',
  'disputed_term',
  'study_track',
  'org_taxonomy',
  'theological_referent',
  'game_system',
  'chronology_label',
  'role_taxonomy',
  'name_catalog',
  'research_method',
  'rejected_reading',
]
const REF_CLASSES = [
  'FICTIONAL_PERSON',
  'FICTIONAL_GROUP',
  'FICTIONAL_SURFACE',
  'SOFTWARE_SURFACE',
  'HISTORICAL_TAXONOMY',
  'THEOLOGICAL_REFERENT',
  'THEOLOGICAL_NAME_REFERENCE',
  'THEOLOGICAL_NAME_CATALOG',
  'PROJECT_ACRONYM',
  'STUDY_TRACK',
  'DISPUTED_LEXICAL_TERM',
  'EDITORIAL_LABEL',
  'FICTIONAL_ORGANIZATION_TAXONOMY',
  'FICTIONAL_ROLE_TAXONOMY',
  'GAME_SYSTEM',
  'CHRONOLOGY_LABEL',
  'RESEARCH_METHOD',
  'REJECTED_READING',
]
const RULE_CATEGORIES = [
  'LABEL',
  'PHONETIC',
  'MYSTICAL',
  'NUMERICAL',
  'THEMATIC',
  'MEMBERSHIP',
  'THEOLOGICAL',
  'ONTOLOGICAL',
  'VERSION',
]
const RULE_CODES = {
  SHARED_SURFACE_LABEL: 'LABEL',
  SHARED_TOKEN: 'LABEL',
  SHARED_SUBSTRING: 'LABEL',
  CO_LISTED_ARCHIVE_LABEL: 'LABEL',
  PHONETIC_RESEMBLANCE: 'PHONETIC',
  LEETSPEAK_SOUND: 'PHONETIC',
  LETTER_SOUND_ACRONYM: 'PHONETIC',
  NAME_SOUND_RESEMBLANCE: 'PHONETIC',
  MYSTICAL_HIERARCHY: 'MYSTICAL',
  MYSTICAL_RESONANCE: 'MYSTICAL',
  NUMEROLOGICAL_TEN: 'NUMERICAL',
  NUMEROLOGICAL_HUNDRED: 'NUMERICAL',
  NUMEROLOGICAL_NINETY_NINE: 'NUMERICAL',
  NUMEROLOGICAL_MYSTICISM: 'MYSTICAL',
  THEMATIC_METAPHOR: 'THEMATIC',
  NICKNAME_DEVOTIONAL_RESONANCE: 'THEOLOGICAL',
  WHOLE_PART_MEMBERSHIP: 'MEMBERSHIP',
  VERSION_SCOPE: 'VERSION',
  THEOLOGICAL_DOMAIN: 'THEOLOGICAL',
  TYPE_DOMAIN_BOUNDARY: 'ONTOLOGICAL',
}
const RECORD_STATES = ['PENDING', 'APPROVED', 'REJECTED', 'VERIFIED', 'REVOKED']
const RECORD_RELATIONS = ['sameAs', 'distinctFrom', 'alias']
const GUARD_KEYS = [
  'no_same_as_claims',
  'no_alias_approvals',
  'no_phonetic_alias_approved',
  'no_mystical_alias_approved',
  'every_rule_forbids_same_as',
  'rejected_pairs_not_equivalent',
  'every_row_has_resolving_locator',
  'every_referent_is_used',
  'no_invented_referents',
  'no_real_person_identified',
  'source_variants_preserved',
  'no_external_fetch',
]

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

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function sameList(a, b) {
  return Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i])
}

function tally(rows, valuesOf, keys) {
  return Object.fromEntries(keys.map((key) => [key, rows.filter((r) => valuesOf(r).includes(key)).length]))
}

function compareTally(name, declared, actual, keys, fail) {
  if (!declared || typeof declared !== 'object') {
    fail(`declared_counts.${name} is missing`)
    return
  }
  for (const key of keys) {
    if (declared[key] !== actual[key]) {
      fail(`declared ${name}.${key}=${declared[key]} !== rows ${actual[key]}`)
    }
  }
  for (const key of Object.keys(declared)) {
    if (!keys.includes(key)) fail(`declared ${name} has unknown key ${JSON.stringify(key)}`)
  }
}

function checkLocator(locator, quote, readLines, stats, fail, where) {
  const match = isNonEmptyString(locator) ? /^(.+):(\d+)$/.exec(locator) : null
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
  if (!isNonEmptyString(quote)) {
    fail(`${where} has an empty quote`)
    return
  }
  if (!lines[lineNo - 1].includes(quote)) {
    fail(`${where} quote ${JSON.stringify(quote)} not found at ${locator}`)
    return
  }
  stats.locatorChecks++
}

function checkEvidence(items, readLines, stats, fail, where) {
  if (!Array.isArray(items) || items.length === 0) {
    fail(`${where} has no evidence locators`)
    return false
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item || typeof item !== 'object') {
      fail(`${where} evidence[${i}] is not an object`)
      continue
    }
    checkLocator(item.locator, item.quote, readLines, stats, fail, `${where} evidence[${i}]`)
  }
  return true
}

function pairKey(left, right) {
  return [left, right].sort().join('|')
}

function validate(doc, readLines, stats = { locatorChecks: 0 }) {
  const errors = []
  const fail = (msg) => errors.push(msg)

  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    fail('ledger is not a JSON object')
    return errors
  }
  if (doc.task !== 'M17-02') fail(`task ${JSON.stringify(doc.task)} is not M17-02`)
  if (!isNonEmptyString(doc.baseline_sha) || !/^[0-9a-f]{7,40}$/.test(doc.baseline_sha)) {
    fail(`baseline_sha ${JSON.stringify(doc.baseline_sha)} is not a 7-40 hex SHA prefix`)
  }
  if (!sameList(doc.decision_enum, DECISIONS)) fail('decision_enum does not match the ledger vocabulary')
  if (!sameList(doc.basis_enum, BASES)) fail('basis_enum does not match the ledger vocabulary')
  if (!sameList(doc.referent_class_enum, REF_CLASSES)) fail('referent_class_enum does not match the vocabulary')
  if (!sameList(doc.referent_kind_enum, REF_KINDS)) fail('referent_kind_enum does not match the vocabulary')
  if (!sameList(doc.rule_categories, RULE_CATEGORIES)) fail('rule_categories does not match the vocabulary')

  // Rule vocabulary.
  if (!doc.rules || typeof doc.rules !== 'object' || Array.isArray(doc.rules)) {
    fail('rules is missing')
  } else {
    const declaredRules = Object.keys(doc.rules)
    if (!sameList(declaredRules, Object.keys(RULE_CODES))) {
      fail('rules keys do not match the validator rule vocabulary')
    }
    for (const code of declaredRules) {
      const rule = doc.rules[code]
      if (!rule || typeof rule !== 'object') {
        fail(`rule ${code} is not an object`)
        continue
      }
      if (!RULE_CATEGORIES.includes(rule.category)) {
        fail(`rule ${code} category ${JSON.stringify(rule.category)} is unknown`)
      } else if (RULE_CODES[code] && rule.category !== RULE_CODES[code]) {
        fail(`rule ${code} category ${rule.category} !== ${RULE_CODES[code]}`)
      }
      if (rule.forbids_same_as !== true) {
        fail(`rule ${code} must forbid sameAs, got ${JSON.stringify(rule.forbids_same_as)}`)
      }
      if (!isNonEmptyString(rule.description)) fail(`rule ${code} has no description`)
    }
    const categories = new Set(Object.values(doc.rules).map((rule) => rule && rule.category))
    for (const required of ['PHONETIC', 'MYSTICAL']) {
      if (!categories.has(required)) fail(`rule vocabulary has no ${required} rule`)
    }
  }

  // Guards.
  if (!doc.guards || typeof doc.guards !== 'object' || Array.isArray(doc.guards)) {
    fail('guards is missing')
  } else {
    for (const key of GUARD_KEYS) {
      if (doc.guards[key] !== true) fail(`guard ${key} must be true, got ${JSON.stringify(doc.guards[key])}`)
    }
    for (const key of Object.keys(doc.guards)) {
      if (!GUARD_KEYS.includes(key)) fail(`guards has unknown key ${JSON.stringify(key)}`)
    }
  }

  // Referents.
  const referents = Array.isArray(doc.referents) ? doc.referents : []
  if (referents.length === 0) fail('referents is empty or not an array')
  const refById = new Map()
  for (let i = 0; i < referents.length; i++) {
    const ref = referents[i]
    const where = `referent[${i}]`
    if (!ref || typeof ref !== 'object' || Array.isArray(ref)) {
      fail(`${where} is not an object`)
      continue
    }
    if (!isNonEmptyString(ref.id) || !ref.id.startsWith('ref_')) {
      fail(`${where} id ${JSON.stringify(ref.id)} must start with ref_`)
      continue
    }
    if (refById.has(ref.id)) fail(`duplicate referent id ${ref.id}`)
    refById.set(ref.id, ref)
    if (!isNonEmptyString(ref.label)) fail(`referent ${ref.id} has no label`)
    if (!REF_KINDS.includes(ref.kind)) {
      fail(`referent ${ref.id} kind ${JSON.stringify(ref.kind)} is unknown`)
    }
    if (!REF_CLASSES.includes(ref.referent_class)) {
      fail(`referent ${ref.id} class ${JSON.stringify(ref.referent_class)} is unknown`)
    }
    if (ref.referent_class === 'REAL_PERSON') {
      fail(`referent ${ref.id} is classified as a real person; no real-person referent is permitted`)
    }
    if (ref.registry !== null && !isNonEmptyString(ref.registry)) {
      fail(`referent ${ref.id} registry must be null or a non-empty string`)
    }
  }

  // Rows.
  const rows = Array.isArray(doc.rows) ? doc.rows : []
  if (rows.length === 0) fail('rows is empty or not an array')
  const rowIds = new Set()
  const usedPairs = new Map()
  const usedRefs = new Set()
  const problematicPairs = new Set()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const where = `row[${i}]`
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      fail(`${where} is not an object`)
      continue
    }
    if (!isNonEmptyString(row.id) || !row.id.startsWith('fa_')) {
      fail(`${where} id ${JSON.stringify(row.id)} must start with fa_`)
      continue
    }
    if (rowIds.has(row.id)) fail(`duplicate row id ${row.id}`)
    rowIds.add(row.id)
    const label = `row ${row.id}`

    if (!DECISIONS.includes(row.decision)) {
      fail(`${label} decision ${JSON.stringify(row.decision)} is not in ${DECISIONS.join('|')}`)
    }
    if (!BASES.includes(row.basis)) {
      fail(`${label} basis ${JSON.stringify(row.basis)} is not in ${BASES.join('|')}`)
    }

    const left = refById.get(row.left_ref)
    const right = refById.get(row.right_ref)
    if (!left) fail(`${label} left_ref ${JSON.stringify(row.left_ref)} does not exist`)
    if (!right) fail(`${label} right_ref ${JSON.stringify(row.right_ref)} does not exist`)
    if (row.left_ref === row.right_ref) fail(`${label} pairs a referent with itself`)
    if (left && right) {
      usedRefs.add(row.left_ref)
      usedRefs.add(row.right_ref)
      const key = pairKey(row.left_ref, row.right_ref)
      if (usedPairs.has(key)) fail(`${label} repeats the pair already used by ${usedPairs.get(key)}`)
      else usedPairs.set(key, row.id)
      if (['REJECTED', 'DISPUTED'].includes(row.decision)) problematicPairs.add(key)
    }

    if (!Array.isArray(row.rules) || row.rules.length === 0) {
      fail(`${label} has no rules`)
    } else {
      if (new Set(row.rules).size !== row.rules.length) fail(`${label} has duplicate rules`)
      for (const code of row.rules) {
        if (!RULE_CODES[code]) fail(`${label} rule ${JSON.stringify(code)} is unknown`)
      }
      const categories = row.rules.map((code) => RULE_CODES[code]).filter(Boolean)
      if (row.decision === 'ALIAS_APPROVED' && categories.some((c) => c === 'PHONETIC' || c === 'MYSTICAL')) {
        fail(`${label} approves an alias on a PHONETIC or MYSTICAL rule; that is forbidden`)
      }
    }

    if (row.approved_same_as !== false) {
      fail(`${label} approved_same_as must be false, got ${JSON.stringify(row.approved_same_as)}`)
    }

    const needsQuestion = row.decision === 'DISPUTED' || row.decision === 'NEEDS_SOURCE'
    if (needsQuestion && !isNonEmptyString(row.open_question)) {
      fail(`${label} decision ${row.decision} has no open_question`)
    }
    if (!needsQuestion && row.open_question !== null && row.open_question !== undefined) {
      fail(`${label} decision ${row.decision} must not carry an open_question`)
    }
    if (row.decision === 'NEEDS_SOURCE') {
      if (!isNonEmptyString(row.missing)) fail(`${label} NEEDS_SOURCE has no missing statement`)
    } else if (row.missing !== null && row.missing !== undefined) {
      fail(`${label} decision ${row.decision} must not carry a missing statement`)
    }

    if (!Array.isArray(row.decision_records)) {
      fail(`${label} decision_records must be an array`)
    } else {
      const records = row.decision_records
      for (let j = 0; j < records.length; j++) {
        const record = records[j]
        const recordWhere = `${label} decision_records[${j}]`
        if (!record || typeof record !== 'object') {
          fail(`${recordWhere} is not an object`)
          continue
        }
        if (!isNonEmptyString(record.system)) fail(`${recordWhere} has no system`)
        if (!isNonEmptyString(record.code)) fail(`${recordWhere} has no code`)
        if (!RECORD_STATES.includes(record.state)) {
          fail(`${recordWhere} state ${JSON.stringify(record.state)} is unknown`)
        }
        if (!RECORD_RELATIONS.includes(record.relation)) {
          fail(`${recordWhere} relation ${JSON.stringify(record.relation)} is unknown`)
        }
      }

      const pendingSameAs = records.some((r) => r && r.state === 'PENDING' && r.relation === 'sameAs')
      const approvedSameAs = records.some((r) => r && r.state === 'APPROVED' && r.relation === 'sameAs')
      const approvedAlias = records.some((r) => r && r.state === 'APPROVED' && r.relation === 'alias')

      if (row.decision === 'DISPUTED' && !pendingSameAs) {
        fail(`${label} is DISPUTED without a PENDING sameAs record`)
      }
      if (row.decision === 'REJECTED' && approvedSameAs) {
        fail(`${label} is REJECTED but records an APPROVED sameAs`)
      }
      if (row.decision === 'NEEDS_SOURCE' && records.some((r) => r && r.state === 'APPROVED')) {
        fail(`${label} is NEEDS_SOURCE but carries an APPROVED record`)
      }
      if (row.decision === 'ALIAS_APPROVED' && !approvedAlias) {
        fail(`${label} is ALIAS_APPROVED without an APPROVED alias record`)
      }
      for (const record of records) {
        if (record && record.state === 'APPROVED' && record.relation === 'sameAs') {
          const key = pairKey(row.left_ref, row.right_ref)
          if (problematicPairs.has(key)) {
            fail(`${label} approves sameAs between referents recorded as rejected or disputed`)
          }
        }
      }
    }

    checkEvidence(row.evidence, readLines, stats, fail, label)
  }

  for (const ref of referents) {
    if (ref && isNonEmptyString(ref.id) && !usedRefs.has(ref.id)) {
      fail(`referent ${ref.id} is never used by a row`)
    }
  }

  // Explicit no-merger guards.
  if (!Array.isArray(doc.same_as_claims)) {
    fail('same_as_claims must be an array')
  } else if (doc.same_as_claims.length > 0) {
    fail('same_as_claims must be empty: this ledger permits no identity merger')
    for (let i = 0; i < doc.same_as_claims.length; i++) {
      const claim = doc.same_as_claims[i] || {}
      if (!refById.has(claim.from)) fail(`same_as_claims[${i}] from ${JSON.stringify(claim.from)} does not exist`)
      if (!refById.has(claim.to)) fail(`same_as_claims[${i}] to ${JSON.stringify(claim.to)} does not exist`)
      if (problematicPairs.has(pairKey(claim.from, claim.to))) {
        fail(`same_as_claims[${i}] asserts equivalence between a rejected or disputed pair`)
      }
    }
  }

  if (!Array.isArray(doc.alias_approvals)) {
    fail('alias_approvals must be an array')
  } else if (doc.alias_approvals.length > 0) {
    fail('alias_approvals must be empty: no repository record approves a phonetic or mystical alias here')
  }

  // Declared counts.
  const counts = doc.declared_counts
  if (!counts || typeof counts !== 'object') {
    fail('declared_counts is missing')
    return errors
  }
  if (counts.total !== rows.length) fail(`declared total ${counts.total} !== rows ${rows.length}`)
  if (counts.referents !== referents.length) {
    fail(`declared referents ${counts.referents} !== referents ${referents.length}`)
  }
  compareTally('by_decision', counts.by_decision, tally(rows, (r) => [r.decision], DECISIONS), DECISIONS, fail)
  compareTally('by_basis', counts.by_basis, tally(rows, (r) => [r.basis], BASES), BASES, fail)
  compareTally(
    'by_rule',
    counts.by_rule,
    tally(rows, (r) => (Array.isArray(r.rules) ? r.rules : []), Object.keys(RULE_CODES)),
    Object.keys(RULE_CODES),
    fail,
  )

  const aliasApprovedRows = rows.filter((r) => r && r.decision === 'ALIAS_APPROVED').length
  const rejectedPairs = rows.filter((r) => r && r.decision === 'REJECTED').length
  const evidenceItems = rows.reduce((sum, r) => sum + (r && Array.isArray(r.evidence) ? r.evidence.length : 0), 0)
  const checks = {
    alias_approved_rows: aliasApprovedRows,
    same_as_claims: Array.isArray(doc.same_as_claims) ? doc.same_as_claims.length : -1,
    rejected_pairs: rejectedPairs,
    evidence_items: evidenceItems,
  }
  for (const [key, actual] of Object.entries(checks)) {
    if (counts[key] !== actual) fail(`declared ${key} ${counts[key]} !== rows ${actual}`)
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
  const row = (d, id) => d.rows.find((r) => r.id === id)
  const ref = (d, id) => d.referents.find((r) => r.id === id)

  const cases = [
    {
      name: 'duplicate row id is rejected',
      mutate: (d) => {
        row(d, 'fa_shadow_legacy_root_character').id = 'fa_shadow_character_workspace'
      },
    },
    {
      name: 'invented left referent is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').left_ref = 'ref_invented_batteries'
      },
    },
    {
      name: 'invented right referent is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').right_ref = 'ref_invented_allah'
      },
    },
    {
      name: 'row pairing a referent with itself is rejected',
      mutate: (d) => {
        const r = row(d, 'fa_batteries_allah')
        r.right_ref = r.left_ref
      },
    },
    {
      name: 'duplicate referent id is rejected',
      mutate: (d) => {
        ref(d, 'ref_shadow_workspace').id = 'ref_shadow_character'
      },
    },
    {
      name: 'unused referent is rejected',
      mutate: (d) => {
        d.referents.push({
          id: 'ref_unused_label',
          label: 'UNUSED LABEL',
          kind: 'editorial_label',
          referent_class: 'EDITORIAL_LABEL',
          registry: null,
          note: 'fixture',
        })
      },
    },
    {
      name: 'real-person referent class is rejected',
      mutate: (d) => {
        d.referents.push({
          id: 'ref_real_person',
          label: 'A REAL PERSON',
          kind: 'character',
          referent_class: 'REAL_PERSON',
          registry: null,
          note: 'fixture',
        })
      },
    },
    {
      name: 'quote absent from the cited line is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').evidence[0].quote = 'THIS QUOTE IS NOT IN THE FILE'
      },
    },
    {
      name: 'locator line outside the file is rejected',
      mutate: (d) => {
        const r = row(d, 'fa_batteries_allah')
        r.evidence[0].locator = 'BLUEPRINT.md:99999'
        r.evidence[0].quote = 'placeholder'
      },
    },
    {
      name: 'locator file that does not exist is rejected',
      mutate: (d) => {
        const r = row(d, 'fa_batteries_allah')
        r.evidence[0].locator = 'docs/data/does-not-exist.json:1'
        r.evidence[0].quote = 'placeholder'
      },
    },
    {
      name: 'evidence item without a locator is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').evidence.push({ quote: 'orphan quote' })
      },
    },
    {
      name: 'row with no evidence is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').evidence = []
      },
    },
    {
      name: 'unknown decision value is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').decision = 'SAME_AS'
      },
    },
    {
      name: 'unknown rule code is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').rules.push('VIBE_BASED_IDENTITY')
      },
    },
    {
      name: 'row with no rules is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').rules = []
      },
    },
    {
      name: 'misdeclared total is rejected',
      mutate: (d) => {
        d.declared_counts.total = 19
      },
    },
    {
      name: 'misdeclared referent tally is rejected',
      mutate: (d) => {
        d.declared_counts.referents = 23
      },
    },
    {
      name: 'misdeclared decision tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_decision.REJECTED = 12
      },
    },
    {
      name: 'misdeclared basis tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_basis.REGISTRY_DECISION = 4
      },
    },
    {
      name: 'misdeclared rule tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_rule.PHONETIC_RESEMBLANCE = 0
      },
    },
    {
      name: 'misdeclared evidence tally is rejected',
      mutate: (d) => {
        d.declared_counts.evidence_items = 48
      },
    },
    {
      name: 'misdeclared rejected-pair tally is rejected',
      mutate: (d) => {
        d.declared_counts.rejected_pairs = 12
      },
    },
    {
      name: 'sameAs between a rejected pair is rejected',
      mutate: (d) => {
        d.same_as_claims.push({ from: 'ref_batteries', to: 'ref_allah_theological' })
      },
    },
    {
      name: 'sameAs with invented referents is rejected',
      mutate: (d) => {
        d.same_as_claims.push({ from: 'ref_missing', to: 'ref_other_missing' })
      },
    },
    {
      name: 'non-empty alias approval list is rejected',
      mutate: (d) => {
        d.alias_approvals.push({ from: 'ref_honey', to: 'ref_queen_r' })
      },
    },
    {
      name: 'false phonetic guard is rejected',
      mutate: (d) => {
        d.guards.no_phonetic_alias_approved = false
      },
    },
    {
      name: 'disabled phonetic rule is rejected',
      mutate: (d) => {
        d.rules.PHONETIC_RESEMBLANCE.forbids_same_as = false
      },
    },
    {
      name: 'disabled mystical rule is rejected',
      mutate: (d) => {
        d.rules.MYSTICAL_RESONANCE.forbids_same_as = false
      },
    },
    {
      name: 'ALIAS_APPROVED without an approved alias record is rejected',
      mutate: (d) => {
        const r = row(d, 'fa_honey_queen_r')
        r.decision = 'ALIAS_APPROVED'
        r.open_question = null
        r.decision_records = []
      },
    },
    {
      name: 'ALIAS_APPROVED on a phonetic row is rejected even with a record',
      mutate: (d) => {
        const r = row(d, 'fa_zill_ziil')
        r.decision = 'ALIAS_APPROVED'
        r.open_question = null
        r.decision_records = [{ system: 'fixture', code: 'FAKE-1', state: 'APPROVED', relation: 'alias' }]
      },
    },
    {
      name: 'REJECTED row carrying an approved sameAs is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').decision_records.push({
          system: 'fixture',
          code: 'FAKE-2',
          state: 'APPROVED',
          relation: 'sameAs',
        })
      },
    },
    {
      name: 'DISPUTED row without a pending sameAs is rejected',
      mutate: (d) => {
        row(d, 'fa_shadow_character_workspace').decision_records = [
          {
            system: 'moonql_graph_candidates',
            code: 'GC-O006-O007-distinctFrom-GENERAL',
            state: 'APPROVED',
            relation: 'distinctFrom',
          },
        ]
      },
    },
    {
      name: 'NEEDS_SOURCE row carrying an approved record is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_battery_al4h').decision_records.push({
          system: 'fixture',
          code: 'FAKE-3',
          state: 'APPROVED',
          relation: 'alias',
        })
      },
    },
    {
      name: 'NEEDS_SOURCE row without a missing statement is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_battery_al4h').missing = null
      },
    },
    {
      name: 'row approving same_as is rejected',
      mutate: (d) => {
        row(d, 'fa_batteries_allah').approved_same_as = true
      },
    },
    {
      name: 'duplicate unordered pair is rejected',
      mutate: (d) => {
        const r = row(d, 'fa_battery_al4h_allah')
        r.left_ref = 'ref_batteries'
        r.right_ref = 'ref_allah_theological'
      },
    },
    {
      name: 'decision vocabulary drift is rejected',
      mutate: (d) => {
        d.decision_enum = ['REJECTED', 'ALIAS_APPROVED', 'DISPUTED']
      },
    },
    {
      name: 'missing guard key is rejected',
      mutate: (d) => {
        delete d.guards.no_external_fetch
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

if (!existsSync(LEDGER)) {
  console.error(`FAIL: ${LEDGER} not found; run from the repository root`)
  process.exit(1)
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
const phoneticRows = doc.rows.filter((r) => r.rules.some((code) => RULE_CODES[code] === 'PHONETIC')).length
const mysticalRows = doc.rows.filter((r) => r.rules.some((code) => RULE_CODES[code] === 'MYSTICAL')).length
console.log(`PASS rows=${doc.rows.length} unique ids=${new Set(doc.rows.map((r) => r.id)).size} referents=${doc.referents.length}`)
console.log(
  `PASS decisions REJECTED=${counts.by_decision.REJECTED} ALIAS_APPROVED=${counts.by_decision.ALIAS_APPROVED} DISPUTED=${counts.by_decision.DISPUTED} NEEDS_SOURCE=${counts.by_decision.NEEDS_SOURCE}`,
)
console.log(
  `PASS basis REGISTRY_DECISION=${counts.by_basis.REGISTRY_DECISION} RATIFIED_POLICY=${counts.by_basis.RATIFIED_POLICY} MISSING_SOURCE=${counts.by_basis.MISSING_SOURCE}`,
)
console.log(
  `PASS rule categories phonetic_rows=${phoneticRows} mystical_rows=${mysticalRows} numerical_rows=${doc.rows.filter((r) => r.rules.some((code) => RULE_CODES[code] === 'NUMERICAL')).length} all_forbid_same_as=true`,
)
console.log(`PASS ${stats.locatorChecks} locator quotes resolved at the cited file:line`)
console.log(
  `PASS same_as_claims=${counts.same_as_claims} alias_approvals=0 rejected_pairs=${counts.rejected_pairs} evidence_items=${counts.evidence_items}`,
)
console.log('PASS declared counts match rows; every referent is used; no invented, self-linked or duplicate pair')
console.log('PASS no PHONETIC or MYSTICAL rule approves an alias; rejected pairs carry no approved equivalence')
console.log('NOTE NEEDS_SOURCE rows record repository silence, not proof of distinctness; SHADOW character/workspace stays DISPUTED')
