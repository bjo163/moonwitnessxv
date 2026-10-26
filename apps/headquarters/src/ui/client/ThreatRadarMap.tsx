'use client'

import React, { useState, type ReactNode } from 'react'
import { Badge, Button } from '@moonwitness/moonui'
import { triggerHaptic } from '@moonwitness/moonui/client'

export interface RadarTarget {
  id: string
  name: string
  region: string
  cx: number
  cy: number
  signals: number
  urgency: number
  status: 'active' | 'warning' | 'critical'
}

const DEFAULT_TARGETS: RadarTarget[] = [
  { id: 'radar-ap', name: 'Asia-Pacific Geopolitics', region: 'APAC', cx: 680, cy: 190, signals: 42, urgency: 88, status: 'critical' },
  { id: 'radar-me', name: 'Levant & MENA Corridor', region: 'MENA', cx: 520, cy: 180, signals: 29, urgency: 74, status: 'warning' },
  { id: 'radar-eu', name: 'Eastern European Theater', region: 'EU', cx: 480, cy: 120, signals: 56, urgency: 92, status: 'critical' },
  { id: 'radar-na', name: 'North American Defense Grid', region: 'NA', cx: 220, cy: 150, signals: 18, urgency: 45, status: 'active' },
  { id: 'radar-sa', name: 'South American Resources', region: 'SA', cx: 290, cy: 290, signals: 12, urgency: 38, status: 'active' },
  { id: 'radar-af', name: 'Sub-Saharan Minerals & Energy', region: 'AFRICA', cx: 490, cy: 260, signals: 24, urgency: 65, status: 'warning' },
]

export interface ThreatRadarMapProps {
  onSelectZone?: (radarId: string) => void
  selectedRadarId?: string
}

/**
 * Tactical World Threat Radar
 *
 * Vector-rendered phosphor tactical radar map featuring sweeping target
 * acquisition beam, active telemetry blips, and direct filter link.
 */
export function ThreatRadarMap({
  onSelectZone,
  selectedRadarId,
}: ThreatRadarMapProps): ReactNode {
  const [activeHover, setActiveHover] = useState<RadarTarget | null>(null)
  const [isSweeping, setIsSweeping] = useState(true)

  const handleTargetClick = (target: RadarTarget) => {
    triggerHaptic('switch')
    if (onSelectZone) {
      onSelectZone(target.id)
    } else {
      window.location.href = `/world-monitor?radar=${target.id}`
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#07060b',
        border: '2px solid rgba(247, 244, 236, 0.45)',
        boxShadow: '3px 3px 0 #000000',
        borderRadius: 4,
        overflow: 'hidden',
        color: '#f7f4ec',
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      {/* Top Telemetry Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(247, 244, 236, 0.13)',
          fontSize: 11,
          letterSpacing: '0.08em',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#00d4ff',
              boxShadow: '0 0 8px #00d4ff',
              animation: 'pulse 1.5s infinite',
            }}
          />
          <strong style={{ color: '#00d4ff' }}>SENTINEL GLOBAL RADAR GRID</strong>
          <span style={{ color: 'rgba(247, 244, 236, 0.4)' }}>// POLAR AZIMUTH 360°</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#ffd400' }}>TARGETS: {DEFAULT_TARGETS.length} ACTIVE</span>
          <Button
            variant="ghost"
            size="sm"
            style={{ fontSize: 10, padding: '2px 6px', height: 20 }}
            onClick={() => {
              triggerHaptic('tap')
              setIsSweeping(!isSweeping)
            }}
          >
            {isSweeping ? 'SWEEP: ON' : 'SWEEP: OFF'}
          </Button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', height: 320, background: '#090810' }}>
        <svg
          viewBox="0 0 900 380"
          style={{ width: '100%', height: '100%', display: 'block' }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Radar Sweep Radial Gradient */}
            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </radialGradient>

            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 212, 255, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />

          {/* Concentric Radar Rings */}
          <circle cx="450" cy="190" r="80" fill="none" stroke="rgba(0, 212, 255, 0.2)" strokeWidth="1" />
          <circle cx="450" cy="190" r="160" fill="none" stroke="rgba(0, 212, 255, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="450" cy="190" r="240" fill="none" stroke="rgba(0, 212, 255, 0.1)" strokeWidth="1" />
          <circle cx="450" cy="190" r="320" fill="none" stroke="rgba(0, 212, 255, 0.06)" strokeWidth="1" strokeDasharray="2 6" />

          {/* Crosshairs */}
          <line x1="450" y1="0" x2="450" y2="380" stroke="rgba(0, 212, 255, 0.2)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="0" y1="190" x2="900" y2="190" stroke="rgba(0, 212, 255, 0.2)" strokeWidth="1" strokeDasharray="2 2" />

          {/* World Continents Silhouette Outline (Approximation for lightweight 0KB vector) */}
          <path
            d="M 160 80 Q 220 70 280 120 T 320 180 T 260 220 T 180 180 Z"
            fill="rgba(247, 244, 236, 0.03)"
            stroke="rgba(247, 244, 236, 0.12)"
            strokeWidth="1"
          />
          <path
            d="M 270 230 Q 330 250 310 330 T 260 370 T 240 280 Z"
            fill="rgba(247, 244, 236, 0.03)"
            stroke="rgba(247, 244, 236, 0.12)"
            strokeWidth="1"
          />
          <path
            d="M 440 80 Q 520 60 550 130 T 470 170 T 420 120 Z"
            fill="rgba(247, 244, 236, 0.03)"
            stroke="rgba(247, 244, 236, 0.12)"
            strokeWidth="1"
          />
          <path
            d="M 450 180 Q 530 200 520 290 T 460 320 T 430 230 Z"
            fill="rgba(247, 244, 236, 0.03)"
            stroke="rgba(247, 244, 236, 0.12)"
            strokeWidth="1"
          />
          <path
            d="M 550 90 Q 750 70 820 140 T 780 230 T 620 200 Z"
            fill="rgba(247, 244, 236, 0.03)"
            stroke="rgba(247, 244, 236, 0.12)"
            strokeWidth="1"
          />
          <path
            d="M 680 260 Q 780 270 770 340 T 700 350 Z"
            fill="rgba(247, 244, 236, 0.03)"
            stroke="rgba(247, 244, 236, 0.12)"
            strokeWidth="1"
          />

          {/* Rotating Radar Sweep Line */}
          {isSweeping && (
            <g style={{ transformOrigin: '450px 190px', animation: 'spin 8s linear infinite' }}>
              <line x1="450" y1="190" x2="850" y2="190" stroke="#00d4ff" strokeWidth="2" opacity="0.6" />
              <polygon points="450,190 850,150 850,190" fill="url(#radar-glow)" opacity="0.4" />
            </g>
          )}

          {/* Target Blips */}
          {DEFAULT_TARGETS.map((t) => {
            const isSelected = selectedRadarId === t.id
            const color =
              t.status === 'critical' ? '#ff007a' : t.status === 'warning' ? '#ffd400' : '#00d4ff'

            return (
              <g
                key={t.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => {
                  triggerHaptic('tap')
                  setActiveHover(t)
                }}
                onMouseLeave={() => setActiveHover(null)}
                onClick={() => handleTargetClick(t)}
              >
                {/* Target Pulsing Beacon */}
                <circle cx={t.cx} cy={t.cy} r={isSelected ? 14 : 9} fill={color} opacity="0.2">
                  <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Target Dot */}
                <circle cx={t.cx} cy={t.cy} r={isSelected ? 5 : 3.5} fill={color} stroke="#ffffff" strokeWidth="1" />

                {/* Label */}
                <text
                  x={t.cx + 8}
                  y={t.cy + 3}
                  fill={isSelected ? '#ffffff' : 'rgba(247, 244, 236, 0.7)'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  [{t.region}] {t.name.split(' ')[0]}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tactical Hover Information Overlay */}
        {activeHover && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(7, 6, 11, 0.92)',
              border: '1px solid #00d4ff',
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: 11,
              pointerEvents: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
              <Badge tone={activeHover.status === 'critical' ? 'pink' : activeHover.status === 'warning' ? 'accent' : 'cyan'}>
                {activeHover.status.toUpperCase()}
              </Badge>
              <strong>{activeHover.name}</strong>
            </div>
            <div style={{ color: 'rgba(247, 244, 236, 0.6)', fontSize: 10 }}>
              REGION: {activeHover.region} | CAPTURED SIGNALS: {activeHover.signals} | URGENCY: {activeHover.urgency}%
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
