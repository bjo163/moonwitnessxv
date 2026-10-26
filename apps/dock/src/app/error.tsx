'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Alert, Button, LinkButton, Panel } from '@moonwitness/moonui'
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

export default function ErrorBoundary({
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
    <div className="m-stack" style={{ gap: 20, maxWidth: 640, margin: '40px auto' }}>
      <Panel title={copy.errorBoundaryTitle} subtitle={copy.errorBoundaryDescription}>
        <div className="m-stack" style={{ gap: 16 }}>
          <Alert tone="hot">{error.message || copy.errorBoundaryDescription}</Alert>
          <div className="m-row" style={{ gap: 12 }}>
            <Button type="button" variant="accent" onClick={() => reset()}>
              {copy.errorTryAgain}
            </Button>
            <LinkButton href={`/${locale}`} variant="ghost">
              {copy.errorReturnHome}
            </LinkButton>
          </div>
        </div>
      </Panel>
    </div>
  )
}
