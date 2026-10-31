'use client'

import { useState, type ReactNode } from 'react'
import { Button } from '../../form.js'
import { Pill } from '../../pills.js'
import { TextInput } from '../../form.js'

type SurfaceCopy = Readonly<Record<string, string>>

export interface TaskFilter {
  status?: string
  priority?: string
}

export interface AgentFilter {
  state?: string
}

export interface WorkstationFilter {
  zone?: string
}

const hasValues = (filters: object): boolean =>
  Object.values(filters).some((value) => value !== undefined && value !== 'ALL' && value !== '')

/**
 * Queue filter toolbar (ADR-0017). The surface computes the distinct option
 * lists from its own projections; the bar owns the disclosure, the chips and
 * the clear-all contract.
 */
export function QueueFilterBar({
  copy,
  statusOptions,
  priorityOptions,
  stateOptions,
  zoneOptions,
  taskFilters,
  onTaskFiltersChange,
  agentFilters,
  onAgentFiltersChange,
  workstationFilters,
  onWorkstationFiltersChange,
  searchValue,
  onSearchChange,
  disabled = false,
}: {
  copy: SurfaceCopy
  statusOptions: string[]
  priorityOptions: string[]
  stateOptions: string[]
  zoneOptions: string[]
  taskFilters: TaskFilter
  onTaskFiltersChange: (filters: TaskFilter) => void
  agentFilters: AgentFilter
  onAgentFiltersChange: (filters: AgentFilter) => void
  workstationFilters: WorkstationFilter
  onWorkstationFiltersChange: (filters: WorkstationFilter) => void
  searchValue: string
  onSearchChange: (value: string) => void
  disabled?: boolean
}): ReactNode {
  const [expanded, setExpanded] = useState(false)

  const clearAll = () => {
    onTaskFiltersChange({})
    onAgentFiltersChange({})
    onWorkstationFiltersChange({})
    onSearchChange('')
  }

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
          <TextInput
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={copy.queueSearchLabel}
            disabled={disabled}
          />
        </label>

        <div className="orbit-filter-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="orbit-advanced-filters"
            aria-label={copy.queueFiltersHeading}
            disabled={disabled}
          >
            {copy.queueFiltersHeading}
          </Button>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearAll} disabled={disabled}>
              {copy.queueClearFilters}
            </Button>
          ) : null}
        </div>
      </div>

      <div id="orbit-advanced-filters" className="orbit-filter-advanced" aria-live="polite" hidden={!expanded}>
        <fieldset className="orbit-filter-group" disabled={disabled}>
          <legend>{copy.queueStatusFilter}</legend>
          <div className="orbit-filter-chips" role="group" aria-label={copy.queueStatusFilter}>
            <Pill
              active={(taskFilters.status ?? 'ALL') === 'ALL'}
              label={copy.queueAll}
              onClick={() => onTaskFiltersChange({ ...taskFilters, status: undefined })}
            />
            {statusOptions.map((status) => (
              <Pill
                key={status}
                active={(taskFilters.status ?? 'ALL') === status}
                label={status}
                onClick={() => onTaskFiltersChange({ ...taskFilters, status })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="orbit-filter-group" disabled={disabled}>
          <legend>{copy.queuePriorityFilter}</legend>
          <div className="orbit-filter-chips" role="group" aria-label={copy.queuePriorityFilter}>
            <Pill
              active={(taskFilters.priority ?? 'ALL') === 'ALL'}
              label={copy.queueAll}
              onClick={() => onTaskFiltersChange({ ...taskFilters, priority: undefined })}
            />
            {priorityOptions.map((priority) => (
              <Pill
                key={priority}
                active={(taskFilters.priority ?? 'ALL') === priority}
                label={priority}
                onClick={() => onTaskFiltersChange({ ...taskFilters, priority })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="orbit-filter-group" disabled={disabled}>
          <legend>{copy.queueStateFilter}</legend>
          <div className="orbit-filter-chips" role="group" aria-label={copy.queueStateFilter}>
            <Pill
              active={(agentFilters.state ?? 'ALL') === 'ALL'}
              label={copy.queueAll}
              onClick={() => onAgentFiltersChange({ ...agentFilters, state: undefined })}
            />
            {stateOptions.map((state) => (
              <Pill
                key={state}
                active={(agentFilters.state ?? 'ALL') === state}
                label={state}
                onClick={() => onAgentFiltersChange({ ...agentFilters, state })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="orbit-filter-group" disabled={disabled}>
          <legend>{copy.queueZoneFilter}</legend>
          <div className="orbit-filter-chips" role="group" aria-label={copy.queueZoneFilter}>
            <Pill
              active={(workstationFilters.zone ?? 'ALL') === 'ALL'}
              label={copy.queueAll}
              onClick={() => onWorkstationFiltersChange({ ...workstationFilters, zone: undefined })}
            />
            {zoneOptions.map((zone) => (
              <Pill
                key={zone}
                active={(workstationFilters.zone ?? 'ALL') === zone}
                label={zone}
                onClick={() => onWorkstationFiltersChange({ ...workstationFilters, zone })}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
