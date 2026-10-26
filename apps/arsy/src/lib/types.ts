import type { FastifyPluginAsync, RawServerDefault } from 'fastify'
import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'

/**
 * The ONE module signature for the whole app: route handlers get
 * `request.body / params / query` typed directly from their JSON Schema —
 * casting is banned by convention (and by the compiler).
 */
export type TypedModule = FastifyPluginAsync<Record<string, never>, RawServerDefault, JsonSchemaToTsProvider>
