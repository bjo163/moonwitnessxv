import { forbidden, unauthorized } from '@moonwitness/core'
import type { AclRule, AclSpec } from './model.js'
import type { User } from './addon.js'

export interface ResolvedAcl {
  /** role gate enforced in preHandler; undefined = public */
  roleRule: AclRule | undefined
  /** row predicate enforced in handlers (list filters, single rows 403) */
  row?: (user: User, row: Record<string, unknown>) => boolean
}

/** split an AclSpec into its role part and (optional) row predicate */
export function resolveAcl(spec: AclSpec | undefined): ResolvedAcl {
  if (spec === undefined || typeof spec === 'string' || Array.isArray(spec)) {
    return { roleRule: spec }
  }
  // a row predicate always needs an identity: default the role gate to 'auth'
  return { roleRule: spec.roles ?? 'auth', row: spec.row }
}

/**
 * Access role check: undefined/'public' always pass (backward compatible);
 * 'auth' needs any user; an array needs a user holding one of those roles.
 */
export function checkAcl(rule: AclRule | undefined, user: User | null): void {
  if (rule === undefined || rule === 'public') return
  if (!user) throw unauthorized()
  if (rule === 'auth') return
  if (!rule.some((role) => user.roles.includes(role))) throw forbidden()
}
