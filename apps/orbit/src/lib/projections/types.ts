/**
 * apps/orbit/src/lib/projections/types.ts
 *
 * Strongly-typed read-only projection domain contracts for ORBIT.
 * Pure view models with strict provenance, freshness, and fail-safe types.
 */

export type ConnectionStatus =
  | 'OFFLINE'
  | 'SIMULATED_LOCAL'
  | 'LIVE_CONNECTED'
  | 'UNAUTHORIZED'
  | 'UNKNOWN'

export type FreshnessStatus = 'FRESH' | 'STALE' | 'UNKNOWN'

export type ProvenanceType = 'SIMULATED' | 'LIVE' | 'UNKNOWN'

export type WorkstationZone = 'alpha' | 'beta' | 'gamma' | 'UNKNOWN'

export type WorkstationStatus =
  | 'STANDALONE'
  | 'OFFLINE'
  | 'DEGRADED'
  | 'MAINTENANCE'
  | 'UNKNOWN'

export type AgentState =
  | 'IDLE'
  | 'EXECUTING'
  | 'WAITING_APPROVAL'
  | 'PAUSED'
  | 'FAILED'
  | 'UNKNOWN'

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' | 'UNKNOWN'

export type TaskStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'APPROVAL_REQUIRED'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'UNKNOWN'

export type TraceLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY'

/** Why the 100CENTER review origin could not be used as a handoff target. */
export type ReviewSurfaceDenial =
  | 'ORIGIN_UNRESOLVED'
  | 'ORIGIN_MALFORMED'
  | 'ORIGIN_SCHEME_UNSUPPORTED'
  | 'ORIGIN_CREDENTIALS_FORBIDDEN'

/**
 * Server-resolved 100CENTER review origin offered to the UI.
 *
 * The browser receives the outcome of validation, never the raw environment
 * value and never a credential-bearing or non-http(s) location.
 */
export interface ReviewSurface {
  available: boolean
  origin?: string
  denial?: ReviewSurfaceDenial
}

export interface WorkstationProjection {
  id: string
  name: string
  zone: WorkstationZone
  status: WorkstationStatus
  provenance: ProvenanceType
  agentIds: string[]
  position: [number, number, number]
  lastHeartbeat: string
  freshness: FreshnessStatus
}

export interface AgentProjection {
  id: string
  name: string
  role: string
  workstationId: string
  state: AgentState
  provenance: ProvenanceType
  currentTaskId: string | null
  executionCycle: number
  leaseStatus: 'ACQUIRED' | 'RELEASED' | 'FENCED' | 'NONE' | 'UNKNOWN'
  stepCount: number
  checkpointVersion: string
  freshness: FreshnessStatus
}

export interface TaskProjection {
  id: string
  title: string
  priority: TaskPriority
  status: TaskStatus
  provenance: ProvenanceType
  assignedAgentId: string | null
  createdAt: string
  approvalPayload?: {
    action: string
    requestedRole: string
    reason: string
  }
}

export interface TraceProjection {
  id: string
  timestamp: string
  level: TraceLevel
  source: string
  message: string
  provenance: ProvenanceType
}

export interface OrbitStateProjection {
  connectionStatus: ConnectionStatus
  dataSource: string
  lastSyncTimestamp: string
  freshness: FreshnessStatus
  workstations: WorkstationProjection[]
  agents: AgentProjection[]
  taskQueue: TaskProjection[]
  recentTraces: TraceProjection[]
  reviewSurface: ReviewSurface
  errorMessage?: string
}

export interface ProjectionOptions {
  now?: number
  staleThresholdMs?: number
  defaultProvenance?: ProvenanceType
  reviewSurface?: ReviewSurface
}
