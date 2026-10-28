#!/usr/bin/env node
/**
 * scripts/check-m16-02-date-semantics.mjs
 *
 * M16-02 gate: the private witness date-slot contract is stated with the
 * required precision, timezone and appended-correction rules, and the
 * machine-readable fixtures obey it.
 *
 * What this proves:
 *   1. The semantics document contains the required headings and terms
 *      (precision, timezone, appended correction, no defaulting).
 *   2. Every VALID fixture produces no violation code.
 *   3. Every INVALID fixture produces its declared violation code.
 *   4. Declared counts (total/valid/invalid, by_expected, by_violation) match.
 *   5. The Tick-Tock corrected-chronology fixture recomputes its declared
 *      effective UTC values from the untouched originals plus appended
 *      corrections.
 *
 * What this does not prove: that any witness archive, table, API or UI
 * exists. It is a contract plus fixtures, not a shipped D06 implementation.
 * Immutable lineage persistence is M16-03.
 *
 * Run:            node scripts/check-m16-02-date-semantics.mjs
 * Negative test:  node scripts/check-m16-02-date-semantics.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies and no
 * imports of application code.
 */

import { readFileSync } from 'node:fs'

const DATA_PATH = 'docs/data/M16-02-date-semantics.json'
const SPEC_PATH = 'docs/design/M16-02-date-semantics.md'

const SLOTS = ['occurredAt', 'observedAt', 'recordedAt', 'writtenAt']
const PRECISIONS = ['EXACT', 'APPROXIMATE', 'RANGE', 'UNKNOWN']
const VIOLATION_CODES = [
  'SLOT_INFERRED',
  'CHRONOLOGY_COLLAPSED',
  'SLOT_MISSING',
  'TIMEZONE_MISSING',
  'OFFSET_UTC_MISMATCH',
  'PRECISION_INVALID',
  'APPROXIMATE_QUALIFIER_MISSING',
  'RANGE_BOUNDS_INVALID',
  'UNKNOWN_SLOT_HAS_VALUE',
  'CORRECTION_OVERWRITES_ORIGINAL',
  'CORRECTION_SEQUENCE_INVALID',
  'CORRECTION_TARGET_INVALID',
  'CORRECTION_SHAPE_INVALID',
  'EFFECTIVE_CHRONOLOGY_MISMATCH',
  'FIXTURE_CONTRACT_INVALID',
  'DECLARED_COUNT_MISMATCH',
]

const REQUIRED_HEADINGS = [
  '# M16-02 — Date-slot semantics',
  '## 2. The four slots',
  '## 3. Precision',
  '## 4. Timezone rules',
  '## 5. Prohibitions: no defaulting, no inference, no collapse',
  '## 6. Tick-Tock corrected chronology',
  '## 7. Displaying corrected against original',
  '## 8. Divergence from the generic QuadTime',
  '## 9. Boundary with M16-03',
]

const REQUIRED_TERMS = [
  'occurredAt',
  'observedAt',
  'recordedAt',
  'writtenAt',
  'EXACT',
  'APPROXIMATE',
  'RANGE',
  'UNKNOWN',
  'IANA',
  'UTC',
  'appended correction',
  'No defaulting',
  'Tick-Tock',
  'packages/core/src/quad-time.ts:43',
  'M16-03',
  'No schema',
]

const UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
const LOCAL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
const OFFSET_RE = /^[+-]\d{2}:\d{2}$/

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== ''

function isIanaZone(zone) {
  if (!isNonEmptyString(zone)) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

function utcFromLocalOffset(local, offset) {
  const parsed = new Date(`${local}${offset}`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function validateInstantFields(value, add) {
  if (!isNonEmptyString(value.utc) || !UTC_RE.test(value.utc)) {
    add('TIMEZONE_MISSING')
    return false
  }
  if (!isIanaZone(value.timezone)) {
    add('TIMEZONE_MISSING')
    return false
  }
  if (!isNonEmptyString(value.originalOffset) || !OFFSET_RE.test(value.originalOffset)) {
    add('TIMEZONE_MISSING')
    return false
  }
  if (!isNonEmptyString(value.local) || !LOCAL_RE.test(value.local)) {
    add('TIMEZONE_MISSING')
    return false
  }
  if (utcFromLocalOffset(value.local, value.originalOffset) !== value.utc) {
    add('OFFSET_UTC_MISMATCH')
    return false
  }
  return true
}

function validateSlot(value, add) {
  if (!isPlainObject(value)) {
    add('PRECISION_INVALID')
    return
  }
  if (value.inferred === true || isNonEmptyString(value.inferredFrom) || value.derivedFrom != null) {
    add('SLOT_INFERRED')
  }
  if (!PRECISIONS.includes(value.precision)) {
    add('PRECISION_INVALID')
    return
  }

  if (value.precision === 'UNKNOWN') {
    for (const key of ['utc', 'local', 'timezone', 'originalOffset', 'qualifier', 'earliest', 'latest']) {
      if (Object.prototype.hasOwnProperty.call(value, key)) add('UNKNOWN_SLOT_HAS_VALUE')
    }
    return
  }

  if (value.precision === 'EXACT') {
    if (isNonEmptyString(value.qualifier)) add('PRECISION_INVALID')
    validateInstantFields(value, add)
    return
  }

  if (value.precision === 'APPROXIMATE') {
    if (!isNonEmptyString(value.qualifier)) add('APPROXIMATE_QUALIFIER_MISSING')
    for (const key of ['utc', 'local', 'timezone', 'originalOffset', 'earliest', 'latest']) {
      if (Object.prototype.hasOwnProperty.call(value, key)) add('PRECISION_INVALID')
    }
    return
  }

  // RANGE
  for (const key of ['utc', 'local', 'timezone', 'originalOffset', 'qualifier']) {
    if (Object.prototype.hasOwnProperty.call(value, key)) add('PRECISION_INVALID')
  }
  if (!isPlainObject(value.earliest) || !isPlainObject(value.latest)) {
    add('RANGE_BOUNDS_INVALID')
    return
  }
  const earliestOk = validateInstantFields(value.earliest, add)
  const latestOk = validateInstantFields(value.latest, add)
  if (earliestOk && latestOk) {
    const earliest = Date.parse(value.earliest.utc)
    const latest = Date.parse(value.latest.utc)
    if (!(earliest <= latest)) add('RANGE_BOUNDS_INVALID')
  }
}

function instantUtc(value) {
  if (!isPlainObject(value)) return null
  if (value.precision === 'EXACT' && typeof value.utc === 'string') return value.utc
  return null
}

function evaluateFixture(fixture) {
  const codes = new Set()
  const add = (code) => codes.add(code)

  if (!isPlainObject(fixture)) {
    add('FIXTURE_CONTRACT_INVALID')
    return codes
  }
  const record = fixture.record
  if (!isPlainObject(record)) {
    add('FIXTURE_CONTRACT_INVALID')
    return codes
  }

  if (record.collapsed === true || isNonEmptyString(record.singleDate) || 'date' in record) {
    add('CHRONOLOGY_COLLAPSED')
  }
  if (record.inferred === true || isNonEmptyString(record.inferredFrom) || record.derivedFrom != null) {
    add('SLOT_INFERRED')
  }

  const slots = record.slots
  if (!isPlainObject(slots)) {
    add('SLOT_MISSING')
  } else if ('date' in slots || 'singleDate' in slots) {
    add('CHRONOLOGY_COLLAPSED')
  } else {
    for (const slot of SLOTS) {
      if (!Object.prototype.hasOwnProperty.call(slots, slot)) {
        add('SLOT_MISSING')
        continue
      }
      validateSlot(slots[slot], add)
    }
  }

  const corrections = record.corrections
  if (corrections !== undefined && !Array.isArray(corrections)) {
    add('CORRECTION_SHAPE_INVALID')
  } else {
    let previousSequence = 0
    for (const correction of corrections ?? []) {
      if (!isPlainObject(correction)) {
        add('CORRECTION_SHAPE_INVALID')
        continue
      }
      if (
        correction.appended !== true ||
        correction.mutatesOriginal === true ||
        correction.appliedInPlace === true ||
        correction.replacesOriginal === true
      ) {
        add('CORRECTION_OVERWRITES_ORIGINAL')
      }
      if (!Number.isInteger(correction.sequence) || correction.sequence < 1) {
        add('CORRECTION_SEQUENCE_INVALID')
      } else if (correction.sequence <= previousSequence) {
        add('CORRECTION_SEQUENCE_INVALID')
      } else {
        previousSequence = correction.sequence
      }
      if (!SLOTS.includes(correction.targetSlot)) add('CORRECTION_TARGET_INVALID')

      const shapeOk =
        isNonEmptyString(correction.correctionId) &&
        isNonEmptyString(correction.reason) &&
        isNonEmptyString(correction.assertedBy) &&
        isNonEmptyString(correction.assertedAt) &&
        UTC_RE.test(correction.assertedAt) &&
        Number.isInteger(correction.basedOnRevision) &&
        correction.basedOnRevision >= 1 &&
        isPlainObject(correction.corrected)
      if (!shapeOk) {
        add('CORRECTION_SHAPE_INVALID')
      } else {
        validateSlot(correction.corrected, add)
      }
    }
  }

  if (!isPlainObject(slots)) return codes

  if (Object.prototype.hasOwnProperty.call(fixture, 'expectedEffective')) {
    const expected = fixture.expectedEffective
    if (!isPlainObject(expected)) {
      add('EFFECTIVE_CHRONOLOGY_MISMATCH')
    } else {
      const effective = {}
      for (const slot of SLOTS) effective[slot] = instantUtc(slots[slot])
      if (Array.isArray(corrections)) {
        const ordered = corrections
          .filter(isPlainObject)
          .slice()
          .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        for (const correction of ordered) {
          if (SLOTS.includes(correction.targetSlot)) {
            effective[correction.targetSlot] = instantUtc(correction.corrected)
          }
        }
      }
      for (const slot of SLOTS) {
        if (!Object.prototype.hasOwnProperty.call(expected, slot) || effective[slot] !== expected[slot]) {
          add('EFFECTIVE_CHRONOLOGY_MISMATCH')
        }
      }
    }
  }

  return codes
}

function sameList(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length && actual.every((v, i) => v === expected[i])
}

function validateDocument(doc, specText) {
  const errors = []
  const fail = (code, message) => errors.push(`${code}: ${message}`)

  if (!isPlainObject(doc)) {
    fail('FIXTURE_CONTRACT_INVALID', 'root document is not an object')
    return errors
  }
  if (doc.task !== 'M16-02') fail('FIXTURE_CONTRACT_INVALID', `task is ${JSON.stringify(doc.task)}`)
  if (!sameList(doc.precision_enum, PRECISIONS)) {
    fail('FIXTURE_CONTRACT_INVALID', 'precision_enum does not match the contract vocabulary')
  }
  if (!sameList(doc.slot_enum, SLOTS)) {
    fail('FIXTURE_CONTRACT_INVALID', 'slot_enum does not match the four witness slots')
  }
  if (!sameList(doc.violation_codes, VIOLATION_CODES)) {
    fail('FIXTURE_CONTRACT_INVALID', 'violation_codes does not match the declared code set')
  }

  for (const heading of REQUIRED_HEADINGS) {
    if (!specText.includes(heading)) fail('SPEC_TERM_MISSING', `heading missing: ${heading}`)
  }
  for (const term of REQUIRED_TERMS) {
    if (!specText.includes(term)) fail('SPEC_TERM_MISSING', `term missing: ${term}`)
  }

  const fixtures = Array.isArray(doc.fixtures) ? doc.fixtures : []
  if (fixtures.length === 0) fail('FIXTURE_CONTRACT_INVALID', 'fixtures is empty or not an array')

  const ids = new Set()
  for (const fixture of fixtures) {
    if (!isPlainObject(fixture) || !isNonEmptyString(fixture.id)) {
      fail('FIXTURE_CONTRACT_INVALID', 'fixture without a string id')
      continue
    }
    if (ids.has(fixture.id)) fail('FIXTURE_CONTRACT_INVALID', `duplicate fixture id ${fixture.id}`)
    ids.add(fixture.id)

    const expected = fixture.expected
    if (expected !== 'VALID' && expected !== 'INVALID') {
      fail('FIXTURE_CONTRACT_INVALID', `fixture ${fixture.id} expected is ${JSON.stringify(expected)}`)
      continue
    }

    const codes = [...evaluateFixture(fixture)]
    if (expected === 'VALID') {
      if (fixture.expected_violation != null) {
        fail('FIXTURE_CONTRACT_INVALID', `fixture ${fixture.id} is VALID but declares expected_violation`)
      }
      if (codes.length > 0) {
        fail('FIXTURE_CONTRACT_INVALID', `fixture ${fixture.id} expected VALID but produced ${codes.join(',')}`)
      }
    } else {
      const declared = fixture.expected_violation
      if (!isNonEmptyString(declared)) {
        fail('FIXTURE_CONTRACT_INVALID', `fixture ${fixture.id} is INVALID without expected_violation`)
      } else if (!VIOLATION_CODES.includes(declared)) {
        fail('FIXTURE_CONTRACT_INVALID', `fixture ${fixture.id} declares unknown code ${declared}`)
      } else if (!codes.includes(declared)) {
        fail(
          'FIXTURE_CONTRACT_INVALID',
          `fixture ${fixture.id} expected ${declared} but produced ${codes.length ? codes.join(',') : 'none'}`,
        )
      }
    }
  }

  const counts = doc.declared_counts
  if (!isPlainObject(counts)) {
    fail('DECLARED_COUNT_MISMATCH', 'declared_counts is missing')
    return errors
  }
  const actualValid = fixtures.filter((f) => isPlainObject(f) && f.expected === 'VALID').length
  const actualInvalid = fixtures.filter((f) => isPlainObject(f) && f.expected === 'INVALID').length
  if (counts.total !== fixtures.length) {
    fail('DECLARED_COUNT_MISMATCH', `declared total ${counts.total} !== fixtures ${fixtures.length}`)
  }
  if (counts.valid !== actualValid) {
    fail('DECLARED_COUNT_MISMATCH', `declared valid ${counts.valid} !== fixtures ${actualValid}`)
  }
  if (counts.invalid !== actualInvalid) {
    fail('DECLARED_COUNT_MISMATCH', `declared invalid ${counts.invalid} !== fixtures ${actualInvalid}`)
  }
  if (!isPlainObject(counts.by_expected)) {
    fail('DECLARED_COUNT_MISMATCH', 'declared by_expected is missing')
  } else {
    if (counts.by_expected.VALID !== actualValid) {
      fail('DECLARED_COUNT_MISMATCH', `by_expected.VALID ${counts.by_expected.VALID} !== ${actualValid}`)
    }
    if (counts.by_expected.INVALID !== actualInvalid) {
      fail('DECLARED_COUNT_MISMATCH', `by_expected.INVALID ${counts.by_expected.INVALID} !== ${actualInvalid}`)
    }
  }

  const actualByViolation = {}
  for (const fixture of fixtures) {
    if (!isPlainObject(fixture) || fixture.expected !== 'INVALID') continue
    if (!isNonEmptyString(fixture.expected_violation)) continue
    actualByViolation[fixture.expected_violation] = (actualByViolation[fixture.expected_violation] ?? 0) + 1
  }
  if (!isPlainObject(counts.by_violation)) {
    fail('DECLARED_COUNT_MISMATCH', 'declared by_violation is missing')
  } else {
    for (const [code, count] of Object.entries(actualByViolation)) {
      if (counts.by_violation[code] !== count) {
        fail(
          'DECLARED_COUNT_MISMATCH',
          `by_violation.${code} ${JSON.stringify(counts.by_violation[code])} !== ${count}`,
        )
      }
    }
    for (const code of Object.keys(counts.by_violation)) {
      if (actualByViolation[code] === undefined) {
        fail('DECLARED_COUNT_MISMATCH', `by_violation.${code} has no matching invalid fixture`)
      }
    }
  }

  return errors
}

function load() {
  const doc = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
  const specText = readFileSync(SPEC_PATH, 'utf8')
  return { doc, specText }
}

function selfTest() {
  const { doc: base, specText } = load()
  const baseErrors = validateDocument(base, specText)
  if (baseErrors.length > 0) {
    console.log(`SELF-TEST FAIL: baseline document is invalid: ${baseErrors[0]}`)
    return 1
  }

  const clone = () => JSON.parse(JSON.stringify(base))
  const fixture = (doc, id) => doc.fixtures.find((item) => item.id === id)
  const valid = (doc, id) => {
    const found = fixture(doc, id)
    if (!found) throw new Error(`self-test lost fixture ${id}`)
    return found
  }

  const cases = [
    {
      name: 'a valid fixture relabelled INVALID is rejected',
      mutate: (doc) => {
        const f = valid(doc, 'V1-four-full-exact-dates')
        f.expected = 'INVALID'
        f.expected_violation = 'SLOT_INFERRED'
      },
    },
    {
      name: 'an invalid fixture with no expected violation code is rejected',
      mutate: (doc) => {
        delete valid(doc, 'I1-inferred-observed-slot').expected_violation
      },
    },
    {
      name: 'an invalid fixture declaring the wrong violation code is rejected',
      mutate: (doc) => {
        valid(doc, 'I2-collapsed-single-date').expected_violation = 'SLOT_INFERRED'
      },
    },
    {
      name: 'an exact slot with its IANA zone removed is rejected',
      mutate: (doc) => {
        valid(doc, 'V1-four-full-exact-dates').record.slots.occurredAt.timezone = ''
      },
    },
    {
      name: 'four slots collapsed to one date are rejected',
      mutate: (doc) => {
        valid(doc, 'V1-four-full-exact-dates').record.slots = { date: '2026-10-27' }
      },
    },
    {
      name: 'a slot marked as inferred from another is rejected',
      mutate: (doc) => {
        valid(doc, 'V2-unknown-occurrence-slot').record.slots.observedAt.inferredFrom = 'occurredAt'
      },
    },
    {
      name: 'a correction applied in place is rejected',
      mutate: (doc) => {
        valid(doc, 'V4-corrected-chronology').record.corrections[0].appended = false
      },
    },
    {
      name: 'a misdeclared fixture total is rejected',
      mutate: (doc) => {
        doc.declared_counts.total += 1
      },
    },
    {
      name: 'a wrong declared effective chronology is rejected',
      mutate: (doc) => {
        valid(doc, 'V4-corrected-chronology').expectedEffective.occurredAt = '2026-10-27T02:00:00.000Z'
      },
    },
    {
      name: 'a timezone-less exact timestamp is rejected',
      mutate: (doc) => {
        valid(doc, 'V1-four-full-exact-dates').record.slots.occurredAt.utc = '2026-10-27T09:00:00'
      },
    },
    {
      name: 'reversed range bounds are rejected',
      mutate: (doc) => {
        const latest = valid(doc, 'V3-range-occurrence-slot').record.slots.occurredAt.latest
        latest.utc = '2026-10-26T16:00:00.000Z'
        latest.local = '2026-10-26T23:00:00'
      },
    },
    {
      name: 'an approximate slot with an empty qualifier is rejected',
      mutate: (doc) => {
        valid(doc, 'V5-approximate-written-slot').record.slots.writtenAt.qualifier = ''
      },
    },
    {
      name: 'an invalid fixture relabelled VALID is rejected',
      mutate: (doc) => {
        valid(doc, 'I2-collapsed-single-date').expected = 'VALID'
      },
    },
    {
      name: 'a duplicate fixture id is rejected',
      mutate: (doc) => {
        doc.fixtures[1].id = doc.fixtures[0].id
      },
    },
    {
      name: 'a missing violation tally entry is rejected',
      mutate: (doc) => {
        delete doc.declared_counts.by_violation.SLOT_INFERRED
      },
    },
  ]

  let accepted = 0
  for (const testCase of cases) {
    const mutated = clone()
    testCase.mutate(mutated)
    const errors = validateDocument(mutated, specText)
    const rejected = errors.length > 0
    console.log(`${rejected ? 'PASS' : 'FAIL'}  tampered: ${testCase.name}`)
    if (rejected) {
      console.log(`      first violation: ${errors[0]}`)
    } else {
      accepted++
    }
  }

  if (accepted > 0) {
    console.log(`SELF-TEST FAIL: ${accepted} of ${cases.length} tampered fixture sets accepted`)
    return 1
  }
  console.log(`SELF-TEST PASS: all ${cases.length} tampered fixture sets rejected (minimum required: 8)`)
  return 0
}

const args = process.argv.slice(2)
if (args.includes('--self-test')) {
  process.exit(selfTest() === 0 ? 0 : 1)
}

const { doc, specText } = load()
const errors = validateDocument(doc, specText)
if (errors.length > 0) {
  for (const error of errors) console.error(`VIOLATION ${error}`)
  console.error(`FAIL: ${errors.length} violation(s)`)
  process.exit(1)
}

const validCount = doc.fixtures.filter((f) => f.expected === 'VALID').length
const invalidCount = doc.fixtures.filter((f) => f.expected === 'INVALID').length
const correctionCount = doc.fixtures.reduce(
  (sum, f) => sum + (Array.isArray(f.record?.corrections) ? f.record.corrections.length : 0),
  0,
)
const corrected = doc.fixtures.find((f) => f.id === 'V4-corrected-chronology')

console.log(`PASS fixtures total=${doc.fixtures.length} valid=${validCount} invalid=${invalidCount}`)
console.log(`PASS ${validCount} VALID fixtures produced zero violation codes`)
console.log(`PASS ${invalidCount} INVALID fixtures produced their declared violation codes`)
console.log(`PASS declared counts and by_violation tallies match the fixtures`)
console.log(
  `PASS Tick-Tock corrected chronology: originals retained, ${correctionCount} appended corrections, effective occurredAt=${corrected.expectedEffective.occurredAt} writtenAt=${corrected.expectedEffective.writtenAt}`,
)
console.log(`PASS spec headings and terms present (precision, timezone, appended correction, no defaulting)`)
console.log('NOTE contract and fixtures only: no witness archive schema, table, API or UI is implemented; M16-03 owns immutable lineage persistence')
