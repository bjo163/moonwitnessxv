import type { ReactNode, RefObject } from 'react'
import { Button, TextInput } from '@moonwitness/moonui'
import type { AppConfig } from '../types'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'

export interface CockpitPreviewViewProps {
  config: AppConfig | null
  previewUrl: string
  setPreviewUrl: (url: string) => void
  openPreview: (url: string) => void
  previewFrameRef: RefObject<HTMLIFrameElement | null>
  copy: CockpitCopyCatalog
}

/**
 * Shortcuts are derived from /api/config so they can never drift from real port
 * ownership; the previous static list mapped services to the wrong ports.
 * A `:<port>` suffix keeps the chip label unambiguous without a hardcoded number.
 */
function shortcuts(config: AppConfig | null): Array<{ label: string; url: string }> {
  if (!config) return []
  return config.services
    .filter((svc) => svc.type !== 'worker' && svc.port !== undefined && svc.url)
    .map((svc) => ({ label: `${svc.name} :${String(svc.port)}`, url: svc.url as string }))
}

export function CockpitPreviewView({
  config,
  previewUrl,
  setPreviewUrl,
  openPreview,
  previewFrameRef,
  copy,
}: CockpitPreviewViewProps): ReactNode {
  return (
    <div className="tab-content">
      <div className="preview-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 500 }}>
          <TextInput
            style={{ height: 32, fontSize: 12, flex: 1, color: 'var(--cyan)' }}
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder={copy.urlPlaceholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && previewFrameRef.current) {
                previewFrameRef.current.src = previewUrl
              }
            }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (previewFrameRef.current) previewFrameRef.current.src = previewUrl
            }}
          >
            {copy.go}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (previewFrameRef.current) previewFrameRef.current.src = previewUrl
            }}
          >
            {copy.reload}
          </Button>
          <Button
            variant="paper"
            size="sm"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            {copy.externalWindow}
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {shortcuts(config).map((s) => (
            <Button
              key={s.url}
              variant="ghost"
              size="sm"
              style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => openPreview(s.url)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <iframe
        ref={previewFrameRef}
        className="preview-iframe"
        src={previewUrl}
        title={copy.iframeTitle}
      />
    </div>
  )
}
