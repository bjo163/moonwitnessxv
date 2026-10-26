export type ScanStatus = 'pending' | 'clean' | 'infected' | 'skipped'

/** Reference consumers may retain; object bytes remain in the storage owner. */
export interface ObjectReference {
  object_key: string
  digest: string
  size: number
  content_type: string
}

/** Sidecar fields travel with an object and do not imply a SQL record. */
export interface ObjectSidecar extends ObjectReference {
  filename: string
  uploader: string
  created_at: string
  retention_until: string | null
  legal_hold: boolean
  scan: ScanStatus
  tags: string[]
}

/** Contract only: M39-06 intentionally supplies no active storage driver. */
export interface StorageDriver {
  put(objectKey: string, bytes: Uint8Array, sidecar: ObjectSidecar): Promise<void>
  get(objectKey: string): Promise<{ bytes: Uint8Array; sidecar: ObjectSidecar } | null>
  delete(objectKey: string): Promise<void>
}

export { FsStorageDriver, ObjectHeldError, QuotaExceededError } from './driver/fs.js'
export type { FsStorageDriverOptions, GcResult } from './driver/fs.js'
export { createS3ClientFromEnvironment, S3StorageDriver } from './driver/s3.js'
export type { S3ClientEnvironment, S3StorageDriverOptions } from './driver/s3.js'

export interface ObjectMetadataInput {
  filename: string
  content_type: string
  uploader: string
  retention_until?: string | null
  legal_hold?: boolean
  scan?: ScanStatus
  tags?: string[]
}

/** SHA-256 digest helper using the standard Web Crypto API, without Node imports. */
export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const input = new Uint8Array(bytes.byteLength)
  input.set(bytes)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', input.buffer)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
