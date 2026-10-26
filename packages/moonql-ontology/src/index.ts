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
  type EndpointCtx,
} from '@moonwitness/moonql'
import { badRequest, notFound } from '@moonwitness/core'
import { buildConstellation, conflictQueue } from './graph.js'
import {
  ALIAS_SEED,
  ALIAS_STATUSES,
  DECIDED_AT,
  ENTITY_KINDS,
  ENTITY_SEED,
  ENTITY_STATUSES,
  EPISTEMIC_STATUSES,
  IDENTITY_DECISIONS,
  IDENTITY_KINDS,
  IDENTITY_SEED,
  M02_REF,
  M02_SHA256,
  M09_REF,
  M09_SHA256,
  ONTOLOGY_META,
  PERSPECTIVES,
  RELATION_SEED,
  RELATION_TYPES,
  REVIEW_ACTIONS,
  REVIEW_LOG_SEED,
  REVIEWER,
  SOURCE_SEED,
  SOURCE_STATUSES,
  SOURCE_TYPES,
  VISION_REF,
  VISION_SHA256,
} from './seed.js'

/**
 * moonql-ontology — Domain D03 Ontology, alias and identity review (M10).
 *
 * Kinds are separate columns, not synonyms. Aliases are claims attached to one
 * entity. Edges carry a source and a perspective and are never "verified" until
 * a reviewer says so. Identity is a candidate action: the latest append-only
 * decision wins for the read-only graph, a split supersedes a merge, and no
 * entity row is ever deleted or rewritten into another referent.
 */

const SCRIPTS = ['Latn', 'Arab', 'Hebr', 'Grek'] as const
const DIRECTIONS = ['ltr', 'rtl'] as const
const STABLE_ID_RE = /^O[0-9]{3}$/

type Row = Record<string, unknown>
type Orm = EndpointCtx['orm']
type Repo = {
  list(query?: Record<string, unknown>): Promise<Row[]>
  create(data: Row): Promise<Row>
  update(id: string, patch: Row): Promise<Row>
}

const repo = (orm: Orm, name: string): Repo => orm.model(name) as Repo
const listAll = async (orm: Orm, name: string, limit = 5000): Promise<Row[]> =>
  await repo(orm, name).list({ limit })

const nonEmpty = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null
const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
const expectedDirection = (script: unknown): 'rtl' | 'ltr' =>
  script === 'Arab' || script === 'Hebr' ? 'rtl' : 'ltr'
const ms = (value: unknown): number | null => {
  const raw = nonEmpty(value)
  if (!raw) return null
  const parsed = Date.parse(raw)
  return Number.isNaN(parsed) ? null : parsed
}

const requireSource = (row: Row, what: string): void => {
  if (!nonEmpty(row.sourceRef)) throw badRequest(`ontology ${what} needs a source reference`)
}
const keepSource = (patch: Row, what: string): void => {
  if ('sourceRef' in patch && !nonEmpty(patch.sourceRef)) {
    throw badRequest(`ontology ${what} cannot lose its source reference`)
  }
}

const stableIdError = (stableId: string): string | null =>
  STABLE_ID_RE.test(stableId) ? null : 'stable ID must match ^O[0-9]{3}$'

function assertWindow(validFrom: unknown, validTo: unknown, label: string): void {
  const from = ms(validFrom)
  const to = ms(validTo)
  if (from !== null && to !== null && to < from) {
    throw badRequest(`${label}: validTo cannot be before validFrom`)
  }
}

/**
 * An identity may only be projected while both referents exist. The review
 * window must sit inside each entity's own validity window; an open-ended
 * merge against an entity with a known end is refused.
 */
function assertTemporalMerge(left: Row, right: Row, from: unknown, to: unknown): string {
  const windowFrom = ms(from)
  if (windowFrom === null) throw badRequest('APPROVED_MERGE needs a valid effectiveFrom')
  const windowTo = ms(to)
  if (windowTo !== null && windowTo < windowFrom) {
    throw badRequest('effectiveTo cannot be before effectiveFrom')
  }
  for (const entity of [left, right]) {
    const entityFrom = ms(entity.validFrom)
    const entityTo = ms(entity.validTo)
    const stableId = String(entity.stableId)
    if (entityFrom !== null && windowFrom < entityFrom) {
      throw badRequest(`identity window starts before ${stableId} exists`)
    }
    if (entityTo !== null && (windowTo === null || windowTo > entityTo)) {
      throw badRequest(`identity window outlives ${stableId}; this temporal merge is invalid`)
    }
  }
  return new Date(windowFrom).toISOString()
}

// ---------------------------------------------------------------- seed rows

const sourceRef = (code: string): string => `@onto_sources:${code}`
const entityRef = (stableId: string): string => `@onto_entities:${stableId}`

const entityRows = ENTITY_SEED.map((entity) => ({
  stableId: entity.stableId,
  kind: entity.kind,
  perspective: entity.perspective,
  labelEn: entity.labelEn,
  labelId: entity.labelId,
  description: entity.description,
  sourceRef: sourceRef(entity.sourceCode),
  validFrom: null,
  validTo: null,
  identityStatus: entity.identityStatus,
  identityVersion: 1,
  registryVersion: 'm10-seed-v1',
  unilexStableId: entity.unilexStableId,
}))

const aliasRows = ALIAS_SEED.map((alias) => ({
  aliasCode: alias.aliasCode,
  entityRef: entityRef(alias.entity),
  alias: alias.alias,
  languageCode: alias.languageCode,
  scriptCode: alias.scriptCode,
  direction: alias.direction,
  perspective: alias.perspective,
  sourceRef: sourceRef(alias.sourceCode),
  status: alias.status,
  reviewer: null,
  reason: null,
  evidenceRef: null,
}))

const relationRows = RELATION_SEED.map((relation) => ({
  edgeCode: relation.edgeCode,
  sourceEntityRef: entityRef(relation.from),
  targetEntityRef: entityRef(relation.to),
  relationType: relation.relationType,
  perspective: relation.perspective,
  sourceRef: sourceRef(relation.sourceCode),
  epistemicStatus: relation.epistemicStatus,
  assertedBy: relation.reviewer ? 'REVIEWER' : 'SEED',
  reviewer: relation.reviewer,
  reason: relation.reason,
  evidenceRef: relation.evidenceRef,
}))

const identityRows = IDENTITY_SEED.map((review) => {
  const pairCode = [review.left, review.right].sort().join(':')
  return {
    reviewCode: review.reviewCode,
    pairCode,
    leftEntityRef: entityRef(review.left),
    rightEntityRef: entityRef(review.right),
    identityKind: review.identityKind,
    decision: review.decision,
    reviewer: review.reviewer,
    reason: review.reason,
    evidenceRef: review.evidenceRef,
    effectiveFrom: null,
    effectiveTo: null,
    decidedAt: DECIDED_AT,
    supersedesRef: null,
  }
})

// ------------------------------------------------------------------- hooks

export const ontology = defineAddon({
  name: 'ontology',
  version: '1.0.0',
  depends: ['base', 'auth'],
  models: {
    onto_sources: defineModel({
      label: 'Ontology Source',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Ontology', icon: 'OS', order: 10 },
      fields: {
        code: str({ maxLength: 60, unique: true }),
        title: str({ maxLength: 160 }),
        sourceType: sel(SOURCE_TYPES),
        citation: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'citation is required') }),
        sourceUri: str({ format: 'uri', null: true }),
        provenanceSha: str({ maxLength: 64, null: true }),
        reviewStatus: sel(SOURCE_STATUSES, { default: 'PROPOSED' }),
        approvalNote: text({ null: true }),
      },
      unique: [['code']],
      data: { matchBy: ['code'], noupdate: true, rows: SOURCE_SEED },
    }),

    onto_entities: defineModel({
      label: 'Ontology Entity',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Ontology', icon: 'EN', order: 20 },
      fields: {
        stableId: str({ maxLength: 8, unique: true, validate: (value: unknown) => stableIdError(String(value)) }),
        kind: sel(ENTITY_KINDS, { index: true }),
        perspective: sel(PERSPECTIVES, { index: true }),
        labelEn: str({ maxLength: 160, minLength: 1 }),
        labelId: str({ maxLength: 160, minLength: 1 }),
        description: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'description is required') }),
        sourceRef: m2o('onto_sources', { index: true }),
        validFrom: ts({ null: true }),
        validTo: ts({ null: true }),
        identityStatus: sel(ENTITY_STATUSES, { default: 'CANDIDATE', index: true }),
        identityVersion: int({ default: 1 }),
        registryVersion: str({ maxLength: 40 }),
        unilexStableId: str({ maxLength: 8, null: true }),
      },
      unique: [['stableId']],
      data: { matchBy: ['stableId'], noupdate: true, rows: entityRows },
    }),

    onto_aliases: defineModel({
      label: 'Ontology Alias',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Ontology', icon: 'AL', order: 30 },
      fields: {
        aliasCode: str({ maxLength: 40, unique: true }),
        entityRef: m2o('onto_entities', { index: true }),
        alias: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'alias is required') }),
        languageCode: str({ maxLength: 10, minLength: 2 }),
        scriptCode: sel(SCRIPTS),
        direction: sel(DIRECTIONS, { default: 'ltr' }),
        perspective: sel(PERSPECTIVES, { index: true }),
        sourceRef: m2o('onto_sources', { index: true }),
        status: sel(ALIAS_STATUSES, { default: 'CANDIDATE', index: true }),
        reviewer: str({ maxLength: 80, null: true }),
        reason: text({ null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
      },
      unique: [['aliasCode'], ['entityRef', 'alias']],
      data: { matchBy: ['aliasCode'], noupdate: true, rows: aliasRows },
    }),

    onto_relations: defineModel({
      label: 'Ontology Relation',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Ontology', icon: 'RL', order: 40 },
      fields: {
        edgeCode: str({ maxLength: 120, unique: true }),
        sourceEntityRef: m2o('onto_entities', { index: true }),
        targetEntityRef: m2o('onto_entities', { index: true }),
        relationType: sel(RELATION_TYPES, { index: true }),
        perspective: sel(PERSPECTIVES, { index: true }),
        sourceRef: m2o('onto_sources', { index: true }),
        epistemicStatus: sel(EPISTEMIC_STATUSES, { default: 'UNKNOWN', index: true }),
        assertedBy: sel(['SEED', 'REVIEWER'], { default: 'SEED' }),
        reviewer: str({ maxLength: 80, null: true }),
        reason: text({ null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
      },
      unique: [['edgeCode'], ['sourceEntityRef', 'targetEntityRef', 'relationType', 'perspective']],
      data: { matchBy: ['edgeCode'], noupdate: true, rows: relationRows },
    }),

    onto_identity_reviews: defineModel({
      label: 'Ontology Identity Review',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Ontology', icon: 'IR', order: 50 },
      fields: {
        reviewCode: str({ maxLength: 80, unique: true }),
        pairCode: str({ maxLength: 40, index: true }),
        leftEntityRef: m2o('onto_entities', { index: true }),
        rightEntityRef: m2o('onto_entities', { index: true }),
        identityKind: sel(IDENTITY_KINDS),
        decision: sel(IDENTITY_DECISIONS, { default: 'PENDING', index: true }),
        reviewer: str({ maxLength: 80, null: true }),
        reason: text({ null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
        effectiveFrom: ts({ null: true }),
        effectiveTo: ts({ null: true }),
        decidedAt: ts(),
        supersedesRef: m2o('onto_identity_reviews'),
      },
      unique: [['reviewCode']],
      data: { matchBy: ['reviewCode'], noupdate: true, rows: identityRows },
    }),

    onto_review_log: defineModel({
      label: 'Ontology Review Log',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Ontology', icon: 'LG', order: 60 },
      fields: {
        targetType: sel(['ENTITY', 'ALIAS', 'RELATION', 'IDENTITY']),
        targetRef: str({ maxLength: 160 }),
        action: sel(REVIEW_ACTIONS),
        reason: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'reason is required') }),
        reviewer: str({ maxLength: 80, minLength: 1 }),
        evidenceRef: str({ maxLength: 240, null: true }),
        decidedAt: ts(),
      },
      unique: [['targetType', 'targetRef', 'action', 'reviewer']],
      data: {
        matchBy: ['targetType', 'targetRef', 'action', 'reviewer'],
        noupdate: true,
        rows: REVIEW_LOG_SEED,
      },
    }),
  },

  hooks: {
    onto_entities: {
      beforeCreate: (row) => {
        requireSource(row, 'entity')
        if (!nonEmpty(row.stableId)) throw badRequest('ontology entity needs a stable ID')
        assertWindow(row.validFrom, row.validTo, String(row.stableId ?? 'entity'))
        return row
      },
      beforeUpdate: (patch) => {
        if ('stableId' in patch && patch.stableId !== undefined) {
          throw badRequest('ontology stable IDs are immutable; deprecate the record instead')
        }
        keepSource(patch, 'entity')
        assertWindow(patch.validFrom, patch.validTo, 'entity')
        return patch
      },
      beforeDelete: () => {
        throw badRequest('ontology entities are never deleted; record an identity decision instead')
      },
    },
    onto_aliases: {
      beforeCreate: (row) => {
        requireSource(row, 'alias')
        if (!row.entityRef) throw badRequest('ontology alias needs an entity')
        if (!nonEmpty(row.alias)) throw badRequest('ontology alias needs a surface form')
        const direction = expectedDirection(row.scriptCode)
        row.direction = direction
        if (row.status === 'ATTESTED') {
          for (const key of ['reviewer', 'reason', 'evidenceRef'] as const) {
            if (!nonEmpty(row[key])) throw badRequest(`attesting an alias needs ${key} in the same write`)
          }
        }
        return row
      },
      beforeUpdate: (patch) => {
        keepSource(patch, 'alias')
        if (patch.scriptCode) {
          patch.direction = expectedDirection(patch.scriptCode)
        }
        if (patch.status === 'ATTESTED') {
          for (const key of ['reviewer', 'reason', 'evidenceRef'] as const) {
            if (!nonEmpty(patch[key])) throw badRequest(`attesting an alias needs ${key} in the same update`)
          }
        }
        return patch
      },
      beforeDelete: () => {
        throw badRequest('ontology aliases are never deleted; mark the claim REJECTED instead')
      },
    },
    onto_relations: {
      beforeCreate: (row) => {
        requireSource(row, 'relation')
        if (!row.sourceEntityRef || !row.targetEntityRef) throw badRequest('ontology relation needs two entities')
        if (row.sourceEntityRef === row.targetEntityRef) throw badRequest('ontology relation needs two different entities')
        if (row.epistemicStatus === 'VERIFIED') {
          for (const key of ['reviewer', 'reason', 'evidenceRef'] as const) {
            if (!nonEmpty(row[key])) throw badRequest(`VERIFIED relation needs ${key} in the same write`)
          }
        }
        return row
      },
      beforeUpdate: (patch) => {
        keepSource(patch, 'relation')
        if (patch.epistemicStatus === 'VERIFIED') {
          for (const key of ['reviewer', 'reason', 'evidenceRef'] as const) {
            if (!nonEmpty(patch[key])) throw badRequest(`VERIFIED relation needs ${key} in the same update`)
          }
        }
        return patch
      },
      beforeDelete: () => {
        throw badRequest('ontology relations are never deleted; register a superseding status instead')
      },
    },
    onto_identity_reviews: {
      beforeCreate: (row) => {
        if (!row.leftEntityRef || !row.rightEntityRef) throw badRequest('identity review needs two entities')
        if (row.leftEntityRef === row.rightEntityRef) throw badRequest('identity review needs two different entities')
        if (!nonEmpty(row.reviewCode)) throw badRequest('identity review needs a review code')
        const decision = String(row.decision ?? 'PENDING')
        if (decision === 'PENDING') return row
        for (const key of ['reviewer', 'reason', 'evidenceRef'] as const) {
          if (!nonEmpty(row[key])) {
            throw badRequest(`a ${decision} decision needs ${key} in the same write`)
          }
        }
        if (decision === 'APPROVED_MERGE' && !ms(row.effectiveFrom)) {
          throw badRequest('APPROVED_MERGE needs a valid effectiveFrom')
        }
        if (decision === 'REVOKED' && !row.supersedesRef) {
          throw badRequest('REVOKED needs supersedesRef pointing at the merge it splits')
        }
        return row
      },
      beforeUpdate: () => {
        throw badRequest('identity reviews are append-only; create a new decision that supersedes the old one')
      },
      beforeDelete: () => {
        throw badRequest('identity reviews are append-only and cannot be deleted')
      },
    },
    onto_review_log: {
      beforeUpdate: () => {
        throw badRequest('the ontology review log is append-only')
      },
      beforeDelete: () => {
        throw badRequest('the ontology review log is append-only')
      },
    },
  },

  endpoints: {
    /** Read-only projection. The only graph identity is the one computed here. */
    constellation: {
      method: 'GET',
      path: '/ontology/constellation',
      requires: 'public',
      menu: { group: 'Ontology', icon: 'GR', order: 70 },
      handler: async ({ orm }) => buildConstellation(orm),
    },

    /** Reviewer queue: unresolved claims stay visible and may stay unresolved. */
    conflicts: {
      method: 'GET',
      path: '/ontology/conflicts',
      requires: ADMIN_ONLY,
      handler: async ({ orm }) => conflictQueue(await buildConstellation(orm)),
    },

    /**
     * Register a typed edge with its source and perspective. A VERIFIED edge
     * needs a reviewer, a reason and evidence, and its source must be approved
     * for citation; UNKNOWN/DISPUTED edges are stored without being promoted.
     */
    edgesRegister: {
      method: 'POST',
      path: '/ontology/edges/register',
      requires: ADMIN_ONLY,
      body: {
        sourceEntity: str({ maxLength: 8, minLength: 1 }),
        targetEntity: str({ maxLength: 8, minLength: 1 }),
        relationType: sel(RELATION_TYPES),
        perspective: sel(PERSPECTIVES),
        sourceCode: str({ maxLength: 60, minLength: 1 }),
        epistemicStatus: sel(EPISTEMIC_STATUSES),
        reviewer: str({ maxLength: 80, null: true }),
        reason: text(),
        evidenceRef: str({ maxLength: 240, null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const fromId = asText(body.sourceEntity).toUpperCase()
        const toId = asText(body.targetEntity).toUpperCase()
        const sourceCode = asText(body.sourceCode)
        const epistemicStatus = asText(body.epistemicStatus) as (typeof EPISTEMIC_STATUSES)[number]
        const reviewer = asText(body.reviewer) || null
        const reason = asText(body.reason)
        const evidenceRef = asText(body.evidenceRef) || null
        if (fromId === toId) {
          status(400)
          return { state: 'invalid', message: 'an edge needs two different entities' }
        }
        if (!reason) {
          status(400)
          return { state: 'invalid', message: 'reason is required' }
        }
        if (epistemicStatus === 'VERIFIED') {
          if (!reviewer || !evidenceRef) {
            status(400)
            return { state: 'invalid', message: 'VERIFIED needs reviewer and evidenceRef' }
          }
        }

        const [entities, sources, relations] = await Promise.all([
          listAll(orm, 'onto_entities'),
          listAll(orm, 'onto_sources'),
          listAll(orm, 'onto_relations'),
        ])
        const from = entities.find((row) => row.stableId === fromId)
        const to = entities.find((row) => row.stableId === toId)
        if (!from) throw notFound(`ontology entity "${fromId}" not found`)
        if (!to) throw notFound(`ontology entity "${toId}" not found`)
        const source = sources.find((row) => row.code === sourceCode)
        if (!source) throw notFound(`ontology source "${sourceCode}" not found`)
        if (source.reviewStatus !== 'APPROVED_FOR_CITATION') {
          status(400)
          return {
            state: 'invalid',
            message: `source "${sourceCode}" is not approved for citation (status: ${String(source.reviewStatus)})`,
          }
        }

        const relationType = asText(body.relationType)
        const perspective = asText(body.perspective)
        const existing = relations.find(
          (row) =>
            String(row.sourceEntityRef) === String(from.id) &&
            String(row.targetEntityRef) === String(to.id) &&
            row.relationType === relationType &&
            row.perspective === perspective,
        )
        const edgeRow = {
          edgeCode: existing?.edgeCode ?? `EDG-${fromId}-${toId}-${relationType}-${perspective}`,
          sourceEntityRef: String(from.id),
          targetEntityRef: String(to.id),
          relationType,
          perspective,
          sourceRef: String(source.id),
          epistemicStatus,
          assertedBy: reviewer ? 'REVIEWER' : 'SEED',
          reviewer,
          reason,
          evidenceRef,
        }
        const saved = existing
          ? await repo(orm, 'onto_relations').update(String(existing.id), edgeRow)
          : await repo(orm, 'onto_relations').create(edgeRow)

        const action = epistemicStatus === 'VERIFIED' ? 'EDGE_VERIFIED' : 'EDGE_REGISTERED'
        const log = repo(orm, 'onto_review_log')
        const logRow = {
          targetType: 'RELATION',
          targetRef: String(saved.edgeCode),
          action,
          reason,
          reviewer: reviewer ?? 'ontology edge registration',
          evidenceRef,
          decidedAt: new Date().toISOString(),
        }
        const existingLog = (
          await log.list({
            where: { targetType: 'RELATION', targetRef: logRow.targetRef, action, reviewer: logRow.reviewer },
            limit: 1,
          })
        )[0]
        if (existingLog) await log.update(String(existingLog.id), logRow)
        else await log.create(logRow)

        const projection = await buildConstellation(orm)
        status(existing ? 200 : 201)
        return {
          state: 'recorded',
          edge: {
            edgeCode: saved.edgeCode,
            relationType: saved.relationType,
            perspective: saved.perspective,
            epistemicStatus: saved.epistemicStatus,
            verified: saved.epistemicStatus === 'VERIFIED',
          },
          graphId: projection.graphId,
          notice:
            'The edge carries its source and perspective. Only VERIFIED is presented as verified; UNKNOWN and DISPUTED stay unresolved.',
        }
      },
    },

    /**
     * The only path that can change identity. A merge is an approved candidate
     * with a temporal window; it never deletes an entity. A split appends a
     * REVOKED decision that supersedes the merge and leaves the review trail.
     */
    mergesDecide: {
      method: 'POST',
      path: '/ontology/merges/decide',
      requires: ADMIN_ONLY,
      body: {
        leftEntity: str({ maxLength: 8, minLength: 1 }),
        rightEntity: str({ maxLength: 8, minLength: 1 }),
        identityKind: sel(IDENTITY_KINDS),
        decision: sel(IDENTITY_DECISIONS),
        reviewer: str({ maxLength: 80, minLength: 1 }),
        reason: text(),
        evidenceRef: str({ maxLength: 240, minLength: 1 }),
        effectiveFrom: str({ maxLength: 40, null: true }),
        effectiveTo: str({ maxLength: 40, null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const leftId = asText(body.leftEntity).toUpperCase()
        const rightId = asText(body.rightEntity).toUpperCase()
        const decision = asText(body.decision) as (typeof IDENTITY_DECISIONS)[number]
        const reviewer = asText(body.reviewer)
        const reason = asText(body.reason)
        const evidenceRef = asText(body.evidenceRef)
        const effectiveFrom = asText(body.effectiveFrom) || null
        const effectiveTo = asText(body.effectiveTo) || null

        if (leftId === rightId) {
          status(400)
          return { state: 'invalid', message: 'an identity decision needs two different entities' }
        }
        if (decision === 'PENDING') {
          status(400)
          return { state: 'invalid', message: 'decision must be APPROVED_MERGE, REJECTED or REVOKED' }
        }
        if (!reviewer || !reason || !evidenceRef) {
          status(400)
          return { state: 'invalid', message: 'reviewer, reason and evidenceRef are required for every decision' }
        }

        const [entities, relations, reviews] = await Promise.all([
          listAll(orm, 'onto_entities'),
          listAll(orm, 'onto_relations'),
          listAll(orm, 'onto_identity_reviews'),
        ])
        const left = entities.find((row) => row.stableId === leftId)
        const right = entities.find((row) => row.stableId === rightId)
        if (!left) throw notFound(`ontology entity "${leftId}" not found`)
        if (!right) throw notFound(`ontology entity "${rightId}" not found`)
        const pairCode = [leftId, rightId].sort().join(':')

        const pairReviews = reviews
          .filter((row) => String(row.pairCode) === pairCode)
          .sort((a, b) => (ms(a.decidedAt) ?? 0) - (ms(b.decidedAt) ?? 0) || String(a.id).localeCompare(String(b.id)))
        const latest = pairReviews[pairReviews.length - 1]
        const activeMerge = latest?.decision === 'APPROVED_MERGE' ? latest : null
        let normalizedFrom: string | null = null
        let normalizedTo: string | null = null

        if (decision === 'APPROVED_MERGE') {
          if (activeMerge) {
            status(400)
            return {
              state: 'invalid',
              message: 'this pair already has an active merge; record REVOKED (split) before approving another',
            }
          }
          const contradictory = relations.find(
            (row) =>
              row.relationType === 'distinctFrom' &&
              (row.epistemicStatus === 'VERIFIED' || row.epistemicStatus === 'ASSERTED') &&
              ((String(row.sourceEntityRef) === String(left.id) && String(row.targetEntityRef) === String(right.id)) ||
                (String(row.sourceEntityRef) === String(right.id) && String(row.targetEntityRef) === String(left.id))),
          )
          if (contradictory) {
            status(400)
            return {
              state: 'invalid',
              message: `an ${String(contradictory.epistemicStatus)} distinctFrom edge separates these entities; revoke that decision before asserting identity`,
            }
          }
          try {
            normalizedFrom = assertTemporalMerge(left, right, effectiveFrom, effectiveTo)
            const windowTo = ms(effectiveTo)
            normalizedTo = windowTo === null ? null : new Date(windowTo).toISOString()
          } catch (err) {
            status(400)
            return { state: 'invalid', message: err instanceof Error ? err.message : 'invalid temporal merge' }
          }
        }

        if (decision === 'REJECTED' && activeMerge) {
          status(400)
          return {
            state: 'invalid',
            message: 'an active merge exists; record REVOKED (split) instead of a plain rejection',
          }
        }
        if (decision === 'REVOKED' && !activeMerge) {
          status(400)
          return { state: 'invalid', message: 'there is no active merge to split' }
        }

        const now = new Date().toISOString()
        const reviewRow = {
          reviewCode: `IR-${pairCode.replace(':', '-')}-${decision}-${Date.now()}`,
          pairCode,
          leftEntityRef: String(left.id),
          rightEntityRef: String(right.id),
          identityKind: asText(body.identityKind),
          decision,
          reviewer,
          reason,
          evidenceRef,
          effectiveFrom: normalizedFrom,
          effectiveTo: normalizedTo,
          decidedAt: now,
          supersedesRef: decision === 'REVOKED' && activeMerge ? String(activeMerge.id) : null,
        }
        const savedReview = await repo(orm, 'onto_identity_reviews').create(reviewRow)

        const nextStatus = decision === 'APPROVED_MERGE' ? 'MERGED' : 'REVIEWED'
        const updatedEntities: Array<Record<string, unknown>> = []
        for (const entity of [left, right]) {
          const updated = await repo(orm, 'onto_entities').update(String(entity.id), {
            identityStatus: nextStatus,
            identityVersion: Number(entity.identityVersion ?? 1) + 1,
          })
          updatedEntities.push({
            stableId: updated.stableId,
            identityStatus: updated.identityStatus,
            identityVersion: updated.identityVersion,
          })
        }

        const action =
          decision === 'APPROVED_MERGE' ? 'APPROVE_MERGE' : decision === 'REJECTED' ? 'REJECT_MERGE' : 'SPLIT'
        const log = repo(orm, 'onto_review_log')
        const logRow = {
          targetType: 'IDENTITY',
          targetRef: pairCode,
          action,
          reason,
          reviewer,
          evidenceRef,
          decidedAt: now,
        }
        const existingLog = (
          await log.list({
            where: { targetType: 'IDENTITY', targetRef: pairCode, action, reviewer },
            limit: 1,
          })
        )[0]
        if (existingLog) await log.update(String(existingLog.id), logRow)
        else await log.create(logRow)

        const projection = await buildConstellation(orm)
        status(201)
        return {
          state: 'recorded',
          review: savedReview,
          entities: updatedEntities,
          graphId: projection.graphId,
          notice:
            decision === 'APPROVED_MERGE'
              ? 'A reviewer-approved merge is now projected for its effective window. The entities were not deleted or rewritten.'
              : decision === 'REJECTED'
                ? 'The negative identity decision is on record; the entities remain separate.'
                : 'The merge is revoked; the graph projects the entities separately again and the review history remains.',
        }
      },
    },
  },
})

export default ontology
export {
  ALIAS_STATUSES,
  DECIDED_AT,
  ENTITY_KINDS,
  ENTITY_SEED,
  ENTITY_STATUSES,
  EPISTEMIC_STATUSES,
  IDENTITY_DECISIONS,
  IDENTITY_KINDS,
  M02_REF,
  M02_SHA256,
  M09_REF,
  M09_SHA256,
  ONTOLOGY_META,
  PERSPECTIVES,
  RELATION_SEED,
  RELATION_TYPES,
  REVIEWER,
  SOURCE_SEED,
  SOURCE_STATUSES,
  SOURCE_TYPES,
  VISION_REF,
  VISION_SHA256,
}
export { buildConstellation, conflictQueue, REVIEW_RUBRIC } from './graph.js'
export type { Orm } from './graph.js'
