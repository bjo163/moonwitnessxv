import { failJson, okJson } from '@moonwitness/moonql-client'
import { recordListen } from '@/data/queries/listen'

export const dynamic = 'force-dynamic'

interface BeaconPayload {
  stationRef?: string
  event?: 'start' | 'stop' | 'skip'
  listener?: string
  seconds?: number
}

/** the beacon relay: browser -> dock BFF -> public POST /listen on the hub */
export async function POST(request: Request): Promise<Response> {
  let payload: BeaconPayload
  try {
    payload = (await request.json()) as BeaconPayload
  } catch {
    return failJson(null, { status: 400, message: 'invalid JSON body' })
  }

  if (!payload.stationRef) {
    return failJson(null, { status: 400, message: 'stationRef is required' })
  }

  try {
    await recordListen({
      stationRef: payload.stationRef,
      ...(payload.event ? { event: payload.event } : {}),
      ...(payload.listener ? { listener: payload.listener } : {}),
      ...(typeof payload.seconds === 'number' ? { seconds: payload.seconds } : {}),
    })
    return okJson({ recorded: true }, { status: 201 })
  } catch (error) {
    // a hub 400 stays a 400 for the browser; only unknown failures are 502
    return failJson(error)
  }
}
