'use client'

import { useState } from 'react'
import type { OrbitCopyKey } from '../lib/orbit-copy'
import {
  type TaskQueueFilters,
  type AgentQueueFilters,
  type WorkstationQueueFilters,
  distinctZones,
  distinctAgentStates,
  distinctTaskStatuses,
  distinctTaskPriorities,
} from '../lib/queues/operational-queues'
import type {
  WorkstationProjection,
  AgentProjection,
  TaskProjection,
} from '../lib/projections/types.ts'
import { Badge } from '@moonwitness/moonui'

export interface OrbitQueueFilterBarProps {
  copy: Readonly<Record<OrbitCopyKey, string>>
  workstations: readonly WorkstationProjection[]
  agents: readonly AgentProjection[]
  tasks: readonly TaskProjection[]
  taskFilters: TaskQueueFilters
  onTaskFiltersChange: (filters: TaskQueueFilters) => void
  agentFilters: AgentQueueFilters
  onAgentFiltersChange: (filters: AgentQueueFilters) => void
  workstationFilters: WorkstationQueueFilters
  onWorkstationFiltersChange: (filters: WorkstationQueueFilters) => void
  searchValue: string
  onSearchChange: (value: string) => void
  disabled?: boolean
}

/**
 * Accessible filter toolbar shared by every queue panel.
 * Keyboard-operable, deterministic, and never fabricates records.
 */
export function OrbitQueueFilterBar({
  copy,
  workstations,
  agents,
  tasks,
  taskFilters,
  onTaskFiltersChange,
  agentFilters,
  onAgentFiltersChange,
  workstationFilters,
  onWorkstationFiltersChange,
  searchValue,
  onSearchChange,
  disabled = false,
}: OrbitQueueFilterBarProps) {
  const [expanded, setExpanded] = useState(false)

  const clearAll = () => {
    onTaskFiltersChange({})
    onAgentFiltersChange({})
    onWorkstationFiltersChange({})
    onSearchChange('')
  }

  const hasValues = (filters: object) =>
    Object.values(filters).some((value) => value !== undefined && value !== 'ALL' && value !== '')

  const hasActiveFilters =
    searchValue.trim().length > 0 ||
    hasValues(taskFilters) ||
    hasValues(agentFilters) ||
    hasValues(workstationFilters)

  return (
    <div className="orbit-queue-filter-bar" role="search" aria-label={copy.queueFiltersHeading}>
      <div className="orbit-filter-primary">
        <label className="orbit-filter-search">
          <span className="orbit-filter-label">{copy.queueSearchLabel}</span>
          <input
            type="search"
            className="orbit-filter-input"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={copy.queueSearchLabel}
            disabled={disabled}
          />
        </label>

        <div className="orbit-filter-actions">
          <button
            type="button"
            className="orbit-filter-toggle-btn"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="orbit-advanced-filters"
            aria-label={copy.queueFiltersHeading}
            disabled={disabled}
          >
            {copy.queueFiltersHeading}
          </button>
          {hasActiveFilters && (
            <button type="button" className="orbit-filter-toggle-btn" onClick={clearAll} disabled={disabled}>
              {copy.queueClearFilters}
            </button>
          )}
        </div>
      </div>

      <div
        id="orbit-advanced-filters"
        className="orbit-filter-advanced"
        aria-live="polite"
        hidden={!expanded}
      >
          <fieldset className="orbit-filter-group" disabled={disabled}>
            <legend>{copy.queueStatusFilter}</legend>
            <div className="orbit-filter-chips" role="group" aria-label={copy.queueStatusFilter}>
              <Chip active={(taskFilters.status ?? 'ALL') === 'ALL'} onClick={() => onTaskFiltersChange({ ...taskFilters, status: undefined })}>
                {copy.queueAll}
              </Chip>
              {distinctTaskStatuses(tasks).map((s) => (
                <Chip
                  key={s}
                  active={(taskFilters.status ?? 'ALL') === s}
                  onClick={() => onTaskFiltersChange({ ...taskFilters, status: s as TaskProjection['status'] })}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="orbit-filter-group" disabled={disabled}>
            <legend>{copy.queuePriorityFilter}</legend>
            <div className="orbit-filter-chips" role="group" aria-label={copy.queuePriorityFilter}>
              <Chip active={(taskFilters.priority ?? 'ALL') === 'ALL'} onClick={() => onTaskFiltersChange({ ...taskFilters, priority: undefined })}>
                {copy.queueAll}
              </Chip>
              {distinctTaskPriorities(tasks).map((p) => (
                <Chip
                  key={p}
                  active={(taskFilters.priority ?? 'ALL') === p}
                  onClick={() => onTaskFiltersChange({ ...taskFilters, priority: p as TaskProjection['priority'] })}
                >
                  {p}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="orbit-filter-group" disabled={disabled}>
            <legend>{copy.queueStateFilter}</legend>
            <div className="orbit-filter-chips" role="group" aria-label={copy.queueStateFilter}>
              <Chip active={(agentFilters.state ?? 'ALL') === 'ALL'} onClick={() => onAgentFiltersChange({ ...agentFilters, state: undefined })}>
                {copy.queueAll}
              </Chip>
              {distinctAgentStates(agents).map((s) => (
                <Chip
                  key={s}
                  active={(agentFilters.state ?? 'ALL') === s}
                  onClick={() => onAgentFiltersChange({ ...agentFilters, state: s as AgentProjection['state'] })}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="orbit-filter-group" disabled={disabled}>
            <legend>{copy.queueZoneFilter}</legend>
            <div className="orbit-filter-chips" role="group" aria-label={copy.queueZoneFilter}>
              <Chip active={(workstationFilters.zone ?? 'ALL') === 'ALL'} onClick={() => onWorkstationFiltersChange({ ...workstationFilters, zone: undefined })}>
                {copy.queueAll}
              </Chip>
              {distinctZones(workstations).map((z) => (
                <Chip
                  key={z}
                  active={(workstationFilters.zone ?? 'ALL') === z}
                  onClick={() => onWorkstationFiltersChange({ ...workstationFilters, zone: z })}
                >
                  {z}
                </Chip>
              ))}
            </div>
          </fieldset>
      </div>
    </div>
  )
}

interface ChipProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      className={`orbit-filter-chip ${active ? 'active' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {active ? <Badge tone="accent">{children}</Badge> : <Badge tone="night">{children}</Badge>}
    </button>
  )
}
