import type { ModelMeta, JsonSchema, SchemaDocument } from '@moonwitness/moonql-client'

// The screen-shape derivation (table columns, search field, form fields) lives in
// @moonwitness/moonql-client so Headquarters, Moonql Studio and any future
// surface share one implementation. Re-exported here keeps every existing
// `@/data/types` import inside the app working unchanged.
export { tableColumns, searchField, formFields } from '@moonwitness/moonql-client'
export type { TableColumn, FormFieldSpec } from '@moonwitness/moonql-client'

export interface SessionUser {
  id: string
  login: string
  displayName: string
  email?: string | null
  role: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface AuditEntryRow {
  id: string
  model: string
  action: string
  recordId: string
  summary?: string | null
  createdAt: string
}

export interface JobRunRow {
  id: string
  job: string
  status: string
  durationMs: number
  detail?: string | null
  createdAt: string
}

export interface OpsDashboard {
  engine: 'pg' | 'memory'
  startedAt: string
  uptimeSec: number
  minDemoRows: number
  addons: { name: string; version: string; depends: string[] }[]
  busEvents: string[]
  models: Array<{
    name: string
    label: string
    addon: string
    dataTier: string
    count: number
    rest: Record<string, boolean | undefined>
    delete: 'soft' | 'hard'
  }>
  views: Array<{ key: string; label: string; addon: string; from: string; aggregate: boolean; acl: string | string[] }>
  crons: Array<{ addon: string; name: string; every: string | number; lastRun: string | null }>
  audit: AuditEntryRow[]
  jobs: JobRunRow[]
}

/** narrow a JSON Schema to the object shape the forms need (one place, reused) */
export type SchemaObject = { properties?: Record<string, JsonSchema>; required?: string[] }

export type { ModelMeta, SchemaDocument }
