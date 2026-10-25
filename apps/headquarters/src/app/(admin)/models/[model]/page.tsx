import { notFound } from 'next/navigation'
import { can, type ModelName } from '@moonwitness/moonql-client'
import { Alert, Button, PageHeader, Pagination, Panel, TextInput } from '@moonwitness/moonui'
import { deleteRecordAction } from '@/data/actions'
import { isModelName } from '@/data/queries/registry'
import { listRecords } from '@/data/queries/records'
import { me } from '@/data/queries/session'
import { getSchema } from '@/data/schema'
import { ModelTable } from '@/ui/widgets/ModelTable'

const hrefFor = (model: string, q: string | undefined, page: number): string => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return `/models/${model}${query ? `?${query}` : ''}`
}

export default async function ModelRowsPage({
  params,
  searchParams,
}: {
  params: Promise<{ model: string }>
  searchParams: Promise<{ q?: string; page?: string; error?: string }>
}) {
  const { model } = await params
  if (!isModelName(model)) notFound()
  const { q, page, error } = await searchParams

  const doc = await getSchema()
  const meta = doc.models[model]
  if (!meta) notFound()

  const result = await listRecords(model as ModelName, { q, page })
  // affordances follow the published ACL for THIS caller, not just "a route
  // exists": a user-role admin used to be offered buttons that answered 403
  const user = await me()
  const canCreate = can(meta, user, 'create')
  const canUpdate = can(meta, user, 'update')
  const canDelete = can(meta, user, 'remove')

  return (
    <div className="m-stack">
      <PageHeader
        title={meta.label}
        subtitle={`${result.total ?? result.rows.length} rows · ${meta.fields ? Object.keys(meta.fields).length : 0} fields · ${meta.addon}`}
        breadcrumbs={[{ label: 'HQ', href: '/' }, { label: 'Models', href: '/models' }, { label: model }]}
        actions={
          canCreate ? (
            <a className="m-btn" data-variant="primary" href={`/models/${model}/new`}>
              New {meta.label.toLowerCase()}
            </a>
          ) : null
        }
      />

      {error ? <Alert tone="hot">{error}</Alert> : null}

      <Panel
        title={`Table · ${model}`}
        subtitle="columns, search and pagination are generated from _schema"
        actions={
          <form method="get" action={`/models/${model}`} className="m-row">
            <TextInput name="q" defaultValue={q ?? ''} placeholder="search…" style={{ width: 200 }} />
            <Button type="submit">Search</Button>
          </form>
        }
      >
        <div className="m-stack">
          <ModelTable
            model={model}
            meta={meta}
            rows={result.rows}
            {...(canUpdate ? { rowHref: (row: Record<string, unknown>) => `/models/${model}/${String(row.id)}` } : {})}
            {...(canDelete
              ? {
                  actions: (row: Record<string, unknown>) => (
                    <form action={deleteRecordAction.bind(null, model, String(row.id))}>
                      <Button type="submit" variant="danger">
                        del
                      </Button>
                    </form>
                  ),
                }
              : {})}
          />
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            hrefFor={(target) => hrefFor(model, q, target)}
          />
        </div>
      </Panel>
    </div>
  )
}
