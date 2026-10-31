import type { ReactNode } from 'react'
import { cn } from './cn.js'
import { IconBookOpen, IconCompass, IconMoon } from './icons/index.js'
import { LinkButton } from './form.js'

/**
 * Shared site chrome (ADR-0017). The strings, routes and locale come from the
 * caller: MoonUI owns the anatomy, the surface owns the words.
 */
export interface SiteLink {
  id?: string
  href: string
  label: string
}

export interface SiteBrandCopy {
  name: string
  tagline: string
  homeHref: string
}

export function SiteBrand({ brand, footer = false }: { brand: SiteBrandCopy; footer?: boolean }): ReactNode {
  return (
    <a className={footer ? 'su-brand su-brand--footer' : 'su-brand'} href={brand.homeHref}>
      <IconMoon className="su-brand__moon" size={30} strokeWidth={1.4} />
      <span className="su-brand__text">
        <b>{brand.name}</b>
        <small>{brand.tagline}</small>
      </span>
    </a>
  )
}

const SOCIAL_MARKS = [
  {
    name: 'x',
    path: <path d="M4 4l16 16M20 4L4 20" />,
  },
  {
    name: 'youtube',
    path: <><rect x="2.5" y="6" width="19" height="12" rx="3.5" /><path d="m10.5 9.5 4 2.5-4 2.5Z" /></>,
  },
  {
    name: 'instagram',
    path: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="0.8" fill="currentColor" /></>,
  },
  {
    name: 'telegram',
    path: <><path d="M21 4 3 11l5 2 2 6 3-4 4 3 4-14Z" /><path d="m8 13 8-6" /></>,
  },
]

/** Decorative social marks: illustration, never a link or an affordance. */
export function SocialRow({ className }: { className?: string }): ReactNode {
  return (
    <p className={cn(className)} aria-hidden="true">
      {SOCIAL_MARKS.map((mark) => (
        <svg
          key={mark.name}
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {mark.path}
        </svg>
      ))}
    </p>
  )
}

export type SiteFooterMeta = [string, string, string, string, string, string]

export interface SiteFooterCopy {
  brand: SiteBrandCopy
  navLabel: string
  nav: SiteLink[]
  quote: string
  /** Draft/preview disclosure; it must stay visible in the bottom bar. */
  preview: string
  meta: SiteFooterMeta
  footInfoLabel: string
  footInfo: SiteLink[]
}

export function SiteFooter({ copy }: { copy: SiteFooterCopy }): ReactNode {
  return (
    <footer className="su-footer">
      <div className="su-footer__main">
        <SiteBrand brand={copy.brand} footer />
        <nav className="su-footer__nav" aria-label={copy.navLabel}>
          {copy.nav.map((item, index) => (
            <a key={`${item.href}-${String(index)}`} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <SocialRow className="su-footer__social" />
        <div className="su-footer__aside">
          <p className="su-footer__quote">{copy.quote}</p>
          <p className="su-preview su-footer__preview" role="note">
            {copy.preview}
          </p>
        </div>
      </div>
      <div className="su-footer__bar">
        <span className="su-footer__meta">{copy.meta[0]}</span>
        <span aria-hidden="true">|</span>
        <span className="su-footer__meta">{copy.meta[1]}</span>
        <span aria-hidden="true">|</span>
        <span className="su-footer__meta">{copy.meta[2]}</span>
        <nav className="su-footer-info" aria-label={copy.footInfoLabel}>
          {copy.footInfo.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <span className="su-footer__meta su-footer__meta--end">{copy.meta[3]}</span>
        <span aria-hidden="true">|</span>
        <span className="su-footer__meta">{copy.meta[4]}</span>
        <span aria-hidden="true">|</span>
        <span className="su-footer__meta">{copy.meta[5]}</span>
      </div>
    </footer>
  )
}

/**
 * The information-page shell (M45-12) shared with the Story Universe.
 *
 * Every string, the section list, the locale-prefixed base and the other-locale
 * link are computed by the surface: this component owns the bar, the breadcrumb,
 * the section nav with its `aria-current`, the locale switch and the document
 * band. Three contracts are pinned here and must not drift: the exact `<h1>`
 * text, `.emp-lang` on the locale switch, and `aria-current` on the active
 * section.
 */
export interface InfoPageProps {
  sections: readonly string[]
  section: string
  title: string
  summary: string
  preview: string
  home: string
  navigation: string
  langLabel: string
  /** Code of the other locale, rendered upper-case inside the switch. */
  langCode: string
  /** Prebuilt href for the same section in the other locale. */
  langHref: string
  /** Locale-prefixed base for every in-page link, e.g. `/id`. */
  basePath: string
  header: ReactNode
  footer: SiteFooterCopy
  children: ReactNode
}

export function InfoPage({
  sections,
  section,
  title,
  summary,
  preview,
  home,
  navigation,
  langLabel,
  langCode,
  langHref,
  basePath,
  header,
  footer,
  children,
}: InfoPageProps): ReactNode {
  const hrefFor = (path: string) => `${basePath}${path === '/' ? '' : path}`
  return (
    <div className="su-shell su-info">
      {header}
      <main id="su-main" tabIndex={-1}>
        <div className="su-info__bar">
          <p className="su-info__crumb">
            <IconCompass size={13} aria-hidden="true" />
            <a href={hrefFor('/')}>{home}</a>
            <span aria-hidden="true">›</span>
            <span>{title}</span>
          </p>
          <nav className="su-info__nav" aria-label={navigation}>
            {sections.map((item) => (
              <a key={item} href={hrefFor(`/${item}`)} aria-current={item === section ? 'page' : undefined}>
                {item}
              </a>
            ))}
          </nav>
          <a className="emp-lang su-info__lang" href={langHref} hrefLang={langCode} aria-label={langLabel}>
            {langCode.toUpperCase()} ↗
          </a>
        </div>

        <article className="su-info__doc">
          <p className="su-eyebrow su-info__eyebrow">{preview}</p>
          <h1 className="su-info__title">{title}</h1>
          <p className="su-info__summary">{summary}</p>
          <div className="su-info__body">{children}</div>
          <LinkButton className="su-info__back" href={hrefFor('/')} variant="ghost">
            <span aria-hidden="true">←</span>
            {home}
          </LinkButton>
        </article>
      </main>
      <SiteFooter copy={footer} />
    </div>
  )
}

/**
 * The hero action pair rendered by Home, Library, Codex (twice) and GGS. The
 * page keeps its own band class; the button anatomy is MoonUI's.
 */
export function PageActions({
  className,
  size,
  primary,
  secondary,
}: {
  className: string
  size?: 'sm'
  primary: SiteLink
  secondary: SiteLink
}): ReactNode {
  const modifier = size === 'sm' ? 'su-actions--sm' : ''
  return (
    <div className={cn(className, modifier)}>
      <LinkButton href={primary.href} variant="accent" size={size === 'sm' ? 'sm' : 'lg'}>
        <span aria-hidden="true">↗</span>
        {primary.label}
      </LinkButton>
      <LinkButton href={secondary.href} variant="ghost" size={size === 'sm' ? 'sm' : 'lg'}>
        <IconBookOpen size={size === 'sm' ? 14 : 15} />
        {secondary.label}
      </LinkButton>
    </div>
  )
}
