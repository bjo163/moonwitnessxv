import type { ReactNode } from 'react'
import { cellText } from './cn.js'
import { DataTable } from './data.js'
import { fieldWidgetFor } from './fields.js'
import { Button, LinkButton } from './form.js'
import { Alert, Badge, Panel } from './layout.js'

/**
 * Schema-driven records (ADR-0017). The surface keeps the reader, the schema
 * lookup and the action wiring; MoonUI owns the table columns, the field order
 * and the form chrome. Nothing here knows a model name.
 */

export interface SchemaField {
  key: string
  kind: string
  label: string
  required?: boolean
  writeOnly?: boolean
  value?: string
  enumValues?: string[]
  maxLength?: number
  options?: Array<{ value: string; label: string }>
}

export interface ModelTableLabels {
  id: string
  createdAt: string
  actions: string
}

export function ModelTable({
  fields,
  rows,
  labels,
  rowHref,
  actions,
  empty,
}: {
  /** `Record<fieldKey, {kind, writeOnly}>` straight from the schema metadata. */
  fields: Record<string, { kind: string; writeOnly?: boolean }>
  rows: Array<Record<string, unknown>>
  labels: ModelTableLabels
  rowHref?: (row: Record<string, unknown>) => string
  actions?: (row: Record<string, unknown>) => ReactNode
  empty: string
}): ReactNode {
  const columns: Array<{
    key: string
    label: string
    align?: 'left' | 'right'
    render?: (row: Record<string, unknown>) => ReactNode
  }> = []

  if (rowHref) {
    columns.push({
      key: 'id',
      label: labels.id,
      render: (row) => (
        <a href={rowHref(row)} className="m-mono">
          {String(row.id ?? '').slice(0, 8)}
        </a>
      ),
    })
  } else {
    columns.push({
      key: 'id',
      label: labels.id,
      render: (row) => <span className="m-mono">{String(row.id ?? '').slice(0, 8)}</span>,
    })
  }

  for (const [key, field] of Object.entries(fields)) {
    if (field.writeOnly) continue
    if (field.kind === 'compute') {
      columns.push({
        key,
        label: key,
        render: (row) => <Badge tone="moon">{cellText(row[key])}</Badge>,
      })
      continue
    }
    columns.push({
      key,
      label: key,
      render: (row) => (
        <span className={field.kind === 'm2o' ? 'm-mono' : undefined}>{cellText(row[key])}</span>
      ),
    })
  }

  columns.push({
    key: 'createdAt',
    label: labels.createdAt,
    render: (row) => <span className="m-mono">{String(row.createdAt ?? '').slice(0, 19)}</span>,
  })
  if (actions) columns.push({ key: 'actions', label: labels.actions, render: actions })

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row, index) => String(row.id ?? index)}
      empty={empty}
    />
  )
}

function tierTone(tier: string): 'moon' | 'accent' | 'ok' | 'night' {
  if (tier === 'reference') return 'moon'
  if (tier === 'demo') return 'accent'
  if (tier === 'runtime') return 'ok'
  return 'night'
}

/** Badge for the default-data tier (seed policy visibility). */
export function TierBadge({ tier }: { tier: string }): ReactNode {
  return <Badge tone={tierTone(tier)}>{tier}</Badge>
}

export function RecordForm({
  title,
  subtitle,
  fields,
  action,
  submitLabel,
  cancelLabel,
  cancelHref,
  error,
}: {
  title: string
  subtitle: string
  fields: SchemaField[]
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
  cancelLabel: string
  cancelHref: string
  error?: string
}): ReactNode {
  return (
    <Panel title={title} subtitle={subtitle}>
      <div className="m-stack">
        {error ? (
          <Alert role="alert" tone="hot">
            {error}
          </Alert>
        ) : null}
        <form action={action} className="m-stack">
          <div className="m-grid m-grid-2">
            {fields.map((field) => {
              const Widget = fieldWidgetFor(field.kind)
              return (
                <Widget
                  key={field.key}
                  name={`${field.key}::${field.kind}`}
                  id={`f-${field.key}`}
                  label={field.required ? `${field.label} *` : field.label}
                  value={field.value === undefined ? '' : field.value}
                  required={field.required}
                  {...(field.enumValues ? { enumValues: field.enumValues } : {})}
                  {...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {})}
                  {...(field.options ? { options: field.options } : {})}
                />
              )
            })}
          </div>
          <div className="m-actions">
            <Button type="submit" variant="primary">
              {submitLabel}
            </Button>
            <LinkButton href={cancelHref} variant="ghost">
              {cancelLabel}
            </LinkButton>
          </div>
        </form>
      </div>
    </Panel>
  )
}
