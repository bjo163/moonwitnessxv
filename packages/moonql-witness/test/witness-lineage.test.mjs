import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bootMoonQl, buildSchemaDocument } from '@moonwitness/moonql'
import auth from '@moonwitness/moonql-auth'
import base from '@moonwitness/moonql-base'
import witnessAddon, { appendWitnessCorrection } from '../dist/index.js'

const quiet = { info() {}, warn() {} }
const originalDigest = 'a'.repeat(64)

const syntheticRange = (earliestUtc, earliestLocal, latestUtc, latestLocal) => JSON.stringify({
  precision: 'RANGE',
  earliest: { utc: earliestUtc, timezone: 'Asia/Jakarta', originalOffset: '+07:00', local: earliestLocal },
  latest: { utc: latestUtc, timezone: 'Asia/Jakarta', originalOffset: '+07:00', local: latestLocal },
})

async function withWitness(run) {
  const moonql = await bootMoonQl({ addons: [base, auth, witnessAddon], seedPolicy: 'off', cronEnabled: false, log: quiet })
  try {
    await run(moonql)
  } finally {
    await moonql.close()
  }
}

const inputRecord = (overrides = {}) => ({
  stableId: 'wt_illustrative_0001',
  ownerPrincipalRef: 'principal_synthetic_owner',
  originalObjectKey: 'attachments/opaque-original-0001',
  originalDigest,
  originalSize: 42,
  originalContentType: 'application/octet-stream',
  viewAclPrincipalRefs: JSON.stringify(['principal_synthetic_owner']),
  occurredAt: JSON.stringify({
    precision: 'EXACT',
    utc: '2026-10-28T02:00:00.000Z',
    timezone: 'Asia/Jakarta',
    originalOffset: '+07:00',
    local: '2026-10-28T09:00:00',
  }),
  observedAt: JSON.stringify({ precision: 'UNKNOWN' }),
  recordedAt: syntheticRange('2026-10-28T01:00:00.000Z', '2026-10-28T08:00:00', '2026-10-28T03:00:00.000Z', '2026-10-28T10:00:00'),
  writtenAt: JSON.stringify({ precision: 'APPROXIMATE', qualifier: 'synthetic late morning' }),
  ...overrides,
})

const correctionInput = (witnessRef, overrides = {}) => ({
  witnessRef,
  targetSlot: 'occurredAt',
  corrected: JSON.stringify({
    precision: 'EXACT',
    utc: '2026-10-28T01:30:00.000Z',
    timezone: 'Asia/Jakarta',
    originalOffset: '+07:00',
    local: '2026-10-28T08:30:00',
  }),
  reason: 'Synthetic correction fixture; not testimony.',
  assertedBy: 'principal_synthetic_witness',
  assertedAt: '2026-10-28T00:00:00.000Z',
  ...overrides,
})

test('M16-03: date corrections append without changing the private original or ECHOLOG reference', async () => {
  await withWitness(async (moonql) => {
    const record = await moonql.model('witness_testimonies').create(inputRecord())
    assert.equal(record.visibility, 'PRIVATE')
    assert.equal(moonql.registry.models.get('witness_testimonies')?.rest, false)
    assert.equal(moonql.registry.models.get('witness_corrections')?.rest, false)
    const schema = buildSchemaDocument(moonql.registry)
    assert.equal('witness_testimonies' in schema.models, false)
    assert.equal('witness_corrections' in schema.models, false)
    assert.equal('bodyText' in witnessAddon.models.witness_testimonies.fields, false, 'object bytes/text are referenced, not stored in a SQL body field')
    for (const slot of ['occurredAt', 'observedAt', 'recordedAt', 'writtenAt']) {
      assert.ok(slot in witnessAddon.models.witness_testimonies.fields, `${slot} is stored independently`)
      assert.equal(witnessAddon.models.witness_testimonies.fields[slot].private, true)
    }
    assert.equal(witnessAddon.models.witness_testimonies.fields.viewAclPrincipalRefs.private, true)

    const originalEngine = moonql.engines.get('witness_testimonies')
    assert.ok(originalEngine)
    const correctionEngine = moonql.engines.get('witness_corrections')
    assert.ok(correctionEngine)

    const first = await appendWitnessCorrection(moonql, correctionInput(String(record.id)))
    const second = await appendWitnessCorrection(moonql, correctionInput(String(record.id), {
      targetSlot: 'writtenAt',
      corrected: syntheticRange('2026-10-28T01:00:00.000Z', '2026-10-28T08:00:00', '2026-10-28T02:00:00.000Z', '2026-10-28T09:00:00'),
    }))

    assert.equal(first.sequence, 1)
    assert.equal(first.basedOnRevision, 1)
    assert.equal(first.revisionNumber, 2)
    assert.equal(second.sequence, 2)
    assert.equal(second.basedOnRevision, 2)
    assert.equal(second.revisionNumber, 3)
    assert.equal(first.appended, true)
    assert.equal(second.appended, true)

    const storedOriginal = await originalEngine.find(String(record.id))
    assert.equal(storedOriginal?.originalObjectKey, 'attachments/opaque-original-0001')
    assert.equal(storedOriginal?.originalDigest, originalDigest)
    assert.equal(storedOriginal?.visibility, 'PRIVATE')
    assert.equal(storedOriginal?.revision, 1)
    assert.equal(storedOriginal?.occurredAt, inputRecord().occurredAt)
    assert.equal(storedOriginal?.observedAt, JSON.stringify({ precision: 'UNKNOWN' }))
    assert.equal(storedOriginal?.recordedAt, inputRecord().recordedAt)
    assert.equal(storedOriginal?.writtenAt, JSON.stringify({ precision: 'APPROXIMATE', qualifier: 'synthetic late morning' }))
    const storedCorrections = await correctionEngine.list({ limit: 10, offset: 0 })
    assert.deepEqual(storedCorrections.map((row) => row.sequence), [1, 2])
    assert.deepEqual(storedCorrections.map((row) => row.targetSlot), ['occurredAt', 'writtenAt'])
    assert.deepEqual(storedCorrections.map((row) => row.revisionNumber), [2, 3])
    const safeRead = await moonql.model('witness_testimonies').list()
    assert.equal(safeRead[0]?.stableId, undefined)
    assert.equal(safeRead[0]?.viewAclPrincipalRefs, undefined)
    assert.equal(safeRead[0]?.occurredAt, undefined)
  })
})

test('M16-03: reject original overwrite/removal, correction mutation/removal, and invalid corrections', async () => {
  await withWitness(async (moonql) => {
    const testimony = moonql.model('witness_testimonies')
    const correctionRepo = moonql.model('witness_corrections')
    const record = await testimony.create(inputRecord())
    const originalEngine = moonql.engines.get('witness_testimonies')
    assert.ok(originalEngine)

    await assert.rejects(testimony.update(String(record.id), { originalObjectKey: 'sha256/summary-replacement' }), /immutable/)
    await assert.rejects(testimony.remove(String(record.id)), /immutable/)
    await assert.rejects(testimony.create(inputRecord({ visibility: 'PUBLIC' })), /PRIVATE/)
    await assert.rejects(testimony.create(inputRecord({ originalDigest: 'not-a-digest' })), /SHA-256/)
    await assert.rejects(testimony.create(inputRecord({ observedAt: '{"precision":"UNKNOWN","utc":"invented"}' })), /M16-02/)
    await assert.rejects(testimony.create(inputRecord({
      recordedAt: syntheticRange('2026-10-28T03:00:00.000Z', '2026-10-28T10:00:00', '2026-10-28T01:00:00.000Z', '2026-10-28T08:00:00'),
    })), /M16-02/)
    await assert.rejects(testimony.create(inputRecord({
      observedAt: JSON.stringify({
        precision: 'EXACT',
        utc: '2026-10-28T02:00:00.000Z',
        timezone: 'Asia/Jakarta',
        originalOffset: '+07:00',
        local: '2026-10-28T10:00:00',
      }),
    })), /M16-02/)

    await assert.rejects(appendWitnessCorrection(moonql, correctionInput('missing-witness-id')), /not found/)
    await assert.rejects(appendWitnessCorrection(moonql, correctionInput(String(record.id), { targetSlot: 'SUMMARY' })), /four date slots/)
    await assert.rejects(appendWitnessCorrection(moonql, correctionInput(String(record.id), { corrected: '{"precision":"UNKNOWN","utc":"2026-10-28T00:00:00Z"}' })), /valid M16-02/)
    await assert.rejects(appendWitnessCorrection(moonql, correctionInput(String(record.id), { assertedAt: '2026-10-28T07:00:00+07:00' })), /UTC timestamp/)

    const correction = await appendWitnessCorrection(moonql, correctionInput(String(record.id)))
    await assert.rejects(correctionRepo.update(String(correction.id), { reason: 'overwrite' }), /append-only/)
    await assert.rejects(correctionRepo.remove(String(correction.id)), /append-only/)
    await assert.rejects(correctionRepo.create({
      ...correctionInput(String(record.id)),
      sequence: 0,
      basedOnRevision: 0,
      revisionNumber: 1,
      appended: true,
    }), /positive integer/)

    const stored = await originalEngine.find(String(record.id))
    assert.equal(stored?.originalObjectKey, 'attachments/opaque-original-0001')
    assert.equal(stored?.originalDigest, originalDigest)
  })
})
