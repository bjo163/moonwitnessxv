'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, Group } from 'three'
import type { WorkstationNode } from '../../fixtures/simulated-operations'
import { HologramBadge } from './HologramBadge'
import { SPATIAL_TOKENS } from './tokens'

export interface WorkstationMeshProps {
  node: WorkstationNode
  isSelected: boolean
  prefersReducedMotion: boolean
  onSelectNode: (id: string) => void
}

/**
 * Procedural 3D Workstation Platform.
 * Built entirely with procedural Three.js geometries and MoonUI tokens.
 * Always renders a persistent [SIMULATED] badge.
 */
export function WorkstationMesh({
  node,
  isSelected,
  prefersReducedMotion,
  onSelectNode,
}: WorkstationMeshProps) {
  const groupRef = useRef<Group>(null)
  const haloRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Status color mapping strictly to MoonUI tokens
  const statusColor =
    node.status === 'STANDALONE'
      ? SPATIAL_TOKENS.cyan
      : node.status === 'DEGRADED'
        ? SPATIAL_TOKENS.accent
        : SPATIAL_TOKENS.muted

  const highlightColor = isSelected ? SPATIAL_TOKENS.accent : statusColor

  useFrame((_, delta) => {
    if (prefersReducedMotion || !haloRef.current) return
    haloRef.current.rotation.z += delta * 0.4
  })

  return (
    <group
      ref={groupRef}
      position={node.position}
      onClick={(e) => {
        e.stopPropagation()
        onSelectNode(node.id)
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
      {/* Hexagonal Base Platform */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.3, 1.5, 0.3, 6]} />
        <meshStandardMaterial
          color={hovered || isSelected ? SPATIAL_TOKENS.surface2 : SPATIAL_TOKENS.surface}
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Hexagonal Platform Edge Ring */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[1.32, 1.32, 0.05, 6]} />
        <meshBasicMaterial
          color={highlightColor}
          wireframe={true}
        />
      </mesh>

      {/* Central Cyber Pylon / Core */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.7, 6]} />
        <meshStandardMaterial
          color={SPATIAL_TOKENS.ink}
          emissive={highlightColor}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.25}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Ambient Halo Ring */}
      <mesh
        ref={haloRef}
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.6, 1.75, 6]} />
        <meshBasicMaterial
          color={highlightColor}
          transparent={true}
          opacity={isSelected ? 0.9 : hovered ? 0.7 : 0.4}
        />
      </mesh>

      {/* Persistent Holographic SIMULATED Badge */}
      <HologramBadge
        title={node.name.split('·')[0].trim()}
        statusText={`[ZONE ${node.zone.toUpperCase()}] ${node.status}`}
        badgeText={node.provenance}
        tone={node.status === 'STANDALONE' ? 'cyan' : 'accent'}
        position={[0, 1.7, 0]}
        scale={[2.4, 0.6, 1]}
      />
    </group>
  )
}
