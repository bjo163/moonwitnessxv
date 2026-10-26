import fp from 'fastify-plugin'
import cors from '@fastify/cors'

// Enables CORS using the app-wide config decorator.
export default fp(async (fastify) => {
  await fastify.register(cors, { origin: fastify.config.cors.origin ?? true })
}, { name: 'cors' })
