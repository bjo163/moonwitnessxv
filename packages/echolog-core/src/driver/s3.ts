import { createHash } from 'node:crypto'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectTaggingCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { ObjectSidecar, StorageDriver } from '../index.js'
import { parseObjectSidecar } from '../sidecar.js'
import { ObjectHeldError, type GcResult } from './fs.js'

export interface S3StorageDriverOptions {
  bucket: string
  client: S3Client
  now?: () => Date
}

export interface S3ClientEnvironment {
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
  forcePathStyle?: boolean
}

/** Creates a client from ECHOLOG-owned environment values; callers never persist credentials. */
export function createS3ClientFromEnvironment(environment: S3ClientEnvironment): S3Client {
  const config: S3ClientConfig = {
    endpoint: environment.endpoint,
    region: environment.region,
    forcePathStyle: environment.forcePathStyle ?? true,
    credentials: {
      accessKeyId: environment.accessKeyId,
      secretAccessKey: environment.secretAccessKey,
      ...(environment.sessionToken ? { sessionToken: environment.sessionToken } : {}),
    },
  }
  return new S3Client(config)
}

/** S3-compatible immutable object driver. It stores sidecars beside object keys under `metadata/`. */
export class S3StorageDriver implements StorageDriver {
  private readonly bucket: string
  private readonly client: S3Client
  private readonly now: () => Date

  constructor(options: S3StorageDriverOptions) {
    if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(options.bucket)) {
      throw new TypeError('bucket must be a valid S3 bucket name')
    }
    this.bucket = options.bucket
    this.client = options.client
    this.now = options.now ?? (() => new Date())
  }

  async ready(): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
  }

  async put(objectKey: string, bytes: Uint8Array, sidecar: ObjectSidecar): Promise<void> {
    this.validateKey(objectKey)
    parseObjectSidecar(sidecar)
    const copy = new Uint8Array(bytes)
    const digest = createHash('sha256').update(copy).digest('hex')
    if (objectKey !== `sha256/${digest}` || sidecar.digest !== digest || sidecar.object_key !== objectKey || sidecar.size !== copy.byteLength) {
      throw new Error('Object key and sidecar must match the uploaded bytes')
    }
    const first = await this.get(objectKey)
    if (first) {
      if (first.bytes.byteLength !== copy.byteLength || createHash('sha256').update(first.bytes).digest('hex') !== digest) {
        throw new Error('Content-addressed object is corrupt')
      }
      return
    }

    const existing = await this.head(objectKey)
    if (existing) {
      if (existing.digest !== digest || existing.size !== copy.byteLength) throw new Error('Content-addressed object is corrupt')
      await this.putSidecarIfAbsent(objectKey, sidecar)
      return
    }

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      Body: copy,
      ContentLength: copy.byteLength,
      ContentType: sidecar.content_type,
      Metadata: toObjectMetadata(sidecar),
      Tagging: toTagging(sidecar.tags),
      IfNoneMatch: '*',
    }))
    // The full JSON sidecar is a separate object to avoid S3's small user-metadata limit.
    // If this write fails, GET remains invisible and a retry can finish the object.
    await this.putSidecarIfAbsent(objectKey, sidecar)
  }

  async get(objectKey: string): Promise<{ bytes: Uint8Array; sidecar: ObjectSidecar } | null> {
    this.validateKey(objectKey)
    try {
      const [object, sidecarObject, objectTags] = await Promise.all([
        this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: objectKey })),
        this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: metadataKey(objectKey) })),
        this.client.send(new GetObjectTaggingCommand({ Bucket: this.bucket, Key: objectKey })),
      ])
      if (!object.Body || !sidecarObject.Body) return null
      const bytes = new Uint8Array(await object.Body.transformToByteArray())
      const json = await sidecarObject.Body.transformToString()
      const sidecar = parseObjectSidecar(JSON.parse(json))
      const digest = createHash('sha256').update(bytes).digest('hex')
      if (sidecar.object_key !== objectKey || sidecar.digest !== digest || sidecar.size !== bytes.byteLength) return null
      if (object.ContentType !== sidecar.content_type) return null
      const objectMetadata = object.Metadata ?? {}
      const expectedMetadata = toObjectMetadata(sidecar)
      if (Object.entries(expectedMetadata).some(([key, value]) => objectMetadata[key] !== value)) return null
      const expectedTags = [...sidecar.tags].sort()
      const actualTags = (objectTags.TagSet ?? []).map((tag) => tag.Value ?? '').sort()
      if (actualTags.length !== expectedTags.length || actualTags.some((tag, index) => tag !== expectedTags[index])) return null
      return { bytes, sidecar }
    } catch (error) {
      if (isMissing(error)) return null
      throw error
    }
  }

  async head(objectKey: string): Promise<{ size: number; digest: string; contentType: string } | null> {
    this.validateKey(objectKey)
    try {
      const result = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: objectKey }))
      const digest = result.Metadata?.digest
      const size = result.ContentLength
      if (!digest || !/^[a-f0-9]{64}$/.test(digest) || typeof size !== 'number' || !Number.isSafeInteger(size) || size < 0 || !result.ContentType) return null
      return { size, digest, contentType: result.ContentType }
    } catch (error) {
      if (isMissing(error)) return null
      throw error
    }
  }

  async presignedGet(objectKey: string, expiresInSeconds = 300): Promise<string> {
    this.validateKey(objectKey)
    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > 300) {
      throw new RangeError('presigned GET expiry must be between 1 and 300 seconds')
    }
    if (!(await this.get(objectKey))) throw new Error('Object not found')
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }), { expiresIn: expiresInSeconds })
  }

  async delete(objectKey: string): Promise<void> {
    this.validateKey(objectKey)
    const object = await this.get(objectKey)
    if (!object) return
    const reason = holdReason(object.sidecar, this.now())
    if (reason) throw new ObjectHeldError(reason)
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: objectKey }))
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: metadataKey(objectKey) }))
  }

  async gc(at = this.now()): Promise<GcResult> {
    const result: GcResult = { deleted: [], held: [], bytes_freed: 0 }
    let continuationToken: string | undefined
    do {
      const page = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: 'sha256/',
        ContinuationToken: continuationToken,
      }))
      for (const item of page.Contents ?? []) {
        if (!item.Key || !/^sha256\/[a-f0-9]{64}$/.test(item.Key)) continue
        const sidecar = await this.readSidecar(item.Key)
        if (!sidecar) {
          const orphan = await this.head(item.Key)
          if (orphan) {
            await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: item.Key }))
            result.deleted.push(item.Key)
            result.bytes_freed += orphan.size
          }
          continue
        }
        const object = await this.get(item.Key)
        if (!object) continue // Keep corrupt or inconsistent objects for operator review.
        const reason = holdReason(object.sidecar, at)
        if (reason) {
          result.held.push({ object_key: item.Key, reason })
          continue
        }
        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: item.Key }))
        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: metadataKey(item.Key) }))
        result.deleted.push(item.Key)
        result.bytes_freed += object.sidecar.size
      }
      continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined
    } while (continuationToken)
    return result
  }

  private validateKey(objectKey: string): void {
    if (!/^sha256\/[a-f0-9]{64}$/.test(objectKey)) throw new TypeError('Object key must be sha256/<64 lowercase hex>')
  }

  private async putSidecarIfAbsent(objectKey: string, sidecar: ObjectSidecar): Promise<void> {
    const json = JSON.stringify(sidecar)
    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: metadataKey(objectKey),
        Body: json,
        ContentLength: Buffer.byteLength(json),
        ContentType: 'application/json',
        IfNoneMatch: '*',
      }))
    } catch (error) {
      if (!isAlreadyExists(error)) throw error
    }
  }

  private async readSidecar(objectKey: string): Promise<ObjectSidecar | null> {
    try {
      const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: metadataKey(objectKey) }))
      if (!response.Body) return null
      return parseObjectSidecar(JSON.parse(await response.Body.transformToString()))
    } catch (error) {
      if (isMissing(error)) return null
      throw error
    }
  }
}

function metadataKey(objectKey: string): string {
  return `metadata/${objectKey.slice('sha256/'.length)}.json`
}

function toObjectMetadata(sidecar: ObjectSidecar): Record<string, string> {
  return {
    digest: sidecar.digest,
    size: String(sidecar.size),
    filename: encodeURIComponent(sidecar.filename),
    uploader: encodeURIComponent(sidecar.uploader),
    created_at: sidecar.created_at,
    retention_until: sidecar.retention_until ?? '',
    legal_hold: String(sidecar.legal_hold),
    scan: sidecar.scan,
  }
}

function toTagging(tags: string[]): string | undefined {
  if (tags.length === 0) return undefined
  if (tags.length > 10) throw new TypeError('S3 supports at most 10 object tags')
  if (tags.some((tag) => !tag || Buffer.byteLength(tag, 'utf8') > 256)) throw new TypeError('S3 object tags must be non-empty and at most 256 UTF-8 bytes')
  const encode = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
  return tags.map((tag, index) => `tag${index + 1}=${encode(tag)}`).join('&')
}

function holdReason(sidecar: ObjectSidecar, at: Date): 'legal_hold' | 'retention_active' | null {
  if (sidecar.legal_hold) return 'legal_hold'
  if (sidecar.retention_until !== null && Date.parse(sidecar.retention_until) > at.getTime()) return 'retention_active'
  return null
}

function isMissing(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'name' in error && (error.name === 'NoSuchKey' || error.name === 'NotFound'))
}

function isAlreadyExists(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'name' in error && (error.name === 'PreconditionFailed' || error.name === 'ConditionalRequestConflict'))
}
