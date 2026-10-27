'use client'

import { useState, useMemo, useCallback } from 'react'
import type { OrbitOperationalState } from '../fixtures/simulated-operations'
import type { Locale } from '@moonwitness/core'
import type { OrbitCopyKey } from '../lib/orbit-copy'
import {
  buildOperationalQueues,
  filterTaskQueue,
  filterAgentQueue,
  filterWorkstationQueue,
  filterTraceQueue,
  resolveActiveTask,
  resolveAgentTraces,
  resolveAgentTasks,
  resolveWorkstationTraces,
  type TaskQueueFilters,
  type AgentQueueFilters,
  type WorkstationQueueFilters,
} from '../lib/queues/operational-queues'
import { OrbitSpatialViewport } from './OrbitSpatialViewport'
import { OrbitQueueFilterBar } from './OrbitQueueFilterBar'
import { Badge } from '@moonwitness/moonui'

export interface OrbitOperationsWorkspaceProps {
  data: OrbitOperationalState
  locale: Locale
  copy: Readonly<Record<OrbitCopyKey, string>>
}

/**
 * Interactive Client Operations Workspace.
 * Synchronizes bidirectional selection between the 3D spatial viewport
 * and the accessible 2D operations inspector grid.
 */
export function OrbitOperationsWorkspace({
  data,
  locale,
  copy,
}: OrbitOperationsWorkspaceProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'spatial' | 'accessible'>('spatial')

  const queues = useMemo(() => buildOperationalQueues(data), [data])

  const [taskFilters, setTaskFilters] = useState<TaskQueueFilters>({})
  const [agentFilters, setAgentFilters] = useState<AgentQueueFilters>({})
  const [workstationFilters, setWorkstationFilters] = useState<WorkstationQueueFilters>({})
  const [searchValue, setSearchValue] = useState('')

  const isRestricted = data.connectionStatus === 'UNAUTHORIZED'
  const isFailed = !isRestricted && (
    data.errorMessage !== undefined ||
    data.connectionStatus === 'OFFLINE' ||
    data.connectionStatus === 'UNKNOWN'
  )
  // Unauthorized projections can carry no displayable rows. Fail closed even if a
  // future API accidentally returns partial arrays with the denial response.
  const workstations = useMemo(() => isRestricted ? [] : queues.workstations, [isRestricted, queues.workstations])
  const agents = useMemo(() => isRestricted ? [] : queues.agents, [isRestricted, queues.agents])
  const tasks = useMemo(() => isRestricted ? [] : queues.taskQueue, [isRestricted, queues.taskQueue])
  const traces = useMemo(() => isRestricted ? [] : queues.recentTraces, [isRestricted, queues.recentTraces])
  const displayData = isRestricted
    ? { ...data, workstations, agents, taskQueue: tasks, recentTraces: traces }
    : data

  const filteredTasks = useMemo(
    () => filterTaskQueue(tasks, { ...taskFilters, search: searchValue }),
    [tasks, taskFilters, searchValue]
  )
  const filteredAgents = useMemo(
    () => filterAgentQueue(agents, { ...agentFilters, search: searchValue }),
    [agents, agentFilters, searchValue]
  )
  const filteredWorkstations = useMemo(
    () => filterWorkstationQueue(workstations, { ...workstationFilters, search: searchValue }),
    [workstations, workstationFilters, searchValue]
  )
  const filteredTraces = useMemo(
    () => filterTraceQueue(traces, searchValue),
    [traces, searchValue]
  )

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id)
    setSelectedTaskId(null)
  }, [])

  const selectTask = useCallback((id: string | null) => {
    setSelectedTaskId(id)
    setSelectedNodeId(null)
  }, [])

  return (
    <>
      {/* Filter Bar — M40-07 */}
      <OrbitQueueFilterBar
        copy={copy}
        workstations={workstations}
        agents={agents}
        tasks={tasks}
        taskFilters={taskFilters}
        onTaskFiltersChange={setTaskFilters}
        agentFilters={agentFilters}
        onAgentFiltersChange={setAgentFilters}
        workstationFilters={workstationFilters}
        onWorkstationFiltersChange={setWorkstationFilters}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        disabled={isRestricted}
      />

      {/* Spatial 3D Viewport Boundary (Client-only R3F Canvas with [SIMULATED] tags) */}
      <section
        id="overview"
        className="orbit-spatial-container"
        aria-labelledby="spatial-viewport-heading"
      >
        <OrbitSpatialViewport
          data={displayData}
          locale={locale}
          copy={copy}
          selectedNodeId={selectedNodeId}
          onSelectNode={selectNode}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </section>

      {/* Accessible 2D Fallback Operation Grid */}
      <section id="workstations" aria-labelledby="accessible-2d-heading">
        <h2
          id="accessible-2d-heading"
          style={{
            marginBottom: '16px',
            fontSize: '1.05rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {copy.accessible2dHeading}
        </h2>

        {isRestricted && (
          <p className="orbit-state-notice restricted" role="alert">
            {copy.queueRestrictedState}
          </p>
        )}
        {isFailed && (
          <p className="orbit-state-notice failed" role="alert">
            {copy.queueFailedState}
          </p>
        )}

        <div className="orbit-2d-grid">
          {/* Workstations Panel */}
          <div className="orbit-panel">
            <h3 className="orbit-panel-title">{copy.workstationsHeading} ({filteredWorkstations.length})</h3>
            {!isRestricted && filteredWorkstations.length === 0 && (
              <p className="orbit-empty-state" role="status">{copy.queueEmptyState}</p>
            )}
            <ul className="orbit-list" aria-label={copy.workstationsHeading}>
              {filteredWorkstations.map((ws) => {
                const isSelected = selectedNodeId === ws.id
                return (
                  <li
                    key={ws.id}
                    className={`orbit-item clickable ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectNode(isSelected ? null : ws.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectNode(isSelected ? null : ws.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                  >
                    <div className="orbit-item-header">
                      <span className="orbit-item-title">{ws.name}</span>
                      <Badge tone={isSelected ? 'accent' : 'night'}>{ws.status}</Badge>
                    </div>
                    <div className="orbit-item-meta">
                      <span>{copy.zoneLabel}: {ws.zone.toUpperCase()}</span>
                      <span>{copy.agentsLabel}: {ws.agentIds.join(', ')}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Agent Loops Panel */}
          <div id="agent-loops" className="orbit-panel">
            <h3 className="orbit-panel-title">{copy.agentLoopsHeading} ({filteredAgents.length})</h3>
            {!isRestricted && filteredAgents.length === 0 && (
              <p className="orbit-empty-state" role="status">{copy.queueEmptyState}</p>
            )}
            <ul className="orbit-list" aria-label={copy.agentLoopsHeading}>
              {filteredAgents.map((agent) => {
                const isSelected = selectedNodeId === agent.id
                return (
                  <li
                    key={agent.id}
                    className={`orbit-item clickable ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectNode(isSelected ? null : agent.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectNode(isSelected ? null : agent.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                  >
                    <div className="orbit-item-header">
                      <span className="orbit-item-title">{agent.name}</span>
                      <Badge tone={agent.state === 'WAITING_APPROVAL' ? 'accent' : 'ok'}>
                        {agent.state}
                      </Badge>
                    </div>
                    <div className="orbit-item-meta">
                      <span>{copy.roleLabel}: {agent.role}</span>
                    </div>
                    <div className="orbit-item-meta">
                      <span>{copy.cycleLabel}: #{agent.executionCycle}</span>
                      <span>{copy.stepsLabel}: {agent.stepCount}</span>
                      <span>{copy.leaseLabel}: {agent.leaseStatus}</span>
                    </div>
                    {agent.state === 'FAILED' && (
                      <div className="orbit-failed-notice">{copy.queueFailedState}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Task Queues Panel */}
          <div id="task-queues" className="orbit-panel">
            <h3 className="orbit-panel-title">{copy.taskQueuesHeading} ({filteredTasks.length})</h3>
            {!isRestricted && filteredTasks.length === 0 && (
              <p className="orbit-empty-state" role="status">{copy.queueEmptyState}</p>
            )}
            <ul className="orbit-list" aria-label={copy.taskQueuesHeading}>
              {filteredTasks.map((task) => {
                const isSelected = selectedTaskId === task.id
                return (
                <li
                  key={task.id}
                  className={`orbit-item clickable ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectTask(isSelected ? null : task.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      selectTask(isSelected ? null : task.id)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                >
                  <div className="orbit-item-header">
                    <span className="orbit-item-title">{task.title}</span>
                    <Badge tone={task.priority === 'CRITICAL' ? 'hot' : 'night'}>
                      {task.status}
                    </Badge>
                  </div>
                  <div className="orbit-item-meta">
                    <span>{copy.idLabel}: {task.id}</span>
                    <span>{copy.priorityLabel}: {task.priority}</span>
                  </div>
                  {task.approvalPayload && (
                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--accent)',
                      }}
                    >
                      {copy.handoffNotice}: {task.approvalPayload.action} ({task.approvalPayload.requestedRole})
                    </div>
                  )}
                  {task.status === 'BLOCKED' && (
                    <div className="orbit-failed-notice">{copy.queueFailedState}</div>
                  )}
                </li>
                )
              })}
            </ul>
          </div>

          {/* Event Traces Panel */}
          <div id="audit-traces" className="orbit-panel">
            <h3 className="orbit-panel-title">{copy.auditTracesHeading} ({filteredTraces.length})</h3>
            {!isRestricted && filteredTraces.length === 0 && (
              <p className="orbit-empty-state" role="status">{copy.queueNoActivity}</p>
            )}
            <ul className="orbit-list" aria-label={copy.auditTracesHeading}>
              {filteredTraces.map((trace) => (
                <li
                  key={trace.id}
                  className={`orbit-trace-entry ${trace.level.toLowerCase()}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--muted)',
                      fontSize: '0.7rem',
                    }}
                  >
                    <span>[{trace.source}]</span>
                    <time dateTime={trace.timestamp}>
                      {trace.timestamp.split('T')[1]?.replace('Z', '')}
                    </time>
                  </div>
                  <div>{trace.message}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity Feed for Selected Node — M40-07 */}
          {selectedNodeId && (
            <div className="orbit-panel" id="activity-feed">
              <h3 className="orbit-panel-title">{copy.queueActivityHeading}</h3>
              <p className="orbit-item-meta">{copy.queueEventOrder}</p>
              <ul className="orbit-list" aria-label={copy.queueActivityHeading}>
                {(() => {
                  const agent = agents.find((a) => a.id === selectedNodeId)
                  const workstation = workstations.find((ws) => ws.id === selectedNodeId)
                  const relatedAgents = agent
                    ? [agent]
                    : workstation
                      ? agents.filter((item) => workstation.agentIds.includes(item.id))
                      : []
                  const activeTasks = resolveAgentTasks(relatedAgents, queues.taskQueue)
                  const activityTraces = workstation
                    ? resolveWorkstationTraces(workstation, queues.recentTraces)
                    : agent
                      ? resolveAgentTraces(agent.id, queues.recentTraces)
                      : []

                  return (
                    <>
                      {activeTasks.map((activeTask) => (
                        <li className="orbit-item" key={activeTask.id}>
                          <div className="orbit-item-header">
                            <span className="orbit-item-title">
                              {copy.queueApprovalAction}: {activeTask.title}
                            </span>
                            <Badge tone={activeTask.priority === 'CRITICAL' ? 'hot' : 'night'}>
                              {activeTask.status}
                            </Badge>
                          </div>
                          <div className="orbit-item-meta">
                            <span>{copy.queueSourceLabel}: {activeTask.id}</span>
                            <span>{copy.priorityLabel}: {activeTask.priority}</span>
                          </div>
                        </li>
                      ))}
                      {activityTraces.length > 0 ? (
                        activityTraces.map((t) => (
                          <li key={t.id} className="orbit-trace-entry info">
                            <div className="orbit-item-meta">
                              <span>[{t.source}]</span>
                              <time dateTime={t.timestamp}>{t.timestamp}</time>
                            </div>
                            <div>{t.message}</div>
                          </li>
                        ))
                      ) : activeTasks.length === 0 ? (
                        <li className="orbit-empty-state">{copy.queueNoActivity}</li>
                      ) : null}
                    </>
                  )
                })()}
              </ul>
            </div>
          )}

          {selectedTaskId && (() => {
            const selectedTask = tasks.find((task) => task.id === selectedTaskId)
            if (!selectedTask) return null
            const assignedAgent = agents.find((agent) => agent.id === selectedTask.assignedAgentId)
            const activeTask = assignedAgent ? resolveActiveTask(assignedAgent, queues.taskQueue) : null
            return (
              <div className="orbit-panel" id="task-inspector">
                <h3 className="orbit-panel-title">{copy.taskQueuesHeading}</h3>
                <p className="orbit-item-title">{selectedTask.title}</p>
                <p className="orbit-item-meta">{copy.idLabel}: {selectedTask.id}</p>
                <p className="orbit-item-meta">{copy.queueHandoffStatus}: {selectedTask.status}</p>
                {activeTask?.id === selectedTask.id && assignedAgent && (
                  <p className="orbit-item-meta">{copy.queueSourceLabel}: {assignedAgent.name}</p>
                )}
                {selectedTask.approvalPayload && (
                  <p className="orbit-item-meta">
                    {copy.handoffNotice}: {selectedTask.approvalPayload.action} ({selectedTask.approvalPayload.requestedRole})
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      </section>
    </>
  )
}
