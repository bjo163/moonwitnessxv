import type { ReactNode } from 'react'
import { EmptyState, Spinner } from './data.js'
import { LinkButton } from './form.js'
import { Alert, PageHeader, Panel } from './layout.js'

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
  /**
   * Structural placeholder shown under the loading label — a MoonUI skeleton
   * only. It carries no data, so a loading panel never dresses a shape up as
   * a result.
   */
  loadingPlaceholder?: ReactNode
  children: ReactNode
}

export function PanelState({
  state,
  loadingLabel,
  emptyTitle,
  emptyHint,
  errorMessage,
  loadingPlaceholder,
  children,
}: PanelStateProps): ReactNode {
  if (state === 'loading') {
    return (
      <div role="status" aria-live="polite" className="m-stack" style={{ gap: 12 }}>
        <div className="m-row" style={{ alignItems: 'center', gap: 8, fontSize: 13 }}>
          <Spinner />
          <span>{loadingLabel}</span>
        </div>
        {loadingPlaceholder ?? null}
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

/**
 * The four localized sentences one panel needs. Every string comes from the
 * caller's states catalogue, so a panel cannot invent its own wording.
 */
export interface PanelCopy {
  loadingLabel: string
  emptyTitle: string
  emptyHint?: string
  errorMessage: string
}

export type PanelOutcome<T> =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'empty' }
  | { state: 'ready'; value: T }

/**
 * Renders one resolved outcome through `PanelState`. A panel whose read is
 * already awaited by the route uses this directly; a streaming route keeps its
 * own Suspense boundary in the application layer.
 */
export function OutcomePanel<T>({
  outcome,
  copy,
  skeleton,
  children,
}: {
  outcome: PanelOutcome<T>
  copy: PanelCopy
  skeleton?: ReactNode
  children: (value: T) => ReactNode
}): ReactNode {
  if (outcome.state !== 'ready') {
    return (
      <PanelState
        state={outcome.state}
        loadingLabel={copy.loadingLabel}
        emptyTitle={copy.emptyTitle}
        emptyHint={copy.emptyHint}
        errorMessage={outcome.state === 'error' ? outcome.message : undefined}
        loadingPlaceholder={skeleton}
      >
        {null}
      </PanelState>
    )
  }

  return <>{children(outcome.value)}</>
}

/**
 * What a guarded page renders instead of privileged content: the denial is the
 * whole screen, it carries no partially loaded shell, and the only sentence it
 * can show is the one the caller resolved from a stable code.
 */
export function AccessDeniedView({
  title,
  body,
  backHref,
  backLabel,
  retryLabel,
  canRetry,
  subtitle,
  breadcrumbLabel = 'HQ',
}: {
  title: string
  body: ReactNode
  backHref: string
  backLabel: string
  retryLabel: string
  canRetry: boolean
  subtitle: string
  breadcrumbLabel?: string
}): ReactNode {
  return (
    <div className="m-stack">
      <PageHeader
        title={title}
        breadcrumbs={[{ label: breadcrumbLabel, href: '/' }]}
        actions={
          <LinkButton href={backHref} variant="primary" size="sm">
            {backLabel}
          </LinkButton>
        }
      />
      <Panel title={title} subtitle={subtitle}>
        <div className="m-stack" style={{ gap: 12 }}>
          <Alert role="alert" tone={canRetry ? 'accent' : 'hot'}>
            {body}
          </Alert>
          {canRetry ? (
            <form method="get" className="m-row">
              <button type="submit" className="m-btn" data-variant="ghost">
                {retryLabel}
              </button>
            </form>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}
