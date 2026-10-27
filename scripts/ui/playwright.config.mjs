// Playwright config for the Dock visual harness (todo-ui.md UI-F18).
//
// Deliberately NOT wired into `pnpm verify` or CI: the owner keeps CI thin, so
// this is a manual evidence command. It is also the only place that decides
// where the harness writes — see paths.mjs.
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'

const here = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.UI_PORT ?? 3101)

export default defineConfig({
  testDir: here,
  testMatch: /visual\.spec\.mjs/,
  globalSetup: path.join(here, 'global-setup.mjs'),
  // Playwright's scratch space (traces, failure snapshots) stays out of the
  // repository; the only repo artifacts are the deterministic files in
  // docs/audit/screens/.
  outputDir: path.join(os.tmpdir(), 'moonwitness-ui-visual-harness'),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // A geometry failure must not stop the rest of the matrix: the run writes one
  // complete geometry.json in one pass.
  maxFailures: 0,
  // First hit on a route makes `next dev` compile it; that is minutes, not seconds.
  timeout: 300_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    // The harness passes an explicit port everywhere; nothing here talks to 3000/3001.
    ignoreHTTPSErrors: false,
    launchOptions: { args: ['--force-device-scale-factor=1'] },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
