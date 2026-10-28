#!/usr/bin/env node
/**
 * scripts/check-m26-06-bidang-amanah.mjs
 *
 * M26-06 gate: the 25 Bidang Amanah source ledger distinguishes a declared
 * 25-field count from an enumerated source, keeps every slot explicitly
 * unverified, and proves that no field name or mission mapping was guessed.
 *
 * What this proves:
 *   1. Slots, candidates, missions and evidence ids are unique; slot indices
 *      are exactly 1..25; status/kind/name vocabularies are the declared ones.
 *   2. Every evidence locator resolves to an existing repository file:line
 *      whose text contains the quoted string.
 *   3. No slot carries a name without a resolving name locator whose quote
 *      contains that exact name. Every slot without a source is NEEDS_SOURCE
 *      with no source_locator.
 *   4. A complete 25-name assertion (asserted_complete_25, asserted_field_count
 *      or any named slot) requires enumerated_source.kind=EXACT_ENUMERATION
 *      with exactly 25 verified entries. This ledger has none.
 *   5. Declared totals and tallies match the rows, candidate kinds included.
 *   6. The mission table lists real source-cited missions, and every claimed
 *      mission-to-slot mapping carries its own verified locator. Zero mappings
 *      is consistent with mission_mapping.status=NOT_FOUND.
 *
 * What this does not prove: that any of the 25 fields exists as a source
 * artifact. Zero fields are evidenced; a declared count is not an inventory.
 *
 * Run:            node scripts/check-m26-06-bidang-amanah.mjs
 * Negative test:  node scripts/check-m26-06-bidang-amanah.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { existsSync, readFileSync } from 'node:fs'

const LEDGER = 'docs/data/M26-06-bidang-amanah.json'

const STATUSES = ['EVIDENCED', 'PARTIAL_REFERENCE', 'NEEDS_SOURCE', 'NOT_FOUND']
const CANDIDATE_KINDS = [
  'MODEL_LABEL',
  'RECOVERY_MANDATE',
  'COUNT_STATEMENT',
  'RELATED_PROPOSAL',
  'RELATED_REGISTRY',
  'ABSENCE_STATEMENT',
  'LABEL_COLLISION',
  'EXTERNAL_REFERENCE',
]
const LOCATOR_KINDS = [
  'EXACT_ENUMERATION',
  'MODEL_REFERENCE',
  'COUNT_ONLY',
  'PLAN',
  'RELATED_PROPOSAL',
  'RELATED_REGISTRY',
  'ABSENCE_STATEMENT',
  'LABEL_COLLISION',
  'EXTERNAL_REFERENCE',
]
const NAME_STATUSES = ['EVIDENCED_IN_REPOSITORY', 'NOT_NAMED_IN_REPOSITORY']
const MAPPING_STATUSES = ['EVIDENCED', 'PARTIAL_REFERENCE', 'NEEDS_SOURCE', 'NOT_FOUND']
const SLOT_TOTAL = 25

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
    return false
  }
  const file = match[1]
  const lineNo = Number(match[2])
  if (!existsSync(file)) {
    fail(`${where} locator file ${file} does not exist`)
    return false
  }
  const lines = readLines(file)
  if (lineNo < 1 || lineNo > lines.length) {
    fail(`${where} locator line ${lineNo} is outside ${file} lines 1-${lines.length}`)
    return false
  }
  if (typeof quote !== 'string' || quote.trim() === '') {
    fail(`${where} has an empty quote`)
    return false
  }
  if (!lines[lineNo - 1].includes(quote)) {
    fail(`${where} quote ${JSON.stringify(quote)} not found at ${locator}`)
    return false
  }
  stats.locatorChecks++
  return true
}

function validate(doc, readLines, stats = { locatorChecks: 0 }) {
  const errors = []
  const fail = (msg) => errors.push(msg)
  const evidenceIdsSeen = new Set()
  const allIds = new Set()

  if (typeof doc.task !== 'string' || doc.task !== 'M26-06') fail('task must be M26-06')
  if (!/^[0-9a-f]{40}$/.test(doc.baseline_sha || '')) fail('baseline_sha must be a 40-char hex SHA')
  if (!/^[0-9a-f]{40}$/.test(doc.observed_head_sha || '')) {
    fail('observed_head_sha must be a 40-char hex SHA')
  }
  if (typeof doc.acceptance !== 'string' || doc.acceptance.trim() === '') fail('acceptance is missing')
  if (!Array.isArray(doc.assertions) || doc.assertions.length === 0) fail('assertions is empty')
  if (!Array.isArray(doc.limitations) || doc.limitations.length === 0) fail('limitations is empty')

  for (const [name, values] of [
    ['status_enum', STATUSES],
    ['candidate_kind_enum', CANDIDATE_KINDS],
    ['locator_kind_enum', LOCATOR_KINDS],
    ['name_status_enum', NAME_STATUSES],
    ['mapping_status_enum', MAPPING_STATUSES],
  ]) {
    if (!sameList(doc[name], values)) fail(`${name} does not match the ledger vocabulary`)
  }

  const slots = Array.isArray(doc.slots) ? doc.slots : []
  const candidates = Array.isArray(doc.candidates) ? doc.candidates : []
  if (slots.length === 0) fail('slots is empty or not an array')
  if (candidates.length === 0) fail('candidates is empty or not an array')

  // Evidence catalog: every locator/quote is resolved once, every id unique.
  const catalog = new Map()
  const evidence = Array.isArray(doc.evidence) ? doc.evidence : []
  if (evidence.length === 0) fail('evidence catalog is empty or not an array')
  for (let i = 0; i < evidence.length; i++) {
    const item = evidence[i]
    if (!item || typeof item.id !== 'string' || item.id.trim() === '') {
      fail(`evidence[${i}] has no id`)
      continue
    }
    if (evidenceIdsSeen.has(item.id)) fail(`duplicate evidence id ${item.id}`)
    evidenceIdsSeen.add(item.id)
    if (typeof item.role !== 'string' || item.role.trim() === '') {
      fail(`evidence ${item.id} has no role`)
    }
    checkLocator(item.locator, item.quote, readLines, stats, fail, `evidence ${item.id}`)
    catalog.set(item.id, item)
  }

  function checkEvidenceIds(list, where) {
    if (!Array.isArray(list) || list.length === 0) {
      fail(`${where} has no evidence ids`)
      return []
    }
    const items = []
    for (const id of list) {
      if (!catalog.has(id)) {
        fail(`${where} references missing evidence id ${JSON.stringify(id)}`)
      } else {
        items.push(catalog.get(id))
      }
    }
    return items
  }

  function checkSourceRepeated(sourceLocator, evidenceItems, where) {
    if (typeof sourceLocator !== 'string' || sourceLocator.trim() === '') {
      fail(`${where} has no source_locator`)
      return false
    }
    if (!evidenceItems.some((item) => item.locator === sourceLocator)) {
      fail(`${where} source_locator is not repeated in evidence and cannot be quote-verified`)
      return false
    }
    return true
  }

  // The no-guess invariant and the enumerated-source guard.
  const guard = doc.no_guessed_names
  if (!guard || typeof guard !== 'object') {
    fail('no_guessed_names is missing')
  } else {
    if (guard.invariant !== true) fail('no_guessed_names.invariant must be true')
    if (typeof guard.asserted_complete_25 !== 'boolean') {
      fail('no_guessed_names.asserted_complete_25 must be a boolean')
    }
    if (!Number.isInteger(guard.asserted_field_count) || guard.asserted_field_count < 0) {
      fail('no_guessed_names.asserted_field_count must be a non-negative integer')
    }
    if (!Array.isArray(guard.manufactured_names) || guard.manufactured_names.length !== 0) {
      fail('no_guessed_names.manufactured_names must be an empty array')
    }
    if (typeof guard.rule !== 'string' || guard.rule.trim() === '') {
      fail('no_guessed_names.rule is missing')
    }
  }

  const enumerated = doc.enumerated_source
  if (enumerated !== null) {
    if (!enumerated || typeof enumerated !== 'object') {
      fail('enumerated_source must be null or an object')
    } else {
      if (enumerated.kind !== 'EXACT_ENUMERATION') {
        fail(`enumerated_source.kind must be EXACT_ENUMERATION, got ${JSON.stringify(enumerated.kind)}`)
      }
      const entries = Array.isArray(enumerated.entries) ? enumerated.entries : []
      if (entries.length !== SLOT_TOTAL) {
        fail(`enumerated_source.entries ${entries.length} !== ${SLOT_TOTAL}`)
      }
      const fields = new Set()
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        if (!entry || typeof entry.field !== 'string' || entry.field.trim() === '') {
          fail(`enumerated_source.entries[${i}] has no field name`)
          continue
        }
        if (fields.has(entry.field)) fail(`duplicate enumerated field ${JSON.stringify(entry.field)}`)
        fields.add(entry.field)
        checkLocator(
          entry.locator,
          entry.quote,
          readLines,
          stats,
          fail,
          `enumerated_source.entries[${i}]`,
        )
        if (typeof entry.quote === 'string' && !entry.quote.includes(entry.field)) {
          fail(`enumerated_source.entries[${i}] quote does not contain its field name`)
        }
      }
    }
  }

  const namedSlots = slots.filter((slot) => slot && slot.name !== null && slot.name !== undefined)
  if (!guard || guard.invariant === true) {
    const assertsComplete = guard && guard.asserted_complete_25 === true
    const assertsCount = guard && Number.isInteger(guard.asserted_field_count) && guard.asserted_field_count > 0
    if ((assertsComplete || assertsCount || namedSlots.length > 0) && enumerated === null) {
      fail('a 25-name assertion or named slot exists without an enumerated_source')
    }
    if (enumerated === null && guard && guard.asserted_field_count !== 0) {
      fail('asserted_field_count must be 0 when enumerated_source is null')
    }
  }

  // Slots.
  const slotIndices = []
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (!slot || typeof slot !== 'object') {
      fail(`slots[${i}] is not an object`)
      continue
    }
    if (typeof slot.id !== 'string' || slot.id.trim() === '') {
      fail(`slots[${i}] has no id`)
      continue
    }
    if (allIds.has(slot.id)) fail(`duplicate id ${slot.id}`)
    allIds.add(slot.id)
    if (!Number.isInteger(slot.slot) || slot.slot < 1 || slot.slot > SLOT_TOTAL) {
      fail(`slot ${slot.id} slot index ${JSON.stringify(slot.slot)} is outside 1-${SLOT_TOTAL}`)
    } else {
      slotIndices.push(slot.slot)
      if (slot.id !== `amanah-slot-${String(slot.slot).padStart(2, '0')}`) {
        fail(`slot ${slot.id} id does not match its index ${slot.slot}`)
      }
    }
    if (!STATUSES.includes(slot.status)) {
      fail(`slot ${slot.id} status ${JSON.stringify(slot.status)} is not in ${STATUSES.join('|')}`)
    }
    if (!NAME_STATUSES.includes(slot.name_status)) {
      fail(`slot ${slot.id} name_status ${JSON.stringify(slot.name_status)} is not in ${NAME_STATUSES.join('|')}`)
    }
    if (!MAPPING_STATUSES.includes(slot.mission_mapping_status)) {
      fail(`slot ${slot.id} mission_mapping_status ${JSON.stringify(slot.mission_mapping_status)} is not in ${MAPPING_STATUSES.join('|')}`)
    }
    if (typeof slot.sequence_known !== 'boolean') {
      fail(`slot ${slot.id} sequence_known must be a boolean`)
    } else if (slot.sequence_known === true) {
      checkLocator(slot.sequence_locator, slot.sequence_quote, readLines, stats, fail, `slot ${slot.id} sequence`)
    }

    const namePresent = slot.name !== null && slot.name !== undefined
    if (namePresent) {
      if (typeof slot.name !== 'string' || slot.name.trim() === '') {
        fail(`slot ${slot.id} name must be a non-empty string or null`)
      }
      if (slot.name_status !== 'EVIDENCED_IN_REPOSITORY') {
        fail(`slot ${slot.id} has a name but name_status is ${JSON.stringify(slot.name_status)}`)
      }
      checkLocator(slot.name_locator, slot.name_quote, readLines, stats, fail, `slot ${slot.id} name`)
      if (typeof slot.name_quote === 'string' && typeof slot.name === 'string' && !slot.name_quote.includes(slot.name)) {
        fail(`slot ${slot.id} name_quote does not contain its own name`)
      }
    } else {
      if (slot.name_status !== 'NOT_NAMED_IN_REPOSITORY') {
        fail(`slot ${slot.id} has no name but name_status is ${JSON.stringify(slot.name_status)}`)
      }
      if (slot.name_locator !== null && slot.name_locator !== undefined) {
        fail(`slot ${slot.id} has no name but carries name_locator`)
      }
    }

    const evidenceItems = checkEvidenceIds(slot.evidence_ids, `slot ${slot.id}`)
    if (slot.status === 'EVIDENCED') {
      if (!namePresent) fail(`slot ${slot.id} claims EVIDENCED without a name`)
      if (enumerated === null) fail(`slot ${slot.id} claims EVIDENCED without an enumerated_source`)
      if (typeof slot.source_locator !== 'string' || slot.source_locator.trim() === '') {
        fail(`slot ${slot.id} claims EVIDENCED without source_locator`)
      } else {
        checkSourceRepeated(slot.source_locator, evidenceItems, `slot ${slot.id}`)
      }
    } else if (slot.status === 'PARTIAL_REFERENCE') {
      if (namePresent) fail(`slot ${slot.id} is PARTIAL_REFERENCE but carries a name`)
      checkSourceRepeated(slot.source_locator, evidenceItems, `slot ${slot.id}`)
    } else {
      if (namePresent) fail(`slot ${slot.id} is ${slot.status} but carries a name`)
      if (slot.source_locator !== null && slot.source_locator !== undefined) {
        fail(`slot ${slot.id} is ${slot.status} but carries source_locator ${JSON.stringify(slot.source_locator)}`)
      }
    }
  }

  const uniqueIndices = new Set(slotIndices)
  if (uniqueIndices.size !== slotIndices.length) fail('slot indices contain duplicates')
  for (let n = 1; n <= SLOT_TOTAL; n++) {
    if (!uniqueIndices.has(n)) fail(`slot index ${n} is missing`)
  }

  // Candidates.
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]
    if (!candidate || typeof candidate !== 'object') {
      fail(`candidates[${i}] is not an object`)
      continue
    }
    if (typeof candidate.id !== 'string' || candidate.id.trim() === '') {
      fail(`candidates[${i}] has no id`)
      continue
    }
    if (allIds.has(candidate.id)) fail(`duplicate id ${candidate.id}`)
    allIds.add(candidate.id)
    if (!CANDIDATE_KINDS.includes(candidate.kind)) {
      fail(`candidate ${candidate.id} kind ${JSON.stringify(candidate.kind)} is not in ${CANDIDATE_KINDS.join('|')}`)
    }
    if (!STATUSES.includes(candidate.status)) {
      fail(`candidate ${candidate.id} status ${JSON.stringify(candidate.status)} is not in ${STATUSES.join('|')}`)
    }
    if (candidate.locator_kind !== null && !LOCATOR_KINDS.includes(candidate.locator_kind)) {
      fail(`candidate ${candidate.id} locator_kind ${JSON.stringify(candidate.locator_kind)} is not in the vocabulary`)
    }
    if (typeof candidate.contribution !== 'string' || candidate.contribution.trim() === '') {
      fail(`candidate ${candidate.id} has no contribution note`)
    }
    const evidenceItems = checkEvidenceIds(candidate.evidence_ids, `candidate ${candidate.id}`)

    if (candidate.status === 'EVIDENCED') {
      if (candidate.locator_kind !== 'EXACT_ENUMERATION') {
        fail(`candidate ${candidate.id} claims EVIDENCED but locator_kind is ${JSON.stringify(candidate.locator_kind)}`)
      }
      if (enumerated === null) {
        fail(`candidate ${candidate.id} claims EVIDENCED without an enumerated_source`)
      }
      checkSourceRepeated(candidate.source_locator, evidenceItems, `candidate ${candidate.id}`)
    } else if (candidate.status === 'PARTIAL_REFERENCE') {
      if (candidate.locator_kind === null || candidate.locator_kind === 'EXACT_ENUMERATION') {
        fail(`candidate ${candidate.id} is PARTIAL_REFERENCE but locator_kind is ${JSON.stringify(candidate.locator_kind)}`)
      }
      checkSourceRepeated(candidate.source_locator, evidenceItems, `candidate ${candidate.id}`)
    } else {
      if (candidate.source_locator !== null && candidate.source_locator !== undefined) {
        fail(`candidate ${candidate.id} is ${candidate.status} but carries source_locator ${JSON.stringify(candidate.source_locator)}`)
      }
      if (candidate.locator_kind !== null && candidate.locator_kind !== undefined) {
        fail(`candidate ${candidate.id} is ${candidate.status} but carries locator_kind ${JSON.stringify(candidate.locator_kind)}`)
      }
    }
  }

  // Mission mapping, including per-mission locators and slot references.
  const mapping = doc.mission_mapping
  if (!mapping || typeof mapping !== 'object') {
    fail('mission_mapping is missing')
  } else {
    if (!MAPPING_STATUSES.includes(mapping.status)) {
      fail(`mission_mapping.status ${JSON.stringify(mapping.status)} is not in the vocabulary`)
    }
    checkEvidenceIds(mapping.evidence_ids, 'mission_mapping')
    const missions = Array.isArray(mapping.missions) ? mapping.missions : []
    if (missions.length === 0) fail('mission_mapping.missions is empty or not an array')
    const missionIds = new Set()
    const missionCodes = new Set()
    const mappedSlots = []
    let mappedMissions = 0
    for (let i = 0; i < missions.length; i++) {
      const mission = missions[i]
      if (!mission || typeof mission !== 'object') {
        fail(`mission_mapping.missions[${i}] is not an object`)
        continue
      }
      if (typeof mission.id !== 'string' || mission.id.trim() === '') {
        fail(`mission_mapping.missions[${i}] has no id`)
        continue
      }
      if (allIds.has(mission.id)) fail(`duplicate id ${mission.id}`)
      allIds.add(mission.id)
      if (missionIds.has(mission.id)) fail(`duplicate mission id ${mission.id}`)
      missionIds.add(mission.id)
      if (typeof mission.mission_code !== 'string' || !/^ms_\d{3}$/.test(mission.mission_code)) {
        fail(`mission ${mission.id} mission_code ${JSON.stringify(mission.mission_code)} is not ms_###`)
      } else {
        if (missionCodes.has(mission.mission_code)) fail(`duplicate mission code ${mission.mission_code}`)
        missionCodes.add(mission.mission_code)
      }
      if (typeof mission.figure_code !== 'string' || !/^fg_\d{3}$/.test(mission.figure_code)) {
        fail(`mission ${mission.id} figure_code ${JSON.stringify(mission.figure_code)} is not fg_###`)
      }
      if (typeof mission.title !== 'string' || mission.title.trim() === '') {
        fail(`mission ${mission.id} has no title`)
      }
      checkLocator(mission.source_locator, mission.source_quote, readLines, stats, fail, `mission ${mission.id} source`)
      if (
        typeof mission.source_quote === 'string' &&
        typeof mission.mission_code === 'string' &&
        !mission.source_quote.includes(mission.mission_code)
      ) {
        fail(`mission ${mission.id} source_quote does not contain its mission code`)
      }
      checkLocator(mission.title_locator, mission.title_quote, readLines, stats, fail, `mission ${mission.id} title`)
      if (
        typeof mission.title_quote === 'string' &&
        typeof mission.title === 'string' &&
        !mission.title_quote.includes(mission.title)
      ) {
        fail(`mission ${mission.id} title_quote does not contain its title`)
      }
      if (!MAPPING_STATUSES.includes(mission.mapping_status)) {
        fail(`mission ${mission.id} mapping_status ${JSON.stringify(mission.mapping_status)} is not in the vocabulary`)
      }
      if (mission.mapped_slot_id !== null) {
        if (!allIds.has(mission.mapped_slot_id)) {
          fail(`mission ${mission.id} maps to unknown slot ${JSON.stringify(mission.mapped_slot_id)}`)
        }
        if (mission.mapping_status !== 'EVIDENCED') {
          fail(`mission ${mission.id} maps to a slot but mapping_status is ${JSON.stringify(mission.mapping_status)}`)
        }
        checkLocator(mission.mapping_locator, mission.mapping_quote, readLines, stats, fail, `mission ${mission.id} mapping`)
        mappedMissions++
        mappedSlots.push(mission.mapped_slot_id)
      } else {
        if (mission.mapping_status !== 'NOT_FOUND') {
          fail(`mission ${mission.id} has no mapped slot but mapping_status is ${JSON.stringify(mission.mapping_status)}`)
        }
        if (mission.mapping_locator !== null && mission.mapping_locator !== undefined) {
          fail(`mission ${mission.id} has no mapped slot but carries mapping_locator`)
        }
      }
    }

    const uniqueMappedFields = new Set(mappedSlots).size
    if (mapping.mapped_mission_count !== mappedMissions) {
      fail(`mission_mapping.mapped_mission_count ${mapping.mapped_mission_count} !== actual ${mappedMissions}`)
    }
    if (mapping.mapped_field_count !== uniqueMappedFields) {
      fail(`mission_mapping.mapped_field_count ${mapping.mapped_field_count} !== actual ${uniqueMappedFields}`)
    }
    if (mapping.status === 'NOT_FOUND' && mappedMissions > 0) {
      fail('mission_mapping.status is NOT_FOUND but missions carry slot mappings')
    }
    if (mapping.status === 'EVIDENCED' && mappedMissions === 0) {
      fail('mission_mapping.status is EVIDENCED but no mission carries a slot mapping')
    }
    if (mapping.status === 'PARTIAL_REFERENCE' && mappedMissions === 0) {
      fail('mission_mapping.status is PARTIAL_REFERENCE but no mission carries a slot mapping')
    }
    if (mappedMissions > 0 && (typeof mapping.mapping_locator !== 'string' || mapping.mapping_locator.trim() === '')) {
      fail('mission_mapping claims mappings without a mapping_locator')
    }
  }

  // Declared counts must equal the rows.
  const counts = doc.declared_counts
  if (!counts || typeof counts !== 'object') {
    fail('declared_counts is missing')
    return errors
  }
  for (const key of [
    'slots',
    'candidates',
    'candidate_missions',
    'mission_mappings',
    'evidenced_field_names',
  ]) {
    if (!Number.isInteger(counts[key]) || counts[key] < 0) {
      fail(`declared_counts.${key} must be a non-negative integer`)
    }
  }
  if (counts.slots !== slots.length) fail(`declared slots ${counts.slots} !== rows ${slots.length}`)
  if (counts.slots !== SLOT_TOTAL) fail(`declared slots ${counts.slots} !== required ${SLOT_TOTAL}`)
  if (counts.candidates !== candidates.length) {
    fail(`declared candidates ${counts.candidates} !== rows ${candidates.length}`)
  }
  if (counts.candidate_missions !== (mapping && Array.isArray(mapping.missions) ? mapping.missions.length : -1)) {
    fail(`declared candidate_missions ${counts.candidate_missions} !== mission rows`)
  }
  if (counts.evidenced_field_names !== namedSlots.length) {
    fail(`declared evidenced_field_names ${counts.evidenced_field_names} !== named slots ${namedSlots.length}`)
  }
  if (guard && counts.evidenced_field_names !== guard.asserted_field_count) {
    fail(`declared evidenced_field_names ${counts.evidenced_field_names} !== asserted_field_count ${guard.asserted_field_count}`)
  }
  if (guard && guard.named_slots !== namedSlots.length) {
    fail(`no_guessed_names.named_slots ${guard.named_slots} !== named slots ${namedSlots.length}`)
  }
  if (counts.mission_mappings !== (mapping ? mapping.mapped_mission_count : -1)) {
    fail(`declared mission_mappings ${counts.mission_mappings} !== mission_mapping.mapped_mission_count`)
  }

  const slotStatusTally = tally(slots, 'status', STATUSES)
  const candidateStatusTally = tally(candidates, 'status', STATUSES)
  const candidateKindTally = tally(candidates, 'kind', CANDIDATE_KINDS)
  const nameStatusTally = tally(slots, 'name_status', NAME_STATUSES)
  compareTally('by_slot_status', counts.by_slot_status, slotStatusTally, STATUSES, fail)
  compareTally('by_candidate_status', counts.by_candidate_status, candidateStatusTally, STATUSES, fail)
  compareTally('by_candidate_kind', counts.by_candidate_kind, candidateKindTally, CANDIDATE_KINDS, fail)
  compareTally('by_name_status', counts.by_name_status, nameStatusTally, NAME_STATUSES, fail)

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
  const slot = (d, i) => d.slots[i]
  const partialCandidate = (d) => d.candidates.find((c) => c.status === 'PARTIAL_REFERENCE')
  const notFoundCandidate = (d) => d.candidates.find((c) => c.status === 'NOT_FOUND')

  const cases = [
    {
      name: 'duplicate slot id is rejected',
      mutate: (d) => {
        slot(d, 1).id = slot(d, 0).id
      },
    },
    {
      name: 'a missing 25th slot is rejected',
      mutate: (d) => {
        d.slots.pop()
      },
    },
    {
      name: 'a duplicate slot index is rejected',
      mutate: (d) => {
        slot(d, 1).slot = slot(d, 0).slot
        slot(d, 1).id = slot(d, 0).id
      },
    },
    {
      name: 'a slot index outside 1-25 is rejected',
      mutate: (d) => {
        slot(d, 24).slot = 26
      },
    },
    {
      name: 'an invented slot name without a name locator is rejected',
      mutate: (d) => {
        slot(d, 0).name = 'Invented Amanah'
        slot(d, 0).name_status = 'EVIDENCED_IN_REPOSITORY'
      },
    },
    {
      name: 'a name quote that does not contain the name is rejected',
      mutate: (d) => {
        slot(d, 0).name = 'Invented Amanah'
        slot(d, 0).name_status = 'EVIDENCED_IN_REPOSITORY'
        slot(d, 0).name_locator = 'docs/vision/MASTER_VISION_NARRATIVE_XV.md:906'
        slot(d, 0).name_quote = '25 Bidang Amanah'
      },
    },
    {
      name: 'an unknown slot status is rejected',
      mutate: (d) => {
        slot(d, 0).status = 'GUESSED'
      },
    },
    {
      name: 'a misdeclared slot total is rejected',
      mutate: (d) => {
        d.declared_counts.slots = 26
      },
    },
    {
      name: 'a misdeclared slot-status tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_slot_status.NEEDS_SOURCE = 24
      },
    },
    {
      name: 'an evidence quote absent from the cited line is rejected',
      mutate: (d) => {
        d.evidence[0].quote = 'this text is not on the cited line'
      },
    },
    {
      name: 'a dangling evidence id is rejected',
      mutate: (d) => {
        slot(d, 0).evidence_ids.push('EV-999')
      },
    },
    {
      name: 'a duplicate evidence id is rejected',
      mutate: (d) => {
        d.evidence[1].id = d.evidence[0].id
      },
    },
    {
      name: 'PARTIAL_REFERENCE without source_locator is rejected',
      mutate: (d) => {
        partialCandidate(d).source_locator = null
      },
    },
    {
      name: 'an EVIDENCED candidate without an enumerated source is rejected',
      mutate: (d) => {
        partialCandidate(d).status = 'EVIDENCED'
        partialCandidate(d).locator_kind = 'EXACT_ENUMERATION'
      },
    },
    {
      name: 'a NOT_FOUND candidate carrying source_locator is rejected',
      mutate: (d) => {
        const candidate = notFoundCandidate(d)
        candidate.source_locator = 'TODO.md:602'
        candidate.locator_kind = 'ABSENCE_STATEMENT'
      },
    },
    {
      name: 'a disabled no-guess invariant is rejected',
      mutate: (d) => {
        d.no_guessed_names.invariant = false
      },
    },
    {
      name: 'asserting a complete 25 without an enumerated source is rejected',
      mutate: (d) => {
        d.no_guessed_names.asserted_complete_25 = true
      },
    },
    {
      name: 'asserting 25 field names with no names is rejected',
      mutate: (d) => {
        d.no_guessed_names.asserted_field_count = 25
      },
    },
    {
      name: 'an enumerated source with fewer than 25 entries is rejected',
      mutate: (d) => {
        d.enumerated_source = {
          kind: 'EXACT_ENUMERATION',
          entries: Array.from({ length: 24 }, (_, i) => ({
            field: `Field ${i + 1}`,
            locator: 'TODO.md:602',
            quote: '25 evidence rows or explicitly unverified, never guessed names',
          })),
        }
        d.no_guessed_names.asserted_complete_25 = true
        d.no_guessed_names.asserted_field_count = 25
      },
    },
    {
      name: 'a mission mapped without a mapping locator is rejected',
      mutate: (d) => {
        const mission = d.mission_mapping.missions[0]
        mission.mapped_slot_id = 'amanah-slot-01'
        mission.mapping_status = 'EVIDENCED'
        mission.mapping_locator = null
      },
    },
    {
      name: 'a misdeclared mission-mapping total is rejected',
      mutate: (d) => {
        d.declared_counts.mission_mappings = 1
      },
    },
    {
      name: 'a mission title quote that does not contain the title is rejected',
      mutate: (d) => {
        d.mission_mapping.missions[0].title_quote = "title: 'Nonexistent mission',"
      },
    },
    {
      name: 'NOT_FOUND mapping status with a mapped mission is rejected',
      mutate: (d) => {
        const mission = d.mission_mapping.missions[0]
        mission.mapped_slot_id = 'amanah-slot-01'
        mission.mapping_status = 'EVIDENCED'
        mission.mapping_locator = 'TODO.md:602'
        mission.mapping_quote = '25 evidence rows or explicitly unverified, never guessed names'
        d.declared_counts.mission_mappings = 1
        d.mission_mapping.mapped_mission_count = 1
        d.mission_mapping.mapped_field_count = 1
      },
    },
    {
      name: 'a NEEDS_SOURCE slot carrying source_locator is rejected',
      mutate: (d) => {
        slot(d, 0).source_locator = 'TODO.md:602'
      },
    },
    {
      name: 'a null name marked EVIDENCED_IN_REPOSITORY is rejected',
      mutate: (d) => {
        slot(d, 0).name_status = 'EVIDENCED_IN_REPOSITORY'
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
console.log(`PASS slots=${doc.slots.length} candidates=${doc.candidates.length} baseline=${doc.baseline_sha}`)
console.log(
  `PASS slot status EVIDENCED=${counts.by_slot_status.EVIDENCED} PARTIAL_REFERENCE=${counts.by_slot_status.PARTIAL_REFERENCE} NEEDS_SOURCE=${counts.by_slot_status.NEEDS_SOURCE} NOT_FOUND=${counts.by_slot_status.NOT_FOUND}`,
)
console.log(
  `PASS candidate status EVIDENCED=${counts.by_candidate_status.EVIDENCED} PARTIAL_REFERENCE=${counts.by_candidate_status.PARTIAL_REFERENCE} NEEDS_SOURCE=${counts.by_candidate_status.NEEDS_SOURCE} NOT_FOUND=${counts.by_candidate_status.NOT_FOUND}`,
)
console.log(
  `PASS slot indices 1-25 complete; named slots=${counts.by_name_status.EVIDENCED_IN_REPOSITORY} unnamed=${counts.by_name_status.NOT_NAMED_IN_REPOSITORY}`,
)
console.log(`PASS candidate missions=${counts.candidate_missions} mission mappings=${counts.mission_mappings} mapped fields=${doc.mission_mapping.mapped_field_count}`)
console.log(`PASS ${stats.locatorChecks} locator quotes resolved at the cited file:line`)
console.log('PASS zero names without a locator; zero complete-25 assertions without an enumerated source')
console.log('PASS declared counts match rows, candidate kinds and name statuses')
console.log('NOTE exact 25-field list absent: 0 EVIDENCED fields, 0 names guessed, 0 mission mappings')
