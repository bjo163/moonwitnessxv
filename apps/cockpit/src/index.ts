import { loadMoondeckConfig } from './config.js'
import { ProcessSupervisor } from './supervisor.js'
import { createCockpitServer } from './server.js'
import { launchDesktopApp } from './launcher.js'

async function main() {
  const config = await loadMoondeckConfig()
  const supervisor = new ProcessSupervisor(config)
  const app = createCockpitServer(config, supervisor)

  const host = '127.0.0.1'
  const port = config.port || 3004

  try {
    await app.listen({ host, port })
    const appUrl = `http://${host}:${port}`
    console.info(`\x1b[1;35m╭────────────────────────────────────────────────────────────╮\x1b[0m`)
    console.info(`\x1b[1;35m│\x1b[0m  \x1b[1;37m▲ MOONDECK // WINDOWS DESKTOP COCKPIT\x1b[0m                     \x1b[1;35m│\x1b[0m`)
    console.info(`\x1b[1;35m│\x1b[0m  Engine backend listening at: \x1b[1;36m${appUrl}\x1b[0m               \x1b[1;35m│\x1b[0m`)
    console.info(`\x1b[1;35m╰────────────────────────────────────────────────────────────╯\x1b[0m`)

    const shouldOpen = process.argv.includes('--open') || process.argv.includes('-o')
    if (shouldOpen) {
      console.info(`\x1b[90m  ➜ Spawning native Windows desktop window...\x1b[0m`)
      launchDesktopApp({
        url: appUrl,
        width: config.window?.width ?? 1400,
        height: config.window?.height ?? 880,
        title: config.title,
      })
    } else {
      console.info(`\x1b[90m  ➜ Open \x1b[1;36m${appUrl}\x1b[0m\x1b[90m or run with \x1b[1;37m--open\x1b[0m\x1b[90m for desktop mode\x1b[0m`)
    }
  } catch (err: unknown) {
    console.error('\x1b[1;31m[MOONDECK ERROR]\x1b[0m Failed to start server:', err)
    process.exit(1)
  }

  // Graceful exit handler
  const shutdown = async () => {
    console.info(`\n\x1b[1;33m[MOONDECK]\x1b[0m Shutting down services and desktop engine...`)
    supervisor.stopAll()
    try {
      await app.close()
    } catch {
      /* ignore */
    }
    process.exit(0)
  }

  process.on('SIGINT', () => {
    void shutdown()
  })
  process.on('SIGTERM', () => {
    void shutdown()
  })
  if (process.platform === 'win32') {
    process.on('SIGBREAK', () => {
      void shutdown()
    })
  }
}

void main()
