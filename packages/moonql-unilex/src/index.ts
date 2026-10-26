import {
  ADMIN_FULL,
  ADMIN_ONLY,
  ADMIN_WRITE,
  computed,
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
import { UNILEX_SEED, type UnilexLane, type UnilexSeedEntry } from './data/registry.js'
import { classifyMatch, normalizeHeadword } from './match.js'

/**
 * moonql-unilex — Domain D02 UNILEX (M09).
 *
 * The 71 Empire concepts are a pinned seed registry, not a validated
 * dictionary. Terms own stable IDs; forms carry language/script/direction;
 * senses carry context and editorial status; typed relations are proposals
 * until a reviewer approves them. The Terms Table is a projection over these
 * same tables, never a second vocabulary.
 */

const LANES = ['UNIVERSAL', 'SCRIPTURE', 'TEXT_SOURCE', 'PROJECT'] as const
const SCOPES = [
  'GENERAL',
  'ISLAMIC_SCRIPTURE',
  'TEXTUAL_WITNESS',
  'PROJECT_INTERNAL',
  'SUFI_STUDY',
  'CREATIVE_FICTION',
] as const
const EDITORIAL_STATUSES = ['DRAFT_REVIEW', 'SOURCE_CHECK', 'LINGUISTIC_REVIEW', 'APPROVED', 'DEPRECATED'] as const
const SOURCE_STATUSES = ['PROPOSED', 'SOURCE_CHECKED', 'APPROVED_FOR_CITATION', 'DEPRECATED'] as const
const SOURCE_TYPES = ['REGISTRY', 'PROJECT_VISION', 'SCRIPTURE_EDITION', 'SCHOLARLY'] as const
const SCRIPTS = ['Latn', 'Arab', 'Hebr', 'Grek'] as const
const DIRECTIONS = ['ltr', 'rtl'] as const
const RELATION_TYPES = [
  'relatedTo',
  'inspiredBy',
  'distinctFrom',
  'exactMatch',
  'closeMatch',
  'narrowerThan',
  'broaderThan',
] as const
const RELATION_STATUSES = ['SEED_PROPOSED', 'REVIEW_PENDING', 'APPROVED', 'REJECTED'] as const
const MATCH_CLASSES = ['EXACT', 'NEAR', 'DIFFERENT'] as const
const MATCH_DECISIONS = ['PENDING', 'APPROVED_EXACT', 'APPROVED_CLOSE', 'REJECTED'] as const

const REGISTRY_SOURCE = 'empire-unilex-v0.1'
const VISION_SOURCE = 'xv-master-vision'
const QURAN_SOURCE = 'quran-cairo-hafs'
const REVIEWER = 'M09 terminology review'
const VISION_REF = 'docs/vision/MASTER_VISION_NARRATIVE_XV.md#06'
const EMPIRE_REF = 'empire-of-the-light@38354ff:data/unilex/terms.v0.1.json'
const EMPIRE_URI =
  'https://github.com/bjo163/empire-of-the-light/blob/38354ffff077d4ee1e17d40b39d86e41ce769817/data/unilex/terms.v0.1.json'
const VISION_URI =
  'https://github.com/bjo163/moonwitnessxv/blob/e2f4562/docs/vision/MASTER_VISION_NARRATIVE_XV.md'
const VISION_SHA256 = '7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb'
const RAW_SHA256 = '8e60fe61d35604f560c7c71330754db3e881915ce541c392e09fb99c53d05772'
const DECIDED_AT = '2026-10-26T00:00:00.000Z'

export const UNILEX_REGISTRY_META = {
  version: UNILEX_SEED.schemaVersion,
  status: UNILEX_SEED.status,
  seedCount: UNILEX_SEED.entries.length,
  pin: 'bjo163/empire-of-the-light@38354ffff077d4ee1e17d40b39d86e41ce769817',
  path: 'data/unilex/terms.v0.1.json',
  rawSha256: RAW_SHA256,
  notice:
    'UNILEX v0.1 is a proposed, versioned seed of 71 concepts — not a validated universal dictionary.',
  addenda: {
    version: 'xv-addendum-1',
    ids: ['P030', 'P031'],
    notice: 'XV project addenda are kept separate from the 71 pinned Empire concepts.',
  },
}

const LANE_CONTEXT: Record<UnilexLane, string> = {
  UNIVERSAL: 'Context-neutral human value (UNILEX lane UNIVERSAL).',
  SCRIPTURE: 'Tradition-scoped theological referent (UNILEX lane SCRIPTURE).',
  TEXT_SOURCE: 'Extant textual witness or text family (UNILEX lane TEXT_SOURCE).',
  PROJECT: 'Human-operated software/fictional vocabulary (UNILEX lane PROJECT).',
}

const LANE_SCOPE: Record<UnilexLane, (typeof SCOPES)[number]> = {
  UNIVERSAL: 'GENERAL',
  SCRIPTURE: 'ISLAMIC_SCRIPTURE',
  TEXT_SOURCE: 'TEXTUAL_WITNESS',
  PROJECT: 'PROJECT_INTERNAL',
}

/** XV additions are separate from the 71 Empire concepts and say so. */
const XV_TERMS: UnilexSeedEntry[] = [
  {
    id: 'P030',
    preferredLabel: { en: 'ZILL Study Track', id: 'Track Kajian ZILL' },
    domain: 'PROJECT',
    kind: 'concept',
    definition: {
      id: 'Track kajian ZILL/Ahluz Zikir: tasawuf, tarekat, dzikir, praktik devosional, otoritas dan tafsir yang bersaing. Bukan konsep kreatif ZILL — Shadow Witness.',
    },
    alternateLabels: {},
    sourceReferences: [],
    relations: [],
    status: 'DRAFT_REVIEW',
  },
  {
    id: 'P031',
    preferredLabel: { en: 'ZILL — Shadow Witness', id: 'ZILL — Saksi Bayangan' },
    domain: 'PROJECT',
    kind: 'concept',
    definition: {
      id: 'Konsep kreatif/orisinal XV tentang saksi bayangan. Bukan teologi, bukan entitas supernatural, dan bukan track kajian ZILL.',
    },
    alternateLabels: {},
    sourceReferences: [],
    relations: [],
    status: 'DRAFT_REVIEW',
  },
]

const ALL_TERMS = [...UNILEX_SEED.entries, ...XV_TERMS]
const XV_IDS = new Set(XV_TERMS.map((entry) => entry.id))

const TERM_SCOPE: Record<string, (typeof SCOPES)[number]> = {
  P030: 'SUFI_STUDY',
  P031: 'CREATIVE_FICTION',
}

const TERM_CONTEXT: Record<string, string> = {
  P030: 'XV project research vocabulary; a study track, not a theological referent.',
  P031: 'XV creative vocabulary; an original fictional concept with no religious authority.',
}

const TERM_SENSE_KEY: Record<string, string> = {
  P030: 'study-track',
  P031: 'creative-concept',
}

const sourceCodeFor = (id: string): string => (XV_IDS.has(id) ? VISION_SOURCE : REGISTRY_SOURCE)

type Row = Record<string, unknown>

const nonEmpty = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const asInt = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isInteger(value)) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  return undefined
}

type Orm = EndpointCtx['orm']
type Repo = {
  list(query?: Record<string, unknown>): Promise<Row[]>
  create(data: Row): Promise<Row>
  update(id: string, patch: Row): Promise<Row>
}

const repo = (orm: Orm, name: string): Repo => orm.model(name) as Repo

const listAll = async (orm: Orm, name: string, limit = 2000): Promise<Row[]> =>
  await repo(orm, name).list({ limit })

const termIdsByStableId = (terms: Row[]): Map<string, string> =>
  new Map(terms.map((term) => [String(term.stableId), String(term.id)]))

const approvedSourceIds = (sources: Row[]): Set<string> =>
  new Set(sources.filter((source) => source.reviewStatus === 'APPROVED_FOR_CITATION').map((source) => String(source.id)))

const registryMeta = () => UNILEX_REGISTRY_META

// ------------------------------------------------------------------ seed rows

const termRows = ALL_TERMS.map((entry) => ({
  stableId: entry.id,
  lane: entry.domain,
  kind: 'CONCEPT',
  preferredEn: entry.preferredLabel.en,
  preferredId: entry.preferredLabel.id,
  definition: entry.definition.id,
  contextNote: TERM_CONTEXT[entry.id] ?? LANE_CONTEXT[entry.domain],
  editorialStatus: 'DRAFT_REVIEW',
  registryVersion: XV_IDS.has(entry.id) ? 'xv-addendum-1' : UNILEX_SEED.schemaVersion,
  sourceRef: `@unilex_sources:${sourceCodeFor(entry.id)}`,
  supersededByRef: null,
  deprecationReason: null,
}))

async function formRows({ orm }: { orm: Orm }): Promise<Row[]> {
  const ids = termIdsByStableId(await listAll(orm, 'unilex_terms'))
  const rows: Row[] = []
  for (const entry of ALL_TERMS) {
    const termRef = ids.get(entry.id)
    if (!termRef) continue
    const sourceRef = `@unilex_sources:${sourceCodeFor(entry.id)}`
    for (const [languageCode, label] of [
      ['en', entry.preferredLabel.en],
      ['id', entry.preferredLabel.id],
    ] as const) {
      rows.push({
        formCode: `${entry.id}:${languageCode}:Latn`,
        termRef,
        languageCode,
        scriptCode: 'Latn',
        direction: 'ltr',
        headword: label,
        transliteration: null,
        normalized: normalizeHeadword(label),
        sourceRef,
      })
    }
  }
  return rows
}

async function senseRows({ orm }: { orm: Orm }): Promise<Row[]> {
  const ids = termIdsByStableId(await listAll(orm, 'unilex_terms'))
  return ALL_TERMS.flatMap((entry) => {
    const termRef = ids.get(entry.id)
    if (!termRef) return []
    return [
      {
        senseKey: TERM_SENSE_KEY[entry.id] ?? 'registry-definition',
        termRef,
        contextScope: TERM_SCOPE[entry.id] ?? LANE_SCOPE[entry.domain],
        definition: entry.definition.id,
        editorialStatus: 'DRAFT_REVIEW',
        sourceRef: `@unilex_sources:${sourceCodeFor(entry.id)}`,
        reviewer: null,
        reviewerNote: null,
        supersedesRef: null,
        deprecatedAt: null,
      },
    ]
  })
}

type SeedRelation = {
  sourceTermRef: string
  targetTermRef: string
  relationType: (typeof RELATION_TYPES)[number]
  status: (typeof RELATION_STATUSES)[number]
  assertedBy: 'SEED' | 'REVIEWER'
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
}

const REVIEWED_RELATIONS: Array<{
  from: string
  to: string
  reason: string
}> = [
  {
    from: 'S009',
    to: 'P002',
    reason:
      'The seed already asserts Al-Arsh distinctFrom ARSY; XV red lines forbid treating the theological referent as the technology.',
  },
  {
    from: 'S001',
    to: 'P001',
    reason: 'The Islamic theological referent Allah is not the A-L-L-A-H Command Center project concept.',
  },
  {
    from: 'P030',
    to: 'P031',
    reason: 'ZILL study track and ZILL — Shadow Witness are separate project referents; the shared name is not identity.',
  },
  {
    from: 'P031',
    to: 'P004',
    reason:
      'ZILL — Shadow Witness and ZIIL are phonetically close but distinct project concepts; resemblance is not identity.',
  },
]

async function relationRows({ orm }: { orm: Orm }): Promise<Row[]> {
  const ids = termIdsByStableId(await listAll(orm, 'unilex_terms'))
  const rows = new Map<string, SeedRelation>()
  const keyOf = (from: string, to: string, type: string) => `${from}:${to}:${type}`

  for (const entry of UNILEX_SEED.entries) {
    for (const relation of entry.relations) {
      const sourceTermRef = ids.get(entry.id)
      const targetTermRef = ids.get(relation.targetId)
      if (!sourceTermRef || !targetTermRef) continue
      const key = keyOf(entry.id, relation.targetId, relation.type)
      rows.set(key, {
        sourceTermRef,
        targetTermRef,
        relationType: relation.type as (typeof RELATION_TYPES)[number],
        status: 'SEED_PROPOSED',
        assertedBy: 'SEED',
        reviewer: null,
        reason: 'Imported from the pinned UNILEX v0.1 registry; not reviewed or adopted.',
        evidenceRef: EMPIRE_REF,
      })
    }
  }

  for (const decision of REVIEWED_RELATIONS) {
    const sourceTermRef = ids.get(decision.from)
    const targetTermRef = ids.get(decision.to)
    if (!sourceTermRef || !targetTermRef) continue
    const key = keyOf(decision.from, decision.to, 'distinctFrom')
    rows.set(key, {
      sourceTermRef,
      targetTermRef,
      relationType: 'distinctFrom',
      status: 'APPROVED',
      assertedBy: 'REVIEWER',
      reviewer: REVIEWER,
      reason: decision.reason,
      evidenceRef: VISION_REF,
    })
  }

  return [...rows.values()]
}

async function matchReviewRows({ orm }: { orm: Orm }): Promise<Row[]> {
  const ids = termIdsByStableId(await listAll(orm, 'unilex_terms'))
  const leftTermRef = ids.get('P004')
  const rightTermRef = ids.get('P031')
  if (!leftTermRef || !rightTermRef) return []
  const preview = classifyMatch({ text: 'ZIIL' }, { text: 'ZILL' })
  return [
    {
      pairCode: 'P004:P031',
      leftTermRef,
      rightTermRef,
      leftForm: 'ZIIL',
      rightForm: 'ZILL',
      classification: preview.classification,
      similarity: Math.round(preview.similarity * 100),
      decision: 'REJECTED',
      reviewer: REVIEWER,
      reason: 'Phonetic resemblance only. ZIIL and ZILL — Shadow Witness are distinct project concepts.',
      evidenceRef: VISION_REF,
    },
  ]
}

function reviewLogRows(): Row[] {
  return [
    ...REVIEWED_RELATIONS.map((decision) => ({
      targetType: 'RELATION',
      targetRef: `${decision.from}:${decision.to}:distinctFrom`,
      action: 'APPROVE',
      reason: decision.reason,
      reviewer: REVIEWER,
      evidenceRef: VISION_REF,
      decidedAt: DECIDED_AT,
    })),
    {
      targetType: 'TERM',
      targetRef: 'P004:P031',
      action: 'REJECT_IDENTITY',
      reason: 'Phonetic resemblance only; ZIIL and ZILL — Shadow Witness remain separate.',
      reviewer: REVIEWER,
      evidenceRef: VISION_REF,
      decidedAt: DECIDED_AT,
    },
  ]
}

// -------------------------------------------------------------------- hooks

const requireSource = (row: Row, what: string): void => {
  if (!nonEmpty(row.sourceRef)) throw badRequest(`UNILEX ${what} needs a source reference`)
}

const keepSource = (patch: Row, what: string): void => {
  if ('sourceRef' in patch && !nonEmpty(patch.sourceRef)) {
    throw badRequest(`UNILEX ${what} cannot lose its source reference`)
  }
}

const expectedDirection = (script: unknown): 'rtl' | 'ltr' =>
  script === 'Arab' || script === 'Hebr' ? 'rtl' : 'ltr'

const assertReviewedIdentity = (row: Row): void => {
  const type = String(row.relationType ?? '')
  if (type !== 'exactMatch' && type !== 'closeMatch') return
  if (row.status !== 'APPROVED') return
  if (!nonEmpty(row.reviewer) || !nonEmpty(row.reason) || !nonEmpty(row.evidenceRef)) {
    throw badRequest(`UNILEX ${type} requires reviewer, reason and evidence before APPROVED`)
  }
}

const stableIdError = (stableId: string): string | null =>
  /^[USTP][0-9]{3}$/.test(stableId) ? null : 'stable ID must match ^[USTP][0-9]{3}$'

// ------------------------------------------------------------------ addon

export const unilex = defineAddon({
  name: 'unilex',
  version: '1.0.0',
  depends: ['base', 'auth'],
  models: {
    unilex_sources: defineModel({
      label: 'UNILEX Source',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'UNILEX', icon: 'SO', order: 10 },
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
      data: {
        matchBy: ['code'],
        noupdate: true,
        rows: [
          {
            code: REGISTRY_SOURCE,
            title: 'Empire of the Light — UNILEX v0.1',
            sourceType: 'REGISTRY',
            citation:
              'bjo163/empire-of-the-light @ 38354ffff077d4ee1e17d40b39d86e41ce769817, docs/UNILEX_SPEC.md and data/unilex/terms.v0.1.json',
            sourceUri: EMPIRE_URI,
            provenanceSha: RAW_SHA256,
            reviewStatus: 'APPROVED_FOR_CITATION',
            approvalNote:
              'Approved as a pinned provenance citation only. The 71 concepts remain PROPOSED_NOT_ADOPTED and DRAFT_REVIEW.',
          },
          {
            code: VISION_SOURCE,
            title: 'MoonWitness XV — Master Vision Narrative',
            sourceType: 'PROJECT_VISION',
            citation: 'docs/vision/MASTER_VISION_NARRATIVE_XV.md (section 06)',
            sourceUri: VISION_URI,
            provenanceSha: VISION_SHA256,
            reviewStatus: 'APPROVED_FOR_CITATION',
            approvalNote: 'Project vision, not scripture or scholarly authority; used for XV addenda only.',
          },
          {
            code: QURAN_SOURCE,
            title: "Al-Qur'an — Cairo 1924 (Hafs 'an 'Asim)",
            sourceType: 'SCRIPTURE_EDITION',
            citation: 'D01 corpus edition quran_cairo_hafs',
            sourceUri: 'https://archive.org/details/cairo-quran-1924',
            provenanceSha: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
            reviewStatus: 'APPROVED_FOR_CITATION',
            approvalNote: 'Edition identity only; no corpus text is copied into UNILEX.',
          },
        ],
      },
    }),

    unilex_terms: defineModel({
      label: 'UNILEX Term',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'UNILEX', icon: 'TM', order: 20 },
      fields: {
        stableId: str({ maxLength: 8, unique: true, validate: (value: unknown) => stableIdError(String(value)) }),
        lane: sel(LANES, { index: true }),
        kind: sel(['CONCEPT', 'NAME', 'PLACE', 'PRACTICE'], { default: 'CONCEPT' }),
        preferredEn: str({ maxLength: 160, minLength: 1 }),
        preferredId: str({ maxLength: 160, minLength: 1 }),
        definition: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'definition is required') }),
        contextNote: str({ maxLength: 240, minLength: 1 }),
        editorialStatus: sel(EDITORIAL_STATUSES, { default: 'DRAFT_REVIEW', index: true }),
        registryVersion: str({ maxLength: 40 }),
        sourceRef: m2o('unilex_sources', { index: true }),
        supersededByRef: m2o('unilex_terms'),
        deprecationReason: text({ null: true }),
      },
      unique: [['stableId']],
      data: { matchBy: ['stableId'], noupdate: true, rows: termRows },
    }),

    unilex_forms: defineModel({
      label: 'UNILEX Form',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'UNILEX', icon: 'FM', order: 30 },
      fields: {
        formCode: str({ maxLength: 80, unique: true }),
        termRef: m2o('unilex_terms', { index: true }),
        languageCode: str({ maxLength: 10, minLength: 2 }),
        scriptCode: sel(SCRIPTS),
        direction: sel(DIRECTIONS, { default: 'ltr' }),
        headword: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'headword is required') }),
        transliteration: str({ maxLength: 160, null: true }),
        normalized: computed({
          type: 'string',
          store: true,
          deps: ['headword'],
          get: (row) => normalizeHeadword(String(row.headword ?? '')),
        }),
        sourceRef: m2o('unilex_sources', { index: true }),
      },
      unique: [['formCode']],
      data: { matchBy: ['formCode'], noupdate: true, rows: formRows },
    }),

    unilex_senses: defineModel({
      label: 'UNILEX Sense',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'UNILEX', icon: 'SN', order: 40 },
      fields: {
        senseKey: str({ maxLength: 60 }),
        termRef: m2o('unilex_terms', { index: true }),
        contextScope: sel(SCOPES, { index: true }),
        definition: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'definition is required') }),
        editorialStatus: sel(EDITORIAL_STATUSES, { default: 'DRAFT_REVIEW', index: true }),
        sourceRef: m2o('unilex_sources', { index: true }),
        reviewer: str({ maxLength: 80, null: true }),
        reviewerNote: text({ null: true }),
        supersedesRef: m2o('unilex_senses'),
        deprecatedAt: ts({ null: true }),
      },
      unique: [['termRef', 'senseKey']],
      data: { matchBy: ['termRef', 'senseKey'], noupdate: true, rows: senseRows },
    }),

    unilex_relations: defineModel({
      label: 'UNILEX Relation',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'UNILEX', icon: 'RL', order: 50 },
      fields: {
        sourceTermRef: m2o('unilex_terms', { index: true }),
        targetTermRef: m2o('unilex_terms', { index: true }),
        relationType: sel(RELATION_TYPES),
        status: sel(RELATION_STATUSES, { default: 'REVIEW_PENDING', index: true }),
        assertedBy: sel(['SEED', 'REVIEWER'], { default: 'SEED' }),
        reviewer: str({ maxLength: 80, null: true }),
        reason: text({ null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
      },
      unique: [['sourceTermRef', 'targetTermRef', 'relationType']],
      data: {
        matchBy: ['sourceTermRef', 'targetTermRef', 'relationType'],
        noupdate: true,
        rows: relationRows,
      },
    }),

    unilex_match_reviews: defineModel({
      label: 'UNILEX Match Review',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'UNILEX', icon: 'MR', order: 60 },
      fields: {
        pairCode: str({ maxLength: 40, unique: true }),
        leftTermRef: m2o('unilex_terms', { index: true }),
        rightTermRef: m2o('unilex_terms', { index: true }),
        leftForm: str({ maxLength: 160 }),
        rightForm: str({ maxLength: 160 }),
        classification: sel(MATCH_CLASSES),
        similarity: int(),
        decision: sel(MATCH_DECISIONS, { default: 'PENDING' }),
        reviewer: str({ maxLength: 80, null: true }),
        reason: text({ null: true }),
        evidenceRef: str({ maxLength: 240, null: true }),
      },
      unique: [['pairCode']],
      data: { matchBy: ['pairCode'], noupdate: true, rows: matchReviewRows },
    }),

    unilex_review_log: defineModel({
      label: 'UNILEX Review Log',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'UNILEX', icon: 'LG', order: 70 },
      fields: {
        targetType: sel(['TERM', 'SENSE', 'RELATION']),
        targetRef: str({ maxLength: 120 }),
        action: sel(['APPROVE', 'DEPRECATE', 'CORRECTION', 'REJECT_IDENTITY', 'SPLIT']),
        reason: text({ validate: (value: unknown) => (nonEmpty(value) ? null : 'reason is required') }),
        reviewer: str({ maxLength: 80, minLength: 1 }),
        evidenceRef: str({ maxLength: 240, null: true }),
        decidedAt: ts(),
      },
      unique: [['targetType', 'targetRef', 'action', 'reviewer']],
      data: {
        matchBy: ['targetType', 'targetRef', 'action', 'reviewer'],
        noupdate: true,
        rows: reviewLogRows(),
      },
    }),
  },

  hooks: {
    unilex_terms: {
      beforeCreate: (row) => {
        requireSource(row, 'term')
        return row
      },
      beforeUpdate: (patch) => {
        if ('stableId' in patch && patch.stableId !== undefined) {
          throw badRequest('UNILEX stable IDs are immutable; deprecate the term and create a successor instead')
        }
        if (patch.editorialStatus === 'DEPRECATED' && !nonEmpty(patch.deprecationReason)) {
          throw badRequest('deprecating a term needs deprecationReason in the same update')
        }
        if (patch.supersededByRef && patch.editorialStatus !== 'DEPRECATED') {
          throw badRequest('a successor may only be attached while deprecating the term')
        }
        keepSource(patch, 'term')
        return patch
      },
    },
    unilex_forms: {
      beforeCreate: (row) => {
        requireSource(row, 'form')
        if (!row.termRef) throw badRequest('UNILEX form needs a term')
        const direction = expectedDirection(row.scriptCode)
        if (row.direction && row.direction !== direction) {
          throw badRequest(`script ${String(row.scriptCode)} must be written ${direction}`)
        }
        row.direction = direction
        return row
      },
      beforeUpdate: (patch) => {
        keepSource(patch, 'form')
        if (patch.scriptCode && patch.direction && patch.direction !== expectedDirection(patch.scriptCode)) {
          throw badRequest(`script ${String(patch.scriptCode)} must be written ${expectedDirection(patch.scriptCode)}`)
        }
        return patch
      },
    },
    unilex_senses: {
      beforeCreate: (row) => {
        requireSource(row, 'sense')
        if (!row.termRef) throw badRequest('UNILEX sense needs a term')
        if (row.supersedesRef && (!nonEmpty(row.reviewer) || !nonEmpty(row.reviewerNote))) {
          throw badRequest('a revised sense needs reviewer and reviewerNote')
        }
        return row
      },
      beforeUpdate: (patch) => {
        keepSource(patch, 'sense')
        if (patch.editorialStatus === 'DEPRECATED') {
          if (!nonEmpty(patch.reviewer) || !nonEmpty(patch.reviewerNote)) {
            throw badRequest('deprecating a sense needs reviewer and reviewerNote in the same update')
          }
          if (!patch.deprecatedAt) patch.deprecatedAt = new Date().toISOString()
        }
        return patch
      },
    },
    unilex_relations: {
      beforeCreate: (row) => {
        if (!row.sourceTermRef || !row.targetTermRef) throw badRequest('UNILEX relation needs two terms')
        if (row.sourceTermRef === row.targetTermRef) throw badRequest('a UNILEX relation needs two different terms')
        assertReviewedIdentity(row)
        return row
      },
      beforeUpdate: (patch) => {
        if (patch.status === 'APPROVED') {
          for (const key of ['reviewer', 'reason', 'evidenceRef'] as const) {
            if (!nonEmpty(patch[key])) {
              throw badRequest(`approving a relation needs ${key} in the same update`)
            }
          }
        }
        return patch
      },
    },
  },

  endpoints: {
    /**
     * The Terms Table is only a projection: every row here comes from the
     * term/sense/form/source tables above. No vocabulary is duplicated.
     */
    terms: {
      method: 'GET',
      path: '/unilex/terms',
      requires: 'public',
      menu: { group: 'UNILEX', icon: 'RV', order: 80 },
      handler: async ({ query, orm, status }) => {
        const q = asText(query.q)
        if (q.length > 80) {
          status(400)
          return { state: 'invalid', message: 'q is longer than 80 characters' }
        }
        const lane = asText(query.lane)
        const scope = asText(query.scope)
        const editorialStatus = asText(query.status)
        const sourceCode = asText(query.source)
        if (lane && !LANES.includes(lane as (typeof LANES)[number])) {
          status(400)
          return { state: 'invalid', message: `unknown lane "${lane}"` }
        }
        if (scope && !SCOPES.includes(scope as (typeof SCOPES)[number])) {
          status(400)
          return { state: 'invalid', message: `unknown scope "${scope}"` }
        }
        if (editorialStatus && !EDITORIAL_STATUSES.includes(editorialStatus as (typeof EDITORIAL_STATUSES)[number])) {
          status(400)
          return { state: 'invalid', message: `unknown editorial status "${editorialStatus}"` }
        }

        const [sources, terms, senses, forms, relations] = await Promise.all([
          listAll(orm, 'unilex_sources'),
          listAll(orm, 'unilex_terms'),
          listAll(orm, 'unilex_senses'),
          listAll(orm, 'unilex_forms'),
          listAll(orm, 'unilex_relations'),
        ])
        const approved = approvedSourceIds(sources)
        const sourceByCode = new Map(sources.map((source) => [String(source.code), source]))
        if (sourceCode) {
          const chosen = sourceByCode.get(sourceCode)
          if (!chosen) {
            status(400)
            return { state: 'invalid', message: `unknown source "${sourceCode}"` }
          }
          if (!approved.has(String(chosen.id))) {
            status(400)
            return {
              state: 'invalid',
              message: `source "${sourceCode}" is not approved for citation (status: ${String(chosen.reviewStatus)})`,
            }
          }
        }
        const chosenSourceId = sourceCode ? String(sourceByCode.get(sourceCode)?.id) : null

        const byTerm = <T extends Row>(rows: T[]): Map<string, T[]> => {
          const grouped = new Map<string, T[]>()
          for (const row of rows) {
            const key = String(row.termRef)
            const bucket = grouped.get(key)
            if (bucket) bucket.push(row)
            else grouped.set(key, [row])
          }
          return grouped
        }
        const sensesByTerm = byTerm(senses)
        const formsByTerm = byTerm(forms)
        const termsById = new Map(terms.map((term) => [String(term.id), term]))
        const relationsByTerm = new Map<string, Row[]>()
        for (const relation of relations) {
          for (const key of [String(relation.sourceTermRef), String(relation.targetTermRef)]) {
            const bucket = relationsByTerm.get(key)
            if (bucket) bucket.push(relation)
            else relationsByTerm.set(key, [relation])
          }
        }
        const sourceOf = (id: unknown): Row | null => {
          const source = id === null || id === undefined ? undefined : sources.find((row) => String(row.id) === String(id))
          return source ?? null
        }
        const sourceView = (source: Row) => ({
          code: nonEmpty(source.code),
          title: nonEmpty(source.title),
          sourceType: nonEmpty(source.sourceType),
          reviewStatus: nonEmpty(source.reviewStatus),
          provenanceSha: nonEmpty(source.provenanceSha),
        })

        const rows = terms
          .map((term) => {
            const termId = String(term.id)
            const termSenses = (sensesByTerm.get(termId) ?? []).filter(
              (sense) => !scope || sense.contextScope === scope,
            )
            if (termSenses.length === 0) return null
            const termForms = formsByTerm.get(termId) ?? []
            const termSources = new Map<string, Row>()
            for (const source of [
              sourceOf(term.sourceRef),
              ...termSenses.map((sense) => sourceOf(sense.sourceRef)),
              ...termForms.map((form) => sourceOf(form.sourceRef)),
            ]) {
              if (source) termSources.set(String(source.id), source)
            }
            const hasApprovedSource = [...termSources.keys()].some((id) => approved.has(id))
            if (!hasApprovedSource) return null
            if (chosenSourceId && !termSources.has(chosenSourceId)) return null
            if (lane && term.lane !== lane) return null
            if (editorialStatus && term.editorialStatus !== editorialStatus) return null

            if (q) {
              const haystack = [
                term.stableId,
                term.preferredEn,
                term.preferredId,
                term.definition,
                term.contextNote,
                ...termForms.flatMap((form) => [form.headword, form.transliteration, form.normalized]),
              ]
                .map((value) => String(value ?? '').toLowerCase())
                .join('\n')
              if (!haystack.includes(q.toLowerCase())) return null
            }

            const termRelations = (relationsByTerm.get(termId) ?? []).map((relation) => {
              const outgoing = String(relation.sourceTermRef) === termId
              const other = termsById.get(String(outgoing ? relation.targetTermRef : relation.sourceTermRef))
              return {
                relationType: relation.relationType,
                status: relation.status,
                assertedBy: relation.assertedBy,
                reviewer: relation.reviewer,
                reason: relation.reason,
                evidenceRef: relation.evidenceRef,
                direction: outgoing ? 'outgoing' : 'incoming',
                targetStableId: other?.stableId ?? null,
                targetLabel: other?.preferredEn ?? null,
              }
            })

            return {
              stableId: term.stableId,
              lane: term.lane,
              kind: term.kind,
              preferredEn: term.preferredEn,
              preferredId: term.preferredId,
              definition: term.definition,
              contextNote: term.contextNote,
              editorialStatus: term.editorialStatus,
              registryVersion: term.registryVersion,
              deprecated: term.editorialStatus === 'DEPRECATED',
              senses: termSenses.map((sense) => ({
                key: sense.senseKey,
                scope: sense.contextScope,
                definition: sense.definition,
                editorialStatus: sense.editorialStatus,
                sourceCode: nonEmpty(sourceOf(sense.sourceRef)?.code),
                reviewerNote: sense.reviewerNote,
                deprecatedAt: sense.deprecatedAt,
              })),
              forms: termForms.map((form) => ({
                languageCode: form.languageCode,
                scriptCode: form.scriptCode,
                direction: form.direction,
                headword: form.headword,
                transliteration: form.transliteration,
              })),
              sources: [...termSources.values()].map(sourceView),
              relations: termRelations,
            }
          })
          .filter((row): row is NonNullable<typeof row> => row !== null)
          .sort((a, b) => String(a.stableId).localeCompare(String(b.stableId)))

        const offset = Math.max(0, asInt(query.offset) ?? 0)
        const limit = Math.min(100, Math.max(1, asInt(query.limit) ?? 50))
        const approvedSources = sources
          .filter((source) => approved.has(String(source.id)))
          .map((source) => ({ code: source.code, title: source.title, sourceType: source.sourceType }))

        return {
          state: 'ok',
          registry: registryMeta(),
          filters: { q, lane, scope, status: editorialStatus, source: sourceCode },
          options: {
            lanes: LANES,
            scopes: SCOPES,
            statuses: EDITORIAL_STATUSES,
            sources: approvedSources,
          },
          total: rows.length,
          offset,
          limit,
          terms: rows.slice(offset, offset + limit),
        }
      },
    },

    /** One term with its forms, senses (including history) and reviewed relations. */
    term: {
      method: 'GET',
      path: '/unilex/term',
      requires: 'public',
      handler: async ({ query, orm, status }) => {
        const stableId = asText(query.stableId).toUpperCase()
        if (!stableId) {
          status(400)
          return { state: 'invalid', message: 'stableId is required' }
        }
        if (stableIdError(stableId)) {
          status(400)
          return { state: 'invalid', message: stableIdError(stableId) }
        }

        const [terms, sources, forms, senses, relations, matchReviews, reviewLog] = await Promise.all([
          listAll(orm, 'unilex_terms'),
          listAll(orm, 'unilex_sources'),
          listAll(orm, 'unilex_forms'),
          listAll(orm, 'unilex_senses'),
          listAll(orm, 'unilex_relations'),
          listAll(orm, 'unilex_match_reviews'),
          listAll(orm, 'unilex_review_log'),
        ])
        const term = terms.find((row) => row.stableId === stableId)
        if (!term) throw notFound(`UNILEX term "${stableId}" not found`)
        const termId = String(term.id)
        const termsById = new Map(terms.map((row) => [String(row.id), row]))
        const sourceById = new Map(sources.map((row) => [String(row.id), row]))
        const sourceView = (id: unknown) => {
          const source = sourceById.get(String(id))
          return source
            ? {
                code: source.code,
                title: source.title,
                sourceType: source.sourceType,
                citation: source.citation,
                sourceUri: source.sourceUri,
                provenanceSha: source.provenanceSha,
                reviewStatus: source.reviewStatus,
                approvalNote: source.approvalNote,
              }
            : null
        }

        const termForms = forms.filter((row) => String(row.termRef) === termId)
        const termSenses = senses.filter((row) => String(row.termRef) === termId)
        const senseByKey = new Map(termSenses.map((row) => [String(row.id), row]))
        const supersededBy = new Map<string, Row>()
        for (const sense of termSenses) {
          if (sense.supersedesRef) supersededBy.set(String(sense.supersedesRef), sense)
        }
        const successor = term.supersededByRef ? termsById.get(String(term.supersededByRef)) : null

        const termRelations = relations
          .filter(
            (row) => String(row.sourceTermRef) === termId || String(row.targetTermRef) === termId,
          )
          .map((row) => {
            const outgoing = String(row.sourceTermRef) === termId
            const other = termsById.get(String(outgoing ? row.targetTermRef : row.sourceTermRef))
            return {
              relationType: row.relationType,
              status: row.status,
              assertedBy: row.assertedBy,
              reviewer: row.reviewer,
              reason: row.reason,
              evidenceRef: row.evidenceRef,
              direction: outgoing ? 'outgoing' : 'incoming',
              targetStableId: other?.stableId ?? null,
              targetLabel: other?.preferredEn ?? null,
            }
          })
          .sort((a, b) => String(a.targetStableId).localeCompare(String(b.targetStableId)))

        const identityReviews = matchReviews
          .filter(
            (row) => String(row.leftTermRef) === termId || String(row.rightTermRef) === termId,
          )
          .map((row) => {
            const left = termsById.get(String(row.leftTermRef))
            const right = termsById.get(String(row.rightTermRef))
            return {
              pairCode: row.pairCode,
              leftStableId: left?.stableId ?? null,
              rightStableId: right?.stableId ?? null,
              leftForm: row.leftForm,
              rightForm: row.rightForm,
              classification: row.classification,
              similarity: row.similarity,
              decision: row.decision,
              reviewer: row.reviewer,
              reason: row.reason,
              evidenceRef: row.evidenceRef,
            }
          })

        const log = reviewLog
          .filter((row) => String(row.targetRef ?? '').includes(stableId))
          .map((row) => ({
            targetType: row.targetType,
            targetRef: row.targetRef,
            action: row.action,
            reason: row.reason,
            reviewer: row.reviewer,
            evidenceRef: row.evidenceRef,
            decidedAt: row.decidedAt,
          }))

        const sourcesUsed = new Map<string, Row>()
        for (const source of [
          sourceById.get(String(term.sourceRef)),
          ...termSenses.map((sense) => sourceById.get(String(sense.sourceRef))),
          ...termForms.map((form) => sourceById.get(String(form.sourceRef))),
        ]) {
          if (source) sourcesUsed.set(String(source.id), source)
        }

        return {
          state: 'ok',
          registry: registryMeta(),
          term: {
            stableId: term.stableId,
            lane: term.lane,
            kind: term.kind,
            preferredEn: term.preferredEn,
            preferredId: term.preferredId,
            definition: term.definition,
            contextNote: term.contextNote,
            editorialStatus: term.editorialStatus,
            registryVersion: term.registryVersion,
            deprecationReason: term.deprecationReason,
            supersededBy: successor
              ? { stableId: successor.stableId, preferredEn: successor.preferredEn }
              : null,
          },
          forms: termForms.map((form) => ({
            formCode: form.formCode,
            languageCode: form.languageCode,
            scriptCode: form.scriptCode,
            direction: form.direction,
            headword: form.headword,
            transliteration: form.transliteration,
            normalized: form.normalized,
            sourceCode: nonEmpty(sourceById.get(String(form.sourceRef))?.code),
          })),
          senses: termSenses
            .map((sense) => ({
              key: sense.senseKey,
              scope: sense.contextScope,
              definition: sense.definition,
              editorialStatus: sense.editorialStatus,
              sourceCode: nonEmpty(sourceById.get(String(sense.sourceRef))?.code),
              reviewer: sense.reviewer,
              reviewerNote: sense.reviewerNote,
              deprecatedAt: sense.deprecatedAt,
              supersedes: sense.supersedesRef
                ? (senseByKey.get(String(sense.supersedesRef))?.senseKey ?? null)
                : null,
              supersededBy: supersededBy.get(String(sense.id))?.senseKey ?? null,
              current: sense.editorialStatus !== 'DEPRECATED',
            }))
            .sort((a, b) => String(a.key).localeCompare(String(b.key))),
          sources: [...sourcesUsed.values()].map((source) => sourceView(source.id)),
          relations: termRelations,
          identityReviews,
          reviewLog: log,
        }
      },
    },

    /** Surface preview only: never creates a relation and never claims identity. */
    matchesPreview: {
      method: 'GET',
      path: '/unilex/matches/preview',
      requires: 'public',
      handler: async ({ query, status }) => {
        const left = asText(query.left)
        const right = asText(query.right)
        if (!left || !right) {
          status(400)
          return { state: 'invalid', message: 'left and right are required' }
        }
        if (left.length > 160 || right.length > 160) {
          status(400)
          return { state: 'invalid', message: 'left and right must be 160 characters or fewer' }
        }
        const preview = classifyMatch(
          { text: left, language: asText(query.leftLang) || null },
          { text: right, language: asText(query.rightLang) || null },
        )
        return {
          state: 'preview',
          ...preview,
          notice:
            'This is a surface comparison. No relation is created; a reviewer must record an identity decision.',
        }
      },
    },

    /**
     * The only path that may create exactMatch/closeMatch. It always records a
     * reviewer, a reason and the evidence that justified the decision.
     */
    matchesReview: {
      method: 'POST',
      path: '/unilex/matches/review',
      requires: ADMIN_ONLY,
      body: {
        leftTerm: str({ maxLength: 8, minLength: 1 }),
        rightTerm: str({ maxLength: 8, minLength: 1 }),
        leftForm: str({ maxLength: 160, null: true }),
        rightForm: str({ maxLength: 160, null: true }),
        decision: sel(MATCH_DECISIONS),
        reviewer: str({ maxLength: 80, minLength: 1 }),
        reason: text(),
        evidenceRef: str({ maxLength: 240, null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const leftId = asText(body.leftTerm).toUpperCase()
        const rightId = asText(body.rightTerm).toUpperCase()
        const decision = asText(body.decision) as (typeof MATCH_DECISIONS)[number]
        const reviewer = asText(body.reviewer)
        const reason = asText(body.reason)
        const evidenceRef = asText(body.evidenceRef) || null
        if (leftId === rightId) {
          status(400)
          return { state: 'invalid', message: 'a match review needs two different terms' }
        }
        if (!reason) {
          status(400)
          return { state: 'invalid', message: 'reason is required' }
        }
        if (decision === 'PENDING') {
          status(400)
          return { state: 'invalid', message: 'decision must be APPROVED_EXACT, APPROVED_CLOSE or REJECTED' }
        }
        if (decision !== 'REJECTED' && !evidenceRef) {
          status(400)
          return { state: 'invalid', message: `${decision} needs an evidenceRef` }
        }

        const terms = await listAll(orm, 'unilex_terms')
        const left = terms.find((row) => row.stableId === leftId)
        const right = terms.find((row) => row.stableId === rightId)
        if (!left) throw notFound(`UNILEX term "${leftId}" not found`)
        if (!right) throw notFound(`UNILEX term "${rightId}" not found`)

        const leftForm = asText(body.leftForm) || String(left.preferredEn)
        const rightForm = asText(body.rightForm) || String(right.preferredEn)
        const preview = classifyMatch({ text: leftForm }, { text: rightForm })
        if (decision === 'APPROVED_EXACT' && preview.classification !== 'EXACT') {
          status(400)
          return {
            state: 'invalid',
            message: `APPROVED_EXACT needs an EXACT surface comparison (got ${preview.classification})`,
          }
        }

        const relations = repo(orm, 'unilex_relations')
        if (decision === 'APPROVED_EXACT') {
          const allRelations = (await relations.list({ limit: 5000 })) as Row[]
          const contradicted = allRelations.some(
            (row) =>
              row.status === 'APPROVED' &&
              row.relationType === 'distinctFrom' &&
              ((String(row.sourceTermRef) === String(left.id) && String(row.targetTermRef) === String(right.id)) ||
                (String(row.sourceTermRef) === String(right.id) && String(row.targetTermRef) === String(left.id))),
          )
          if (contradicted) {
            status(400)
            return {
              state: 'invalid',
              message:
                'an APPROVED distinctFrom relation already separates these terms; revoke that decision before asserting identity',
            }
          }
        }

        const pairCode = [leftId, rightId].sort().join(':')
        const reviewRow = {
          pairCode,
          leftTermRef: String(left.id),
          rightTermRef: String(right.id),
          leftForm,
          rightForm,
          classification: preview.classification,
          similarity: Math.round(preview.similarity * 100),
          decision,
          reviewer,
          reason,
          evidenceRef,
        }
        const reviews = repo(orm, 'unilex_match_reviews')
        const existingReview = (await reviews.list({ where: { pairCode }, limit: 1 }))[0]
        const savedReview = existingReview
          ? await reviews.update(String(existingReview.id), reviewRow)
          : await reviews.create(reviewRow)

        let savedRelation: Row | null = null
        if (decision === 'APPROVED_EXACT' || decision === 'APPROVED_CLOSE') {
          const relationType = decision === 'APPROVED_EXACT' ? 'exactMatch' : 'closeMatch'
          const relationRow = {
            sourceTermRef: String(left.id),
            targetTermRef: String(right.id),
            relationType,
            status: 'APPROVED',
            assertedBy: 'REVIEWER',
            reviewer,
            reason,
            evidenceRef,
          }
          const existingRelation = (
            await relations.list({
              where: {
                sourceTermRef: String(left.id),
                targetTermRef: String(right.id),
                relationType,
              },
              limit: 1,
            })
          )[0]
          savedRelation = existingRelation
            ? await relations.update(String(existingRelation.id), relationRow)
            : await relations.create(relationRow)
        } else {
          const existing = (
            await relations.list({
              where: {
                sourceTermRef: String(left.id),
                targetTermRef: String(right.id),
                relationType: { in: ['exactMatch', 'closeMatch'] },
              },
              limit: 10,
            })
          )[0]
          if (existing) {
            savedRelation = await relations.update(String(existing.id), {
              status: 'REJECTED',
              reviewer,
              reason,
              evidenceRef,
            })
          }
        }

        const log = repo(orm, 'unilex_review_log')
        const logRow = {
          targetType: 'TERM',
          targetRef: pairCode,
          action: decision === 'REJECTED' ? 'REJECT_IDENTITY' : 'APPROVE',
          reason,
          reviewer,
          evidenceRef,
          decidedAt: new Date().toISOString(),
        }
        const existingLog = (
          await log.list({
            where: { targetType: 'TERM', targetRef: pairCode, action: logRow.action, reviewer },
            limit: 1,
          })
        )[0]
        if (existingLog) await log.update(String(existingLog.id), logRow)
        else await log.create(logRow)

        status(201)
        return {
          state: 'recorded',
          review: savedReview,
          relation: savedRelation,
          preview,
          notice: 'A reviewer decision is now on record; the lexical preview alone never asserts identity.',
        }
      },
    },
  },
})

export default unilex
export { classifyMatch, normalizeHeadword } from './match.js'
export type { MatchClass, MatchPreview } from './match.js'
export { UNILEX_SEED } from './data/registry.js'
