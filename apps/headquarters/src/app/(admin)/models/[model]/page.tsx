import { notFound } from 'next/navigation'
import { can, type ModelName } from '@moonwitness/moonql-client'
import { Alert, Button, PageHeader, Pagination, Panel, TextInput } from '@moonwitness/moonui'
import { deleteRecordAction } from '@/data/actions'
import { isModelName } from '@/data/queries/registry'
import { listRecords } from '@/data/queries/records'
import { getSchema } from '@/data/schema'
import { guardModel } from '@/lib/authz'
import { AccessDenied } from '@/ui/widgets/AccessDenied'
import { ModelTable } from '@/ui/widgets/ModelTable'
import { editorFailureMessage, editorStatusMessage, interpolate, modelViewCopy } from '../locale-copy'
import { requestLocale } from '@/lib/request-locale'

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
  searchParams: Promise<{ q?: string; page?: string; error?: string; saved?: 'created' | 'updated' | 'deleted' }>
}) {
  const { model } = await params
  if (!isModelName(model)) notFound()
  const { q, page, error, saved } = await searchParams
  const locale = await requestLocale()
  const copy = modelViewCopy(locale)

  const doc = await getSchema()
  const meta = doc.models[model]
  if (!meta) notFound()

  // listing is the privileged part of this page: the hub's published `list` rule
  // for THIS model is checked before any row is fetched, so a caller who would
  // get a 403 from the API never sees a table (or triggers the query at all)
  const guard = await guardModel(meta, 'list')
  if (!guard.allowed) return <AccessDenied code={guard.code} />
  const user = guard.user

  const result = await listRecords(model as ModelName, { q, page })
  // affordances follow the published ACL for THIS caller, not just "a route
  // exists": a user-role admin used to be offered buttons that answered 403
  const canCreate = can(meta, user, 'create')
  const canUpdate = can(meta, user, 'update')
  const canDelete = can(meta, user, 'remove')

  return (
    <div className="m-stack">
      <PageHeader
        title={meta.label}
        subtitle={interpolate(copy.rowsFieldsAddon, { rows: result.total ?? result.rows.length, fields: meta.fields ? Object.keys(meta.fields).length : 0, addon: meta.addon })}
        breadcrumbs={[{ label: copy.hq, href: '/' }, { label: copy.models, href: '/models' }, { label: model }]}
        actions={
          canCreate ? (
            <a className="m-btn" data-variant="primary" href={`/models/${model}/new`}>
              {interpolate(copy.newRecord, { model: meta.label.toLowerCase() })}
            </a>
          ) : null
        }
      />

      {error ? (editorFailureMessage(locale, error) ? <Alert tone="hot">{editorFailureMessage(locale, error)}</Alert> : null) : null}
      {saved ? (editorStatusMessage(locale, saved) ? <Alert tone="ok">{editorStatusMessage(locale, saved)}</Alert> : null) : null}

      <Panel
        title={interpolate(copy.table, { model })}
        subtitle={copy.tableSubtitle}
        actions={
          <form method="get" action={`/models/${model}`} className="m-row">
            <TextInput name="q" defaultValue={q ?? ''} placeholder={copy.searchPlaceholder} style={{ width: 200 }} />
            <Button type="submit">{copy.search}</Button>
          </form>
        }
      >
        <div className="m-stack">
          <ModelTable
            model={model}
            meta={meta}
            locale={locale}
            rows={result.rows}
            {...(canUpdate ? { rowHref: (row: Record<string, unknown>) => `/models/${model}/${String(row.id)}` } : {})}
            {...(canDelete
              ? {
                  actions: (row: Record<string, unknown>) => (
                    <form action={deleteRecordAction.bind(null, model, String(row.id))}>
                      <Button type="submit" variant="danger">{locale === 'id' ? 'Hapus' : 'Delete'}</Button>
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
