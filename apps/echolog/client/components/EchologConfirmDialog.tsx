import { useEffect, useRef, type ReactNode } from 'react'
import { Alert, Button, Panel } from '@moonwitness/moonui'

/**
 * Keyboard-reachable confirmation dialog for destructive actions.
 * It names the exact object key being acted on and explains the consequence
 * before any request is sent. Escape cancels; focus starts inside the dialog
 * and returns to the opener when it closes.
 */
export function EchologConfirmDialog({
  title,
  objectKey,
  detail,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string
  objectKey: string
  detail?: ReactNode
  confirmLabel: string
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}): ReactNode {
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const opener = document.activeElement
    const confirm = dialogRef.current?.querySelector<HTMLButtonElement>('.echolog-dialog-confirm')
    confirm?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [onCancel])

  return (
    <div className="echolog-dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="echolog-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="echolog-dialog-title"
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <Panel title={<span id="echolog-dialog-title">{title}</span>}>
          <p className="echolog-dialog-key">
            Object key: <code className="m-mono">{objectKey}</code>
          </p>
          {detail ? <Alert tone="accent">{detail}</Alert> : null}
          <div className="echolog-dialog-actions">
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" className="echolog-dialog-confirm" onClick={onConfirm} loading={busy}>
              {confirmLabel}
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
