'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Button } from '@moonwitness/moonui'
import type { Locale } from '@moonwitness/core'
import { getStatesCopy } from '@/lib/states-copy'

type CopyStatus = 'idle' | 'copied' | 'failed'

function detectClientLocale(): Locale {
  if (typeof document !== 'undefined') {
    const lang = document.documentElement.lang
    if (lang === 'id' || lang === 'en') return lang
    if (window.location.pathname.startsWith('/id')) return 'id'
  }
  return 'en'
}

export function CitationCopy({
  text,
  citationKey,
  locale,
}: {
  text: string
  citationKey: string
  locale?: Locale
}): ReactNode {
  const [activeLocale, setActiveLocale] = useState<Locale>(() => locale ?? detectClientLocale())
  const [status, setStatus] = useState<CopyStatus>('idle')

  useEffect(() => {
    if (locale) {
      setActiveLocale(locale)
    } else {
      setActiveLocale(detectClientLocale())
    }
  }, [locale])

  const copy = getStatesCopy(activeLocale)

  async function copyText(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div className="dk-reader-copy">
      <Button
        type="button"
        variant="paper"
        size="sm"
        onClick={() => {
          void copyText()
        }}
        aria-label={`Copy citation for ${citationKey}`}
      >
        {copy.formCopyCitation}
      </Button>
      <span className="dk-reader-copy-status" role="status" aria-live="polite">
        {status === 'copied' ? copy.formCopySuccess : null}
        {status === 'failed' ? copy.formCopyFailure : null}
      </span>
    </div>
  )
}
