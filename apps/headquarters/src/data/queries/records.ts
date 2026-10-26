import { cellText } from '@moonwitness/moonui'
import { toPositiveInt, type ModelName } from '@moonwitness/moonql-client'
import { getSchema } from '@/data/schema'
import { serverClient } from '@/data/sdk'
import { searchField, type SelectOption } from '@/data/types'
import { PAGE_SIZE } from '@/lib/env'

/** ceiling for ?pageSize= — the hub caps each model at its own maxLimit anyway */
const MAX_PAGE_SIZE = 200

export interface ListParams {
  q?: string
  page?: number | string
  order?: string
  pageSize?: number | string
}

export interface ListResult {
  rows: Record<string, unknown>[]
  total: number | null
  page: number
  pageSize: number
}

/** one request per page: search + order + pagination ride the same GET */
export async function listRecords(model: ModelName, params: ListParams = {}): Promise<ListResult> {
  // clamped here: a nonsense ?page= must never reach the API as NaN
  const page = toPositiveInt(params.page, 1)
  const pageSize = toPositiveInt(params.pageSize, PAGE_SIZE, MAX_PAGE_SIZE)
  const doc = await getSchema()
  const meta = doc.models[model]!
  const field = searchField(meta)
  const where = params.q && field ? { [field]: { like: params.q } } : undefined

  const result = await serverClient().model(model).list({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    ...(params.order ? { order: params.order } : {}),
    ...(where ? { where } : {}),
    total: true,
  })
  return { rows: result.rows as unknown as Record<string, unknown>[], total: result.total, page, pageSize }
}

export async function getRecord(model: ModelName, id: string): Promise<Record<string, unknown>> {
  return (await serverClient().model(model).get(id)) as unknown as Record<string, unknown>
}

/**
 * Select options for an m2o field. The page size is the relation model's own
 * `maxLimit` (moonql-base caps countries at 300 for exactly this reason), so the
 * number is never re-typed here and cannot silently fall behind the contract.
 */
export async function optionsFor(relationModel: string): Promise<SelectOption[]> {
  const doc = await getSchema()
  const meta = doc.models[relationModel]
  if (!meta) {
    // an empty dropdown used to hide a broken/missing _schema entry: say so
    throw new Error(`headquarters: model "${relationModel}" is not part of the hub schema`)
  }
  if (!meta.operations.list) return []

  const orderField = Object.keys(meta.fields).find((key) => meta.fields[key]?.kind === 'str')
  const page = await serverClient()
    .model(relationModel as ModelName)
    .list({ limit: meta.maxLimit, ...(orderField ? { order: orderField } : {}) })

  return page.rows.map((row) => {
    const record = row as unknown as Record<string, unknown>
    return {
      value: String(record.id ?? ''),
      label: cellText(record) || String(record.id ?? ''),
    }
  })
}
