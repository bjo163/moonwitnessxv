import { badRequest, conflict, notFound } from '@moonwitness/core'
import {
  bool,
  defineAddon,
  defineModel,
  int,
  m2o,
  sel,
  str,
  text,
  type ModelRepo,
  type Row,
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
  model(name: 'witness_testimonies' | 'witness_corrections'): ModelRepo
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
  models: {
    witness_testimonies: witnessTestimonies,
    witness_corrections: witnessCorrections,
  },
  hooks: {
    witness_testimonies: {
      beforeCreate: (row) => {
        requireText(row, ['stableId', 'ownerPrincipalRef', 'originalObjectKey', 'originalDigest', 'originalContentType'], 'private witness record')
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
