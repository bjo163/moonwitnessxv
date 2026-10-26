/**
 * @moonwitness/moonui — Zero-Byte Synth Micro-Haptics Sound Engine
 *
 * Synthesizes ultra-low-latency physical tactile click, relay switch,
 * radio tuning sweep, and alert chimes directly via Web Audio API oscillators.
 * Zero external MP3/WAV files, 0KB network payload, zero latency.
 */

export type UiSoundType = 'click' | 'toggle' | 'relay' | 'alert' | 'tuning'

let audioCtx: AudioContext | null = null
let soundEnabled = false

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

export function isUiSoundEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('moon_ui_sfx')
    if (stored !== null) return stored === 'true'
  }
  return soundEnabled
}

export function setUiSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('moon_ui_sfx', String(enabled))
  }
}

export function toggleUiSound(): boolean {
  const next = !isUiSoundEnabled()
  setUiSoundEnabled(next)
  if (next) {
    playUiSound('toggle')
  }
  return next
}

export function playUiSound(type: UiSoundType): void {
  if (!isUiSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  if (type === 'click') {
    // 40ms tactile switch snap (880Hz -> 440Hz pitch drop)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.04)
    return
  }

  if (type === 'toggle') {
    // Dual-tone relay switch (1200Hz -> 1600Hz)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.setValueAtTime(1600, now + 0.02)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)
    return
  }

  if (type === 'tuning') {
    // 60ms subtle white-noise radio static sweep
    const bufferSize = ctx.sampleRate * 0.06
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }
    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2400, now)
    filter.Q.setValueAtTime(3.0, now)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    whiteNoise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    whiteNoise.start(now)
    return
  }

  if (type === 'alert') {
    // Cyberpunk harmonic chime (520Hz + 1040Hz sine chord)
    [520, 1040].forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.15)
    })
  }
}
