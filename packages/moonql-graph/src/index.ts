import {
  ADMIN_FULL,
  ADMIN_ONLY,
  ADMIN_WRITE,
  defineAddon,
  defineModel,
  int,
  m2o,
  sel,
  str,
  text,
  ts,
} from '@moonwitness/moonql'
import { badRequest, notFound } from '@moonwitness/core'
import { EPISTEMIC_STATUSES, PERSPECTIVES } from '@moonwitness/moonql-ontology'
import {
  activateRelease,
  adjacencyView,
  buildRelease,
  decideCandidate,
  exportRelease,
  graphOverview,
  listReleases,
  rebuildAdjacency,
  registerCandidate,
  relationDetail,
  releaseDetail,
  searchGraph,
} from './projection.js'
import {
  ADJACENCY_ROWS,
  CANDIDATE_ROWS,
  CANDIDATE_STATUSES,
  EVIDENCE_FRAMES,
  GRAPH_META,
  GRAPH_POLICY,
  GRAPH_RELATION_TYPES,
  POINTER_ROWS,
  RELEASE_ROWS,
} from './seed.js'

/**
 * moonql-graph — Domain D03 typed correlation and evidence graph (M12).
 *
 * Candidates are claims under review and are never presented as edges. A
 * release is an immutable manifest built only from verified ontology relations
 * and approved candidates whose evidence names an exact SHA-256. One singleton
 * pointer selects the active release; adjacency is a derived, rebuildable
 * projection. `sameAs` can never be approved here — identity belongs to M10.
 */

type Row = Record<string, unknown>

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
const nonEmpty = (value: unknown): string | null => {
  const raw = asText(value)
  return raw ? raw : null
}
const SHA_RE = /^[0-9a-f]{64}$/

const requireText = (row: Row, key: string, message: string): void => {
  if (!nonEmpty(row[key])) throw badRequest(message)
}

export const graph = defineAddon({
  name: 'graph',
  version: '1.0.0',
  depends: ['base', 'auth', 'ontology'],
  models: {
    graph_candidates: defineModel({
      label: 'Graph Candidate',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Graph', icon: 'GC', order: 10 },
      fields: {
        candidateCode: str({ maxLength: 140, unique: true }),
        sourceEntityRef: m2o('onto_entities', { index: true }),
        targetEntityRef: m2o('onto_entities', { index: true }),
        relationType: sel(GRAPH_RELATION_TYPES, { index: true }),
        perspective: sel(PERSPECTIVES, { index: true }),
        sourceRef: m2o('onto_sources', { index: true }),
        epistemicStatus: sel(EPISTEMIC_STATUSES, { default: 'UNKNOWN', index: true }),
        status: sel(CANDIDATE_STATUSES, { default: 'PENDING', index: true }),
        evidenceFrame: sel(EVIDENCE_FRAMES),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
        reason: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'reason is required') }),
        reviewer: str({ maxLength: 80, null: true }),
        decisionNote: text({ null: true }),
        decidedAt: ts({ null: true }),
      },
      unique: [['candidateCode'], ['sourceEntityRef', 'targetEntityRef', 'relationType', 'perspective']],
      data: { matchBy: ['candidateCode'], noupdate: true, rows: CANDIDATE_ROWS },
    }),

    graph_releases: defineModel({
      label: 'Graph Release',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Graph', icon: 'GR', order: 20 },
      fields: {
        releaseCode: str({ maxLength: 40, unique: true }),
        graphSha: str({ maxLength: 64, unique: true }),
        manifest: text(),
        edgeCount: int({ default: 0 }),
        ontologyCount: int({ default: 0 }),
        candidateCount: int({ default: 0 }),
        deduplicatedCount: int({ default: 0 }),
        builtAt: ts(),
        builtBy: str({ maxLength: 80 }),
        note: text({ null: true }),
      },
      unique: [['releaseCode'], ['graphSha']],
      data: { matchBy: ['releaseCode'], noupdate: true, rows: RELEASE_ROWS },
    }),

    graph_release_pointer: defineModel({
      label: 'Graph Release Pointer',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Graph', icon: 'GP', order: 30 },
      fields: {
        key: str({ maxLength: 20, unique: true, default: 'active' }),
        releaseRef: m2o('graph_releases', { index: true }),
        version: int({ default: 0 }),
        previousReleaseRef: m2o('graph_releases', { null: true }),
        activatedBy: str({ maxLength: 80 }),
        activatedAt: ts(),
        note: text({ null: true }),
      },
      unique: [['key']],
      data: { matchBy: ['key'], noupdate: true, rows: POINTER_ROWS },
    }),

    graph_adjacency: defineModel({
      label: 'Graph Adjacency (derived)',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Graph', icon: 'GA', order: 40 },
      fields: {
        adjacencyCode: str({ maxLength: 180, unique: true }),
        releaseRef: m2o('graph_releases', { index: true }),
        releaseCode: str({ maxLength: 40, index: true }),
        relationCode: str({ maxLength: 140, index: true }),
        relationKind: sel(['ONTOLOGY', 'CANDIDATE'], { index: true }),
        fromKey: str({ maxLength: 8, index: true }),
        toKey: str({ maxLength: 8, index: true }),
        fromLabel: str({ maxLength: 160 }),
        toLabel: str({ maxLength: 160 }),
        relationType: str({ maxLength: 40 }),
        perspective: str({ maxLength: 40 }),
        epistemicStatus: str({ maxLength: 20 }),
        sourceCode: str({ maxLength: 60, null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
        searchText: text(),
        derivedFrom: str({ maxLength: 60, default: 'graph_releases.manifest' }),
      },
      unique: [['adjacencyCode']],
      data: { matchBy: ['adjacencyCode'], noupdate: true, rows: ADJACENCY_ROWS },
    }),
  },

  hooks: {
    graph_candidates: {
      beforeCreate: (row) => {
        const r = row as Record<string, unknown>
        requireText(r, 'sourceEntityRef', 'a graph candidate needs a source entity')
        requireText(r, 'targetEntityRef', 'a graph candidate needs a target entity')
        if (r.sourceEntityRef === r.targetEntityRef) {
          throw badRequest('a graph candidate needs two different entities')
        }
        requireText(r, 'candidateCode', 'a graph candidate needs a candidate code')
        requireText(r, 'reason', 'a graph candidate needs a reason')
        if (r.status === 'APPROVED') {
          if (r.relationType === 'sameAs') {
            throw badRequest('sameAs can never be approved here; use the ontology identity review')
          }
          for (const key of ['reviewer', 'decisionNote', 'evidenceSpan', 'evidenceSha'] as const) {
            requireText(r, key, `approving a candidate needs ${key} in the same write`)
          }
          if (!SHA_RE.test(String(r.evidenceSha))) {
            throw badRequest('evidenceSha must be a lowercase SHA-256 digest (64 hex characters)')
          }
        }
        return row
      },
      beforeUpdate: (patch) => {
        const p = patch as Record<string, unknown>
        for (const key of ['candidateCode', 'sourceEntityRef', 'targetEntityRef', 'relationType', 'perspective']) {
          if (key in p && p[key] !== undefined) {
            throw badRequest(`a candidate's ${key} is immutable; register a new candidate instead`)
          }
        }
        if (p.status === 'APPROVED') {
          for (const key of ['reviewer', 'decisionNote', 'evidenceSpan', 'evidenceSha'] as const) {
            requireText(p, key, `approving a candidate needs ${key} in the same update`)
          }
          if (!SHA_RE.test(String(p.evidenceSha))) {
            throw badRequest('evidenceSha must be a lowercase SHA-256 digest (64 hex characters)')
          }
        }
        return patch
      },
      beforeDelete: () => {
        throw badRequest('graph candidates are never deleted; a negative or revoked decision stays on record')
      },
    },
    graph_releases: {
      beforeCreate: (row) => {
        requireText(row as Record<string, unknown>, 'releaseCode', 'a graph release needs a release code')
        requireText(row as Record<string, unknown>, 'graphSha', 'a graph release needs a graph SHA')
        requireText(row as Record<string, unknown>, 'manifest', 'a graph release needs a manifest')
        return row
      },
      beforeUpdate: () => {
        throw badRequest('graph releases are immutable; build a new release instead')
      },
      beforeDelete: () => {
        throw badRequest('graph releases are immutable and cannot be deleted')
      },
    },
    graph_release_pointer: {
      beforeCreate: (row) => {
        const r = row as Record<string, unknown>
        if (r.key !== undefined && r.key !== 'active') {
          throw badRequest('the graph release pointer is a singleton with key "active"')
        }
        requireText(r, 'releaseRef', 'the graph release pointer needs a release')
        return row
      },
      beforeUpdate: (patch) => {
        const p = patch as Record<string, unknown>
        if (p.key !== undefined && p.key !== 'active') {
          throw badRequest('the graph release pointer is a singleton with key "active"')
        }
        return patch
      },
      beforeDelete: () => {
        throw badRequest('the graph release pointer cannot be deleted; activate another release instead')
      },
    },
    graph_adjacency: {
      beforeCreate: (row) => {
        requireText(row as Record<string, unknown>, 'releaseRef', 'derived adjacency needs a release')
        requireText(row as Record<string, unknown>, 'relationCode', 'derived adjacency needs a relation code')
        return row
      },
      beforeUpdate: () => {
        throw badRequest('derived adjacency is rebuilt, not edited')
      },
    },
  },

  endpoints: {
    /** Read-only overview separating claims under review from the released graph. */
    overview: {
      method: 'GET',
      path: '/graph/overview',
      requires: 'public',
      menu: { group: 'Graph', icon: 'GO', order: 50 },
      handler: async ({ orm }) => graphOverview(orm),
    },

    /** One relation, candidate or reviewed edge, with its evidence and release state. */
    relation: {
      method: 'GET',
      path: '/graph/relation',
      requires: 'public',
      handler: async ({ query, orm }) => {
        const code = asText(query.code)
        if (!code) throw badRequest('graph relation needs a code')
        const detail = await relationDetail(orm, code)
        if (!detail) throw notFound(`graph relation "${code}" not found`)
        return detail
      },
    },

    /** Derived adjacency of the active release; droppable and rebuildable. */
    adjacency: {
      method: 'GET',
      path: '/graph/adjacency',
      requires: 'public',
      handler: async ({ query, orm }) => adjacencyView(orm, nonEmpty(query.node) ? asText(query.node) : null),
    },

    /** Search covers the derived adjacency only, never pending candidates. */
    search: {
      method: 'GET',
      path: '/graph/search',
      requires: 'public',
      handler: async ({ query, orm }) => searchGraph(orm, asText(query.q)),
    },

    releases: {
      method: 'GET',
      path: '/graph/releases',
      requires: 'public',
      handler: async ({ orm }) => listReleases(orm),
    },

    release: {
      method: 'GET',
      path: '/graph/release',
      requires: 'public',
      handler: async ({ query, orm }) => {
        const code = asText(query.code)
        if (!code) throw badRequest('graph release needs a code')
        const detail = await releaseDetail(orm, code)
        if (!detail) throw notFound(`graph release "${code}" not found`)
        return detail
      },
    },

    /** Export the manifest and lineage of a release; replay rebuilds the same graphSha. */
    export: {
      method: 'GET',
      path: '/graph/export',
      requires: 'public',
      handler: async ({ query, orm }) => {
        const code = nonEmpty(query.code) ? asText(query.code) : null
        const detail = await exportRelease(orm, code)
        if (!detail) throw notFound('no graph release is available to export')
        return detail
      },
    },

    policy: {
      method: 'GET',
      path: '/graph/policy',
      requires: 'public',
      handler: async () => ({
        state: 'ok',
        registry: GRAPH_META,
        policy: GRAPH_POLICY,
        statuses: [...CANDIDATE_STATUSES],
        relationTypes: [...GRAPH_RELATION_TYPES],
        evidenceFrames: [...EVIDENCE_FRAMES],
      }),
    },

    /** Record a claim as a candidate; it is not an edge and needs review. */
    candidatesRegister: {
      method: 'POST',
      path: '/graph/candidates/register',
      requires: ADMIN_ONLY,
      body: {
        from: str({ maxLength: 8, minLength: 1 }),
        to: str({ maxLength: 8, minLength: 1 }),
        relationType: sel(GRAPH_RELATION_TYPES),
        perspective: sel(PERSPECTIVES),
        sourceCode: str({ maxLength: 60, minLength: 1 }),
        evidenceFrame: sel(EVIDENCE_FRAMES),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
        reason: text(),
      },
      handler: async ({ body, orm, status }) => {
        const from = asText(body.from).toUpperCase()
        const to = asText(body.to).toUpperCase()
        const reason = asText(body.reason)
        if (from === to) {
          status(400)
          return { state: 'invalid', message: 'a candidate needs two different entities' }
        }
        if (!reason) {
          status(400)
          return { state: 'invalid', message: 'reason is required' }
        }
        return registerCandidate(orm, {
          from,
          to,
          relationType: asText(body.relationType),
          perspective: asText(body.perspective),
          sourceCode: asText(body.sourceCode),
          evidenceFrame: asText(body.evidenceFrame),
          evidenceSpan: nonEmpty(body.evidenceSpan),
          evidenceSha: nonEmpty(body.evidenceSha),
          evidenceRef: nonEmpty(body.evidenceRef),
          reason,
        })
      },
    },

    /** Approve, reject or revoke a candidate. sameAs approval is refused. */
    candidatesDecide: {
      method: 'POST',
      path: '/graph/candidates/decide',
      requires: ADMIN_ONLY,
      body: {
        candidateCode: str({ maxLength: 140, minLength: 1 }),
        decision: sel(['APPROVED', 'REJECTED', 'REVOKED']),
        reviewer: str({ maxLength: 80, minLength: 1 }),
        reason: text(),
        evidenceSpan: text({ null: true }),
        evidenceSha: str({ maxLength: 64, null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const candidateCode = asText(body.candidateCode)
        const reviewer = asText(body.reviewer)
        const reason = asText(body.reason)
        if (!candidateCode || !reviewer || !reason) {
          status(400)
          return { state: 'invalid', message: 'candidateCode, reviewer and reason are required' }
        }
        return decideCandidate(orm, {
          candidateCode,
          decision: asText(body.decision) as 'APPROVED' | 'REJECTED' | 'REVOKED',
          reviewer,
          reason,
          evidenceSpan: nonEmpty(body.evidenceSpan),
          evidenceSha: nonEmpty(body.evidenceSha),
        })
      },
    },

    /** Build an immutable release from reviewed relations and approved candidates. */
    releasesBuild: {
      method: 'POST',
      path: '/graph/releases/build',
      requires: ADMIN_ONLY,
      body: {
        builtBy: str({ maxLength: 80, minLength: 1 }),
        note: text({ null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const builtBy = asText(body.builtBy)
        if (!builtBy) {
          status(400)
          return { state: 'invalid', message: 'builtBy is required' }
        }
        const result = await buildRelease(orm, builtBy, nonEmpty(body.note))
        if (result.state === 'blocked') {
          status(409)
          return result
        }
        return result
      },
    },

    /** Move the singleton pointer; expectedVersion makes activation a compare-and-swap. */
    releasesActivate: {
      method: 'POST',
      path: '/graph/releases/activate',
      requires: ADMIN_ONLY,
      body: {
        releaseCode: str({ maxLength: 40, minLength: 1 }),
        activatedBy: str({ maxLength: 80, minLength: 1 }),
        expectedVersion: int({ null: true }),
        note: text({ null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const releaseCode = asText(body.releaseCode)
        const activatedBy = asText(body.activatedBy)
        if (!releaseCode || !activatedBy) {
          status(400)
          return { state: 'invalid', message: 'releaseCode and activatedBy are required' }
        }
        const expectedVersion =
          body.expectedVersion === undefined || body.expectedVersion === null || body.expectedVersion === ''
            ? null
            : Number(body.expectedVersion)
        const result = await activateRelease(orm, releaseCode, activatedBy, expectedVersion, nonEmpty(body.note))
        if (result.state === 'conflict') status(409)
        return result
      },
    },

    /** Rebuild the derived adjacency from the active release manifest. */
    rebuild: {
      method: 'POST',
      path: '/graph/adjacency/rebuild',
      requires: ADMIN_ONLY,
      body: {
        rebuiltBy: str({ maxLength: 80, minLength: 1 }),
      },
      handler: async ({ body, orm, status }) => {
        const rebuiltBy = asText(body.rebuiltBy)
        if (!rebuiltBy) {
          status(400)
          return { state: 'invalid', message: 'rebuiltBy is required' }
        }
        return rebuildAdjacency(orm, rebuiltBy)
      },
    },
  },
})

export default graph
export { graphOverview, relationDetail, adjacencyView, searchGraph, listReleases, releaseDetail, exportRelease } from './projection.js'
export { buildReleaseManifest, parseManifest, manifestIdentities } from './manifest.js'
export {
  ADJACENCY_ROWS,
  CANDIDATE_ROWS,
  CANDIDATE_SEED,
  CANDIDATE_STATUSES,
  EVIDENCE_FRAMES,
  GRAPH_META,
  GRAPH_POLICY,
  GRAPH_RELATION_TYPES,
  GRAPH_SEED_MANIFEST,
  POINTER_ROWS,
  RELEASE_ROWS,
} from './seed.js'
