/**
 * packages/core/src/quad-time.ts
 *
 * 4-Dimensional Temporal Ledger Coordinates (Section 21A.1).
 *
 * Disentangles real-world occurrence, sensor perception, local ingestion,
 * and immutable ledger sealing into non-collapsible coordinates:
 * - `occurred_at`: Real-world historical moment when an event happened.
 * - `observed_at`: Sensor telemetry / ingestion gateway detection timestamp.
 * - `recorded_at`: Local node database commit timestamp.
 * - `written_at`: Merkle-sealed block / immutable audit ledger timestamp.
 */

export interface QuadTime {
  occurred_at: string
  observed_at: string
  recorded_at: string
  written_at: string
}

export interface TemporalLagAnalysis {
  observationLagMs: number
  ingestionLagMs: number
  sealingLagMs: number
  totalDivergenceMs: number
}

function toIsoString(date?: string | Date): string {
  if (!date) return new Date().toISOString()
  if (typeof date === 'string') return new Date(date).toISOString()
  return date.toISOString()
}

/**
 * Creates a normalized 4-dimensional temporal coordinate set.
 */
export function createQuadTime(
  occurredAt?: string | Date,
  observedAt?: string | Date,
  recordedAt?: string | Date,
  writtenAt?: string | Date
): QuadTime {
  const occ = toIsoString(occurredAt)
  const obs = observedAt ? toIsoString(observedAt) : occ
  const rec = recordedAt ? toIsoString(recordedAt) : obs
  const wri = writtenAt ? toIsoString(writtenAt) : rec

  return {
    occurred_at: occ,
    observed_at: obs,
    recorded_at: rec,
    written_at: wri,
  }
}

/**
 * Computes lag intervals between the 4 temporal dimensions.
 */
export function calculateTemporalDrift(qt: QuadTime): TemporalLagAnalysis {
  const tOcc = new Date(qt.occurred_at).getTime()
  const tObs = new Date(qt.observed_at).getTime()
  const tRec = new Date(qt.recorded_at).getTime()
  const tWri = new Date(qt.written_at).getTime()

  const observationLagMs = Math.max(0, tObs - tOcc)
  const ingestionLagMs = Math.max(0, tRec - tObs)
  const sealingLagMs = Math.max(0, tWri - tRec)
  const totalDivergenceMs = Math.max(0, tWri - tOcc)

  return {
    observationLagMs,
    ingestionLagMs,
    sealingLagMs,
    totalDivergenceMs,
  }
}

/**
 * Validates that timestamps follow causal forward ordering:
 * occurred_at <= observed_at <= recorded_at <= written_at
 * Allows slight tolerance (up to 1000ms clock skew).
 */
export function validateQuadTimeMonotonicity(
  qt: QuadTime,
  skewToleranceMs = 1000
): { valid: boolean; violation?: string } {
  const tOcc = new Date(qt.occurred_at).getTime()
  const tObs = new Date(qt.observed_at).getTime()
  const tRec = new Date(qt.recorded_at).getTime()
  const tWri = new Date(qt.written_at).getTime()

  if (isNaN(tOcc) || isNaN(tObs) || isNaN(tRec) || isNaN(tWri)) {
    return { valid: false, violation: 'One or more timestamps are invalid ISO dates' }
  }

  if (tObs < tOcc - skewToleranceMs) {
    return { valid: false, violation: `observed_at (${qt.observed_at}) precedes occurred_at (${qt.occurred_at})` }
  }

  if (tRec < tObs - skewToleranceMs) {
    return { valid: false, violation: `recorded_at (${qt.recorded_at}) precedes observed_at (${qt.observed_at})` }
  }

  if (tWri < tRec - skewToleranceMs) {
    return { valid: false, violation: `written_at (${qt.written_at}) precedes recorded_at (${qt.recorded_at})` }
  }

  return { valid: true }
}

/**
 * Formats quad-time into compact single-line string for terminal logs or headers.
 */
export function serializeQuadTimeHeader(qt: QuadTime): string {
  return `occ=${qt.occurred_at};obs=${qt.observed_at};rec=${qt.recorded_at};wri=${qt.written_at}`
}

/**
 * Parses quad-time header back into structured QuadTime object.
 */
export function parseQuadTimeHeader(header: string): QuadTime | null {
  const parts = header.split(';')
  const map: Partial<Record<'occ' | 'obs' | 'rec' | 'wri', string>> = {}

  for (const part of parts) {
    const [k, v] = part.split('=')
    if (k && v && (k === 'occ' || k === 'obs' || k === 'rec' || k === 'wri')) {
      map[k] = v.trim()
    }
  }

  if (!map.occ || !map.obs || !map.rec || !map.wri) {
    return null
  }

  return {
    occurred_at: map.occ,
    observed_at: map.obs,
    recorded_at: map.rec,
    written_at: map.wri,
  }
}
