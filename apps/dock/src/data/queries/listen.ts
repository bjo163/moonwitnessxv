import { serverClient } from '@/data/sdk'

/** the public beacon: one POST, no token, the charts become real */
export async function recordListen(input: {
  stationRef: string
  event?: 'start' | 'stop' | 'skip'
  listener?: string
  seconds?: number
}): Promise<void> {
  await serverClient().call('/listen', {
    method: 'POST',
    body: {
      stationRef: input.stationRef,
      event: input.event ?? 'start',
      ...(input.listener ? { listener: input.listener.slice(0, 60) } : {}),
      ...(typeof input.seconds === 'number' ? { seconds: Math.round(input.seconds) } : {}),
    },
  })
}
