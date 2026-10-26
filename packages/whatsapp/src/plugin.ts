import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { notFound } from '@moonwitness/core'
import { WhatsAppClient } from './client.js'
import type { WhatsAppPluginOptions } from './types.js'

/**
 * OPTIONAL standalone integration: register this plugin to get /status, /qr,
 * /start, /logout and /send on the prefix you choose.
 *
 * apps/arsy does NOT mount it — the hub drives WhatsApp through its channel
 * plugin (src/channels/whatsapp.ts) and exposes the admin-only
 * <apiPrefix>/channels/whatsapp[/start|logout|send] routes instead, so one
 * control plane covers every channel. Keeping both mounted would publish the
 * pairing QR and the send endpoint without the channel guard.
 */

const SendBody = {
  type: 'object',
  required: ['to', 'text'],
  additionalProperties: false,
  properties: {
    to: { type: 'string', description: 'Phone number or chat jid', example: '6281234567890' },
    text: { type: 'string', minLength: 1, example: 'Hello from Moonwitness' },
  },
} as const

const StatusSchema = {
  tags: ['whatsapp'],
  response: {
    200: {
      type: 'object',
      properties: {
        state: { type: 'string', enum: ['disconnected', 'connecting', 'open', 'logged-out'] },
        qr: { type: 'string' },
        jid: { type: 'string' },
      },
    },
  },
}

/** Register the WhatsApp REST routes on a encapsulated instance. */
async function routes(app: FastifyInstance): Promise<void> {
  const client = app.whatsapp

  app.get('/status', { schema: { ...StatusSchema, summary: 'Connection status' } }, async () => client.status)

  app.get('/qr', { schema: { tags: ['whatsapp'], summary: 'Current pairing QR (raw payload)' } }, async () => {
    if (!client.status.qr) {
      throw notFound('No QR available (already connected?)')
    }
    return { qr: client.status.qr }
  })

  app.post('/start', { schema: { ...StatusSchema, tags: ['whatsapp'], summary: 'Start / reconnect the session' } }, async () => {
    await client.connect()
    return client.status
  })

  app.post('/logout', { schema: { tags: ['whatsapp'], summary: 'Log out and clear the session' } }, async () => {
    await client.logout()
    return client.status
  })

  app.post(
    '/send',
    {
      schema: {
        tags: ['whatsapp'],
        summary: 'Send a text message',
        body: SendBody,
        response: { 200: { type: 'object', properties: { id: { type: 'string' } } } },
      },
    },
    async (request) => {
      const { to, text } = request.body as { to: string; text: string }
      const id = await client.sendText(to, text)
      return { id }
    },
  )
}

/**
 * Moonwitness WhatsApp plugin (Baileys multi-device).
 * Encapsulated (NOT fastify-plugin) so the caller's `prefix` is honored.
 * Options: { enable, authDir, autoConnect, bot }.
 */
const whatsappPlugin: FastifyPluginAsync<WhatsAppPluginOptions> = async (fastify, opts) => {
  if (opts.enable === false) {
    fastify.log.info('whatsapp plugin disabled')
    return
  }

  const client = new WhatsAppClient({
    authDir: opts.authDir,
    autoConnect: opts.autoConnect,
    bot: opts.bot,
  })

  fastify.decorate('whatsapp', client)
  fastify.addHook('onClose', async () => client.close())

  // Surface connection lifecycle in the app logger.
  client.on('state', (state: string) => fastify.log.info(`whatsapp state -> ${state}`))
  client.on('qr', () => fastify.log.info('whatsapp pairing QR is ready (GET /whatsapp/qr)'))

  if (opts.autoConnect) await client.connect()

  await fastify.register(routes)
}

export default whatsappPlugin
