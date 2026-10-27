import fp from 'fastify-plugin'
import type { FastifyError } from 'fastify'
import { preferredLocale, type Locale } from '@moonwitness/core'

const safeMessages: Record<string, string> = {
  Unauthorized: 'Autentikasi diperlukan.',
  Forbidden: 'Akses ditolak.',
  'Invalid credentials': 'Nama pengguna atau kata sandi tidak valid.',
  'Bad Request': 'Permintaan tidak valid.',
  'Not Found': 'Data tidak ditemukan.',
  'Internal Server Error': 'Terjadi kesalahan internal pada server.',
}

function messageFor(error: FastifyError, message: string, locale: Locale): string {
  if (locale !== 'id') return message
  // Validation internals can contain implementation paths and JSON-schema text.
  // Keep those details structured, but present a safe human summary.
  if (error.validation) return 'Permintaan tidak valid.'
  return safeMessages[message] ?? message
}

// Centralized error + 404 handling. Emits a plain internal shape
// { statusCode, message, validation? } — the envelope plugin converts every
// response (success or failure) into the single public API format.
export default fp(async (fastify) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode || 500
    const locale = preferredLocale(request.headers['accept-language']) ?? 'en'
    if (statusCode >= 500) request.log.error(error)
    else request.log.warn(error.message)

    // Expose the message only for deliberate HTTP errors (have a statusCode).
    const expose = Boolean(error.statusCode)
    reply.header('Vary', 'Accept-Language').status(statusCode).send({
      statusCode,
      message: messageFor(error, expose ? error.message : 'Internal Server Error', locale),
      ...(error.validation ? { validation: error.validation } : {}),
    })
  })

  fastify.setNotFoundHandler((request, reply) => {
    reply.header('Vary', 'Accept-Language').status(404).send({
      statusCode: 404,
      message: `Route ${request.method} ${request.url} not found`,
    })
  })
}, { name: 'error-handler' })
