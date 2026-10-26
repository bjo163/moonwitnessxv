import { sha256Hex } from '@moonwitness/core'
import { ONTOLOGY_META, type Perspective } from './seed.js'

type Row = Record<string, unknown>

export type Orm = { model(name: string): { list(query?: Record<string, unknown>): Promise<Row[]> } }

const text = (value: unknown): string => (typeof value === 'string' ? value : value == null ? '' : String(value))
const nullable = (value: unknown): string | null => (value == null || value === '' ? null : text(value))

const iso = (value: unknown): string | null => {
  if (value == null || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString()
  return text(value)
}

const time = (value: unknown): number => {
  const raw = iso(value)
  return raw ? Date.parse(raw) || 0 : 0
}

const sourceView = (source: Row | undefined): Record<string, unknown> | null =>
  source
    ? {
        code: nullable(source.code),
        title: nullable(source.title),
        sourceType: nullable(source.sourceType),
        citation: nullable(source.citation),
        sourceUri: nullable(source.sourceUri),
        provenanceSha: nullable(source.provenanceSha),
        reviewStatus: nullable(source.reviewStatus),
        approvalNote: nullable(source.approvalNote),
      }
    : null

const statusLabel = (status: string): string => {
  switch (status) {
    case 'VERIFIED':
      return 'Verified by reviewer'
    case 'ASSERTED':
      return 'Asserted — not verified'
    case 'DISPUTED':
      return 'Disputed — unresolved'
    default:
      return 'Unknown — unresolved'
  }
}

function componentsOf(entityIds: string[], merges: Array<{ left: string; right: string }>): Map<string, string> {
  const parent = new Map(entityIds.map((id) => [id, id]))
  const find = (id: string): string => {
    let current = id
    while (parent.get(current) !== current) current = parent.get(current) ?? current
    return current
  }
  for (const merge of merges) {
    const a = find(merge.left)
    const b = find(merge.right)
    if (a === b) continue
    if (a < b) parent.set(b, a)
    else parent.set(a, b)
  }
  return new Map(entityIds.map((id) => [id, find(id)]))
}

const normalizeAlias = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ')

export const REVIEW_RUBRIC = {
  reviewerRequired: true,
  evidenceRequiredForDecision: true,
  automaticMerge: false,
  unresolvedAllowed: true,
  evidenceKinds: [
    'source document pinned to an exact commit and SHA-256',
    'edition provenance digest for a textual witness',
    'reviewer record naming the evidence for a negative decision',
  ],
  notice:
    'UNKNOWN may stay unresolved. Absence of evidence is not a decision, and a shared label never opens a merge on its own.',
} as const

export async function buildConstellation(orm: Orm): Promise<Record<string, unknown>> {
  const [entities, aliases, relations, identityReviews, sources] = await Promise.all([
    orm.model('onto_entities').list({ limit: 5000 }),
    orm.model('onto_aliases').list({ limit: 5000 }),
    orm.model('onto_relations').list({ limit: 5000 }),
    orm.model('onto_identity_reviews').list({ limit: 5000 }),
    orm.model('onto_sources').list({ limit: 200 }),
  ])

  const entityById = new Map(entities.map((row) => [text(row.id), row]))
  const sourceById = new Map(sources.map((row) => [text(row.id), row]))
  const sourceCode = (ref: unknown): string | null => nullable(sourceById.get(text(ref))?.code)
  const sourceFor = (ref: unknown) => sourceView(sourceById.get(text(ref)))

  const aliasesByEntity = new Map<string, Row[]>()
  for (const alias of aliases) {
    const key = text(alias.entityRef)
    const bucket = aliasesByEntity.get(key)
    if (bucket) bucket.push(alias)
    else aliasesByEntity.set(key, [alias])
  }

  const groupedReviews = new Map<string, Row[]>()
  for (const review of identityReviews) {
    const key = text(review.pairCode)
    const bucket = groupedReviews.get(key)
    if (bucket) bucket.push(review)
    else groupedReviews.set(key, [review])
  }
  const latestByPair = new Map<string, Row>()
  for (const [pair, rows] of groupedReviews) {
    const sorted = [...rows].sort(
      (a, b) => time(a.decidedAt) - time(b.decidedAt) || time(a.createdAt) - time(b.createdAt),
    )
    const latest = sorted[sorted.length - 1]
    if (latest) latestByPair.set(pair, latest)
  }

  const activeMergePairs = [...latestByPair.entries()]
    .filter(([, review]) => review.decision === 'APPROVED_MERGE')
    .map(([pair, review]) => ({
      pair,
      left: text(entityById.get(text(review.leftEntityRef))?.stableId),
      right: text(entityById.get(text(review.rightEntityRef))?.stableId),
    }))
    .filter((merge) => merge.left && merge.right)

  const componentByStable = componentsOf(
    entities.map((row) => text(row.stableId)),
    activeMergePairs,
  )

  const aliasView = (alias: Row) => ({
    aliasCode: text(alias.aliasCode),
    alias: text(alias.alias),
    languageCode: text(alias.languageCode),
    scriptCode: text(alias.scriptCode),
    direction: text(alias.direction) as 'ltr' | 'rtl',
    perspective: text(alias.perspective) as Perspective,
    status: text(alias.status),
    reviewer: nullable(alias.reviewer),
    reason: nullable(alias.reason),
    evidenceRef: nullable(alias.evidenceRef),
    source: sourceFor(alias.sourceRef),
  })

  const nodes = entities
    .map((entity) => {
      const stableId = text(entity.stableId)
      const entityAliases = (aliasesByEntity.get(text(entity.id)) ?? [])
        .map(aliasView)
        .sort((a, b) => a.alias.localeCompare(b.alias))
      return {
        stableId,
        kind: text(entity.kind),
        perspective: text(entity.perspective) as Perspective,
        labelEn: text(entity.labelEn),
        labelId: text(entity.labelId),
        description: text(entity.description),
        identityStatus: text(entity.identityStatus),
        identityVersion: Number(entity.identityVersion ?? 1),
        validFrom: iso(entity.validFrom),
        validTo: iso(entity.validTo),
        unilexStableId: nullable(entity.unilexStableId),
        componentId: componentByStable.get(stableId) ?? stableId,
        aliases: entityAliases,
        source: sourceFor(entity.sourceRef),
      }
    })
    .sort((a, b) => a.stableId.localeCompare(b.stableId))

  const nodeById = new Map(nodes.map((node) => [node.stableId, node]))

  const edges = relations
    .map((relation) => {
      const from = text(entityById.get(text(relation.sourceEntityRef))?.stableId)
      const to = text(entityById.get(text(relation.targetEntityRef))?.stableId)
      const epistemicStatus = text(relation.epistemicStatus)
      return {
        edgeCode: text(relation.edgeCode),
        relationType: text(relation.relationType),
        perspective: text(relation.perspective) as Perspective,
        epistemicStatus,
        statusLabel: statusLabel(epistemicStatus),
        verified: epistemicStatus === 'VERIFIED',
        from,
        to,
        fromLabel: nodeById.get(from)?.labelEn ?? from,
        toLabel: nodeById.get(to)?.labelEn ?? to,
        assertedBy: text(relation.assertedBy),
        reviewer: nullable(relation.reviewer),
        reason: nullable(relation.reason),
        evidenceRef: nullable(relation.evidenceRef),
        source: sourceFor(relation.sourceRef),
      }
    })
    .sort((a, b) => a.edgeCode.localeCompare(b.edgeCode))

  const identityDecisions = identityReviews
    .map((review) => {
      const pairCode = text(review.pairCode)
      const latest = latestByPair.get(pairCode)
      const isLatest = latest !== undefined && text(latest.id) === text(review.id)
      return {
        reviewCode: text(review.reviewCode),
        pairCode,
        left: text(entityById.get(text(review.leftEntityRef))?.stableId),
        right: text(entityById.get(text(review.rightEntityRef))?.stableId),
        identityKind: text(review.identityKind),
        decision: text(review.decision),
        candidate: text(review.decision) === 'PENDING',
        activeMerge: isLatest && text(review.decision) === 'APPROVED_MERGE',
        superseded: !isLatest,
        reviewer: nullable(review.reviewer),
        reason: nullable(review.reason),
        evidenceRef: nullable(review.evidenceRef),
        effectiveFrom: iso(review.effectiveFrom),
        effectiveTo: iso(review.effectiveTo),
        decidedAt: iso(review.decidedAt),
      }
    })
    .sort(
      (a, b) =>
        a.pairCode.localeCompare(b.pairCode) ||
        time(a.decidedAt) - time(b.decidedAt) ||
        a.reviewCode.localeCompare(b.reviewCode),
    )

  const aliasGroups = new Map<string, Array<{ stableId: string; alias: string; status: string }>>()
  for (const node of nodes) {
    for (const alias of node.aliases) {
      if (alias.status === 'REJECTED') continue
      const key = normalizeAlias(alias.alias)
      const bucket = aliasGroups.get(key)
      if (bucket) bucket.push({ stableId: node.stableId, alias: alias.alias, status: alias.status })
      else aliasGroups.set(key, [{ stableId: node.stableId, alias: alias.alias, status: alias.status }])
    }
  }

  const conflicts: Array<Record<string, unknown>> = []
  for (const edge of edges) {
    if (edge.epistemicStatus !== 'UNKNOWN' && edge.epistemicStatus !== 'DISPUTED') continue
    conflicts.push({
      type: 'RELATION',
      code: edge.edgeCode,
      title: `${edge.from} ${edge.relationType} ${edge.to}`,
      status: edge.epistemicStatus,
      detail: edge.reason,
      perspective: edge.perspective,
      source: edge.source,
      evidenceRef: edge.evidenceRef,
    })
  }
  for (const [pair, review] of latestByPair) {
    if (review.decision !== 'PENDING') continue
    conflicts.push({
      type: 'IDENTITY',
      code: pair,
      title: `${text(entityById.get(text(review.leftEntityRef))?.stableId)} ↔ ${text(
        entityById.get(text(review.rightEntityRef))?.stableId,
      )}`,
      status: 'PENDING',
      detail: review.reason,
      perspective: null,
      source: null,
      evidenceRef: review.evidenceRef,
    })
  }
  for (const node of nodes) {
    if (node.identityStatus !== 'CONTESTED') continue
    conflicts.push({
      type: 'ENTITY',
      code: node.stableId,
      title: node.labelEn,
      status: 'CONTESTED',
      detail: node.description,
      perspective: node.perspective,
      source: node.source,
      evidenceRef: null,
    })
  }
  for (const [alias, holders] of aliasGroups) {
    const distinct = new Set(holders.map((holder) => holder.stableId))
    if (distinct.size < 2) continue
    conflicts.push({
      type: 'ALIAS',
      code: `ALIAS:${alias}`,
      title: `Shared label "${alias}"`,
      status: 'COLLISION',
      detail: `${distinct.size} entities use this label; a shared label never merges them.`,
      perspective: null,
      source: null,
      evidenceRef: null,
    })
  }

  const canonical = {
    schema: 'moonwitness-ontology-graph-v1',
    nodes: nodes.map((node) => [
      node.stableId,
      node.kind,
      node.perspective,
      node.identityStatus,
      node.identityVersion,
      node.validFrom,
      node.validTo,
      node.source?.code ?? null,
      node.unilexStableId,
    ]),
    aliases: aliases
      .map((alias) => [
        text(entityById.get(text(alias.entityRef))?.stableId),
        text(alias.alias),
        text(alias.languageCode),
        text(alias.scriptCode),
        text(alias.direction),
        text(alias.perspective),
        text(alias.status),
        sourceCode(alias.sourceRef),
      ])
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    relations: edges.map((edge) => [
      edge.from,
      edge.to,
      edge.relationType,
      edge.perspective,
      edge.epistemicStatus,
      edge.source?.code ?? null,
      edge.reviewer,
    ]),
    identities: identityDecisions.map((review) => [
      review.pairCode,
      review.identityKind,
      review.decision,
      review.reviewer,
      review.effectiveFrom,
      review.effectiveTo,
    ]),
  }
  const graphId = `gph_${(await sha256Hex(JSON.stringify(canonical))).slice(0, 16)}`
  const components = new Set(nodes.map((node) => node.componentId))

  return {
    state: 'ok',
    graphId,
    registry: ONTOLOGY_META,
    authority: {
      canonicalTables: ['onto_entities', 'onto_aliases', 'onto_relations', 'onto_identity_reviews'],
      readOnly: true,
      notice:
        'The Constellation is a derived projection. It cannot write, and it is not a second graph authority.',
    },
    counts: {
      nodes: nodes.length,
      aliases: aliases.length,
      edges: edges.length,
      verifiedEdges: edges.filter((edge) => edge.verified).length,
      identityReviews: identityReviews.length,
      activeMerges: activeMergePairs.length,
      components: components.size,
      unresolvedConflicts: conflicts.length,
    },
    options: {
      perspectives: [...new Set(nodes.map((node) => node.perspective))].sort(),
      kinds: [...new Set(nodes.map((node) => node.kind))].sort(),
      epistemicStatuses: ['UNKNOWN', 'DISPUTED', 'ASSERTED', 'VERIFIED'],
    },
    nodes,
    edges,
    identityDecisions,
    conflicts,
    review: REVIEW_RUBRIC,
    sources: sources.map((source) => sourceView(source)).filter(Boolean),
  }
}

export function conflictQueue(projection: Record<string, unknown>): Record<string, unknown> {
  const conflicts = (projection.conflicts as Array<Record<string, unknown>> | undefined) ?? []
  const counts = conflicts.reduce<Record<string, number>>((acc, item) => {
    const key = String(item.type)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  return {
    state: 'ok',
    graphId: projection.graphId,
    counts,
    total: conflicts.length,
    items: conflicts,
    rubric: REVIEW_RUBRIC,
  }
}

export { normalizeAlias, statusLabel }
