/**
 * M24-07 — Degraded-feed acceptance.
 *
 * Positive controls prove a fresh, source-backed feed stays LIVE with its
 * source state, and that an in-TTL degraded feed is labelled DEGRADED with a
 * visible uncertainty code. Negative controls cover every reason code:
 * invalid, missing and future publish times, fetch-time substitution, missing
 * or bogus zones, coarse/unknown geography, missing values, stale, offline and
 * unknown feeds. Fixtures are synthetic, use reserved example hostnames and
 * fictional coordinates, and are never echoed by the result.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  evaluateFeedOutcome,
  type FeedEvaluationContext,
  type FeedOutcomeInput,
} from './degraded-feed-contract.js'

const FETCHED_AT = '2026-02-03T04:05:06.000Z'
const PUBLISHED_AT = '2026-02-03T04:00:00.000Z'
const EVALUATED_AT = '2026-02-03T04:05:10.000Z'
const TTL_SECONDS = 600

function feed(overrides: Partial<FeedOutcomeInput> = {}): FeedOutcomeInput {
  return {
    sourceState: 'ONLINE',
    fetchedAtUtc: FETCHED_AT,
    publishedAt: PUBLISHED_AT,
    timezone: 'Asia/Jakarta',
    geoPrecision: 'EXACT',
    observedValue: 42.5,
    ...overrides,
  }
}

function rawFeed(overrides: Record<string, unknown> = {}): FeedOutcomeInput {
  return { ...feed(), ...overrides } as unknown as FeedOutcomeInput
}

function context(overrides: Partial<FeedEvaluationContext> = {}): FeedEvaluationContext {
  return { evaluatedAtUtc: EVALUATED_AT, ttlSeconds: TTL_SECONDS, ...overrides }
}

function contextWith(overrides: Record<string, unknown>): FeedEvaluationContext {
  return { evaluatedAtUtc: EVALUATED_AT, ttlSeconds: TTL_SECONDS, ...overrides } as unknown as FeedEvaluationContext
}

void test('M24-07 keeps a fresh online feed with exact geography and an IANA zone live while showing source state', () => {
  const result = evaluateFeedOutcome(feed(), context())

  assert.equal(result.display, 'LIVE')
  assert.equal(result.reason, null)
  assert.equal(result.sourceState, 'ONLINE')
  assert.deepEqual(result.uncertainty.codes, [])
  assert.equal(result.uncertainty.observedAtUtc, PUBLISHED_AT)
  assert.equal(result.uncertainty.fetchedAtUtc, FETCHED_AT)
  assert.equal(result.uncertainty.observedAgeSeconds, 310)
  assert.equal(result.uncertainty.ttlSeconds, TTL_SECONDS)
  assert.equal(result.uncertainty.timezoneRecognized, true)
  assert.equal(result.uncertainty.geoPrecision, 'EXACT')
  assert.equal(result.uncertainty.geoIsExact, true)
  assert.equal(result.uncertainty.valuePresent, true)
  assert.equal(result.uncertainty.fetchedAtIsObservationTime, false)
  assert.ok(Object.isFrozen(result))
  assert.ok(Object.isFrozen(result.uncertainty))
  assert.ok(Object.isFrozen(result.uncertainty.codes))
})

void test('M24-07 labels an in-TTL degraded provider DEGRADED with a visible code and source state', () => {
  const result = evaluateFeedOutcome(feed({ sourceState: 'DEGRADED' }), context())

  assert.equal(result.display, 'DEGRADED')
  assert.equal(result.reason, 'FEED_DEGRADED')
  assert.equal(result.sourceState, 'DEGRADED')
  assert.ok(result.uncertainty.codes.includes('FEED_DEGRADED'))
  assert.equal(result.uncertainty.observedAtUtc, PUBLISHED_AT)
  assert.equal(result.uncertainty.observedAgeSeconds, 310)
})

void test('M24-07 normalizes an offset publish time to UTC ISO-Z derived from the input', () => {
  const result = evaluateFeedOutcome(feed({ publishedAt: '2026-02-03T11:00:00+07:00' }), context())

  assert.equal(result.display, 'LIVE')
  assert.equal(result.uncertainty.observedAtUtc, '2026-02-03T04:00:00.000Z')
  assert.ok(!JSON.stringify(result).includes('+07:00'))
})

void test('M24-07 keeps city precision and a zero reading visible without claiming an exact location', () => {
  const result = evaluateFeedOutcome(feed({ geoPrecision: 'CITY', observedValue: 0 }), context())

  assert.equal(result.display, 'LIVE')
  assert.equal(result.uncertainty.geoPrecision, 'CITY')
  assert.equal(result.uncertainty.geoIsExact, false)
  assert.equal(result.uncertainty.valuePresent, true)
})

void test('M24-07 treats a record exactly at its declared TTL as inside the window', () => {
  const result = evaluateFeedOutcome(feed({ publishedAt: '2026-02-03T03:55:10.000Z' }), context())

  assert.equal(result.display, 'LIVE')
  assert.equal(result.uncertainty.observedAgeSeconds, TTL_SECONDS)
})

void test('M24-07 reports a missing publish time instead of substituting the fetch instant', () => {
  const result = evaluateFeedOutcome(feed({ publishedAt: null }), context())

  assert.equal(result.display, 'DEGRADED')
  assert.equal(result.reason, 'PUBLISH_TIME_MISSING_NO_CLOCK_SUBSTITUTION')
  assert.equal(result.uncertainty.observedAtUtc, null)
  assert.equal(result.uncertainty.observedAgeSeconds, null)
  assert.equal(result.uncertainty.fetchedAtUtc, FETCHED_AT)
  assert.notEqual(result.uncertainty.observedAtUtc, result.uncertainty.fetchedAtUtc)
  assert.ok(result.uncertainty.codes.includes('PUBLISH_TIME_MISSING_NO_CLOCK_SUBSTITUTION'))
})

void test('M24-07 refuses a publish time identical to the fetch time as a possible substitution', () => {
  const result = evaluateFeedOutcome(feed({ publishedAt: FETCHED_AT }), context())

  assert.equal(result.display, 'DEGRADED')
  assert.equal(result.reason, 'FETCH_TIME_IS_NOT_OBSERVATION_TIME')
  assert.equal(result.uncertainty.observedAtUtc, null)
  assert.equal(result.uncertainty.fetchedAtUtc, FETCHED_AT)
  assert.equal(result.uncertainty.fetchedAtIsObservationTime, false)
})

void test('M24-07 withholds instead of reading a clock when the evaluation instant is missing', () => {
  const missing = evaluateFeedOutcome(feed(), contextWith({ evaluatedAtUtc: undefined }))
  const omitted = evaluateFeedOutcome(feed(), {} as unknown as FeedEvaluationContext)

  assert.equal(missing.display, 'WITHHELD')
  assert.equal(missing.reason, 'EVALUATED_AT_MISSING')
  assert.equal(omitted.reason, 'EVALUATED_AT_MISSING')
  assert.deepEqual(missing, omitted)
  assert.equal(missing.uncertainty.observedAtUtc, null)
})

void test('M24-07 rejects an evaluation instant that is not UTC ISO-Z', () => {
  const result = evaluateFeedOutcome(feed(), context({ evaluatedAtUtc: '2026-02-03T11:05:10+07:00' }))

  assert.equal(result.display, 'WITHHELD')
  assert.equal(result.reason, 'EVALUATED_AT_INVALID')
})

void test('M24-07 withholds a naive, date-only or unparseable publish time', () => {
  for (const publishedAt of ['2026-02-03T04:00:00', '2026-02-03', 'not-a-time']) {
    const result = evaluateFeedOutcome(feed({ publishedAt }), context())
    assert.equal(result.display, 'WITHHELD')
    assert.equal(result.reason, 'PUBLISH_TIME_INVALID')
    assert.equal(result.uncertainty.observedAtUtc, null)
  }
})

void test('M24-07 withholds a future-dated publish time instead of treating it as fresh', () => {
  const result = evaluateFeedOutcome(feed({ publishedAt: '2026-02-03T04:06:00.000Z' }), context())

  assert.equal(result.display, 'WITHHELD')
  assert.equal(result.reason, 'PUBLISH_TIME_IN_FUTURE')
  assert.equal(result.uncertainty.observedAtUtc, null)
  assert.equal(result.uncertainty.observedAgeSeconds, null)
})

void test('M24-07 marks a feed older than its declared TTL as STALE, never LIVE', () => {
  const result = evaluateFeedOutcome(feed({ publishedAt: '2026-02-03T03:00:00.000Z' }), context())

  assert.equal(result.display, 'STALE')
  assert.equal(result.reason, 'FEED_STALE')
  assert.ok(result.uncertainty.codes.includes('FEED_STALE'))
  assert.equal(result.uncertainty.observedAtUtc, '2026-02-03T03:00:00.000Z')
  assert.ok((result.uncertainty.observedAgeSeconds ?? 0) > TTL_SECONDS)
})

void test('M24-07 degrades a feed whose timezone is absent', () => {
  const result = evaluateFeedOutcome(feed({ timezone: null }), context())

  assert.equal(result.display, 'DEGRADED')
  assert.equal(result.reason, 'TIMEZONE_MISSING')
  assert.equal(result.uncertainty.timezoneRecognized, false)
})

void test('M24-07 rejects offsets, abbreviations, blank and unknown timezones', () => {
  for (const timezone of ['+07:00', 'WIB', '', 'Not/AZone']) {
    const result = evaluateFeedOutcome(feed({ timezone }), context())
    assert.equal(result.display, 'DEGRADED')
    assert.equal(result.reason, 'TIMEZONE_INVALID')
    assert.equal(result.uncertainty.timezoneRecognized, false)
  }
})

void test('M24-07 degrades unknown geography and never marks it exact', () => {
  for (const geoPrecision of ['UNKNOWN', null] as const) {
    const result = evaluateFeedOutcome(feed({ geoPrecision }), context())
    assert.equal(result.display, 'DEGRADED')
    assert.equal(result.reason, 'GEO_PRECISION_UNKNOWN')
    assert.equal(result.uncertainty.geoPrecision, 'UNKNOWN')
    assert.equal(result.uncertainty.geoIsExact, false)
  }
})

void test('M24-07 displays coarse geography with its precision and does not call it exact', () => {
  for (const geoPrecision of ['REGION', 'COUNTRY'] as const) {
    const result = evaluateFeedOutcome(feed({ geoPrecision }), context())
    assert.equal(result.display, 'DEGRADED')
    assert.equal(result.reason, 'GEO_PRECISION_TOO_COARSE')
    assert.equal(result.uncertainty.geoPrecision, geoPrecision)
    assert.equal(result.uncertainty.geoIsExact, false)
  }
})

void test('M24-07 degrades a feed with a missing or non-finite value', () => {
  for (const observedValue of [null, Number.NaN]) {
    const result = evaluateFeedOutcome(feed({ observedValue }), context())
    assert.equal(result.display, 'DEGRADED')
    assert.equal(result.reason, 'VALUE_MISSING')
    assert.equal(result.uncertainty.valuePresent, false)
  }
})

void test('M24-07 withholds a malformed input payload', () => {
  const result = evaluateFeedOutcome(null as unknown as FeedOutcomeInput, context())

  assert.equal(result.display, 'WITHHELD')
  assert.equal(result.reason, 'INPUT_INVALID')
  assert.equal(result.sourceState, 'UNKNOWN')
})

void test('M24-07 withholds a missing or unusable TTL', () => {
  const cases: Array<[Record<string, unknown>, string]> = [
    [{ ttlSeconds: undefined }, 'TTL_MISSING'],
    [{ ttlSeconds: 0 }, 'TTL_INVALID'],
    [{ ttlSeconds: -5 }, 'TTL_INVALID'],
    [{ ttlSeconds: '600' }, 'TTL_INVALID'],
  ]
  for (const [overrides, reason] of cases) {
    const result = evaluateFeedOutcome(feed(), contextWith(overrides))
    assert.equal(result.display, 'WITHHELD')
    assert.equal(result.reason, reason)
  }
})

void test('M24-07 reports an offline feed as OFFLINE with its source state', () => {
  const result = evaluateFeedOutcome(feed({ sourceState: 'OFFLINE' }), context())

  assert.equal(result.display, 'OFFLINE')
  assert.equal(result.reason, 'FEED_OFFLINE')
  assert.equal(result.sourceState, 'OFFLINE')
  assert.ok(result.uncertainty.codes.includes('FEED_OFFLINE'))
})

void test('M24-07 withholds a feed whose source state is unknown or unrecognized', () => {
  for (const sourceState of ['UNKNOWN', 'STALE', 'ONLINE ', undefined]) {
    const result = evaluateFeedOutcome(rawFeed({ sourceState }), context())
    assert.equal(result.display, 'WITHHELD')
    assert.equal(result.reason, 'FEED_UNKNOWN_STATE')
    assert.equal(result.sourceState, 'UNKNOWN')
  }
})

void test('M24-07 withholds a feed without a usable fetch instant', () => {
  const missing = evaluateFeedOutcome(feed({ fetchedAtUtc: null }), context())
  assert.equal(missing.display, 'WITHHELD')
  assert.equal(missing.reason, 'FETCH_TIME_MISSING')

  for (const fetchedAtUtc of ['2026-02-03 04:05:06', '2026-02-03T11:05:06+07:00', 'yesterday']) {
    const invalid = evaluateFeedOutcome(feed({ fetchedAtUtc }), context())
    assert.equal(invalid.display, 'WITHHELD')
    assert.equal(invalid.reason, 'FETCH_TIME_INVALID')
  }
})

void test('M24-07 results echo no payload text, hostname, coordinate, timezone or value', () => {
  const input = rawFeed({
    title: 'MARKER_TITLE_9f3',
    url: 'https://feed.example.test/v1/observations',
    latitude: -6.2,
    longitude: 106.8,
  })
  const result = evaluateFeedOutcome(input, context())
  const serialized = JSON.stringify(result)

  assert.equal(result.display, 'LIVE')
  for (const marker of [
    'MARKER_TITLE_9f3',
    'feed.example.test',
    '-6.2',
    '106.8',
    'Asia/Jakarta',
    '42.5',
  ]) {
    assert.ok(!serialized.includes(marker), `result must not echo ${marker}`)
  }
})

void test('M24-07 evaluates without reading the wall clock', () => {
  const dateConstructor = Date as unknown as { now: () => number }
  const originalNow = dateConstructor.now
  let result: ReturnType<typeof evaluateFeedOutcome>
  try {
    dateConstructor.now = () => {
      throw new Error('wall clock read')
    }
    result = evaluateFeedOutcome(feed(), context())
  } finally {
    dateConstructor.now = originalNow
  }

  assert.equal(result.display, 'LIVE')
  assert.equal(result.uncertainty.observedAtUtc, PUBLISHED_AT)
})

void test('M24-07 model source contains no ambient clock call', () => {
  const source = readFileSync(new URL('./degraded-feed-contract.ts', import.meta.url), 'utf8')

  assert.equal(/Date\.now\s*\(/.test(source), false)
  assert.equal(/new Date\s*\(\s*\)/.test(source), false)
})
