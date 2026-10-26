import type { ReactNode, RefObject } from 'react'
import { Button, TextInput } from '@moonwitness/moonui'

export interface PreviewShortcut {
  label: string
  url: string
}

export const PREVIEW_SHORTCUTS: PreviewShortcut[] = [
  { label: 'Radio (3000)', url: 'http://127.0.0.1:3000' },
  { label: 'AI Gateway (3001)', url: 'http://127.0.0.1:3001' },
  { label: 'Sentinel (3002)', url: 'http://127.0.0.1:3002' },
  { label: 'Headquarters (3003)', url: 'http://127.0.0.1:3003' },
  { label: 'Dock (3004)', url: 'http://127.0.0.1:3004' },
]

export interface CockpitPreviewViewProps {
  previewUrl: string
  setPreviewUrl: (url: string) => void
  openPreview: (url: string) => void
  previewFrameRef: RefObject<HTMLIFrameElement | null>
}

export function CockpitPreviewView({
  previewUrl,
  setPreviewUrl,
  openPreview,
  previewFrameRef,
}: CockpitPreviewViewProps): ReactNode {
  return (
    <div className="tab-content">
      <div className="preview-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 500 }}>
          <TextInput
            style={{ height: 32, fontSize: 12, flex: 1, color: 'var(--cyan)' }}
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
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
            Go
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (previewFrameRef.current) previewFrameRef.current.src = previewUrl
            }}
          >
            Reload
          </Button>
          <Button
            variant="paper"
            size="sm"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            External
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {PREVIEW_SHORTCUTS.map((s) => (
            <Button
              key={s.label}
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
        title="Cockpit Preview"
      />
    </div>
  )
}
