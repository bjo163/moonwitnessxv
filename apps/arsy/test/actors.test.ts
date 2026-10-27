import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import ontology from '@moonwitness/moonql-ontology'
import actors from '@moonwitness/moonql-actors'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M11 — Figure Registry, sourced events and the Prophetic Mission Table.
 *
 * These tests keep the table honest: every claim carries an approved source,
 * the mission table is a filtered view over figures (not a second prophet
 * database), competing readings stay side by side, chronology confidence is
 * never a verification claim, shared names never merge referents, no ranking
 * field exists, and an avatar is a disclosed teaching metaphor — never the
 * prophet and never religious authority.
 */

const quiet = { info: () => {}, warn: () => {} }

type Mq = Awaited<ReturnType<typeof bootMoonQl>>
const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data

interface SourceRef {
  code: string | null
  citation: string | null
  reviewStatus: string | null
}

interface TraditionView {
  code: string
  label: string
  scope: string
  description: string
}

interface MissionRow {
  missionCode: string
  figureCode: string
  labelEn: string
  labelId: string
  tradition: TraditionView | null
  title: string
  problemAddressed: string
  community: string
  historicalSetting: string
  passageRef: string
  interpretationNote: string | null
  epistemicStatus: string
  statusLabel: string
  roles: string[]
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
  source: SourceRef | null
}

interface MissionTable {
  state: string
  authority: { viewOf: string; canonicalTables: string[]; readOnly: boolean; notice: string }
  view: { name: string; derivedFrom: string; separateFigureTable: boolean; notice: string }
  meta: {
    version: string
    status: string
    notice: string
    pins: { vision: { ref: string; sha256: string }; quranEdition: { code: string; sha256: string } }
  }
  counts: {
    figures: number
    missions: number
    traditions: number
    roles: number
    events: number
    avatars: number
    readings: number
    competingFigures: number
    returned: number
  }
  options: {
    traditions: Array<TraditionView | null>
    figures: Array<{ code: string; label: string }>
    confidences: string[]
  }
  filters: { tradition: string | null; figure: string | null; confidence: string | null; q: string | null }
  total: number
  rows: MissionRow[]
  noExclusive: { singleMissionField: boolean; rankField: boolean; notice: string }
  readingsNotice: string
  identityNotice: string
}

interface FigureSummary {
  figureCode: string
  labelEn: string
  labelId: string
  figureKind: string
  attestation: string
  status: string
  summary: string
  source: SourceRef | null
  roles: Array<{ roleCode: string; role: string; tradition: TraditionView | null; passageRef: string; epistemicStatus: string }>
  missionCount: number
  readings: number
  eventCount: number
  avatarCount: number
}

interface FigureRegistry {
  state: string
  authority: { viewOf: string; canonicalTables: string[]; readOnly: boolean }
  counts: {
    figures: number
    missions: number
    traditions: number
    roles: number
    events: number
    avatars: number
    readings: number
    competingFigures: number
  }
  figures: FigureSummary[]
  identityNotice: string
  noExclusive: { singleMissionField: boolean; rankField: boolean; notice: string }
  readingsNotice: string
}

interface FigureDetail {
  state: string
  figure: FigureSummary
  roles: Array<{
    roleCode: string
    role: string
    tradition: TraditionView | null
    passageRef: string
    epistemicStatus: string
    statusLabel: string
    source: SourceRef | null
  }>
  readings: Array<{
    tradition: TraditionView | null
    missions: MissionRow[]
    sourceCodes: string[]
  }>
  competingReadings: boolean
  mergedDoctrine: boolean
  events: Array<{
    eventCode: string
    title: string
    eventType: string
    location: { locationCode: string; name: string; region: string | null; accuracy: string; notes: string } | null
    chronologyLabel: string
    chronologyConfidence: string
    tradition: TraditionView | null
    passageRef: string | null
    description: string
    source: SourceRef | null
  }>
  avatars: Array<{
    avatarCode: string
    avatarName: string
    pedagogicalUse: string
    disclosure: string
    authorityStatus: string
    status: string
  }>
  chronology: { notice: string; labels: string[] }
  counts: { roles: number; missions: number; readings: number; events: number; avatars: number }
  sources: SourceRef[]
  policy: AvatarPolicy
  identityNotice: string
  readingsNotice: string
  noExclusive: { singleMissionField: boolean; rankField: boolean; notice: string }
  roleNotice: string
}

interface AvatarPolicy {
  proposal: string
  modelStatus: string
  namesRecovered: boolean
  seededNames: number
  sourceNote: string
  disclosureTemplate: string
  rules: string[]
  notice: string
}

interface Policy {
  state: string
  avatars: AvatarPolicy
  missionTable: { notice: string; noExclusive: string; rankField: boolean }
  readingsNotice: string
  identityNotice: string
}

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, ontology, actors],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()
  return { app, moonql }
}

async function getJson<T>(app: FastifyInstance, url: string): Promise<T> {
  const res = await app.inject().get(url).end()
  assert.equal(res.statusCode, 200, res.body)
  return dataOf<T>(res)
}

const missions = (app: FastifyInstance, query = ''): Promise<MissionTable> =>
  getJson<MissionTable>(app, `/orm/actors/missions${query}`)
const registry = (app: FastifyInstance): Promise<FigureRegistry> => getJson<FigureRegistry>(app, '/orm/actors/figures')
const figure = (app: FastifyInstance, code: string): Promise<FigureDetail> =>
  getJson<FigureDetail>(app, `/orm/actors/figure?code=${code}`)
const policy = (app: FastifyInstance): Promise<Policy> => getJson<Policy>(app, '/orm/actors/policy')

async function idOf(moonql: Mq, model: string, where: Record<string, unknown>): Promise<string> {
  const rows = await moonql.model(model).list({ where })
  const row = rows[0]
  if (!row) throw new Error(`${model} row not found for ${JSON.stringify(where)}`)
  return String(row.id)
}

const PASSAGE_RE = /^(qs:[0-9]{1,3}:[0-9]{1,3}|ot:[a-z0-9]{2,4}:[0-9]{1,3}:[0-9]{1,3}|nt:[a-z0-9]{2,4}:[0-9]{1,3}:[0-9]{1,3})$/

test('M11-01/03: seeded claims stay sourced and chronology keeps its confidence', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const table = await missions(app)
  assert.equal(table.state, 'ok')
  assert.equal(table.meta.status, 'SOURCED_SAMPLE')
  assert.equal(table.meta.pins.vision.sha256, '7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb')
  assert.equal(table.meta.pins.quranEdition.code, 'quran-cairo-hafs')
  assert.equal(table.counts.figures, 5)
  assert.equal(table.counts.missions, 6)
  assert.equal(table.counts.roles, 7)
  assert.equal(table.counts.events, 5)
  assert.equal(table.counts.avatars, 0)
  assert.equal(table.total, 6)

  for (const row of table.rows) {
    assert.match(row.passageRef, PASSAGE_RE, `${row.missionCode} needs a passage reference`)
    assert.equal(row.source?.reviewStatus, 'APPROVED_FOR_CITATION', `${row.missionCode} needs an approved source`)
    assert.equal('rank' in row, false, 'a mission row must not carry a rank')
    assert.equal('exclusiveMission' in row, false, 'a mission row must not carry an exclusive mission field')
    if (row.tradition?.scope === 'SCRIPTURE') {
      assert.equal(row.source?.code, 'quran-cairo-hafs')
    }
  }

  const registryView = await registry(app)
  assert.equal(registryView.state, 'ok')
  assert.equal(registryView.counts.figures, 5)
  assert.equal(registryView.counts.missions, 6)
  assert.equal(registryView.counts.readings, 6)
  assert.equal(registryView.counts.competingFigures, 1, 'only fg_005 carries two tradition-scoped readings')
  for (const row of registryView.figures) {
    assert.equal(row.figureKind, 'PROPHETIC_FIGURE')
    assert.equal(row.attestation, 'SOURCE_REPORTED')
    assert.equal(row.source?.reviewStatus, 'APPROVED_FOR_CITATION')
    assert.ok(row.roles.length > 0, `${row.figureCode} needs at least one scoped role`)
  }

  const musa = await figure(app, 'fg_003')
  assert.equal(musa.figure.labelEn, 'Musa')
  assert.equal(musa.roles[0]?.role, 'MESSENGER')
  assert.equal(musa.roles[0]?.passageRef, 'qs:20:47')
  const egypt = musa.events.find((row) => row.eventCode === 'ev_003')
  assert.ok(egypt)
  assert.equal(egypt.location?.accuracy, 'NAMED')
  assert.equal(egypt.location?.name, 'Egypt')
  assert.equal(egypt.chronologyConfidence, 'UNDATED')
  assert.equal(egypt.chronologyLabel, 'Not dated by the source')
  assert.match(musa.chronology.notice, /not a verification of the event/)
  assert.deepEqual(musa.chronology.labels, ['UNDATED', 'REPORTED_DATE', 'DISPUTED_DATE', 'ATTESTED_DATE'])

  const nuh = await figure(app, 'fg_001')
  const flood = nuh.events.find((row) => row.eventCode === 'ev_001')
  assert.ok(flood)
  assert.equal(flood.location?.accuracy, 'UNNAMED')
  assert.equal(flood.location?.name, 'Place not named by the source')
  assert.match(flood.location?.notes ?? '', /records the gap/)

  const unknownFigure = await app.inject().get('/orm/actors/figure?code=fg_999').end()
  assert.equal(unknownFigure.statusCode, 404)
  const malformed = await app.inject().get('/orm/actors/figure?code=PROPHET-1').end()
  assert.equal(malformed.statusCode, 400)
})

test('M11-04/05: the mission table is a view and competing readings stay separate', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const table = await missions(app)
  assert.equal(table.view.derivedFrom, 'actor_figures')
  assert.equal(table.view.separateFigureTable, false)
  assert.match(table.view.notice, /not a separate prophet database/)
  assert.equal(table.authority.viewOf, 'actor_figures')
  assert.equal(table.authority.readOnly, true)
  assert.ok(table.authority.canonicalTables.includes('actor_figures'))
  assert.equal(table.authority.canonicalTables.includes('actor_prophets'), false)
  assert.equal(table.noExclusive.singleMissionField, false)
  assert.equal(table.noExclusive.rankField, false)
  assert.match(table.noExclusive.notice, /no exclusive-mission field and no religious rank/)

  const projectOnly = await missions(app, '?tradition=project-reading')
  assert.equal(projectOnly.total, 1)
  assert.equal(projectOnly.rows[0]?.missionCode, 'ms_006')
  assert.equal(projectOnly.rows[0]?.tradition?.scope, 'PROJECT')
  assert.ok(projectOnly.rows[0]?.interpretationNote)
  assert.match(projectOnly.rows[0]?.interpretationNote ?? '', /editorial reading/)

  const muhammadRows = await missions(app, '?figure=fg_005')
  assert.equal(muhammadRows.total, 2)
  assert.deepEqual(
    muhammadRows.rows.map((row) => row.tradition?.code),
    ['islamic-scripture', 'project-reading'],
  )

  const searched = await missions(app, '?q=mercy')
  assert.equal(searched.state, 'ok')
  assert.ok(searched.total >= 1)

  const badTradition = await app.inject().get('/orm/actors/missions?tradition=invented').end()
  assert.equal(badTradition.statusCode, 400)
  const longQuery = await app.inject().get(`/orm/actors/missions?q=${'x'.repeat(121)}`).end()
  assert.equal(longQuery.statusCode, 400)

  const muhammad = await figure(app, 'fg_005')
  assert.equal(muhammad.competingReadings, true)
  assert.equal(muhammad.mergedDoctrine, false)
  assert.equal(muhammad.readings.length, 2)
  const scripture = muhammad.readings.find((reading) => reading.tradition?.code === 'islamic-scripture')
  const project = muhammad.readings.find((reading) => reading.tradition?.code === 'project-reading')
  assert.ok(scripture)
  assert.ok(project)
  assert.deepEqual(scripture.missions.map((row) => row.missionCode), ['ms_005'])
  assert.deepEqual(project.missions.map((row) => row.missionCode), ['ms_006'])
  assert.deepEqual(scripture.sourceCodes, ['quran-cairo-hafs'])
  assert.deepEqual(project.sourceCodes, ['xv-master-vision'])
  assert.match(muhammad.readingsNotice, /nothing is merged into one doctrine/)
  assert.match(muhammad.roleNotice, /no role is a ranking/)

  const policyView = await policy(app)
  assert.equal(policyView.state, 'ok')
  assert.equal(policyView.missionTable.rankField, false)
  assert.match(policyView.identityNotice, /shared name never merges/)
})

test('M11-02/06: collisions, missing evidence and ranking writes are refused', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')
  const quranId = await idOf(moonql, 'onto_sources', { code: 'quran-cairo-hafs' })
  const scriptureId = await idOf(moonql, 'actor_traditions', { code: 'islamic-scripture' })

  const baseFigure = {
    labelEn: 'Musa',
    labelId: 'Musa',
    figureKind: 'PROPHETIC_FIGURE',
    attestation: 'SOURCE_REPORTED',
    summary: 'A test-only collision fixture; it must never merge with the seeded Musa.',
    sourceRef: quranId,
  }
  const first = await app
    .inject()
    .post('/orm/actor_figures')
    .headers(headers)
    .body({ figureCode: 'fg_900', ...baseFigure })
    .end()
  assert.equal(first.statusCode, 201, first.body)
  const second = await app
    .inject()
    .post('/orm/actor_figures')
    .headers(headers)
    .body({ figureCode: 'fg_901', ...baseFigure })
    .end()
  assert.equal(second.statusCode, 201, second.body)

  const afterFigures = await registry(app)
  const collisions = afterFigures.figures.filter((row) => row.labelEn === 'Musa')
  assert.equal(collisions.length, 3, 'the seeded Musa and both fixtures keep separate referents')
  assert.deepEqual(
    collisions.map((row) => row.figureCode),
    ['fg_003', 'fg_900', 'fg_901'],
  )
  assert.equal(afterFigures.counts.figures, 7)
  assert.match(afterFigures.identityNotice, /shared name never merges/)

  const fg900 = await idOf(moonql, 'actor_figures', { figureCode: 'fg_900' })
  const fg901 = await idOf(moonql, 'actor_figures', { figureCode: 'fg_901' })
  const role = {
    role: 'PROPHET',
    passageRef: 'qs:71:1',
    sourceRef: quranId,
    epistemicStatus: 'ASSERTED',
  }
  for (const [roleCode, figureRef] of [
    ['rl_900', fg900],
    ['rl_901', fg901],
  ] as const) {
    const created = await app
      .inject()
      .post('/orm/actor_roles')
      .headers(headers)
      .body({ roleCode, figureRef, traditionRef: scriptureId, ...role })
      .end()
    assert.equal(created.statusCode, 201, created.body)
  }
  const afterRoles = await registry(app)
  assert.equal(afterRoles.figures.find((row) => row.figureCode === 'fg_900')?.roles.length, 1)
  assert.equal(afterRoles.figures.find((row) => row.figureCode === 'fg_901')?.roles.length, 1)
  assert.equal(afterRoles.figures.find((row) => row.figureCode === 'fg_003')?.roles.length, 1)

  const missionBase = {
    figureRef: fg900,
    traditionRef: scriptureId,
    problemAddressed: 'Test fixture problem.',
    community: 'Test fixture community',
    historicalSetting: 'Test fixture setting.',
    passageRef: 'qs:71:1',
    sourceRef: quranId,
  }
  const verifiedWithoutReview = await app
    .inject()
    .post('/orm/actor_missions')
    .headers(headers)
    .body({ missionCode: 'ms_900', title: 'Verified without evidence', epistemicStatus: 'VERIFIED', ...missionBase })
    .end()
  assert.equal(verifiedWithoutReview.statusCode, 400)
  assert.match(verifiedWithoutReview.json().error.message, /VERIFIED mission needs reviewer/)

  const missingSource = await app
    .inject()
    .post('/orm/actor_missions')
    .headers(headers)
    .body({ missionCode: 'ms_901', title: 'No source', epistemicStatus: 'ASSERTED', ...missionBase, sourceRef: null })
    .end()
  assert.equal(missingSource.statusCode, 400)

  const badPassage = await app
    .inject()
    .post('/orm/actor_missions')
    .headers(headers)
    .body({ missionCode: 'ms_902', title: 'Bad passage', epistemicStatus: 'ASSERTED', ...missionBase, passageRef: 'john:3:16' })
    .end()
  assert.equal(badPassage.statusCode, 400)

  const created = await app
    .inject()
    .post('/orm/actor_missions')
    .headers(headers)
    .body({ missionCode: 'ms_903', title: 'Second sourced mission', epistemicStatus: 'ASSERTED', ...missionBase })
    .end()
  assert.equal(created.statusCode, 201, created.body)
  const missionId = await idOf(moonql, 'actor_missions', { missionCode: 'ms_903' })

  const duplicate = await app
    .inject()
    .post('/orm/actor_missions')
    .headers(headers)
    .body({ missionCode: 'ms_904', title: 'Second sourced mission', epistemicStatus: 'ASSERTED', ...missionBase })
    .end()
  assert.equal(duplicate.statusCode, 409)

  const moveMission = await app
    .inject()
    .patch(`/orm/actor_missions/${missionId}`)
    .headers(headers)
    .body({ traditionRef: scriptureId })
    .end()
  assert.equal(moveMission.statusCode, 400)
  assert.match(moveMission.json().error.message, /cannot change tradition/)

  const renameCode = await app
    .inject()
    .patch(`/orm/actor_missions/${missionId}`)
    .headers(headers)
    .body({ missionCode: 'ms_905' })
    .end()
  assert.equal(renameCode.statusCode, 400)

  const verifyWithoutReview = await app
    .inject()
    .patch(`/orm/actor_missions/${missionId}`)
    .headers(headers)
    .body({ epistemicStatus: 'VERIFIED' })
    .end()
  assert.equal(verifyWithoutReview.statusCode, 400)

  const remove = await app.inject().delete(`/orm/actor_missions/${missionId}`).headers(headers).end()
  assert.equal(remove.statusCode, 400)
  assert.match(remove.json().error.message, /never deleted/)

  const scoped = await missions(app, '?figure=fg_900')
  assert.equal(scoped.total, 1)
  assert.equal(scoped.rows[0]?.missionCode, 'ms_903')
  assert.equal('rank' in scoped.rows[0]!, false)
})

test('M11-02/07: avatars are disclosed pedagogy, never prophets', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })
  const headers = await adminHeaders(app, '/orm')
  const visionId = await idOf(moonql, 'onto_sources', { code: 'xv-master-vision' })
  const fg001 = await idOf(moonql, 'actor_figures', { figureCode: 'fg_001' })
  const before = await registry(app)
  assert.equal(before.counts.avatars, 0, 'no avatar name is seeded from an unrecovered list')

  const policyView = await policy(app)
  assert.equal(policyView.avatars.proposal, '25 Prophetic Mission Avatars')
  assert.equal(policyView.avatars.modelStatus, 'PROPOSAL_ONLY_NOT_INTEGRATED')
  assert.equal(policyView.avatars.namesRecovered, false)
  assert.equal(policyView.avatars.seededNames, 0)
  assert.match(policyView.avatars.disclosureTemplate, /not the prophet/)
  assert.equal(policyView.avatars.rules.length, 5)
  assert.match(policyView.avatars.notice, /never religious authority/)

  const withoutDisclosure = await app
    .inject()
    .post('/orm/actor_avatars')
    .headers(headers)
    .body({
      avatarCode: 'av_900',
      avatarName: 'Nuh teaching companion',
      figureRef: fg001,
      pedagogicalUse: 'Classroom dialogue prompt.',
      disclosure: 'A friendly guide for children.',
      sourceRef: visionId,
      status: 'PROPOSAL',
    })
    .end()
  assert.equal(withoutDisclosure.statusCode, 400)
  assert.match(withoutDisclosure.json().error.message, /not the prophet/)

  const created = await app
    .inject()
    .post('/orm/actor_avatars')
    .headers(headers)
    .body({
      avatarCode: 'av_901',
      avatarName: 'Nuh teaching companion',
      figureRef: fg001,
      pedagogicalUse: 'Classroom dialogue prompt.',
      disclosure: 'This avatar is a pedagogical interface. It is not the prophet and not new revelation.',
      sourceRef: visionId,
      authorityStatus: 'PEDAGOGICAL_ONLY',
      status: 'PROPOSAL',
    })
    .end()
  assert.equal(created.statusCode, 201, created.body)
  const avatar = dataOf<{ avatarCode: string; authorityStatus: string; status: string; disclosure: string }>(created)
  assert.equal(avatar.authorityStatus, 'PEDAGOGICAL_ONLY')
  assert.equal(avatar.status, 'PROPOSAL')
  assert.match(avatar.disclosure, /not the prophet/)

  const after = await registry(app)
  assert.equal(after.counts.avatars, 1)
  assert.equal(after.counts.figures, 5, 'an avatar is not a figure')
  assert.equal(after.figures.find((row) => row.figureCode === 'fg_001')?.avatarCount, 1)
  const avatarId = await idOf(moonql, 'actor_avatars', { avatarCode: 'av_901' })

  const nuh = await figure(app, 'fg_001')
  assert.equal(nuh.avatars.length, 1)
  assert.equal(nuh.avatars[0]?.authorityStatus, 'PEDAGOGICAL_ONLY')
  assert.match(nuh.avatars[0]?.disclosure ?? '', /not the prophet/)
  assert.equal(nuh.figure.figureKind, 'PROPHETIC_FIGURE', 'the figure stays a figure, not an avatar')

  const removeNote = await app
    .inject()
    .patch(`/orm/actor_avatars/${avatarId}`)
    .headers(headers)
    .body({ disclosure: 'A friendly guide for children.' })
    .end()
  assert.equal(removeNote.statusCode, 400)

  const reviewWithoutEvidence = await app
    .inject()
    .patch(`/orm/actor_avatars/${avatarId}`)
    .headers(headers)
    .body({ status: 'REVIEWED' })
    .end()
  assert.equal(reviewWithoutEvidence.statusCode, 400)

  const remove = await app.inject().delete(`/orm/actor_avatars/${avatarId}`).headers(headers).end()
  assert.equal(remove.statusCode, 400)

  const anonymousWrite = await app
    .inject()
    .post('/orm/actor_figures')
    .body({
      figureCode: 'fg_950',
      labelEn: 'Anonymous figure',
      labelId: 'Anonim',
      figureKind: 'PROPHETIC_FIGURE',
      attestation: 'SOURCE_REPORTED',
      summary: 'This write must be refused before it reaches the registry.',
      sourceRef: visionId,
    })
    .end()
  assert.equal(anonymousWrite.statusCode, 401, 'figure writes need an admin identity')
})

test('M11: projections never write and anonymous reads stay read-only', async (t) => {
  const { app, moonql } = await makeApp()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const tables = [
    'actor_traditions',
    'actor_locations',
    'actor_figures',
    'actor_roles',
    'actor_missions',
    'actor_events',
    'actor_avatars',
  ] as const
  const counts = new Map<string, number>()
  for (const table of tables) counts.set(table, await moonql.model(table).count())

  await missions(app)
  await registry(app)
  await figure(app, 'fg_005')
  await policy(app)

  for (const table of tables) {
    assert.equal(await moonql.model(table).count(), counts.get(table), `${table}: GET must not write`)
  }
})
