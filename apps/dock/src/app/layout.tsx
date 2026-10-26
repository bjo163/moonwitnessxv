import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import '@moonwitness/moonui/moon.css'
import './globals.css'
import { SiteLayout } from '@/layouts/site'
import { getDockMetadata } from '@/lib/metadata'
import {
  DOCK_LOCALE_HEADER,
  DOCK_ROUTE_PATH_HEADER,
  localeFromMiddlewareHeader,
} from '@/lib/locale-context.mjs'

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const routePath = requestHeaders.get(DOCK_ROUTE_PATH_HEADER) ?? (locale === 'id' ? '/id' : '/en')
  return getDockMetadata(locale, routePath)
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))

  return (
    <html lang={locale}>
      <body>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  )
}

