/**
 * Field descriptors — plain data objects. Runtime carries the constraints;
 * phantom `__*` markers (never assigned) drive TypeScript inference.
 */
export type FieldKind =
  | 'str'
  | 'text'
  | 'int'
  | 'bool'
  | 'ts'
  | 'm2o'
  | 'sel' // enum string
  | 'compute' // read-only runtime field (no column)
  | 'o2m' // virtual one-to-many (no column)

export interface Field<
  K extends FieldKind = FieldKind,
  T = unknown,
  Nullable extends boolean = boolean,
  HasDefault extends boolean = boolean,
> {
  kind: K
  null: boolean
  index: boolean
  unique: boolean
  /** writable, but never serialized in responses */
  private: boolean
  maxLength?: number
  minLength?: number
  format?: string
  /** m2o: target model name; o2m: target model name */
  ref?: string
  /** o2m: foreign key field on the target model */
  fk?: string
  /** sel: allowed choices */
  choices?: readonly string[]
  /** compute: JSON type for the read schema */
  jsonType?: 'string' | 'number' | 'boolean'
  /** compute: source field keys (documentation level) */
  deps?: string[]
  /** compute: persisted as a real column (recomputed on write), filterable */
  store?: boolean
  /** compute: runtime value builder */
  get?: (row: Record<string, unknown>) => unknown
  /** semantic validation beyond AJV; return an error message or null. Method syntax on purpose: a validator may declare the type it expects (`number`) and still be accepted, because AJV has already enforced it. */
  validate?(value: unknown, row: Record<string, unknown>): string | null | undefined
  default?: T
  // phantom markers — inference only, never present at runtime
  __value?: T
  __nullable?: Nullable
  __hasDefault?: HasDefault
}

/**
 * Tipe geser untuk semua descriptor. `unknown` (bukan `any`) di slot nilai adalah
 * yang membuat ini masih *aman*: setiap pembaca harus menyempitkan sendiri, dan
 * inferensi dari descriptor konkret tetap bekerja karena posisi itu kovarian.
 */
export type AnyField = Field<FieldKind, unknown, boolean, boolean>
export type FieldsMap = Record<string, AnyField>

/** kinds that never persist to a column */
export const isVirtualKind = (k: FieldKind) => k === 'compute' || k === 'o2m'

/** does this descriptor become a real DB column? (stored computed yes, o2m/virtual compute no) */
export const hasColumn = (f: AnyField) => (f.kind === 'compute' ? f.store === true : f.kind !== 'o2m')

export interface FieldOpts {
  index?: true
  unique?: true
  null?: true
  private?: true
  validate?(value: unknown, row: Record<string, unknown>): string | null | undefined
}
export interface StrOpts extends FieldOpts {
  maxLength?: number
  minLength?: number
  format?: string
  default?: string
}
export interface TextOpts extends FieldOpts {
  format?: string
  default?: string
}
export interface SelOpts extends FieldOpts {
  default?: string
}
export interface IntOpts extends FieldOpts {
  default?: number
}
export interface BoolOpts extends FieldOpts {
  default?: boolean
}
export interface ComputeOpts {
  type: 'string' | 'number' | 'boolean'
  deps?: string[]
  /** persist as a column and keep it in sync on every write (Odoo store=True) */
  store?: true
  get: (row: Record<string, unknown>) => unknown
}

type IsNull<O> = O extends { null: true } ? true : false
type HasDef<O> = O extends { default: string | number | boolean } ? true : false

function base(opts?: FieldOpts) {
  return {
    null: opts?.null === true,
    index: opts?.index === true,
    unique: opts?.unique === true,
    private: opts?.private === true,
    validate: opts?.validate,
  }
}

export function str<const O extends StrOpts = {}>(opts?: O): Field<'str', string, IsNull<O>, HasDef<O>> {
  return { ...base(opts), kind: 'str', maxLength: opts?.maxLength, minLength: opts?.minLength, format: opts?.format, default: opts?.default }
}

export function text<const O extends TextOpts = {}>(opts?: O): Field<'text', string, IsNull<O>, HasDef<O>> {
  return { ...base(opts), kind: 'text', format: opts?.format, default: opts?.default }
}

/** Enum string field — choices are validated (AJV enum) and typed as a literal union. */
export function sel<const C extends readonly [string, ...string[]], const O extends SelOpts = {}>(
  choices: C,
  opts?: O,
): Field<'sel', C[number], IsNull<O>, HasDef<O>> {
  return { ...base(opts), kind: 'sel', choices, default: opts?.default as C[number] | undefined }
}

export function int<const O extends IntOpts = {}>(opts?: O): Field<'int', number, IsNull<O>, HasDef<O>> {
  return { ...base(opts), kind: 'int', default: opts?.default }
}

export function bool<const O extends BoolOpts = {}>(opts?: O): Field<'bool', boolean, IsNull<O>, HasDef<O>> {
  return { ...base(opts), kind: 'bool', default: opts?.default }
}

/** Timestamp — value is an ISO string, always DB-managed default now(). */
export function ts<const O extends FieldOpts = {}>(opts?: O): Field<'ts', string, IsNull<O>, false> {
  return { ...base(opts), kind: 'ts' }
}

/** Many-to-one reference: a uuid column pointing at another model's id.
 *  Always nullable/optional — a row may exist before its relation is set. */
export function m2o<const O extends FieldOpts = {}>(model: string, opts?: O): Field<'m2o', string, true, false> {
  return { ...base(opts), kind: 'm2o', null: true, ref: model }
}

/** Virtual inverse side: children of `model` whose `fk` field points at this row. */
export function one2many(model: string, fk: string): Field<'o2m', readonly Record<string, unknown>[], true, true> {
  return { kind: 'o2m', null: true, index: false, unique: false, private: false, ref: model, fk }
}

/** Read-only runtime field, built from other values. store:true persists it as a column. */
export function computed<const O extends ComputeOpts>(opts: O): Field<'compute', ReturnType<O['get']>, false, true> {
  return { kind: 'compute', null: false, index: false, unique: false, private: false, jsonType: opts.type, deps: opts.deps, store: opts.store, get: opts.get }
}

// ---- type inference from a fields map ----

export type FieldValue<F extends AnyField> = F extends Field<FieldKind, infer T, infer N, boolean>
  ? true extends N
    ? T | null
    : T
  : never

/** compute/o2m are never part of a create/update payload; nullable/defaults are optional. */
export type FieldOptionalInCreate<F extends AnyField> = F extends Field<infer K, unknown, infer N, infer D>
  ? K extends 'compute' | 'o2m'
    ? true
    : true extends N
      ? true
      : true extends D
        ? true
        : false
  : true

type CreatableKeys<F extends FieldsMap> = {
  [K in keyof F]: F[K] extends Field<'compute' | 'o2m', unknown, boolean, boolean> ? never : K
}[keyof F]

/** Row shape for the descriptor fields only (audit fields added by the model). */
export type PlainRow<F extends FieldsMap> = { [K in keyof F]: FieldValue<F[K]> }

/** Create-input shape: virtual fields dropped, nullable/defaults become optional. */
export type CreateInput<F extends FieldsMap> = {
  [K in CreatableKeys<F> as FieldOptionalInCreate<F[K]> extends true ? never : K]: FieldValue<F[K]>
} & {
  [K in CreatableKeys<F> as FieldOptionalInCreate<F[K]> extends true ? K : never]?: FieldValue<F[K]>
}
