'use client'

import { useEffect, useRef } from 'react'
import { Badge, Button, Card, CardHeader, CardBody } from '@moonwitness/moonui'
import type { OrbitOperationalState } from '../fixtures/simulated-operations'
import type { OrbitCopyKey } from '../lib/orbit-copy'
import { buildApprovalHandoff } from '../lib/handoff/approval-handoff.ts'

export interface OrbitNodeInspectorProps {
  data: OrbitOperationalState
  selectedNodeId: string | null
  onClose: () => void
  copy: Readonly<Record<OrbitCopyKey, string>>
}

/**
 * Accessible 2D Detail Inspector Drawer.
 * Synchronized with 3D spatial selections and keyboard Escape handler.
 * Strictly labels simulated provenance and links required human approvals to 100CENTER.
 */
export function OrbitNodeInspector({
  data,
  selectedNodeId,
  onClose,
  copy,
}: OrbitNodeInspectorProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedNodeId) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, onClose])

  if (!selectedNodeId) {
    return null
  }

  const workstation = data.workstations.find((ws) => ws.id === selectedNodeId)
  const agent = data.agents.find((ag) => ag.id === selectedNodeId)
  const currentTask = agent?.currentTaskId
    ? data.taskQueue.find((t) => t.id === agent.currentTaskId)
    : null

  const handoff = currentTask
    ? buildApprovalHandoff(currentTask, {
        connectionStatus: data.connectionStatus,
        reviewSurface: data.reviewSurface,
      })
    : null

  return (
    <div
      ref={drawerRef}
      className="orbit-inspector-drawer"
      role="region"
      aria-labelledby="inspector-heading"
      aria-modal="false"
    >
      <Card variant="outline">
        <CardHeader
          title={
            <div className="orbit-inspector-header">
              <span id="inspector-heading" className="orbit-inspector-title">
                {copy.selectedNodeHeading}
              </span>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label={copy.closeInspector}>
                ✕
              </Button>
            </div>
          }
        />
        <CardBody>
          <div className="orbit-inspector-body">
            {/* Top Provenance, Type & Freshness Badges */}
            <div className="orbit-inspector-badges">
              <Badge tone="accent">
                {workstation?.provenance === 'LIVE' || agent?.provenance === 'LIVE'
                  ? 'PROVENANCE: LIVE'
                  : copy.provenanceSimulated}
              </Badge>
              {workstation && <Badge tone="cyan">{copy.nodeTypeWorkstation}</Badge>}
              {agent && <Badge tone="ok">{copy.nodeTypeAgent}</Badge>}
              {(workstation?.freshness || agent?.freshness) && (
                <Badge
                  tone={
                    (workstation?.freshness || agent?.freshness) === 'FRESH'
                      ? 'ok'
                      : 'hot'
                  }
                >
                  {copy.freshnessLabel}: {workstation?.freshness || agent?.freshness}
                </Badge>
              )}
            </div>

            {/* Workstation Details */}
            {workstation && (
              <div className="orbit-inspector-section">
                <div className="orbit-inspector-name">{workstation.name}</div>
                <div className="orbit-inspector-grid">
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">{copy.idLabel}:</span>
                    <span className="orbit-field-value">{workstation.id}</span>
                  </div>
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">{copy.zoneLabel}:</span>
                    <span className="orbit-field-value">{workstation.zone.toUpperCase()}</span>
                  </div>
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">Status:</span>
                    <span className="orbit-field-value">{workstation.status}</span>
                  </div>
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">Coordinates:</span>
                    <span className="orbit-field-value">[{workstation.position.join(', ')}]</span>
                  </div>
                  <div className="orbit-inspector-field full-width">
                    <span className="orbit-field-label">{copy.agentsLabel}:</span>
                    <span className="orbit-field-value">{workstation.agentIds.join(', ')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Details */}
            {agent && (
              <div className="orbit-inspector-section">
                <div className="orbit-inspector-name">{agent.name}</div>
                <div className="orbit-inspector-role">
                  <span className="orbit-field-label">{copy.roleLabel}:</span> {agent.role}
                </div>

                <div className="orbit-inspector-grid">
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">{copy.idLabel}:</span>
                    <span className="orbit-field-value">{agent.id}</span>
                  </div>
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">State:</span>
                    <Badge tone={agent.state === 'WAITING_APPROVAL' ? 'accent' : 'ok'}>
                      {agent.state}
                    </Badge>
                  </div>
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">{copy.cycleLabel}:</span>
                    <span className="orbit-field-value">#{agent.executionCycle}</span>
                  </div>
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">{copy.stepsLabel}:</span>
                    <span className="orbit-field-value">{agent.stepCount}</span>
                  </div>
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">{copy.leaseLabel}:</span>
                    <span className="orbit-field-value">{agent.leaseStatus}</span>
                  </div>
                  <div className="orbit-inspector-field">
                    <span className="orbit-field-label">Checkpoint:</span>
                    <span className="orbit-field-value">{agent.checkpointVersion}</span>
                  </div>
                </div>

                {/* Associated Active Task */}
                {currentTask && (
                  <div className="orbit-inspector-task-box">
                    <div className="orbit-task-box-title">
                      <span>Task: {currentTask.title}</span>
                      <Badge tone={currentTask.priority === 'CRITICAL' ? 'hot' : 'night'}>
                        {currentTask.status}
                      </Badge>
                    </div>

                    {/* Human Approval Handoff — rendered only from the projected record */}
                    {handoff && handoff.status !== 'NOT_REQUIRED' && (
                      <div className="orbit-approval-handoff-banner">
                        <div className="orbit-approval-handoff-title">
                          {copy.approvalRequiredNotice}
                        </div>
                        <div className="orbit-approval-handoff-meta">
                          <div><strong>Action:</strong> {handoff.action}</div>
                          <div><strong>Requested Role:</strong> {handoff.requestedRole}</div>
                          <div><strong>Reason:</strong> {handoff.reason}</div>
                        </div>
                        <p className="orbit-handoff-boundary">{copy.handoffBoundaryNotice}</p>
                        {handoff.status === 'AWAITING_HUMAN_REVIEW' ? (
                          <>
                            {handoff.simulated && (
                              <p className="orbit-handoff-simulated" role="status">
                                <Badge tone="night">{copy.provenanceSimulated}</Badge>{' '}
                                {copy.handoffNoLiveQueue}
                              </p>
                            )}
                            <a
                              href={handoff.reviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="orbit-handoff-link"
                            >
                              {copy.handoffCta}
                            </a>
                          </>
                        ) : (
                          <p className="orbit-handoff-unavailable" role="status">
                            {copy.handoffUnavailable}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="orbit-inspector-footer">
              <span className="orbit-esc-hint">{copy.escToClose}</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                {copy.clearSelection}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
