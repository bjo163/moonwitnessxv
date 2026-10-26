import { fileURLToPath } from 'node:url'
import postgres, { type Sql } from 'postgres'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { skylinkSchema } from './schema.js'

const MIGRATIONS_FOLDER = fileURLToPath(new URL('../migrations', import.meta.url))

export type SkylinkDatabase = PostgresJsDatabase<typeof skylinkSchema>

export interface SkylinkStore {
  db: SkylinkDatabase
  client: Sql
}

export function createSkylinkStore(databaseUrl: string): SkylinkStore {
  const client = postgres(databaseUrl, { max: 5 })
  return { db: drizzle(client, { schema: skylinkSchema }), client }
}

/** Apply this package's migrations and keep the migration ledger inside its schema. */
export async function migrateSkylinkStore(store: SkylinkStore): Promise<void> {
  await store.client`CREATE SCHEMA IF NOT EXISTS "skylink"`
  await migrate(store.db, {
    migrationsFolder: MIGRATIONS_FOLDER,
    migrationsSchema: 'skylink',
    migrationsTable: '__drizzle_migrations',
  })
}

/** Roll back only the schema owned by this package. */
export async function dropSkylinkSchema(client: Sql): Promise<void> {
  await client`DROP SCHEMA IF EXISTS "skylink" CASCADE`
}
