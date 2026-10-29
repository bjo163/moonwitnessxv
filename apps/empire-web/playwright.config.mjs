import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './test',
  testMatch: 'navigation.browser.mjs',
  workers: 1,
  retries: 0,
  use: { headless: true },
  reporter: 'list',
})
