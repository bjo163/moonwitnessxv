export type BarrierResponse =
  | 'ADAPTED_SAFELY'
  | 'CONSENSUAL_SUPPORT'
  | 'STOPPED_SAFELY'
  | 'UNSAFE'
  | 'NONE'
  | null

export type BenefitEvidence =
  | 'VERIFIED_BENEFIT'
  | 'NO_VERIFIED_BENEFIT'
  | 'UNKNOWN'
  | 'NOT_ASSESSED'

export interface RealWorldActionRecord {
  id: string
  validSafePlan: boolean
  voluntary: boolean
  started: boolean
  completed: boolean
  barrierObserved: boolean
  barrierResponse: BarrierResponse
  benefitEvidence: BenefitEvidence
}

export interface RateMetric {
  numerator: number
  denominator: number
  percent: number | null
  status: 'MEASURED' | 'NOT_APPLICABLE'
}

export interface RealWorldActionMetrics {
  inputCount: number
  acceptedRecordCount: number
  invalidIdCount: number
  duplicateIdCount: number
  eligibleActionCount: number
  startedActionCount: number
  completedActionCount: number
  observedBarrierCount: number
  safeBarrierResponseCount: number
  evaluatedBenefitCount: number
  verifiedBenefitCount: number
  unknownBenefitCount: number
  unassessedBenefitCount: number
  initiationRate: RateMetric
  barrierResponseRate: RateMetric
  completionRate: RateMetric
  practicalBenefitRate: RateMetric
}

const SAFE_BARRIER_RESPONSES = new Set<Exclude<BarrierResponse, null>>([
  'ADAPTED_SAFELY',
  'CONSENSUAL_SUPPORT',
  'STOPPED_SAFELY',
])

function rate(numerator: number, denominator: number): RateMetric {
  return {
    numerator,
    denominator,
    percent: denominator === 0 ? null : Number(((numerator / denominator) * 100).toFixed(2)),
    status: denominator === 0 ? 'NOT_APPLICABLE' : 'MEASURED',
  }
}

/**
 * Calculates non-identifying outcome metrics for voluntary, safe, real-world actions.
 *
 * This is a pure function: it performs no persistence, network requests, identity
 * collection, or spiritual scoring. Only the first record for each valid ID is used.
 */
export function calculateRealWorldActionMetrics(
  records: readonly RealWorldActionRecord[],
): RealWorldActionMetrics {
  const seenIds = new Set<string>()
  const accepted: RealWorldActionRecord[] = []
  let invalidIdCount = 0
  let duplicateIdCount = 0

  for (const record of records) {
    const id = typeof record.id === 'string' ? record.id.trim() : ''
    if (!id) {
      invalidIdCount += 1
      continue
    }
    if (seenIds.has(id)) {
      duplicateIdCount += 1
      continue
    }
    seenIds.add(id)
    accepted.push(record)
  }

  const eligible = accepted.filter((record) => record.validSafePlan && record.voluntary)
  const startedActionCount = eligible.filter((record) => record.started).length
  const completedActionCount = eligible.filter((record) => record.completed).length
  // Outcome rates are scoped to voluntary, safe plans; unsafe records remain in
  // integrity counts but cannot improve or worsen efficacy metrics.
  const barriers = eligible.filter((record) => record.barrierObserved)
  const safeBarrierResponseCount = barriers.filter(
    (record) => record.barrierResponse !== null && SAFE_BARRIER_RESPONSES.has(record.barrierResponse),
  ).length
  const evaluatedBenefits = eligible.filter(
    (record) => record.benefitEvidence === 'VERIFIED_BENEFIT' || record.benefitEvidence === 'NO_VERIFIED_BENEFIT',
  )
  const verifiedBenefitCount = evaluatedBenefits.filter(
    (record) => record.benefitEvidence === 'VERIFIED_BENEFIT',
  ).length

  return {
    inputCount: records.length,
    acceptedRecordCount: accepted.length,
    invalidIdCount,
    duplicateIdCount,
    eligibleActionCount: eligible.length,
    startedActionCount,
    completedActionCount,
    observedBarrierCount: barriers.length,
    safeBarrierResponseCount,
    evaluatedBenefitCount: evaluatedBenefits.length,
    verifiedBenefitCount,
    unknownBenefitCount: eligible.filter((record) => record.benefitEvidence === 'UNKNOWN').length,
    unassessedBenefitCount: eligible.filter((record) => record.benefitEvidence === 'NOT_ASSESSED').length,
    initiationRate: rate(startedActionCount, eligible.length),
    barrierResponseRate: rate(safeBarrierResponseCount, barriers.length),
    completionRate: rate(completedActionCount, eligible.length),
    practicalBenefitRate: rate(verifiedBenefitCount, evaluatedBenefits.length),
  }
}
