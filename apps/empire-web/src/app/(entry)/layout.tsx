import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@moonwitness/moonui/moon.css'
import '../globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://a-l-l-a-h.com'),
  title: { default: 'A-L-L-A-H.COM | Empire of the Light', template: '%s | A-L-L-A-H.COM' },
  description: 'A human-governed gateway for knowledge, stories, meaningful work, and responsible action. Born from love, built in the cloud.',
  applicationName: 'A-L-L-A-H.COM — Empire Gateway',
  // ADR-0016: the Coolify apex is the canonical, indexable origin. Vercel
  // previews stay out of the index through their own X-Robots-Tag header.
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" data-skin="empire"><body className="emp-body">{children}</body></html>
}
