import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import ontology from '@moonwitness/moonql-ontology'
import corpus from '@moonwitness/moonql-corpus'
import actors from '@moonwitness/moonql-actors'
import research, {
  M15_PILOT_PINS,
  JERUSALEM_CASE_CODE,
  type ComparativePilotView,
} from '@moonwitness/moonql-research'
import envelope from '../src/plugins/envelope.js'
import { adminHeaders, TEST_ADMIN_PASSWORD } from './helpers/auth.js'

/**
 * M15 — Interdisciplinary historical comparison pilot.
 *
 * Case: Jerusalem 70 CE — Second Temple Destruction.
 * Correlating Mark 13:2, Josephus BJ VI.4, QS 17:4-7, and Roman archaeological strata.
 *
 * Validates:
 * - Exact edition and rights resolution (M15-01).
 * - Historical event attestation distinct from religious claims (M15-02).
 * - Josephus source and transmission scope (M15-03).
 * - Refusal of automatic miraculous-fulfillment verdicts (M15-04).
 * - Strict domain separation across TEXT, EVENT, PERSON, STORY (M15-05).
 * - Evidence-centered public explanatory comparative case view (M15-06).
 * - Rejection of false temporal matches and adversarial proof claims (M15-07).
 */

const quiet = { info: () => {}, warn: () => {} }
const dataOf = <T>(res: { json(): unknown }): T => (res.json() as { data: T }).data
const errorOf = (res: { json(): unknown }): string => (res.json() as { error: { message: string } }).error.message

async function makeApp(): Promise<{ app: FastifyInstance }> {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, ontology, corpus, actors, research],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: TEST_ADMIN_PASSWORD },
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()
  return { app }
}

test('M15-01: Mark 13:2 exact edition, rights, and source digest pin', async (t) => {
  const { app } = await makeApp()
  t.after(async () => {
    await app.close()
  })

  const pin = M15_PILOT_PINS.mark13
  assert.equal(pin.editionCode, 'mark_13_2_sblgnt')
  assert.equal(pin.rights, 'PUBLIC_DOMAIN')
  assert.equal(pin.sha256.length, 64)
  assert.match(pin.greekText, /οὐ μὴ ἀφεθῇ ὧδε λίθος ἐπὶ λίθον/)
  assert.match(pin.translation, /not be left here one stone upon another/)
})

test('M15-02: Jerusalem 70 CE event attestation and archaeological distinction', async (t) => {
  const { app } = await makeApp()
  t.after(async () => {
    await app.close()
  })

  const res = await app.inject().get('/orm/research/comparative-case').end()
  assert.equal(res.statusCode, 200)
  const view = dataOf<ComparativePilotView>(res)

  assert.equal(view.caseCode, JERUSALEM_CASE_CODE)
  const event = view.domains.events.find((e) => e.id === 'EVT-JERUSALEM-70CE')
  assert.ok(event, 'Jerusalem 70 CE event must be present')
  assert.equal(event.date, '70-08 CE (10 Loos / 9 Av)')
  assert.equal(event.exactMatch, true)
  assert.match(event.distinctionNote, /distinct from subsequent religious interpretations/)

  // Retaining wall counterevidence recorded and acknowledged
  const retainingCe = view.counterevidence.find((c) => c.ceCode === 'CE-RETAINING-WALL-STONES')
  assert.ok(retainingCe)
  assert.equal(retainingCe.status, 'ACKNOWLEDGED')
  assert.match(retainingCe.finding, /Western Wall.*remain in situ/)
})

test('M15-03: Josephus source and transmission scope with court bias counterevidence', async (t) => {
  const { app } = await makeApp()
  t.after(async () => {
    await app.close()
  })

  const res = await app.inject().get('/orm/research/comparative-case').end()
  assert.equal(res.statusCode, 200)
  const view = dataOf<ComparativePilotView>(res)

  const josephusText = view.domains.texts.find((t) => t.id === 'TXT-JOSEPHUS-BJ-6-4')
  assert.ok(josephusText)
  assert.equal(josephusText.edition, 'josephus_war_6_4_niese')
  assert.equal(josephusText.rights, 'PUBLIC_DOMAIN')
  assert.equal(josephusText.exactMatch, true)

  const biasCe = view.counterevidence.find((c) => c.ceCode === 'CE-JOSEPHUS-COURT-BIAS')
  assert.ok(biasCe)
  assert.equal(biasCe.status, 'ACKNOWLEDGED')
  assert.match(biasCe.finding, /Flavian pension and patronage/)
  assert.match(biasCe.finding, /Sulpicius Severus Chronica II\.30/)
})

test('M15-04: Attributed prophecy interpretation and refusal of automatic miraculous-fulfillment verdict', async (t) => {
  const { app } = await makeApp()
  t.after(async () => {
    await app.close()
  })

  const headers = await adminHeaders(app, '/orm')

  // Invariant: Theological claims cannot be asserted as automatic empirical proof
  const res = await app
    .inject()
    .post('/orm/research/comparative-case/assert-fulfillment')
    .headers(headers)
    .body({
      caseCode: JERUSALEM_CASE_CODE,
      textRef: 'TXT-MARK-13-2',
      eventRef: 'EVT-JERUSALEM-70CE',
      claim: 'Mark 13:2 infallibly proves supernatural foreknowledge of 70 CE destruction.',
    })
    .end()

  assert.equal(res.statusCode, 400)
  assert.match(errorOf(res), /automatic miraculous-fulfillment verdict is forbidden/)
})

test('M15-05: Strict domain typing: TEXT, EVENT, PERSON, STORY are distinct; cross-domain merge rejected', async (t) => {
  const { app } = await makeApp()
  t.after(async () => {
    await app.close()
  })

  const headers = await adminHeaders(app, '/orm')

  // 1. Attempting to link across different domains (e.g. PERSON with EVENT) is forbidden
  const crossDomainRes = await app
    .inject()
    .post('/orm/research/comparative-case/link-identity')
    .headers(headers)
    .body({
      sourceId: 'PER-TITUS-VESPASIAN',
      sourceDomain: 'PERSON',
      targetId: 'EVT-JERUSALEM-70CE',
      targetDomain: 'EVENT',
      relation: 'COLLAPSED_IDENTITY',
    })
    .end()

  assert.equal(crossDomainRes.statusCode, 400)
  assert.match(errorOf(crossDomainRes), /cross-domain identity merge is forbidden/)

  // 2. Attempting to link distinct historical actors with SAME_AS is forbidden
  const samePersonRes = await app
    .inject()
    .post('/orm/research/comparative-case/link-identity')
    .headers(headers)
    .body({
      sourceId: 'PER-JESUS-NAZARETH',
      sourceDomain: 'PERSON',
      targetId: 'PER-TITUS-VESPASIAN',
      targetDomain: 'PERSON',
      relation: 'SAME_AS',
    })
    .end()

  assert.equal(samePersonRes.statusCode, 400)
  assert.match(errorOf(samePersonRes), /historical actor identity merge is forbidden/)

  // 3. Legitimate within-domain correlation is accepted
  const validLinkRes = await app
    .inject()
    .post('/orm/research/comparative-case/link-identity')
    .headers(headers)
    .body({
      sourceId: 'PER-TITUS-VESPASIAN',
      sourceDomain: 'PERSON',
      targetId: 'PER-FLAVIUS-JOSEPHUS',
      targetDomain: 'PERSON',
      relation: 'PATRON_CLIENT',
    })
    .end()

  assert.equal(validLinkRes.statusCode, 200)
  const linkData = dataOf<{ ok: boolean; crossDomainMerged: boolean }>(validLinkRes)
  assert.equal(linkData.ok, true)
  assert.equal(linkData.crossDomainMerged, false)
})

test('M15-06: Evidence-centered public explanatory comparative case view', async (t) => {
  const { app } = await makeApp()
  t.after(async () => {
    await app.close()
  })

  const res = await app.inject().get('/orm/research/comparative-case').end()
  assert.equal(res.statusCode, 200)
  const view = dataOf<ComparativePilotView>(res)

  // Public view contains all 4 distinct domains
  assert.equal(view.domains.texts.length, 3)
  assert.equal(view.domains.events.length, 1)
  assert.equal(view.domains.persons.length, 3)
  assert.equal(view.domains.storyFrames.length, 3)

  // Invariants explicitly certified in the payload
  assert.equal(view.invariants.crossDomainIdentitiesMerged, false)
  assert.equal(view.invariants.automaticMiraculousFulfillment, false)
  assert.equal(view.invariants.temporalDiscordantProofBlocked, true)
  assert.equal(view.invariants.exactShaRequired, true)

  // Epistemic uncertainties are exposed, never swept under the rug
  assert.ok(view.epistemicUncertainties.length >= 3)
})

test('M15-07: Testing false temporal matches and adversarial proof claims', async (t) => {
  const { app } = await makeApp()
  t.after(async () => {
    await app.close()
  })

  const headers = await adminHeaders(app, '/orm')

  // Adversarial test: Claiming pre-event supernatural prediction without pre-70 manuscript proof
  const adversarialRes = await app
    .inject()
    .post('/orm/research/comparative-case/temporal-match')
    .headers(headers)
    .body({
      textDate: 'c. 68-72 CE',
      eventDate: '70-08 CE',
      claimsPrediction: true,
      preEventProvenanceSha: null,
    })
    .end()

  assert.equal(adversarialRes.statusCode, 200)
  const matchResult = dataOf<{
    valid: boolean
    admittedAsHistoricalProof: boolean
    requiresCounterevidence: boolean
  }>(adversarialRes)
  assert.equal(matchResult.valid, false)
  assert.equal(matchResult.admittedAsHistoricalProof, false)
  assert.equal(matchResult.requiresCounterevidence, true)

  // Legitimate match with attested provenance
  const validRes = await app
    .inject()
    .post('/orm/research/comparative-case/temporal-match')
    .headers(headers)
    .body({
      textDate: '70-08 CE',
      eventDate: '70-08 CE',
      claimsPrediction: false,
    })
    .end()

  assert.equal(validRes.statusCode, 200)
  const validResult = dataOf<{ valid: boolean; admittedAsHistoricalProof: boolean }>(validRes)
  assert.equal(validResult.valid, true)
  assert.equal(validResult.admittedAsHistoricalProof, true)
})
