'use client'

import React, { useEffect, useRef, useState, type ReactNode } from 'react'

export interface LivingBackdropProps {
  children?: ReactNode
  audioElement?: HTMLAudioElement | null
  active?: boolean
  className?: string
  primaryColor?: string
  secondaryColor?: string
}

/**
 * Living Audio Luminescence Backdrop
 *
 * Modulates atmospheric back-glow via real-time audio energy (RMS/bass)
 * or organic autonomous breathing when idle. Safe against cross-origin
 * media exceptions with automatic fallback.
 */
export function LivingBackdrop({
  children,
  audioElement,
  active = true,
  className = '',
  primaryColor = 'var(--cyan)',
  secondaryColor = 'var(--pink)',
}: LivingBackdropProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rmsEnergy, setRmsEnergy] = useState<number>(0.2)

  useEffect(() => {
    if (!active) return

    let animFrame: number
    let analyser: AnalyserNode | null = null
    let dataArray: Uint8Array | null = null
    let isConnected = false

    if (audioElement && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioContextClass) {
          // Check if already bound
          const existingCtx = (audioElement as unknown as { __moon_audio_ctx?: AudioContext }).__moon_audio_ctx
          if (existingCtx) {
            analyser = (audioElement as unknown as { __moon_analyser?: AnalyserNode }).__moon_analyser ?? null
          } else {
            const ctx = new AudioContextClass()
            analyser = ctx.createAnalyser()
            analyser.fftSize = 64
            analyser.smoothingTimeConstant = 0.8
            try {
              const source = ctx.createMediaElementSource(audioElement)
              source.connect(analyser)
              analyser.connect(ctx.destination)
              ;(audioElement as unknown as { __moon_audio_ctx?: AudioContext }).__moon_audio_ctx = ctx
              ;(audioElement as unknown as { __moon_analyser?: AnalyserNode }).__moon_analyser = analyser
              isConnected = true
            } catch {
              // Cross-origin audio or already connected
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

    let phase = 0

    const renderLoop = () => {
      let energy: number

      if (isConnected && analyser && dataArray && audioElement && !audioElement.paused) {
        analyser.getByteFrequencyData(dataArray as unknown as Uint8Array<ArrayBuffer>)
        // Average low-frequency bins (bass punch)
        let sum = 0
        const sampleCount = Math.min(8, dataArray.length)
        for (let i = 0; i < sampleCount; i++) {
          sum += (dataArray[i] ?? 0)
        }
        energy = Math.min(1, Math.max(0.1, (sum / sampleCount) / 180))
      } else {
        // Autonomous organic pulse (breathing LFO at ~0.25 Hz)
        phase += 0.03
        energy = 0.15 + 0.12 * Math.sin(phase)
      }

      setRmsEnergy(energy)

      if (containerRef.current) {
        containerRef.current.style.setProperty('--living-rms', energy.toFixed(3))
      }

      animFrame = requestAnimationFrame(renderLoop)
    }

    animFrame = requestAnimationFrame(renderLoop)

    return () => {
      cancelAnimationFrame(animFrame)
    }
  }, [audioElement, active])

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{
        '--living-rms': rmsEnergy.toString(),
      } as React.CSSProperties}
    >
      {/* Living Atmospheric Glow Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 z-0 transition-opacity duration-300"
        style={{
          opacity: Math.max(0.2, rmsEnergy * 0.8),
          background: `radial-gradient(ellipse 60% 50% at 50% 20%, ${primaryColor} 0%, ${secondaryColor} 40%, transparent 75%)`,
          filter: 'blur(48px)',
          mixBlendMode: 'screen',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
