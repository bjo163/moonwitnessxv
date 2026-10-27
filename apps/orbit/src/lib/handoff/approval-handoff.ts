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
 *
 * M40-09: this module is client-safe by construction. It reads no environment
 * and no origin constant; the review surface arrives as a parameter resolved on
 * the server by `src/lib/server/review-surface.ts`.
 */

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
 * The 100CENTER review path is fixed by ORBIT, never read from a payload.
 * Anything the hub sends inside a task record is data to display, not a
 * location to navigate to.
 */
const REVIEW_PATH = '/review'

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
