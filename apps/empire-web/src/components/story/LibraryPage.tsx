import type { SiteFooterCopy } from '@moonwitness/moonui'
import type { StoryLibraryCard, StoryLibraryCopy } from '@moonwitness/moonui/client'
import { libraryCards, libraryCopy } from '../../lib/library-copy'
import { siteFooterCopy } from '../../lib/site-copy'
import type { StoryLocale } from '../../lib/story-universe'

/**
 * REF-02 — the props MoonUI's `StoryLibraryPage` renders.
 *
 * ADR-0017: this module holds no markup. The catalogue rows, the localized
 * strings, the artwork and the locale-prefixed href builder are passed to the
 * shared view, which owns the filter state and the page anatomy.
 */
export interface LibraryViewProps {
  copy: StoryLibraryCopy
  cards: StoryLibraryCard[]
  footer: SiteFooterCopy
  basePath: string
  artwork: { hero: string }
}

export function libraryViewProps(locale: StoryLocale): LibraryViewProps {
  return {
    copy: libraryCopy[locale],
    cards: libraryCards[locale],
    footer: siteFooterCopy(locale),
    basePath: `/${locale}`,
    artwork: { hero: '/story-universe/library-guardian.webp' },
  }
}
