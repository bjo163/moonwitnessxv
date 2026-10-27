// Ephemeral ARSY hub for the Dock visual harness (todo-ui.md UI-F18 / the *f leaves).
//
// The harness itself only spawns Dock. Data-backed screens need a hub that answers,
// and the developer's real .env points at a shared database that other local sessions
// are using, so the visual pass would either measure the offline branch or write into
// shared state. This script boots the SAME hub app with three deliberate overrides:
// in-memory engine (no DATABASE_URL), cron off, seeds applied — bound to loopback on a
// port reserved for evidence runs. Nothing here persists after the process exits.
//
// Why the three aliases below are all set: apps/arsy/src/config.ts refuses to boot when
// ARSY_*/RADIO_*/API_* aliases disagree (it treats a split as a misconfiguration rather
// than guessing), and the repository .env sets RADIO_TITLE and API_TITLE to different
// values, so `pnpm dev` fails here before this script ever runs. Override every alias in
// the group, or pass none of them.
//
// Run (its own terminal, then start the harness with UI_HUB_URL pointing at it):
//   cd apps/arsy
//   MOONQL_AUTH_ADMIN_PASSWORD=<throwaway> \
//   ARSY_TITLE="Evidence Hub" RADIO_TITLE="Evidence Hub" API_TITLE="Evidence Hub" \
//   ARSY_PORT=3102 RADIO_PORT=3102 PORT=3102 \
//   pnpm exec tsx ../../scripts/ui/ephemeral-hub.mjs
//
//   UI_PORT=3101 UI_HUB_URL=http://127.0.0.1:3102/api/v1 \
//   pnpm exec playwright test --config scripts/ui/playwright.config.mjs
//
// Ports 3000-3005 belong to another local project and are never bound here.
import process from 'node:process'
import { loadConfig } from '../../apps/arsy/src/config.js'
import { buildApp } from '../../apps/arsy/src/app.js'

const config = loadConfig()
const app = await buildApp({
  ...config,
  database: { ...config.database, url: '' },
  orm: { ...config.orm, cronEnabled: false, seedPolicy: 'warn' },
})

const port = Number(process.env.EVIDENCE_HUB_PORT ?? 3102)
await app.listen({ host: '127.0.0.1', port })
console.log(`EVIDENCE_HUB_READY http://127.0.0.1:${port}/api/v1 (in-memory, seeded, ephemeral)`)

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    app.close().then(
      () => process.exit(0),
      () => process.exit(1),
    )
  })
}
