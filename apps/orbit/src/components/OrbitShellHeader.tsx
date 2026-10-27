import type { Locale } from '@moonwitness/core'
import { Badge, LiveDot } from '@moonwitness/moonui'
import type { OrbitCopyKey } from '../lib/orbit-copy'
import type { ConnectionStatus, FreshnessStatus, ReviewSurface } from '../lib/projections/types.ts'

export interface OrbitShellHeaderProps {
  locale: Locale
  copy: Readonly<Record<OrbitCopyKey, string>>
  connectionStatus: ConnectionStatus | string
  freshness?: FreshnessStatus
  lastSyncTimestamp?: string
  reviewSurface: ReviewSurface
}

export function OrbitShellHeader({
  locale,
  copy,
  connectionStatus,
  freshness,
  reviewSurface,
}: OrbitShellHeaderProps) {
  return (
    <header className="orbit-header" role="banner">
      <div className="orbit-title-group">
        <span className="orbit-logo">{copy.brandTitle}</span>
        <span className="orbit-subtitle">{copy.brandSubtitle}</span>
      </div>

      <div className="orbit-header-actions">
        {/* External Link to 100CENTER / Headquarters */}
        {reviewSurface.available && reviewSurface.origin !== undefined ? (
          <a
            href={reviewSurface.origin}
            target="_blank"
            rel="noopener noreferrer"
            className="orbit-nav-link"
            style={{ fontSize: '0.8rem' }}
          >
            {copy.hqLink} ↗
          </a>
        ) : (
          <span className="orbit-nav-link" style={{ fontSize: '0.8rem' }} role="status">
            {copy.handoffUnavailable}
          </span>
        )}

        {/* Operational Status Badges */}
        <div className="orbit-status-bar" role="status" aria-label="Operational Mode">
          {connectionStatus === 'LIVE_CONNECTED' && freshness === 'FRESH' && (
            <>
              <Badge tone="ok">
                <LiveDot />
                {copy.liveBadge}
              </Badge>
              <Badge tone="night">ARSY: {copy.statusConnected}</Badge>
            </>
          )}

          {connectionStatus === 'LIVE_CONNECTED' && freshness === 'STALE' && (
            <>
              <Badge tone="accent">
                ⚠ {copy.freshnessStale}
              </Badge>
              <Badge tone="night">ARSY: {copy.statusConnected}</Badge>
            </>
          )}

          {connectionStatus === 'LIVE_CONNECTED' && freshness === 'UNKNOWN' && (
            <>
              <Badge tone="accent">
                ? {copy.freshnessUnknown}
              </Badge>
              <Badge tone="night">ARSY: {copy.statusConnected}</Badge>
            </>
          )}

          {connectionStatus === 'OFFLINE' && (
            <>
              <Badge tone="hot">
                ● {copy.statusOffline}
              </Badge>
              <Badge tone="night">{copy.arsyOffline}</Badge>
            </>
          )}

          {connectionStatus === 'UNAUTHORIZED' && (
            <>
              <Badge tone="hot">
                ⛔ {copy.statusUnauthorized}
              </Badge>
              <Badge tone="night">ARSY: 401/403</Badge>
            </>
          )}

          {connectionStatus === 'SIMULATED_LOCAL' && (
            <>
              <Badge tone="accent">
                <LiveDot />
                {copy.provenanceSimulated}
              </Badge>
              <Badge tone="night">{copy.arsyStandalone}</Badge>
            </>
          )}

          {connectionStatus !== 'LIVE_CONNECTED' &&
            connectionStatus !== 'OFFLINE' &&
            connectionStatus !== 'UNAUTHORIZED' &&
            connectionStatus !== 'SIMULATED_LOCAL' && (
              <Badge tone="night">ARSY: {connectionStatus}</Badge>
            )}
        </div>

        {/* Language / Locale Selector */}
        <nav className="orbit-locale-switch" aria-label={copy.localeSelectorLabel}>
          <a
            href="?locale=en"
            className={`orbit-locale-btn ${locale === 'en' ? 'active' : ''}`}
            aria-current={locale === 'en' ? 'true' : undefined}
            lang="en"
          >
            EN
          </a>
          <span style={{ color: 'var(--border)' }}>|</span>
          <a
            href="?locale=id"
            className={`orbit-locale-btn ${locale === 'id' ? 'active' : ''}`}
            aria-current={locale === 'id' ? 'true' : undefined}
            lang="id"
          >
            ID
          </a>
        </nav>
      </div>
    </header>
  )
}
