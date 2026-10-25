export { default as whatsappPlugin } from './plugin.js'
export { WhatsAppClient } from './client.js'
export type {
  WhatsAppPluginOptions,
  WhatsAppClientOptions,
  ConnectionState,
  WhatsAppStatus,
  IncomingMessage,
  MessageHandler,
} from './types.js'

// Default export so it can be registered directly: app.register(whatsapp, {...})
export { default } from './plugin.js'
