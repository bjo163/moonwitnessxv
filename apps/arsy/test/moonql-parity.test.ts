import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import {
  bootMoonQl,
  defineAddon,
  defineModel,
  defineView,
  int,
  likePattern,
  matchesDomain,
  moonqlRest,
  str,
} from '@moonwitness/moonql'
import envelope from '../src/plugins/envelope.js'

const quiet = { info: () => {}, warn: () => {} }

// ------------------------------------------------------------- like -----------
test('likePattern: user wildcards stay literals (pg LIKE parity with memory)', () => {
  assert.equal(likePattern('jazz'), '%jazz%')
  assert.equal(likePattern('100%'), '%100\\%%')
  assert.equal(likePattern('a_b'), '%a\\_b%')
  assert.equal(likePattern('back\\slash'), '%back\\\\slash%')

  // memory side of the same operator: literal substring, case-insensitive
  const domain = { kind: 'leaf' as const, term: { field: 'name', op: 'like' as const, value: '100%' } }
  assert.equal(matchesDomain(domain, { name: 'covered 100% of it' }), true)
  assert.equal(matchesDomain(domain, { name: '100 percent' }), false)
})

// ------------------------------------------------------------ metrics -------
const statsAddon = defineAddon({
  name: 'stats',
  models: {
    measures: defineModel({
      label: 'Measure',
      fields: { grp: str({ maxLength: 8 }), value: int({ null: true }) },
      rest: false,
      seedless: true,
    }),
  },
  views: {
    statsByGroup: defineView('statsByGroup', {
      label: 'Stats by group',
      from: 'measures',
      aggregate: {
        groupBy: ['grp'],
        metrics: { total: { fn: 'sum', field: 'value' }, mean: { fn: 'avg', field: 'value' }, n: { fn: 'count' } },
      },
      order: 'grp',
      limit: 2,
      acl: 'public',
    }),
  },
})

async function bootMeasures(rows: Array<{ grp: string; value: number | null }>) {
  const moonql = await bootMoonQl({ addons: [statsAddon], seedPolicy: 'off', cronEnabled: false, log: quiet })
  const repo = moonql.model('measures')
  for (const row of rows) await repo.create(row)
  return moonql
}

test('aggregate: empty group keeps null metrics and sum 0 (engine contract)', async () => {
  const moonql = await bootMeasures([
    { grp: 'a', value: null },
    { grp: 'a', value: null },
    { grp: 'b', value: 3 },
    { grp: 'c', value: 5 },
  ])
  const rows = await moonql.model('measures').aggregateView({
    groupBy: ['grp'],
    metrics: [
      { alias: 'total', fn: 'sum', column: 'value' },
      { alias: 'mean', fn: 'avg', column: 'value' },
      { alias: 'n', fn: 'count' },
    ],
    limit: 10,
  })
  const byGroup = new Map(rows.map((r) => [String(r.grp), r]))
  assert.equal(byGroup.get('a')!.total, 0, 'sum of an all-null group is 0')
  assert.equal(byGroup.get('a')!.mean, null, 'avg of an empty set is null, not 0')
  assert.equal(byGroup.get('a')!.n, 2)
  await moonql.close()
})

test('aggregate: the limit chooses the same groups on every call (deterministic)', async () => {
  const moonql = await bootMeasures([
    { grp: 'zeta', value: 1 },
    { grp: 'alpha', value: 2 },
    { grp: 'mu', value: 3 },
  ])
  const query = { groupBy: ['grp'], metrics: [{ alias: 'n', fn: 'count' as const }], limit: 2 }
  const first = await moonql.model('measures').aggregateView(query)
  const second = await moonql.model('measures').aggregateView(query)
  assert.deepEqual(first.map((r) => r.grp), ['alpha', 'mu'], 'ordered by the group key')
  assert.deepEqual(second.map((r) => r.grp), first.map((r) => r.grp))
  await moonql.close()
})

test('aggregate view serializes over REST with a null metric (sum number, avg nullable)', async (t) => {
  const app = Fastify({ logger: false })
  const moonql = await bootMeasures([
    { grp: 'empty', value: null },
    { grp: 'filled', value: 4 },
    { grp: 'other', value: 6 },
  ])
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()
  t.after(async () => {
    await app.close()
    await moonql.close()
  })

  const res = await app.inject().get('/orm/statsByGroup').end()
  assert.equal(res.statusCode, 200, 'fast-json-stringify accepts the null avg')
  const rows = res.json().data as Array<Record<string, unknown>>
  assert.equal(rows.length, 2, 'the view caps at limit 2, by group key order')
  assert.deepEqual(rows.map((r) => r.grp), ['empty', 'filled'])
  assert.equal(rows[0]!.mean, null)
  assert.equal(rows[1]!.mean, 4)
  assert.equal(typeof rows[1]!.total, 'number')
})
