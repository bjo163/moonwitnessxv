'use client'

import React, { useEffect, useRef, type ReactNode } from 'react'

export interface AudioSpectrumProps {
  analyser?: AnalyserNode | null
  bars?: number
  height?: number
  tone?: 'cyan' | 'pink' | 'accent' | 'ok'
  glow?: boolean
  active?: boolean
  className?: string
}

/**
 * HiDPI Neon Audio Spectrum Canvas
 *
 * Visualizes frequency domain FFT telemetry directly from a Web Audio AnalyserNode,
 * or provides synthetic tactile radio oscillations when in idle/monitoring mode.
 */
export function AudioSpectrum({
  analyser,
  bars = 24,
  height = 36,
  tone = 'cyan',
  glow = true,
  active = true,
  className = '',
}: AudioSpectrumProps): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null
    let phase = 0

    const colorHex =
      tone === 'pink'
        ? '#ff007a'
        : tone === 'accent'
          ? '#ffd400'
          : tone === 'ok'
            ? '#00e676'
            : '#00d4ff'

    const render = () => {
      animFrame = requestAnimationFrame(render)

      const dpr = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      const h = height

      if (canvas.width !== width * dpr || canvas.height !== h * dpr) {
        canvas.width = width * dpr
        canvas.height = h * dpr
      }

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, h)

      if (analyser && active && dataArray) {
        analyser.getByteFrequencyData(dataArray)
      } else {
        phase += 0.04
      }

      const totalBars = Math.max(8, Math.min(64, bars))
      const gap = 2
      const barWidth = Math.max(1, (width - (totalBars - 1) * gap) / totalBars)

      for (let i = 0; i < totalBars; i++) {
        let normalized = 0

        if (analyser && active && dataArray) {
          const binIndex = Math.floor((i / totalBars) * (dataArray.length / 2))
          normalized = (dataArray[binIndex] ?? 0) / 255
        } else if (active) {
          // Synthetic undulating spectrum wave
          const s1 = Math.sin(phase + i * 0.3)
          const s2 = Math.cos(phase * 0.7 + i * 0.15)
          normalized = Math.max(0.08, (s1 + s2 + 2) / 4 * (0.4 + 0.6 * Math.sin(i / totalBars * Math.PI)))
        } else {
          normalized = 0.05
        }

        const barHeight = Math.max(2, normalized * (h - 2))
        const x = i * (barWidth + gap)
        const y = h - barHeight

        if (glow) {
          ctx.shadowBlur = 6
          ctx.shadowColor = colorHex
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = colorHex
        ctx.fillRect(x, y, barWidth, barHeight)
      }

      ctx.restore()
    }

    render()

    return () => {
      cancelAnimationFrame(animFrame)
    }
  }, [analyser, bars, height, tone, glow, active])

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    />
  )
}
