import { notFound } from 'next/navigation'
import { PageHeader, RecordForm } from '@moonwitness/moonui'
import { createRecordAction } from '@/data/actions'
import { isModelName } from '@/data/queries/registry'
import { optionsFor } from '@/data/queries/records'
import { getSchema } from '@/data/schema'
import { guardModel } from '@/lib/authz'
import { formFields, type SelectOption } from '@/data/types'
import { schemaFields } from '@/data/form-fields'
import { AccessDenied } from '@/ui/widgets/AccessDenied'
import { editorFailureMessage, interpolate, modelViewCopy } from '../../locale-copy'
import { requestLocale } from '@/lib/request-locale'
import { LiveAlert } from '@/ui/LiveAlert'

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
  const locale = await requestLocale()
  const copy = modelViewCopy(locale)

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
        title={interpolate(copy.newRecord, { model: meta.label.toLowerCase() })}
        subtitle={`${model} · ${copy.fieldsFromSchema.replace('{count}', String(Object.keys(meta.fields).length))}`}
        breadcrumbs={[
          { label: copy.hq, href: '/' },
          { label: copy.models, href: '/models' },
          { label: model, href: `/models/${model}` },
          { label: locale === 'id' ? 'baru' : 'new' },
        ]}
      />
      {error ? (editorFailureMessage(locale, error) ? <LiveAlert role="alert" tone="hot">{editorFailureMessage(locale, error)}</LiveAlert> : null) : null}
      <RecordForm
        title={`${copy.create} ${meta.label.toLowerCase()}`}
        subtitle={copy.fieldsFromSchema.replace('{count}', String(Object.keys(meta.fields).length))}
        fields={schemaFields(formFields(meta, 'create', {}), relationOptions)}
        action={createRecordAction.bind(null, model)}
        submitLabel={copy.create}
        cancelLabel={copy.cancel}
        cancelHref={`/models/${model}`}
      />
    </div>
  )
}
