import type { SiteFooterCopy } from '@moonwitness/moonui'
import type { SiteHeaderCopy } from '@moonwitness/moonui/client'
import { text, type StoryLocale } from './story-universe'

/**
 * Empire's words and routes for the shared MoonUI chrome (ADR-0017). This
 * module is data only: no JSX, so it is not a component and needs no ledger
 * entry.
 */
const local = (locale: string, path: string) => `/${locale}${path === '/' ? '' : path}`

export type SiteSection = 'home' | 'stories' | 'characters' | 'ggs'

const brandHome = (locale: StoryLocale) => local(locale, '/')

const brand = (locale: StoryLocale) => ({
  name: 'A-L-L-A-H.COM',
  tagline: 'EMPIRE OF THE LIGHT',
  homeHref: brandHome(locale),
})

export function siteHeaderProps(
  locale: StoryLocale,
  active: SiteSection,
): { copy: SiteHeaderCopy; currentIds: string[] } {
  const labels = text[locale]
  const switchPath = active === 'home' ? '/' : active === 'ggs' ? '/ggs' : `/${active}`
  const other = locale === 'id' ? 'en' : 'id'
  return {
    currentIds: active === 'ggs' ? ['stories'] : [active],
    copy: {
      brand: brand(locale),
      navLabel: locale === 'id' ? 'Navigasi utama' : 'Main navigation',
      nav: [
        { id: 'home', label: labels.home, href: local(locale, '/') },
        { id: 'stories', label: labels.stories, href: local(locale, '/stories') },
        { id: 'characters', label: labels.characters, href: local(locale, '/characters') },
        { id: 'knowledge', label: labels.knowledge, href: local(locale, '/about') },
        { id: 'timeline', label: labels.timeline, href: local(locale, '/roadmap') },
        { id: 'ecosystem', label: labels.ecosystem, href: local(locale, '/ecosystem') },
        { id: 'about', label: labels.about, href: local(locale, '/about') },
      ],
      skipLabel: locale === 'id' ? 'Langsung ke isi' : 'Skip to content',
      searchHref: local(locale, '/stories#story-search'),
      searchLabel: locale === 'id' ? 'Cari cerita' : 'Search stories',
      utilityHref: local(locale, '/values'),
      utilityLines:
        locale === 'id'
          ? ['KEMANUSIAAN', 'YANG LEBIH', 'CERAH MENANTI']
          : ['A BRIGHTER', 'HUMANITY', 'AWAITS'],
      switchHref: local(other, switchPath),
      switchLabel: `${other.toUpperCase()} ↗`,
      openLabel: locale === 'id' ? 'Buka navigasi' : 'Open navigation',
      closeLabel: locale === 'id' ? 'Tutup navigasi' : 'Close navigation',
    },
  }
}

export function siteFooterCopy(locale: StoryLocale): SiteFooterCopy {
  const links: Array<[string, string]> =
    locale === 'id'
      ? [
          ['stories', 'Cerita'],
          ['characters', 'Karakter'],
          ['about', 'Pengetahuan'],
          ['roadmap', 'Linimasa'],
          ['ecosystem', 'Ekosistem'],
          ['about', 'Tentang'],
        ]
      : [
          ['stories', 'Stories'],
          ['characters', 'Characters'],
          ['about', 'Knowledge'],
          ['roadmap', 'Timeline'],
          ['ecosystem', 'Ecosystem'],
          ['about', 'About'],
        ]
  const info: Array<[string, string]> =
    locale === 'id'
      ? [
          ['about', 'Tentang'],
          ['ecosystem', 'Ekosistem'],
          ['values', 'Nilai'],
          ['roadmap', 'Linimasa'],
          ['sources', 'Sumber'],
          ['privacy', 'Privasi'],
        ]
      : [
          ['about', 'About'],
          ['ecosystem', 'Ecosystem'],
          ['values', 'Values'],
          ['roadmap', 'Roadmap'],
          ['sources', 'Sources'],
          ['privacy', 'Privacy'],
        ]
  return {
    brand: brand(locale),
    navLabel: locale === 'id' ? 'Navigasi kaki halaman' : 'Footer navigation',
    nav: links.map(([path, label]) => ({ href: local(locale, `/${path}`), label })),
    quote:
      locale === 'id'
        ? '“Kemanusiaan yang lebih cerah adalah cerita yang kita bangun bersama.”'
        : '“A brighter humanity is a story we build together.”',
    preview: text[locale].preview,
    meta:
      locale === 'id'
        ? ['SEMESTA MOONWITNESS XV', 'A-L-L-A-H.COM', 'SEJAK 2025', 'BANGSA BERBEDA', 'BULAN SAMA', 'KEMANUSIAAN LEBIH BESAR']
        : ['MOONWITNESS XV UNIVERSE', 'A-L-L-A-H.COM', 'EST. 2025', 'DIFFERENT PEOPLES', 'SAME MOON', 'BIGGER HUMANITY'],
    footInfoLabel: locale === 'id' ? 'Informasi pilot' : 'Pilot information',
    footInfo: info.map(([path, label]) => ({ href: local(locale, `/${path}`), label })),
  }
}
