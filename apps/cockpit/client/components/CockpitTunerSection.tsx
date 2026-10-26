import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { AnalogTuner, type RadioBand, type TunedStation } from '@moonwitness/moonui/client'
import type { ChannelItem } from '../types'

export interface CockpitTunerSectionProps {
  channels: ChannelItem[]
  activeChannelIndex: number
  isPlaying: boolean
  selectChannel: (index: number) => void
}

/**
 * Derives a realistic radio frequency and band for a channel item.
 */
function channelToStation(ch: ChannelItem, idx: number): TunedStation {
  let hash = 0
  for (let i = 0; i < ch.id.length; i++) {
    hash = (hash * 31 + ch.id.charCodeAt(i)) >>> 0
  }
  const ratio = ((hash + idx * 73) % 1000) / 1000

  if (ch.type === 'bgm') {
    return {
      id: ch.id,
      name: ch.name,
      frequency: Number((88.0 + ratio * 19.5).toFixed(1)),
      band: 'FM',
      genre: ch.genre,
    }
  }

  if (ch.type === 'iptv') {
    return {
      id: ch.id,
      name: ch.name,
      frequency: Number((15.0 + ratio * 6.5).toFixed(2)),
      band: 'SW3',
      genre: ch.genre,
    }
  }

  // Radio streams spread across FM, SW1, and SW2
  const bands: RadioBand[] = ['FM', 'SW1', 'SW2']
  const band = bands[idx % 3] ?? 'FM'
  let frequency: number

  if (band === 'FM') {
    frequency = Number((88.0 + ratio * 19.5).toFixed(1))
  } else if (band === 'SW1') {
    frequency = Number((3.5 + ratio * 3.8).toFixed(2))
  } else {
    frequency = Number((7.2 + ratio * 8.0).toFixed(2))
  }

  return {
    id: ch.id,
    name: ch.name,
    frequency,
    band,
    genre: ch.genre,
  }
}

export function CockpitTunerSection({
  channels,
  activeChannelIndex,
  isPlaying,
  selectChannel,
}: CockpitTunerSectionProps): ReactNode {
  const tunedStations = useMemo(() => {
    return channels.map((ch, idx) => channelToStation(ch, idx))
  }, [channels])

  const activeTuned = tunedStations[activeChannelIndex]
  const [band, setBand] = useState<RadioBand>(activeTuned?.band ?? 'FM')
  const [frequency, setFrequency] = useState<number>(activeTuned?.frequency ?? 94.7)

  // Keep tuner aligned when active channel changes externally
  useEffect(() => {
    if (activeTuned) {
      setBand(activeTuned.band)
      setFrequency(activeTuned.frequency)
    }
  }, [activeTuned])

  const handleSelectStation = (station: TunedStation) => {
    const idx = channels.findIndex((c) => c.id === station.id)
    if (idx !== -1) {
      selectChannel(idx)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '8px auto 0 auto' }}>
      <AnalogTuner
        band={band}
        frequency={frequency}
        onBandChange={setBand}
        onFrequencyChange={setFrequency}
        stations={tunedStations}
        onSelectStation={handleSelectStation}
        showSMeter={true}
        signalStrength={isPlaying ? 84 : 12}
      />
    </div>
  )
}
