import {
  ACTORS_META,
  AVATAR_POLICY,
  IDENTITY_NOTICE,
  MISSION_TABLE_NOTICE,
  NO_EXCLUSIVE_NOTICE,
  READINGS_NOTICE,
} from './seed.js'

/**
 * D04 projection layer. The Figure Registry owns figures; the Prophetic Mission
 * Table is a filtered view over the same tables, never a second registry.
 */

type Row = Record<string, unknown>

export type Orm = { model(name: string): { list(query?: Record<string, unknown>): Promise<Row[]> } }

const text = (value: unknown): string => (typeof value === 'string' ? value : value == null ? '' : String(value))
const nullable = (value: unknown): string | null => (value == null || value === '' ? null : text(value))

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

const AUTHORITY = {
  viewOf: 'actor_figures',
  canonicalTables: [
    'actor_figures',
    'actor_traditions',
    'actor_roles',
    'actor_missions',
    'actor_events',
    'actor_locations',
    'actor_avatars',
  ],
  readOnly: true,
  notice: MISSION_TABLE_NOTICE,
} as const

async function loadData(orm: Orm) {
  const [traditions, locations, figures, roles, missions, events, avatars, sources] = await Promise.all([
    orm.model('actor_traditions').list({ limit: 1000 }),
    orm.model('actor_locations').list({ limit: 1000 }),
    orm.model('actor_figures').list({ limit: 5000 }),
    orm.model('actor_roles').list({ limit: 5000 }),
    orm.model('actor_missions').list({ limit: 5000 }),
    orm.model('actor_events').list({ limit: 5000 }),
    orm.model('actor_avatars').list({ limit: 1000 }),
    orm.model('onto_sources').list({ limit: 500 }),
  ])

  const sourceById = new Map(sources.map((row) => [text(row.id), row]))
  const sourceFor = (ref: unknown) => sourceView(sourceById.get(text(ref)))
  const approved = (ref: unknown): boolean =>
    text(sourceById.get(text(ref))?.reviewStatus) === 'APPROVED_FOR_CITATION'

  const traditionById = new Map(traditions.filter((row) => approved(row.sourceRef)).map((row) => [text(row.id), row]))
  const figureById = new Map(figures.filter((row) => approved(row.sourceRef)).map((row) => [text(row.id), row]))
  const locationById = new Map(locations.filter((row) => approved(row.sourceRef)).map((row) => [text(row.id), row]))

  const keptRoles = roles.filter(
    (row) => approved(row.sourceRef) && figureById.has(text(row.figureRef)) && traditionById.has(text(row.traditionRef)),
  )
  const keptMissions = missions.filter(
    (row) => approved(row.sourceRef) && figureById.has(text(row.figureRef)) && traditionById.has(text(row.traditionRef)),
  )
  const keptEvents = events.filter(
    (row) => approved(row.sourceRef) && traditionById.has(text(row.traditionRef)),
  )
  const keptAvatars = avatars.filter((row) => approved(row.sourceRef))

  return {
    sourceFor,
    traditions: [...traditionById.values()],
    locations: [...locationById.values()],
    figures: [...figureById.values()],
    roles: keptRoles,
    missions: keptMissions,
    events: keptEvents,
    avatars: keptAvatars,
    traditionById,
    figureById,
    locationById,
  }
}

type Data = Awaited<ReturnType<typeof loadData>>

const traditionView = (tradition: Row | undefined) =>
  tradition
    ? {
        code: text(tradition.code),
        label: text(tradition.label),
        scope: text(tradition.scope),
        description: text(tradition.description),
      }
    : null

const locationView = (location: Row | undefined) =>
  location
    ? {
        locationCode: text(location.locationCode),
        name: text(location.name),
        region: nullable(location.region),
        accuracy: text(location.accuracy),
        notes: text(location.notes),
      }
    : null

const figureView = (figure: Row) => ({
  figureCode: text(figure.figureCode),
  labelEn: text(figure.labelEn),
  labelId: text(figure.labelId),
  figureKind: text(figure.figureKind),
  attestation: text(figure.attestation),
  status: text(figure.status),
  summary: text(figure.summary),
})

const roleView = (data: Data, role: Row) => ({
  roleCode: text(role.roleCode),
  role: text(role.role),
  tradition: traditionView(data.traditionById.get(text(role.traditionRef))),
  passageRef: text(role.passageRef),
  epistemicStatus: text(role.epistemicStatus),
  statusLabel: statusLabel(text(role.epistemicStatus)),
  reviewer: nullable(role.reviewer),
  reason: nullable(role.reason),
  evidenceRef: nullable(role.evidenceRef),
  source: data.sourceFor(role.sourceRef),
})

const missionView = (data: Data, mission: Row) => {
  const figure = data.figureById.get(text(mission.figureRef))
  const tradition = data.traditionById.get(text(mission.traditionRef))
  const roles = data.roles
    .filter(
      (role) =>
        text(role.figureRef) === text(mission.figureRef) && text(role.traditionRef) === text(mission.traditionRef),
    )
    .map((role) => text(role.role))
    .sort()
  return {
    missionCode: text(mission.missionCode),
    ...(figure ? figureView(figure) : {}),
    figureCode: figure ? text(figure.figureCode) : '',
    tradition: traditionView(tradition),
    title: text(mission.title),
    problemAddressed: text(mission.problemAddressed),
    community: text(mission.community),
    historicalSetting: text(mission.historicalSetting),
    passageRef: text(mission.passageRef),
    interpretationNote: nullable(mission.interpretationNote),
    epistemicStatus: text(mission.epistemicStatus),
    statusLabel: statusLabel(text(mission.epistemicStatus)),
    roles,
    reviewer: nullable(mission.reviewer),
    reason: nullable(mission.reason),
    evidenceRef: nullable(mission.evidenceRef),
    source: data.sourceFor(mission.sourceRef),
  }
}

const eventView = (data: Data, event: Row) => ({
  eventCode: text(event.eventCode),
  title: text(event.title),
  eventType: text(event.eventType),
  location: locationView(data.locationById.get(text(event.locationRef))),
  chronologyLabel: text(event.chronologyLabel),
  chronologyConfidence: text(event.chronologyConfidence),
  tradition: traditionView(data.traditionById.get(text(event.traditionRef))),
  passageRef: nullable(event.passageRef),
  description: text(event.description),
  source: data.sourceFor(event.sourceRef),
})

const avatarView = (data: Data, avatar: Row) => ({
  avatarCode: text(avatar.avatarCode),
  avatarName: text(avatar.avatarName),
  pedagogicalUse: text(avatar.pedagogicalUse),
  disclosure: text(avatar.disclosure),
  authorityStatus: text(avatar.authorityStatus),
  status: text(avatar.status),
  source: data.sourceFor(avatar.sourceRef),
})

const approvedSourcesOf = (data: Data, refs: unknown[]) => {
  const seen = new Set<string>()
  const views: Array<Record<string, unknown>> = []
  for (const ref of refs) {
    const view = data.sourceFor(ref)
    const code = String(view?.code ?? '')
    if (!view || !code || seen.has(code)) continue
    seen.add(code)
    views.push(view)
  }
  return views.sort((a, b) => String(a.code).localeCompare(String(b.code)))
}

export interface MissionFilters {
  tradition?: string
  figure?: string
  confidence?: string
  q?: string
  limit?: number
  offset?: number
}

export async function buildMissionTable(orm: Orm, filters: MissionFilters = {}) {
  const data = await loadData(orm)
  const rows = data.missions
    .map((mission) => missionView(data, mission))
    .sort(
      (a, b) =>
        a.figureCode.localeCompare(b.figureCode) ||
        String(a.tradition?.code ?? '').localeCompare(String(b.tradition?.code ?? '')) ||
        a.missionCode.localeCompare(b.missionCode),
    )

  const query = (filters.q ?? '').trim().toLowerCase()
  const filtered = rows.filter((row) => {
    if (filters.tradition && row.tradition?.code !== filters.tradition) return false
    if (filters.figure && row.figureCode !== filters.figure) return false
    if (filters.confidence && row.epistemicStatus !== filters.confidence) return false
    if (!query) return true
    return [row.title, row.problemAddressed, row.community, row.historicalSetting, row.labelEn, row.labelId]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const offset = Math.max(0, filters.offset ?? 0)
  const limit = Math.min(100, Math.max(1, filters.limit ?? 50))
  const readings = new Set(rows.map((row) => `${row.figureCode}:${row.tradition?.code ?? ''}`))
  const traditionsPerFigure = new Map<string, Set<string>>()
  for (const row of rows) {
    const set = traditionsPerFigure.get(row.figureCode) ?? new Set<string>()
    set.add(String(row.tradition?.code ?? ''))
    traditionsPerFigure.set(row.figureCode, set)
  }

  return {
    state: 'ok',
    authority: AUTHORITY,
    view: {
      name: 'Prophetic Mission Table',
      derivedFrom: 'actor_figures',
      separateFigureTable: false,
      notice: MISSION_TABLE_NOTICE,
    },
    meta: ACTORS_META,
    counts: {
      figures: data.figures.length,
      missions: rows.length,
      traditions: data.traditions.length,
      roles: data.roles.length,
      events: data.events.length,
      avatars: data.avatars.length,
      readings: readings.size,
      competingFigures: [...traditionsPerFigure.values()].filter((set) => set.size > 1).length,
      returned: Math.max(0, Math.min(limit, filtered.length - offset)),
    },
    options: {
      traditions: data.traditions
        .map((tradition) => traditionView(tradition))
        .sort((a, b) => String(a?.code).localeCompare(String(b?.code))),
      figures: data.figures
        .map((figure) => ({ code: text(figure.figureCode), label: text(figure.labelEn) }))
        .sort((a, b) => a.code.localeCompare(b.code)),
      confidences: [...new Set(rows.map((row) => row.epistemicStatus))].sort(),
    },
    filters: {
      tradition: filters.tradition ?? null,
      figure: filters.figure ?? null,
      confidence: filters.confidence ?? null,
      q: filters.q ?? null,
      limit,
      offset,
    },
    total: filtered.length,
    rows: filtered.slice(offset, offset + limit),
    noExclusive: { singleMissionField: false, rankField: false, notice: NO_EXCLUSIVE_NOTICE },
    readingsNotice: READINGS_NOTICE,
    identityNotice: IDENTITY_NOTICE,
  }
}

export async function buildFigureRegistry(orm: Orm) {
  const data = await loadData(orm)
  const figures = data.figures
    .map((figure) => {
      const figureId = text(figure.id)
      const roles = data.roles
        .filter((role) => text(role.figureRef) === figureId)
        .map((role) => roleView(data, role))
        .sort((a, b) => String(a.tradition?.code).localeCompare(String(b.tradition?.code)) || a.roleCode.localeCompare(b.roleCode))
      const missions = data.missions.filter((mission) => text(mission.figureRef) === figureId)
      const traditions = new Set(missions.map((mission) => text(mission.traditionRef)))
      const events = data.events.filter((event) => text(event.figureRef) === figureId)
      const avatars = data.avatars.filter((avatar) => text(avatar.figureRef) === figureId)
      return {
        ...figureView(figure),
        source: data.sourceFor(figure.sourceRef),
        roles,
        missionCount: missions.length,
        readings: traditions.size,
        eventCount: events.length,
        avatarCount: avatars.length,
      }
    })
    .sort((a, b) => a.figureCode.localeCompare(b.figureCode))

  return {
    state: 'ok',
    authority: AUTHORITY,
    meta: ACTORS_META,
    counts: {
      figures: figures.length,
      missions: data.missions.length,
      traditions: data.traditions.length,
      roles: data.roles.length,
      events: data.events.length,
      avatars: data.avatars.length,
      readings: figures.reduce((total, figure) => total + figure.readings, 0),
      competingFigures: figures.filter((figure) => figure.readings > 1).length,
    },
    figures,
    identityNotice: IDENTITY_NOTICE,
    noExclusive: { singleMissionField: false, rankField: false, notice: NO_EXCLUSIVE_NOTICE },
    readingsNotice: READINGS_NOTICE,
  }
}

export async function buildFigureDetail(orm: Orm, figureCode: string) {
  const data = await loadData(orm)
  const figure = data.figures.find((row) => text(row.figureCode) === figureCode)
  if (!figure) return null
  const figureId = text(figure.id)

  const roles = data.roles
    .filter((role) => text(role.figureRef) === figureId)
    .map((role) => roleView(data, role))
    .sort((a, b) => String(a.tradition?.code).localeCompare(String(b.tradition?.code)) || a.roleCode.localeCompare(b.roleCode))

  const missions = data.missions.filter((mission) => text(mission.figureRef) === figureId)
  const grouped = new Map<string, Row[]>()
  for (const mission of missions) {
    const key = text(mission.traditionRef)
    const bucket = grouped.get(key)
    if (bucket) bucket.push(mission)
    else grouped.set(key, [mission])
  }
  const readings = [...grouped.entries()]
    .map(([traditionId, missionRows]) => ({
      tradition: traditionView(data.traditionById.get(traditionId)),
      missions: missionRows
        .map((mission) => missionView(data, mission))
        .sort((a, b) => a.missionCode.localeCompare(b.missionCode)),
      sourceCodes: [...new Set(missionRows.map((mission) => String(data.sourceFor(mission.sourceRef)?.code ?? '')))]
        .filter(Boolean)
        .sort(),
    }))
    .sort((a, b) => String(a.tradition?.code).localeCompare(String(b.tradition?.code)))

  const events = data.events
    .filter((event) => text(event.figureRef) === figureId)
    .map((event) => eventView(data, event))
    .sort((a, b) => a.eventCode.localeCompare(b.eventCode))

  const avatars = data.avatars
    .filter((avatar) => text(avatar.figureRef) === figureId)
    .map((avatar) => avatarView(data, avatar))
    .sort((a, b) => a.avatarCode.localeCompare(b.avatarCode))

  const sourceRefs = [
    figure.sourceRef,
    ...data.roles.filter((role) => text(role.figureRef) === figureId).map((role) => role.sourceRef),
    ...missions.map((mission) => mission.sourceRef),
    ...data.events.filter((event) => text(event.figureRef) === figureId).map((event) => event.sourceRef),
    ...data.avatars.filter((avatar) => text(avatar.figureRef) === figureId).map((avatar) => avatar.sourceRef),
  ]

  return {
    state: 'ok',
    figure: { ...figureView(figure), source: data.sourceFor(figure.sourceRef) },
    roles,
    readings,
    competingReadings: readings.length > 1,
    mergedDoctrine: false,
    events,
    avatars,
    chronology: {
      notice:
        'Chronology confidence describes the dating claim only; it is not a verification of the event. A source-attributed event can stay undated.',
      labels: ['UNDATED', 'REPORTED_DATE', 'DISPUTED_DATE', 'ATTESTED_DATE'],
    },
    counts: {
      roles: roles.length,
      missions: missions.length,
      readings: readings.length,
      events: events.length,
      avatars: avatars.length,
    },
    sources: approvedSourcesOf(data, sourceRefs),
    policy: AVATAR_POLICY,
    identityNotice: IDENTITY_NOTICE,
    readingsNotice: READINGS_NOTICE,
    noExclusive: { singleMissionField: false, rankField: false, notice: NO_EXCLUSIVE_NOTICE },
    roleNotice:
      'Roles are claims scoped to a tradition and a source. A project reading never replaces a source-attributed role, and no role is a ranking.',
  }
}

export function actorPolicy() {
  return {
    state: 'ok',
    meta: ACTORS_META,
    avatars: AVATAR_POLICY,
    missionTable: {
      notice: MISSION_TABLE_NOTICE,
      noExclusive: NO_EXCLUSIVE_NOTICE,
      rankField: false,
    },
    readingsNotice: READINGS_NOTICE,
    identityNotice: IDENTITY_NOTICE,
  }
}

export { statusLabel }
