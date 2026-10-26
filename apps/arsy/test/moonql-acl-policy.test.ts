import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bootMoonQl, defineAddon, defineModel, str } from '@moonwitness/moonql'

// A model that exposes writes without declaring an acl rule.
const openAddon = defineAddon({
  name: 'opentest',
  models: {
    open_things: defineModel({
      label: 'Open thing',
      fields: { name: str({ maxLength: 20 }) },
      rest: true,
    }),
  },
})

const quiet = { info: () => {} }

async function boot(aclPolicy?: 'off' | 'warn' | 'require') {
  const warnings: Array<Record<string, unknown>> = []
  const moonql = await bootMoonQl({
    addons: [openAddon],
    seedPolicy: 'off',
    cronEnabled: false,
    ...(aclPolicy ? { aclPolicy } : {}),
    log: { ...quiet, warn: (obj: unknown, msg: string) => { warnings.push({ obj, msg }) } },
  })
  return { moonql, warnings }
}

test('acl policy: warns about anonymous-writable REST writes (default)', async (t) => {
  const { moonql, warnings } = await boot()
  t.after(() => moonql.close())
  const warn = warnings.find((w) => String(w.msg).includes('acl policy'))
  assert.ok(warn, 'the open write is reported')
  assert.deepEqual((warn!.obj as { openWrites: string[] }).openWrites, [
    'open_things.create',
    'open_things.update',
    'open_things.remove',
  ])
})

test('acl policy: require fails the boot, off stays silent', async (t) => {
  await assert.rejects(() => boot('require'), /acl policy: REST writes need an acl rule/)

  const { moonql, warnings } = await boot('off')
  t.after(() => moonql.close())
  assert.equal(warnings.filter((w) => String(w.msg).includes('acl policy')).length, 0)
})

test('acl policy: a misspelled mode warns instead of silently picking a side', async (t) => {
  // 'reqire' must not read as 'off' (open writes ship) nor as 'require' (boot dies)
  const warnings: Array<Record<string, unknown>> = []
  const moonql = await bootMoonQl({
    addons: [openAddon],
    seedPolicy: 'off',
    cronEnabled: false,
    env: { MOONQL_ACL_POLICY: 'reqire' },
    log: { info: () => {}, warn: (obj: unknown, msg: string) => { warnings.push({ obj, msg }) } },
  })
  t.after(() => moonql.close())

  const said = warnings.filter((w) => String(w.msg).includes('unknown mode'))
  assert.equal(said.length, 1, 'the bad value is named, not swallowed')
  const offenders = warnings.find((w) => String(w.msg).includes('acl policy: declare'))
  assert.ok(offenders, 'and the invariant is still reported under the safe fallback')
})
