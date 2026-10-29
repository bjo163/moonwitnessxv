import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@moonwitness/moonui/moon.css'
import '../globals.css'

export const metadata: Metadata = {
  title: { default: 'A-L-L-A-H.COM | Empire of the Light', template: '%s | A-L-L-A-H.COM' },
  description: 'A human-governed gateway for knowledge, stories, meaningful work, and responsible action. Born from love, built in the cloud.',
  applicationName: 'A-L-L-A-H.COM — Empire Gateway',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" data-skin="zine"><body className="emp-body">{children}</body></html>
}
