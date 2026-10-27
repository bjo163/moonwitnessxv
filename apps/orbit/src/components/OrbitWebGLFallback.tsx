'use client'

import { Badge, Card, CardHeader, CardBody } from '@moonwitness/moonui'
import type { OrbitCopyKey } from '../lib/orbit-copy'
import type { OrbitOperationalState } from '../fixtures/simulated-operations'

export interface OrbitWebGLFallbackProps {
  data: OrbitOperationalState
  copy: Readonly<Record<OrbitCopyKey, string>>
  isUserSelected2D?: boolean
  onSwitchTo3D?: () => void
}

/**
 * Accessible 2D Fallback View for when WebGL is unavailable or disabled.
 * Conveys complete operational topology without relying on WebGL, hover, sound, or color alone.
 */
export function OrbitWebGLFallback({
  data,
  copy,
  isUserSelected2D = false,
  onSwitchTo3D,
}: OrbitWebGLFallbackProps) {
  const { workstations, agents, taskQueue } = data

  return (
    <div
      className="orbit-webgl-fallback-stage"
      role="region"
      aria-labelledby="webgl-fallback-heading"
    >
      <Card variant="outline">
        <CardHeader
          title={
            <div className="orbit-fallback-header">
              <span id="webgl-fallback-heading" className="orbit-fallback-title">
                {copy.webglFallbackActive}
              </span>
              <Badge tone="accent">{copy.provenanceSimulated}</Badge>
            </div>
          }
        />
        <CardBody>
          <div className="orbit-fallback-body">
            <p className="orbit-fallback-notice">
              {isUserSelected2D
                ? copy.spatialViewportNotice
                : copy.webglUnavailableNotice}
            </p>

            <div className="orbit-fallback-stats" aria-label="Operational topology summary">
              <Badge tone="cyan">
                {copy.workstationsHeading}: {workstations.length}
              </Badge>
              <Badge tone="ok">
                {copy.agentLoopsHeading}: {agents.length}
              </Badge>
              <Badge tone="hot">
                {copy.taskQueuesHeading}: {taskQueue.length}
              </Badge>
            </div>

            <div className="orbit-fallback-a11y-guide">
              <span className="orbit-guide-icon" aria-hidden="true">⌨️</span>
              <p className="orbit-guide-text">{copy.keyboardNavigationGuide}</p>
            </div>

            {onSwitchTo3D && isUserSelected2D && (
              <div className="orbit-fallback-actions">
                <button
                  type="button"
                  className="orbit-fallback-switch-btn"
                  onClick={onSwitchTo3D}
                >
                  {copy.switchTo3DView}
                </button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
