import type { ReactNode } from 'react'
import { IconCompass } from '@moonwitness/moonui'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import type { StoryLocale } from '../../lib/story-universe'

const local = (locale: string, path: string) => `/${locale}${path === '/' ? '' : path}`

/**
 * M45-12 — the six information pages on the same chrome as the Story Universe.
 * The markup keeps three pinned contracts: the exact `<h1>` string, a `.emp-lang`
 * locale switch (asserted by the navigation browser test), and `aria-current`.
 */
export function InfoPage({ locale, section, sections, title, summary, preview, home, navigation, langLabel, children }: {
  locale: StoryLocale
  section: string
  sections: readonly string[]
  title: string
  summary: string
  preview: string
  home: string
  navigation: string
  langLabel: string
  children: ReactNode
}) {
  const other = locale === 'id' ? 'en' : 'id'
  return <div className="su-shell su-info">
    <SiteHeader locale={locale} active="stories" />
    <main id="su-main" tabIndex={-1}>
      <div className="su-info__bar">
        <p className="su-info__crumb"><IconCompass size={13} aria-hidden="true" /><a href={local(locale, '/')}>{home}</a><span aria-hidden="true">›</span><span>{title}</span></p>
        <nav className="su-info__nav" aria-label={navigation}>
          {sections.map((item) => <a key={item} href={local(locale, `/${item}`)} aria-current={item === section ? 'page' : undefined}>{item}</a>)}
        </nav>
        <a className="emp-lang su-info__lang" href={local(other, `/${section}`)} hrefLang={other} aria-label={langLabel}>{other.toUpperCase()} ↗</a>
      </div>

      <article className="su-info__doc">
        <p className="su-eyebrow su-info__eyebrow">{preview}</p>
        <h1 className="su-info__title">{title}</h1>
        <p className="su-info__summary">{summary}</p>
        <div className="su-info__body">{children}</div>
        <a className="su-btn su-btn--ghost su-info__back" href={local(locale, '/')}><span aria-hidden="true">←</span>{home}</a>
      </article>
    </main>
    <SiteFooter locale={locale} />
  </div>
}
