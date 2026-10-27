import type { ReactNode } from 'react'
import { Alert, EmptyState, Spinner } from '@moonwitness/moonui'

/**
 * One contract for the four data states so a panel cannot quietly render a
 * "ready" skeleton as if it held content. `loading` announces politely,
 * `error` interrupts as an alert, `empty` states the reason in words.
 */
export type PanelStateKind = 'loading' | 'empty' | 'error' | 'ready'

export interface PanelStateProps {
  state: PanelStateKind
  loadingLabel: string
  emptyTitle: string
  emptyHint?: string
  errorMessage?: string
  children: ReactNode
}

export function PanelState({
  state,
  loadingLabel,
  emptyTitle,
  emptyHint,
  errorMessage,
  children,
}: PanelStateProps): ReactNode {
  if (state === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="m-row"
        style={{ alignItems: 'center', gap: 8, fontSize: 13 }}
      >
        <Spinner />
        <span>{loadingLabel}</span>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div role="alert">
        <Alert tone="hot">{errorMessage ?? emptyTitle}</Alert>
      </div>
    )
  }

  if (state === 'empty') {
    return <EmptyState title={emptyTitle} hint={emptyHint} />
  }

  return <>{children}</>
}
