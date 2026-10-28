import { badRequest, conflict, ECHOLOG_URL_DEFAULT, notFound, serviceUnavailable, unauthorized } from '@moonwitness/core'
import {
  bool,
  defineAddon,
  defineModel,
  int,
  m2o,
  sel,
  str,
  text,
  ts,
  type ModelRepo,
  type Row,
  type User,
} from '@moonwitness/moonql'

export const WITNESS_VISIBILITY = ['PRIVATE'] as const
export const WITNESS_DATE_SLOTS = ['occurredAt', 'observedAt', 'recordedAt', 'writtenAt'] as const
const DATE_PRECISIONS = ['EXACT', 'APPROXIMATE', 'RANGE', 'UNKNOWN'] as const
const SHA256_RE = /^[a-f0-9]{64}$/i
const UTC_INSTANT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/
const LOCAL_INSTANT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$/
const OFFSET_RE = /^([+-])(\d{2}):(\d{2})$/

export interface WitnessCorrectionInput {
  witnessRef: string
  targetSlot: (typeof WITNESS_DATE_SLOTS)[number]
  corrected: string
  reason: string
  assertedBy: string
  assertedAt: string
}

type WitnessOrm = {
  model(name: 'witness_testimonies' | 'witness_corrections' | 'witness_consent_records'): ModelRepo
}

type ExactDateValue = { utc: string; timezone: string; originalOffset: string; local: string }
type DateValue = { precision: string; [key: string]: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function exactDate(value: unknown): value is ExactDateValue {
  if (!isRecord(value)) return false
  if (Object.keys(value).sort().join(',') !== 'local,originalOffset,timezone,utc') return false
  const { utc, timezone, originalOffset, local } = value
  if (typeof utc !== 'string' || !UTC_INSTANT_RE.test(utc) || typeof local !== 'string' || !LOCAL_INSTANT_RE.test(local)) return false
  if (new Date(utc).toISOString() !== utc || typeof timezone !== 'string' || !timezone.trim()) return false
  const offset = typeof originalOffset === 'string' ? OFFSET_RE.exec(originalOffset) : null
  if (!offset || Number(offset[2]) > 23 || Number(offset[3]) > 59) return false
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format(new Date(utc))
  } catch {
    return false
  }
  const localWithOffset = Date.parse(`${local}${originalOffset}`)
  return Number.isFinite(localWithOffset) && localWithOffset === Date.parse(utc)
}

/** Validate the persisted JSON representation against M16-02's slot value shapes. */
export function isWitnessDateValue(serialized: unknown): boolean {
  if (serialized === null) return true
  if (typeof serialized !== 'string') return false
  let value: unknown
  try {
    value = JSON.parse(serialized) as unknown
  } catch {
    return false
  }
  if (!isRecord(value) || typeof value.precision !== 'string' || !DATE_PRECISIONS.includes(value.precision as (typeof DATE_PRECISIONS)[number])) return false
  const dateValue = value as DateValue
  switch (dateValue.precision) {
    case 'UNKNOWN':
      return Object.keys(dateValue).length === 1
    case 'APPROXIMATE':
      return Object.keys(dateValue).sort().join(',') === 'precision,qualifier' &&
        typeof dateValue.qualifier === 'string' && dateValue.qualifier.trim().length > 0
    case 'EXACT': {
      const { precision: _precision, ...instant } = dateValue
      return exactDate(instant)
    }
    case 'RANGE': {
      if (Object.keys(dateValue).sort().join(',') !== 'earliest,latest,precision') return false
      const earliest = dateValue.earliest
      const latest = dateValue.latest
      return exactDate(earliest) && exactDate(latest) && Date.parse(earliest.utc) <= Date.parse(latest.utc)
    }
    default:
      return false
  }
}

const dateValueField = () => text({ null: true, private: true, validate: (value: unknown) =>
  isWitnessDateValue(value) ? null : 'date slot must be null or a valid M16-02 date value',
})

const witnessTestimonies = defineModel({
  label: 'Private Witness Record',
  rest: false,
  seedless: true,
  fields: {
    stableId: str({ maxLength: 80, unique: true, private: true }),
    ownerPrincipalRef: str({ maxLength: 160, private: true }),
    witnessSubjectRef: str({ maxLength: 160, null: true, private: true }),
    consentRecordRef: str({ maxLength: 160, null: true, private: true }),
    visibility: sel(WITNESS_VISIBILITY, { default: 'PRIVATE' }),
    revision: int({ default: 1, validate: (value: unknown) => value === 1 ? null : 'the original witness record starts at revision 1' }),
    originalObjectKey: str({ maxLength: 512, private: true }),
    originalDigest: str({ maxLength: 64, private: true, validate: (value: unknown) => SHA256_RE.test(String(value)) ? null : 'original object digest must be a SHA-256 hex value' }),
    originalSize: int({ validate: (value: unknown) => Number.isInteger(Number(value)) && Number(value) >= 0 ? null : 'original object size must be a non-negative integer' }),
    originalContentType: str({ maxLength: 127, private: true }),
    minorProtectedFlag: bool({ default: true, private: true }),
    viewAclPrincipalRefs: str({ maxLength: 2048, private: true, validate: (value: unknown) => isViewAcl(value) ? null : 'view ACL must be a JSON array of unique principal references' }),
    occurredAt: dateValueField(),
    observedAt: dateValueField(),
    recordedAt: dateValueField(),
    writtenAt: dateValueField(),
  },
})

const witnessCorrections = defineModel({
  label: 'Private Witness Date Correction',
  rest: false,
  seedless: true,
  maxLimit: 1000,
  fields: {
    witnessRef: m2o('witness_testimonies', { index: true }),
    sequence: int({ validate: (value: unknown) => Number.isInteger(Number(value)) && Number(value) > 0 ? null : 'correction sequence must be a positive integer' }),
    targetSlot: sel(WITNESS_DATE_SLOTS),
    corrected: text({ private: true, validate: (value: unknown) => isWitnessDateValue(value) ? null : 'corrected must be a valid M16-02 date value' }),
    reason: text({ private: true }),
    assertedBy: str({ maxLength: 160, private: true }),
    assertedAt: str({ maxLength: 32, validate: (value: unknown) => UTC_INSTANT_RE.test(String(value)) && Number.isFinite(Date.parse(String(value))) ? null : 'assertedAt must be a UTC timestamp' }),
    basedOnRevision: int({ validate: (value: unknown) => Number.isInteger(Number(value)) && Number(value) > 0 ? null : 'based-on revision must be a positive integer' }),
    revisionNumber: int({ validate: (value: unknown) => Number.isInteger(Number(value)) && Number(value) > 1 ? null : 'corrected revision number must follow the original revision' }),
    appended: bool({ default: true }),
  },
  unique: [['witnessRef', 'sequence'], ['witnessRef', 'revisionNumber']],
})

const witnessConsentRecords = defineModel({
  label: 'Private Witness Consent Record',
  rest: false,
  seedless: true,
  fields: {
    stableId: str({ maxLength: 80, unique: true, private: true }),
    subjectPrincipalRef: str({ maxLength: 160, private: true }),
    consentType: sel(['FULL_ANONYMITY', 'VERIFIED_PSEUDONYM', 'PUBLIC_NAME_WITH_WRITTEN_PERMISSION'], { private: true }),
    scope: sel(['PRIVATE_ARCHIVE', 'INTERNAL', 'PUBLIC_ANONYMOUS', 'PUBLIC_ATTRIBUTED'], { private: true }),
    status: sel(['UNKNOWN', 'GRANTED', 'WITHDRAWN'], { default: 'UNKNOWN', private: true }),
    evidenceRef: str({ maxLength: 256, private: true }),
    minorProtected: bool({ default: true, private: true }),
    guardianPrincipalRef: str({ maxLength: 160, null: true, private: true }),
    guardianVerified: bool({ default: false, private: true }),
    recordedByPrincipalRef: str({ maxLength: 160, private: true }),
    recordedAt: ts({ private: true }),
    validUntil: ts({ null: true, private: true }),
  },
})

const PRIVATE_WITNESS_SCOPES = new Set(['PRIVATE_ARCHIVE', 'INTERNAL'])
const MAX_GRANT_TTL_MS = 5 * 60 * 1000
const ECHOLOG_DIGEST_RE = /^[a-f0-9]{64}$/i
const CONTENT_TYPE_RE = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i

function isConsentActive(consent: Row, now = Date.now()): boolean {
  if (consent.status !== 'GRANTED' || !PRIVATE_WITNESS_SCOPES.has(String(consent.scope))) return false
  if (consent.validUntil === null || consent.validUntil === undefined || consent.validUntil === '') return true
  const validUntil = Date.parse(String(consent.validUntil))
  return Number.isFinite(validUntil) && validUntil > now
}

async function rawRow(repo: ModelRepo, id: string): Promise<Row | null> {
  const found = await repo.search({ limit: 1, where: { id }, raw: true })
  return found.rows[0] ?? null
}

async function consentForRecord(orm: WitnessOrm, consentRef: unknown): Promise<Row | null> {
  if (typeof consentRef !== 'string' || !consentRef.trim()) return null
  return rawRow(orm.model('witness_consent_records'), consentRef)
}

function isViewAcl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) && parsed.length > 0 && parsed.every((principal) => typeof principal === 'string' && principal.trim().length > 0)
      && new Set(parsed).size === parsed.length
  } catch {
    return false
  }
}

function viewAclContains(witness: Row, principalRef: string): boolean {
  if (typeof witness.viewAclPrincipalRefs !== 'string' || !isViewAcl(witness.viewAclPrincipalRefs)) return false
  const principals = JSON.parse(witness.viewAclPrincipalRefs) as string[]
  return principals.includes(principalRef)
}

function authorizeWitnessRead(witness: Row, consent: Row | null, user: User | null): Row {
  if (!user) throw unauthorized()
  if (!consent || !isConsentActive(consent)) throw notFound('private witness record not found')
  if (witness.consentRecordRef !== consent.id || witness.witnessSubjectRef !== consent.subjectPrincipalRef) {
    throw notFound('private witness record not found')
  }

  if (!viewAclContains(witness, user.id)) throw notFound('private witness record not found')
  if (consent.minorProtected === true && (
    consent.guardianVerified !== true || consent.guardianPrincipalRef !== user.id
  )) throw notFound('private witness record not found')
  return consent
}

function echologBaseUrl(configuredUrl: string | undefined): URL {
  try {
    const url = new URL(configuredUrl?.trim() || ECHOLOG_URL_DEFAULT)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('invalid ECHOLOG origin')
    }
    return url
  } catch {
    throw serviceUnavailable('ECHOLOG is not configured for private witness access')
  }
}

function sessionToken(user: User | null): string {
  const token = user?.meta?.token
  if (typeof token !== 'string' || token.length === 0) throw unauthorized()
  return token
}

async function echologJson(url: URL, token: string): Promise<Record<string, unknown>> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(3_000),
    })
  } catch {
    throw serviceUnavailable('ECHOLOG is temporarily unavailable')
  }
  if (response.status === 401 || response.status === 403) throw unauthorized()
  if (!response.ok) throw serviceUnavailable('ECHOLOG is temporarily unavailable')
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw serviceUnavailable('ECHOLOG returned an invalid response')
  }
  if (!isRecord(payload)) throw serviceUnavailable('ECHOLOG returned an invalid response')
  return payload
}

async function markEchologPrivateWitness(
  baseUrl: URL,
  token: string,
  digest: string,
  objectKey: string,
): Promise<Record<string, unknown>> {
  let response: Response
  try {
    response = await fetch(new URL(`/api/v1/objects/sha256/${digest}/private-witness`, baseUrl), {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ objectKey, requireAlreadyMarked: true }),
      redirect: 'error',
      signal: AbortSignal.timeout(3_000),
    })
  } catch {
    throw serviceUnavailable('ECHOLOG is temporarily unavailable')
  }
  if (response.status === 401 || response.status === 403 || response.status === 404) throw notFound('eligible ECHOLOG object not found')
  if (!response.ok) throw serviceUnavailable('ECHOLOG could not protect the private witness object')
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw serviceUnavailable('ECHOLOG returned invalid protected-object metadata')
  }
  if (!isRecord(payload)) throw serviceUnavailable('ECHOLOG returned invalid protected-object metadata')
  return payload
}

async function issueEchologGrant(baseUrl: URL, token: string, digest: string): Promise<{ url: string; expires_at: string }> {
  const path = `/api/v1/objects/sha256/${digest}`
  const payload = await echologJson(new URL(path, baseUrl), token)
  if (typeof payload.url !== 'string' || typeof payload.expires_at !== 'string') {
    throw serviceUnavailable('ECHOLOG returned an invalid download grant')
  }
  let downloadUrl: URL
  try {
    downloadUrl = new URL(payload.url, baseUrl)
  } catch {
    throw serviceUnavailable('ECHOLOG returned an invalid download grant')
  }
  const expiresAt = Date.parse(payload.expires_at)
  const now = Date.now()
  const grantTokens = downloadUrl.searchParams.getAll('grant')
  if (
    downloadUrl.origin !== baseUrl.origin || downloadUrl.pathname !== path || downloadUrl.hash ||
    grantTokens.length !== 1 || !grantTokens[0] || grantTokens[0].length > 2048 ||
    [...downloadUrl.searchParams.keys()].some((key) => key !== 'grant') ||
    !Number.isFinite(expiresAt) || expiresAt <= now || expiresAt > now + MAX_GRANT_TTL_MS
  ) {
    throw serviceUnavailable('ECHOLOG returned an invalid download grant')
  }
  return { url: downloadUrl.toString(), expires_at: new Date(expiresAt).toISOString() }
}

function requireText(row: Record<string, unknown>, fields: string[], label: string): void {
  for (const field of fields) {
    if (typeof row[field] !== 'string' || row[field].trim().length === 0) {
      throw badRequest(`${label} requires ${field}`)
    }
  }
}

function immutableRecord(): never {
  // This blocks ordinary ModelRepo.update/remove calls. MoonQL's removeWhere
  // and raw engine interfaces bypass model hooks; D06 has no REST route or
  // endpoint, and future code must not use those internal escape hatches here.
  throw badRequest('private witness originals are immutable; append a date correction')
}

function appendOnlyCorrection(): never {
  throw badRequest('private witness corrections are append-only')
}

export const witnessAddon = defineAddon({
  name: 'witness',
  depends: ['base', 'auth'],
  env: ['ECHOLOG_URL'],
  models: {
    witness_testimonies: witnessTestimonies,
    witness_corrections: witnessCorrections,
    witness_consent_records: witnessConsentRecords,
  },
  endpoints: {
    '/witness/consents': {
      method: 'POST',
      requires: ['admin'],
      body: {
        stableId: str({ maxLength: 80 }),
        subjectPrincipalRef: str({ maxLength: 160 }),
        consentType: sel(['FULL_ANONYMITY', 'VERIFIED_PSEUDONYM', 'PUBLIC_NAME_WITH_WRITTEN_PERMISSION']),
        scope: sel(['PRIVATE_ARCHIVE', 'INTERNAL', 'PUBLIC_ANONYMOUS', 'PUBLIC_ATTRIBUTED']),
        evidenceRef: str({ maxLength: 256 }),
        minorProtected: bool({ default: true }),
        guardianPrincipalRef: str({ maxLength: 160, null: true }),
        guardianVerified: bool({ default: false }),
        validUntil: ts({ null: true }),
      },
      handler: async ({ body, orm, user, status }) => {
        if (!user) throw unauthorized()
        const consent = await orm.model('witness_consent_records').create({
          stableId: body.stableId,
          subjectPrincipalRef: body.subjectPrincipalRef,
          consentType: body.consentType,
          scope: body.scope,
          evidenceRef: body.evidenceRef,
          status: 'GRANTED',
          minorProtected: body.minorProtected,
          guardianPrincipalRef: body.guardianPrincipalRef,
          guardianVerified: body.guardianVerified,
          recordedByPrincipalRef: user.id,
          recordedAt: new Date().toISOString(),
          validUntil: body.validUntil,
        })
        status(201)
        return { id: consent.id, status: 'GRANTED' }
      },
    },
    '/witness/testimonies': {
      method: 'POST',
      requires: 'auth',
      body: {
        stableId: str({ maxLength: 80 }),
        consentRecordRef: str({ maxLength: 160 }),
        originalObjectKey: str({ maxLength: 512 }),
        originalDigest: str({ maxLength: 64 }),
        originalSize: int(),
        originalContentType: str({ maxLength: 127 }),
      },
      handler: async ({ body, env, orm: rawOrm, user, status }) => {
        if (!user) throw unauthorized()
        const orm = rawOrm as WitnessOrm
        const consent = await consentForRecord(orm, body.consentRecordRef)
        const guardianMayIntake = consent?.minorProtected === true && consent.guardianVerified === true && consent.guardianPrincipalRef === user.id
        const subjectMayIntake = consent?.minorProtected !== true && consent?.subjectPrincipalRef === user.id
        if (
          !consent || !isConsentActive(consent) || (!subjectMayIntake && !guardianMayIntake)
        ) {
          throw notFound('eligible witness consent not found')
        }
        const digest = String(body.originalDigest)
        const contentType = String(body.originalContentType).trim()
        if (!ECHOLOG_DIGEST_RE.test(digest) || !CONTENT_TYPE_RE.test(contentType)) {
          throw badRequest('valid ECHOLOG digest and content type are required')
        }
        // ECHOLOG's irreversible marker closes direct REST/S3 paths before a
        // D06 reference is created. If database creation later fails, the
        // object remains protected (a safe orphan that needs operator review).
        const objectKey = String(body.originalObjectKey)
        const protectedMetadata = await markEchologPrivateWitness(
          echologBaseUrl(env.ECHOLOG_URL),
          sessionToken(user),
          digest,
          objectKey,
        )
        if (
          protectedMetadata.digest !== digest || protectedMetadata.size !== Number(body.originalSize) ||
          String(protectedMetadata.content_type).toLowerCase() !== contentType.toLowerCase()
        ) throw badRequest('ECHOLOG object metadata does not match the supplied reference')
        const record = await orm.model('witness_testimonies').create({
          stableId: body.stableId,
          ownerPrincipalRef: user.id,
          witnessSubjectRef: consent.subjectPrincipalRef,
          consentRecordRef: String(consent.id),
          visibility: 'PRIVATE',
          revision: 1,
          originalObjectKey: objectKey,
          originalDigest: digest,
          originalSize: Number(body.originalSize),
          originalContentType: contentType,
          minorProtectedFlag: consent.minorProtected === true,
          viewAclPrincipalRefs: JSON.stringify([...new Set([user.id, consent.subjectPrincipalRef, ...(guardianMayIntake ? [user.id] : [])])]),
        })
        status(201)
        return { id: record.id, visibility: 'PRIVATE' }
      },
    },
    '/witness/private-media-authorize': {
      method: 'POST',
      requires: 'auth',
      body: { digest: str({ maxLength: 64 }) },
      handler: async ({ body, orm: rawOrm, user, status }) => {
        if (!user) throw unauthorized()
        const digest = String(body.digest ?? '')
        if (!ECHOLOG_DIGEST_RE.test(digest)) throw notFound('private witness media not found')
        const orm = rawOrm as WitnessOrm
        const found = await orm.model('witness_testimonies').search({ limit: 1000, where: { originalDigest: digest }, raw: true })
        for (const witness of found.rows) {
          const consent = await consentForRecord(orm, witness.consentRecordRef)
          try {
            authorizeWitnessRead(witness, consent, user)
            status(204)
            return null
          } catch {
            // Do not reveal whether a digest maps to another witness record.
          }
        }
        throw notFound('private witness media not found')
      },
    },
    '/witness/testimonies/:id/media-grant': {
      method: 'POST',
      requires: 'auth',
      handler: async ({ env, params, orm: rawOrm, user }) => {
        if (!user) throw unauthorized()
        const orm = rawOrm as WitnessOrm
        const witness = await rawRow(orm.model('witness_testimonies'), params.id ?? '')
        if (!witness) throw notFound('private witness record not found')
        const consent = await consentForRecord(orm, witness.consentRecordRef)
        authorizeWitnessRead(witness, consent, user)
        const digest = String(witness.originalDigest ?? '')
        if (!ECHOLOG_DIGEST_RE.test(digest)) throw notFound('private witness record not found')
        return issueEchologGrant(echologBaseUrl(env.ECHOLOG_URL), sessionToken(user), digest)
      },
    },
  },
  hooks: {
    witness_testimonies: {
      beforeCreate: (row) => {
        requireText(row, ['stableId', 'ownerPrincipalRef', 'originalObjectKey', 'originalDigest', 'originalContentType', 'viewAclPrincipalRefs'], 'private witness record')
        if (!row.stableId.startsWith('wt_')) throw badRequest('private witness stableId must use the wt_ prefix')
        if (row.visibility !== undefined && row.visibility !== 'PRIVATE') throw badRequest('new witness records must remain PRIVATE')
        if (row.revision !== undefined && row.revision !== 1) throw badRequest('new witness records must start at revision 1')
        return row
      },
      beforeUpdate: immutableRecord,
      beforeDelete: immutableRecord,
    },
    witness_corrections: {
      beforeCreate: (row) => {
        requireText(row, ['witnessRef', 'targetSlot', 'corrected', 'reason', 'assertedBy', 'assertedAt'], 'private witness correction')
        if (!WITNESS_DATE_SLOTS.includes(row.targetSlot as (typeof WITNESS_DATE_SLOTS)[number])) {
          throw badRequest('correction target must be one of the four date slots')
        }
        if (row.appended !== undefined && row.appended !== true) throw badRequest('corrections must be appended')
        if (Number(row.basedOnRevision) !== Number(row.sequence) || Number(row.revisionNumber) !== Number(row.sequence) + 1) {
          throw badRequest('correction revision must append to the preceding immutable revision')
        }
        return row
      },
      beforeUpdate: appendOnlyCorrection,
      beforeDelete: appendOnlyCorrection,
    },
    witness_consent_records: {
      beforeCreate: (row) => {
        requireText(row, ['stableId', 'subjectPrincipalRef', 'consentType', 'scope', 'evidenceRef', 'recordedByPrincipalRef', 'recordedAt'], 'private witness consent record')
        if (row.status !== 'UNKNOWN' && row.status !== 'GRANTED' && row.status !== 'WITHDRAWN') {
          throw badRequest('witness consent status is invalid')
        }
        if (row.minorProtected === true && (typeof row.guardianPrincipalRef !== 'string' || !row.guardianPrincipalRef.trim() || row.guardianVerified !== true)) {
          throw badRequest('minor witness consent requires a verified guardian')
        }
        if (row.guardianVerified === true && (typeof row.guardianPrincipalRef !== 'string' || !row.guardianPrincipalRef.trim())) {
          throw badRequest('guardian verification requires a guardian principal')
        }
        return row
      },
      beforeUpdate: (patch) => {
        if (Object.keys(patch).length === 1 && patch.status === 'WITHDRAWN') return patch
        throw badRequest('witness consent records are immutable except for withdrawal')
      },
      beforeDelete: () => { throw badRequest('witness consent records cannot be deleted') },
    },
  },
})

export default witnessAddon

/**
 * Append a private date correction. The immutable original stays revision 1;
 * correction N is based on revision N and creates derived revision N + 1.
 * ECHOLOG remains the sole owner of the original object bytes.
 */
export async function appendWitnessCorrection(orm: WitnessOrm, input: WitnessCorrectionInput): Promise<Row> {
  const testimonies = orm.model('witness_testimonies')
  const corrections = orm.model('witness_corrections')
  let witness: Row
  try {
    witness = await testimonies.get(input.witnessRef)
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 404) {
      throw notFound('private witness record not found')
    }
    throw error
  }
  if (witness.visibility !== 'PRIVATE' || witness.revision !== 1) {
    throw badRequest('witness corrections require an immutable PRIVATE revision-1 original')
  }
  if (!WITNESS_DATE_SLOTS.includes(input.targetSlot)) throw badRequest('correction target must be one of the four date slots')
  if (!isWitnessDateValue(input.corrected) || input.corrected === null) throw badRequest('corrected must be a valid M16-02 date value')
  if (!input.reason.trim() || !input.assertedBy.trim()) throw badRequest('correction reason and assertedBy are required')
  if (!UTC_INSTANT_RE.test(input.assertedAt) || !Number.isFinite(Date.parse(input.assertedAt))) {
    throw badRequest('assertedAt must be a UTC timestamp')
  }

  const pageSize = 200
  let offset = 0
  let sequence = 1
  for (;;) {
    const page = await corrections.list({ where: { witnessRef: input.witnessRef }, order: 'sequence', limit: pageSize, offset })
    for (const row of page) {
      if (row.sequence !== sequence || row.basedOnRevision !== sequence || row.revisionNumber !== sequence + 1) {
        throw conflict('witness correction history has an invalid revision chain')
      }
      sequence += 1
    }
    if (page.length < pageSize) break
    offset += pageSize
  }

  return corrections.create({
    witnessRef: input.witnessRef,
    sequence,
    targetSlot: input.targetSlot,
    corrected: input.corrected,
    reason: input.reason,
    assertedBy: input.assertedBy,
    assertedAt: input.assertedAt,
    basedOnRevision: sequence,
    revisionNumber: sequence + 1,
    appended: true,
  })
}
