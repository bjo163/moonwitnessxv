import type { InfoPageProps } from '@moonwitness/moonui'
import { pageCopy, sections, type Section } from '../../lib/pages'
import { siteFooterCopy } from '../../lib/site-copy'
import type { StoryLocale } from '../../lib/story-universe'

/**
 * M45-12 — the props of MoonUI's `InfoPage` shell.
 *
 * ADR-0017: the bar, the section nav, the locale switch and the document band
 * are rendered once, in `packages/moonui/src/site.tsx`. This module resolves the
 * localized strings and the two locale facts the shell needs, and owns no
 * markup: `header` and `children` are supplied by the route that renders them.
 */
export type InfoPageShellProps = Omit<InfoPageProps, 'header' | 'children'>

export function infoPageProps(locale: StoryLocale, section: Section): InfoPageShellProps {
  const copy = pageCopy[locale]
  const page = copy[section]
  const other = locale === 'id' ? 'en' : 'id'
  return {
    sections,
    section,
    title: page.title,
    summary: page.summary,
    preview: copy.preview,
    home: copy.home,
    navigation: copy.navigation,
    langLabel: locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia',
    langCode: other,
    langHref: `/${other}/${section}`,
    basePath: `/${locale}`,
    footer: siteFooterCopy(locale),
  }
}
