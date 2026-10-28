/**
 * M21-04 prototype prompt-injection, egress and tool-permission guard.
 *
 * This module is deliberately pure: no imports, no network, no filesystem, no
 * environment lookup and no wall clock. It treats retrieved source bytes as
 * untrusted data. A source passage is admitted only when it contains no
 * instruction-like content, no egress command, no destination outside the
 * caller-supplied allow-list and no proposed tool call. Anything else is
 * quarantined with a stable reason code.
 *
 * Refusal, not rewriting, is the neutralization strategy: admitted text is
 * returned byte-for-byte with an explicit `UNTRUSTED_DATA` trust label, and
 * rejected text is never copied into the decision. This is a prototype gate,
 * not an integrated retrieval or tool-execution path; see
 * docs/audit/M21-04-source-guard.md.
 */

export const SOURCE_GUARD_POLICY_VERSION = '1.0.0'

/** Fixed default ceiling for one source passage (UTF-16 code units). */
export const DEFAULT_MAX_SOURCE_TEXT_LENGTH = 65_536

/** Upper bound a caller may raise `maxTextLength` to. */
const MAX_CONFIGURED_TEXT_LENGTH = 1_000_000

export type SourceGuardDenialReason =
  | 'SOURCE_TEXT_MISSING'
  | 'SOURCE_TEXT_INVALID'
  | 'SOURCE_TEXT_TOO_LARGE'
  | 'SOURCE_ID_INVALID'
  | 'POLICY_MISSING'
  | 'POLICY_INVALID'
  | 'POLICY_TIMESTAMP_INVALID'
  | 'EGRESS_ALLOWLIST_INVALID'
  | 'TOOL_ALLOWLIST_INVALID'
  | 'PROMPT_OVERRIDE_INSTRUCTION'
  | 'ROLE_ESCALATION_ATTEMPT'
  | 'SYSTEM_PROMPT_EXFILTRATION'
  | 'TOOL_CALL_PROPOSAL_IN_TEXT'
  | 'TOOL_INVOCATION_DIRECTIVE'
  | 'TOOL_PERMISSION_REQUEST'
  | 'EXFILTRATION_DIRECTIVE'
  | 'EGRESS_SCHEME_NOT_ALLOWED'
  | 'EGRESS_DESTINATION_NOT_ALLOWED'
  | 'TOOL_PROPOSAL_MISSING'
  | 'TOOL_PROPOSAL_INVALID'
  | 'TOOL_FROM_UNTRUSTED_SOURCE'
  | 'TOOL_NOT_ALLOWED'

/** A retrieved passage. `text` is data; it is never an instruction. */
export interface UntrustedSourceCandidate {
  readonly sourceId?: string | null
  readonly text: string
}

/** Caller-supplied policy. Nothing here is read from ambient state. */
export interface SourceGuardPolicy {
  /**
   * Exact, lower-case DNS hosts that may appear in `https` URLs. An empty
   * list denies every URL. Wildcards, schemes, paths, ports and userinfo are
   * invalid entries.
   */
  readonly allowedEgressHosts: readonly string[]
  /**
   * Exact tool identifiers a *trusted operator* may invoke. Omitted or empty
   * means no tool is callable. This list never authorizes untrusted content.
   */
  readonly allowedToolIds?: readonly string[]
  /** Caller-supplied clock (ISO-8601); no wall clock is read. */
  readonly evaluatedAt: string
  /** Optional passage ceiling; defaults to `DEFAULT_MAX_SOURCE_TEXT_LENGTH`. */
  readonly maxTextLength?: number
}

export interface AdmittedSourceDecision {
  readonly sourceId: string | null
  readonly admitted: true
  /** The caller must keep treating `data` as data, never as instructions. */
  readonly contentTrust: 'UNTRUSTED_DATA'
  /** Original bytes, unchanged. */
  readonly data: string
  readonly policyVersion: typeof SOURCE_GUARD_POLICY_VERSION
  readonly evaluatedAt: string
}

/**
 * A refusal never carries `data`, `text`, `snippet`, `content`, a URL, a host
 * or a matched substring. `sourceId` is an opaque caller-supplied identifier.
 */
export interface RefusedSourceDecision {
  readonly sourceId: string | null
  readonly admitted: false
  readonly contentTrust: 'UNTRUSTED_DATA'
  readonly reason: SourceGuardDenialReason
  readonly policyVersion: typeof SOURCE_GUARD_POLICY_VERSION
  readonly evaluatedAt: string | null
}

export type SourceGuardDecision = AdmittedSourceDecision | RefusedSourceDecision

export type ProposedToolOrigin = 'UNTRUSTED_SOURCE' | 'TRUSTED_OPERATOR'

/**
 * A structured tool call proposed by a caller. `origin` is a provenance
 * declaration; this module trusts the declaration and does not authenticate
 * the caller. That limitation is recorded in the audit.
 */
export interface ProposedToolInvocation {
  readonly toolId: string
  readonly origin: ProposedToolOrigin
}

export interface PermittedToolInvocationDecision {
  readonly permitted: true
  readonly toolId: string
  readonly origin: 'TRUSTED_OPERATOR'
  readonly policyVersion: typeof SOURCE_GUARD_POLICY_VERSION
  readonly evaluatedAt: string
}

export interface RefusedToolInvocationDecision {
  readonly permitted: false
  readonly toolId: string | null
  readonly origin: ProposedToolOrigin | null
  readonly reason: SourceGuardDenialReason
  readonly policyVersion: typeof SOURCE_GUARD_POLICY_VERSION
  readonly evaluatedAt: string | null
}

export type ToolInvocationDecision =
  | PermittedToolInvocationDecision
  | RefusedToolInvocationDecision

interface NormalizedPolicy {
  readonly allowedEgressHosts: ReadonlySet<string>
  readonly allowedToolIds: ReadonlySet<string>
  readonly evaluatedAt: string
  readonly maxTextLength: number
}

type PolicyResult =
  | { readonly ok: true; readonly policy: NormalizedPolicy }
  | { readonly ok: false; readonly reason: SourceGuardDenialReason }

interface NormalizedCandidate {
  readonly sourceId: string | null
  readonly text: string
}

type CandidateResult =
  | { readonly ok: true; readonly candidate: NormalizedCandidate }
  | {
      readonly ok: false
      readonly sourceId: string | null
      readonly reason: SourceGuardDenialReason
    }

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseTimestamp(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

const HOST_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/

const TOOL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/

function isValidHost(value: string): boolean {
  return value.length > 0 && value.length <= 253 && HOST_PATTERN.test(value)
}

function isValidToolId(value: unknown): value is string {
  return typeof value === 'string' && TOOL_ID_PATTERN.test(value)
}

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 0x1f || code === 0x7f) return true
  }
  return false
}

function isValidSourceId(value: unknown): value is string {
  if (typeof value !== 'string') return false
  if (value.trim().length === 0 || value.length > 512) return false
  return !hasControlCharacter(value)
}

function safeSourceIdOf(raw: unknown): string | null {
  if (!isRecord(raw)) return null
  return isValidSourceId(raw.sourceId) ? raw.sourceId : null
}

function normalizeHosts(raw: unknown): ReadonlySet<string> | null {
  if (!Array.isArray(raw)) return null
  const hosts = new Set<string>()
  for (const entry of raw) {
    if (typeof entry !== 'string') return null
    const host = entry.trim().toLowerCase()
    if (!isValidHost(host)) return null
    hosts.add(host)
  }
  return hosts
}

function normalizeToolIds(raw: unknown): ReadonlySet<string> | null {
  if (raw === undefined || raw === null) return new Set<string>()
  if (!Array.isArray(raw)) return null
  const toolIds = new Set<string>()
  for (const entry of raw) {
    if (!isValidToolId(entry)) return null
    toolIds.add(entry)
  }
  return toolIds
}

function normalizeMaxLength(raw: unknown): number | null {
  if (raw === undefined || raw === null) return DEFAULT_MAX_SOURCE_TEXT_LENGTH
  if (typeof raw !== 'number' || !Number.isInteger(raw)) return null
  if (raw <= 0 || raw > MAX_CONFIGURED_TEXT_LENGTH) return null
  return raw
}

function normalizePolicy(raw: unknown): PolicyResult {
  if (!isRecord(raw)) return { ok: false, reason: 'POLICY_MISSING' }
  const evaluatedAt = raw.evaluatedAt
  if (typeof evaluatedAt !== 'string' || parseTimestamp(evaluatedAt) === null) {
    return { ok: false, reason: 'POLICY_TIMESTAMP_INVALID' }
  }
  if (raw.allowedEgressHosts === undefined || raw.allowedEgressHosts === null) {
    return { ok: false, reason: 'POLICY_MISSING' }
  }
  const allowedEgressHosts = normalizeHosts(raw.allowedEgressHosts)
  if (allowedEgressHosts === null) {
    return { ok: false, reason: 'EGRESS_ALLOWLIST_INVALID' }
  }
  const allowedToolIds = normalizeToolIds(raw.allowedToolIds)
  if (allowedToolIds === null) {
    return { ok: false, reason: 'TOOL_ALLOWLIST_INVALID' }
  }
  const maxTextLength = normalizeMaxLength(raw.maxTextLength)
  if (maxTextLength === null) return { ok: false, reason: 'POLICY_INVALID' }
  return {
    ok: true,
    policy: {
      allowedEgressHosts,
      allowedToolIds,
      evaluatedAt,
      maxTextLength,
    },
  }
}

function normalizeCandidate(raw: unknown, maxTextLength: number): CandidateResult {
  if (!isRecord(raw)) {
    return { ok: false, sourceId: null, reason: 'SOURCE_TEXT_MISSING' }
  }
  const sourceId = safeSourceIdOf(raw)
  if (raw.sourceId !== undefined && raw.sourceId !== null && sourceId === null) {
    return { ok: false, sourceId: null, reason: 'SOURCE_ID_INVALID' }
  }
  if (raw.text === undefined || raw.text === null) {
    return { ok: false, sourceId, reason: 'SOURCE_TEXT_MISSING' }
  }
  if (typeof raw.text !== 'string') {
    return { ok: false, sourceId, reason: 'SOURCE_TEXT_INVALID' }
  }
  if (raw.text.trim().length === 0) {
    return { ok: false, sourceId, reason: 'SOURCE_TEXT_MISSING' }
  }
  if (raw.text.length > maxTextLength) {
    return { ok: false, sourceId, reason: 'SOURCE_TEXT_TOO_LARGE' }
  }
  return { ok: true, candidate: { sourceId, text: raw.text } }
}

const PROMPT_OVERRIDE_PATTERNS: readonly RegExp[] = [
  /\b(?:ignore|disregard|forget|override)\b[\s\S]{0,40}?\b(?:previous|prior|above|earlier)\b[\s\S]{0,20}?\b(?:instructions?|prompts?|rules?|directions?)\b/i,
  /\b(?:abaikan|lupakan|timpa)\b[\s\S]{0,40}?\b(?:instruksi|perintah|aturan)\b[\s\S]{0,20}?\b(?:sebelumnya|di\s+atas)\b/i,
  /\b(?:new|updated|real|actual)\s+instructions?\s*:/i,
]

const ROLE_ESCALATION_PATTERNS: readonly RegExp[] = [
  /^\s*(?:system|developer)\s*:/im,
  /<\|?\s*(?:system|developer)\s*\|?>/i,
  /\b(?:you\s+are\s+now|from\s+now\s+on,?\s+you\s+are|act\s+as|pretend\s+to\s+be)\b/i,
  /\b(?:jailbreak|developer\s+mode|do\s+anything\s+now)\b/i,
  /\b(?:elevate|escalate|raise)\b[\s\S]{0,30}?\b(?:privileges?|permissions?|roles?)\b/i,
  /\b(?:as|with)\s+(?:an?\s+)?(?:admin|administrator|root|superuser)\b/i,
]

const SYSTEM_PROMPT_EXFILTRATION_PATTERNS: readonly RegExp[] = [
  /\b(?:reveal|print|show|repeat|output|display|dump|leak|disclose)\b[\s\S]{0,40}?\b(?:system|developer|hidden|internal|initial)\b[\s\S]{0,20}?\b(?:prompt|instructions?|message|rules?)\b/i,
  /\b(?:what|where)\s+(?:is|are)\s+(?:your|the)\s+(?:system|developer|hidden)\s+(?:prompt|instructions?)\b/i,
  /\b(?:tampilkan|bocorkan|tuliskan|ulangi)\b[\s\S]{0,40}?\b(?:prompt|instruksi)\b[\s\S]{0,20}?\b(?:sistem|tersembunyi|awal)\b/i,
]

const TOOL_CALL_PROPOSAL_PATTERNS: readonly RegExp[] = [
  /\b(?:tool_call|tool_calls|function_call|function_calls)\b/i,
  /<\s*tool(?:\s|>)/i,
  /\{[\s\S]{0,200}?"(?:name|tool|function)"\s*:\s*"[^"]{1,128}"[\s\S]{0,200}?"(?:arguments|parameters|input)"\s*:/i,
  /["'](?:tool|function)["']\s*:\s*["'][a-z0-9_.:-]{1,128}["']/i,
]

const TOOL_INVOCATION_DIRECTIVE_PATTERNS: readonly RegExp[] = [
  /\b(?:call|invoke|execute|run|trigger)\s+(?:the\s+)?[a-z0-9_.:-]{1,64}\s+(?:tool|function|command)\b/i,
  /\b(?:call|invoke|execute|run|trigger)\s+(?:any|all|every)\s+(?:available\s+|registered\s+)?(?:tool|function|command)s?\b/i,
  /\b(?:execute|run|invoke|call)\s+(?:the\s+)?(?:command|shell|terminal|script|program)\b/i,
  /\b(?:use|employ)\s+(?:the\s+)?[a-z0-9_.:-]{1,64}\s+(?:tool|function|plugin)\b/i,
  /\b(?:invoke|call)\s+(?:the\s+)?[a-z][a-z0-9_.:-]{2,63}\s*\(/i,
  /\b(?:panggil|jalankan|gunakan|eksekusi)\b[\s\S]{0,30}?\b(?:alat|fungsi|perintah|skrip|tool)\b/i,
]

const TOOL_PERMISSION_REQUEST_PATTERNS: readonly RegExp[] = [
  /\b(?:grant|give|allow|enable|authorize|permit)\s+(?:me|us|yourself|the\s+(?:model|assistant|ai|agent))\b[\s\S]{0,60}?\b(?:access|permission|tool|function|scope|role|credential|token)s?\b/i,
  /\b(?:request|obtain|acquire|escalate)\s+(?:additional\s+|elevated\s+|admin\s+)?(?:tool|function|permission|access|scope|role|privilege)s?\b/i,
  /\b(?:enable|activate|unlock)\s+(?:developer|admin|root|elevated|unrestricted)\s+(?:mode|permissions?|access|tools?)\b/i,
  /\b(?:beri|izinkan|aktifkan|setujui)\s+(?:saya|kami|model|asisten|agen)\b[\s\S]{0,60}?\b(?:akses|izin|alat|fungsi|peran|token|kredensial)\b/i,
]

const EXFILTRATION_DIRECTIVE_PATTERNS: readonly RegExp[] = [
  /\b(?:curl|wget|netcat|nc|Invoke-WebRequest|Invoke-RestMethod)\b/i,
  /\b(?:exfiltrate|exfil|leak|upload|send|post|transmit|forward|beacon)\b[\s\S]{0,60}?\b(?:to|at)\b[\s\S]{0,10}?(?:https?:\/\/|ftp:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|io|id|xyz|ru|cn|co|dev|app|info|cloud|site|online|example|test|invalid))/i,
  /\b(?:fetch|XMLHttpRequest|sendBeacon)\s*\(/i,
  /<\s*(?:img|iframe|script)\b[^>]{0,200}\bsrc\s*=/i,
]

const ABSOLUTE_URL_PATTERN = /\b([a-z][a-z0-9+.-]{1,15}):\/\/([^\s<>"'`\\)\]]+)/gi
const DATA_URI_PATTERN = /\bdata:[a-z0-9.+-]+\/[a-z0-9.+-]+(?:;[a-z0-9=.+-]+)*,/i
const MAILTO_PATTERN = /\bmailto:[^\s<>"']+/i

function matchesAny(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

function parseHost(authority: string): string | null {
  const boundary = authority.search(/[/?#]/)
  const authorityOnly = boundary === -1 ? authority : authority.slice(0, boundary)
  if (authorityOnly.length === 0 || authorityOnly.startsWith('[')) return null
  // Explicit ports are refused so the host allow-list stays exact.
  if (authorityOnly.includes(':')) return null
  const unpadded = authorityOnly.replace(/[),.;!]+$/, '')
  const host = unpadded.toLowerCase()
  const normalized = host.endsWith('.') ? host.slice(0, -1) : host
  return isValidHost(normalized) ? normalized : null
}

function inspectEgress(
  text: string,
  allowedHosts: ReadonlySet<string>,
): SourceGuardDenialReason | null {
  if (DATA_URI_PATTERN.test(text) || MAILTO_PATTERN.test(text)) {
    return 'EGRESS_SCHEME_NOT_ALLOWED'
  }
  for (const match of text.matchAll(ABSOLUTE_URL_PATTERN)) {
    const scheme = match[1]?.toLowerCase()
    const authority = match[2]
    if (scheme === undefined || authority === undefined) continue
    if (scheme !== 'https') return 'EGRESS_SCHEME_NOT_ALLOWED'
    if (authority.includes('@')) return 'EGRESS_DESTINATION_NOT_ALLOWED'
    const host = parseHost(authority)
    if (host === null || !allowedHosts.has(host)) {
      return 'EGRESS_DESTINATION_NOT_ALLOWED'
    }
  }
  return null
}

function inspectUntrustedText(
  text: string,
  policy: NormalizedPolicy,
): SourceGuardDenialReason | null {
  if (matchesAny(text, PROMPT_OVERRIDE_PATTERNS)) return 'PROMPT_OVERRIDE_INSTRUCTION'
  if (matchesAny(text, ROLE_ESCALATION_PATTERNS)) return 'ROLE_ESCALATION_ATTEMPT'
  if (matchesAny(text, SYSTEM_PROMPT_EXFILTRATION_PATTERNS)) {
    return 'SYSTEM_PROMPT_EXFILTRATION'
  }
  if (matchesAny(text, TOOL_CALL_PROPOSAL_PATTERNS)) return 'TOOL_CALL_PROPOSAL_IN_TEXT'
  if (matchesAny(text, TOOL_INVOCATION_DIRECTIVE_PATTERNS)) {
    return 'TOOL_INVOCATION_DIRECTIVE'
  }
  if (matchesAny(text, TOOL_PERMISSION_REQUEST_PATTERNS)) return 'TOOL_PERMISSION_REQUEST'
  if (matchesAny(text, EXFILTRATION_DIRECTIVE_PATTERNS)) return 'EXFILTRATION_DIRECTIVE'
  return inspectEgress(text, policy.allowedEgressHosts)
}

function refusedSource(
  sourceId: string | null,
  reason: SourceGuardDenialReason,
  evaluatedAt: string | null,
): RefusedSourceDecision {
  return {
    sourceId,
    admitted: false,
    contentTrust: 'UNTRUSTED_DATA',
    reason,
    policyVersion: SOURCE_GUARD_POLICY_VERSION,
    evaluatedAt,
  }
}

function refusedTool(
  toolId: string | null,
  origin: ProposedToolOrigin | null,
  reason: SourceGuardDenialReason,
  evaluatedAt: string | null,
): RefusedToolInvocationDecision {
  return {
    permitted: false,
    toolId,
    origin,
    reason,
    policyVersion: SOURCE_GUARD_POLICY_VERSION,
    evaluatedAt,
  }
}

/**
 * Evaluate one untrusted source passage against one policy. Malformed input is
 * rejected rather than trusted; an admitted passage is returned unchanged and
 * must remain data at every later layer.
 */
export function evaluateSourceText(
  candidate: unknown,
  policy: unknown,
): SourceGuardDecision {
  const fallbackSourceId = safeSourceIdOf(candidate)
  const normalizedPolicy = normalizePolicy(policy)
  if (!normalizedPolicy.ok) {
    return refusedSource(fallbackSourceId, normalizedPolicy.reason, null)
  }
  const normalizedCandidate = normalizeCandidate(
    candidate,
    normalizedPolicy.policy.maxTextLength,
  )
  if (!normalizedCandidate.ok) {
    return refusedSource(
      normalizedCandidate.sourceId ?? fallbackSourceId,
      normalizedCandidate.reason,
      normalizedPolicy.policy.evaluatedAt,
    )
  }
  const contentReason = inspectUntrustedText(
    normalizedCandidate.candidate.text,
    normalizedPolicy.policy,
  )
  if (contentReason !== null) {
    return refusedSource(
      normalizedCandidate.candidate.sourceId,
      contentReason,
      normalizedPolicy.policy.evaluatedAt,
    )
  }
  return {
    sourceId: normalizedCandidate.candidate.sourceId,
    admitted: true,
    contentTrust: 'UNTRUSTED_DATA',
    data: normalizedCandidate.candidate.text,
    policyVersion: SOURCE_GUARD_POLICY_VERSION,
    evaluatedAt: normalizedPolicy.policy.evaluatedAt,
  }
}

/**
 * Evaluate one structured tool call. A call declared as coming from untrusted
 * source content is always refused, even when its tool id is allow-listed. A
 * trusted-operator call is admitted only when its tool id is explicitly
 * allow-listed. The `origin` label is not authenticated here.
 */
export function evaluateProposedToolInvocation(
  proposal: unknown,
  policy: unknown,
): ToolInvocationDecision {
  const normalizedPolicy = normalizePolicy(policy)
  if (!normalizedPolicy.ok) {
    return refusedTool(null, null, normalizedPolicy.reason, null)
  }
  if (!isRecord(proposal)) {
    return refusedTool(null, null, 'TOOL_PROPOSAL_MISSING', normalizedPolicy.policy.evaluatedAt)
  }
  if (!isValidToolId(proposal.toolId)) {
    return refusedTool(null, null, 'TOOL_PROPOSAL_INVALID', normalizedPolicy.policy.evaluatedAt)
  }
  const toolId = proposal.toolId
  const origin = proposal.origin
  if (origin !== 'UNTRUSTED_SOURCE' && origin !== 'TRUSTED_OPERATOR') {
    return refusedTool(toolId, null, 'TOOL_PROPOSAL_INVALID', normalizedPolicy.policy.evaluatedAt)
  }
  if (origin === 'UNTRUSTED_SOURCE') {
    return refusedTool(
      toolId,
      origin,
      'TOOL_FROM_UNTRUSTED_SOURCE',
      normalizedPolicy.policy.evaluatedAt,
    )
  }
  if (!normalizedPolicy.policy.allowedToolIds.has(toolId)) {
    return refusedTool(toolId, origin, 'TOOL_NOT_ALLOWED', normalizedPolicy.policy.evaluatedAt)
  }
  return {
    permitted: true,
    toolId,
    origin,
    policyVersion: SOURCE_GUARD_POLICY_VERSION,
    evaluatedAt: normalizedPolicy.policy.evaluatedAt,
  }
}
