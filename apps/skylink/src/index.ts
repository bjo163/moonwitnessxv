import { loadConfig } from './config.js'
import { createSkylinkServer } from './server.js'
import { createChannelAccount, createSkylinkStore, findChannelAccount, migrateSkylinkStore } from '@moonwitness/skylink-store'
import { TelegramAdapter } from '@moonwitness/skylink-telegram'
import { createTelegramSkylinkChannel, SkylinkChannelRegistry } from './channels.js'

async function main(): Promise<void> {
  try {
    const config = loadConfig()
    const store = config.databaseUrl ? createSkylinkStore(config.databaseUrl) : null
    if (store) await migrateSkylinkStore(store)
    if (config.telegramBotToken && !store) {
      throw new Error('D18 store is required when the Telegram provider is configured.')
    }
    const telegram = store && config.telegramBotToken && config.telegramWebhookSecret
      ? new TelegramAdapter({
        botToken: config.telegramBotToken,
        webhookSecret: config.telegramWebhookSecret,
        externalAccountId: 'default',
        authRef: 'secret://environment/SKYLINK_TELEGRAM_BOT_TOKEN',
        store: store.db,
      })
      : undefined
    const channels = new SkylinkChannelRegistry()
    if (store && telegram) {
      const externalAccountId = 'default'
      const account = await findChannelAccount(store.db, 'telegram', externalAccountId)
        ?? await createChannelAccount(store.db, {
          provider: 'telegram',
          externalAccountId,
          authRef: 'secret://environment/SKYLINK_TELEGRAM_BOT_TOKEN',
          status: 'disconnected',
        })
      channels.register(createTelegramSkylinkChannel(telegram, account.id))
    }
    const app = createSkylinkServer(config, { store: store?.db, channels, telegram })
    if (store) app.addHook('onClose', async () => store.client.end({ timeout: 5 }))
    await app.listen({ host: config.host, port: config.port })
    console.info(`SKYLINK service listening on http://${config.host}:${config.port}`)

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
