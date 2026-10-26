'use client'

import React, { useEffect, useRef, type ReactNode } from 'react'
import { triggerHaptic } from './haptics.js'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface KbdItem {
  key: string
  label: string
}

export interface KbdLegendProps {
  items: KbdItem[]
  className?: string
}

/**
 * Monospace Keyboard Shortcut Legend Strip
 */
export function KbdLegend({ items, className = '' }: KbdLegendProps): ReactNode {
  return (
    <div className={`flex flex-wrap items-center gap-3 font-mono text-[11px] text-neutral-400 ${className}`}>
      {items.map((item, idx) => (
        <span key={idx} className="inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200 text-[10px] shadow-sm">
            {item.key}
          </kbd>
          <span className="text-neutral-400">{item.label}</span>
        </span>
      ))}
    </div>
  )
}

/**
 * Tactile Modal Dialog with Backdrop Blur and Monospace Esc Handle
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  className = '',
}: ModalProps): ReactNode {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    triggerHaptic('switch')

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        triggerHaptic('switch')
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const widthClass =
    maxWidth === 'sm'
      ? 'max-w-md'
      : maxWidth === 'lg'
        ? 'max-w-3xl'
        : maxWidth === 'xl'
          ? 'max-w-5xl'
          : 'max-w-xl'

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          triggerHaptic('tap')
          onClose()
        }}
      />

      {/* Modal Box */}
      <div
        ref={modalRef}
        className={`relative w-full ${widthClass} rounded-lg border border-neutral-800 bg-[#0d0b14] text-neutral-100 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] ${className}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-neutral-900/50">
          <div className="font-mono text-sm uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {title}
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap')
              onClose()
            }}
            className="font-mono text-xs text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
            title="Press Esc to close"
          >
            [ESC]
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 font-sans">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-neutral-800/80 bg-neutral-950/60 flex items-center justify-between">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
