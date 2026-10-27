import { notFound } from 'next/navigation'
import type { ViewName } from '@moonwitness/moonql-client'
import { Badge, Button, DataTable, PageHeader, Panel, TextInput } from '@moonwitness/moonui'
import { getSchema } from '@/data/schema'
import { serverClient } from '@/data/sdk'
import { guardView } from '@/lib/authz'
import { AccessDenied } from '@/ui/widgets/AccessDenied'

export default async function ViewRunPage({
  params,
  searchParams,
}: {
  params: Promise<{ view: string }>
  searchParams: Promise<{ limit?: string; order?: string }>
}) {
  const { view } = await params
  const { limit, order } = await searchParams

  const doc = await getSchema()
  const meta = doc.views[view]
  if (!meta) notFound()

  // the view's own published `acl` rule gates the read: `recentPlays`-style
  // admin views are refused here instead of running the query and eating a 403
  const guard = await guardView(meta)
  if (!guard.allowed) return <AccessDenied code={guard.code} />

  const page = await serverClient()
    .view(view as ViewName)
    .read({
      limit: Math.min(limit ? Number(limit) : 25, meta.limit),
      ...(order ? { order } : {}),
      total: true,
    })

  const rows = page.rows as unknown as Record<string, unknown>[]
  const columns = rows.length
    ? Object.keys(rows[0]!).map((key) => ({ key, label: key }))
    : (meta.output ?? []).map((key) => ({ key, label: key }))

  return (
    <div className="m-stack">
      <PageHeader
        title={meta.label}
        subtitle={`${view} · from ${meta.from} · limit ${meta.limit}${meta.aggregate ? ' · aggregate' : ''}`}
        breadcrumbs={[
          { label: 'HQ', href: '/' },
          { label: 'Views', href: '/views' },
          { label: view },
        ]}
        actions={
          <span className="m-row">
            <Badge tone={meta.aggregate ? 'moon' : 'night'}>{meta.aggregate ? 'aggregate' : 'projection'}</Badge>
            <Badge tone="accent">{page.rows.length} rows</Badge>
          </span>
        }
      />

      <Panel
        title="Run"
        subtitle={'GET /<view> — the same route every client uses'}
        actions={
          <form method="get" action={`/views/${view}`} className="m-row">
            <TextInput name="limit" defaultValue={limit ?? '25'} style={{ width: 90 }} />
            <TextInput name="order" defaultValue={order ?? ''} placeholder="order" style={{ width: 140 }} />
            <Button type="submit">Run</Button>
          </form>
        }
      >
        <DataTable rows={rows} columns={columns} empty="The view returned no rows." />
      </Panel>

      <Panel title="Declared shape" subtitle="output keys + declared joins (from _schema)">
        <pre className="m-mono" style={{ margin: 0, fontSize: 12, overflow: 'auto' }}>
          {JSON.stringify({ output: meta.output, expand: meta.expand ?? [], acl: meta.acl }, null, 2)}
        </pre>
      </Panel>
    </div>
  )
}
