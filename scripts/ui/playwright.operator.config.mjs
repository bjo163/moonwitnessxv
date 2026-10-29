import { defineConfig } from '@playwright/test'
import os from 'node:os'
import path from 'node:path'

const port = Number(process.env.UI_OPERATOR_PORT ?? 3104)

export default defineConfig({
  testDir: '.',
  testMatch: 'm19-06-operator.spec.mjs',
  outputDir: path.join(os.tmpdir(), 'moonwitness-m19-06-operator'),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: process.env.UI_OPERATOR_URL ?? `http://127.0.0.1:${port}`,
    trace: 'off',
    screenshot: 'off',
    launchOptions: { args: ['--force-device-scale-factor=1'] },
  },
})
