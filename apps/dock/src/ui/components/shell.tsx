import type { ReactNode } from 'react'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/env'

export function SiteHeader(): ReactNode {
  return (
    <header className="dk-header">
      <a href="/" className="dk-brand">
        <span className="dk-moon">◐</span> {SITE_NAME}
      </a>
      <nav className="dk-nav">
        <a href="/">Home</a>
        <a href="/stations">Stations</a>
        <a href="/schedule">Schedule</a>
      </nav>
    </header>
  )
}

export function SiteFooter(): ReactNode {
  return (
    <footer className="dk-footer">
      <div>
        <strong>{SITE_NAME}</strong> · {SITE_TAGLINE}
      </div>
      <div className="dk-muted">music catalogued by the moonql hub · one API, three apps</div>
    </footer>
  )
}

export function Hero({
  counts,
  nowTitle,
}: {
  counts: { stations: number; countries: number; plays: number }
  nowTitle?: string
}): ReactNode {
  return (
    <section className="dk-hero">
      <div className="dk-hero-copy">
        <span className="dk-kicker">ON AIR</span>
        <h1>
          {SITE_NAME}
          <span className="dk-dot">.</span>
        </h1>
        <p>{SITE_TAGLINE}</p>
        <div className="dk-stats">
          <span>
            <strong>{counts.stations}</strong> stations
          </span>
          <span>
            <strong>{counts.countries}</strong> countries
          </span>
          <span>
            <strong>{counts.plays}</strong> plays logged
          </span>
        </div>
      </div>
      <div className="dk-hero-badge">
        <span className="dk-live-dot" />
        <div>
          <div className="dk-muted">now on air</div>
          <strong>{nowTitle ?? 'Waiting for the schedule'}</strong>
        </div>
      </div>
    </section>
  )
}
