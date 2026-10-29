import { useEffect, type ReactNode } from 'react'
import { Button } from '@moonwitness/moonui'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'
import { useModalFocus } from './modal-focus'

export interface CockpitHelpModalProps {
  isOpen: boolean
  copy: CockpitCopyCatalog
  onClose: () => void
}

export function CockpitHelpModal({
  isOpen,
  copy,
  onClose,
}: CockpitHelpModalProps): ReactNode {
  const dialogRef = useModalFocus(isOpen)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcuts = [
    { key: 'Space', desc: copy.shortcutPlayPause },
    { key: 'M', desc: copy.shortcutMute },
    { key: '[ / ]', desc: copy.shortcutChannel },
    { key: '1 – 6', desc: copy.shortcutTabs },
    { key: 'P', desc: copy.shortcutPorts },
    { key: '?', desc: copy.shortcutHelp },
    { key: 'Esc', desc: copy.closeHelp },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      ref={dialogRef}
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 6, 11, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface, #13101d)',
          border: '2px solid var(--cyan, #00d4ff)',
          borderRadius: 4,
          padding: 24,
          maxWidth: 540,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3
              id="help-modal-title"
              style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                color: 'var(--cyan, #00d4ff)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {copy.helpTitle}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--muted, #9e96b0)' }}>
              {copy.helpSubtitle}
            </p>
          </div>
          <Button variant="ghost" size="sm" aria-label={copy.closeHelp} onClick={onClose}>
            ✕
          </Button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--muted, #9e96b0)', textAlign: 'left' }}>
              <th style={{ padding: '8px 4px', color: 'var(--accent, #ffd400)', fontFamily: 'monospace' }}>
                {copy.colKey}
              </th>
              <th style={{ padding: '8px 4px', color: 'var(--fg, #f7f4ec)' }}>
                {copy.colFunction}
              </th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((sc) => (
              <tr key={sc.key} style={{ borderBottom: '1px solid rgba(158, 150, 176, 0.15)' }}>
                <td style={{ padding: '8px 4px', fontFamily: 'monospace', color: 'var(--cyan, #00d4ff)', fontWeight: 'bold' }}>
                  <kbd
                    style={{
                      background: 'var(--ink, #07060b)',
                      border: '1px solid rgba(0, 212, 255, 0.4)',
                      borderRadius: 3,
                      padding: '2px 6px',
                    }}
                  >
                    {sc.key}
                  </kbd>
                </td>
                <td style={{ padding: '8px 4px', color: 'var(--fg, #f7f4ec)' }}>
                  {sc.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="accent" size="sm" onClick={onClose}>
            {copy.closeHelp}
          </Button>
        </div>
      </div>
    </div>
  )
}
