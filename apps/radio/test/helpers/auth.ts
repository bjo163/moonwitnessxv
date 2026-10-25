import type { FastifyInstance } from 'fastify'

/**
 * Shared test identity: write ACLs are declared on every REST model now, so
 * tests that create/update/delete through the API need a real admin token
 * instead of relying on anonymous writes.
 */
export const TEST_ADMIN_PASSWORD = 'ci-admin-pass'

/** Set the env the auth addon reads, before `buildApp`/`bootMoonQl` runs. */
export function withTestAdmin(): void {
  process.env.MOONQL_AUTH_ADMIN_PASSWORD = TEST_ADMIN_PASSWORD
}

/** Bearer header for the seeded admin, logged in through the real endpoint. */
export async function adminHeaders(app: FastifyInstance, prefix = '/api/v1'): Promise<Record<string, string>> {
  const login = await app.inject()
    .post(`${prefix}/auth/login`)
    .body({ login: 'admin', password: TEST_ADMIN_PASSWORD })
    .end()
  if (login.statusCode !== 200) throw new Error(`test login failed (${login.statusCode}): ${login.body}`)
  const token = login.json<{ data: { token: string } }>().data.token
  return { authorization: `Bearer ${token}` }
}
