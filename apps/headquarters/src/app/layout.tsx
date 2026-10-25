import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@moonwitness/moonui/moon.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moonwitness HQ',
  description: 'Command center for the moonql radio hub',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
