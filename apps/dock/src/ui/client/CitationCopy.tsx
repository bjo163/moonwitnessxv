'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@moonwitness/moonui'

type CopyStatus = 'idle' | 'copied' | 'failed'

export function CitationCopy({ text, citationKey }: { text: string; citationKey: string }): ReactNode {
  const [status, setStatus] = useState<CopyStatus>('idle')

  async function copy(): Promise<void> {
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
          void copy()
        }}
        aria-label={`Copy citation for ${citationKey}`}
      >
        COPY CITATION
      </Button>
      <span className="dk-reader-copy-status" role="status" aria-live="polite">
        {status === 'copied' ? 'Citation copied to clipboard.' : null}
        {status === 'failed' ? 'Clipboard unavailable — select the citation text below and copy it manually.' : null}
      </span>
    </div>
  )
}
