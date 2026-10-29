/**
 * M24-05 — observation freshness and provenance contract for public surfaces.
 *
 * One question, answered before a value is allowed to look like a live reading:
 * is this record a source-backed observation, how old is it against the TTL its
 * producer declared, and does the provenance (source reference, rights
 * reference, source kind) exist at all? Anything that cannot answer all of them
 * is labelled or withheld with a stable reason code and no input text.
 *
 * The motivating defect is the Headquarters World Monitor
 * (`apps/headquarters/src/app/(admin)/world-monitor/page.tsx`), which prints the
 * whole `/monitor/overview` snapshot under a "Telemetry Control Plane" banner
 * and marks each source with a live dot derived from the stored `healthStatus`
 * enum — including addon `seed:` rows and rows whose `lastCheckedAt` is null.
 * A seed block is demonstration data, not an observation, and a stored
 * `healthStatus` enum is not a freshness proof. This contract is the
 * classification the serving and render layers must call before a row may be
 * called live; wiring it into the Hub projection or the page is deliberately a
 * separate task.
 *
 * The module is pure: no imports, no database, no HTTP, no store, no wall
 * clock, no environment lookup and no locale detection. `now` is supplied by
 * the caller; the system clock is never read here. It is not re-exported from
 * `src/index.ts`; adding that export is a build/API decision for the owning
 * task, not for this leaf (same posture as `./claim-type.ts`).
 *
 * Vocabulary:
 *
 *   PROVIDER   — a record returned by an approved, rights-cleared source
 *                adapter (M24-03/M24-04). The only kind that can be live.
 *   SEED       — an addon `seed:` block shipped with the schema.
 *   FIXTURE    — test or demonstration data.
 *   SYNTHETIC  — generated or modelled content that was never observed.
 *
 * Displays:
 *
 *   LIVE_OBSERVATION — PROVIDER, inside its declared TTL, no degradation.
 *   DEGRADED         — PROVIDER, inside its TTL, source declared degraded.
 *   STALE            — PROVIDER, older than its declared TTL.
 *   SYNTHETIC        — SEED / FIXTURE / SYNTHETIC, never live.
 *   WITHHELD         — provenance, timestamp, TTL or source state missing or
 *                      unrecognized, or a non-observation on a live-only
 *                      surface.
 *
 * Invariants enforced here:
 *
 *  - a record without `observedAt` is never `LIVE_OBSERVATION`;
 *  - a SEED, FIXTURE or SYNTHETIC record is never `LIVE_OBSERVATION`; it is
 *    `SYNTHETIC` with an explicit label, or `WITHHELD` when the surface accepts
 *    live data only (`liveOnly`);
 *  - a record older than its declared TTL is `STALE` and carries an explicit
 *    label; `ageSeconds === ttlSeconds` is still inside the window;
 *  - an unknown source kind, an unknown source state or a future-dated
 *    observation is `WITHHELD`, never guessed into a live reading;
 *  - a record without a source reference or a rights reference is `WITHHELD`;
 *  - only `LIVE_OBSERVATION` sets `liveReading: true`; `label` is `null` only
 *    for `WITHHELD`;
 *  - stable ASCII machine tokens; only `label` text is localized (en/id);
 *  - nothing from the input (references, timestamps, titles, URLs) is echoed in
 *    the result, so a refusal or a label can never become a leak path;
 *  - the result is frozen.
 *
 * A label is a provenance/freshness category, not a truth verdict, a quality
 * score, a rights clearance or a publication approval. A rights reference is a
 * pointer declared by the producer, not proof that clearance exists; the M24-03
 * egress gate remains the authority for that.
 */

/** The five display states. Machine values are stable ASCII and never translated. */
export const OBSERVATION_DISPLAYS = [
  'LIVE_OBSERVATION',
  'DEGRADED',
  'STALE',
  'SYNTHETIC',
  'WITHHELD',
] as const

export type ObservationDisplay = (typeof OBSERVATION_DISPLAYS)[number]

/**
 * Declared provenance of one record. Matched exactly: a lowercase or otherwise
 * unknown token is refused (`SOURCE_KIND_UNKNOWN`), never coerced.
 */
export const OBSERVATION_SOURCE_KINDS = ['PROVIDER', 'SEED', 'FIXTURE', 'SYNTHETIC'] as const

export type ObservationSourceKind = (typeof OBSERVATION_SOURCE_KINDS)[number]

/**
 * Producer-declared source state. Absence means "no degradation declared"; it
 * is not a health probe and not a claim that the collector ran. Any other
 * non-empty token is refused.
 */
export const OBSERVATION_SOURCE_STATES = ['HEALTHY', 'DEGRADED'] as const

export type ObservationSourceState = (typeof OBSERVATION_SOURCE_STATES)[number]

/** Locales this contract ships. Canonical pairs and default per ADR-0005. */
export const OBSERVATION_LOCALES = ['en', 'id'] as const

export type ObservationLocale = (typeof OBSERVATION_LOCALES)[number]

/**
 * Stable reason codes. Returned verbatim, never interpolated with input text.
 * `null` is reserved for `LIVE_OBSERVATION`.
 */
export const OBSERVATION_REASONS = [
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
] as const

export type ObservationReason = (typeof OBSERVATION_REASONS)[number]

/**
 * Localized label text per non-withheld display. The display token itself is
 * never translated; a translator may refine wording but must not drop the
 * "not a live reading" qualifier from `DEGRADED`, `STALE` or `SYNTHETIC`.
 */
const OBSERVATION_LABELS: Readonly<
  Record<Exclude<ObservationDisplay, 'WITHHELD'>, Readonly<Record<ObservationLocale, string>>>
> = Object.freeze({
  LIVE_OBSERVATION: Object.freeze({
    en: 'Live observation — source-backed and inside its declared freshness window',
    id: 'Pengamatan langsung — bersumber dan masih dalam jendela kebaruan yang dinyatakan',
  }),
  DEGRADED: Object.freeze({
    en: 'Degraded observation — the source declared a degraded state; not a clean live reading',
    id: 'Pengamatan terdegradasi — sumber menyatakan kondisi terganggu; bukan pembacaan langsung yang bersih',
  }),
  STALE: Object.freeze({
    en: 'Stale observation — older than its declared freshness window; not a live reading',
    id: 'Pengamatan basi — lebih tua dari jendela kebaruan yang dinyatakan; bukan pembacaan langsung',
  }),
  SYNTHETIC: Object.freeze({
    en: 'Synthetic, seeded or fixture record — not an observation',
    id: 'Rekaman sintetis, seed, atau fixture — bukan pengamatan',
  }),
})

/**
 * Everything a producer must supply before a record may be labelled. Fields the
 * contract cannot verify are references declared by the producer, not evidence.
 */
export interface ObservationFreshnessInput {
  /** Required. One of `OBSERVATION_SOURCE_KINDS`; unknown tokens are refused. */
  readonly sourceKind?: ObservationSourceKind | string | null
  /** Required for every result. Stable reference to the source record or collector. */
  readonly sourceRef?: string | null
  /** Required for every result. Pointer to the rights/consent decision for this source. */
  readonly rightsRef?: string | null
  /** Required for `PROVIDER`. UTC observation instant, ISO-8601 with a `Z` suffix. */
  readonly observedAt?: string | null
  /** Required for `PROVIDER`. Declared maximum age in seconds; must be finite and > 0. */
  readonly ttlSeconds?: number | null
  /** Required for `PROVIDER`. Caller-supplied UTC evaluation instant; no wall clock is read. */
  readonly now?: string | null
  /** Optional. Anything other than `HEALTHY`/`DEGRADED` withholds. */
  readonly sourceState?: ObservationSourceState | string | null
  /** Optional. `true` withholds SEED/FIXTURE/SYNTHETIC instead of labelling them. */
  readonly liveOnly?: boolean | null
  /** Optional. `en` (default) or `id`; an unsupported value falls back to `en`. */
  readonly locale?: string | null
}

/** The only shape a surface may render. */
export interface ObservationFreshness {
  readonly display: ObservationDisplay
  /** `null` only on `LIVE_OBSERVATION`; a stable code otherwise. */
  readonly reason: ObservationReason | null
  /** `true` only on `LIVE_OBSERVATION`. Every other display needs a visible label. */
  readonly liveReading: boolean
  /** Localized label text; `null` only on `WITHHELD`. */
  readonly label: string | null
  readonly locale: ObservationLocale
  /** True when an unsupported locale fell back to `en`. */
  readonly localeFallback: boolean
  /** `now - observedAt` in seconds, or `null` when either instant is absent or refused. */
  readonly ageSeconds: number | null
}

const SOURCE_KIND_SET: ReadonlySet<string> = new Set(OBSERVATION_SOURCE_KINDS)

const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isUtcInstant(value: unknown): boolean {
  if (typeof value !== 'string' || !UTC_INSTANT.test(value)) return false
  return Number.isFinite(Date.parse(value))
}

function isSourceKind(value: unknown): value is ObservationSourceKind {
  return typeof value === 'string' && SOURCE_KIND_SET.has(value)
}

function resolveLocale(locale: string | null | undefined): {
  readonly locale: ObservationLocale
  readonly localeFallback: boolean
} {
  if (locale === undefined || locale === null || locale === '') {
    return { locale: 'en', localeFallback: false }
  }
  if (locale === 'en' || locale === 'id') return { locale, localeFallback: false }
  return { locale: 'en', localeFallback: true }
}

function withheld(
  reason: ObservationReason,
  locale: ObservationLocale,
  localeFallback: boolean,
): ObservationFreshness {
  return Object.freeze({
    display: 'WITHHELD' as const,
    reason,
    liveReading: false,
    label: null,
    locale,
    localeFallback,
    ageSeconds: null,
  })
}

function labelled(
  display: Exclude<ObservationDisplay, 'WITHHELD'>,
  reason: ObservationReason | null,
  ageSeconds: number | null,
  locale: ObservationLocale,
  localeFallback: boolean,
): ObservationFreshness {
  return Object.freeze({
    display,
    reason,
    liveReading: display === 'LIVE_OBSERVATION',
    label: OBSERVATION_LABELS[display][locale],
    locale,
    localeFallback,
    ageSeconds,
  })
}

/** Stable reason code per non-observation kind. */
const NON_OBSERVATION_REASON: Readonly<Record<Exclude<ObservationSourceKind, 'PROVIDER'>, ObservationReason>> =
  Object.freeze({
    SEED: 'SEED_RECORD_NOT_LIVE' as const,
    FIXTURE: 'FIXTURE_RECORD_NOT_LIVE' as const,
    SYNTHETIC: 'SYNTHETIC_RECORD_NOT_LIVE' as const,
  })

/**
 * Classify one record. Evaluation order is fixed so the code is deterministic
 * and independent of input key order: descriptor shape; source kind; source and
 * rights references; non-observation branch; observation time; TTL; caller
 * instant; source state; future check; staleness; degradation.
 *
 * The record itself is never returned, echoed or mutated; the caller keeps
 * attribution, and this function only decides what the surface may say.
 */
export function classifyObservationFreshness(
  input: ObservationFreshnessInput | null | undefined,
): ObservationFreshness {
  if (!isRecord(input)) return withheld('OBSERVATION_DESCRIPTOR_INVALID', 'en', false)

  // After the shape check every field is read as an unknown and validated
  // explicitly; nothing is trusted from the caller's declared type.
  const descriptor: Record<string, unknown> = input
  const chosen = resolveLocale(typeof descriptor.locale === 'string' ? descriptor.locale : null)

  const rawKind = descriptor.sourceKind
  if (rawKind === undefined || rawKind === null || rawKind === '') {
    return withheld('SOURCE_KIND_MISSING', chosen.locale, chosen.localeFallback)
  }
  if (!isSourceKind(rawKind)) {
    return withheld('SOURCE_KIND_UNKNOWN', chosen.locale, chosen.localeFallback)
  }

  if (!isNonEmptyString(descriptor.sourceRef)) {
    return withheld('SOURCE_REFERENCE_MISSING', chosen.locale, chosen.localeFallback)
  }
  if (!isNonEmptyString(descriptor.rightsRef)) {
    return withheld('RIGHTS_REFERENCE_MISSING', chosen.locale, chosen.localeFallback)
  }

  // A seed block, a fixture or generated content is never an observation, no
  // matter how complete its timestamps look. A live-only surface refuses it
  // outright instead of labelling it.
  if (rawKind !== 'PROVIDER') {
    if (descriptor.liveOnly === true) {
      return withheld('NON_OBSERVATION_WITHHELD_ON_LIVE_SURFACE', chosen.locale, chosen.localeFallback)
    }
    return labelled(
      'SYNTHETIC',
      NON_OBSERVATION_REASON[rawKind],
      null,
      chosen.locale,
      chosen.localeFallback,
    )
  }

  const observedAt = descriptor.observedAt
  if (!isNonEmptyString(observedAt)) {
    return withheld('OBSERVED_AT_MISSING', chosen.locale, chosen.localeFallback)
  }
  if (!isUtcInstant(observedAt)) {
    return withheld('OBSERVED_AT_NOT_UTC', chosen.locale, chosen.localeFallback)
  }

  const ttl = descriptor.ttlSeconds
  if (ttl === undefined || ttl === null) {
    return withheld('TTL_MISSING', chosen.locale, chosen.localeFallback)
  }
  if (typeof ttl !== 'number' || !Number.isFinite(ttl) || ttl <= 0) {
    return withheld('TTL_INVALID', chosen.locale, chosen.localeFallback)
  }

  const now = descriptor.now
  if (!isNonEmptyString(now)) {
    return withheld('NOW_MISSING', chosen.locale, chosen.localeFallback)
  }
  if (!isUtcInstant(now)) {
    return withheld('NOW_NOT_UTC', chosen.locale, chosen.localeFallback)
  }

  const rawState = descriptor.sourceState
  let degraded = false
  if (rawState !== undefined && rawState !== null && rawState !== '') {
    if (rawState === 'DEGRADED') {
      degraded = true
    } else if (rawState !== 'HEALTHY') {
      return withheld('SOURCE_STATE_UNKNOWN', chosen.locale, chosen.localeFallback)
    }
  }

  const ageSeconds = (Date.parse(now) - Date.parse(observedAt)) / 1000
  if (ageSeconds < 0) {
    return withheld('OBSERVATION_IN_FUTURE', chosen.locale, chosen.localeFallback)
  }

  // Exactly at the declared TTL is still inside the window; one second past it
  // is stale. Staleness outranks a declared degraded state.
  if (ageSeconds > ttl) {
    return labelled('STALE', 'OBSERVATION_STALE', ageSeconds, chosen.locale, chosen.localeFallback)
  }

  if (degraded) {
    return labelled('DEGRADED', 'SOURCE_DEGRADED', ageSeconds, chosen.locale, chosen.localeFallback)
  }

  return labelled('LIVE_OBSERVATION', null, ageSeconds, chosen.locale, chosen.localeFallback)
}
