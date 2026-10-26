import {
  CLEARED_RIGHTS,
  KEY_SCHEME,
  QUALITY_DIMENSIONS,
  SRGBL_LEVELS,
  STAGE_LIMITS,
  STAGE_NAMES,
  STAGE_QUESTIONS,
  SWING_OPERATORS,
  WITNESS_COMPONENT_MAX,
  type SrgbLLevel,
  type StageResult,
  type SwingOperator,
} from './seed.js'

type Row = Record<string, unknown>

export const nonEmpty = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null
export const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
export const isSha256 = (value: unknown): boolean =>
  typeof value === 'string' && /^[0-9a-f]{64}$/.test(value)

export interface StageEvaluation {
  stage: SrgbLLevel
  name: string
  question: string
  cannotProve: string
  status: StageResult
  code: string
  reason: string
  evidenceRefs: string[]
}

export interface MaturityResult {
  verifiedLevel: SrgbLLevel | null
  score: number
  max: 15
  nextLevel: SrgbLLevel | null
  pending: SrgbLLevel[]
}

export interface DirectionItem {
  id: string
  direction: number
  intensity: number
  confidence: number
  weight: number
}

export interface DirectionResult {
  status: 'scored' | 'unknown'
  value: number | null
  range: readonly [-2, 2]
  count: number
  reason?: string
}

export interface WitnessScore {
  raw: number
  max: 100
  reviewEligibility: 'eligible-for-review' | 'needs-more-evidence'
  automaticCanonicalApproval: false
}

export interface OffsideInput {
  agent?: unknown
  recipient?: unknown
  domain?: unknown
  scope?: unknown
  genre?: unknown
}

export interface SwingCandidate {
  signature: string
  operator: SwingOperator
  subject: string
  relation: string
  object: string
  depth: number
  state: 'CANDIDATE'
  evidenceStatus: 'UNVERIFIED'
  inheritedScore: null
}

export interface SwingChainResult {
  candidates: SwingCandidate[]
  stop: 'complete' | 'duplicate-candidate' | 'cycle'
}

const FRAME_FIELDS = ['agent', 'recipient', 'domain', 'scope', 'genre'] as const

const stage = (
  level: SrgbLLevel,
  status: StageResult,
  code: string,
  reason: string,
  evidenceRefs: string[] = [],
): StageEvaluation => ({
  stage: level,
  name: STAGE_NAMES[level],
  question: STAGE_QUESTIONS[level],
  cannotProve: STAGE_LIMITS[level],
  status,
  code,
  reason,
  evidenceRefs,
})

/** Only a contiguous supported prefix earns maturity; a gap stops accumulation. */
export function scoreMaturity(states: Partial<Record<SrgbLLevel, StageResult>>): MaturityResult {
  let reached = 0
  for (const level of SRGBL_LEVELS) {
    if (states[level] !== 'PASS') break
    reached++
  }
  return {
    verifiedLevel: reached ? SRGBL_LEVELS[reached - 1] ?? null : null,
    score: (reached * (reached + 1)) / 2,
    max: 15,
    nextLevel: reached === 5 ? null : SRGBL_LEVELS[reached] ?? null,
    pending: SRGBL_LEVELS.slice(reached),
  }
}

/**
 * Frame direction of declared assessments. A zero denominator is UNKNOWN, never
 * a neutral score, so no evidence weight cannot silently read as agreement.
 */
export function scoreDirection(items: readonly DirectionItem[]): DirectionResult {
  if (!Array.isArray(items)) throw new TypeError('direction items must be an array')
  const ids = new Set<string>()
  let numerator = 0
  let denominator = 0
  for (const item of items) {
    if (!nonEmpty(item.id) || ids.has(item.id)) throw new TypeError('assessment IDs must be unique and nonblank')
    ids.add(item.id)
    if (!Number.isInteger(item.direction) || item.direction < -2 || item.direction > 2) {
      throw new RangeError('direction must be -2..2')
    }
    if (!Number.isInteger(item.intensity) || item.intensity < 1 || item.intensity > 3) {
      throw new RangeError('intensity must be 1..3')
    }
    if (!Number.isFinite(item.confidence) || item.confidence < 0 || item.confidence > 1) {
      throw new RangeError('confidence must be 0..1')
    }
    if (!Number.isFinite(item.weight) || item.weight < 0) throw new RangeError('weight must be nonnegative')
    const factor = item.intensity * item.weight * item.confidence
    numerator += factor * item.direction
    denominator += factor
  }
  if (denominator === 0) {
    return { status: 'unknown', value: null, range: [-2, 2], count: items.length, reason: 'no positive evidence weight' }
  }
  const value = numerator / denominator
  return {
    status: 'scored',
    value: Math.max(-2, Math.min(2, value)),
    range: [-2, 2],
    count: items.length,
  }
}

/** The 0..40 rubric only exists on a complete, caller-labelled bundle. */
export function scoreQuality(values: unknown): { raw: number; max: 40; dimensions: Record<string, number> } | null {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return null
  const record = values as Record<string, unknown>
  const dimensions: Record<string, number> = {}
  let raw = 0
  for (const key of QUALITY_DIMENSIONS) {
    const value = record[key]
    if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 4) return null
    dimensions[key] = value as number
    raw += value as number
  }
  return { raw, max: 40, dimensions }
}

export function scoreWitness(values: unknown): WitnessScore | null {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return null
  const record = values as Record<string, unknown>
  let raw = 0
  for (const [key, maximum] of Object.entries(WITNESS_COMPONENT_MAX)) {
    const value = record[key]
    if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > maximum) return null
    raw += value as number
  }
  return {
    raw,
    max: 100,
    reviewEligibility: raw >= 70 ? 'eligible-for-review' : 'needs-more-evidence',
    automaticCanonicalApproval: false,
  }
}

/** OFFSIDE names a frame mismatch and proposes a frame; it never edits or approves one. */
export function diagnoseOffside(frame: Row, evidenceFrame: OffsideInput) {
  const missing = FRAME_FIELDS.filter((key) => !nonEmpty(frame[`${key}Label`] ?? frame[key]))
  const differences = FRAME_FIELDS.filter((key) => {
    const proposed = evidenceFrame[key]
    const current = frame[`${key}Label`] ?? frame[key]
    return nonEmpty(proposed) !== null && proposed !== current
  })
  const reason =
    missing.length && differences.length
      ? 'frame_incomplete_and_evidence_mismatch'
      : missing.length
        ? 'frame_incomplete'
        : differences.length
          ? 'evidence_mismatch'
          : 'no-mismatch'
  const proposedFrame: Record<string, string> = {}
  for (const key of FRAME_FIELDS) {
    const current = nonEmpty(frame[`${key}Label`] ?? frame[key])
    const proposed = nonEmpty(evidenceFrame[key])
    if (current) proposedFrame[key] = current
    if (differences.includes(key) && proposed) proposedFrame[key] = proposed
  }
  return {
    status:
      missing.length || differences.length ? ('candidate-offside' as const) : ('no-detected-mismatch' as const),
    reason,
    missing,
    differences,
    proposedFrame,
    verified: false as const,
    notice: 'A proposed frame is for human examination only. It never changes the stored frame and never means divine approval.',
  }
}

const SWING_TRANSFORMS: Record<SwingOperator, (relation: string, subject: string, object: string) => [string, string, string]> = {
  direction: (relation, subject, object) => [object, `candidate-inverse-of:${relation}`, subject],
  polarity: (relation, subject, object) => [subject, `candidate-negation-of:${relation}`, object],
  'subject-object': (relation, subject, object) => [object, `candidate-object-perspective-of:${relation}`, subject],
  'cause-effect': (relation, subject, object) => [object, 'candidate-possible-cause-of', subject],
  perspective: (relation, subject, object) => [object, `candidate-perspective-of:${relation}`, subject],
  temporal: (relation, subject, object) => [object, `candidate-retrospective-of:${relation}`, subject],
  'semantic-opposition': (relation, subject, object) => [subject, `candidate-opposition-of:${relation}`, object],
}

/** A SWING hop is a question/candidate only; reversal never inherits truth or score. */
export function proposeSwing(request: {
  operator: SwingOperator
  subject: string
  relation: string
  object: string
  depth: number
  seenSignatures?: readonly string[]
  seenRelations?: ReadonlyArray<{ subject: string; relation: string; object: string }>
}): SwingCandidate {
  const { operator, subject, relation, object, depth } = request
  if (!(SWING_OPERATORS as readonly string[]).includes(operator)) throw new RangeError('invalid swing operator')
  if (!Number.isInteger(depth) || depth < 1 || depth > 3) throw new RangeError('maximum swing depth is 3')
  if (![subject, relation, object].every((value) => typeof value === 'string' && value.trim())) {
    throw new TypeError('subject, relation and object are required')
  }
  const [nextSubject, nextRelation, nextObject] = SWING_TRANSFORMS[operator](relation.trim(), subject.trim(), object.trim())
  const signature = JSON.stringify([operator, nextSubject, nextRelation, nextObject])
  if (request.seenSignatures?.includes(signature)) throw new RangeError('swing duplicate candidate')
  const relationKey = (triple: { subject: string; relation: string; object: string }) =>
    JSON.stringify([triple.subject, triple.relation, triple.object])
  const nextKey = relationKey({ subject: nextSubject, relation: nextRelation, object: nextObject })
  if (request.seenRelations?.some((item) => relationKey(item) === nextKey)) {
    throw new RangeError('swing cycle detected')
  }
  return {
    signature,
    operator,
    subject: nextSubject,
    relation: nextRelation,
    object: nextObject,
    depth,
    state: 'CANDIDATE',
    evidenceStatus: 'UNVERIFIED',
    inheritedScore: null,
  }
}

export function proposeSwingChain(
  start: { subject: string; relation: string; object: string },
  operators: readonly SwingOperator[],
): SwingChainResult {
  if (![start.subject, start.relation, start.object].every((value) => typeof value === 'string' && value.trim())) {
    throw new TypeError('starting subject, relation and object are required')
  }
  if (!Array.isArray(operators) || operators.length > 3) throw new RangeError('maximum swing depth is 3')
  const candidates: SwingCandidate[] = []
  const seenSignatures: string[] = []
  const seenRelations = [{ ...start }]
  let current = { ...start }
  for (let index = 0; index < operators.length; index++) {
    try {
      const candidate = proposeSwing({
        operator: operators[index] as SwingOperator,
        ...current,
        depth: index + 1,
        seenSignatures,
        seenRelations,
      })
      candidates.push(candidate)
      seenSignatures.push(candidate.signature)
      const relation = { subject: candidate.subject, relation: candidate.relation, object: candidate.object }
      seenRelations.push(relation)
      current = relation
    } catch (error) {
      if (error instanceof RangeError && error.message === 'swing duplicate candidate') {
        return { candidates, stop: 'duplicate-candidate' }
      }
      if (error instanceof RangeError && error.message === 'swing cycle detected') return { candidates, stop: 'cycle' }
      throw error
    }
  }
  return { candidates, stop: 'complete' }
}

// --------------------------------------------------------------- stage gates

function findById(rows: Row[], id: unknown): Row | null {
  const needle = nonEmpty(id)
  if (!needle) return null
  return rows.find((row) => String(row.id) === needle) ?? null
}

function evaluateS1(
  caseRow: Row,
  editions: Row[],
  passages: Row[],
  translations: Row[],
): StageEvaluation {
  const edition = findById(editions, caseRow.editionRef)
  const passage = findById(passages, caseRow.passageRef)
  if (!edition) {
    return stage('S1', 'UNKNOWN', 'EDITION_UNRESOLVED', 'No corpus edition record resolves for this case; the source stays unknown.')
  }
  if (!passage) {
    return stage('S1', 'UNKNOWN', 'PASSAGE_UNRESOLVED', 'No corpus passage record resolves for this case; no text claim may be supported.')
  }
  const editionId = String(edition.id)
  if (String(passage.editionRef) !== editionId) {
    return stage('S1', 'FAIL', 'EDITION_MISMATCH', 'The passage belongs to a different edition than the case declares.')
  }
  if (passage.citationKey !== caseRow.citationKey) {
    return stage('S1', 'FAIL', 'CITATION_MISMATCH', 'The resolved passage address differs from the case citation key.')
  }
  const rights = nonEmpty(edition.rightsStatus) ?? 'RIGHTS_UNKNOWN'
  if (rights !== CLEARED_RIGHTS) {
    const unresolved = rights === 'RIGHTS_UNKNOWN' || rights === 'METADATA_ONLY'
    return stage(
      'S1',
      unresolved ? 'UNKNOWN' : 'FAIL',
      unresolved ? 'RIGHTS_UNRESOLVED' : 'RIGHTS_BLOCKED',
      `Edition rights are ${rights}; bytes may not be used for a supported claim.`,
    )
  }
  if (caseRow.rightsSnapshot !== rights) {
    return stage('S1', 'FAIL', 'RIGHTS_SNAPSHOT_MISMATCH', 'The case rights snapshot disagrees with the edition record.')
  }
  if (!isSha256(caseRow.evidenceSha)) {
    return stage('S1', 'UNKNOWN', 'EVIDENCE_SHA_MISSING', 'No exact 64-hex source digest is declared for this case.')
  }
  if (!isSha256(edition.provenanceSha)) {
    return stage('S1', 'UNKNOWN', 'PROVENANCE_SHA_MISSING', 'The edition has no exact provenance digest to compare against.')
  }
  if (caseRow.evidenceSha !== edition.provenanceSha) {
    return stage('S1', 'FAIL', 'EVIDENCE_SHA_MISMATCH', 'The case digest does not match the edition provenance SHA.')
  }
  const sense = nonEmpty(caseRow.sourceSense)
  const evidenceRefs = [String(edition.code), `${String(passage.citationKey)}@${String(edition.code)}`, String(edition.provenanceSha)]
  if (sense === 'ORIGINAL_ARABIC') {
    if (!nonEmpty(passage.arabicText)) {
      return stage('S1', 'UNKNOWN', 'SOURCE_BYTES_UNAVAILABLE', 'The original passage bytes are unavailable for this edition.')
    }
    return stage('S1', 'PASS', 'EXACT_EDITION_SOURCE', 'Edition, rights, exact SHA and original source sense resolve.', evidenceRefs)
  }
  if (sense === 'LICENSED_TRANSLATION') {
    const translation = findById(translations, caseRow.translationRef)
    if (!translation) {
      return stage('S1', 'UNKNOWN', 'TRANSLATION_UNRESOLVED', 'The declared translation sense has no resolved translation record.')
    }
    if (String(translation.passageRef) !== String(passage.id)) {
      return stage('S1', 'FAIL', 'TRANSLATION_PASSAGE_MISMATCH', 'The translation belongs to a different passage.')
    }
    const translationRights = nonEmpty(translation.rightsStatus) ?? 'RIGHTS_UNKNOWN'
    if (translationRights !== CLEARED_RIGHTS) {
      return stage(
        'S1',
        translationRights === 'RIGHTS_UNKNOWN' ? 'UNKNOWN' : 'FAIL',
        'TRANSLATION_RIGHTS_UNRESOLVED',
        `Translation rights are ${translationRights}; the translation sense stays blocked.`,
      )
    }
    if (!nonEmpty(translation.translationText)) {
      return stage('S1', 'UNKNOWN', 'TRANSLATION_BYTES_UNAVAILABLE', 'The licensed translation bytes are unavailable.')
    }
    return stage('S1', 'PASS', 'EXACT_EDITION_TRANSLATION', 'Edition, rights, exact SHA and licensed translation sense resolve.', [
      ...evidenceRefs,
      String(translation.code),
    ])
  }
  return stage('S1', 'UNKNOWN', 'SOURCE_SENSE_UNDECLARED', 'The case does not declare whether it reads original text or a translation.')
}

function evaluateR2(caseRow: Row, claims: Row[], translationResolved: boolean): StageEvaluation {
  if (!claims.length) {
    return stage('R2', 'UNKNOWN', 'NO_TEXT_CLAIMS', 'No R2 text claim is registered for this case.')
  }
  for (const claim of claims) {
    if (claim.status !== 'SUPPORTED') continue
    const code = String(claim.claimCode)
    if (claim.representation === 'INFERENCE') {
      return stage('R2', 'FAIL', 'INFERENCE_AS_EVIDENCE', `${code} is an inference and can never be a supported text claim.`)
    }
    if (claim.epistemic !== 'OBSERVED_TEXT') {
      return stage('R2', 'FAIL', 'INFERENCE_PROMOTED', `${code} is ${String(claim.epistemic)} but is marked supported.`)
    }
    if (!nonEmpty(claim.evidenceSpan)) {
      return stage('R2', 'FAIL', 'EVIDENCE_SPAN_MISSING', `${code} is supported without an exact evidence span.`)
    }
    if (!isSha256(claim.evidenceSha) || claim.evidenceSha !== caseRow.evidenceSha) {
      return stage('R2', 'FAIL', 'EVIDENCE_SHA_MISMATCH', `${code} does not cite the case's exact source digest.`)
    }
    if (claim.citationKey !== caseRow.citationKey) {
      return stage('R2', 'FAIL', 'CITATION_MISMATCH', `${code} cites a different passage than the case.`)
    }
    if (claim.representation === 'TRANSLATION' && (caseRow.sourceSense !== 'LICENSED_TRANSLATION' || !translationResolved)) {
      return stage('R2', 'FAIL', 'TRANSLATION_AS_SOURCE', `${code} presents translation text outside a resolved translation sense.`)
    }
    if (claim.representation === 'SOURCE_TEXT' && caseRow.sourceSense !== 'ORIGINAL_ARABIC') {
      return stage('R2', 'FAIL', 'SOURCE_SENSE_MISMATCH', `${code} claims source text while the case declares another source sense.`)
    }
  }
  const supported = claims.filter((claim) => claim.status === 'SUPPORTED' && claim.epistemic === 'OBSERVED_TEXT')
  if (!supported.length) {
    return stage('R2', 'UNKNOWN', 'NO_SUPPORTED_TEXT_CLAIM', 'Claims exist but none is a supported observation of the text.')
  }
  const inferred = claims.filter((claim) => claim.epistemic !== 'OBSERVED_TEXT').length
  return stage('R2', 'PASS', 'TEXT_CLAIMS_GROUNDED', `${supported.length} observed text claim(s) cite the exact source; ${inferred} inference(s) stay unpromoted.`, supported.map((claim) => String(claim.claimCode)))
}

function evaluateG3(caseRow: Row, relations: Row[], claims: Row[]): StageEvaluation {
  if (!relations.length) {
    return stage('G3', 'UNKNOWN', 'NO_RELATIONS', 'No G3 relation is registered for this case.')
  }
  const claimById = new Map(claims.map((claim) => [String(claim.id), claim]))
  let defensible = 0
  let speculative = 0
  for (const relation of relations) {
    const code = String(relation.relationCode)
    const from = claimById.get(String(relation.fromClaimRef))
    const to = claimById.get(String(relation.toClaimRef))
    if (!from || !to) {
      return stage('G3', 'FAIL', 'DANGLING_CLAIM', `${code} cites a claim that does not exist.`)
    }
    if (String(from.caseRef) !== String(relation.caseRef) || String(to.caseRef) !== String(relation.caseRef)) {
      return stage('G3', 'FAIL', 'CROSS_CASE_RELATION', `${code} links claims from another case.`)
    }
    if (relation.relationType === 'CORRECTS_WITHIN_FRAME' && relation.lens === 'COMPARATIVE_NEUTRAL') {
      return stage('G3', 'FAIL', 'NEUTRAL_CORRECTION', `${code} presents a correction as neutral comparison.`)
    }
    if (relation.relationType === 'CORRECTS_WITHIN_FRAME' && !nonEmpty(relation.counterReading)) {
      return stage('G3', 'FAIL', 'COUNTER_READING_MISSING', `${code} does not preserve a competing interpretation.`)
    }
    if (relation.presentedAsSource === true && relation.defensibility !== 'DEFENSIBLE') {
      return stage('G3', 'FAIL', 'SPECULATION_PRESENTED_AS_SOURCE', `${code} presents ${String(relation.defensibility)} as source evidence.`)
    }
    if (relation.defensibility === 'DEFENSIBLE') {
      if (!nonEmpty(relation.evidenceSpan)) {
        return stage('G3', 'FAIL', 'EVIDENCE_SPAN_MISSING', `${code} is defensible without an evidence span.`)
      }
      if (!isSha256(relation.evidenceSha) || relation.evidenceSha !== caseRow.evidenceSha) {
        return stage('G3', 'FAIL', 'EVIDENCE_SHA_MISMATCH', `${code} is defensible without the case's exact source digest.`)
      }
      if (from.epistemic !== 'OBSERVED_TEXT' || to.epistemic !== 'OBSERVED_TEXT') {
        return stage('G3', 'FAIL', 'SPECULATION_PRESENTED_AS_SOURCE', `${code} treats an inference as a defensible text relation.`)
      }
      defensible++
    } else if (relation.defensibility === 'SPECULATIVE') {
      speculative++
    }
  }
  if (!defensible) {
    return stage('G3', 'UNKNOWN', 'NO_DEFENSIBLE_RELATION', 'Relations exist but none reaches defensible evidence.')
  }
  return stage('G3', 'PASS', 'DEFENSIBLE_RELATIONS', `${defensible} defensible relation(s); ${speculative} speculative relation(s) stay separated from source evidence.`, relations.map((relation) => String(relation.relationCode)))
}

function evaluateB4(frames: Row[], actors: Row[]): StageEvaluation {
  if (!frames.length) {
    return stage('B4', 'UNKNOWN', 'NO_FRAME', 'No declared actor/recipient frame exists for this case.')
  }
  const actorIds = new Set(actors.map((actor) => String(actor.id)))
  for (const frame of frames) {
    const code = String(frame.frameCode)
    const missing = ['agentLabel', 'recipientLabel', 'domain', 'scope', 'genre', 'lensNote'].filter(
      (key) => !nonEmpty(frame[key]),
    )
    if (missing.length) {
      return stage('B4', 'FAIL', 'FRAME_INCOMPLETE', `${code} is missing ${missing.join(', ')}.`)
    }
    if (frame.agentBasis === 'ACTOR_REGISTRY') {
      const actorRef = nonEmpty(frame.agentActorRef)
      if (!actorRef || !actorIds.has(actorRef)) {
        return stage('B4', 'FAIL', 'UNSUPPORTED_IDENTITY', `${code} claims an actor identity that does not resolve in the figure registry.`)
      }
    }
    if (frame.agentBasis === 'UNSPECIFIED' && !nonEmpty(frame.agentNote)) {
      return stage('B4', 'FAIL', 'IDENTITY_UNSPECIFIED_WITHOUT_NOTE', `${code} leaves the actor unspecified without a reason.`)
    }
    if (!nonEmpty(frame.lens) || !nonEmpty(frame.lensNote)) {
      return stage('B4', 'FAIL', 'LENS_UNDECLARED', `${code} does not declare its research lens.`)
    }
  }
  return stage('B4', 'PASS', 'FRAMES_DECLARED', `${frames.length} frame(s) declare actor, recipient, context and lens without asserting unsupported identity.`, frames.map((frame) => String(frame.frameCode)))
}

function evaluateL5(caseRow: Row, witnesses: Row[], frames: Row[], claims: Row[]): StageEvaluation {
  if (!witnesses.length) {
    return stage('L5', 'UNKNOWN', 'NO_BOUNDED_READING', 'No Key Witness conclusion is registered for this case.')
  }
  const frameIds = new Set(frames.map((frame) => String(frame.id)))
  const claimIds = new Set(claims.map((claim) => String(claim.id)))
  const conclusions = []
  for (const witness of witnesses) {
    const code = String(witness.witnessCode)
    if (!frameIds.has(String(witness.frameRef))) {
      return stage('L5', 'FAIL', 'FRAME_UNRESOLVED', `${code} is attached to a frame outside this case.`)
    }
    if (!claimIds.has(String(witness.claimRef))) {
      return stage('L5', 'FAIL', 'CLAIM_UNRESOLVED', `${code} is attached to a claim outside this case.`)
    }
    if (witness.claimKind !== 'BOUNDED_DERIVED_READING') {
      return stage('L5', 'FAIL', 'DIVINE_JUDGMENT_FORBIDDEN', `${code} claims ${String(witness.claimKind)}; only a bounded derived reading is allowed.`)
    }
    const required = ['conclusion', 'limits', 'contextNote', 'boundaryNote', 'evidenceRef', 'citationKey'] as const
    const missing = required.filter((key) => !nonEmpty(witness[key]))
    if (missing.length) {
      return stage('L5', 'FAIL', 'CONCLUSION_OR_LIMITS_MISSING', `${code} is missing ${missing.join(', ')}.`)
    }
    if (!isSha256(witness.evidenceSha) || witness.evidenceSha !== caseRow.evidenceSha) {
      return stage('L5', 'FAIL', 'EVIDENCE_SHA_MISMATCH', `${code} does not cite the case's exact source digest.`)
    }
    if (witness.citationKey !== caseRow.citationKey) {
      return stage('L5', 'FAIL', 'CITATION_MISMATCH', `${code} cites a different passage than the case.`)
    }
    conclusions.push({
      witnessCode: code,
      conclusion: witness.conclusion,
      limits: witness.limits,
      boundaryNote: witness.boundaryNote,
      citations: [witness.evidenceRef],
    })
  }
  return stage('L5', 'PASS', 'BOUNDED_READING', `${conclusions.length} cited conclusion(s) carry explicit limits and no divine verdict.`, conclusions.map((entry) => entry.witnessCode))
}

export interface StageInput {
  caseRow: Row
  editions: Row[]
  passages: Row[]
  translations: Row[]
  claims: Row[]
  relations: Row[]
  frames: Row[]
  witnesses: Row[]
  actors: Row[]
}

export function evaluateStages(input: StageInput): {
  stages: Record<SrgbLLevel, StageEvaluation>
  maturity: MaturityResult
} {
  const s1 = evaluateS1(input.caseRow, input.editions, input.passages, input.translations)
  const translationResolved =
    s1.status === 'PASS' && input.caseRow.sourceSense === 'LICENSED_TRANSLATION'
  const r2 =
    s1.status === 'PASS'
      ? evaluateR2(input.caseRow, input.claims, translationResolved)
      : stage('R2', 'UNKNOWN', 'UPSTREAM_S1_NOT_PASS', 'R2 waits for a resolved S1 source gate.')
  const g3 =
    r2.status === 'PASS'
      ? evaluateG3(input.caseRow, input.relations, input.claims)
      : stage('G3', 'UNKNOWN', 'UPSTREAM_R2_NOT_PASS', 'G3 waits for supported R2 text claims.')
  const b4 =
    g3.status === 'PASS'
      ? evaluateB4(input.frames, input.actors)
      : stage('B4', 'UNKNOWN', 'UPSTREAM_G3_NOT_PASS', 'B4 waits for defensible G3 relations.')
  const l5 =
    b4.status === 'PASS'
      ? evaluateL5(input.caseRow, input.witnesses, input.frames, input.claims)
      : stage('L5', 'UNKNOWN', 'UPSTREAM_B4_NOT_PASS', 'L5 waits for a declared B4 frame.')
  const stages = { S1: s1, R2: r2, G3: g3, B4: b4, L5: l5 } as Record<SrgbLLevel, StageEvaluation>
  return {
    stages,
    maturity: scoreMaturity({
      S1: s1.status,
      R2: r2.status,
      G3: g3.status,
      B4: b4.status,
      L5: l5.status,
    }),
  }
}

export interface MetricsInput {
  stages: Record<SrgbLLevel, StageEvaluation>
  caseRow: Row
  quality: Row | null
  witnesses: Row[]
}

export function buildMetrics(input: MetricsInput) {
  const maturity = scoreMaturity(
    Object.fromEntries(SRGBL_LEVELS.map((level) => [level, input.stages[level].status])) as Record<
      SrgbLLevel,
      StageResult
    >,
  )
  const quality = input.quality ? scoreQuality(input.quality) : null
  const assessments = input.witnesses.flatMap((witness) => {
    const score = scoreWitness(witness)
    return score
      ? [{ witnessCode: String(witness.witnessCode), ...score, scale: 'candidate-witness-support' as const }]
      : []
  })
  let direction: DirectionResult
  try {
    direction = scoreDirection(
      input.witnesses.map((witness) => ({
        id: String(witness.witnessCode),
        direction: Number(witness.direction),
        intensity: Number(witness.intensity),
        confidence: Number(witness.confidencePct) / 100,
        weight: Number(witness.weight),
      })),
    )
  } catch {
    direction = { status: 'unknown', value: null, range: [-2, 2], count: input.witnesses.length, reason: 'invalid assessment inputs' }
  }
  return {
    maturity: {
      status: 'scored' as const,
      score: maturity.score,
      max: 15 as const,
      verifiedLevel: maturity.verifiedLevel,
      nextLevel: maturity.nextLevel,
      pending: maturity.pending,
      note: 'Structural stage completeness only; it is not a truth, holiness or salvation score.',
    },
    quality: {
      status: quality ? ('scored' as const) : ('unknown' as const),
      score: quality?.raw ?? null,
      max: 40 as const,
      profile: input.quality ? String(input.quality.profile) : null,
      method: input.quality ? String(input.quality.method) : null,
      dimensions: quality?.dimensions ?? null,
      note: 'Computed only from a complete, caller-labelled 10-dimension bundle; missing is not zero.',
    },
    witness: {
      status: assessments.length ? ('scored' as const) : ('unknown' as const),
      scale: 'candidate-witness-support' as const,
      max: 100 as const,
      assessments,
      aggregate: null,
      note: 'Candidate witness support is not a religion score, approval or truth verdict.',
    },
    direction,
    combined: null,
    ranking: false,
    merged: false,
    note: 'maturity/15, quality/40, witness/100 and direction −2..+2 stay independent; no combined or ranking value exists.',
  }
}

export const KEY_REGISTRY = {
  scheme: KEY_SCHEME,
  status: 'candidate' as const,
  tokens: [
    'mercy',
    'compassion',
    'forgiveness',
    'comfort',
    'justice',
    'truth',
    'accountability',
    'restoration',
    'praise',
    'gratitude',
    'trust',
    'hope',
    'patience',
    'humility',
    'generosity',
    'wisdom',
    'narrative',
    'warning',
    'promise',
    'covenant',
  ] as const,
}
