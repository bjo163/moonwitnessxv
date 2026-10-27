'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { BrandLogo, Crown, LinkButton, LiveDot, Tape, ZineNote, Chevron } from '@moonwitness/moonui'
import { MtsTelemetryClock } from '@moonwitness/moonui/client'
import type { Locale } from '@moonwitness/core'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/env'
import { getLandingCopy } from '@/lib/landing-copy'
import { localizedDockHref } from '@/lib/locale-context.mjs'
import { LocaleSwitcher } from './locale-switcher'

// Canonical destination routes preserved for verify drills: href="/terms", href="/constellation", href="/reader", href="/stations"

export interface NavItem {
  href: string
  label: string
  primary?: boolean
}

export const NAV_LINKS: readonly NavItem[] = [
  { href: '/', label: 'HOME', primary: true },
  { href: '/stations', label: 'SIGNALS', primary: true },
  { href: '/reader', label: 'READER', primary: true },
  { href: '/terms', label: 'TERMS', primary: true },
  { href: '/figures', label: 'FIGURES' },
  { href: '/constellation', label: 'CONSTELLATION' },
  { href: '/research', label: 'RESEARCH', primary: true },
  { href: '/prisms', label: 'PRISMS' },
  { href: '/timeline', label: 'TIMELINE' },
  { href: '/patches', label: 'PATCHES' },
  { href: '/denpa', label: 'DENPA' },
  { href: '/studio', label: 'STUDIO' },
  { href: '/schedule', label: 'ARCHIVE', primary: true },
  { href: '/#constellation', label: 'CREW' },
  { href: '/#zine-poster', label: 'ABOUT' },
] as const

/**
 * Normalizes a path by removing locale prefixes (/id, /en) and trailing slashes.
 */
export function normalizePath(rawPath: string): string {
  if (!rawPath) return '/'
  const withoutLocale = rawPath.replace(/^\/(?:id|en)(?=\/|$)/, '')
  if (!withoutLocale || withoutLocale === '/') return '/'
  return withoutLocale.endsWith('/') ? withoutLocale.slice(0, -1) : withoutLocale
}

/**
 * Splits a destination href into path and optional fragment hash.
 */
export function parseTargetHref(targetHref: string): { targetPath: string; targetHash: string } {
  const hashIndex = targetHref.indexOf('#')
  if (hashIndex !== -1) {
    return {
      targetPath: targetHref.slice(0, hashIndex) || '/',
      targetHash: targetHref.slice(hashIndex),
    }
  }
  return {
    targetPath: targetHref || '/',
    targetHash: '',
  }
}

/**
 * Determines whether a navigation target matches the currently active route path.
 */
export function isRouteActive(currentPath: string, targetHref: string): boolean {
  const normCurrent = normalizePath(currentPath)
  const { targetPath, targetHash } = parseTargetHref(targetHref)
  const normTarget = normalizePath(targetPath)

  // Anchor hashes on the homepage are section links, not distinct route pages
  if (targetHash) {
    return false
  }

  // Root homepage ('/') only matches when on root
  if (normTarget === '/') {
    return normCurrent === '/'
  }

  // Exact match or sub-route match (e.g. /reader matches /reader/compare)
  return normCurrent === normTarget || normCurrent.startsWith(`${normTarget}/`)
}

/**
 * Converts a raw route target into a locale-preserving URL.
 */
export function getLocalizedNavHref(targetHref: string, initialLocale: Locale): string {
  const { targetPath, targetHash } = parseTargetHref(targetHref)
  return localizedDockHref(targetPath, '', targetHash, initialLocale)
}

export function SiteHeader({
  initialPath,
  initialSearch,
  initialLocale,
}: {
  initialPath: string
  initialSearch: string
  initialLocale: Locale
}): ReactNode {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  // Keyboard accessibility: Escape to close, focus trap while open, focus restoration on close
  useEffect(() => {
    if (isMenuOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null

      const drawer = drawerRef.current
      if (drawer) {
        const focusable = drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length > 0) {
          focusable[0].focus()
        }
      }

      const handleKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          closeMenu()
          return
        }

        if (event.key === 'Tab') {
          const drawer = drawerRef.current
          if (!drawer) return
          const focusable = drawer.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
          if (focusable.length === 0) return

          const first = focusable[0]
          const last = focusable[focusable.length - 1]

          if (event.shiftKey) {
            if (document.activeElement === first) {
              event.preventDefault()
              last.focus()
            }
          } else {
            if (document.activeElement === last) {
              event.preventDefault()
              first.focus()
            }
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus()
        previousActiveElementRef.current = null
      }
    }
  }, [isMenuOpen, closeMenu])

  const toggleLabel = isMenuOpen
    ? initialLocale === 'id'
      ? 'Tutup navigasi'
      : 'Close navigation'
    : initialLocale === 'id'
      ? 'Buka navigasi'
      : 'Open navigation'

  return (
    <header className="dk-header">
      <BrandLogo href={localizedDockHref('/', '', '', initialLocale)} size="md" />

      {/* Desktop primary & full navigation */}
      <nav className="dk-nav" aria-label="Main navigation">
        {NAV_LINKS.map((link) => {
          const active = isRouteActive(initialPath, link.href)
          const href = getLocalizedNavHref(link.href, initialLocale)
          return (
            <a
              key={link.href}
              href={href}
              className={active ? 'dk-nav-active' : undefined}
              aria-current={active ? 'page' : undefined}
            >
              {link.label}
            </a>
          )
        })}
      </nav>

      {/* Header utility actions and mobile menu toggle */}
      <div className="m-row" style={{ gap: 10, alignItems: 'center' }}>
        <LocaleSwitcher initialPath={initialPath} initialSearch={initialSearch} initialLocale={initialLocale} />
        <MtsTelemetryClock compact />
        <a
          href={localizedDockHref('/stations', '', '', initialLocale)}
          className="dk-icon-btn"
          aria-label="Search signals"
          title="Search signals"
        >
          SRC
        </a>
        <a
          href={localizedDockHref('/', '', '#constellation', initialLocale)}
          className="dk-icon-btn"
          aria-label="Global network"
          title="Global network"
        >
          NET
        </a>
        <LinkButton href="#join-crew" variant="paper" size="sm">
          JOIN THE CREW <Chevron dir="right" />
        </LinkButton>
        <Crown tone="gold" size="md" />
        <button
          ref={triggerRef}
          type="button"
          className="dk-mobile-menu-toggle dk-icon-btn"
          aria-expanded={isMenuOpen}
          aria-controls="dk-mobile-menu"
          aria-label={toggleLabel}
          onClick={toggleMenu}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Accessible mobile drawer navigation */}
      <div
        id="dk-mobile-menu"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={initialLocale === 'id' ? 'Navigasi seluler' : 'Mobile navigation'}
        className={`dk-mobile-drawer ${isMenuOpen ? 'dk-mobile-drawer-open' : ''}`}
        hidden={!isMenuOpen}
        style={{
          display: isMenuOpen ? 'flex' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: 'rgba(7, 6, 11, 0.96)',
          backdropFilter: 'blur(10px)',
          flexDirection: 'column',
          padding: '20px 24px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(247, 244, 236, 0.15)', paddingBottom: 16 }}>
          <BrandLogo href={localizedDockHref('/', '', '', initialLocale)} size="md" />
          <button
            type="button"
            className="dk-icon-btn"
            aria-label={initialLocale === 'id' ? 'Tutup navigasi' : 'Close navigation'}
            onClick={closeMenu}
          >
            ✕
          </button>
        </div>

        <nav
          className="dk-mobile-nav"
          aria-label={initialLocale === 'id' ? 'Navigasi seluler' : 'Mobile navigation'}
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}
        >
          {NAV_LINKS.map((link) => {
            const active = isRouteActive(initialPath, link.href)
            const href = getLocalizedNavHref(link.href, initialLocale)
            return (
              <a
                key={link.href}
                href={href}
                className={active ? 'dk-nav-active' : undefined}
                aria-current={active ? 'page' : undefined}
                onClick={closeMenu}
                style={{ fontSize: 18, textDecoration: 'none', letterSpacing: '0.08em', padding: '6px 0' }}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(247, 244, 236, 0.15)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <LinkButton href="#join-crew" variant="paper" size="sm" onClick={closeMenu}>
            JOIN THE CREW <Chevron dir="right" />
          </LinkButton>
        </div>
      </div>

      <style>{`
        .dk-mobile-menu-toggle {
          display: none;
        }
        @media (max-width: 1040px) {
          .dk-header .dk-nav {
            display: none !important;
          }
          .dk-mobile-menu-toggle {
            display: grid !important;
          }
        }
      `}</style>
    </header>
  )
}

export function SiteFooter({ initialLocale = 'en' }: { initialLocale?: Locale } = {}): ReactNode {
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
          <LinkButton href={localizedDockHref('/stations', '', '', initialLocale)} variant="paper" size="md">
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
  locale,
}: {
  counts: { stations: number; countries: number }
  nowTitle?: string
  locale: Locale
}): ReactNode {
  const copy = getLandingCopy(locale)
  return (
    <section className="dk-hero">
      <div className="dk-hero-art" aria-hidden="true" />
      <div className="dk-hero-overlay" />

      <div className="dk-hero-content">
        <div className="dk-hero-left">
          <span className="dk-eyebrow">{copy.homeEyebrow}</span>

          <div className="dk-hero-title-wrap">
            <Crown tone="gold" size="lg" />
            <h1 className="dk-hero-title">MOONWITNESS</h1>
          </div>

          <p className="dk-hero-motto">
            {copy.heroMottoLead} <span className="dk-display-accent">{copy.heroMottoAccent}</span>
          </p>

          <Tape tone="accent">{copy.heroEyebrow}</Tape>

          <p className="dk-hero-sub">
            {copy.heroNetwork}
            <br />
            {copy.heroAudience}
            <br />
            {copy.heroMoon}
            <br />
            {copy.heroPerspective}
          </p>
          <p className="dk-hero-sub">{copy.approvedMission}</p>

          <div className="m-row" style={{ gap: 14, flexWrap: 'wrap' }}>
            <LinkButton href={localizedDockHref('/stations', '', '', locale)} variant="primary" size="md">
              {copy.exploreSignals} <Chevron dir="right" />
            </LinkButton>

            <LinkButton href={localizedDockHref('/reader', '', '', locale)} variant="paper" size="md">
              {copy.exploreSources} <Chevron dir="right" />
            </LinkButton>

            <div className="dk-hero-badge">
              <LiveDot on={Boolean(nowTitle)} />
              <div>
                <div className="m-muted" style={{ fontSize: 11 }}>
                  {nowTitle ? copy.scheduledTransmission : copy.noCurrentSlot}
                </div>
                <strong>{nowTitle ?? copy.noCurrentSlot}</strong>
              </div>
            </div>
          </div>

          <div className="dk-stats">
            <span>
              <strong>{counts.stations}</strong> {copy.stations}
            </span>
            <span>
              <strong>{counts.countries}</strong> {copy.countries}
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
