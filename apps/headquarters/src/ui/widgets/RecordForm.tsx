import type { ReactNode } from 'react'
import type { ModelMeta } from '@moonwitness/moonql-client'
import { Alert, Button, Panel } from '@moonwitness/moonui'
import { formFields, type SelectOption } from '@/data/types'
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
}: {
  model: string
  meta: ModelMeta
  mode: 'create' | 'update'
  values?: Record<string, unknown>
  relationOptions?: Record<string, SelectOption[]>
  action: (formData: FormData) => void | Promise<void>
  error?: string
}): ReactNode {
  const fields = formFields(meta, mode, values)

  return (
    <Panel title={`${mode === 'create' ? 'New' : 'Edit'} ${meta.label.toLowerCase()}`} subtitle={`${fields.length} fields from _schema`}>
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
              {mode === 'create' ? 'Create' : 'Save changes'}
            </Button>
            <a className="m-btn" href={`/models/${model}`}>
              Cancel
            </a>
          </div>
        </form>
      </div>
    </Panel>
  )
}
