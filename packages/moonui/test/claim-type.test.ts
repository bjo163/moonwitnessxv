import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CLAIM_TYPES, evaluateClaimLabel } from '../dist/claim-type.js'

/**
 * Synthetic fixtures only. Nothing here is an observation, an ephemeris or a
 * calibration record; the strings exist to exercise the contract.
 */
const HOSTILE_SOURCE = 'https://secret.invalid/raw-source-NEVER-LEAK'
const STORY_SOURCE = '@story:era-03'
const UTC_TIME = '2026-10-29T00:00:00.000Z'

const physicalReading = {
  claimType: 'PHYSICAL_READING',
  sourceRef: 'instrument:weather-lab-01',
  sourceTrust: 'TRUSTED',
  instrumentRef: 'instrument_barometer_01',
  calibrationRef: 'calibration_2026_10',
  observedAt: UTC_TIME,
  presentedAs: 'MEASUREMENT',
}

const simulation = {
  claimType: 'SIMULATION',
  sourceRef: 'model:tidal-v0',
  sourceTrust: 'TRUSTED',
  modelRef: 'tidal_model_v0',
  modelInputRefs: ['fixture_input_001'],
  nonMeasurementNotice: 'SIMULATED — model output, not a measurement',
  presentedAs: 'SIMULATION',
}

const astronomy = {
  claimType: 'ASTRONOMY',
  sourceRef: 'algorithm:mean-synodic-v0',
  sourceTrust: 'TRUSTED',
  algorithmRef: 'mean_synodic_v0',
  algorithmInputRefs: ['fixture_epoch_2024'],
  uncertainty: '±0.5 day (synthetic fixture)',
  presentedAs: 'ASTRONOMY',
}

const story = {
  claimType: 'STORY',
  sourceRef: STORY_SOURCE,
  sourceTrust: 'TRUSTED',
  presentedAs: 'STORY',
}

/** A refusal must never carry the source text or any input string. */
const assertWithheld = (result, expectedType, expectedReason) => {
  assert.equal(result.readout, 'WITHHELD')
  assert.equal(result.claimType, expectedType)
  assert.equal(result.sourceRef, null)
  assert.equal(result.reason, expectedReason)
  assert.ok(!JSON.stringify(result).includes(HOSTILE_SOURCE))
  for (const value of Object.values(result)) assert.notEqual(value, HOSTILE_SOURCE)
}

describe('M25-02 claim type separation contract', () => {
  it('exports the four claim types in stable order', () => {
    assert.deepEqual([...CLAIM_TYPES], ['PHYSICAL_READING', 'SIMULATION', 'ASTRONOMY', 'STORY'])
  })

  it('allows a physical reading with instrument, calibration, UTC time and source', () => {
    const result = evaluateClaimLabel(physicalReading)
    assert.equal(result.readout, 'ALLOWED')
    assert.equal(result.claimType, 'PHYSICAL_READING')
    assert.equal(result.sourceRef, 'instrument:weather-lab-01')
    assert.equal(result.reason, null)
    assert.ok(Object.isFrozen(result))
  })

  it('allows a simulation with model, inputs and an explicit non-measurement notice', () => {
    const result = evaluateClaimLabel(simulation)
    assert.equal(result.readout, 'ALLOWED')
    assert.equal(result.claimType, 'SIMULATION')
    assert.equal(result.sourceRef, 'model:tidal-v0')
    assert.equal(result.reason, null)
  })

  it('allows astronomy with algorithm, inputs and uncertainty', () => {
    const result = evaluateClaimLabel(astronomy)
    assert.equal(result.readout, 'ALLOWED')
    assert.equal(result.claimType, 'ASTRONOMY')
    assert.equal(result.sourceRef, 'algorithm:mean-synodic-v0')
    assert.equal(result.reason, null)
  })

  it('allows a story with a story source', () => {
    const result = evaluateClaimLabel(story)
    assert.equal(result.readout, 'ALLOWED')
    assert.equal(result.claimType, 'STORY')
    assert.equal(result.sourceRef, STORY_SOURCE)
    assert.equal(result.reason, null)
  })

  it('withholds a readout with no claim type instead of inferring one', () => {
    assertWithheld(evaluateClaimLabel({ ...physicalReading, claimType: undefined }), null, 'CLAIM_TYPE_MISSING')
  })

  it('withholds an unknown claim type and echoes no type', () => {
    assertWithheld(
      evaluateClaimLabel({ ...physicalReading, claimType: 'OBSERVATION', sourceRef: HOSTILE_SOURCE }),
      null,
      'CLAIM_TYPE_UNKNOWN',
    )
  })

  it('withholds a simulation without a model or inputs', () => {
    assertWithheld(
      evaluateClaimLabel({ ...simulation, modelRef: undefined, sourceRef: HOSTILE_SOURCE }),
      'SIMULATION',
      'SIMULATION_REQUIRES_MODEL',
    )
  })

  it('withholds a simulation without an explicit non-measurement notice', () => {
    assertWithheld(
      evaluateClaimLabel({ ...simulation, nonMeasurementNotice: '  ', sourceRef: HOSTILE_SOURCE }),
      'SIMULATION',
      'SIMULATION_REQUIRES_NON_MEASUREMENT_LABEL',
    )
  })

  it('withholds astronomy without an algorithm or inputs', () => {
    assertWithheld(
      evaluateClaimLabel({ ...astronomy, algorithmRef: undefined, sourceRef: HOSTILE_SOURCE }),
      'ASTRONOMY',
      'ASTRONOMY_REQUIRES_ALGORITHM',
    )
  })

  it('withholds astronomy without stated uncertainty', () => {
    assertWithheld(
      evaluateClaimLabel({ ...astronomy, uncertainty: '', sourceRef: HOSTILE_SOURCE }),
      'ASTRONOMY',
      'ASTRONOMY_REQUIRES_UNCERTAINTY',
    )
  })

  it('withholds a physical reading without an instrument', () => {
    assertWithheld(
      evaluateClaimLabel({ ...physicalReading, instrumentRef: undefined, sourceRef: HOSTILE_SOURCE }),
      'PHYSICAL_READING',
      'PHYSICAL_READING_REQUIRES_INSTRUMENT',
    )
  })

  it('withholds a physical reading without calibration or a UTC timestamp', () => {
    assertWithheld(
      evaluateClaimLabel({ ...physicalReading, calibrationRef: null, sourceRef: HOSTILE_SOURCE }),
      'PHYSICAL_READING',
      'PHYSICAL_READING_REQUIRES_CALIBRATION',
    )
    assertWithheld(
      evaluateClaimLabel({ ...physicalReading, observedAt: '2026-10-29', sourceRef: HOSTILE_SOURCE }),
      'PHYSICAL_READING',
      'PHYSICAL_READING_REQUIRES_TIMESTAMP',
    )
  })

  it('refuses a story labelled as a measurement', () => {
    assertWithheld(
      evaluateClaimLabel({ ...story, sourceRef: HOSTILE_SOURCE, presentedAs: 'MEASUREMENT' }),
      'STORY',
      'STORY_PRESENTED_AS_MEASUREMENT',
    )
  })

  it('refuses a simulation or a physical reading presented in the wrong mode', () => {
    assertWithheld(
      evaluateClaimLabel({ ...simulation, sourceRef: HOSTILE_SOURCE, presentedAs: 'MEASUREMENT' }),
      'SIMULATION',
      'PRESENTATION_CLAIM_MISMATCH',
    )
    assertWithheld(
      evaluateClaimLabel({ ...physicalReading, sourceRef: HOSTILE_SOURCE, presentedAs: 'STORY' }),
      'PHYSICAL_READING',
      'PRESENTATION_CLAIM_MISMATCH',
    )
  })

  it('withholds an untrusted source', () => {
    assertWithheld(
      evaluateClaimLabel({ ...physicalReading, sourceRef: HOSTILE_SOURCE, sourceTrust: 'UNTRUSTED' }),
      'PHYSICAL_READING',
      'SOURCE_UNTRUSTED',
    )
  })

  it('withholds a readout with no source', () => {
    assertWithheld(
      evaluateClaimLabel({ ...story, sourceRef: '   ' }),
      'STORY',
      'SOURCE_MISSING',
    )
  })

  it('withholds an unrecognized presentation mode', () => {
    assertWithheld(
      evaluateClaimLabel({ ...story, sourceRef: HOSTILE_SOURCE, presentedAs: 'LIVE' }),
      'STORY',
      'PRESENTATION_UNKNOWN',
    )
  })
})
