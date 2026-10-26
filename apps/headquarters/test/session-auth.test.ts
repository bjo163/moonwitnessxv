import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'
import { MoonApiError } from '@moonwitness/moonql-client'
import { middleware } from '../src/middleware.js'
import { createHeadquartersServerSdk } from '../src/data/server-sdk.mjs'
import { resolveHqSession } from '../src/lib/session-auth.mjs'

const hubUser = { id: 'admin-1', login: 'admin', displayName: 'Admin', role: 'admin' }

function hubFetch(status: number, authorization: string[]) {
  return async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    assert.equal(String(input), 'http://hub.test/api/v1/auth/me')
    authorization.push(new Headers(init?.headers).get('authorization') ?? '')
    return Response.json(
      status === 200 ? { ok: true, data: hubUser } : { ok: false, error: { message: 'unauthorized' } },
      { status },
    )
  }
}

void test('a present HQ cookie passes only middleware; the Hub decides whether it is a session', async () => {
  const gate = middleware(new NextRequest('http://hq.test/', { headers: { cookie: 'hq_token=forged-cookie' } }))
  assert.equal(gate.headers.get('x-middleware-next'), '1')

  const sent: string[] = []
  const client = createHeadquartersServerSdk('http://hub.test/api/v1', () => 'forged-cookie', hubFetch(401, sent))
  const user = await resolveHqSession(() => client.call('/auth/me'))

  assert.equal(sent[0], 'Bearer forged-cookie')
  assert.equal(user, null, 'the protected layout receives no user after Hub 401')
})

void test('an expired opaque cookie is rejected by the Hub and is not treated as authenticated', async () => {
  const sent: string[] = []
  const client = createHeadquartersServerSdk('http://hub.test/api/v1', () => 'expired-cookie', hubFetch(401, sent))
  const user = await resolveHqSession(() => client.call('/auth/me'))

  assert.equal(sent[0], 'Bearer expired-cookie')
  assert.equal(user, null)
})

void test('a Hub-confirmed session returns the admin user', async () => {
  const sent: string[] = []
  const client = createHeadquartersServerSdk('http://hub.test/api/v1', () => 'valid-cookie', hubFetch(200, sent))
  const user = await resolveHqSession(() => client.call('/auth/me'))

  assert.equal(sent[0], 'Bearer valid-cookie')
  assert.deepEqual(user, hubUser)
})

void test('a Hub outage is surfaced instead of being converted to an anonymous session', async () => {
  const client = createHeadquartersServerSdk('http://hub.test/api/v1', () => 'valid-cookie', hubFetch(503, []))

  await assert.rejects(
    () => resolveHqSession(() => client.call('/auth/me')),
    (error: unknown) => error instanceof MoonApiError && error.statusCode === 503,
  )
})

void test('a request without a cookie is redirected to login', () => {
  const gate = middleware(new NextRequest('http://hq.test/private'))
  assert.equal(gate.status, 307)
  assert.equal(gate.headers.get('location'), 'http://hq.test/login?next=%2Fprivate')
})
