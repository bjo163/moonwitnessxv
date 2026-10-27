import type { Metadata } from 'next'
import { FRONTEND_URLS, SITE_NAME as BRAND, isLocale, type Locale } from '@moonwitness/core'
import { localizedDockHref } from './locale-context.mjs'

export const SITE_NAME = process.env.SITE_NAME ?? BRAND
export const SITE_TAGLINE = 'Late-night radio, catalogued by the hub itself.'

/**
 * Base origin resolution strictly grounded in workspace constants and environment overrides.
 * Guarantees no fictitious or ungrounded external domains are ever generated.
 */
export function getDockBaseUrl(): string {
  const envUrl = process.env.DOCK_PUBLIC_URL ?? process.env.NEXT_PUBLIC_SITE_URL
  const rawUrl = envUrl && envUrl.trim() !== '' ? envUrl.trim() : FRONTEND_URLS.dock
  return rawUrl.replace(/\/+$/, '')
}

/**
 * Localized metadata catalog defining title, description, and OpenGraph details.
 */
export const dockMetadataCopy = {
  id: {
    title: `${SITE_NAME} — radio larut malam`,
    description: 'Radio larut malam, dikatalogkan langsung oleh hub.',
    ogLocale: 'id_ID',
    ogAlternateLocale: ['en_US'],
  },
  en: {
    title: `${SITE_NAME} — late-night radio`,
    description: SITE_TAGLINE,
    ogLocale: 'en_US',
    ogAlternateLocale: ['id_ID'],
  },
} as const

/**
 * Generates dynamic Next.js Metadata for Dock routes.
 *
 * Ensures:
 * 1. Localized title and description for /id and /en.
 * 2. Canonical URL matching the active localized path.
 * 3. Bidirectional language alternates (id, en, and x-default) preserving the request path and query.
 * 4. OpenGraph metadata with accurate locale, URL, and site naming.
 * 5. Base URL grounded in FRONTEND_URLS.dock (or env override), preventing fictitious domains or orphan canonicals.
 */
export function getDockMetadata(locale?: Locale | string | null, routePath?: string | null): Metadata {
  const validLocale: Locale = isLocale(locale) ? locale : 'en'
  const siteUrl = getDockBaseUrl()

  let rawPath =
    typeof routePath === 'string' && routePath.trim() !== '' ? routePath.trim() : localizedDockHref('/', '', '', validLocale)
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    try {
      const parsed = new URL(rawPath)
      rawPath = `${parsed.pathname}${parsed.search}`
    } catch {
      // keep rawPath if URL parsing fails
    }
  }

  const safePath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const [pathnameRaw, search = ''] = safePath.split('?')
  const pathname = pathnameRaw.length > 1 && pathnameRaw.endsWith('/') ? pathnameRaw.replace(/\/+$/, '') : pathnameRaw
  const searchSuffix = search ? `?${search}` : ''

  const canonicalPath = localizedDockHref(pathname, searchSuffix, '', validLocale)
  const idPath = localizedDockHref(pathname, searchSuffix, '', 'id')
  const enPath = localizedDockHref(pathname, searchSuffix, '', 'en')

  const canonicalUrl = `${siteUrl}${canonicalPath}`
  const idUrl = `${siteUrl}${idPath}`
  const enUrl = `${siteUrl}${enPath}`
  const defaultUrl = enUrl

  const copy = dockMetadataCopy[validLocale]

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: copy.title,
      template: `%s — ${SITE_NAME}`,
    },
    description: copy.description,
    applicationName: SITE_NAME,
    appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'black-translucent' },
    formatDetection: { telephone: false },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        id: idUrl,
        en: enUrl,
        'x-default': defaultUrl,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: copy.ogLocale,
      alternateLocale: [...copy.ogAlternateLocale],
      type: 'website',
    },
  }
}
