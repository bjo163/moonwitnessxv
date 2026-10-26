import fp from 'fastify-plugin'
import type { FastifyError } from 'fastify'

// Centralized error + 404 handling. Emits a plain internal shape
// { statusCode, message, validation? } — the envelope plugin converts every
// response (success or failure) into the single public API format.
export default fp(async (fastify) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode || 500
    if (statusCode >= 500) request.log.error(error)
    else request.log.warn(error.message)

    // Expose the message only for deliberate HTTP errors (have a statusCode).
    const expose = Boolean(error.statusCode)
    reply.status(statusCode).send({
      statusCode,
      message: expose ? error.message : 'Internal Server Error',
      ...(error.validation ? { validation: error.validation } : {}),
    })
  })

  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      message: `Route ${request.method} ${request.url} not found`,
    })
  })
}, { name: 'error-handler' })
