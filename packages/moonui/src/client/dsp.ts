'use client'

/**
 * Tactical WebAudio DSP FX Rack & Acoustic Conditioner
 *
 * Implements:
 * 1. 5-Band Studio Parametric Equalizer (60Hz, 250Hz, 1kHz, 4kHz, 12kHz).
 * 2. Algorithmic Lo-Fi Tape Saturation (sigmoid soft-clipping waveshaper).
 * 3. Algorithmic Analog Tape Hiss & Vinyl Crackle acoustic atmospheric generator.
 * 4. Presets tailored for Moonwitness shortwave / denpa telemetry and nocturnal broadcasts.
 */

export interface EqSettings {
  low: number // 60Hz (-12dB to +12dB)
  lowMid: number // 250Hz (-12dB to +12dB)
  mid: number // 1000Hz (-12dB to +12dB)
  highMid: number // 4000Hz (-12dB to +12dB)
  high: number // 12000Hz (-12dB to +12dB)
}

export interface TapeSettings {
  enabled: boolean
  saturation: number // 0.0 to 1.0
  hiss: number // 0.0 to 1.0
  crackle: number // 0.0 to 1.0
}

export interface DspPreset {
  id: string
  name: string
  description: string
  eq: EqSettings
  tape: TapeSettings
}

export const DSP_PRESETS: readonly DspPreset[] = [
  {
    id: 'flat',
    name: 'FLAT (STUDIO DIRECT)',
    description: 'Uncolored linear reference monitor response.',
    eq: { low: 0, lowMid: 0, mid: 0, highMid: 0, high: 0 },
    tape: { enabled: false, saturation: 0, hiss: 0, crackle: 0 },
  },
  {
    id: 'analog_tape',
    name: 'WARM ANALOG TAPE',
    description: 'Subtle magnetic tape compression with soft mid warmth and gently rolled-off highs.',
    eq: { low: 2.5, lowMid: 1.5, mid: 0, highMid: -0.5, high: -2.0 },
    tape: { enabled: true, saturation: 0.35, hiss: 0.18, crackle: 0.08 },
  },
  {
    id: 'denpa_shortwave',
    name: 'DENPA SHORTWAVE RX',
    description: 'Ionospheric bandpass resonance with telemetry crackle and atmospheric flutter.',
    eq: { low: -5.0, lowMid: -2.0, mid: 4.5, highMid: 2.5, high: -6.0 },
    tape: { enabled: true, saturation: 0.55, hiss: 0.35, crackle: 0.3 },
  },
  {
    id: 'sub_bass',
    name: 'DEEP NIGHT SUB',
    description: 'Reinforced low-end punch for nocturnal synthwave and ambient basslines.',
    eq: { low: 6.0, lowMid: 3.0, mid: -1.0, highMid: 0.5, high: 2.0 },
    tape: { enabled: false, saturation: 0, hiss: 0, crackle: 0 },
  },
  {
    id: 'vocal_presence',
    name: 'BROADCAST AIR PRESENCE',
    description: 'High-frequency intimacy and intelligible vocal focus.',
    eq: { low: -2.0, lowMid: 0, mid: 1.5, highMid: 4.0, high: 3.5 },
    tape: { enabled: true, saturation: 0.15, hiss: 0.05, crackle: 0 },
  },
] as const

interface AudioWithDsp extends HTMLAudioElement {
  __moon_audio_ctx?: AudioContext
  __moon_dsp_rack?: MoonDspRack
  __moon_analyser?: AnalyserNode
}

function makeSaturationCurve(amount: number): Float32Array<ArrayBuffer> {
  const k = Math.max(0, Math.min(amount * 45, 90))
  const nSamples = 44100
  const buffer = new ArrayBuffer(nSamples * 4)
  const curve = new Float32Array(buffer)
  const deg = Math.PI / 180
  for (let i = 0; i < nSamples; ++i) {
    const x = (i * 2) / nSamples - 1
    if (k === 0) {
      curve[i] = x
    } else {
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
    }
  }
  return curve
}

function createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = buffer.getChannelData(0)
  let b0 = 0
  let b1 = 0
  let b2 = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    // Filter into pinkish noise floor
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.08
  }
  return buffer
}

function createCrackleBuffer(ctx: AudioContext, seconds = 3): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    // Poisson-like sporadic vinyl pops
    if (Math.random() < 0.0006) {
      output[i] = (Math.random() * 2 - 1) * 0.85
    } else {
      output[i] = 0
    }
  }
  return buffer
}

export class MoonDspRack {
  private readonly ctx: AudioContext
  private readonly filterLow: BiquadFilterNode
  private readonly filterLowMid: BiquadFilterNode
  private readonly filterMid: BiquadFilterNode
  private readonly filterHighMid: BiquadFilterNode
  private readonly filterHigh: BiquadFilterNode
  private readonly waveshaper: WaveShaperNode
  private readonly masterGain: GainNode
  private readonly hissGain: GainNode
  private readonly crackleGain: GainNode
  private hissSource: AudioBufferSourceNode | null = null
  private crackleSource: AudioBufferSourceNode | null = null
  private currentEq: EqSettings = { low: 0, lowMid: 0, mid: 0, highMid: 0, high: 0 }
  private currentTape: TapeSettings = { enabled: false, saturation: 0, hiss: 0, crackle: 0 }

  constructor(ctx: AudioContext, source: MediaElementAudioSourceNode) {
    this.ctx = ctx

    // 1. Saturation / Waveshaper
    this.waveshaper = ctx.createWaveShaper()
    this.waveshaper.curve = makeSaturationCurve(0)
    this.waveshaper.oversample = '2x'

    // 2. 5-Band Parametric EQ
    this.filterLow = ctx.createBiquadFilter()
    this.filterLow.type = 'lowshelf'
    this.filterLow.frequency.value = 60

    this.filterLowMid = ctx.createBiquadFilter()
    this.filterLowMid.type = 'peaking'
    this.filterLowMid.frequency.value = 250
    this.filterLowMid.Q.value = 1.0

    this.filterMid = ctx.createBiquadFilter()
    this.filterMid.type = 'peaking'
    this.filterMid.frequency.value = 1000
    this.filterMid.Q.value = 1.0

    this.filterHighMid = ctx.createBiquadFilter()
    this.filterHighMid.type = 'peaking'
    this.filterHighMid.frequency.value = 4000
    this.filterHighMid.Q.value = 1.0

    this.filterHigh = ctx.createBiquadFilter()
    this.filterHigh.type = 'highshelf'
    this.filterHigh.frequency.value = 12000

    // 3. Noise Gains
    this.hissGain = ctx.createGain()
    this.hissGain.gain.value = 0

    this.crackleGain = ctx.createGain()
    this.crackleGain.gain.value = 0

    this.masterGain = ctx.createGain()
    this.masterGain.gain.value = 1.0

    // Pipeline wiring:
    // source -> waveshaper -> low -> lowMid -> mid -> highMid -> high -> masterGain -> destination
    source.connect(this.waveshaper)
    this.waveshaper.connect(this.filterLow)
    this.filterLow.connect(this.filterLowMid)
    this.filterLowMid.connect(this.filterMid)
    this.filterMid.connect(this.filterHighMid)
    this.filterHighMid.connect(this.filterHigh)
    this.filterHigh.connect(this.masterGain)

    this.hissGain.connect(this.masterGain)
    this.crackleGain.connect(this.masterGain)
    this.masterGain.connect(ctx.destination)

    this.startNoiseGenerators()
  }

  private startNoiseGenerators(): void {
    try {
      const hissBuffer = createNoiseBuffer(this.ctx)
      this.hissSource = this.ctx.createBufferSource()
      this.hissSource.buffer = hissBuffer
      this.hissSource.loop = true
      this.hissSource.connect(this.hissGain)
      this.hissSource.start(0)

      const crackleBuffer = createCrackleBuffer(this.ctx)
      this.crackleSource = this.ctx.createBufferSource()
      this.crackleSource.buffer = crackleBuffer
      this.crackleSource.loop = true
      this.crackleSource.connect(this.crackleGain)
      this.crackleSource.start(0)
    } catch {
      // AudioContext state or autoplay restrictions
    }
  }

  public setEq(settings: Partial<EqSettings>): void {
    this.currentEq = { ...this.currentEq, ...settings }
    const now = this.ctx.currentTime
    if (settings.low !== undefined) this.filterLow.gain.setTargetAtTime(settings.low, now, 0.05)
    if (settings.lowMid !== undefined) this.filterLowMid.gain.setTargetAtTime(settings.lowMid, now, 0.05)
    if (settings.mid !== undefined) this.filterMid.gain.setTargetAtTime(settings.mid, now, 0.05)
    if (settings.highMid !== undefined) this.filterHighMid.gain.setTargetAtTime(settings.highMid, now, 0.05)
    if (settings.high !== undefined) this.filterHigh.gain.setTargetAtTime(settings.high, now, 0.05)
  }

  public setTape(settings: Partial<TapeSettings>): void {
    this.currentTape = { ...this.currentTape, ...settings }
    const now = this.ctx.currentTime
    const isEnabled = this.currentTape.enabled

    const effectiveSaturation = isEnabled ? this.currentTape.saturation : 0
    this.waveshaper.curve = makeSaturationCurve(effectiveSaturation)

    const effectiveHiss = isEnabled ? this.currentTape.hiss * 0.035 : 0
    this.hissGain.gain.setTargetAtTime(effectiveHiss, now, 0.08)

    const effectiveCrackle = isEnabled ? this.currentTape.crackle * 0.045 : 0
    this.crackleGain.gain.setTargetAtTime(effectiveCrackle, now, 0.08)
  }

  public applyPreset(presetId: string): void {
    const preset = DSP_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    this.setEq(preset.eq)
    this.setTape(preset.tape)
  }

  public getSettings(): { eq: EqSettings; tape: TapeSettings } {
    return {
      eq: { ...this.currentEq },
      tape: { ...this.currentTape },
    }
  }

  public resumeIfSuspended(): void {
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
  }
}

/**
 * Attaches or returns the existing MoonDspRack for an HTMLAudioElement.
 */
export function getOrCreateDspRack(audioElement: HTMLAudioElement): MoonDspRack | null {
  if (typeof window === 'undefined') return null
  const target = audioElement as AudioWithDsp
  if (target.__moon_dsp_rack) {
    target.__moon_dsp_rack.resumeIfSuspended()
    return target.__moon_dsp_rack
  }

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null

    let ctx = target.__moon_audio_ctx
    if (!ctx) {
      ctx = new AudioCtx()
      target.__moon_audio_ctx = ctx
    }

    const source = ctx.createMediaElementSource(audioElement)
    const rack = new MoonDspRack(ctx, source)
    target.__moon_dsp_rack = rack
    return rack
  } catch {
    return null
  }
}
