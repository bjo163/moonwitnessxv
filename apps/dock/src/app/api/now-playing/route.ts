import { failJson, okJson } from '@moonwitness/moonql-client'
import { nowPlaying } from '@/data/queries/catalog'

export const dynamic = 'force-dynamic'

/** the browser polls this route; it never talks to the radio API itself */
export async function GET(): Promise<Response> {
  try {
    return okJson(await nowPlaying(), { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    // keeps the hub's own status (a 404 upstream is not a bad gateway)
    return failJson(error, { headers: { 'cache-control': 'no-store' } })
  }
}
