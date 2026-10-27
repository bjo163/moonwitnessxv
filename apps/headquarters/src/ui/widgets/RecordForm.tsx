import type { ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import type { ModelMeta } from '@moonwitness/moonql-client'
import { Alert, Button, Panel } from '@moonwitness/moonui'
import { formFields, type SelectOption } from '@/data/types'
import { modelViewCopy } from '@/app/(admin)/models/locale-copy'
import { FieldWidget } from '@/ui/fields/registry'

/**
 * The generic form: fields, order, labels and widgets all come from
 * `createSchema`/`updateSchema` + `FieldMeta.kind`. No model-specific code.
 */
export function RecordForm({
  model,
  meta,
  mode,
  values = {},
  relationOptions = {},
  action,
  error,
  locale,
}: {
  model: string
  meta: ModelMeta
  mode: 'create' | 'update'
  values?: Record<string, unknown>
  relationOptions?: Record<string, SelectOption[]>
  action: (formData: FormData) => void | Promise<void>
  error?: string
  locale: Locale
}): ReactNode {
  const copy = modelViewCopy(locale)
  const fields = formFields(meta, mode, values)

  return (
    <Panel title={`${mode === 'create' ? copy.create : copy.edit} ${meta.label.toLowerCase()}`} subtitle={copy.fieldsFromSchema.replace('{count}', String(fields.length))}>
      <div className="m-stack">
        {error ? <Alert tone="hot">{error}</Alert> : null}
        <form action={action} className="m-stack">
          <div className="m-grid m-grid-2">
            {fields.map((field) => (
              <FieldWidget
                key={field.key}
                kind={field.kind}
                name={`${field.key}::${field.kind}`}
                id={`f-${field.key}`}
                label={field.required ? `${field.label} *` : field.label}
                value={field.value === null || field.value === undefined ? '' : String(field.value)}
                required={field.required}
                {...(field.enumValues ? { enumValues: field.enumValues } : {})}
                {...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {})}
                {...(field.relationModel && relationOptions[field.relationModel]
                  ? { options: relationOptions[field.relationModel] }
                  : {})}
              />
            ))}
          </div>
          <div className="m-actions">
            <Button type="submit" variant="primary">
              {mode === 'create' ? copy.create : copy.saveChanges}
            </Button>
            <a className="m-btn" href={`/models/${model}`}>
              {copy.cancel}
            </a>
          </div>
        </form>
      </div>
    </Panel>
  )
}
