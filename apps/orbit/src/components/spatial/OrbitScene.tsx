'use client'

import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import type { OrbitOperationalState } from '../../fixtures/simulated-operations'
import { WorkstationMesh } from './WorkstationMesh'
import { AgentMesh } from './AgentMesh'
import { ConnectionLines } from './ConnectionLines'
import { BoundedOrbitControls } from './BoundedOrbitControls'
import { SPATIAL_TOKENS } from './tokens'

export interface OrbitSceneProps {
  data: OrbitOperationalState
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
}

/**
 * 3D-First Spatial Operations Viewport Canvas.
 * Renders procedural Three.js scene visualizing workstations and agent loops.
 * Clamps camera controls, provides two-way selection, and respects prefers-reduced-motion.
 */
export function OrbitScene({
  data,
  selectedNodeId,
  onSelectNode,
}: OrbitSceneProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(media.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  return (
    <div
      className="orbit-spatial-canvas-wrapper"
      style={{
        width: '100%',
        height: '420px',
        position: 'relative',
        background: `radial-gradient(circle at 50% 50%, ${SPATIAL_TOKENS.surface2} 0%, ${SPATIAL_TOKENS.ink} 90%)`,
      }}
    >
      <Canvas
        camera={{ position: [0, 8, 14], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
        onPointerMissed={() => onSelectNode(null)}
        aria-label="3D Spatial Operations Canvas"
      >
        {/* Controlled Ambient and Directional Lighting */}
        <ambientLight color={SPATIAL_TOKENS.surface} intensity={1.8} />
        <directionalLight
          position={[10, 16, 10]}
          intensity={1.2}
          color={SPATIAL_TOKENS.fg}
        />
        <pointLight
          position={[0, 6, 0]}
          intensity={2.5}
          color={SPATIAL_TOKENS.cyan}
          distance={30}
        />

        {/* Bounded Camera Controls */}
        <BoundedOrbitControls autoRotate={!prefersReducedMotion} />

        {/* Procedural Cyber Ground Grid */}
        <gridHelper
          args={[28, 28, SPATIAL_TOKENS.cyan, SPATIAL_TOKENS.border]}
          position={[0, 0, 0]}
        />

        {/* Network Constellation Lines */}
        <ConnectionLines workstations={data.workstations} />

        {/* Workstation Platforms */}
        {data.workstations.map((ws) => (
          <WorkstationMesh
            key={ws.id}
            node={ws}
            isSelected={selectedNodeId === ws.id}
            prefersReducedMotion={prefersReducedMotion}
            onSelectNode={onSelectNode}
          />
        ))}

        {/* Orbiting Agent Loop Workers */}
        {data.agents.map((agent, index) => {
          const parentWs = data.workstations.find(
            (ws) => ws.id === agent.workstationId
          )
          const totalInStation = data.agents.filter(
            (a) => a.workstationId === agent.workstationId
          ).length

          return (
            <AgentMesh
              key={agent.id}
              agent={agent}
              parentPosition={parentWs ? parentWs.position : [0, 0, 0]}
              orbitIndex={index}
              totalInStation={totalInStation}
              isSelected={selectedNodeId === agent.id}
              prefersReducedMotion={prefersReducedMotion}
              onSelectNode={onSelectNode}
            />
          )
        })}
      </Canvas>
    </div>
  )
}
