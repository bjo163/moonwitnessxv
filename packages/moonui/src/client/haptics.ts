/**
 * @moonwitness/moonui — Unified Micro-Haptics Engine
 *
 * Couples physical device vibration motors (navigator.vibrate) with
 * WebAudio oscillator clicks for physical console tactile feedback.
 */
import { playUiSound, type UiSoundType } from './sound.js'

export type HapticPattern = 'tap' | 'switch' | 'alert' | 'error' | 'tuning'

export function triggerHaptic(pattern: HapticPattern = 'tap'): void {
  // 1. Audio micro-haptics
  const soundMap: Record<HapticPattern, UiSoundType> = {
    tap: 'click',
    switch: 'toggle',
    alert: 'alert',
    error: 'alert',
    tuning: 'tuning',
  }
  playUiSound(soundMap[pattern])

  // 2. Physical device vibration (if supported and enabled)
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      if (pattern === 'tap') {
        navigator.vibrate(8) // subtle 8ms tick
      } else if (pattern === 'switch') {
        navigator.vibrate(15) // 15ms relay click
      } else if (pattern === 'alert') {
        navigator.vibrate([20, 40, 20])
      } else if (pattern === 'error') {
        navigator.vibrate([40, 60, 40, 60, 40])
      } else if (pattern === 'tuning') {
        navigator.vibrate(5)
      }
    } catch {
      // Ignore vibration errors on locked devices / non-user-gesture
    }
  }
}
