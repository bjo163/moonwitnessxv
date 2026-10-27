'use client'

import { useEffect, useMemo } from 'react'
import { CanvasTexture } from 'three'
import { SPATIAL_TOKENS } from './tokens'

export interface HologramBadgeProps {
  title: string
  badgeText?: string
  statusText?: string
  tone?: 'cyan' | 'accent' | 'ok' | 'hot' | 'muted'
  position?: [number, number, number]
  scale?: [number, number, number]
}

/**
 * Procedural Canvas-backed 3D Holographic Badge Sprite.
 * Always faces the camera, explicitly rendering the [SIMULATED] badge.
 * Cleans up WebGL textures deterministically on unmount.
 */
export function HologramBadge({
  title,
  badgeText = 'SIMULATED',
  statusText,
  tone = 'cyan',
  position = [0, 1.2, 0],
  scale = [2.2, 0.55, 1],
}: HologramBadgeProps) {
  const primaryColor = SPATIAL_TOKENS[tone] ?? SPATIAL_TOKENS.cyan

  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null

    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background panel with futuristic cyber bevel
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(19, 16, 29, 0.88)'
    ctx.strokeStyle = primaryColor
    ctx.lineWidth = 4

    // Draw cut-corner container
    const x = 8
    const y = 8
    const w = canvas.width - 16
    const h = canvas.height - 16
    const cut = 14

    ctx.beginPath()
    ctx.moveTo(x + cut, y)
    ctx.lineTo(x + w - cut, y)
    ctx.lineTo(x + w, y + cut)
    ctx.lineTo(x + w, y + h - cut)
    ctx.lineTo(x + w - cut, y + h)
    ctx.lineTo(x + cut, y + h)
    ctx.lineTo(x, y + h - cut)
    ctx.lineTo(x, y + cut)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Title Text
    ctx.fillStyle = SPATIAL_TOKENS.fg
    ctx.font = 'bold 30px monospace'
    ctx.textBaseline = 'middle'
    const displayTitle = title.length > 20 ? title.slice(0, 19) + '…' : title
    ctx.fillText(displayTitle, x + 20, y + (statusText ? 38 : 54))

    // Optional status subtitle
    if (statusText) {
      ctx.fillStyle = primaryColor
      ctx.font = '600 20px monospace'
      ctx.fillText(statusText, x + 20, y + 74)
    }

    // SIMULATED holographic badge pill
    const badgeStr = `[${badgeText.toUpperCase()}]`
    ctx.font = 'bold 22px monospace'
    const badgeMetrics = ctx.measureText(badgeStr)
    const badgeW = badgeMetrics.width + 16
    const badgeX = x + w - badgeW - 16
    const badgeY = y + 16
    const badgeH = 34

    ctx.fillStyle = 'rgba(255, 212, 0, 0.15)'
    ctx.strokeStyle = SPATIAL_TOKENS.accent
    ctx.lineWidth = 2
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH)
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH)

    ctx.fillStyle = SPATIAL_TOKENS.accent
    ctx.fillText(badgeStr, badgeX + 8, badgeY + badgeH / 2)

    const tex = new CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [title, badgeText, statusText, primaryColor])

  useEffect(() => {
    return () => {
      texture?.dispose()
    }
  }, [texture])

  if (!texture) return null

  return (
    <sprite position={position} scale={scale}>
      <spriteMaterial
        map={texture}
        transparent={true}
        depthWrite={false}
      />
    </sprite>
  )
}
