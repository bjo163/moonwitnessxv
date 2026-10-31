import type { SiteFooterCopy, StoryGgsArtwork, StoryGgsCopy } from '@moonwitness/moonui'
import { ggsArtwork, ggsCopy } from '../../lib/ggs-copy'
import { siteFooterCopy } from '../../lib/site-copy'
import type { StoryLocale } from '../../lib/story-universe'

/**
 * REF-05 — the props MoonUI's `StoryGgsPage` renders.
 *
 * ADR-0017: this file owns no markup. The page anatomy lives in
 * `packages/moonui/src/story.tsx`; here are only the localized strings, the
 * artwork paths and the locale-prefixed href builder. The route passes the
 * shared `SiteHeader` element itself, so nothing here can drift into a second
 * implementation of the page.
 */
export interface GgsViewProps {
  copy: StoryGgsCopy
  footer: SiteFooterCopy
  hrefFor: (path: string) => string
  artwork: StoryGgsArtwork
}

const local = (locale: StoryLocale, path: string) => `/${locale}${path === '/' ? '' : path}`

export function ggsViewProps(locale: StoryLocale): GgsViewProps {
  return {
    copy: ggsCopy[locale],
    footer: siteFooterCopy(locale),
    hrefFor: (path: string) => local(locale, path),
    artwork: ggsArtwork,
  }
}
