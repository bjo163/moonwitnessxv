/**
 * M16-04 prototype consent and ACL gate for private witness media.
 *
 * This module is deliberately pure: no imports, no network, no database, no
 * wall clock and no Fastify/MoonQL dependency. It answers one question for one
 * witness media object — may this principal upload it, or view the bytes it
 * refers to, for this exact usage scope? — and returns either an authorized
 * descriptor or a denial carrying a stable reason code.
 *
 * The policy is deny-by-default:
 * - An absent or anonymous principal never passes, and roles/scopes are
 *   recorded on the principal but are never consulted for authorization.
 * - Ownership is not a permission. An owner still needs a live consent record
 *   and an explicit ACL entry for the exact operation.
 * - Consent must exist, be bound to this media object, cover the requested
 *   scope and be unexpired at the caller-supplied `evaluatedAt`.
 * - Rights must be cleared for the requested scope.
 * - An ACL entry must name this principal, this operation and be unexpired.
 *
 * A denial never carries a media URL, object key, digest, locator or text:
 * `mediaId` and a stable reason code are the only media-identifying output.
 * This is a prototype gate, not an integrated route; see
 * docs/audit/M16-04-media-consent-acl.md.
 */

export const MEDIA_ACCESS_POLICY_VERSION = '1.0.0'

/** Witness media is private or withdrawn; there is no public witness media. */
export const WITNESS_MEDIA_VISIBILITY = ['PRIVATE', 'WITHDRAWN'] as const

export type WitnessMediaVisibility = (typeof WITNESS_MEDIA_VISIBILITY)[number]

/** The only two operations this gate understands. */
export const MEDIA_PERMISSIONS = ['view', 'upload'] as const

export type MediaPermission = (typeof MEDIA_PERMISSIONS)[number]

/**
 * `RIGHTS_UNKNOWN` never yields access. `RIGHTS_CLEARED` is only usable when
 * `rightsScope` exactly matches the requested scope.
 */
export type MediaRightsStatus = 'RIGHTS_UNKNOWN' | 'RIGHTS_CLEARED'

/**
 * The requesting principal. `roles` and `scopes` are accepted for audit only
 * and are never read by the decision logic.
 */
export interface MediaPrincipal {
  readonly principalRef: string
  readonly roles?: readonly string[]
  readonly scopes?: readonly string[]
}

/** An explicit, principal-bound, operation-bound permission for one object. */
export interface MediaAclEntry {
  readonly mediaId: string
  readonly principalRef: string
  readonly permission: MediaPermission
  readonly expiresAt?: string | null
}

/** A consent record bound to exactly one witness media object. */
export interface MediaConsentRecord {
  readonly mediaId: string
  /** Usage scope this consent covers; compared by exact string match. */
  readonly consentScope: string
  /** Principal that granted/recorded the consent; required for provenance. */
  readonly grantedBy: string
  readonly expiresAt?: string | null
}

/** Witness media metadata. Never carries the locator into a decision. */
export interface WitnessMediaObject {
  readonly id: string
  readonly ownerPrincipalRef: string
  readonly visibility: WitnessMediaVisibility
  /** Scope the recorded consent covers for this object; null means none. */
  readonly consentScope: string | null
  readonly rightsStatus: MediaRightsStatus
  /** Scope covered by the rights clearance; exact string match. */
  readonly rightsScope: string
}

export interface MediaAccessRequest {
  readonly principal: MediaPrincipal | null
  readonly action: MediaPermission
  /** Exact scope the caller asks to use the media for. */
  readonly requestedScope: string
  /** Caller-supplied clock (ISO-8601); no wall clock is read here. */
  readonly evaluatedAt: string
  readonly acl?: readonly MediaAclEntry[]
  readonly consent?: MediaConsentRecord | null
}

export type MediaAccessDenialReason =
  | 'REQUEST_FIELD_MISSING'
  | 'REQUEST_FIELD_INVALID'
  | 'REQUEST_TIMESTAMP_INVALID'
  | 'ACTION_INVALID'
  | 'PRINCIPAL_MISSING'
  | 'MEDIA_FIELD_MISSING'
  | 'MEDIA_FIELD_INVALID'
  | 'MEDIA_VISIBILITY_INVALID'
  | 'MEDIA_WITHDRAWN'
  | 'CONSENT_MISSING'
  | 'CONSENT_MEDIA_MISMATCH'
  | 'CONSENT_INVALID'
  | 'CONSENT_SCOPE_MISMATCH'
  | 'CONSENT_EXPIRED'
  | 'CONSENT_TIMESTAMP_INVALID'
  | 'RIGHTS_UNKNOWN'
  | 'RIGHTS_STATUS_INVALID'
  | 'RIGHTS_SCOPE_MISMATCH'
  | 'ACL_MISSING'
  | 'ACL_OTHER_PRINCIPAL'
  | 'ACL_PERMISSION_MISMATCH'
  | 'ACL_EXPIRED'
  | 'ACL_INVALID'

export interface AuthorizedMediaDecision {
  readonly mediaId: string
  readonly action: MediaPermission
  readonly allowed: true
  readonly visibility: WitnessMediaVisibility
  readonly consentScope: string
  readonly rightsStatus: MediaRightsStatus
  readonly policyVersion: string
}

/**
 * A denial carries no `url`, `objectKey`, `locator`, `digest`, `text` or
 * `content` field. `mediaId` is the only media-identifying output.
 */
export interface DeniedMediaDecision {
  readonly mediaId: string | null
  readonly allowed: false
  readonly reason: MediaAccessDenialReason
}

export type MediaAccessDecision = AuthorizedMediaDecision | DeniedMediaDecision

interface NormalizedMedia {
  readonly id: string
  readonly ownerPrincipalRef: string
  readonly visibility: WitnessMediaVisibility
  readonly consentScope: string | null
  readonly rightsStatus: MediaRightsStatus
  readonly rightsScope: string
}

interface NormalizedRequest {
  readonly principalRef: string
  readonly action: MediaPermission
  readonly requestedScope: string
  readonly evaluatedAtMs: number
  readonly acl: readonly MediaAclEntry[]
  readonly consent: MediaConsentRecord | null
}

type NormalizedRequestResult =
  | { readonly ok: true; readonly request: NormalizedRequest }
  | { readonly ok: false; readonly reason: MediaAccessDenialReason }

type MediaValidation =
  | { readonly ok: true; readonly media: NormalizedMedia }
  | { readonly ok: false; readonly mediaId: string | null; readonly reason: MediaAccessDenialReason }

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

function parseTimestamp(value: unknown): number | null {
  if (!isNonEmptyString(value)) return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function isVisibility(value: unknown): value is WitnessMediaVisibility {
  return value === 'PRIVATE' || value === 'WITHDRAWN'
}

function isPermission(value: unknown): value is MediaPermission {
  return value === 'view' || value === 'upload'
}

function isRightsStatus(value: unknown): value is MediaRightsStatus {
  return value === 'RIGHTS_UNKNOWN' || value === 'RIGHTS_CLEARED'
}

function denied(mediaId: string | null, reason: MediaAccessDenialReason): DeniedMediaDecision {
  return { mediaId, allowed: false, reason }
}

function mediaIdOf(media: unknown): string | null {
  if (!isRecord(media)) return null
  return isNonEmptyString(media.id) ? media.id : null
}

function normalizeAcl(raw: unknown): readonly MediaAclEntry[] | null {
  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw)) return null
  const entries: MediaAclEntry[] = []
  for (const entry of raw) {
    if (!isRecord(entry)) return null
    if (!isNonEmptyString(entry.mediaId)) return null
    if (!isNonEmptyString(entry.principalRef)) return null
    if (!isPermission(entry.permission)) return null
    if (entry.expiresAt !== undefined && entry.expiresAt !== null) {
      if (typeof entry.expiresAt !== 'string' || parseTimestamp(entry.expiresAt) === null) return null
    }
    entries.push({
      mediaId: entry.mediaId,
      principalRef: entry.principalRef,
      permission: entry.permission,
      ...(typeof entry.expiresAt === 'string' ? { expiresAt: entry.expiresAt } : {}),
    })
  }
  return entries
}

function normalizeConsent(raw: unknown): MediaConsentRecord | null | undefined {
  if (raw === undefined || raw === null) return null
  if (!isRecord(raw)) return undefined
  if (!isNonEmptyString(raw.mediaId)) return undefined
  if (!isNonEmptyString(raw.consentScope)) return undefined
  if (!isNonEmptyString(raw.grantedBy)) return undefined
  if (raw.expiresAt !== undefined && raw.expiresAt !== null) {
    if (typeof raw.expiresAt !== 'string' || parseTimestamp(raw.expiresAt) === null) return undefined
  }
  return {
    mediaId: raw.mediaId,
    consentScope: raw.consentScope,
    grantedBy: raw.grantedBy,
    ...(typeof raw.expiresAt === 'string' ? { expiresAt: raw.expiresAt } : {}),
  }
}

function normalizeRequest(raw: unknown): NormalizedRequestResult {
  if (!isRecord(raw)) return { ok: false, reason: 'REQUEST_FIELD_MISSING' }
  const principal = raw.principal
  if (principal === undefined || principal === null) return { ok: false, reason: 'PRINCIPAL_MISSING' }
  if (!isRecord(principal)) return { ok: false, reason: 'REQUEST_FIELD_INVALID' }
  if (!isNonEmptyString(principal.principalRef)) return { ok: false, reason: 'PRINCIPAL_MISSING' }
  if (principal.roles !== undefined && !isStringArray(principal.roles)) {
    return { ok: false, reason: 'REQUEST_FIELD_INVALID' }
  }
  if (principal.scopes !== undefined && !isStringArray(principal.scopes)) {
    return { ok: false, reason: 'REQUEST_FIELD_INVALID' }
  }
  if (typeof raw.action !== 'string') return { ok: false, reason: 'ACTION_INVALID' }
  if (!isPermission(raw.action)) return { ok: false, reason: 'ACTION_INVALID' }
  if (!isNonEmptyString(raw.requestedScope)) return { ok: false, reason: 'REQUEST_FIELD_MISSING' }
  const evaluatedAtMs = parseTimestamp(raw.evaluatedAt)
  if (evaluatedAtMs === null) return { ok: false, reason: 'REQUEST_TIMESTAMP_INVALID' }
  const acl = normalizeAcl(raw.acl)
  if (acl === null) return { ok: false, reason: 'REQUEST_FIELD_INVALID' }
  const consent = normalizeConsent(raw.consent)
  if (consent === undefined) return { ok: false, reason: 'CONSENT_INVALID' }
  return {
    ok: true,
    request: {
      principalRef: principal.principalRef,
      action: raw.action,
      requestedScope: raw.requestedScope,
      evaluatedAtMs,
      acl,
      consent,
    },
  }
}

function validateMedia(raw: unknown): MediaValidation {
  if (!isRecord(raw)) return { ok: false, mediaId: null, reason: 'MEDIA_FIELD_MISSING' }
  if (!isNonEmptyString(raw.id)) return { ok: false, mediaId: null, reason: 'MEDIA_FIELD_MISSING' }
  const id = raw.id
  if (!isNonEmptyString(raw.ownerPrincipalRef)) return { ok: false, mediaId: id, reason: 'MEDIA_FIELD_MISSING' }
  if (typeof raw.visibility !== 'string') return { ok: false, mediaId: id, reason: 'MEDIA_FIELD_MISSING' }
  if (!isVisibility(raw.visibility)) return { ok: false, mediaId: id, reason: 'MEDIA_VISIBILITY_INVALID' }
  if (typeof raw.rightsStatus !== 'string') return { ok: false, mediaId: id, reason: 'MEDIA_FIELD_MISSING' }
  if (!isRightsStatus(raw.rightsStatus)) return { ok: false, mediaId: id, reason: 'RIGHTS_STATUS_INVALID' }
  if (!isNonEmptyString(raw.rightsScope)) return { ok: false, mediaId: id, reason: 'MEDIA_FIELD_MISSING' }
  if (raw.consentScope !== undefined && raw.consentScope !== null && typeof raw.consentScope !== 'string') {
    return { ok: false, mediaId: id, reason: 'MEDIA_FIELD_INVALID' }
  }
  return {
    ok: true,
    media: {
      id,
      ownerPrincipalRef: raw.ownerPrincipalRef,
      visibility: raw.visibility,
      consentScope: isNonEmptyString(raw.consentScope) ? raw.consentScope : null,
      rightsStatus: raw.rightsStatus,
      rightsScope: raw.rightsScope,
    },
  }
}

function consentFailure(media: NormalizedMedia, request: NormalizedRequest): MediaAccessDenialReason | null {
  if (media.consentScope === null) return 'CONSENT_MISSING'
  const consent = request.consent
  if (consent === null) return 'CONSENT_MISSING'
  if (consent.mediaId !== media.id) return 'CONSENT_MEDIA_MISMATCH'
  if (consent.consentScope !== media.consentScope) return 'CONSENT_SCOPE_MISMATCH'
  if (consent.consentScope !== request.requestedScope) return 'CONSENT_SCOPE_MISMATCH'
  if (!isNonEmptyString(consent.grantedBy)) return 'CONSENT_INVALID'
  if (consent.expiresAt !== undefined && consent.expiresAt !== null) {
    const expiresAtMs = parseTimestamp(consent.expiresAt)
    if (expiresAtMs === null) return 'CONSENT_TIMESTAMP_INVALID'
    if (expiresAtMs <= request.evaluatedAtMs) return 'CONSENT_EXPIRED'
  }
  return null
}

function aclFailure(request: NormalizedRequest, media: NormalizedMedia): MediaAccessDenialReason | null {
  const mediaEntries = request.acl.filter((entry) => entry.mediaId === media.id)
  if (mediaEntries.length === 0) return 'ACL_MISSING'
  const principalEntries = mediaEntries.filter((entry) => entry.principalRef === request.principalRef)
  if (principalEntries.length === 0) return 'ACL_OTHER_PRINCIPAL'
  const permissionEntries = principalEntries.filter((entry) => entry.permission === request.action)
  if (permissionEntries.length === 0) return 'ACL_PERMISSION_MISMATCH'
  let sawInvalidExpiry = false
  for (const entry of permissionEntries) {
    if (entry.expiresAt === undefined || entry.expiresAt === null) return null
    const expiresAtMs = parseTimestamp(entry.expiresAt)
    if (expiresAtMs === null) {
      sawInvalidExpiry = true
      continue
    }
    if (expiresAtMs > request.evaluatedAtMs) return null
  }
  return sawInvalidExpiry ? 'ACL_INVALID' : 'ACL_EXPIRED'
}

function evaluateNormalized(raw: unknown, request: NormalizedRequest): MediaAccessDecision {
  const validation = validateMedia(raw)
  if (!validation.ok) return denied(validation.mediaId, validation.reason)
  const media = validation.media

  if (media.visibility === 'WITHDRAWN') return denied(media.id, 'MEDIA_WITHDRAWN')

  // Consent first: ownership, roles and scopes never substitute for consent.
  const consentReason = consentFailure(media, request)
  if (consentReason !== null) return denied(media.id, consentReason)

  if (media.rightsStatus === 'RIGHTS_UNKNOWN') return denied(media.id, 'RIGHTS_UNKNOWN')
  if (media.rightsScope !== request.requestedScope) return denied(media.id, 'RIGHTS_SCOPE_MISMATCH')

  const aclReason = aclFailure(request, media)
  if (aclReason !== null) return denied(media.id, aclReason)

  return {
    mediaId: media.id,
    action: request.action,
    allowed: true,
    visibility: media.visibility,
    consentScope: media.consentScope as string,
    rightsStatus: media.rightsStatus,
    policyVersion: MEDIA_ACCESS_POLICY_VERSION,
  }
}

/**
 * Evaluate one witness media object for one principal. Both arguments are
 * `unknown` because a gate at a trust boundary must reject malformed input
 * rather than trust a caller-side type.
 */
export function evaluateMediaAccess(media: unknown, request: unknown): MediaAccessDecision {
  const normalized = normalizeRequest(request)
  if (!normalized.ok) return denied(mediaIdOf(media), normalized.reason)
  return evaluateNormalized(media, normalized.request)
}

/**
 * Evaluate the same request against several media objects in order. Never
 * throws for malformed payloads and never emits a locator.
 */
export function evaluateMediaAccessList(
  media: readonly unknown[],
  request: unknown,
): MediaAccessDecision[] {
  if (!Array.isArray(media)) return [denied(null, 'MEDIA_FIELD_MISSING')]
  const normalized = normalizeRequest(request)
  if (!normalized.ok) {
    return media.map((entry) => denied(mediaIdOf(entry), normalized.reason))
  }
  return media.map((entry) => evaluateNormalized(entry, normalized.request))
}
