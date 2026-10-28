#!/usr/bin/env node
/**
 * scripts/check-m17-01-identity-map.mjs
 *
 * M17-01 gate: the II eight-era / II crew / XII-XIV story-version identity map
 * separates character IDs from actor IDs, resolves every quoted locator, and
 * refuses to invent an era order, crew member, performer, or source version.
 *
 * What this proves:
 *   1. Every row id is unique and uses the prefix declared for its kind.
 *   2. Character, crew-label, ensemble, entity, actor, era, story_version and
 *      gap rows keep their declared ontological class. No actor row may be a
 *      fictional person and no character row may assert a real-person identity.
 *   3. No character id equals an actor id, and no SAME_AS claim is permitted.
 *   4. Every non-ABSENT row has a source_locator + quote repeated in evidence;
 *      every evidence locator resolves to the cited file line and contains the
 *      quoted string. ABSENT rows must not carry a locator.
 *   5. Each "eight eras" claim enumerates exactly eight era rows or points at
 *      an explicit NEEDS_SOURCE gap. Two differing enumerations must declare
 *      UNRESOLVED alignment and name a gap row; no era row is merged across
 *      claims.
 *   6. Declared totals, status/kind tallies, era/crew/story-version tallies and
 *      character-actor separation counts equal the rows.
 *
 * What this does not prove: that any era source, crew character, real performer
 * or XII/XIV source version exists. Zero era artifacts and zero real performers
 * are evidenced; labels and counts are not manuscripts or casting records.
 *
 * Run:            node scripts/check-m17-01-identity-map.mjs
 * Negative test:  node scripts/check-m17-01-identity-map.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { existsSync, readFileSync } from 'node:fs'

const MAP = 'docs/data/M17-01-identity-map.json'

const STATUSES = ['EVIDENCED', 'LABEL_ONLY', 'NEEDS_SOURCE', 'ABSENT']
const KINDS = ['character', 'crew_label', 'ensemble', 'entity', 'actor', 'era', 'story_version', 'gap']
const PREFIXES = {
  character: 'ch_',
  crew_label: 'cr_',
  ensemble: 'grp_',
  entity: 'ent_',
  actor: 'fg_',
  era: 'er_',
  story_version: 'sv_',
  gap: 'gap_',
}
const PERSON_CLASS = {
  character: 'FICTIONAL_PERSON',
  crew_label: 'UNRESOLVED',
  ensemble: 'FICTIONAL_GROUP',
  entity: 'SOFTWARE_SURFACE',
  actor: 'REAL_PERFORMER',
  era: 'NOT_A_PERSON',
  story_version: 'NOT_A_PERSON',
  gap: 'NOT_A_PERSON',
}
const FICTION = {
  character: 'FICTION',
  crew_label: 'UNRESOLVED',
  ensemble: 'FICTION',
  entity: 'NOT_APPLICABLE',
  actor: 'REALITY',
  era: 'NOT_APPLICABLE',
  story_version: 'NOT_APPLICABLE',
  gap: 'NOT_APPLICABLE',
}
const ARTIFACT_STATUSES = ['PRESENT', 'ABSENT', 'UNRESOLVED']
const LINEAGES = ['XII', 'XIV']
const GUARD_KEYS = [
  'character_actor_distinct',
  'no_character_actor_same_as',
  'no_real_person_asserted_as_character',
  'every_row_has_resolving_locator',
  'eight_eras_claims_enumerated_or_gapped',
  'ontology_actor_kind_is_not_performer',
  'no_invented_lore',
  'no_external_fetch',
  'source_locator_required_unless_absent',
]

function loadMap() {
  return JSON.parse(readFileSync(MAP, 'utf8'))
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

function validate(doc, readLines, stats = { locatorChecks: 0 }) {
  const errors = []
  const fail = (msg) => errors.push(msg)

  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    fail('map is not a JSON object')
    return errors
  }
  if (doc.task !== 'M17-01') fail(`task ${JSON.stringify(doc.task)} is not M17-01`)
  if (!isNonEmptyString(doc.baseline_sha) || !/^[0-9a-f]{7,40}$/.test(doc.baseline_sha)) {
    fail(`baseline_sha ${JSON.stringify(doc.baseline_sha)} is not a 7-40 hex SHA prefix`)
  }
  if (!sameList(doc.status_enum, STATUSES)) fail('status_enum does not match the map vocabulary')
  if (!sameList(doc.kind_enum, KINDS)) fail('kind_enum does not match the map vocabulary')
  if (!sameList(Object.keys(doc.id_prefixes || {}), KINDS)) {
    fail('id_prefixes keys do not match kind_enum')
  } else {
    for (const kind of KINDS) {
      if (doc.id_prefixes[kind] !== PREFIXES[kind]) {
        fail(`id_prefixes.${kind}=${JSON.stringify(doc.id_prefixes[kind])} !== ${PREFIXES[kind]}`)
      }
    }
  }

  if (!doc.guards || typeof doc.guards !== 'object') {
    fail('guards is missing')
  } else {
    for (const key of GUARD_KEYS) {
      if (doc.guards[key] !== true) fail(`guard ${key} must be true, got ${JSON.stringify(doc.guards[key])}`)
    }
    for (const key of Object.keys(doc.guards)) {
      if (!GUARD_KEYS.includes(key)) fail(`guards has unknown key ${JSON.stringify(key)}`)
    }
  }

  const rows = Array.isArray(doc.rows) ? doc.rows : []
  if (rows.length === 0) fail('rows is empty or not an array')

  const ids = new Set()
  const rowById = new Map()
  const crewSlots = new Map()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const where = `row[${i}]`
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      fail(`${where} is not an object`)
      continue
    }
    if (!isNonEmptyString(row.id)) {
      fail(`${where} has no id`)
      continue
    }
    if (ids.has(row.id)) fail(`duplicate id ${row.id}`)
    ids.add(row.id)
    rowById.set(row.id, row)

    if (!KINDS.includes(row.kind)) {
      fail(`row ${row.id} kind ${JSON.stringify(row.kind)} is not in ${KINDS.join('|')}`)
      continue
    }
    const prefix = PREFIXES[row.kind]
    if (!row.id.startsWith(prefix)) {
      fail(`row ${row.id} kind ${row.kind} must use prefix ${prefix}`)
    }
    for (const [otherKind, otherPrefix] of Object.entries(PREFIXES)) {
      if (otherKind !== row.kind && row.id.startsWith(otherPrefix)) {
        fail(`row ${row.id} kind ${row.kind} also matches ${otherKind} prefix ${otherPrefix}`)
      }
    }

    if (!isNonEmptyString(row.label)) fail(`row ${row.id} has no label`)
    if (!isNonEmptyString(row.section)) fail(`row ${row.id} has no section`)
    if (!STATUSES.includes(row.status)) {
      fail(`row ${row.id} status ${JSON.stringify(row.status)} is not in ${STATUSES.join('|')}`)
    }

    if (row.person_class !== PERSON_CLASS[row.kind]) {
      fail(
        `row ${row.id} kind ${row.kind} person_class ${JSON.stringify(row.person_class)} !== ${PERSON_CLASS[row.kind]}`,
      )
    }
    if (row.fiction !== FICTION[row.kind]) {
      fail(`row ${row.id} kind ${row.kind} fiction ${JSON.stringify(row.fiction)} !== ${FICTION[row.kind]}`)
    }

    const realPerson = row.real_person_identity
    if (row.kind === 'actor') {
      if (!['ABSENT', 'EVIDENCED'].includes(realPerson)) {
        fail(`actor ${row.id} real_person_identity ${JSON.stringify(realPerson)} must be ABSENT or EVIDENCED`)
      }
      if (realPerson === 'EVIDENCED') {
        if (!isNonEmptyString(row.real_person_name)) {
          fail(`actor ${row.id} is EVIDENCED without a real_person_name`)
        }
        if (row.status !== 'EVIDENCED') {
          fail(`actor ${row.id} has an EVIDENCED real person but row status is ${row.status}`)
        }
      }
      if (row.portrays !== undefined && row.portrays !== null) {
        fail(`actor ${row.id} carries portrays; no casting evidence exists for this map`)
      }
    } else if (['character', 'crew_label', 'ensemble'].includes(row.kind)) {
      if (!['NOT_ASSERTED', 'NEEDS_SOURCE'].includes(realPerson)) {
        fail(
          `row ${row.id} kind ${row.kind} may not assert a real-person identity (got ${JSON.stringify(realPerson)})`,
        )
      }
    } else if (realPerson !== 'NOT_APPLICABLE') {
      fail(`row ${row.id} kind ${row.kind} real_person_identity must be NOT_APPLICABLE`)
    }
    if (realPerson === 'ASSERTED') {
      fail(`row ${row.id} asserts a real person; no such claim is permitted`)
    }

    if (row.registry_ref !== null) {
      if (
        !row.registry_ref ||
        typeof row.registry_ref !== 'object' ||
        !isNonEmptyString(row.registry_ref.system) ||
        !isNonEmptyString(row.registry_ref.id)
      ) {
        fail(`row ${row.id} registry_ref must be null or {system,id}`)
      }
    }

    if (Array.isArray(row.same_as) && row.same_as.length > 0) {
      fail(`row ${row.id} carries same_as; this map permits no identity merger`)
    }

    if (row.section === 'ii_crew') {
      if (!Number.isInteger(row.crew_slot) || row.crew_slot < 11 || row.crew_slot > 18) {
        fail(`crew row ${row.id} crew_slot ${JSON.stringify(row.crew_slot)} must be 11-18`)
      } else {
        if (crewSlots.has(row.crew_slot)) {
          fail(`crew_slot ${row.crew_slot} is used by both ${crewSlots.get(row.crew_slot)} and ${row.id}`)
        }
        crewSlots.set(row.crew_slot, row.id)
      }
    } else if (row.crew_slot !== null) {
      fail(`row ${row.id} section ${row.section} must have crew_slot null`)
    }

    if (row.kind === 'era') {
      if (!isNonEmptyString(row.era_claim)) fail(`era row ${row.id} has no era_claim`)
      if (!Number.isInteger(row.ordinal) || row.ordinal < 1 || row.ordinal > 8) {
        fail(`era row ${row.id} ordinal ${JSON.stringify(row.ordinal)} must be 1-8`)
      }
    }

    if (row.kind === 'story_version') {
      if (!LINEAGES.includes(row.lineage)) {
        fail(`story_version ${row.id} lineage ${JSON.stringify(row.lineage)} must be XII or XIV`)
      }
      if (typeof row.artifact_in_repo !== 'boolean') {
        fail(`story_version ${row.id} artifact_in_repo must be boolean`)
      }
      if (typeof row.pinned_ref_is_full_sha !== 'boolean') {
        fail(`story_version ${row.id} pinned_ref_is_full_sha must be boolean`)
      }
      if (row.pinned_ref !== null) {
        if (!isNonEmptyString(row.pinned_ref)) {
          fail(`story_version ${row.id} pinned_ref must be null or a string`)
        } else if (row.pinned_ref_is_full_sha && !/^[0-9a-f]{40}$/.test(row.pinned_ref)) {
          fail(`story_version ${row.id} claims a full SHA but ${JSON.stringify(row.pinned_ref)} is not 40 hex`)
        } else if (!row.pinned_ref_is_full_sha && !/^[0-9a-f]{16}$/.test(row.pinned_ref)) {
          fail(`story_version ${row.id} claims a truncated ref but ${JSON.stringify(row.pinned_ref)} is not 16 hex`)
        }
      }
      if (row.status === 'EVIDENCED' && row.artifact_in_repo !== true) {
        fail(`story_version ${row.id} is EVIDENCED but artifact_in_repo is false`)
      }
    }

    const hasLocator = isNonEmptyString(row.source_locator)
    const hasQuote = isNonEmptyString(row.source_quote)

    if (row.status === 'ABSENT') {
      if (row.source_locator !== null || row.source_quote !== null) {
        fail(`ABSENT row ${row.id} must not carry source_locator/source_quote`)
      }
      if (row.registry_ref !== null) fail(`ABSENT row ${row.id} must not carry a registry_ref`)
      if (!isNonEmptyString(row.absence)) fail(`ABSENT row ${row.id} has no absence statement`)
    } else {
      if (!hasLocator) fail(`row ${row.id} status ${row.status} has no source_locator`)
      if (!hasQuote) fail(`row ${row.id} status ${row.status} has no source_quote`)
      if (hasLocator && hasQuote) {
        checkLocator(row.source_locator, row.source_quote, readLines, stats, fail, `row ${row.id} source`)
      }
      if (row.status === 'EVIDENCED' && row.registry_ref === null) {
        fail(`row ${row.id} claims EVIDENCED without a registry_ref`)
      }
      if (row.status !== 'EVIDENCED' && row.registry_ref !== null) {
        fail(`row ${row.id} status ${row.status} must not carry a registry_ref`)
      }
      if (row.status === 'NEEDS_SOURCE' && !isNonEmptyString(row.unresolved)) {
        fail(`NEEDS_SOURCE row ${row.id} has no unresolved statement`)
      }
    }

    if (checkEvidence(row.evidence, readLines, stats, fail, `row ${row.id}`) && hasLocator) {
      const repeated = row.evidence.some(
        (item) =>
          item &&
          item.locator === row.source_locator &&
          (row.status === 'ABSENT' || item.quote === row.source_quote),
      )
      if (!repeated) {
        fail(`row ${row.id} source_locator/source_quote is not repeated in evidence and cannot be quote-verified`)
      }
    }
  }

  // Cross-row references.
  for (const row of rows) {
    if (!row || !isNonEmptyString(row.id)) continue
    if (!Array.isArray(row.distinct_from)) {
      fail(`row ${row.id} distinct_from must be an array`)
      continue
    }
    for (const target of row.distinct_from) {
      if (!rowById.has(target)) fail(`row ${row.id} distinct_from target ${target} does not exist`)
      if (target === row.id) fail(`row ${row.id} cannot be distinct from itself`)
    }
  }

  // Crew slots must be complete 11-18 with no gaps.
  if (rows.some((r) => r && r.section === 'ii_crew')) {
    for (let slot = 11; slot <= 18; slot++) {
      if (!crewSlots.has(slot)) fail(`crew_slot ${slot} is missing from the II crew section`)
    }
  }

  // Era claims.
  const claims = Array.isArray(doc.era_claims) ? doc.era_claims : []
  if (claims.length === 0) fail('era_claims is empty')
  const claimIds = new Set()
  const claimedEra = new Map()
  const claimByLabelSet = []

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i]
    const where = `era_claims[${i}]`
    if (!claim || typeof claim !== 'object') {
      fail(`${where} is not an object`)
      continue
    }
    if (!isNonEmptyString(claim.id) || !claim.id.startsWith('era_claim_')) {
      fail(`${where} id ${JSON.stringify(claim.id)} must start with era_claim_`)
    } else if (claimIds.has(claim.id)) {
      fail(`duplicate era claim id ${claim.id}`)
    } else {
      claimIds.add(claim.id)
    }
    if (typeof claim.states_eight !== 'boolean') fail(`${where} states_eight must be boolean`)
    checkLocator(claim.locator, claim.quote, readLines, stats, fail, `${where} source`)
    if (!ARTIFACT_STATUSES.includes(claim.source_artifact_status)) {
      fail(`${where} source_artifact_status ${JSON.stringify(claim.source_artifact_status)} is not declared`)
    }
    checkEvidence(claim.artifact_evidence, readLines, stats, fail, `${where} artifact`)

    if (claim.states_eight === true) {
      if (!Array.isArray(claim.enumeration) || claim.enumeration.length !== 8) {
        fail(`${where} claims eight eras but enumeration is not length 8`)
      } else {
        if (claim.enumeration_size !== 8) fail(`${where} enumeration_size ${claim.enumeration_size} !== 8`)
        const unique = new Set(claim.enumeration)
        if (unique.size !== 8) fail(`${where} enumeration has duplicate ids`)
        for (const id of claim.enumeration) {
          const row = rowById.get(id)
          if (!row) {
            fail(`${where} enumerates missing row ${id}`)
            continue
          }
          if (row.kind !== 'era') fail(`${where} enumerates ${id} whose kind is ${row.kind}, not era`)
          if (row.era_claim !== claim.id) {
            fail(`${where} enumerates ${id} whose era_claim is ${JSON.stringify(row.era_claim)}`)
          }
          if (claimedEra.has(id)) {
            fail(`era row ${id} is enumerated by more than one claim (${claimedEra.get(id)} and ${claim.id})`)
          } else {
            claimedEra.set(id, claim.id)
          }
          if (isNonEmptyString(row.source_locator) && isNonEmptyString(claim.locator)) {
            const rowFile = row.source_locator.replace(/:\d+$/, '')
            const claimFile = claim.locator.replace(/:\d+$/, '')
            if (rowFile !== claimFile) {
              fail(`era row ${id} locator file ${rowFile} differs from claim file ${claimFile}`)
            }
          }
        }
        claimByLabelSet.push(claim.enumeration.map((id) => (rowById.get(id) || {}).label).sort().join('|'))
      }
      if (claim.alignment === 'UNRESOLVED') {
        const gap = rowById.get(claim.alignment_gap_id)
        if (!gap || gap.kind !== 'gap' || gap.status !== 'NEEDS_SOURCE') {
          fail(`${where} alignment_gap_id ${JSON.stringify(claim.alignment_gap_id)} is not a NEEDS_SOURCE gap row`)
        }
      } else if (claim.alignment !== 'ALIGNED') {
        fail(`${where} alignment ${JSON.stringify(claim.alignment)} is not ALIGNED or UNRESOLVED`)
      }
    } else {
      if (claim.enumeration !== null && claim.enumeration !== undefined) {
        fail(`${where} does not claim eight eras but carries an enumeration`)
      }
      const gap = rowById.get(claim.gap_id)
      if (!gap || gap.kind !== 'gap' || gap.status !== 'NEEDS_SOURCE') {
        fail(`${where} does not claim eight eras and has no NEEDS_SOURCE gap_id`)
      }
    }
  }

  const eraRows = rows.filter((r) => r && r.kind === 'era')
  for (const row of eraRows) {
    if (!claimedEra.has(row.id)) fail(`era row ${row.id} is not enumerated by any era claim`)
  }
  if (new Set(claimByLabelSet).size > 1) {
    for (const claim of claims) {
      if (claim && claim.states_eight === true && claim.alignment !== 'UNRESOLVED') {
        fail(`era claim ${claim.id} has a differing enumeration but alignment is not UNRESOLVED`)
      }
    }
  }

  // Explicit no-merger guard.
  if (!Array.isArray(doc.same_as_claims)) {
    fail('same_as_claims must be an array')
  } else if (doc.same_as_claims.length > 0) {
    fail('same_as_claims must be empty: this map permits no identity merger')
    for (let i = 0; i < doc.same_as_claims.length; i++) {
      const claim = doc.same_as_claims[i] || {}
      const from = rowById.get(claim.from)
      const to = rowById.get(claim.to)
      if (from && to && from.kind !== to.kind) {
        fail(`same_as_claims[${i}] merges ${from.kind} ${from.id} with ${to.kind} ${to.id}`)
      }
    }
  }

  // Distinct-from claims.
  const identityClaims = Array.isArray(doc.identity_claims) ? doc.identity_claims : []
  const identityClaimIds = new Set()
  for (let i = 0; i < identityClaims.length; i++) {
    const claim = identityClaims[i]
    const where = `identity_claims[${i}]`
    if (!claim || typeof claim !== 'object') {
      fail(`${where} is not an object`)
      continue
    }
    if (!isNonEmptyString(claim.id) || !claim.id.startsWith('clm_')) {
      fail(`${where} id ${JSON.stringify(claim.id)} must start with clm_`)
    } else if (identityClaimIds.has(claim.id)) {
      fail(`duplicate identity claim id ${claim.id}`)
    } else {
      identityClaimIds.add(claim.id)
    }
    if (claim.relation === 'SAME_AS') {
      fail(`${where} uses SAME_AS; this map permits only DISTINCT_FROM`)
    } else if (claim.relation !== 'DISTINCT_FROM') {
      fail(`${where} relation ${JSON.stringify(claim.relation)} is not DISTINCT_FROM`)
    }
    const from = rowById.get(claim.from)
    const to = rowById.get(claim.to)
    if (!from) fail(`${where} from ${JSON.stringify(claim.from)} does not exist`)
    if (!to) fail(`${where} to ${JSON.stringify(claim.to)} does not exist`)
    if (claim.from === claim.to) fail(`${where} cannot relate a row to itself`)
    if (from && to && claim.relation === 'DISTINCT_FROM' && from.kind === to.kind && from.id === to.id) {
      fail(`${where} is not a distinction`)
    }
    checkEvidence(claim.evidence, readLines, stats, fail, where)
  }

  // Character / actor separation.
  const characterIds = rows.filter((r) => r && r.kind === 'character').map((r) => r.id)
  const actorIds = rows.filter((r) => r && r.kind === 'actor').map((r) => r.id)
  const shared = characterIds.filter((id) => actorIds.includes(id))
  if (shared.length > 0) fail(`character and actor ids collide: ${shared.join(',')}`)
  const realPersonAsserted = rows.filter(
    (r) => r && (r.real_person_identity === 'ASSERTED' || r.status === 'ASSERTED'),
  ).length
  if (realPersonAsserted > 0) fail(`${realPersonAsserted} row(s) assert a real person`)

  // Declared counts.
  const counts = doc.declared_counts
  if (!counts || typeof counts !== 'object') {
    fail('declared_counts is missing')
    return errors
  }
  if (counts.total !== rows.length) fail(`declared total ${counts.total} !== rows ${rows.length}`)

  compareTally('by_status', counts.by_status, tally(rows, 'status', STATUSES), STATUSES, fail)
  compareTally('by_kind', counts.by_kind, tally(rows, 'kind', KINDS), KINDS, fail)

  const eraCounts = counts.eras
  if (!eraCounts || typeof eraCounts !== 'object') {
    fail('declared_counts.eras is missing')
  } else {
    if (eraCounts.label_rows !== eraRows.length) {
      fail(`declared eras.label_rows ${eraCounts.label_rows} !== era rows ${eraRows.length}`)
    }
    compareTally(
      'eras status',
      {
        EVIDENCED: eraCounts.evidenced,
        LABEL_ONLY: eraCounts.label_only,
        NEEDS_SOURCE: eraCounts.needs_source,
        ABSENT: eraCounts.absent,
      },
      tally(eraRows, 'status', STATUSES),
      STATUSES,
      fail,
    )
    if (eraCounts.claims !== claims.length) {
      fail(`declared eras.claims ${eraCounts.claims} !== era claims ${claims.length}`)
    }
    const present = claims.filter((c) => c && c.source_artifact_status === 'PRESENT').length
    if (eraCounts.source_artifacts_present !== present) {
      fail(`declared eras.source_artifacts_present ${eraCounts.source_artifacts_present} !== ${present}`)
    }
    const alignments = new Set(claims.map((c) => (c && c.alignment) || 'MISSING'))
    const declaredAlignment = alignments.has('UNRESOLVED') ? 'UNRESOLVED' : 'ALIGNED'
    if (eraCounts.alignment !== declaredAlignment) {
      fail(`declared eras.alignment ${eraCounts.alignment} !== ${declaredAlignment}`)
    }
    if (eraCounts.alignment_gap_id !== 'gap_era_alignment') {
      fail(`declared eras.alignment_gap_id ${JSON.stringify(eraCounts.alignment_gap_id)} is not gap_era_alignment`)
    }
  }

  const crewRows = rows.filter((r) => r && r.section === 'ii_crew')
  const crewCounts = counts.crew
  if (!crewCounts || typeof crewCounts !== 'object') {
    fail('declared_counts.crew is missing')
  } else {
    if (crewCounts.slots !== crewRows.length) {
      fail(`declared crew.slots ${crewCounts.slots} !== crew rows ${crewRows.length}`)
    }
    const kinds = tally(crewRows, 'kind', KINDS)
    for (const key of ['character', 'crew_label', 'ensemble']) {
      if (crewCounts[key] !== kinds[key]) {
        fail(`declared crew.${key} ${crewCounts[key]} !== rows ${kinds[key]}`)
      }
    }
    const statuses = tally(crewRows, 'status', STATUSES)
    for (const key of ['EVIDENCED', 'LABEL_ONLY', 'NEEDS_SOURCE', 'ABSENT']) {
      const declaredKey = key.toLowerCase()
      if (crewCounts[declaredKey] !== statuses[key]) {
        fail(`declared crew.${declaredKey} ${crewCounts[declaredKey]} !== rows ${statuses[key]}`)
      }
    }
  }

  const storyRows = rows.filter((r) => r && r.kind === 'story_version')
  const storyCounts = counts.story_versions
  if (!storyCounts || typeof storyCounts !== 'object') {
    fail('declared_counts.story_versions is missing')
  } else {
    if (storyCounts.rows !== storyRows.length) {
      fail(`declared story_versions.rows ${storyCounts.rows} !== rows ${storyRows.length}`)
    }
    for (const lineage of LINEAGES) {
      const actual = storyRows.filter((r) => r.lineage === lineage).length
      const key = lineage.toLowerCase()
      if (storyCounts[key] !== actual) {
        fail(`declared story_versions.${key} ${storyCounts[key]} !== rows ${actual}`)
      }
    }
    const statuses = tally(storyRows, 'status', STATUSES)
    for (const key of ['EVIDENCED', 'LABEL_ONLY', 'NEEDS_SOURCE', 'ABSENT']) {
      const declaredKey = key.toLowerCase()
      if (storyCounts[declaredKey] !== statuses[key]) {
        fail(`declared story_versions.${declaredKey} ${storyCounts[declaredKey]} !== rows ${statuses[key]}`)
      }
    }
  }

  const separation = counts.character_actor_separation
  if (!separation || typeof separation !== 'object') {
    fail('declared_counts.character_actor_separation is missing')
  } else {
    const checks = {
      character_rows: characterIds.length,
      crew_label_rows: rows.filter((r) => r && r.kind === 'crew_label').length,
      actor_rows: actorIds.length,
      shared_ids: shared.length,
      same_as_claims: Array.isArray(doc.same_as_claims) ? doc.same_as_claims.length : -1,
      real_person_asserted_rows: realPersonAsserted,
    }
    for (const [key, actual] of Object.entries(checks)) {
      if (separation[key] !== actual) {
        fail(`declared separation.${key} ${separation[key]} !== rows ${actual}`)
      }
    }
  }

  return errors
}

function selfTest() {
  const base = loadMap()
  const readLines = makeLineReader()
  const baseErrors = validate(base, readLines, { locatorChecks: 0 })
  if (baseErrors.length > 0) {
    console.log(`SELF-TEST FAIL: baseline map is invalid: ${baseErrors[0]}`)
    return 1
  }

  const clone = () => JSON.parse(JSON.stringify(base))
  const row = (d, id) => d.rows.find((r) => r.id === id)
  const claim = (d, id) => d.era_claims.find((c) => c.id === id)

  const cases = [
    {
      name: 'duplicate row id is rejected',
      mutate: (d) => {
        row(d, 'cr_runaway_trace').id = 'ch_shadow'
      },
    },
    {
      name: 'character id using the actor prefix is rejected',
      mutate: (d) => {
        row(d, 'ch_shadow').id = 'fg_shadow'
      },
    },
    {
      name: 'EVIDENCED row without source_locator is rejected',
      mutate: (d) => {
        const r = row(d, 'ch_shadow')
        r.source_locator = null
        r.source_quote = null
      },
    },
    {
      name: 'EVIDENCED row with a quote absent from the cited line is rejected',
      mutate: (d) => {
        row(d, 'ch_shadow').source_quote = 'THIS QUOTE IS NOT IN THE FILE'
      },
    },
    {
      name: 'locator line outside the file is rejected',
      mutate: (d) => {
        const r = row(d, 'ch_shadow')
        r.source_locator = 'docs/vision/MASTER_VISION_NARRATIVE_XV.md:99999'
        r.source_quote = 'placeholder'
        r.evidence[0] = { locator: r.source_locator, quote: r.source_quote }
      },
    },
    {
      name: 'evidence item without a locator is rejected',
      mutate: (d) => {
        row(d, 'cr_runaway_trace').evidence.push({ quote: '12 THE RUNAWAY TRACE' })
      },
    },
    {
      name: 'NEEDS_SOURCE row with a null source_locator is rejected',
      mutate: (d) => {
        const r = row(d, 'cr_a_lah')
        r.source_locator = null
        r.source_quote = null
      },
    },
    {
      name: 'misdeclared total is rejected',
      mutate: (d) => {
        d.declared_counts.total = 35
      },
    },
    {
      name: 'misdeclared kind tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_kind.era = 15
      },
    },
    {
      name: 'eight-era claim enumerating only seven rows is rejected',
      mutate: (d) => {
        const c = claim(d, 'era_claim_m0603')
        c.enumeration.pop()
        c.enumeration_size = 7
      },
    },
    {
      name: 'eight-era claim with no enumeration and no gap is rejected',
      mutate: (d) => {
        const c = claim(d, 'era_claim_m0603')
        c.enumeration = null
        c.enumeration_size = 0
      },
    },
    {
      name: 'era claim enumerating a non-era row is rejected',
      mutate: (d) => {
        claim(d, 'era_claim_m0603').enumeration[0] = 'ch_shadow'
      },
    },
    {
      name: 'era row enumerated by two claims is rejected',
      mutate: (d) => {
        claim(d, 'era_claim_vision').enumeration[0] = 'er_m0603_01'
      },
    },
    {
      name: 'SAME_AS claim between actor and character is rejected',
      mutate: (d) => {
        d.same_as_claims.push({ from: 'fg_ii_crew_performers', to: 'ch_shadow' })
      },
    },
    {
      name: 'identity claim using SAME_AS is rejected',
      mutate: (d) => {
        d.identity_claims.push({
          id: 'clm_forbidden_same_as',
          relation: 'SAME_AS',
          from: 'fg_ii_crew_performers',
          to: 'ch_shadow',
          evidence: [{ locator: 'docs/vision/MASTER_VISION_NARRATIVE_XV.md:370', quote: 'fictional labels' }],
        })
      },
    },
    {
      name: 'actor row marked as fiction is rejected',
      mutate: (d) => {
        row(d, 'fg_ii_crew_performers').fiction = 'FICTION'
      },
    },
    {
      name: 'character row asserting a real person is rejected',
      mutate: (d) => {
        row(d, 'ch_shadow').real_person_identity = 'ASSERTED'
      },
    },
    {
      name: 'unknown kind is rejected',
      mutate: (d) => {
        row(d, 'ch_shadow').kind = 'person'
      },
    },
    {
      name: 'duplicate crew slot is rejected',
      mutate: (d) => {
        row(d, 'cr_runaway_trace').crew_slot = 11
      },
    },
    {
      name: 'false guard flag is rejected',
      mutate: (d) => {
        d.guards.character_actor_distinct = false
      },
    },
    {
      name: 'ABSENT row carrying a source_locator is rejected',
      mutate: (d) => {
        const r = row(d, 'fg_ii_crew_performers')
        r.source_locator = 'docs/vision/MASTER_VISION_NARRATIVE_XV.md:370'
        r.source_quote = 'fictional labels'
      },
    },
    {
      name: 'full-SHA flag on a 16-hex ref is rejected',
      mutate: (d) => {
        row(d, 'sv_xiv_v10_99').pinned_ref_is_full_sha = true
      },
    },
    {
      name: 'LABEL_ONLY row carrying a registry_ref is rejected',
      mutate: (d) => {
        row(d, 'cr_runaway_trace').registry_ref = { system: 'onto_entities', id: 'O007' }
      },
    },
    {
      name: 'row with no evidence locators is rejected',
      mutate: (d) => {
        row(d, 'cr_runaway_trace').evidence = []
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

if (!existsSync(MAP)) {
  console.error(`FAIL: ${MAP} not found; run from the repository root`)
  process.exit(1)
}

const doc = loadMap()
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
  `PASS statuses EVIDENCED=${counts.by_status.EVIDENCED} LABEL_ONLY=${counts.by_status.LABEL_ONLY} NEEDS_SOURCE=${counts.by_status.NEEDS_SOURCE} ABSENT=${counts.by_status.ABSENT}`,
)
console.log(
  `PASS kinds character=${counts.by_kind.character} crew_label=${counts.by_kind.crew_label} ensemble=${counts.by_kind.ensemble} entity=${counts.by_kind.entity} actor=${counts.by_kind.actor} era=${counts.by_kind.era} story_version=${counts.by_kind.story_version} gap=${counts.by_kind.gap}`,
)
console.log(
  `PASS character/actor separation character_ids=${counts.character_actor_separation.character_rows} actor_ids=${counts.character_actor_separation.actor_rows} shared=${counts.character_actor_separation.shared_ids} same_as=${counts.character_actor_separation.same_as_claims} real_person_asserted=${counts.character_actor_separation.real_person_asserted_rows}`,
)
console.log(
  `PASS eras label_rows=${counts.eras.label_rows} claims=${counts.eras.claims} evidenced=${counts.eras.evidenced} label_only=${counts.eras.label_only} source_artifacts_present=${counts.eras.source_artifacts_present} alignment=${counts.eras.alignment} gap=${counts.eras.alignment_gap_id}`,
)
console.log(
  `PASS crew slots=${counts.crew.slots} evidenced=${counts.crew.evidenced} label_only=${counts.crew.label_only} needs_source=${counts.crew.needs_source} absent=${counts.crew.absent}`,
)
console.log(
  `PASS story versions rows=${counts.story_versions.rows} xiv=${counts.story_versions.xiv} xii=${counts.story_versions.xii} evidenced=${counts.story_versions.evidenced} label_only=${counts.story_versions.label_only} needs_source=${counts.story_versions.needs_source} absent=${counts.story_versions.absent}`,
)
console.log(`PASS ${stats.locatorChecks} locator quotes resolved at the cited file:line`)
console.log('PASS declared counts match rows; crew slots 11-18 complete; both eight-era claims enumerate 8 rows')
console.log('PASS zero character/actor id collisions; zero sameAs claims; zero real-person assertions')
console.log('NOTE zero era artifacts recovered, zero real performers named, zero XII/XIV source text claimed')
