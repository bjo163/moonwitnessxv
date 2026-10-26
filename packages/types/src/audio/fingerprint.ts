/**
 * Acoustic Fingerprinting & Authenticity Typings (Section 21A.4)
 */
export interface AcousticFingerprint {
  fingerprint: string
  sampleCount: number
  energyRms: number
  confidence: number
}

export interface FingerprintComparison {
  similarity: number
  isAuthentic: boolean
  threshold: number
}
