import { notFound } from 'next/navigation'
import { can, type ModelName } from '@moonwitness/moonql-client'
import { Alert, Button, PageHeader, Panel } from '@moonwitness/moonui'
import { deleteRecordAction, updateRecordAction } from '@/data/actions'
import { isModelName } from '@/data/queries/registry'
import { getRecord, optionsFor } from '@/data/queries/records'
import { getSchema } from '@/data/schema'
import { me } from '@/data/queries/session'
import type { SelectOption } from '@/data/types'
import { RecordForm } from '@/ui/widgets/RecordForm'

export default async function EditRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ model: string; id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { model, id } = await params
  if (!isModelName(model)) notFound()
  const { error } = await searchParams

  const doc = await getSchema()
  const meta = doc.models[model]
  if (!meta) notFound()

  const record = await getRecord(model as ModelName, id)

  const relations = [...new Set(Object.values(meta.fields).map((field) => field.relation?.model).filter(Boolean))]
  const entries = await Promise.all(relations.map(async (relation) => [relation, await optionsFor(relation!)] as const))
  const relationOptions: Record<string, SelectOption[]> = Object.fromEntries(entries)

  // same rule as the list page: only offer what this caller's roles allow
  const canDelete = can(meta, await me(), 'remove')

  return (
    <div className="m-stack">
      <PageHeader
        title={`${meta.label} · ${String(record.id).slice(0, 8)}`}
        subtitle={`${model} · updated ${String(record.updatedAt ?? '').slice(0, 19)}`}
        breadcrumbs={[
          { label: 'HQ', href: '/' },
          { label: 'Models', href: '/models' },
          { label: model, href: `/models/${model}` },
          { label: String(record.id).slice(0, 8) },
        ]}
        actions={
          canDelete ? (
            <form action={deleteRecordAction.bind(null, model, id)}>
              <Button type="submit" variant="danger">
                Delete
              </Button>
            </form>
          ) : null
        }
      />
      {error ? <Alert tone="hot">{error}</Alert> : null}
      <RecordForm
        model={model}
        meta={meta}
        mode="update"
        values={record}
        relationOptions={relationOptions}
        action={updateRecordAction.bind(null, model, id)}
      />
      <Panel title="Raw payload" subtitle="what the API actually stores (hydrated row)">
        <pre className="m-mono" style={{ margin: 0, fontSize: 12, overflow: 'auto' }}>
          {JSON.stringify(record, null, 2)}
        </pre>
      </Panel>
    </div>
  )
}
