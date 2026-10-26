import { failJson, okJson } from '@moonwitness/moonql-client'
import { transmitDenpa, type TransmitPayload } from '@/data/queries/denpa'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  let payload: TransmitPayload
  try {
    payload = (await request.json()) as TransmitPayload
  } catch {
    return failJson(null, { status: 400, message: 'invalid JSON body' })
  }

  if (!payload.message || !payload.message.trim()) {
    return failJson(null, { status: 400, message: 'message cannot be empty' })
  }

  try {
    const result = await transmitDenpa({
      message: payload.message.trim(),
      ...(payload.pseudonym ? { pseudonym: payload.pseudonym.trim() } : {}),
      ...(payload.stationRef ? { stationRef: payload.stationRef.trim() } : {}),
    })
    return okJson(result, { status: 201 })
  } catch (error) {
    return failJson(error)
  }
}
