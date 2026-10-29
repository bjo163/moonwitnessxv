import type { MetadataRoute } from 'next'
import { SITE_ORIGIN } from '../lib/seo'

// Required for Next.js `output: 'export'`; the file is emitted at build time.
export const dynamic = 'force-static'

/**
 * ADR-0016 — the Coolify apex is the canonical, indexable origin.
 * Crawlers get one allow-all rule plus the sitemap; every non-canonical host
 * (the Vercel preview project) keeps its own `X-Robots-Tag` header instead.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  }
}
