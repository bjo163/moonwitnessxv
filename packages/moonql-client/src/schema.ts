/**
 * The `/_schema` shape lives in `@moonwitness/core` — the same definition moonql's
 * introspect uses, so the client can never drift from the server contract.
 */
export type {
  DataTier,
  EndpointMeta,
  FieldMeta,
  JsonSchema,
  MenuItem,
  MenuMeta,
  ModelMeta,
  SchemaDocument,
  ViewMeta,
} from '@moonwitness/core'
