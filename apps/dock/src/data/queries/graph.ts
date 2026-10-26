import { MoonApiError } from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'

/**
 * Relation detail is a read-only projection of the hub graph tables. A
 * candidate is a claim under review; a reviewed relation is an ontology edge;
 * only an immutable release is presented as the graph. The Dock derives none
 * of these states locally.
 */

export interface GraphSource {
  code: string | null
  title: string | null
  sourceType: string | null
  citation: string | null
  sourceUri: string | null
  provenanceSha: string | null
  reviewStatus: string | null
}

export interface RelationEvidence {
  span: string | null
  frame: string | null
  sha: string | null
  ref: string | null
  present: boolean
  exactSha: boolean
}

export interface RelationEntity {
  stableId: string
  kind: string
  perspective: string
  labelEn: string
  labelId: string
  identityStatus: string
}

export interface GraphPolicy {
  candidateReviewRequired: boolean
  evidenceAtExactSha: boolean
  evidenceSpanRequiredForApproval: boolean
  sameAsApproval: string
  automaticApproval: boolean
  releaseImmutable: boolean
  pointerSingleton: boolean
  adjacencyDerived: boolean
  revokedVisible: boolean
  deduplication: string
  notice: string
}

export interface GraphRelation {
  code: string
  label: string
  kind: 'CANDIDATE' | 'REVIEWED'
  candidateCode?: string
  edgeCode?: string
  from: string
  to: string
  fromLabel: string
  toLabel: string
  relationType: string
  perspective: string
  epistemicStatus: string
  epistemicLabel: string
  status: string | null
  statusLabel: string
  approved: boolean
  rejected?: boolean
  revoked?: boolean
  pending?: boolean
  verified?: boolean
  inActiveRelease: boolean
  unknown: boolean
  assertedBy?: string
  evidence: RelationEvidence
  source: GraphSource | null
  reviewer: string | null
  reason: string | null
  decisionNote: string | null
  decidedAt: string | null
  fromEntity: RelationEntity | null
  toEntity: RelationEntity | null
}

export interface RelationDetail {
  state: string
  relation: GraphRelation
  release: { releaseCode: string; graphSha: string } | null
  policy: GraphPolicy
}

export interface GraphReleaseSummary {
  releaseCode: string
  graphSha: string
  edgeCount: number
  ontologyCount: number
  candidateCount: number
  deduplicatedCount: number
  builtAt: string | null
  builtBy: string
  note: string | null
  active: boolean
}

export interface GraphPointer {
  key: string
  version: number
  releaseCode: string | null
  previousReleaseCode: string | null
  activatedBy: string | null
  activatedAt: string | null
  note: string | null
}

export interface GraphCandidateSummary {
  candidateCode: string
  kind: string
  from: string
  to: string
  fromLabel: string
  toLabel: string
  relationType: string
  perspective: string
  epistemicStatus: string
  epistemicLabel: string
  status: string
  statusLabel: string
  approved: boolean
  rejected: boolean
  revoked: boolean
  pending: boolean
  inActiveRelease: boolean
  unknown: boolean
  evidence: RelationEvidence
  source: GraphSource | null
  reviewer: string | null
  reason: string | null
  decisionNote: string | null
  decidedAt: string | null
}

export interface GraphOverview {
  state: string
  registry: {
    version: string
    status: string
    notice: string
    pins: Record<string, { ref: string; sha256: string; uri?: string }>
  }
  active: GraphReleaseSummary | null
  pointer: GraphPointer | null
  separation: {
    candidates: {
      table: string
      total: number
      pending: number
      approved: number
      rejected: number
      revoked: number
      notice: string
    }
    reviewed: {
      table: string
      activeReleaseCode: string | null
      edgeCount: number
      notice: string
    }
  }
  counts: {
    reviewedRelations: number
    unresolvedRelations: number
    candidates: number
    edgesInActiveRelease: number
    adjacencyRows: number
    adjacencyStale: boolean
    releases: number
  }
  adjacency: {
    derived: boolean
    rebuildable: boolean
    stale: boolean
    rows: number
    releaseCode: string | null
  }
  candidates: GraphCandidateSummary[]
  options: {
    statuses: string[]
    relationTypes: string[]
    perspectives: string[]
  }
  policy: GraphPolicy
  sources: GraphSource[]
}

export async function readRelationDetail(relationCode: string): Promise<RelationDetail | null> {
  try {
    return await serverClient().call<RelationDetail>(`/graph/relation?code=${encodeURIComponent(relationCode)}`)
  } catch (err) {
    if (err instanceof MoonApiError && (err.statusCode === 400 || err.statusCode === 404)) return null
    throw err
  }
}

export async function readGraphOverview(): Promise<GraphOverview> {
  return serverClient().call<GraphOverview>('/graph/overview')
}
