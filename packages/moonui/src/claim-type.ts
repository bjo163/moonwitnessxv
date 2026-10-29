/**
 * M25-02 — claim-type separation contract for rendered readings.
 *
 * One question, answered before a value reaches a surface: which single claim
 * type does this readout carry, where does it come from, and does the metadata
 * that type requires actually exist? A readout is either ALLOWED with one
 * explicit type and one source, or WITHHELD with a stable reason code and no
 * source text at all.
 *
 * The module is deliberately pure: no imports, no database, no HTTP, no store,
 * no wall clock, no environment lookup, no locale detection and no dependency
 * on the MoonUI barrel. It is not re-exported from `src/index.ts`; adding that
 * export is a build/API decision for the owning task, not for this leaf.
 *
 * Vocabulary:
 *
 *   PHYSICAL_READING — a value produced by an identified physical instrument.
 *   SIMULATION       — output of a named model over declared inputs.
 *   ASTRONOMY        — a computed/ephemeris reference with an algorithm,
 *                      inputs and uncertainty (or a pinned published reference).
 *   STORY            — narrative; never evidence and never a measurement.
 *
 * These four are a *display claim type*, not a new epistemic-nature enum.
 * `packages/moonql-research/src/projection-label.ts` keeps the BLUEPRINT §6
 * epistemic classes (PRIMARY_TEXT … FICTION) for projections; this contract
 * labels readouts. The mapping is recorded in
 * `docs/design/M25-02-claim-type-separation.md`.
 *
 * Invariants enforced here:
 *
 *  - exactly one claim type per readout; it is supplied by the producer and is
 *    never inferred from the value, the component, the route or the mode;
 *  - every readout carries a source reference; a non-`TRUSTED` source trust
 *    marker withholds the readout;
 *  - missing or unknown claim types fail closed (WITHHELD, no fallback type);
 *  - a physical reading without instrument, calibration or a UTC observation
 *    time is withheld;
 *  - a simulation without a model and inputs, or without an explicit
 *    non-measurement notice, is withheld;
 *  - astronomy without an algorithm and inputs, or without uncertainty, is
 *    withheld;
 *  - a story presented as a measurement is refused by name; any other
 *    presentation/claim-type mismatch is refused;
 *  - a withheld result carries `sourceRef: null` and a fixed reason code, so no
 *    untrusted source text can leak through the refusal path;
 *  - machine claim types stay stable ASCII; only display text is localized.
 *
 * A label is a category, not a truth verdict, a quality score, a calibration
 * certificate or a publication approval. Nothing here makes an astronomical or
 * physical claim.
 */

/** The four claim types. Machine values are stable ASCII and are never translated. */
export const CLAIM_TYPES = ['PHYSICAL_READING', 'SIMULATION', 'ASTRONOMY', 'STORY'] as const

export type ClaimType = (typeof CLAIM_TYPES)[number]

/** Locales the display table ships. Canonical pairs and default per ADR-0005. */
export const CLAIM_LOCALES = ['en', 'id'] as const

export type ClaimLocale = (typeof CLAIM_LOCALES)[number]

/**
 * Localized badge text for each claim type. The type token itself is never
 * translated; a translator may refine wording but must not introduce a fifth
 * meaning or drop the "not a measurement / not evidence" qualifier.
 */
export const CLAIM_TYPE_DISPLAY: Readonly<Record<ClaimType, Readonly<Record<ClaimLocale, string>>>> =
  Object.freeze({
    PHYSICAL_READING: Object.freeze({
      en: 'Physical reading — instrument measurement',
      id: 'Pembacaan fisik — pengukuran instrumen',
    }),
    SIMULATION: Object.freeze({
      en: 'Simulation — model output, not a measurement',
      id: 'Simulasi — keluaran model, bukan pengukuran',
    }),
    ASTRONOMY: Object.freeze({
      en: 'Astronomy — computed reference, not an instrument reading',
      id: 'Astronomi — rujukan terhitung, bukan pembacaan instrumen',
    }),
    STORY: Object.freeze({
      en: 'Story — narrative, never evidence',
      id: 'Cerita — narasi, tidak pernah menjadi bukti',
    }),
  })

/** Shown beside the badge wherever claim types are rendered. */
export const CLAIM_TYPE_NOTICE =
  'The claim type states the category of a readout. It is not a truth verdict, a quality score, a calibration certificate or a publication approval.'

export const CLAIM_READOUTS = ['ALLOWED', 'WITHHELD'] as const

export type ClaimReadout = (typeof CLAIM_READOUTS)[number]

/**
 * Stable refusal codes. They are returned verbatim, never interpolated with
 * input text, so a refusal cannot become a leak path.
 */
export const CLAIM_REFUSAL_CODES = [
  'CLAIM_DESCRIPTOR_INVALID',
  'CLAIM_TYPE_MISSING',
  'CLAIM_TYPE_UNKNOWN',
  'SOURCE_MISSING',
  'SOURCE_UNTRUSTED',
  'PRESENTATION_UNKNOWN',
  'STORY_PRESENTED_AS_MEASUREMENT',
  'PRESENTATION_CLAIM_MISMATCH',
  'PHYSICAL_READING_REQUIRES_INSTRUMENT',
  'PHYSICAL_READING_REQUIRES_CALIBRATION',
  'PHYSICAL_READING_REQUIRES_TIMESTAMP',
  'SIMULATION_REQUIRES_MODEL',
  'SIMULATION_REQUIRES_NON_MEASUREMENT_LABEL',
  'ASTRONOMY_REQUIRES_ALGORITHM',
  'ASTRONOMY_REQUIRES_UNCERTAINTY',
] as const

export type ClaimRefusalCode = (typeof CLAIM_REFUSAL_CODES)[number]

/** Source trust is an explicit producer assertion; anything but `TRUSTED` fails closed. */
export type ClaimSourceTrust = 'TRUSTED' | 'UNTRUSTED'

/** How the surface presents the readout. Optional, but if present it must match the type. */
export type ClaimPresentation = 'MEASUREMENT' | 'SIMULATION' | 'ASTRONOMY' | 'STORY'

const PRESENTATIONS: readonly ClaimPresentation[] = Object.freeze([
  'MEASUREMENT',
  'SIMULATION',
  'ASTRONOMY',
  'STORY',
])

/** The one permitted presentation for each claim type. */
const EXPECTED_PRESENTATION: Readonly<Record<ClaimType, ClaimPresentation>> = Object.freeze({
  PHYSICAL_READING: 'MEASUREMENT',
  SIMULATION: 'SIMULATION',
  ASTRONOMY: 'ASTRONOMY',
  STORY: 'STORY',
})

/**
 * Everything a producer must supply before a readout may be rendered. Fields
 * are per-type; unused fields may be omitted. Inputs are references, not raw
 * values, so the contract never carries the measured text itself.
 */
export interface ClaimDescriptor {
  /** Required. One of `CLAIM_TYPES`; an unknown string is refused, not guessed. */
  readonly claimType?: ClaimType | string | null
  /** Required. Stable reference to the instrument, model, algorithm, edition or story. */
  readonly sourceRef?: string | null
  /** Optional producer assertion. `UNTRUSTED` (or any other non-`TRUSTED` value) withholds. */
  readonly sourceTrust?: ClaimSourceTrust | string | null
  /** PHYSICAL_READING: identified instrument. */
  readonly instrumentRef?: string | null
  /** PHYSICAL_READING: calibration record reference. */
  readonly calibrationRef?: string | null
  /** PHYSICAL_READING: UTC observation instant, ISO-8601 with a `Z` suffix. */
  readonly observedAt?: string | null
  /** SIMULATION: model identifier (name/version token). */
  readonly modelRef?: string | null
  /** SIMULATION: declared input references; at least one non-empty entry. */
  readonly modelInputRefs?: readonly string[] | null
  /** SIMULATION: visible non-measurement notice, e.g. "SIMULATED — model output, not a measurement". */
  readonly nonMeasurementNotice?: string | null
  /** ASTRONOMY: algorithm or pinned-reference identifier. */
  readonly algorithmRef?: string | null
  /** ASTRONOMY: declared inputs (epoch, elements, edition); at least one non-empty entry. */
  readonly algorithmInputRefs?: readonly string[] | null
  /** ASTRONOMY: stated uncertainty with unit. */
  readonly uncertainty?: string | null
  /** Optional presentation mode. If present it must equal the type's expected mode. */
  readonly presentedAs?: ClaimPresentation | string | null
}

/** The only shape a surface may render. */
export interface ClaimEvaluation {
  readonly readout: ClaimReadout
  /** Known declared type, or `null` when the type was missing or unknown. */
  readonly claimType: ClaimType | null
  /** Source reference echoed on ALLOWED only; always `null` on WITHHELD. */
  readonly sourceRef: string | null
  /** `null` on ALLOWED; a stable refusal code on WITHHELD. */
  readonly reason: ClaimRefusalCode | null
}

const CLAIM_TYPE_SET: ReadonlySet<string> = new Set(CLAIM_TYPES)

const PRESENTATION_SET: ReadonlySet<string> = new Set(PRESENTATIONS)

const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasRefs(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every((entry) => isNonEmptyString(entry))
}

function isUtcInstant(value: unknown): boolean {
  if (typeof value !== 'string' || !UTC_INSTANT.test(value)) return false
  return Number.isFinite(Date.parse(value))
}

/** Narrowing guard for producers that accept an already-validated token. */
export function isClaimType(value: unknown): value is ClaimType {
  return typeof value === 'string' && CLAIM_TYPE_SET.has(value)
}

function withheld(claimType: ClaimType | null, reason: ClaimRefusalCode): ClaimEvaluation {
  return Object.freeze({
    readout: 'WITHHELD' as const,
    claimType,
    sourceRef: null,
    reason,
  })
}

function allowed(claimType: ClaimType, sourceRef: string): ClaimEvaluation {
  return Object.freeze({
    readout: 'ALLOWED' as const,
    claimType,
    sourceRef,
    reason: null,
  })
}

/**
 * Decide whether one readout may be rendered.
 *
 * The producer supplies the claim type. This function never derives it from
 * the presence of fields, the component, the route, the locale or the mode.
 * Missing/unknown types, missing sources, untrusted sources, presentation
 * mismatches and missing per-type metadata all return WITHHELD without echoing
 * any source text.
 */
export function evaluateClaimLabel(input: ClaimDescriptor | null | undefined): ClaimEvaluation {
  if (!isRecord(input)) return withheld(null, 'CLAIM_DESCRIPTOR_INVALID')

  const rawType = input.claimType
  if (rawType === undefined || rawType === null || rawType === '') {
    return withheld(null, 'CLAIM_TYPE_MISSING')
  }
  if (!isClaimType(rawType)) return withheld(null, 'CLAIM_TYPE_UNKNOWN')
  const claimType: ClaimType = rawType

  const rawSource = input.sourceRef
  if (!isNonEmptyString(rawSource)) return withheld(claimType, 'SOURCE_MISSING')

  const trust = input.sourceTrust
  if (trust !== undefined && trust !== null && trust !== '' && trust !== 'TRUSTED') {
    return withheld(claimType, 'SOURCE_UNTRUSTED')
  }

  const presentedAs = input.presentedAs
  if (presentedAs !== undefined && presentedAs !== null && presentedAs !== '') {
    if (typeof presentedAs !== 'string' || !PRESENTATION_SET.has(presentedAs)) {
      return withheld(claimType, 'PRESENTATION_UNKNOWN')
    }
    if (presentedAs !== EXPECTED_PRESENTATION[claimType]) {
      if (claimType === 'STORY' && presentedAs === 'MEASUREMENT') {
        return withheld(claimType, 'STORY_PRESENTED_AS_MEASUREMENT')
      }
      return withheld(claimType, 'PRESENTATION_CLAIM_MISMATCH')
    }
  }

  switch (claimType) {
    case 'PHYSICAL_READING': {
      if (!isNonEmptyString(input.instrumentRef)) {
        return withheld(claimType, 'PHYSICAL_READING_REQUIRES_INSTRUMENT')
      }
      if (!isNonEmptyString(input.calibrationRef)) {
        return withheld(claimType, 'PHYSICAL_READING_REQUIRES_CALIBRATION')
      }
      if (!isUtcInstant(input.observedAt)) {
        return withheld(claimType, 'PHYSICAL_READING_REQUIRES_TIMESTAMP')
      }
      break
    }
    case 'SIMULATION': {
      if (!isNonEmptyString(input.modelRef) || !hasRefs(input.modelInputRefs)) {
        return withheld(claimType, 'SIMULATION_REQUIRES_MODEL')
      }
      if (!isNonEmptyString(input.nonMeasurementNotice)) {
        return withheld(claimType, 'SIMULATION_REQUIRES_NON_MEASUREMENT_LABEL')
      }
      break
    }
    case 'ASTRONOMY': {
      if (!isNonEmptyString(input.algorithmRef) || !hasRefs(input.algorithmInputRefs)) {
        return withheld(claimType, 'ASTRONOMY_REQUIRES_ALGORITHM')
      }
      if (!isNonEmptyString(input.uncertainty)) {
        return withheld(claimType, 'ASTRONOMY_REQUIRES_UNCERTAINTY')
      }
      break
    }
    case 'STORY':
      break
  }

  return allowed(claimType, rawSource.trim())
}
