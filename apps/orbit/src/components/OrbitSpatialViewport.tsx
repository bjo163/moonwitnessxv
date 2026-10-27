'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import type { OrbitOperationalState } from '../fixtures/simulated-operations'
import type { Locale } from '@moonwitness/core'
import type { OrbitCopyKey } from '../lib/orbit-copy'
import { OrbitNodeInspector } from './OrbitNodeInspector'
import { Badge } from '@moonwitness/moonui'

export interface OrbitSpatialViewportProps {
  data: OrbitOperationalState
  locale: Locale
  copy: Readonly<Record<OrbitCopyKey, string>>
  selectedNodeId?: string | null
  onSelectNode?: (id: string | null) => void
}

/**
 * Client-Only Boundary for the 3D Spatial Scene.
 * Uses `next/dynamic` with `ssr: false` to avoid SSR hydration and Turbopack WebGL issues.
 * Provides accessible keyboard quick-select pills and synchronizes two-way selection.
 */
export function OrbitSpatialViewport({
  data,
  copy,
  selectedNodeId: controlledSelectedId,
  onSelectNode: controlledOnSelect,
}: OrbitSpatialViewportProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null)

  const selectedNodeId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId
  const handleSelectNode = useCallback(
    (id: string | null) => {
      if (controlledOnSelect) {
        controlledOnSelect(id)
      } else {
        setInternalSelectedId(id)
      }
    },
    [controlledOnSelect]
  )

  const DynamicOrbitScene = dynamic(
    () => import('./spatial/OrbitScene').then((mod) => mod.OrbitScene),
    {
      ssr: false,
      loading: () => (
        <div className="orbit-spatial-loading" role="status" aria-live="polite">
          <div className="orbit-spatial-spinner" />
          <span className="orbit-spatial-loading-text">{copy.spatialLoading}</span>
        </div>
      ),
    }
  )

  return (
    <div className="orbit-spatial-stage" tabIndex={-1} aria-label="3D Spatial Operations Viewport">
      <div className="orbit-spatial-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 id="spatial-viewport-heading" className="orbit-item-title">
            {copy.viewSpatial}
          </h2>
          <Badge tone="accent">{copy.simulatedStage}</Badge>
        </div>

        {/* Accessible Quick Selection Bar for Keyboard & Screen Readers */}
        <div className="orbit-quick-select-bar" role="toolbar" aria-label={copy.quickSelectLabel}>
          <span className="orbit-quick-select-label">{copy.quickSelectLabel}:</span>
          {data.workstations.map((ws) => (
            <button
              key={ws.id}
              type="button"
              className={`orbit-quick-select-btn ${selectedNodeId === ws.id ? 'active' : ''}`}
              onClick={() => handleSelectNode(selectedNodeId === ws.id ? null : ws.id)}
              aria-pressed={selectedNodeId === ws.id}
            >
              {ws.id.replace('ws-', '')}
            </button>
          ))}
          {data.agents.map((ag) => (
            <button
              key={ag.id}
              type="button"
              className={`orbit-quick-select-btn agent ${selectedNodeId === ag.id ? 'active' : ''}`}
              onClick={() => handleSelectNode(selectedNodeId === ag.id ? null : ag.id)}
              aria-pressed={selectedNodeId === ag.id}
            >
              {ag.id.replace('agent-', '')}
            </button>
          ))}
        </div>
      </div>

      <div className="orbit-spatial-canvas-container">
        <DynamicOrbitScene
          data={data}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
        />

        <OrbitNodeInspector
          data={data}
          selectedNodeId={selectedNodeId}
          onClose={() => handleSelectNode(null)}
          copy={copy}
        />
      </div>
    </div>
  )
}
