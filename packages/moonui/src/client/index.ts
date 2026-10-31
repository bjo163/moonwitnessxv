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
  AudioSpectrum,
  type AudioSpectrumProps,
} from './audio-spectrum.js'

export {
  Modal,
  AlertDialog,
  KbdLegend,
  type ModalProps,
  type AlertDialogProps,
  type KbdLegendProps,
  type KbdItem,
} from './modal.js'

export {
  SiteHeader,
  type SiteHeaderCopy,
  type SiteHeaderProps,
} from './site-header.js'

export {
  CockpitTopBar,
  CockpitTunerSection,
  type CockpitRackChannel,
  type CockpitTopBarCopy,
  type CockpitTopBarProps,
} from './surfaces/cockpit.js'
export {
  StoryLibraryPage,
  StoryReaderPage,
  type StoryLibraryCard,
  type StoryLibraryCopy,
  type StoryReaderCopy,
} from './surfaces/empire.js'
export {
  ObjectWatchlist,
  type ObjectWatchlistProps,
  type WatchlistCopy,
  type WatchlistRow,
} from './surfaces/echolog.js'
export {
  QueueFilterBar,
  type AgentFilter,
  type TaskFilter,
  type WorkstationFilter,
} from './surfaces/orbit.js'

export {
  ToastProvider,
  ToastContainer,
  useToast,
  type ToastItem,
  type ToastTone,
  type ToastContextValue,
} from './toast.js'

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
