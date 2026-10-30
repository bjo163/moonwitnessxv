'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, CardBody, CardHeader, EmptyState, PageHeader } from '@moonwitness/moonui'
import { AlertDialog } from '@moonwitness/moonui/client'
import { COPY, type ConsoleLocale } from '@/lib/copy'

interface Tenant { id: string; slug: string; name: string }
interface Profile { id: string; code: string; name: string; uploadKbps: number; downloadKbps: number; status: string }
interface Nas { id: string; nasId: string; displayName: string; address: string; status: string; radsecEnabled: boolean }
interface Session { id: string; sessionKey: string; username: string; status: string; lastEventAt: string; nasRef: string }
interface Health { id: string; targetRef: string; probeKind: string; status: string; freshness: 'fresh' | 'stale' | 'never-checked' | 'unknown'; checkedAt: string | null }
interface Envelope<T> { ok: boolean; data?: T; code?: string }
interface PendingAction { id: string; session: Session; action: 'disconnect' | 'coa' }

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...init, cache: 'no-store' })
  const result = (await response.json().catch(() => ({}))) as Envelope<T>
  if (!response.ok || !result.ok) throw new Error(result.code ?? `http-${response.status}`)
  return result.data as T
}

export function Dashboard({ locale }: { locale: ConsoleLocale }) {
  const copy = COPY[locale]
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selected, setSelected] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [nas, setNas] = useState<Nas[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [health, setHealth] = useState<Health[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [action, setAction] = useState<PendingAction | null>(null)
  const [actionBusy, setActionBusy] = useState(false)

  const loadTenants = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await api<Tenant[]>('/api/isp/tenants')
      setTenants(rows)
      setSelected((current) => current && rows.some((row) => row.id === current) ? current : rows[0]?.id ?? '')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'unavailable')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTenant = useCallback(async (tenantId: string) => {
    setLoading(true)
    setError('')
    setProfiles([])
    setNas([])
    setSessions([])
    setHealth([])
    try {
      const root = `/api/isp/tenants/${encodeURIComponent(tenantId)}`
      const [profileRows, nasRows, sessionRows, healthRows] = await Promise.all([
        api<Profile[]>(`${root}/radius/profiles`),
        api<Nas[]>(`${root}/nas`),
        api<Session[]>(`${root}/sessions`),
        api<Health[]>(`${root}/network/health`),
      ])
      setProfiles(profileRows)
      setNas(nasRows)
      setSessions(sessionRows)
      setHealth(healthRows)
    } catch (reason) {
      setProfiles([])
      setNas([])
      setSessions([])
      setHealth([])
      setError(reason instanceof Error ? reason.message : 'unavailable')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadTenants() }, [loadTenants])
  useEffect(() => { if (selected) void loadTenant(selected) }, [loadTenant, selected])

  const selectedTenant = useMemo(() => tenants.find((tenant) => tenant.id === selected), [selected, tenants])
  const errorCopy = error === 'unauthorized' ? copy.expired : error === 'forbidden' ? copy.forbidden : copy.unavailable
  const closeAction = useCallback(() => { if (!actionBusy) setAction(null) }, [actionBusy])
  const refresh = useCallback(async () => {
    if (selected) await loadTenant(selected)
  }, [loadTenant, selected])

  const confirmAction = useCallback(async () => {
    if (!action || !selected) return
    setActionBusy(true)
    setNotice('')
    try {
      await api(`/api/isp/tenants/${encodeURIComponent(selected)}/sessions/${encodeURIComponent(action.session.id)}/actions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-isp-console': '1' },
        body: JSON.stringify({ actionKey: crypto.randomUUID(), action: action.action }),
      })
      setNotice(copy.actionQueued)
      setAction(null)
      await refresh()
    } catch {
      setNotice(copy.actionFailed)
    } finally {
      setActionBusy(false)
    }
  }, [action, copy.actionFailed, copy.actionQueued, refresh, selected])

  const freshnessLabel = (value: Health['freshness']) => value === 'fresh' ? copy.fresh : value === 'stale' ? copy.stale : value === 'never-checked' ? copy.neverChecked : copy.unknown
  const freshnessTone = (value: Health['freshness']) => value === 'fresh' ? 'ok' as const : value === 'stale' ? 'hot' as const : 'night' as const

  return (
    <div className="isp-shell">
      <header className="isp-topbar">
        <div className="isp-brand">{copy.eyebrow}</div>
        <div className="isp-toolbar">
          <span className="m-muted">{copy.signedIn}</span>
          <div className="isp-locale" aria-label={copy.locale}>
            <a href="/?lang=id" aria-current={locale === 'id'}>ID</a>
            <a href="/?lang=en" aria-current={locale === 'en'}>EN</a>
          </div>
          <form action="/api/session" method="post" onSubmit={(event) => {
            event.preventDefault()
            void fetch('/api/session', { method: 'DELETE' }).finally(() => { window.location.assign('/login') })
          }}>
            <Button type="submit" variant="ghost" size="sm">{copy.signOut}</Button>
          </form>
        </div>
      </header>
      <main className="isp-main">
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        {error ? <Alert role="alert" tone="hot">{errorCopy}</Alert> : null}
        {notice ? <Alert role="status" tone="ok">{notice}</Alert> : null}
        {loading ? <p role="status" className="m-muted">{copy.loading}</p> : null}
        {!loading && !error && tenants.length === 0 ? <EmptyState title={copy.noTenants} /> : null}

        {tenants.length > 0 ? (
          <div className="isp-toolbar" style={{ margin: '1.3rem 0' }}>
            <label className="m-field" htmlFor="isp-tenant">
              <span className="m-field-label">{copy.tenant}</span>
              <select id="isp-tenant" className="m-select" value={selected} onChange={(event) => setSelected(event.target.value)}>
                <option value="">{copy.chooseTenant}</option>
                {tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
              </select>
            </label>
            <Button type="button" variant="ghost" onClick={() => void refresh()} disabled={!selected}>{copy.reload}</Button>
            {selectedTenant ? <Badge tone="accent">{selectedTenant.slug}</Badge> : null}
          </div>
        ) : null}

        {selected && !error ? (
          <>
            <div className="isp-grid">
              <Card>
                <CardHeader title={copy.profiles} />
                <CardBody>
                  {profiles.length === 0 ? <EmptyState title={copy.empty} /> : (
                    <div className="isp-table-wrap"><table className="isp-table">
                      <thead><tr><th>{copy.profileCode}</th><th>{copy.profileName}</th><th>{copy.profileRate}</th><th>{copy.state}</th></tr></thead>
                      <tbody>{profiles.map((row) => <tr key={row.id}><td className="isp-mono">{row.code}</td><td>{row.name}</td><td>{row.downloadKbps} / {row.uploadKbps} kbps</td><td><Badge tone={row.status === 'enabled' ? 'ok' : 'hot'}>{row.status === 'enabled' ? copy.enabled : copy.disabled}</Badge></td></tr>)}</tbody>
                    </table></div>
                  )}
                </CardBody>
              </Card>
              <Card>
                <CardHeader title={copy.nas} />
                <CardBody>
                  {nas.length === 0 ? <EmptyState title={copy.empty} /> : (
                    <div className="isp-table-wrap"><table className="isp-table">
                      <thead><tr><th>{copy.nasName}</th><th>{copy.nasAddress}</th><th>{copy.radsec}</th><th>{copy.state}</th></tr></thead>
                      <tbody>{nas.map((row) => <tr key={row.id}><td>{row.displayName}<div className="m-muted isp-mono">{row.nasId}</div></td><td className="isp-mono">{row.address}</td><td>{row.radsecEnabled ? copy.enabled : copy.disabled}</td><td>{row.status}</td></tr>)}</tbody>
                    </table></div>
                  )}
                </CardBody>
              </Card>
              <Card>
                <CardHeader title={copy.health} />
                <CardBody>
                  {health.length === 0 ? <EmptyState title={copy.empty} /> : (
                    <div className="isp-table-wrap"><table className="isp-table">
                      <thead><tr><th>{copy.target}</th><th>{copy.probe}</th><th>{copy.freshness}</th></tr></thead>
                      <tbody>{health.map((row) => <tr key={row.id}><td className="isp-mono">{row.targetRef}</td><td>{row.probeKind}</td><td><Badge tone={freshnessTone(row.freshness)}>{freshnessLabel(row.freshness)}</Badge>{row.checkedAt ? <div className="m-muted">{new Date(row.checkedAt).toLocaleString(locale)}</div> : null}</td></tr>)}</tbody>
                    </table></div>
                  )}
                </CardBody>
              </Card>
            </div>
            <Card>
              <CardHeader title={copy.sessions} actions={<Button type="button" variant="ghost" size="sm" onClick={() => void refresh()}>{copy.reload}</Button>} />
              <CardBody>
                {sessions.length === 0 ? <EmptyState title={copy.empty} /> : (
                  <div className="isp-table-wrap"><table className="isp-table">
                    <thead><tr><th>{copy.username}</th><th>{copy.sessionKey}</th><th>{copy.state}</th><th>{copy.lastEvent}</th><th>{copy.actionLabel}</th></tr></thead>
                    <tbody>{sessions.map((row) => <tr key={row.id}><td>{row.username}</td><td className="isp-mono">{row.sessionKey}</td><td><Badge tone={row.status === 'stopped' ? 'night' : 'ok'}>{row.status}</Badge></td><td>{new Date(row.lastEventAt).toLocaleString(locale)}</td><td>{row.status !== 'stopped' ? <div className="isp-toolbar"><Button type="button" variant="danger" size="sm" onClick={() => setAction({ id: row.id, session: row, action: 'disconnect' })}>{copy.stop}</Button><Button type="button" variant="accent" size="sm" onClick={() => setAction({ id: row.id, session: row, action: 'coa' })}>{copy.refresh}</Button></div> : null}</td></tr>)}</tbody>
                  </table></div>
                )}
              </CardBody>
            </Card>
            <Card style={{ marginTop: 16 }}>
              <CardHeader title={copy.billing} />
              <CardBody><p className="m-muted">{copy.billingUnavailable}</p></CardBody>
            </Card>
          </>
        ) : null}
      </main>
      <AlertDialog
        isOpen={action !== null}
        onClose={closeAction}
        onConfirm={() => void confirmAction()}
        title={copy.actionTitle}
        message={`${action?.action === 'disconnect' ? copy.stop : copy.refresh}: ${action?.session.sessionKey ?? ''}. ${copy.actionPrompt}`}
        note={copy.actionNote}
        confirmLabel={copy.confirm}
        cancelLabel={copy.cancel}
        busy={actionBusy}
      />
    </div>
  )
}
