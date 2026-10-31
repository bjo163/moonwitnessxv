import type { ReactNode } from 'react'
import { DataTable } from './data.js'
import { Badge } from './layout.js'

/**
 * Operational feeds (ADR-0017). The rows are structural: the surface owns its
 * reader, MoonUI owns the table, the badge tones and the empty sentence.
 */
export interface AuditFeedRow {
  id: string
  model: string
  action: string
  recordId: string
  summary?: string | null
  createdAt: string
}

export interface JobRunFeedRow {
  id: string
  job: string
  status: string
  durationMs: number
  detail?: string | null
  createdAt: string
}

export interface FeedLabels {
  when: string
  action: string
  model: string
  record: string
  fields: string
  job: string
  status: string
  ms: string
  detail: string
}

const DEFAULT_LABELS: FeedLabels = {
  when: 'when',
  action: 'action',
  model: 'model',
  record: 'record',
  fields: 'fields',
  job: 'job',
  status: 'status',
  ms: 'ms',
  detail: 'detail',
}

export function AuditFeed({
  rows,
  empty = 'No audit entries yet.',
  labels = DEFAULT_LABELS,
}: {
  rows: AuditFeedRow[]
  empty?: string
  labels?: FeedLabels
}): ReactNode {
  return (
    <DataTable
      rows={rows}
      rowKey={(row) => row.id}
      empty={empty}
      columns={[
        {
          key: 'createdAt',
          label: labels.when,
          render: (row) => <span className="m-mono">{row.createdAt.slice(0, 19)}</span>,
        },
        {
          key: 'action',
          label: labels.action,
          render: (row) => (
            <Badge tone={row.action === 'delete' ? 'hot' : row.action === 'create' ? 'ok' : 'accent'}>
              {row.action}
            </Badge>
          ),
        },
        { key: 'model', label: labels.model },
        {
          key: 'recordId',
          label: labels.record,
          render: (row) => <span className="m-mono">{row.recordId.slice(0, 8)}</span>,
        },
        { key: 'summary', label: labels.fields },
      ]}
    />
  )
}

export function JobTable({
  rows,
  empty = 'No cron runs recorded yet.',
  labels = DEFAULT_LABELS,
}: {
  rows: JobRunFeedRow[]
  empty?: string
  labels?: FeedLabels
}): ReactNode {
  return (
    <DataTable
      rows={rows}
      rowKey={(row) => row.id}
      empty={empty}
      columns={[
        {
          key: 'createdAt',
          label: labels.when,
          render: (row) => <span className="m-mono">{row.createdAt.slice(0, 19)}</span>,
        },
        { key: 'job', label: labels.job },
        {
          key: 'status',
          label: labels.status,
          render: (row) => <Badge tone={row.status === 'ok' ? 'ok' : 'hot'}>{row.status}</Badge>,
        },
        {
          key: 'durationMs',
          label: labels.ms,
          align: 'right',
          render: (row) => <span className="m-mono">{row.durationMs}</span>,
        },
        { key: 'detail', label: labels.detail },
      ]}
    />
  )
}
