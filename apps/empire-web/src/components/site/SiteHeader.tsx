'use client'

import { useState } from 'react'
import { IconMoon, IconSearch } from '@moonwitness/moonui'
import { text, type StoryLocale } from '../../lib/story-universe'

export type SiteSection = 'home' | 'stories' | 'characters' | 'ggs'

const local = (locale: StoryLocale, path: string) => `/${locale}${path === '/' ? '' : path}`

/**
 * The single site chrome (M45-04). Geometry comes from LAYOUT_SPEC.md:
 * 72px tall, brand left, seven-item nav, search, bordered utility box, language.
 */
export function SiteHeader({ locale, active }: { locale: StoryLocale; active: SiteSection }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const labels = text[locale]
  const nav = [
    { id: 'home', label: labels.home, href: '/' },
    { id: 'stories', label: labels.stories, href: '/stories' },
    { id: 'characters', label: labels.characters, href: '/characters' },
    { id: 'knowledge', label: labels.knowledge, href: '/about' },
    { id: 'timeline', label: labels.timeline, href: '/roadmap' },
    { id: 'ecosystem', label: labels.ecosystem, href: '/ecosystem' },
    { id: 'about', label: labels.about, href: '/about' },
  ]
  const switchPath = active === 'home' ? '/' : active === 'ggs' ? '/ggs' : `/${active}`
  return <>
    <a className="su-skip" href="#su-main">{locale === 'id' ? 'Langsung ke isi' : 'Skip to content'}</a>
    <header className="su-chrome" data-menu-open={menuOpen} onKeyDown={(event) => { if (event.key === 'Escape') setMenuOpen(false) }}>
      <a className="su-brand" href={local(locale, '/')}>
        <IconMoon className="su-brand__moon" size={30} strokeWidth={1.4} />
        <span className="su-brand__text"><b>A-L-L-A-H.COM</b><small>EMPIRE OF THE LIGHT</small></span>
      </a>
      <nav id="su-primary-nav" className="su-nav" aria-label={locale === 'id' ? 'Navigasi utama' : 'Main navigation'}>
        {nav.map((item) => <a key={item.id} href={local(locale, item.href)} aria-current={item.id === active || (active === 'ggs' && item.id === 'stories') ? 'page' : undefined}>{item.label}</a>)}
      </nav>
      <div className="su-chrome__tools">
        <a className="su-search-link" href={local(locale, '/stories#story-search')} aria-label={locale === 'id' ? 'Cari cerita' : 'Search stories'}><IconSearch size={17} /></a>
        <a className="su-utility" href={local(locale, '/values')}>
          <span>{locale === 'id' ? 'KEMANUSIAAN' : 'A BRIGHTER'}</span>
          <span>{locale === 'id' ? 'YANG LEBIH' : 'HUMANITY'}</span>
          <span>{locale === 'id' ? 'CERAH MENANTI' : 'AWAITS'}</span>
        </a>
        <a className="su-language" href={local(locale === 'id' ? 'en' : 'id', switchPath)}>{locale === 'id' ? 'EN' : 'ID'} ↗</a>
        <button className="su-mobile-menu-button" type="button" aria-controls="su-primary-nav" aria-expanded={menuOpen} aria-label={menuOpen ? (locale === 'id' ? 'Tutup navigasi' : 'Close navigation') : (locale === 'id' ? 'Buka navigasi' : 'Open navigation')} onClick={() => setMenuOpen((open) => !open)}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={menuOpen ? 'M5 5 19 19M19 5 5 19' : 'M3 6h18M3 12h18M3 18h18'} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      </div>
    </header>
  </>
}
