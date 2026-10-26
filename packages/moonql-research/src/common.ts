import type { EndpointCtx } from '@moonwitness/moonql'
import { badRequest, forbidden, notFound } from '@moonwitness/core'
import { isSha256, nonEmpty } from './gates.js'

export type Row = Record<string, unknown>
export type Orm = EndpointCtx['orm']
export type Repo = {
  list(query?: Record<string, unknown>): Promise<Row[]>
  create(data: Row): Promise<Row>
  update(id: string, patch: Row): Promise<Row>
}
export type ModelOrm = { model(name: string): Repo }

export const repo = (orm: Orm | ModelOrm, name: string): Repo => (orm as ModelOrm).model(name)

export const listAll = async (orm: Orm | ModelOrm, name: string, limit = 5000): Promise<Row[]> =>
  await repo(orm, name).list({ limit })

export const requireText = (row: Row, keys: readonly string[], what: string): void => {
  const missing = keys.filter((key) => !nonEmpty(row[key]))
  if (missing.length) throw badRequest(`${what} requires ${missing.join(', ')}`)
}

export const rejectBlank = (patch: Row, keys: readonly string[], what: string): void => {
  for (const key of keys) {
    if (key in patch && patch[key] !== undefined && !nonEmpty(patch[key])) {
      throw badRequest(`${what} cannot blank ${key}`)
    }
  }
}

export const assertSha = (value: unknown, what: string): void => {
  if (!isSha256(value)) throw badRequest(`${what} needs an exact 64-hex SHA-256 digest`)
}

export const checkInt = (row: Row, key: string, min: number, max: number, what: string): void => {
  const value = row[key]
  if (value === undefined) return
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw badRequest(`${what} ${key} must be an integer from ${min} to ${max}`)
  }
}

export const sameId = (left: unknown, right: unknown): boolean => String(left) === String(right)

export async function findCase(orm: Orm | ModelOrm, code: string): Promise<Row> {
  const rows = await listAll(orm, 'research_cases')
  const row = rows.find((entry) => entry.caseCode === code)
  if (!row) throw notFound(`research case "${code}" not found`)
  return row
}

export async function findCode(
  orm: Orm | ModelOrm,
  model: string,
  field: string,
  code: string,
  what: string,
): Promise<Row> {
  const rows = await listAll(orm, model)
  const row = rows.find((entry) => entry[field] === code)
  if (!row) throw notFound(`${what} "${code}" not found`)
  return row
}

export async function rowById(orm: Orm | ModelOrm, model: string, id: unknown, what: string): Promise<Row> {
  const row = (await listAll(orm, model)).find((entry) => sameId(entry.id, id))
  if (!row) throw notFound(`${what} not found`)
  return row
}

export type HumanActor = { id: string; name: string; role: string }

export async function humanActor(user: EndpointCtx['user'], orm: Orm | ModelOrm): Promise<HumanActor> {
  if (!user) throw forbidden('a named authenticated human is required')
  const rows = await listAll(orm, 'auth_users')
  const row = rows.find((entry) => sameId(entry.id, user.id))
  const name = nonEmpty(row?.displayName)
  const role = String(row?.role ?? '')
  const roles = (user.roles ?? []).map(String)
  if (!name) throw forbidden('the acting account has no display name; machines cannot review research')
  if (role === 'guest' || !roles.some((entry) => entry === 'admin' || entry === 'user')) {
    throw forbidden('guest or anonymous accounts cannot transition research reviews')
  }
  if (role !== 'admin' && role !== 'user') {
    throw forbidden('the acting account has no review-capable role')
  }
  return { id: String(user.id), name, role }
}
