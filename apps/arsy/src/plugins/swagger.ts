import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

// OpenAPI (Swagger) documentation, generated from per-route schemas.
export default fp(async (fastify) => {
  const { title, version } = fastify.config.api

  await fastify.register(swagger, {
    openapi: {
      info: { title, version },
      // Relative on purpose: a hardcoded localhost:PORT makes "Try it out" fail for
      // anyone reading the docs from another machine (or a container), and leaks the
      // internal port into a public document. "/" resolves against the UI's origin.
      servers: [{ url: '/' }],
      tags: [
        { name: 'system', description: 'Health & meta endpoints' },
        { name: 'stations', description: 'Radio station management' },
        { name: 'channels', description: 'IM channels (WhatsApp, ...) & broadcast' },
        { name: 'denpa', description: '電波 — inbound webhook transmissions' },
      ],
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  })

  fastify.log.info('OpenAPI docs available at /docs')
}, { name: 'swagger' })
