/**
 * packages/core/src/tracing.ts
 *
 * Epistemic Distributed Tracing Carrier (Section 21A.5).
 *
 * Wraps distributed trace context with epistemic attributes:
 * - `epistemic.class`: Epistemic certainty category ('FACT' | 'TELEMETRY' | 'SPECULATION' | 'CANONICAL')
 * - `provenance.sha`: Merkle root or cryptographic passage watermark SHA-256
 * - `rights.status`: Content copyright status ('RIGHTS_CLEARED' | 'METADATA_ONLY' | 'PUBLIC_DOMAIN')
 * - `reviewer.id`: Qualified human reviewer identifier
 */

export type EpistemicClass = 'FACT' | 'TELEMETRY' | 'SPECULATION' | 'CANONICAL'
export type RightsStatus = 'RIGHTS_CLEARED' | 'METADATA_ONLY' | 'PUBLIC_DOMAIN' | 'PROPRIETARY'

export interface EpistemicSpanContext {
  traceId: string
  spanId: string
  parentSpanId?: string
  epistemicClass: EpistemicClass
  provenanceSha?: string
  rightsStatus?: RightsStatus
  reviewerId?: string
  timestamp: string
}

function randomHex(bytes: number): string {
  const chars = '0123456789abcdef'
  let out = ''
  for (let i = 0; i < bytes * 2; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

/**
 * Creates an epistemic trace span context.
 */
export function createEpistemicSpan(
  epistemicClass: EpistemicClass,
  options: {
    parentContext?: EpistemicSpanContext
    provenanceSha?: string
    rightsStatus?: RightsStatus
    reviewerId?: string
  } = {}
): EpistemicSpanContext {
  const traceId = options.parentContext?.traceId ?? randomHex(16)
  const spanId = randomHex(8)
  const parentSpanId = options.parentContext?.spanId

  return {
    traceId,
    spanId,
    parentSpanId,
    epistemicClass,
    provenanceSha: options.provenanceSha ?? options.parentContext?.provenanceSha,
    rightsStatus: options.rightsStatus ?? options.parentContext?.rightsStatus,
    reviewerId: options.reviewerId ?? options.parentContext?.reviewerId,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Serializes epistemic span into W3C-like baggage headers.
 */
export function serializeEpistemicTraceHeader(ctx: EpistemicSpanContext): Record<string, string> {
  const baggage: string[] = [
    `epistemic_class=${ctx.epistemicClass}`,
    `ts=${ctx.timestamp}`,
  ]

  if (ctx.provenanceSha) baggage.push(`provenance_sha=${ctx.provenanceSha}`)
  if (ctx.rightsStatus) baggage.push(`rights_status=${ctx.rightsStatus}`)
  if (ctx.reviewerId) baggage.push(`reviewer_id=${ctx.reviewerId}`)

  return {
    'traceparent': `00-${ctx.traceId}-${ctx.spanId}-01`,
    'baggage': baggage.join(','),
  }
}

/**
 * Parses incoming W3C traceparent and baggage into EpistemicSpanContext.
 */
export function parseEpistemicTraceHeader(
  traceparent?: string | null,
  baggage?: string | null
): EpistemicSpanContext | null {
  if (!traceparent) return null

  const tpParts = traceparent.split('-')
  if (tpParts.length < 4 || tpParts[0] !== '00') return null

  const traceId = tpParts[1] ?? ''
  const spanId = tpParts[2] ?? ''

  let epistemicClass: EpistemicClass = 'TELEMETRY'
  let provenanceSha: string | undefined
  let rightsStatus: RightsStatus | undefined
  let reviewerId: string | undefined
  let timestamp = new Date().toISOString()

  if (baggage) {
    const items = baggage.split(',')
    for (const item of items) {
      const [k, v] = item.split('=').map((s) => s.trim())
      if (k === 'epistemic_class' && (v === 'FACT' || v === 'TELEMETRY' || v === 'SPECULATION' || v === 'CANONICAL')) {
        epistemicClass = v
      } else if (k === 'provenance_sha' && v) {
        provenanceSha = v
      } else if (k === 'rights_status' && (v === 'RIGHTS_CLEARED' || v === 'METADATA_ONLY' || v === 'PUBLIC_DOMAIN' || v === 'PROPRIETARY')) {
        rightsStatus = v
      } else if (k === 'reviewer_id' && v) {
        reviewerId = v
      } else if (k === 'ts' && v) {
        timestamp = v
      }
    }
  }

  return {
    traceId,
    spanId,
    epistemicClass,
    provenanceSha,
    rightsStatus,
    reviewerId,
    timestamp,
  }
}
