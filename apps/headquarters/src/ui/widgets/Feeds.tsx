import type { ReactNode } from 'react'
import { Badge, DataTable } from '@moonwitness/moonui'
import type { AuditEntryRow, JobRunRow } from '@/data/types'

export function AuditFeed({ rows }: { rows: AuditEntryRow[] }): ReactNode {
  return (
    <DataTable
      rows={rows}
      rowKey={(row) => row.id}
      empty="No audit entries yet."
      columns={[
        { key: 'createdAt', label: 'when', render: (row) => <span className="m-mono">{row.createdAt.slice(0, 19)}</span> },
        {
          key: 'action',
          label: 'action',
          render: (row) => <Badge tone={row.action === 'delete' ? 'hot' : row.action === 'create' ? 'ok' : 'accent'}>{row.action}</Badge>,
        },
        { key: 'model', label: 'model' },
        { key: 'recordId', label: 'record', render: (row) => <span className="m-mono">{row.recordId.slice(0, 8)}</span> },
        { key: 'summary', label: 'fields' },
      ]}
    />
  )
}

export function JobTable({ rows }: { rows: JobRunRow[] }): ReactNode {
  return (
    <DataTable
      rows={rows}
      rowKey={(row) => row.id}
      empty="No cron runs recorded yet."
      columns={[
        { key: 'createdAt', label: 'when', render: (row) => <span className="m-mono">{row.createdAt.slice(0, 19)}</span> },
        { key: 'job', label: 'job' },
        { key: 'status', label: 'status', render: (row) => <Badge tone={row.status === 'ok' ? 'ok' : 'hot'}>{row.status}</Badge> },
        { key: 'durationMs', label: 'ms', align: 'right', render: (row) => <span className="m-mono">{row.durationMs}</span> },
        { key: 'detail', label: 'detail' },
      ]}
    />
  )
}
