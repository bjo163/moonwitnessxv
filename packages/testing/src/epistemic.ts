import type { QuadTime, PassageCitation } from '@moonwitness/types'

/**
 * Asserts causal monotonic forward ordering of 4-dimensional temporal coordinates.
 */
export function assertQuadTimeMonotonic(qt: QuadTime, toleranceMs = 1000): void {
  const tOcc = new Date(qt.occurred_at).getTime()
  const tObs = new Date(qt.observed_at).getTime()
  const tRec = new Date(qt.recorded_at).getTime()
  const tWri = new Date(qt.written_at).getTime()

  if (isNaN(tOcc) || isNaN(tObs) || isNaN(tRec) || isNaN(tWri)) {
    throw new Error('Invalid ISO date in QuadTime coordinate')
  }

  if (tObs < tOcc - toleranceMs) {
    throw new Error(`Causal violation: observed_at (${qt.observed_at}) precedes occurred_at (${qt.occurred_at})`)
  }

  if (tRec < tObs - toleranceMs) {
    throw new Error(`Causal violation: recorded_at (${qt.recorded_at}) precedes observed_at (${qt.observed_at})`)
  }

  if (tWri < tRec - toleranceMs) {
    throw new Error(`Causal violation: written_at (${qt.written_at}) precedes recorded_at (${qt.recorded_at})`)
  }
}

/**
 * Creates a synthetic mock PassageCitation for test suites.
 */
export function createMockCitation(overrides: Partial<PassageCitation> = {}): PassageCitation {
  return {
    urn: 'urn:moonwitness:passage:work-quran:ed-cairo-1924:qs-2-82',
    workCode: 'work-quran',
    editionCode: 'quran_cairo_hafs',
    citation: 'QS 2:82',
    passageSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    licenseStatus: 'RIGHTS_CLEARED',
    watermark: 'MW-QS-2-82-9f86d0',
    verifiedAt: new Date().toISOString(),
    ...overrides,
  }
}
