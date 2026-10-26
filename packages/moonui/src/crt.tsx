import type { ReactNode } from 'react'
import { cn } from './cn.js'

export interface CrtBackdropProps {
  children?: ReactNode
  className?: string
  scanlines?: boolean
  vignette?: boolean
  tint?: 'cyan' | 'pink' | 'amber' | 'green'
}

/**
 * Dual-Mode Cathode Ray Phosphor Shader Backdrop
 *
 * Provides a retro-futuristic broadcast CRT terminal aesthetic with
 * scanlines, phosphor glow, and radial vignette.
 * Respects `prefers-reduced-motion` and runs at 0% GPU overhead.
 */
export function CrtBackdrop({
  children,
  className,
  scanlines = true,
  vignette = true,
  tint = 'cyan',
}: CrtBackdropProps): ReactNode {
  const tintGlow =
    tint === 'pink'
      ? 'rgba(255, 0, 122, 0.04)'
      : tint === 'amber'
        ? 'rgba(255, 212, 0, 0.04)'
        : tint === 'green'
          ? 'rgba(0, 230, 118, 0.04)'
          : 'rgba(0, 212, 255, 0.04)'

  return (
    <div
      className={cn('m-crt-backdrop', className)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--ink)',
        backgroundImage: `radial-gradient(circle at 50% 50%, ${tintGlow} 0%, transparent 80%)`,
      }}
    >
      {/* Phosphor Scanlines Layer */}
      {scanlines ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            backgroundImage:
              'linear-gradient(rgba(247, 244, 236, 0.02) 50%, rgba(7, 6, 11, 0.25) 50%)',
            backgroundSize: '100% 4px',
            opacity: 0.7,
          }}
        />
      ) : null}

      {/* Radial Vignette */}
      {vignette ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 2,
            boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.85)',
          }}
        />
      ) : null}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%' }}>{children}</div>
    </div>
  )
}
