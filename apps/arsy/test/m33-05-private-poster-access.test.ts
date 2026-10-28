/**
 * M33-05 verification — private poster access through the committed private
 * media gate.
 *
 * There is no poster store, draft-attachment model, D08 decision service or
 * poster renderer in this repository (see docs/audit/M33-05-*.md). This suite
 * therefore drives the one committed private-media path — the D06 witness
 * consent/ACL gate plus the ECHOLOG private-witness marker and download-grant
 * handshake from M16-04 — with synthetic, poster-shaped image assets. It proves
 * the gate semantics the M33-05 contract depends on; it does not create a
 * poster pipeline, and the M33-05 contract forbids mislabelling a poster as
 * witness media to obtain the marker, so nothing here claims that path is an
 * approved poster delivery route.
 *
 * Every fixture is synthetic: fabricated principals, a 64-hex digest, an
 * opaque object key canary, an in-process fake ECHOLOG. No real media, license,
 * consent or credential is used.
 */
import assert from 'node:assert/strict'
import { test, type TestContext } from 'node:test'
import Fastify, { type FastifyInstance } from 'fastify'
import { bootMoonQl, defineAddon, moonqlRest } from '@moonwitness/moonql'
import type { AnyAddon } from '@moonwitness/moonql'
import auth from '@moonwitness/moonql-auth'
import base from '@moonwitness/moonql-base'
import witness from '@moonwitness/witness'
import envelope from '../src/plugins/envelope.js'

const quiet = { info: () => {}, warn: () => {} }
const DIGEST_A = 'a'.repeat(64)
const DIGEST_B = 'b'.repeat(64)
const OBJECT_KEY_A = 'posters/private/artist-upload-OPAQUE-KEY-NEVER-LEAK-A'
const OBJECT_KEY_B = 'posters/private/artist-upload-OPAQUE-KEY-NEVER-LEAK-B'
const GRANT_TOKEN = 'synthetic-short-lived-grant-token-NEVER-LEAK'
const MAX_GRANT_TTL_MS = 5 * 60 * 1000

const testIdentity = defineAddon({
  name: 'm3305_test_identity',
  depends: ['witness'],
  models: {},
  provides: {
    resolveUser: () => (request) => {
      const id = request.headers['x-witness-user']
      const authorization = request.headers.authorization
      if (typeof id !== 'string' || typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return null
      const roleHeader = request.headers['x-witness-role']
      const roles = typeof roleHeader === 'string' ? roleHeader.split(',').map((role) => role.trim()).filter(Boolean) : ['user']
      return { id, roles, meta: { token: authorization.slice('Bearer '.length) } }
    },
  },
})

type TestPrincipal = { id: string; token: string; role?: string }

const admin: TestPrincipal = { id: 'm3305-synthetic-admin', token: 'm3305-admin-token', role: 'admin' }
const authorA: TestPrincipal = { id: 'm3305-synthetic-author-a', token: 'm3305-author-a-token' }
const authorB: TestPrincipal = { id: 'm3305-synthetic-author-b', token: 'm3305-author-b-token' }
const stranger: TestPrincipal = { id: 'm3305-synthetic-stranger', token: 'm3305-stranger-token' }

function headers(user?: TestPrincipal) {
  if (!user) return {}
  return {
    authorization: `Bearer ${user.token}`,
    'x-witness-user': user.id,
    'x-witness-role': user.role ?? 'user',
  }
}

async function makeSystem(t: TestContext) {
  const echo = Fastify({ logger: false })
  const markerRequests: Array<{ digest: string; objectKey: string }> = []
  const grantRequests: Array<{ digest: string; authorization: string | undefined }> = []
  let grantUrlFor = (digest: string) => `/api/v1/objects/sha256/${digest}?grant=${GRANT_TOKEN}`
  let grantExpiry = () => new Date(Date.now() + 240_000).toISOString()

  echo.post('/api/v1/objects/sha256/:digest/private-witness', async (request, reply) => {
    const digest = (request.params as { digest: string }).digest
    const body = request.body as { objectKey?: string; requireAlreadyMarked?: boolean }
    markerRequests.push({ digest, objectKey: String(body.objectKey) })
    if (!request.headers.authorization) return reply.code(401).send({ error: 'auth required' })
    return { object_key: body.objectKey, digest, size: 42, content_type: 'image/png' }
  })
  echo.get('/api/v1/objects/sha256/:digest', async (request, reply) => {
    const digest = (request.params as { digest: string }).digest
    grantRequests.push({ digest, authorization: request.headers.authorization })
    if (!request.headers.authorization) return reply.code(401).send({ error: 'auth required' })
    return { url: grantUrlFor(digest), expires_at: grantExpiry() }
  })

  const echoUrl = await echo.listen({ host: '127.0.0.1', port: 0 })
  const moonql = await bootMoonQl({
    addons: [base, auth, witness, testIdentity] as AnyAddon[],
    env: { ECHOLOG_URL: echoUrl },
    seedPolicy: 'off',
    cronEnabled: false,
    log: quiet,
  })
  const app = Fastify({ logger: false })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql, introspectionAcl: 'auth' })
  await app.ready()
  t.after(async () => {
    await app.close()
    await moonql.close()
    await echo.close()
  })

  return {
    app,
    moonql,
    markerRequests,
    grantRequests,
    setGrantUrl(value: (digest: string) => string) { grantUrlFor = value },
    setGrantExpiry(value: () => string) { grantExpiry = value },
  }
}

async function createConsent(
  app: FastifyInstance,
  subjectPrincipalRef: string,
  overrides: Record<string, unknown> = {},
) {
  const response = await app.inject().post('/orm/witness/consents').headers(headers(admin)).payload({
    stableId: `wc_m3305_${subjectPrincipalRef}`,
    subjectPrincipalRef,
    consentType: 'FULL_ANONYMITY',
    scope: 'PRIVATE_ARCHIVE',
    evidenceRef: 'synthetic:fixture:m3305-consent',
    minorProtected: false,
    guardianPrincipalRef: null,
    guardianVerified: false,
    validUntil: null,
    ...overrides,
  }).end()
  assert.equal(response.statusCode, 201, response.body)
  return String((response.json().data as { id: string }).id)
}

let posterSequence = 0

function posterPayload(consentRecordRef: string, digest = DIGEST_A, objectKey = OBJECT_KEY_A, stableId?: string) {
  posterSequence += 1
  return {
    stableId: stableId ?? `wt_m3305_synthetic_poster_${posterSequence}`,
    consentRecordRef,
    originalObjectKey: objectKey,
    originalDigest: digest,
    originalSize: 42,
    originalContentType: 'image/png',
  }
}

async function uploadPoster(
  app: FastifyInstance,
  user: TestPrincipal,
  consentRecordRef: string,
  digest = DIGEST_A,
  objectKey = OBJECT_KEY_A,
) {
  const response = await app.inject().post('/orm/witness/testimonies').headers(headers(user))
    .payload(posterPayload(consentRecordRef, digest, objectKey)).end()
  assert.equal(response.statusCode, 201, response.body)
  return String((response.json().data as { id: string }).id)
}

/**
 * A denial must be a generic envelope: no bytes, no URL, no object key, no
 * digest, no grant token and no `data` field.
 */
function assertDenialLeaksNothing(response: { statusCode: number; body: string; headers: Record<string, unknown>; json: () => unknown }, secrets: string[]) {
  assert.ok(response.statusCode >= 400, `expected a denial, received ${response.statusCode}`)
  const body = response.json() as Record<string, unknown>
  assert.deepEqual(Object.keys(body).sort(), ['error', 'ok', 'timestamp'], 'denial must use the generic error envelope')
  assert.equal(body.ok, false)
  assert.equal('data' in body, false, 'denial must not carry a data payload')
  const error = body.error as Record<string, unknown>
  assert.deepEqual(Object.keys(error).sort(), ['message', 'statusCode'])
  assert.equal(error.statusCode, response.statusCode)
  assert.equal(typeof error.message, 'string')

  assert.equal(/\uFFFD|\x89PNG|GIF8|%PDF/i.test(response.body), false, 'denial must not contain image or document bytes')
  assert.equal(/https?:\/\//i.test(response.body), false, 'denial must not contain a URL')
  for (const secret of [...secrets, GRANT_TOKEN, 'objectKey', 'originalObjectKey', 'originalDigest']) {
    assert.equal(response.body.includes(secret), false, `denial must not contain "${secret}"`)
  }
}

test('M33-05: a private poster asset needs an explicit principal-bound, in-scope grant; every denial is leak-free', async (t) => {
  const system = await makeSystem(t)
  const consentId = await createConsent(system.app, authorA.id)

  const anonymousIntake = await system.app.inject().post('/orm/witness/testimonies').payload(posterPayload(consentId)).end()
  assert.equal(anonymousIntake.statusCode, 401, 'anonymous uploaders cannot attach private artwork')
  assert.equal(system.markerRequests.length, 0)

  const intake = await system.app.inject().post('/orm/witness/testimonies').headers(headers(authorA))
    .payload(posterPayload(consentId)).end()
  assert.equal(intake.statusCode, 201, intake.body)
  assert.equal(system.markerRequests.length, 1, 'intake marks the object private at ECHOLOG before any reference exists')
  assert.equal(system.markerRequests[0]?.digest, DIGEST_A)
  assert.equal(intake.body.includes(OBJECT_KEY_A), false, 'the intake response never echoes the object key')
  assert.equal(intake.body.includes(DIGEST_A), false, 'the intake response never echoes the object digest')
  const posterId = String((intake.json().data as { id: string }).id)

  const anonymousGrant = await system.app.inject().post(`/orm/witness/testimonies/${posterId}/media-grant`).end()
  assertDenialLeaksNothing(anonymousGrant, [OBJECT_KEY_A, DIGEST_A])
  assert.equal(anonymousGrant.statusCode, 401)

  const strangerGrant = await system.app.inject().post(`/orm/witness/testimonies/${posterId}/media-grant`).headers(headers(stranger)).end()
  assertDenialLeaksNothing(strangerGrant, [OBJECT_KEY_A, DIGEST_A])
  assert.equal(strangerGrant.statusCode, 404, 'a stranger must not learn that the private poster exists')

  const adminGrant = await system.app.inject().post(`/orm/witness/testimonies/${posterId}/media-grant`).headers(headers(admin)).end()
  assertDenialLeaksNothing(adminGrant, [OBJECT_KEY_A, DIGEST_A])
  assert.equal(adminGrant.statusCode, 404, 'an admin role is not a per-record ACL grant')
  assert.equal(system.grantRequests.length, 0, 'no denial may reach ECHOLOG for grant material')

  const ownerGrant = await system.app.inject().post(`/orm/witness/testimonies/${posterId}/media-grant`).headers(headers(authorA)).end()
  assert.equal(ownerGrant.statusCode, 200, ownerGrant.body)
  const grant = ownerGrant.json().data as { url: string; expires_at: string }
  const grantUrl = new URL(grant.url)
  assert.equal(grantUrl.pathname, `/api/v1/objects/sha256/${DIGEST_A}`)
  assert.equal(grantUrl.searchParams.get('grant'), GRANT_TOKEN)
  assert.ok(Date.parse(grant.expires_at) > Date.now())
  assert.ok(Date.parse(grant.expires_at) <= Date.now() + MAX_GRANT_TTL_MS, 'the granted window is bounded to five minutes')
  assert.equal(ownerGrant.body.includes(OBJECT_KEY_A), false, 'the opaque object key never reaches the client')
  assert.equal(system.grantRequests.length, 1)
  assert.equal(system.grantRequests[0]?.authorization, `Bearer ${authorA.token}`)
})

test('M33-05: cross-draft and cross-principal access is denied before ECHOLOG is asked', async (t) => {
  const system = await makeSystem(t)
  const consentA = await createConsent(system.app, authorA.id)
  const consentB = await createConsent(system.app, authorB.id)
  await uploadPoster(system.app, authorA, consentA, DIGEST_A, OBJECT_KEY_A)
  const posterB = await uploadPoster(system.app, authorB, consentB, DIGEST_B, OBJECT_KEY_B)

  const crossDraftGrant = await system.app.inject()
    .post(`/orm/witness/testimonies/${posterB}/media-grant`).headers(headers(authorA)).end()
  assertDenialLeaksNothing(crossDraftGrant, [OBJECT_KEY_B, DIGEST_B, OBJECT_KEY_A, DIGEST_A])
  assert.equal(crossDraftGrant.statusCode, 404, 'author A cannot open author B\'s private poster')
  assert.equal(system.grantRequests.length, 0, 'a cross-draft denial never asks ECHOLOG for a grant')

  const crossDigestCallback = await system.app.inject()
    .post('/orm/witness/private-media-authorize').headers(headers(authorA)).payload({ digest: DIGEST_B }).end()
  assertDenialLeaksNothing(crossDigestCallback, [OBJECT_KEY_B, DIGEST_B])
  assert.equal(crossDigestCallback.statusCode, 404, 'the ECHOLOG authorization callback denies a digest owned by another draft')

  const ownCallback = await system.app.inject()
    .post('/orm/witness/private-media-authorize').headers(headers(authorB)).payload({ digest: DIGEST_B }).end()
  assert.equal(ownCallback.statusCode, 204, 'the owning author is authorized for the exact digest only')

  const unknownDigest = await system.app.inject()
    .post('/orm/witness/private-media-authorize').headers(headers(authorA)).payload({ digest: 'c'.repeat(64) }).end()
  assert.equal(unknownDigest.statusCode, 404)
  assertDenialLeaksNothing(unknownDigest, [OBJECT_KEY_A, DIGEST_A])
})

test('M33-05: expired consent, withdrawn consent and expired or mismatched grants fail closed', async (t) => {
  const system = await makeSystem(t)
  const expiredConsent = await createConsent(system.app, authorA.id, {
    stableId: 'wc_m3305_expired',
    validUntil: '2026-01-01T00:00:00.000Z',
  })
  const expiredIntake = await system.app.inject().post('/orm/witness/testimonies').headers(headers(authorA))
    .payload(posterPayload(expiredConsent)).end()
  assertDenialLeaksNothing(expiredIntake, [OBJECT_KEY_A, DIGEST_A])
  assert.equal(expiredIntake.statusCode, 404, 'an expired consent cannot attach private artwork')
  assert.equal(system.markerRequests.length, 0, 'expired consent is refused before ECHOLOG is contacted')

  const consentId = await createConsent(system.app, authorB.id)
  const posterId = await uploadPoster(system.app, authorB, consentId, DIGEST_B, OBJECT_KEY_B)

  await system.moonql.model('witness_consent_records').update(consentId, { status: 'WITHDRAWN' })
  const grantCountBefore = system.grantRequests.length
  const withdrawnGrant = await system.app.inject()
    .post(`/orm/witness/testimonies/${posterId}/media-grant`).headers(headers(authorB)).end()
  assertDenialLeaksNothing(withdrawnGrant, [OBJECT_KEY_B, DIGEST_B])
  assert.equal(withdrawnGrant.statusCode, 404, 'withdrawn consent revokes private poster access')
  assert.equal(system.grantRequests.length, grantCountBefore, 'a revoked grant never reaches ECHOLOG')

  // Restore only by creating a fresh consent/record; the withdrawn record is immutable.
  const freshConsent = await createConsent(system.app, authorB.id, { stableId: 'wc_m3305_fresh' })
  const freshPoster = await uploadPoster(system.app, authorB, freshConsent, DIGEST_B, OBJECT_KEY_B)

  system.setGrantExpiry(() => new Date(Date.now() - 1_000).toISOString())
  const staleGrant = await system.app.inject()
    .post(`/orm/witness/testimonies/${freshPoster}/media-grant`).headers(headers(authorB)).end()
  assertDenialLeaksNothing(staleGrant, [OBJECT_KEY_B, DIGEST_B])
  assert.equal(staleGrant.statusCode, 503, 'an already-expired ECHOLOG grant is refused, not forwarded')

  system.setGrantExpiry(() => new Date(Date.now() + MAX_GRANT_TTL_MS + 60_000).toISOString())
  const overlongGrant = await system.app.inject()
    .post(`/orm/witness/testimonies/${freshPoster}/media-grant`).headers(headers(authorB)).end()
  assertDenialLeaksNothing(overlongGrant, [OBJECT_KEY_B, DIGEST_B])
  assert.equal(overlongGrant.statusCode, 503, 'a grant longer than five minutes is refused')

  system.setGrantExpiry(() => new Date(Date.now() + 240_000).toISOString())
  system.setGrantUrl(() => `/api/v1/objects/sha256/${DIGEST_A}?grant=${GRANT_TOKEN}`)
  const wrongObjectGrant = await system.app.inject()
    .post(`/orm/witness/testimonies/${freshPoster}/media-grant`).headers(headers(authorB)).end()
  assertDenialLeaksNothing(wrongObjectGrant, [OBJECT_KEY_B, DIGEST_B])
  assert.equal(wrongObjectGrant.statusCode, 503, 'a grant for another object is refused (cross-draft reuse)')

  system.setGrantUrl((digest) => `/api/v1/objects/sha256/${digest}?grant=${GRANT_TOKEN}&scope=public`)
  const extraParamGrant = await system.app.inject()
    .post(`/orm/witness/testimonies/${freshPoster}/media-grant`).headers(headers(authorB)).end()
  assertDenialLeaksNothing(extraParamGrant, [OBJECT_KEY_B, DIGEST_B])
  assert.equal(extraParamGrant.statusCode, 503, 'a widened grant URL is refused')
})

test('M33-05: a private poster reference has no public REST projection', async (t) => {
  const system = await makeSystem(t)
  const consentId = await createConsent(system.app, authorA.id)
  const posterId = await uploadPoster(system.app, authorA, consentId)

  assert.equal(system.moonql.registry.models.get('witness_testimonies')?.rest, false)
  assert.equal(system.moonql.registry.models.get('witness_consent_records')?.rest, false)
  const rawModelRoute = await system.app.inject().get('/orm/witness_testimonies').end()
  assert.equal(rawModelRoute.statusCode, 404, 'the private model is absent from the REST projection')

  const listed = await system.app.inject().get(`/orm/witness/testimonies/${posterId}`).headers(headers(authorA)).end()
  assert.ok(listed.statusCode >= 400, 'no per-record read route exists for the private poster')
  assertDenialLeaksNothing(listed, [OBJECT_KEY_A, DIGEST_A])
})
