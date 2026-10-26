import Fastify from 'fastify'
import type { EchologConfig } from './config.js'

export function createEchologServer(config: EchologConfig) {
  const app = Fastify({ logger: false })

  app.get('/health', async () => ({
    status: 'ok',
    app: 'echolog',
    port: config.port,
  }))

  app.get('/health/ready', async (_request, reply) => reply.code(503).send({
    status: 'not_ready',
    app: 'echolog',
    reason: 'no driver configured',
  }))

  return app
}
