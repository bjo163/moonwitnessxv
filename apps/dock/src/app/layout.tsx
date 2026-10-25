import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@moonwitness/moonui/moon.css'
import './globals.css'
import { SiteLayout } from '@/layouts/site'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/env'

export const metadata: Metadata = {
  title: `${SITE_NAME} — late-night radio`,
  description: SITE_TAGLINE,
  // app/manifest.ts is what Next serves at /manifest.webmanifest; these lines are
  // the parts a browser only reads from the document (and what iOS asks for).
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  )
}
