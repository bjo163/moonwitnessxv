import { randomBytes } from 'node:crypto'
import { SESSION_TTL_SECONDS, unauthorized } from '@moonwitness/core'
import { defineAddon, defineModel, m2o, sel, str, ts } from '@moonwitness/moonql'
import { hashPassword, hashPasswordAsync, newToken, verifyPassword, verifyPasswordAsync } from './crypto.js'

export { hashPassword, hashPasswordAsync, verifyPassword, verifyPasswordAsync, newToken }

/** shared with the command center's cookie lifetime (one decision, one number) */
const SESSION_DAYS = SESSION_TTL_SECONDS / 86_400
/** one login attempt's worth of hashing for unknown users (constant work) */
const DUMMY_HASH = `${'0'.repeat(32)}$${'0'.repeat(128)}`
const isoNow = () => new Date().toISOString()
const isoFuture = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString()

/** How long one token's identity may be answered from cache. */
const IDENTITY_TTL_MS = 15_000
/** Ceiling on cached identities, so a crawl of fake tokens cannot grow the heap. */
const IDENTITY_CACHE_MAX = 500

/** read the Bearer token from a raw-ish headers bag */
const bearer = (headers: Record<string, string | string[] | undefined>): string | null => {
  const raw = headers['authorization'] ?? headers['Authorization']
  const value = Array.isArray(raw) ? raw[0] : raw
  return value?.startsWith('Bearer ') ? value.slice(7).trim() : null
}

/**
 * Base auth addon — the first real consumer of moonql's extension points:
 * private fields (passwordHash never leaves the ORM), declarative endpoints
 * (/auth/login, /auth/logout, /auth/me) and provides.resolveUser, which
 * powers `acl` rules on EVERY other addon's models. Zero fastify imports.
 */
export default defineAddon({
  name: 'auth',
  models: {
    auth_users: defineModel({
      label: 'User',
      fields: {
        login: str({ maxLength: 60 }),
        displayName: str({ maxLength: 120 }),
        email: str({ maxLength: 200, null: true }),
        passwordHash: str({ private: true }),
        role: sel(['admin', 'user', 'guest'], { default: 'user' }),
      },
      unique: [['login']],
      rest: false, // users are managed through handlers, never raw CRUD
      // seed ONE admin when the table is empty (both engines)
      seed: async ({ env, log }) => {
        let password = env.MOONQL_AUTH_ADMIN_PASSWORD
        if (!password) {
          if (env.NODE_ENV === 'production') {
            // a generated credential printed into a log sink is not a secret
            throw new Error('moonql-auth: MOONQL_AUTH_ADMIN_PASSWORD must be set in production')
          }
          password = randomBytes(12).toString('hex')
          log.warn(
            {},
            `moonql-auth: MOONQL_AUTH_ADMIN_PASSWORD unset — dev admin created with a generated password (shown once, dev only): ${password}`,
          )
        }
        return [
          {
            login: 'admin',
            displayName: 'Administrator',
            passwordHash: await hashPasswordAsync(password),
            role: 'admin',
          },
        ]
      },
    }),
    auth_sessions: defineModel({
      label: 'Session',
      seedless: true, // honest opt-out: live login state, never default data
      fields: {
        userRef: m2o('auth_users', { index: true }),
        token: str({ unique: true }),
        // the hourly purge asks "which rows are already expired" and nothing else
        expiresAt: ts({ index: true }),
      },
      rest: false,
    }),
  },

  endpoints: {
    '/auth/login': {
      method: 'POST',
      body: { login: str({ minLength: 1 }), password: str({ minLength: 1 }) },
      handler: async ({ body, orm }) => {
        const users = orm.model('auth_users')
        // raw: true — the handler needs the private passwordHash to verify
        const found = await users.search({ limit: 1, where: { login: body.login }, raw: true })
        const user = found.rows[0]
        // Always spend one full hash, unknown user included: skipping it made an
        // absent login measurably faster than a wrong password (enumeration), and
        // the sync variant blocked the event loop for every concurrent attempt.
        const ok = await verifyPasswordAsync(String(body.password), user ? String(user.passwordHash) : DUMMY_HASH)
        if (!user || !ok) {
          throw unauthorized('Invalid credentials')
        }
        const token = newToken()
        await orm.model('auth_sessions').create({
          userRef: user.id,
          token,
          expiresAt: isoFuture(SESSION_DAYS),
        })
        // response-safe row: private fields stripped by the repository default
        return { token, user: await users.get(user.id as string) }
      },
    },

    '/auth/logout': {
      method: 'POST',
      requires: 'auth',
      handler: async ({ user, orm }) => {
        const token = user?.meta?.token
        if (typeof token === 'string') {
          const sessions = orm.model('auth_sessions')
          const found = await sessions.search({ limit: 1, where: { token } })
          const session = found.rows[0]
          if (session) await sessions.remove(session.id as string)
        }
        return { ok: true }
      },
    },

    '/auth/me': {
      method: 'GET',
      requires: 'auth',
      handler: async ({ user, orm }) => orm.model('auth_users').get(user!.id),
    },
  },

  cron: [
    {
      name: 'purge-expired-sessions',
      every: '1h',
      run: async ({ orm }) => {
        const sessions = orm.model('auth_sessions')
        const expired = await sessions.search({ limit: 500, where: { expiresAt: { lt: isoNow() } } })
        for (const row of expired.rows) await sessions.remove(row.id as string)
        return expired.rows.length
      },
    },
  ],

  provides: {
    /**
     * Every guarded request used to cost two queries — a session lookup by token
     * and then the user row — so an API page with a dozen calls did two dozen
     * reads to answer "who is this?". The identity is cached for a short window.
     *
     * The window is the whole trade-off and it is deliberately narrow:
     * - **revocation latency**, not secrecy: a token is only ever held by its own
     *   client, so the cache adds no new exposure — it buys a bounded delay before
     *   a logout or a role change is seen by a request already in flight.
     * - **invalidation is event-driven, not just time-driven.** Deleting a session
     *   or touching the user row drops the entry immediately through the bus, so
     *   the common "log out and it must stop working now" path never waits.
     * - failures are never cached: a brand-new token must resolve on its first
     *   request, and a cache of "unknown" would turn a login into a 401 loop.
     */
    resolveUser: ({ orm, bus }) => {
      interface Cached {
        userId: string
        roles: string[]
        sessionId: string
        expiresAt: number
        at: number
      }
      const cache = new Map<string, Cached>()

      const drop = (predicate: (entry: Cached) => boolean): void => {
        for (const [token, entry] of cache) if (predicate(entry)) cache.delete(token)
      }
      bus.on('model.deleted', (p) => {
        if (p.model === 'auth_sessions') drop((e) => e.sessionId === p.id)
        if (p.model === 'auth_users') drop((e) => e.userId === p.id)
      })
      // a role edit is a privilege change: it may not live out the TTL
      bus.on('model.updated', (p) => {
        if (p.model === 'auth_users') drop((e) => e.userId === String((p.row as { id?: string }).id ?? ''))
        if (p.model === 'auth_sessions') drop((e) => e.sessionId === String((p.row as { id?: string }).id ?? ''))
      })

      return async ({ headers }) => {
        const token = bearer(headers)
        if (!token) return null

        const hit = cache.get(token)
        if (hit && hit.at + IDENTITY_TTL_MS > Date.now() && hit.expiresAt > Date.now()) {
          // re-insert so the Map order tracks the most recently used token
          cache.delete(token)
          cache.set(token, hit)
          return { id: hit.userId, roles: hit.roles, meta: { token } }
        }
        if (hit) cache.delete(token)

        const sessions = orm.model('auth_sessions')
        const live = await sessions.search({
          limit: 1,
          where: { token, expiresAt: { gt: isoNow() } },
        })
        const session = live.rows[0]
        if (!session) return null
        const user = await orm.model('auth_users').get(session.userRef as string)

        if (cache.size >= IDENTITY_CACHE_MAX) cache.delete(cache.keys().next().value as string)
        cache.set(token, {
          userId: user.id as string,
          roles: [String(user.role)],
          sessionId: session.id as string,
          expiresAt: Date.parse(String(session.expiresAt)),
          at: Date.now(),
        })
        return { id: user.id as string, roles: [String(user.role)], meta: { token } }
      }
    },
  },
})
