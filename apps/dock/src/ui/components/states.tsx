import { Suspense, type ReactNode } from 'react'
import { OutcomePanel, type PanelCopy, type PanelOutcome } from '@moonwitness/moonui'

/**
 * The view layer of the four data states lives in `@moonwitness/moonui`
 * (`PanelState`, `OutcomePanel`) under ADR-0017. This module keeps the part that
 * is not a component: resolving a read into exactly one outcome, and the
 * streamed boundary that renders it. Neither renders markup of its own.
 */
export { OutcomePanel, PanelState } from '@moonwitness/moonui'
export type {
  PanelCopy,
  PanelOutcome,
  PanelStateKind,
  PanelStateProps,
} from '@moonwitness/moonui'

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
