import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import '@moonwitness/moonui/moon.css'
import './globals.css'
import { getRequestLocale } from '../lib/request-locale'
import { orbitCopy } from '../lib/orbit-copy'
import { ORBIT_LOCALE_HEADER } from '../lib/orbit-locale-header'

export const metadata: Metadata = {
  title: 'ORBIT — Spatial Agent Operations | MoonWitness XV',
  description: 'Standalone 3D-first, accessible 2D-fallback spatial agent operations frontend',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // A layout has no searchParams, so the edge entry point hands the URL locale here.
  const forwarded = (await headers()).get(ORBIT_LOCALE_HEADER)
  const locale = await getRequestLocale(forwarded === '' ? null : forwarded)
  const copy = orbitCopy(locale)

  return (
    <html lang={locale} dir="ltr">
      <body>
        <a href="#main-content" className="orbit-skip-link">
          {copy.skipToContent}
        </a>
        <div className="orbit-shell">{children}</div>
      </body>
    </html>
  )
}
