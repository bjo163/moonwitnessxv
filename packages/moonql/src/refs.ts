import { httpError } from '@moonwitness/core'
import type { MoonEngine, Row } from './engines/engine.js'

/**
 * Declarative cross-model references: the string '@model[.field]:value'
 * inside a data/seed row resolves to the id of the matching row.
 * Default field = the target model's first single-column unique
 * (code on base models, name on stations...).
 */
export const REF_RE = /^@([a-z_][a-z0-9_]*)(?:\.([a-z_][a-z0-9_]*))?:([^\n]+)$/

export interface RefTarget {
  model: string
  field?: string
  value: string
}

export function parseRef(v: unknown): RefTarget | null {
  if (typeof v !== 'string' || !v.startsWith('@')) return null
  const m = REF_RE.exec(v)
  if (!m) return null
  return { model: m[1]!, field: m[2], value: m[3]!.trim() }
}

/**
 * Is this string an *attempt* at a reference, rather than ordinary data that
 * happens to start with '@'?
 *
 * Catalog content is full of handles and profile URLs ('@witness.id',
 * 'tiktok.com/@witness.id/video/1'), and reading every '@' as a reference made the
 * hub refuse to boot over one string in someone's seed row. The intent is knowable
 * where the models are: '@tags' is a broken reference exactly when a model named
 * `tags` is installed — a handle that names no model is data.
 */
export function looksLikeRefAttempt(v: unknown, knownModels: { has(name: string): boolean }): boolean {
  if (typeof v !== 'string' || !v.startsWith('@')) return false
  const head = v.slice(1).split(':')[0] ?? ''
  const m = /^([a-z_][a-z0-9_]*)(?:\.[a-z_][a-z0-9_]*)?$/.exec(head)
  return m !== null && knownModels.has(m[1]!)
}

export function refHeadModel(v: unknown): string | null {
  if (typeof v !== 'string' || !v.startsWith('@')) return null
  const head = v.slice(1).split(':')[0] ?? ''
  const m = /^([a-z_][a-z0-9_]*)(?:\.[a-z_][a-z0-9_]*)?$/.exec(head)
  return m ? m[1]! : null
}

export function defaultRefField(unique: string[][], model: string): string {
  const single = unique.find((pair) => pair.length === 1)
  if (!single?.[0]) throw httpError(500, `moonql: reference target "${model}" has no single-column unique key — use @model.field:value`)
  return single[0]
}

export interface RefModelInfo {
  name: string
  unique: string[][]
  engine: MoonEngine
}

/**
 * Boot-scoped resolver: the first lookup on a (model, field) pair builds a
 * value→id index with ONE engine pass; everything after is free.
 */
export function createRefResolver(getModel: (name: string) => RefModelInfo | null) {
  const indexes = new Map<string, Promise<Map<string, string>>>()

  const indexFor = (model: RefModelInfo, field: string): Promise<Map<string, string>> => {
    const key = `${model.name}.${field}`
    let idx = indexes.get(key)
    if (!idx) {
      idx = model.engine
        .list({ limit: 100_000, offset: 0 })
        .then((rows: Row[]) => {
          const map = new Map<string, string>()
          for (const r of rows) {
            const v = r[field]
            if (v !== undefined && v !== null) map.set(String(v), String(r.id))
          }
          return map
        })
      indexes.set(key, idx)
    }
    return idx
  }

  return {
    /**
     * strict (reference tier): an unresolved ref is a packaging bug -> 500.
     * lenient (demo seed tier): the row keeps null + a warn, so addons stay
     * installable standalone.
     */
    async resolve(ref: string, strict: boolean, warn?: (msg: string) => void): Promise<string | null> {
      const target = parseRef(ref)
      if (!target) {
        // an '@name' that names a real model is a typo'd reference, not content:
        // strict tier dies, the lenient tier warns and the row keeps its literal
        const head = refHeadModel(ref)
        if (head && getModel(head)) {
          if (strict) throw httpError(500, `moonql: malformed reference "${ref}" — expected @model[.field]:value`)
          warn?.(`moonql: malformed reference "${ref}" — kept as plain text`)
        }
        return null
      }
      const model = getModel(target.model)
      if (!model) {
        if (strict) throw httpError(500, `moonql: reference "${ref}" targets unknown model "${target.model}"`)
        warn?.(`moonql: unresolved reference "${ref}" (unknown model) — stored as null`)
        return null
      }
      let field: string
      if (target.field) field = target.field
      else {
        try {
          field = defaultRefField(model.unique, model.name)
        } catch (err) {
          // Lenient mode promises "the addon still installs": a target without a
          // natural key is warned about, not fatal.
          if (strict) throw err
          warn?.((err as Error).message)
          return null
        }
      }
      const map = await indexFor(model, field)
      const id = map.get(target.value)
      if (id) return id
      if (strict) throw httpError(500, `moonql: unresolved reference "${ref}" — no ${target.model} row with ${field}="${target.value}"`)
      warn?.(`moonql: unresolved reference "${ref}" — stored as null (install its addon or seed it first?)`)
      return null
    },

    /** deep-replace every '@ref' string in row objects (shallow per level, rows are flat) */
    async walk(rows: Array<Record<string, unknown>>, strict: boolean, warn?: (msg: string) => void): Promise<Row[]> {
      const out: Row[] = []
      for (const row of rows) {
        const clone: Row = {}
        for (const [k, v] of Object.entries(row)) {
          // only an '@' string that parses as a reference is replaced; a social
          // handle stays exactly what the author wrote
          clone[k] = typeof v === 'string' && parseRef(v) ? await this.resolve(v, strict, warn) : v
        }
        out.push(clone)
      }
      return out
    },
  }
}

export type RefResolver = ReturnType<typeof createRefResolver>
