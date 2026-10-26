import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  schemaFilter: ['skylink'],
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://moonwitness:moonwitness@localhost:5432/moonwitness',
  },
})
