'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Alert, Button, LinkButton, Panel } from '@moonwitness/moonui'
import { clientDockLocale, dockHrefFor } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'
import type { Locale } from '@moonwitness/core'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): ReactNode {
  const [locale, setLocale] = useState<Locale>(clientDockLocale)

  useEffect(() => {
    setLocale(clientDockLocale())
  }, [])

  const copy = getStatesCopy(locale)
  const localeHref = dockHrefFor(locale)

  return (
    <div className="m-stack" style={{ gap: 20, maxWidth: 640, margin: '40px auto' }}>
      <Panel title={copy.errorBoundaryTitle} subtitle={copy.errorBoundaryDescription}>
        <div className="m-stack" style={{ gap: 16 }}>
          <div role="alert">
            <Alert tone="hot">{error.message || copy.errorBoundaryDescription}</Alert>
          </div>
          <div className="m-row" style={{ gap: 12 }}>
            <Button type="button" variant="accent" onClick={() => reset()}>
              {copy.errorTryAgain}
            </Button>
            <LinkButton href={localeHref('/')} variant="ghost">
              {copy.errorReturnHome}
            </LinkButton>
          </div>
        </div>
      </Panel>
    </div>
  )
}
