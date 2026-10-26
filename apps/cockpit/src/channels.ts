export type ChannelMediaType = 'bgm' | 'radio' | 'iptv'

export interface ChannelItem {
  id: string
  name: string
  type: ChannelMediaType
  streamUrl: string
  genre: string
  icon: string
  country?: string
  description?: string
}

export const DEFAULT_MEDIA_CHANNELS: ChannelItem[] = [
  // 1. Official Moondeck BGM
  {
    id: 'bgm-levelup',
    name: 'Level Up // Chiptune Arcade',
    type: 'bgm',
    streamUrl: '/bgm.mp3',
    genre: 'Chiptune / 8-Bit',
    icon: '🎮',
    country: 'MOON',
    description: 'Official Moondeck Mission Cockpit energetic arcade soundtrack',
  },

  // 2. Verified IPTV Live Video Channels
  {
    id: 'iptv-dw-news',
    name: 'DW News English HD',
    type: 'iptv',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    genre: 'News / Current Affairs',
    icon: '📺',
    country: 'DE',
    description: 'Deutsche Welle international 24/7 news television stream',
  },
  {
    id: 'iptv-redbull',
    name: 'Red Bull TV Live',
    type: 'iptv',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    genre: 'Sports / Action / Gaming',
    icon: '⚡',
    country: 'AT',
    description: 'Extreme sports, gaming, and action culture live television',
  },
  {
    id: 'iptv-mux-animation',
    name: 'Retro Animation 24/7',
    type: 'iptv',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    genre: 'Animation / Visuals',
    icon: '🎬',
    country: 'NL',
    description: 'Continuous Open Source 3D animation visual stream',
  },
  {
    id: 'iptv-tvri-nasional',
    name: 'TVRI Nasional Live',
    type: 'iptv',
    streamUrl: 'https://tvri.b-cdn.net/tvri/nasional/live/playlist.m3u8',
    genre: 'Indonesian Television',
    icon: '🇮🇩',
    country: 'ID',
    description: 'Televisi Republik Indonesia national public broadcasting live stream',
  },

  // 3. Moonwitness Radio Stations (from Station Catalog)
  {
    id: 'radio-prambors',
    name: 'Prambors FM Jakarta',
    type: 'radio',
    streamUrl: 'https://stream.rcs.revma.com/h77wwp48kxcwv',
    genre: 'Pop / Hits',
    icon: '📻',
    country: 'ID',
    description: 'Hit music station Indonesia #1 for youth',
  },
  {
    id: 'radio-genfm',
    name: 'Gen FM 98.7 Jakarta',
    type: 'radio',
    streamUrl: 'https://ic.mari.co.id:8443/genfm',
    genre: 'Indonesian Pop',
    icon: '📻',
    country: 'ID',
    description: 'Suara Musik Indonesia hits & culture',
  },
  {
    id: 'radio-hardrock',
    name: 'Hard Rock FM 87.6',
    type: 'radio',
    streamUrl: 'https://stream.radiojar.com/7csmg90fuqruv',
    genre: 'Rock / Alternative',
    icon: '🎸',
    country: 'ID',
    description: 'Lifestyle and rock station Jakarta',
  },
  {
    id: 'radio-somafm-groove',
    name: 'SomaFM: Groove Salad',
    type: 'radio',
    streamUrl: 'https://ice2.somafm.com/groovesalad-128-mp3',
    genre: 'Downtempo / Ambient',
    icon: '🥗',
    country: 'US',
    description: 'A nicely chilled plate of ambient beats and cyber grooves',
  },
  {
    id: 'radio-somafm-secret',
    name: 'SomaFM: Secret Agent',
    type: 'radio',
    streamUrl: 'https://ice2.somafm.com/secretagent-128-mp3',
    genre: 'Spy / Cyberpunk',
    icon: '🕵️',
    country: 'US',
    description: 'The soundtrack for your stylish, mysterious hacking day',
  },
  {
    id: 'radio-kexp',
    name: 'KEXP 90.3 Seattle',
    type: 'radio',
    streamUrl: 'https://kexp.streamguys1.com/kexp160.mp3',
    genre: 'Indie / Eclectic',
    icon: '🎙️',
    country: 'US',
    description: 'Where the music matters — legendary independent live radio',
  },
]
