/**
 * M18-06 prototype display labels for reviewer scope, source identity and the
 * original-versus-derivative distinction.
 *
 * This module is deliberately self-contained and pure: no database, no HTTP, no
 * provider, no wall clock, no environment lookup, no locale catalogue and no
 * dependency on this package's barrel. It answers one display question — what
 * may a public view honestly say about the review scope and the source behind
 * one record? — and never turns an unproven claim into a positive badge.
 *
 * The acceptance it serves is TODO M18-06: "No AI or copywriting masquerades as
 * original source." The rule is asymmetric on purpose:
 *
 *   ORIGINAL is a positive claim, so it needs positive evidence on every axis;
 *   any missing, conflicting, unrecognised or derivative signal downgrades it.
 *
 * Therefore a record may render `ORIGINAL` only when all of the following hold:
 *
 *   1. `sourceKind` is exactly `ORIGINAL_SOURCE`;
 *   2. `sourceSense` is exactly `ORIGINAL_ARABIC` (the live research vocabulary
 *      in `packages/moonql-research/src/seed.ts`);
 *   3. no `derivedFromRef` is declared;
 *   4. `aiInvolvement` is exactly `NONE` — an unrecorded AI field is not
 *      evidence that no AI was involved;
 *   5. a source identity (`sourceRef`) is named; and
 *   6. the reviewer scope is verified: a named reviewer plus at least one
 *      recognised scope, with no unrecognised scope in the list.
 *
 * Everything else renders `DERIVATIVE` (a known derivative kind, translation
 * sense or declared derivation) or `UNVERIFIED`. A derivative that names no
 * source identity renders an explicit `SOURCE UNAVAILABLE` label; this module
 * never invents, guesses or derives a source name.
 *
 * The scope codes are display categories for duties that already exist in the
 * repository (exact-source review, rights/consent veto, translation review,
 * editorial publication review, research claim review). They are not a role
 * model, they grant no authority, and they do not model the unratified M20-02
 * lane mandates.
 *
 * Labels are returned as a stable machine key plus canonical English fallback
 * text. Locale rendering remains Dock's ownership (`apps/dock/src/lib/
 * provenance-copy.ts`); this module is not wired to any route or component.
 * See docs/audit/M18-06-source-label.md for evidence and explicit non-claims.
 */

/** Version of the label record shape understood by this module. */
export const SOURCE_LABEL_SCHEMA_VERSION = '1.0.0'

/** Source kinds grounded in the research vocabulary and ADR-0003 duties. */
export const SOURCE_KINDS = [
  'ORIGINAL_SOURCE',
  'LICENSED_TRANSLATION',
  'THIRD_PARTY_COPYRIGHT',
  'COPYWRITING',
  'AI_ASSISTED',
  'AI_GENERATED',
] as const

export type SourceKind = (typeof SOURCE_KINDS)[number]

/** A source kind this module does not recognise renders as unverified. */
export const UNVERIFIED_SOURCE_KIND = 'UNVERIFIED' as const

/** Source senses mirrored from `SOURCE_SENSES` in `./seed.ts`. */
export const SOURCE_SENSES = ['ORIGINAL_ARABIC', 'LICENSED_TRANSLATION'] as const

export type SourceSense = (typeof SOURCE_SENSES)[number]

/** Display categories for review duties that already exist in the repository. */
export const REVIEWER_SCOPE_CODES = ['SOURCE', 'RIGHTS', 'LANGUAGE', 'EDITORIAL', 'RESEARCH'] as const

export type ReviewerScopeCode = (typeof REVIEWER_SCOPE_CODES)[number]

/** AI involvement states; `UNKNOWN` and a missing field both render unrecorded. */
export const AI_INVOLVEMENT_STATES = ['NONE', 'ASSISTED', 'GENERATED', 'UNKNOWN'] as const

export type AiInvolvementState = (typeof AI_INVOLVEMENT_STATES)[number]

export const SOURCE_PROVENANCE_CLASSES = ['ORIGINAL', 'DERIVATIVE', 'UNVERIFIED'] as const

export type SourceProvenanceClass = (typeof SOURCE_PROVENANCE_CLASSES)[number]

/** Machine reasons a label was downgraded or a disclosure was raised. */
export type SourceLabelReason =
  | 'RECORD_INVALID'
  | 'SOURCE_KIND_MISSING'
  | 'SOURCE_KIND_UNRECOGNISED'
  | 'SOURCE_SENSE_UNRECORDED'
  | 'SOURCE_SENSE_UNRECOGNISED'
  | 'SOURCE_SENSE_CONFLICT'
  | 'TRANSLATION'
  | 'THIRD_PARTY_COPYRIGHT'
  | 'COPYWRITING'
  | 'AI_ASSISTED'
  | 'AI_GENERATED'
  | 'AI_INVOLVEMENT_UNRECORDED'
  | 'DERIVATIVE_DECLARED'
  | 'SOURCE_IDENTITY_MISSING'
  | 'REVIEWER_MISSING'
  | 'REVIEWER_SCOPE_MISSING'
  | 'REVIEWER_SCOPE_UNRECOGNISED'

/** Stable catalogue keys; a UI may translate them and must fall back to `text`. */
export type SourceLabelKey =
  | 'recordedOriginal'
  | 'recordedDerivative'
  | 'recordedUnverified'
  | 'displayOriginal'
  | 'displayDerivative'
  | 'displayOriginalUnverified'
  | 'displayUnverified'
  | 'sourceKindOriginal'
  | 'sourceKindTranslation'
  | 'sourceKindThirdPartyCopyright'
  | 'sourceKindCopywriting'
  | 'sourceKindAiAssisted'
  | 'sourceKindAiGenerated'
  | 'sourceKindMissing'
  | 'sourceKindUnrecognised'
  | 'reviewerScopeVerified'
  | 'reviewerScopeNoReviewer'
  | 'reviewerScopeNoScope'
  | 'reviewerScopeUnrecognised'
  | 'sourceIdentityNamed'
  | 'sourceIdentityUnavailable'
  | 'aiDisclosureNone'
  | 'aiDisclosureAssisted'
  | 'aiDisclosureGenerated'
  | 'aiDisclosureUnrecorded'
  | 'translationDisclosureTranslation'
  | 'translationDisclosureNotTranslation'
  | 'translationDisclosureUnrecorded'

/** One stable label: a machine key plus canonical English fallback text. */
export interface SourceLabelText {
  readonly key: SourceLabelKey
  readonly text: string
}

export type ReviewerScopeReason = 'REVIEWER_MISSING' | 'REVIEWER_SCOPE_MISSING' | 'REVIEWER_SCOPE_UNRECOGNISED'

export type ReviewerScopeState = 'VERIFIED' | 'UNVERIFIED'

export interface ReviewerScopeLabel {
  readonly state: ReviewerScopeState
  /** Recognised codes only, de-duplicated and in input order. */
  readonly codes: readonly ReviewerScopeCode[]
  readonly reviewerRef: string | null
  readonly reviewerName: string | null
  /** Null only when the scope is verified. */
  readonly reason: ReviewerScopeReason | null
  readonly label: SourceLabelText
}

export type SourceIdentityState = 'NAMED' | 'UNAVAILABLE'

export interface SourceIdentityLabel {
  readonly state: SourceIdentityState
  /** The named source identity, never inferred from other fields. */
  readonly ref: string | null
  readonly version: string | null
  readonly label: SourceLabelText
}

export type AiDisclosureState = 'NONE' | 'ASSISTED' | 'GENERATED' | 'UNRECORDED'

export interface AiDisclosureLabel {
  readonly state: AiDisclosureState
  readonly label: SourceLabelText
}

export type TranslationDisclosureState = 'TRANSLATION' | 'NOT_A_TRANSLATION' | 'UNRECORDED'

export interface TranslationDisclosureLabel {
  readonly state: TranslationDisclosureState
  readonly label: SourceLabelText
}

/**
 * What the record claims about itself, independent of whether that claim may be
 * displayed as true. `ORIGINAL` here means only "the record names an original
 * source kind"; it is not yet a permission to render the ORIGINAL badge.
 */
export interface SourceLabel {
  readonly schemaVersion: typeof SOURCE_LABEL_SCHEMA_VERSION
  readonly recordedProvenance: SourceProvenanceClass
  readonly recordedProvenanceLabel: SourceLabelText
  /** What a public view may render; never stronger than the evidence. */
  readonly displayProvenance: SourceProvenanceClass
  /** Shorthand for `displayProvenance === 'ORIGINAL'`. */
  readonly mayRenderOriginal: boolean
  readonly badge: SourceLabelText
  readonly sourceKind: SourceKind | typeof UNVERIFIED_SOURCE_KIND
  readonly sourceKindLabel: SourceLabelText
  readonly reviewerScope: ReviewerScopeLabel
  readonly sourceIdentity: SourceIdentityLabel
  readonly aiDisclosure: AiDisclosureLabel
  readonly translationDisclosure: TranslationDisclosureLabel
  /** Why the displayed class is not stronger, in a stable order. */
  readonly reasons: readonly SourceLabelReason[]
}

/**
 * One review/source record as supplied by a caller. Every field is optional:
 * absence is a displayable state, never an error and never a positive.
 */
export interface ReviewSourceRecord {
  /** One of `SOURCE_KINDS`; an unrecognised value renders unverified. */
  readonly sourceKind?: string | null
  /** One of `SOURCE_SENSES`; required to display ORIGINAL. */
  readonly sourceSense?: string | null
  /** Identity of the source this record reads or derives from. */
  readonly sourceRef?: string | null
  /** Exact source version, displayed beside `sourceRef` when present. */
  readonly sourceVersion?: string | null
  /** Explicit derivation pointer; takes precedence over `sourceRef`. */
  readonly derivedFromRef?: string | null
  /** One of `AI_INVOLVEMENT_STATES`; `NONE` is a positive declaration. */
  readonly aiInvolvement?: string | null
  /** Named human reviewer; required to verify any scope. */
  readonly reviewerRef?: string | null
  /** Optional display name for the named reviewer. */
  readonly reviewerName?: string | null
  /** Recognised `REVIEWER_SCOPE_CODES`; a single scope is a one-item list. */
  readonly reviewerScopes?: readonly string[] | null
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isKnown<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value)
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 0x1f || code === 0x7f) return true
  }
  return false
}

/**
 * Trim surrounding whitespace and refuse control characters so a label cannot
 * be split, spoofed or made unreadable by an identifier. Interior characters
 * are preserved verbatim; identifiers are displayed as recorded.
 */
function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (hasControlCharacter(trimmed)) return null
  return trimmed
}

function text(key: SourceLabelKey, value: string): SourceLabelText {
  return Object.freeze({ key, text: value })
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  Object.freeze(value)
  for (const nested of Object.values(value as UnknownRecord)) deepFreeze(nested)
  return value
}

class ReasonList {
  private readonly items: SourceLabelReason[] = []

  add(reason: SourceLabelReason | null): void {
    if (reason === null) return
    if (!this.items.includes(reason)) this.items.push(reason)
  }

  finish(): readonly SourceLabelReason[] {
    return Object.freeze([...this.items])
  }
}

function recordedLabel(recorded: SourceProvenanceClass): SourceLabelText {
  if (recorded === 'ORIGINAL') return text('recordedOriginal', 'Recorded: original source')
  if (recorded === 'DERIVATIVE') return text('recordedDerivative', 'Recorded: derivative')
  return text('recordedUnverified', 'Recorded: source provenance unverified')
}

function displayLabel(recorded: SourceProvenanceClass, display: SourceProvenanceClass): SourceLabelText {
  if (display === 'ORIGINAL') return text('displayOriginal', 'ORIGINAL SOURCE')
  if (display === 'DERIVATIVE') return text('displayDerivative', 'DERIVATIVE — NOT ORIGINAL SOURCE')
  if (recorded === 'ORIGINAL') {
    return text('displayOriginalUnverified', 'ORIGINAL CLAIM UNVERIFIED — NOT SHOWN AS ORIGINAL')
  }
  return text('displayUnverified', 'SOURCE PROVENANCE UNVERIFIED')
}

function sourceKindLabel(
  kind: SourceKind | typeof UNVERIFIED_SOURCE_KIND,
  rawKind: string | null,
): SourceLabelText {
  switch (kind) {
    case 'ORIGINAL_SOURCE':
      return text('sourceKindOriginal', 'Original source text')
    case 'LICENSED_TRANSLATION':
      return text('sourceKindTranslation', 'Licensed translation')
    case 'THIRD_PARTY_COPYRIGHT':
      return text('sourceKindThirdPartyCopyright', 'Third-party copyrighted content')
    case 'COPYWRITING':
      return text('sourceKindCopywriting', 'Editorial copywriting')
    case 'AI_ASSISTED':
      return text('sourceKindAiAssisted', 'AI-assisted draft')
    case 'AI_GENERATED':
      return text('sourceKindAiGenerated', 'AI-generated text')
    case 'UNVERIFIED':
      if (rawKind === null) return text('sourceKindMissing', 'Source kind not recorded')
      return text('sourceKindUnrecognised', `Unrecognised source kind: ${rawKind}`)
  }
}

function aiLabel(state: AiDisclosureState): SourceLabelText {
  switch (state) {
    case 'NONE':
      return text('aiDisclosureNone', 'AI involvement: none recorded')
    case 'ASSISTED':
      return text('aiDisclosureAssisted', 'AI-ASSISTED — NOT ORIGINAL SOURCE')
    case 'GENERATED':
      return text('aiDisclosureGenerated', 'AI-GENERATED — NOT ORIGINAL SOURCE')
    case 'UNRECORDED':
      return text('aiDisclosureUnrecorded', 'AI INVOLVEMENT UNRECORDED — ORIGINAL STATUS UNVERIFIED')
  }
}

function reasonForAiState(state: AiDisclosureState): SourceLabelReason | null {
  if (state === 'GENERATED') return 'AI_GENERATED'
  if (state === 'ASSISTED') return 'AI_ASSISTED'
  if (state === 'UNRECORDED') return 'AI_INVOLVEMENT_UNRECORDED'
  return null
}

function translationLabel(state: TranslationDisclosureState): SourceLabelText {
  switch (state) {
    case 'TRANSLATION':
      return text('translationDisclosureTranslation', 'TRANSLATION — NOT THE ORIGINAL-LANGUAGE TEXT')
    case 'NOT_A_TRANSLATION':
      return text('translationDisclosureNotTranslation', 'Not recorded as a translation')
    case 'UNRECORDED':
      return text('translationDisclosureUnrecorded', 'Source sense unrecorded — translation status unverified')
  }
}

interface ReviewerScopeResult {
  readonly state: ReviewerScopeState
  readonly codes: readonly ReviewerScopeCode[]
  readonly reviewerRef: string | null
  readonly reviewerName: string | null
  readonly reason: ReviewerScopeReason | null
  readonly label: SourceLabelText
}

function reviewerScopeFor(raw: UnknownRecord, reasons: ReasonList): ReviewerScopeResult {
  const reviewerRef = cleanText(raw.reviewerRef)
  const reviewerName = cleanText(raw.reviewerName)
  const rawScopes = Array.isArray(raw.reviewerScopes) ? raw.reviewerScopes : null

  const codes: ReviewerScopeCode[] = []
  const unrecognised: string[] = []
  let unrecognisedEntry = false
  if (rawScopes !== null) {
    for (const entry of rawScopes) {
      const cleaned = cleanText(entry)
      if (cleaned !== null && isKnown(REVIEWER_SCOPE_CODES, cleaned)) {
        if (!codes.includes(cleaned)) codes.push(cleaned)
      } else {
        unrecognisedEntry = true
        if (cleaned !== null) unrecognised.push(cleaned)
      }
    }
  }

  const missingScope = rawScopes === null || rawScopes.length === 0
  let reason: ReviewerScopeReason | null = null
  if (reviewerRef === null) reason = 'REVIEWER_MISSING'
  else if (missingScope) reason = 'REVIEWER_SCOPE_MISSING'
  else if (unrecognisedEntry) reason = 'REVIEWER_SCOPE_UNRECOGNISED'

  if (reason !== null) {
    reasons.add(reason)
    if (reason === 'REVIEWER_MISSING') {
      return {
        state: 'UNVERIFIED',
        codes: Object.freeze(codes),
        reviewerRef,
        reviewerName,
        reason,
        label: text('reviewerScopeNoReviewer', 'REVIEWER SCOPE UNVERIFIED — no named reviewer recorded'),
      }
    }
    if (reason === 'REVIEWER_SCOPE_MISSING') {
      return {
        state: 'UNVERIFIED',
        codes: Object.freeze(codes),
        reviewerRef,
        reviewerName,
        reason,
        label: text('reviewerScopeNoScope', 'REVIEWER SCOPE UNVERIFIED — no review scope recorded'),
      }
    }
    const named = unrecognised.length > 0 ? `: ${unrecognised.join(', ')}` : ''
    return {
      state: 'UNVERIFIED',
      codes: Object.freeze(codes),
      reviewerRef,
      reviewerName,
      reason,
      label: text(
        'reviewerScopeUnrecognised',
        `REVIEWER SCOPE UNVERIFIED — unrecognised scope${named}`,
      ),
    }
  }

  return {
    state: 'VERIFIED',
    codes: Object.freeze(codes),
    reviewerRef,
    reviewerName,
    reason: null,
    label: text('reviewerScopeVerified', `Reviewer scope: ${codes.join(', ')}`),
  }
}

interface SourceIdentityResult {
  readonly state: SourceIdentityState
  readonly ref: string | null
  readonly version: string | null
  readonly label: SourceLabelText
}

function sourceIdentityFor(raw: UnknownRecord, reasons: ReasonList): SourceIdentityResult {
  const ownRef = cleanText(raw.sourceRef)
  const derivedFrom = cleanText(raw.derivedFromRef)
  const ref = derivedFrom ?? ownRef
  const version = cleanText(raw.sourceVersion)
  if (ref === null) {
    reasons.add('SOURCE_IDENTITY_MISSING')
    return {
      state: 'UNAVAILABLE',
      ref: null,
      version: null,
      label: text('sourceIdentityUnavailable', 'SOURCE UNAVAILABLE — no source identity recorded'),
    }
  }
  const display = version === null ? ref : `${ref}@${version}`
  return {
    state: 'NAMED',
    ref,
    version,
    label: text('sourceIdentityNamed', `Source identity: ${display}`),
  }
}

function unverifiedLabel(reasons: readonly SourceLabelReason[], invalidRecord: boolean): SourceLabel {
  const reviewerScope: ReviewerScopeLabel = {
    state: 'UNVERIFIED',
    codes: Object.freeze([]),
    reviewerRef: null,
    reviewerName: null,
    reason: 'REVIEWER_MISSING',
    label: text('reviewerScopeNoReviewer', 'REVIEWER SCOPE UNVERIFIED — no named reviewer recorded'),
  }
  const sourceIdentity: SourceIdentityLabel = {
    state: 'UNAVAILABLE',
    ref: null,
    version: null,
    label: text('sourceIdentityUnavailable', 'SOURCE UNAVAILABLE — no source identity recorded'),
  }
  const aiDisclosure: AiDisclosureLabel = {
    state: 'UNRECORDED',
    label: aiLabel('UNRECORDED'),
  }
  const translationDisclosure: TranslationDisclosureLabel = {
    state: 'UNRECORDED',
    label: translationLabel('UNRECORDED'),
  }
  const sourceKindLabelValue = invalidRecord
    ? text('sourceKindUnrecognised', 'Unrecognised source kind: malformed record')
    : text('sourceKindMissing', 'Source kind not recorded')
  return deepFreeze({
    schemaVersion: SOURCE_LABEL_SCHEMA_VERSION,
    recordedProvenance: 'UNVERIFIED' as const,
    recordedProvenanceLabel: recordedLabel('UNVERIFIED'),
    displayProvenance: 'UNVERIFIED' as const,
    mayRenderOriginal: false,
    badge: displayLabel('UNVERIFIED', 'UNVERIFIED'),
    sourceKind: UNVERIFIED_SOURCE_KIND,
    sourceKindLabel: sourceKindLabelValue,
    reviewerScope,
    sourceIdentity,
    aiDisclosure,
    translationDisclosure,
    reasons,
  })
}

/**
 * Turn one review/source record into fail-closed display labels.
 *
 * Total and deterministic: any input — including null, an array or a malformed
 * record — returns a frozen label and never throws. The function reads only its
 * argument, copies every array it returns and cannot mutate the caller's
 * object. `mayRenderOriginal` is true only under the full positive gate in the
 * module header; every other record renders DERIVATIVE or UNVERIFIED with at
 * least one machine reason.
 */
export function buildSourceLabel(record: unknown): SourceLabel {
  if (!isRecord(record)) {
    return unverifiedLabel(
      Object.freeze(['RECORD_INVALID', 'SOURCE_IDENTITY_MISSING', 'REVIEWER_MISSING'] as const),
      true,
    )
  }
  const raw = record
  const reasons = new ReasonList()

  const rawKind = cleanText(raw.sourceKind)
  const kind: SourceKind | null = isKnown(SOURCE_KINDS, rawKind) ? rawKind : null
  if (rawKind === null) reasons.add('SOURCE_KIND_MISSING')
  else if (kind === null) reasons.add('SOURCE_KIND_UNRECOGNISED')

  const rawSense = cleanText(raw.sourceSense)
  const sense: SourceSense | null = isKnown(SOURCE_SENSES, rawSense) ? rawSense : null
  const senseIsOriginal = sense === 'ORIGINAL_ARABIC'
  const senseIsTranslation = sense === 'LICENSED_TRANSLATION'
  const derivedFrom = cleanText(raw.derivedFromRef)
  const derivedDeclared = derivedFrom !== null

  // AI involvement: the source kind can force it; otherwise only an explicit
  // NONE is a positive declaration. UNKNOWN and a missing field are unrecorded.
  const declaredAi: AiInvolvementState | null = isKnown(AI_INVOLVEMENT_STATES, raw.aiInvolvement)
    ? raw.aiInvolvement
    : null
  let aiState: AiDisclosureState
  if (kind === 'AI_GENERATED' || declaredAi === 'GENERATED') aiState = 'GENERATED'
  else if (kind === 'AI_ASSISTED' || declaredAi === 'ASSISTED') aiState = 'ASSISTED'
  else if (declaredAi === 'NONE') aiState = 'NONE'
  else aiState = 'UNRECORDED'
  reasons.add(reasonForAiState(aiState))

  // Recorded provenance is what the record declares, before the display gate.
  // Recorded AI involvement makes the output a derivative even when the record
  // also names an original source kind: the generated text is not the source.
  let recorded: SourceProvenanceClass
  if (aiState === 'ASSISTED' || aiState === 'GENERATED') {
    recorded = 'DERIVATIVE'
  } else if (kind === 'ORIGINAL_SOURCE' && !senseIsTranslation && !derivedDeclared) {
    recorded = 'ORIGINAL'
  } else if (
    (kind !== null && kind !== 'ORIGINAL_SOURCE') ||
    senseIsTranslation ||
    derivedDeclared
  ) {
    recorded = 'DERIVATIVE'
  } else {
    recorded = 'UNVERIFIED'
  }

  // Per-kind disclosure reasons.
  if (kind === 'LICENSED_TRANSLATION') reasons.add('TRANSLATION')
  if (kind === 'THIRD_PARTY_COPYRIGHT') reasons.add('THIRD_PARTY_COPYRIGHT')
  if (kind === 'COPYWRITING') reasons.add('COPYWRITING')
  if (kind === 'AI_ASSISTED') reasons.add('AI_ASSISTED')
  if (kind === 'AI_GENERATED') reasons.add('AI_GENERATED')

  // Source sense: translation, conflict, unrecognised, or unrecorded.
  if (senseIsTranslation && kind !== 'LICENSED_TRANSLATION') reasons.add('TRANSLATION')
  if (
    (kind === 'ORIGINAL_SOURCE' && senseIsTranslation) ||
    (kind === 'LICENSED_TRANSLATION' && senseIsOriginal)
  ) {
    reasons.add('SOURCE_SENSE_CONFLICT')
  }
  if (rawSense === null) reasons.add('SOURCE_SENSE_UNRECORDED')
  else if (sense === null) reasons.add('SOURCE_SENSE_UNRECOGNISED')
  if (derivedDeclared) reasons.add('DERIVATIVE_DECLARED')

  // Translation disclosure is separate from source kind so a conflict is named.
  // Either the source kind or the source sense can establish translation.
  const translationState: TranslationDisclosureState =
    senseIsTranslation || kind === 'LICENSED_TRANSLATION'
      ? 'TRANSLATION'
      : senseIsOriginal
        ? 'NOT_A_TRANSLATION'
        : 'UNRECORDED'

  const reviewerScope = reviewerScopeFor(raw, reasons)
  const sourceIdentity = sourceIdentityFor(raw, reasons)

  const fullPositiveGate =
    recorded === 'ORIGINAL' &&
    kind === 'ORIGINAL_SOURCE' &&
    senseIsOriginal &&
    !derivedDeclared &&
    aiState === 'NONE' &&
    sourceIdentity.state === 'NAMED' &&
    reviewerScope.state === 'VERIFIED'

  const display: SourceProvenanceClass = fullPositiveGate
    ? 'ORIGINAL'
    : recorded === 'DERIVATIVE'
      ? 'DERIVATIVE'
      : 'UNVERIFIED'

  const sourceKindValue = kind ?? UNVERIFIED_SOURCE_KIND
  return deepFreeze({
    schemaVersion: SOURCE_LABEL_SCHEMA_VERSION,
    recordedProvenance: recorded,
    recordedProvenanceLabel: recordedLabel(recorded),
    displayProvenance: display,
    mayRenderOriginal: display === 'ORIGINAL',
    badge: displayLabel(recorded, display),
    sourceKind: sourceKindValue,
    sourceKindLabel: sourceKindLabel(sourceKindValue, rawKind),
    reviewerScope,
    sourceIdentity,
    aiDisclosure: {
      state: aiState,
      label: aiLabel(aiState),
    },
    translationDisclosure: {
      state: translationState,
      label: translationLabel(translationState),
    },
    reasons: reasons.finish(),
  })
}
