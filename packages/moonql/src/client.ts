import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import * as schema from './schema.js'

/**
 * createMoonQl — the ONLY way to open a database connection in this monorepo.
 * One pool, one typed drizzle client, schema bound.
 */
export function createMoonQl(databaseUrl: string) {
  const client = postgres(databaseUrl, { max: 5 })
  return { db: drizzle(client, { schema }), client }
}

export type MoonQl = ReturnType<typeof createMoonQl>

// src/../migrations and dist/../migrations both land on packages/moonql/migrations.
const MIGRATIONS_FOLDER = fileURLToPath(new URL('../migrations', import.meta.url))

/** Apply all generated migrations (idempotent, tracked in __drizzle_migrations). */
export async function runMigrations(mq: MoonQl): Promise<void> {
  await migrate(mq.db, { migrationsFolder: MIGRATIONS_FOLDER })
}
