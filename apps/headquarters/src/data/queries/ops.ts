import { serverClient } from '@/data/sdk'
import type { OpsDashboard } from '@/data/types'

/** one request for the whole command-center overview */
export async function dashboard(): Promise<OpsDashboard> {
  return serverClient().call<OpsDashboard>('/ops/dashboard')
}
