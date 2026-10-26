'use client'

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { triggerHaptic } from './haptics.js'

export type DensityMode = 'compact' | 'dense' | 'comfortable'

interface DensityContextValue {
  density: DensityMode
  setDensity: (mode: DensityMode) => void
  toggleDensity: () => void
}

const DensityContext = createContext<DensityContextValue>({
  density: 'dense',
  setDensity: () => {},
  toggleDensity: () => {},
})

export interface DensityProviderProps {
  children: ReactNode
  defaultMode?: DensityMode
}

/**
 * Display Density Provider
 *
 * Toggles interface spacing between 'compact', 'dense', and 'comfortable'
 * and syncs with `data-density` attribute for tactical responsiveness.
 */
export function DensityProvider({
  children,
  defaultMode = 'dense',
}: DensityProviderProps): ReactNode {
  const [density, setDensityState] = useState<DensityMode>(defaultMode)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('moon_density') as DensityMode | null
      if (stored === 'compact' || stored === 'dense' || stored === 'comfortable') {
        setDensityState(stored)
        document.documentElement.setAttribute('data-density', stored)
      } else {
        document.documentElement.setAttribute('data-density', defaultMode)
      }
    }
  }, [defaultMode])

  const setDensity = (mode: DensityMode) => {
    triggerHaptic('switch')
    setDensityState(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('moon_density', mode)
      document.documentElement.setAttribute('data-density', mode)
    }
  }

  const toggleDensity = () => {
    const next: DensityMode =
      density === 'dense' ? 'compact' : density === 'compact' ? 'comfortable' : 'dense'
    setDensity(next)
  }

  return (
    <DensityContext.Provider value={{ density, setDensity, toggleDensity }}>
      {children}
    </DensityContext.Provider>
  )
}

export function useDensity(): DensityContextValue {
  return useContext(DensityContext)
}
