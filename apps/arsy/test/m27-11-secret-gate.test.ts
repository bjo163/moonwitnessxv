import { test } from 'node:test'
import assert from 'node:assert/strict'
import auth from '@moonwitness/moonql-auth'

/**
 * M27-11 — a missing or sample credential must fail loudly in production.
 *
 * The compose file can no longer demand secrets at parse time: `docker compose
 * build` interpolates the whole file first, and a hosted builder only receives
 * build-time variables. That trade is only safe while the runtime still refuses
 * a production stack that has no admin password, which is what these tests pin.
 */

const seed = (auth as unknown as { models: Record<string, { seed: (context: unknown) => Promise<Array<Record<string, string>>> }> })
  .models.auth_users!.seed
const log = { warn: () => {} }

test('moonql-auth: production refuses to seed an admin without a password', async () => {
  await assert.rejects(
    () => seed({ env: { NODE_ENV: 'production', MOONQL_AUTH_ADMIN_PASSWORD: '' }, log }),
    /MOONQL_AUTH_ADMIN_PASSWORD must be set in production/,
  )
})

test('moonql-auth: development still seeds one admin with a generated password', async () => {
  const rows = await seed({ env: { NODE_ENV: 'development' }, log })
  assert.equal(rows.length, 1)
  assert.equal(rows[0]!.login, 'admin')
  assert.equal(rows[0]!.role, 'admin')
  assert.match(rows[0]!.passwordHash!, /^[0-9a-f]{32}\$[0-9a-f]{128}$/, 'the seeded row stores a salted hash, never the password')
})

test('moonql-auth: production seeds normally once a password is supplied', async () => {
  const rows = await seed({ env: { NODE_ENV: 'production', MOONQL_AUTH_ADMIN_PASSWORD: 'staging-dummy-value' }, log })
  assert.equal(rows.length, 1)
  assert.equal(rows[0]!.role, 'admin')
  assert.notEqual(rows[0]!.passwordHash, 'staging-dummy-value')
})
