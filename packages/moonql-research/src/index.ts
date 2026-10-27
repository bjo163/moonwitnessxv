import {
  ADMIN_ONLY,
  ADMIN_FULL,
  bool,
  defineAddon,
  defineModel,
  int,
  m2o,
  sel,
  str,
  text,
  ts,
} from '@moonwitness/moonql'
import { badRequest } from '@moonwitness/core'
import {
  CASE_SEED,
  CLAIM_REPRESENTATIONS,
  CLAIM_SEED,
  CLAIM_STATUSES,
  CLEARED_RIGHTS,
  DECIDED_AT,
  DEFENSIBILITY,
  EPISTEMIC_KINDS,
  FRAME_SEED,
  HYPOTHESIS_MODES,
  HYPOTHESIS_SEED,
  HYPOTHESIS_STATUSES,
  KEY_SCHEME,
  P18_KEY_CANDIDATES,
  QUALITY_DIMENSIONS,
  QUALITY_SEED,
  RELATION_SEED,
  RESEARCH_LENSES,
  REVIEW_STATES,
  RIGHTS_STATUSES,
  SOURCE_SENSES,
  SRGBL_RELATION_TYPES,
  SWING_OPERATORS,
  WITNESS_COMPONENT_MAX,
  WITNESS_SEED,
  type SwingOperator,
} from './seed.js'
import {
  asText,
  diagnoseOffside,
  nonEmpty,
  proposeSwingChain,
  scoreQuality,
  scoreWitness,
} from './gates.js'
import {
  listHypotheses,
  researchCase,
  researchMetrics,
  researchOverview,
  researchTrace,
} from './projection.js'
import {
  assertSha,
  checkInt,
  findCase,
  findCode,
  listAll,
  rejectBlank,
  repo,
  requireText,
  sameId,
  type Orm,
  type Row,
} from './common.js'
import {
  reviewEndpoints,
  reviewHooks,
  reviewModels,
} from './review-subsystem.js'
import { comparativeEndpoints } from './historical-pilot.js'
const caseRows = async ({ orm }: { orm: Orm }) => {
  const [editions, passages, translations] = await Promise.all([
    listAll(orm, 'corpus_editions'),
    listAll(orm, 'corpus_passages'),
    listAll(orm, 'corpus_translations'),
  ])
  return CASE_SEED.map((entry) => {
    const edition = entry.editionCode ? editions.find((row) => row.code === entry.editionCode) ?? null : null
    const passage = passages.find(
      (row) =>
        row.citationKey === entry.citationKey &&
        edition !== null &&
        sameId(row.editionRef, edition.id),
    ) ?? null
    const translation = entry.translationCode
      ? translations.find((row) => row.code === entry.translationCode) ?? null
      : null
    return {
      caseCode: entry.caseCode,
      title: entry.title,
      citationKey: entry.citationKey,
      passageRef: passage ? String(passage.id) : null,
      editionRef: edition ? String(edition.id) : null,
      translationRef: translation ? String(translation.id) : null,
      sourceSense: entry.sourceSense,
      evidenceSha: entry.evidenceSha,
      rightsSnapshot: entry.rightsSnapshot,
      lens: entry.lens,
      researchStatus: entry.researchStatus,
      openedAt: DECIDED_AT,
    }
  })
}

const frameRows = FRAME_SEED.map((frame) => ({
  frameCode: frame.frameCode,
  caseRef: `@research_cases:${frame.caseCode}`,
  agentLabel: frame.agentLabel,
  agentBasis: frame.agentBasis,
  agentActorRef: null,
  agentNote: frame.agentNote,
  recipientLabel: frame.recipientLabel,
  recipientBasis: frame.recipientBasis,
  domain: frame.domain,
  scope: frame.scope,
  genre: frame.genre,
  tradition: frame.tradition,
  lens: frame.lens,
  lensNote: frame.lensNote,
  reviewState: frame.reviewState,
}))

const claimRows = CLAIM_SEED.map((claim) => ({
  claimCode: claim.claimCode,
  caseRef: `@research_cases:${claim.caseCode}`,
  claim: claim.claim,
  level: 'R2',
  epistemic: claim.epistemic,
  representation: claim.representation,
  status: claim.status,
  citationKey: claim.citationKey,
  evidenceSpan: claim.evidenceSpan,
  evidenceSha: claim.evidenceSha,
}))

const relationRows = RELATION_SEED.map((relation) => ({
  relationCode: relation.relationCode,
  caseRef: `@research_cases:${relation.caseCode}`,
  fromClaimRef: `@research_claims:${relation.fromClaimCode}`,
  toClaimRef: `@research_claims:${relation.toClaimCode}`,
  relationType: relation.relationType,
  lens: relation.lens,
  defensibility: relation.defensibility,
  evidenceSpan: relation.evidenceSpan,
  evidenceSha: relation.evidenceSha,
  counterReading: relation.counterReading,
  presentedAsSource: relation.presentedAsSource,
}))

const witnessRows = WITNESS_SEED.map((witness) => ({
  witnessCode: witness.witnessCode,
  caseRef: `@research_cases:${witness.caseCode}`,
  frameRef: `@research_frames:${witness.frameCode}`,
  claimRef: `@research_claims:${witness.claimCode}`,
  keyToken: witness.keyToken,
  scheme: witness.scheme,
  direction: witness.direction,
  intensity: witness.intensity,
  confidencePct: witness.confidencePct,
  weight: witness.weight,
  conclusion: witness.conclusion,
  limits: witness.limits,
  contextNote: witness.contextNote,
  boundaryNote: witness.boundaryNote,
  evidenceRef: witness.evidenceRef,
  citationKey: witness.citationKey,
  evidenceSha: witness.evidenceSha,
  sourceFidelity: witness.sourceFidelity,
  observability: witness.observability,
  semanticConsistency: witness.semanticConsistency,
  crossReference: witness.crossReference,
  nonOverlapping: witness.nonOverlapping,
  claimKind: witness.claimKind,
  reviewState: witness.reviewState,
  humanReviewed: false,
}))

const qualityRows = QUALITY_SEED.map((run) => ({
  runCode: run.runCode,
  caseRef: `@research_cases:${run.caseCode}`,
  method: run.method,
  profile: run.profile,
  sGrounding: run.sGrounding,
  rAccuracy: run.rAccuracy,
  gSupport: run.gSupport,
  bDiscipline: run.bDiscipline,
  lResponsibility: run.lResponsibility,
  provenance: run.provenance,
  unknownHonesty: run.unknownHonesty,
  alternativeCoverage: run.alternativeCoverage,
  confidenceCalibration: run.confidenceCalibration,
  actionUsefulness: run.actionUsefulness,
}))

const hypothesisRows = HYPOTHESIS_SEED.map((hypothesis) => ({
  hypothesisCode: hypothesis.hypothesisCode,
  caseRef: `@research_cases:${hypothesis.caseCode}`,
  frameRef: `@research_frames:${hypothesis.frameCode}`,
  mode: hypothesis.mode,
  operator: hypothesis.operator,
  question: hypothesis.question,
  citationKey: hypothesis.citationKey,
  evidenceSpan: hypothesis.evidenceSpan,
  evidenceSha: hypothesis.evidenceSha,
  lens: hypothesis.lens,
  counterReadings: hypothesis.counterReadings,
  mismatchNote: hypothesis.mismatchNote,
  proposedFrameNote: hypothesis.proposedFrameNote,
  proposedBy: hypothesis.proposedBy,
  status: hypothesis.status,
  selfValidated: hypothesis.selfValidated,
  inheritedScore: hypothesis.inheritedScore,
  independentSourceRef: hypothesis.independentSourceRef,
  validatedBy: hypothesis.validatedBy,
  verificationNote: hypothesis.verificationNote,
  verified: false,
}))

// ------------------------------------------------------------------ helpers

const FRAME_TEXT_FIELDS = ['agentLabel', 'recipientLabel', 'domain', 'scope', 'genre', 'lensNote'] as const
const CLAIM_TEXT_FIELDS = ['claimCode', 'claim', 'citationKey'] as const
const HYPOTHESIS_TEXT_FIELDS = ['question', 'citationKey', 'evidenceSpan', 'lens', 'proposedBy'] as const

function validateFrameRow(row: Row, creating: boolean): void {
  if (creating) requireText(row, FRAME_TEXT_FIELDS, 'research frame')
  else rejectBlank(row, FRAME_TEXT_FIELDS, 'research frame')
  if (creating) requireText(row, ['agentBasis', 'recipientBasis', 'lens'], 'research frame')
  if (row.agentBasis === 'ACTOR_REGISTRY' && !nonEmpty(row.agentActorRef)) {
    throw badRequest('an ACTOR_REGISTRY frame needs a resolved actor reference')
  }
  if (row.agentBasis === 'UNSPECIFIED' && !nonEmpty(row.agentNote)) {
    throw badRequest('an UNSPECIFIED actor needs an explicit reason in agentNote')
  }
}

function validateClaimRow(row: Row, creating: boolean): void {
  if (creating) requireText(row, CLAIM_TEXT_FIELDS, 'R2 claim')
  else rejectBlank(row, CLAIM_TEXT_FIELDS, 'R2 claim')
  if (creating) requireText(row, ['epistemic', 'representation', 'status'], 'R2 claim')
  if (row.representation === 'INFERENCE' && !['INFERRED', 'INTERPRETED'].includes(String(row.epistemic))) {
    throw badRequest('an INFERENCE representation needs an inferred or interpreted epistemic status')
  }
  if (['INFERRED', 'INTERPRETED'].includes(String(row.epistemic)) && row.representation !== 'INFERENCE') {
    throw badRequest('an inferred or interpreted claim must use the INFERENCE representation')
  }
  if (row.status === 'SUPPORTED') {
    if (row.epistemic !== 'OBSERVED_TEXT') throw badRequest('only an observed text claim can be SUPPORTED')
    if (row.representation === 'INFERENCE') throw badRequest('an inference can never be a supported text claim')
    if (!nonEmpty(row.evidenceSpan)) throw badRequest('a supported R2 claim needs an exact evidence span')
    assertSha(row.evidenceSha, 'a supported R2 claim')
  }
}

function validateRelationRow(row: Row, creating: boolean): void {
  if (creating) requireText(row, ['relationCode', 'relationType', 'lens'], 'G3 relation')
  else rejectBlank(row, ['relationCode', 'relationType', 'lens'], 'G3 relation')
  if (row.fromClaimRef !== undefined && row.toClaimRef !== undefined && sameId(row.fromClaimRef, row.toClaimRef)) {
    throw badRequest('a G3 relation needs two different claims')
  }
  if (row.defensibility === 'DEFENSIBLE') {
    if (!nonEmpty(row.evidenceSpan)) throw badRequest('a defensible relation needs an evidence span')
    assertSha(row.evidenceSha, 'a defensible relation')
  }
  if (row.relationType === 'CORRECTS_WITHIN_FRAME') {
    if (row.lens === 'COMPARATIVE_NEUTRAL') throw badRequest('a correction cannot be presented as neutral comparison')
    if (!nonEmpty(row.counterReading)) throw badRequest('a correction must preserve a competing interpretation')
  }
  if (row.presentedAsSource === true && row.defensibility !== 'DEFENSIBLE') {
    throw badRequest('speculation can never be presented as source')
  }
}

function validateWitnessRow(row: Row, creating: boolean): void {
  if (creating) {
    requireText(row, ['witnessCode', 'conclusion', 'limits', 'contextNote', 'boundaryNote', 'evidenceRef', 'citationKey'], 'Key Witness')
    requireText(row, ['keyToken', 'scheme', 'claimKind', 'reviewState'], 'Key Witness')
  } else {
    rejectBlank(row, ['witnessCode', 'conclusion', 'limits', 'contextNote', 'boundaryNote', 'evidenceRef', 'citationKey'], 'Key Witness')
  }
  if (row.claimKind !== undefined && row.claimKind !== 'BOUNDED_DERIVED_READING') {
    throw badRequest('a Key Witness conclusion must be a bounded derived reading, not a divine judgment')
  }
  if (row.humanReviewed === true) {
    throw badRequest('M13 cannot record human review; that path belongs to M14')
  }
  checkInt(row, 'direction', -2, 2, 'Key Witness')
  checkInt(row, 'intensity', 1, 3, 'Key Witness')
  checkInt(row, 'confidencePct', 0, 100, 'Key Witness')
  checkInt(row, 'weight', 0, 1_000_000, 'Key Witness')
  for (const [key, maximum] of Object.entries(WITNESS_COMPONENT_MAX)) {
    checkInt(row, key, 0, maximum, 'Key Witness')
  }
  if (creating || row.evidenceSha !== undefined) assertSha(row.evidenceSha, 'a Key Witness conclusion')
}

function validateQualityRow(row: Row): void {
  requireText(row, ['runCode', 'method', 'profile'], 'quality run')
  for (const key of QUALITY_DIMENSIONS) {
    const value = row[key]
    if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 4) {
      throw badRequest(`quality ${key} must be an integer from 0 to 4`)
    }
  }
}

function validateHypothesisRow(row: Row, creating: boolean): void {
  if (creating) {
    requireText(row, ['hypothesisCode', ...HYPOTHESIS_TEXT_FIELDS, 'mode'], 'research hypothesis')
    assertSha(row.evidenceSha, 'a research hypothesis')
  } else {
    rejectBlank(row, HYPOTHESIS_TEXT_FIELDS, 'research hypothesis')
  }
  if (row.selfValidated === true) throw badRequest('a hypothesis cannot self-validate')
  if (row.inheritedScore !== undefined && row.inheritedScore !== null) {
    throw badRequest('a hypothesis cannot inherit a score from its source relation')
  }
  if (row.verified === true) throw badRequest('a hypothesis is never verified by its generator')
  if (row.mode === 'SWING') {
    if (!(SWING_OPERATORS as readonly string[]).includes(String(row.operator))) {
      throw badRequest('a SWING hypothesis needs one of the seven declared operators')
    }
  }
  if (row.mode === 'POSITIVE_CORRECTION') {
    if (row.lens === 'COMPARATIVE_NEUTRAL') throw badRequest('Positive Correction requires a declared, non-neutral lens')
    if (!nonEmpty(row.counterReadings)) throw badRequest('Positive Correction must preserve competing interpretations')
  }
  if (row.mode === 'OFFSIDE') {
    requireText(row, ['mismatchNote', 'proposedFrameNote'], 'OFFSIDE hypothesis')
  }
  if (row.status === 'CORROBORATED') {
    const validatedBy = nonEmpty(row.validatedBy)
    const proposedBy = nonEmpty(row.proposedBy)
    if (!validatedBy || !proposedBy || validatedBy === proposedBy) {
      throw badRequest('a corroborated hypothesis needs a different validator')
    }
    if (!nonEmpty(row.independentSourceRef)) {
      throw badRequest('a corroborated hypothesis needs an independent source reference')
    }
  }
  if (row.status === 'REJECTED' && !nonEmpty(row.verificationNote)) {
    throw badRequest('a rejected hypothesis needs a verification note')
  }
}

// -------------------------------------------------------------------- addon

export const research = defineAddon({
  name: 'research',
  version: '1.0.0',
  depends: ['base', 'auth', 'corpus', 'actors'],
  models: {
    research_cases: defineModel({
      label: 'Research Case',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Research', icon: 'RC', order: 10 },
      fields: {
        caseCode: str({ maxLength: 60, unique: true }),
        title: str({ maxLength: 200, minLength: 1 }),
        citationKey: str({ maxLength: 60, minLength: 1 }),
        passageRef: m2o('corpus_passages'),
        editionRef: m2o('corpus_editions'),
        translationRef: m2o('corpus_translations'),
        sourceSense: sel(SOURCE_SENSES),
        evidenceSha: str({ maxLength: 64, null: true }),
        rightsSnapshot: sel(RIGHTS_STATUSES),
        lens: sel(RESEARCH_LENSES),
        researchStatus: sel(['OPEN', 'CLOSED', 'WITHDRAWN'], { default: 'OPEN' }),
        openedAt: ts(),
      },
      unique: [['caseCode']],
      data: { matchBy: ['caseCode'], noupdate: true, rows: caseRows },
    }),

    research_frames: defineModel({
      label: 'Research Frame',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Research', icon: 'FR', order: 20 },
      fields: {
        frameCode: str({ maxLength: 60, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        agentLabel: str({ maxLength: 200, minLength: 1 }),
        agentBasis: sel(['TEXTUAL_SPEAKER', 'ACTOR_REGISTRY', 'UNSPECIFIED']),
        agentActorRef: m2o('actor_figures'),
        agentNote: text({ null: true }),
        recipientLabel: str({ maxLength: 200, minLength: 1 }),
        recipientBasis: sel(['TEXTUAL_ADDRESS', 'ACTOR_REGISTRY', 'UNSPECIFIED']),
        domain: str({ maxLength: 200, minLength: 1 }),
        scope: str({ maxLength: 240, minLength: 1 }),
        genre: str({ maxLength: 80, minLength: 1 }),
        tradition: str({ maxLength: 80, null: true }),
        lens: sel(RESEARCH_LENSES),
        lensNote: text(),
        reviewState: sel(REVIEW_STATES, { default: 'ENGINEERING_ONLY' }),
      },
      unique: [['frameCode']],
      data: { matchBy: ['frameCode'], noupdate: true, rows: frameRows },
    }),

    research_claims: defineModel({
      label: 'Research R2 Text Claim',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Research', icon: 'CL', order: 30 },
      fields: {
        claimCode: str({ maxLength: 80, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        claim: text(),
        level: sel(['R2'], { default: 'R2' }),
        epistemic: sel(EPISTEMIC_KINDS),
        representation: sel(CLAIM_REPRESENTATIONS),
        status: sel(CLAIM_STATUSES, { default: 'UNKNOWN' }),
        citationKey: str({ maxLength: 60 }),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
      },
      unique: [['claimCode']],
      data: { matchBy: ['claimCode'], noupdate: true, rows: claimRows },
    }),

    research_relations: defineModel({
      label: 'Research G3 Relation',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Research', icon: 'RL', order: 40 },
      fields: {
        relationCode: str({ maxLength: 100, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        fromClaimRef: m2o('research_claims', { index: true }),
        toClaimRef: m2o('research_claims', { index: true }),
        relationType: sel(SRGBL_RELATION_TYPES),
        lens: sel(RESEARCH_LENSES),
        defensibility: sel(DEFENSIBILITY, { default: 'UNKNOWN' }),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
        counterReading: text({ null: true }),
        presentedAsSource: bool({ default: false }),
      },
      unique: [['relationCode']],
      data: { matchBy: ['relationCode'], noupdate: true, rows: relationRows },
    }),

    research_witnesses: defineModel({
      label: 'Key Witness',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Research', icon: 'KW', order: 50 },
      fields: {
        witnessCode: str({ maxLength: 80, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        frameRef: m2o('research_frames', { index: true }),
        claimRef: m2o('research_claims', { index: true }),
        keyToken: sel(P18_KEY_CANDIDATES),
        scheme: sel([KEY_SCHEME]),
        direction: int(),
        intensity: int(),
        confidencePct: int(),
        weight: int(),
        conclusion: text(),
        limits: text(),
        contextNote: text(),
        boundaryNote: text(),
        evidenceRef: str({ maxLength: 240 }),
        citationKey: str({ maxLength: 60 }),
        evidenceSha: str({ maxLength: 64 }),
        sourceFidelity: int(),
        observability: int(),
        semanticConsistency: int(),
        crossReference: int(),
        nonOverlapping: int(),
        claimKind: sel(['BOUNDED_DERIVED_READING', 'DIVINE_JUDGMENT', 'SALVATION_VERDICT'], {
          default: 'BOUNDED_DERIVED_READING',
        }),
        reviewState: sel(REVIEW_STATES, { default: 'ENGINEERING_ONLY' }),
        humanReviewed: bool({ default: false }),
      },
      unique: [['witnessCode']],
      data: { matchBy: ['witnessCode'], noupdate: true, rows: witnessRows },
    }),

    research_quality_runs: defineModel({
      label: 'Research Quality Run',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Research', icon: 'QR', order: 60 },
      fields: {
        runCode: str({ maxLength: 80, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        method: str({ maxLength: 80 }),
        profile: str({ maxLength: 80 }),
        sGrounding: int(),
        rAccuracy: int(),
        gSupport: int(),
        bDiscipline: int(),
        lResponsibility: int(),
        provenance: int(),
        unknownHonesty: int(),
        alternativeCoverage: int(),
        confidenceCalibration: int(),
        actionUsefulness: int(),
      },
      unique: [['runCode']],
      data: { matchBy: ['runCode'], noupdate: true, rows: qualityRows },
    }),

    research_hypotheses: defineModel({
      label: 'Research Hypotheses',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Research', icon: 'HY', order: 70 },
      fields: {
        hypothesisCode: str({ maxLength: 80, unique: true }),
        caseRef: m2o('research_cases', { index: true }),
        frameRef: m2o('research_frames'),
        mode: sel(HYPOTHESIS_MODES),
        operator: sel(SWING_OPERATORS, { null: true }),
        question: text(),
        citationKey: str({ maxLength: 60 }),
        evidenceSpan: text(),
        evidenceSha: str({ maxLength: 64 }),
        lens: sel(RESEARCH_LENSES),
        counterReadings: text({ null: true }),
        mismatchNote: text({ null: true }),
        proposedFrameNote: text({ null: true }),
        proposedBy: str({ maxLength: 80 }),
        status: sel(HYPOTHESIS_STATUSES, { default: 'CANDIDATE' }),
        selfValidated: bool({ default: false }),
        inheritedScore: int({ null: true }),
        independentSourceRef: str({ maxLength: 240, null: true }),
        validatedBy: str({ maxLength: 80, null: true }),
        verificationNote: text({ null: true }),
        verified: bool({ default: false }),
      },
      unique: [['hypothesisCode']],
      data: { matchBy: ['hypothesisCode'], noupdate: true, rows: hypothesisRows },
    }),

    ...reviewModels,
  },
  hooks: {
    research_cases: {
      beforeCreate: (row) => {
        requireText(row, ['caseCode', 'title', 'citationKey'], 'research case')
        requireText(row, ['sourceSense', 'rightsSnapshot', 'lens'], 'research case')
        if (row.evidenceSha !== undefined) assertSha(row.evidenceSha, 'a research case')
        if (row.rightsSnapshot === CLEARED_RIGHTS) assertSha(row.evidenceSha, 'a cleared research case')
        return row
      },
      beforeUpdate: (patch) => {
        rejectBlank(patch, ['caseCode', 'title', 'citationKey'], 'research case')
        if ('caseCode' in patch || 'citationKey' in patch || 'sourceSense' in patch) {
          throw badRequest('research case identity fields are immutable')
        }
        if (patch.evidenceSha !== undefined) assertSha(patch.evidenceSha, 'a research case')
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research cases are never deleted; close or withdraw them instead')
      },
    },
    research_frames: {
      beforeCreate: (row) => {
        validateFrameRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateFrameRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research frames are never deleted; declare a competing frame instead')
      },
    },
    research_claims: {
      beforeCreate: (row) => {
        validateClaimRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateClaimRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research claims are never deleted; record an UNKNOWN or REJECTED status instead')
      },
    },
    research_relations: {
      beforeCreate: (row) => {
        validateRelationRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateRelationRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research relations are never deleted; mark them UNRESOLVED instead')
      },
    },
    research_witnesses: {
      beforeCreate: (row) => {
        validateWitnessRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateWitnessRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('Key Witness conclusions are never deleted; mark them DISPUTED instead')
      },
    },
    research_quality_runs: {
      beforeCreate: (row) => {
        validateQualityRow(row)
        return row
      },
      beforeUpdate: () => {
        throw badRequest('quality runs are append-only; register a new labelled run instead')
      },
      beforeDelete: () => {
        throw badRequest('quality runs are append-only and cannot be deleted')
      },
    },
    research_hypotheses: {
      beforeCreate: (row) => {
        validateHypothesisRow(row, true)
        return row
      },
      beforeUpdate: (patch) => {
        validateHypothesisRow(patch, false)
        return patch
      },
      beforeDelete: () => {
        throw badRequest('research hypotheses are never deleted; reject or supersede them instead')
      },
    },
    ...(reviewHooks as unknown as Record<string, never>),
  },
  endpoints: {
    ...comparativeEndpoints,
    overview: {
      method: 'GET',
      path: '/research/overview',
      requires: ADMIN_ONLY,
      menu: { group: 'Research', icon: 'OV', order: 10 },
      handler: async ({ orm }) => researchOverview(orm),
    },

    case: {
      method: 'GET',
      path: '/research/case',
      requires: ADMIN_ONLY,
      handler: async ({ query, orm }) => {
        const code = asText(query.code)
        if (!code) throw badRequest('research case code is required')
        return researchCase(orm, code)
      },
    },

    metrics: {
      method: 'GET',
      path: '/research/metrics',
      requires: ADMIN_ONLY,
      handler: async ({ query, orm }) => {
        const code = asText(query.code)
        if (!code) throw badRequest('research case code is required')
        return researchMetrics(orm, code)
      },
    },

    trace: {
      method: 'GET',
      path: '/research/trace',
      requires: ADMIN_ONLY,
      handler: async ({ query, orm }) => {
        const code = asText(query.code)
        if (!code) throw badRequest('research case code is required')
        return researchTrace(orm, code)
      },
    },

    hypotheses: {
      method: 'GET',
      path: '/research/hypotheses',
      requires: ADMIN_ONLY,
      handler: async ({ query, orm }) => listHypotheses(orm, nonEmpty(query.code) ?? undefined),
    },

    claimsRegister: {
      method: 'POST',
      path: '/research/claims/register',
      requires: ADMIN_ONLY,
      body: {
        claimCode: str({ maxLength: 80, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        claim: text(),
        epistemic: sel(EPISTEMIC_KINDS),
        representation: sel(CLAIM_REPRESENTATIONS),
        status: sel(CLAIM_STATUSES),
        citationKey: str({ maxLength: 60, null: true }),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const representation = asText(body.representation)
        if (caseRow.sourceSense === 'LICENSED_TRANSLATION' && representation === 'SOURCE_TEXT') {
          throw badRequest('translation cannot masquerade as original source text')
        }
        if (caseRow.sourceSense === 'ORIGINAL_ARABIC' && representation === 'TRANSLATION') {
          throw badRequest('this case declares the original Arabic source sense, not a translation sense')
        }
        const row = {
          claimCode: asText(body.claimCode),
          caseRef: String(caseRow.id),
          claim: asText(body.claim),
          level: 'R2',
          epistemic: asText(body.epistemic),
          representation,
          status: asText(body.status),
          citationKey: asText(body.citationKey) || String(caseRow.citationKey),
          evidenceSpan: nonEmpty(body.evidenceSpan),
          evidenceSha: nonEmpty(body.evidenceSha),
        }
        if (row.status === 'SUPPORTED' && row.evidenceSha !== caseRow.evidenceSha) {
          throw badRequest('a supported R2 claim must cite the case exact source digest')
        }
        const saved = await repo(orm, 'research_claims').create(row)
        status(201)
        return {
          state: 'recorded',
          claim: {
            claimCode: saved.claimCode,
            status: saved.status,
            epistemic: saved.epistemic,
            representation: saved.representation,
            exactSha: saved.evidenceSha === caseRow.evidenceSha,
          },
          notice: 'An observed text claim needs exact evidence; inference stays unpromoted.',
        }
      },
    },

    relationsRegister: {
      method: 'POST',
      path: '/research/relations/register',
      requires: ADMIN_ONLY,
      body: {
        relationCode: str({ maxLength: 100, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        fromClaimCode: str({ maxLength: 80, minLength: 1 }),
        toClaimCode: str({ maxLength: 80, minLength: 1 }),
        relationType: sel(SRGBL_RELATION_TYPES),
        lens: sel(RESEARCH_LENSES),
        defensibility: sel(DEFENSIBILITY),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
        counterReading: text({ null: true }),
        presentedAsSource: bool({ default: false }),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const from = await findCode(orm, 'research_claims', 'claimCode', asText(body.fromClaimCode), 'R2 claim')
        const to = await findCode(orm, 'research_claims', 'claimCode', asText(body.toClaimCode), 'R2 claim')
        if (!sameId(from.caseRef, caseRow.id) || !sameId(to.caseRef, caseRow.id)) {
          throw badRequest('both claims must belong to the same research case')
        }
        const row = {
          relationCode: asText(body.relationCode),
          caseRef: String(caseRow.id),
          fromClaimRef: String(from.id),
          toClaimRef: String(to.id),
          relationType: asText(body.relationType),
          lens: asText(body.lens),
          defensibility: asText(body.defensibility),
          evidenceSpan: nonEmpty(body.evidenceSpan),
          evidenceSha: nonEmpty(body.evidenceSha),
          counterReading: nonEmpty(body.counterReading),
          presentedAsSource: body.presentedAsSource === true,
        }
        if (row.defensibility === 'DEFENSIBLE' && row.evidenceSha !== caseRow.evidenceSha) {
          throw badRequest('a defensible relation must cite the case exact source digest')
        }
        const saved = await repo(orm, 'research_relations').create(row)
        status(201)
        return {
          state: 'recorded',
          relation: {
            relationCode: saved.relationCode,
            relationType: saved.relationType,
            lens: saved.lens,
            defensibility: saved.defensibility,
            exactSha: saved.evidenceSha === caseRow.evidenceSha,
          },
          notice: 'Speculation is stored as speculation; it never becomes source evidence.',
        }
      },
    },

    framesRegister: {
      method: 'POST',
      path: '/research/frames/register',
      requires: ADMIN_ONLY,
      body: {
        frameCode: str({ maxLength: 60, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        agentLabel: str({ maxLength: 200, minLength: 1 }),
        agentBasis: sel(['TEXTUAL_SPEAKER', 'ACTOR_REGISTRY', 'UNSPECIFIED']),
        agentActorCode: str({ maxLength: 8, null: true }),
        agentNote: text({ null: true }),
        recipientLabel: str({ maxLength: 200, minLength: 1 }),
        recipientBasis: sel(['TEXTUAL_ADDRESS', 'ACTOR_REGISTRY', 'UNSPECIFIED']),
        domain: str({ maxLength: 200, minLength: 1 }),
        scope: str({ maxLength: 240, minLength: 1 }),
        genre: str({ maxLength: 80, minLength: 1 }),
        tradition: str({ maxLength: 80, null: true }),
        lens: sel(RESEARCH_LENSES),
        lensNote: text(),
        reviewState: sel(REVIEW_STATES),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const basis = asText(body.agentBasis)
        let agentActorRef: string | null = null
        if (basis === 'ACTOR_REGISTRY') {
          const actorCode = asText(body.agentActorCode)
          if (!actorCode) throw badRequest('an ACTOR_REGISTRY frame needs an actor figure code')
          const actors = await listAll(orm, 'actor_figures')
          const actor = actors.find((row) => row.figureCode === actorCode)
          if (!actor) throw badRequest(`unsupported actor identity "${actorCode}": not present in the figure registry`)
          agentActorRef = String(actor.id)
        }
        const row = {
          frameCode: asText(body.frameCode),
          caseRef: String(caseRow.id),
          agentLabel: asText(body.agentLabel),
          agentBasis: basis,
          agentActorRef,
          agentNote: nonEmpty(body.agentNote),
          recipientLabel: asText(body.recipientLabel),
          recipientBasis: asText(body.recipientBasis),
          domain: asText(body.domain),
          scope: asText(body.scope),
          genre: asText(body.genre),
          tradition: nonEmpty(body.tradition),
          lens: asText(body.lens),
          lensNote: asText(body.lensNote),
          reviewState: asText(body.reviewState),
        }
        const saved = await repo(orm, 'research_frames').create(row)
        status(201)
        return {
          state: 'recorded',
          frame: {
            frameCode: saved.frameCode,
            agentBasis: saved.agentBasis,
            agentActorRef: saved.agentActorRef ?? null,
            lens: saved.lens,
            reviewState: saved.reviewState,
          },
          notice: 'A blank frame is refused; an actor-registry identity must resolve to a real figure.',
        }
      },
    },

    witnessesRegister: {
      method: 'POST',
      path: '/research/witnesses/register',
      requires: ADMIN_ONLY,
      body: {
        witnessCode: str({ maxLength: 80, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        frameCode: str({ maxLength: 60, minLength: 1 }),
        claimCode: str({ maxLength: 80, minLength: 1 }),
        keyToken: sel(P18_KEY_CANDIDATES),
        direction: int(),
        intensity: int(),
        confidencePct: int(),
        weight: int(),
        conclusion: text(),
        limits: text(),
        contextNote: text(),
        boundaryNote: text(),
        evidenceRef: str({ maxLength: 240, minLength: 1 }),
        citationKey: str({ maxLength: 60, null: true }),
        evidenceSha: str({ maxLength: 64, minLength: 1 }),
        sourceFidelity: int(),
        observability: int(),
        semanticConsistency: int(),
        crossReference: int(),
        nonOverlapping: int(),
        claimKind: sel(['BOUNDED_DERIVED_READING', 'DIVINE_JUDGMENT', 'SALVATION_VERDICT']),
        reviewState: sel(REVIEW_STATES),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const frame = await findCode(orm, 'research_frames', 'frameCode', asText(body.frameCode), 'research frame')
        const claim = await findCode(orm, 'research_claims', 'claimCode', asText(body.claimCode), 'R2 claim')
        if (!sameId(frame.caseRef, caseRow.id) || !sameId(claim.caseRef, caseRow.id)) {
          throw badRequest('the witness frame and claim must belong to the case')
        }
        if (asText(body.claimKind) !== 'BOUNDED_DERIVED_READING') {
          throw badRequest('a Key Witness conclusion cannot be a divine judgment or salvation verdict')
        }
        if (asText(body.evidenceSha) !== caseRow.evidenceSha) {
          throw badRequest('a Key Witness conclusion must cite the case exact source digest')
        }
        const row = {
          witnessCode: asText(body.witnessCode),
          caseRef: String(caseRow.id),
          frameRef: String(frame.id),
          claimRef: String(claim.id),
          keyToken: asText(body.keyToken),
          scheme: KEY_SCHEME,
          direction: body.direction,
          intensity: body.intensity,
          confidencePct: body.confidencePct,
          weight: body.weight,
          conclusion: asText(body.conclusion),
          limits: asText(body.limits),
          contextNote: asText(body.contextNote),
          boundaryNote: asText(body.boundaryNote),
          evidenceRef: asText(body.evidenceRef),
          citationKey: asText(body.citationKey) || String(caseRow.citationKey),
          evidenceSha: asText(body.evidenceSha),
          sourceFidelity: body.sourceFidelity,
          observability: body.observability,
          semanticConsistency: body.semanticConsistency,
          crossReference: body.crossReference,
          nonOverlapping: body.nonOverlapping,
          claimKind: asText(body.claimKind),
          reviewState: asText(body.reviewState),
          humanReviewed: false,
        }
        const saved = await repo(orm, 'research_witnesses').create(row)
        status(201)
        return {
          state: 'recorded',
          witness: {
            witnessCode: saved.witnessCode,
            claimKind: saved.claimKind,
            reviewState: saved.reviewState,
            humanReviewed: false,
            candidateSupport: scoreWitness(saved),
          },
          notice: 'One bounded conclusion with limits; it is not a divine judgment, and it is not human reviewed.',
        }
      },
    },

    qualityRegister: {
      method: 'POST',
      path: '/research/quality/register',
      requires: ADMIN_ONLY,
      body: {
        runCode: str({ maxLength: 80, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        method: str({ maxLength: 80, minLength: 1 }),
        profile: str({ maxLength: 80, minLength: 1 }),
        sGrounding: int(),
        rAccuracy: int(),
        gSupport: int(),
        bDiscipline: int(),
        lResponsibility: int(),
        provenance: int(),
        unknownHonesty: int(),
        alternativeCoverage: int(),
        confidenceCalibration: int(),
        actionUsefulness: int(),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const row = {
          runCode: asText(body.runCode),
          caseRef: String(caseRow.id),
          method: asText(body.method),
          profile: asText(body.profile),
          ...Object.fromEntries(QUALITY_DIMENSIONS.map((key) => [key, body[key]])),
        }
        validateQualityRow(row)
        const saved = await repo(orm, 'research_quality_runs').create(row)
        status(201)
        return {
          state: 'recorded',
          run: { runCode: saved.runCode, score: scoreQuality(saved), max: 40 },
          notice: 'The 0..40 rubric exists only on a complete labelled bundle; a missing dimension is not zero.',
        }
      },
    },

    hypothesesRegister: {
      method: 'POST',
      path: '/research/hypotheses/register',
      requires: ADMIN_ONLY,
      body: {
        hypothesisCode: str({ maxLength: 80, minLength: 1 }),
        caseCode: str({ maxLength: 60, minLength: 1 }),
        frameCode: str({ maxLength: 60, null: true }),
        mode: sel(HYPOTHESIS_MODES),
        operator: sel(SWING_OPERATORS, { null: true }),
        question: text(),
        citationKey: str({ maxLength: 60, null: true }),
        evidenceSpan: text(),
        evidenceSha: str({ maxLength: 64, minLength: 1 }),
        lens: sel(RESEARCH_LENSES),
        counterReadings: text({ null: true }),
        mismatchNote: text({ null: true }),
        proposedFrameNote: text({ null: true }),
        proposedBy: str({ maxLength: 80, minLength: 1 }),
      },
      handler: async ({ body, orm, status }) => {
        const caseRow = await findCase(orm, asText(body.caseCode))
        const frameCode = nonEmpty(body.frameCode)
        const frame = frameCode
          ? await findCode(orm, 'research_frames', 'frameCode', frameCode, 'research frame')
          : null
        if (frame && !sameId(frame.caseRef, caseRow.id)) throw badRequest('the frame must belong to the case')
        if (asText(body.evidenceSha) !== caseRow.evidenceSha) {
          throw badRequest('a hypothesis must cite the case exact source digest')
        }
        const row = {
          hypothesisCode: asText(body.hypothesisCode),
          caseRef: String(caseRow.id),
          frameRef: frame ? String(frame.id) : null,
          mode: asText(body.mode),
          operator: nonEmpty(body.operator),
          question: asText(body.question),
          citationKey: asText(body.citationKey) || String(caseRow.citationKey),
          evidenceSpan: asText(body.evidenceSpan),
          evidenceSha: asText(body.evidenceSha),
          lens: asText(body.lens),
          counterReadings: nonEmpty(body.counterReadings),
          mismatchNote: nonEmpty(body.mismatchNote),
          proposedFrameNote: nonEmpty(body.proposedFrameNote),
          proposedBy: asText(body.proposedBy),
          status: 'CANDIDATE',
          selfValidated: false,
          inheritedScore: null,
          independentSourceRef: null,
          validatedBy: null,
          verificationNote: null,
          verified: false,
        }
        validateHypothesisRow(row, true)
        const saved = await repo(orm, 'research_hypotheses').create(row)
        status(201)
        return {
          state: 'recorded',
          hypothesis: {
            hypothesisCode: saved.hypothesisCode,
            mode: saved.mode,
            status: saved.status,
            selfValidated: false,
            inheritedScore: null,
            verified: false,
          },
          notice: 'A SWING, correction or OFFSIDE hypothesis is a cited question, never truth and never self-validated.',
        }
      },
    },

    hypothesesValidate: {
      method: 'POST',
      path: '/research/hypotheses/validate',
      requires: ADMIN_ONLY,
      body: {
        hypothesisCode: str({ maxLength: 80, minLength: 1 }),
        validatedBy: str({ maxLength: 80, minLength: 1 }),
        decision: sel(['CORROBORATE', 'REJECT', 'KEEP_CANDIDATE']),
        independentSourceRef: str({ maxLength: 240, null: true }),
        reason: text(),
      },
      handler: async ({ body, orm, status }) => {
        const hypothesis = await findCode(
          orm,
          'research_hypotheses',
          'hypothesisCode',
          asText(body.hypothesisCode),
          'research hypothesis',
        )
        const validatedBy = asText(body.validatedBy)
        const reason = asText(body.reason)
        const decision = asText(body.decision)
        if (!validatedBy || !reason) throw badRequest('validation needs a validator and a reason')
        if (validatedBy === hypothesis.proposedBy) {
          throw badRequest('a hypothesis cannot be validated by its own proposer')
        }
        const independentSourceRef = nonEmpty(body.independentSourceRef)
        if (decision === 'CORROBORATE' && !independentSourceRef) {
          throw badRequest('corroboration needs an independent source reference')
        }
        const nextStatus =
          decision === 'CORROBORATE' ? 'CORROBORATED' : decision === 'REJECT' ? 'REJECTED' : 'CANDIDATE'
        const patch = {
          status: nextStatus,
          validatedBy,
          independentSourceRef,
          verificationNote: reason,
          proposedBy: hypothesis.proposedBy,
          inheritedScore: null,
          selfValidated: false,
          verified: false,
        }
        validateHypothesisRow(patch, false)
        const saved = await repo(orm, 'research_hypotheses').update(String(hypothesis.id), patch)
        status(200)
        return {
          state: 'recorded',
          hypothesis: {
            hypothesisCode: saved.hypothesisCode,
            status: saved.status,
            validatedBy: saved.validatedBy,
            independentSourceRef: saved.independentSourceRef ?? null,
            inheritedScore: null,
            verified: false,
            humanReviewed: false,
          },
          notice:
            'Corroboration is structural. It is not truth by inversion, not a human review and not a theological verdict.',
        }
      },
    },

    swingPropose: {
      method: 'POST',
      path: '/research/swing/propose',
      requires: ADMIN_ONLY,
      body: {
        subject: str({ maxLength: 160, minLength: 1 }),
        relation: str({ maxLength: 160, minLength: 1 }),
        object: str({ maxLength: 160, minLength: 1 }),
        operators: text(),
      },
      handler: async ({ body, status }) => {
        const operators = asText(body.operators)
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
        if (!operators.length || operators.length > 3) {
          throw badRequest('SWING accepts one to three operators; depth four does not exist')
        }
        for (const operator of operators) {
          if (!(SWING_OPERATORS as readonly string[]).includes(operator)) {
            throw badRequest(`unknown SWING operator "${operator}"`)
          }
        }
        try {
          const result = proposeSwingChain(
            { subject: asText(body.subject), relation: asText(body.relation), object: asText(body.object) },
            operators as SwingOperator[],
          )
          status(200)
          return {
            state: 'proposed',
            ...result,
            inheritedScore: null,
            policy: {
              state: 'CANDIDATE',
              evidenceStatus: 'UNVERIFIED',
              reverseTransformationIsTruth: false,
              maximumDepth: 3,
            },
            notice: 'Each Swing hop is a candidate question. A reversal never becomes truth by inversion.',
          }
        } catch (error) {
          throw badRequest(error instanceof Error ? error.message : 'invalid SWING request')
        }
      },
    },

    offsideDiagnose: {
      method: 'POST',
      path: '/research/offside/diagnose',
      requires: ADMIN_ONLY,
      body: {
        frameCode: str({ maxLength: 60, minLength: 1 }),
        agent: str({ maxLength: 200, null: true }),
        recipient: str({ maxLength: 200, null: true }),
        domain: str({ maxLength: 200, null: true }),
        scope: str({ maxLength: 240, null: true }),
        genre: str({ maxLength: 80, null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const frame = await findCode(orm, 'research_frames', 'frameCode', asText(body.frameCode), 'research frame')
        const result = diagnoseOffside(frame, {
          agent: nonEmpty(body.agent),
          recipient: nonEmpty(body.recipient),
          domain: nonEmpty(body.domain),
          scope: nonEmpty(body.scope),
          genre: nonEmpty(body.genre),
        })
        status(200)
        return {
          state: result.status,
          frameCode: frame.frameCode,
          ...result,
          storedFrameUnchanged: true,
        }
      },
    },

    ...reviewEndpoints,
  },
})

export default research
export {
  CASE_SEED,
  COUNTEREVIDENCE_SEED,
  HYPOTHESIS_MODES,
  HYPOTHESIS_SEED,
  KEY_SCHEME,
  M14_POLICY,
  MIZAN_CRITERIA,
  MIZAN_METHOD_CODE,
  MIZAN_METHOD_SHA256,
  MIZAN_METHOD_STATUS,
  MIZAN_METHOD_TEXT,
  MIZAN_METHOD_VERSION,
  P18_KEY_CANDIDATES,
  PILOT_ASSESSMENTS,
  QURAN_SHA256,
  RESEARCH_ISSUE_REGISTER,
  RESEARCH_META,
  RESEARCH_PINS,
  RESEARCH_POLICY,
  REVIEW_DECISIONS,
  REVIEW_MACHINE_STATES,
  REVIEW_STATES,
  REVIEW_TARGET_KINDS,
  SRGBL_LEVELS,
  SWING_OPERATORS,
  WITNESS_COMPONENT_MAX,
} from './seed.js'
export {
  buildMetrics,
  diagnoseOffside,
  evaluateStages,
  proposeSwing,
  proposeSwingChain,
  scoreDirection,
  scoreMaturity,
  scoreQuality,
  scoreWitness,
} from './gates.js'
export { caseDetail, researchCase, researchMetrics, researchOverview, researchTrace } from './projection.js'
export {
  ACTION_TARGET_STATE,
  canTransition,
  mizanRunIsBounded,
  parseMizanScores,
  pilotStatus,
  releaseVerdict,
  scoreMizan,
  withLock,
} from './review.js'

export * from './common.js'
export * from './review-subsystem.js'
export * from './historical-pilot.js'
