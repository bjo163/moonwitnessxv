import websocket from '@fastify/websocket'
import Fastify from 'fastify'
import type { FastifyServerOptions } from 'fastify'
import type { SkylinkConfig } from './config.js'
import { SkylinkChannelRegistry } from './channels.js'
import { registerSkylinkRoutes } from './modules/routes.js'
import { registerWebhookRoutes } from './modules/webhooks.js'
import type { SkylinkDatabase } from '@moonwitness/skylink-store'
import type { TelegramAdapter } from '@moonwitness/skylink-telegram'
import { SkylinkEventBus, registerWebSocketRoute } from './ws.js'

export interface SkylinkServerOptions {
  store?: SkylinkDatabase
  channels?: SkylinkChannelRegistry
  telegram?: TelegramAdapter
  events?: SkylinkEventBus
  fetcher?: typeof fetch
  now?: () => number
  /** Off in production by default; injectable so log hygiene is testable. */
  logger?: FastifyServerOptions['logger']
}

export function createSkylinkServer(config: SkylinkConfig, options: SkylinkServerOptions = {}) {
  const app = Fastify({ logger: options.logger ?? false })

  const channels = options.channels ?? new SkylinkChannelRegistry()
  const events = options.events ?? new SkylinkEventBus()
  const authOptions = {
    arsyUrl: config.arsyUrl,
    serviceKey: config.serviceKey,
    fetcher: options.fetcher,
    now: options.now,
  }

  registerSkylinkRoutes(app, {
    ...authOptions,
    store: options.store,
    getChannels: () => channels.list(),
    events,
  })
  registerWebhookRoutes(app, {
    telegramSecret: config.telegramWebhookSecret,
    telegram: options.telegram,
    events,
  })
  app.register(async (scope) => {
    await scope.register(websocket)
    registerWebSocketRoute(scope, authOptions, events)
  })

  const qrListeners = channels.list().flatMap((channel) => {
    if (!channel.on) return []
    const listener = (qr: string) => events.publish({
      type: 'channel.qr', channelId: channel.id, qr, timestamp: new Date().toISOString(),
    })
    channel.on('qr', listener)
    return [{ channel, listener }]
  })
  app.addHook('onClose', async () => {
    for (const { channel, listener } of qrListeners) channel.off?.('qr', listener)
  })

  app.setErrorHandler((error, _request, reply) => {
    const validationError = isValidationError(error)
    const statusCode = validationError ? 400 : 500
    const message = validationError ? 'Invalid request.' : 'Request failed.'
    return reply.code(statusCode).send({
      ok: false,
      error: { statusCode, message },
      timestamp: new Date().toISOString(),
    })
  })

  app.get('/health', async () => ({
    status: 'ok',
    app: 'skylink',
    port: config.port,
  }))

  return app
}

function isValidationError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'validation' in error && Array.isArray(error.validation)
}
