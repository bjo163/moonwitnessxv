import websocket from '@fastify/websocket'
import Fastify from 'fastify'
import type { SkylinkConfig } from './config.js'

export function createSkylinkServer(config: SkylinkConfig) {
  const app = Fastify({ logger: false })

  app.register(websocket)

  app.get('/health', async () => ({
    status: 'ok',
    app: 'skylink',
    port: config.port,
  }))

  return app
}
