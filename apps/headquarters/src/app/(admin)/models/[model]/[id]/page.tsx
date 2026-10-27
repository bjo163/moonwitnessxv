import { notFound } from 'next/navigation'
import { can, type ModelName } from '@moonwitness/moonql-client'
import { Alert, Button, PageHeader, Panel } from '@moonwitness/moonui'
import { deleteRecordAction, updateRecordAction } from '@/data/actions'
import { isModelName } from '@/data/queries/registry'
import { getRecord, optionsFor } from '@/data/queries/records'
import { getSchema } from '@/data/schema'
import { guardModel } from '@/lib/authz'
import type { SelectOption } from '@/data/types'
import { AccessDenied } from '@/ui/widgets/AccessDenied'
import { RecordForm } from '@/ui/widgets/RecordForm'
import { editorFailureMessage, editorStatusMessage, modelViewCopy } from '../../locale-copy'
import { requestLocale } from '@/lib/request-locale'

export default async function EditRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ model: string; id: string }>
  searchParams: Promise<{ error?: string; saved?: 'updated' }>
}) {
  const { model, id } = await params
  if (!isModelName(model)) notFound()
  const { error, saved } = await searchParams
  const locale = await requestLocale()
  const copy = modelViewCopy(locale)

  const doc = await getSchema()
  const meta = doc.models[model]
  if (!meta) notFound()

  // this page both reads and writes a row: the hub's published `get` rule is
  // enforced before the record is fetched, and the edit form is only rendered
  // when the same published ACL also grants `update`
  const guard = await guardModel(meta, 'get')
  if (!guard.allowed) return <AccessDenied code={guard.code} />
  const user = guard.user

  const record = await getRecord(model as ModelName, id)

  const relations = [...new Set(Object.values(meta.fields).map((field) => field.relation?.model).filter(Boolean))]
  const entries = await Promise.all(relations.map(async (relation) => [relation, await optionsFor(relation!)] as const))
  const relationOptions: Record<string, SelectOption[]> = Object.fromEntries(entries)

  // same rule as the list page: only offer what this caller's roles allow
  const canUpdate = can(meta, user, 'update')
  const canDelete = can(meta, user, 'remove')

  return (
    <div className="m-stack">
      <PageHeader
        title={`${meta.label} · ${String(record.id).slice(0, 8)}`}
        subtitle={`${model} · ${locale === 'id' ? 'diperbarui' : 'updated'} ${String(record.updatedAt ?? '').slice(0, 19)}`}
        breadcrumbs={[
          { label: copy.hq, href: '/' },
          { label: copy.models, href: '/models' },
          { label: model, href: `/models/${model}` },
          { label: String(record.id).slice(0, 8) },
        ]}
        actions={
          canDelete ? (
            <form action={deleteRecordAction.bind(null, model, id)}>
              <Button type="submit" variant="danger">
                {locale === 'id' ? 'Hapus' : 'Delete'}
              </Button>
            </form>
          ) : null
        }
      />
      {error ? (editorFailureMessage(locale, error) ? <Alert tone="hot">{editorFailureMessage(locale, error)}</Alert> : null) : null}
      {saved ? (editorStatusMessage(locale, saved) ? <Alert tone="ok">{editorStatusMessage(locale, saved)}</Alert> : null) : null}
      {canUpdate ? (
        <RecordForm
          model={model}
          meta={meta}
          mode="update"
          values={record}
          relationOptions={relationOptions}
          action={updateRecordAction.bind(null, model, id)}
          locale={locale}
        />
      ) : (
        <Alert tone="accent">{locale === 'id' ? 'Akun ini dapat membaca data, tetapi tidak dapat mengubahnya; formulir tidak ditampilkan.' : 'This account may read this record but not edit it; the form is not offered.'}</Alert>
      )}
      <Panel title={locale === 'id' ? 'Payload mentah' : 'Raw payload'} subtitle={locale === 'id' ? 'data yang disimpan API (baris lengkap)' : 'what the API actually stores (hydrated row)'}>
        <pre className="m-mono" style={{ margin: 0, fontSize: 12, overflow: 'auto' }}>
          {JSON.stringify(record, null, 2)}
        </pre>
      </Panel>
    </div>
  )
}
