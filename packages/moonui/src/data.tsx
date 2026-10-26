import type { ReactNode } from 'react'
import { cellText, cn } from './cn.js'

export interface ColumnDef<T> {
  key: string
  label: ReactNode
  align?: 'left' | 'right' | 'center'
  render?: (row: T) => ReactNode
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  rows: T[]
  rowKey?: (row: T, index: number) => string
  empty?: ReactNode
}

/**
 * Dense read-only table. Cells without `render` go through `cellText`, so an
 * expanded relation (`countryRefRecord`) prints its human label, never JSON.
 */
export function DataTable<T>({ columns, rows, rowKey, empty }: DataTableProps<T>): ReactNode {
  if (!rows.length) {
    return <div className="m-empty">{empty ?? 'No rows.'}</div>
  }
  return (
    <div className="m-table-wrap">
      <table className="m-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} data-align={column.align}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey ? rowKey(row, index) : String((row as { id?: unknown }).id ?? index)}>
              {columns.map((column) => (
                <td key={column.key} data-align={column.align}>
                  {column.render ? column.render(row) : cellText((row as Record<string, unknown>)[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({
  page,
  pageSize,
  total,
  hrefFor,
}: {
  page: number
  pageSize: number
  /** null when the endpoint did not report a total */
  total: number | null
  hrefFor: (page: number) => string
}): ReactNode {
  const pages = total === null ? null : Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="m-pagination">
      {page > 1 ? <a href={hrefFor(page - 1)}>← Prev</a> : null}
      <span className="m-page">
        {page}
        {pages ? ` / ${pages}` : ''}
      </span>
      {pages && page < pages ? <a href={hrefFor(page + 1)}>Next →</a> : null}
      {total !== null ? (
        <span className="m-muted">
          {total} row{total === 1 ? '' : 's'}
        </span>
      ) : null}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: ReactNode; hint?: ReactNode }): ReactNode {
  return (
    <div className="m-empty">
      <div style={{ fontWeight: 800, color: 'var(--fg)' }}>{title}</div>
      {hint ? <div>{hint}</div> : null}
    </div>
  )
}

export function Spinner(): ReactNode {
  return <span className="m-spinner" role="status" aria-label="Loading" />
}

export function LiveDot({
  on = true,
  state,
}: {
  on?: boolean
  state?: 'connecting' | 'live' | 'down'
}): ReactNode {
  const active = state ? state === 'live' : on
  const resolvedState = state ?? (on ? 'live' : 'down')
  return <span className="m-live-dot" data-on={active ? 'true' : 'false'} data-state={resolvedState} />
}

export type ProgressTone = 'accent' | 'pink' | 'cyan' | 'blue' | 'purple' | 'ok'

/**
 * Unified progress bar across the monorepo (Now Playing progress, Chart bars,
 * Project Universe progress).
 */
export function ProgressBar({
  value,
  max = 100,
  tone = 'pink',
  size = 'md',
  className,
}: {
  value: number
  max?: number
  tone?: ProgressTone
  size?: 'sm' | 'md'
  className?: string
}): ReactNode {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0
  return (
    <div className={cn('m-progress', className)} data-size={size} aria-hidden="true">
      <span className="m-progress-fill" data-tone={tone} style={{ width: `${pct}%` }} />
    </div>
  )
}

export interface ChartBarRow {
  label: string
  value: number
  href?: string
}

/**
 * Unified horizontal bar chart list (used for Most Played, Per Country, Per Genre).
 */
export function ChartList({
  rows,
  empty = 'No data.',
  tone = 'cyan',
}: {
  rows: ChartBarRow[]
  empty?: ReactNode
  tone?: ProgressTone
}): ReactNode {
  if (rows.length === 0) {
    return <p className="m-muted">{empty}</p>
  }
  const max = rows.reduce((peak, row) => Math.max(peak, row.value), 1)
  return (
    <div className="m-chart">
      {rows.map((row) => (
        <div key={row.label} className="m-bar">
          <div className="m-bar-head">
            {row.href ? <a href={row.href}>{row.label}</a> : <span>{row.label}</span>}
            <span className="m-mono">{row.value}</span>
          </div>
          <ProgressBar value={row.value} max={max} tone={tone} size="md" />
        </div>
      ))}
    </div>
  )
}
