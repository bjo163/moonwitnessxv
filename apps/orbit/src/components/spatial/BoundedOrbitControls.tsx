'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface BoundedOrbitControlsProps {
  autoRotate: boolean
}

/**
 * Bounded Three.js OrbitControls wrapper.
 * Clamps polar angle, limits zoom bounds, enables damping,
 * and halts auto-rotation if user interacts or prefers reduced motion.
 */
export function BoundedOrbitControls({ autoRotate }: BoundedOrbitControlsProps) {
  const { camera, gl } = useThree()
  const controlsRef = useRef<OrbitControls | null>(null)

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2 - 0.05 // Don't clip below ground plane
    controls.minPolarAngle = 0.2
    controls.minDistance = 5
    controls.maxDistance = 25
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = 0.5

    controlsRef.current = controls

    return () => {
      controls.dispose()
    }
  }, [camera, gl, autoRotate])

  useFrame(() => {
    controlsRef.current?.update()
  })

  return null
}
