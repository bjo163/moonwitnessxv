import type { ReactNode } from 'react'
import { Button, Pill, PillGroup, TerminalViewer, TextInput } from '@moonwitness/moonui'
import type { AppConfig, LogEntry } from '../types'

export interface CockpitLogsViewProps {
  config: AppConfig | null
  filterTag: string
  setFilterTag: (tag: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  showErrorsOnly: boolean
  setShowErrorsOnly: (val: boolean) => void
  autoScroll: boolean
  setAutoScroll: (val: boolean) => void
  setLogs: (logs: LogEntry[]) => void
  filteredLogs: string[]
}

export function CockpitLogsView({
  config,
  filterTag,
  setFilterTag,
  searchTerm,
  setSearchTerm,
  showErrorsOnly,
  setShowErrorsOnly,
  autoScroll,
  setAutoScroll,
  setLogs,
  filteredLogs,
}: CockpitLogsViewProps): ReactNode {
  return (
    <div className="tab-content">
      <div className="terminal-bar">
        <PillGroup label="Filter:">
          <Pill
            label="ALL"
            active={filterTag === 'all'}
            tone="cyan"
            onClick={() => setFilterTag('all')}
          />
          {config?.services.map((s) => (
            <Pill
              key={s.tag}
              label={s.tag.toUpperCase()}
              active={filterTag === s.tag}
              tone={filterTag === s.tag ? 'cyan' : 'night'}
              onClick={() => setFilterTag(s.tag)}
            />
          ))}
        </PillGroup>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TextInput
            style={{ height: 30, fontSize: 12, width: 180 }}
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant={showErrorsOnly ? 'danger' : 'ghost'}
            size="sm"
            onClick={() => setShowErrorsOnly(!showErrorsOnly)}
          >
            Errors Only
          </Button>
          <Button
            variant={autoScroll ? 'cyan' : 'ghost'}
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            Auto-Scroll
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
            Clear
          </Button>
        </div>
      </div>

      <TerminalViewer
        lines={filteredLogs}
        autoScroll={autoScroll}
        className="flex-1"
      />
    </div>
  )
}
