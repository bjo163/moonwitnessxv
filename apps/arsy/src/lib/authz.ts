import { checkAcl, type AclRule, type User } from '@moonwitness/moonql'
import type { FastifyRequest } from 'fastify'

/**
 * Authorization for handwritten modules. The generated REST layer builds its
 * own guard from each model's `acl`; routes declared by a module folder have no
 * model to inherit from, so they take the same decision from here instead of
 * re-implementing identity lookup + role matching per route.
 */

/** Roles allowed on the hub's control surfaces (channels, ops, studio data). */
export const ADMIN_ROLES: string[] = ['admin']

/** Walk the addon resolver chain (session bearer, api key, …) for this request. */
export async function identify(request: FastifyRequest): Promise<User | null> {
  const resolve = request.server.moonql.resolveUser
  return resolve ? resolve(request) : null
}

/** preHandler factory: identical semantics to the generated CRUD guard. */
export const requireRoles =
  (rule: AclRule) =>
  async (request: FastifyRequest): Promise<void> => {
    checkAcl(rule, await identify(request))
  }

/** Anything that can start/stop/send on a channel, or read a pairing QR. */
export const requireAdmin = requireRoles(ADMIN_ROLES)
