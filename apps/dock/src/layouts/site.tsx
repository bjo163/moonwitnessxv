import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { SiteFooter, SiteHeader } from '@/ui/components/shell'
import {
  DOCK_LOCALE_HEADER,
  DOCK_ROUTE_PATH_HEADER,
  DOCK_ROUTE_SEARCH_HEADER,
  localeFromMiddlewareHeader,
} from '@/lib/locale-context.mjs'

/** the public shell: static 3-link header + footer (no menu metadata here) */
export async function SiteLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers()
  return (
    <div className="dk-shell">
      <SiteHeader
        initialPath={requestHeaders.get(DOCK_ROUTE_PATH_HEADER) ?? '/'}
        initialSearch={requestHeaders.get(DOCK_ROUTE_SEARCH_HEADER) ?? ''}
        initialLocale={localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))}
      />
      <main className="dk-main">{children}</main>
      <SiteFooter />
    </div>
  )
}
