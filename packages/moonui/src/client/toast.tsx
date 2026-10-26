'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { triggerHaptic } from './haptics.js'

export type ToastTone = 'ok' | 'pink' | 'cyan' | 'accent'

export interface ToastItem {
  id: string
  message: ReactNode
  tone?: ToastTone
  duration?: number
}

export interface ToastContextValue {
  toasts: ToastItem[]
  toast: (message: ReactNode, tone?: ToastTone, duration?: number) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }): ReactNode {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: ReactNode, tone: ToastTone = 'ok', duration = 4000): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      triggerHaptic(tone === 'pink' ? 'alert' : 'tap')
      setToasts((prev) => [...prev, { id, message, tone, duration }])
      return id
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}): ReactNode {
  if (toasts.length === 0) return null

  return (
    <div className="m-toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}): ReactNode {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (item.duration && item.duration > 0) {
      timerRef.current = setTimeout(() => {
        onDismiss(item.id)
      }, item.duration)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [item, onDismiss])

  return (
    <div
      role="status"
      className="m-toast cursor-pointer"
      data-tone={item.tone ?? 'ok'}
      onClick={() => {
        triggerHaptic('tap')
        onDismiss(item.id)
      }}
    >
      <span className="flex-1 select-none">{item.message}</span>
      <span className="text-[10px] text-[var(--muted)] hover:text-[var(--fg)]">[x]</span>
    </div>
  )
}
