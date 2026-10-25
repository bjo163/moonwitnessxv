import type { ReactNode } from 'react'
import type { ModelMeta } from '@moonwitness/moonql-client'
import { Badge, DataTable, type ColumnDef } from '@moonwitness/moonui'
import { cellText } from '@moonwitness/moonui'

/** generic table: columns from field metadata, `*Record` values print their label */
export function ModelTable({
  model,
  meta,
  rows,
  rowHref,
  actions,
}: {
  model: string
  meta: ModelMeta
  rows: Record<string, unknown>[]
  rowHref?: (row: Record<string, unknown>) => string
  actions?: (row: Record<string, unknown>) => ReactNode
}): ReactNode {
  const columns: ColumnDef<Record<string, unknown>>[] = []

  if (rowHref) {
    columns.push({
      key: 'id',
      label: 'id',
      render: (row) => (
        <a href={rowHref(row)} className="m-mono">
          {String(row.id ?? '').slice(0, 8)}
        </a>
      ),
    })
  } else {
    columns.push({ key: 'id', label: 'id', render: (row) => <span className="m-mono">{String(row.id ?? '').slice(0, 8)}</span> })
  }

  for (const [key, field] of Object.entries(meta.fields)) {
    if (field.writeOnly) continue
    if (field.kind === 'compute') {
      columns.push({ key, label: key, render: (row) => <Badge tone="moon">{cellText(row[key])}</Badge> })
      continue
    }
    columns.push({ key, label: key, render: (row) => <span className={field.kind === 'm2o' ? 'm-mono' : undefined}>{cellText(row[key])}</span> })
  }
  columns.push({ key: 'createdAt', label: 'created', render: (row) => <span className="m-mono">{String(row.createdAt ?? '').slice(0, 19)}</span> })
  if (actions) columns.push({ key: 'actions', label: 'actions', render: actions })

  return <DataTable columns={columns} rows={rows} rowKey={(row, index) => String(row.id ?? index)} empty={`No ${model} rows yet.`} />
}

/** badge for the default-data tier (seed policy visibility) */
export function TierBadge({ tier }: { tier: string }): ReactNode {
  const tone = tier === 'reference' ? 'moon' : tier === 'demo' ? 'accent' : tier === 'runtime' ? 'ok' : 'night'
  return <Badge tone={tone}>{tier}</Badge>
}
