import { notFound } from 'next/navigation'
import { Alert, PageHeader } from '@moonwitness/moonui'
import { createRecordAction } from '@/data/actions'
import { isModelName } from '@/data/queries/registry'
import { optionsFor } from '@/data/queries/records'
import { getSchema } from '@/data/schema'
import { guardModel } from '@/lib/authz'
import type { SelectOption } from '@/data/types'
import { RecordForm } from '@/ui/widgets/RecordForm'
import { AccessDenied } from '@/ui/widgets/AccessDenied'

export default async function NewRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ model: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { model } = await params
  if (!isModelName(model)) notFound()
  const { error } = await searchParams

  const doc = await getSchema()
  const meta = doc.models[model]
  if (!meta) notFound()

  // create is a privileged affordance: the hub's published ACL for THIS model is
  // enforced here, server-side, before any related-row options are fetched.
  const guard = await guardModel(meta, 'create')
  if (!guard.allowed) return <AccessDenied code={guard.code} />

  const relations = [...new Set(Object.values(meta.fields).map((field) => field.relation?.model).filter(Boolean))]
  const entries = await Promise.all(relations.map(async (relation) => [relation, await optionsFor(relation!)] as const))
  const relationOptions: Record<string, SelectOption[]> = Object.fromEntries(entries)

  return (
    <div className="m-stack">
      <PageHeader
        title={`New ${meta.label.toLowerCase()}`}
        subtitle={`${model} · ${Object.keys(meta.fields).length} fields from _schema`}
        breadcrumbs={[
          { label: 'HQ', href: '/' },
          { label: 'Models', href: '/models' },
          { label: model, href: `/models/${model}` },
          { label: 'new' },
        ]}
      />
      {error ? <Alert tone="hot">{error}</Alert> : null}
      <RecordForm
        model={model}
        meta={meta}
        mode="create"
        relationOptions={relationOptions}
        action={createRecordAction.bind(null, model)}
      />
    </div>
  )
}
