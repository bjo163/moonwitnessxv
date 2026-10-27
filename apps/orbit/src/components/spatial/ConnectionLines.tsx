'use client'

import { useMemo, useEffect } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import type { WorkstationNode } from '../../fixtures/simulated-operations'
import { SPATIAL_TOKENS } from './tokens'

export interface ConnectionLinesProps {
  workstations: WorkstationNode[]
}

/**
 * Procedural network constellation grid lines connecting workstations.
 * Adheres strictly to MoonUI border & cyan tokens.
 */
export function ConnectionLines({ workstations }: ConnectionLinesProps) {
  const geometry = useMemo(() => {
    const points: number[] = []
    for (let i = 0; i < workstations.length; i++) {
      for (let j = i + 1; j < workstations.length; j++) {
        const [x1, y1, z1] = workstations[i].position
        const [x2, y2, z2] = workstations[j].position
        // Elevate line slightly above the grid plane
        points.push(x1, y1 + 0.15, z1, x2, y2 + 0.15, z2)
      }
    }
    const geom = new BufferGeometry()
    geom.setAttribute('position', new Float32BufferAttribute(points, 3))
    return geom
  }, [workstations])

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={SPATIAL_TOKENS.cyan}
        transparent={true}
        opacity={0.35}
      />
    </lineSegments>
  )
}
