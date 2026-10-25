// @moonwitness/moonql-client — the typed SDK over the moonql REST contract.
// `generated.ts` is produced by `pnpm gen:sdk` from the registry (`/_schema`);
// the runtime is dependency-free (only the shared envelope/types from core).
export { MoonApiError } from './errors.js'
export { displayLabel, cellText } from './display.js'
export { toPositiveInt, toOffset } from './paging.js'
export { okJson, failJson, errorMessage, type RespondInit } from './respond.js'
export { can, type AclUser, type CrudOp } from './acl.js'
export {
  tableColumns,
  searchField,
  formFields,
  type TableColumn,
  type FormFieldSpec,
} from './ui-meta.js'
export { createMoonClient } from './client.js'
export { apiBaseUrl, createServerSdk, sameOriginSdk, openLiveStream, type LiveStreamOptions } from './web.js'
export { schemaDrift, describeDrift, type SchemaDigest, type SchemaDrift } from './compat.js'
export { SCHEMA_HASH } from './generated.js'
export type {
  CallOptions,
  HttpMethod,
  ListOptions,
  ModelApi,
  MoonClient,
  MoonClientOptions,
  Page,
  QueryInit,
  StreamOptions,
} from './client.js'
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
} from './schema.js'
export * from './generated.js'
