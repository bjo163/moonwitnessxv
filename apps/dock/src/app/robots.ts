import type { MetadataRoute } from 'next'
import { FRONTEND_URLS } from '@moonwitness/core'

/** Base origin resolution for Dock robots, matching the sitemap's rule. */
function getDockBaseUrl(): string {
  const envUrl = process.env.DOCK_PUBLIC_URL ?? process.env.NEXT_PUBLIC_SITE_URL
  const rawUrl = envUrl && envUrl.trim() !== '' ? envUrl.trim() : FRONTEND_URLS.dock
  return rawUrl.replace(/\/+$/, '')
}

/**
 * ADR-0016 — the catalog is indexable and its sitemap lives on the public
 * origin, so the crawler rules must name that origin rather than the
 * container's own host. Read per request like the canonical metadata.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = getDockBaseUrl()
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}
