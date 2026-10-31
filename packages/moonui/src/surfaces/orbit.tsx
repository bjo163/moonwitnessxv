import type { ReactNode } from 'react'
import { LiveDot } from '../data.js'
import { Badge, Card, CardBody, CardHeader } from '../layout.js'

/** Strings arrive resolved; MoonUI never imports an application catalog. */
export type SurfaceCopy = Readonly<Record<string, string>>

export interface OrbitReviewSurface {
  available: boolean
  origin?: string
}

export function OrbitShellHeaderView({
  copy,
  connectionStatus,
  freshness,
  reviewSurface,
  localeNav,
}: {
  copy: SurfaceCopy
  connectionStatus: string
  freshness?: string
  reviewSurface: OrbitReviewSurface
  /** Rendered inside the header actions: the surface owns the cookie and the hrefs. */
  localeNav?: ReactNode
}): ReactNode {
  return (
    <header className="orbit-header" role="banner">
      <div className="orbit-title-group">
        <span className="orbit-logo">{copy.brandTitle}</span>
        <span className="orbit-subtitle">{copy.brandSubtitle}</span>
      </div>

      <div className="orbit-header-actions">
        {reviewSurface.available && reviewSurface.origin !== undefined ? (
          <a href={reviewSurface.origin} target="_blank" rel="noopener noreferrer" className="orbit-hq-link">
            {copy.hqLink}
          </a>
        ) : (
          <span className="m-muted" role="status">
            {copy.handoffUnavailable}
          </span>
        )}

        <div className="orbit-status-bar" role="status" aria-label="Operational Mode">
          {connectionStatus === 'LIVE_CONNECTED' && freshness === 'FRESH' ? (
            <>
              <Badge tone="ok">
                <LiveDot />
                {copy.liveBadge}
              </Badge>
              <Badge tone="night">ARSY: {copy.statusConnected}</Badge>
            </>
          ) : null}

          {connectionStatus === 'LIVE_CONNECTED' && freshness === 'STALE' ? (
            <>
              <Badge tone="accent">⚠ {copy.freshnessStale}</Badge>
              <Badge tone="night">ARSY: {copy.statusConnected}</Badge>
            </>
          ) : null}

          {connectionStatus === 'LIVE_CONNECTED' && freshness === 'UNKNOWN' ? (
            <>
              <Badge tone="accent">? {copy.freshnessUnknown}</Badge>
              <Badge tone="night">ARSY: {copy.statusConnected}</Badge>
            </>
          ) : null}

          {connectionStatus === 'OFFLINE' ? (
            <>
              <Badge tone="hot">● {copy.statusOffline}</Badge>
              <Badge tone="night">{copy.arsyOffline}</Badge>
            </>
          ) : null}

          {connectionStatus === 'UNAUTHORIZED' ? (
            <>
              <Badge tone="hot">⛔ {copy.statusUnauthorized}</Badge>
              <Badge tone="night">ARSY: 401/403</Badge>
            </>
          ) : null}

          {connectionStatus === 'SIMULATED_LOCAL' ? (
            <>
              <Badge tone="accent">
                <LiveDot />
                {copy.provenanceSimulated}
              </Badge>
              <Badge tone="night">{copy.arsyStandalone}</Badge>
            </>
          ) : null}

          {connectionStatus !== 'LIVE_CONNECTED' &&
          connectionStatus !== 'OFFLINE' &&
          connectionStatus !== 'UNAUTHORIZED' &&
          connectionStatus !== 'SIMULATED_LOCAL' ? (
            <Badge tone="night">ARSY: {connectionStatus}</Badge>
          ) : null}
        </div>

        {localeNav}
      </div>
    </header>
  )
}

/**
 * Accessible 2D fallback: complete operational topology without WebGL, hover,
 * sound or colour alone. Counts arrive pre-computed so the view stays dumb.
 */
export function WebGLFallbackView({
  copy,
  counts,
  isUserSelected2D = false,
  onSwitchTo3D,
}: {
  copy: SurfaceCopy
  counts: { workstations: number; agents: number; tasks: number }
  isUserSelected2D?: boolean
  onSwitchTo3D?: () => void
}): ReactNode {
  return (
    <div className="orbit-webgl-fallback-stage" role="region" aria-labelledby="webgl-fallback-heading">
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
              {isUserSelected2D ? copy.spatialViewportNotice : copy.webglUnavailableNotice}
            </p>

            <div className="orbit-fallback-stats" aria-label="Operational topology summary">
              <Badge tone="cyan">
                {copy.workstationsHeading}: {counts.workstations}
              </Badge>
              <Badge tone="ok">
                {copy.agentLoopsHeading}: {counts.agents}
              </Badge>
              <Badge tone="hot">
                {copy.taskQueuesHeading}: {counts.tasks}
              </Badge>
            </div>

            <div className="orbit-fallback-a11y-guide">
              <span className="orbit-guide-icon" aria-hidden="true">
                ⌨︎
              </span>
              <p className="orbit-guide-text">{copy.keyboardNavigationGuide}</p>
            </div>

            {onSwitchTo3D && isUserSelected2D ? (
              <div className="orbit-fallback-actions">
                <button type="button" className="m-btn" data-variant="accent" data-size="sm" onClick={onSwitchTo3D}>
                  {copy.switchTo3DView}
                </button>
              </div>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
