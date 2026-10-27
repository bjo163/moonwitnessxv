/**
 * Test fixture for `hq-authz-guard.test.ts` — the request-scoped half of
 * `next/headers`, read outside a Next render.
 *
 * `node:test` has no request store, so `cookies()` / `headers()` would throw and
 * every guard would collapse into `unavailable`. This fixture lets the guard test
 * say what the request carries. It is a fixture, not an auth mechanism: the bag is
 * read lazily from `globalThis` because the module instance is reached through the
 * test's resolver hook rather than through an import it can pass arguments to.
 *
 * Only synthetic markers ever appear here — no token minting, no cookie parsing,
 * no credential handling of any kind.
 */

const SESSION_COOKIE = 'hq_token'

const requestBag = () => globalThis.__HQ_TEST_REQUEST__

export async function cookies() {
  const sessionCookie = requestBag()?.sessionCookie ?? null
  const entries = sessionCookie ? [{ name: SESSION_COOKIE, value: sessionCookie }] : []
  return {
    get: (name) => entries.find((entry) => entry.name === name),
    getAll: () => entries,
    has: (name) => entries.some((entry) => entry.name === name),
  }
}

export async function headers() {
  const acceptLanguage = requestBag()?.acceptLanguage ?? null
  const entries = acceptLanguage ? [['accept-language', acceptLanguage]] : []
  return {
    get: (name) => entries.find(([key]) => key === name)?.[1] ?? null,
    has: (name) => entries.some(([key]) => key === name),
    entries: () => entries[Symbol.iterator](),
  }
}
