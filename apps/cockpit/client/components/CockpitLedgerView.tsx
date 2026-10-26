import type { ReactNode } from 'react'
import { Badge, Button } from '@moonwitness/moonui'

export interface CockpitLedgerViewProps {
  errorLines: string[]
  loadLedger: () => Promise<void>
  clearLedger: () => Promise<void>
}

export function CockpitLedgerView({
  errorLines,
  loadLedger,
  clearLedger,
}: CockpitLedgerViewProps): ReactNode {
  return (
    <div className="tab-content">
      <div className="terminal-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              color: 'var(--muted)',
            }}
          >
            SOURCE: dev-errors.log
          </span>
          <Badge tone="hot">{errorLines.length} ENTRIES</Badge>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary" size="sm" onClick={() => void loadLedger()}>
            Refresh
          </Button>
          <Button variant="danger" size="sm" onClick={() => void clearLedger()}>
            Clear Log File
          </Button>
        </div>
      </div>

      <div className="m-terminal-viewer" style={{ flex: 1, maxHeight: 'none' }}>
        {errorLines.length === 0 ? (
          <div style={{ color: 'var(--ok)', padding: 16 }}>
            No errors recorded in dev-errors.log. All systems nominal.
          </div>
        ) : (
          errorLines.map((line, idx) => (
            <div
              key={idx}
              style={{
                padding: '6px 10px',
                background: 'rgba(255, 30, 86, 0.1)',
                borderLeft: '3px solid var(--hot)',
                marginBottom: 6,
                borderRadius: 3,
                color: 'var(--hot)',
              }}
            >
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
