/**
 * 33 World Patches Typings (Section 21A.8)
 */
export type WorldPatchStatus = 'ACTIVE' | 'DISPUTED' | 'SURRENDERED' | 'HISTORICAL'

export interface WorldPatchMetric {
  label: string
  current: number | string
  target: number | string
  unit: string
}

export interface WorldPatch {
  slot: string
  number: number
  code: string
  title: string
  status: WorldPatchStatus
  category: string
  focus: string
  initiativeRef: string
  historicalNote?: string
  metrics: WorldPatchMetric[]
}
