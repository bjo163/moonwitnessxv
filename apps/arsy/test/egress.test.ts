import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  assertEgressUrl,
  assertPublicHttpUrl,
  configureEgress,
  egressRules,
  fetchJsonWithPolicy,
  isPrivateAddress,
  probeStream,
} from '@moonwitness/core'
import { installEgress } from '../src/lib/egress.js'
import { loadConfig } from '../src/config.js'

/**
 * The egress gate, tested where it can hurt.
 *
 * A URL is not a destination: `https://cdn.example.com/status` passes any string
 * check and still lands on 127.0.0.1 if that is what the name resolves to. These
 * cases hold the two layers apart — the literal rules, then the resolved answers —
 * because the first one existed for a while and was mistaken for the whole gate.
 */

const refuses = async (url: string, options?: Parameters<typeof assertEgressUrl>[1]): Promise<string> => {
  try {
    await assertEgressUrl(url, options)
  } catch (error) {
    return (error as Error).message
  }
  assert.fail(`expected ${url} to be refused`)
}

test('egress: private literals are refused in every spelling', () => {
  for (const host of [
    '127.0.0.1',
    '10.1.2.3',
    '192.168.1.10',
    '169.254.169.254',
    '172.16.0.1',
    '100.64.0.1', // CGNAT
    '198.19.1.1', // benchmarking range
    '[::1]',
    '[::ffff:127.0.0.1]',
    '[::ffff:7f00:1]', // the same address after URL normalisation
    '[fd00::1]',
    '[fe80::1]',
    '[ff02::1]',
  ]) {
    assert.equal(isPrivateAddress(host), true, `${host} must count as private`)
    assert.throws(() => assertPublicHttpUrl(`http://${host}/status`), /refused private target/, host)
  }
  for (const host of ['8.8.8.8', '203.0.113.10', '[2001:4860:4860::8888]', 'example.com']) {
    assert.equal(isPrivateAddress(host), false, `${host} must count as public`)
  }
})

test('egress: a host that can only be an integer is refused, not resolved', () => {
  // the URL parser normalises a bare number into dotted form, so these end up at
  // 127.0.0.1 and are refused as private — either way, refused before any socket
  for (const host of ['2130706433', '0x7f000001', '017700000001']) {
    assert.throws(() => assertPublicHttpUrl(`http://${host}/`), /refused (numeric host|private target)/, host)
  }
  // what the parser cannot normalise is a label: this is the case the rule exists for
  assert.throws(() => assertPublicHttpUrl('http://0x7f000001.example.com/'), /refused numeric host/)
})

test('egress: compose service names and metadata are refused by name', async () => {
  for (const host of ['db', 'DB', 'radio', 'dock', 'headquarters', 'skylink', 'echolog', 'metadata.google.internal', 'db.']) {
    assert.throws(() => assertPublicHttpUrl(`http://${host}:8080/status`), /refused private target/, host)
  }
  // a public name that merely contains one is fine
  const ok = await assertEgressUrl('https://db.example.com/status', { resolveAddresses: async () => ['93.184.216.34'] })
  assert.equal(ok.hostname, 'db.example.com')
})

test('egress: the database port and the hub happen to be on its own port', async () => {
  assert.throws(() => assertPublicHttpUrl('https://example.com:5432/status'), /refused port 5432/)

  installEgress({ ...loadConfig(), port: 3000, egress: { denyHosts: [] } })
  assert.throws(() => assertPublicHttpUrl('http://example.com:3000/status'), /refused port 3000/)
  // 443 and 80 stay available: those are where broadcasts actually live
  assert.doesNotThrow(() => assertPublicHttpUrl('https://example.com/status'))
})

test('egress: a public name that resolves to a private address is refused', async () => {
  const privateAnswer = await refuses('https://cdn.example.com/status', { resolveAddresses: async () => ['127.0.0.1'] })
  assert.match(privateAnswer, /resolves to private 127\.0\.0\.1/)

  // one bad answer in a round-robin record is enough
  const mixed = await refuses('https://cdn.example.com/status', {
    resolveAddresses: async () => ['93.184.216.34', '10.0.0.7'],
  })
  assert.match(mixed, /resolves to private 10\.0\.0\.7/)

  // a name that does not resolve is not a destination either
  assert.match(await refuses('https://nope.example.com/status', { resolveAddresses: async () => [] }), /does not resolve/)
  assert.match(
    await refuses('https://nope.example.com/status', {
      resolveAddresses: async () => {
        throw new Error('ENOTFOUND')
      },
    }),
    /does not resolve/,
  )

  const allowed = await assertEgressUrl('https://cdn.example.com/status', { resolveAddresses: async () => ['93.184.216.34'] })
  assert.equal(allowed.hostname, 'cdn.example.com')
})

test('egress: refused URLs never reach the network, allowed ones keep redirect:error', async () => {
  const calls: Array<{ url: string; redirect: string | undefined }> = []
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    calls.push({ url, redirect: init?.redirect })
    return new Response(JSON.stringify({ ok: 1 }), { status: 200, headers: { 'content-type': 'application/json' } })
  }) as unknown as typeof fetch

  const refused = await fetchJsonWithPolicy('http://db:8080/status', { fetchImpl })
  assert.equal(refused, null)
  assert.equal(calls.length, 0, 'a refused target must not be dialled at all')

  const parsed = await fetchJsonWithPolicy<{ ok: number }>('https://example.com/status', {
    fetchImpl,
    resolveAddresses: async () => ['93.184.216.34'],
  })
  assert.deepEqual(parsed, { ok: 1 })
  assert.equal(calls.length, 1)
  assert.equal(calls[0]!.redirect, 'error', 'a redirect is how an SSRF gate gets walked around')

  const dead = await probeStream('http://127.0.0.1:3000/api/v1/health', { fetchImpl })
  assert.equal(dead, false)
  assert.equal(calls.length, 1)
})

test('egress: the process installs a resolver, its own port and the operator list', () => {
  const rules = installEgress({ port: 4321, egress: { denyHosts: ['internal.example', ' intranet.example '] } })
  assert.equal(rules.resolving, true, 'the hub must install the DNS resolver, not only the URL rules')
  assert.ok(rules.denyHosts.includes('db'))
  assert.ok(rules.denyHosts.includes('internal.example'))
  assert.ok(rules.denyHosts.includes('intranet.example'), 'entries are trimmed')
  assert.ok(rules.denyPorts.includes(4321))
  assert.ok(rules.denyPorts.includes(5432))
  assert.deepEqual(egressRules(), rules)
})

test('egress: clearing the resolver is possible, and then only layer 1 runs', () => {
  configureEgress({ resolveAddresses: null })
  assert.equal(egressRules().resolving, false)
  // the URL rules still hold; this is only about how much of the gate is armed
  assert.throws(() => assertPublicHttpUrl('http://db/status'), /refused private target/)
})
