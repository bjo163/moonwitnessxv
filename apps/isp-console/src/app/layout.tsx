import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { consoleLocale } from '@/lib/copy'
import '@moonwitness/moonui/moon.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Empire WORKS · ISP Operations',
  description: 'Private operator console for ISP and network operations.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <Document>{children}</Document>
}

async function Document({ children }: { children: ReactNode }) {
  const requestHeaders = await headers()
  const lang = consoleLocale(requestHeaders.get('x-isp-console-locale'))
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
