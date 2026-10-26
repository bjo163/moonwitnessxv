import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import ontology from '@moonwitness/moonql-ontology'
import actors from '@moonwitness/moonql-actors'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M11: the figure registry, sourced missions and avatar policy against real
 * PostgreSQL. The SQL engine must keep every claim tied to an approved source,
 * keep competing readings side by side, keep chronology confidence separate
 * from verification, never merge a shared name, and never store a rank field.
 *
 * Runs only when a disposable database is handed in (CI has none):
 *   PARITY_DATABASE_URL=postgres://... pnpm --filter @moonwitness/arsy test
 */
const DB_URL = process.env.PARITY_DATABASE_URL ?? process.env.DATABASE_URL ?? ''
const quiet = { info: () => {}, warn: () => {} }

interface MissionTable {
  state: string
  authority: { viewOf: string; canonicalTables: string[]; readOnly: boolean }
  view: { derivedFrom: string; separateFigureTable: boolean }
  counts: { figures: number; missions: number; roles: number; events: number; avatars: number; competingFigures: number }
  total: number
  rows: Array<{
    missionCode: string
    figureCode: string
    tradition: { code: string; scope: string } | null
    passageRef: string
    source: { code: string | null; reviewStatus: string | null } | null
  }>
  noExclusive: { singleMissionField: boolean; rankField: boolean }
}

interface FigureRegistry {
  state: string
  counts: { figures: number; missions: number; avatars: number; competingFigures: number }
  figures: Array<{ figureCode: string; labelEn: string; missionCount: number; readings: number; avatarCount: number }>
}

interface FigureDetail {
  state: string
  figure: { figureCode: string }
  competingReadings: boolean
  mergedDoctrine: boolean
  readings: Array<{ tradition: { code: string } | null; missions: Array<{ missionCode: string }>; sourceCodes: string[] }>
  events: Array<{ eventCode: string; chronologyConfidence: string; location: { name: string; accuracy: string } | null }>
  avatars: Array<{ avatarCode: string; authorityStatus: string; disclosure: string }>
}

interface Policy {
  state: string
  avatars: { modelStatus: string; namesRecovered: boolean; seededNames: number; disclosureTemplate: string }
  missionTable: { rankField: boolean }
}

const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data
const PASSAGE_RE = /^(qs:[0-9]{1,3}:[0-9]{1,3}|ot:[a-z0-9]{2,4}:[0-9]{1,3}:[0-9]{1,3}|nt:[a-z0-9]{2,4}:[0-9]{1,3}:[0-9]{1,3})$/

const TEST_CODES = {
  figures: ['fg_900', 'fg_901'],
  roles: ['rl_900'],
  missions: ['ms_900'],
  avatars: ['av_900', 'av_901'],
}

test(
  'M11: figure registry, missions and avatar policy survive PostgreSQL',
  { skip: DB_URL ? false : 'no PARITY_DATABASE_URL/DATABASE_URL — the PG slice needs a server' },
  async (t) => {
    const moonql = await bootMoonQl({
      databaseUrl: DB_URL,
      addons: [base, auth, ontology, actors],
      env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
      seedPolicy: 'off',
      cronEnabled: false,
      log: quiet,
    })
    const app = Fastify({ logger: false })
    await app.register(envelope)
    await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
    await app.ready()

    const cleanup = async (): Promise<void> => {
      for (const avatarCode of TEST_CODES.avatars) {
        await moonql.model('actor_avatars').removeWhere({ avatarCode })
      }
      for (const missionCode of TEST_CODES.missions) {
        await moonql.model('actor_missions').removeWhere({ missionCode })
      }
      for (const roleCode of TEST_CODES.roles) {
        await moonql.model('actor_roles').removeWhere({ roleCode })
      }
      for (const figureCode of TEST_CODES.figures) {
        await moonql.model('actor_figures').removeWhere({ figureCode })
      }
    }

    await cleanup()
    t.after(async () => {
      await cleanup()
      await app.close()
      await moonql.close()
    })

    assert.equal(moonql.engine, 'pg', 'this drill must not silently fall back to memory')

    const [figures, missions, roles, events, avatars, traditions, locations] = await Promise.all([
      moonql.model('actor_figures').count(),
      moonql.model('actor_missions').count(),
      moonql.model('actor_roles').count(),
      moonql.model('actor_events').count(),
      moonql.model('actor_avatars').count(),
      moonql.model('actor_traditions').count(),
      moonql.model('actor_locations').count(),
    ])
    assert.equal(figures, 5)
    assert.equal(missions, 6)
    assert.equal(roles, 7)
    assert.equal(events, 5)
    assert.equal(avatars, 0)
    assert.equal(traditions, 3)
    assert.equal(locations, 2)

    const tableRes = await app.inject().get('/orm/actors/missions').end()
    assert.equal(tableRes.statusCode, 200, tableRes.body)
    const table = dataOf<MissionTable>(tableRes)
    assert.equal(table.state, 'ok')
    assert.equal(table.authority.viewOf, 'actor_figures')
    assert.equal(table.authority.readOnly, true)
    assert.equal(table.authority.canonicalTables.includes('actor_figures'), true)
    assert.equal(table.authority.canonicalTables.includes('actor_prophets'), false)
    assert.equal(table.view.derivedFrom, 'actor_figures')
    assert.equal(table.view.separateFigureTable, false)
    assert.equal(table.noExclusive.singleMissionField, false)
    assert.equal(table.noExclusive.rankField, false)
    assert.equal(table.counts.figures, 5)
    assert.equal(table.counts.missions, 6)
    assert.equal(table.counts.roles, 7)
    assert.equal(table.counts.events, 5)
    assert.equal(table.counts.avatars, 0)
    assert.equal(table.counts.competingFigures, 1)
    assert.equal(table.total, 6)
    for (const row of table.rows) {
      assert.match(row.passageRef, PASSAGE_RE)
      assert.equal(row.source?.reviewStatus, 'APPROVED_FOR_CITATION')
      assert.equal('rank' in row, false, 'a mission row must not carry a rank')
    }

    const projectRes = await app.inject().get('/orm/actors/missions?tradition=project-reading').end()
    assert.equal(projectRes.statusCode, 200)
    const project = dataOf<MissionTable>(projectRes)
    assert.equal(project.total, 1)
    assert.equal(project.rows[0]?.missionCode, 'ms_006')
    assert.equal(project.rows[0]?.tradition?.scope, 'PROJECT')

    const detailRes = await app.inject().get('/orm/actors/figure?code=fg_005').end()
    assert.equal(detailRes.statusCode, 200, detailRes.body)
    const detail = dataOf<FigureDetail>(detailRes)
    assert.equal(detail.competingReadings, true)
    assert.equal(detail.mergedDoctrine, false)
    assert.deepEqual(
      detail.readings.map((reading) => reading.tradition?.code),
      ['islamic-scripture', 'project-reading'],
    )
    assert.deepEqual(detail.readings.find((r) => r.tradition?.code === 'scripture' || r.tradition?.code === 'islamic-scripture')?.sourceCodes, ['quran-cairo-hafs'])
    assert.deepEqual(detail.readings.find((r) => r.tradition?.code === 'project-reading')?.sourceCodes, ['xv-master-vision'])
    assert.ok(detail.events.every((event) => event.chronologyConfidence === 'UNDATED'))
    assert.equal(detail.avatars.length, 0)

    const nuhRes = await app.inject().get('/orm/actors/figure?code=fg_001').end()
    assert.equal(nuhRes.statusCode, 200, nuhRes.body)
    const nuh = dataOf<FigureDetail>(nuhRes)
    const flood = nuh.events.find((event) => event.eventCode === 'ev_001')
    assert.equal(flood?.location?.accuracy, 'UNNAMED')
    assert.match(flood?.location?.name ?? '', /not named/i)
    assert.equal(flood?.chronologyConfidence, 'UNDATED')

    const policy = dataOf<Policy>(await app.inject().get('/orm/actors/policy').end())
    assert.equal(policy.avatars.modelStatus, 'PROPOSAL_ONLY_NOT_INTEGRATED')
    assert.equal(policy.avatars.namesRecovered, false)
    assert.equal(policy.avatars.seededNames, 0)
    assert.match(policy.avatars.disclosureTemplate, /not the prophet/)
    assert.equal(policy.missionTable.rankField, false)

    const anonymousRows = await app.inject().get('/orm/actor_figures').end()
    assert.equal(anonymousRows.statusCode, 200, 'the actor tables are public-read on pg')

    const headers = await adminHeaders(app, '/orm')
    const quranId = String((await moonql.model('onto_sources').list({ where: { code: 'quran-cairo-hafs' } }))[0]?.id)
    const scriptureId = String((await moonql.model('actor_traditions').list({ where: { code: 'islamic-scripture' } }))[0]?.id)
    const visionId = String((await moonql.model('actor_traditions').list({ where: { code: 'project-reading' } }))[0]?.id)
    assert.ok(quranId && scriptureId && visionId)

    const anonymousWrite = await app
      .inject()
      .post('/orm/actor_figures')
      .body({
        figureCode: 'fg_999',
        labelEn: 'Anonymous figure',
        labelId: 'Anonymous figure',
        figureKind: 'PROPHETIC_FIGURE',
        attestation: 'SOURCE_REPORTED',
        summary: 'Anonymous writes must never reach the canonical tables.',
        sourceRef: quranId,
      })
      .end()
    assert.equal(anonymousWrite.statusCode, 401, 'the actor tables are admin-write on pg')

    const baseFigure = {
      labelEn: 'Musa',
      labelId: 'Musa',
      figureKind: 'PROPHETIC_FIGURE',
      attestation: 'SOURCE_REPORTED',
      summary: 'A test-only collision fixture; it must never merge with the seeded Musa.',
      sourceRef: quranId,
    }
    for (const figureCode of TEST_CODES.figures) {
      const created = await app
        .inject()
        .post('/orm/actor_figures')
        .headers(headers)
        .body({ figureCode, ...baseFigure })
        .end()
      assert.equal(created.statusCode, 201, created.body)
    }
    const registry = dataOf<FigureRegistry>(await app.inject().get('/orm/actors/figures').end())
    assert.equal(registry.counts.figures, 7)
    const musaRows = registry.figures.filter((row) => row.labelEn === 'Musa')
    assert.deepEqual(
      musaRows.map((row) => row.figureCode),
      ['fg_003', 'fg_900', 'fg_901'],
      'a shared label survives as separate SQL rows',
    )

    const fg900 = String((await moonql.model('actor_figures').list({ where: { figureCode: 'fg_900' } }))[0]?.id)
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
    assert.equal(verifiedWithoutReview.statusCode, 400, 'a VERIFIED mission needs reviewer, reason and evidence')
    assert.match(verifiedWithoutReview.json().error.message, /VERIFIED mission needs reviewer/)

    const createdMission = await app
      .inject()
      .post('/orm/actor_missions')
      .headers(headers)
      .body({ missionCode: 'ms_900', title: 'Second sourced mission', epistemicStatus: 'ASSERTED', ...missionBase })
      .end()
    assert.equal(createdMission.statusCode, 201, createdMission.body)
    const storedMission = (await moonql.model('actor_missions').list({ where: { missionCode: 'ms_900' } }))[0]
    assert.ok(storedMission, 'the mission is a canonical SQL row')
    assert.equal(storedMission.epistemicStatus, 'ASSERTED')
    assert.equal(String(storedMission.sourceRef), quranId)
    assert.equal('rank' in storedMission, false, 'no ranking column exists')

    const missionId = String(storedMission.id)
    const moveTradition = await app
      .inject()
      .patch(`/orm/actor_missions/${missionId}`)
      .headers(headers)
      .body({ traditionRef: visionId })
      .end()
    assert.equal(moveTradition.statusCode, 400, 'a claim cannot silently move to another tradition')

    const deleted = await app.inject().delete(`/orm/actor_missions/${missionId}`).headers(headers).end()
    assert.equal(deleted.statusCode, 400, 'sourced claims are never deleted')

    const fg001 = String((await moonql.model('actor_figures').list({ where: { figureCode: 'fg_001' } }))[0]?.id)
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
        sourceRef: quranId,
        status: 'PROPOSAL',
      })
      .end()
    assert.equal(withoutDisclosure.statusCode, 400)
    assert.match(withoutDisclosure.json().error.message, /not the prophet/)

    const createdAvatar = await app
      .inject()
      .post('/orm/actor_avatars')
      .headers(headers)
      .body({
        avatarCode: 'av_901',
        avatarName: 'Nuh teaching companion',
        figureRef: fg001,
        pedagogicalUse: 'Classroom dialogue prompt.',
        disclosure: 'This avatar is a pedagogical interface. It is not the prophet and not new revelation.',
        sourceRef: quranId,
        authorityStatus: 'PEDAGOGICAL_ONLY',
        status: 'PROPOSAL',
      })
      .end()
    assert.equal(createdAvatar.statusCode, 201, createdAvatar.body)
    const storedAvatar = (await moonql.model('actor_avatars').list({ where: { avatarCode: 'av_901' } }))[0]
    assert.ok(storedAvatar)
    assert.equal(storedAvatar.authorityStatus, 'PEDAGOGICAL_ONLY')
    assert.equal(storedAvatar.status, 'PROPOSAL')
    assert.match(String(storedAvatar.disclosure), /not the prophet/)

    const avatarId = String(storedAvatar.id)
    const deleteAvatar = await app.inject().delete(`/orm/actor_avatars/${avatarId}`).headers(headers).end()
    assert.equal(deleteAvatar.statusCode, 400, 'an avatar record is retired, never deleted')

    const countsBefore = [
      await moonql.model('actor_figures').count(),
      await moonql.model('actor_missions').count(),
      await moonql.model('actor_avatars').count(),
    ]
    await Promise.all([
      app.inject().get('/orm/actors/missions').end(),
      app.inject().get('/orm/actors/figures').end(),
      app.inject().get('/orm/actors/figure?code=fg_005').end(),
      app.inject().get('/orm/actors/policy').end(),
    ])
    const countsAfter = [
      await moonql.model('actor_figures').count(),
      await moonql.model('actor_missions').count(),
      await moonql.model('actor_avatars').count(),
    ]
    assert.deepEqual(countsAfter, countsBefore, 'the projection is read-only on pg')
  },
)
