/**
 * M24-07 — Degraded-feed acceptance contract.
 *
 * Pure, zero-import model that decides how a feed surface may present a value
 * when the provider is invalid, late, offline or geographically ambiguous.
 * It closes three M24-05 findings at the contract level:
 *   (a) a missing publish time is never replaced by the fetch instant;
 *   (b) the fetch instant is carried separately and is never an observation time;
 *   (c) every degraded outcome exposes a source state and uncertainty codes.
 *
 * No ambient clock, environment, network, locale or store is read. The only
 * time input is the caller-supplied `evaluatedAtUtc`. Results are frozen and
 * echo no input text, so a label cannot become a payload leak. This is a
 * contract only: ingest and UI wiring remain outside this task.
 */

export type FeedSourceState = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNKNOWN'
export type FeedDisplay = 'LIVE' | 'DEGRADED' | 'STALE' | 'OFFLINE' | 'WITHHELD'
export type GeoPrecision = 'EXACT' | 'CITY' | 'REGION' | 'COUNTRY' | 'UNKNOWN'

export type FeedReasonCode =
  | 'INPUT_INVALID'
  | 'EVALUATED_AT_MISSING'
  | 'EVALUATED_AT_INVALID'
  | 'TTL_MISSING'
  | 'TTL_INVALID'
  | 'FEED_OFFLINE'
  | 'FEED_UNKNOWN_STATE'
  | 'FEED_STALE'
  | 'FEED_DEGRADED'
  | 'PUBLISH_TIME_MISSING_NO_CLOCK_SUBSTITUTION'
  | 'PUBLISH_TIME_INVALID'
  | 'PUBLISH_TIME_IN_FUTURE'
  | 'FETCH_TIME_IS_NOT_OBSERVATION_TIME'
  | 'FETCH_TIME_MISSING'
  | 'FETCH_TIME_INVALID'
  | 'TIMEZONE_MISSING'
  | 'TIMEZONE_INVALID'
  | 'GEO_PRECISION_UNKNOWN'
  | 'GEO_PRECISION_TOO_COARSE'
  | 'VALUE_MISSING'

export interface FeedOutcomeInput {
  sourceState: FeedSourceState
  fetchedAtUtc: string | null
  publishedAt: string | null
  timezone: string | null
  geoPrecision: GeoPrecision | null
  observedValue: number | null
}

/** The caller must supply both values; there is no clock or default TTL. */
export interface FeedEvaluationContext {
  evaluatedAtUtc: string
  ttlSeconds: number
}

export interface FeedUncertainty {
  readonly codes: readonly FeedReasonCode[]
  readonly fetchedAtUtc: string | null
  /** Only a validated, non-substituted source publication instant, normalized to UTC Z. */
  readonly observedAtUtc: string | null
  readonly observedAgeSeconds: number | null
  readonly ttlSeconds: number | null
  readonly timezoneRecognized: boolean
  readonly geoPrecision: GeoPrecision
  readonly geoIsExact: boolean
  readonly valuePresent: boolean
  /** Invariant: the fetch instant is never promoted to an observation time. */
  readonly fetchedAtIsObservationTime: false
}

export interface FeedOutcome {
  readonly display: FeedDisplay
  readonly reason: FeedReasonCode | null
  readonly sourceState: FeedSourceState
  readonly uncertainty: FeedUncertainty
}

interface Assessment {
  display: FeedDisplay
  reason: FeedReasonCode | null
  codes: FeedReasonCode[]
  sourceState: FeedSourceState
  evaluatedMs: number | null
  fetchedAtMs: number | null
  fetchedAtUtc: string | null
  observedAtMs: number | null
  observedAtUtc: string | null
  ttlSeconds: number | null
  timezoneRecognized: boolean
  geoPrecision: GeoPrecision
  valuePresent: boolean
}

const SOURCE_STATES = new Set<FeedSourceState>(['ONLINE', 'OFFLINE', 'DEGRADED', 'UNKNOWN'])
const GEO_PRECISIONS = new Set<GeoPrecision>(['EXACT', 'CITY', 'REGION', 'COUNTRY', 'UNKNOWN'])

const RFC3339_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const UTC_ISO_Z = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/
/**
 * IANA identifiers start with a letter. The shape check is required because
 * some engines also accept numeric offsets such as `+07:00` as a time zone;
 * this contract rejects them along with abbreviations such as `WIB`.
 */
const IANA_SHAPE = /^[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+)*$/

/** Deterministic disclosure order, used so equal inputs always serialize equally. */
const CODE_PRIORITY: readonly FeedReasonCode[] = [
  'INPUT_INVALID',
  'EVALUATED_AT_MISSING',
  'EVALUATED_AT_INVALID',
  'TTL_MISSING',
  'TTL_INVALID',
  'FEED_UNKNOWN_STATE',
  'FEED_OFFLINE',
  'PUBLISH_TIME_INVALID',
  'PUBLISH_TIME_IN_FUTURE',
  'PUBLISH_TIME_MISSING_NO_CLOCK_SUBSTITUTION',
  'FETCH_TIME_IS_NOT_OBSERVATION_TIME',
  'FETCH_TIME_MISSING',
  'FETCH_TIME_INVALID',
  'FEED_STALE',
  'FEED_DEGRADED',
  'TIMEZONE_MISSING',
  'TIMEZONE_INVALID',
  'GEO_PRECISION_UNKNOWN',
  'GEO_PRECISION_TOO_COARSE',
  'VALUE_MISSING',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Parses an instant without reading the clock; returns null when invalid. */
function parseInstant(value: unknown, utcOnly: boolean): number | null {
  if (typeof value !== 'string') return null
  if (!(utcOnly ? UTC_ISO_Z : RFC3339_WITH_ZONE).test(value)) return null
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

/** Recognized IANA name only: rejects offsets, abbreviations, blanks and junk. */
function isRecognizedTimeZone(value: unknown): boolean {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim()) return false
  if (!IANA_SHAPE.test(value)) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).resolvedOptions()
    return true
  } catch {
    return false
  }
}

function normalizeGeo(value: unknown): GeoPrecision {
  return typeof value === 'string' && GEO_PRECISIONS.has(value as GeoPrecision)
    ? (value as GeoPrecision)
    : 'UNKNOWN'
}

function readTtl(context: unknown): { ttlSeconds: number | null; code: FeedReasonCode | null } {
  const record: Record<string, unknown> = isRecord(context) ? context : {}
  const raw = record.ttlSeconds
  if (raw === undefined || raw === null) return { ttlSeconds: null, code: 'TTL_MISSING' }
  if (!isFiniteNumber(raw) || raw <= 0) return { ttlSeconds: null, code: 'TTL_INVALID' }
  return { ttlSeconds: raw, code: null }
}

function orderedCodes(codes: readonly FeedReasonCode[]): FeedReasonCode[] {
  return CODE_PRIORITY.filter((code) => codes.includes(code))
}

function assessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    display: 'WITHHELD',
    reason: null,
    codes: [],
    sourceState: 'UNKNOWN',
    evaluatedMs: null,
    fetchedAtMs: null,
    fetchedAtUtc: null,
    observedAtMs: null,
    observedAtUtc: null,
    ttlSeconds: null,
    timezoneRecognized: false,
    geoPrecision: 'UNKNOWN',
    valuePresent: false,
    ...overrides,
  }
}

function buildResult(state: Assessment): FeedOutcome {
  const observedAgeSeconds =
    state.observedAtMs === null || state.evaluatedMs === null
      ? null
      : (state.evaluatedMs - state.observedAtMs) / 1000
  const uncertainty: FeedUncertainty = Object.freeze({
    codes: Object.freeze(orderedCodes(state.codes)),
    fetchedAtUtc: state.fetchedAtUtc,
    observedAtUtc: state.observedAtUtc,
    observedAgeSeconds,
    ttlSeconds: state.ttlSeconds,
    timezoneRecognized: state.timezoneRecognized,
    geoPrecision: state.geoPrecision,
    geoIsExact: state.geoPrecision === 'EXACT',
    valuePresent: state.valuePresent,
    fetchedAtIsObservationTime: false as const,
  })
  return Object.freeze({
    display: state.display,
    reason: state.reason,
    sourceState: state.sourceState,
    uncertainty,
  })
}

/**
 * Evaluates one feed snapshot. `evaluatedAtUtc` and `ttlSeconds` are mandatory;
 * omitting them withholds the result instead of consulting an ambient clock.
 */
export function evaluateFeedOutcome(
  input: FeedOutcomeInput,
  context: FeedEvaluationContext,
): FeedOutcome {
  if (!isRecord(input)) {
    return buildResult(assessment({ reason: 'INPUT_INVALID', codes: ['INPUT_INVALID'] }))
  }

  const record = input as unknown as Record<string, unknown>
  const contextRecord: Record<string, unknown> = isRecord(context) ? context : {}
  const rawState = record.sourceState
  const sourceState: FeedSourceState =
    typeof rawState === 'string' && SOURCE_STATES.has(rawState as FeedSourceState)
      ? (rawState as FeedSourceState)
      : 'UNKNOWN'
  const base = assessment({
    sourceState,
    geoPrecision: normalizeGeo(record.geoPrecision),
    valuePresent: isFiniteNumber(record.observedValue),
    timezoneRecognized: isRecognizedTimeZone(record.timezone),
  })

  const rawEvaluated = contextRecord.evaluatedAtUtc
  const evaluatedMs = parseInstant(rawEvaluated, true)
  if (evaluatedMs === null) {
    const code: FeedReasonCode =
      rawEvaluated === undefined || rawEvaluated === null
        ? 'EVALUATED_AT_MISSING'
        : 'EVALUATED_AT_INVALID'
    return buildResult({ ...base, reason: code, codes: [code] })
  }

  const ttl = readTtl(context)
  if (ttl.code !== null) {
    return buildResult({ ...base, evaluatedMs, ttlSeconds: ttl.ttlSeconds, reason: ttl.code, codes: [ttl.code] })
  }

  if (sourceState === 'UNKNOWN') {
    return buildResult({ ...base, evaluatedMs, ttlSeconds: ttl.ttlSeconds, reason: 'FEED_UNKNOWN_STATE', codes: ['FEED_UNKNOWN_STATE'] })
  }

  if (sourceState === 'OFFLINE') {
    return buildResult({ ...base, evaluatedMs, ttlSeconds: ttl.ttlSeconds, sourceState: 'OFFLINE', display: 'OFFLINE', reason: 'FEED_OFFLINE', codes: ['FEED_OFFLINE'] })
  }

  const rawFetched = record.fetchedAtUtc
  const fetchedMs = parseInstant(rawFetched, true)
  if (fetchedMs === null) {
    const code: FeedReasonCode =
      rawFetched === undefined || rawFetched === null || rawFetched === ''
        ? 'FETCH_TIME_MISSING'
        : 'FETCH_TIME_INVALID'
    return buildResult({ ...base, evaluatedMs, ttlSeconds: ttl.ttlSeconds, reason: code, codes: [code] })
  }
  const fetchedAtUtc = new Date(fetchedMs).toISOString()

  const rawPublished = record.publishedAt
  const codes: FeedReasonCode[] = []
  let observedMs: number | null = null
  let withheld: FeedReasonCode | null = null

  if (rawPublished === undefined || rawPublished === null) {
    // Never default to fetchedAt: the observation instant stays unknown.
    codes.push('PUBLISH_TIME_MISSING_NO_CLOCK_SUBSTITUTION')
  } else {
    const publishedMs = parseInstant(rawPublished, false)
    if (publishedMs === null) {
      withheld = 'PUBLISH_TIME_INVALID'
    } else if (publishedMs > evaluatedMs) {
      withheld = 'PUBLISH_TIME_IN_FUTURE'
    } else if (publishedMs === fetchedMs) {
      // The two instants are identical, so substitution cannot be ruled out.
      codes.push('FETCH_TIME_IS_NOT_OBSERVATION_TIME')
    } else {
      observedMs = publishedMs
    }
  }

  const rawTimezone = record.timezone
  if (rawTimezone === undefined || rawTimezone === null) {
    codes.push('TIMEZONE_MISSING')
  } else if (!isRecognizedTimeZone(rawTimezone)) {
    codes.push('TIMEZONE_INVALID')
  }

  if (base.geoPrecision === 'UNKNOWN') {
    codes.push('GEO_PRECISION_UNKNOWN')
  } else if (base.geoPrecision === 'REGION' || base.geoPrecision === 'COUNTRY') {
    codes.push('GEO_PRECISION_TOO_COARSE')
  }

  if (!base.valuePresent) codes.push('VALUE_MISSING')

  const observedAtUtc = observedMs === null ? null : new Date(observedMs).toISOString()
  const ageMs = observedMs === null ? null : evaluatedMs - observedMs
  const stale = ageMs !== null && ttl.ttlSeconds !== null && ageMs > ttl.ttlSeconds * 1000
  const state: Assessment = {
    ...base,
    evaluatedMs,
    ttlSeconds: ttl.ttlSeconds,
    fetchedAtMs: fetchedMs,
    fetchedAtUtc,
    observedAtMs: observedMs,
    observedAtUtc,
  }

  if (withheld !== null) {
    return buildResult({ ...state, display: 'WITHHELD', reason: withheld, codes: [withheld, ...codes] })
  }
  if (stale) {
    return buildResult({ ...state, display: 'STALE', reason: 'FEED_STALE', codes: ['FEED_STALE', ...codes] })
  }
  if (sourceState === 'DEGRADED') {
    return buildResult({ ...state, display: 'DEGRADED', reason: 'FEED_DEGRADED', codes: ['FEED_DEGRADED', ...codes] })
  }
  if (codes.length > 0) {
    const reason = orderedCodes(codes)[0] ?? null
    return buildResult({ ...state, display: 'DEGRADED', reason, codes })
  }
  return buildResult({ ...state, display: 'LIVE', reason: null, codes: [] })
}
