/**
 * apps/orbit/src/lib/handoff/approval-handoff.ts
 *
 * M40-08: read-only approval handoff contract for ORBIT.
 *
 * ORBIT observes and links; it never decides. The queue, the four-eyes
 * transition and the role/eligibility re-check stay with the ARSY hub and the
 * 100CENTER review surface (ADR-0001, ADR-0004, M20-02 design), so this module
 * produces display descriptors only — there is no approve, reject or publish
 * path anywhere in it.
 */

import { FRONTEND_URLS } from '@moonwitness/core'
import type {
  ConnectionStatus,
  ReviewSurface,
  TaskProjection,
} from '../projections/types.ts'

export type HandoffStatus = 'NOT_REQUIRED' | 'AWAITING_HUMAN_REVIEW' | 'UNAVAILABLE'

export interface ApprovalHandoff {
  readonly status: HandoffStatus
  readonly taskId: string
  readonly action?: string
  readonly requestedRole?: string
  readonly reason?: string
  readonly reviewUrl?: string
  /** Machine-readable reason when the review origin was rejected. */
  readonly denial?: ReviewSurface['denial']
  /** True when the backing projection is a simulated fixture, never a live queue. */
  readonly simulated: boolean
}

/**
 * Loopback review surface used when the deployment configures nothing.
 *
 * Same shared port table the hub's service index advertises, so ORBIT cannot
 * drift onto a different 100CENTER origin than the rest of the workspace.
 */
export const LOOPBACK_REVIEW_SURFACE: ReviewSurface = {
  available: true,
  origin: FRONTEND_URLS.headquarters,
}

const ABSENT_REVIEW_SURFACE: ReviewSurface = {
  available: false,
  denial: 'ORIGIN_UNRESOLVED',
}

/**
 * The 100CENTER review path is fixed by ORBIT, never read from a payload.
 * Anything the hub sends inside a task record is data to display, not a
 * location to navigate to.
 */
const REVIEW_PATH = '/review'

/**
 * Validate one configured 100CENTER origin.
 *
 * An empty value is an explicit denial rather than a guess, and a
 * credential-bearing or non-http(s) value can never become a link target.
 */
export function validateReviewOrigin(raw: string | undefined): ReviewSurface {
  if (raw === undefined || raw.trim() === '') return ABSENT_REVIEW_SURFACE
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return { available: false, denial: 'ORIGIN_MALFORMED' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { available: false, denial: 'ORIGIN_SCHEME_UNSUPPORTED' }
  }
  if (parsed.username.length > 0 || parsed.password.length > 0) {
    return { available: false, denial: 'ORIGIN_CREDENTIALS_FORBIDDEN' }
  }
  return { available: true, origin: parsed.origin }
}

/**
 * Resolve the review surface from a server environment.
 *
 * Kept server-side so no environment value is read inside a client component;
 * the browser only ever receives the validated origin.
 */
export function resolveReviewSurface(
  env: Record<string, string | undefined> = process.env,
): ReviewSurface {
  const configured = env.NEXT_PUBLIC_HEADQUARTERS_URL
  if (configured === undefined) return LOOPBACK_REVIEW_SURFACE
  return validateReviewOrigin(configured)
}

/** Approval is required only when the projected record itself says so. */
export function isApprovalRequired(task: TaskProjection): boolean {
  if (task.status !== 'APPROVAL_REQUIRED') return false
  const payload = task.approvalPayload
  if (payload === undefined) return false
  return payload.action.trim().length > 0 && payload.requestedRole.trim().length > 0
}

/** Without a verified session there is no handoff to claim, only an outage to name. */
function connectionIsVerifiable(connectionStatus: ConnectionStatus): boolean {
  return connectionStatus === 'LIVE_CONNECTED' || connectionStatus === 'SIMULATED_LOCAL'
}

/**
 * Build the display descriptor for one task's approval state.
 *
 * The review URL is composed from the validated origin, a fixed path owned by
 * ORBIT, and URL-encoded identifiers. No field of a task payload contributes to
 * the destination, so a poisoned record cannot steer navigation.
 */
export function buildApprovalHandoff(
  task: TaskProjection,
  options: { readonly connectionStatus: ConnectionStatus; readonly reviewSurface: ReviewSurface },
): ApprovalHandoff {
  const base = {
    taskId: task.id,
    simulated: task.provenance === 'SIMULATED',
  }

  if (!isApprovalRequired(task)) {
    return { ...base, status: 'NOT_REQUIRED' }
  }

  const payload = task.approvalPayload as NonNullable<TaskProjection['approvalPayload']>
  const withPayload = {
    ...base,
    action: payload.action,
    requestedRole: payload.requestedRole,
    reason: payload.reason,
  }

  if (!connectionIsVerifiable(options.connectionStatus)) {
    return { ...withPayload, status: 'UNAVAILABLE' }
  }

  if (!options.reviewSurface.available || options.reviewSurface.origin === undefined) {
    return { ...withPayload, status: 'UNAVAILABLE', denial: options.reviewSurface.denial ?? 'ORIGIN_UNRESOLVED' }
  }

  const params = new URLSearchParams({ task: task.id, role: payload.requestedRole })
  return {
    ...withPayload,
    status: 'AWAITING_HUMAN_REVIEW',
    reviewUrl: `${options.reviewSurface.origin}${REVIEW_PATH}?${params.toString()}`,
  }
}
