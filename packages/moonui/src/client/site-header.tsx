'use client'

import { useState, type ReactNode } from 'react'
import { IconSearch } from '../icons/index.js'
import { SiteBrand, type SiteBrandCopy, type SiteLink } from '../site.js'

export interface SiteHeaderCopy {
  brand: SiteBrandCopy
  navLabel: string
  nav: SiteLink[]
  skipLabel: string
  searchHref: string
  searchLabel: string
  utilityHref: string
  utilityLines: [string, string, string]
  switchHref: string
  switchLabel: string
  openLabel: string
  closeLabel: string
}

export interface SiteHeaderProps {
  copy: SiteHeaderCopy
  /** Nav ids that carry `aria-current="page"`. */
  currentIds: string[]
  className?: string
}

/**
 * Site chrome with a collapsible mobile nav. The Escape handler and the
 * `aria-expanded` state are part of the contract, not the caller's job.
 */
export function SiteHeader({ copy, currentIds, className = 'su-chrome' }: SiteHeaderProps): ReactNode {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <a className="su-skip" href="#su-main">
        {copy.skipLabel}
      </a>
      <header
        className={className}
        data-menu-open={menuOpen}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setMenuOpen(false)
        }}
      >
        <SiteBrand brand={copy.brand} />
        <nav id="su-primary-nav" className="su-primary-links" aria-label={copy.navLabel}>
          {copy.nav.map((item) => (
            <a
              key={item.id ?? item.href}
              href={item.href}
              aria-current={item.id && currentIds.includes(item.id) ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="su-chrome__tools">
          <a className="su-search-link" href={copy.searchHref} aria-label={copy.searchLabel}>
            <IconSearch size={17} />
          </a>
          <a className="su-utility" href={copy.utilityHref}>
            {copy.utilityLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </a>
          <a className="su-language" href={copy.switchHref}>
            {copy.switchLabel}
          </a>
          <button
            className="su-menu-trigger"
            type="button"
            aria-controls="su-primary-nav"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? copy.closeLabel : copy.openLabel}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d={menuOpen ? 'M5 5 19 19M19 5 5 19' : 'M3 6h18M3 12h18M3 18h18'}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>
    </>
  )
}
