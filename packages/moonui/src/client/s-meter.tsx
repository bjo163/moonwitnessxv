'use client'

import React, { useId } from 'react'
import { MOON_COLORS, MOON_FONTS } from '../tokens.js'

export interface SMeterGaugeProps {
  /** Signal strength level from 0 to 100 */
  signal?: number
  /** Peak signal strength from 0 to 100 */
  peak?: number
  /** Label displayed on meter face, defaults to 'S-METER' */
  label?: string
  /** Subtitle or frequency callsign, e.g. 'SIGNAL STRENGTH / RF GAIN' */
  subtitle?: string
  /** Width in pixels, defaults to 240 */
  width?: number
  /** Height in pixels, defaults to 120 */
  height?: number
  /** Optional custom CSS class */
  className?: string
}

/**
 * Analog S-Meter (Signal Strength Galvanometer Gauge)
 *
 * Visualizes shortwave RF signal level and SNR on a classic retro-illuminated
 * galvanometer needle scale calibrated from S1-S9 up to +30dB over S9.
 * 100% token-pure using Moon UI theme colors.
 */
export function SMeterGauge({
  signal = 65,
  peak = 80,
  label = 'S-METER',
  subtitle = 'SIGNAL STRENGTH',
  width = 240,
  height = 120,
  className = '',
}: SMeterGaugeProps): React.JSX.Element {
  const gradientId = useId()
  const clampedSignal = Math.max(0, Math.min(100, signal))
  const clampedPeak = Math.max(0, Math.min(100, peak))

  // Galvanometer needle angle: -45 deg (0%) to +45 deg (100%)
  const needleAngle = -45 + (clampedSignal / 100) * 90
  const peakAngle = -45 + (clampedPeak / 100) * 90

  // Calibration ticks along arc: S1 to S9, then +10dB, +20dB, +30dB
  const ticks = [
    { s: '1', pos: 0.1 },
    { s: '3', pos: 0.25 },
    { s: '5', pos: 0.4 },
    { s: '7', pos: 0.55 },
    { s: '9', pos: 0.7 },
    { s: '+10', pos: 0.8, isDb: true },
    { s: '+20', pos: 0.9, isDb: true },
    { s: '+30', pos: 1.0, isDb: true },
  ]

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{
        width,
        height,
        background: MOON_COLORS.surface,
        border: `2px solid ${MOON_COLORS.borderStrong}`,
        boxShadow: `inset 0 0 16px ${MOON_COLORS.night}, 0 4px 12px ${MOON_COLORS.ink}`,
        borderRadius: 4,
        overflow: 'hidden',
        fontFamily: MOON_FONTS.mono,
      }}
    >
      {/* Warm backlight wash */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background: `radial-gradient(ellipse at 50% 120%, ${MOON_COLORS.accent} 0%, transparent 70%)`,
        }}
      />

      {/* SVG Galvanometer Scale Face */}
      <svg
        viewBox="0 0 240 120"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`glow-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={MOON_COLORS.ok} />
            <stop offset="70%" stopColor={MOON_COLORS.accent} />
            <stop offset="100%" stopColor={MOON_COLORS.hot} />
          </linearGradient>
        </defs>

        {/* Meter Arc Track */}
        <path
          d="M 30 95 A 110 110 0 0 1 210 95"
          fill="none"
          stroke={MOON_COLORS.hair}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Active Signal Level Track */}
        <path
          d="M 30 95 A 110 110 0 0 1 210 95"
          fill="none"
          stroke={`url(#glow-${gradientId})`}
          strokeWidth="3"
          strokeDasharray="210"
          strokeDashoffset={210 - (clampedSignal / 100) * 210}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 140ms ease-out' }}
        />

        {/* Scale Ticks and Numerals */}
        {ticks.map((t, idx) => {
          const angle = -45 + t.pos * 90
          const rad = (angle - 90) * (Math.PI / 180)
          const cx = 120
          const cy = 110
          const rOuter = 88
          const rInner = t.isDb ? 76 : 79
          const x1 = cx + rOuter * Math.cos(rad)
          const y1 = cy + rOuter * Math.sin(rad)
          const x2 = cx + rInner * Math.cos(rad)
          const y2 = cy + rInner * Math.sin(rad)
          const textR = 64
          const tx = cx + textR * Math.cos(rad)
          const ty = cy + textR * Math.sin(rad)

          return (
            <g key={idx}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={t.isDb ? MOON_COLORS.hot : MOON_COLORS.chalkDim}
                strokeWidth={t.isDb ? '2' : '1.5'}
              />
              <text
                x={tx}
                y={ty + 3}
                fontSize={t.isDb ? '7.5' : '8'}
                fill={t.isDb ? MOON_COLORS.hot : MOON_COLORS.chalk}
                textAnchor="middle"
                fontWeight={t.isDb ? '700' : '600'}
              >
                {t.s}
              </text>
            </g>
          )
        })}

        {/* Peak Hold Tick Marker */}
        <g transform={`rotate(${peakAngle} 120 110)`}>
          <line
            x1="120"
            y1="22"
            x2="120"
            y2="30"
            stroke={MOON_COLORS.cyan}
            strokeWidth="2"
            opacity="0.8"
          />
        </g>

        {/* Galvanometer Needle */}
        <g
          transform={`rotate(${needleAngle} 120 110)`}
          style={{ transition: 'transform 90ms cubic-bezier(0.2, 0.9, 0.3, 1.2)' }}
        >
          {/* Needle drop shadow */}
          <line
            x1="121"
            y1="110"
            x2="121"
            y2="18"
            stroke={MOON_COLORS.night}
            strokeWidth="2.5"
            opacity="0.5"
          />
          {/* Sharp metal needle */}
          <line
            x1="120"
            y1="110"
            x2="120"
            y2="16"
            stroke={MOON_COLORS.hot}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </g>

        {/* Needle Pivot Cap */}
        <circle cx="120" cy="110" r="14" fill={MOON_COLORS.night} stroke={MOON_COLORS.border} strokeWidth="2" />
        <circle cx="120" cy="110" r="6" fill={MOON_COLORS.accent} />
        <circle cx="120" cy="110" r="2" fill={MOON_COLORS.ink} />

        {/* Meter Scale Legends */}
        <text
          x="120"
          y="78"
          fontSize="9"
          fontWeight="800"
          letterSpacing="1.5"
          fill={MOON_COLORS.fg}
          textAnchor="middle"
        >
          {label}
        </text>
        <text
          x="120"
          y="90"
          fontSize="6.5"
          fontWeight="600"
          letterSpacing="0.8"
          fill={MOON_COLORS.muted}
          textAnchor="middle"
        >
          {subtitle}
        </text>
      </svg>

      {/* Numerical Digital Telemetry in Footer */}
      <div
        className="w-full flex items-center justify-between px-2 py-0.5"
        style={{
          borderTop: `1px solid ${MOON_COLORS.hair}`,
          background: MOON_COLORS.night,
          fontSize: 9,
          color: MOON_COLORS.muted,
        }}
      >
        <span style={{ color: MOON_COLORS.cyan }}>RF: {clampedSignal}%</span>
        <span style={{ color: clampedSignal > 70 ? MOON_COLORS.ok : MOON_COLORS.accent }}>
          {clampedSignal >= 70 ? `S9 +${Math.round((clampedSignal - 70))}dB` : `S${Math.max(1, Math.round((clampedSignal / 70) * 9))}`}
        </span>
        <span style={{ color: MOON_COLORS.chalkDim }}>PEAK: {clampedPeak}%</span>
      </div>
    </div>
  )
}
