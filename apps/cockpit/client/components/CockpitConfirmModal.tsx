import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '@moonwitness/moonui'

export interface CockpitConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function CockpitConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: CockpitConfirmModalProps): ReactNode {
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    confirmBtnRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
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
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--surface, #13101d)',
          border: '2px solid var(--accent, #ffd400)',
          borderRadius: 4,
          padding: 24,
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="confirm-modal-title"
          style={{
            margin: '0 0 12px 0',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            color: 'var(--accent, #ffd400)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </h3>
        <p
          id="confirm-modal-desc"
          style={{
            margin: '0 0 24px 0',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            color: 'var(--fg, #f7f4ec)',
          }}
        >
          {description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmBtnRef}
            variant="accent"
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
