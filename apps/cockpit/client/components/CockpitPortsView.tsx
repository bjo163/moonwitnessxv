import type { ReactNode } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, LiveDot } from '@moonwitness/moonui'
import type { ServiceState } from '../types'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'

export interface PortEntry {
  port: number
  name: string
  tag: string
  desc: string
}

export const COCKPIT_PORT_MAP: PortEntry[] = [
  { port: 3000, name: 'Radio Backend & Addons', tag: 'radio', desc: 'Fastify API + Audio Metadata Engine' },
  { port: 3001, name: 'AI Gateway Service', tag: 'aigateway', desc: 'Local AI Research Agent Proxy' },
  { port: 3002, name: 'Sentinel Telemetry', tag: 'sentinel', desc: 'Multi-platform Spectrum Radar' },
  { port: 3003, name: 'Headquarters App', tag: 'hq', desc: 'Unified Administration Workspace' },
  { port: 3004, name: 'Dock Web Surface', tag: 'dock', desc: 'Public Radio & Zine Frontend' },
  { port: 5173, name: 'Desktop Cockpit Dev', tag: 'cockpit', desc: 'Operator Command Center' },
]

export interface CockpitPortsViewProps {
  serviceStates: Record<string, ServiceState>
  openPreview: (url: string) => void
  copy: CockpitCopyCatalog
}

export function CockpitPortsView({
  serviceStates,
  openPreview,
  copy,
}: CockpitPortsViewProps): ReactNode {
  return (
    <div className="ports-container">
      {COCKPIT_PORT_MAP.map((p) => {
        const state = serviceStates[p.tag]
        const isRunning = p.tag === 'cockpit' || (state && state.status === 'RUNNING')
        return (
          <Card key={p.port} style={{ backgroundColor: 'var(--surface-2)' }}>
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
                  :{p.port}
                </span>
              }
              actions={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LiveDot state={isRunning ? 'live' : 'down'} />
                  <Badge tone={isRunning ? 'ok' : 'night'}>
                    {isRunning ? copy.statusBound : copy.statusIdle}
                  </Badge>
                </div>
              }
            />
            <CardBody>
              <div
                style={{
                  fontWeight: 800,
                  color: 'var(--fg)',
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  color: 'var(--muted)',
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                {p.desc}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openPreview(`http://127.0.0.1:${p.port}`)}
              >
                {copy.btnOpenPreview}
              </Button>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
