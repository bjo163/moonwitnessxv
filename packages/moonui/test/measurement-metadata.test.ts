import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  MEASUREMENT_REASONS,
  MEASUREMENT_UNITS,
  evaluateMeasurementMetadata,
  formatMeasurementLabel,
  normalizeUnit,
} from '../dist/measurement-metadata.js'

/**
 * Synthetic fixtures only. Nothing here is an observation, an ephemeris, a
 * calibration record or a real instrument; the strings exist to exercise the
 * contract. Timestamps are caller-supplied constants; no clock is read.
 */
const HOSTILE_SOURCE = 'https://secret.invalid/raw-source-NEVER-LEAK'
const HOSTILE_UNIT = 'furlong-per-fortnight'
const UTC_TIME = '2026-10-29T00:00:00.000Z'
const LOCAL_TIME = '2026-10-29T07:00:00.000+07:00'
const RAW_VALUE = 98765.4321

const physical = {
  claimType: 'PHYSICAL_READING',
  value: 21.4,
  unit: '°C',
  instrument: 'instrument_thermometer_01',
  calibrationRef: 'calibration_2026_10_fixture',
  observedAtUtc: UTC_TIME,
  source: 'instrument:weather-lab-01',
  sourceTrust: 'TRUSTED',
  uncertainty: '±0.2 °C (synthetic fixture)',
}

const astronomy = {
  claimType: 'ASTRONOMY',
  value: 2551392,
  unit: 's',
  observedAtUtc: UTC_TIME,
  source: 'algorithm:mean-synodic-v0',
  sourceTrust: 'TRUSTED',
  algorithmRef: 'mean_synodic_v0',
  algorithmInputRefs: ['fixture_epoch_2024'],
  uncertainty: '±43200 s (synthetic fixture)',
}

const LEAK_NEEDLES = [HOSTILE_SOURCE, HOSTILE_UNIT, LOCAL_TIME, String(RAW_VALUE)]

/** A refusal must carry the exact code, null normalized metadata and no input text. */
const assertRefused = (result, expected, needles = LEAK_NEEDLES) => {
  assert.equal(result.accepted, false)
  assert.equal(result.reason, expected)
  assert.equal(result.normalized, null)
  assert.ok(Object.isFrozen(result))
  const serialized = JSON.stringify(result)
  for (const needle of needles) {
    assert.ok(!serialized.includes(needle), `refusal leaked ${needle}`)
  }
}

describe('M25-04 unit normalization', () => {
  it('normalizes canonical symbols and spelled-out names without inventing a scale', () => {
    const cases = [
      ['celsius', 'CELSIUS', '°C'],
      ['°C', 'CELSIUS', '°C'],
      ['C', 'CELSIUS', '°C'],
      ['kelvin', 'KELVIN', 'K'],
      ['K', 'KELVIN', 'K'],
      ['percent', 'PERCENT', '%'],
      ['%', 'PERCENT', '%'],
      ['millimetre', 'MILLIMETRE', 'mm'],
      ['mm', 'MILLIMETRE', 'mm'],
      ['metre', 'METRE', 'm'],
      ['m', 'METRE', 'm'],
      ['second', 'SECOND', 's'],
      ['s', 'SECOND', 's'],
      ['hertz', 'HERTZ', 'Hz'],
      ['Hz', 'HERTZ', 'Hz'],
      ['magnitude', 'MAGNITUDE', 'mag'],
      ['mag', 'MAGNITUDE', 'mag'],
    ]
    for (const [input, expectedCode, expectedSymbol] of cases) {
      const result = normalizeUnit(input)
      assert.equal(result.reason, null)
      assert.ok(result.unit !== null)
      assert.equal(result.unit.code, expectedCode)
      assert.equal(result.unit.symbol, expectedSymbol)
      assert.ok(Object.isFrozen(result))
      assert.ok(Object.isFrozen(result.unit))
    }
  })

  it('trims surrounding whitespace and ships both id and en unit labels', () => {
    const result = normalizeUnit('  Celsius  ')
    assert.equal(result.reason, null)
    assert.ok(result.unit !== null)
    assert.equal(result.unit.code, 'CELSIUS')
    assert.equal(result.unit.labelEn, 'degree Celsius')
    assert.equal(result.unit.labelId, 'derajat Celsius')
    assert.equal(result.unit.quantity, 'TEMPERATURE')

    const hertz = normalizeUnit('HERTZ')
    assert.ok(hertz.unit !== null)
    assert.equal(hertz.unit.code, 'HERTZ')
    assert.equal(hertz.unit.labelId, 'hertz')
  })

  it('refuses empty units with UNIT_EMPTY', () => {
    for (const input of [undefined, null, '', '   ']) {
      const result = normalizeUnit(input)
      assert.equal(result.unit, null)
      assert.equal(result.reason, 'UNIT_EMPTY')
    }
  })

  it('refuses unknown and ambiguous units instead of guessing', () => {
    const ambiguousOrUnknown = [
      '°F',
      'fahrenheit',
      'M',
      'MM',
      'kHz',
      'MHz',
      'k',
      'c',
      'S',
      'hz',
      'HZ',
      'm/s',
      'degC',
      'derajat Celsius',
      HOSTILE_UNIT,
      42,
      {},
    ]
    for (const input of ambiguousOrUnknown) {
      const result = normalizeUnit(input)
      assert.equal(result.unit, null)
      assert.equal(result.reason, 'UNIT_UNKNOWN')
      assert.ok(!JSON.stringify(result).includes(HOSTILE_UNIT))
    }
  })

  it('exports a stable eight-unit vocabulary', () => {
    assert.deepEqual(
      [...MEASUREMENT_UNITS],
      ['CELSIUS', 'KELVIN', 'PERCENT', 'MILLIMETRE', 'METRE', 'SECOND', 'HERTZ', 'MAGNITUDE'],
    )
  })
})

describe('M25-04 measurement and calibration acceptance', () => {
  it('accepts a calibrated Celsius reading with UTC time, source and uncertainty', () => {
    const result = evaluateMeasurementMetadata(physical)
    assert.equal(result.accepted, true)
    assert.equal(result.reason, null)
    assert.ok(Object.isFrozen(result))
    assert.ok(result.normalized !== null)
    assert.ok(Object.isFrozen(result.normalized))
    assert.equal(result.normalized.claimType, 'PHYSICAL_READING')
    assert.equal(result.normalized.value, 21.4)
    assert.equal(result.normalized.unit.code, 'CELSIUS')
    assert.equal(result.normalized.unit.symbol, '°C')
    assert.equal(result.normalized.instrumentRef, 'instrument_thermometer_01')
    assert.equal(result.normalized.calibrationRef, 'calibration_2026_10_fixture')
    assert.equal(result.normalized.observedAtUtc, UTC_TIME)
    assert.equal(result.normalized.sourceRef, 'instrument:weather-lab-01')
    assert.equal(result.normalized.uncertaintyRef, '±0.2 °C (synthetic fixture)')
    assert.equal(result.normalized.sensorMeasurement, true)
  })

  it('accepts kelvin, percent, millimetre, metre, second, hertz and magnitude readings', () => {
    const cases = [
      ['K', 'KELVIN', 'K'],
      ['%', 'PERCENT', '%'],
      ['mm', 'MILLIMETRE', 'mm'],
      ['m', 'METRE', 'm'],
      ['s', 'SECOND', 's'],
      ['Hz', 'HERTZ', 'Hz'],
      ['mag', 'MAGNITUDE', 'mag'],
    ]
    for (const [unit, expectedCode, expectedSymbol] of cases) {
      const result = evaluateMeasurementMetadata({ ...physical, unit, value: 12.5 })
      assert.equal(result.accepted, true, `unit ${unit} should be accepted`)
      assert.ok(result.normalized !== null)
      assert.equal(result.normalized.unit.code, expectedCode)
      assert.equal(result.normalized.unit.symbol, expectedSymbol)
      assert.equal(result.normalized.sensorMeasurement, true)
    }
  })

  it('accepts an astronomy computed reference only with algorithm inputs and uncertainty', () => {
    const result = evaluateMeasurementMetadata(astronomy)
    assert.equal(result.accepted, true)
    assert.equal(result.reason, null)
    assert.ok(result.normalized !== null)
    assert.equal(result.normalized.claimType, 'ASTRONOMY')
    assert.equal(result.normalized.algorithmRef, 'mean_synodic_v0')
    assert.deepEqual(result.normalized.algorithmInputRefs, ['fixture_epoch_2024'])
    assert.equal(result.normalized.instrumentRef, null)
    assert.equal(result.normalized.calibrationRef, null)
    assert.equal(result.normalized.sensorMeasurement, false)
  })

  it('keeps the raw unit string out of the normalized record', () => {
    const result = evaluateMeasurementMetadata({ ...physical, unit: '  °C  ' })
    assert.equal(result.accepted, true)
    assert.ok(result.normalized !== null)
    assert.deepEqual(Object.keys(result.normalized.unit).sort(), [
      'code',
      'labelEn',
      'labelId',
      'quantity',
      'symbol',
    ])
  })

  it('does not infer a reading from a value and a unit alone', () => {
    const result = evaluateMeasurementMetadata({ value: 21.4, unit: '°C', source: HOSTILE_SOURCE })
    assertRefused(result, 'CLAIM_TYPE_MISSING')
  })
})

describe('M25-04 refusals are fail closed', () => {
  it('refuses a simulation even when full calibration metadata is supplied', () => {
    const result = evaluateMeasurementMetadata({ ...physical, claimType: 'SIMULATION', source: HOSTILE_SOURCE })
    assertRefused(result, 'SIMULATED_VALUE_NOT_SENSOR_DATA')
    assert.ok(!JSON.stringify(result).includes('21.4'))
  })

  it('refuses a story readout as non-physical', () => {
    const result = evaluateMeasurementMetadata({ ...physical, claimType: 'STORY', source: HOSTILE_SOURCE })
    assertRefused(result, 'CLAIM_TYPE_NOT_PHYSICAL')
  })

  it('refuses an unknown or missing claim type without inferring one', () => {
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, claimType: 'OBSERVATION', source: HOSTILE_SOURCE }),
      'CLAIM_TYPE_UNKNOWN',
    )
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, claimType: undefined, source: HOSTILE_SOURCE }),
      'CLAIM_TYPE_MISSING',
    )
  })

  it('refuses an empty or unknown unit', () => {
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, unit: '  ', source: HOSTILE_SOURCE }),
      'UNIT_EMPTY',
    )
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, unit: HOSTILE_UNIT, source: HOSTILE_SOURCE }),
      'UNIT_UNKNOWN',
    )
  })

  it('refuses a non-finite or non-numeric value', () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '21.4', null]) {
      assertRefused(
        evaluateMeasurementMetadata({ ...physical, value, source: HOSTILE_SOURCE }),
        'VALUE_NOT_FINITE',
        [HOSTILE_SOURCE],
      )
    }
  })

  it('refuses a missing source and an untrusted source', () => {
    assertRefused(evaluateMeasurementMetadata({ ...physical, source: '   ' }), 'SOURCE_MISSING', [
      LOCAL_TIME,
      String(RAW_VALUE),
    ])
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, source: HOSTILE_SOURCE, sourceTrust: 'UNTRUSTED' }),
      'SOURCE_UNTRUSTED',
    )
  })

  it('refuses a physical reading without an instrument or calibration reference', () => {
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, instrument: '', source: HOSTILE_SOURCE }),
      'INSTRUMENT_MISSING',
    )
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, calibrationRef: '  ', source: HOSTILE_SOURCE }),
      'CALIBRATION_MISSING',
    )
  })

  it('refuses a missing, local or date-only observation timestamp', () => {
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, observedAtUtc: undefined, source: HOSTILE_SOURCE }),
      'TIMESTAMP_MISSING',
    )
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, observedAtUtc: '', source: HOSTILE_SOURCE }),
      'TIMESTAMP_MISSING',
    )
    for (const observedAtUtc of [LOCAL_TIME, '2026-10-29', '2026-10-29T00:00:00Z+07:00']) {
      assertRefused(
        evaluateMeasurementMetadata({ ...physical, observedAtUtc, source: HOSTILE_SOURCE }),
        'TIMESTAMP_NOT_UTC',
      )
    }
  })

  it('refuses a reading without stated uncertainty', () => {
    assertRefused(
      evaluateMeasurementMetadata({ ...physical, uncertainty: '   ', source: HOSTILE_SOURCE }),
      'UNCERTAINTY_MISSING',
    )
  })

  it('refuses astronomy without an algorithm reference or declared inputs', () => {
    assertRefused(
      evaluateMeasurementMetadata({ ...astronomy, algorithmRef: undefined, source: HOSTILE_SOURCE }),
      'ASTRONOMY_ALGORITHM_MISSING',
    )
    assertRefused(
      evaluateMeasurementMetadata({ ...astronomy, algorithmInputRefs: [], source: HOSTILE_SOURCE }),
      'ASTRONOMY_ALGORITHM_MISSING',
    )
  })

  it('refuses a malformed descriptor', () => {
    for (const input of [null, undefined, 'PHYSICAL_READING', 42, []]) {
      assertRefused(evaluateMeasurementMetadata(input), 'MEASUREMENT_DESCRIPTOR_INVALID', [])
    }
  })

  it('exports the required stable reason codes', () => {
    const required = [
      'CLAIM_TYPE_NOT_PHYSICAL',
      'UNIT_UNKNOWN',
      'UNIT_EMPTY',
      'CALIBRATION_MISSING',
      'TIMESTAMP_NOT_UTC',
      'TIMESTAMP_MISSING',
      'SOURCE_MISSING',
      'SOURCE_UNTRUSTED',
      'UNCERTAINTY_MISSING',
      'VALUE_NOT_FINITE',
      'SIMULATED_VALUE_NOT_SENSOR_DATA',
    ]
    for (const code of required) assert.ok(MEASUREMENT_REASONS.includes(code), code)
  })
})

describe('M25-04 rendered label', () => {
  it('renders claim type, source and unit for an accepted physical reading', () => {
    const evaluation = evaluateMeasurementMetadata(physical)
    const label = formatMeasurementLabel(evaluation)
    assert.equal(label.readout, 'RENDERED')
    assert.equal(label.reason, null)
    assert.equal(label.locale, 'en')
    assert.equal(label.localeFallback, false)
    assert.equal(label.claimType, 'PHYSICAL_READING')
    assert.equal(label.claimLabel, 'Physical reading — instrument measurement')
    assert.equal(label.sourceRef, 'instrument:weather-lab-01')
    assert.equal(label.unitSymbol, '°C')
    assert.ok(label.text !== null)
    assert.ok(label.text.includes('PHYSICAL_READING'))
    assert.ok(label.text.includes('Physical reading — instrument measurement'))
    assert.ok(label.text.includes('21.4 °C'))
    assert.ok(label.text.includes('source instrument:weather-lab-01'))
    assert.ok(Object.isFrozen(label))
  })

  it('renders id copy and falls back to en for an unsupported locale', () => {
    const evaluation = evaluateMeasurementMetadata(physical)
    const indonesian = formatMeasurementLabel(evaluation, 'id')
    assert.equal(indonesian.locale, 'id')
    assert.equal(indonesian.localeFallback, false)
    assert.ok(indonesian.text !== null)
    assert.ok(indonesian.text.includes('Pembacaan fisik — pengukuran instrumen'))
    assert.ok(indonesian.text.includes('sumber instrument:weather-lab-01'))
    assert.ok(indonesian.text.includes('°C'))

    const fallback = formatMeasurementLabel(evaluation, 'fr')
    assert.equal(fallback.locale, 'en')
    assert.equal(fallback.localeFallback, true)
    assert.ok(fallback.text !== null)
    assert.ok(fallback.text.includes('Physical reading — instrument measurement'))
  })

  it('renders an astronomy reference as computed, never as a sensor reading', () => {
    const label = formatMeasurementLabel(evaluateMeasurementMetadata(astronomy))
    assert.equal(label.readout, 'RENDERED')
    assert.equal(label.claimType, 'ASTRONOMY')
    assert.equal(label.claimLabel, 'Astronomy — computed reference, not an instrument reading')
    assert.ok(label.text !== null)
    assert.ok(label.text.includes('ASTRONOMY'))
    assert.ok(label.text.includes('not an instrument reading'))
    assert.ok(label.text.includes('2551392 s'))
    assert.ok(label.text.includes('source algorithm:mean-synodic-v0'))
  })

  it('withholds a simulated value instead of rendering it as sensor data', () => {
    const evaluation = evaluateMeasurementMetadata({
      ...physical,
      claimType: 'SIMULATION',
      value: RAW_VALUE,
      source: HOSTILE_SOURCE,
      unit: HOSTILE_UNIT,
      observedAtUtc: LOCAL_TIME,
    })
    const label = formatMeasurementLabel(evaluation)
    assert.equal(label.readout, 'WITHHELD')
    assert.equal(label.reason, 'SIMULATED_VALUE_NOT_SENSOR_DATA')
    assert.equal(label.text, null)
    assert.equal(label.claimType, null)
    assert.equal(label.claimLabel, null)
    assert.equal(label.sourceRef, null)
    assert.equal(label.unitSymbol, null)
    assert.ok(Object.isFrozen(label))
    const serialized = JSON.stringify(label)
    for (const needle of ['21.4', '°C', HOSTILE_SOURCE, HOSTILE_UNIT, LOCAL_TIME, String(RAW_VALUE)]) {
      assert.ok(!serialized.includes(needle), `withheld label leaked ${needle}`)
    }
  })

  it('withholds a malformed, forged or unknown evaluation without echoing anything', () => {
    const forged = {
      accepted: true,
      reason: null,
      normalized: {
        claimType: 'PHYSICAL_READING',
        value: 21.4,
        unit: { code: 'CELSIUS', symbol: 'HOSTILE-SYMBOL' },
        sourceRef: HOSTILE_SOURCE,
        instrumentRef: '',
        calibrationRef: 'calibration_fixture',
        observedAtUtc: LOCAL_TIME,
        uncertaintyRef: '±0.2 °C',
      },
    }
    const label = formatMeasurementLabel(forged)
    assert.equal(label.readout, 'WITHHELD')
    assert.equal(label.reason, 'INSTRUMENT_MISSING')
    assert.equal(label.text, null)
    assert.equal(label.sourceRef, null)
    const serialized = JSON.stringify(label)
    for (const needle of [HOSTILE_SOURCE, 'HOSTILE-SYMBOL', '21.4', LOCAL_TIME]) {
      assert.ok(!serialized.includes(needle), `forged label leaked ${needle}`)
    }

    const unknownReason = formatMeasurementLabel({ accepted: false, reason: 'NOT_A_CODE', normalized: null })
    assert.equal(unknownReason.readout, 'WITHHELD')
    assert.equal(unknownReason.reason, 'MEASUREMENT_DESCRIPTOR_INVALID')

    const invalid = formatMeasurementLabel(null)
    assert.equal(invalid.readout, 'WITHHELD')
    assert.equal(invalid.reason, 'MEASUREMENT_DESCRIPTOR_INVALID')
  })

  it('withholds a forged evaluation whose claim type or value is not renderable', () => {
    const forged = {
      accepted: true,
      reason: null,
      normalized: {
        claimType: 'SIMULATION',
        value: 1,
        unit: { code: 'CELSIUS' },
        sourceRef: HOSTILE_SOURCE,
        uncertaintyRef: 'fixture',
      },
    }
    const label = formatMeasurementLabel(forged, 'id')
    assert.equal(label.readout, 'WITHHELD')
    assert.equal(label.reason, 'CLAIM_TYPE_NOT_PHYSICAL')
    assert.equal(label.text, null)
    assert.ok(!JSON.stringify(label).includes(HOSTILE_SOURCE))

    const nonFinite = formatMeasurementLabel({
      accepted: true,
      reason: null,
      normalized: {
        claimType: 'PHYSICAL_READING',
        value: '21.4',
        unit: { code: 'CELSIUS' },
        sourceRef: HOSTILE_SOURCE,
        instrumentRef: 'instrument_fixture',
        calibrationRef: 'calibration_fixture',
        observedAtUtc: UTC_TIME,
        uncertaintyRef: 'fixture',
      },
    })
    assert.equal(nonFinite.reason, 'VALUE_NOT_FINITE')
    assert.equal(nonFinite.text, null)
    assert.ok(!JSON.stringify(nonFinite).includes('21.4'))
    assert.ok(!JSON.stringify(nonFinite).includes(HOSTILE_SOURCE))
  })
})
