/**
 * 100CENTER Operational HUD & MTS Astronomical Telemetry Typings (Section 21A.6)
 */
export type EmpireSystemCode =
  | '100CENTER'
  | 'FURQAN'
  | 'MIZAN'
  | 'AMANAH'
  | 'SHURA'
  | 'KITAB'
  | 'SIDRA TREE'
  | 'ATMOSPHERE'
  | 'HELIOGRID'
  | 'ARSY'
  | 'MATERIAL FORGE'
  | 'OBSERVATORY'

export interface EmpireSystemStatus {
  code: EmpireSystemCode
  name: string
  status: 'HEALTHY' | 'DEGRADED' | 'STANDBY' | 'CRITICAL'
  latencyMs: number
  activeAgents: number
  detail?: string
}

export interface MtsTelemetryData {
  utc: string
  lunarDay: number
  lunarPhase: string
  moonAgeFraction: number
  illuminationPct: number
  siderealHours: number
}
