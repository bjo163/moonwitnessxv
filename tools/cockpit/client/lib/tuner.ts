import type { RadioBand, TunedStation } from '@moonwitness/moonui/client'
import type { ChannelItem } from '../types'

/**
 * Derives a realistic radio frequency and band for a channel item. This is
 * synthetic tuning data, so it stays with the surface that owns the channel
 * catalog while MoonUI renders the tuner.
 */
export function channelToStation(ch: ChannelItem, idx: number): TunedStation {
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

export function channelsToStations(channels: ChannelItem[]): TunedStation[] {
  return channels.map((channel, index) => channelToStation(channel, index))
}
