'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Button } from '@moonwitness/moonui'
import type { Locale } from '@moonwitness/core'
import { clientDockLocale } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

type CopyStatus = 'idle' | 'copied' | 'failed'

export function CitationCopy({
  text,
  citationKey,
  locale,
}: {
  text: string
  citationKey: string
  locale?: Locale
}): ReactNode {
  const [activeLocale, setActiveLocale] = useState<Locale>(() => locale ?? clientDockLocale())
  const [status, setStatus] = useState<CopyStatus>('idle')

  useEffect(() => {
    if (locale) {
      setActiveLocale(locale)
    } else {
      setActiveLocale(clientDockLocale())
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
