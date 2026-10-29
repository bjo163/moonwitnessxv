/**
 * M25-04 — unit normalization, measurement/calibration and source metadata.
 *
 * One question, answered before a value is allowed to look like a sensor
 * reading: is the unit one this contract recognizes, is the value finite, and
 * does the claim carry the calibration, UTC observation time, source, trust
 * marker and uncertainty that a physical reading requires? A value that cannot
 * answer all of them is WITHHELD with a stable reason code that echoes none of
 * the input text.
 *
 * This module composes with the M25-02 claim-type contract
 * (`./claim-type.ts`): the four claim types and `evaluateClaimLabel` are
 * imported, never redefined. That sibling import is the module's only import;
 * there is no database, HTTP, store, environment, locale detection, wall clock
 * or third-party dependency. Timestamps are caller-supplied strings and are
 * never read from the system clock.
 *
 * Vocabulary:
 *
 *   normalizeUnit       — lexical canonicalization only. It names a unit; it
 *                         does not convert a value (a °C value is never turned
 *                         into K), validate a range, or prove a scale.
 *   PHYSICAL_READING    — accepted only with instrument, calibration reference,
 *                         UTC observation instant, source, trust, finite value
 *                         and uncertainty reference.
 *   ASTRONOMY           — accepted only with an algorithm reference, declared
 *                         inputs and uncertainty; always marked as not a sensor
 *                         measurement.
 *   SIMULATION / STORY  — never accepted as a sensor measurement. A simulated
 *                         value is refused by name (`SIMULATED_VALUE_NOT_SENSOR_DATA`)
 *                         so no model output can be rendered as sensor data.
 *
 * Invariants enforced here:
 *
 *  - the claim type is producer-supplied and is never inferred from the value,
 *    the unit, the instrument or the presence of metadata;
 *  - a `SIMULATION` value is refused before any metadata is considered, so a
 *    fully populated calibration record cannot promote a model output;
 *  - an `ASTRONOMY` value is accepted only with algorithm, inputs and
 *    uncertainty, and is never marked `sensorMeasurement`;
 *  - units are matched exactly (canonical symbols) or as whole lowercase words
 *    (spelled-out names); anything else is `UNIT_UNKNOWN`, never guessed;
 *  - an occupied unit string is never echoed on a withheld result, and a
 *    rendered unit always comes from this module's frozen table, not from the
 *    caller's string;
 *  - a withheld result carries `normalized: null` and a fixed code, and a
 *    withheld label carries no value, unit, source or timestamp;
 *  - machine tokens stay stable ASCII; only display text is localized (en/id).
 *
 * A pass is not a truth verdict, a calibration certificate, a quality score or
 * a publication approval. Nothing here makes a physical or astronomical claim,
 * validates a scale, or proves that any instrument exists.
 */

import {
  CLAIM_TYPE_DISPLAY,
  evaluateClaimLabel,
  isClaimType,
  type ClaimEvaluation,
  type ClaimLocale,
  type ClaimRefusalCode,
  type ClaimType,
} from './claim-type.js'

/** Canonical machine unit tokens. Stable ASCII; never translated. */
export const MEASUREMENT_UNITS = [
  'CELSIUS',
  'KELVIN',
  'PERCENT',
  'MILLIMETRE',
  'METRE',
  'SECOND',
  'HERTZ',
  'MAGNITUDE',
] as const

export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number]

/** Physical quantity a normalized unit belongs to. Descriptive only. */
export const MEASUREMENT_QUANTITIES = [
  'TEMPERATURE',
  'RATIO',
  'LENGTH',
  'TIME',
  'FREQUENCY',
  'APPARENT_MAGNITUDE',
] as const

export type MeasurementQuantity = (typeof MEASUREMENT_QUANTITIES)[number]

/**
 * The only shape a normalized unit may take. `symbol` is the canonical display
 * symbol from this table; `labelEn`/`labelId` are the localized unit names.
 */
export interface NormalizedUnit {
  readonly code: MeasurementUnit
  readonly symbol: string
  readonly quantity: MeasurementQuantity
  readonly labelEn: string
  readonly labelId: string
}

const UNIT_TABLE: Readonly<Record<MeasurementUnit, NormalizedUnit>> = Object.freeze({
  CELSIUS: Object.freeze({
    code: 'CELSIUS' as const,
    symbol: '°C',
    quantity: 'TEMPERATURE' as const,
    labelEn: 'degree Celsius',
    labelId: 'derajat Celsius',
  }),
  KELVIN: Object.freeze({
    code: 'KELVIN' as const,
    symbol: 'K',
    quantity: 'TEMPERATURE' as const,
    labelEn: 'kelvin',
    labelId: 'kelvin',
  }),
  PERCENT: Object.freeze({
    code: 'PERCENT' as const,
    symbol: '%',
    quantity: 'RATIO' as const,
    labelEn: 'percent',
    labelId: 'persen',
  }),
  MILLIMETRE: Object.freeze({
    code: 'MILLIMETRE' as const,
    symbol: 'mm',
    quantity: 'LENGTH' as const,
    labelEn: 'millimetre',
    labelId: 'milimeter',
  }),
  METRE: Object.freeze({
    code: 'METRE' as const,
    symbol: 'm',
    quantity: 'LENGTH' as const,
    labelEn: 'metre',
    labelId: 'meter',
  }),
  SECOND: Object.freeze({
    code: 'SECOND' as const,
    symbol: 's',
    quantity: 'TIME' as const,
    labelEn: 'second',
    labelId: 'detik',
  }),
  HERTZ: Object.freeze({
    code: 'HERTZ' as const,
    symbol: 'Hz',
    quantity: 'FREQUENCY' as const,
    labelEn: 'hertz',
    labelId: 'hertz',
  }),
  MAGNITUDE: Object.freeze({
    code: 'MAGNITUDE' as const,
    symbol: 'mag',
    quantity: 'APPARENT_MAGNITUDE' as const,
    labelEn: 'astronomical magnitude',
    labelId: 'magnitudo astronomi',
  }),
})

/**
 * Canonical symbols, matched exactly. Case matters: `K`, `C`, `m`, `s`, `Hz`
 * and `mag` are accepted, while `k`, `c`, `M`, `S`, `HZ` and `MM` are not,
 * because case-folding them would be a guess (SI prefixes and other symbols
 * collide). `C` is accepted as degree Celsius because that is the delegated
 * canonical vocabulary; it is not accepted as coulomb, and no compound or
 * prefixed form is accepted.
 */
const UNIT_SYMBOLS: ReadonlyMap<string, MeasurementUnit> = new Map([
  ['°C', 'CELSIUS' as const],
  ['C', 'CELSIUS' as const],
  ['K', 'KELVIN' as const],
  ['%', 'PERCENT' as const],
  ['mm', 'MILLIMETRE' as const],
  ['m', 'METRE' as const],
  ['s', 'SECOND' as const],
  ['Hz', 'HERTZ' as const],
  ['mag', 'MAGNITUDE' as const],
])

/** Spelled-out names, matched only as a whole lowercase word. */
const UNIT_WORDS: ReadonlyMap<string, MeasurementUnit> = new Map([
  ['celsius', 'CELSIUS' as const],
  ['kelvin', 'KELVIN' as const],
  ['percent', 'PERCENT' as const],
  ['millimetre', 'MILLIMETRE' as const],
  ['millimeter', 'MILLIMETRE' as const],
  ['metre', 'METRE' as const],
  ['meter', 'METRE' as const],
  ['second', 'SECOND' as const],
  ['hertz', 'HERTZ' as const],
  ['magnitude', 'MAGNITUDE' as const],
])

/** Unit-local refusal codes. A unit is named or refused; it is never guessed. */
export const UNIT_REASONS = ['UNIT_EMPTY', 'UNIT_UNKNOWN'] as const

export type UnitReason = (typeof UNIT_REASONS)[number]

export interface UnitNormalization {
  /** The frozen canonical unit, or `null` when refused. */
  readonly unit: NormalizedUnit | null
  /** `null` on success; `UNIT_EMPTY`/`UNIT_UNKNOWN` on refusal. */
  readonly reason: UnitReason | null
}

/**
 * Stable measurement reason codes. Fixed ASCII tokens, never interpolated with
 * input text, so a refusal cannot leak a value, unit, source or timestamp.
 */
export const MEASUREMENT_REASONS = [
  'MEASUREMENT_DESCRIPTOR_INVALID',
  'CLAIM_TYPE_MISSING',
  'CLAIM_TYPE_UNKNOWN',
  'CLAIM_TYPE_NOT_PHYSICAL',
  'SIMULATED_VALUE_NOT_SENSOR_DATA',
  'UNIT_EMPTY',
  'UNIT_UNKNOWN',
  'VALUE_NOT_FINITE',
  'SOURCE_MISSING',
  'SOURCE_UNTRUSTED',
  'INSTRUMENT_MISSING',
  'CALIBRATION_MISSING',
  'TIMESTAMP_MISSING',
  'TIMESTAMP_NOT_UTC',
  'UNCERTAINTY_MISSING',
  'ASTRONOMY_ALGORITHM_MISSING',
] as const

export type MeasurementReason = (typeof MEASUREMENT_REASONS)[number]

const MEASUREMENT_REASON_SET: ReadonlySet<string> = new Set(MEASUREMENT_REASONS)

const MEASUREMENT_UNIT_SET: ReadonlySet<string> = new Set(MEASUREMENT_UNITS)

const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/

/**
 * Everything a producer supplies before a measurement may be labelled. Fields
 * are per-type; unused fields may be omitted. `calibrationRef`, `uncertainty`,
 * `algorithmRef` and `source` are opaque references chosen by the producer,
 * not values this module can verify.
 */
export interface MeasurementMetadataInput {
  /** Required. One of the M25-02 claim types; unknown strings are refused. */
  readonly claimType?: ClaimType | string | null
  /** Required. A finite number; numeric strings are not coerced. */
  readonly value?: number | null
  /** Required. A unit symbol or spelled-out name from the table above. */
  readonly unit?: string | null
  /** PHYSICAL_READING: identified instrument reference. */
  readonly instrument?: string | null
  /** PHYSICAL_READING: calibration record reference (a reference, not a certificate). */
  readonly calibrationRef?: string | null
  /** PHYSICAL_READING: required UTC instant; ASTRONOMY: optional, UTC if present. */
  readonly observedAtUtc?: string | null
  /** Required. Source reference for the reading. */
  readonly source?: string | null
  /** Optional producer assertion; anything but `TRUSTED` withholds. */
  readonly sourceTrust?: string | null
  /** Required for both accepted claim types: stated uncertainty with unit. */
  readonly uncertainty?: string | null
  /** ASTRONOMY: algorithm or pinned-reference identifier. */
  readonly algorithmRef?: string | null
  /** ASTRONOMY: declared inputs (epoch, elements, edition); at least one. */
  readonly algorithmInputRefs?: readonly string[] | null
}

/** The only shape an accepted measurement may take. */
export interface NormalizedMeasurement {
  /** `PHYSICAL_READING` or `ASTRONOMY`. Never `SIMULATION` or `STORY`. */
  readonly claimType: 'PHYSICAL_READING' | 'ASTRONOMY'
  readonly value: number
  readonly unit: NormalizedUnit
  readonly sourceRef: string
  readonly instrumentRef: string | null
  readonly calibrationRef: string | null
  readonly observedAtUtc: string | null
  readonly algorithmRef: string | null
  readonly algorithmInputRefs: readonly string[] | null
  readonly uncertaintyRef: string
  /** True only for `PHYSICAL_READING`; a computed reference is never sensor data. */
  readonly sensorMeasurement: boolean
}

export interface MeasurementEvaluation {
  readonly accepted: boolean
  /** `null` on acceptance; a stable code on refusal. */
  readonly reason: MeasurementReason | null
  /** Present on acceptance only; `null` on refusal. */
  readonly normalized: NormalizedMeasurement | null
}

/** The only shape a surface may render for a measurement. */
export interface MeasurementLabel {
  readonly readout: 'RENDERED' | 'WITHHELD'
  /** Full label on `RENDERED`; `null` on `WITHHELD`. */
  readonly text: string | null
  readonly locale: ClaimLocale
  /** True when an unsupported locale fell back to `en`. */
  readonly localeFallback: boolean
  readonly claimType: ClaimType | null
  /** Localized claim-type display text; `null` on `WITHHELD`. */
  readonly claimLabel: string | null
  readonly sourceRef: string | null
  readonly unitSymbol: string | null
  /** `null` on `RENDERED`; a stable code on `WITHHELD`. */
  readonly reason: MeasurementReason | ClaimRefusalCode | null
}

const SOURCE_WORD: Readonly<Record<ClaimLocale, string>> = Object.freeze({
  en: 'source',
  id: 'sumber',
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasRefs(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.length > 0 && value.every((entry) => isNonEmptyString(entry))
}

function isUtcInstant(value: unknown): boolean {
  if (typeof value !== 'string' || !UTC_INSTANT.test(value)) return false
  return Number.isFinite(Date.parse(value))
}

function isMeasurementUnit(value: unknown): value is MeasurementUnit {
  return typeof value === 'string' && MEASUREMENT_UNIT_SET.has(value)
}

function isMeasurementReason(value: unknown): value is MeasurementReason {
  return typeof value === 'string' && MEASUREMENT_REASON_SET.has(value)
}

function unitAllowed(code: MeasurementUnit): UnitNormalization {
  return Object.freeze({ unit: UNIT_TABLE[code], reason: null })
}

function unitRefused(reason: UnitReason): UnitNormalization {
  return Object.freeze({ unit: null, reason })
}

/**
 * Canonicalize one unit string. Exact canonical symbols first, then whole
 * lowercase spelled-out names. Empty input is `UNIT_EMPTY`; everything else,
 * including ambiguous case variants, compound units and unknown symbols, is
 * `UNIT_UNKNOWN`. The input string is never returned.
 */
export function normalizeUnit(input: unknown): UnitNormalization {
  if (input === null || input === undefined) return unitRefused('UNIT_EMPTY')
  if (typeof input !== 'string') return unitRefused('UNIT_UNKNOWN')

  const trimmed = input.trim()
  if (trimmed.length === 0) return unitRefused('UNIT_EMPTY')

  const symbol = UNIT_SYMBOLS.get(trimmed)
  if (symbol !== undefined) return unitAllowed(symbol)

  const word = UNIT_WORDS.get(trimmed.toLowerCase())
  if (word !== undefined) return unitAllowed(word)

  return unitRefused('UNIT_UNKNOWN')
}

function refused(reason: MeasurementReason): MeasurementEvaluation {
  return Object.freeze({ accepted: false, reason, normalized: null })
}

/**
 * Decide whether one value may be labelled as a measurement.
 *
 * The claim type is producer-supplied. Evaluation order is fixed so the code
 * is deterministic: descriptor shape; claim type presence/recognition;
 * simulation and story refusal; unit; value; source; trust; observation time;
 * instrument; calibration; algorithm; uncertainty. The first failing check
 * yields its code and no input text.
 */
export function evaluateMeasurementMetadata(
  input: MeasurementMetadataInput | null | undefined,
): MeasurementEvaluation {
  if (!isRecord(input)) return refused('MEASUREMENT_DESCRIPTOR_INVALID')

  const rawType = input.claimType
  if (rawType === undefined || rawType === null || rawType === '') {
    return refused('CLAIM_TYPE_MISSING')
  }
  if (!isClaimType(rawType)) return refused('CLAIM_TYPE_UNKNOWN')

  // A model output is never sensor data, regardless of how complete the
  // calibration metadata around it looks.
  if (rawType === 'SIMULATION') return refused('SIMULATED_VALUE_NOT_SENSOR_DATA')
  if (rawType === 'STORY') return refused('CLAIM_TYPE_NOT_PHYSICAL')

  const unitResult = normalizeUnit(input.unit)
  if (unitResult.unit === null) return refused(unitResult.reason ?? 'UNIT_UNKNOWN')

  if (typeof input.value !== 'number' || !Number.isFinite(input.value)) {
    return refused('VALUE_NOT_FINITE')
  }

  if (!isNonEmptyString(input.source)) return refused('SOURCE_MISSING')

  const trust = input.sourceTrust
  if (trust !== undefined && trust !== null && trust !== '' && trust !== 'TRUSTED') {
    return refused('SOURCE_UNTRUSTED')
  }

  let instrumentRef: string | null = null
  let calibrationRef: string | null = null
  let observedAtUtc: string | null = null
  let algorithmRef: string | null = null
  let algorithmInputRefs: readonly string[] | null = null

  if (rawType === 'PHYSICAL_READING') {
    if (!isNonEmptyString(input.observedAtUtc)) return refused('TIMESTAMP_MISSING')
    if (!isUtcInstant(input.observedAtUtc)) return refused('TIMESTAMP_NOT_UTC')
    if (!isNonEmptyString(input.instrument)) return refused('INSTRUMENT_MISSING')
    if (!isNonEmptyString(input.calibrationRef)) return refused('CALIBRATION_MISSING')
    instrumentRef = input.instrument.trim()
    calibrationRef = input.calibrationRef.trim()
    observedAtUtc = input.observedAtUtc
  } else {
    const observed = input.observedAtUtc
    if (observed !== undefined && observed !== null && observed !== '') {
      if (typeof observed !== 'string' || !isUtcInstant(observed)) return refused('TIMESTAMP_NOT_UTC')
      observedAtUtc = observed
    }
    if (!isNonEmptyString(input.algorithmRef) || !hasRefs(input.algorithmInputRefs)) {
      return refused('ASTRONOMY_ALGORITHM_MISSING')
    }
    algorithmRef = input.algorithmRef.trim()
    algorithmInputRefs = Object.freeze([...input.algorithmInputRefs].map((ref) => ref.trim()))
  }

  if (!isNonEmptyString(input.uncertainty)) return refused('UNCERTAINTY_MISSING')

  return Object.freeze({
    accepted: true,
    reason: null,
    normalized: Object.freeze({
      claimType: rawType,
      value: input.value,
      unit: unitResult.unit,
      sourceRef: input.source.trim(),
      instrumentRef,
      calibrationRef,
      observedAtUtc,
      algorithmRef,
      algorithmInputRefs,
      uncertaintyRef: input.uncertainty.trim(),
      sensorMeasurement: rawType === 'PHYSICAL_READING',
    }),
  })
}

function resolveLocale(locale: string | null | undefined): {
  readonly locale: ClaimLocale
  readonly localeFallback: boolean
} {
  if (locale === undefined || locale === null || locale === '') {
    return { locale: 'en', localeFallback: false }
  }
  if (locale === 'en' || locale === 'id') return { locale, localeFallback: false }
  return { locale: 'en', localeFallback: true }
}

/**
 * Re-derive the canonical unit from a normalized record's `code`. The caller's
 * unit object is never trusted for display text: only this table's frozen
 * entry is used, so a forged or hostile symbol string cannot reach a label.
 */
function canonicalUnitOf(value: unknown): NormalizedUnit | null {
  if (!isRecord(value)) return null
  const code = value.code
  if (!isMeasurementUnit(code)) return null
  return UNIT_TABLE[code]
}

function readRef(value: unknown): string | null {
  return isNonEmptyString(value) ? value.trim() : null
}

function withheldLabel(
  reason: MeasurementReason | ClaimRefusalCode,
  locale: ClaimLocale,
  localeFallback: boolean,
): MeasurementLabel {
  return Object.freeze({
    readout: 'WITHHELD' as const,
    text: null,
    locale,
    localeFallback,
    claimType: null,
    claimLabel: null,
    sourceRef: null,
    unitSymbol: null,
    reason,
  })
}

/**
 * Render one accepted measurement as text that always carries the claim type,
 * the source and the unit, and is revalidated by the M25-02
 * `evaluateClaimLabel` before anything is returned. A withheld evaluation, an
 * unknown locale, a forged record or a failed claim revalidation returns
 * `WITHHELD` with no value, unit, source or timestamp.
 */
export function formatMeasurementLabel(
  accepted: MeasurementEvaluation | null | undefined,
  locale?: string | null,
): MeasurementLabel {
  const chosen = resolveLocale(locale)

  if (!isRecord(accepted) || accepted.accepted !== true) {
    const reason =
      isRecord(accepted) && isMeasurementReason(accepted.reason)
        ? accepted.reason
        : 'MEASUREMENT_DESCRIPTOR_INVALID'
    return withheldLabel(reason, chosen.locale, chosen.localeFallback)
  }

  const normalized: unknown = accepted.normalized
  if (!isRecord(normalized)) {
    return withheldLabel('MEASUREMENT_DESCRIPTOR_INVALID', chosen.locale, chosen.localeFallback)
  }

  const claimType = normalized.claimType
  if (claimType !== 'PHYSICAL_READING' && claimType !== 'ASTRONOMY') {
    return withheldLabel('CLAIM_TYPE_NOT_PHYSICAL', chosen.locale, chosen.localeFallback)
  }

  const value = normalized.value
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return withheldLabel('VALUE_NOT_FINITE', chosen.locale, chosen.localeFallback)
  }

  const unit = canonicalUnitOf(normalized.unit)
  if (unit === null) return withheldLabel('UNIT_UNKNOWN', chosen.locale, chosen.localeFallback)

  const sourceRef = readRef(normalized.sourceRef)
  if (sourceRef === null) return withheldLabel('SOURCE_MISSING', chosen.locale, chosen.localeFallback)

  const uncertaintyRef = readRef(normalized.uncertaintyRef)
  if (uncertaintyRef === null) {
    return withheldLabel('UNCERTAINTY_MISSING', chosen.locale, chosen.localeFallback)
  }

  let claim: ClaimEvaluation
  if (claimType === 'PHYSICAL_READING') {
    const instrumentRef = readRef(normalized.instrumentRef)
    if (instrumentRef === null) {
      return withheldLabel('INSTRUMENT_MISSING', chosen.locale, chosen.localeFallback)
    }
    const calibrationRef = readRef(normalized.calibrationRef)
    if (calibrationRef === null) {
      return withheldLabel('CALIBRATION_MISSING', chosen.locale, chosen.localeFallback)
    }
    const observedAtUtc = readRef(normalized.observedAtUtc)
    if (observedAtUtc === null) {
      return withheldLabel('TIMESTAMP_MISSING', chosen.locale, chosen.localeFallback)
    }
    if (!isUtcInstant(observedAtUtc)) {
      return withheldLabel('TIMESTAMP_NOT_UTC', chosen.locale, chosen.localeFallback)
    }
    claim = evaluateClaimLabel({
      claimType: 'PHYSICAL_READING',
      sourceRef,
      sourceTrust: 'TRUSTED',
      instrumentRef,
      calibrationRef,
      observedAt: observedAtUtc,
      presentedAs: 'MEASUREMENT',
    })
  } else {
    const algorithmRef = readRef(normalized.algorithmRef)
    const algorithmInputRefs = normalized.algorithmInputRefs
    if (algorithmRef === null || !hasRefs(algorithmInputRefs)) {
      return withheldLabel('ASTRONOMY_ALGORITHM_MISSING', chosen.locale, chosen.localeFallback)
    }
    const observedAtUtc = readRef(normalized.observedAtUtc)
    if (observedAtUtc !== null && !isUtcInstant(observedAtUtc)) {
      return withheldLabel('TIMESTAMP_NOT_UTC', chosen.locale, chosen.localeFallback)
    }
    claim = evaluateClaimLabel({
      claimType: 'ASTRONOMY',
      sourceRef,
      sourceTrust: 'TRUSTED',
      algorithmRef,
      algorithmInputRefs,
      uncertainty: uncertaintyRef,
      presentedAs: 'ASTRONOMY',
    })
  }

  if (claim.readout !== 'ALLOWED' || claim.claimType === null || claim.sourceRef === null) {
    return withheldLabel(
      claim.reason ?? 'MEASUREMENT_DESCRIPTOR_INVALID',
      chosen.locale,
      chosen.localeFallback,
    )
  }

  const renderedType = claim.claimType
  const claimLabel = CLAIM_TYPE_DISPLAY[renderedType][chosen.locale]
  const text = `${renderedType} · ${claimLabel} · ${String(value)} ${unit.symbol} · ${SOURCE_WORD[chosen.locale]} ${claim.sourceRef}`

  return Object.freeze({
    readout: 'RENDERED' as const,
    text,
    locale: chosen.locale,
    localeFallback: chosen.localeFallback,
    claimType: renderedType,
    claimLabel,
    sourceRef: claim.sourceRef,
    unitSymbol: unit.symbol,
    reason: null,
  })
}
