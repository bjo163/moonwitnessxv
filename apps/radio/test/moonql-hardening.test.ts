import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  bootMoonQl,
  buildSchemas,
  createBus,
  defineAddon,
  defineModel,
  parseEvery,
  str,
} from '@moonwitness/moonql'

const quiet = { info: () => {}, warn: () => {} }

// ---------------------------------------------------------------- bus ---------
test('bus: an async listener rejection is isolated and later listeners still run', async () => {
  const warnings: unknown[] = []
  const bus = createBus({ warn: (obj, msg) => warnings.push({ obj, msg }) })
  let reached = false
  bus.on('model.created', async () => {
    throw new Error('subscriber exploded')
  })
  bus.on('model.created', () => {
    reached = true
  })

  assert.doesNotThrow(() => bus.emit('model.created', { model: 'x', id: '1', row: {} }))
  await new Promise((resolve) => setImmediate(resolve)) // rejection lands on a later tick
  assert.equal(reached, true, 'the loop is not aborted by the failing subscriber')
  assert.ok(warnings.some((w) => JSON.stringify(w).includes('async listener failed')))
})

// --------------------------------------------------------------- hooks --------
const hookedAddon = defineAddon({
  name: 'hooked',
  models: {
    hook_things: defineModel({ label: 'Hook thing', fields: { name: str({ maxLength: 40 }) }, rest: false }),
  },
  hooks: {
    hook_things: {
      // an async beforeCreate used to be handed over unawaited (a Promise spread
      // into `{}`, storing only defaults)
      beforeCreate: async (row) => ({ ...row, name: 'stamped' }),
    },
  },
})

test('repository: async beforeCreate hook is awaited', async () => {
  const moonql = await bootMoonQl({ addons: [hookedAddon], seedPolicy: 'off', cronEnabled: false, log: quiet })
  const row = await moonql.model('hook_things').create({ name: 'original' })
  assert.equal(row.name, 'stamped')
  await moonql.close()
})

// ------------------------------------------------------------- crons --------
test('parseEvery: bounds reject busy-loop and timer-clamping intervals', () => {
  assert.equal(parseEvery('100ms'), 100)
  // 24d still fits a 32-bit timer, 30d does not (Node would clamp it to 1ms)
  assert.equal(parseEvery('24d'), 24 * 86_400_000)
  assert.throws(() => parseEvery('0s'), /below 100ms/)
  assert.throws(() => parseEvery('80ms'), /below 100ms/)
  assert.throws(() => parseEvery('30d'), /exceeds a timer/)
  assert.throws(() => parseEvery(50), /too small/)
})

// ------------------------------------------------------ startImmediately ------
let bootTicks = 0
const cronAddon = defineAddon({
  name: 'tickcounter',
  models: {},
  cron: [
    {
      name: 'once-per-boot',
      every: '1h', // would never fire inside a test without startImmediately
      startImmediately: true,
      run: () => {
        bootTicks++
      },
    },
  ],
})

test('cron with startImmediately runs on the next tick after boot', async () => {
  const moonql = await bootMoonQl({ addons: [cronAddon], seedPolicy: 'off', log: quiet })
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(bootTicks, 1)
  await moonql.close()
})

// ---------------------------------------------------------- field keys --------
test('defineModel: a field key that is not a safe column name is refused', () => {
  assert.throws(
    () => defineModel({ label: 'Bad', fields: { 'Weird Key': str({ maxLength: 8 }) } }),
    /must match/,
  )
  assert.throws(
    () => defineModel({ label: 'Bad', fields: { 'name;drop': str({ maxLength: 8 }) } }),
    /must match/,
  )
})

// ------------------------------------------------------ private in bodies -----
test('buildSchemas: private fields never appear in create/update bodies', () => {
  const schemas = buildSchemas({
    name: str({ maxLength: 20 }),
    passwordHash: { ...str({ maxLength: 80 }), private: true },
  })
  const create = schemas.create as { properties: Record<string, unknown> }
  const update = schemas.update as { properties: Record<string, unknown> }
  assert.ok(create.properties.name)
  assert.equal(create.properties.passwordHash, undefined, 'no mass-assignment door')
  assert.equal(update.properties.passwordHash, undefined)
})
