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

/**
 * UI-P06c/P06d · one candidate claim of the inspected pair, kept with the way it
 * faces that pair. `FORWARD` repeats the inspected direction, `REVERSE` asserts
 * the same two entities the other way round. Both stay separate claims: the
 * projection carries no symmetry or synonymity attribute the Dock could merge
 * them on, so it does not.
 */
export type SamePairOrientation = 'FORWARD' | 'REVERSE'

export interface SamePairAlternative {
  orientation: SamePairOrientation
  /** True when this row literally carries the inspected `relationType`. */
  sameTypeAsInspected: boolean
  /** The overview's own typed candidate row, unchanged. */
  claim: GraphCandidateSummary
}

export interface SamePairRelations {
  pair: { from: string; to: string }
  /** False when an endpoint is not resolved; then nothing can be compared at all. */
  pairResolved: boolean
  /** Release the `inActiveRelease` flags of the rows below refer to; null means none is active. */
  releaseCode: string | null
  /** Candidate rows in the whole projection, so a reader sees this pair's share of the queue. */
  candidateTotal: number
  /** Whether the inspected claim is itself one of those rows. */
  inspectedIsCandidate: boolean
  alternatives: SamePairAlternative[]
}

/**
 * UI-P06c/P06d · the other claims the graph carries about the same two entities.
 *
 * `/graph/relation` projects exactly one claim, so a reader looking at it cannot
 * see what else is asserted about that pair, and an unlisted alternative reads
 * as agreement. `/graph/overview` already projects every `graph_candidates` row
 * with its typed pair, status and source, so the alternatives are derived from
 * that existing D03 projection. D03 stays the only projection owner and no
 * route, table, second client or local inference is added.
 *
 * One extra read, deliberately: `readGraphOverview` caches nothing and the
 * detail payload carries no sibling rows, while this route otherwise reads only
 * `/graph/relation`. Dropping the section is the alternative to one more call,
 * never inventing a row.
 *
 * Stated limit, rendered rather than hidden: the overview lists candidate claims
 * and the active release summary, not every reviewed ontology edge, so a
 * same-pair reviewed relation that is not also a candidate row is not enumerated
 * here. An empty list therefore does not prove the pair is unclaimed.
 */
export async function readSamePairRelations(
  relation: Pick<GraphRelation, 'code' | 'from' | 'to' | 'relationType'>,
): Promise<SamePairRelations> {
  const overview = await readGraphOverview()
  const from = relation.from
  const to = relation.to
  const pairResolved = from.length > 0 && to.length > 0
  const inspectedIsCandidate = overview.candidates.some((claim) => claim.candidateCode === relation.code)
  const matches = pairResolved
    ? overview.candidates
        .filter((claim) => claim.candidateCode !== relation.code)
        .filter(
          (claim) => (claim.from === from && claim.to === to) || (claim.from === to && claim.to === from),
        )
    : []
  const alternatives: SamePairAlternative[] = matches
    .map((claim) => {
      const orientation: SamePairOrientation = claim.from === from ? 'FORWARD' : 'REVERSE'
      return { claim, orientation, sameTypeAsInspected: claim.relationType === relation.relationType }
    })
    .sort((a, b) => a.claim.candidateCode.localeCompare(b.claim.candidateCode))

  return {
    pair: { from, to },
    pairResolved,
    releaseCode: overview.active ? overview.active.releaseCode : null,
    candidateTotal: overview.candidates.length,
    inspectedIsCandidate,
    alternatives,
  }
}
