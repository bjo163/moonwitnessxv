import type { ReactNode } from 'react'
import { cellText } from './cn.js'

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
      <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{title}</div>
      {hint ? <div>{hint}</div> : null}
    </div>
  )
}

export function Spinner(): ReactNode {
  return <span className="m-spinner" role="status" aria-label="Loading" />
}

export function LiveDot({ on = true }: { on?: boolean }): ReactNode {
  return <span className="m-live-dot" data-on={on ? 'true' : 'false'} />
}
