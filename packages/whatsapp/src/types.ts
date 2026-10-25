import type { FastifyPluginAsync } from 'fastify'

/** Public connection status of the WhatsApp client. */
export type ConnectionState = 'disconnected' | 'connecting' | 'open' | 'logged-out'

export interface WhatsAppStatus {
  state: ConnectionState
  /** Raw QR payload to render, present only while pairing. */
  qr?: string
  /** Connected user jid, present when open. */
  jid?: string
}

export interface IncomingMessage {
  key: { id?: string | null; remoteJid?: string | null; fromMe?: boolean | null }
  message?: { conversation?: string | null; extendedTextMessage?: { text?: string } }
  timestampMs: number
}

/** Bot handler invoked for every non-self, text message received. */
export type MessageHandler = (
  msg: IncomingMessage,
  client: import('./client.js').WhatsAppClient,
) => void | Promise<void>

export interface WhatsAppClientOptions {
  /** Directory where Baileys auth/creds are persisted. */
  authDir: string
  /** If true, immediately try to connect on start. */
  autoConnect?: boolean
  /** Minimal ping/help bot. */
  bot?: { enabled?: boolean; greeting?: string }
}

export interface WhatsAppPluginOptions extends WhatsAppClientOptions {
  /** Master switch; when false the plugin registers no routes. */
  enable?: boolean
}

declare module 'fastify' {
  interface FastifyInstance {
    whatsapp: import('./client.js').WhatsAppClient
  }
  // Allow documentation fields in route schemas without importing swagger.
  interface FastifySchema {
    tags?: string[]
    summary?: string
    description?: string
  }
}

export type WhatsAppPlugin = FastifyPluginAsync<WhatsAppPluginOptions>
