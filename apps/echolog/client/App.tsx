import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Alert,
  Button,
  PageHeader,
  Panel,
  SplitView,
  Stat,
  TextInput,
} from '@moonwitness/moonui'
import { EchologConfirmDialog } from './components/EchologConfirmDialog.js'
import { EchologDetailPanel } from './components/EchologDetailPanel.js'
import { EchologObjectList, type WatchRow } from './components/EchologObjectList.js'
import { EchologUploadPanel, type ConfirmRequest } from './components/EchologUploadPanel.js'
import { deleteObject, fetchHealth, requestDownloadGrant, runGarbageCollection, fetchObjectMeta, ApiError, type HealthSnapshot } from './lib/api.js'
import { formatBytes } from './lib/format.js'
import { isDigest, parseWatchlist, refFromSidecar, removeRef, serializeWatchlist, upsertRef, WATCHLIST_STORAGE_KEY } from './lib/watchlist.js'
import type { DownloadGrant, GcResult, ObjectRef, ObjectSidecar } from './types.js'

type MetaEntry = { sidecar: ObjectSidecar; error?: never } | { sidecar?: never; error: string }

interface PendingConfirm {
  request: ConfirmRequest
  resolve: (confirmed: boolean) => void
}

export function App(): ReactNode {
  const [token, setToken] = useState('')
  const [tokenDraft, setTokenDraft] = useState('')
  const [refs, setRefs] = useState<ObjectRef[]>(() => parseWatchlist(localStorage.getItem(WATCHLIST_STORAGE_KEY)))
  const [meta, setMeta] = useState<Record<string, MetaEntry>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [grant, setGrant] = useState<DownloadGrant | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [refreshBusy, setRefreshBusy] = useState(false)
  const [health, setHealth] = useState<HealthSnapshot | null>(null)
  const [gcResult, setGcResult] = useState<GcResult | null>(null)
  const [gcError, setGcError] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    void fetchHealth().then(setHealth)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, serializeWatchlist(refs))
    } catch {
      // Storage full or blocked: the session keeps working from memory.
    }
  }, [refs])

  const askConfirm = useCallback((request: ConfirmRequest) => new Promise<boolean>((resolve) => {
    setPendingConfirm({ request, resolve })
  }), [])

  const resolveConfirm = useCallback((confirmed: boolean) => {
    const current = pendingConfirm
    setPendingConfirm(null)
    current?.resolve(confirmed)
  }, [pendingConfirm])

  const refreshAll = useCallback(async () => {
    if (!token) return
    setRefreshBusy(true)
    const entries = await Promise.all(refs.map(async (ref): Promise<[string, MetaEntry]> => {
      try {
        return [ref.digest, { sidecar: await fetchObjectMeta(ref.digest, token) }]
      } catch (cause) {
        return [ref.digest, { error: cause instanceof ApiError ? cause.message : 'metadata read failed' }]
      }
    }))
    setMeta((previous) => ({ ...previous, ...Object.fromEntries(entries) }))
    setRefreshBusy(false)
  }, [token, refs])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  const rows: WatchRow[] = useMemo(
    () => refs.map((ref) => {
      const entry = meta[ref.digest]
      return { ref, sidecar: entry?.sidecar ?? null, error: entry?.error ?? null }
    }),
    [refs, meta],
  )

  const selectedRef = selected ? rows.find((row) => row.ref.digest === selected) ?? null : null
  const selectedSidecar = selectedRef?.sidecar ?? null

  function select(digest: string): void {
    setSelected(digest)
    setGrant(null)
    setDeleteError(null)
  }

  async function track(digestInput: string): Promise<string | null> {
    const digest = digestInput.trim().toLowerCase()
    if (!isDigest(digest)) return 'Enter a 64-character hexadecimal SHA-256 digest.'
    if (!token) return 'An ARSY session token is required before reading object metadata.'
    if (refs.some((ref) => ref.digest === digest)) return 'That digest is already tracked.'
    try {
      const sidecar = await fetchObjectMeta(digest, token)
      setMeta((previous) => ({ ...previous, [digest]: { sidecar } }))
      setRefs((previous) => upsertRef(previous, refFromSidecar(sidecar)))
      select(digest)
      return null
    } catch (cause) {
      return cause instanceof ApiError ? cause.message : 'The metadata read failed.'
    }
  }

  function untrack(objectKey: string): void {
    setRefs((previous) => removeRef(previous, objectKey))
    if (selected && `sha256/${selected}` === objectKey) {
      setSelected(null)
      setGrant(null)
    }
  }

  async function requestGrant(): Promise<void> {
    if (!selected) return
    setActionBusy(true)
    try {
      setGrant(await requestDownloadGrant(selected, token))
    } catch (cause) {
      setDeleteError(cause instanceof ApiError ? cause.message : 'The grant request failed.')
    } finally {
      setActionBusy(false)
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!selectedRef) return
    const objectKey = selectedRef.ref.object_key
    const confirmed = await askConfirm({
      title: 'Confirm object deletion',
      objectKey,
      detail: 'Deletion is permanent. ECHOLOG will refuse with 409 while legal hold is active or the retention deadline has not elapsed; the refusal reason is shown exactly as the service sends it.',
      confirmLabel: 'Delete permanently',
    })
    if (!confirmed) return
    setActionBusy(true)
    setDeleteError(null)
    try {
      await deleteObject(selectedRef.ref.digest, token)
      untrack(objectKey)
    } catch (cause) {
      if (cause instanceof ApiError) setDeleteError(cause.message)
      else setDeleteError('The delete request did not reach ECHOLOG.')
    } finally {
      setActionBusy(false)
    }
  }

  async function confirmGc(): Promise<void> {
    const confirmed = await askConfirm({
      title: 'Run administrator GC',
      objectKey: '— whole-storage sweep, no single key —',
      detail: 'GC removes only objects whose retention has elapsed and that carry no legal hold. Held objects are reported, never forced.',
      confirmLabel: 'Run GC',
    })
    if (!confirmed) return
    setActionBusy(true)
    setGcError(null)
    try {
      setGcResult(await runGarbageCollection(token))
    } catch (cause) {
      setGcResult(null)
      setGcError(cause instanceof ApiError ? cause.message : 'The GC request failed.')
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <div className="echolog-shell">
      <header className="echolog-topbar">
        <PageHeader
          title="ECHOLOG // Storage Console"
          subtitle="D19 object storage operator surface — loopback dev console over the documented REST API"
        />
        <div className="echolog-auth">
          <TextInput
            type="password"
            aria-label="ARSY session bearer token"
            placeholder="ARSY session token (kept in memory only)"
            value={tokenDraft}
            onChange={(event) => setTokenDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setToken(tokenDraft.trim())
              }
            }}
          />
          <Button variant="primary" onClick={() => setToken(tokenDraft.trim())}>
            Use session
          </Button>
          <span className="m-muted" aria-live="polite">
            {token ? 'Operator session armed.' : 'No session armed — reads and writes are not attempted.'}
          </span>
        </div>
      </header>

      <div className="echolog-status">
        <Stat
          label="Service"
          value={health ? (health.reachable ? 'reachable on this origin' : 'not reachable') : 'checking…'}
          hint={health?.detail}
        />
        <Stat label="Tracked objects" value={String(refs.length)} />
        <Stat
          label="Scan coverage"
          value="not scanned"
          hint="ECHOLOG v1 records scan: skipped for every object; the console says so in words."
        />
      </div>

      <main className="echolog-main">
        <SplitView
          leftRatio="55%"
          left={
            <div className="echolog-stack">
              <EchologObjectList
                rows={rows}
                selectedKey={selectedRef?.ref.object_key ?? null}
                busy={refreshBusy}
                onSelect={select}
                onTrack={track}
                onUntrack={untrack}
                onRefreshAll={() => void refreshAll()}
              />
              <EchologUploadPanel
                token={token}
                onCommitted={(ref) => {
                  // Only the four reference fields are kept locally; the detail
                  // read below fetches the real sidecar from ECHOLOG.
                  setRefs((previous) => upsertRef(previous, ref))
                  select(ref.digest)
                }}
                askConfirm={askConfirm}
              />
            </div>
          }
          right={
            <div className="echolog-stack">
              <EchologDetailPanel
                sidecar={selectedSidecar}
                metaError={selectedRef?.error ?? null}
                grant={grant}
                nowMs={nowMs}
                deleteError={deleteError}
                busy={actionBusy}
                onRefresh={() => void refreshAll()}
                onRequestGrant={() => void requestGrant()}
                onDelete={() => void confirmDelete()}
              />
              <Panel title="Garbage collection" subtitle="Administrator action; held objects are reported, never deleted.">
                <div className="echolog-row">
                  <Button variant="danger" onClick={() => void confirmGc()} disabled={!token || actionBusy}>
                    Run GC
                  </Button>
                </div>
                {gcResult ? (
                  <Alert tone="accent">
                    GC finished: {String(gcResult.deleted.length)} deleted ({formatBytes(gcResult.bytes_freed)} freed),
                    {' '}{String(gcResult.held.length)} held
                    {gcResult.held.length > 0 ? `: ${gcResult.held.map((item) => `${item.object_key} — ${item.reason === 'legal_hold' ? 'legal hold active' : 'retention still active'}`).join('; ')}` : '.'}
                  </Alert>
                ) : null}
                {gcError ? <Alert tone="hot">GC refused — reason shown verbatim: {gcError}</Alert> : null}
              </Panel>
            </div>
          }
        />
      </main>

      {pendingConfirm ? (
        <EchologConfirmDialog
          title={pendingConfirm.request.title}
          objectKey={pendingConfirm.request.objectKey}
          detail={pendingConfirm.request.detail}
          confirmLabel={pendingConfirm.request.confirmLabel}
          busy={false}
          onConfirm={() => resolveConfirm(true)}
          onCancel={() => resolveConfirm(false)}
        />
      ) : null}
    </div>
  )
}
