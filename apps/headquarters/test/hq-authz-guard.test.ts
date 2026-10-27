/**
 * UI-F13 — server-side authorization of the HQ private routes.
 *
 * What is pinned here is the guard's DECISION SPACE and its two non-negotiable
 * rules: an outage must never be read as "logged out" (a valid session would be
 * thrown away), and rule meaning is never re-derived in HQ — it comes from the
 * hub's published ACL, matched by the shared `can()`.
 *
 * The pure half (`decideAccess`, `ruleAllows`) takes its identity source as an
 * argument, so it needs no harness. The route half (`guardModel`, `guardView`,
 * `guardEndpoint`) is bound to the request's real session, so this file supplies
 * the two seams a plain `node:test` process lacks:
 *  - `@/*` path aliases, which tsx only resolves through the tsconfig of the
 *    package it is executed from (the root script runs HQ tests from `arsy`);
 *  - `next/headers`, which has no request store outside a Next render — the
 *    local fixture stands in for it, carrying synthetic markers only.
 * No server is started and no network is reached: every hub answer is stubbed.
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { can, MoonApiError, type CrudOp, type ModelMeta, type SchemaDocument, type ViewMeta } from '@moonwitness/moonql-client'
import { denialMessage } from '../src/lib/denial-copy'
import type { Guard } from '../src/lib/authz.js'
import type { SessionUser } from '../src/data/types.js'

const HUB_BASE = 'http://hub.test/api/v1'
const SESSION_URL = `${HUB_BASE}/auth/me`

/** obviously synthetic: nothing here is a real credential or witness record */
const SYNTHETIC_COOKIE = 'synthetic-cookie-marker'
const SYNTHETIC_ADMIN: SessionUser = {
  id: 'user-synthetic-1',
  login: 'synthetic-admin',
  displayName: 'Synthetic Admin',
  email: null,
  role: 'admin',
}
const SYNTHETIC_VIEWER: SessionUser = {
  id: 'user-synthetic-2',
  login: 'synthetic-viewer',
  displayName: 'Synthetic Viewer',
  email: null,
  role: 'viewer',
}

const testDir = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(testDir, '..', 'src')
const headersFixtureUrl = pathToFileURL(resolve(testDir, 'fixtures', 'next-headers-stub.mjs')).href

/**
 * The hub address is only ever used to build the URL the stubbed fetcher is
 * called with — nothing here reaches a network.
 */
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
      throw new Error(`hq-authz-guard test resolver: ${specifier} is not under apps/headquarters/src`)
    }
    return nextResolve(specifier, context)
  },
})

type AuthzModule = typeof import('../src/lib/authz.js')

/** imported lazily so the resolver hook above is registered first */
async function authz(): Promise<AuthzModule> {
  return import('../src/lib/authz.js')
}

// ---------------------------------------------------------------- harness seams

interface TestRequest {
  sessionCookie: string | null
  acceptLanguage: string | null
}

/** the bag the `next/headers` fixture reads lazily; see fixtures/next-headers-stub.mjs */
const requestScope = globalThis as { __HQ_TEST_REQUEST__?: TestRequest }

function withRequest(sessionCookie: string | null): void {
  requestScope.__HQ_TEST_REQUEST__ = { sessionCookie, acceptLanguage: null }
}

type HubAnswer = 'signed-in-admin' | 'signed-in-viewer' | 'no-session' | 'unavailable' | 'network-down'

/** every hub call this test makes, as `<url>|<authorization header>` */
let hubCalls: string[] = []

function useHub(answer: HubAnswer): void {
  hubCalls = []
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = String(input)
    hubCalls.push(`${url}|${new Headers(init?.headers).get('authorization') ?? 'none'}`)
    if (answer === 'network-down') throw new TypeError('synthetic fetch failure')
    if (answer === 'unavailable') return new Response('synthetic hub unavailable', { status: 503, statusText: 'Service Unavailable' })
    if (answer === 'no-session') return Response.json({ ok: false, error: { message: 'unauthorized' } }, { status: 401 })
    const user = answer === 'signed-in-admin' ? SYNTHETIC_ADMIN : SYNTHETIC_VIEWER
    return Response.json({ ok: true, data: user })
  }
}

/**
 * A guard either answers (allow / forbidden / unavailable) or redirects. The
 * redirect is Next's own throw, so it is reported here rather than swallowed.
 */
type GuardRun = { kind: 'guard'; guard: Guard } | { kind: 'redirect'; digest: string }

async function runGuard(guard: Promise<Guard>): Promise<GuardRun> {
  try {
    return { kind: 'guard', guard: await guard }
  } catch (error) {
    const digest = (error as { digest?: unknown } | null)?.digest
    if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) return { kind: 'redirect', digest }
    throw error
  }
}

// ---------------------------------------------------------- synthetic published ACL

const ALL_OPS: ModelMeta['operations'] = { list: true, get: true, create: true, update: true, remove: true }

/** a `/_schema` model document, shaped like the hub publishes it */
function publishedModel(acl: Record<string, string | string[]>, operations: ModelMeta['operations'] = ALL_OPS): ModelMeta {
  return {
    label: 'Synthetic sample',
    addon: 'synthetic',
    route: '/synthetic_sample',
    operations,
    delete: 'soft',
    unique: [],
    maxLimit: 25,
    dataTier: 'reference',
    acl,
    fields: { title: { kind: 'str', required: true } },
    createSchema: { type: 'object', properties: { title: { type: 'string' } } },
    updateSchema: { type: 'object', properties: { title: { type: 'string' } } },
    readSchema: { type: 'object', properties: { title: { type: 'string' } } },
  }
}

function publishedView(acl: string | string[] | undefined): ViewMeta {
  return {
    label: 'Synthetic view',
    addon: 'synthetic',
    from: 'synthetic_sample',
    route: '/views/synthetic_view',
    limit: 25,
    output: ['title'],
    readSchema: { type: 'object' },
    acl: acl as string | string[],
  }
}

function publishedSchemaDocument(): SchemaDocument {
  return {
    schemaHash: 'synthetic-hash',
    apiVersion: 'v1',
    minDemoRows: 0,
    addons: [{ name: 'synthetic', version: '0.0.0', depends: [] }],
    models: { synthetic_sample: publishedModel({ list: 'auth', create: ['admin'] }) },
    views: { synthetic_view: publishedView(['admin']) },
    endpoints: [
      { addon: 'synthetic', method: 'GET', path: '/synthetic/overview', acl: ['admin'], stream: false },
      { addon: 'synthetic', method: 'POST', path: '/synthetic/publish', acl: ['admin'], stream: false },
      { addon: 'synthetic', method: 'GET', path: '/synthetic/feed', acl: 'auth', stream: false },
    ],
    crons: [],
    menu: [],
  }
}

/** the markers a denial must never carry: identity values and credential shapes */
const SECRET_MARKERS = [
  SYNTHETIC_COOKIE,
  'Bearer',
  'hq_token',
  SYNTHETIC_ADMIN.id,
  SYNTHETIC_ADMIN.login,
  SYNTHETIC_ADMIN.displayName,
  SYNTHETIC_VIEWER.id,
  SYNTHETIC_VIEWER.login,
  SYNTHETIC_VIEWER.displayName,
]

/**
 * A denial may say "Not authorized" in prose, so credential detection is by
 * shape (a header/assignment), never by the bare word.
 */
const CREDENTIAL_SHAPES = [/authorization\s*[:=]/i, /token\s*[:=]/i, /password\s*[:=]/i, /secret\s*[:=]/i, /cookie\s*[:=]/i]

function assertNoSecrets(rendered: string, label: string): void {
  for (const marker of SECRET_MARKERS) {
    assert.ok(!rendered.includes(marker), `${label} leaked ${marker}`)
  }
  for (const shape of CREDENTIAL_SHAPES) {
    assert.ok(!shape.test(rendered), `${label} carried something shaped like ${shape}`)
  }
}

// ------------------------------------------------- 1. anonymous → redirect, never a shell

void test('a hub 401 (no session) is anonymous, and anonymous redirects instead of deciding', async () => {
  const { decideAccess } = await authz()
  const grantWasConsulted = { current: false }

  const access = await decideAccess(
    async () => null,
    () => {
      grantWasConsulted.current = true
      return true
    },
  )

  assert.deepEqual(access, { status: 'deny', code: 'anonymous' })
  assert.equal(grantWasConsulted.current, false, 'the rule is never evaluated without an identity')
})

void test('an anonymous request is redirected to the login screen, not answered with a guard', async () => {
  const { guardModel } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('no-session')

  const run = await runGuard(guardModel(publishedModel({ create: ['admin'] }), 'create'))

  assert.equal(run.kind, 'redirect', 'a signed-out operator never receives a renderable guard')
  if (run.kind === 'redirect') {
    assert.match(run.digest, /\/login\?error=expired/, `redirects to the login route, got ${run.digest}`)
    assert.match(run.digest, /307/, 'the redirect is a temporary one')
  }
  assert.deepEqual(hubCalls, [`${SESSION_URL}|Bearer ${SYNTHETIC_COOKIE}`], 'only the session was probed, never a record')
})

void test('a local cookie the hub rejects is the hub\'s call: no session means the redirect, not an allow', async () => {
  const { guardView } = await authz()
  withRequest('synthetic-expired-cookie')
  useHub('no-session')

  const run = await runGuard(guardView(publishedView('auth')))

  assert.equal(run.kind, 'redirect')
  assert.equal(hubCalls.length, 1, 'HQ asks the hub once and believes the answer')
})

void test('a request with no cookie at all is anonymous: the hub is asked and says so', async () => {
  const { guardEndpoint } = await authz()
  withRequest(null)
  useHub('no-session')

  const run = await runGuard(guardEndpoint(publishedSchemaDocument(), 'GET', '/synthetic/overview'))

  assert.equal(run.kind, 'redirect')
  assert.equal(hubCalls[0], `${SESSION_URL}|none`, 'no bearer header was invented for a missing cookie')
})

// --------------------------------------------------------- 2. signed in, rule not held

void test('a signed-in user without the role is denied forbidden for a model create', async () => {
  const { guardModel } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('signed-in-viewer')

  const run = await runGuard(guardModel(publishedModel({ get: 'auth', create: ['admin'] }), 'create'))

  assert.equal(run.kind, 'guard')
  if (run.kind === 'guard') assert.deepEqual(run.guard, { allowed: false, code: 'forbidden' })
  assert.equal(hubCalls.length, 1, 'the denial is decided before any privileged read is attempted')
})

void test('an admin-only view rule and an admin-only endpoint rule both refuse a non-admin', async () => {
  const { guardView, guardEndpoint } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('signed-in-viewer')

  const view = await runGuard(guardView(publishedView(['admin'])))
  assert.equal(view.kind, 'guard')
  if (view.kind === 'guard') assert.deepEqual(view.guard, { allowed: false, code: 'forbidden' })

  useHub('signed-in-viewer')
  const endpoint = await runGuard(guardEndpoint(publishedSchemaDocument(), 'POST', '/synthetic/publish'))
  assert.equal(endpoint.kind, 'guard')
  if (endpoint.kind === 'guard') assert.deepEqual(endpoint.guard, { allowed: false, code: 'forbidden' })
})

void test('an operation the hub does not publish is refused even for an admin — the document is the gate', async () => {
  const { guardModel } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('signed-in-admin')

  const run = await runGuard(guardModel(publishedModel({ list: 'auth', create: ['admin'] }, { list: true, get: true }), 'create'))

  assert.equal(run.kind, 'guard')
  if (run.kind === 'guard') assert.deepEqual(run.guard, { allowed: false, code: 'forbidden' })
})

void test('an endpoint the hub does not publish is forbidden rather than guessed', async () => {
  const { guardEndpoint } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('signed-in-admin')

  const run = await runGuard(guardEndpoint(publishedSchemaDocument(), 'POST', '/synthetic/not_published'))

  assert.equal(run.kind, 'guard')
  if (run.kind === 'guard') assert.deepEqual(run.guard, { allowed: false, code: 'forbidden' })
})

void test('a view or endpoint with no published rule is forbidden, not public by default', async () => {
  const { guardView } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('signed-in-admin')

  const run = await runGuard(guardView(publishedView(undefined)))

  assert.equal(run.kind, 'guard')
  if (run.kind === 'guard') assert.deepEqual(run.guard, { allowed: false, code: 'forbidden' })
})

// ------------------------------------------------------------- 3. the rule is held

void test('a signed-in admin holding the rule is allowed and keeps its identity', async () => {
  const { guardModel, guardView, guardEndpoint } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('signed-in-admin')

  const create = await runGuard(guardModel(publishedModel({ create: ['admin'] }), 'create'))
  assert.equal(create.kind, 'guard')
  if (create.kind === 'guard') assert.deepEqual(create.guard, { allowed: true, user: SYNTHETIC_ADMIN })

  useHub('signed-in-admin')
  const view = await runGuard(guardView(publishedView(['admin'])))
  assert.equal(view.kind, 'guard')
  if (view.kind === 'guard') assert.deepEqual(view.guard, { allowed: true, user: SYNTHETIC_ADMIN })

  useHub('signed-in-admin')
  const endpoint = await runGuard(guardEndpoint(publishedSchemaDocument(), 'get', '/synthetic/feed'))
  assert.equal(endpoint.kind, 'guard')
  if (endpoint.kind === 'guard') assert.deepEqual(endpoint.guard, { allowed: true, user: SYNTHETIC_ADMIN })
})

void test('the guard asks the hub who is asking; a role is never read off the cookie', async () => {
  const { guardModel } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('signed-in-admin')

  await runGuard(guardModel(publishedModel({ get: 'auth' }), 'get'))

  assert.deepEqual(hubCalls, [`${SESSION_URL}|Bearer ${SYNTHETIC_COOKIE}`], 'the opaque cookie is offered to the hub, which answers with the role')
})

// ---------------------------------------------------------------- 4. hub outage

void test('a hub 503 is unavailable and explicitly not anonymous: the session is kept', async () => {
  const { decideAccess, guardModel } = await authz()
  const outage = new MoonApiError(503, 'synthetic hub unavailable')

  const access = await decideAccess(
    async () => {
      throw outage
    },
    () => true,
  )
  assert.deepEqual(access, { status: 'deny', code: 'unavailable' })
  if (access.status === 'deny') assert.notEqual(access.code, 'anonymous', 'an outage is never a sign-out')

  withRequest(SYNTHETIC_COOKIE)
  useHub('unavailable')
  const run = await runGuard(guardModel(publishedModel({ list: 'auth' }), 'list'))

  assert.equal(run.kind, 'guard', 'an outage must not send a valid session to the login screen')
  if (run.kind === 'guard') {
    assert.deepEqual(run.guard, { allowed: false, code: 'unavailable' })
    assert.notEqual(run.guard.code, 'anonymous')
  }
  assert.deepEqual(hubCalls, [`${SESSION_URL}|Bearer ${SYNTHETIC_COOKIE}`], 'the cookie was still offered to the hub')
})

void test('a thrown fetch (hub unreachable) is unavailable, not a sign-out', async () => {
  const { decideAccess, guardView } = await authz()

  const access = await decideAccess(
    async () => {
      throw new TypeError('synthetic fetch failure')
    },
    () => true,
  )
  assert.deepEqual(access, { status: 'deny', code: 'unavailable' })

  withRequest(SYNTHETIC_COOKIE)
  useHub('network-down')
  const run = await runGuard(guardView(publishedView('auth')))
  assert.equal(run.kind, 'guard')
  if (run.kind === 'guard') assert.deepEqual(run.guard, { allowed: false, code: 'unavailable' })
})

void test('only a hub 401 may read as anonymous: a hub 500 stays unavailable', async () => {
  const { decideAccess } = await authz()

  for (const status of [500, 502, 503, 403] as const) {
    const access = await decideAccess(
      async () => {
        throw new MoonApiError(status, 'synthetic hub answer')
      },
      () => true,
    )
    assert.deepEqual(access, { status: 'deny', code: 'unavailable' }, `status ${status} is not a sign-out`)
  }

  const anonymous = await decideAccess(
    async () => {
      throw new MoonApiError(401, 'unauthorized')
    },
    () => true,
  )
  assert.deepEqual(anonymous, { status: 'deny', code: 'anonymous' }, 'the one status that does mean anonymous')
})

// --------------------------------------------------- 5. rule meaning is the hub's

void test('ruleAllows delegates to the shared can() instead of re-deriving rule meaning', async () => {
  const { ruleAllows } = await authz()

  const rules: (string | string[] | undefined)[] = ['public', 'auth', ['admin'], ['admin', 'ops'], 'ops', ['witness'], undefined, 'none']
  const users: (SessionUser | null)[] = [null, SYNTHETIC_VIEWER, SYNTHETIC_ADMIN, { ...SYNTHETIC_VIEWER, role: 'ops' }]

  for (const rule of rules) {
    // the same operation-keyed shape the guard hands to can(), built in the open
    const meta = { operations: { get: true }, acl: { get: rule ?? 'none' } } as unknown as ModelMeta
    for (const user of users) {
      assert.equal(
        ruleAllows(rule, user),
        can(meta, user, 'get'),
        `rule ${JSON.stringify(rule)} for ${user?.role ?? 'anonymous'} must match can()`,
      )
    }
  }
})

void test('the bare ACL shapes behave the way the hub publishes them', async () => {
  const { ruleAllows } = await authz()

  assert.equal(ruleAllows('public', null), true, 'public is open even without an identity')
  assert.equal(ruleAllows('auth', null), false, 'auth needs somebody')
  assert.equal(ruleAllows('auth', SYNTHETIC_VIEWER), true, 'any signed-in identity satisfies auth')
  assert.equal(ruleAllows(['admin'], SYNTHETIC_VIEWER), false)
  assert.equal(ruleAllows(['admin'], SYNTHETIC_ADMIN), true)
  assert.equal(ruleAllows(['admin', 'ops'], { ...SYNTHETIC_VIEWER, role: 'ops' }), true, 'one of the listed roles is enough')
  assert.equal(ruleAllows(undefined, SYNTHETIC_ADMIN), false, 'no published rule is no access')
  assert.equal(ruleAllows('none', SYNTHETIC_ADMIN), false, 'none is no route at all')
  assert.equal(ruleAllows('admin', SYNTHETIC_ADMIN), true, 'a bare string role works like a one-role array')
})

void test('a rule HQ has never seen is refused, not treated as a name HQ can interpret', async () => {
  const { ruleAllows } = await authz()

  assert.equal(ruleAllows(['station-lead'], SYNTHETIC_ADMIN), false)
  assert.equal(ruleAllows('everybody', SYNTHETIC_ADMIN), false)
})

// ---------------------------------------------------------- 6. denials carry nothing

void test('no denial — anonymous, forbidden or unavailable — carries a credential or an identity', async () => {
  const { decideAccess, guardModel } = await authz()

  const anonymous = await decideAccess(async () => null, () => true)
  const forbidden = await decideAccess(async () => SYNTHETIC_VIEWER, () => false)
  const unavailable = await decideAccess(
    async () => {
      throw new MoonApiError(503, 'synthetic hub unavailable')
    },
    () => true,
  )

  assertNoSecrets(JSON.stringify(anonymous), 'the anonymous decision')
  assertNoSecrets(JSON.stringify(forbidden), 'the forbidden decision')
  assertNoSecrets(JSON.stringify(unavailable), 'the unavailable decision')
  assert.equal('user' in anonymous, false, 'a denial never hands the page a user')
  assert.equal('user' in forbidden, false)
  assert.equal('user' in unavailable, false)

  for (const [answer, expectation] of [
    ['signed-in-viewer', 'forbidden'],
    ['unavailable', 'unavailable'],
  ] as const) {
    withRequest(SYNTHETIC_COOKIE)
    useHub(answer)
    const run = await runGuard(guardModel(publishedModel({ list: ['admin'] }), 'list'))
    assert.equal(run.kind, 'guard')
    if (run.kind !== 'guard') continue
    assert.equal(run.guard.allowed, false)
    if (run.guard.allowed) continue
    assert.equal(run.guard.code, expectation)
    assertNoSecrets(JSON.stringify(run.guard), `the ${expectation} guard`)
  }
})

void test('denial copy selects only the two stable codes and reflects nothing back', async () => {
  const credentialLike = [
    `authorization=Bearer ${SYNTHETIC_COOKIE}`,
    'password=synthetic-do-not-reflect',
    'hq_token=synthetic-cookie-marker',
    'unauthorized',
    'Service Unavailable',
    'toString',
    'constructor',
    '__proto__',
    undefined,
    null,
    503,
    { code: 'forbidden' },
  ] as unknown[]

  for (const code of credentialLike) {
    assert.equal(denialMessage('en', code), null, `${String(code)} must not select any copy`)
  }

  for (const locale of ['en', 'id'] as const) {
    for (const code of ['forbidden', 'unavailable'] as const) {
      const message = denialMessage(locale, code)
      if (!message) assert.fail(`${locale}/${code} must select localized copy`)
      assertNoSecrets(`${message.title} ${message.body}`, `${locale}/${code} copy`)
      assert.ok(message.title.trim().length > 0 && message.body.trim().length > 0)
    }
  }

  const forbidden = denialMessage('en', 'forbidden')
  const unavailable = denialMessage('en', 'unavailable')
  if (!forbidden || !unavailable) assert.fail('both stable codes carry copy')
  assert.notEqual(forbidden.title, unavailable.title, 'the two denials are visibly different states')
  assert.match(unavailable.body, /session/i, 'an outage must tell the operator the session is not lost')
  assert.match(forbidden.body, /role/i, 'a refusal must name the reason: the role')
})

void test('anonymous is not a renderable denial: only forbidden and unavailable reach the view', async () => {
  const { decideAccess } = await authz()
  const codes = new Set<string>()
  const identities: (() => Promise<SessionUser | null>)[] = [
    async () => null,
    async () => SYNTHETIC_VIEWER,
    async () => SYNTHETIC_ADMIN,
    async () => {
      throw new MoonApiError(503, 'synthetic hub unavailable')
    },
  ]
  const grants = [true, false]

  for (const identity of identities) {
    for (const grant of grants) {
      const access = await decideAccess(identity, () => grant)
      if (access.status === 'deny') codes.add(access.code)
    }
  }

  assert.deepEqual([...codes].sort(), ['anonymous', 'forbidden', 'unavailable'], 'the whole decision space is these three codes')
  assert.equal(denialMessage('en', 'anonymous'), null, 'the anonymous code selects no copy — it is a redirect, not a screen')
})

void test('a denial is decided before any record is fetched: the guarded page still loads nothing', async () => {
  const { guardModel } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('signed-in-viewer')

  const run = await runGuard(guardModel(publishedModel({ list: ['admin'] }), 'list'))

  assert.equal(run.kind, 'guard')
  if (run.kind === 'guard') assert.deepEqual(run.guard, { allowed: false, code: 'forbidden' })
  assert.deepEqual(
    hubCalls.filter((call) => !call.startsWith(SESSION_URL)),
    [],
    'no model, view or endpoint route was called on the way to a denial',
  )
})

void test('the guard op is passed through to can(): a list rule does not grant create', async () => {
  const { guardModel } = await authz()
  withRequest(SYNTHETIC_COOKIE)
  useHub('signed-in-admin')

  const op: CrudOp = 'list'
  const listing = await runGuard(guardModel(publishedModel({ list: 'auth', create: 'none' }), op))
  assert.equal(listing.kind, 'guard')
  if (listing.kind === 'guard') assert.deepEqual(listing.guard, { allowed: true, user: SYNTHETIC_ADMIN })

  useHub('signed-in-admin')
  const creating = await runGuard(guardModel(publishedModel({ list: 'auth', create: 'none' }), 'create'))
  assert.equal(creating.kind, 'guard')
  if (creating.kind === 'guard') assert.deepEqual(creating.guard, { allowed: false, code: 'forbidden' })
})

void test('the denial view renders localized copy only: no record, no credential, no shell', async () => {
  /**
   * tsx compiles the app's `.tsx` with the classic JSX runtime when it is run
   * from another package's directory, so the element factory has to exist as the
   * global it would be in the app's own build. Nothing else about the view changes.
   */
  const jsxScope = globalThis as { React?: unknown }
  jsxScope.React = (await import('react')).default

  const { AccessDenied } = await import('../src/ui/widgets/AccessDenied.js')
  withRequest(SYNTHETIC_COOKIE)

  for (const code of ['forbidden', 'unavailable'] as const) {
    const rendered = JSON.stringify(await AccessDenied({ code }))
    assert.ok(rendered, `the ${code} denial renders`)
    assertNoSecrets(rendered, `the ${code} denial view`)
  }

  const forbiddenRender = JSON.stringify(await AccessDenied({ code: 'forbidden' }))
  assert.match(forbiddenRender, /Not authorized/, 'the denial names itself in the resolved locale')
  assert.ok(!forbiddenRender.includes('Synthetic sample'), 'a denial renders no privileged title, column or row')
})
