import { WhatsAppClient } from '@moonwitness/whatsapp'
import type { Channel, ChannelFactory, SendResult } from '../lib/channels.js'
import type { RadioConfig } from '../config.js'

/**
 * WhatsApp channel plugin (Baileys multi-device).
 * This is the "first plugin" of the radio hub: it wraps the WhatsAppClient and
 * adapts it to the generic Channel contract. Returns null when disabled.
 */
const createWhatsAppChannel: ChannelFactory = (config: RadioConfig): Channel | null => {
  const cfg = config.channels.whatsapp
  if (!cfg.enabled) return null

  const client = new WhatsAppClient({
    authDir: cfg.authDir,
    autoConnect: cfg.autoConnect,
    bot: { enabled: cfg.botEnabled, greeting: cfg.botGreeting },
  })
  if (cfg.autoConnect) void client.connect()

  return {
    id: 'whatsapp',
    label: 'WhatsApp',

    status: () => ({
      state: client.status.state,
      detail: { jid: client.status.jid, qr: client.status.qr },
    }),

    send: async ({ to, text }): Promise<SendResult> => {
      const id = await client.sendText(to, text)
      return { channel: 'whatsapp', to, ok: true, id }
    },

    start: () => client.connect(),
    logout: () => client.logout(),
    shutdown: () => client.close(),
  }
}

export default createWhatsAppChannel
