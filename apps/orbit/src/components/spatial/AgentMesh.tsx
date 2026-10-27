'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import type { AgentNode } from '../../fixtures/simulated-operations'
import { HologramBadge } from './HologramBadge'
import { SPATIAL_TOKENS } from './tokens'

export interface AgentMeshProps {
  agent: AgentNode
  parentPosition: [number, number, number]
  orbitIndex: number
  totalInStation: number
  isSelected: boolean
  prefersReducedMotion: boolean
  onSelectNode: (id: string) => void
}

/**
 * Procedural Orbiting Agent Mesh (LUMEN worker).
 * Renders an octahedron with a spinning gimbal ring around its parent workstation.
 * Disables all orbital motion when prefers-reduced-motion is active.
 * Strictly carries a [SIMULATED] holographic tag.
 */
export function AgentMesh({
  agent,
  parentPosition,
  orbitIndex,
  totalInStation,
  isSelected,
  prefersReducedMotion,
  onSelectNode,
}: AgentMeshProps) {
  const groupRef = useRef<Group>(null)
  const coreRef = useRef<Mesh>(null)
  const ringRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Map state to canonical MoonUI tokens
  const stateColor =
    agent.state === 'EXECUTING'
      ? SPATIAL_TOKENS.ok
      : agent.state === 'WAITING_APPROVAL'
        ? SPATIAL_TOKENS.accent
        : agent.state === 'IDLE'
          ? SPATIAL_TOKENS.cyan
          : SPATIAL_TOKENS.pink

  const highlightColor = isSelected ? SPATIAL_TOKENS.pink : stateColor

  // Base orbital geometry
  const orbitRadius = 2.4
  const baseAngle = (orbitIndex / Math.max(1, totalInStation)) * Math.PI * 2
  const angleRef = useRef(baseAngle)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (prefersReducedMotion) {
      // Static fixed position for reduced motion
      const x = parentPosition[0] + Math.cos(baseAngle) * orbitRadius
      const y = parentPosition[1] + 0.8
      const z = parentPosition[2] + Math.sin(baseAngle) * orbitRadius
      groupRef.current.position.set(x, y, z)
      return
    }

    // Advance orbital angle
    const orbitSpeed = agent.state === 'EXECUTING' ? 0.6 : 0.3
    angleRef.current += delta * orbitSpeed

    const x = parentPosition[0] + Math.cos(angleRef.current) * orbitRadius
    const hoverBob = Math.sin(state.clock.elapsedTime * 2.5 + orbitIndex) * 0.08
    const y = parentPosition[1] + 0.8 + hoverBob
    const z = parentPosition[2] + Math.sin(angleRef.current) * orbitRadius

    groupRef.current.position.set(x, y, z)

    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 1.2
      coreRef.current.rotation.y += delta * 0.8
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5
    }
  })

  return (
    <group
      ref={groupRef}
      position={[
        parentPosition[0] + Math.cos(baseAngle) * orbitRadius,
        parentPosition[1] + 0.8,
        parentPosition[2] + Math.sin(baseAngle) * orbitRadius,
      ]}
      onClick={(e) => {
        e.stopPropagation()
        onSelectNode(agent.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'pointer'
        }
      }}
      onPointerOut={() => {
        setHovered(false)
        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'auto'
        }
      }}
    >
      {/* Octahedron Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color={SPATIAL_TOKENS.ink}
          emissive={highlightColor}
          emissiveIntensity={isSelected ? 0.9 : hovered ? 0.7 : 0.4}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Wireframe Gimbal Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.5, 0.02, 6, 24]} />
        <meshBasicMaterial
          color={highlightColor}
          wireframe={true}
          transparent={true}
          opacity={isSelected ? 0.9 : 0.5}
        />
      </mesh>

      {/* Persistent Holographic SIMULATED Badge */}
      <HologramBadge
        title={agent.name.split(' ')[0]}
        statusText={`[${agent.state}] · #${agent.executionCycle}`}
        badgeText={agent.provenance}
        tone={agent.state === 'WAITING_APPROVAL' ? 'accent' : agent.state === 'EXECUTING' ? 'ok' : 'cyan'}
        position={[0, 0.9, 0]}
        scale={[1.8, 0.45, 1]}
      />
    </group>
  )
}
