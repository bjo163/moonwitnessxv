/**
 * apps/orbit/src/lib/projections/operational-projection.ts
 *
 * Pure read-only projection normalizer for ORBIT spatial agent operations.
 * Enforces truthful state, calculates data freshness, maps corrupt/missing data
 * safely to 'UNKNOWN', and strips sensitive credentials from browser bundles.
 */

import type {
  OrbitStateProjection,
  WorkstationProjection,
  AgentProjection,
  TaskProjection,
  TraceProjection,
  FreshnessStatus,
  ConnectionStatus,
  WorkstationZone,
  WorkstationStatus,
  AgentState,
  TaskPriority,
  TaskStatus,
  TraceLevel,
  ProvenanceType,
  ProjectionOptions,
} from './types.ts'
import { LOOPBACK_REVIEW_SURFACE } from '../server/review-surface.ts'

const DEFAULT_STALE_THRESHOLD_MS = 60_000 // 60 seconds

/**
 * Calculates temporal data freshness according to clock delta.
 */
export function calculateFreshness(
  timestamp: unknown,
  now = Date.now(),
  thresholdMs = DEFAULT_STALE_THRESHOLD_MS
): FreshnessStatus {
  if (typeof timestamp !== 'string' || timestamp.trim().length === 0) {
    return 'UNKNOWN'
  }

  const parsed = Date.parse(timestamp)
  if (Number.isNaN(parsed)) {
    return 'UNKNOWN'
  }

  const age = now - parsed

  // Future clock drift beyond 5 minutes or age exceeding threshold is marked STALE
  if (age < -300_000 || age > thresholdMs) {
    return 'STALE'
  }

  return 'FRESH'
}

/**
 * Recursively strips sensitive credentials, secret tokens, and passwords from payloads.
 */
export function sanitizePayload<T>(input: T): T {
  if (input === null || typeof input !== 'object') {
    return input
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizePayload(item)) as unknown as T
  }

  const sanitized: Record<string, unknown> = {}
  const secretPattern = /(key|secret|token|password|auth|credential|cert)/i

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (secretPattern.test(key) && typeof value === 'string' && value.length > 0) {
      sanitized[key] = '[REDACTED_BY_PROJECTION]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * Normalizes a raw workstation record into a validated WorkstationProjection.
 */
export function projectWorkstation(
  raw: unknown,
  opts: ProjectionOptions = {}
): WorkstationProjection {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const validZones: readonly WorkstationZone[] = ['alpha', 'beta', 'gamma']
  const validStatuses: readonly WorkstationStatus[] = ['STANDALONE', 'OFFLINE', 'DEGRADED', 'MAINTENANCE']
  const validProvenance: readonly ProvenanceType[] = ['SIMULATED', 'LIVE']

  const id = typeof r.id === 'string' && r.id.trim().length > 0 ? r.id.trim() : 'ws-unknown'
  const name = typeof r.name === 'string' && r.name.trim().length > 0 ? r.name.trim() : `Workstation (${id})`
  const zone = validZones.includes(r.zone as WorkstationZone) ? (r.zone as WorkstationZone) : 'UNKNOWN'
  const status = validStatuses.includes(r.status as WorkstationStatus) ? (r.status as WorkstationStatus) : 'UNKNOWN'
  const provenance = validProvenance.includes(r.provenance as ProvenanceType)
    ? (r.provenance as ProvenanceType)
    : (opts.defaultProvenance ?? 'UNKNOWN')

  const agentIds = Array.isArray(r.agentIds)
    ? r.agentIds.filter((a): a is string => typeof a === 'string')
    : []

  const rawPos = Array.isArray(r.position) && r.position.length >= 3 ? r.position : [0, 0, 0]
  const position: [number, number, number] = [
    typeof rawPos[0] === 'number' && Number.isFinite(rawPos[0]) ? rawPos[0] : 0,
    typeof rawPos[1] === 'number' && Number.isFinite(rawPos[1]) ? rawPos[1] : 0,
    typeof rawPos[2] === 'number' && Number.isFinite(rawPos[2]) ? rawPos[2] : 0,
  ]

  const lastHeartbeat = typeof r.lastHeartbeat === 'string' ? r.lastHeartbeat : ''
  const freshness = calculateFreshness(lastHeartbeat, opts.now, opts.staleThresholdMs)

  return {
    id,
    name,
    zone,
    status,
    provenance,
    agentIds,
    position,
    lastHeartbeat,
    freshness,
  }
}

/**
 * Normalizes a raw agent record into a validated AgentProjection.
 */
export function projectAgent(
  raw: unknown,
  opts: ProjectionOptions = {}
): AgentProjection {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const validStates: readonly AgentState[] = ['IDLE', 'EXECUTING', 'WAITING_APPROVAL', 'PAUSED', 'FAILED']
  const validLeases = ['ACQUIRED', 'RELEASED', 'FENCED', 'NONE']
  const validProvenance: readonly ProvenanceType[] = ['SIMULATED', 'LIVE']

  const id = typeof r.id === 'string' && r.id.trim().length > 0 ? r.id.trim() : 'agent-unknown'
  const name = typeof r.name === 'string' && r.name.trim().length > 0 ? r.name.trim() : `Agent (${id})`
  const role = typeof r.role === 'string' && r.role.trim().length > 0 ? r.role.trim() : 'Unspecified Autonomous Role'
  const workstationId = typeof r.workstationId === 'string' ? r.workstationId : ''
  const state = validStates.includes(r.state as AgentState) ? (r.state as AgentState) : 'UNKNOWN'
  const provenance = validProvenance.includes(r.provenance as ProvenanceType)
    ? (r.provenance as ProvenanceType)
    : (opts.defaultProvenance ?? 'UNKNOWN')

  const currentTaskId = typeof r.currentTaskId === 'string' && r.currentTaskId.length > 0 ? r.currentTaskId : null
  const executionCycle = typeof r.executionCycle === 'number' && Number.isFinite(r.executionCycle) ? Math.max(0, r.executionCycle) : 0
  const leaseStatus = validLeases.includes(r.leaseStatus as string) ? (r.leaseStatus as AgentProjection['leaseStatus']) : 'UNKNOWN'
  const stepCount = typeof r.stepCount === 'number' && Number.isFinite(r.stepCount) ? Math.max(0, r.stepCount) : 0
  const checkpointVersion = typeof r.checkpointVersion === 'string' ? r.checkpointVersion : '0.0.0'

  return {
    id,
    name,
    role,
    workstationId,
    state,
    provenance,
    currentTaskId,
    executionCycle,
    leaseStatus,
    stepCount,
    checkpointVersion,
    freshness: 'FRESH',
  }
}

/**
 * Normalizes a raw task record into a validated TaskProjection.
 */
export function projectTask(
  raw: unknown,
  opts: ProjectionOptions = {}
): TaskProjection {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const validPriorities: readonly TaskPriority[] = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW']
  const validStatuses: readonly TaskStatus[] = ['QUEUED', 'RUNNING', 'APPROVAL_REQUIRED', 'COMPLETED', 'BLOCKED']
  const validProvenance: readonly ProvenanceType[] = ['SIMULATED', 'LIVE']

  const id = typeof r.id === 'string' && r.id.trim().length > 0 ? r.id.trim() : 'task-unknown'
  const title = typeof r.title === 'string' && r.title.trim().length > 0 ? r.title.trim() : `Task (${id})`
  const priority = validPriorities.includes(r.priority as TaskPriority) ? (r.priority as TaskPriority) : 'UNKNOWN'
  const status = validStatuses.includes(r.status as TaskStatus) ? (r.status as TaskStatus) : 'UNKNOWN'
  const provenance = validProvenance.includes(r.provenance as ProvenanceType)
    ? (r.provenance as ProvenanceType)
    : (opts.defaultProvenance ?? 'UNKNOWN')

  const assignedAgentId = typeof r.assignedAgentId === 'string' && r.assignedAgentId.length > 0 ? r.assignedAgentId : null
  const createdAt = typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString()

  let approvalPayload: TaskProjection['approvalPayload']
  if (typeof r.approvalPayload === 'object' && r.approvalPayload !== null) {
    const ap = r.approvalPayload as Record<string, unknown>
    approvalPayload = {
      action: typeof ap.action === 'string' ? ap.action : 'UNKNOWN_ACTION',
      requestedRole: typeof ap.requestedRole === 'string' ? ap.requestedRole : 'OPERATOR',
      reason: typeof ap.reason === 'string' ? ap.reason : 'Approval required for execution',
    }
  }

  return {
    id,
    title,
    priority,
    status,
    provenance,
    assignedAgentId,
    createdAt,
    approvalPayload,
  }
}

/**
 * Normalizes a raw audit trace record into a validated TraceProjection.
 */
export function projectTrace(
  raw: unknown,
  opts: ProjectionOptions = {}
): TraceProjection {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const validLevels: readonly TraceLevel[] = ['INFO', 'WARN', 'ERROR', 'SECURITY']
  const validProvenance: readonly ProvenanceType[] = ['SIMULATED', 'LIVE']

  const id = typeof r.id === 'string' && r.id.trim().length > 0 ? r.id.trim() : `trace-${Date.now()}`
  const timestamp = typeof r.timestamp === 'string' ? r.timestamp : new Date().toISOString()
  const level = validLevels.includes(r.level as TraceLevel) ? (r.level as TraceLevel) : 'INFO'
  const source = typeof r.source === 'string' && r.source.trim().length > 0 ? r.source.trim() : 'RUNTIME'
  const message = typeof r.message === 'string' ? r.message : 'Telemetry event recorded'
  const provenance = validProvenance.includes(r.provenance as ProvenanceType)
    ? (r.provenance as ProvenanceType)
    : (opts.defaultProvenance ?? 'UNKNOWN')

  return {
    id,
    timestamp,
    level,
    source,
    message,
    provenance,
  }
}

/**
 * Canonical Projection Normalizer.
 * Safely ingests raw input feeds from ARSY runtime API, LUMEN event streams, or offline fixtures,
 * producing a pure, immutable OrbitStateProjection with honest freshness and error mapping.
 */
export function projectOperationalState(
  rawInput: unknown,
  options: ProjectionOptions = {}
): OrbitStateProjection {
  const sanitized = sanitizePayload(rawInput)
  const r = (typeof sanitized === 'object' && sanitized !== null ? sanitized : {}) as Record<string, unknown>

  // Check for unauthorized / forbidden responses
  if (r.error === 'UNAUTHORIZED' || r.statusCode === 401 || r.statusCode === 403) {
    return {
      connectionStatus: 'UNAUTHORIZED',
      dataSource: 'ARSY Runtime Gateway',
      lastSyncTimestamp: new Date().toISOString(),
      freshness: 'UNKNOWN',
      workstations: [],
      agents: [],
      taskQueue: [],
      recentTraces: [
        {
          id: 'trace-auth-err',
          timestamp: new Date().toISOString(),
          level: 'SECURITY',
          source: 'AUTH_GATEWAY',
          message: 'Access denied: Valid operator credentials required for live operational state.',
          provenance: 'UNKNOWN',
        },
      ],
      errorMessage: 'UNAUTHORIZED',
      reviewSurface: options.reviewSurface ?? LOOPBACK_REVIEW_SURFACE,
    }
  }

  // Check for backend outage / service unavailable
  if (r.error === 'SERVICE_UNAVAILABLE' || r.statusCode === 503 || r.connectionStatus === 'OFFLINE') {
    return {
      connectionStatus: 'OFFLINE',
      dataSource: typeof r.dataSource === 'string' ? r.dataSource : 'ARSY Runtime (Offline)',
      lastSyncTimestamp: typeof r.lastSyncTimestamp === 'string' ? r.lastSyncTimestamp : new Date().toISOString(),
      freshness: 'UNKNOWN',
      workstations: [],
      agents: [],
      taskQueue: [],
      recentTraces: [
        {
          id: 'trace-offline-err',
          timestamp: new Date().toISOString(),
          level: 'WARN',
          source: 'NETWORK_SUPERVISOR',
          message: 'Backend operational service is unavailable. Operating in offline isolation.',
          provenance: 'UNKNOWN',
        },
      ],
      errorMessage: 'SERVICE_UNAVAILABLE',
      reviewSurface: options.reviewSurface ?? LOOPBACK_REVIEW_SURFACE,
    }
  }

  // Connection status determination
  const validConnStatuses: readonly ConnectionStatus[] = [
    'OFFLINE',
    'SIMULATED_LOCAL',
    'LIVE_CONNECTED',
    'UNAUTHORIZED',
  ]
  const connectionStatus = validConnStatuses.includes(r.connectionStatus as ConnectionStatus)
    ? (r.connectionStatus as ConnectionStatus)
    : r.connectionStatus === undefined && (Array.isArray(r.workstations) || Array.isArray(r.agents))
      ? 'SIMULATED_LOCAL'
      : 'UNKNOWN'

  const dataSource =
    typeof r.dataSource === 'string' && r.dataSource.trim().length > 0
      ? r.dataSource.trim()
      : connectionStatus === 'SIMULATED_LOCAL'
        ? 'Local Deterministic Simulation Engine'
        : 'Unknown Telemetry Source'

  const lastSyncTimestamp =
    typeof r.lastSyncTimestamp === 'string' ? r.lastSyncTimestamp : ''

  const freshness = r.lastSyncTimestamp
    ? calculateFreshness(lastSyncTimestamp, options.now, options.staleThresholdMs)
    : 'UNKNOWN'

  const defaultProvenance: ProvenanceType =
    connectionStatus === 'LIVE_CONNECTED'
      ? 'LIVE'
      : connectionStatus === 'SIMULATED_LOCAL'
        ? 'SIMULATED'
        : 'UNKNOWN'

  const projectionOpts: ProjectionOptions = {
    ...options,
    defaultProvenance,
  }

  const workstations = Array.isArray(r.workstations)
    ? r.workstations.map((ws) => projectWorkstation(ws, projectionOpts))
    : []

  const agents = Array.isArray(r.agents)
    ? r.agents.map((ag) => projectAgent(ag, projectionOpts))
    : []

  const taskQueue = Array.isArray(r.taskQueue)
    ? r.taskQueue.map((t) => projectTask(t, projectionOpts))
    : []

  const recentTraces = Array.isArray(r.recentTraces)
    ? r.recentTraces.map((tr) => projectTrace(tr, projectionOpts))
    : []

  return {
    connectionStatus,
    dataSource,
    lastSyncTimestamp,
    freshness,
    workstations,
    agents,
    taskQueue,
    recentTraces,
    reviewSurface: options.reviewSurface ?? LOOPBACK_REVIEW_SURFACE,
  }
}
