import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  OBSERVATION_DISPLAYS,
  OBSERVATION_REASONS,
  OBSERVATION_SOURCE_KINDS,
  classifyObservationFreshness,
  type ObservationFreshnessInput,
} from '../dist/observation-freshness.js'

/**
 * Synthetic fixtures only. Nothing here is an observation: the references,
 * timestamps and payload strings exist to exercise the contract. `now` is
 * always a caller-supplied constant; no clock is read by the module or here.
 */
const OBSERVED_AT = '2026-10-29T00:00:00.000Z'
const FRESH_NOW = '2026-10-29T00:02:00.000Z'
const TTL_BOUNDARY_NOW = '2026-10-29T00:10:00.000Z'
const STALE_NOW = '2026-10-29T00:10:01.000Z'
const LOCAL_NOW = '2026-10-29T07:02:00.000+07:00'
const FUTURE_OBSERVED_AT = '2026-10-29T00:03:00.000Z'

const TTL_SECONDS = 600

const HOSTILE_TITLE = 'RAW-TITLE-NEVER-LEAK'
const HOSTILE_URL = 'https://seed.invalid/world-monitor/raw-url-NEVER-LEAK'
const HOSTILE_SUMMARY = 'RAW-SUMMARY-NEVER-LEAK'
const SOURCE_REF = 'collector:youtube-atom:example'
const RIGHTS_REF = 'rights:youtube-atom:example'

/** Every refusal and label must stay silent about the record it classified. */
const LEAK_NEEDLES = [HOSTILE_TITLE, HOSTILE_URL, HOSTILE_SUMMARY, SOURCE_REF, RIGHTS_REF, OBSERVED_AT]

const assertNoEcho = (result, needles = LEAK_NEEDLES) => {
  const serialized = JSON.stringify(result)
  for (const needle of needles) {
    assert.ok(!serialized.includes(needle), `result leaked ${needle}`)
  }
}

const providerRecord: ObservationFreshnessInput & Record<string, unknown> = {
  sourceKind: 'PROVIDER',
  sourceRef: SOURCE_REF,
  rightsRef: RIGHTS_REF,
  observedAt: OBSERVED_AT,
  ttlSeconds: TTL_SECONDS,
  now: FRESH_NOW,
  title: HOSTILE_TITLE,
  url: HOSTILE_URL,
  summary: HOSTILE_SUMMARY,
}

const assertWithheld = (result, expected) => {
  assert.equal(result.display, 'WITHHELD')
  assert.equal(result.reason, expected)
  assert.equal(result.liveReading, false)
  assert.equal(result.label, null)
  assert.equal(result.ageSeconds, null)
  assert.ok(Object.isFrozen(result))
  assertNoEcho(result)
}

describe('M24-05 observation freshness vocabulary', () => {
  it('exports the five display states and four source kinds in stable order', () => {
    assert.deepEqual([...OBSERVATION_DISPLAYS], [
      'LIVE_OBSERVATION',
      'DEGRADED',
      'STALE',
      'SYNTHETIC',
      'WITHHELD',
    ])
    assert.deepEqual([...OBSERVATION_SOURCE_KINDS], ['PROVIDER', 'SEED', 'FIXTURE', 'SYNTHETIC'])
  })

  it('exports the stable reason codes a surface may switch on', () => {
    for (const code of [
      'OBSERVATION_DESCRIPTOR_INVALID',
      'SOURCE_KIND_MISSING',
      'SOURCE_KIND_UNKNOWN',
      'SOURCE_REFERENCE_MISSING',
      'RIGHTS_REFERENCE_MISSING',
      'OBSERVED_AT_MISSING',
      'OBSERVED_AT_NOT_UTC',
      'TTL_MISSING',
      'TTL_INVALID',
      'NOW_MISSING',
      'NOW_NOT_UTC',
      'OBSERVATION_IN_FUTURE',
      'SOURCE_STATE_UNKNOWN',
      'SEED_RECORD_NOT_LIVE',
      'FIXTURE_RECORD_NOT_LIVE',
      'SYNTHETIC_RECORD_NOT_LIVE',
      'NON_OBSERVATION_WITHHELD_ON_LIVE_SURFACE',
      'OBSERVATION_STALE',
      'SOURCE_DEGRADED',
    ]) {
      assert.ok(OBSERVATION_REASONS.includes(code), `missing reason ${code}`)
    }
  })
})

describe('M24-05 live observations', () => {
  it('classifies a fresh, source-backed, rights-referenced observation as live', () => {
    const result = classifyObservationFreshness(providerRecord)
    assert.equal(result.display, 'LIVE_OBSERVATION')
    assert.equal(result.reason, null)
    assert.equal(result.liveReading, true)
    assert.equal(result.ageSeconds, 120)
    assert.equal(result.locale, 'en')
    assert.equal(result.localeFallback, false)
    assert.equal(typeof result.label, 'string')
    assert.ok(Object.isFrozen(result))
    assertNoEcho(result)
  })

  it('keeps a record exactly at its declared TTL inside the window', () => {
    const result = classifyObservationFreshness({ ...providerRecord, now: TTL_BOUNDARY_NOW })
    assert.equal(result.display, 'LIVE_OBSERVATION')
    assert.equal(result.reason, null)
    assert.equal(result.ageSeconds, TTL_SECONDS)
  })

  it('labels an in-TTL observation as degraded when the source declares a degraded state', () => {
    const result = classifyObservationFreshness({ ...providerRecord, sourceState: 'DEGRADED' })
    assert.equal(result.display, 'DEGRADED')
    assert.equal(result.reason, 'SOURCE_DEGRADED')
    assert.equal(result.liveReading, false)
    assert.equal(typeof result.label, 'string')
    assert.ok(result.label.length > 0)
  })

  it('labels an observation one second past its TTL as stale, never live', () => {
    const result = classifyObservationFreshness({ ...providerRecord, now: STALE_NOW })
    assert.equal(result.display, 'STALE')
    assert.equal(result.reason, 'OBSERVATION_STALE')
    assert.equal(result.liveReading, false)
    assert.equal(result.ageSeconds, TTL_SECONDS + 1)
    assert.equal(typeof result.label, 'string')
    assert.ok(result.label.includes('not a live reading'))
  })

  it('renders the id label and falls back to en for an unsupported locale', () => {
    const id = classifyObservationFreshness({ ...providerRecord, locale: 'id' })
    assert.equal(id.locale, 'id')
    assert.equal(id.localeFallback, false)
    assert.ok(id.label.includes('Pengamatan langsung'))

    const fallback = classifyObservationFreshness({ ...providerRecord, now: STALE_NOW, locale: 'fr' })
    assert.equal(fallback.display, 'STALE')
    assert.equal(fallback.locale, 'en')
    assert.equal(fallback.localeFallback, true)
  })
})

describe('M24-05 labels non-observations instead of rendering them live', () => {
  it('labels a seeded record SYNTHETIC even when it carries a fresh timestamp', () => {
    const result = classifyObservationFreshness({ ...providerRecord, sourceKind: 'SEED' })
    assert.equal(result.display, 'SYNTHETIC')
    assert.equal(result.reason, 'SEED_RECORD_NOT_LIVE')
    assert.equal(result.liveReading, false)
    assert.equal(result.ageSeconds, null)
    assert.equal(typeof result.label, 'string')
    assert.ok(result.label.includes('not an observation'))
    assertNoEcho(result)
  })

  it('labels fixture and synthetic records SYNTHETIC with their own reason codes', () => {
    const fixture = classifyObservationFreshness({ ...providerRecord, sourceKind: 'FIXTURE' })
    assert.equal(fixture.display, 'SYNTHETIC')
    assert.equal(fixture.reason, 'FIXTURE_RECORD_NOT_LIVE')
    assert.equal(fixture.liveReading, false)

    const synthetic = classifyObservationFreshness({ ...providerRecord, sourceKind: 'SYNTHETIC' })
    assert.equal(synthetic.display, 'SYNTHETIC')
    assert.equal(synthetic.reason, 'SYNTHETIC_RECORD_NOT_LIVE')
    assert.equal(synthetic.liveReading, false)
  })

  it('withholds a non-observation on a live-only surface instead of labelling it', () => {
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceKind: 'SEED', liveOnly: true }),
      'NON_OBSERVATION_WITHHELD_ON_LIVE_SURFACE',
    )
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceKind: 'FIXTURE', liveOnly: true }),
      'NON_OBSERVATION_WITHHELD_ON_LIVE_SURFACE',
    )
  })
})

describe('M24-05 refusals are fail closed', () => {
  it('withholds a record without an observation timestamp', () => {
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, observedAt: undefined }),
      'OBSERVED_AT_MISSING',
    )
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, observedAt: '   ' }),
      'OBSERVED_AT_MISSING',
    )
  })

  it('withholds a local, offset or date-only observation timestamp', () => {
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, observedAt: LOCAL_NOW }),
      'OBSERVED_AT_NOT_UTC',
    )
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, observedAt: '2026-10-29' }),
      'OBSERVED_AT_NOT_UTC',
    )
  })

  it('withholds a missing, lowercase or unrecognized source kind', () => {
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceKind: undefined }),
      'SOURCE_KIND_MISSING',
    )
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceKind: 'provider' }),
      'SOURCE_KIND_UNKNOWN',
    )
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceKind: 'RSS' }),
      'SOURCE_KIND_UNKNOWN',
    )
  })

  it('withholds a record without a source reference or a rights reference', () => {
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceRef: undefined }),
      'SOURCE_REFERENCE_MISSING',
    )
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceRef: '   ' }),
      'SOURCE_REFERENCE_MISSING',
    )
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, rightsRef: null }),
      'RIGHTS_REFERENCE_MISSING',
    )
    // Provenance is required even when the record is already a non-observation.
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceKind: 'SEED', rightsRef: '' }),
      'RIGHTS_REFERENCE_MISSING',
    )
  })

  it('withholds a record without a usable TTL', () => {
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, ttlSeconds: undefined }),
      'TTL_MISSING',
    )
    for (const ttlSeconds of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, '600']) {
      assertWithheld(
        classifyObservationFreshness({ ...providerRecord, ttlSeconds: ttlSeconds as unknown as number }),
        'TTL_INVALID',
      )
    }
  })

  it('withholds a record without a caller-supplied UTC evaluation instant', () => {
    assertWithheld(classifyObservationFreshness({ ...providerRecord, now: undefined }), 'NOW_MISSING')
    assertWithheld(classifyObservationFreshness({ ...providerRecord, now: LOCAL_NOW }), 'NOW_NOT_UTC')
  })

  it('withholds a future-dated observation instead of treating it as fresh', () => {
    assertWithheld(
      classifyObservationFreshness({
        ...providerRecord,
        observedAt: FUTURE_OBSERVED_AT,
        now: FRESH_NOW,
      }),
      'OBSERVATION_IN_FUTURE',
    )
  })

  it('withholds an unrecognized source state', () => {
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceState: 'healthy' }),
      'SOURCE_STATE_UNKNOWN',
    )
    assertWithheld(
      classifyObservationFreshness({ ...providerRecord, sourceState: 'PARTIAL' }),
      'SOURCE_STATE_UNKNOWN',
    )
  })

  it('withholds a malformed descriptor', () => {
    assertWithheld(classifyObservationFreshness(null), 'OBSERVATION_DESCRIPTOR_INVALID')
    assertWithheld(classifyObservationFreshness(undefined), 'OBSERVATION_DESCRIPTOR_INVALID')
    assertWithheld(
      classifyObservationFreshness([providerRecord] as unknown as ObservationFreshnessInput),
      'OBSERVATION_DESCRIPTOR_INVALID',
    )
    assertWithheld(
      classifyObservationFreshness('PROVIDER' as unknown as ObservationFreshnessInput),
      'OBSERVATION_DESCRIPTOR_INVALID',
    )
  })
})
