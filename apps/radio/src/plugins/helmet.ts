import fp from 'fastify-plugin'
import helmet from '@fastify/helmet'
import { COCKPIT_DEV_ORIGINS } from '@moonwitness/core'

// Security HTTP headers for the hub, its Swagger UI and Studio.
//
// Studio and Swagger render inline script and style, so 'unsafe-inline' cannot be
// avoided there. What is still ruled out is code, frames or form targets coming
// from anywhere else, plus MIME sniffing of echoed content.
export default fp(async (fastify) => {
  const isDev = process.env.NODE_ENV !== 'production'
  // Same pair of loopback spellings the frontends' CSP uses, from the shared
  // port contract — the hub and the Next apps cannot drift apart on this.
  const frameAncestors = isDev
    ? ["'self'", ...COCKPIT_DEV_ORIGINS]
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
