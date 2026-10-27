import type { ReactNode } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, LiveDot } from '@moonwitness/moonui'
import type { AppConfig, ServiceState } from '../types'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'

export interface CockpitSidebarProps {
  config: AppConfig | null
  serviceStates: Record<string, ServiceState>
  controlService: (tag: string, action: 'start' | 'stop' | 'restart') => Promise<void>
  openPreview: (url: string) => void
  formatUptime: (seconds: number) => string
  copy: CockpitCopyCatalog
}

export function CockpitSidebar({
  config,
  serviceStates,
  controlService,
  openPreview,
  formatUptime,
  copy,
}: CockpitSidebarProps): ReactNode {
  return (
    <aside className="cockpit-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">{copy.microservices}</span>
        <Badge tone="cyan">{copy.liveControl}</Badge>
      </div>

      <div className="services-list">
        {config?.services.map((svc) => {
          const state: ServiceState = serviceStates[svc.tag] || {
            tag: svc.tag,
            name: svc.name,
            pkg: svc.pkg,
            status: 'STOPPED',
            uptimeSeconds: 0,
            restarts: 0,
          }
          const isRunning = state.status === 'RUNNING'
          const badgeTone =
            state.status === 'RUNNING'
              ? 'ok'
              : state.status === 'STARTING'
              ? 'accent'
              : state.status === 'ERROR'
              ? 'hot'
              : 'night'

          const statusText =
            state.status === 'RUNNING'
              ? copy.statusOnline
              : state.status === 'STARTING'
              ? copy.statusStarting
              : state.status === 'ERROR'
              ? copy.statusError
              : copy.statusOffline

          // Localize the failure from the machine-readable code; never render the
          // server's raw English sentence as operator copy.
          const errorPort = String(state.lastErrorPort ?? state.port ?? '?')
          const errorText =
            state.status === 'ERROR' && state.lastErrorCode === 'PORT_BUSY'
              ? copy.errPortBusy.replace('{port}', errorPort)
              : state.status === 'ERROR' && state.lastErrorCode === 'PORT_NOT_RELEASED'
              ? copy.errPortNotReleased.replace('{port}', errorPort)
              : state.status === 'ERROR' && state.lastErrorCode === 'SPAWN_FAILED'
                ? copy.errSpawnFailed.replace('{reason}', state.lastError ?? '')
              : null

          return (
            <div key={svc.tag} className="service-card-wrapper">
              <Card
                style={{
                  borderLeft: `4px solid ${svc.color}`,
                  backgroundColor: 'var(--surface-2)',
                }}
              >
                <CardHeader
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{svc.icon}</span>
                      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--fg)' }}>
                        {svc.name}
                      </span>
                    </div>
                  }
                  actions={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LiveDot
                        state={
                          state.status === 'RUNNING'
                            ? 'live'
                            : state.status === 'ERROR'
                            ? 'down'
                            : 'connecting'
                        }
                      />
                      <Badge tone={badgeTone}>{statusText}</Badge>
                    </div>
                  }
                />
                <CardBody style={{ paddingTop: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--muted)',
                      marginBottom: 6,
                    }}
                  >
                    {svc.port ? (
                      <span>
                        {copy.port}: <b style={{ color: 'var(--cyan)' }}>{svc.port}</b>
                      </span>
                    ) : (
                      <span>TYPE: WORKER</span>
                    )}
                    {state.pid ? (
                      <span>
                        {copy.pid}: <b style={{ color: 'var(--fg)' }}>{state.pid}</b>
                      </span>
                    ) : null}
                    {state.uptimeSeconds > 0 ? (
                      <span>
                        {copy.uptime}: <b style={{ color: 'var(--ok)' }}>{formatUptime(state.uptimeSeconds)}</b>
                      </span>
                    ) : null}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--muted)',
                      marginBottom: 10,
                      lineHeight: 1.35,
                    }}
                  >
                    {svc.description}
                  </div>

                  {errorText ? (
                    <div
                      role="alert"
                      style={{
                        fontSize: 11,
                        color: 'var(--hot)',
                        marginBottom: 8,
                        lineHeight: 1.35,
                      }}
                    >
                      {errorText}
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {isRunning ? (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => void controlService(svc.tag, 'stop')}
                        >
                          {copy.actionStop}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void controlService(svc.tag, 'restart')}
                        >
                          {copy.actionRestart}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => void controlService(svc.tag, 'start')}
                      >
                        {copy.actionStart}
                      </Button>
                    )}
                    {svc.url ? (
                      <Button
                        variant="paper"
                        size="sm"
                        onClick={() => {
                          if (svc.url) openPreview(svc.url)
                        }}
                      >
                        {copy.actionPreview}
                      </Button>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
