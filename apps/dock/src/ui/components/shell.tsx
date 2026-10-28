'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { BrandLogo, Crown, LinkButton, LiveDot, Tape, ZineNote, Chevron } from '@moonwitness/moonui'
import { MtsTelemetryClock } from '@moonwitness/moonui/client'
import type { Locale } from '@moonwitness/core'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/env'
import { getLandingCopy, type LandingCopy } from '@/lib/landing-copy'
import { localizedDockHref } from '@/lib/locale-context.mjs'
import { zineLines } from '@/lib/zine-lines'
import { LocaleSwitcher } from './locale-switcher'

// Canonical destination routes preserved for verify drills: href="/terms", href="/constellation", href="/reader", href="/stations"

export interface NavItem {
  href: string
  labelKey: keyof LandingCopy
  demo?: boolean
}

export const NAV_LINKS: readonly NavItem[] = [
  { href: '/reader', labelKey: 'spaceRead' },
  { href: '/terms', labelKey: 'spaceExplore' },
  { href: '/stations', labelKey: 'spaceSignal' },
  { href: '/studio', labelKey: 'spaceCreate', demo: true },
] as const

interface IndexGroup {
  labelKey: 'navIndexWitnessLibrary' | 'navIndexSignalDesk' | 'navIndexResearch'
  links: readonly NavItem[]
}

export const INDEX_GROUPS: readonly IndexGroup[] = [
  {
    labelKey: 'navIndexWitnessLibrary',
    links: [
      { href: '/figures', labelKey: 'navFigures' },
      { href: '/missions', labelKey: 'navMissions' },
      { href: '/constellation', labelKey: 'navConstellation' },
      { href: '/prisms', labelKey: 'navPrisms' },
      { href: '/timeline', labelKey: 'navTimeline' },
      { href: '/patches', labelKey: 'navPatches' },
    ],
  },
  {
    labelKey: 'navIndexSignalDesk',
    links: [
      { href: '/schedule', labelKey: 'navArchive' },
      { href: '/denpa', labelKey: 'navDenpa' },
    ],
  },
  {
    labelKey: 'navIndexResearch',
    links: [{ href: '/research', labelKey: 'navResearch' }],
  },
] as const

interface IndexDisclosureProps {
  id: string
  locale: Locale
  copy: LandingCopy
  initialPath: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate?: () => void
}

function IndexDisclosure({
  id,
  locale,
  copy,
  initialPath,
  open,
  onOpenChange,
  onNavigate,
}: IndexDisclosureProps): ReactNode {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const focusFirstLinkOnOpenRef = useRef(false)

  useEffect(() => {
    if (open && focusFirstLinkOnOpenRef.current) {
      panelRef.current?.querySelector<HTMLAnchorElement>('a[href]')?.focus()
      focusFirstLinkOnOpenRef.current = false
    }
  }, [open])

  const closeOnEscape = (event: ReactKeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (event.key !== 'Escape' || !open) return
    event.preventDefault()
    event.stopPropagation()
    focusFirstLinkOnOpenRef.current = false
    onOpenChange(false)
    triggerRef.current?.focus()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="dk-nav-index-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          focusFirstLinkOnOpenRef.current = !open
          onOpenChange(!open)
        }}
        onKeyDown={closeOnEscape}
      >
        {copy.navIndex} <Chevron dir={open ? 'up' : 'down'} />
      </button>
      <div
        id={id}
        ref={panelRef}
        className="dk-index-panel"
        hidden={!open}
        onKeyDown={closeOnEscape}
      >
        {INDEX_GROUPS.map((group) => (
          <div className="dk-index-group" key={group.labelKey}>
            <p className="dk-index-group-title">{copy[group.labelKey]}</p>
            <div className="dk-index-links">
              {group.links.map((link) => {
                const active = isRouteActive(initialPath, link.href)
                const research = link.href === '/research'
                return (
                  <a
                    key={link.href}
                    href={getLocalizedNavHref(link.href, locale)}
                    className="dk-index-link"
                    aria-current={active ? 'page' : undefined}
                    onClick={onNavigate}
                  >
                    {copy[link.labelKey]}
                    {research ? <span className="dk-nav-withheld"> · {copy.navWithheld}</span> : null}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

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

function drawerFocusableElements(drawer: HTMLDivElement): HTMLElement[] {
  return Array.from(drawer.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.closest('[hidden]'))
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
  const [isDesktopIndexOpen, setIsDesktopIndexOpen] = useState(() =>
    INDEX_GROUPS.some((group) => group.links.some((link) => isRouteActive(initialPath, link.href))),
  )
  const [isMobileIndexOpen, setIsMobileIndexOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    setIsMobileIndexOpen(false)
  }, [])

  const toggleMenu = useCallback(() => {
    if (isMenuOpen) {
      closeMenu()
      return
    }
    setIsMenuOpen(true)
  }, [closeMenu, isMenuOpen])

  // Keyboard accessibility: Escape to close, focus trap while open, focus restoration on close
  useEffect(() => {
    if (isMenuOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null

      const drawer = drawerRef.current
      if (drawer) {
        const focusable = drawerFocusableElements(drawer)
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
          const focusable = drawerFocusableElements(drawer)
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

  const copy = getLandingCopy(initialLocale)

  return (
    <header className="dk-header">
      <BrandLogo href={localizedDockHref('/', '', '', initialLocale)} size="md" />

      {/* Desktop primary & full navigation */}
      <nav className="dk-nav" aria-label={copy.navMainLabel}>
        {NAV_LINKS.map((link) => {
          const active = isRouteActive(initialPath, link.href)
          const href = getLocalizedNavHref(link.href, initialLocale)
          return (
            <a
              key={link.href}
              href={href}
              className={`dk-nav-primary-link${active ? ' dk-nav-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {copy[link.labelKey]}
              <span className="dk-nav-status"> · {link.demo ? copy.statusDemo : copy.statusReal}</span>
            </a>
          )
        })}
        <IndexDisclosure
          id="dk-index-desktop"
          locale={initialLocale}
          copy={copy}
          initialPath={initialPath}
          open={isDesktopIndexOpen}
          onOpenChange={setIsDesktopIndexOpen}
        />
      </nav>

      {/* Header utility actions and mobile menu toggle */}
      <div className="m-row" style={{ gap: 10, alignItems: 'center' }}>
        <LocaleSwitcher initialPath={initialPath} initialSearch={initialSearch} initialLocale={initialLocale} />
        <MtsTelemetryClock compact />
        <LinkButton href="#join-crew" variant="paper" size="sm">
          {copy.joinTheCrew} <Chevron dir="right" />
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
                className={`dk-nav-primary-link${active ? ' dk-nav-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={closeMenu}
              >
                {copy[link.labelKey]}
                <span className="dk-nav-status"> · {link.demo ? copy.statusDemo : copy.statusReal}</span>
              </a>
            )
          })}
          <IndexDisclosure
            id="dk-index-mobile"
            locale={initialLocale}
            copy={copy}
            initialPath={initialPath}
            open={isMobileIndexOpen}
            onOpenChange={setIsMobileIndexOpen}
            onNavigate={closeMenu}
          />
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(247, 244, 236, 0.15)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <LinkButton href="#join-crew" variant="paper" size="sm" onClick={closeMenu}>
            {copy.joinTheCrew} <Chevron dir="right" />
          </LinkButton>
        </div>
      </div>
      {/* No breakpoint lives here. `globals.css` is the single owner of the
          desktop/drawer switch (`.dk-nav` and `.dk-mobile-menu-toggle` inside the
          1040px shell block) and of the header's no-clipping row wrapping; see
          docs/audit/ui2-g05-shell-contract-47b89f4.md. */}
    </header>
  )
}

export function SiteFooter({ initialLocale = 'en' }: { initialLocale?: Locale } = {}): ReactNode {
  const copy = getLandingCopy(initialLocale)
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
          <ZineNote tone="dark" tilt="none">{zineLines(copy.footerMessagesReceived)}</ZineNote>
        </div>

        <div className="dk-join-center">
          <h2 className="dk-join-title">{copy.footerJoinTitle}</h2>
          <p className="dk-join-copy">
            {zineLines(copy.footerJoinCopy)}
            <br />
            <strong>{copy.footerJoinAccent}</strong>
          </p>
          <LinkButton href={localizedDockHref('/stations', '', '', initialLocale)} variant="paper" size="md">
            {copy.footerBecomeWitness} <Chevron dir="right" />
          </LinkButton>
        </div>

        <div className="m-row" style={{ justifyContent: 'flex-end' }}>
          <ZineNote tone="accent" tilt="left">{zineLines(copy.footerPeopleNote)}</ZineNote>
        </div>
      </div>

      <div className="dk-footer-meta">
        <div>
          <strong>{SITE_NAME}</strong> // {copy.footerPipeline} · {SITE_TAGLINE}
        </div>
        <div className="m-muted">
          {copy.footerWitnesses} · {copy.footerPoweredBy} <Crown tone="gold" size="sm" />
        </div>
        <div className="dk-footer-section-links">
          <a href={localizedDockHref('/', '', '#constellation', initialLocale)}>{copy.footerCrewLink}</a>
          <a href={localizedDockHref('/', '', '#zine-poster', initialLocale)}>{copy.footerAboutLink}</a>
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
          <ZineNote tone="paper" tilt="right">{zineLines(copy.heroNoteLookFurther)}</ZineNote>

          <ZineNote tone="dark" tilt="left">{zineLines(copy.heroNoteSameMoon)}</ZineNote>

          <ZineNote tone="paper" tilt="left">
            {copy.heroNetwork}
            <br />
            {copy.heroAudience}
          </ZineNote>
        </div>
      </div>
    </section>
  )
}
