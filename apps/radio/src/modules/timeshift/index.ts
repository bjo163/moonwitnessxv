import type { TypedModule } from '../../lib/types.js'
import { timeshiftBuffer } from './buffer.js'

const timeshiftRoutes: TypedModule = async (fastify) => {
  fastify.get(
    '/stations/:id/timeshift',
    {
      schema: {
        tags: ['stations'],
        summary: 'Get audio timeshift window and rewind capability',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        } as const,
      },
    },
    async (request) => {
      const { id } = request.params
      const windowInfo = timeshiftBuffer.getWindow(id)
      return {
        ok: true,
        data: windowInfo,
      }
    },
  )

  fastify.post(
    '/stations/:id/timeshift/beacon',
    {
      schema: {
        tags: ['stations'],
        summary: 'Push audio stream timeshift beacon',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        } as const,
        body: {
          type: 'object',
          properties: {
            durationMs: { type: 'number' },
            byteLength: { type: 'number' },
          },
        } as const,
      },
    },
    async (request) => {
      const { id } = request.params
      const { durationMs = 1000, byteLength = 16384 } = request.body ?? {}
      timeshiftBuffer.pushChunk(id, durationMs, byteLength)
      const windowInfo = timeshiftBuffer.getWindow(id)
      return {
        ok: true,
        data: windowInfo,
      }
    },
  )

  fastify.log.info('timeshift: audio rewind buffer module mounted')
}

export default timeshiftRoutes
