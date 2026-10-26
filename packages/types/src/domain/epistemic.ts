/**
 * Epistemic Classification and Content Rights Typings (Section 21A.5)
 */
export type EpistemicClass = 'FACT' | 'TELEMETRY' | 'SPECULATION' | 'CANONICAL'

export type RightsStatus =
  | 'RIGHTS_CLEARED'
  | 'METADATA_ONLY'
  | 'PUBLIC_DOMAIN'
  | 'PROPRIETARY'
  | 'DISPUTED'

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

export interface PassageCitation {
  urn: string
  workCode: string
  editionCode: string
  citation: string
  passageSha256: string
  translationSha256?: string
  licenseStatus: RightsStatus
  watermark: string
  verifiedAt: string
}
