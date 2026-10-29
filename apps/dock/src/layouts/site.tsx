import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { SiteFooter, SiteHeader } from '@/ui/components/shell'
import { getLandingCopy } from '@/lib/landing-copy'
import { MOON_EXPERIENCES, type MoonExperienceName } from '@moonwitness/moonui'
import type { CSSProperties } from 'react'
import {
  DOCK_LOCALE_HEADER,
  DOCK_ROUTE_PATH_HEADER,
  DOCK_ROUTE_SEARCH_HEADER,
  localeFromMiddlewareHeader,
} from '@/lib/locale-context.mjs'

/** the public shell: static 3-link header + footer (no menu metadata here) */
export async function SiteLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const routePath = requestHeaders.get(DOCK_ROUTE_PATH_HEADER) ?? '/'
  const unlocalizedPath = routePath.replace(/^\/(?:en|id)(?=\/|$)/, '') || '/'
  const experience: MoonExperienceName | undefined = unlocalizedPath.startsWith('/reader')
    ? 'reader'
    : unlocalizedPath === '/terms'
      ? 'research'
      : unlocalizedPath === '/studio'
        ? 'story'
        : undefined
  const tokens = experience ? MOON_EXPERIENCES[experience] : undefined
  const experienceStyle = tokens
    ? ({
        '--experience-measure': tokens.measure,
        '--experience-max-width': tokens.maxWidth,
        '--experience-density': tokens.density,
        '--experience-line-height': tokens.lineHeight,
        '--experience-heading-font': tokens.fonts.heading,
        '--experience-body-font': tokens.fonts.body,
        '--experience-code-font': tokens.fonts.code,
        '--experience-display-size': tokens.typeScale.display,
        '--experience-heading-size': tokens.typeScale.heading,
        '--experience-body-size': tokens.typeScale.body,
        '--experience-caption-size': tokens.typeScale.caption,
        '--experience-code-size': tokens.typeScale.code,
        '--experience-gutter': tokens.space.gutter,
        '--experience-section-gap': tokens.space.section,
        '--experience-inline-gap': tokens.space.inline,
      } as CSSProperties)
    : undefined
  return (
    <div className="dk-shell">
      <a className="dk-skip" href="#main">
        {getLandingCopy(locale).skipToContent}
      </a>
      <SiteHeader
        initialPath={requestHeaders.get(DOCK_ROUTE_PATH_HEADER) ?? '/'}
        initialSearch={requestHeaders.get(DOCK_ROUTE_SEARCH_HEADER) ?? ''}
        initialLocale={locale}
      />
      <main className="dk-main" id="main" tabIndex={-1} data-experience={experience} style={experienceStyle}>{children}</main>
      <SiteFooter initialLocale={locale} />
    </div>
  )
}
