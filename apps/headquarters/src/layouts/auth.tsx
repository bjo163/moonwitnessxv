import type { ReactNode } from 'react'
import { SITE_NAME } from '@/lib/env'

/** the login surface: no sidebar, no session, one card in the middle */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          MOON<span style={{ color: 'var(--moon)' }}>WITNESS</span> HQ
        </div>
        {children}
        <p className="m-muted" style={{ fontSize: 12, margin: 0 }}>
          {SITE_NAME} — operator surface for the moonql hub. Studio remains available for
          zero-build emergencies.
        </p>
      </div>
    </div>
  )
}
