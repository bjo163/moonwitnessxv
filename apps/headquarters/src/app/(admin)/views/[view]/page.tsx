import { notFound } from 'next/navigation'
import type { ViewName } from '@moonwitness/moonql-client'
import { Badge, Button, DataTable, PageHeader, Panel, TextInput } from '@moonwitness/moonui'
import { getSchema } from '@/data/schema'
import { serverClient } from '@/data/sdk'
import { guardView } from '@/lib/authz'
import { AccessDenied } from '@/ui/widgets/AccessDenied'
import { interpolate, modelViewCopy } from '../../models/locale-copy'
import { requestLocale } from '@/lib/request-locale'

export default async function ViewRunPage({
  params,
  searchParams,
}: {
  params: Promise<{ view: string }>
  searchParams: Promise<{ limit?: string; order?: string }>
}) {
  const { view } = await params
  const { limit, order } = await searchParams
  const locale = await requestLocale()
  const copy = modelViewCopy(locale)

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
        subtitle={interpolate(copy.rows, { view, model: meta.from, limit: meta.limit, aggregate: meta.aggregate ? copy.aggregate : copy.projection })}
        breadcrumbs={[
          { label: copy.hq, href: '/' },
          { label: copy.views, href: '/views' },
          { label: view },
        ]}
        actions={
          <span className="m-row">
            <Badge tone={meta.aggregate ? 'moon' : 'night'}>{meta.aggregate ? (locale === 'id' ? 'agregat' : 'aggregate') : (locale === 'id' ? 'proyeksi' : 'projection')}</Badge>
            <Badge tone="accent">{interpolate(copy.rowCount, { count: page.rows.length })}</Badge>
          </span>
        }
      />

      <Panel
        title={copy.run}
        subtitle={copy.runSubtitle}
        actions={
          <form method="get" action={`/views/${view}`} className="m-row">
            <TextInput name="limit" defaultValue={limit ?? '25'} aria-label={copy.limit} style={{ width: 90 }} />
            <TextInput name="order" defaultValue={order ?? ''} placeholder={copy.order} aria-label={copy.order} style={{ width: 140 }} />
            <Button type="submit">{copy.run}</Button>
          </form>
        }
      >
        <DataTable rows={rows} columns={columns} empty={copy.noViewRows} />
      </Panel>

      <Panel title={copy.declaredShape} subtitle={copy.declaredShapeSubtitle}>
        <pre className="m-mono" style={{ margin: 0, fontSize: 12, overflow: 'auto' }}>
          {JSON.stringify({ output: meta.output, expand: meta.expand ?? [], acl: meta.acl }, null, 2)}
        </pre>
      </Panel>
    </div>
  )
}
