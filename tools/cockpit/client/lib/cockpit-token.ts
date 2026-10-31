/**
 * The cockpit boot token is delivered only via the same-origin `/api/config`
 * response and must be echoed on every mutating request. It lives in a module
 * singleton because the whole app is one page and the actions hook does not
 * otherwise see the config fetch. This is a CSRF guard, not a secret.
 */
let cockpitToken = ''

export function setCockpitToken(token: string): void {
  cockpitToken = token
}

export function getCockpitToken(): string {
  return cockpitToken
}

/** Headers for a mutating fetch; throws if the token has not loaded yet. */
export function cockpitAuthHeaders(): Record<string, string> {
  if (!cockpitToken) {
    throw new Error('cockpit token not loaded yet; retry after the dashboard finishes initialising')
  }
  return { 'x-moondeck-token': cockpitToken }
}
