import type { PublicLiveTransmissionsOutput } from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'

export interface TransmitPayload {
  message: string
  pseudonym?: string
  stationRef?: string
}

export interface TransmitResponse {
  ok: boolean
  data?: unknown
  error?: string
}

export async function readLiveTransmissions(): Promise<PublicLiveTransmissionsOutput[]> {
  try {
    const res = await serverClient().view('publicLiveTransmissions').read({ limit: 50 })
    return res.rows
  } catch {
    return []
  }
}

export async function transmitDenpa(payload: TransmitPayload): Promise<TransmitResponse> {
  return serverClient().call<TransmitResponse>('/denpa/transmit', {
    method: 'POST',
    body: payload,
  })
}
