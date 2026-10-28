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
const digest = 'a'.repeat(64)
const objectKey = 'witness/private/opaque-synthetic-object'

const testIdentity = defineAddon({
  name: 'witness_test_identity',
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
  const metadataRequests: Array<{ digest: string; authorization: string | undefined }> = []
  const grantRequests: Array<{ digest: string; authorization: string | undefined }> = []
  const privateMarkers: Array<{ digest: string; objectKey: string; requireAlreadyMarked: boolean; authorization: string | undefined }> = []
  let grantExpiry = (): string => new Date(Date.now() + 240_000).toISOString()
  let markerStatus = 200

  echo.get('/api/v1/objects/sha256/:digest/meta', async (request, reply) => {
    const requestDigest = (request.params as { digest: string }).digest
    metadataRequests.push({ digest: requestDigest, authorization: request.headers.authorization })
    if (!request.headers.authorization) return reply.code(401).send({ error: 'auth required' })
    return { object_key: `sha256/${requestDigest}`, digest: requestDigest, size: 42, content_type: 'application/octet-stream' }
  })
  echo.post('/api/v1/objects/sha256/:digest/private-witness', async (request, reply) => {
    const requestDigest = (request.params as { digest: string }).digest
    const body = request.body as { objectKey?: string; requireAlreadyMarked?: boolean }
    privateMarkers.push({ digest: requestDigest, objectKey: String(body.objectKey), requireAlreadyMarked: body.requireAlreadyMarked === true, authorization: request.headers.authorization })
    if (!request.headers.authorization) return reply.code(401).send({ error: 'auth required' })
    if (markerStatus !== 200) return reply.code(markerStatus).send({ error: 'not marked at upload' })
    return { object_key: body.objectKey, digest: requestDigest, size: 42, content_type: 'application/octet-stream' }
  })
  echo.get('/api/v1/objects/sha256/:digest', async (request, reply) => {
    const requestDigest = (request.params as { digest: string }).digest
    grantRequests.push({ digest: requestDigest, authorization: request.headers.authorization })
    if (!request.headers.authorization) return reply.code(401).send({ error: 'auth required' })
    return {
      url: `/api/v1/objects/sha256/${requestDigest}?grant=synthetic-short-lived-token`,
      expires_at: grantExpiry(),
    }
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
    metadataRequests,
    grantRequests,
    privateMarkers,
    setGrantExpiry(value: () => string) { grantExpiry = value },
    setPrivateMarkerStatus(value: number) { markerStatus = value },
  }
}

async function createConsent(app: FastifyInstance, admin?: TestPrincipal, overrides: Record<string, unknown> = {}) {
  return app.inject().post('/orm/witness/consents').headers(headers(admin)).payload({
    stableId: `wc_${String(overrides.stableId ?? 'synthetic')}`,
    subjectPrincipalRef: 'witness-subject-synthetic',
    consentType: 'FULL_ANONYMITY',
    scope: 'PRIVATE_ARCHIVE',
        evidenceRef: 'synthetic:fixture:consent-01',
    minorProtected: false,
    guardianPrincipalRef: null,
    guardianVerified: false,
    validUntil: null,
    ...overrides,
  }).end()
}

function testimonyPayload(consentRecordRef: string) {
  return {
    stableId: 'wt_synthetic_private_fixture_01',
    consentRecordRef,
    originalObjectKey: objectKey,
    originalDigest: digest,
    originalSize: 42,
    originalContentType: 'application/octet-stream',
  }
}

test('M16-04: consent-gated intake creates only private references and grants the owner a bounded ECHOLOG URL', async (t) => {
  const system = await makeSystem(t)
  const admin = { id: 'synthetic-admin', token: 'synthetic-admin-token', role: 'admin' }
  const owner = { id: 'witness-subject-synthetic', token: 'synthetic-owner-token' }
  const stranger = { id: 'synthetic-stranger', token: 'synthetic-stranger-token' }

  const anonymousConsent = await createConsent(system.app)
  assert.equal(anonymousConsent.statusCode, 401, 'anonymous callers cannot create consent records')

  const anonymousUpload = await system.app.inject().post('/orm/witness/testimonies').payload(testimonyPayload('missing')).end()
  assert.equal(anonymousUpload.statusCode, 401, 'anonymous callers cannot attach a witness object')

  const missingConsent = await system.app.inject().post('/orm/witness/testimonies').headers(headers(owner)).payload(testimonyPayload('missing-consent')).end()
  assert.equal(missingConsent.statusCode, 404, 'missing consent fails closed before ECHOLOG is contacted')
  assert.equal(system.metadataRequests.length, 0)

  const consentResponse = await createConsent(system.app, admin)
  assert.equal(consentResponse.statusCode, 201, consentResponse.body)
  const consentId = (consentResponse.json().data as { id: string }).id

  const uploadResponse = await system.app.inject().post('/orm/witness/testimonies').headers(headers(owner)).payload(testimonyPayload(consentId)).end()
  assert.equal(uploadResponse.statusCode, 201, uploadResponse.body)
  assert.equal(uploadResponse.headers['cache-control'], 'private, no-store')
  const created = uploadResponse.json().data as Record<string, unknown>
  assert.equal(created.visibility, 'PRIVATE')
  assert.equal(typeof created.id, 'string')
  assert.equal('originalObjectKey' in created, false)
  assert.equal('originalDigest' in created, false)
  assert.equal(system.metadataRequests.length, 0, 'intake must mark before protected metadata can be read')
  assert.equal(system.privateMarkers[0]?.digest, digest)
  assert.equal(system.privateMarkers[0]?.objectKey, objectKey)
  assert.equal(system.privateMarkers[0]?.requireAlreadyMarked, true)
  assert.equal(system.privateMarkers[0]?.authorization, `Bearer ${owner.token}`)

  const witnessId = String(created.id)
  const rawWitness = await system.moonql.model('witness_testimonies').search({ limit: 1, where: { id: witnessId }, raw: true })
  const viewAcl = JSON.parse(String(rawWitness.rows[0]?.viewAclPrincipalRefs)) as string[]
  assert.deepEqual(viewAcl, [owner.id], 'each testimony stores its explicit private view ACL')
  const strangerCallback = await system.app.inject().post('/orm/witness/private-media-authorize').headers(headers(stranger)).payload({ digest }).end()
  assert.equal(strangerCallback.statusCode, 404, 'ECHOLOG authorization callback denies a non-owner')
  const ownerCallback = await system.app.inject().post('/orm/witness/private-media-authorize').headers(headers(owner)).payload({ digest }).end()
  assert.equal(ownerCallback.statusCode, 204, 'ECHOLOG authorization callback approves the eligible owner')
  const anonymousGrant = await system.app.inject().post(`/orm/witness/testimonies/${witnessId}/media-grant`).end()
  assert.equal(anonymousGrant.statusCode, 401)

  const grantCountBeforeStranger = system.grantRequests.length
  const strangerGrant = await system.app.inject().post(`/orm/witness/testimonies/${witnessId}/media-grant`).headers(headers(stranger)).end()
  assert.equal(strangerGrant.statusCode, 404, 'non-owner reads conceal record existence')
  const adminGrant = await system.app.inject().post(`/orm/witness/testimonies/${witnessId}/media-grant`).headers(headers(admin)).end()
  assert.equal(adminGrant.statusCode, 404, 'an administrator without INTERNAL consent is not a witness reviewer for this record')
  assert.equal(system.grantRequests.length, grantCountBeforeStranger, 'unauthorized callers cannot reach ECHOLOG')

  const grantResponse = await system.app.inject().post(`/orm/witness/testimonies/${witnessId}/media-grant`).headers(headers(owner)).end()
  assert.equal(grantResponse.statusCode, 200, grantResponse.body)
  assert.equal(grantResponse.headers['cache-control'], 'private, no-store')
  const grant = grantResponse.json().data as { url: string; expires_at: string }
  const grantUrl = new URL(grant.url)
  assert.equal(grantUrl.pathname, `/api/v1/objects/sha256/${digest}`)
  assert.equal(grantUrl.searchParams.get('grant'), 'synthetic-short-lived-token')
  assert.ok(Date.parse(grant.expires_at) > Date.now())
  assert.ok(Date.parse(grant.expires_at) <= Date.now() + 5 * 60 * 1000)
  assert.equal(grantResponse.body.includes(objectKey), false, 'opaque S3 namespace keys never appear in the grant response')
  assert.equal(system.grantRequests[0]?.authorization, `Bearer ${owner.token}`)

  assert.equal(system.moonql.registry.models.get('witness_testimonies')?.rest, false)
  assert.equal(system.moonql.registry.models.get('witness_consent_records')?.rest, false)
  const rawModelRoute = await system.app.inject().get('/orm/witness_testimonies').end()
  assert.equal(rawModelRoute.statusCode, 404, 'raw D06 models remain absent from REST')
})

test('M16-04: expired, withdrawn, mismatched and unverified-minor consent never yields a record or grant', async (t) => {
  const system = await makeSystem(t)
  const admin = { id: 'synthetic-admin', token: 'synthetic-admin-token', role: 'admin' }
  const owner = { id: 'witness-subject-synthetic', token: 'synthetic-owner-token' }

  const expiredResponse = await createConsent(system.app, admin, {
    stableId: 'expired',
    validUntil: '2026-10-27T00:00:00.000Z',
  })
  assert.equal(expiredResponse.statusCode, 201)
  const expiredId = (expiredResponse.json().data as { id: string }).id
  const expiredUpload = await system.app.inject().post('/orm/witness/testimonies').headers(headers(owner)).payload(testimonyPayload(expiredId)).end()
  assert.equal(expiredUpload.statusCode, 404)

  const withdrawnResponse = await createConsent(system.app, admin, { stableId: 'withdrawn' })
  assert.equal(withdrawnResponse.statusCode, 201)
  const withdrawnId = (withdrawnResponse.json().data as { id: string }).id
  await system.moonql.model('witness_consent_records').update(withdrawnId, { status: 'WITHDRAWN' })
  const withdrawnUpload = await system.app.inject().post('/orm/witness/testimonies').headers(headers(owner)).payload(testimonyPayload(withdrawnId)).end()
  assert.equal(withdrawnUpload.statusCode, 404)

  const wrongSubjectResponse = await createConsent(system.app, admin, {
    stableId: 'wrong-subject',
    subjectPrincipalRef: 'another-synthetic-subject',
  })
  const wrongSubjectId = (wrongSubjectResponse.json().data as { id: string }).id
  const wrongSubjectUpload = await system.app.inject().post('/orm/witness/testimonies').headers(headers(owner)).payload(testimonyPayload(wrongSubjectId)).end()
  assert.equal(wrongSubjectUpload.statusCode, 404)

  const minorWithoutGuardian = await createConsent(system.app, admin, {
    stableId: 'minor-without-guardian',
    subjectPrincipalRef: 'synthetic-minor',
    minorProtected: true,
    guardianPrincipalRef: null,
    guardianVerified: false,
  })
  assert.equal(minorWithoutGuardian.statusCode, 400, 'minor consent cannot be recorded without verified guardian details')
  assert.equal(system.metadataRequests.length, 0, 'all denials happen before any ECHOLOG object lookup')
})

test('M16-04: an invalid or overlong ECHOLOG grant is not returned to the caller', async (t) => {
  const system = await makeSystem(t)
  const admin = { id: 'synthetic-admin', token: 'synthetic-admin-token', role: 'admin' }
  const owner = { id: 'witness-subject-synthetic', token: 'synthetic-owner-token' }
  const consentResponse = await createConsent(system.app, admin)
  const consentId = (consentResponse.json().data as { id: string }).id
  const uploadResponse = await system.app.inject().post('/orm/witness/testimonies').headers(headers(owner)).payload(testimonyPayload(consentId)).end()
  const witnessId = String((uploadResponse.json().data as { id: string }).id)

  system.setGrantExpiry(() => new Date(Date.now() + 6 * 60 * 1000).toISOString())
  const grantResponse = await system.app.inject().post(`/orm/witness/testimonies/${witnessId}/media-grant`).headers(headers(owner)).end()
  assert.equal(grantResponse.statusCode, 503)
  assert.equal(grantResponse.headers['cache-control'], 'private, no-store')
  assert.equal(grantResponse.body.includes('synthetic-short-lived-token'), false)
})

test('M16-04: minor media requires verified guardian consent and explicit per-record ACL membership', async (t) => {
  const system = await makeSystem(t)
  const admin = { id: 'synthetic-admin', token: 'synthetic-admin-token', role: 'admin' }
  const guardian = { id: 'synthetic-guardian', token: 'synthetic-guardian-token' }
  const stranger = { id: 'synthetic-stranger', token: 'synthetic-stranger-token' }
  const consentResponse = await createConsent(system.app, admin, {
    stableId: 'minor-internal',
    subjectPrincipalRef: 'synthetic-minor-subject',
    scope: 'INTERNAL',
    minorProtected: true,
    guardianPrincipalRef: guardian.id,
    guardianVerified: true,
  })
  assert.equal(consentResponse.statusCode, 201, consentResponse.body)
  const consentId = (consentResponse.json().data as { id: string }).id
  const uploadResponse = await system.app.inject().post('/orm/witness/testimonies').headers(headers(guardian)).payload(testimonyPayload(consentId)).end()
  assert.equal(uploadResponse.statusCode, 201, uploadResponse.body)
  const witnessId = String((uploadResponse.json().data as { id: string }).id)

  const strangerGrant = await system.app.inject().post(`/orm/witness/testimonies/${witnessId}/media-grant`).headers(headers(stranger)).end()
  assert.equal(strangerGrant.statusCode, 404)
  const guardianGrant = await system.app.inject().post(`/orm/witness/testimonies/${witnessId}/media-grant`).headers(headers(guardian)).end()
  assert.equal(guardianGrant.statusCode, 200, guardianGrant.body)
  const reviewerGrant = await system.app.inject().post(`/orm/witness/testimonies/${witnessId}/media-grant`).headers(headers(admin)).end()
  assert.equal(reviewerGrant.statusCode, 404, 'an admin role and INTERNAL consent do not substitute for an explicit per-record ACL grant')
})



test('M16-04: D06 refuses an object that was not marked private at ECHOLOG ingest', async (t) => {
  const system = await makeSystem(t)
  const admin = { id: 'synthetic-admin', token: 'synthetic-admin-token', role: 'admin' }
  const owner = { id: 'witness-subject-synthetic', token: 'synthetic-owner-token' }
  const consentResponse = await createConsent(system.app, admin, { stableId: 'unmarked-object' })
  assert.equal(consentResponse.statusCode, 201)
  const consentId = (consentResponse.json().data as { id: string }).id

  system.setPrivateMarkerStatus(404)
  const upload = await system.app.inject().post('/orm/witness/testimonies').headers(headers(owner))
    .payload(testimonyPayload(consentId)).end()
  assert.equal(upload.statusCode, 404, 'D06 does not retrofit an already-published generic ECHOLOG object')
  const rows = await system.moonql.model('witness_testimonies').search({ limit: 10, raw: true })
  assert.equal(rows.rows.length, 0, 'a failed ECHOLOG privacy gate creates no testimony reference')
})
