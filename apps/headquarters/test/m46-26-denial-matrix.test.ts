/**
 * M46-26 — authorization denial matrix for one HQ route family.
 *
 * One route family (the published `synthetic_sample` model, its admin view and
 * its three published endpoints) is crossed with every principal shape HQ can
 * meet: no cookie, a cookie the hub refuses, a hub that is down, a hub that is
 * unreachable, a signed-in principal without the rule, and a signed-in
 * principal holding it. Each cell asserts three things the packet names: the
 * denial class, the exact number of protected-store calls (zero on every
 * denial, one on the allowed fixture), and that the denial payload carries no
 * identity or credential.
 *
 * Same seams as `hq-authz-guard.test.ts`: `@/*` resolution, the `next/headers`
 * request-store fixture and a stubbed `globalThis.fetch`. No server, no
 * network, no live database, synthetic markers only.
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { CrudOp, ModelMeta, SchemaDocument, ViewMeta } from '@moonwitness/moonql-client'
import type { Guard } from '../src/lib/authz.js'
import type { ListResult } from '../src/data/queries/records.js'
import type { SessionUser } from '../src/data/types.js'

const HUB_BASE = 'http://hub.test/api/v1'
const SYNTHETIC_COOKIE = 'synthetic-cookie-marker'
const SYNTHETIC_ADMIN: SessionUser = { id: 'user-synthetic-1', login: 'synthetic-admin', displayName: 'Synthetic Admin', email: null, role: 'admin' }
const SYNTHETIC_VIEWER: SessionUser = { id: 'user-synthetic-2', login: 'synthetic-viewer', displayName: 'Synthetic Viewer', email: null, role: 'viewer' }

const testDir = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(testDir, '..', 'src')
const headersFixtureUrl = pathToFileURL(resolve(testDir, 'fixtures', 'next-headers-stub.mjs')).href

process.env.RADIO_API_URL = HUB_BASE

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'next/headers') return { url: headersFixtureUrl, shortCircuit: true, format: 'module' }
    if (specifier.startsWith('@/')) {
      const rest = specifier.slice(2)
      for (const extension of ['.ts', '.tsx', '.mjs', '.js', ''] as const) {
        const candidate = resolve(srcDir, `${rest}${extension}`)
        if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true, format: 'module' }
      }
      throw new Error(`m46-26 matrix resolver: ${specifier} is not under apps/headquarters/src`)
    }
    return nextResolve(specifier, context)
  },
})

type AuthzModule = typeof import('../src/lib/authz.js')
type CopyModule = typeof import('../src/lib/denial-copy')
type InventoryModule = typeof import('../src/lib/source-rights-inventory.js')

async function harness(): Promise<{ authz: AuthzModule; denialMessage: CopyModule['denialMessage']; loadSourceRightsInventory: InventoryModule['loadSourceRightsInventory'] }> {
  const [authz, copy, inventory] = await Promise.all([import('../src/lib/authz.js'), import('../src/lib/denial-copy'), import('../src/lib/source-rights-inventory.js')])
  return { authz, denialMessage: copy.denialMessage, loadSourceRightsInventory: inventory.loadSourceRightsInventory }
}

// ------------------------------------------------------------------ fake seams

const requestScope = globalThis as { __HQ_TEST_REQUEST__?: { sessionCookie: string | null; acceptLanguage: string | null } }

type Principal = 'no-cookie' | 'refused-cookie' | 'hub-down' | 'hub-unreachable' | 'viewer' | 'admin'

/** calls that reach the protected store, counted separately from hub calls */
let storeCalls = 0
let hubCalls = 0

function usePrincipal(principal: Principal): void {
  storeCalls = 0
  hubCalls = 0
  const cookie = principal === 'no-cookie' ? null : SYNTHETIC_COOKIE
  requestScope.__HQ_TEST_REQUEST__ = { sessionCookie: cookie, acceptLanguage: null }
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    hubCalls += 1
    const auth = new Headers(init?.headers).get('authorization') ?? 'none'
    assert.equal(String(input), `${HUB_BASE}/auth/me`, 'the only upstream a guard may reach before deciding is the session')
    if (cookie === null) assert.equal(auth, 'none', 'a request with no cookie must not present a credential')
    if (principal === 'hub-unreachable') throw new TypeError('synthetic fetch failure')
    if (principal === 'hub-down') return new Response('synthetic hub unavailable', { status: 503, statusText: 'Service Unavailable' })
    if (principal === 'no-cookie' || principal === 'refused-cookie') return Response.json({ ok: false, error: { message: 'unauthorized' } }, { status: 401 })
    const user = principal === 'admin' ? SYNTHETIC_ADMIN : SYNTHETIC_VIEWER
    return Response.json({ ok: true, data: user })
  }
}

const ALL_OPS: ModelMeta['operations'] = { list: true, get: true, create: true, update: true, remove: true }

const model: ModelMeta = {
  label: 'Synthetic sample',
  addon: 'synthetic',
  route: '/synthetic_sample',
  operations: ALL_OPS,
  delete: 'soft',
  unique: [],
  maxLimit: 25,
  dataTier: 'reference',
  acl: { list: 'auth', get: 'auth', create: ['admin'], update: ['admin'], remove: ['admin'] },
  fields: { title: { kind: 'str', required: true } },
  createSchema: { type: 'object', properties: { title: { type: 'string' } } },
  updateSchema: { type: 'object', properties: { title: { type: 'string' } } },
  readSchema: { type: 'object', properties: { title: { type: 'string' } } },
}

const view: ViewMeta = { label: 'Synthetic view', addon: 'synthetic', from: 'synthetic_sample', route: '/views/synthetic_view', limit: 25, output: ['title'], readSchema: { type: 'object' }, acl: ['admin'] }

const document: SchemaDocument = {
  schemaHash: 'synthetic-hash',
  apiVersion: 'v1',
  minDemoRows: 0,
  addons: [{ name: 'synthetic', version: '0.0.0', depends: [] }],
  models: { synthetic_sample: model },
  views: { synthetic_view: view },
  endpoints: [
    { addon: 'synthetic', method: 'GET', path: '/synthetic/overview', acl: ['admin'], stream: false },
    { addon: 'synthetic', method: 'POST', path: '/synthetic/publish', acl: ['admin'], stream: false },
    { addon: 'synthetic', method: 'GET', path: '/synthetic/feed', acl: 'auth', stream: false },
  ],
  crons: [],
  menu: [],
}

/** the published routes of the family, each with the principal that holds its rule */
type FamilyRoute = { name: string; expected: (principal: Principal) => 'redirect' | 'allow' | 'deny'; run: (a: AuthzModule) => Promise<Guard> }

const OPS: CrudOp[] = ['list', 'get', 'create', 'update', 'remove']

const familyRoutes: FamilyRoute[] = [
  ...OPS.map((op) => ({
    name: `model ${op}`,
    expected: (p: Principal) => (p === 'admin' || (p === 'viewer' && (op === 'list' || op === 'get')) ? 'allow' : p === 'no-cookie' || p === 'refused-cookie' ? 'redirect' : 'deny'),
    run: (a: AuthzModule) => a.guardModel(model, op),
  })),
  {
    name: 'view synthetic_view',
    expected: (p: Principal) => (p === 'admin' ? 'allow' : p === 'no-cookie' || p === 'refused-cookie' ? 'redirect' : 'deny'),
    run: (a: AuthzModule) => a.guardView(view),
  },
  ...['GET /synthetic/overview', 'POST /synthetic/publish', 'GET /synthetic/feed'].map((spec) => ({
    name: `endpoint ${spec}`,
    expected: (p: Principal) => {
      const authOnly = spec === 'GET /synthetic/feed'
      return p === 'admin' || (authOnly && p === 'viewer') ? 'allow' : p === 'no-cookie' || p === 'refused-cookie' ? 'redirect' : 'deny'
    },
    run: (a: AuthzModule) => a.guardEndpoint(document, spec.split(' ')[0], spec.split(' ')[1]),
  })),
  {
    name: 'endpoint never published',
    expected: (p: Principal) => (p === 'no-cookie' || p === 'refused-cookie' ? 'redirect' : 'deny'),
    run: (a: AuthzModule) => a.guardEndpoint(document, 'GET', '/synthetic/not_published'),
  },
]

type Run = { kind: 'guard'; guard: Guard } | { kind: 'redirect' }

async function runGuard(guard: Promise<Guard>): Promise<Run> {
  try {
    return { kind: 'guard', guard: await guard }
  } catch (error) {
    const digest = (error as { digest?: unknown } | null)?.digest
    if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) return { kind: 'redirect' }
    throw error
  }
}

const SECRET_MARKERS = [SYNTHETIC_COOKIE, 'Bearer', 'hq_token', SYNTHETIC_ADMIN.id, SYNTHETIC_ADMIN.login, SYNTHETIC_ADMIN.displayName, SYNTHETIC_VIEWER.id, SYNTHETIC_VIEWER.login, SYNTHETIC_VIEWER.displayName]
const CREDENTIAL_SHAPES = [/authorization\s*[:=]/i, /token\s*[:=]/i, /password\s*[:=]/i, /secret\s*[:=]/i, /cookie\s*[:=]/i]

function assertNoPrivateFields(rendered: string, label: string): void {
  for (const marker of SECRET_MARKERS) assert.ok(!rendered.includes(marker), `${label} leaked ${marker}`)
  for (const shape of CREDENTIAL_SHAPES) assert.ok(!shape.test(rendered), `${label} carried something shaped like ${shape}`)
}

const fixtureRows: ListResult = { rows: [{ title: 'synthetic edition' }], total: 1, page: 1, pageSize: 25 } as unknown as ListResult

// ---------------------------------------------------------------------- matrix

void test('every cell of the route-family matrix answers with its published rule', async () => {
  const { authz } = await harness()
  const covered: string[] = []
  for (const route of familyRoutes) {
    for (const principal of ['no-cookie', 'refused-cookie', 'hub-down', 'hub-unreachable', 'viewer', 'admin'] as Principal[]) {
      usePrincipal(principal)
      const outcome = await runGuard(route.run(authz))
      const expected = route.expected(principal)
      const cell = `${route.name} / ${principal}`
      covered.push(cell)
      if (expected === 'redirect') {
        assert.equal(outcome.kind, 'redirect', `${cell} must redirect, not render a denial`)
      } else if (expected === 'allow') {
        assert.equal(outcome.kind === 'guard' && outcome.guard.allowed, true, `${cell} must be allowed by the published rule`)
      } else {
        assert.ok(outcome.kind === 'guard' && !outcome.guard.allowed, `${cell} must be denied`)
        assert.ok((outcome.kind === 'guard' ? outcome.guard.code : 'redirect') === (principal === 'hub-down' || principal === 'hub-unreachable' ? 'unavailable' : 'forbidden'), `${cell} denial code`)
      }
      assert.equal(storeCalls, 0, `${cell} reached the protected store before the decision`)
    }
  }
  assert.equal(covered.length, 60, '6 principals across 10 family routes')
})

void test('denial causes zero protected-store calls and the allowed fixture succeeds', async () => {
  const { loadSourceRightsInventory, authz } = await harness()
  for (const principal of ['no-cookie', 'refused-cookie', 'hub-down', 'hub-unreachable', 'viewer'] as Principal[]) {
    usePrincipal(principal)
    const cell = `loader / ${principal}`
    let inventory = { accessAllowed: false, sources: null as ListResult | null }
    let redirected = false
    try {
      inventory = await loadSourceRightsInventory(model, async (meta) => (await authz.guardModel(meta, 'list')).allowed, async () => {
        storeCalls += 1
        return fixtureRows
      })
    } catch (error) {
      const digest = (error as { digest?: unknown } | null)?.digest
      assert.equal(typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT'), true, `${cell} must redirect or answer, not throw ${String(digest)}`)
      redirected = true
    }
    if (principal === 'viewer') {
      // the viewer DOES hold the published list rule: this is the positive control
      assert.equal(redirected, false, `${cell} an authorized principal is not redirected`)
      assert.equal(inventory.accessAllowed, true, `${cell} allowed fixture must succeed`)
      assert.equal(inventory.sources, fixtureRows, `${cell} must return the rows`)
      assert.equal(storeCalls, 1, `${cell} allowed path fetches exactly once`)
    } else {
      assert.equal(inventory.accessAllowed, false, `${cell} must not report access`)
      assert.equal(inventory.sources, null, `${cell} must carry no rows`)
      assert.equal(storeCalls, 0, `${cell} denial reached the store ${storeCalls} times`)
    }
  }
})

void test('a denied model, view or endpoint payload leaks no identity or credential', async () => {
  const { authz, denialMessage } = await harness()
  for (const route of familyRoutes) {
    for (const principal of ['viewer', 'hub-down', 'hub-unreachable'] as Principal[]) {
      usePrincipal(principal)
      const outcome = await runGuard(route.run(authz))
      const cell = `${route.name} / ${principal}`
      if (outcome.kind !== 'guard' || outcome.guard.allowed) continue
      const rendered = JSON.stringify({ guard: outcome.guard, copy: denialMessage(principal === 'hub-unreachable' ? 'id' : 'en', outcome.guard.code) })
      assertNoPrivateFields(rendered, cell)
    }
  }
})

void test('metrics: matrix cells covered and protected calls on deny', async () => {
  const { authz } = await harness()
  let denyCells = 0
  let allowCells = 0
  let redirectCells = 0
  for (const route of familyRoutes) {
    for (const principal of ['no-cookie', 'refused-cookie', 'hub-down', 'hub-unreachable', 'viewer', 'admin'] as Principal[]) {
      usePrincipal(principal)
      const outcome = await runGuard(route.run(authz))
      if (outcome.kind === 'redirect') redirectCells += 1
      else if (outcome.guard.allowed) allowCells += 1
      else denyCells += 1
      assert.equal(storeCalls, 0)
      assert.ok(hubCalls <= 1, `${route.name} / ${principal} asked the hub ${hubCalls} times before deciding`)
    }
  }
  assert.equal(denyCells + allowCells + redirectCells, 60)
  assert.ok(denyCells > 0 && allowCells > 0 && redirectCells > 0, 'the matrix must reach every outcome class')
})
