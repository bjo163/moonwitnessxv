'use client'

import React, { useEffect, useRef, type ReactNode } from 'react'

export type VisualizerMode = 'bars' | 'oscilloscope' | 'radar'

export interface AudioVisualizerProps {
  audioElement?: HTMLAudioElement | null
  mode?: VisualizerMode
  height?: number
  className?: string
  color?: string
  accentColor?: string
  barCount?: number
  active?: boolean
}

/**
 * Tactile Canvas Audio Visualizer
 *
 * High-definition phosphor frequency visualizer supporting FFT bars,
 * glowing cathode-ray oscilloscope, and tactical circular radar mode.
 * Gracefully provides synthetic ambient telemetry if audio stream is CORS-isolated.
 */
export function AudioVisualizer({
  audioElement,
  mode = 'bars',
  height = 48,
  className = '',
  color = '#00d4ff',
  accentColor = '#ff007a',
  barCount = 32,
  active = true,
}: AudioVisualizerProps): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    let analyser: AnalyserNode | null = null
    let dataArray: Uint8Array | null = null
    let isConnected = false

    if (audioElement && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioContextClass) {
          const existingCtx = (audioElement as unknown as { __moon_audio_ctx?: AudioContext }).__moon_audio_ctx
          if (existingCtx) {
            analyser = (audioElement as unknown as { __moon_analyser?: AnalyserNode }).__moon_analyser ?? null
          } else {
            const ctxInst = new AudioContextClass()
            analyser = ctxInst.createAnalyser()
            analyser.fftSize = 128
            analyser.smoothingTimeConstant = 0.75
            try {
              const source = ctxInst.createMediaElementSource(audioElement)
              source.connect(analyser)
              analyser.connect(ctxInst.destination)
              ;(audioElement as unknown as { __moon_audio_ctx?: AudioContext }).__moon_audio_ctx = ctxInst
              ;(audioElement as unknown as { __moon_analyser?: AnalyserNode }).__moon_analyser = analyser
              isConnected = true
            } catch {
              isConnected = false
            }
          }
          if (analyser) {
            dataArray = new Uint8Array(analyser.frequencyBinCount)
          }
        }
      } catch {
        isConnected = false
      }
    }

    let syntheticPhase = 0
    const peaks = new Float32Array(barCount).fill(0)

    const render = () => {
      const dpr = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      const currentHeight = canvas.clientHeight || height

      if (canvas.width !== width * dpr || canvas.height !== currentHeight * dpr) {
        canvas.width = width * dpr
        canvas.height = currentHeight * dpr
      }

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, currentHeight)

      const isPlaying = audioElement && !audioElement.paused && active

      // 1. Oscilloscope Mode
      if (mode === 'oscilloscope') {
        ctx.lineWidth = 2
        ctx.strokeStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 8
        ctx.beginPath()

        const sliceWidth = width / 64
        let x = 0

        for (let i = 0; i < 64; i++) {
          let v: number
          if (isConnected && analyser && dataArray && isPlaying) {
            analyser.getByteTimeDomainData(dataArray as unknown as Uint8Array<ArrayBuffer>)
            v = (dataArray[i] ?? 128) / 256.0
          } else {
            syntheticPhase += 0.0005
            v = isPlaying
              ? 0.5 + 0.3 * Math.sin(i * 0.2 + syntheticPhase * 8) * Math.cos(i * 0.1)
              : 0.5 + 0.02 * Math.sin(i * 0.3 + syntheticPhase * 2)
          }

          const y = v * currentHeight
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
          x += sliceWidth
        }

        ctx.stroke()
      }
      // 2. Tactical Radar Mode
      else if (mode === 'radar') {
        const cx = width / 2
        const cy = currentHeight / 2
        const radius = Math.min(cx, cy) - 4

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.stroke()

        syntheticPhase += 0.03
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(
          cx + radius * Math.cos(syntheticPhase),
          cy + radius * Math.sin(syntheticPhase)
        )
        ctx.stroke()
      }
      // 3. Phosphor Spectrum Bars Mode (Default)
      else {
        const gap = 2
        const totalGap = gap * (barCount - 1)
        const barWidth = Math.max(2, (width - totalGap) / barCount)

        if (isConnected && analyser && dataArray && isPlaying) {
          analyser.getByteFrequencyData(dataArray as unknown as Uint8Array<ArrayBuffer>)
        }

        syntheticPhase += 0.04

        for (let i = 0; i < barCount; i++) {
          let val: number
          if (isConnected && dataArray && isPlaying) {
            const binIdx = Math.floor((i / barCount) * (dataArray.length / 2))
            val = (dataArray[binIdx] ?? 0) / 255
          } else if (isPlaying) {
            // Organic wave simulation
            val = 0.2 + 0.6 * Math.abs(Math.sin(syntheticPhase + i * 0.25) * Math.cos(syntheticPhase * 0.5 + i * 0.1))
          } else {
            val = 0.05 + 0.03 * Math.sin(syntheticPhase * 0.3 + i)
          }

          const barH = Math.max(2, val * currentHeight)
          const x = i * (barWidth + gap)
          const y = currentHeight - barH

          // Peak hold decay
          if (val > (peaks[i] ?? 0)) {
            peaks[i] = val
          } else {
            peaks[i] = Math.max(0, (peaks[i] ?? 0) - 0.015)
          }

          // Bar gradient
          const grad = ctx.createLinearGradient(0, y, 0, currentHeight)
          grad.addColorStop(0, accentColor)
          grad.addColorStop(1, color)
          ctx.fillStyle = grad
          ctx.fillRect(x, y, barWidth, barH)

          // Peak drop dot
          const peakY = currentHeight - (peaks[i] ?? 0) * currentHeight - 2
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(x, Math.max(0, peakY), barWidth, 1.5)
        }
      }

      ctx.restore()
      animFrame = requestAnimationFrame(render)
    }

    animFrame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animFrame)
    }
  }, [audioElement, mode, height, color, accentColor, barCount, active])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full block ${className}`}
      style={{ height: `${height}px` }}
    />
  )
}
