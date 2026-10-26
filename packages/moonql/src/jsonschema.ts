import type { AnyField, FieldKind, FieldsMap } from './fields.js'
import type { CompiledModel } from './registry.js'
import type { ViewAggregate } from './view.js'
import type { Json } from './json.js'

const kindType: Record<FieldKind, Json> = {
  str: { type: 'string' },
  text: { type: 'string' },
  sel: { type: 'string' },
  int: { type: 'integer' },
  bool: { type: 'boolean' },
  ts: { type: 'string', format: 'date-time' },
  m2o: { type: 'string', format: 'uuid' },
  compute: { type: 'string' }, // refined from f.jsonType below
  o2m: { type: 'array' },
}

function property(f: AnyField): Json {
  const base: Json = f.kind === 'compute' && f.jsonType ? { type: f.jsonType } : { ...kindType[f.kind] }
  if (f.kind === 'sel' && f.choices) base.enum = [...f.choices]
  if (f.maxLength !== undefined) base.maxLength = f.maxLength
  if (f.minLength !== undefined) base.minLength = f.minLength
  if (f.format !== undefined && f.kind !== 'sel') base.format = f.format
  // fast-json-stringify needs an explicit nullable union, not just "optional"
  if (f.null) {
    base.type = [base.type as string, 'null']
    if (Array.isArray(base.enum)) base.enum = [...(base.enum as string[]), null]
  }
  return base
}

export interface ModelSchemas {
  /** full read schema: audit + persisted + computed + (later) relation keys */
  read: Json
  /** read schema WITHOUT relation keys — the cycle-free target for expands */
  baseRead: Json
  create: Json
  update: Json
  params: Json
  query: Json
}

/**
 * Descriptor -> validation + serialization JSON Schemas (pass 1: no relations).
 * private fields: writable through the repository, never in a body and never in
 * a read. compute: read only. o2m: skipped entirely here; relations are attached
 * in pass 2 (attachRelations).
 */
export function buildSchemas(fields: FieldsMap, opts?: { maxLimit?: number }): ModelSchemas {
  const keys = Object.keys(fields)
  const persisted = keys.filter((k) => fields[k]!.kind !== 'o2m')
  // A `private` field in a create/update body is a mass-assignment door (set your
  // own passwordHash): only the repository may write those.
  const writable = keys.filter((k) => fields[k]!.kind !== 'compute' && fields[k]!.kind !== 'o2m' && !fields[k]!.private)

  const readProps: Json = { id: { type: 'string', format: 'uuid' } }
  const required: string[] = ['id']
  for (const k of persisted) {
    const f = fields[k]!
    if (f.private) continue
    readProps[k] = property(f)
    required.push(k) // computed values are always present after hydration
  }
  readProps.createdAt = { type: 'string', format: 'date-time' }
  readProps.updatedAt = { type: 'string', format: 'date-time' }
  required.push('createdAt', 'updatedAt')

  const baseRead: Json = { type: 'object', additionalProperties: false, required, properties: readProps }

  const createProps: Json = {}
  const updateProps: Json = {}
  const createRequired: string[] = []
  for (const k of writable) {
    const f = fields[k]!
    const prop = property(f)
    updateProps[k] = prop
    // defaults only on create: AJV useDefaults would silently inject them into PATCH bodies
    const createProp: Json = { ...prop }
    if (f.default !== undefined && !Array.isArray(createProp.type)) createProp.default = f.default
    createProps[k] = createProp
    if (!f.null && f.default === undefined) createRequired.push(k)
  }

  return {
    // deep copy: `read` mutates later with relation keys, `baseRead` stays pure
    read: structuredClone(baseRead),
    baseRead,
    create: { type: 'object', additionalProperties: false, required: createRequired, properties: createProps },
    update: { type: 'object', additionalProperties: false, minProperties: 1, properties: updateProps },
    params: {
      type: 'object',
      additionalProperties: false,
      required: ['id'],
      properties: { id: { type: 'string', format: 'uuid' } },
    },
    query: {
      type: 'object',
      additionalProperties: false,
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: opts?.maxLimit ?? 200, default: opts?.maxLimit ?? 200 },
        offset: { type: 'integer', minimum: 0, default: 0 },
        where: { type: 'string', maxLength: 2000 },
        order: { type: 'string', maxLength: 200 },
        expand: { type: 'string', maxLength: 200 },
        total: { type: 'boolean' },
      },
    },
  }
}

/**
 * Pass 2: after ALL models are compiled, attach relation properties to read
 * schemas referencing OTHER models' *base* schemas (never their expanded read)
 * — so m2o <-> o2m pairs can never form a schema cycle.
 * Expand output keys: m2o 'authorRef' -> 'authorRefRecord' (object|null),
 * o2m 'comments' -> 'comments' (array|null).
 */
export function attachRelations(models: Map<string, CompiledModel>): void {
  for (const model of models.values()) {
    const props = model.read.properties as Json
    for (const [key, f] of Object.entries(model.fields)) {
      if (!f.ref || !models.has(f.ref)) continue
      const target = models.get(f.ref)!
      if (f.kind === 'm2o') {
        // A relation can be absent (no target row, or a caller who may not see
        // it), and a serializer handed a plain `object` schema turns null into
        // `{}` — an empty record, indistinguishable from a real one.
        props[`${key}Record`] = nullableRecord(structuredClone(target.baseRead))
      } else if (f.kind === 'o2m') {
        props[key] = { type: ['array', 'null'], items: structuredClone(target.baseRead) }
      }
    }
  }
}

/** an object schema that also accepts null (a missing expanded relation) */
function nullableRecord(schema: Json): Json {
  return { ...schema, type: ['object', 'null'] }
}

// ---- view schemas ----

/**
 * Output schema for a compiled view: aggregate (group cols + metrics),
 * select-projection (alias props typed from the source), or the source's
 * pure baseRead when no select is given. Expanded relations (`<key>Record`)
 * are declared in every branch — fast-json-stringify drops undeclared keys.
 */
export function buildViewRead(
  source: CompiledModel,
  view: { select?: Record<string, string>; aggregate?: ViewAggregate; expand?: string[] },
  models?: Map<string, CompiledModel>,
): Json {
  // audit columns (createdAt...) exist only on queryable; computed only on fields
  const fieldOf = (name: string): AnyField => source.fields[name] ?? source.queryable[name]!
  const props: Json = {}
  const required: string[] = []

  if (view.aggregate) {
    for (const g of view.aggregate.groupBy) {
      props[g] = property(fieldOf(g))
      required.push(g)
    }
    for (const [alias, m] of Object.entries(view.aggregate.metrics)) {
      // count is always an integer; sum/avg are numbers and avg can be null for
      // an empty group; min/max keep the source type but are nullable too.
      if (m.fn === 'count') props[alias] = { type: 'integer' }
      else if (m.fn === 'sum') props[alias] = { type: 'number' }
      else if (m.fn === 'avg') props[alias] = { type: ['number', 'null'] }
      else {
        const base = property(fieldOf(m.field)!)
        // min/max are NULL for an empty group: widen the source type, but only
        // when the source actually declares one.
        props[alias] =
          base.type === undefined
            ? base
            : { ...base, type: [...new Set([...(Array.isArray(base.type) ? base.type : [base.type]), 'null'])] }
      }
      required.push(alias)
    }
  } else if (view.select) {
    for (const [alias, src] of Object.entries(view.select)) props[alias] = property(fieldOf(src))
    required.push(...Object.keys(view.select))
  } else {
    const keys = Object.keys(source.fields).filter((k) => !source.fields[k]!.private && source.fields[k]!.kind !== 'o2m')
    props.id = { type: 'string', format: 'uuid' }
    for (const k of keys) props[k] = property(source.fields[k]!)
    props.createdAt = { type: 'string', format: 'date-time' }
    props.updatedAt = { type: 'string', format: 'date-time' }
    required.push('id', ...keys, 'createdAt', 'updatedAt')
  }

  // relation joins: declared (never required) so the serializer keeps them
  for (const k of view.expand ?? []) {
    const target = models?.get(source.fields[k]?.ref ?? '')
    if (target) props[`${k}Record`] = nullableRecord(structuredClone(target.baseRead))
  }

  return { type: 'object', additionalProperties: false, required, properties: props }
}

export function buildViewQuery(limit: number): Json {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: limit },
      offset: { type: 'integer', minimum: 0, default: 0 },
      order: { type: 'string', maxLength: 200 },
      total: { type: 'boolean' },
    },
  }
}
