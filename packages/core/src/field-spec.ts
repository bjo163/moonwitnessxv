/**
 * The schema-property → input-control table, shared by every renderer.
 *
 * It belongs in `core` and not in the React kit because the two surfaces that need it
 * are opposite kinds of caller: headquarters renders `/_schema` kinds through React
 * controls, while the hub's Studio is a zero-build page with hand-written JS that only
 * sees JSON Schema. Putting the table here means neither of them owns the answer.
 *
 * Values are HTML input types plus two pseudo-kinds (`select`, `checkbox`) that each
 * caller maps to its own control — what is decided once is the *branch*, not the markup.
 */

export interface SchemaProperty {
  type?: string | string[]
  enum?: unknown[]
  format?: string
  maxLength?: number
  [key: string]: unknown
}

export const FIELD_INPUT_SPEC: Record<string, { input: string; step?: string }> = {
  enum: { input: 'select' },
  relation: { input: 'select' },
  boolean: { input: 'checkbox' },
  integer: { input: 'number', step: '1' },
  number: { input: 'number' },
  datetime: { input: 'datetime-local' },
  string: { input: 'text' },
}

/** which entry of `FIELD_INPUT_SPEC` a schema property falls under */
export function inputKindFor(prop: SchemaProperty): string {
  if (prop.enum?.length) return 'enum'
  if (prop.format === 'date-time') return 'datetime'
  if (prop.format === 'uuid' || prop.format === 'uri') return 'relation'
  const type = Array.isArray(prop.type) ? prop.type.find((entry) => entry !== 'null') : prop.type
  return type && type in FIELD_INPUT_SPEC ? type : 'string'
}

/** the input control a schema property asks for */
export function inputTypeFor(prop: SchemaProperty): string {
  return FIELD_INPUT_SPEC[inputKindFor(prop)]?.input ?? 'text'
}
