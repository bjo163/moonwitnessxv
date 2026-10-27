'use client'

import { useState } from 'react'
import type { OrbitOperationalState } from '../fixtures/simulated-operations'
import type { Locale } from '@moonwitness/core'
import type { OrbitCopyKey } from '../lib/orbit-copy'
import { OrbitSpatialViewport } from './OrbitSpatialViewport'
import { Badge, Card, CardHeader, CardBody } from '@moonwitness/moonui'

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

  const { workstations, agents, taskQueue, recentTraces } = data

  return (
    <>
      {/* Spatial 3D Viewport Boundary (Client-only R3F Canvas with [SIMULATED] tags) */}
      <section
        id="overview"
        className="orbit-spatial-container"
        aria-labelledby="spatial-viewport-heading"
      >
        <OrbitSpatialViewport
          data={data}
          locale={locale}
          copy={copy}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
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

        <div className="orbit-2d-grid">
          {/* Workstations Panel */}
          <Card variant="outline">
            <CardHeader title={copy.workstationsHeading} />
            <CardBody>
              <ul className="orbit-list" aria-label={copy.workstationsHeading}>
                {workstations.map((ws) => {
                  const isSelected = selectedNodeId === ws.id
                  return (
                    <li
                      key={ws.id}
                      className={`orbit-item clickable ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedNodeId(isSelected ? null : ws.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedNodeId(isSelected ? null : ws.id)
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
            </CardBody>
          </Card>

          {/* Agent Loops Panel */}
          <div id="agent-loops">
            <Card variant="outline">
              <CardHeader title={copy.agentLoopsHeading} />
              <CardBody>
                <ul className="orbit-list" aria-label={copy.agentLoopsHeading}>
                  {agents.map((agent) => {
                    const isSelected = selectedNodeId === agent.id
                    return (
                      <li
                        key={agent.id}
                        className={`orbit-item clickable ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedNodeId(isSelected ? null : agent.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedNodeId(isSelected ? null : agent.id)
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
                      </li>
                    )
                  })}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Task Queues Panel */}
          <div id="task-queues">
            <Card variant="outline">
              <CardHeader title={copy.taskQueuesHeading} />
              <CardBody>
                <ul className="orbit-list" aria-label={copy.taskQueuesHeading}>
                  {taskQueue.map((task) => (
                    <li key={task.id} className="orbit-item">
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
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Event Traces Panel */}
          <div id="audit-traces">
            <Card variant="outline">
              <CardHeader title={copy.auditTracesHeading} />
              <CardBody>
                <ul className="orbit-list" aria-label={copy.auditTracesHeading}>
                  {recentTraces.map((trace) => (
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
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
