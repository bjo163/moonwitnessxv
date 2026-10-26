import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

const skylink = pgSchema('skylink')

export const channelAccounts = skylink.table(
  'channel_accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    provider: varchar('provider', { length: 32 }).notNull(),
    externalAccountId: varchar('external_account_id', { length: 255 }).notNull(),
    displayName: varchar('display_name', { length: 160 }),
    authRef: varchar('auth_ref', { length: 512 }).notNull(),
    status: varchar('status', { length: 24 }).notNull().default('disconnected'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('channel_accounts_provider_external_unique').on(table.provider, table.externalAccountId),
    check('channel_accounts_status_check', sql`${table.status} in ('disconnected', 'pairing', 'connected', 'disabled')`),
  ],
)

export const conversations = skylink.table(
  'conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    channelAccountId: uuid('channel_account_id')
      .notNull()
      .references(() => channelAccounts.id, { onDelete: 'cascade' }),
    externalId: varchar('external_id', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }),
    status: varchar('status', { length: 24 }).notNull().default('open'),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('conversations_account_external_unique').on(table.channelAccountId, table.externalId),
    index('conversations_account_recent_idx').on(table.channelAccountId, table.createdAt, table.id),
    check('conversations_status_check', sql`${table.status} in ('open', 'closed', 'archived')`),
  ],
)

export const messages = skylink.table(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    externalMessageId: varchar('external_message_id', { length: 255 }),
    direction: varchar('direction', { length: 12 }).notNull(),
    senderId: varchar('sender_id', { length: 255 }),
    body: text('body').notNull(),
    status: varchar('status', { length: 24 }).notNull().default('received'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('messages_conversation_external_unique')
      .on(table.conversationId, table.externalMessageId)
      .where(sql`${table.externalMessageId} is not null`),
    index('messages_conversation_recent_idx').on(table.conversationId, table.createdAt, table.id),
    check('messages_direction_check', sql`${table.direction} in ('inbound', 'outbound')`),
    check('messages_status_check', sql`${table.status} in ('received', 'pending', 'accepted', 'delivered', 'failed')`),
  ],
)

export const deliveryAttempts = skylink.table(
  'delivery_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    attemptNumber: integer('attempt_number').notNull(),
    status: varchar('status', { length: 24 }).notNull(),
    providerMessageId: varchar('provider_message_id', { length: 255 }),
    errorCode: varchar('error_code', { length: 100 }),
    errorSummary: varchar('error_summary', { length: 500 }),
    attemptedAt: timestamp('attempted_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('delivery_attempts_message_number_unique').on(table.messageId, table.attemptNumber),
    index('delivery_attempts_recent_idx').on(table.messageId, table.attemptedAt, table.id),
    check('delivery_attempts_number_positive_check', sql`${table.attemptNumber} > 0`),
    check('delivery_attempts_status_check', sql`${table.status} in ('pending', 'accepted', 'delivered', 'failed', 'rejected')`),
  ],
)

export const skylinkSchema = { channelAccounts, conversations, messages, deliveryAttempts }
