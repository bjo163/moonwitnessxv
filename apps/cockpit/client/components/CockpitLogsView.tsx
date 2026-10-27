import type { ReactNode } from 'react'
import { Button, Pill, PillGroup, TerminalViewer, TextInput } from '@moonwitness/moonui'
import type { TerminalLine } from '@moonwitness/moonui'
import type { AppConfig, LogEntry } from '../types'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'

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
  logLines: TerminalLine[]
  copy: CockpitCopyCatalog
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
  logLines,
  copy,
}: CockpitLogsViewProps): ReactNode {
  return (
    <div className="tab-content">
      <div className="terminal-bar">
        <PillGroup label="Filter:">
          <Pill
            label={copy.filterAll}
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
            placeholder={copy.searchLogsPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant={showErrorsOnly ? 'danger' : 'ghost'}
            size="sm"
            onClick={() => setShowErrorsOnly(!showErrorsOnly)}
          >
            {copy.errorsOnly}
          </Button>
          <Button
            variant={autoScroll ? 'cyan' : 'ghost'}
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            {copy.autoScroll}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
            {copy.clearLogs}
          </Button>
        </div>
      </div>

      <TerminalViewer
        lines={logLines}
        autoScroll={autoScroll}
        className="flex-1"
      />
    </div>
  )
}
