import { SCHEMA_HASH } from './generated.js'

/**
 * Contract drift, detected at boot instead of at the first broken render.
 *
 * The generated client carries the digest of the `_schema` document it was built
 * from; the hub reports its own digest on the same document. When the two differ,
 * the frontend is running against a hub that moved — a field was renamed, a route
 * disappeared, a view changed shape. Nothing here throws away the request: the
 * point is one clear signal for the operator, not a second failure mode for the
 * user, so the decision to hard-stop stays with the caller.
 */

export interface SchemaDigest {
  schemaHash: string
  apiVersion: string
}

export interface SchemaDrift {
  /** digest baked into this build by `pnpm gen:sdk` */
  readonly expected: string
  /** digest the hub just reported */
  readonly actual: string
  /** the shapes disagree: treat cached views and forms as untrusted */
  readonly mismatched: boolean
  readonly hubApiVersion: string
}

export function schemaDrift(doc: SchemaDigest): SchemaDrift {
  return {
    expected: SCHEMA_HASH,
    actual: doc.schemaHash,
    mismatched: doc.schemaHash !== SCHEMA_HASH,
    hubApiVersion: doc.apiVersion,
  }
}

/**
 * One-line, log-safe summary. Both digests are named because "the frontend is
 * stale" and "the hub moved" look identical from the browser and need different
 * fixes. The hub's version rides along as context, never as the verdict: a version
 * bump with an unchanged contract is not a breakage and must not read like one.
 */
export function describeDrift(doc: SchemaDigest): string | null {
  const drift = schemaDrift(doc)
  if (!drift.mismatched) return null
  return `schema drift: this client was built for ${drift.expected} but the hub (api ${drift.hubApiVersion}) serves ${drift.actual} — rerun pnpm gen:sdk and redeploy`
}
