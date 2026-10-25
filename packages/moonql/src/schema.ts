import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

/**
 * @deprecated legacy static table kept only so `drizzle-kit generate/push`
 * snapshots still work. The real schema source is now addon descriptors
 * (defineModel) compiled by the registry at runtime.
 */
export const stations = pgTable('stations', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  streamUrl: text('stream_url').notNull(),
  genre: varchar('genre', { length: 60 }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
})
