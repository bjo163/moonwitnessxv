import { eq } from 'drizzle-orm'
import type { AnyPgTable } from 'drizzle-orm/pg-core'
import type { MoonQl } from './client.js'

/**
 * The convention every moonql table follows: string uuid `id` +
 * `updatedAt` maintained automatically on update.
 */
export interface CrudRow {
  id: string
  updatedAt?: string
}

const stripUndefined = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

/**
 * Generic single-table CRUD — so per-entity repos never repeat
 * select/insert/update/delete boilerplate or fight drizzle generics.
 * All loose typing is contained HERE, once; callers bind their row type.
 */
export function createCrud<T extends CrudRow>(db: MoonQl['db'], table: AnyPgTable) {
  // Convention: every moonql table has an `id` column (see CrudRow).
  const idCol = (table as unknown as { id: unknown }).id

  return {
    async list(): Promise<T[]> {
      return (await db.select().from(table)) as T[]
    },
    async find(id: string): Promise<T | null> {
      const rows = (await db.select().from(table).where(eq(idCol as never, id))) as T[]
      return rows[0] ?? null
    },
    async create(values: Record<string, unknown>): Promise<T> {
      const rows = (await db
        .insert(table)
        .values(stripUndefined(values) as never)
        .returning()) as unknown as T[]
      return rows[0] as T
    },
    async update(id: string, patch: Record<string, unknown>): Promise<T | null> {
      const rows = (await db
        .update(table)
        .set({ ...stripUndefined(patch), updatedAt: new Date().toISOString() } as never)
        .where(eq(idCol as never, id))
        .returning()) as T[]
      return rows[0] ?? null
    },
    async remove(id: string): Promise<boolean> {
      const rows = await db.delete(table).where(eq(idCol as never, id)).returning({ id: idCol as never })
      return rows.length > 0
    },
  }
}
