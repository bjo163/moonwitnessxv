import { loadConfig } from './config.js'
import { createSkylinkServer } from './server.js'

async function main(): Promise<void> {
  try {
    const config = loadConfig()
    const app = createSkylinkServer(config)
    await app.listen({ host: config.host, port: config.port })
    console.info(`SKYLINK health service listening on http://${config.host}:${config.port}`)

    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
      process.on(signal, () => {
        app.close().then(
          () => process.exit(0),
          (error: unknown) => {
            console.error(`SKYLINK shutdown failed: ${error instanceof Error ? error.message : String(error)}`)
            process.exit(1)
          },
        )
      })
    }
  } catch (error) {
    console.error(`SKYLINK failed to start: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}

void main()
