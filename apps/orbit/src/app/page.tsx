import { Badge } from '@moonwitness/moonui'
import { SIMULATED_OPERATIONS } from '../fixtures/simulated-operations.ts'
import { orbitCopy } from '../lib/orbit-copy'
import { getRequestLocale } from '../lib/request-locale'
import { OrbitShellHeader } from '../components/OrbitShellHeader'
import { OrbitNav } from '../components/OrbitNav'
import { OrbitOperationsWorkspace } from '../components/OrbitOperationsWorkspace'
import { fetchOrbitOperationalState } from '../lib/server/arsy-runtime-client.ts'

export interface PageProps {
  searchParams?: Promise<{ locale?: string; mode?: string }>
}

export default async function OrbitPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {}
  const locale = await getRequestLocale(resolvedParams.locale)
  const copy = orbitCopy(locale)

  const isSimulatedExplicit = resolvedParams.mode === 'simulated'
  const state = await fetchOrbitOperationalState({
    forceSimulated: isSimulatedExplicit,
  })

  const isOffline = state.connectionStatus === 'OFFLINE'
  const activeWorkspaceData = isOffline && state.workstations.length === 0
    ? SIMULATED_OPERATIONS
    : state

  return (
    <>
      <OrbitShellHeader
        locale={locale}
        copy={copy}
        connectionStatus={state.connectionStatus}
        freshness={state.freshness}
        lastSyncTimestamp={state.lastSyncTimestamp}
        reviewSurface={activeWorkspaceData.reviewSurface}
      />

      <OrbitNav copy={copy} />

      {isOffline && (
        <aside
          role="alert"
          aria-live="polite"
          style={{
            margin: '0.75rem 1.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '4px',
            color: 'var(--text, #e2e8f0)',
            fontSize: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            <strong>{copy.statusOffline}:</strong> {copy.offlineNotice}
          </span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            ARSY Hub: {state.dataSource}
          </span>
        </aside>
      )}

      <main className="orbit-main" id="main-content">
        <OrbitOperationsWorkspace
          data={activeWorkspaceData}
          locale={locale}
          copy={copy}
        />
      </main>

      <footer className="orbit-footer" role="contentinfo">
        <div>
          {copy.dataSourceLabel}:{' '}
          <Badge tone={isOffline ? 'hot' : state.connectionStatus === 'LIVE_CONNECTED' ? 'ok' : 'night'}>
            {state.dataSource}
          </Badge>{' '}
          · {copy.freshnessLabel}:{' '}
          <Badge tone={state.freshness === 'FRESH' ? 'ok' : state.freshness === 'STALE' ? 'accent' : 'night'}>
            {state.freshness}
          </Badge>{' '}
          · {copy.synchronizedLabel}: {state.lastSyncTimestamp}
        </div>
        <div>{copy.footerNotice}</div>
      </footer>
    </>
  )
}
