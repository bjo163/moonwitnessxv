import { createServerSdk } from '@moonwitness/moonql-client'

/** Keep HQ's server-only Hub client construction shared with its auth tests. */
export function createHeadquartersServerSdk(radioApiUrl, token, fetch) {
  return createServerSdk({
    env: { RADIO_API_URL: radioApiUrl },
    token,
    ...(fetch ? { fetch } : {}),
  })
}
