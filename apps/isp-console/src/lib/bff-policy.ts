const ID = /^[A-Za-z0-9_-]{1,160}$/

export function allowedIspPath(method: string, segments: readonly string[]): string | null {
  if (segments.some((segment) => !ID.test(segment))) return null
  if (method === 'GET' && segments.length === 1 && segments[0] === 'tenants') return '/isp/tenants'
  if (segments[0] !== 'tenants' || !segments[1]) return null

  const tenant = segments[1]
  if (method === 'GET' && segments.length === 4 && segments[2] === 'radius' && segments[3] === 'profiles') {
    return `/isp/tenants/${tenant}/radius/profiles`
  }
  if (method === 'GET' && segments.length === 3 && segments[2] === 'nas') {
    return `/isp/tenants/${tenant}/nas`
  }
  if (method === 'GET' && segments.length === 3 && segments[2] === 'sessions') {
    return `/isp/tenants/${tenant}/sessions`
  }
  if (method === 'GET' && segments.length === 4 && segments[2] === 'network' && segments[3] === 'health') {
    return `/isp/tenants/${tenant}/network/health`
  }
  if (
    method === 'POST' && segments.length === 5 && segments[2] === 'sessions' &&
    segments[4] === 'actions' && ID.test(segments[3] ?? '')
  ) {
    return `/isp/tenants/${tenant}/sessions/${segments[3]}/actions`
  }
  return null
}
