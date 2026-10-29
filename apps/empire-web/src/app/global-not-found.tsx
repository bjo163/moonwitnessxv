import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Page not found | A-L-L-A-H.COM',
  robots: { index: false, follow: false },
}
export default function GlobalNotFound() {
  return <html lang="en"><body>
    <main className="emp-not-found">
      <p>404 · TRANSMISSION NOT FOUND</p><h1>Page not found</h1>
      <p lang="id">Halaman ini belum tersedia.</p>
      <a href="/id" lang="id">Beranda Indonesia</a><a href="/en">English home</a>
    </main>
  </body></html>
}
