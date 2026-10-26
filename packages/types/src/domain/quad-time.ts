/**
 * 4-Dimensional Temporal Ledger Coordinates (Section 21A.1)
 */
export interface QuadTime {
  /** Real-world historical moment when an event took place */
  occurred_at: string
  /** Sensor telemetry / ingestion gateway detection timestamp */
  observed_at: string
  /** Local node database commit timestamp */
  recorded_at: string
  /** Merkle-sealed block / immutable audit ledger timestamp */
  written_at: string
}

export interface TemporalLagAnalysis {
  observationLagMs: number
  ingestionLagMs: number
  sealingLagMs: number
  totalDivergenceMs: number
}

export interface TemporalMonotonicityResult {
  valid: boolean
  violation?: string
}
