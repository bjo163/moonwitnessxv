import {
  DECIDED_AT,
  ENTITY_SEED,
  M02_REF,
  M02_SHA256,
  M09_REF,
  M09_SHA256,
  type PERSPECTIVES,
  RELATION_SEED,
  RELATION_TYPES,
  REVIEWER,
  SOURCE_SEED,
  VISION_REF,
  VISION_SHA256,
} from '@moonwitness/moonql-ontology'
import { buildReleaseManifest, type CandidateEdgeInput, type OntologyEdgeInput } from './manifest.js'

export const GRAPH_META = {
  version: '1.0.0',
  status: 'REVIEWED_BASELINE',
  notice:
    'A typed correlation layer over the reviewed ontology. Candidates are claims under review; only an immutable release is presented as the graph.',
  pins: {
    boundaryDecision: { ref: M02_REF, sha256: M02_SHA256 },
    terminologyReview: { ref: M09_REF, sha256: M09_SHA256 },
    vision: { ref: VISION_REF, sha256: VISION_SHA256 },
  },
} as const

export const GRAPH_POLICY = {
  candidateReviewRequired: true,
  evidenceAtExactSha: true,
  evidenceSpanRequiredForApproval: true,
  sameAsApproval: 'FORBIDDEN_USE_IDENTITY_REVIEW',
  automaticApproval: false,
  releaseImmutable: true,
  pointerSingleton: true,
  adjacencyDerived: true,
  revokedVisible: true,
  deduplication:
    'A reviewed ontology relation wins over a candidate with the same from|to|relationType|perspective; the duplicate stays in the manifest lineage.',
  notice:
    'A candidate never becomes a graph edge by itself. A release freezes only reviewed relations and approved candidates whose evidence names an exact SHA-256.',
} as const

export const GRAPH_RELATION_TYPES = [...RELATION_TYPES, 'sameAs'] as const
export const EVIDENCE_FRAMES = ['TEXTUAL', 'TABULAR', 'CHRONOLOGY', 'CO_OCCURRENCE', 'SIMILARITY', 'EDITORIAL'] as const
export const CANDIDATE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'] as const
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number]

const SHA_BY_SOURCE = new Map<string, string>()
for (const source of SOURCE_SEED) {
  if (typeof source.provenanceSha === 'string') SHA_BY_SOURCE.set(source.code, source.provenanceSha)
}
const shaOf = (code: string): string => SHA_BY_SOURCE.get(code) ?? ''

export type CandidateSeed = {
  candidateCode: string
  from: string
  to: string
  relationType: (typeof GRAPH_RELATION_TYPES)[number]
  perspective: (typeof PERSPECTIVES)[number]
  sourceCode: string
  status: CandidateStatus
  evidenceFrame: (typeof EVIDENCE_FRAMES)[number]
  evidenceSpan: string
  evidenceSha: string
  evidenceRef: string
  reason: string
  reviewer: string | null
  decisionNote: string | null
  decidedAt: string | null
}

/**
 * Five candidate claims drawn from the pinned decision and vision documents.
 * Two are approved (one duplicates a reviewed ontology relation on purpose),
 * one is rejected, and two stay pending — including a `sameAs` that can never
 * be approved here because identity belongs to the M10 identity review.
 */
export const CANDIDATE_SEED: CandidateSeed[] = [
  {
    candidateCode: 'GC-O008-O007-relatedTo-CREATIVE_FICTION',
    from: 'O008',
    to: 'O007',
    relationType: 'relatedTo',
    perspective: 'CREATIVE_FICTION',
    sourceCode: 'xv-master-vision',
    status: 'APPROVED',
    evidenceFrame: 'CO_OCCURRENCE',
    evidenceSpan:
      'Fictional ensemble: **THE BATTERIES** (including A-L4H THE BATTERY in particular versions), **WALTER-WHITER**, **BABY-DOLL**, **THE SHADOW**, **BLUE WITCH**, **DOGFROMUNIVERSE**, and supporting crews.',
    evidenceSha: VISION_SHA256,
    evidenceRef: VISION_REF,
    reason:
      'The vision places both the fictional band and THE SHADOW inside one creative ensemble; a co-membership relation, not an identity.',
    reviewer: REVIEWER,
    decisionNote: 'Creative co-membership is asserted; the entities stay distinct.',
    decidedAt: DECIDED_AT,
  },
  {
    candidateCode: 'GC-O006-O007-distinctFrom-GENERAL',
    from: 'O006',
    to: 'O007',
    relationType: 'distinctFrom',
    perspective: 'GENERAL',
    sourceCode: 'xv-master-vision',
    status: 'APPROVED',
    evidenceFrame: 'TABULAR',
    evidenceSpan: '| `THE SHADOW` story character | `distinctFrom` | SHADOW workspace | Two ownership domains |',
    evidenceSha: VISION_SHA256,
    evidenceRef: VISION_REF,
    reason:
      'The vision table states the boundary directly: a story character and a workspace are two ownership domains.',
    reviewer: REVIEWER,
    decisionNote: 'Approved; the release deduplicates it against the reviewed ontology edge.',
    decidedAt: DECIDED_AT,
  },
  {
    candidateCode: 'GC-O003-O005-sameAs-SUFI_STUDY',
    from: 'O003',
    to: 'O005',
    relationType: 'sameAs',
    perspective: 'SUFI_STUDY',
    sourceCode: 'xv-master-vision',
    status: 'PENDING',
    evidenceFrame: 'SIMILARITY',
    evidenceSpan:
      '| `ZILL — Shadow Witness` | `thematicallyRelatedTo` | `ZILL — Tasawuf` | Never auto `sameAs` |',
    evidenceSha: VISION_SHA256,
    evidenceRef: VISION_REF,
    reason:
      'A name resemblance suggests a link, but the source explicitly refuses an automatic sameAs. Review stays open.',
    reviewer: null,
    decisionNote: null,
    decidedAt: null,
  },
  {
    candidateCode: 'GC-O006-O007-sameAs-GENERAL',
    from: 'O006',
    to: 'O007',
    relationType: 'sameAs',
    perspective: 'GENERAL',
    sourceCode: 'm02-01-disambiguation',
    status: 'REJECTED',
    evidenceFrame: 'CO_OCCURRENCE',
    evidenceSpan:
      'Kemiripan nama, rima, nomor, atau metafora artistik TIDAK BOLEH dikonversi menjadi relasi `owl:sameAs` atau Foreign Key relasional langsung secara otomatis.',
    evidenceSha: M02_SHA256,
    evidenceRef: M02_REF,
    reason:
      'The candidate was proposed on a shared label alone. M02-01 forbids that conversion, so the merge is rejected.',
    reviewer: REVIEWER,
    decisionNote: 'Shared labels are not identity; the candidate stays visible as a rejected claim.',
    decidedAt: DECIDED_AT,
  },
  {
    candidateCode: 'GC-O004-O003-relatedTo-HISTORICAL_CRITICAL',
    from: 'O004',
    to: 'O003',
    relationType: 'relatedTo',
    perspective: 'HISTORICAL_CRITICAL',
    sourceCode: 'm09-unilex-review',
    status: 'PENDING',
    evidenceFrame: 'CHRONOLOGY',
    evidenceSpan: 'P004:P031 `REJECTED`/`NEAR` with reason',
    evidenceSha: M09_SHA256,
    evidenceRef: M09_REF,
    reason:
      'The review compared ZIIL and ZILL as NEAR and rejected identity. Whether a chronological lexical lineage exists is still open.',
    reviewer: null,
    decisionNote: null,
    decidedAt: null,
  },
]

export const CANDIDATE_ROWS = CANDIDATE_SEED.map((candidate) => ({
  candidateCode: candidate.candidateCode,
  sourceEntityRef: `@onto_entities:${candidate.from}`,
  targetEntityRef: `@onto_entities:${candidate.to}`,
  relationType: candidate.relationType,
  perspective: candidate.perspective,
  sourceRef: `@onto_sources:${candidate.sourceCode}`,
  epistemicStatus: 'UNKNOWN',
  status: candidate.status,
  evidenceFrame: candidate.evidenceFrame,
  evidenceSpan: candidate.evidenceSpan,
  evidenceSha: candidate.evidenceSha,
  evidenceRef: candidate.evidenceRef,
  reason: candidate.reason,
  reviewer: candidate.reviewer,
  decisionNote: candidate.decisionNote,
  decidedAt: candidate.decidedAt,
}))

const ONTOLOGY_INPUT: OntologyEdgeInput[] = RELATION_SEED.filter(
  (relation) => relation.epistemicStatus === 'VERIFIED',
).map((relation) => ({
  edgeCode: relation.edgeCode,
  from: relation.from,
  to: relation.to,
  relationType: relation.relationType,
  perspective: relation.perspective,
  epistemicStatus: 'VERIFIED',
  sourceCode: relation.sourceCode,
  evidenceRef: relation.evidenceRef,
  evidenceSha: shaOf(relation.sourceCode),
}))

const CANDIDATE_INPUT: CandidateEdgeInput[] = CANDIDATE_SEED.filter(
  (candidate) => candidate.status === 'APPROVED',
).map((candidate) => ({
  candidateCode: candidate.candidateCode,
  from: candidate.from,
  to: candidate.to,
  relationType: candidate.relationType,
  perspective: candidate.perspective,
  epistemicStatus: 'UNKNOWN',
  sourceCode: candidate.sourceCode,
  evidenceSha: candidate.evidenceSha,
  evidenceFrame: candidate.evidenceFrame,
}))

export const GRAPH_SEED_MANIFEST = buildReleaseManifest({
  ontology: ONTOLOGY_INPUT,
  candidates: CANDIDATE_INPUT,
})

export const RELEASE_ROWS = [
  {
    releaseCode: GRAPH_SEED_MANIFEST.releaseCode,
    graphSha: GRAPH_SEED_MANIFEST.graphSha,
    manifest: GRAPH_SEED_MANIFEST.manifestText,
    edgeCount: GRAPH_SEED_MANIFEST.edgeCount,
    ontologyCount: GRAPH_SEED_MANIFEST.ontologyCount,
    candidateCount: GRAPH_SEED_MANIFEST.candidateCount,
    deduplicatedCount: GRAPH_SEED_MANIFEST.deduplicatedCount,
    builtAt: DECIDED_AT,
    builtBy: REVIEWER,
    note:
      'Seed release: four verified ontology relations plus the approved creative co-membership; the duplicate candidate is deduplicated.',
  },
]

export const POINTER_ROWS = [
  {
    key: 'active',
    releaseRef: `@graph_releases:${GRAPH_SEED_MANIFEST.releaseCode}`,
    version: 1,
    previousReleaseRef: null,
    activatedBy: REVIEWER,
    activatedAt: DECIDED_AT,
    note: 'Seed activation of the reviewed baseline release.',
  },
]

const LABELS = new Map(ENTITY_SEED.map((entity) => [entity.stableId, entity.labelEn] as const))

export const ADJACENCY_ROWS = GRAPH_SEED_MANIFEST.manifest.edges.map((edge) => {
  const [relationCode, relationKind, from, to, relationType, perspective, epistemicStatus, sourceCode, evidenceSha] =
    edge
  const fromLabel = LABELS.get(from) ?? from
  const toLabel = LABELS.get(to) ?? to
  return {
    adjacencyCode: `${GRAPH_SEED_MANIFEST.releaseCode}:${relationCode}`,
    releaseRef: `@graph_releases:${GRAPH_SEED_MANIFEST.releaseCode}`,
    releaseCode: GRAPH_SEED_MANIFEST.releaseCode,
    relationCode,
    relationKind,
    fromKey: from,
    toKey: to,
    fromLabel,
    toLabel,
    relationType,
    perspective,
    epistemicStatus,
    sourceCode,
    evidenceSha,
    searchText: [from, to, fromLabel, toLabel, relationType, perspective, sourceCode, relationCode]
      .join(' ')
      .toLowerCase(),
    derivedFrom: 'graph_releases.manifest',
  }
})
