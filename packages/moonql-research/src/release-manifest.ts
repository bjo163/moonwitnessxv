/**
 * M18-03 prototype immutable release manifest and current-version pointer.
 *
 * This module is deliberately pure apart from `node:crypto`: no database, no
 * HTTP, no provider, no wall clock, no environment lookup and no dependency on
 * the D08 store, the MoonQL ORM or this package's barrel. It answers one
 * question for a public read — which single revision, if any, does the current
 * pointer authorize? — and otherwise returns a stable refusal code with no
 * content reference.
 *
 * The manifest is a record, not an approval path. It carries the approval
 * state that a named human reviewer already produced elsewhere, following the
 * single accepted path in ADR-0003 / M18-01:
 *
 *   DRAFT -> IN_REVIEW -> APPROVED_WITHIN_SCOPE -> PUBLISHED
 *
 * This module cannot transition states, cannot mint a reviewer, and does not
 * implement publication. It only reads the state and refuses everything that
 * is not currently approved within scope with cleared rights and consent.
 *
 * Immutability: every returned manifest, revision, pointer and resolution is
 * deeply `Object.freeze`-d and typed `readonly`. A correction or a new edition
 * is a new call to `buildReleaseManifest` with a new hash; there is no update,
 * overwrite, delete or in-place revision operation in this surface. A pointer
 * moves only by creating a new pointer record that references a different
 * manifest hash.
 *
 * Rights vocabulary follows the research/corpus terms already in this package
 * (`packages/moonql-research/src/seed.ts`): `PUBLIC_DOMAIN`,
 * `RIGHTS_EXACT_VERSION_CLEARED`, `METADATA_ONLY`, `RESTRICTED`,
 * `RIGHTS_UNKNOWN`. ADR-0003's `LICENSED` and `RESTRICTED_METADATA_ONLY` map to
 * the first-cleared and metadata-only/restricted members respectively.
 *
 * Not wired to any route, store, schema or migration. See
 * docs/audit/M18-03-release-manifest.md for evidence and explicit non-claims.
 */

import { createHash } from 'node:crypto'

/** Version of the manifest/pointer record shape understood by this module. */
export const RELEASE_MANIFEST_SCHEMA_VERSION = '1.0.0'

/** Record discriminator so a graph or other manifest cannot be mistaken for this one. */
export const RELEASE_MANIFEST_KIND = 'moonwitness.release-manifest'

/** Pointer record discriminator. */
export const CURRENT_POINTER_KIND = 'moonwitness.current-version-pointer'

/** The only usage scope a public read is resolved for in this prototype. */
export const PUBLIC_RELEASE_SCOPE = 'public'

export type ReleaseContentType = 'TEXT' | 'TESTIMONY' | 'STORY'

export type ReleaseRightsStatus =
  | 'PUBLIC_DOMAIN'
  | 'RIGHTS_EXACT_VERSION_CLEARED'
  | 'METADATA_ONLY'
  | 'RESTRICTED'
  | 'RIGHTS_UNKNOWN'

export type ReleaseApprovalState = 'DRAFT' | 'IN_REVIEW' | 'APPROVED_WITHIN_SCOPE' | 'PUBLISHED'

export const RELEASE_CONTENT_TYPES: readonly ReleaseContentType[] = ['TEXT', 'TESTIMONY', 'STORY']

export const RELEASE_RIGHTS_STATUSES: readonly ReleaseRightsStatus[] = [
  'PUBLIC_DOMAIN',
  'RIGHTS_EXACT_VERSION_CLEARED',
  'METADATA_ONLY',
  'RESTRICTED',
  'RIGHTS_UNKNOWN',
]

export const RELEASE_APPROVAL_STATES: readonly ReleaseApprovalState[] = [
  'DRAFT',
  'IN_REVIEW',
  'APPROVED_WITHIN_SCOPE',
  'PUBLISHED',
]

/** Rights statuses that can clear public release when the scope also matches. */
export const PUBLIC_RELEASE_CLEARED_RIGHTS: readonly ReleaseRightsStatus[] = [
  'PUBLIC_DOMAIN',
  'RIGHTS_EXACT_VERSION_CLEARED',
]

/** Approval states that authorize a public read. */
export const PUBLIC_RELEASE_APPROVED_STATES: readonly ReleaseApprovalState[] = [
  'APPROVED_WITHIN_SCOPE',
  'PUBLISHED',
]

/** One revision as supplied to `buildReleaseManifest`. Synthetic/opaque refs only. */
export interface ReleaseRevisionInput {
  readonly contentRef: string
  readonly contentType: ReleaseContentType
  readonly editionRef: string
  readonly version: string
  readonly rightsStatus: ReleaseRightsStatus
  /** Exact usage scope covered by the rights clearance; null when unrecorded. */
  readonly rightsScope?: string | null
  /** Exact usage scope covered by consent; null when no usable consent exists. */
  readonly consentScope?: string | null
  /** ISO-8601 expiry; absent/null means no expiry was recorded. */
  readonly consentExpiresAt?: string | null
  /** Named human reviewer; null only while the revision is unapproved. */
  readonly reviewerRef?: string | null
  /** ISO-8601 decision timestamp; null only while the revision is unapproved. */
  readonly decidedAt?: string | null
  readonly approvalState: ReleaseApprovalState
}

/** Normalized, frozen revision stored inside a manifest. */
export interface ReleaseRevision {
  readonly contentRef: string
  readonly contentType: ReleaseContentType
  readonly editionRef: string
  readonly version: string
  readonly rightsStatus: ReleaseRightsStatus
  readonly rightsScope: string | null
  readonly consentScope: string | null
  readonly consentExpiresAt: string | null
  readonly reviewerRef: string | null
  readonly decidedAt: string | null
  readonly approvalState: ReleaseApprovalState
}

/** Immutable manifest over the explicitly reviewed revisions of one release. */
export interface ReleaseManifest {
  readonly schemaVersion: typeof RELEASE_MANIFEST_SCHEMA_VERSION
  readonly kind: typeof RELEASE_MANIFEST_KIND
  readonly releaseRef: string
  /** Immutable release version; the pointer may only name this exact version. */
  readonly releaseVersion: number
  readonly revisions: readonly ReleaseRevision[]
  /** sha256 over the canonical manifest content, excluding this field. */
  readonly manifestHash: string
}

export interface ReleaseManifestInput {
  readonly releaseRef: string
  /** Immutable release version, an integer of at least 1. */
  readonly releaseVersion: number
  readonly revisions: readonly ReleaseRevisionInput[]
}

export interface CurrentPointerInput {
  /** ISO-8601 instant the pointer was approved/set. */
  readonly approvedAt: string
  /** Named human or service that set the pointer. */
  readonly setBy: string
}

/** Immutable current-version pointer; it never names a revision directly. */
export interface CurrentVersionPointer {
  readonly schemaVersion: typeof RELEASE_MANIFEST_SCHEMA_VERSION
  readonly kind: typeof CURRENT_POINTER_KIND
  readonly version: number
  readonly manifestHash: string
  readonly approvedAt: string
  readonly setBy: string
}

/** A resolved public read; carries exactly one approved revision. */
export interface PublicReleaseRevision {
  readonly contentRef: string
  readonly contentType: ReleaseContentType
  readonly editionRef: string
  readonly version: string
  readonly rightsStatus: ReleaseRightsStatus
  readonly consentScope: string
  readonly reviewerRef: string
  readonly decidedAt: string
  readonly approvalState: ReleaseApprovalState
  readonly manifestHash: string
  readonly pointerVersion: number
}

export type ReleaseRefusal =
  | 'POINTER_INVALID'
  | 'POINTER_VERSION_INVALID'
  | 'POINTER_VERSION_UNKNOWN'
  | 'MANIFEST_LIST_INVALID'
  | 'MANIFEST_INVALID'
  | 'MANIFEST_NOT_FOUND'
  | 'MANIFEST_AMBIGUOUS'
  | 'MANIFEST_TAMPERED'
  | 'REVISION_UNAPPROVED'
  | 'MULTIPLE_APPROVED_REVISIONS'
  | 'REVISION_FIELD_INVALID'
  | 'RIGHTS_UNKNOWN'
  | 'RIGHTS_NOT_CLEARED'
  | 'RIGHTS_SCOPE_MISMATCH'
  | 'CONSENT_MISSING'
  | 'CONSENT_SCOPE_MISMATCH'
  | 'CONSENT_TIMESTAMP_INVALID'
  | 'CONSENT_EXPIRED'

export interface ResolvedPublicRelease {
  readonly resolved: true
  readonly refusal: null
  readonly revision: PublicReleaseRevision
}

/** A refusal has no `revision` key at all, so no content ref can leak. */
export interface RefusedPublicRelease {
  readonly resolved: false
  readonly refusal: ReleaseRefusal
}

export type PublicReleaseResolution = ResolvedPublicRelease | RefusedPublicRelease

export type ReleaseManifestErrorReason =
  | 'RELEASE_REF_MISSING'
  | 'RELEASE_VERSION_INVALID'
  | 'REVISIONS_MISSING'
  | 'REVISION_FIELD_MISSING'
  | 'REVISION_FIELD_INVALID'
  | 'CONTENT_TYPE_UNKNOWN'
  | 'RIGHTS_STATUS_UNKNOWN'
  | 'APPROVAL_STATE_UNKNOWN'
  | 'TIMESTAMP_INVALID'
  | 'DUPLICATE_REVISION'
  | 'MANIFEST_INVALID'
  | 'MANIFEST_TAMPERED'
  | 'POINTER_FIELD_INVALID'
  | 'POINTER_VERSION_INVALID'
  | 'POINTER_TIMESTAMP_INVALID'
  | 'POINTER_SETTER_MISSING'

/** Stable, non-secret construction error. Messages never carry content bytes. */
export class ReleaseManifestError extends Error {
  readonly reason: ReleaseManifestErrorReason

  constructor(reason: ReleaseManifestErrorReason, message: string) {
    super(`${reason}: ${message}`)
    this.name = 'ReleaseManifestError'
    this.reason = reason
  }
}

type UnknownRecord = Record<string, unknown>

interface NormalizedPointer {
  readonly version: number
  readonly manifestHash: string
  readonly approvedAtMs: number
}

type PointerCheck =
  | { readonly ok: true; readonly pointer: NormalizedPointer }
  | { readonly ok: false; readonly refusal: ReleaseRefusal }

type ManifestCheck =
  | { readonly ok: true; readonly manifest: ReleaseManifest }
  | { readonly ok: false; readonly refusal: ReleaseRefusal }

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value)
}

function isKnown<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value)
}

function isApprovedState(state: ReleaseApprovalState): boolean {
  return PUBLIC_RELEASE_APPROVED_STATES.includes(state)
}

function textCompare(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

/**
 * Canonical serialization: object keys sorted, arrays in given order. The same
 * value always serializes identically, independent of property insertion order
 * and locale. Undefined is rejected because it has no stable JSON form.
 */
function canonicalJson(value: unknown): string {
  if (value === undefined) throw new TypeError('release manifest contains an undefined value')
  if (value === null || typeof value === 'boolean' || typeof value === 'number') {
    return JSON.stringify(value)
  }
  if (typeof value === 'string') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`
  if (isRecord(value)) {
    const keys = Object.keys(value).sort()
    const members = keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    return `{${members.join(',')}}`
  }
  throw new TypeError('release manifest contains a non-canonical value')
}

function sha256Of(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex')}`
}

/** Hash the manifest content, excluding the hash field itself. */
function hashManifestRecord(manifest: UnknownRecord): string {
  const payload: UnknownRecord = {}
  for (const key of Object.keys(manifest)) {
    if (key === 'manifestHash') continue
    payload[key] = manifest[key]
  }
  return sha256Of(payload)
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  Object.freeze(value)
  for (const nested of Object.values(value as UnknownRecord)) deepFreeze(nested)
  return value
}

function requireRevisionText(value: unknown, field: string): string {
  if (!isNonEmptyString(value)) {
    throw new ReleaseManifestError('REVISION_FIELD_MISSING', `revision field "${field}" must be a non-empty string`)
  }
  return value
}

function normalizeRevision(raw: unknown): ReleaseRevision {
  if (!isRecord(raw)) {
    throw new ReleaseManifestError('REVISION_FIELD_MISSING', 'every revision must be an object')
  }
  const contentRef = requireRevisionText(raw.contentRef, 'contentRef')
  const editionRef = requireRevisionText(raw.editionRef, 'editionRef')
  const version = requireRevisionText(raw.version, 'version')
  if (!isKnown(RELEASE_CONTENT_TYPES, raw.contentType)) {
    throw new ReleaseManifestError('CONTENT_TYPE_UNKNOWN', `unknown content type "${String(raw.contentType)}"`)
  }
  if (!isKnown(RELEASE_RIGHTS_STATUSES, raw.rightsStatus)) {
    throw new ReleaseManifestError('RIGHTS_STATUS_UNKNOWN', `unknown rights status "${String(raw.rightsStatus)}"`)
  }
  if (!isKnown(RELEASE_APPROVAL_STATES, raw.approvalState)) {
    throw new ReleaseManifestError('APPROVAL_STATE_UNKNOWN', `unknown approval state "${String(raw.approvalState)}"`)
  }
  const rightsScope = normalizeOptionalScope(raw.rightsScope, 'rightsScope')
  const consentScope = normalizeOptionalScope(raw.consentScope, 'consentScope')
  const consentExpiresAt = normalizeOptionalTimestamp(raw.consentExpiresAt, 'consentExpiresAt')
  const reviewerRef = normalizeOptionalText(raw.reviewerRef, 'reviewerRef')
  const decidedAt = normalizeOptionalTimestamp(raw.decidedAt, 'decidedAt')
  if (isApprovedState(raw.approvalState)) {
    if (reviewerRef === null) {
      throw new ReleaseManifestError('REVISION_FIELD_MISSING', 'an approved revision needs a named reviewerRef')
    }
    if (decidedAt === null) {
      throw new ReleaseManifestError('REVISION_FIELD_MISSING', 'an approved revision needs a decidedAt timestamp')
    }
  }
  return {
    contentRef,
    contentType: raw.contentType,
    editionRef,
    version,
    rightsStatus: raw.rightsStatus,
    rightsScope,
    consentScope,
    consentExpiresAt,
    reviewerRef,
    decidedAt,
    approvalState: raw.approvalState,
  }
}

function normalizeOptionalScope(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') {
    throw new ReleaseManifestError('REVISION_FIELD_INVALID', `revision field "${field}" must be a string or null`)
  }
  return value
}

function normalizeOptionalText(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null
  if (!isNonEmptyString(value)) {
    throw new ReleaseManifestError('REVISION_FIELD_INVALID', `revision field "${field}" must be a non-empty string`)
  }
  return value
}

function normalizeOptionalTimestamp(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null
  if (!isIsoTimestamp(value)) {
    throw new ReleaseManifestError('TIMESTAMP_INVALID', `revision field "${field}" must be an ISO-8601 timestamp`)
  }
  return value
}

function revisionIdentity(revision: ReleaseRevision): string {
  return `${revision.contentRef}\u0000${revision.contentType}\u0000${revision.editionRef}\u0000${revision.version}`
}

function compareRevisions(left: ReleaseRevision, right: ReleaseRevision): number {
  return textCompare(revisionIdentity(left), revisionIdentity(right))
}

/**
 * Build one immutable manifest over explicitly reviewed revisions.
 *
 * Deterministic: revisions are canonicalized in identity order, so input order
 * does not matter, and the hash is sha256 over the canonical content. Any field
 * change produces a different hash. Duplicate content+edition+version identity
 * is rejected rather than silently overwritten; a correction is a new manifest.
 */
export function buildReleaseManifest(input: ReleaseManifestInput): ReleaseManifest {
  if (!isRecord(input)) {
    throw new ReleaseManifestError('RELEASE_REF_MISSING', 'manifest input must be an object')
  }
  const releaseRef = requireReleaseRef(input.releaseRef)
  if (typeof input.releaseVersion !== 'number' || !Number.isInteger(input.releaseVersion) || input.releaseVersion < 1) {
    throw new ReleaseManifestError('RELEASE_VERSION_INVALID', 'releaseVersion must be an integer of at least 1')
  }
  if (!Array.isArray(input.revisions) || input.revisions.length === 0) {
    throw new ReleaseManifestError('REVISIONS_MISSING', 'a manifest needs at least one reviewed revision')
  }
  const normalized = input.revisions.map((raw) => normalizeRevision(raw))
  const revisions = [...normalized].sort(compareRevisions)
  const seen = new Set<string>()
  for (const revision of revisions) {
    const identity = revisionIdentity(revision)
    if (seen.has(identity)) {
      throw new ReleaseManifestError(
        'DUPLICATE_REVISION',
        'the same content, edition and version appears twice; a correction is a new version',
      )
    }
    seen.add(identity)
  }
  const payload: Omit<ReleaseManifest, 'manifestHash'> = {
    schemaVersion: RELEASE_MANIFEST_SCHEMA_VERSION,
    kind: RELEASE_MANIFEST_KIND,
    releaseRef,
    releaseVersion: input.releaseVersion,
    revisions,
  }
  const manifestHash = sha256Of(payload)
  return deepFreeze({ ...payload, manifestHash })
}

function requireReleaseRef(value: unknown): string {
  if (!isNonEmptyString(value)) {
    throw new ReleaseManifestError('RELEASE_REF_MISSING', 'releaseRef must be a non-empty string')
  }
  return value
}

/**
 * Create an immutable pointer record over a built manifest.
 *
 * The pointer names the manifest hash and its exact release version, never a
 * revision, and adds the named setter and approval instant. The version is
 * derived from the manifest, not trusted from the caller, so a pointer cannot
 * claim a release version the manifest does not record. It does not approve
 * anything: `resolvePublicRevision` still re-checks every gate. Creating a new
 * pointer is the only way to move the current version.
 */
export function createCurrentPointer(manifest: unknown, input: unknown): CurrentVersionPointer {
  const checked = checkManifest(manifest)
  if (!checked.ok) {
    throw new ReleaseManifestError(
      checked.refusal === 'MANIFEST_TAMPERED' ? 'MANIFEST_TAMPERED' : 'MANIFEST_INVALID',
      `cannot point at an invalid manifest (${checked.refusal})`,
    )
  }
  if (!isRecord(input)) {
    throw new ReleaseManifestError('POINTER_FIELD_INVALID', 'pointer input must be an object')
  }
  if (!isIsoTimestamp(input.approvedAt)) {
    throw new ReleaseManifestError('POINTER_TIMESTAMP_INVALID', 'pointer approvedAt must be an ISO-8601 timestamp')
  }
  if (!isNonEmptyString(input.setBy)) {
    throw new ReleaseManifestError('POINTER_SETTER_MISSING', 'pointer setBy must name the setter')
  }
  return deepFreeze({
    schemaVersion: RELEASE_MANIFEST_SCHEMA_VERSION,
    kind: CURRENT_POINTER_KIND,
    version: checked.manifest.releaseVersion,
    manifestHash: checked.manifest.manifestHash,
    approvedAt: input.approvedAt,
    setBy: input.setBy,
  })
}

function checkPointer(raw: unknown): PointerCheck {
  if (!isRecord(raw)) return { ok: false, refusal: 'POINTER_INVALID' }
  if (!isSha256(raw.manifestHash)) return { ok: false, refusal: 'POINTER_INVALID' }
  if (typeof raw.version !== 'number' || !Number.isInteger(raw.version) || raw.version < 1) {
    return { ok: false, refusal: 'POINTER_VERSION_INVALID' }
  }
  if (!isIsoTimestamp(raw.approvedAt)) return { ok: false, refusal: 'POINTER_INVALID' }
  if (!isNonEmptyString(raw.setBy)) return { ok: false, refusal: 'POINTER_INVALID' }
  return {
    ok: true,
    pointer: {
      version: raw.version,
      manifestHash: raw.manifestHash,
      approvedAtMs: Date.parse(raw.approvedAt),
    },
  }
}

function revisionShapeValid(raw: unknown): boolean {
  if (!isRecord(raw)) return false
  if (!isNonEmptyString(raw.contentRef)) return false
  if (!isKnown(RELEASE_CONTENT_TYPES, raw.contentType)) return false
  if (!isNonEmptyString(raw.editionRef)) return false
  if (!isNonEmptyString(raw.version)) return false
  if (!isKnown(RELEASE_RIGHTS_STATUSES, raw.rightsStatus)) return false
  if (raw.rightsScope !== null && typeof raw.rightsScope !== 'string') return false
  if (raw.consentScope !== null && typeof raw.consentScope !== 'string') return false
  if (raw.consentExpiresAt !== null && !isIsoTimestamp(raw.consentExpiresAt)) return false
  if (raw.reviewerRef !== null && !isNonEmptyString(raw.reviewerRef)) return false
  if (raw.decidedAt !== null && !isIsoTimestamp(raw.decidedAt)) return false
  if (!isKnown(RELEASE_APPROVAL_STATES, raw.approvalState)) return false
  if (isApprovedState(raw.approvalState)) {
    if (!isNonEmptyString(raw.reviewerRef)) return false
    if (!isIsoTimestamp(raw.decidedAt)) return false
  }
  return true
}

/**
 * Validate a manifest record and prove its stored hash still matches its
 * content. A field changed without rehashing is `MANIFEST_TAMPERED`; a changed
 * manifest with a changed hash no longer matches the old pointer and becomes
 * `MANIFEST_NOT_FOUND` at resolution.
 */
function checkManifest(raw: unknown): ManifestCheck {
  if (!isRecord(raw)) return { ok: false, refusal: 'MANIFEST_INVALID' }
  if (raw.schemaVersion !== RELEASE_MANIFEST_SCHEMA_VERSION) return { ok: false, refusal: 'MANIFEST_INVALID' }
  if (raw.kind !== RELEASE_MANIFEST_KIND) return { ok: false, refusal: 'MANIFEST_INVALID' }
  if (!isNonEmptyString(raw.releaseRef)) return { ok: false, refusal: 'MANIFEST_INVALID' }
  if (typeof raw.releaseVersion !== 'number' || !Number.isInteger(raw.releaseVersion) || raw.releaseVersion < 1) {
    return { ok: false, refusal: 'MANIFEST_INVALID' }
  }
  if (!isSha256(raw.manifestHash)) return { ok: false, refusal: 'MANIFEST_INVALID' }
  if (!Array.isArray(raw.revisions) || raw.revisions.length === 0) {
    return { ok: false, refusal: 'MANIFEST_INVALID' }
  }
  for (const revision of raw.revisions) {
    if (!revisionShapeValid(revision)) return { ok: false, refusal: 'REVISION_FIELD_INVALID' }
  }
  let recomputed: string
  try {
    recomputed = hashManifestRecord(raw)
  } catch {
    return { ok: false, refusal: 'MANIFEST_INVALID' }
  }
  if (recomputed !== raw.manifestHash) return { ok: false, refusal: 'MANIFEST_TAMPERED' }
  return { ok: true, manifest: raw as unknown as ReleaseManifest }
}

function refused(refusal: ReleaseRefusal): RefusedPublicRelease {
  return Object.freeze({ resolved: false, refusal })
}

/**
 * Resolve a public read against the current pointer and the known manifests.
 *
 * Success requires all of the following, checked in this fixed order:
 *   1. the pointer is a well-formed versioned record (`POINTER_*`);
 *   2. exactly one known manifest carries the pointer's hash
 *      (`MANIFEST_NOT_FOUND`, `MANIFEST_AMBIGUOUS`);
 *   3. that manifest is structurally valid and its content still hashes to the
 *      stored hash (`MANIFEST_INVALID`, `REVISION_FIELD_INVALID`,
 *      `MANIFEST_TAMPERED`);
 *   4. the pointer's version equals the manifest's immutable release version
 *      (`POINTER_VERSION_UNKNOWN`);
 *   5. exactly one revision is APPROVED_WITHIN_SCOPE or PUBLISHED
 *      (`REVISION_UNAPPROVED`, `MULTIPLE_APPROVED_REVISIONS`);
 *   6. rights clear the public scope (`RIGHTS_*`);
 *   7. consent covers the public scope and has not expired at the pointer's
 *      approved-at instant (`CONSENT_*`).
 *
 * Consent expiry is evaluated against the caller-supplied pointer instant; the
 * module never reads a wall clock. At most one revision is ever returned and a
 * refusal carries no content reference.
 */
export function resolvePublicRevision(pointer: unknown, manifests: unknown): PublicReleaseResolution {
  const checkedPointer = checkPointer(pointer)
  if (!checkedPointer.ok) return refused(checkedPointer.refusal)
  const normalizedPointer = checkedPointer.pointer

  if (!Array.isArray(manifests)) return refused('MANIFEST_LIST_INVALID')
  const matches: UnknownRecord[] = []
  for (const entry of manifests) {
    if (!isRecord(entry)) return refused('MANIFEST_LIST_INVALID')
    if (entry.manifestHash === normalizedPointer.manifestHash) matches.push(entry)
  }
  if (matches.length === 0) return refused('MANIFEST_NOT_FOUND')
  if (matches.length > 1) return refused('MANIFEST_AMBIGUOUS')

  const matched = matches[0]
  if (!matched) return refused('MANIFEST_NOT_FOUND')
  const checkedManifest = checkManifest(matched)
  if (!checkedManifest.ok) return refused(checkedManifest.refusal)
  if (normalizedPointer.version !== checkedManifest.manifest.releaseVersion) {
    return refused('POINTER_VERSION_UNKNOWN')
  }

  const approved = checkedManifest.manifest.revisions.filter((revision) => isApprovedState(revision.approvalState))
  if (approved.length === 0) return refused('REVISION_UNAPPROVED')
  if (approved.length > 1) return refused('MULTIPLE_APPROVED_REVISIONS')
  const revision = approved[0]
  if (!revision) return refused('REVISION_UNAPPROVED')

  if (revision.rightsStatus === 'RIGHTS_UNKNOWN') return refused('RIGHTS_UNKNOWN')
  if (!PUBLIC_RELEASE_CLEARED_RIGHTS.includes(revision.rightsStatus)) return refused('RIGHTS_NOT_CLEARED')
  if (revision.rightsScope !== PUBLIC_RELEASE_SCOPE) return refused('RIGHTS_SCOPE_MISMATCH')

  if (revision.consentScope === null) return refused('CONSENT_MISSING')
  if (revision.consentScope !== PUBLIC_RELEASE_SCOPE) return refused('CONSENT_SCOPE_MISMATCH')
  if (revision.consentExpiresAt !== null) {
    const expiryMs = Date.parse(revision.consentExpiresAt)
    if (Number.isNaN(expiryMs)) return refused('CONSENT_TIMESTAMP_INVALID')
    if (expiryMs <= normalizedPointer.approvedAtMs) return refused('CONSENT_EXPIRED')
  }

  if (revision.reviewerRef === null || revision.decidedAt === null) {
    return refused('REVISION_FIELD_INVALID')
  }

  return Object.freeze({
    resolved: true,
    refusal: null,
    revision: Object.freeze({
      contentRef: revision.contentRef,
      contentType: revision.contentType,
      editionRef: revision.editionRef,
      version: revision.version,
      rightsStatus: revision.rightsStatus,
      consentScope: revision.consentScope,
      reviewerRef: revision.reviewerRef,
      decidedAt: revision.decidedAt,
      approvalState: revision.approvalState,
      manifestHash: checkedManifest.manifest.manifestHash,
      pointerVersion: normalizedPointer.version,
    }),
  })
}
