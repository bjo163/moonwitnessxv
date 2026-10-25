import type { ReactNode } from 'react'
import { SiteFooter, SiteHeader } from '@/ui/components/shell'

/** the public shell: static 3-link header + footer (no menu metadata here) */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dk-shell">
      <SiteHeader />
      <main className="dk-main">{children}</main>
      <SiteFooter />
    </div>
  )
}
