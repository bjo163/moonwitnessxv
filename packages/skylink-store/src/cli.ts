import { createSkylinkStore, dropSkylinkSchema, migrateSkylinkStore } from './client.js'

const action = process.argv[2]
const databaseUrl = process.env.DATABASE_URL

if (action !== 'up' && action !== 'down') {
  console.error('Usage: skylink-store <up|down> (requires DATABASE_URL)')
  process.exitCode = 2
} else if (!databaseUrl) {
  console.error('DATABASE_URL is required for SKYLINK storage migrations')
  process.exitCode = 2
} else {
  const store = createSkylinkStore(databaseUrl)
  try {
    if (action === 'up') await migrateSkylinkStore(store)
    else await dropSkylinkSchema(store.client)
  } catch {
    console.error(`SKYLINK migration ${action} failed`)
    process.exitCode = 1
  } finally {
    await store.client.end({ timeout: 5 })
  }
}
