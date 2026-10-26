import { MoonApiError } from '@moonwitness/moonql-client'

/** Only a Hub 401 means anonymous; outages and other errors must remain visible. */
export async function resolveHqSession(fetchCurrentUser) {
  try {
    return await fetchCurrentUser()
  } catch (error) {
    if (error instanceof MoonApiError && error.statusCode === 401) return null
    throw error
  }
}
