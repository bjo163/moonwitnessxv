// @moonwitness/moonql — the Odoo-style declarative ORM of the monorepo.
// Addons (packages/moonql-*) declare models with plain descriptors; moonql
// derives tables, repositories, validation/serialization schemas, hooks,
// auto-REST CRUD, domain queries, ACL and custom endpoints.
// Apps never import drizzle-orm / postgres / fastify-typed routes for data.

// declaration primitives
export { str, text, int, bool, ts, m2o, sel, computed, one2many } from './fields.js'
export { ADMIN_ONLY, ADMIN_WRITE, ADMIN_FULL } from './model.js'
export {
  defineModel,
  type ModelDef,
  type Model,
  type AnyModel,
  type RestOps,
  type RestOp,
  type AclRule,
  type AclSpec,
  type AclRowSpec,
  type AuditFields,
  type MenuSpec,
  type SeedCtx,
  type DataSpec,
  type DataCtx,
  type CompiledData,
  type RowOf,
  type CreateOf,
} from './model.js'
export {
  defineAddon,
  type AddonDef,
  type Addon,
  type AnyAddon,
  type HookEvent,
  type ModelHooks,
  type HooksMap,
  type InferModel,
  type EndpointDef,
  type EndpointCtx,
  type ProvideCtx,
  type RequestLike,
  type User,
  type UserResolver,
  type UserResolverFactory,
  type CronDef,
} from './addon.js'
export { defineView, type View, type ViewDef, type ViewAggregate } from './view.js'

// runtime
export { bootMoonQl, MIN_DEMO_ROWS, type MoonQlOptions, type MoonQlInstance } from './boot.js'
export { createBus, BUS_EVENTS, type MoonBus, type BusEvent, type BusPayloads } from './bus.js'
export { busStream, type BusStreamOptions, type BusFrame } from './stream.js'
export { moonqlRest, type MoonqlRestOptions } from './rest.js'
export { installAddons, type MoonRegistry, type CompiledModel, type CompiledEndpoint, type CompiledView } from './registry.js'
export { ModelRepo, type RepoQuery } from './repository.js'
export { checkAcl, allowsAcl, resolveAcl, type ResolvedAcl } from './acl.js'
export { buildSchemaDocument, type SchemaDocumentOptions } from './introspect.js'
export { classifySchema, gateDecision, parseVersion, type SchemaDiff, type GateDecision, type ParsedVersion } from './schema-diff.js'
export { generateClientSource } from './codegen.js'
export { startCrons, parseEvery, type CronHandle } from './crons.js'
export { parseRef, defaultRefField, createRefResolver, REF_RE, type RefTarget, type RefResolver, type RefModelInfo } from './refs.js'
export { syncModelData, type SyncResult } from './datasync.js'
export { autoSync } from './sync.js'
export { buildTable, columnName, createdAtIndexName, modelledIndexName, hasPartialUnique } from './table.js'
export { uniqueIndexDdl } from './sync.js'
export { buildColumnLookup, toIsoTimestamp, translateDomain, orderTermsFor, sqlText } from './engines/pg.js'
export { createMemoryEngine } from './engines/memory.js'
export { createPgEngine } from './engines/pg.js'
export { buildSchemas, attachRelations, type ModelSchemas } from './jsonschema.js'
export {
  normalizeWhere,
  normalizeOrder,
  matchesDomain,
  likePattern,
  type Domain,
  type Op,
  type OrderTerm,
  type Term,
} from './domain.js'
export type { MoonEngine, ListOptions, Row, CompiledMetric, AggregateQuery } from './engines/engine.js'
export type { Field, AnyField, FieldsMap, FieldKind, PlainRow, CreateInput } from './fields.js'

// legacy pg escape hatch (still available for handwritten needs)
export { createMoonQl, runMigrations, type MoonQl } from './client.js'
export type { Log } from './log.js'
export type { Json } from './json.js'
