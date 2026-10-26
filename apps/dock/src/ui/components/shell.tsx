import type { ReactNode } from 'react'
import { BrandLogo, Crown, LinkButton, LiveDot, Tape, ZineNote, Chevron } from '@moonwitness/moonui'
import { MtsTelemetryClock } from '@moonwitness/moonui/client'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/env'

export function SiteHeader(): ReactNode {
  return (
    <header className="dk-header">
      <BrandLogo href="/" size="md" />

      <nav className="dk-nav" aria-label="Main navigation">
        <a href="/" className="dk-nav-active">
          HOME
        </a>
        <a href="/stations">SIGNALS</a>
        <a href="/reader">READER</a>
        <a href="/terms">TERMS</a>
        <a href="/figures">FIGURES</a>
        <a href="/constellation">CONSTELLATION</a>
        <a href="/prisms">PRISMS</a>
        <a href="/timeline">TIMELINE</a>
        <a href="/patches">PATCHES</a>
        <a href="/denpa">DENPA</a>
        <a href="/studio">STUDIO</a>
        <a href="/schedule">ARCHIVE</a>
        <a href="/#constellation">CREW</a>
        <a href="/#zine-poster">ABOUT</a>
      </nav>

      <div className="m-row" style={{ gap: 10, alignItems: 'center' }}>
        <MtsTelemetryClock compact />
        <a href="/stations" className="dk-icon-btn" aria-label="Search signals" title="Search signals">
          SRC
        </a>
        <a href="/#constellation" className="dk-icon-btn" aria-label="Global network" title="Global network">
          NET
        </a>
        <LinkButton href="/#join-crew" variant="paper" size="sm">
          JOIN THE CREW <Chevron dir="right" />
        </LinkButton>
        <Crown tone="gold" size="md" />
      </div>
    </header>
  )
}

export function SiteFooter(): ReactNode {
  return (
    <footer className="dk-footer" id="join-crew">
      <div className="dk-join-banner">
        <div className="m-row" style={{ gap: 10 }}>
          <span className="dk-icon-btn" aria-hidden="true">
            THM
          </span>
          <span className="dk-icon-btn" aria-hidden="true">
            GLB
          </span>
          <ZineNote tone="dark" tilt="none">
            MESSAGES
            <br />
            RECEIVED
            <br />
            AROUND
            <br />
            THE WORLD.
          </ZineNote>
        </div>

        <div className="dk-join-center">
          <h2 className="dk-join-title">JOIN THE CREW.</h2>
          <p className="dk-join-copy">
            MORE STORIES.
            <br />
            MORE PLACES.
            <br />
            MORE PERSPECTIVES.
            <br />
            <strong>A BRIGHTER WORLD.</strong>
          </p>
          <LinkButton href="/stations" variant="paper" size="md">
            BECOME A MOONWITNESS <Chevron dir="right" />
          </LinkButton>
        </div>

        <div className="m-row" style={{ justifyContent: 'flex-end' }}>
          <ZineNote tone="accent" tilt="left">
            PEOPLE. PLACES.
            <br />
            STORIES.
            <br />
            ANOTHER SIDE
            <br />
            OF REALITY.
          </ZineNote>
        </div>
      </div>

      <div className="dk-footer-meta">
        <div>
          <strong>{SITE_NAME}</strong> // Create · Curate · Publish · {SITE_TAGLINE}
        </div>
        <div className="m-muted">
          SAME MOON · DIFFERENT WITNESSES · powered by moonql hub <Crown tone="gold" size="sm" />
        </div>
      </div>
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
      <div className="dk-hero-art" aria-hidden="true" />
      <div className="dk-hero-overlay" />

      <div className="dk-hero-content">
        <div className="dk-hero-left">
          <div className="dk-hero-title-wrap">
            <Crown tone="gold" size="lg" />
            <h1 className="dk-hero-title">MOONWITNESS</h1>
          </div>

          <Tape tone="accent">PEOPLE. PLACES. STORIES. ANOTHER SIDE OF REALITY.</Tape>

          <p className="dk-hero-sub">
            A GLOBAL STORY NETWORK
            <br />
            FOR CURIOUS HUMANS.
            <br />
            DIFFERENT PEOPLE. SAME MOON.
            <br />
            BIGGER PERSPECTIVES.
          </p>

          <div className="m-row" style={{ gap: 14 }}>
            <LinkButton href="/stations" variant="primary" size="md">
              EXPLORE THE SIGNALS <Chevron dir="right" />
            </LinkButton>

            <div className="dk-hero-badge">
              <LiveDot on />
              <div>
                <div className="m-muted" style={{ fontSize: 11 }}>
                  LIVE TRANSMISSION
                </div>
                <strong>{nowTitle ?? 'A SIGNAL FROM BELOW'}</strong>
              </div>
            </div>
          </div>

          <div className="dk-stats">
            <span>
              <strong>{counts.stations}</strong> STATIONS
            </span>
            <span>
              <strong>{counts.countries}</strong> COUNTRIES
            </span>
            <span>
              <strong>{counts.plays}</strong> SIGNALS LOGGED
            </span>
          </div>
        </div>

        <div className="dk-hero-right" aria-hidden="true">
          <ZineNote tone="paper" tilt="right">
            LOOK
            <br />
            FURTHER
            <br />
            THAN
            <br />
            WE DO.
          </ZineNote>

          <ZineNote tone="dark" tilt="left">
            SAME MOON
            <br />
            DIFFERENT
            <br />
            WITNESSES!
          </ZineNote>

          <ZineNote tone="paper" tilt="left">
            A GLOBAL
            <br />
            STORY NETWORK
            <br />
            FOR CURIOUS
            <br />
            HUMANS.
          </ZineNote>
        </div>
      </div>
    </section>
  )
}
