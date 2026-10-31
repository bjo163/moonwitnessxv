import type { Metadata } from 'next'
import { SiteNotFound } from '@moonwitness/moonui'
import { empireGlobalNotFoundCopy } from '../lib/site-copy'
import '@moonwitness/moonui/moon.css'
import './globals.css'
export const metadata: Metadata = {
  title: 'Page not found | A-L-L-A-H.COM',
  robots: { index: false, follow: false },
}
export default function GlobalNotFound() {
  return <html lang="en" data-skin="empire"><body className="emp-body"><SiteNotFound copy={empireGlobalNotFoundCopy} /></body></html>
}
