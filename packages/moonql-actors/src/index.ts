import {
  ADMIN_WRITE,
  defineAddon,
  defineModel,
  m2o,
  sel,
  str,
  text,
  type EndpointCtx,
} from '@moonwitness/moonql'
import { badRequest, notFound } from '@moonwitness/core'
import {
  actorPolicy,
  buildFigureDetail,
  buildFigureRegistry,
  buildMissionTable,
} from './projection.js'
import {
  AVATAR_STATUSES,
  CHRONOLOGY_CONFIDENCES,
  EPISTEMIC_STATUSES,
  EVENT_SEED,
  EVENT_TYPES,
  FIGURE_ATTESTATIONS,
  FIGURE_KINDS,
  FIGURE_SEED,
  FIGURE_STATUSES,
  LOCATION_ACCURACIES,
  LOCATION_SEED,
  MISSION_SEED,
  ROLE_SEED,
  ROLE_TYPES,
  TRADITION_SCOPES,
  TRADITION_SEED,
} from './seed.js'

/**
 * moonql-actors — Domain D04 Figure Registry, sourced events and the Prophetic
 * Mission Table (M11).
 *
 * A figure is one referent with its own code. Roles and missions are claims,
 * scoped to a tradition and a source; they never merge figures, never rank
 * them and never reduce a figure to one exclusive mission. Events carry a
 * chronology confidence instead of an invented date. Avatars are pedagogical
 * interfaces with a mandatory disclosure — never the prophet and never
 * religious authority.
 */

const FIGURE_CODE_RE = /^fg_[0-9]{3}$/
const ROLE_CODE_RE = /^rl_[0-9]{3}$/
const MISSION_CODE_RE = /^ms_[0-9]{3}$/
const EVENT_CODE_RE = /^ev_[0-9]{3}$/
const AVATAR_CODE_RE = /^av_[0-9]{3}$/
const LOCATION_CODE_RE = /^loc_[0-9]{3}$/
const TRADITION_CODE_RE = /^[a-z][a-z0-9-]{2,59}$/
const PASSAGE_RE =
  /^(qs:[0-9]{1,3}:[0-9]{1,3}|ot:[a-z0-9]{2,4}:[0-9]{1,3}:[0-9]{1,3}|nt:[a-z0-9]{2,4}:[0-9]{1,3}:[0-9]{1,3})$/

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
const asInt = (value: unknown): number | null => {
  const raw = asText(value)
  if (!raw) return null
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : null
}

const requireSource = (row: Row, what: string): void => {
  if (!nonEmpty(row.sourceRef)) throw badRequest(`actors ${what} needs a source reference`)
}
const keepSource = (patch: Row, what: string): void => {
  if ('sourceRef' in patch && !nonEmpty(patch.sourceRef)) {
    throw badRequest(`actors ${what} cannot lose its source reference`)
  }
}
const immutableCode = (patch: Row, field: string, what: string): void => {
  if (field in patch && patch[field] !== undefined) {
    throw badRequest(`actors ${what} codes are immutable; create a new record instead`)
  }
}
const requireFields = (row: Row, what: string, fields: string[]): void => {
  for (const field of fields) {
    if (!nonEmpty(row[field])) throw badRequest(`actors ${what} needs ${field}`)
  }
}
const requireReview = (row: Row, what: string, mode: 'write' | 'update'): void => {
  for (const key of ['reviewer', 'reason', 'evidenceRef'] as const) {
    if (!nonEmpty(row[key])) {
      throw badRequest(`a VERIFIED ${what} needs ${key} in the same ${mode}`)
    }
  }
}
const codeError = (pattern: RegExp, sample: string) => (value: unknown) =>
  pattern.test(String(value)) ? null : `code must match ${sample}`
const passageError = (value: unknown): string | null => {
  if (value == null || value === '') return null
  return PASSAGE_RE.test(String(value))
    ? null
    : 'passage reference must be qs:<surah>:<ayah> or ot/nt:<book>:<chapter>:<verse>'
}

// ---------------------------------------------------------------- seed rows

const sourceRef = (code: string): string => `@onto_sources:${code}`
const figureRef = (code: string): string => `@actor_figures:${code}`
const traditionRef = (code: string): string => `@actor_traditions:${code}`
const locationRef = (code: string): string => `@actor_locations:${code}`

const traditionRows = TRADITION_SEED.map((tradition) => ({
  code: tradition.code,
  label: tradition.label,
  scope: tradition.scope,
  description: tradition.description,
  sourceRef: sourceRef(tradition.sourceCode),
}))

const locationRows = LOCATION_SEED.map((location) => ({
  locationCode: location.locationCode,
  name: location.name,
  region: location.region,
  accuracy: location.accuracy,
  notes: location.notes,
  sourceRef: sourceRef(location.sourceCode),
}))

const figureRows = FIGURE_SEED.map((figure) => ({
  figureCode: figure.figureCode,
  labelEn: figure.labelEn,
  labelId: figure.labelId,
  figureKind: figure.figureKind,
  attestation: figure.attestation,
  summary: figure.summary,
  sourceRef: sourceRef(figure.sourceCode),
  status: figure.status,
  registryVersion: 'm11-seed-v1',
}))

const roleRows = ROLE_SEED.map((role) => ({
  roleCode: role.roleCode,
  figureRef: figureRef(role.figure),
  traditionRef: traditionRef(role.tradition),
  role: role.role,
  passageRef: role.passageRef,
  sourceRef: sourceRef(role.sourceCode),
  epistemicStatus: role.epistemicStatus,
  reviewer: null,
  reason: null,
  evidenceRef: null,
}))

const missionRows = MISSION_SEED.map((mission) => ({
  missionCode: mission.missionCode,
  figureRef: figureRef(mission.figure),
  traditionRef: traditionRef(mission.tradition),
  title: mission.title,
  problemAddressed: mission.problemAddressed,
  community: mission.community,
  historicalSetting: mission.historicalSetting,
  passageRef: mission.passageRef,
  interpretationNote: mission.interpretationNote,
  sourceRef: sourceRef(mission.sourceCode),
  epistemicStatus: mission.epistemicStatus,
  reviewer: null,
  reason: null,
  evidenceRef: null,
}))

const eventRows = EVENT_SEED.map((event) => ({
  eventCode: event.eventCode,
  figureRef: event.figure ? figureRef(event.figure) : null,
  title: event.title,
  eventType: event.eventType,
  locationRef: event.location ? locationRef(event.location) : null,
  chronologyLabel: event.chronologyLabel,
  chronologyConfidence: event.chronologyConfidence,
  traditionRef: traditionRef(event.tradition),
  passageRef: event.passageRef,
  description: event.description,
  sourceRef: sourceRef(event.sourceCode),
}))

// ------------------------------------------------------------------- addon

export const actors = defineAddon({
  name: 'actors',
  version: '1.0.0',
  depends: ['base', 'auth', 'ontology'],
  models: {
    actor_traditions: defineModel({
      label: 'Actor Tradition',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Actors', icon: 'TR', order: 10 },
      fields: {
        code: str({ maxLength: 60, unique: true, validate: codeError(TRADITION_CODE_RE, '^[a-z][a-z0-9-]{2,59}$') }),
        label: str({ maxLength: 160, minLength: 1 }),
        scope: sel(TRADITION_SCOPES, { index: true }),
        description: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'description is required') }),
        sourceRef: m2o('onto_sources', { index: true }),
      },
      unique: [['code']],
      data: { matchBy: ['code'], noupdate: true, rows: traditionRows },
    }),

    actor_locations: defineModel({
      label: 'Actor Location',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Actors', icon: 'LC', order: 20 },
      fields: {
        locationCode: str({
          maxLength: 8,
          unique: true,
          validate: codeError(LOCATION_CODE_RE, '^loc_[0-9]{3}$'),
        }),
        name: str({ maxLength: 160, minLength: 1 }),
        region: str({ maxLength: 120, null: true }),
        accuracy: sel(LOCATION_ACCURACIES, { index: true }),
        notes: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'notes are required') }),
        sourceRef: m2o('onto_sources', { index: true }),
      },
      unique: [['locationCode']],
      data: { matchBy: ['locationCode'], noupdate: true, rows: locationRows },
    }),

    actor_figures: defineModel({
      label: 'Actor Figure',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Actors', icon: 'FG', order: 30 },
      fields: {
        figureCode: str({ maxLength: 8, unique: true, validate: codeError(FIGURE_CODE_RE, '^fg_[0-9]{3}$') }),
        labelEn: str({ maxLength: 160, minLength: 1 }),
        labelId: str({ maxLength: 160, minLength: 1 }),
        figureKind: sel(FIGURE_KINDS, { index: true }),
        attestation: sel(FIGURE_ATTESTATIONS, { index: true }),
        summary: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'summary is required') }),
        sourceRef: m2o('onto_sources', { index: true }),
        status: sel(FIGURE_STATUSES, { default: 'CANDIDATE', index: true }),
        entityRef: m2o('onto_entities', { null: true, index: true }),
        registryVersion: str({ maxLength: 40, default: 'runtime' }),
      },
      unique: [['figureCode']],
      data: { matchBy: ['figureCode'], noupdate: true, rows: figureRows },
    }),

    actor_roles: defineModel({
      label: 'Actor Role',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Actors', icon: 'RL', order: 40 },
      fields: {
        roleCode: str({ maxLength: 8, unique: true, validate: codeError(ROLE_CODE_RE, '^rl_[0-9]{3}$') }),
        figureRef: m2o('actor_figures', { index: true }),
        traditionRef: m2o('actor_traditions', { index: true }),
        role: sel(ROLE_TYPES, { index: true }),
        passageRef: str({ maxLength: 40, validate: passageError }),
        sourceRef: m2o('onto_sources', { index: true }),
        epistemicStatus: sel(EPISTEMIC_STATUSES, { default: 'UNKNOWN', index: true }),
        reviewer: str({ maxLength: 80, null: true }),
        reason: text({ null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
      },
      unique: [['roleCode'], ['figureRef', 'traditionRef', 'role', 'passageRef']],
      data: { matchBy: ['roleCode'], noupdate: true, rows: roleRows },
    }),

    actor_missions: defineModel({
      label: 'Actor Mission',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Actors', icon: 'MS', order: 50 },
      fields: {
        missionCode: str({ maxLength: 8, unique: true, validate: codeError(MISSION_CODE_RE, '^ms_[0-9]{3}$') }),
        figureRef: m2o('actor_figures', { index: true }),
        traditionRef: m2o('actor_traditions', { index: true }),
        title: str({ maxLength: 200, minLength: 1 }),
        problemAddressed: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'problemAddressed is required') }),
        community: str({ maxLength: 200, minLength: 1 }),
        historicalSetting: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'historicalSetting is required') }),
        passageRef: str({ maxLength: 40, validate: passageError }),
        interpretationNote: text({ null: true }),
        sourceRef: m2o('onto_sources', { index: true }),
        epistemicStatus: sel(EPISTEMIC_STATUSES, { default: 'UNKNOWN', index: true }),
        reviewer: str({ maxLength: 80, null: true }),
        reason: text({ null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
      },
      unique: [['missionCode'], ['figureRef', 'traditionRef', 'title']],
      data: { matchBy: ['missionCode'], noupdate: true, rows: missionRows },
    }),

    actor_events: defineModel({
      label: 'Actor Event',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Actors', icon: 'EV', order: 60 },
      fields: {
        eventCode: str({ maxLength: 8, unique: true, validate: codeError(EVENT_CODE_RE, '^ev_[0-9]{3}$') }),
        figureRef: m2o('actor_figures', { null: true, index: true }),
        title: str({ maxLength: 200, minLength: 1 }),
        eventType: sel(EVENT_TYPES, { index: true }),
        locationRef: m2o('actor_locations', { null: true, index: true }),
        chronologyLabel: str({ maxLength: 160, minLength: 1 }),
        chronologyConfidence: sel(CHRONOLOGY_CONFIDENCES, { default: 'UNDATED', index: true }),
        traditionRef: m2o('actor_traditions', { index: true }),
        passageRef: str({ maxLength: 40, null: true, validate: passageError }),
        description: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'description is required') }),
        sourceRef: m2o('onto_sources', { index: true }),
      },
      unique: [['eventCode']],
      data: { matchBy: ['eventCode'], noupdate: true, rows: eventRows },
    }),

    actor_avatars: defineModel({
      label: 'Actor Avatar',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Actors', icon: 'AV', order: 70 },
      fields: {
        avatarCode: str({ maxLength: 8, unique: true, validate: codeError(AVATAR_CODE_RE, '^av_[0-9]{3}$') }),
        avatarName: str({ maxLength: 160, minLength: 1 }),
        figureRef: m2o('actor_figures', { null: true, index: true }),
        missionRef: m2o('actor_missions', { null: true, index: true }),
        pedagogicalUse: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'pedagogicalUse is required') }),
        disclosure: text({
          validate: (value: unknown) =>
            nonEmpty(value) && String(value).toLowerCase().includes('not the prophet')
              ? null
              : 'an avatar disclosure must state that the avatar is not the prophet',
        }),
        authorityStatus: sel(['PEDAGOGICAL_ONLY'] as const, { default: 'PEDAGOGICAL_ONLY' }),
        status: sel(AVATAR_STATUSES, { default: 'PROPOSAL', index: true }),
        reviewer: str({ maxLength: 80, null: true }),
        reason: text({ null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
        sourceRef: m2o('onto_sources', { index: true }),
      },
      unique: [['avatarCode']],
    }),
  },

  hooks: {
    actor_traditions: {
      beforeCreate: (row) => {
        requireSource(row, 'tradition')
        requireFields(row, 'tradition', ['code', 'label', 'description'])
        return row
      },
      beforeUpdate: (patch) => {
        immutableCode(patch, 'code', 'tradition')
        keepSource(patch, 'tradition')
        return patch
      },
      beforeDelete: () => {
        throw badRequest('actor traditions are never deleted; claims keep their tradition scope')
      },
    },
    actor_locations: {
      beforeCreate: (row) => {
        requireSource(row, 'location')
        requireFields(row, 'location', ['locationCode', 'name', 'notes'])
        return row
      },
      beforeUpdate: (patch) => {
        immutableCode(patch, 'locationCode', 'location')
        keepSource(patch, 'location')
        return patch
      },
      beforeDelete: () => {
        throw badRequest('actor locations are never deleted; events reference them')
      },
    },
    actor_figures: {
      beforeCreate: (row) => {
        requireSource(row, 'figure')
        requireFields(row, 'figure', ['figureCode', 'labelEn', 'labelId', 'summary'])
        if (!row.registryVersion) row.registryVersion = 'runtime'
        return row
      },
      beforeUpdate: (patch) => {
        immutableCode(patch, 'figureCode', 'figure')
        keepSource(patch, 'figure')
        if ('labelEn' in patch && !nonEmpty(patch.labelEn)) throw badRequest('a figure label cannot be blank')
        if ('labelId' in patch && !nonEmpty(patch.labelId)) throw badRequest('a figure label cannot be blank')
        return patch
      },
      beforeDelete: () => {
        throw badRequest('actor figures are never deleted; mark the record CONTESTED instead')
      },
    },
    actor_roles: {
      beforeCreate: (row) => {
        requireSource(row, 'role')
        requireFields(row, 'role', ['roleCode', 'figureRef', 'traditionRef', 'passageRef'])
        if (row.epistemicStatus === 'VERIFIED') requireReview(row, 'role', 'write')
        return row
      },
      beforeUpdate: (patch) => {
        immutableCode(patch, 'roleCode', 'role')
        keepSource(patch, 'role')
        if ('figureRef' in patch) throw badRequest('a role cannot move to another figure; register a new claim')
        if ('traditionRef' in patch) throw badRequest('a role cannot change tradition; register a new claim')
        if (patch.epistemicStatus === 'VERIFIED') requireReview(patch, 'role', 'update')
        return patch
      },
      beforeDelete: () => {
        throw badRequest('actor roles are claims and are never deleted; mark the claim DISPUTED instead')
      },
    },
    actor_missions: {
      beforeCreate: (row) => {
        requireSource(row, 'mission')
        requireFields(row, 'mission', [
          'missionCode',
          'figureRef',
          'traditionRef',
          'title',
          'problemAddressed',
          'community',
          'historicalSetting',
          'passageRef',
        ])
        if (row.epistemicStatus === 'VERIFIED') requireReview(row, 'mission', 'write')
        return row
      },
      beforeUpdate: (patch) => {
        immutableCode(patch, 'missionCode', 'mission')
        keepSource(patch, 'mission')
        if ('figureRef' in patch) throw badRequest('a mission cannot move to another figure; register a new claim')
        if ('traditionRef' in patch) throw badRequest('a mission cannot change tradition; register a new claim')
        if (patch.epistemicStatus === 'VERIFIED') requireReview(patch, 'mission', 'update')
        return patch
      },
      beforeDelete: () => {
        throw badRequest('actor missions are claims and are never deleted; mark the claim DISPUTED instead')
      },
    },
    actor_events: {
      beforeCreate: (row) => {
        requireSource(row, 'event')
        requireFields(row, 'event', ['eventCode', 'title', 'traditionRef', 'chronologyLabel', 'description'])
        return row
      },
      beforeUpdate: (patch) => {
        immutableCode(patch, 'eventCode', 'event')
        keepSource(patch, 'event')
        if ('chronologyLabel' in patch && !nonEmpty(patch.chronologyLabel)) {
          throw badRequest('an event needs a chronology label; use "Not dated by the source" instead of a blank')
        }
        return patch
      },
      beforeDelete: () => {
        throw badRequest('actor events are never deleted; correct the record with a new source instead')
      },
    },
    actor_avatars: {
      beforeCreate: (row) => {
        requireSource(row, 'avatar')
        requireFields(row, 'avatar', ['avatarCode', 'avatarName', 'pedagogicalUse', 'disclosure'])
        row.authorityStatus = 'PEDAGOGICAL_ONLY'
        const disclosure = String(row.disclosure).toLowerCase()
        if (!disclosure.includes('not the prophet')) {
          throw badRequest('an avatar disclosure must state that the avatar is not the prophet')
        }
        if (row.status === 'REVIEWED') requireReview(row, 'avatar', 'write')
        return row
      },
      beforeUpdate: (patch) => {
        immutableCode(patch, 'avatarCode', 'avatar')
        keepSource(patch, 'avatar')
        if ('authorityStatus' in patch) patch.authorityStatus = 'PEDAGOGICAL_ONLY'
        if ('disclosure' in patch) {
          const disclosure = String(patch.disclosure ?? '').toLowerCase()
          if (!disclosure.includes('not the prophet')) {
            throw badRequest('an avatar disclosure must state that the avatar is not the prophet')
          }
        }
        if (patch.status === 'REVIEWED') requireReview(patch, 'avatar', 'update')
        return patch
      },
      beforeDelete: () => {
        throw badRequest('actor avatars are never deleted; withdraw the status instead')
      },
    },
  },

  endpoints: {
    /** The Prophetic Mission Table is a filtered view over the Figure Registry. */
    missions: {
      method: 'GET',
      path: '/actors/missions',
      requires: 'public',
      menu: { group: 'Actors', icon: 'MT', order: 80 },
      handler: async ({ query, orm, status }) => {
        const tradition = asText(query.tradition)
        const figure = asText(query.figure)
        const confidence = asText(query.confidence)
        const q = asText(query.q)
        if (tradition) {
          const traditions = await listAll(orm, 'actor_traditions')
          if (!traditions.some((row) => row.code === tradition)) {
            status(400)
            return { state: 'invalid', message: `unknown tradition "${tradition}"` }
          }
        }
        if (figure && !FIGURE_CODE_RE.test(figure)) {
          status(400)
          return { state: 'invalid', message: 'figure must match ^fg_[0-9]{3}$' }
        }
        if (confidence && !EPISTEMIC_STATUSES.includes(confidence as (typeof EPISTEMIC_STATUSES)[number])) {
          status(400)
          return { state: 'invalid', message: `unknown confidence "${confidence}"` }
        }
        if (q.length > 120) {
          status(400)
          return { state: 'invalid', message: 'q is longer than 120 characters' }
        }
        return buildMissionTable(orm, {
          tradition: tradition || undefined,
          figure: figure || undefined,
          confidence: confidence || undefined,
          q: q || undefined,
          limit: asInt(query.limit) ?? undefined,
          offset: asInt(query.offset) ?? undefined,
        })
      },
    },

    /** The Figure Registry: one row per referent, never one row per name. */
    figures: {
      method: 'GET',
      path: '/actors/figures',
      requires: 'public',
      menu: { group: 'Actors', icon: 'FR', order: 81 },
      handler: async ({ orm }) => buildFigureRegistry(orm),
    },

    /** One figure with roles, tradition-scoped readings, events and avatars. */
    figure: {
      method: 'GET',
      path: '/actors/figure',
      requires: 'public',
      handler: async ({ query, orm, status }) => {
        const code = asText(query.code).toLowerCase()
        if (!FIGURE_CODE_RE.test(code)) {
          status(400)
          return { state: 'invalid', message: 'code must match ^fg_[0-9]{3}$' }
        }
        const detail = await buildFigureDetail(orm, code)
        if (!detail) throw notFound(`actor figure "${code}" not found`)
        return detail
      },
    },

    /** Policy surface: mission-table notices and the avatar pedagogy rules. */
    policy: {
      method: 'GET',
      path: '/actors/policy',
      requires: 'public',
      handler: async () => actorPolicy(),
    },
  },
})

export default actors
export {
  ACTORS_META,
  AVATAR_POLICY,
  AVATAR_STATUSES,
  CHRONOLOGY_CONFIDENCES,
  EPISTEMIC_STATUSES,
  EVENT_TYPES,
  FIGURE_ATTESTATIONS,
  FIGURE_KINDS,
  FIGURE_STATUSES,
  LOCATION_ACCURACIES,
  ROLE_TYPES,
  TRADITION_SCOPES,
} from './seed.js'
export { actorPolicy, buildFigureDetail, buildFigureRegistry, buildMissionTable } from './projection.js'
export type { Orm } from './projection.js'
