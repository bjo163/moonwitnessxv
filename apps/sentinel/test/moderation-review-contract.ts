/**
 * M24-06 — Test-only moderation, appeal, and classification-lens contract.
 *
 * Encodes the findings of `docs/audit/M24-06-sentinel-moderation-review.md` as data.
 * Production Sentinel paths do not import this module: `apps/sentinel/src` has no
 * moderation, report, takedown, appeal, or punitive action surface at the reviewed
 * baseline, and this model does not add one. `humanApproval` is a design input, not a
 * record that a human approved a real decision; the reviewer is still unassigned.
 */
export type ModerationActor = 'AUTOMATED' | 'HUMAN_REVIEWER'

export type ModerationAction =
  | 'NOTIFICATION'
  | 'ALERT_WEBHOOK'
  | 'PUNITIVE_WEBHOOK'
  | 'REPORT_TO_PLATFORM'
  | 'TAKEDOWN'
  | 'HIDE_CONTENT'
  | 'DEMONETIZE'

export type ClassificationBasis = 'SOURCE_BACKED_PHYSICAL' | 'HUMAN_REVIEW' | 'AI_ONLY' | 'UNREVIEWED'

export type ClaimType =
  | 'PHYSICAL_OBSERVATION'
  | 'SOCIAL_SIGNAL'
  | 'THEOLOGICAL_UNCERTAINTY'
  | 'THEOLOGICAL_CERTAINTY'

export interface ModerationIntent {
  actor: ModerationActor | string
  action: ModerationAction | string
  humanApproval: boolean
  classificationBasis: ClassificationBasis | string
  claimType: ClaimType | string
}

export interface ModerationDecision {
  allowed: boolean
  reason: string
}

const MODERATION_ACTIONS = new Set<ModerationAction>([
  'NOTIFICATION',
  'ALERT_WEBHOOK',
  'PUNITIVE_WEBHOOK',
  'REPORT_TO_PLATFORM',
  'TAKEDOWN',
  'HIDE_CONTENT',
  'DEMONETIZE',
])

/** Platform-facing or audience-suppressing actions are punitive: this review denies all of them. */
const PUNITIVE_ACTIONS = new Set<ModerationAction>([
  'PUNITIVE_WEBHOOK',
  'REPORT_TO_PLATFORM',
  'TAKEDOWN',
  'HIDE_CONTENT',
  'DEMONETIZE',
])

const CLAIM_TYPES = new Set<ClaimType>([
  'PHYSICAL_OBSERVATION',
  'SOCIAL_SIGNAL',
  'THEOLOGICAL_UNCERTAINTY',
  'THEOLOGICAL_CERTAINTY',
])

/** Classification must rest on a source-backed observation or a named human review. */
const REVIEWED_BASES = new Set<ClassificationBasis>(['SOURCE_BACKED_PHYSICAL', 'HUMAN_REVIEW'])

/**
 * Pure review policy. It never calls a platform and does not replace a production guard;
 * Sentinel has no punitive action or appeal surface for it to guard at this baseline.
 */
export function evaluateModerationAction(intent: ModerationIntent): ModerationDecision {
  if (!CLAIM_TYPES.has(intent.claimType as ClaimType)) {
    return { allowed: false, reason: 'UNKNOWN_CLAIM_TYPE' }
  }
  if (intent.claimType === 'THEOLOGICAL_CERTAINTY') {
    return { allowed: false, reason: 'THEOLOGICAL_CERTAINTY_FORBIDDEN' }
  }
  if (!MODERATION_ACTIONS.has(intent.action as ModerationAction)) {
    return { allowed: false, reason: 'UNKNOWN_MODERATION_ACTION' }
  }
  if (intent.actor !== 'AUTOMATED' && intent.actor !== 'HUMAN_REVIEWER') {
    return { allowed: false, reason: 'UNKNOWN_MODERATION_ACTOR' }
  }
  if (PUNITIVE_ACTIONS.has(intent.action as ModerationAction)) {
    return { allowed: false, reason: 'PUNITIVE_ACTION_FORBIDDEN' }
  }
  if (!REVIEWED_BASES.has(intent.classificationBasis as ClassificationBasis)) {
    return { allowed: false, reason: 'AI_ONLY_CLASSIFICATION_FORBIDDEN' }
  }
  if (intent.action === 'ALERT_WEBHOOK' && !(intent.actor === 'HUMAN_REVIEWER' && intent.humanApproval === true)) {
    return { allowed: false, reason: 'HUMAN_APPROVAL_REQUIRED' }
  }
  return { allowed: true, reason: 'PERMITTED_BY_REVIEW_POLICY' }
}
