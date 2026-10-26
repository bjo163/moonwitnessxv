import fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { AiRouter } from './router.js'
import type { ChatCompletionRequest } from './types.js'

export interface ServerOptions {
  router?: AiRouter
  logger?: boolean
}

export function buildServer(opts: ServerOptions = {}): FastifyInstance {
  const app = fastify({
    logger: opts.logger ?? false,
  })

  void app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  })

  const router = opts.router ?? new AiRouter()

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'moonwitness-aigateway',
      port: 3003,
      providers: router.getProviderStatuses(),
      timestamp: new Date().toISOString(),
    }
  })

  // Provider status inspection
  app.get('/v1/providers', async () => {
    return {
      object: 'list',
      data: router.getProviderStatuses(),
    }
  })

  // OpenAI-compatible model listing
  app.get('/v1/models', async () => {
    const models = router.listModels()
    return {
      object: 'list',
      data: models.map((m) => ({
        id: m.id,
        object: 'model',
        created: 1700000000,
        owned_by: m.provider,
        permission: [],
        root: m.id,
        parent: null,
        pricing: m.pricing,
        description: m.description,
      })),
    }
  })

  // OpenAI-compatible Chat Completions
  app.post<{ Body: ChatCompletionRequest }>('/v1/chat/completions', async (req, reply) => {
    const body = req.body
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return reply.status(400).send({
        error: {
          message: 'Invalid request: "messages" array is required and must not be empty.',
          type: 'invalid_request_error',
          param: 'messages',
          code: null,
        },
      })
    }

    try {
      const response = await router.route(body)
      return reply.send(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal AI gateway routing error'
      return reply.status(500).send({
        error: {
          message,
          type: 'api_error',
          param: null,
          code: null,
        },
      })
    }
  })

  return app
}
