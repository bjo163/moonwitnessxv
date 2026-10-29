import type { MetadataRoute } from 'next'
import { LOCALIZED_PATHS, LOCALES, SITE_ORIGIN, canonicalUrl } from '../lib/seo'

// Required for Next.js `output: 'export'`; the file is emitted at build time.
export const dynamic = 'force-static'

/**
 * Every route the static export actually emits: the entry page, both locale
 * roots, and each localized route. The sitemap deliberately carries no
 * `lastModified` — the build cannot know when editorial content changed, and a
 * fabricated date is worse than none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_ORIGIN}/`, changeFrequency: 'monthly', priority: 1 },
  ]

  for (const path of LOCALIZED_PATHS) {
    const languages = { id: canonicalUrl('id', path), en: canonicalUrl('en', path) }
    for (const locale of LOCALES) {
      entries.push({
        url: canonicalUrl(locale, path),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 0.9 : 0.6,
        alternates: { languages },
      })
    }
  }

  return entries
}
