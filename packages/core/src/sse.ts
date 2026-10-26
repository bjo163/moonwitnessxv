/**
 * The four headers a Server-Sent Events response must carry, once.
 *
 * Written identically in three places (the hub's endpoint router and both Next
 * relays); `cache-control: no-transform` and `x-accel-buffering: no` are the two
 * that a proxy silently drops frames over, so they are not optional decorations.
 */
export const SSE_HEADERS = {
  'content-type': 'text/event-stream; charset=utf-8',
  'cache-control': 'no-cache, no-transform',
  connection: 'keep-alive',
  'x-accel-buffering': 'no',
} as const
