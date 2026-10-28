import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  EMPIRE_TAXONOMY_INDEX,
  EMPIRE_TAXONOMY_KINDS,
  EMPIRE_TAXONOMY_EVIDENCED_COUNTS,
  EMPIRE_TAXONOMY_EXPECTED_COUNTS,
  EMPIRE_TAXONOMY_FORBIDDEN_FIELDS,
  validateEmpireTaxonomyIndex,
} from '../src/data/empire-taxonomy.ts'

const ENTRY_KEYS = new Set([
  'kind',
  'id',
  'ordinal',
  'labels',
  'source',
  'corroboratingSources',
  'sourceNote',
  'authority',
])

const FORBIDDEN_KEYS = new Set(EMPIRE_TAXONOMY_FORBIDDEN_FIELDS.map((field) => field.toLowerCase()))

function cloneIndex() {
  return JSON.parse(JSON.stringify(EMPIRE_TAXONOMY_INDEX))
}

function ofKind(index, kind) {
  return index.entries.filter((entry) => entry.kind === kind)
}

function collectKeys(value, path, found) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectKeys(item, `${path}[${index}]`, found))
    return found
  }
  if (typeof value !== 'object' || value === null) return found
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) found.push(`${path}.${key}`)
    collectKeys(child, `${path}.${key}`, found)
  }
  return found
}

describe('M23-04 — Empire taxonomy metadata index', () => {
  it('keeps exactly three separate kinds and never merges an entry across kinds', () => {
    assert.deepEqual([...EMPIRE_TAXONOMY_INDEX.kinds], ['prime-code', 'wings', 'god99'])

    const observedKinds = [...new Set(EMPIRE_TAXONOMY_INDEX.entries.map((entry) => entry.kind))].sort()
    assert.deepEqual(observedKinds, ['god99', 'prime-code', 'wings'])

    const idKinds = new Map()
    for (const entry of EMPIRE_TAXONOMY_INDEX.entries) {
      const previous = idKinds.get(entry.id)
      assert.equal(previous, undefined, `id ${entry.id} appears under both ${previous} and ${entry.kind}`)
      idKinds.set(entry.id, entry.kind)
    }

    for (const kind of EMPIRE_TAXONOMY_KINDS) {
      const entries = ofKind(EMPIRE_TAXONOMY_INDEX, kind)
      assert.ok(entries.length > 0, `${kind} must have evidenced entries`)
      for (const entry of entries) {
        assert.equal(entry.kind, kind)
        assert.equal(entry.authority, 'metadata-only')
      }
    }

    assert.match(ofKind(EMPIRE_TAXONOMY_INDEX, 'prime-code')[0].id, /^PC\d{2}$/)
    assert.match(ofKind(EMPIRE_TAXONOMY_INDEX, 'wings')[0].id, /^W\d{2}$/)
    assert.match(ofKind(EMPIRE_TAXONOMY_INDEX, 'god99')[0].id, /^GOD-\d{3}$/)
  })

  it('uses unique stable ids and unique ordinals inside each kind', () => {
    const ids = EMPIRE_TAXONOMY_INDEX.entries.map((entry) => entry.id)
    assert.equal(new Set(ids).size, ids.length)

    for (const kind of EMPIRE_TAXONOMY_KINDS) {
      const ordinals = ofKind(EMPIRE_TAXONOMY_INDEX, kind).map((entry) => entry.ordinal)
      assert.equal(new Set(ordinals).size, ordinals.length, `${kind} has duplicate ordinals`)
    }
  })

  it('is metadata-only and carries no role, permission, agent or identity field', () => {
    assert.equal(EMPIRE_TAXONOMY_INDEX.authority, 'metadata-only')
    for (const field of ['role', 'permission', 'agent', 'identity']) {
      assert.ok(FORBIDDEN_KEYS.has(field), `${field} must be a forbidden field`)
    }

    const found = collectKeys(EMPIRE_TAXONOMY_INDEX, 'index', [])
    assert.deepEqual(found, [])

    for (const entry of EMPIRE_TAXONOMY_INDEX.entries) {
      assert.equal(entry.authority, 'metadata-only')
      for (const key of Object.keys(entry)) {
        assert.ok(ENTRY_KEYS.has(key), `unexpected entry field ${key}`)
      }
    }

    assert.doesNotThrow(() => validateEmpireTaxonomyIndex(EMPIRE_TAXONOMY_INDEX))
  })

  it('counts only evidenced entries and documents the unevidenced slots as gaps', () => {
    assert.deepEqual({ ...EMPIRE_TAXONOMY_EVIDENCED_COUNTS }, { 'prime-code': 9, wings: 10, god99: 3 })
    assert.deepEqual({ ...EMPIRE_TAXONOMY_EXPECTED_COUNTS }, { 'prime-code': 9, wings: 10, god99: 99 })

    assert.equal(ofKind(EMPIRE_TAXONOMY_INDEX, 'prime-code').length, 9)
    assert.equal(ofKind(EMPIRE_TAXONOMY_INDEX, 'wings').length, 10)
    assert.equal(ofKind(EMPIRE_TAXONOMY_INDEX, 'god99').length, 3)
    assert.equal(EMPIRE_TAXONOMY_INDEX.entries.length, 22)

    const gaps = Object.fromEntries(EMPIRE_TAXONOMY_INDEX.gaps.map((gap) => [gap.kind, gap]))
    assert.equal(gaps['prime-code'].missing, 0)
    assert.equal(gaps.wings.missing, 0)
    assert.equal(gaps.god99.evidenced, 3)
    assert.equal(gaps.god99.missing, 96)
    assert.equal(
      EMPIRE_TAXONOMY_INDEX.gaps.reduce((total, gap) => total + gap.missing, 0),
      96,
      'the only member gap is the 96 unenumerated GOD99 slots',
    )

    for (const entry of EMPIRE_TAXONOMY_INDEX.entries) {
      assert.ok(entry.source.file.startsWith('docs/'), `${entry.id} needs a repository source file`)
      assert.ok(entry.source.section.trim().length > 0, `${entry.id} needs a source section`)
      assert.ok(Number.isInteger(entry.source.line) && entry.source.line > 0, `${entry.id} needs a source line`)
    }
  })

  it('rejects merged and privilege-bearing entries instead of indexing them', () => {
    const merged = cloneIndex()
    merged.entries.find((entry) => entry.kind === 'prime-code').id = merged.entries.find(
      (entry) => entry.kind === 'wings',
    ).id
    assert.throws(() => validateEmpireTaxonomyIndex(merged), /merged across kinds/)

    const mergedKind = cloneIndex()
    mergedKind.entries[0].kind = 'prime-code+wings'
    assert.throws(() => validateEmpireTaxonomyIndex(mergedKind), /must be one of prime-code, wings, god99/)

    const privileged = cloneIndex()
    privileged.entries[0].role = 'angel'
    assert.throws(() => validateEmpireTaxonomyIndex(privileged), /forbidden privilege\/agent fields: entries\[0\]\.role/)

    const unexpected = cloneIndex()
    unexpected.entries[0].powers = 'flight'
    assert.throws(() => validateEmpireTaxonomyIndex(unexpected), /unexpected field powers/)

    const operational = cloneIndex()
    operational.entries[0].authority = 'operational'
    assert.throws(() => validateEmpireTaxonomyIndex(operational), /authority must be metadata-only/)

    const bound = cloneIndex()
    bound.entries[0].proposedLeadPersonaSlot = 'GOD-049'
    assert.throws(
      () => validateEmpireTaxonomyIndex(bound),
      /forbidden privilege\/agent fields: entries\[0\]\.proposedLeadPersonaSlot/,
    )

    const duplicate = cloneIndex()
    duplicate.entries[1].id = duplicate.entries[0].id
    assert.throws(() => validateEmpireTaxonomyIndex(duplicate), /duplicated within kind/)

    const padded = cloneIndex()
    padded.gaps.find((gap) => gap.kind === 'god99').missing = 0
    assert.throws(() => validateEmpireTaxonomyIndex(padded), /missing must equal expected - evidenced/)

    const invented = cloneIndex()
    invented.entries.push({ ...invented.entries[0], id: 'PC10' })
    assert.throws(() => validateEmpireTaxonomyIndex(invented), /prime-code must have 9 evidenced entries/)
  })
})
