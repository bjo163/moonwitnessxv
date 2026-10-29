import assert from 'node:assert/strict'
import test from 'node:test'
import { validateD10Observation, type D10ObservationContract } from './observation-contract.js'

const validObservation: D10ObservationContract = {
  observationId: 'obs-example-1',
  providerRef: 'provider-source-ref',
  providerRecordId: 'record-17',
  sourceEdition: null,
  observedAt: '2026-10-28T09:00:00Z',
  publishedAt: null,
  ingestedAt: '2026-10-28T09:05:00+00:00',
  revision: 'r1',
  observedValue: 12.5,
  valueType: 'QUANTITATIVE',
  unit: 'Cel',
  originalUnit: 'deg C',
  conversionRef: 'conversion-example-v1',
  location: {
    regionRef: 'region-example',
    geoPrecision: 'REGION',
  },
  uncertainty: null,
  rightsSnapshotRef: 'rights-decision-ref',
  epistemicClass: 'PROVIDER_OBSERVATION',
}

void test('accepts source-linked observation with separate timestamps and nullable publication/location', () => {
  assert.deepEqual(validateD10Observation(validObservation), { valid: true, errors: [] })
})

void test('rejects missing source, observation time and quantitative unit', () => {
  const result = validateD10Observation({
    ...validObservation,
    providerRef: ' ',
    observedAt: undefined,
    unit: null,
  })

  assert.equal(result.valid, false)
  assert.ok(result.errors.includes('providerRef is required'))
  assert.ok(result.errors.some((error) => error.startsWith('observedAt must be')))
  assert.ok(result.errors.includes('quantitative unit is required'))
})

void test('rejects a malformed publication timestamp instead of treating it as observation time', () => {
  const result = validateD10Observation({ ...validObservation, publishedAt: 'yesterday' })
  assert.equal(result.valid, false)
  assert.ok(result.errors.some((error) => error.startsWith('publishedAt must be')))
})

void test('rejects non-finite values, unzoned timestamps, and coordinates outside declared bounds', () => {
  const result = validateD10Observation({
    ...validObservation,
    observedAt: '2026-10-28T09:00:00',
    observedValue: Number.NaN,
    location: { latitude: 91, longitude: 181, geoPrecision: 'EXACT', crs: 'EPSG:4326' },
  })

  assert.equal(result.valid, false)
  assert.ok(result.errors.some((error) => error.startsWith('observedAt must be')))
  assert.ok(result.errors.includes('quantitative observedValue must be finite'))
  assert.ok(result.errors.includes('latitude must be between -90 and 90'))
  assert.ok(result.errors.includes('longitude must be between -180 and 180'))
})

void test('rejects coordinates without both axes and an explicit CRS', () => {
  const result = validateD10Observation({
    ...validObservation,
    location: { latitude: 1, geoPrecision: 'APPROXIMATE' },
  })

  assert.equal(result.valid, false)
  assert.ok(result.errors.includes('latitude and longitude must be supplied together'))
  assert.ok(result.errors.includes('coordinates require an explicit CRS'))
})
