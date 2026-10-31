import type { SiteFooterCopy, StoryCodexArtwork, StoryCodexCopy } from '@moonwitness/moonui'
import { codexArtwork, codexCopy } from '../../lib/codex-copy'
import { siteFooterCopy } from '../../lib/site-copy'
import type { StoryLocale } from '../../lib/story-universe'

/**
 * REF-04 — the props MoonUI's `StoryCodexPage` renders.
 *
 * ADR-0017: no markup here. The character-page anatomy lives once, in
 * `packages/moonui/src/codex.tsx`; this module holds the localized strings, the
 * artwork URLs and the locale-prefixed href builder, and the route composes the
 * shared `SiteHeader` itself.
 */
export interface CodexViewProps {
  copy: StoryCodexCopy
  footer: SiteFooterCopy
  hrefFor: (path: string) => string
  artwork: StoryCodexArtwork
}

const local = (locale: StoryLocale, path: string) => `/${locale}${path === '/' ? '' : path}`

export function codexViewProps(locale: StoryLocale): CodexViewProps {
  return {
    copy: codexCopy[locale],
    footer: siteFooterCopy(locale),
    hrefFor: (path: string) => local(locale, path),
    artwork: codexArtwork,
  }
}
