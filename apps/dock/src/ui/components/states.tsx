import { Suspense, type ReactNode } from 'react'
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
      <div
        role="status"
        aria-live="polite"
        className="m-stack"
        style={{ gap: 12 }}
      >
        <div
          className="m-row"
          style={{ alignItems: 'center', gap: 8, fontSize: 13 }}
        >
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
 * states catalogue, so a panel cannot invent its own wording per locale.
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
 * already awaited by the route (its filter shell needs the same data) uses
 * this directly; the route's own boundary supplies the loading state.
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
 * Resolves one read into exactly one data state. A rejected read is an error,
 * never an empty array; a read that yields nothing, or nothing the panel can
 * show, is empty. Kept separate from the renderer so a test can drive it with
 * stubbed data.
 */
export async function readPanel<T>(
  load: () => Promise<T | null | undefined>,
  copy: PanelCopy,
  isEmpty: (value: T) => boolean = () => false,
  mapError: (err: unknown) => string = () => copy.errorMessage,
): Promise<PanelOutcome<T>> {
  let value: T | null | undefined
  try {
    value = await load()
  } catch (err) {
    return { state: 'error', message: mapError(err) }
  }

  if (value === null || value === undefined || isEmpty(value)) return { state: 'empty' }
  return { state: 'ready', value }
}

export interface DataPanelProps<T> {
  load: () => Promise<T | null | undefined>
  copy: PanelCopy
  /** When the read succeeded but carries nothing showable; absent means only a null read is empty. */
  isEmpty?: (value: T) => boolean
  /** Turns a thrown read into the sentence the panel shows. */
  mapError?: (err: unknown) => string
  /** Shape-only placeholder for the loading state, e.g. a MoonUI skeleton. */
  skeleton?: ReactNode
  children: (value: T) => ReactNode
}

/**
 * A data-backed panel that renders all four states through `PanelState`.
 * The read happens inside a streamed boundary, so the panel shows its loading
 * state instead of the whole route waiting on the hub.
 */
export function DataPanel<T>({
  load,
  copy,
  isEmpty,
  mapError,
  skeleton,
  children,
}: DataPanelProps<T>): ReactNode {
  return (
    <Suspense fallback={<OutcomePanel outcome={{ state: 'loading' }} copy={copy} skeleton={skeleton}>{emptyChildren}</OutcomePanel>}>
      <DataPanelReader load={load} copy={copy} isEmpty={isEmpty} mapError={mapError}>
        {children}
      </DataPanelReader>
    </Suspense>
  )
}

/** Nothing to render yet: the outcome carries no value to hand to a panel body. */
function emptyChildren(): ReactNode {
  return null
}

async function DataPanelReader<T>({
  load,
  copy,
  isEmpty,
  mapError,
  skeleton,
  children,
}: DataPanelProps<T>): Promise<ReactNode> {
  const outcome = await readPanel<T>(load, copy, isEmpty, mapError)
  return <OutcomePanel outcome={outcome} copy={copy} skeleton={skeleton}>{children}</OutcomePanel>
}
