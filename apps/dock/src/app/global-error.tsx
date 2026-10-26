'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { getStatesCopy } from '@/lib/states-copy'
import type { Locale } from '@moonwitness/core'

function detectClientLocale(): Locale {
  if (typeof document !== 'undefined') {
    const lang = document.documentElement.lang
    if (lang === 'id' || lang === 'en') return lang
    if (window.location.pathname.startsWith('/id')) return 'id'
  }
  return 'en'
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): ReactNode {
  const [locale, setLocale] = useState<Locale>(detectClientLocale)

  useEffect(() => {
    setLocale(detectClientLocale())
  }, [])

  const copy = getStatesCopy(locale)

  return (
    <html lang={locale}>
      <head>
        <title>{copy.errorGlobalTitle}</title>
      </head>
      <body style={{ margin: 0, padding: 32, fontFamily: 'monospace', background: '#0a0a0f', color: '#f0f0f5' }}>
        <div style={{ maxWidth: 640, margin: '40px auto', border: '1px solid #ff4444', padding: 24, borderRadius: 4 }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#ff6666' }}>{copy.errorGlobalTitle}</h2>
          <p style={{ margin: '0 0 16px 0', color: '#aaa' }}>{copy.errorGlobalDescription}</p>
          {error.message ? (
            <pre style={{ margin: '0 0 16px 0', padding: 12, background: '#1a1a24', color: '#ff8888', whiteSpace: 'pre-wrap' }}>
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '8px 16px',
              background: '#00d4ff',
              color: '#000',
              border: 'none',
              borderRadius: 2,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {copy.errorGlobalReload}
          </button>
        </div>
      </body>
    </html>
  )
}
