import type { Locale } from '@moonwitness/core'
import { Badge, LiveDot } from '@moonwitness/moonui'
import type { OrbitCopyKey } from '../lib/orbit-copy'

export interface OrbitShellHeaderProps {
  locale: Locale
  copy: Readonly<Record<OrbitCopyKey, string>>
  connectionStatus: string
}

export function OrbitShellHeader({ locale, copy, connectionStatus }: OrbitShellHeaderProps) {
  return (
    <header className="orbit-header" role="banner">
      <div className="orbit-title-group">
        <span className="orbit-logo">{copy.brandTitle}</span>
        <span className="orbit-subtitle">{copy.brandSubtitle}</span>
      </div>

      <div className="orbit-header-actions">
        {/* External Link to 100CENTER / Headquarters */}
        <a
          href="http://localhost:3002"
          target="_blank"
          rel="noopener noreferrer"
          className="orbit-nav-link"
          style={{ fontSize: '0.8rem' }}
        >
          {copy.hqLink} ↗
        </a>

        {/* Operational Status Badges */}
        <div className="orbit-status-bar" role="status" aria-label="Operational Mode">
          <Badge tone="accent">
            <LiveDot />
            {copy.provenanceSimulated}
          </Badge>
          <Badge tone="night">ARSY: {connectionStatus}</Badge>
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
