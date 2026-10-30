import assert from 'node:assert/strict'
import test from 'node:test'
import { hashRadiusPassword, verifyRadiusPassword } from '../src/credentials.ts'

test('a synthetic RADIUS credential round-trips through the stored hash', async () => {
  const credential = 'synthetic-subscriber-credential'
  const stored = await hashRadiusPassword(credential)
  assert.equal(await verifyRadiusPassword(credential, stored), true)
  assert.equal(await verifyRadiusPassword('synthetic-wrong-credential', stored), false)
})

test('the stored credential fits the private field and hides the credential', async () => {
  const credential = 'synthetic-subscriber-credential'
  const stored = await hashRadiusPassword(credential)
  assert.ok(stored.length <= 256, 'the hash must fit the credentialHash field')
  assert.equal(stored.includes(credential), false)
  assert.notEqual(await hashRadiusPassword(credential), stored, 'each hash carries its own salt')
})

test('verification fails closed on an absent or malformed hash without leaking a usable path', async () => {
  assert.equal(await verifyRadiusPassword('synthetic-subscriber-credential', null), false)
  assert.equal(await verifyRadiusPassword('synthetic-subscriber-credential', ''), false)
  assert.equal(await verifyRadiusPassword('synthetic-subscriber-credential', 'not-a-stored-hash'), false)
  assert.equal(await verifyRadiusPassword('synthetic-subscriber-credential', 'scrypt$broken'), false)
})
