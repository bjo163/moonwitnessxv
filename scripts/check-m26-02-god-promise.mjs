#!/usr/bin/env node
/**
 * scripts/check-m26-02-god-promise.mjs
 *
 * M26-02 gate: the 00-MAIN GOD PROMISE recovery ledger keeps the MAIN
 * original, GOD PROMISE: THE ROCKSOUL and the academic 1·6·3 paper as three
 * separate originals, records the repository evidence state honestly, and
 * resolves every quoted locator to real repository text at the cited line.
 *
 * What this proves:
 *   1. Rows have unique ids, one single origin_id, an explicit distinct_from
 *      naming the other two origins, and enums/statuses from the declared
 *      vocabulary.
 *   2. No row holds a merged origin list, an origin array, a same_as claim or
 *      any field that would fuse two originals.
 *   3. All three separation pairs exist exactly once, use distinctFrom, set
 *      merge_permitted=false, and each forbidden merge is allowed=false.
 *   4. EVIDENCED is impossible without a registered primary artifact carrying
 *      a path, a sha256 and a resolving locator; no EVIDENCED row exists here.
 *   5. Every row/evidence/separation/absence locator resolves to an existing
 *      file line that contains the quoted substring.
 *   6. The mention inventory recounts to the same matching-line total, and
 *      declared totals/tallies equal the rows.
 *
 * What this does not prove: that any original exists. Zero manuscripts are
 * recovered; a label, a gap note and an editorial description are not text.
 *
 * Run:            node scripts/check-m26-02-god-promise.mjs
 * Negative test:  node scripts/check-m26-02-god-promise.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { existsSync, readFileSync } from 'node:fs'

const LEDGER = 'docs/data/M26-02-god-promise.json'
const SCHEMA = 'm26-02-god-promise/1'
const TASK_ID = 'M26-02'
const SURVEY_REGEX = /god[ -]?promise|rocksoul|00[ -]main/i
const SURVEY_PATTERN = 'god[ -]?promise|rocksoul|00[ -]main'

const CLAIM_STATES = ['EVIDENCED', 'LABEL_ONLY', 'NEEDS_SOURCE']
const LOCATOR_KINDS = [
  'PRIMARY_ARTIFACT',
  'LABEL_INDEX',
  'GAP_NOTE',
  'SECONDARY_REPORT',
  'PIN_RECORD',
  'EDITORIAL_DESCRIPTION',
]
const RECOVERY_STATES = ['RECOVERED', 'NOT_RECOVERED']
const RIGHTS = [
  'RIGHTS_EXACT_VERSION_CLEARED',
  'RIGHTS_UNKNOWN',
  'PRIVATE_WITNESS',
  'MISSING_MEDIA',
]
const ORIGINS = ['ORIGIN_00_MAIN', 'ORIGIN_ROCKSOUL', 'ORIGIN_PAPER_163']
const INVENTORY_CLASSES = [
  'ORIGINAL_EVIDENCE',
  'SECONDARY_ANALYSIS',
  'FAMILY_CONTEXT',
  'ARCHITECTURE_CONSTRAINT',
  'TASK_SPECIFICATION',
  'MOCKUP_LABEL',
  'INCIDENTAL_NAME',
]
const ASSERTIONS = {
  different_originals_not_automatically_merged: true,
  no_same_as_claim: true,
  no_manuscript_recovered: true,
  labels_are_not_manuscripts: true,
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

function checkEvidence(list, where, readLines, stats, fail, allowEmpty = false) {
  if (!Array.isArray(list)) {
    fail(`${where} needs an evidence array`)
    return
  }
  if (list.length === 0) {
    if (!allowEmpty) fail(`${where} has no evidence locators`)
    return
  }
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (!item || typeof item.locator !== 'string' || typeof item.quote !== 'string') {
      fail(`${where} evidence[${i}] needs locator+quote strings`)
      continue
    }
    checkLocator(item.locator, item.quote, readLines, stats, fail, `${where} evidence[${i}]`)
  }
}

function pairKey(left, right) {
  return [left, right].sort().join('|')
}

function validate(doc, readLines, stats = { locatorChecks: 0 }) {
  const errors = []
  const fail = (msg) => errors.push(msg)

  if (doc.schema !== SCHEMA) fail(`schema ${JSON.stringify(doc.schema)} !== ${SCHEMA}`)
  if (doc.task_id !== TASK_ID) fail(`task_id ${JSON.stringify(doc.task_id)} !== ${TASK_ID}`)
  if (typeof doc.baseline_sha !== 'string' || !/^[0-9a-f]{40}$/.test(doc.baseline_sha)) {
    fail('baseline_sha must be a 40-hex commit SHA')
  }

  if (!sameList(doc.claim_state_enum, CLAIM_STATES)) {
    fail('claim_state_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.locator_kind_enum, LOCATOR_KINDS)) {
    fail('locator_kind_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.recovery_state_enum, RECOVERY_STATES)) {
    fail('recovery_state_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.rights_enum, RIGHTS)) {
    fail('rights_enum does not match the M06-06 rights vocabulary')
  }
  if (!sameList(doc.origin_enum, ORIGINS)) {
    fail('origin_enum does not match the three declared originals')
  }
  if (!sameList(doc.inventory_class_enum, INVENTORY_CLASSES)) {
    fail('inventory_class_enum does not match the ledger vocabulary')
  }
  for (const status of CLAIM_STATES) {
    if (!doc.claim_state_definitions || typeof doc.claim_state_definitions[status] !== 'string') {
      fail(`claim_state_definitions.${status} is missing`)
    }
  }
  for (const [key, expected] of Object.entries(ASSERTIONS)) {
    if (!doc.assertions || doc.assertions[key] !== expected) {
      fail(`assertions.${key} must be ${expected}`)
    }
  }

  const acceptance = doc.acceptance
  if (!acceptance || typeof acceptance !== 'object') {
    fail('acceptance is missing')
  } else {
    if (typeof acceptance.text !== 'string' || acceptance.text.trim() === '') {
      fail('acceptance.text is empty')
    }
    if (acceptance.quote !== acceptance.text) {
      fail('acceptance.quote must equal acceptance.text')
    }
    if (typeof acceptance.locator !== 'string' || typeof acceptance.quote !== 'string') {
      fail('acceptance needs locator+quote strings')
    } else {
      checkLocator(acceptance.locator, acceptance.quote, readLines, stats, fail, 'acceptance')
    }
  }

  const origins = Array.isArray(doc.origins) ? doc.origins : []
  if (origins.length !== ORIGINS.length) {
    fail(`origins has ${origins.length} entries; expected ${ORIGINS.length}`)
  }
  const originIds = new Set()
  for (let i = 0; i < origins.length; i++) {
    const origin = origins[i] || {}
    const where = `origin[${i}]`
    if (!ORIGINS.includes(origin.id)) {
      fail(`${where} id ${JSON.stringify(origin.id)} is not in ${ORIGINS.join('|')}`)
      continue
    }
    if (originIds.has(origin.id)) fail(`duplicate origin id ${origin.id}`)
    originIds.add(origin.id)
    if (typeof origin.canonical_name !== 'string' || origin.canonical_name.trim() === '') {
      fail(`${where} has no canonical_name`)
    }
    if (!RIGHTS.includes(origin.rights_status)) {
      fail(`${where} rights_status ${JSON.stringify(origin.rights_status)} is not in M06-06 vocabulary`)
    }
    if (typeof origin.manuscript_recovered !== 'boolean') {
      fail(`${where} manuscript_recovered must be boolean`)
    }
    if (typeof origin.label_locator !== 'string' || typeof origin.label_quote !== 'string') {
      fail(`${where} needs label_locator+label_quote`)
    } else {
      checkLocator(origin.label_locator, origin.label_quote, readLines, stats, fail, where)
    }
  }
  for (const id of ORIGINS) {
    if (!originIds.has(id)) fail(`origin ${id} is missing`)
  }

  const rows = Array.isArray(doc.rows) ? doc.rows : []
  if (rows.length === 0) fail('rows is empty or not an array')

  const artifacts = Array.isArray(doc.primary_artifacts) ? doc.primary_artifacts : []
  if (!Array.isArray(doc.primary_artifacts)) fail('primary_artifacts must be an array')
  const artifactsById = new Map()
  for (let i = 0; i < artifacts.length; i++) {
    const artifact = artifacts[i] || {}
    const where = `primary_artifacts[${i}]`
    if (typeof artifact.id !== 'string' || artifact.id.trim() === '') {
      fail(`${where} has no id`)
      continue
    }
    if (artifactsById.has(artifact.id)) fail(`duplicate primary artifact id ${artifact.id}`)
    artifactsById.set(artifact.id, artifact)
    if (typeof artifact.path !== 'string' || !existsSync(artifact.path)) {
      fail(`${where} path ${JSON.stringify(artifact.path)} does not exist`)
    }
    if (typeof artifact.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(artifact.sha256)) {
      fail(`${where} sha256 must be 64 lowercase hex characters`)
    }
    if (!RIGHTS.includes(artifact.rights_status)) {
      fail(`${where} rights_status ${JSON.stringify(artifact.rights_status)} is not in M06-06 vocabulary`)
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
    const where = `row ${row.id}`

    if (!ORIGINS.includes(row.origin_id)) {
      fail(`${where} origin_id ${JSON.stringify(row.origin_id)} is not a single declared origin`)
    }
    if (row.merged_origin_ids !== undefined) {
      if (!Array.isArray(row.merged_origin_ids)) {
        fail(`${where} merged_origin_ids must be an array`)
      } else if (row.merged_origin_ids.length > 0) {
        fail(`${where} merges ${row.merged_origin_ids.length} origins into one row; record separate rows instead`)
      }
    }
    if (row.merged_with !== undefined && row.merged_with !== null) {
      fail(`${where} carries merged_with ${JSON.stringify(row.merged_with)}; distinct originals may not be merged`)
    }
    if (row.same_as !== undefined && row.same_as !== null && row.same_as !== false) {
      fail(`${where} carries a same_as claim ${JSON.stringify(row.same_as)}; no sameAs claim is approved`)
    }
    const others = ORIGINS.filter((id) => id !== row.origin_id)
    if (
      !Array.isArray(row.distinct_from) ||
      row.distinct_from.length !== others.length ||
      row.distinct_from.includes(row.origin_id) ||
      !others.every((id) => row.distinct_from.includes(id))
    ) {
      fail(`${where} distinct_from must name exactly the other two origins`)
    }

    if (!CLAIM_STATES.includes(row.claim_state)) {
      fail(`${where} claim_state ${JSON.stringify(row.claim_state)} is not in ${CLAIM_STATES.join('|')}`)
    }
    if (!LOCATOR_KINDS.includes(row.locator_kind)) {
      fail(`${where} locator_kind ${JSON.stringify(row.locator_kind)} is not in ${LOCATOR_KINDS.join('|')}`)
    }
    if (!RECOVERY_STATES.includes(row.recovery_state)) {
      fail(`${where} recovery_state ${JSON.stringify(row.recovery_state)} is not in ${RECOVERY_STATES.join('|')}`)
    }
    if (typeof row.finding !== 'string' || row.finding.trim().length < 20) {
      fail(`${where} has no substantive finding`)
    }

    if (row.claim_state === 'EVIDENCED') {
      if (typeof row.primary_artifact_id !== 'string' || row.primary_artifact_id.trim() === '') {
        fail(`${where} claims EVIDENCED without a registered primary artifact`)
      } else if (!artifactsById.has(row.primary_artifact_id)) {
        fail(`${where} references unregistered primary artifact ${JSON.stringify(row.primary_artifact_id)}`)
      } else {
        const artifact = artifactsById.get(row.primary_artifact_id)
        if (row.locator_kind !== 'PRIMARY_ARTIFACT') {
          fail(`${where} claims EVIDENCED but locator_kind is ${JSON.stringify(row.locator_kind)}`)
        }
        if (
          typeof row.source_locator !== 'string' ||
          typeof artifact.path !== 'string' ||
          !row.source_locator.startsWith(`${artifact.path}:`)
        ) {
          fail(`${where} source_locator must point into primary artifact ${JSON.stringify(artifact.path)}`)
        }
        if (row.recovery_state !== 'RECOVERED') {
          fail(`${where} claims EVIDENCED but recovery_state is ${JSON.stringify(row.recovery_state)}`)
        }
        if (row.manuscript_recovered !== true) {
          fail(`${where} claims EVIDENCED but manuscript_recovered is not true`)
        }
      }
    } else {
      if (row.primary_artifact_id !== null) {
        fail(`${where} is ${row.claim_state} but carries primary_artifact_id ${JSON.stringify(row.primary_artifact_id)}`)
      }
      if (row.locator_kind === 'PRIMARY_ARTIFACT') {
        fail(`${where} is ${row.claim_state} but locator_kind is PRIMARY_ARTIFACT`)
      }
      if (row.recovery_state !== 'NOT_RECOVERED') {
        fail(`${where} is ${row.claim_state} but recovery_state is ${JSON.stringify(row.recovery_state)}`)
      }
      if (row.manuscript_recovered !== false) {
        fail(`${where} is ${row.claim_state} but manuscript_recovered is not false`)
      }
    }

    checkEvidence(row.evidence, where, readLines, stats, fail)
    if (Array.isArray(row.evidence) && typeof row.source_locator === 'string') {
      const repeated = row.evidence.some((item) => item && item.locator === row.source_locator)
      if (!repeated) {
        fail(`${where} source_locator is not repeated in evidence and cannot be quote-verified`)
      }
    }
  }

  const separation = Array.isArray(doc.separation_assertions) ? doc.separation_assertions : []
  if (separation.length !== 3) {
    fail(`separation_assertions has ${separation.length} entries; expected 3 pair assertions`)
  }
  const sepIds = new Set()
  const sepPairs = new Map()
  for (let i = 0; i < separation.length; i++) {
    const assertion = separation[i] || {}
    const where = `separation[${i}]`
    if (typeof assertion.id !== 'string' || assertion.id.trim() === '') {
      fail(`${where} has no id`)
    } else {
      if (sepIds.has(assertion.id)) fail(`duplicate separation id ${assertion.id}`)
      sepIds.add(assertion.id)
    }
    if (!ORIGINS.includes(assertion.left) || !ORIGINS.includes(assertion.right)) {
      fail(`${where} left/right must be declared origins`)
      continue
    }
    if (assertion.left === assertion.right) fail(`${where} compares an origin with itself`)
    if (assertion.relation !== 'distinctFrom') {
      fail(`${where} relation ${JSON.stringify(assertion.relation)} must be distinctFrom`)
    }
    if (assertion.merge_permitted !== false) {
      fail(`${where} merge_permitted must be false`)
    }
    const key = pairKey(assertion.left, assertion.right)
    if (sepPairs.has(key)) fail(`duplicate separation pair ${key}`)
    sepPairs.set(key, assertion)
    if (typeof assertion.note !== 'string' || assertion.note.trim().length < 20) {
      fail(`${where} has no substantive note`)
    }
    checkEvidence(assertion.evidence, where, readLines, stats, fail)
  }
  const requiredPairs = []
  for (let i = 0; i < ORIGINS.length; i++) {
    for (let j = i + 1; j < ORIGINS.length; j++) requiredPairs.push(pairKey(ORIGINS[i], ORIGINS[j]))
  }
  for (const key of requiredPairs) {
    if (!sepPairs.has(key)) fail(`separation pair ${key} is missing`)
  }

  const prohibition = doc.merge_prohibition
  if (!prohibition || typeof prohibition !== 'object') {
    fail('merge_prohibition is missing')
  } else {
    if (prohibition.policy !== 'DISTINCT_ORIGINALS_MUST_NOT_BE_AUTOMATICALLY_MERGED') {
      fail('merge_prohibition.policy does not forbid automatic merging')
    }
    if (prohibition.automatic_merge_allowed !== false) {
      fail('merge_prohibition.automatic_merge_allowed must be false')
    }
    if (!Array.isArray(prohibition.same_as_claims) || prohibition.same_as_claims.length > 0) {
      fail('merge_prohibition.same_as_claims must be an empty array')
    }
    if (
      !Array.isArray(prohibition.required_before_any_merge) ||
      prohibition.required_before_any_merge.length === 0 ||
      prohibition.required_before_any_merge.some((item) => typeof item !== 'string' || item.trim() === '')
    ) {
      fail('merge_prohibition.required_before_any_merge must list non-empty requirements')
    }
    const forbidden = Array.isArray(prohibition.forbidden_merges) ? prohibition.forbidden_merges : []
    if (forbidden.length !== 3) {
      fail(`forbidden_merges has ${forbidden.length} entries; expected 3`)
    }
    const forbiddenPairs = new Map()
    for (let i = 0; i < forbidden.length; i++) {
      const entry = forbidden[i] || {}
      const where = `forbidden_merges[${i}]`
      if (!ORIGINS.includes(entry.left) || !ORIGINS.includes(entry.right)) {
        fail(`${where} left/right must be declared origins`)
        continue
      }
      if (entry.left === entry.right) fail(`${where} compares an origin with itself`)
      if (entry.allowed !== false) fail(`${where} must set allowed=false`)
      const key = pairKey(entry.left, entry.right)
      if (forbiddenPairs.has(key)) fail(`duplicate forbidden merge ${key}`)
      forbiddenPairs.set(key, entry)
    }
    for (const key of requiredPairs) {
      if (!forbiddenPairs.has(key)) fail(`forbidden merge ${key} is missing`)
    }
  }

  const absence = Array.isArray(doc.absence_checks) ? doc.absence_checks : []
  if (absence.length === 0) fail('absence_checks is empty')
  const absenceIds = new Set()
  for (let i = 0; i < absence.length; i++) {
    const check = absence[i] || {}
    const where = `absence[${i}]`
    if (typeof check.id !== 'string' || check.id.trim() === '') {
      fail(`${where} has no id`)
    } else {
      if (absenceIds.has(check.id)) fail(`duplicate absence id ${check.id}`)
      absenceIds.add(check.id)
    }
    for (const field of ['probe', 'observed', 'statement']) {
      if (typeof check[field] !== 'string' || check[field].trim() === '') {
        fail(`${where} ${field} is empty`)
      }
    }
    if (check.evidence === undefined) continue
    checkEvidence(check.evidence, where, readLines, stats, fail, true)
  }

  const inventory = doc.mention_inventory
  if (!inventory || typeof inventory !== 'object') {
    fail('mention_inventory is missing')
  } else {
    if (inventory.regex !== SURVEY_PATTERN) {
      fail('mention_inventory.regex does not match the survey pattern')
    }
    const files = Array.isArray(inventory.files) ? inventory.files : []
    if (files.length === 0) fail('mention_inventory.files is empty')
    const paths = new Set()
    let total = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i] || {}
      const where = `mention_inventory.files[${i}]`
      if (typeof file.path !== 'string' || file.path.trim() === '') {
        fail(`${where} has no path`)
        continue
      }
      if (paths.has(file.path)) fail(`duplicate mention-inventory path ${file.path}`)
      paths.add(file.path)
      if (!INVENTORY_CLASSES.includes(file.class)) {
        fail(`${where} class ${JSON.stringify(file.class)} is not in ${INVENTORY_CLASSES.join('|')}`)
      }
      if (!Number.isInteger(file.matching_lines) || file.matching_lines < 0) {
        fail(`${where} matching_lines must be a non-negative integer`)
        continue
      }
      if (!existsSync(file.path)) {
        fail(`${where} file ${file.path} does not exist`)
        continue
      }
      const actual = readLines(file.path).filter((line) => SURVEY_REGEX.test(line)).length
      if (actual !== file.matching_lines) {
        fail(`${where} declared ${file.matching_lines} matching lines but ${file.path} has ${actual}`)
      }
      total += file.matching_lines
    }
    if (total !== inventory.total_matching_lines) {
      fail(`mention_inventory total ${inventory.total_matching_lines} !== files ${total}`)
    }
  }

  const counts = doc.declared_counts
  if (!counts || typeof counts !== 'object') {
    fail('declared_counts is missing')
    return errors
  }
  if (counts.total !== rows.length) fail(`declared total ${counts.total} !== rows ${rows.length}`)
  compareTally('by_claim_state', counts.by_claim_state, tally(rows, 'claim_state', CLAIM_STATES), CLAIM_STATES, fail)
  compareTally('by_origin', counts.by_origin, tally(rows, 'origin_id', ORIGINS), ORIGINS, fail)
  compareTally('by_locator_kind', counts.by_locator_kind, tally(rows, 'locator_kind', LOCATOR_KINDS), LOCATOR_KINDS, fail)
  compareTally('by_recovery_state', counts.by_recovery_state, tally(rows, 'recovery_state', RECOVERY_STATES), RECOVERY_STATES, fail)

  if (counts.origins !== origins.length) fail(`declared origins ${counts.origins} !== ${origins.length}`)
  if (counts.separation_pairs !== separation.length) {
    fail(`declared separation_pairs ${counts.separation_pairs} !== ${separation.length}`)
  }
  if (counts.primary_artifacts !== artifacts.length) {
    fail(`declared primary_artifacts ${counts.primary_artifacts} !== ${artifacts.length}`)
  }
  const recovered = rows.filter((row) => row.claim_state === 'EVIDENCED').length
  if (counts.manuscripts_recovered !== recovered) {
    fail(`declared manuscripts_recovered ${counts.manuscripts_recovered} !== EVIDENCED rows ${recovered}`)
  }
  if (counts.absence_checks !== absence.length) {
    fail(`declared absence_checks ${counts.absence_checks} !== ${absence.length}`)
  }
  if (inventory && Array.isArray(inventory.files)) {
    if (counts.mention_inventory_files !== inventory.files.length) {
      fail(`declared mention_inventory_files ${counts.mention_inventory_files} !== ${inventory.files.length}`)
    }
    if (counts.mention_inventory_matching_lines !== inventory.total_matching_lines) {
      fail(
        `declared mention_inventory_matching_lines ${counts.mention_inventory_matching_lines} !== ${inventory.total_matching_lines}`,
      )
    }
  }
  if (!Number.isInteger(counts.verified_locators) || counts.verified_locators < 1) {
    fail('declared verified_locators must be a positive integer')
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
  const pair = (d, id) => d.separation_assertions.find((p) => p.id === id)
  const labelRow = (d) => row(d, 'gp-00-main-label-vision-715')

  function markEvidenced(target) {
    target.claim_state = 'EVIDENCED'
    target.locator_kind = 'PRIMARY_ARTIFACT'
    target.recovery_state = 'RECOVERED'
    target.manuscript_recovered = true
  }

  const cases = [
    {
      name: 'EVIDENCED row without a registered primary artifact is rejected',
      mutate: (d) => {
        const target = labelRow(d)
        markEvidenced(target)
        target.primary_artifact_id = null
      },
    },
    {
      name: 'EVIDENCED row referencing an unregistered primary artifact is rejected',
      mutate: (d) => {
        const target = labelRow(d)
        markEvidenced(target)
        target.primary_artifact_id = 'PA-GOD-PROMISE-01'
      },
    },
    {
      name: 'row carrying a merged origin id list is rejected',
      mutate: (d) => {
        row(d, 'gp-00-main-label-vision-715').merged_origin_ids = [
          'ORIGIN_00_MAIN',
          'ORIGIN_ROCKSOUL',
        ]
      },
    },
    {
      name: 'row with an origin_id array is rejected',
      mutate: (d) => {
        row(d, 'gp-00-main-label-vision-715').origin_id = ['ORIGIN_00_MAIN', 'ORIGIN_ROCKSOUL']
      },
    },
    {
      name: 'row whose distinct_from omits an origin is rejected',
      mutate: (d) => {
        row(d, 'gp-00-main-label-vision-715').distinct_from = ['ORIGIN_ROCKSOUL']
      },
    },
    {
      name: 'row declaring same_as is rejected',
      mutate: (d) => {
        row(d, 'gp-00-main-label-vision-715').same_as = 'ORIGIN_ROCKSOUL'
      },
    },
    {
      name: 'row with an unknown origin id is rejected',
      mutate: (d) => {
        row(d, 'gp-00-main-label-vision-715').origin_id = 'ORIGIN_UNKNOWN'
      },
    },
    {
      name: 'separation assertion permitting merge is rejected',
      mutate: (d) => {
        pair(d, 'sep-00-main-vs-rocksoul').merge_permitted = true
      },
    },
    {
      name: 'forbidden merge marked allowed is rejected',
      mutate: (d) => {
        d.merge_prohibition.forbidden_merges[0].allowed = true
      },
    },
    {
      name: 'missing separation pair is rejected',
      mutate: (d) => {
        d.separation_assertions.pop()
      },
    },
    {
      name: 'separation quote absent from the cited line is rejected',
      mutate: (d) => {
        pair(d, 'sep-00-main-vs-rocksoul').evidence[0].quote = '00-MAIN AND ROCKSOUL ARE ONE MANUSCRIPT'
      },
    },
    {
      name: 'duplicate row id is rejected',
      mutate: (d) => {
        d.rows[1].id = d.rows[0].id
      },
    },
    {
      name: 'misdeclared total is rejected',
      mutate: (d) => {
        d.declared_counts.total = 17
      },
    },
    {
      name: 'misdeclared claim-state tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_claim_state.NEEDS_SOURCE = 10
      },
    },
    {
      name: 'misdeclared origin tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_origin.ORIGIN_PAPER_163 = 6
      },
    },
    {
      name: 'misdeclared locator-kind tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_locator_kind.GAP_NOTE = 8
      },
    },
    {
      name: 'mention-inventory count that does not match the file is rejected',
      mutate: (d) => {
        d.mention_inventory.files[0].matching_lines += 1
      },
    },
    {
      name: 'missing mention-inventory file is rejected',
      mutate: (d) => {
        d.mention_inventory.files.push({
          path: 'docs/data/does-not-exist-god-promise.json',
          matching_lines: 1,
          class: 'SECONDARY_ANALYSIS',
        })
      },
    },
    {
      name: 'acceptance quote absent from the cited line is rejected',
      mutate: (d) => {
        d.acceptance.text = 'All three originals recovered'
        d.acceptance.quote = 'All three originals recovered'
      },
    },
    {
      name: 'redefined claim_state_enum is rejected',
      mutate: (d) => {
        d.claim_state_enum.push('MERGED')
      },
    },
    {
      name: 'LABEL_ONLY row carrying a primary artifact id is rejected',
      mutate: (d) => {
        labelRow(d).primary_artifact_id = 'PA-GOD-PROMISE-01'
      },
    },
    {
      name: 'row locator line outside the file is rejected',
      mutate: (d) => {
        const target = labelRow(d)
        target.source_locator = 'TODO.md:99999'
        target.evidence = [{ locator: 'TODO.md:99999', quote: 'Different originals not automatically merged' }]
      },
    },
    {
      name: 'row quote absent from the cited line is rejected',
      mutate: (d) => {
        labelRow(d).evidence[0].quote = 'ALL THREE ORIGINALS ARE ONE MANUSCRIPT'
      },
    },
    {
      name: 'absence check without a statement is rejected',
      mutate: (d) => {
        d.absence_checks[0].statement = ''
      },
    },
    {
      name: 'flipped no-manuscript-recovered assertion is rejected',
      mutate: (d) => {
        d.assertions.no_manuscript_recovered = false
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
if (errors.length === 0 && stats.locatorChecks !== doc.declared_counts.verified_locators) {
  errors.push(
    `verified locators ${stats.locatorChecks} !== declared ${doc.declared_counts.verified_locators}`,
  )
}
if (errors.length > 0) {
  for (const error of errors) console.error('VIOLATION ' + error)
  console.error(`FAIL: ${errors.length} violation(s)`)
  process.exit(1)
}

const counts = doc.declared_counts
console.log(`PASS rows=${doc.rows.length} unique ids=${new Set(doc.rows.map((r) => r.id)).size}`)
console.log(
  `PASS claim states EVIDENCED=${counts.by_claim_state.EVIDENCED} LABEL_ONLY=${counts.by_claim_state.LABEL_ONLY} NEEDS_SOURCE=${counts.by_claim_state.NEEDS_SOURCE}`,
)
console.log(
  `PASS origins ORIGIN_00_MAIN=${counts.by_origin.ORIGIN_00_MAIN} ORIGIN_ROCKSOUL=${counts.by_origin.ORIGIN_ROCKSOUL} ORIGIN_PAPER_163=${counts.by_origin.ORIGIN_PAPER_163}`,
)
console.log(
  `PASS locator kinds LABEL_INDEX=${counts.by_locator_kind.LABEL_INDEX} GAP_NOTE=${counts.by_locator_kind.GAP_NOTE} SECONDARY_REPORT=${counts.by_locator_kind.SECONDARY_REPORT} PIN_RECORD=${counts.by_locator_kind.PIN_RECORD} EDITORIAL_DESCRIPTION=${counts.by_locator_kind.EDITORIAL_DESCRIPTION}`,
)
console.log(
  `PASS ${doc.separation_assertions.length}/3 separation assertions are distinctFrom; ${doc.merge_prohibition.forbidden_merges.length}/3 forbidden merges are disabled`,
)
console.log(
  `PASS ${doc.mention_inventory.files.length} mention-inventory files / ${doc.mention_inventory.total_matching_lines} matching lines recounted`,
)
console.log(`PASS ${stats.locatorChecks} locator quotes resolved at the cited file:line`)
console.log(
  `PASS zero EVIDENCED rows without a registered primary artifact (registered=${counts.primary_artifacts})`,
)
console.log(
  `PASS declared counts match rows; ${counts.manuscripts_recovered} manuscripts recovered`,
)
console.log('NOTE labels, editorial descriptions and gap notes are not originals')
