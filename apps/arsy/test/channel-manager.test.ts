import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import Fastify from 'fastify'
import { ChannelManager, DuplicateChannelIdError } from '../src/lib/channels.js'
import { loadChannels } from '../src/lib/loader.js'
import type { Channel } from '../src/lib/channels.js'

const channel: Channel = {
  id: 'telegram',
  label: 'Telegram',
  status: () => ({ state: 'configured' }),
  send: async ({ to }) => ({ channel: 'telegram', to, ok: true }),
}

void test('channel manager rejects duplicate ids rather than replacing the registered adapter', () => {
  const manager = new ChannelManager()
  manager.register(channel)
  assert.throws(() => manager.register({ ...channel, label: 'Replacement' }), (error: unknown) => {
    assert.ok(error instanceof DuplicateChannelIdError)
    assert.equal(error.code, 'DUPLICATE_CHANNEL_ID')
    return true
  })
  assert.equal(manager.get('telegram')?.label, 'Telegram')
  assert.equal(manager.list().length, 1)
})

void test('boot fails with the named error when two channel plugins share an id', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'arsy-duplicate-channel-'))
  t.after(() => rm(dir, { recursive: true, force: true }))
  // `loadChannels` reads the plugin directory during `buildApp`, so this is the boot path.
  await writeFile(join(dir, 'package.json'), '{"type":"module"}\n')
  const factory = (label: string) => `export default () => ({
  id: 'telegram',
  label: ${JSON.stringify(label)},
  status: () => ({ state: 'configured' }),
  send: async ({ to }) => ({ channel: 'telegram', to, ok: true }),
})
`
  await writeFile(join(dir, '01-telegram.js'), factory('Original'))
  await writeFile(join(dir, '02-telegram-shadow.js'), factory('Shadow'))

  const app = Fastify({ logger: false })
  t.after(() => app.close())
  const manager = new ChannelManager()

  const failure = await loadChannels(app, manager, dir, {} as never).then(
    () => undefined,
    (caught: unknown) => caught,
  )
  const duplicate = failure instanceof DuplicateChannelIdError ? failure : undefined
  assert.ok(duplicate, `boot must reject with DuplicateChannelIdError, got ${String(failure)}`)
  assert.equal(duplicate.code, 'DUPLICATE_CHANNEL_ID')
  assert.match(duplicate.message, /telegram/)
  assert.equal(manager.get('telegram')?.label, 'Original', 'the first registration is never shadowed')
})
