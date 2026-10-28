/**
 * UI-II P15a/P15b/P15d · the shape of one `/ontology/constellation` read and the
 * derivations the node inspector makes over it.
 *
 * Split from `constellation.ts` because it imports nothing: the Dock test runner
 * loads modules with plain Node, so a pure derivation must be reachable without the
 * SDK path alias. `constellation.ts` re-exports everything here and stays the only
 * place the hub is called.
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


/**
 * UI-II P15b/P15d · derivations over ONE read of `/ontology/constellation`.
 *
 * The projection carries no node-level relation list, no orphan flag and no
 * pointer from a node to the identity decisions and conflicts that name it, and
 * the Dock must not go ask for one: `readConstellation` in `./constellation.ts`
 * is the only hub call behind everything here. These derivations import nothing
 * and call nothing — they walk the arrays that read already returned and report
 * exactly what they say, including the two things they do not say, which the
 * inspector states in words instead of guessing.
 *
 * No derivation here produces a new status. A candidate row stays a candidate,
 * an UNKNOWN edge stays UNKNOWN, and an absent row stays absent.
 */

/** One node's relations, split by the direction the projection records. */
export interface NodeRelations {
  outgoing: GraphEdge[]
  incoming: GraphEdge[]
  /** Outgoing + incoming, for the honest "this node is unconnected" branch. */
  total: number
  /** Rows whose epistemic status is UNKNOWN or DISPUTED, kept with their code. */
  unresolved: GraphEdge[]
  /** Endpoint ids the edges point at that no node in this projection carries. */
  unknownEndpoints: string[]
}

/** Everything the projection's decision and conflict arrays say about one node. */
export interface NodeIdentityFacts {
  decisions: IdentityDecision[]
  entityConflicts: GraphConflict[]
  relationConflicts: GraphConflict[]
  identityConflicts: GraphConflict[]
  aliasConflicts: GraphConflict[]
}

export function findNode(projection: ConstellationProjection, stableId: string): GraphNode | null {
  if (stableId === '') return null
  return projection.nodes.find((node) => node.stableId === stableId) ?? null
}

export function nodeRelations(projection: ConstellationProjection, stableId: string): NodeRelations {
  const outgoing = projection.edges.filter((edge) => edge.from === stableId)
  const incoming = projection.edges.filter((edge) => edge.to === stableId)
  const touching = [...outgoing, ...incoming]
  const known = new Set(projection.nodes.map((node) => node.stableId))
  const unknownEndpoints = [
    ...new Set(
      touching
        .flatMap((edge) => [edge.from, edge.to])
        .filter((id) => id !== stableId && !known.has(id)),
    ),
  ]
  return {
    outgoing,
    incoming,
    total: touching.length,
    unresolved: touching.filter((edge) => edge.epistemicStatus === 'UNKNOWN' || edge.epistemicStatus === 'DISPUTED'),
    unknownEndpoints,
  }
}

/**
 * The hub's alias-collision key is `'ALIAS:' + normalizeAlias(alias)`, where
 * `normalizeAlias` trims, lower-cases and collapses runs of spaces
 * (`packages/moonql-ontology/src/graph.ts`). The Dock mirrors that one
 * expression so a node can find its own collisions in the array it was given;
 * `ui2-p15-graph-projection-inventory.test.mjs` pins the two texts together,
 * because a silent drift would hide a conflict instead of showing it.
 */
export function normalizeAliasSurface(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function nodeIdentityFacts(projection: ConstellationProjection, stableId: string): NodeIdentityFacts {
  const decisions = projection.identityDecisions.filter(
    (decision) => decision.left === stableId || decision.right === stableId,
  )
  const pairs = new Set(decisions.map((decision) => decision.pairCode))
  const edgeCodes = new Set(
    projection.edges
      .filter((edge) => edge.from === stableId || edge.to === stableId)
      .map((edge) => edge.edgeCode),
  )
  const aliasKeys = new Set(
    (findNode(projection, stableId)?.aliases ?? []).map((alias) => `ALIAS:${normalizeAliasSurface(alias.alias)}`),
  )

  return {
    decisions,
    entityConflicts: projection.conflicts.filter((c) => c.type === 'ENTITY' && c.code === stableId),
    relationConflicts: projection.conflicts.filter((c) => c.type === 'RELATION' && edgeCodes.has(c.code)),
    identityConflicts: projection.conflicts.filter((c) => c.type === 'IDENTITY' && pairs.has(c.code)),
    aliasConflicts: projection.conflicts.filter((c) => c.type === 'ALIAS' && aliasKeys.has(c.code)),
  }
}
