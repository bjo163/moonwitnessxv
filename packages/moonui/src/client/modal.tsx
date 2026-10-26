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
    <div className={`flex flex-wrap items-center gap-3 font-mono text-[11px] text-[var(--muted)] ${className}`}>
      {items.map((item, idx) => (
        <span key={idx} className="inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface2)] border border-[var(--border)] text-[var(--fg)] text-[10px] shadow-sm">
            {item.key}
          </kbd>
          <span className="text-[var(--muted)]">{item.label}</span>
        </span>
      ))}
    </div>
  )
}

/**
 * Tactile Modal Dialog with Accessible Focus Trap, Backdrop Blur and Monospace Esc Handle
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
  const prevFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    prevFocusedRef.current = document.activeElement as HTMLElement | null
    triggerHaptic('switch')

    // Shift focus into first focusable element inside the modal
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusables = modalRef.current?.querySelectorAll<HTMLElement>(focusableSelector)
    if (focusables && focusables.length > 0 && focusables[0]) {
      focusables[0].focus()
    } else {
      modalRef.current?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        triggerHaptic('switch')
        onClose()
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const elements = modalRef.current.querySelectorAll<HTMLElement>(focusableSelector)
        if (!elements || elements.length === 0) {
          e.preventDefault()
          return
        }

        const first = elements[0]
        const last = elements[elements.length - 1]

        if (first && last) {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      prevFocusedRef.current?.focus()
    }
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
        tabIndex={-1}
        className={`relative w-full ${widthClass} rounded-lg border border-[var(--border)] bg-[var(--paper)] text-[var(--fg)] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] outline-none ${className}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="font-mono text-sm uppercase tracking-wider text-[var(--cyan)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-pulse" />
            {title}
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap')
              onClose()
            }}
            className="font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] px-2 py-1 rounded hover:bg-[var(--surface2)] transition-colors"
            title="Press Esc to close"
          >
            [ESC]
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 font-sans">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--ink)] flex items-center justify-between">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: ReactNode
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'accent' | 'ok'
}

/**
 * Tactical Cyberpunk Confirmation / Alert Dialog with Accessible Focus Guard
 */
export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
}: AlertDialogProps): ReactNode {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? 'Alert'}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap')
              onClose()
            }}
            className="m-btn"
            data-variant="ghost"
            data-size="sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(tone === 'danger' ? 'alert' : 'switch')
              onConfirm()
            }}
            className="m-btn"
            data-variant={tone === 'danger' ? 'danger' : tone === 'ok' ? 'cyan' : 'accent'}
            data-size="sm"
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="text-sm text-[var(--fg)] leading-relaxed">{message}</div>
    </Modal>
  )
}
