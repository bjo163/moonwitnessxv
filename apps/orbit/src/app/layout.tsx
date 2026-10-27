import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@moonwitness/moonui/moon.css'
import './globals.css'
import { getRequestLocale } from '../lib/request-locale'
import { orbitCopy } from '../lib/orbit-copy'

export const metadata: Metadata = {
  title: 'ORBIT — Spatial Agent Operations | MoonWitness XV',
  description: 'Standalone 3D-first, accessible 2D-fallback spatial agent operations frontend',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getRequestLocale()
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
