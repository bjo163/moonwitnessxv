import type { MetadataRoute } from 'next'
import { FRONTEND_URLS } from '@moonwitness/core'

/**
 * Base origin resolution for Dock sitemap.
 */
export function getDockBaseUrl(): string {
  const envUrl = process.env.DOCK_PUBLIC_URL ?? process.env.NEXT_PUBLIC_SITE_URL
  const rawUrl = envUrl && envUrl.trim() !== '' ? envUrl.trim() : FRONTEND_URLS.dock
  return rawUrl.replace(/\/+$/, '')
}

/**
 * Public routes indexed in the dynamic Dock sitemap.
 */
export const DOCK_SITEMAP_ROUTES = [
  '',
  '/stations',
  '/schedule',
  '/missions',
  '/reader',
  '/reader/compare',
  '/terms',
  '/figures',
  '/constellation',
  '/research',
  '/prisms',
  '/timeline',
  '/patches',
  '/denpa',
  '/studio',
] as const

/**
 * Dynamic Next.js sitemap generator for Dock.
 * Generates paired /id and /en entries with reciprocal hreflang alternates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getDockBaseUrl()
  const lastModified = new Date()

  const entries: MetadataRoute.Sitemap = []

  for (const route of DOCK_SITEMAP_ROUTES) {
    const idUrl = `${baseUrl}/id${route}`
    const enUrl = `${baseUrl}/en${route}`
    const priority = route === '' ? 1.0 : 0.8
    const changeFrequency = route === '' ? 'daily' : 'weekly'

    const alternates = {
      languages: {
        id: idUrl,
        en: enUrl,
        'x-default': enUrl,
      },
    }

    // Locale entry: Indonesian
    entries.push({
      url: idUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates,
    })

    // Locale entry: English
    entries.push({
      url: enUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates,
    })
  }

  return entries
}
