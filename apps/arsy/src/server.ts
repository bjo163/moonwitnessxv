import { loadConfig } from './config.js'
import { buildApp } from './app.js'

const config = loadConfig()

try {
  const app = await buildApp(config)
  await app.listen({ host: config.host, port: config.port })

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      app.log.info(`received ${signal}, shutting down`)
      // Dua cabang `then`: tanpa yang kedua, kegagalan shutdown hilang tanpa jejak
      // dan proses menggantung dengan socket yang masih terbuka.
      app.close().then(
        () => process.exit(0),
        (err: unknown) => {
          app.log.error({ err }, 'shutdown failed')
          process.exit(1)
        },
      )
    })
  }
} catch (err) {
  console.error(err)
  process.exit(1)
}
