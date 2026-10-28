import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CLAIM_FAMILIES,
  DEFAULT_LABEL_LOCALE,
  EPISTEMIC_CLASSES,
  EPISTEMIC_CLASS_CLAIM_FAMILY,
  EPISTEMIC_CLASS_DISPLAY,
  LABEL_LOCALES,
  PROJECTION_LABEL_KIND,
  PROJECTION_LABEL_REFUSALS,
  PROJECTION_LABEL_SCHEMA_VERSION,
  PROJECTION_RECORD_KINDS,
  PROJECTION_SURFACES,
  ProjectionLabelError,
  claimFamilyOf,
  classifyProjectionKind,
  isLabeledProjection,
  labelProjection,
  renderLabelText,
  requireLabeledProjection,
} from '../../packages/moonql-research/src/projection-label.ts'

// Every fixture below is synthetic. CANARY is a marker that may appear inside a
// labelled projection but must never appear in a refusal record.
const CANARY = 'canary:record-ref:must-not-leak'

const record = (overrides = {}) => ({
  recordRef: 'ref:fixture:witness-0001',
  recordKind: 'd06.witness_testimony',
  epistemicClass: 'PERSONAL_TESTIMONY',
  ...overrides,
})

const projection = (records, overrides = {}) => ({ surface: 'DOCK', records, ...overrides })

function refusalOf(result) {
  assert.equal(result.labeled, false)
  assert.equal(typeof result.refusal, 'string')
  assert.equal('label' in result, false)
  assert.equal('epistemicClass' in result, false)
  assert.equal('display' in result, false)
  return result.refusal
}

function labelOf(result) {
  assert.equal(isLabeledProjection(result), true)
  assert.equal(result.refusal, null)
  return result.label
}

test('positive: every projection kind maps to exactly one epistemic class and family', () => {
  const kinds = Object.keys(PROJECTION_RECORD_KINDS)
  assert.equal(kinds.length, 7)
  for (const kind of kinds) {
    const classified = classifyProjectionKind(kind)
    assert.equal(classified.ok, true)
    assert.equal(classified.recordKind, kind)
    assert.equal(classified.epistemicClass, PROJECTION_RECORD_KINDS[kind])
    assert.equal(classified.claimFamily, EPISTEMIC_CLASS_CLAIM_FAMILY[classified.epistemicClass])
    assert.equal(Object.isFrozen(classified), true)
  }
  const covered = new Set(kinds.map((kind) => PROJECTION_RECORD_KINDS[kind]))
  assert.deepEqual([...covered].sort(), [...EPISTEMIC_CLASSES].sort())
})

test('positive: the class axis is the BLUEPRINT §6 set and families are derived, not stored', () => {
  assert.deepEqual(EPISTEMIC_CLASSES, [
    'PRIMARY_TEXT',
    'ATTRIBUTED_BELIEF',
    'HISTORICAL_EVIDENCE',
    'SCIENTIFIC_OBSERVATION',
    'PERSONAL_TESTIMONY',
    'INTERPRETATION',
    'FICTION',
  ])
  assert.deepEqual(CLAIM_FAMILIES, ['TESTIMONY', 'EMPIRICAL_CLAIM', 'FICTION', 'NARRATIVE_FRAME'])
  for (const epistemicClass of EPISTEMIC_CLASSES) {
    assert.equal(CLAIM_FAMILIES.includes(EPISTEMIC_CLASS_CLAIM_FAMILY[epistemicClass]), true)
    assert.equal(claimFamilyOf(epistemicClass), EPISTEMIC_CLASS_CLAIM_FAMILY[epistemicClass])
  }
  assert.equal(claimFamilyOf('PERSONAL_TESTIMONY'), 'TESTIMONY')
  assert.equal(claimFamilyOf('SCIENTIFIC_OBSERVATION'), 'EMPIRICAL_CLAIM')
  assert.equal(claimFamilyOf('FICTION'), 'FICTION')
  assert.equal(claimFamilyOf('INTERPRETATION'), 'NARRATIVE_FRAME')
})

test('positive: each kind labels a projection with its class, family and untranslated machine label', () => {
  for (const kind of Object.keys(PROJECTION_RECORD_KINDS)) {
    const expected = PROJECTION_RECORD_KINDS[kind]
    const label = labelOf(labelProjection(projection([record({ recordRef: `ref:fixture:${kind}`, recordKind: kind, epistemicClass: expected })])))
    assert.equal(label.epistemicClass, expected)
    assert.equal(label.claimFamily, EPISTEMIC_CLASS_CLAIM_FAMILY[expected])
    assert.equal(label.machineLabel, expected)
    assert.equal(label.schemaVersion, PROJECTION_LABEL_SCHEMA_VERSION)
    assert.equal(label.kind, PROJECTION_LABEL_KIND)
    assert.equal(label.records[0].recordKind, kind)
    for (const locale of LABEL_LOCALES) {
      assert.equal(typeof label.display[locale], 'string')
      assert.equal(label.display[locale].length > 0, true)
    }
  }
})

test('positive: a testimony projection never asserts fact and carries no truth verdict', () => {
  const label = labelOf(labelProjection(projection([record()])))
  assert.equal(label.assertedAsFact, false)
  assert.equal(label.truthVerdict, null)
  assert.equal(label.labelIsAReview, false)
  assert.equal(label.surface, 'DOCK')
  assert.deepEqual(label.recordRefs, ['ref:fixture:witness-0001'])
  assert.equal(label.records.length, 1)
  assert.equal(label.records[0].epistemicClass, 'PERSONAL_TESTIMONY')
  assert.match(label.notice, /not a truth verdict/i)
})

test('positive: every declared projection surface accepts a labelled projection', () => {
  for (const surface of PROJECTION_SURFACES) {
    const label = labelOf(labelProjection(projection([record()], { surface })))
    assert.equal(label.surface, surface)
  }
})

test('positive: same-class records are ordered deterministically regardless of input order', () => {
  const records = [
    record({ recordRef: 'ref:fixture:witness-0003' }),
    record({ recordRef: 'ref:fixture:witness-0001' }),
    record({ recordRef: 'ref:fixture:witness-0002' }),
  ]
  const forward = labelOf(labelProjection(projection(records)))
  const reversed = labelOf(labelProjection(projection([...records].reverse())))
  assert.deepEqual(forward.recordRefs, [
    'ref:fixture:witness-0001',
    'ref:fixture:witness-0002',
    'ref:fixture:witness-0003',
  ])
  assert.deepEqual(reversed.recordRefs, forward.recordRefs)
  assert.deepEqual(
    reversed.records.map((entry) => entry.recordRef),
    forward.records.map((entry) => entry.recordRef),
  )
})

test('positive: labels and their display table are deeply frozen', () => {
  const label = labelOf(labelProjection(projection([record()])))
  assert.equal(Object.isFrozen(label), true)
  assert.equal(Object.isFrozen(label.records), true)
  assert.equal(Object.isFrozen(label.records[0]), true)
  assert.equal(Object.isFrozen(label.recordRefs), true)
  assert.equal(Object.isFrozen(label.display), true)
  assert.throws(() => {
    label.epistemicClass = 'SCIENTIFIC_OBSERVATION'
  }, TypeError)
  assert.throws(() => {
    label.records[0].epistemicClass = 'FICTION'
  }, TypeError)
  assert.throws(() => {
    label.display.en = 'evidence'
  }, TypeError)
  assert.equal(label.epistemicClass, 'PERSONAL_TESTIMONY')
})

test('positive: display text is localized for en and id while the machine label stays ASCII', () => {
  for (const epistemicClass of EPISTEMIC_CLASSES) {
    assert.equal(typeof EPISTEMIC_CLASS_DISPLAY[epistemicClass].en, 'string')
    assert.equal(typeof EPISTEMIC_CLASS_DISPLAY[epistemicClass].id, 'string')
    assert.notEqual(EPISTEMIC_CLASS_DISPLAY[epistemicClass].en, EPISTEMIC_CLASS_DISPLAY[epistemicClass].id)
    const en = renderLabelText(epistemicClass, 'en')
    const id = renderLabelText(epistemicClass, 'id')
    assert.equal(en.rendered, true)
    assert.equal(id.rendered, true)
    assert.equal(en.locale, 'en')
    assert.equal(id.locale, 'id')
    assert.equal(en.fallback, false)
    assert.equal(id.fallback, false)
    assert.equal(en.machineLabel, epistemicClass)
    assert.equal(id.machineLabel, epistemicClass)
    assert.equal(en.text, EPISTEMIC_CLASS_DISPLAY[epistemicClass].en)
    assert.equal(id.text, EPISTEMIC_CLASS_DISPLAY[epistemicClass].id)
    assert.equal(Object.isFrozen(en), true)
  }
  const fallback = renderLabelText('PERSONAL_TESTIMONY', 'fr')
  assert.equal(fallback.rendered, true)
  assert.equal(fallback.locale, DEFAULT_LABEL_LOCALE)
  assert.equal(fallback.locale, 'en')
  assert.equal(fallback.fallback, true)
})

test('positive: the registry has no wildcard, default, catch-all or UNKNOWN entry', () => {
  const keys = Object.keys(PROJECTION_RECORD_KINDS)
  for (const forbidden of ['*', 'default', 'DEFAULT', 'UNKNOWN', 'unknown', 'any']) {
    assert.equal(keys.includes(forbidden), false)
  }
  for (const key of keys) {
    assert.equal(EPISTEMIC_CLASSES.includes(PROJECTION_RECORD_KINDS[key]), true)
  }
  assert.equal(Object.isFrozen(PROJECTION_RECORD_KINDS), true)
  assert.equal(Object.isFrozen(EPISTEMIC_CLASS_CLAIM_FAMILY), true)
})

test('positive: refusal codes are unique, frozen and enumerable for callers', () => {
  assert.equal(Object.isFrozen(PROJECTION_LABEL_REFUSALS), true)
  assert.equal(new Set(PROJECTION_LABEL_REFUSALS).size, PROJECTION_LABEL_REFUSALS.length)
  assert.equal(PROJECTION_LABEL_REFUSALS.includes('RECORD_UNLABELED'), true)
  assert.equal(PROJECTION_LABEL_REFUSALS.includes('MIXED_LABELS'), true)
  assert.equal(PROJECTION_LABEL_REFUSALS.includes('LABEL_UPGRADE_REFUSED'), true)
})

test('negative: a record with no stored class is UNLABELED, never defaulted', () => {
  for (const missing of [undefined, null, '']) {
    const result = labelProjection(projection([record({ epistemicClass: missing, recordRef: CANARY })]))
    assert.equal(refusalOf(result), 'RECORD_UNLABELED')
    assert.equal(JSON.stringify(result).includes(CANARY), false)
  }
})

test('negative: a missing projection kind is refused and cannot borrow the class', () => {
  for (const missing of [undefined, null, '']) {
    const result = labelProjection(projection([record({ recordKind: missing })]))
    assert.equal(refusalOf(result), 'RECORD_KIND_MISSING')
  }
})

test('negative: an unknown projection kind is refused without an empirical fallback', () => {
  const result = labelProjection(
    projection([record({ recordKind: 'd09.astrology_report', epistemicClass: 'SCIENTIFIC_OBSERVATION', recordRef: CANARY })]),
  )
  assert.equal(refusalOf(result), 'RECORD_KIND_UNKNOWN')
  assert.equal(JSON.stringify(result).includes(CANARY), false)
  assert.equal(classifyProjectionKind('d09.astrology_report').ok, false)
  assert.equal(classifyProjectionKind('d09.astrology_report').refusal, 'RECORD_KIND_UNKNOWN')
  assert.equal(classifyProjectionKind(42).ok, false)
  assert.equal(classifyProjectionKind('').refusal, 'RECORD_KIND_MISSING')
})

test('negative: a stored class outside the BLUEPRINT axis is refused', () => {
  const result = labelProjection(projection([record({ epistemicClass: 'EMPIRICAL_FACT' })]))
  assert.equal(refusalOf(result), 'EPISTEMIC_CLASS_UNKNOWN')
})

test('negative: a mixed projection is refused instead of collapsing to one label', () => {
  const result = labelProjection(
    projection([
      record({ recordRef: 'ref:fixture:witness-0001' }),
      record({ recordRef: 'ref:fixture:fiction-0001', recordKind: 'd07.fiction_scene', epistemicClass: 'FICTION' }),
    ]),
  )
  assert.equal(refusalOf(result), 'MIXED_LABELS')
  assert.match(result.detail, /FICTION/)
  assert.match(result.detail, /PERSONAL_TESTIMONY/)
  assert.equal(result.detail.includes('ref:fixture:witness-0001'), false)
})

test('negative: testimony cannot be upgraded to empirical evidence by its projection kind', () => {
  const result = labelProjection(
    projection([record({ recordKind: 'd06.documentary_attestation', epistemicClass: 'PERSONAL_TESTIMONY', recordRef: CANARY })]),
  )
  assert.equal(refusalOf(result), 'LABEL_UPGRADE_REFUSED')
  assert.equal(JSON.stringify(result).includes(CANARY), false)
})

test('negative: testimony cannot be upgraded to primary text or measurement either', () => {
  const toPrimary = labelProjection(
    projection([record({ recordKind: 'd01.primary_text', epistemicClass: 'PERSONAL_TESTIMONY' })]),
  )
  assert.equal(refusalOf(toPrimary), 'LABEL_UPGRADE_REFUSED')
  const toObservation = labelProjection(
    projection([record({ recordKind: 'd10.scientific_observation', epistemicClass: 'PERSONAL_TESTIMONY' })]),
  )
  assert.equal(refusalOf(toObservation), 'LABEL_UPGRADE_REFUSED')
})

test('negative: fiction cannot be upgraded to testimony or evidence', () => {
  const toTestimony = labelProjection(
    projection([record({ recordKind: 'd06.witness_testimony', epistemicClass: 'FICTION' })]),
  )
  assert.equal(refusalOf(toTestimony), 'LABEL_UPGRADE_REFUSED')
  const toEvidence = labelProjection(
    projection([record({ recordKind: 'd06.documentary_attestation', epistemicClass: 'FICTION' })]),
  )
  assert.equal(refusalOf(toEvidence), 'LABEL_UPGRADE_REFUSED')
})

test('negative: evidence cannot be downgraded to testimony or fiction by its projection kind', () => {
  const result = labelProjection(
    projection([record({ recordKind: 'd06.witness_testimony', epistemicClass: 'HISTORICAL_EVIDENCE' })]),
  )
  assert.equal(refusalOf(result), 'LABEL_DOWNGRADE_REFUSED')
  const toFiction = labelProjection(
    projection([record({ recordKind: 'd07.fiction_scene', epistemicClass: 'SCIENTIFIC_OBSERVATION' })]),
  )
  assert.equal(refusalOf(toFiction), 'LABEL_DOWNGRADE_REFUSED')
})

test('negative: an incomparable reclassification is a mismatch, not a silent relabel', () => {
  const toTestimony = labelProjection(
    projection([record({ recordKind: 'd06.witness_testimony', epistemicClass: 'ATTRIBUTED_BELIEF' })]),
  )
  assert.equal(refusalOf(toTestimony), 'LABEL_MISMATCH')
  const toFrame = labelProjection(
    projection([record({ recordKind: 'd05.attributed_belief', epistemicClass: 'INTERPRETATION' })]),
  )
  assert.equal(refusalOf(toFrame), 'LABEL_MISMATCH')
})

test('negative: an empty or non-list record set is refused', () => {
  assert.equal(refusalOf(labelProjection(projection([]))), 'RECORDS_EMPTY')
  assert.equal(refusalOf(labelProjection({ surface: 'DOCK', records: 'nope' })), 'RECORDS_EMPTY')
  assert.equal(refusalOf(labelProjection({ surface: 'DOCK' })), 'RECORDS_EMPTY')
})

test('negative: unknown or missing surfaces are refused', () => {
  for (const surface of [undefined, null, '', 'PRINT', 'dock']) {
    assert.equal(refusalOf(labelProjection(projection([record()], { surface }))), 'SURFACE_UNKNOWN')
  }
})

test('negative: malformed projections and records are refused with stable codes', () => {
  for (const input of [undefined, null, 'DOCK', [], 7]) {
    assert.equal(refusalOf(labelProjection(input)), 'PROJECTION_INVALID')
  }
  assert.equal(refusalOf(labelProjection(projection(['record']))), 'RECORD_INVALID')
  assert.equal(refusalOf(labelProjection(projection({ ...record() }))), 'RECORDS_EMPTY')
  for (const recordRef of [undefined, null, '', '   ', 42]) {
    assert.equal(refusalOf(labelProjection(projection([record({ recordRef })]))), 'RECORD_REF_MISSING')
  }
})

test('negative: rendering an emitter without a label throws instead of serializing', () => {
  const unlabeled = labelProjection(projection([record({ epistemicClass: null })]))
  assert.throws(
    () => requireLabeledProjection(unlabeled),
    (error) => {
      assert.equal(error instanceof ProjectionLabelError, true)
      assert.equal(error.refusal, 'RECORD_UNLABELED')
      assert.match(error.message, /^RECORD_UNLABELED:/)
      return true
    },
  )
  const labeled = labelProjection(projection([record()]))
  assert.equal(requireLabeledProjection(labeled), labeled.label)
})

test('negative: an unknown class cannot be rendered and gets no display text', () => {
  const result = renderLabelText('EMPIRICAL_FACT', 'en')
  assert.equal(result.rendered, false)
  assert.equal(result.refusal, 'EPISTEMIC_CLASS_UNKNOWN')
  assert.equal('text' in result, false)
  assert.equal(claimFamilyOf('EMPIRICAL_FACT'), null)
  assert.equal(claimFamilyOf(undefined), null)
  assert.equal(claimFamilyOf('d06.witness_testimony'), null)
})

test('negative: a refusal never carries record content, only opaque indices and class names', () => {
  const results = [
    labelProjection(projection([record({ epistemicClass: null, recordRef: CANARY })])),
    labelProjection(projection([record({ recordKind: 'd07.fiction_scene', epistemicClass: 'PERSONAL_TESTIMONY', recordRef: CANARY })])),
    labelProjection(projection([record({ epistemicClass: 'NOT_A_CLASS', recordRef: CANARY })])),
    labelProjection(projection([record({ recordRef: CANARY }), record({ recordRef: CANARY, recordKind: 'd07.fiction_scene', epistemicClass: 'FICTION' })])),
  ]
  for (const result of results) {
    assert.equal(result.labeled, false)
    assert.equal(JSON.stringify(result).includes(CANARY), false)
  }
})
