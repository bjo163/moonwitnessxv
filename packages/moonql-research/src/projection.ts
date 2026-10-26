import { notFound } from '@moonwitness/core'
import {
  CASE_REVIEW_LABEL,
  HYPOTHESIS_MODES,
  KEY_SCHEME_STATUS,
  P18_KEY_CANDIDATES,
  RESEARCH_ISSUE_REGISTER,
  RESEARCH_LENSES,
  RESEARCH_META,
  RESEARCH_POLICY,
  REVIEW_STATES,
  SOURCE_SENSES,
  SRGBL_LEVELS,
  STAGE_LIMITS,
  STAGE_NAMES,
  STAGE_QUESTIONS,
  SWING_OPERATORS,
  type SrgbLLevel,
} from './seed.js'
import {
  asText,
  buildMetrics,
  evaluateStages,
  nonEmpty,
  scoreWitness,
  type MetricsInput,
} from './gates.js'

type Row = Record<string, unknown>
type Orm = { model(name: string): { list(query?: Record<string, unknown>): Promise<Row[]> } }

export interface ResearchSnapshot {
  cases: Row[]
  frames: Row[]
  claims: Row[]
  relations: Row[]
  witnesses: Row[]
  qualities: Row[]
  hypotheses: Row[]
  editions: Row[]
  passages: Row[]
  translations: Row[]
  actors: Row[]
}

const list = async (orm: Orm, name: string): Promise<Row[]> => {
  try {
    return await (orm.model(name) as { list(query?: Record<string, unknown>): Promise<Row[]> }).list({ limit: 5000 })
  } catch {
    return []
  }
}

export async function loadResearch(orm: Orm): Promise<ResearchSnapshot> {
  const [cases, frames, claims, relations, witnesses, qualities, hypotheses, editions, passages, translations, actors] =
    await Promise.all([
      list(orm, 'research_cases'),
      list(orm, 'research_frames'),
      list(orm, 'research_claims'),
      list(orm, 'research_relations'),
      list(orm, 'research_witnesses'),
      list(orm, 'research_quality_runs'),
      list(orm, 'research_hypotheses'),
      list(orm, 'corpus_editions'),
      list(orm, 'corpus_passages'),
      list(orm, 'corpus_translations'),
      list(orm, 'actor_figures'),
    ])
  return { cases, frames, claims, relations, witnesses, qualities, hypotheses, editions, passages, translations, actors }
}

const byId = (rows: Row[], id: unknown): Row | null =>
  rows.find((row) => String(row.id) === String(id)) ?? null

function sourceView(snapshot: ResearchSnapshot, caseRow: Row) {
  const edition = byId(snapshot.editions, caseRow.editionRef)
  const passage = byId(snapshot.passages, caseRow.passageRef)
  const translation = byId(snapshot.translations, caseRow.translationRef)
  return {
    edition: edition
      ? {
          code: edition.code,
          name: edition.name,
          rightsStatus: edition.rightsStatus,
          licenseName: edition.licenseName,
          provenanceSha: edition.provenanceSha,
          sourceUri: edition.sourceUri,
        }
      : null,
    passage: passage
      ? {
          citationKey: passage.citationKey,
          surahNumber: passage.surahNumber,
          ayahNumber: passage.ayahNumber,
          verifiedAt: passage.verifiedAt,
          rawTextExposed: false,
        }
      : null,
    translation: translation
      ? {
          code: translation.code,
          languageCode: translation.languageCode,
          translatorName: translation.translatorName,
          rightsStatus: translation.rightsStatus,
        }
      : null,
    rawTextExposed: false as const,
  }
}

function frameView(frame: Row) {
  return {
    frameCode: frame.frameCode,
    agent: {
      label: frame.agentLabel,
      basis: frame.agentBasis,
      agentActorRef: frame.agentActorRef ?? null,
      note: frame.agentNote ?? null,
      identityClaimed: frame.agentBasis === 'ACTOR_REGISTRY',
    },
    recipient: { label: frame.recipientLabel, basis: frame.recipientBasis },
    domain: frame.domain,
    scope: frame.scope,
    genre: frame.genre,
    tradition: frame.tradition ?? null,
    lens: frame.lens,
    lensNote: frame.lensNote,
    reviewState: frame.reviewState,
    humanReviewed: false as const,
  }
}

function claimView(claim: Row, caseRow: Row) {
  return {
    claimCode: claim.claimCode,
    claim: claim.claim,
    epistemic: claim.epistemic,
    representation: claim.representation,
    status: claim.status,
    citationKey: claim.citationKey,
    evidenceSpan: claim.evidenceSpan ?? null,
    evidenceSha: claim.evidenceSha ?? null,
    exactSha: Boolean(claim.evidenceSha) && claim.evidenceSha === caseRow.evidenceSha,
    observed: claim.epistemic === 'OBSERVED_TEXT',
    inference: claim.representation === 'INFERENCE',
    reviewState: 'ENGINEERING_ONLY',
    humanReviewed: false as const,
  }
}

function relationView(relation: Row, caseRow: Row, claims: Row[]) {
  const from = byId(claims, relation.fromClaimRef)
  const to = byId(claims, relation.toClaimRef)
  return {
    relationCode: relation.relationCode,
    from: from?.claimCode ?? null,
    to: to?.claimCode ?? null,
    relationType: relation.relationType,
    lens: relation.lens,
    defensibility: relation.defensibility,
    evidenceSpan: relation.evidenceSpan ?? null,
    evidenceSha: relation.evidenceSha ?? null,
    exactSha: Boolean(relation.evidenceSha) && relation.evidenceSha === caseRow.evidenceSha,
    counterReading: relation.counterReading ?? null,
    presentedAsSource: relation.presentedAsSource === true,
    defensible: relation.defensibility === 'DEFENSIBLE',
    speculative: relation.defensibility === 'SPECULATIVE',
    reviewState: 'ENGINEERING_ONLY',
    humanReviewed: false as const,
  }
}

function witnessView(witness: Row) {
  const score = scoreWitness(witness)
  return {
    witnessCode: witness.witnessCode,
    keyToken: witness.keyToken,
    keyScheme: witness.scheme,
    keySchemeStatus: KEY_SCHEME_STATUS,
    conclusion: witness.conclusion,
    limits: witness.limits,
    contextNote: witness.contextNote,
    boundaryNote: witness.boundaryNote,
    citations: [witness.evidenceRef],
    citationKey: witness.citationKey,
    evidenceSha: witness.evidenceSha,
    direction: witness.direction,
    intensity: witness.intensity,
    confidencePct: witness.confidencePct,
    weight: witness.weight,
    candidateSupport: score,
    claimKind: witness.claimKind,
    reviewState: witness.reviewState,
    humanReviewed: false as const,
    reviewLabel: CASE_REVIEW_LABEL,
  }
}

function hypothesisView(hypothesis: Row) {
  return {
    hypothesisCode: hypothesis.hypothesisCode,
    mode: hypothesis.mode,
    operator: hypothesis.operator ?? null,
    question: hypothesis.question,
    citationKey: hypothesis.citationKey,
    evidenceSpan: hypothesis.evidenceSpan,
    evidenceSha: hypothesis.evidenceSha,
    lens: hypothesis.lens,
    counterReadings: hypothesis.counterReadings ?? null,
    mismatchNote: hypothesis.mismatchNote ?? null,
    proposedFrameNote: hypothesis.proposedFrameNote ?? null,
    proposedBy: hypothesis.proposedBy,
    status: hypothesis.status,
    selfValidated: hypothesis.selfValidated === true,
    inheritedScore: hypothesis.inheritedScore ?? null,
    independentSourceRef: hypothesis.independentSourceRef ?? null,
    validatedBy: hypothesis.validatedBy ?? null,
    verificationNote: hypothesis.verificationNote ?? null,
    verified: false as const,
    humanReviewed: false as const,
    reviewState: 'ENGINEERING_ONLY',
    notice: 'A SWING or correction candidate is a question, not truth. Validation is structural and never a human review.',
  }
}

export function caseDetail(snapshot: ResearchSnapshot, caseRow: Row) {
  const frames = snapshot.frames.filter((frame) => String(frame.caseRef) === String(caseRow.id))
  const claims = snapshot.claims.filter((claim) => String(claim.caseRef) === String(caseRow.id))
  const relations = snapshot.relations.filter((relation) => String(relation.caseRef) === String(caseRow.id))
  const witnesses = snapshot.witnesses.filter((witness) => String(witness.caseRef) === String(caseRow.id))
  const hypotheses = snapshot.hypotheses.filter((hypothesis) => String(hypothesis.caseRef) === String(caseRow.id))
  const quality = snapshot.qualities.find((run) => String(run.caseRef) === String(caseRow.id)) ?? null
  const evaluation = evaluateStages({
    caseRow,
    editions: snapshot.editions,
    passages: snapshot.passages,
    translations: snapshot.translations,
    claims,
    relations,
    frames,
    witnesses,
    actors: snapshot.actors,
  })
  const metricsInput: MetricsInput = {
    stages: evaluation.stages,
    caseRow,
    quality,
    witnesses,
  }
  const metrics = buildMetrics(metricsInput)
  const primaryFrame = frames[0] ?? null
  return {
    caseCode: caseRow.caseCode,
    title: caseRow.title,
    citationKey: caseRow.citationKey,
    sourceSense: caseRow.sourceSense,
    evidenceSha: caseRow.evidenceSha ?? null,
    rightsSnapshot: caseRow.rightsSnapshot,
    lens: caseRow.lens,
    status: caseRow.researchStatus,
    source: sourceView(snapshot, caseRow),
    review: {
      state: 'ENGINEERING_ONLY' as const,
      label: CASE_REVIEW_LABEL,
      humanReviewed: false as const,
      engineeringCommitIsNotHumanReview: true,
      humanReviewAvailableInMilestone: false,
    },
    stages: SRGBL_LEVELS.map((level) => evaluation.stages[level]),
    maturity: evaluation.maturity,
    metrics,
    frame: primaryFrame ? frameView(primaryFrame) : null,
    frames: frames.map(frameView),
    claims: claims.map((claim) => claimView(claim, caseRow)),
    relations: relations.map((relation) => relationView(relation, caseRow, claims)),
    witnesses: witnesses.map(witnessView),
    hypotheses: hypotheses.map(hypothesisView),
    separation: {
      defensibleRelations: relations.filter((relation) => relation.defensibility === 'DEFENSIBLE').length,
      speculativeRelations: relations.filter((relation) => relation.defensibility === 'SPECULATIVE').length,
      speculativeHeldApart: relations.every(
        (relation) => relation.defensibility === 'DEFENSIBLE' || relation.presentedAsSource !== true,
      ),
      inferenceClaims: claims.filter((claim) => claim.epistemic !== 'OBSERVED_TEXT').length,
      unpromotedInferences: claims.filter(
        (claim) => claim.epistemic !== 'OBSERVED_TEXT' && claim.status !== 'SUPPORTED',
      ).length,
    },
    limits: witnesses.map((witness) => ({ witnessCode: witness.witnessCode, limits: witness.limits })),
  }
}

export async function researchOverview(orm: Orm) {
  const snapshot = await loadResearch(orm)
  const cases = snapshot.cases.map((caseRow) => {
    const detail = caseDetail(snapshot, caseRow)
    return {
      caseCode: detail.caseCode,
      title: detail.title,
      citationKey: detail.citationKey,
      sourceSense: detail.sourceSense,
      lens: detail.lens,
      status: detail.status,
      source: detail.source,
      stages: detail.stages.map((stage) => ({
        stage: stage.stage,
        status: stage.status,
        code: stage.code,
        reason: stage.reason,
      })),
      maturity: detail.maturity,
      metrics: detail.metrics,
      review: detail.review,
      separation: detail.separation,
    }
  })
  const stageCounts = Object.fromEntries(
    SRGBL_LEVELS.map((level) => [
      level,
      {
        PASS: cases.filter((entry) => entry.stages.find((stage) => stage.stage === level)?.status === 'PASS').length,
        UNKNOWN: cases.filter((entry) => entry.stages.find((stage) => stage.stage === level)?.status === 'UNKNOWN').length,
        FAIL: cases.filter((entry) => entry.stages.find((stage) => stage.stage === level)?.status === 'FAIL').length,
      },
    ]),
  ) as Record<SrgbLLevel, { PASS: number; UNKNOWN: number; FAIL: number }>
  return {
    state: 'ok' as const,
    meta: RESEARCH_META,
    policy: RESEARCH_POLICY,
    issueRegister: RESEARCH_ISSUE_REGISTER,
    review: {
      state: 'ENGINEERING_ONLY' as const,
      label: CASE_REVIEW_LABEL,
      humanReviewed: false as const,
      engineeringCommitIsNotHumanReview: true,
      note: 'A green suite, a checksum or a commit is not a human reviewer attestation, rights clearance or publication approval.',
    },
    counts: {
      cases: snapshot.cases.length,
      frames: snapshot.frames.length,
      claims: snapshot.claims.length,
      relations: snapshot.relations.length,
      witnesses: snapshot.witnesses.length,
      qualityRuns: snapshot.qualities.length,
      hypotheses: snapshot.hypotheses.length,
      unknownStageResults: cases.reduce(
        (total, entry) => total + entry.stages.filter((stage) => stage.status === 'UNKNOWN').length,
        0,
      ),
      failedStageResults: cases.reduce(
        (total, entry) => total + entry.stages.filter((stage) => stage.status === 'FAIL').length,
        0,
      ),
    },
    stages: SRGBL_LEVELS.map((level) => ({
      stage: level,
      name: STAGE_NAMES[level],
      question: STAGE_QUESTIONS[level],
      cannotProve: STAGE_LIMITS[level],
      results: stageCounts[level],
    })),
    cases,
    options: {
      lenses: RESEARCH_LENSES,
      reviewStates: REVIEW_STATES,
      sourceSenses: SOURCE_SENSES,
      keyTokens: P18_KEY_CANDIDATES,
      keySchemeStatus: KEY_SCHEME_STATUS,
      swingOperators: SWING_OPERATORS,
      hypothesisModes: HYPOTHESIS_MODES,
    },
  }
}

async function requireCase(orm: Orm, code: string) {
  const snapshot = await loadResearch(orm)
  const caseRow = snapshot.cases.find((row) => row.caseCode === code)
  if (!caseRow) throw notFound(`research case "${code}" not found`)
  return { snapshot, caseRow }
}

export async function researchCase(orm: Orm, code: string) {
  const { snapshot, caseRow } = await requireCase(orm, code)
  return { state: 'ok' as const, ...caseDetail(snapshot, caseRow) }
}

export async function researchMetrics(orm: Orm, code: string) {
  const { snapshot, caseRow } = await requireCase(orm, code)
  const detail = caseDetail(snapshot, caseRow)
  return {
    state: 'ok' as const,
    caseCode: detail.caseCode,
    citationKey: detail.citationKey,
    metrics: detail.metrics,
    policy: {
      scoringSeparated: true,
      combined: null,
      ranking: false,
      theologicalRanking: 'FORBIDDEN',
      maturityMax: 15,
      qualityMax: 40,
      witnessMax: 100,
      directionRange: [-2, 2],
    },
    review: detail.review,
    notice:
      'These four values never merge. Candidate witness support is not a religion score and no threshold grants truth or canonical authority.',
  }
}

export async function researchTrace(orm: Orm, code: string) {
  const { snapshot, caseRow } = await requireCase(orm, code)
  const detail = caseDetail(snapshot, caseRow)
  return {
    state: 'ok' as const,
    caseCode: detail.caseCode,
    citationKey: detail.citationKey,
    source: detail.source,
    review: detail.review,
    trace: detail.stages.map((stage) => ({
      ...stage,
      derivedFrom: stage.evidenceRefs,
    })),
    claims: detail.claims.map((claim) => ({
      claimCode: claim.claimCode,
      status: claim.status,
      epistemic: claim.epistemic,
      representation: claim.representation,
      evidenceSpan: claim.evidenceSpan,
      evidenceSha: claim.evidenceSha,
      exactSha: claim.exactSha,
    })),
    relations: detail.relations,
    conclusions: detail.witnesses.map((witness) => ({
      witnessCode: witness.witnessCode,
      conclusion: witness.conclusion,
      limits: witness.limits,
      boundaryNote: witness.boundaryNote,
      citations: witness.citations,
      evidenceSha: witness.evidenceSha,
      reviewState: witness.reviewState,
      humanReviewed: witness.humanReviewed,
    })),
    frame: detail.frame,
    metrics: detail.metrics,
    notice:
      'The trace is derived from stored records at the cited digest. A checksum is not a human signature and an engineering result is not a divine judgment.',
  }
}

export async function listHypotheses(orm: Orm, code?: string) {
  const snapshot = await loadResearch(orm)
  const caseRow = code ? snapshot.cases.find((row) => row.caseCode === code) : null
  if (code && !caseRow) throw notFound(`research case "${code}" not found`)
  const rows = caseRow
    ? snapshot.hypotheses.filter((hypothesis) => String(hypothesis.caseRef) === String(caseRow.id))
    : snapshot.hypotheses
  return {
    state: 'ok' as const,
    total: rows.length,
    caseCode: caseRow?.caseCode ?? null,
    items: rows.map(hypothesisView),
    policy: {
      selfValidation: 'FORBIDDEN',
      reverseTransformationIsTruth: false,
      verified: false,
      inheritedScore: null,
      positiveCorrectionRequiresDeclaredLens: true,
      offsideRequiresMismatch: true,
      notes: 'Handlers only corroborate or reject a candidate; they never produce human review or theological truth.',
    },
  }
}

export const researchHelpers = { loadResearch, caseDetail, byId, asText, nonEmpty }
