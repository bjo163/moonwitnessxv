import type { SchemaField } from '@moonwitness/moonui'
import type { FormFieldSpec } from '@moonwitness/moonql-client'
import type { SelectOption } from './types'

/**
 * ADR-0017: the schema reader stays here; MoonUI's `RecordForm` only renders the
 * fields it is handed. `kind` decides the widget, `relationModel` decides which
 * fetched options attach to the control.
 */
export function schemaFields(
  fields: FormFieldSpec[],
  relationOptions: Record<string, SelectOption[]> = {},
): SchemaField[] {
  return fields.map((field) => {
    const relation = (field as { relationModel?: string }).relationModel
    return {
      key: field.key,
      kind: field.kind,
      label: field.label,
      required: field.required,
      value: field.value === null || field.value === undefined ? '' : String(field.value),
      ...(field.enumValues ? { enumValues: field.enumValues } : {}),
      ...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {}),
      ...(relation && relationOptions[relation] ? { options: relationOptions[relation] } : {}),
    }
  })
}
