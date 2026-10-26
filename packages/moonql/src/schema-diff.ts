import type { SchemaDocument } from '@moonwitness/core'

/**
 * Contract-change classifier — the difference between "the schema text changed" and
 * "a caller broke".
 *
 * `gen:sdk:check` could only fail on any byte difference, which makes adding a
 * nullable view look as dangerous as deleting a field; the honest response then is
 * to regenerate blindly. Grouping the difference lets the gate demand a major version
 * bump only for the changes that actually break someone, and say what it found.
 */

export interface SchemaDiff {
  /** a caller written against `prev` stops working against `next` */
  breaking: string[]
  /** safe for existing callers: new surface only */
  added: string[]
  removed: string[]
  /** changed in a way that is neither provably safe nor provably breaking */
  changed: string[]
}

export interface GateDecision extends SchemaDiff {
  ok: boolean
  reason: string
}

export interface ParsedVersion {
  major: number
  minor: number
  patch: number
}

export function parseVersion(value: unknown): ParsedVersion | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(String(value ?? ''))
  if (!match) return null
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) }
}

/** the subset of a published field descriptor this classifier reads */
interface FieldShape {
  type?: string | string[]
  nullable?: boolean
  enum?: unknown[]
  maxLength?: number
}

interface ObjectSchemaShape {
  required?: string[]
  properties?: Record<string, FieldShape>
}

/** the subset of a published model/view document this classifier reads */
interface ModelShape {
  fields?: Record<string, FieldShape>
  createSchema?: ObjectSchemaShape
  updateSchema?: ObjectSchemaShape
  readSchema?: ObjectSchemaShape
  acl?: unknown
}

/** the JSON Schema type of a property, with `null` from a nullable union removed */
const baseType = (schema: FieldShape | undefined): string | undefined =>
  schema === undefined ? undefined : Array.isArray(schema.type) ? schema.type.filter((t) => t !== 'null').join('|') : schema.type

/** every difference that makes an existing caller's payload or reader fail */
function diffFieldShapes(a: Record<string, FieldShape> | undefined, b: Record<string, FieldShape> | undefined): string[] {
  const out: string[] = []
  for (const [name, before] of Object.entries(a ?? {})) {
    const after = b?.[name]
    if (after === undefined) {
      out.push(`removed field "${name}"`)
      continue
    }
    if (baseType(before) !== baseType(after)) out.push(`field "${name}" changed type ${baseType(before)} -> ${baseType(after)}`)
    if (before?.nullable === true && after?.nullable !== true) out.push(`field "${name}" became non-null`)
    const beforeEnum = before.enum
    const afterEnum = after.enum
    if (Array.isArray(beforeEnum) && Array.isArray(afterEnum)) {
      const lost = beforeEnum.filter((value: unknown) => !afterEnum.includes(value))
      if (lost.length) out.push(`field "${name}" no longer accepts ${lost.map((value: unknown) => JSON.stringify(value)).join(', ')}`)
    }
    if (typeof before?.maxLength === 'number' && typeof after?.maxLength === 'number' && after.maxLength < before.maxLength) {
      out.push(`field "${name}" shrank to ${after.maxLength} chars`)
    }
  }
  return out
}

/** keys a create/update schema newly demands: an existing payload starts failing */
function newlyRequired(before: { required?: string[] } | undefined, after: { required?: string[] } | undefined): string[] {
  const had = new Set(before?.required ?? [])
  return (after?.required ?? []).filter((key) => !had.has(key))
}

const isPublic = (acl: unknown): boolean => acl === undefined || acl === 'public'

/**
 * A model publishes one rule per operation (`{ list, get, create, ... }`), a view or
 * an endpoint publishes a single rule. Both shapes arrive here, because a caller that
 * stops getting an answer does not care which shape the metadata happened to use.
 */
function aclRules(spec: unknown): Record<string, unknown> {
  if (spec === undefined || spec === null) return {}
  if (typeof spec === 'string' || Array.isArray(spec)) return { read: spec }
  return spec as Record<string, unknown>
}

/**
 * Compare two `_schema` documents: the committed contract and the one the code would
 * produce now. Only `prev` drives removals — a new name is additive by definition.
 */
export function classifySchema(prev: SchemaDocument, next: SchemaDocument): SchemaDiff {
  const breaking: string[] = []
  const added: string[] = []
  const removed: string[] = []
  const changed: string[] = []

  for (const kind of ['models', 'views'] as const) {
    const beforeAll = (prev as unknown as Record<typeof kind, Record<string, ModelShape>>)[kind] ?? {}
    const afterAll = (next as unknown as Record<typeof kind, Record<string, ModelShape>>)[kind] ?? {}

    for (const name of Object.keys(beforeAll)) {
      if (!(name in afterAll)) {
        breaking.push(`${kind}: ${name} removed`)
        removed.push(`${kind}.${name}`)
      }
    }

    for (const name of Object.keys(afterAll)) {
      const before = beforeAll[name]
      const after = afterAll[name]
      if (before === undefined) {
        added.push(`${kind}: ${name} added`)
        continue
      }
      breaking.push(...diffFieldShapes(before?.fields, after?.fields).map((line) => `${kind}: ${name} ${line}`))
      breaking.push(...diffFieldShapes(before?.readSchema?.properties, after?.readSchema?.properties).map((line) => `${kind}: ${name} reads ${line}`))
      for (const op of ['create', 'update'] as const) {
        const gained = newlyRequired(
          op === 'create' ? before?.createSchema : before?.updateSchema,
          op === 'create' ? after?.createSchema : after?.updateSchema,
        )
        if (gained.length) breaking.push(`${kind}: ${name} now requires ${gained.join(', ')} on ${op}`)
      }
      for (const [op, beforeRule] of Object.entries(aclRules(before?.acl))) {
        const afterRules = aclRules(after?.acl)
        if (!(op in afterRules)) {
          // the rule disappeared: 'none' means the route is gone, and anything else
          // means it fell back to whatever the model defaults to — both are surprises
          breaking.push(`${kind}: ${name} lost its ${op} acl rule`)
        } else if (isPublic(beforeRule) && !isPublic(afterRules[op])) {
          breaking.push(`${kind}: ${name} ${op} is no longer public`)
        } else if (JSON.stringify(beforeRule) !== JSON.stringify(afterRules[op])) {
          changed.push(`${kind}.${name} ${op} acl`)
        }
      }
      for (const op of Object.keys(aclRules(after?.acl))) {
        if (!(op in aclRules(before?.acl))) changed.push(`${kind}.${name} ${op} acl added`)
      }
    }
  }

  const pathOf = (e: { method: string; path: string }): string => `${e.method} ${e.path}`
  const beforePaths = new Set((prev.endpoints ?? []).map(pathOf))
  const afterPaths = new Set((next.endpoints ?? []).map(pathOf))
  for (const path of beforePaths) if (!afterPaths.has(path)) breaking.push(`endpoint: ${path} removed`)
  for (const path of afterPaths) if (!beforePaths.has(path)) added.push(`endpoint: ${path}`)
  // an endpoint that stayed but stopped answering anonymous callers
  for (const endpoint of prev.endpoints ?? []) {
    const same = (next.endpoints ?? []).find((e) => pathOf(e) === pathOf(endpoint))
    if (same && isPublic(endpoint.acl) && !isPublic(same.acl)) breaking.push(`endpoint: ${pathOf(endpoint)} is no longer public`)
  }

  return { breaking, added, removed, changed }
}

/**
 * The gate: additive work is free; anything breaking has to be paid for with a
 * higher major in the advertised `apiVersion`. A version that cannot be parsed is
 * refused rather than guessed — an unclassifiable change must not pass silently.
 */
export function gateDecision(prev: SchemaDocument, next: SchemaDocument): GateDecision {
  const result = classifySchema(prev, next)
  if (result.breaking.length === 0) return { ...result, ok: true, reason: 'no breaking change' }

  const before = parseVersion(prev.apiVersion)
  const after = parseVersion(next.apiVersion)
  if (!before || !after) {
    return { ...result, ok: false, reason: `apiVersion is missing or unparseable ("${next.apiVersion}"), so a breaking change cannot be classified` }
  }
  if (after.major > before.major) {
    return { ...result, ok: true, reason: `breaking change accepted: major ${before.major} -> ${after.major}` }
  }
  return { ...result, ok: false, reason: `breaking change with apiVersion ${next.apiVersion} (was ${prev.apiVersion}) — raise the major, or revert` }
}
