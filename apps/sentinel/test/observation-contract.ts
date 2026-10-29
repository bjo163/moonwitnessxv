/**
 * Executable shape contract for future D10 provider observations.
 * This validator is intentionally not wired into collection or ingestion yet;
 * source rights, provider policy, and the M24-03 egress design remain gates.
 */
export type ObservationValue = number | string | boolean

export type GeoPrecision = 'EXACT' | 'APPROXIMATE' | 'ADMIN_AREA' | 'REGION' | 'UNKNOWN'

export type EpistemicClass = 'PROVIDER_OBSERVATION' | 'NEWS_OR_SOCIAL_SIGNAL' | 'SIMULATION' | 'XV_DERIVED'

export interface D10ObservationContract {
  observationId: string
  providerRef: string
  providerRecordId?: string | null
  sourceEdition?: string | null
  observedAt: string
  publishedAt?: string | null
  ingestedAt: string
  revision?: string | null
  supersedesObservationId?: string | null
  observedValue: ObservationValue
  valueType: 'QUANTITATIVE' | 'CATEGORICAL' | 'BOOLEAN'
  unit?: string | null
  originalUnit?: string | null
  conversionRef?: string | null
  location?: {
    latitude?: number
    longitude?: number
    regionRef?: string
    geoPrecision: GeoPrecision
    crs?: string
  } | null
  uncertainty?: string | null
  rightsSnapshotRef: string
  epistemicClass: EpistemicClass
}

export interface ObservationContractResult {
  valid: boolean
  errors: string[]
}

const RFC3339_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const GEO_PRECISIONS = new Set<GeoPrecision>(['EXACT', 'APPROXIMATE', 'ADMIN_AREA', 'REGION', 'UNKNOWN'])
const EPISTEMIC_CLASSES = new Set<EpistemicClass>([
  'PROVIDER_OBSERVATION',
  'NEWS_OR_SOCIAL_SIGNAL',
  'SIMULATION',
  'XV_DERIVED',
])

function isTimestamp(value: string): boolean {
  return RFC3339_WITH_ZONE.test(value) && Number.isFinite(Date.parse(value))
}

/** Structural validation only; it does not establish truth, rights, or review. */
export function validateD10Observation(input: unknown): ObservationContractResult {
  const errors: string[] = []
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { valid: false, errors: ['observation must be an object'] }
  }

  const record = input as Record<string, unknown>
  for (const field of ['observationId', 'providerRef', 'rightsSnapshotRef'] as const) {
    if (typeof record[field] !== 'string' || record[field].trim().length === 0) {
      errors.push(`${field} is required`)
    }
  }

  for (const field of ['observedAt', 'ingestedAt'] as const) {
    if (typeof record[field] !== 'string' || !isTimestamp(record[field])) {
      errors.push(`${field} must be RFC 3339 with an explicit timezone`)
    }
  }

  if (record.publishedAt !== undefined && record.publishedAt !== null &&
      (typeof record.publishedAt !== 'string' || !isTimestamp(record.publishedAt))) {
    errors.push('publishedAt must be null or RFC 3339 with an explicit timezone')
  }

  const valueType = record.valueType
  const value = record.observedValue
  if (!['QUANTITATIVE', 'CATEGORICAL', 'BOOLEAN'].includes(String(valueType))) {
    errors.push('valueType must be QUANTITATIVE, CATEGORICAL, or BOOLEAN')
  }
  if (valueType === 'QUANTITATIVE') {
    if (typeof value !== 'number' || !Number.isFinite(value)) errors.push('quantitative observedValue must be finite')
    if (typeof record.unit !== 'string' || record.unit.trim().length === 0) errors.push('quantitative unit is required')
  } else if (valueType === 'CATEGORICAL') {
    if (typeof value !== 'string' || value.trim().length === 0) errors.push('categorical observedValue is required')
  } else if (valueType === 'BOOLEAN' && typeof value !== 'boolean') {
    errors.push('boolean observedValue is required')
  }

  if (!EPISTEMIC_CLASSES.has(record.epistemicClass as EpistemicClass)) {
    errors.push('epistemicClass is invalid')
  }

  const location = record.location
  if (location !== undefined && location !== null) {
    if (typeof location !== 'object' || Array.isArray(location)) {
      errors.push('location must be an object or null')
    } else {
      const point = location as Record<string, unknown>
      if (!GEO_PRECISIONS.has(point.geoPrecision as GeoPrecision)) errors.push('location.geoPrecision is invalid')
      const hasLatitude = point.latitude !== undefined
      const hasLongitude = point.longitude !== undefined
      if (hasLatitude !== hasLongitude) errors.push('latitude and longitude must be supplied together')
      if (hasLatitude && (typeof point.latitude !== 'number' || !Number.isFinite(point.latitude) || point.latitude < -90 || point.latitude > 90)) {
        errors.push('latitude must be between -90 and 90')
      }
      if (hasLongitude && (typeof point.longitude !== 'number' || !Number.isFinite(point.longitude) || point.longitude < -180 || point.longitude > 180)) {
        errors.push('longitude must be between -180 and 180')
      }
      if (hasLatitude && (typeof point.crs !== 'string' || point.crs.trim().length === 0)) {
        errors.push('coordinates require an explicit CRS')
      }
    }
  }

  if (record.revision !== undefined && record.revision !== null && typeof record.revision !== 'string') {
    errors.push('revision must be a string or null')
  }
  if (record.supersedesObservationId !== undefined && record.supersedesObservationId !== null &&
      typeof record.supersedesObservationId !== 'string') {
    errors.push('supersedesObservationId must be a string or null')
  }

  return { valid: errors.length === 0, errors }
}
