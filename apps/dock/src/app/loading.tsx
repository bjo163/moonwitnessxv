'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Spinner } from '@moonwitness/moonui'
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

export default function Loading(): ReactNode {
  const [locale, setLocale] = useState<Locale>(detectClientLocale)

  useEffect(() => {
    setLocale(detectClientLocale())
  }, [])

  const copy = getStatesCopy(locale)

  return (
    <div
      className="m-stack"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        gap: 16,
      }}
      role="status"
      aria-live="polite"
    >
      <Spinner />
      <p className="m-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
        {copy.loadingTransmissions}
      </p>
    </div>
  )
}
