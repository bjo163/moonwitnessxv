import type { ReactNode } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, LiveDot } from '@moonwitness/moonui'
import type { AppConfig, ServiceState } from '../types'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'

export interface CockpitPortsViewProps {
  config: AppConfig | null
  serviceStates: Record<string, ServiceState>
  openPreview: (url: string) => void
  copy: CockpitCopyCatalog
}

interface PortRow {
  tag: string
  name: string
  port?: number
  url?: string
  running: boolean
  worker: boolean
}

/**
 * Derived from /api/config, which is the single source of truth for port
 * ownership (packages/core PORTS mirrored into apps/cockpit/src/config.ts).
 * A static port table here once drifted from that truth; nothing may re-add one.
 */
function buildRows(config: AppConfig | null, serviceStates: Record<string, ServiceState>): PortRow[] {
  if (!config) return []
  const supervised: PortRow[] = config.services.map((svc) => ({
    tag: svc.tag,
    name: svc.name,
    port: svc.port,
    url: svc.url,
    running: serviceStates[svc.tag]?.status === 'RUNNING',
    worker: svc.type === 'worker',
  }))
  // The supervisor serves this page itself, so it is bound by definition.
  const self: PortRow = {
    tag: 'cockpit',
    name: 'Cockpit',
    port: config.port,
    url: `http://127.0.0.1:${String(config.port)}`,
    running: true,
    worker: false,
  }
  return [self, ...supervised]
}

export function CockpitPortsView({
  config,
  serviceStates,
  openPreview,
  copy,
}: CockpitPortsViewProps): ReactNode {
  const rows = buildRows(config, serviceStates)
  return (
    <div className="ports-container">
      {rows.map((row) => (
        <Card key={row.tag} style={{ backgroundColor: 'var(--surface-2)' }}>
          <CardHeader
            title={
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 24,
                  fontWeight: 900,
                  color: 'var(--cyan)',
                }}
              >
                {row.worker ? copy.workerNoPort : `:${String(row.port)}`}
              </span>
            }
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LiveDot state={row.running ? 'live' : 'down'} />
                <Badge tone={row.running ? 'ok' : 'night'}>
                  {row.running ? copy.statusBound : copy.statusIdle}
                </Badge>
              </div>
            }
          />
          <CardBody>
            <div style={{ fontWeight: 800, color: 'var(--fg)', fontSize: 14, marginBottom: 4 }}>
              {row.name}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 14 }}>
              {row.tag.toUpperCase()}
            </div>
            {!row.worker && row.url ? (
              <Button variant="primary" size="sm" onClick={() => openPreview(row.url as string)}>
                {copy.btnOpenPreview}
              </Button>
            ) : null}
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
