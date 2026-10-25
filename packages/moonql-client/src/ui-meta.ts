import type { FieldMeta, ModelMeta } from './schema.js'

/**
 * The one derivation of "what a model looks like on screen".
 *
 * Headquarters (tables, filters, forms) and Moonql Studio each used to rebuild
 * this from `/_schema` + the create/update JSON Schema, in slightly different
 * ways. Keeping a single implementation means a new addon's model renders the
 * same everywhere and the rules for hiding a field are stated once.
 */

export interface TableColumn {
  key: string
  label: string
}

export interface FormFieldSpec {
  key: string
  kind: string
  label: string
  required: boolean
  enumValues?: string[]
  maxLength?: number
  relationModel?: string
  value: unknown
}

type SchemaObject = { properties?: Record<string, unknown>; required?: string[] }

/** id, the writable-visible fields, then createdAt — the columns a table shows */
export function tableColumns(meta: ModelMeta): TableColumn[] {
  const columns: TableColumn[] = [{ key: 'id', label: 'id' }]
  for (const [key, field] of Object.entries(meta.fields)) {
    if (field.writeOnly) continue
    columns.push({ key, label: key })
  }
  columns.push({ key: 'createdAt', label: 'createdAt' })
  return columns
}

/** first plain string field — the target of `?q=` / the search box */
export function searchField(meta: ModelMeta): string | undefined {
  for (const [key, field] of Object.entries(meta.fields)) {
    if (field.kind === 'str' && !field.writeOnly) return key
  }
  return undefined
}

/** form descriptors from the create/update JSON Schema plus field metadata */
export function formFields(
  meta: ModelMeta,
  mode: 'create' | 'update',
  values: Record<string, unknown> = {},
): FormFieldSpec[] {
  const schema = (mode === 'create' ? meta.createSchema : meta.updateSchema) as SchemaObject
  const required = new Set(schema.required ?? [])
  const out: FormFieldSpec[] = []
  for (const [key, rawProperty] of Object.entries(schema.properties ?? {})) {
    const field: FieldMeta | undefined = meta.fields[key]
    if (!field || field.writeOnly || field.computed) continue
    const property = rawProperty as { default?: unknown }
    out.push({
      key,
      kind: field.kind,
      label: key,
      required: required.has(key),
      ...(field.enum ? { enumValues: field.enum.filter((value) => value !== null) } : {}),
      ...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {}),
      ...(field.relation ? { relationModel: field.relation.model } : {}),
      value: values[key] ?? property.default ?? '',
    })
  }
  return out
}
