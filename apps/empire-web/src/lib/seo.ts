import type { Metadata } from 'next'

/**
 * Canonical origin of the public pilot (ADR-0016).
 *
 * Coolify serves this host from the `empire-web` container. The Vercel project
 * stays preview-only and keeps its own `X-Robots-Tag: noindex, nofollow`
 * header, so the same build can never become a second indexable origin.
 */
export const SITE_ORIGIN = 'https://a-l-l-a-h.com'

export const LOCALES = ['id', 'en'] as const
export type SeoLocale = (typeof LOCALES)[number]

/** Every localized route the export emits, in the order the sitemap lists them. */
export const LOCALIZED_PATHS = [
  '',
  '/stories',
  '/stories/angelwithshotgun',
  '/characters',
  '/ggs',
  '/about',
  '/ecosystem',
  '/values',
  '/roadmap',
  '/sources',
  '/privacy',
] as const

export function isLocale(value: string): value is SeoLocale {
  return value === 'id' || value === 'en'
}

/** Absolute canonical URL for a localized route. `path` is `''` or starts with `/`. */
export function canonicalUrl(locale: SeoLocale, path: string): string {
  return `${SITE_ORIGIN}/${locale}${path}`
}

/**
 * Canonical URL plus hreflang for one localized route.
 *
 * `metadataBase` and `robots` live in the locale layout, so a page only states
 * where it actually lives. Without this, every page would inherit the locale
 * root as its canonical, which is worse than declaring none.
 */
export function routeMetadata(locale: SeoLocale, path: string): Metadata {
  return {
    metadataBase: new URL(SITE_ORIGIN),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: {
        id: canonicalUrl('id', path),
        en: canonicalUrl('en', path),
        'x-default': canonicalUrl('en', path),
      },
    },
  }
}
