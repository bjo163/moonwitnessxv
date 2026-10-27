'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Spinner } from '@moonwitness/moonui'
import { clientDockLocale } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'
import type { Locale } from '@moonwitness/core'

export default function Loading(): ReactNode {
  const [locale, setLocale] = useState<Locale>(clientDockLocale)

  useEffect(() => {
    setLocale(clientDockLocale())
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
