import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SCHEMA_HASH, describeDrift, schemaDrift } from '@moonwitness/moonql-client'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'

/**
 * F4.1: the contract carries its own digest. Two things depend on that:
 * a deployed frontend can tell that the hub moved under it, and this repo can
 * catch "the server changed and nobody reran gen:sdk" as a failing test rather
 * than as a mystery at runtime.
 */
async function schema() {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  const app = await buildApp(config)
  const headers = await adminHeaders(app)
  const doc = (await app.inject().get('/api/v1/_schema').headers(headers).end()).json().data as {
    schemaHash: string
    apiVersion: string
  }
  return { doc, app, expectedApi: config.api.version }
}

test('_schema: reports a digest and the hub api version', async (t) => {
  const { doc, app, expectedApi } = await schema()
  t.after(() => app.close())

  assert.match(doc.schemaHash, /^[0-9a-f]{16}$/, 'the digest must be a hex string')
  assert.equal(doc.apiVersion, expectedApi, 'the advertised version comes from config, not a literal')
})

test('_schema: the digest is stable across fetches of the same contract', async (t) => {
  const { doc, app } = await schema()
  t.after(() => app.close())

  const headers = await adminHeaders(app)
  const again = (await app.inject().get('/api/v1/_schema').headers(headers).end()).json().data as { schemaHash: string }
  assert.equal(again.schemaHash, doc.schemaHash, 'nothing volatile (clock, row data) may leak into the digest')
})

test('the committed SDK agrees with the live contract', async (t) => {
  const { doc, app } = await schema()
  t.after(() => app.close())

  // If this fails: the hub's models/views/endpoints moved and `pnpm gen:sdk` was
  // not rerun, so every generated type in both frontends describes an old server.
  assert.equal(SCHEMA_HASH, doc.schemaHash, 'generated.ts was not refreshed for this contract')
})

test('describeDrift: silent when matched, one actionable line when not', () => {
  assert.equal(describeDrift({ schemaHash: SCHEMA_HASH, apiVersion: '1.0.0' }), null)

  const drift = schemaDrift({ schemaHash: 'ffffffffffffffff', apiVersion: '2.3.4' })
  assert.equal(drift.mismatched, true)
  assert.equal(drift.expected, SCHEMA_HASH, 'the client must say what IT was built for')
  assert.equal(drift.hubApiVersion, '2.3.4', 'the hub version is context, not the verdict')

  const line = describeDrift({ schemaHash: 'ffffffffffffffff', apiVersion: '2.3.4' })!
  assert.match(line, /schema drift/)
  assert.match(line, new RegExp(SCHEMA_HASH.slice(0, 8)), 'names the digest the client expects')
  assert.match(line, /gen:sdk/, 'and points at the fix')

  // a version bump with an unchanged contract is not a breakage and must stay quiet
  assert.equal(describeDrift({ schemaHash: SCHEMA_HASH, apiVersion: '9.9.9' }), null)
})
