import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { badRequest, unauthorized } from '@moonwitness/core'
import { bool, defineAddon, defineModel, m2o, str } from '@moonwitness/moonql'

/** deterministic hash: unlike scrypt, a high-entropy token must be *lookable-up* */
const hashKey = (key: string) => createHash('sha256').update(key).digest('hex')

/**
 * moonql-apikeys — machine-to-machine tokens, built on the auth addon.
 * Proves the multi-addon resolveUser chain: session bearer (auth) and
 * x-api-key (this addon) are tried in dependency order, first match wins.
 * Keys are 192-bit random secrets shown exactly once; only the sha256 is
 * stored (private), compared constant-time after the equality lookup.
 */
export const apikeys = defineAddon({
  name: 'apikeys',
  version: '1.0.0',
  depends: ['auth'],
  models: {
    api_keys: defineModel({
      label: 'API key',
      seedless: true, // honest opt-out: machine credentials are never shipped
      rest: false, // deliberately no auto-REST: the raw key must never be listable
      fields: {
        name: str({ maxLength: 80 }),
        keyHash: str({ private: true }),
        ownerRef: m2o('auth_users', { index: true }),
        active: bool({ default: true }),
        // a key carries the roles it may act as (CSV). Without this every key
        // was an unscoped 'bot', so a display widget held whatever 'bot' can do.
        roles: str({ maxLength: 120, default: 'bot' }),
      },
      unique: [['keyHash']],
    }),
  },
  endpoints: {
    listKeys: {
      path: '/api-keys',
      method: 'GET',
      requires: ['admin'],
      menu: { group: 'System', icon: 'KY', order: 60 },
      handler: async ({ orm }) => {
        const page = await orm.model('api_keys').search({ limit: 100, order: '-createdAt' })
        return page.rows // hydrated -> private keyHash is stripped automatically
      },
    },
    createKey: {
      path: '/api-keys',
      method: 'POST',
      requires: ['admin'],
      body: { name: str({ maxLength: 80 }), roles: str({ maxLength: 120, null: true }) },
      handler: async ({ body, orm, user, status }) => {
        if (!user) throw unauthorized()
        const roles = String(body.roles ?? 'bot').trim()
        if (!/^[a-z0-9_-]+(,[a-z0-9_-]+)*$/.test(roles)) {
          throw badRequest('roles must be a comma separated list of role names (a-z0-9_-)')
        }
        status(201)
        const key = randomBytes(24).toString('hex')
        const row = await orm.model('api_keys').create({
          name: body.name,
          keyHash: hashKey(key),
          ownerRef: user.id,
          roles,
        })
        // the only response that ever contains the raw key
        return { id: row.id, name: row.name, roles, key }
      },
    },
    revokeKey: {
      path: '/api-keys/:id',
      method: 'DELETE',
      requires: ['admin'],
      handler: async ({ params, orm, status }) => {
        const id = params.id
        if (!id) throw badRequest('key id is required')
        // explicit existence check: revoking a nonsense id must say 404, not pretend
        await orm.model('api_keys').get(id)
        await orm.model('api_keys').remove(id)
        status(204)
        return null
      },
    },
  },
  provides: {
    resolveUser: ({ orm }) => async ({ headers }) => {
      const raw = headers['x-api-key']
      const key = Array.isArray(raw) ? raw[0] : raw
      if (!key) return null
      const keyHash = hashKey(key)
      const page = await orm.model('api_keys').search({ limit: 1, where: { keyHash, active: true }, raw: true })
      const row = page.rows[0]
      // constant-time confirm the equality lookup (defense in depth)
      if (!row || typeof row.keyHash !== 'string' || row.keyHash.length !== keyHash.length) return null
      if (!timingSafeEqual(Buffer.from(row.keyHash), Buffer.from(keyHash))) return null
      const roles = String(row.roles ?? 'bot')
        .split(',')
        .map((role) => role.trim())
        .filter(Boolean)
      return { id: String(row.ownerRef), roles: roles.length ? roles : ['bot'], meta: { keyId: String(row.id), name: String(row.name) } }
    },
  },
})

export default apikeys
