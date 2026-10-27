/**
 * apps/orbit/src/app/api/ops/state/route.ts
 *
 * M40-06: Next.js BFF route for client-side state retrieval.
 * Proxies to ARSY Hub server-side and returns sanitized OrbitStateProjection.
 * Browser never receives ARSY service keys or direct database credentials.
 */

import { fetchOrbitOperationalState } from '@/lib/server/arsy-runtime-client.ts'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const isSimulated = url.searchParams.get('mode') === 'simulated'

  const state = await fetchOrbitOperationalState({
    forceSimulated: isSimulated,
  })

  const statusCode = state.connectionStatus === 'UNAUTHORIZED' ? 401 : 200

  return Response.json(state, {
    status: statusCode,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  })
}
