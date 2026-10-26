import fp from 'fastify-plugin'
import helmet from '@fastify/helmet'

// Security HTTP headers for the hub, its Swagger UI and Studio.
//
// Studio and Swagger render inline script and style, so 'unsafe-inline' cannot be
// avoided there. What is still ruled out is code, frames or form targets coming
// from anywhere else, plus MIME sniffing of echoed content.
export default fp(async (fastify) => {
  const isDev = process.env.NODE_ENV !== 'production'
  const frameAncestors = isDev
    ? ["'self'", 'http://127.0.0.1:3004', 'http://localhost:3004']
    : ["'none'"]

  await fastify.register(helmet, {
    xFrameOptions: isDev ? false : { action: 'sameorigin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        frameAncestors,
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  })
}, { name: 'helmet' })
