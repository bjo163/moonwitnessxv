/**
 * apps/orbit/src/lib/queues/operational-queues.ts
 *
 * M40-07: Pure filterable queue and inspector projection helpers.
 *
 * Derives ordered, filterable task/workstation/agent views from the typed
 * read-only projection contract (M40-05). No fabrication: every record is
 * sourced from the canonical projection and preserves event order.
 * Restricted, empty and failed states are rendered safely.
 */

import type {
  OrbitStateProjection,
  WorkstationProjection,
  AgentProjection,
  TaskProjection,
  TraceProjection,
} from '../projections/types.ts'

export type QueueStatusFilter = 'ALL' | TaskProjection['status']
export type QueuePriorityFilter = 'ALL' | TaskProjection['priority']
export type AgentStateFilter = 'ALL' | AgentProjection['state']
export type WorkstationStatusFilter = 'ALL' | WorkstationProjection['status']

export interface TaskQueueFilters {
  status?: QueueStatusFilter
  priority?: QueuePriorityFilter
  assignedAgentId?: string | null
  search?: string
}

export interface AgentQueueFilters {
  state?: AgentStateFilter
  workstationId?: string
  search?: string
}

export interface WorkstationQueueFilters {
  status?: WorkstationStatusFilter
  zone?: string
  search?: string
}

export interface OperationalQueues {
  workstations: WorkstationProjection[]
  agents: AgentProjection[]
  taskQueue: TaskProjection[]
  recentTraces: TraceProjection[]
  identityConflictCount: number
  counts: {
    workstations: number
    agents: number
    tasks: number
    traces: number
    approvalRequired: number
    failed: number
    blocked: number
  }
}

/**
 * Case-insensitive substring match against id/title/name/role.
 */
function matchesSearch(record: object, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return true
  const haystack = Object.values(record)
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

/**
 * Deterministically filter and count the task queue.
 */
export function filterTaskQueue(
  tasks: readonly TaskProjection[],
  filters: TaskQueueFilters = {}
): TaskProjection[] {
  return tasks.filter((task) => {
    if (filters.status && filters.status !== 'ALL' && task.status !== filters.status) return false
    if (filters.priority && filters.priority !== 'ALL' && task.priority !== filters.priority) return false
    if (filters.assignedAgentId !== undefined && task.assignedAgentId !== filters.assignedAgentId) return false
    if (filters.search && !matchesSearch(task, filters.search)) return false
    return true
  })
}

/**
 * Deterministically filter the agent loop list.
 */
export function filterAgentQueue(
  agents: readonly AgentProjection[],
  filters: AgentQueueFilters = {}
): AgentProjection[] {
  return agents.filter((agent) => {
    if (filters.state && filters.state !== 'ALL' && agent.state !== filters.state) return false
    if (filters.workstationId && agent.workstationId !== filters.workstationId) return false
    if (filters.search && !matchesSearch(agent, filters.search)) return false
    return true
  })
}

/**
 * Deterministically filter the workstation list.
 */
export function filterWorkstationQueue(
  workstations: readonly WorkstationProjection[],
  filters: WorkstationQueueFilters = {}
): WorkstationProjection[] {
  return workstations.filter((ws) => {
    if (filters.status && filters.status !== 'ALL' && ws.status !== filters.status) return false
    if (filters.zone && filters.zone !== 'ALL' && ws.zone !== filters.zone) return false
    if (filters.search && !matchesSearch(ws, filters.search)) return false
    return true
  })
}

/** Filter canonical traces with the same shared search term used by the queues. */
export function filterTraceQueue(
  traces: readonly TraceProjection[],
  search = ''
): TraceProjection[] {
  const query = search.trim().toLowerCase()
  if (!query) return [...traces]
  return traces.filter((trace) => `${trace.id} ${trace.source} ${trace.message}`.toLowerCase().includes(query))
}

/**
 * Build the full operational queue view with deterministic counts.
 * Preserves canonical array order from the projection.
 */
export function buildOperationalQueues(projection: OrbitStateProjection): OperationalQueues {
  const projectedWorkstations = projection.workstations ?? []
  const projectedAgents = projection.agents ?? []
  const projectedTasks = projection.taskQueue ?? []
  const projectedTraces = projection.recentTraces ?? []

  const duplicateWorkstationIds = findDuplicateIds(projectedWorkstations)
  const duplicateAgentIds = findDuplicateIds(projectedAgents)
  const duplicateNodeIds = findDuplicateIds([...projectedWorkstations, ...projectedAgents])
  const duplicateTaskIds = findDuplicateIds(projectedTasks)
  const duplicateTraceIds = findDuplicateIds(projectedTraces)

  // Any repeated identifier is ambiguous for selection or React keys. Remove every
  // occurrence deterministically, retaining the relative order of unambiguous rows.
  const workstations = projectedWorkstations.filter(
    (item) => !duplicateWorkstationIds.has(item.id) && !duplicateNodeIds.has(item.id)
  )
  const agents = projectedAgents.filter(
    (item) => !duplicateAgentIds.has(item.id) && !duplicateNodeIds.has(item.id)
  )
  const taskQueue = projectedTasks.filter((item) => !duplicateTaskIds.has(item.id))
  const recentTraces = projectedTraces.filter((item) => !duplicateTraceIds.has(item.id))
  const identityConflictIds = new Set([
    ...duplicateNodeIds,
    ...duplicateTaskIds,
    ...duplicateTraceIds,
  ])

  return {
    workstations,
    agents,
    taskQueue,
    recentTraces,
    identityConflictCount: identityConflictIds.size,
    counts: {
      workstations: workstations.length,
      agents: agents.length,
      tasks: taskQueue.length,
      traces: recentTraces.length,
      approvalRequired: taskQueue.filter((t) => t.status === 'APPROVAL_REQUIRED').length,
      failed: taskQueue.filter((t) => t.status === 'BLOCKED').length,
      blocked: agents.filter((a) => a.state === 'FAILED').length,
    },
  }
}

function findDuplicateIds<T extends { id: string }>(records: readonly T[]): Set<string> {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const record of records) {
    if (seen.has(record.id)) duplicates.add(record.id)
    seen.add(record.id)
  }
  return duplicates
}

/** Escape closes a task inspector only when one is currently selected. */
export function shouldDismissTaskInspectorOnKey(key: string, selectedTaskId: string | null): boolean {
  return key === 'Escape' && selectedTaskId !== null
}

/**
 * Resolve the active task bound to an agent, if any. Never fabricates.
 */
export function resolveActiveTask(
  agent: AgentProjection,
  taskQueue: readonly TaskProjection[]
): TaskProjection | null {
  if (!agent.currentTaskId) return null
  return taskQueue.find((t) => t.id === agent.currentTaskId) ?? null
}

/**
 * Canonical trace slice for an agent (most recent first), preserving order.
 */
export function resolveAgentTraces(
  agentId: string,
  traces: readonly TraceProjection[]
): TraceProjection[] {
  return traces.filter((trace) => mentionsIdentifier(trace.source, agentId) || mentionsIdentifier(trace.message, agentId))
}

function mentionsIdentifier(text: string, identifier: string): boolean {
  const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^A-Za-z0-9])${escaped}($|[^A-Za-z0-9])`).test(text)
}

/** Resolve traces for the agents attached to a workstation, preserving source order. */
export function resolveWorkstationTraces(
  workstation: WorkstationProjection,
  traces: readonly TraceProjection[]
): TraceProjection[] {
  const agentIds = new Set(workstation.agentIds)
  return traces.filter((trace) =>
    [...agentIds].some((agentId) => mentionsIdentifier(trace.source, agentId) || mentionsIdentifier(trace.message, agentId))
  )
}

/** Resolve current tasks linked by id to the selected agents, without inventing work. */
export function resolveAgentTasks(
  agents: readonly AgentProjection[],
  taskQueue: readonly TaskProjection[]
): TaskProjection[] {
  const taskIds = new Set(agents.map((agent) => agent.currentTaskId).filter((id): id is string => Boolean(id)))
  return taskQueue.filter((task) => taskIds.has(task.id))
}

/**
 * Distinct workstation zones present in the projection (sorted, deterministic).
 */
export function distinctZones(workstations: readonly WorkstationProjection[]): string[] {
  return Array.from(new Set(workstations.map((ws) => ws.zone))).sort()
}

/**
 * Distinct agent states present in the projection (sorted, deterministic).
 */
export function distinctAgentStates(agents: readonly AgentProjection[]): string[] {
  return Array.from(new Set(agents.map((a) => a.state))).sort()
}

/**
 * Distinct task statuses present in the projection (sorted, deterministic).
 */
export function distinctTaskStatuses(tasks: readonly TaskProjection[]): string[] {
  return Array.from(new Set(tasks.map((t) => t.status))).sort()
}

/**
 * Distinct task priorities present in the projection (sorted, deterministic).
 */
export function distinctTaskPriorities(tasks: readonly TaskProjection[]): string[] {
  return Array.from(new Set(tasks.map((t) => t.priority))).sort()
}
