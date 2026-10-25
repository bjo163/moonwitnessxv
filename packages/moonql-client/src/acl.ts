import type { ModelMeta } from './schema.js'

/**
 * Either shape of "who is asking": the hub's resolved identity (`roles`), or a
 * user row that carries a single role column (`role`, like `auth_users`).
 */
export interface AclUser {
  roles?: readonly string[] | string[]
  role?: string | null
}

export type CrudOp = 'list' | 'get' | 'create' | 'update' | 'remove'

const heldRoles = (user: AclUser | null | undefined): string[] =>
  user?.roles ? [...user.roles] : user?.role ? [user.role] : []

/**
 * May this caller run `op` on this model?
 *
 * Computed from the hub's published `_schema` (`operations` + `acl`), so a UI
 * renders exactly the buttons the API will honour instead of offering actions
 * that come back as 403. Mirrors moonql's `checkAcl`: undefined/'public' = open,
 * 'auth' = any identity, an array = one of those roles, 'none' = no route.
 */
export function can(model: ModelMeta, user: AclUser | null | undefined, op: CrudOp): boolean {
  if (!model.operations[op]) return false
  const rule = model.acl?.[op]
  if (rule === undefined || rule === 'none') return false
  if (rule === 'public') return true
  if (rule === 'auth') return Boolean(user)
  const wanted = Array.isArray(rule) ? rule : [rule]
  return heldRoles(user).some((role) => wanted.includes(role))
}
