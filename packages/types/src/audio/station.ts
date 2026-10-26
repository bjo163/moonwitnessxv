/**
 * Radio, IPTV & Station Audio Typings
 */
export type ChannelMediaType = 'bgm' | 'radio' | 'iptv'

export interface StationChannel {
  id: string
  name: string
  type: ChannelMediaType
  streamUrl: string
  genre: string
  icon: string
  country?: string
  description?: string
  active?: boolean
}

export interface IcyMetadataFact {
  artist: string | null
  title: string
  listeners?: number | null
  updatedAt: string
}

export interface StationSealConfig {
  stationId: string
  name: string
  genre: string
  size?: number
}
