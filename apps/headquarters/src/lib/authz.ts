import { can, type CrudOp, type ModelMeta, type SchemaDocument, type ViewMeta } from '@moonwitness/moonql-client'
import { redirect } from 'next/navigation'
import { me } from '@/data/queries/session'
import type { SessionUser } from '@/data/types'
import { resolveHqSession } from './session-auth.mjs'

/**
 * Server-side authorization for the HQ private routes.
 *
 * HQ is NOT an auth or ACL owner. The two authorities it borrows are:
 *  - the hub's `/auth/me` (via `me()`, whose 401-only-means-anonymous rule lives
 *    in `session-auth.mjs` and is preserved here untouched), and
 *  - the hub's published `_schema` ACL, matched by the shared `can()` from
 *    `@moonwitness/moonql-client`.
 * There is no local role table: a route's requirement is read from the document
 * the hub itself publishes, so HQ can only ever be as strict as the API is.
 */

export type DenialCode = 'forbidden' | 'unavailable'

/** The full decision space, including the anonymous case the guards redirect on. */
export type Access =
  | { status: 'allow'; user: SessionUser }
  | { status: 'deny'; code: 'anonymous' | DenialCode }

/** What a page may render once the check has run. */
export type Guard = { allowed: true; user: SessionUser } | { allowed: false; code: DenialCode }

export type Grant = (user: SessionUser) => boolean

/**
 * A view or endpoint ACL is one bare rule (`"public"`, `"auth"`, `["admin"]`),
 * while `can()` takes an operation-keyed model ACL. Presenting the bare rule as
 * a one-operation model keeps the shared matcher the ONLY rule implementation —
 * HQ deliberately does not re-derive what a rule means.
 */
const ruleAsMeta = (rule: string | string[] | undefined): ModelMeta =>
  ({ operations: { get: true }, acl: { get: rule ?? 'none' } }) as unknown as ModelMeta

export const ruleAllows = (rule: string | string[] | undefined, user: SessionUser | null): boolean =>
  can(ruleAsMeta(rule), user, 'get')

/**
 * Pure decision on an injected identity fetcher, so the semantics below are
 * testable without Next's request context.
 *
 * A hub outage is `unavailable`, never `anonymous`: the session may be perfectly
 * valid and must not be thrown away because the hub was unreachable.
 */
export async function decideAccess(
  fetchCurrentUser: () => Promise<SessionUser | null>,
  grant: Grant,
): Promise<Access> {
  let user: SessionUser | null
  try {
    user = await resolveHqSession(fetchCurrentUser)
  } catch {
    return { status: 'deny', code: 'unavailable' }
  }
  if (!user) return { status: 'deny', code: 'anonymous' }
  return grant(user) ? { status: 'allow', user } : { status: 'deny', code: 'forbidden' }
}

/**
 * Route-level guard bound to the request's real session.
 *
 * Anonymous is not a rendering decision: it is the same redirect the admin
 * layout already performs, so a guard never turns a signed-out operator into a
 * fake admin shell. `forbidden` and `unavailable` are returned for the page to
 * render as an honest localized denial (with no data loaded).
 */
async function enforce(grant: Grant): Promise<Guard> {
  const access = await decideAccess(() => me(), grant)
  if (access.status === 'deny') {
    if (access.code === 'anonymous') redirect('/login?error=expired')
    return { allowed: false, code: access.code }
  }
  return { allowed: true, user: access.user }
}

/** May this caller run `op` on this published model? Checked before any read. */
export function guardModel(meta: ModelMeta, op: CrudOp): Promise<Guard> {
  return enforce((user) => can(meta, user, op))
}

/** May this caller read this published view? Its own `acl` rule is the gate. */
export function guardView(view: ViewMeta): Promise<Guard> {
  return enforce((user) => ruleAllows(view.acl, user))
}

/**
 * May this caller hit this hub endpoint? The requirement comes from the
 * endpoint's published ACL, not a list kept here. An endpoint the hub does not
 * publish is treated as forbidden — HQ will not guess a permission it cannot
 * read from the authority.
 */
export function guardEndpoint(doc: SchemaDocument, method: string, path: string): Promise<Guard> {
  const wanted = method.toUpperCase()
  const endpoint = doc.endpoints.find((entry) => entry.path === path && entry.method.toUpperCase() === wanted)
  return enforce(endpoint ? (user) => ruleAllows(endpoint.acl, user) : () => false)
}
