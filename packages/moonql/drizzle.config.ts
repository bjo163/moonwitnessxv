import { defineConfig } from 'drizzle-kit'

// drizzle-kit config for the moonql package — the ONLY place migrations live.
// Usage from repo root: pnpm db:generate / db:push / db:studio
export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://moonwitness:moonwitness@localhost:5432/moonwitness',
  },
})
