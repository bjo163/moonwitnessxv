import { and, desc, eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { SkylinkDatabase } from './client.js'
import { channelAccounts, conversations, deliveryAttempts, messages } from './schema.js'

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

function pageSize(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    throw new RangeError(`limit must be an integer from 1 to ${MAX_PAGE_SIZE}`)
  }
  return limit
}

export type ChannelAccount = InferSelectModel<typeof channelAccounts>
export type Conversation = InferSelectModel<typeof conversations>
export type Message = InferSelectModel<typeof messages>
export type DeliveryAttempt = InferSelectModel<typeof deliveryAttempts>

export type NewChannelAccount = Pick<
  InferInsertModel<typeof channelAccounts>,
  'provider' | 'externalAccountId' | 'authRef'
> & Partial<Pick<InferInsertModel<typeof channelAccounts>, 'displayName' | 'status'>>

export type NewConversation = Pick<InferInsertModel<typeof conversations>, 'channelAccountId' | 'externalId'> &
  Partial<Pick<InferInsertModel<typeof conversations>, 'title' | 'status'>>

export type NewMessage = Pick<
  InferInsertModel<typeof messages>,
  'conversationId' | 'direction' | 'body'
> & Partial<Pick<InferInsertModel<typeof messages>, 'externalMessageId' | 'senderId' | 'status'>>

export type NewDeliveryAttempt = Pick<
  InferInsertModel<typeof deliveryAttempts>,
  'messageId' | 'attemptNumber' | 'status'
> & Partial<Pick<InferInsertModel<typeof deliveryAttempts>, 'providerMessageId' | 'errorCode' | 'errorSummary'>>

export async function createChannelAccount(db: SkylinkDatabase, input: NewChannelAccount): Promise<ChannelAccount> {
  const [row] = await db.insert(channelAccounts).values(input).returning()
  if (!row) throw new Error('Failed to create channel account')
  return row
}

export async function findChannelAccount(
  db: SkylinkDatabase,
  provider: string,
  externalAccountId: string,
): Promise<ChannelAccount | null> {
  const [row] = await db.select().from(channelAccounts)
    .where(and(eq(channelAccounts.provider, provider), eq(channelAccounts.externalAccountId, externalAccountId)))
    .limit(1)
  return row ?? null
}

export async function createConversation(db: SkylinkDatabase, input: NewConversation): Promise<Conversation> {
  const [row] = await db.insert(conversations).values(input).returning()
  if (!row) throw new Error('Failed to create conversation')
  return row
}

export async function findConversation(
  db: SkylinkDatabase,
  channelAccountId: string,
  externalId: string,
): Promise<Conversation | null> {
  const [row] = await db.select().from(conversations)
    .where(and(eq(conversations.channelAccountId, channelAccountId), eq(conversations.externalId, externalId)))
    .limit(1)
  return row ?? null
}

export async function appendMessage(db: SkylinkDatabase, input: NewMessage): Promise<Message> {
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(messages).values(input).returning()
    if (!row) throw new Error('Failed to append message')
    await tx
      .update(conversations)
      .set({ lastMessageAt: row.createdAt, updatedAt: row.createdAt })
      .where(eq(conversations.id, row.conversationId))
    return row
  })
}

export async function recordDeliveryAttempt(db: SkylinkDatabase, input: NewDeliveryAttempt): Promise<DeliveryAttempt> {
  const [row] = await db.insert(deliveryAttempts).values(input).returning()
  if (!row) throw new Error('Failed to record delivery attempt')
  return row
}

export async function listConversations(
  db: SkylinkDatabase,
  channelAccountId: string,
  limit = DEFAULT_PAGE_SIZE,
): Promise<Conversation[]> {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.channelAccountId, channelAccountId))
    .orderBy(desc(conversations.createdAt), desc(conversations.id))
    .limit(pageSize(limit))
}

export async function listMessages(
  db: SkylinkDatabase,
  conversationId: string,
  limit = DEFAULT_PAGE_SIZE,
): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(pageSize(limit))
}

export async function getMessage(db: SkylinkDatabase, conversationId: string, messageId: string): Promise<Message | null> {
  const [row] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.conversationId, conversationId), eq(messages.id, messageId)))
    .limit(1)
  return row ?? null
}
