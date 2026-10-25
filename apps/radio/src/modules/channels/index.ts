import { notFound } from '@moonwitness/core'
import { requireAdmin } from '../../lib/authz.js'
import type { Channel } from '../../lib/channels.js'
import type { TypedModule } from '../../lib/types.js'

const SendBody = {
  type: 'object',
  required: ['to', 'text'],
  additionalProperties: false,
  properties: {
    to: { type: 'string', description: 'Recipient id / chat jid / phone', example: '6281234567890' },
    text: { type: 'string', minLength: 1, example: 'Hello from Moonwitness' },
  },
} as const

const IdParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', example: 'whatsapp' } },
} as const

const SendResultSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    channel: { type: 'string' },
    to: { type: 'string' },
    ok: { type: 'boolean' },
    id: { type: 'string' },
    error: { type: 'string' },
  },
} as const

const ChannelStatusSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    label: { type: 'string' },
    state: { type: 'string' },
    detail: { type: 'object', additionalProperties: true },
  },
} as const

const channelsRoutes: TypedModule = async (fastify) => {
  const manager = fastify.channels

  // Everything here is a control plane: it can pair, unpair or send as the
  // operator (and `status.detail` carries the live pairing QR + JID), so the
  // whole encapsulated plugin is admin-only rather than one guard per route.
  fastify.addHook('preHandler', requireAdmin)

  // One lookup-or-404 for every :id route — no repetition.
  const requireChannel = (id: string): Channel => {
    const channel = manager.get(id)
    if (!channel) throw notFound(`Channel "${id}" not found`)
    return channel
  }
  const snapshot = async (c: Channel) => ({ id: c.id, label: c.label, ...(await c.status()) })

  fastify.get('/', {
    schema: {
      tags: ['channels'],
      summary: 'List all IM channels with status',
      response: { 200: { type: 'array', items: ChannelStatusSchema } },
    },
  }, async () => manager.statusAll())

  fastify.get('/:id', {
    schema: { tags: ['channels'], summary: 'Get one channel status', params: IdParams },
  }, async (request) => snapshot(requireChannel(request.params.id)))

  fastify.post('/:id/start', {
    schema: { tags: ['channels'], summary: 'Start / reconnect a channel', params: IdParams },
  }, async (request) => {
    const channel = requireChannel(request.params.id)
    await channel.start?.()
    return snapshot(channel)
  })

  fastify.post('/:id/logout', {
    schema: { tags: ['channels'], summary: 'Log out a channel', params: IdParams },
  }, async (request) => {
    const channel = requireChannel(request.params.id)
    await channel.logout?.()
    return snapshot(channel)
  })

  fastify.post('/:id/send', {
    schema: {
      tags: ['channels'],
      summary: 'Send a message via one channel',
      params: IdParams,
      body: SendBody,
      response: { 200: SendResultSchema },
    },
  }, async (request) => {
    const channel = requireChannel(request.params.id)
    const { to, text } = request.body
    return channel.send({ to, text })
  })

  // Radio broadcast: send the same message to every active channel at once.
  fastify.post('/broadcast', {
    schema: {
      tags: ['channels'],
      summary: 'Broadcast a message to ALL channels',
      body: SendBody,
      response: { 200: { type: 'array', items: SendResultSchema } },
    },
  }, async (request) => {
    const { to, text } = request.body
    return manager.broadcast({ to, text })
  })
}

export default channelsRoutes
