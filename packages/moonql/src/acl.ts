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
 * Access role check as a question rather than an exception: `expand` has to decide
 * whether the relation is visible at all, not abort the request that asked for it.
 */
export function allowsAcl(rule: AclRule | undefined, user: User | null): boolean {
  if (rule === undefined || rule === 'public') return true
  if (!user) return false
  if (rule === 'auth') return true
  return rule.some((role) => user.roles.includes(role))
}

/**
 * Access role check: undefined/'public' always pass (backward compatible);
 * 'auth' needs any user; an array needs a user holding one of those roles.
 */
export function checkAcl(rule: AclRule | undefined, user: User | null): void {
  if (allowsAcl(rule, user)) return
  if (!user) throw unauthorized()
  throw forbidden()
}
