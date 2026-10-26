'use client'

import React, { useEffect, useState, type ReactNode } from 'react'
import { triggerHaptic } from './haptics.js'

export interface MtsTelemetryClockProps {
  className?: string
  compact?: boolean
  showLunarPhase?: boolean
}

interface LunarTelemetry {
  utcStr: string
  localStr: string
  phasePercent: number
  phaseName: string
  lunarIcon: string
}

// Synodic month in days: 29.53058867
const SYNODIC_MONTH = 29.53058867
// Known new moon reference epoch: 2024-01-11 11:57:00 UTC (1704974220000 ms)
const NEW_MOON_EPOCH = 1704974220000

function calculateLunarTelemetry(date: Date): LunarTelemetry {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

  const utcHours = pad(date.getUTCHours())
  const utcMins = pad(date.getUTCMinutes())
  const utcSecs = pad(date.getUTCSeconds())
  const utcStr = `${utcHours}:${utcMins}:${utcSecs} UTC`

  const localHours = pad(date.getHours())
  const localMins = pad(date.getMinutes())
  const localSecs = pad(date.getSeconds())
  const localStr = `${localHours}:${localMins}:${localSecs}`

  const diffMs = date.getTime() - NEW_MOON_EPOCH
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  const currentCycleDays = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH
  const phaseNormalized = currentCycleDays / SYNODIC_MONTH // 0.0 to 1.0
  const phasePercent = Math.round(phaseNormalized * 100)

  let phaseName: string
  let lunarIcon: string

  if (phaseNormalized < 0.03 || phaseNormalized > 0.97) {
    phaseName = 'NEW MOON'
    lunarIcon = '○'
  } else if (phaseNormalized < 0.22) {
    phaseName = 'WAXING CRESCENT'
    lunarIcon = '☽'
  } else if (phaseNormalized < 0.28) {
    phaseName = 'FIRST QUARTER'
    lunarIcon = '◑'
  } else if (phaseNormalized < 0.47) {
    phaseName = 'WAXING GIBBOUS'
    lunarIcon = '●'
  } else if (phaseNormalized < 0.53) {
    phaseName = 'FULL MOON'
    lunarIcon = '●'
  } else if (phaseNormalized < 0.72) {
    phaseName = 'WANING GIBBOUS'
    lunarIcon = '●'
  } else if (phaseNormalized < 0.78) {
    phaseName = 'LAST QUARTER'
    lunarIcon = '◐'
  } else {
    phaseName = 'WANING CRESCENT'
    lunarIcon = '☾'
  }

  return {
    utcStr,
    localStr,
    phasePercent,
    phaseName,
    lunarIcon,
  }
}

/**
 * MTS (Moon Standard Time) & Celestial Telemetry Clock
 *
 * Monospace military-grade celestial telemetry bar showing
 * UTC broadcast synchronization, lunar phase ephemeris, and orbital cycle.
 */
export function MtsTelemetryClock({
  className = '',
  compact = false,
  showLunarPhase = true,
}: MtsTelemetryClockProps): ReactNode {
  const [telemetry, setTelemetry] = useState<LunarTelemetry>(() =>
    calculateLunarTelemetry(new Date())
  )
  const [viewMode, setViewMode] = useState<'utc' | 'local'>('utc')

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(calculateLunarTelemetry(new Date()))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleToggle = () => {
    triggerHaptic('switch')
    setViewMode((prev) => (prev === 'utc' ? 'local' : 'utc'))
  }

  const timeLabel = viewMode === 'utc' ? telemetry.utcStr : `${telemetry.localStr} LOC`

  return (
    <button
      type="button"
      onClick={handleToggle}
      title="Click to toggle UTC / Local Time"
      className={`inline-flex items-center gap-2 px-2.5 py-1 font-mono text-xs tracking-wider rounded border border-white/10 bg-black/40 text-neutral-300 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-950/20 transition-all select-none cursor-pointer ${className}`}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      <span className="font-semibold text-white">{timeLabel}</span>

      {showLunarPhase && (
        <>
          <span className="text-white/20">|</span>
          <span className="text-amber-400">{telemetry.lunarIcon}</span>
          {!compact && (
            <span className="text-[11px] text-neutral-400">
              MTS {telemetry.phasePercent}% ({telemetry.phaseName})
            </span>
          )}
          {compact && (
            <span className="text-[11px] text-neutral-400">
              {telemetry.phasePercent}%
            </span>
          )}
        </>
      )}
    </button>
  )
}
