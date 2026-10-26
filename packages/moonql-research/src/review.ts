import {
  MIZAN_CRITERIA,
  MIZAN_MAX_SCORE,
  MIZAN_METHOD_SHA256,
  MIZAN_MIN_INDEPENDENT_ANNOTATORS,
  MIZAN_SCALE_MAX,
  MIZAN_SCALE_MIN,
} from './seed.js'
import type { REVIEW_ACTIONS, REVIEW_MACHINE_STATES } from './seed.js'

export type ReviewState = (typeof REVIEW_MACHINE_STATES)[number]
export type ReviewAction = (typeof REVIEW_ACTIONS)[number]
export type Row = Record<string, unknown>

export const REVIEW_TRANSITIONS: Record<ReviewState, readonly ReviewState[]> = {
  DRAFT: ['SUBMITTED', 'RETRACTED'],
  SUBMITTED: ['REVIEWED', 'REJECTED', 'DRAFT', 'RETRACTED'],
  REVIEWED: ['DISPUTED', 'RETRACTED'],
  DISPUTED: ['REVIEWED', 'RETRACTED'],
  REJECTED: ['RETRACTED'],
  RETRACTED: [],
}

export const ACTION_TARGET_STATE: Record<ReviewAction, ReviewState> = {
  SUBMIT: 'SUBMITTED',
  APPROVE: 'REVIEWED',
  REJECT: 'REJECTED',
  REQUEST_REVISION: 'DRAFT',
  DISPUTE: 'DISPUTED',
  RESOLVE_DISPUTE: 'REVIEWED',
  RETRACT: 'RETRACTED',
}

export const eventKeyFor = (reviewCode: string, action: ReviewAction, versionTo: number): string =>
  `${reviewCode}:${action}:${versionTo}`

export function canTransition(from: ReviewState, action: ReviewAction): boolean {
  return REVIEW_TRANSITIONS[from]?.includes(ACTION_TARGET_STATE[action]) === true
}

const canonicalJson = (value: Row): string =>
  `{${MIZAN_CRITERIA.map((entry) => `${JSON.stringify(entry.key)}:${JSON.stringify(value[entry.key])}`).join(',')}}`

export function parseMizanScores(raw: unknown): Row {
  let value: unknown = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    } catch {
      throw new Error('MIZAN scores must be a JSON object')
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('MIZAN scores must be a JSON object with the six bounded criteria')
  }
  const record = value as Row
  const allowed = new Set(MIZAN_CRITERIA.map((entry) => entry.key as string))
  const extra = Object.keys(record).filter((key) => !allowed.has(key))
  if (extra.length) throw new Error(`MIZAN scores contain unknown criteria: ${extra.join(', ')}`)
  for (const entry of MIZAN_CRITERIA) {
    const score = record[entry.key]
    if (!Number.isInteger(score) || (score as number) < MIZAN_SCALE_MIN || (score as number) > MIZAN_SCALE_MAX) {
      throw new Error(`MIZAN criterion ${entry.key} must be an integer from ${MIZAN_SCALE_MIN} to ${MIZAN_SCALE_MAX}`)
    }
  }
  return JSON.parse(canonicalJson(record)) as Row
}

export function scoreMizan(raw: unknown): { scores: Row; scoresJson: string; totalScore: number; maxScore: number } {
  const scores = parseMizanScores(raw)
  const totalScore = MIZAN_CRITERIA.reduce((sum, entry) => sum + (scores[entry.key] as number), 0)
  return {
    scores,
    scoresJson: canonicalJson(scores),
    totalScore,
    maxScore: MIZAN_MAX_SCORE,
  }
}

export function mizanRunIsBounded(run: Row | null | undefined, method: Row | null | undefined): boolean {
  if (!run || !method) return false
  if (method.methodSha !== MIZAN_METHOD_SHA256) return false
  if (run.methodSha !== method.methodSha) return false
  if (run.methodCode !== method.methodCode || run.methodVersion !== method.version) return false
  if (!Number.isInteger(run.totalScore) || (run.totalScore as number) < 0 || (run.totalScore as number) > MIZAN_MAX_SCORE) {
    return false
  }
  if (!run.explanation || !run.context || !run.unknowns) return false
  try {
    const parsed = parseMizanScores(run.scoresJson)
    const total = MIZAN_CRITERIA.reduce((sum, entry) => sum + (parsed[entry.key] as number), 0)
    return total === run.totalScore
  } catch {
    return false
  }
}

export type PilotAnnotation = {
  caseCode?: unknown
  evidenceSha?: unknown
  annotatorRef?: unknown
  annotatorName?: unknown
  assessment?: unknown
}

export type PilotStatus = {
  status: 'RECORDED' | 'BLOCKED'
  annotationCount: number
  distinctAnnotators: number
  independent: boolean
  sameSha: boolean
  agreement: boolean | null
  assessments: string[]
  blockers: string[]
  note: string
}

export function pilotStatus(annotations: readonly PilotAnnotation[], caseCode: string, caseSha: string | null): PilotStatus {
  const blockers: string[] = []
  const annotatorIds = annotations.map((entry) => String(entry.annotatorRef ?? ''))
  const named = annotations.map((entry) => String(entry.annotatorName ?? '').trim())
  const distinct = new Set(annotatorIds.filter(Boolean))
  const sameSha =
    annotations.length > 0 &&
    caseSha !== null &&
    annotations.every((entry) => entry.evidenceSha === caseSha)
  const inCase = annotations.every((entry) => entry.caseCode === caseCode)
  const independent = annotations.length > 1 && distinct.size === annotations.length
  const assessments = annotations.map((entry) => String(entry.assessment ?? ''))
  const agreement =
    annotations.length > 0 && assessments.every((entry) => entry === assessments[0]) ? true : annotations.length ? false : null

  if (annotations.length < MIZAN_MIN_INDEPENDENT_ANNOTATORS) blockers.push('PILOT_NEEDS_TWO_INDEPENDENT_ANNOTATIONS')
  if (!independent) blockers.push('PILOT_ANNOTATORS_NOT_INDEPENDENT')
  if (!sameSha) blockers.push('PILOT_SHA_MISMATCH')
  if (!inCase) blockers.push('PILOT_CASE_MISMATCH')
  if (named.some((entry) => !entry)) blockers.push('PILOT_NAMED_ANNOTATOR_REQUIRED')

  return {
    status: blockers.length ? 'BLOCKED' : 'RECORDED',
    annotationCount: annotations.length,
    distinctAnnotators: distinct.size,
    independent,
    sameSha,
    agreement,
    assessments,
    blockers,
    note:
      blockers.length > 0
        ? 'The pilot is not recorded: incomplete or non-independent annotation cannot support release.'
        : agreement
          ? 'Independent annotations are recorded at the exact case SHA; agreement is descriptive, not a verdict.'
          : 'Independent annotations disagree at the exact case SHA; disagreement is recorded, not smoothed.',
  }
}

export type ReleaseInput = {
  review: Row
  caseSha: string | null
  targetSha: string | null
  counterevidence: readonly Row[]
  pilot: PilotStatus
  mizanRun: Row | null
  method: Row | null
}

export type ReleaseVerdict = {
  eligible: boolean
  humanReviewed: boolean
  reviewedAtExactSha: boolean
  publicationAvailable: false
  autoApproved: false
  scoreIsVerdict: false
  blockers: string[]
  notice: string
}

export function releaseVerdict(input: ReleaseInput): ReleaseVerdict {
  const { review, caseSha, targetSha, counterevidence, pilot, mizanRun, method } = input
  const blockers: string[] = []
  const submittedBy = review.submittedByRef === null || review.submittedByRef === undefined ? '' : String(review.submittedByRef)
  const reviewer = review.reviewerRef === null || review.reviewerRef === undefined ? '' : String(review.reviewerRef)

  if (review.state !== 'REVIEWED') blockers.push('REVIEW_STATE_NOT_REVIEWED')
  if (review.decision !== 'APPROVED') blockers.push('DECISION_NOT_APPROVED')
  if (!reviewer) blockers.push('NAMED_REVIEWER_REQUIRED')
  if (submittedBy && reviewer && submittedBy === reviewer) blockers.push('FOUR_EYES_VIOLATION')
  if (!caseSha || review.evidenceSha !== caseSha) blockers.push('EXACT_CASE_SHA_REQUIRED')
  if (!targetSha || targetSha !== caseSha) blockers.push('TARGET_NOT_AT_EXACT_SHA')
  if (counterevidence.length === 0) blockers.push('COUNTEREVIDENCE_MISSING')
  if (counterevidence.some((entry) => entry.status === 'OPEN')) blockers.push('COUNTEREVIDENCE_OPEN')
  if (counterevidence.some((entry) => entry.status === 'OPEN' || !String(entry.resolutionReason ?? '').trim())) {
    if (counterevidence.some((entry) => entry.status !== 'OPEN')) blockers.push('COUNTEREVIDENCE_RESOLUTION_WITHOUT_REASON')
  }
  if (!mizanRun) blockers.push('MIZAN_RUN_REQUIRED')
  if (!mizanRunIsBounded(mizanRun, method)) blockers.push('MIZAN_METHOD_BOUND_REQUIRED')
  if (pilot.status !== 'RECORDED') blockers.push(...pilot.blockers.map((entry) => `PILOT_${entry.replace(/^PILOT_/, '')}`))
  if (!pilot.sameSha) blockers.push('PILOT_SHA_MISMATCH')

  const unique = [...new Set(blockers)]
  return {
    eligible: unique.length === 0,
    humanReviewed: unique.length === 0,
    reviewedAtExactSha: Boolean(caseSha && review.evidenceSha === caseSha),
    publicationAvailable: false,
    autoApproved: false,
    scoreIsVerdict: false,
    blockers: unique,
    notice:
      unique.length === 0
        ? 'Review conditions are satisfied for a reviewed claim; publication is still unavailable in this milestone.'
        : 'Review conditions are incomplete; nothing is published and nothing is auto-approved.',
  }
}

const locks = new Map<string, Promise<unknown>>()

/** Serialize read-check-write per review code; the durable backstop is the unique event key. */
export async function withLock<T>(key: string, work: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve()
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const tail = previous.then(() => gate)
  locks.set(key, tail)
  await previous.catch(() => undefined)
  try {
    return await work()
  } finally {
    release()
    if (locks.get(key) === tail) locks.delete(key)
  }
}
