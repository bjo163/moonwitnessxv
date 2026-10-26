'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { MOON_COLORS, MOON_FONTS } from '../tokens.js'
import { playUiSound } from './sound.js'
import { triggerHaptic } from './haptics.js'
import { SMeterGauge } from './s-meter.js'

export type RadioBand = 'AM' | 'FM' | 'SW1' | 'SW2' | 'SW3'

export interface BandConfig {
  name: RadioBand
  label: string
  unit: string
  min: number
  max: number
  step: number
  format: (f: number) => string
}

export const RADIO_BANDS: Record<RadioBand, BandConfig> = {
  AM: {
    name: 'AM',
    label: 'MW / AM',
    unit: 'kHz',
    min: 530,
    max: 1700,
    step: 10,
    format: (f) => `${Math.round(f)} kHz`,
  },
  FM: {
    name: 'FM',
    label: 'FM BROADCAST',
    unit: 'MHz',
    min: 87.5,
    max: 108.0,
    step: 0.1,
    format: (f) => `${f.toFixed(1)} MHz`,
  },
  SW1: {
    name: 'SW1',
    label: 'SW 49m-41m',
    unit: 'MHz',
    min: 3.2,
    max: 7.5,
    step: 0.05,
    format: (f) => `${f.toFixed(2)} MHz`,
  },
  SW2: {
    name: 'SW2',
    label: 'SW 31m-19m',
    unit: 'MHz',
    min: 7.0,
    max: 15.6,
    step: 0.05,
    format: (f) => `${f.toFixed(2)} MHz`,
  },
  SW3: {
    name: 'SW3',
    label: 'SW 16m-13m',
    unit: 'MHz',
    min: 15.0,
    max: 22.0,
    step: 0.05,
    format: (f) => `${f.toFixed(2)} MHz`,
  },
}

export interface TunedStation {
  id: string
  name: string
  frequency: number
  band: RadioBand
  genre?: string
}

export interface AnalogTunerProps {
  /** Current selected band */
  band?: RadioBand
  /** Current frequency */
  frequency?: number
  /** Callback when frequency changes */
  onFrequencyChange?: (freq: number) => void
  /** Callback when band changes */
  onBandChange?: (band: RadioBand) => void
  /** Optional tuned station markers */
  stations?: TunedStation[]
  /** Active selected station callback */
  onSelectStation?: (station: TunedStation) => void
  /** Whether to show the integrated analog S-Meter */
  showSMeter?: boolean
  /** Signal strength level (0-100) */
  signalStrength?: number
  /** Optional container class */
  className?: string
}

/**
 * Analog Shortwave & Broadcast Frequency Tuner
 *
 * Provides a vintage radio frequency dial scale with illuminated sliding needle,
 * interactive rotary tuning knob, tactile click feedback, band switcher, and
 * optional integrated S-meter.
 */
export function AnalogTuner({
  band = 'FM',
  frequency,
  onFrequencyChange,
  onBandChange,
  stations = [],
  onSelectStation,
  showSMeter = true,
  signalStrength = 78,
  className = '',
}: AnalogTunerProps): React.JSX.Element {
  const currentBandConfig = RADIO_BANDS[band]
  const defaultFreq = frequency ?? (currentBandConfig.min + (currentBandConfig.max - currentBandConfig.min) * 0.45)
  const [currentFreq, setCurrentFreq] = useState<number>(defaultFreq)
  const dialRef = useRef<HTMLDivElement>(null)
  const isDraggingKnob = useRef(false)
  const lastMouseY = useRef(0)

  // Sync prop changes
  useEffect(() => {
    if (frequency !== undefined && frequency !== currentFreq) {
      setCurrentFreq(frequency)
    }
  }, [frequency, currentFreq])

  const setBoundedFreq = useCallback((raw: number) => {
    const clamped = Math.max(currentBandConfig.min, Math.min(currentBandConfig.max, raw))
    const rounded = Math.round(clamped / currentBandConfig.step) * currentBandConfig.step
    const finalFreq = Number(rounded.toFixed(2))

    if (finalFreq !== currentFreq) {
      setCurrentFreq(finalFreq)
      onFrequencyChange?.(finalFreq)
      playUiSound('click')
      triggerHaptic('tuning')
    }
  }, [currentBandConfig, currentFreq, onFrequencyChange])

  // Click / drag directly on the linear dial scale
  const handleDialClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dialRef.current) return
    const rect = dialRef.current.getBoundingClientRect()
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const targetFreq = currentBandConfig.min + xRatio * (currentBandConfig.max - currentBandConfig.min)
    setBoundedFreq(targetFreq)
  }, [currentBandConfig, setBoundedFreq])

  // Mouse wheel tuning on dial or knob
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? currentBandConfig.step : -currentBandConfig.step
    setBoundedFreq(currentFreq + delta)
  }, [currentBandConfig, currentFreq, setBoundedFreq])

  // Rotary knob drag handler
  const handleKnobMouseDown = (e: React.MouseEvent) => {
    isDraggingKnob.current = true
    lastMouseY.current = e.clientY

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingKnob.current) return
      const deltaY = lastMouseY.current - moveEvent.clientY
      lastMouseY.current = moveEvent.clientY
      const freqStep = currentBandConfig.step * (deltaY > 0 ? 1 : -1)
      if (Math.abs(deltaY) > 2) {
        setBoundedFreq(currentFreq + freqStep)
      }
    }

    const handleMouseUp = () => {
      isDraggingKnob.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Fraction 0..1 along scale
  const scaleFraction = Math.max(
    0,
    Math.min(1, (currentFreq - currentBandConfig.min) / (currentBandConfig.max - currentBandConfig.min)),
  )

  // Find nearest station tuned within 1 step
  const tunedStation = stations.find(
    (st) => st.band === band && Math.abs(st.frequency - currentFreq) <= currentBandConfig.step * 1.5,
  )

  return (
    <div
      className={`flex flex-col gap-3 p-4 select-none ${className}`}
      style={{
        background: MOON_COLORS.night,
        border: `2px solid ${MOON_COLORS.borderStrong}`,
        boxShadow: `inset 0 0 20px ${MOON_COLORS.ink}, 0 6px 16px ${MOON_COLORS.ink}`,
        fontFamily: MOON_FONTS.mono,
        borderRadius: 6,
      }}
      onWheel={handleWheel}
    >
      {/* Top Header: Band Selector & Active Telemetry */}
      <div className="flex items-center justify-between gap-2 border-b pb-2" style={{ borderColor: MOON_COLORS.hair }}>
        {/* Band Buttons */}
        <div className="flex items-center gap-1">
          {(Object.keys(RADIO_BANDS) as RadioBand[]).map((b) => {
            const active = b === band
            return (
              <button
                key={b}
                type="button"
                onClick={() => {
                  onBandChange?.(b)
                  const cfg = RADIO_BANDS[b]
                  const newF = Number((cfg.min + (cfg.max - cfg.min) * 0.4).toFixed(2))
                  setCurrentFreq(newF)
                  onFrequencyChange?.(newF)
                  playUiSound('click')
                  triggerHaptic('switch')
                }}
                className="px-2 py-0.5 text-xs font-bold transition-colors cursor-pointer"
                style={{
                  background: active ? MOON_COLORS.accent : MOON_COLORS.surface,
                  color: active ? MOON_COLORS.ink : MOON_COLORS.muted,
                  border: `1px solid ${active ? MOON_COLORS.accent : MOON_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                {b}
              </button>
            )
          })}
        </div>

        {/* Digital Frequency Display */}
        <div className="flex items-baseline gap-2">
          {tunedStation && (
            <span
              className="text-xs font-bold truncate max-w-[140px]"
              style={{ color: MOON_COLORS.ok }}
              title={tunedStation.name}
            >
              [ON AIR: {tunedStation.name}]
            </span>
          )}
          <span
            className="text-base font-extrabold tracking-wider"
            style={{ color: MOON_COLORS.accent, textShadow: `0 0 8px ${MOON_COLORS.accent}` }}
          >
            {currentBandConfig.format(currentFreq)}
          </span>
        </div>
      </div>

      {/* Main Dial & Gauges Stage */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Optional S-Meter */}
        {showSMeter && (
          <div className="shrink-0">
            <SMeterGauge
              signal={signalStrength}
              peak={Math.min(100, signalStrength + 12)}
              width={220}
              height={100}
              label="SHORTWAVE S-METER"
              subtitle={`${band} RECEIVER GAIN`}
            />
          </div>
        )}

        {/* Linear Frequency Glass Scale */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <div
            ref={dialRef}
            onClick={handleDialClick}
            className="relative h-20 w-full cursor-ew-resize rounded overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${MOON_COLORS.ink} 0%, ${MOON_COLORS.surface} 50%, ${MOON_COLORS.night} 100%)`,
              border: `2px solid ${MOON_COLORS.border}`,
              boxShadow: `inset 0 2px 8px ${MOON_COLORS.ink}`,
            }}
          >
            {/* Vintage Amber Tube Glow */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: `radial-gradient(circle at ${scaleFraction * 100}% 50%, ${MOON_COLORS.accent} 0%, transparent 60%)`,
              }}
            />

            {/* Graduated Scale Markings */}
            <div className="absolute inset-x-2 top-2 bottom-6 flex justify-between items-end pointer-events-none">
              {Array.from({ length: 21 }).map((_, idx) => {
                const isMajor = idx % 5 === 0
                const isMid = idx % 5 === 2 || idx % 5 === 3
                const markFreq = currentBandConfig.min + (idx / 20) * (currentBandConfig.max - currentBandConfig.min)

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span
                      style={{
                        height: isMajor ? 18 : isMid ? 11 : 6,
                        width: isMajor ? 2 : 1,
                        background: isMajor ? MOON_COLORS.accent : MOON_COLORS.chalkDim,
                        opacity: isMajor ? 0.9 : 0.4,
                      }}
                    />
                    {isMajor && (
                      <span
                        className="text-[9px] mt-1 font-bold"
                        style={{ color: MOON_COLORS.chalk, transform: 'translateY(1px)' }}
                      >
                        {currentBandConfig.unit === 'kHz' ? Math.round(markFreq) : markFreq.toFixed(1)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Tuned Station Markers along scale */}
            {stations
              .filter((st) => st.band === band)
              .map((st) => {
                const stFraction = (st.frequency - currentBandConfig.min) / (currentBandConfig.max - currentBandConfig.min)
                if (stFraction < 0 || stFraction > 1) return null
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setBoundedFreq(st.frequency)
                      onSelectStation?.(st)
                    }}
                    title={`${st.name} (${st.frequency} ${currentBandConfig.unit})`}
                    className="absolute top-1 transform -translate-x-1/2 cursor-pointer z-10"
                    style={{ left: `${stFraction * 100}%` }}
                  >
                    <span
                      className="block w-2 h-2 rounded-full"
                      style={{
                        background: MOON_COLORS.cyan,
                        boxShadow: `0 0 6px ${MOON_COLORS.cyan}`,
                      }}
                    />
                  </button>
                )
              })}

            {/* Glowing Tuning Needle */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-20"
              style={{
                left: `${scaleFraction * 100}%`,
                transform: 'translateX(-50%)',
                transition: 'left 60ms linear',
              }}
            >
              {/* Needle Glow Halo */}
              <div
                className="w-4 h-full transform -translate-x-1/2 opacity-30 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${MOON_COLORS.hot}, transparent)`,
                }}
              />
              {/* Sharp Phosphor Needle Line */}
              <div
                className="w-[2px] h-full"
                style={{
                  background: MOON_COLORS.hot,
                  boxShadow: `0 0 8px ${MOON_COLORS.hot}, 0 0 2px ${MOON_COLORS.fg}`,
                }}
              />
            </div>
          </div>

          {/* Lower Dial Scale Legend */}
          <div className="flex items-center justify-between text-[10px] text-muted px-1">
            <span>BAND: {currentBandConfig.label}</span>
            <span style={{ color: MOON_COLORS.chalkDim }}>DRAG SCALE OR TURN KNOB TO TUNE</span>
            <span>SCALE: {currentBandConfig.unit}</span>
          </div>
        </div>

        {/* Rotary Tuning Knob */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            onMouseDown={handleKnobMouseDown}
            className="w-16 h-16 rounded-full cursor-ns-resize flex items-center justify-center select-none"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${MOON_COLORS.surface2} 0%, ${MOON_COLORS.night} 70%, ${MOON_COLORS.ink} 100%)`,
              border: `3px solid ${MOON_COLORS.borderStrong}`,
              boxShadow: `inset 0 2px 4px ${MOON_COLORS.chalkDim}, 0 4px 10px ${MOON_COLORS.night}`,
            }}
            title="Drag up/down or scroll mouse wheel to tune frequency"
          >
            {/* Knob Face Ridges */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center relative"
              style={{
                background: MOON_COLORS.surface,
                border: `1px solid ${MOON_COLORS.hair}`,
                transform: `rotate(${(scaleFraction * 720) % 360}deg)`,
                transition: 'transform 50ms linear',
              }}
            >
              {/* Knob Finger Indent Dot */}
              <div
                className="w-2 h-2 rounded-full absolute top-1"
                style={{ background: MOON_COLORS.accent, boxShadow: `0 0 4px ${MOON_COLORS.accent}` }}
              />
              <span className="text-[7px] font-bold tracking-tighter" style={{ color: MOON_COLORS.muted }}>
                TUNE
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold" style={{ color: MOON_COLORS.muted }}>
            ROTARY
          </span>
        </div>
      </div>
    </div>
  )
}
