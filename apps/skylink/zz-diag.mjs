// Temporary diagnostic for the SKYLINK start failure. Deleted after use.
import { loadConfig } from './src/config.ts'

try {
  const c = loadConfig()
  console.log('cfg ok', c.host, c.port, 'db?', Boolean(c.databaseUrl), 'tg?', Boolean(c.telegramBotToken), 'wh?', Boolean(c.telegramWebhookSecret))
  const { createSkylinkStore, migrateSkylinkStore } = await import('@moonwitness/skylink-store')
  const store = c.databaseUrl ? createSkylinkStore(c.databaseUrl) : null
  console.log('store?', Boolean(store))
  if (store) {
    await migrateSkylinkStore(store)
    console.log('migrate ok')
    await store.client.end({ timeout: 5 })
  }
} catch (e) {
  console.error('DIAG ctor=', e?.constructor?.name, 'message=', JSON.stringify(e?.message), 'code=', JSON.stringify(e?.code))
  console.error(String(e?.stack ?? e).split('\n').slice(0, 8).join('\n'))
}
