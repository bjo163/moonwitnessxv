import { describeDrift, type SchemaDocument } from '@moonwitness/moonql-client'
import { serverClient } from './sdk'

/**
 * `/_schema` is per-instance and almost static (it only changes when the API
 * restarts), so one module-level cache serves every page for 30s.
 */
const TTL_MS = 30_000

let cache: { at: number; doc: SchemaDocument } | null = null

/**
 * This build was generated from one contract digest; the hub reports its own.
 * A mismatch means the two were deployed apart — the operator hears it once, at
 * the first page that needed the schema, instead of discovering it through a
 * form that silently drops a field the hub no longer has.
 */
const warned = new Set<string>()

export async function getSchema(): Promise<SchemaDocument> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.doc
  const doc = await serverClient().schema()
  cache = { at: Date.now(), doc }
  const drift = describeDrift(doc)
  if (drift && !warned.has(doc.schemaHash)) {
    warned.add(doc.schemaHash)
    console.warn(drift)
  }
  return doc
}

export function invalidateSchema(): void {
  cache = null
}
