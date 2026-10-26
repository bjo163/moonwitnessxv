import { serverClient } from '@/data/sdk'

/**
 * The Constellation is a read-only projection from the hub's ontology tables.
 * The Dock never computes a graph or a graph ID of its own.
 */

export interface GraphSource {
  code: string | null
  title: string | null
  sourceType: string | null
  citation: string | null
  sourceUri: string | null
  provenanceSha: string | null
  reviewStatus: string | null
  approvalNote: string | null
}

export interface GraphAlias {
  aliasCode: string
  alias: string
  languageCode: string
  scriptCode: string
  direction: 'ltr' | 'rtl'
  perspective: string
  status: string
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
  source: GraphSource | null
}

export interface GraphNode {
  stableId: string
  kind: string
  perspective: string
  labelEn: string
  labelId: string
  description: string
  identityStatus: string
  identityVersion: number
  validFrom: string | null
  validTo: string | null
  unilexStableId: string | null
  componentId: string
  aliases: GraphAlias[]
  source: GraphSource | null
}

export interface GraphEdge {
  edgeCode: string
  relationType: string
  perspective: string
  epistemicStatus: string
  statusLabel: string
  verified: boolean
  from: string
  to: string
  fromLabel: string
  toLabel: string
  assertedBy: string
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
  source: GraphSource | null
}

export interface IdentityDecision {
  reviewCode: string
  pairCode: string
  left: string
  right: string
  identityKind: string
  decision: string
  candidate: boolean
  activeMerge: boolean
  superseded: boolean
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
  effectiveFrom: string | null
  effectiveTo: string | null
  decidedAt: string | null
}

export interface GraphConflict {
  type: string
  code: string
  title: string
  status: string
  detail: string | null
  perspective: string | null
  source: GraphSource | null
  evidenceRef: string | null
}

export interface ReviewRubric {
  reviewerRequired: boolean
  evidenceRequiredForDecision: boolean
  automaticMerge: boolean
  unresolvedAllowed: boolean
  evidenceKinds: readonly string[]
  notice: string
}

export interface ConstellationProjection {
  state: string
  graphId: string
  registry: {
    version: string
    status: string
    entityCount: number
    notice: string
    pins: {
      decision: { ref: string; sha256: string }
      terminologyReview: { ref: string; sha256: string }
      empireRegistry: { ref: string; uri: string; sha256: string }
      vision: { ref: string; uri: string; sha256: string }
    }
  }
  authority: {
    canonicalTables: string[]
    readOnly: boolean
    notice: string
  }
  counts: {
    nodes: number
    aliases: number
    edges: number
    verifiedEdges: number
    identityReviews: number
    activeMerges: number
    components: number
    unresolvedConflicts: number
  }
  options: {
    perspectives: string[]
    kinds: string[]
    epistemicStatuses: string[]
  }
  nodes: GraphNode[]
  edges: GraphEdge[]
  identityDecisions: IdentityDecision[]
  conflicts: GraphConflict[]
  review: ReviewRubric
  sources: GraphSource[]
}

export async function readConstellation(): Promise<ConstellationProjection> {
  return serverClient().call<ConstellationProjection>('/ontology/constellation')
}
