import { badRequest, conflict, notFound } from '@moonwitness/core'
import {
  buildReleaseManifest,
  parseManifest,
  type CandidateEdgeInput,
  type OntologyEdgeInput,
  type ReleaseManifest,
} from './manifest.js'
import {
  CANDIDATE_STATUSES,
  GRAPH_META,
  GRAPH_POLICY,
  GRAPH_RELATION_TYPES,
  type CandidateStatus,
} from './seed.js'

type Row = Record<string, unknown>
type Repo = {
  list(query?: Record<string, unknown>): Promise<Row[]>
  create(data: Row): Promise<Row>
  update(id: string, patch: Row): Promise<Row>
  removeWhere(where: unknown, limit?: number): Promise<number>
}
export type GraphOrm = { model(name: string): Repo }

const SHA_RE = /^[0-9a-f]{64}$/

const text = (value: unknown): string => (typeof value === 'string' ? value : value == null ? '' : String(value))
const nullable = (value: unknown): string | null => (value == null || value === '' ? null : text(value))
const iso = (value: unknown): string | null => {
  if (value == null || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString()
  return text(value)
}
const ms = (value: unknown): number => {
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
      }
    : null

const epistemicLabel = (status: string): string => {
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

const candidateStatusLabel = (status: string): string => {
  switch (status) {
    case 'APPROVED':
      return 'Candidate — approved, not yet a graph edge'
    case 'REJECTED':
      return 'Candidate — rejected, kept for the record'
    case 'REVOKED':
      return 'Candidate — revoked, kept visible'
    default:
      return 'Candidate — pending review'
  }
}

const candidateLabel = (status: string, inActiveRelease: boolean): string => {
  if (status === 'APPROVED') {
    return inActiveRelease ? 'Approved candidate — in the active release' : 'Approved candidate — awaiting a release'
  }
  return candidateStatusLabel(status)
}

const resolved = (status: string): boolean => status === 'UNKNOWN' || status === 'DISPUTED'

type Context = {
  entities: Row[]
  sources: Row[]
  relations: Row[]
  candidates: Row[]
  releases: Row[]
  pointer: Row | null
  adjacency: Row[]
  entityByStable: Map<string, Row>
  sourceById: Map<string, Row>
  sourceByCode: Map<string, Row>
  releaseById: Map<string, Row>
  active: Row | null
}

async function loadContext(orm: GraphOrm): Promise<Context> {
  const [entities, sources, relations, candidates, releases, pointers, adjacency] = await Promise.all([
    orm.model('onto_entities').list({ limit: 5000 }),
    orm.model('onto_sources').list({ limit: 200 }),
    orm.model('onto_relations').list({ limit: 5000 }),
    orm.model('graph_candidates').list({ limit: 5000 }),
    orm.model('graph_releases').list({ limit: 5000 }),
    orm.model('graph_release_pointer').list({ limit: 1 }),
    orm.model('graph_adjacency').list({ limit: 5000 }),
  ])
  const entityById = new Map(entities.map((row) => [text(row.id), row]))
  const stableByEntityId = new Map(entities.map((row) => [text(row.id), text(row.stableId)]))
  const entityByStable = new Map(entities.map((row) => [text(row.stableId), row]))
  const sourceById = new Map(sources.map((row) => [text(row.id), row]))
  const sourceByCode = new Map(sources.map((row) => [text(row.code), row]))
  const releaseById = new Map(releases.map((row) => [text(row.id), row]))
  const pointer = pointers[0] ?? null
  const active = pointer ? (releaseById.get(text(pointer.releaseRef)) ?? null) : null
  void entityById
  void stableByEntityId
  return {
    entities,
    sources,
    relations,
    candidates,
    releases,
    pointer,
    adjacency,
    entityByStable,
    sourceById,
    sourceByCode,
    releaseById,
    active,
  }
}

const stableOf = (context: Context, ref: unknown): string => {
  const id = text(ref)
  const entity = context.entities.find((row) => text(row.id) === id)
  return entity ? text(entity.stableId) : ''
}
const sourceOf = (context: Context, ref: unknown): Row | undefined => context.sourceById.get(text(ref))

const entityView = (context: Context, stableId: string): Record<string, unknown> | null => {
  const entity = context.entityByStable.get(stableId)
  if (!entity) return null
  return {
    stableId,
    kind: text(entity.kind),
    perspective: text(entity.perspective),
    labelEn: text(entity.labelEn),
    labelId: text(entity.labelId),
    identityStatus: text(entity.identityStatus),
  }
}

function activeManifest(context: Context): ReleaseManifest | null {
  if (!context.active) return null
  try {
    return parseManifest(context.active.manifest)
  } catch {
    return null
  }
}

function activeSets(context: Context): { edges: Set<string>; candidates: Set<string> } {
  const manifest = activeManifest(context)
  const edges = new Set<string>()
  const candidates = new Set<string>()
  for (const edge of manifest?.edges ?? []) {
    if (edge[1] === 'ONTOLOGY') edges.add(edge[0])
    else candidates.add(edge[0])
  }
  return { edges, candidates }
}

function candidateView(context: Context, candidate: Row, inActiveRelease: boolean): Record<string, unknown> {
  const from = stableOf(context, candidate.sourceEntityRef)
  const to = stableOf(context, candidate.targetEntityRef)
  const source = sourceOf(context, candidate.sourceRef)
  const status = text(candidate.status)
  const epistemicStatus = text(candidate.epistemicStatus)
  const evidenceSha = nullable(candidate.evidenceSha)
  const evidenceSpan = nullable(candidate.evidenceSpan)
  return {
    candidateCode: text(candidate.candidateCode),
    kind: 'CANDIDATE',
    from,
    to,
    fromLabel: text(context.entityByStable.get(from)?.labelEn ?? from),
    toLabel: text(context.entityByStable.get(to)?.labelEn ?? to),
    relationType: text(candidate.relationType),
    perspective: text(candidate.perspective),
    epistemicStatus,
    epistemicLabel: epistemicLabel(epistemicStatus),
    status,
    statusLabel: candidateLabel(status, inActiveRelease),
    approved: status === 'APPROVED',
    rejected: status === 'REJECTED',
    revoked: status === 'REVOKED',
    pending: status === 'PENDING',
    inActiveRelease,
    unknown: resolved(epistemicStatus),
    evidence: {
      span: evidenceSpan,
      frame: nullable(candidate.evidenceFrame),
      sha: evidenceSha,
      ref: nullable(candidate.evidenceRef),
      present: Boolean(evidenceSpan && evidenceSha),
      exactSha: Boolean(evidenceSha && nullable(source?.provenanceSha) === evidenceSha),
    },
    source: sourceView(source),
    reviewer: nullable(candidate.reviewer),
    reason: nullable(candidate.reason),
    decisionNote: nullable(candidate.decisionNote),
    decidedAt: iso(candidate.decidedAt),
  }
}

function relationView(context: Context, relation: Row, inActiveRelease: boolean): Record<string, unknown> {
  const from = stableOf(context, relation.sourceEntityRef)
  const to = stableOf(context, relation.targetEntityRef)
  const source = sourceOf(context, relation.sourceRef)
  const epistemicStatus = text(relation.epistemicStatus)
  const verified = epistemicStatus === 'VERIFIED'
  const evidenceSha = nullable(source?.provenanceSha)
  return {
    edgeCode: text(relation.edgeCode),
    kind: 'REVIEWED',
    from,
    to,
    fromLabel: text(context.entityByStable.get(from)?.labelEn ?? from),
    toLabel: text(context.entityByStable.get(to)?.labelEn ?? to),
    relationType: text(relation.relationType),
    perspective: text(relation.perspective),
    epistemicStatus,
    epistemicLabel: epistemicLabel(epistemicStatus),
    statusLabel: verified ? 'Reviewed relation — verified' : `Reviewed relation — ${epistemicLabel(epistemicStatus)}`,
    verified,
    approved: verified,
    inActiveRelease,
    unknown: resolved(epistemicStatus),
    assertedBy: text(relation.assertedBy),
    evidence: {
      span: null,
      frame: 'ONTOLOGY_RELATION',
      sha: evidenceSha,
      ref: nullable(relation.evidenceRef),
      present: Boolean(evidenceSha),
      exactSha: Boolean(evidenceSha && SHA_RE.test(evidenceSha)),
    },
    source: sourceView(source),
    reviewer: nullable(relation.reviewer),
    reason: nullable(relation.reason),
    decisionNote: null,
    decidedAt: null,
  }
}

function releaseSummary(row: Row, activeCode: string | null): Record<string, unknown> {
  return {
    releaseCode: text(row.releaseCode),
    graphSha: text(row.graphSha),
    edgeCount: Number(row.edgeCount ?? 0),
    ontologyCount: Number(row.ontologyCount ?? 0),
    candidateCount: Number(row.candidateCount ?? 0),
    deduplicatedCount: Number(row.deduplicatedCount ?? 0),
    builtAt: iso(row.builtAt),
    builtBy: text(row.builtBy),
    note: nullable(row.note),
    active: activeCode !== null && text(row.releaseCode) === activeCode,
  }
}

function pointerView(context: Context): Record<string, unknown> | null {
  const pointer = context.pointer
  if (!pointer) return null
  const previous = pointer.previousReleaseRef ? context.releaseById.get(text(pointer.previousReleaseRef)) : undefined
  return {
    key: text(pointer.key),
    version: Number(pointer.version ?? 0),
    releaseCode: context.active ? text(context.active.releaseCode) : null,
    previousReleaseCode: previous ? text(previous.releaseCode) : null,
    activatedBy: nullable(pointer.activatedBy),
    activatedAt: iso(pointer.activatedAt),
    note: nullable(pointer.note),
  }
}

function collectReleaseInput(context: Context): {
  input: { ontology: OntologyEdgeInput[]; candidates: CandidateEdgeInput[] }
  blocked: Array<{ code: string; reason: string }>
} {
  const ontology: OntologyEdgeInput[] = []
  const candidates: CandidateEdgeInput[] = []
  const blocked: Array<{ code: string; reason: string }> = []

  for (const relation of context.relations) {
    if (text(relation.epistemicStatus) !== 'VERIFIED') continue
    const code = text(relation.edgeCode)
    const from = stableOf(context, relation.sourceEntityRef)
    const to = stableOf(context, relation.targetEntityRef)
    const source = sourceOf(context, relation.sourceRef)
    const sha = nullable(source?.provenanceSha)
    if (!from || !to) {
      blocked.push({ code, reason: 'a verified relation points at a missing entity' })
      continue
    }
    if (!source || !sha || !SHA_RE.test(sha)) {
      blocked.push({ code, reason: 'a verified relation has no source pinned to an exact SHA-256' })
      continue
    }
    ontology.push({
      edgeCode: code,
      from,
      to,
      relationType: text(relation.relationType),
      perspective: text(relation.perspective),
      epistemicStatus: 'VERIFIED',
      sourceCode: text(source.code),
      evidenceRef: nullable(relation.evidenceRef),
      evidenceSha: sha,
    })
  }

  for (const candidate of context.candidates) {
    if (text(candidate.status) !== 'APPROVED') continue
    const code = text(candidate.candidateCode)
    if (text(candidate.relationType) === 'sameAs') {
      blocked.push({ code, reason: 'sameAs can never enter a release; identity is an ontology review decision' })
      continue
    }
    const from = stableOf(context, candidate.sourceEntityRef)
    const to = stableOf(context, candidate.targetEntityRef)
    const source = sourceOf(context, candidate.sourceRef)
    const span = nullable(candidate.evidenceSpan)
    const sha = nullable(candidate.evidenceSha)
    if (!from || !to) {
      blocked.push({ code, reason: 'an approved candidate points at a missing entity' })
      continue
    }
    if (!span || !sha || !SHA_RE.test(sha)) {
      blocked.push({ code, reason: 'an approved candidate has no evidence span pinned to an exact SHA-256' })
      continue
    }
    if (!source || nullable(source.provenanceSha) !== sha) {
      blocked.push({ code, reason: 'the candidate SHA does not match the provenance SHA of its source' })
      continue
    }
    candidates.push({
      candidateCode: code,
      from,
      to,
      relationType: text(candidate.relationType),
      perspective: text(candidate.perspective),
      epistemicStatus: text(candidate.epistemicStatus),
      sourceCode: text(source.code),
      evidenceSha: sha,
      evidenceFrame: text(candidate.evidenceFrame),
    })
  }

  return { input: { ontology, candidates }, blocked }
}

function deltaFor(context: Context, next: ReleaseManifest): Record<string, unknown> {
  const current = activeManifest(context)
  const before = new Map(
    (current?.edges ?? []).map((edge) => [[edge[2], edge[3], edge[4], edge[5]].join('|'), edge[0]] as const),
  )
  const after = new Map(
    next.edges.map((edge) => [[edge[2], edge[3], edge[4], edge[5]].join('|'), edge[0]] as const),
  )
  const added: string[] = []
  const removed: string[] = []
  let unchanged = 0
  for (const [identity, code] of after) {
    if (before.has(identity)) unchanged += 1
    else added.push(code)
  }
  for (const [identity, code] of before) {
    if (!after.has(identity)) removed.push(code)
  }
  return {
    added: added.length,
    removed: removed.length,
    unchanged,
    addedCodes: added.sort().slice(0, 20),
    removedCodes: removed.sort().slice(0, 20),
  }
}

function adjacencyState(context: Context): { stale: boolean; rows: Row[]; manifest: ReleaseManifest | null } {
  if (!context.active) return { stale: true, rows: [], manifest: null }
  const releaseCode = text(context.active.releaseCode)
  const rows = context.adjacency.filter((row) => text(row.releaseCode) === releaseCode)
  const manifest = activeManifest(context)
  const expected = manifest?.edges.length ?? 0
  return { stale: rows.length !== expected, rows, manifest }
}

const adjacencyItem = (row: Row): Record<string, unknown> => ({
  code: text(row.relationCode),
  kind: text(row.relationKind),
  from: text(row.fromKey),
  to: text(row.toKey),
  fromLabel: text(row.fromLabel),
  toLabel: text(row.toLabel),
  relationType: text(row.relationType),
  perspective: text(row.perspective),
  epistemicStatus: text(row.epistemicStatus),
  sourceCode: nullable(row.sourceCode),
  evidenceSha: nullable(row.evidenceSha),
})

export async function graphOverview(orm: GraphOrm): Promise<Record<string, unknown>> {
  const context = await loadContext(orm)
  const sets = activeSets(context)
  const candidates = [...context.candidates]
    .sort((a, b) => text(a.candidateCode).localeCompare(text(b.candidateCode)))
    .map((candidate) => candidateView(context, candidate, sets.candidates.has(text(candidate.candidateCode))))
  const counts = CANDIDATE_STATUSES.reduce<Record<string, number>>((acc, status) => {
    acc[status] = candidates.filter((candidate) => candidate.status === status).length
    return acc
  }, {})
  const reviewed = context.relations.filter((row) => text(row.epistemicStatus) === 'VERIFIED')
  const active = context.active
  const adjacency = adjacencyState(context)
  return {
    state: 'ok',
    registry: GRAPH_META,
    active: active ? releaseSummary(active, text(active.releaseCode)) : null,
    pointer: pointerView(context),
    separation: {
      candidates: {
        table: 'graph_candidates',
        total: candidates.length,
        pending: counts.PENDING ?? 0,
        approved: counts.APPROVED ?? 0,
        rejected: counts.REJECTED ?? 0,
        revoked: counts.REVOKED ?? 0,
        notice: 'A candidate is a claim under review. It is never presented as a graph edge.',
      },
      reviewed: {
        table: 'graph_releases',
        activeReleaseCode: active ? text(active.releaseCode) : null,
        edgeCount: Number(active?.edgeCount ?? 0),
        notice: 'Only an immutable release is presented as the reviewed graph. UNKNOWN and DISPUTED claims stay out.',
      },
    },
    counts: {
      reviewedRelations: reviewed.length,
      unresolvedRelations: context.relations.length - reviewed.length,
      candidates: candidates.length,
      edgesInActiveRelease: Number(active?.edgeCount ?? 0),
      adjacencyRows: adjacency.rows.length,
      adjacencyStale: adjacency.stale,
      releases: context.releases.length,
    },
    adjacency: {
      derived: true,
      rebuildable: true,
      stale: adjacency.stale,
      rows: adjacency.rows.length,
      releaseCode: active ? text(active.releaseCode) : null,
    },
    candidates,
    options: {
      statuses: [...CANDIDATE_STATUSES],
      relationTypes: [...GRAPH_RELATION_TYPES],
      perspectives: [...new Set(context.entities.map((entity) => text(entity.perspective)))].sort(),
    },
    policy: GRAPH_POLICY,
    sources: context.sources.map((source) => sourceView(source)).filter(Boolean),
  }
}

export async function relationDetail(orm: GraphOrm, code: string): Promise<Record<string, unknown> | null> {
  const context = await loadContext(orm)
  const sets = activeSets(context)
  const candidate = context.candidates.find((row) => text(row.candidateCode) === code)
  if (candidate) {
    const view = candidateView(context, candidate, sets.candidates.has(code))
    return {
      state: 'ok',
      relation: {
        ...view,
        code: text(candidate.candidateCode),
        label: candidateLabel(text(candidate.status), sets.candidates.has(code)),
        fromEntity: entityView(context, text(view.from)),
        toEntity: entityView(context, text(view.to)),
      },
      release: context.active
        ? { releaseCode: text(context.active.releaseCode), graphSha: text(context.active.graphSha) }
        : null,
      policy: GRAPH_POLICY,
    }
  }
  const relation = context.relations.find((row) => text(row.edgeCode) === code)
  if (!relation) return null
  const view = relationView(context, relation, sets.edges.has(code))
  return {
    state: 'ok',
    relation: {
      ...view,
      code: text(relation.edgeCode),
      label: view.statusLabel,
      fromEntity: entityView(context, text(view.from)),
      toEntity: entityView(context, text(view.to)),
    },
    release: context.active
      ? { releaseCode: text(context.active.releaseCode), graphSha: text(context.active.graphSha) }
      : null,
    policy: GRAPH_POLICY,
  }
}

export async function adjacencyView(orm: GraphOrm, node: string | null): Promise<Record<string, unknown>> {
  const context = await loadContext(orm)
  const adjacency = adjacencyState(context)
  const rows = node ? adjacency.rows.filter((row) => text(row.fromKey) === node || text(row.toKey) === node) : adjacency.rows
  return {
    state: adjacency.stale ? 'stale' : 'ok',
    releaseCode: context.active ? text(context.active.releaseCode) : null,
    stale: adjacency.stale,
    derived: true,
    rebuildable: true,
    node: node ?? null,
    total: rows.length,
    items: rows.map(adjacencyItem).sort((a, b) => String(a.code).localeCompare(String(b.code))),
    notice: adjacency.stale
      ? 'The derived adjacency no longer matches the active release. Rebuild it from the manifest.'
      : 'Adjacency is derived from the active release manifest and can be dropped and rebuilt at any time.',
  }
}

export async function searchGraph(orm: GraphOrm, query: string): Promise<Record<string, unknown>> {
  const q = query.trim().toLowerCase()
  if (q.length < 2) throw badRequest('graph search needs at least two characters')
  const context = await loadContext(orm)
  const adjacency = adjacencyState(context)
  const rows = adjacency.rows.filter((row) => text(row.searchText).includes(q)).slice(0, 50)
  return {
    state: adjacency.stale ? 'stale' : 'ok',
    releaseCode: context.active ? text(context.active.releaseCode) : null,
    stale: adjacency.stale,
    query,
    total: rows.length,
    items: rows.map(adjacencyItem),
    notice:
      'Search covers the derived adjacency of the active release only; candidates appear in the review queue, not here.',
  }
}

export async function listReleases(orm: GraphOrm): Promise<Record<string, unknown>> {
  const context = await loadContext(orm)
  const activeCode = context.active ? text(context.active.releaseCode) : null
  const items = [...context.releases]
    .map((release) => releaseSummary(release, activeCode))
    .sort((a, b) => ms(b.builtAt) - ms(a.builtAt) || String(b.releaseCode).localeCompare(String(a.releaseCode)))
  return {
    state: 'ok',
    active: activeCode,
    pointer: pointerView(context),
    total: items.length,
    items,
    policy: GRAPH_POLICY,
  }
}

function lineageOf(manifest: ReleaseManifest): Record<string, unknown> {
  const sources = new Map<string, string>()
  for (const edge of manifest.edges) {
    if (edge[7] && edge[8]) sources.set(edge[7], edge[8])
  }
  return {
    sources: [...sources.entries()]
      .map(([code, sha]) => ({ code, sha256: sha }))
      .sort((a, b) => a.code.localeCompare(b.code)),
    ontologyEdges: manifest.ontology.map((edge) => edge[0]),
    candidates: manifest.candidates.map((edge) => edge[0]),
    deduplicated: manifest.deduplicated,
  }
}

export async function releaseDetail(orm: GraphOrm, code: string): Promise<Record<string, unknown> | null> {
  const context = await loadContext(orm)
  const release = context.releases.find((row) => text(row.releaseCode) === code)
  if (!release) return null
  const manifest = parseManifest(release.manifest)
  const activeCode = context.active ? text(context.active.releaseCode) : null
  return {
    state: 'ok',
    release: releaseSummary(release, activeCode),
    manifest,
    lineage: lineageOf(manifest),
    policy: GRAPH_POLICY,
  }
}

export async function exportRelease(orm: GraphOrm, code: string | null): Promise<Record<string, unknown> | null> {
  const context = await loadContext(orm)
  const release = code
    ? context.releases.find((row) => text(row.releaseCode) === code)
    : (context.active ?? undefined)
  if (!release) return null
  const manifest = parseManifest(release.manifest)
  return {
    state: 'ok',
    schema: 'moonwitness-graph-export-v1',
    release: releaseSummary(release, context.active ? text(context.active.releaseCode) : null),
    graphSha: text(release.graphSha),
    manifest,
    lineage: lineageOf(manifest),
    replay:
      'Replay means rebuilding the release from the same reviewed relations and approved candidates. An identical input yields the same graphSha and reuses the existing release.',
  }
}

export type BuildResult =
  | { state: 'blocked'; blocked: Array<{ code: string; reason: string }>; message: string }
  | { state: 'built' | 'existing'; release: Record<string, unknown>; dedup: boolean; delta: Record<string, unknown> }

export async function buildRelease(orm: GraphOrm, builtBy: string, note: string | null): Promise<BuildResult> {
  const context = await loadContext(orm)
  const { input, blocked } = collectReleaseInput(context)
  if (blocked.length) {
    return {
      state: 'blocked',
      blocked,
      message: `release blocked: ${blocked.map((item) => `${item.code} (${item.reason})`).join('; ')}`,
    }
  }

  const built = buildReleaseManifest(input)
  const activeCode = context.active ? text(context.active.releaseCode) : null
  const delta = deltaFor(context, built.manifest)
  const existing = context.releases.find((row) => text(row.graphSha) === built.graphSha)
  if (existing) {
    return {
      state: 'existing',
      release: releaseSummary(existing, activeCode),
      dedup: true,
      delta,
    }
  }

  const saved = await orm.model('graph_releases').create({
    releaseCode: built.releaseCode,
    graphSha: built.graphSha,
    manifest: built.manifestText,
    edgeCount: built.edgeCount,
    ontologyCount: built.ontologyCount,
    candidateCount: built.candidateCount,
    deduplicatedCount: built.deduplicatedCount,
    builtAt: new Date().toISOString(),
    builtBy,
    note,
  })
  return {
    state: 'built',
    release: releaseSummary(saved, activeCode),
    dedup: false,
    delta,
  }
}

export type ActivateResult = {
  state: 'activated' | 'unchanged' | 'conflict'
  direction?: 'ADVANCE' | 'ROLLBACK' | 'SWITCH' | 'INITIAL'
  pointer?: Record<string, unknown> | null
  previous?: Record<string, unknown> | null
  release?: Record<string, unknown> | null
  currentVersion?: number
  expectedVersion?: number
  message?: string
  notice?: string
}

export async function activateRelease(
  orm: GraphOrm,
  code: string,
  activatedBy: string,
  expectedVersion: number | null,
  note: string | null,
): Promise<ActivateResult> {
  const context = await loadContext(orm)
  const release = context.releases.find((row) => text(row.releaseCode) === code)
  if (!release) throw notFound(`graph release "${code}" not found`)
  const pointer = context.pointer
  const currentVersion = Number(pointer?.version ?? 0)
  if (expectedVersion !== null && expectedVersion !== currentVersion) {
    return {
      state: 'conflict',
      currentVersion,
      expectedVersion,
      message: `the active graph pointer is at version ${currentVersion}, not ${expectedVersion}`,
    }
  }

  if (pointer && text(pointer.releaseRef) === text(release.id)) {
    return { state: 'unchanged', pointer: pointerView(context), release: releaseSummary(release, code) }
  }

  const previous = context.active
  const direction: ActivateResult['direction'] = !previous
    ? 'INITIAL'
    : ms(release.builtAt) < ms(previous.builtAt)
      ? 'ROLLBACK'
      : ms(release.builtAt) > ms(previous.builtAt)
        ? 'ADVANCE'
        : text(release.graphSha) === text(previous.graphSha)
          ? 'ADVANCE'
          : 'SWITCH'
  const now = new Date().toISOString()
  const patch = {
    releaseRef: text(release.id),
    version: currentVersion + 1,
    previousReleaseRef: previous ? text(previous.id) : null,
    activatedBy,
    activatedAt: now,
    note,
  }
  if (pointer) await orm.model('graph_release_pointer').update(text(pointer.id), patch)
  else await orm.model('graph_release_pointer').create({ key: 'active', ...patch })

  const nextContext = await loadContext(orm)
  return {
    state: 'activated',
    direction,
    pointer: pointerView(nextContext),
    previous: previous ? releaseSummary(previous, null) : null,
    release: releaseSummary(release, code),
    notice:
      'The release is immutable; only the singleton pointer moved. The derived adjacency is stale until rebuilt.',
  }
}

export async function rebuildAdjacency(orm: GraphOrm, rebuiltBy: string): Promise<Record<string, unknown>> {
  const context = await loadContext(orm)
  if (!context.active) throw badRequest('no active graph release: activate a release before rebuilding adjacency')
  const releaseCode = text(context.active.releaseCode)
  const manifest = activeManifest(context)
  if (!manifest) throw badRequest(`active release "${releaseCode}" has an unreadable manifest`)

  let cleared = 0
  for (;;) {
    const removed = await orm.model('graph_adjacency').removeWhere({}, 1000)
    cleared += removed
    if (removed < 1000) break
  }

  const rows: Row[] = []
  for (const edge of manifest.edges) {
    const [relationCode, relationKind, from, to, relationType, perspective, epistemicStatus, sourceCode, evidenceSha] = edge
    const fromLabel = text(context.entityByStable.get(from)?.labelEn ?? from)
    const toLabel = text(context.entityByStable.get(to)?.labelEn ?? to)
    rows.push({
      adjacencyCode: `${releaseCode}:${relationCode}`,
      releaseRef: text(context.active.id),
      releaseCode,
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
    })
  }
  for (const row of rows) await orm.model('graph_adjacency').create(row)

  const check = await loadContext(orm)
  const state = adjacencyState(check)
  return {
    state: state.stale ? 'incomplete' : 'rebuilt',
    releaseCode,
    cleared,
    rows: rows.length,
    manifestEdges: manifest.edges.length,
    stale: state.stale,
    rebuiltBy,
    rebuiltAt: new Date().toISOString(),
    rebuildable: true,
    notice:
      'Adjacency is a derived projection of the active immutable release. Dropping it loses no authority; rebuilding restores it.',
  }
}

export type CandidateDecision = 'APPROVED' | 'REJECTED' | 'REVOKED'

export async function registerCandidate(
  orm: GraphOrm,
  input: {
    from: string
    to: string
    relationType: string
    perspective: string
    sourceCode: string
    evidenceFrame: string
    evidenceSpan: string | null
    evidenceSha: string | null
    evidenceRef: string | null
    reason: string
  },
): Promise<Record<string, unknown>> {
  const context = await loadContext(orm)
  const fromEntity = context.entityByStable.get(input.from)
  const toEntity = context.entityByStable.get(input.to)
  if (!fromEntity) throw notFound(`ontology entity "${input.from}" not found`)
  if (!toEntity) throw notFound(`ontology entity "${input.to}" not found`)
  const source = context.sourceByCode.get(input.sourceCode)
  if (!source) throw notFound(`ontology source "${input.sourceCode}" not found`)
  if (input.evidenceSha) {
    if (!SHA_RE.test(input.evidenceSha)) throw badRequest('evidenceSha must be a lowercase SHA-256 digest (64 hex characters)')
    if (nullable(source.provenanceSha) !== input.evidenceSha) {
      throw badRequest('evidenceSha does not match the provenance SHA of the cited source')
    }
  }
  const candidateCode = `GC-${input.from}-${input.to}-${input.relationType}-${input.perspective}`
  const existing = context.candidates.find((row) => text(row.candidateCode) === candidateCode)
  if (existing) throw conflict(`candidate "${candidateCode}" is already registered`)
  const saved = await orm.model('graph_candidates').create({
    candidateCode,
    sourceEntityRef: text(fromEntity.id),
    targetEntityRef: text(toEntity.id),
    relationType: input.relationType,
    perspective: input.perspective,
    sourceRef: text(source.id),
    epistemicStatus: 'UNKNOWN',
    status: 'PENDING',
    evidenceFrame: input.evidenceFrame,
    evidenceSpan: input.evidenceSpan,
    evidenceSha: input.evidenceSha,
    evidenceRef: input.evidenceRef,
    reason: input.reason,
    reviewer: null,
    decisionNote: null,
    decidedAt: null,
  })
  return {
    state: 'recorded',
    candidate: candidateView(context, saved, false),
    notice:
      'The claim is a candidate, not a graph edge. It needs a reviewer and exact evidence before it can enter a release.',
    policy: GRAPH_POLICY,
  }
}

export async function decideCandidate(
  orm: GraphOrm,
  input: {
    candidateCode: string
    decision: CandidateDecision
    reviewer: string
    reason: string
    evidenceSpan: string | null
    evidenceSha: string | null
  },
): Promise<Record<string, unknown>> {
  const context = await loadContext(orm)
  const candidate = context.candidates.find((row) => text(row.candidateCode) === input.candidateCode)
  if (!candidate) throw notFound(`graph candidate "${input.candidateCode}" not found`)
  const status = text(candidate.status) as CandidateStatus
  const relationType = text(candidate.relationType)

  if (input.decision === 'APPROVED') {
    if (status !== 'PENDING') throw badRequest(`candidate is ${status}; only a PENDING candidate can be approved`)
    if (relationType === 'sameAs') {
      throw badRequest('sameAs can never be approved here: identity changes belong to the ontology identity review (M10)')
    }
    const span = input.evidenceSpan ?? nullable(candidate.evidenceSpan)
    const sha = input.evidenceSha ?? nullable(candidate.evidenceSha)
    if (!span || !sha) {
      throw badRequest('approval needs an evidence span and an exact SHA; a missing evidence cannot be approved')
    }
    if (!SHA_RE.test(sha)) throw badRequest('evidenceSha must be a lowercase SHA-256 digest (64 hex characters)')
    const source = sourceOf(context, candidate.sourceRef)
    if (!source || nullable(source.provenanceSha) !== sha) {
      throw badRequest('the evidence SHA does not match the provenance SHA of the cited source')
    }
    const saved = await orm.model('graph_candidates').update(text(candidate.id), {
      status: 'APPROVED',
      evidenceSpan: span,
      evidenceSha: sha,
      reviewer: input.reviewer,
      decisionNote: input.reason,
      decidedAt: new Date().toISOString(),
    })
    const nextContext = await loadContext(orm)
    return {
      state: 'recorded',
      decision: 'APPROVED',
      candidate: candidateView(nextContext, saved, activeSets(nextContext).candidates.has(input.candidateCode)),
      notice: 'Approved candidates still need a release build and activation before they appear in the reviewed graph.',
      policy: GRAPH_POLICY,
    }
  }

  if (input.decision === 'REJECTED') {
    if (status !== 'PENDING') throw badRequest(`candidate is ${status}; only a PENDING candidate can be rejected`)
  }
  if (input.decision === 'REVOKED') {
    if (status !== 'APPROVED') throw badRequest(`candidate is ${status}; only an APPROVED candidate can be revoked`)
  }
  const saved = await orm.model('graph_candidates').update(text(candidate.id), {
    status: input.decision,
    reviewer: input.reviewer,
    decisionNote: input.reason,
    decidedAt: new Date().toISOString(),
  })
  const nextContext = await loadContext(orm)
  return {
    state: 'recorded',
    decision: input.decision,
    candidate: candidateView(nextContext, saved, activeSets(nextContext).candidates.has(input.candidateCode)),
    notice:
      input.decision === 'REVOKED'
        ? 'The candidate stays visible for the record and is excluded from future releases.'
        : 'The negative decision is on record; the candidate was never a graph edge.',
    policy: GRAPH_POLICY,
  }
}
