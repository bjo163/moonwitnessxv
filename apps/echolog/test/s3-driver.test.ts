import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CreateBucketCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { test } from 'node:test'
import {
  createS3ClientFromEnvironment,
  FsStorageDriver,
  ObjectHeldError,
  S3StorageDriver,
  sha256Hex,
} from '@moonwitness/echolog-core'
import type { ObjectMetadataInput, ObjectSidecar, StorageDriver } from '@moonwitness/echolog-core'

const environment = s3TestEnvironment()

async function metadataFor(bytes: Uint8Array, overrides: Partial<ObjectMetadataInput> = {}): Promise<ObjectSidecar> {
  const digest = await sha256Hex(bytes)
  return {
    object_key: `sha256/${digest}`,
    digest,
    size: bytes.byteLength,
    content_type: 'application/octet-stream',
    filename: 'parity.bin',
    uploader: 's3-driver-test',
    created_at: new Date('2026-10-27T00:00:00.000Z').toISOString(),
    retention_until: overrides.retention_until ?? null,
    legal_hold: overrides.legal_hold ?? false,
    scan: overrides.scan ?? 'skipped',
    tags: overrides.tags ?? ['parity'],
  }
}

async function runStorageParity(label: string, create: () => Promise<{ driver: StorageDriver; after?: () => Promise<void> }>): Promise<void> {
  const { driver, after } = await create()
  const bytes = new TextEncoder().encode(`parity-${label}-${globalThis.crypto.randomUUID()}`)
  const sidecar = await metadataFor(bytes)
  try {
    await driver.put(sidecar.object_key, bytes, sidecar)
    const stored = await driver.get(sidecar.object_key)
    assert.ok(stored)
    assert.deepEqual(stored.bytes, bytes)
    assert.deepEqual({ ...stored.sidecar, created_at: sidecar.created_at }, sidecar)
    await driver.put(sidecar.object_key, bytes, { ...sidecar, filename: 'replacement.bin' })
    assert.equal((await driver.get(sidecar.object_key))?.sidecar.filename, 'parity.bin', 'duplicate bytes retain first metadata')
    await driver.delete(sidecar.object_key)
    assert.equal(await driver.get(sidecar.object_key), null)
  } finally {
    await driver.delete(sidecar.object_key).catch(() => undefined)
    await after?.()
  }
}

void test('fs driver passes the shared S3 storage operation contract', async () => {
  await runStorageParity('fs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'echolog-fs-s3-parity-'))
    return {
      driver: new FsStorageDriver({ root, quotaBytes: 1024 * 1024 }),
      after: () => rm(root, { recursive: true, force: true }),
    }
  })
})

void test('S3 driver passes the same storage operations against local MinIO', {
  skip: !environment,
}, async () => {
  assert.ok(environment)
  const client = createS3ClientFromEnvironment(environment)
  const driver = new S3StorageDriver({ bucket: environment.bucket, client })
  await client.send(new CreateBucketCommand({ Bucket: environment.bucket }))
  await runStorageParity('s3', async () => ({ driver }))
  const bytes = new TextEncoder().encode(`signed-get-${globalThis.crypto.randomUUID()}`)
  const sidecar = await metadataFor(bytes)
  await driver.put(sidecar.object_key, bytes, sidecar)
  try {
    const head = await driver.head(sidecar.object_key)
    assert.deepEqual(head, {
      size: bytes.byteLength,
      digest: sidecar.digest,
      contentType: sidecar.content_type,
    })
    const url = new URL(await driver.presignedGet(sidecar.object_key, 120))
    assert.equal(url.hostname, new URL(environment.endpoint).hostname)
    await assert.rejects(driver.presignedGet(sidecar.object_key, 301), /between 1 and 300 seconds/)
  } finally {
    await driver.delete(sidecar.object_key)
    client.destroy()
  }
})

void test('S3 driver fails closed with bad credentials and creates no object in local MinIO', {
  skip: !environment,
}, async () => {
  assert.ok(environment)
  const wrongClient = createS3ClientFromEnvironment({
    ...environment,
    accessKeyId: `${environment.accessKeyId}-wrong`,
    secretAccessKey: `${environment.secretAccessKey}-wrong`,
  })
  const validClient = createS3ClientFromEnvironment(environment)
  const badDriver = new S3StorageDriver({ bucket: environment.bucket, client: wrongClient })
  const validDriver = new S3StorageDriver({ bucket: environment.bucket, client: validClient })
  const bytes = new TextEncoder().encode(`bad-credentials-${globalThis.crypto.randomUUID()}`)
  const sidecar = await metadataFor(bytes)
  try {
    await assert.rejects(badDriver.put(sidecar.object_key, bytes, sidecar))
    assert.equal(await validDriver.get(sidecar.object_key), null)
  } finally {
    wrongClient.destroy()
    validClient.destroy()
  }
})

void test('S3 driver applies the same retention and legal-hold deletion guard with local MinIO', {
  skip: !environment,
}, async () => {
  assert.ok(environment)
  const client = createS3ClientFromEnvironment(environment)
  const driver = new S3StorageDriver({ bucket: environment.bucket, client, now: () => new Date('2026-10-27T00:00:00.000Z') })
  const bytes = new TextEncoder().encode(`held-${globalThis.crypto.randomUUID()}`)
  const sidecar = await metadataFor(bytes, { legal_hold: true })
  try {
    await driver.put(sidecar.object_key, bytes, sidecar)
    await assert.rejects(driver.delete(sidecar.object_key), (error: unknown) => error instanceof ObjectHeldError && error.reason === 'legal_hold')
    const gc = await driver.gc()
    assert.ok(gc.held.some((item) => item.object_key === sidecar.object_key && item.reason === 'legal_hold'))
  } finally {
    // Delete only this test object directly after proving the protected delete path.
    await client.send(new DeleteObjectCommand({ Bucket: environment.bucket, Key: sidecar.object_key })).catch(() => undefined)
    await client.send(new DeleteObjectCommand({ Bucket: environment.bucket, Key: `metadata/${sidecar.digest}.json` })).catch(() => undefined)
    client.destroy()
  }
})

function s3TestEnvironment() {
  const endpoint = process.env.ECHOLOG_S3_TEST_ENDPOINT
  const accessKeyId = process.env.ECHOLOG_S3_TEST_ACCESS_KEY
  const secretAccessKey = process.env.ECHOLOG_S3_TEST_SECRET_KEY
  const bucket = process.env.ECHOLOG_S3_TEST_BUCKET
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) return null
  let url: URL
  try {
    url = new URL(endpoint)
  } catch {
    throw new Error('ECHOLOG_S3_TEST_ENDPOINT must be a local MinIO URL')
  }
  if (!['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
    throw new Error('S3 parity tests accept only localhost MinIO endpoints')
  }
  if (!bucket.startsWith('echolog-test-')) {
    throw new Error('S3 parity tests require a dedicated echolog-test-* bucket because GC scans its contents')
  }
  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    region: process.env.ECHOLOG_S3_TEST_REGION || 'us-east-1',
    forcePathStyle: true,
  }
}
