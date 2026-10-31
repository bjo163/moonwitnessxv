import type { SiteFooterCopy } from '@moonwitness/moonui'
import type { StoryReaderCopy } from '@moonwitness/moonui/client'
import { readerCopy } from '../../lib/reader-copy'
import { siteFooterCopy } from '../../lib/site-copy'
import type { StoryLocale } from '../../lib/story-universe'

/**
 * REF-03 — the props MoonUI's `StoryReaderPage` renders.
 *
 * ADR-0017: no markup here. Page navigation state, the poster figure and every
 * panel belong to the shared view; this module supplies the localized words, the
 * poster URL and the locale-prefixed href builder the route needs.
 */
export interface ReaderViewProps {
  copy: StoryReaderCopy
  footer: SiteFooterCopy
  basePath: string
  artwork: { poster: string }
}

export function readerViewProps(locale: StoryLocale): ReaderViewProps {
  return {
    copy: readerCopy[locale],
    footer: siteFooterCopy(locale),
    basePath: `/${locale}`,
    artwork: { poster: '/story-universe/reader-poster.webp' },
  }
}
