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
  // A failed read propagates instead of becoming an empty list: an outage and a
  // quiet band are different facts, and the panel shows them differently.
  const res = await serverClient().view('publicLiveTransmissions').read({ limit: 50 })
  return res.rows
}

export async function transmitDenpa(payload: TransmitPayload): Promise<TransmitResponse> {
  return serverClient().call<TransmitResponse>('/denpa/transmit', {
    method: 'POST',
    body: payload,
  })
}
