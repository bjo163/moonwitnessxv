/**
 * M16-07 projection label contract: testimony vs empirical claim vs fiction.
 *
 * One question, answered for every projection: which single epistemic class does
 * this output carry, and is that class the one the record itself stores? The
 * module is deliberately pure — no database, no HTTP, no store, no wall clock,
 * no environment lookup, no locale detection and no dependency on this
 * package's barrel. It is not imported by `src/index.ts` and no route, search,
 * export or SDK consumer is wired to it yet (see `docs/audit/M16-07-*.md`).
 *
 * Vocabulary is **not** invented here. The single-valued axis is the
 * epistemic-nature enum already normative in `BLUEPRINT.md` §6:
 *
 *   PRIMARY_TEXT | ATTRIBUTED_BELIEF | HISTORICAL_EVIDENCE
 *   SCIENTIFIC_OBSERVATION | PERSONAL_TESTIMONY | INTERPRETATION | FICTION
 *
 * M16-01 §3.1 adopted exactly that list and forbids a second parallel enum, so
 * the four coarse families M16-07 names (`TESTIMONY`, `EMPIRICAL_CLAIM`,
 * `FICTION`, `NARRATIVE_FRAME`) are **derived** from the class by
 * `EPISTEMIC_CLASS_CLAIM_FAMILY` and are never stored as a second field a
 * projector could choose from. `EMPIRICAL_CLAIM` here means "warranted by an
 * external checkable object — a source edition, an attested document or a
 * measurement". It is not a truth verdict and not a ranking.
 *
 * Invariants enforced below:
 *
 *  - a projection kind maps to exactly one epistemic class (no wildcard, no
 *    "default to empirical", no fallback of any kind);
 *  - a record with a missing or unknown kind, or with no stored class, yields an
 *    explicit UNLABELED result whose shape has no class and no display text, so
 *    nothing can be rendered from it;
 *  - the stored class must equal the class implied by the record kind;
 *    reclassifying upward (testimony to evidence, fiction to testimony) or
 *    downward is refused instead of silently relabelled (M16-01 P-3, P-4, P-6,
 *    P-7);
 *  - a projection whose records disagree is refused as `MIXED_LABELS` rather
 *    than picking one label for the whole surface;
 *  - every emitted label is deeply frozen and carries `truthVerdict: null` and
 *    `assertedAsFact: false`.
 *
 * Display text for `en` and `id` follows ADR-0005 (canonical `en`/`id`, default
 * `en`) and M16-01 §4.2: the machine class stays stable ASCII, only the display
 * is localized. No theological, historical or scientific claim is made by a
 * label — it records a category, never a conclusion.
 */

/** Version of the label record shape understood by this module. */
export const PROJECTION_LABEL_SCHEMA_VERSION = '1.0.0'

/** Record discriminator so a label cannot be mistaken for an unrelated object. */
export const PROJECTION_LABEL_KIND = 'moonwitness.projection-label'

/** BLUEPRINT §6 epistemic-nature axis, in its published order. */
export const EPISTEMIC_CLASSES = [
  'PRIMARY_TEXT',
  'ATTRIBUTED_BELIEF',
  'HISTORICAL_EVIDENCE',
  'SCIENTIFIC_OBSERVATION',
  'PERSONAL_TESTIMONY',
  'INTERPRETATION',
  'FICTION',
] as const

export type EpistemicClass = (typeof EPISTEMIC_CLASSES)[number]

/** Coarse families derived from the class; never stored independently. */
export const CLAIM_FAMILIES = ['TESTIMONY', 'EMPIRICAL_CLAIM', 'FICTION', 'NARRATIVE_FRAME'] as const

export type ClaimFamily = (typeof CLAIM_FAMILIES)[number]

/**
 * The only class-to-family mapping. `EMPIRICAL_CLAIM` groups classes whose
 * warrant is an external checkable object (source wording, attested document,
 * measurement); it says nothing about whether that object supports the claim.
 */
export const EPISTEMIC_CLASS_CLAIM_FAMILY: Readonly<Record<EpistemicClass, ClaimFamily>> = Object.freeze({
  PRIMARY_TEXT: 'EMPIRICAL_CLAIM',
  ATTRIBUTED_BELIEF: 'NARRATIVE_FRAME',
  HISTORICAL_EVIDENCE: 'EMPIRICAL_CLAIM',
  SCIENTIFIC_OBSERVATION: 'EMPIRICAL_CLAIM',
  PERSONAL_TESTIMONY: 'TESTIMONY',
  INTERPRETATION: 'NARRATIVE_FRAME',
  FICTION: 'FICTION',
})

/**
 * Credibility ordering used **only** to name a refusal code when a projector
 * tries to reclassify a record. It is never returned, never scored and never
 * exposed: two families share a rank because they are mutually incomparable.
 */
const FAMILY_RANK: Readonly<Record<ClaimFamily, number>> = Object.freeze({
  FICTION: 0,
  NARRATIVE_FRAME: 1,
  TESTIMONY: 1,
  EMPIRICAL_CLAIM: 2,
})

/** Surfaces that project records. BLUEPRINT §3 plus M16-01 P-7 (Dock, HQ, search, export, SDK). */
export const PROJECTION_SURFACES = ['API', 'DOCK', 'EXPORT', 'HEADQUARTERS', 'SDK', 'SEARCH'] as const

export type ProjectionSurface = (typeof PROJECTION_SURFACES)[number]

/**
 * Projection record kinds and their one permitted class. The D-number prefix is
 * the owning domain from BLUEPRINT §4; a kind is a projection taxonomy entry,
 * not a database table name. There is no wildcard, prefix rule or fallback.
 */
export const PROJECTION_RECORD_KINDS = Object.freeze({
  'd01.primary_text': 'PRIMARY_TEXT',
  'd05.attributed_belief': 'ATTRIBUTED_BELIEF',
  'd05.research_interpretation': 'INTERPRETATION',
  'd06.documentary_attestation': 'HISTORICAL_EVIDENCE',
  'd06.witness_testimony': 'PERSONAL_TESTIMONY',
  'd07.fiction_scene': 'FICTION',
  'd10.scientific_observation': 'SCIENTIFIC_OBSERVATION',
} as const)

export type ProjectionRecordKind = keyof typeof PROJECTION_RECORD_KINDS

/** Locales the display table ships. Canonical pairs and default per ADR-0005. */
export const LABEL_LOCALES = ['en', 'id'] as const

export type LabelLocale = (typeof LABEL_LOCALES)[number]

export const DEFAULT_LABEL_LOCALE: LabelLocale = 'en'

/** Machine-stable class plus localized display text; the class is never translated. */
export const EPISTEMIC_CLASS_DISPLAY: Readonly<Record<EpistemicClass, Readonly<Record<LabelLocale, string>>>> =
  Object.freeze({
    PRIMARY_TEXT: Object.freeze({
      en: 'Primary text — source wording, not a truth verdict',
      id: 'Teks primer — kata sumber, bukan putusan kebenaran',
    }),
    ATTRIBUTED_BELIEF: Object.freeze({
      en: 'Attributed belief — reported, not asserted',
      id: 'Keyakinan yang diatribusikan — dilaporkan, bukan dinyatakan',
    }),
    HISTORICAL_EVIDENCE: Object.freeze({
      en: 'Historical evidence — attested document',
      id: 'Bukti historis — dokumen teratribusi',
    }),
    SCIENTIFIC_OBSERVATION: Object.freeze({
      en: 'Scientific observation — measurement, not a doctrine',
      id: 'Observasi ilmiah — pengukuran, bukan doktrin',
    }),
    PERSONAL_TESTIMONY: Object.freeze({
      en: "Personal testimony — one person's account, unverified",
      id: 'Kesaksian pribadi — laporan satu orang, belum terverifikasi',
    }),
    INTERPRETATION: Object.freeze({
      en: 'Interpretation — a reading, not a fact',
      id: 'Interpretasi — pembacaan, bukan fakta',
    }),
    FICTION: Object.freeze({
      en: 'Fiction — creative work, not testimony',
      id: 'Fiksi — karya kreatif, bukan kesaksian',
    }),
  })

/** Stable refusal codes. Every one of them is an UNLABELED outcome. */
export type ProjectionLabelRefusal =
  | 'PROJECTION_INVALID'
  | 'SURFACE_UNKNOWN'
  | 'RECORDS_EMPTY'
  | 'RECORD_INVALID'
  | 'RECORD_REF_MISSING'
  | 'RECORD_KIND_MISSING'
  | 'RECORD_KIND_UNKNOWN'
  | 'RECORD_UNLABELED'
  | 'EPISTEMIC_CLASS_UNKNOWN'
  | 'MIXED_LABELS'
  | 'LABEL_UPGRADE_REFUSED'
  | 'LABEL_DOWNGRADE_REFUSED'
  | 'LABEL_MISMATCH'

export const PROJECTION_LABEL_REFUSALS: readonly ProjectionLabelRefusal[] = Object.freeze([
  'PROJECTION_INVALID',
  'SURFACE_UNKNOWN',
  'RECORDS_EMPTY',
  'RECORD_INVALID',
  'RECORD_REF_MISSING',
  'RECORD_KIND_MISSING',
  'RECORD_KIND_UNKNOWN',
  'RECORD_UNLABELED',
  'EPISTEMIC_CLASS_UNKNOWN',
  'MIXED_LABELS',
  'LABEL_UPGRADE_REFUSED',
  'LABEL_DOWNGRADE_REFUSED',
  'LABEL_MISMATCH',
])

/** Validated record retained inside a label. */
export interface LabeledRecord {
  readonly recordRef: string
  readonly recordKind: ProjectionRecordKind
  readonly epistemicClass: EpistemicClass
}

/** The only thing a surface may render for a projection. */
export interface ProjectionLabel {
  readonly schemaVersion: typeof PROJECTION_LABEL_SCHEMA_VERSION
  readonly kind: typeof PROJECTION_LABEL_KIND
  readonly surface: ProjectionSurface
  readonly epistemicClass: EpistemicClass
  readonly claimFamily: ClaimFamily
  /** Stable ASCII identifier for API/export/SDK payloads; equals `epistemicClass`. */
  readonly machineLabel: string
  /** Localized badge text; the machine label stays untranslated. */
  readonly display: Readonly<Record<LabelLocale, string>>
  /** Code-unit sorted, so the label is deterministic regardless of input order. */
  readonly recordRefs: readonly string[]
  readonly records: readonly LabeledRecord[]
  readonly assertedAsFact: false
  readonly truthVerdict: null
  readonly labelIsAReview: false
  readonly notice: string
}

export interface LabeledProjection {
  readonly labeled: true
  readonly refusal: null
  readonly label: ProjectionLabel
}

/** A refusal has no `label`, no class and no display text by construction. */
export interface UnlabeledProjection {
  readonly labeled: false
  readonly refusal: ProjectionLabelRefusal
  readonly detail: string
}

export type ProjectionLabelResult = LabeledProjection | UnlabeledProjection

export type KindClassification =
  | {
      readonly ok: true
      readonly recordKind: ProjectionRecordKind
      readonly epistemicClass: EpistemicClass
      readonly claimFamily: ClaimFamily
    }
  | { readonly ok: false; readonly refusal: 'RECORD_KIND_MISSING' | 'RECORD_KIND_UNKNOWN' }

export type LabelTextResult =
  | {
      readonly rendered: true
      readonly refusal: null
      readonly locale: LabelLocale
      readonly fallback: boolean
      readonly text: string
      readonly machineLabel: string
    }
  | { readonly rendered: false; readonly refusal: 'EPISTEMIC_CLASS_UNKNOWN'; readonly detail: string }

/** Thrown by `requireLabeledProjection`; messages never carry record content. */
export class ProjectionLabelError extends Error {
  readonly refusal: ProjectionLabelRefusal

  constructor(refusal: ProjectionLabelRefusal, message: string) {
    super(`${refusal}: ${message}`)
    this.name = 'ProjectionLabelError'
    this.refusal = refusal
  }
}

const LABEL_NOTICE =
  "The label states the record's stored epistemic class. It is not a truth verdict, a quality score, a review approval or a publication decision."

type UnknownRecord = Record<string, unknown>

type RecordCheck = { readonly ok: true; readonly record: LabeledRecord } | { readonly ok: false; readonly result: UnlabeledProjection }

type ClassRelation = 'SAME' | 'UPGRADE' | 'DOWNGRADE' | 'LATERAL'

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isKnown<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value)
}

function textCompare(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  Object.freeze(value)
  for (const nested of Object.values(value as UnknownRecord)) deepFreeze(nested)
  return value
}

function unlabeled(refusal: ProjectionLabelRefusal, detail: string): UnlabeledProjection {
  return Object.freeze({ labeled: false as const, refusal, detail })
}

function lookupRecordKind(kind: string): EpistemicClass | null {
  if (!Object.hasOwn(PROJECTION_RECORD_KINDS, kind)) return null
  return (PROJECTION_RECORD_KINDS as Readonly<Record<string, EpistemicClass>>)[kind] ?? null
}

function relationBetween(stored: EpistemicClass, implied: EpistemicClass): ClassRelation {
  if (stored === implied) return 'SAME'
  const storedRank = FAMILY_RANK[EPISTEMIC_CLASS_CLAIM_FAMILY[stored]]
  const impliedRank = FAMILY_RANK[EPISTEMIC_CLASS_CLAIM_FAMILY[implied]]
  if (impliedRank > storedRank) return 'UPGRADE'
  if (impliedRank < storedRank) return 'DOWNGRADE'
  return 'LATERAL'
}

/**
 * Classify one projection kind. Missing and unknown kinds are distinct refusals;
 * neither ever falls back to a class.
 */
export function classifyProjectionKind(kind: unknown): KindClassification {
  if (kind === undefined || kind === null || kind === '') {
    return Object.freeze({ ok: false as const, refusal: 'RECORD_KIND_MISSING' as const })
  }
  if (typeof kind !== 'string') {
    return Object.freeze({ ok: false as const, refusal: 'RECORD_KIND_UNKNOWN' as const })
  }
  const epistemicClass = lookupRecordKind(kind)
  if (epistemicClass === null) {
    return Object.freeze({ ok: false as const, refusal: 'RECORD_KIND_UNKNOWN' as const })
  }
  return Object.freeze({
    ok: true as const,
    recordKind: kind as ProjectionRecordKind,
    epistemicClass,
    claimFamily: EPISTEMIC_CLASS_CLAIM_FAMILY[epistemicClass],
  })
}

function checkRecord(raw: unknown, index: number): RecordCheck {
  const refuse = (refusal: ProjectionLabelRefusal, detail: string): RecordCheck => ({
    ok: false as const,
    result: unlabeled(refusal, detail),
  })
  if (!isRecord(raw)) return refuse('RECORD_INVALID', `record ${index} is not an object`)
  if (!isNonEmptyString(raw.recordRef)) return refuse('RECORD_REF_MISSING', `record ${index} has no recordRef`)
  const kind = classifyProjectionKind(raw.recordKind)
  if (!kind.ok) {
    return refuse(kind.refusal, `record ${index} has a projection kind that cannot be labelled`)
  }
  const stored = raw.epistemicClass
  if (stored === undefined || stored === null || stored === '') {
    return refuse('RECORD_UNLABELED', `record ${index} stores no epistemic class`)
  }
  if (!isKnown(EPISTEMIC_CLASSES, stored)) {
    return refuse('EPISTEMIC_CLASS_UNKNOWN', `record ${index} stores a class outside the BLUEPRINT §6 axis`)
  }
  const relation = relationBetween(stored, kind.epistemicClass)
  if (relation === 'UPGRADE') {
    return refuse(
      'LABEL_UPGRADE_REFUSED',
      `record ${index} stores ${stored} but the projection kind implies ${kind.epistemicClass}; reclassifying upward is a governance act`,
    )
  }
  if (relation === 'DOWNGRADE') {
    return refuse(
      'LABEL_DOWNGRADE_REFUSED',
      `record ${index} stores ${stored} but the projection kind implies ${kind.epistemicClass}; reclassifying downward is a governance act`,
    )
  }
  if (relation === 'LATERAL') {
    return refuse(
      'LABEL_MISMATCH',
      `record ${index} stores ${stored} but the projection kind implies ${kind.epistemicClass}`,
    )
  }
  return Object.freeze({
    ok: true as const,
    record: Object.freeze({
      recordRef: raw.recordRef,
      recordKind: kind.recordKind,
      epistemicClass: stored,
    }),
  })
}

/**
 * Label one projection.
 *
 * The projection is accepted only when it names a known surface, carries at
 * least one well-formed record, every record stores a class from the BLUEPRINT
 * axis that equals the class implied by its projection kind, and all records
 * share that one class. Anything else returns an UNLABELED result.
 *
 * A surface that genuinely needs to show testimony next to fiction must emit
 * two projections; this contract will not merge them under one label.
 */
export function labelProjection(input: unknown): ProjectionLabelResult {
  if (!isRecord(input)) return unlabeled('PROJECTION_INVALID', 'projection is not an object')
  if (!isKnown(PROJECTION_SURFACES, input.surface)) {
    return unlabeled('SURFACE_UNKNOWN', 'projection surface is missing or not a known surface')
  }
  const rawRecords = input.records
  if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
    return unlabeled('RECORDS_EMPTY', 'a projection needs at least one record')
  }
  const records: LabeledRecord[] = []
  for (let index = 0; index < rawRecords.length; index += 1) {
    const checked = checkRecord(rawRecords[index], index)
    if (!checked.ok) return checked.result
    records.push(checked.record)
  }
  const classes = new Set(records.map((record) => record.epistemicClass))
  if (classes.size !== 1) {
    const listed = [...classes].sort(textCompare).join(', ')
    return unlabeled('MIXED_LABELS', `projection mixes ${classes.size} epistemic classes (${listed})`)
  }
  const epistemicClass = records[0]?.epistemicClass
  if (epistemicClass === undefined) return unlabeled('RECORDS_EMPTY', 'a projection needs at least one record')
  const ordered = [...records].sort((left, right) => textCompare(left.recordRef, right.recordRef))
  const label: ProjectionLabel = deepFreeze({
    schemaVersion: PROJECTION_LABEL_SCHEMA_VERSION,
    kind: PROJECTION_LABEL_KIND,
    surface: input.surface,
    epistemicClass,
    claimFamily: EPISTEMIC_CLASS_CLAIM_FAMILY[epistemicClass],
    machineLabel: epistemicClass,
    display: EPISTEMIC_CLASS_DISPLAY[epistemicClass],
    recordRefs: ordered.map((record) => record.recordRef),
    records: ordered,
    assertedAsFact: false as const,
    truthVerdict: null,
    labelIsAReview: false as const,
    notice: LABEL_NOTICE,
  })
  return Object.freeze({ labeled: true as const, refusal: null, label })
}

/** Narrowing guard for emitters; an UNLABELED result is not renderable. */
export function isLabeledProjection(result: ProjectionLabelResult): result is LabeledProjection {
  return result.labeled === true
}

/**
 * Fail-closed emitters call this instead of reading `result.label`. Throwing is
 * intentional: a projection without a label must never be serialized.
 */
export function requireLabeledProjection(result: ProjectionLabelResult): ProjectionLabel {
  if (isLabeledProjection(result)) return result.label
  throw new ProjectionLabelError(result.refusal, 'a projection cannot be emitted without a label')
}

function resolveLocale(locale: unknown): { readonly locale: LabelLocale; readonly fallback: boolean } {
  if (isKnown(LABEL_LOCALES, locale)) return { locale, fallback: false }
  return { locale: DEFAULT_LABEL_LOCALE, fallback: true }
}

/**
 * Render the display text for one class in `en` or `id`. An unsupported locale
 * falls back to the canonical default `en` (ADR-0005) and reports that it did;
 * an unknown class is refused rather than guessed.
 */
export function renderLabelText(epistemicClass: unknown, locale?: unknown): LabelTextResult {
  if (!isKnown(EPISTEMIC_CLASSES, epistemicClass)) {
    return Object.freeze({
      rendered: false as const,
      refusal: 'EPISTEMIC_CLASS_UNKNOWN' as const,
      detail: 'no display text exists for a class outside the BLUEPRINT §6 axis',
    })
  }
  const resolved = resolveLocale(locale)
  return Object.freeze({
    rendered: true as const,
    refusal: null,
    locale: resolved.locale,
    fallback: resolved.fallback,
    text: EPISTEMIC_CLASS_DISPLAY[epistemicClass][resolved.locale],
    machineLabel: epistemicClass,
  })
}

/** Derived family for a class, or `null` for anything unknown. No default. */
export function claimFamilyOf(epistemicClass: unknown): ClaimFamily | null {
  if (!isKnown(EPISTEMIC_CLASSES, epistemicClass)) return null
  return EPISTEMIC_CLASS_CLAIM_FAMILY[epistemicClass]
}
