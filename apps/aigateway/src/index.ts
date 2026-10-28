import { buildServer } from './server.js'

export * from './retrieval.js'
export * from './source-guard.js'

const port = Number(process.env.AI_GATEWAY_PORT ?? 3003)
const host = process.env.HOST ?? '0.0.0.0'

const server = buildServer({ logger: true })

try {
  const address = await server.listen({ port, host })
  server.log.info(`[Moonwitness AI Gateway] Listening on ${address} (port: ${port})`)
} catch (err) {
  server.log.error(err)
  process.exit(1)
}
