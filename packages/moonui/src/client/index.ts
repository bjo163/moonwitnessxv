'use client'

export {
  playUiSound,
  isUiSoundEnabled,
  setUiSoundEnabled,
  toggleUiSound,
  type UiSoundType,
} from './sound.js'

export {
  triggerHaptic,
  type HapticPattern,
} from './haptics.js'

export {
  LivingBackdrop,
  type LivingBackdropProps,
} from './living-glow.js'

export {
  MtsTelemetryClock,
  type MtsTelemetryClockProps,
} from './mts-clock.js'

export {
  AudioVisualizer,
  type AudioVisualizerProps,
  type VisualizerMode,
} from './visualizer.js'

export {
  Modal,
  KbdLegend,
  type ModalProps,
  type KbdLegendProps,
  type KbdItem,
} from './modal.js'

export {
  CommandPalette,
  type CommandPaletteProps,
  type CommandItem,
} from './command-palette.js'

export {
  SearchFilterBar,
  type SearchFilterBarProps,
} from './search-bar.js'

export {
  DensityProvider,
  useDensity,
  type DensityMode,
  type DensityProviderProps,
} from './density.js'

export {
  MoonDspRack,
  getOrCreateDspRack,
  DSP_PRESETS,
  type EqSettings,
  type TapeSettings,
  type DspPreset,
} from './dsp.js'

export {
  SMeterGauge,
  type SMeterGaugeProps,
} from './s-meter.js'

export {
  AnalogTuner,
  RADIO_BANDS,
  type AnalogTunerProps,
  type RadioBand,
  type BandConfig,
  type TunedStation,
} from './analog-tuner.js'
