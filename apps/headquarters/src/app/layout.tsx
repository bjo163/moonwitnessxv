import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@moonwitness/moonui/moon.css'
import './globals.css'
import { requestLocale } from '@/lib/request-locale'

export const metadata: Metadata = {
  title: 'Moonwitness HQ',
  description: 'Command center for the moonql radio hub',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await requestLocale()
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
