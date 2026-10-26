import type { StationChannel, SentinelSignal } from '@moonwitness/types'

/**
 * Generates an array of realistic mock radio stations.
 */
export function generateMockStations(count = 5): StationChannel[] {
  const genres = ['Ambient', 'Cyberpunk', 'Chiptune', 'News', 'Classical']
  const stations: StationChannel[] = []

  for (let i = 1; i <= count; i++) {
    const genre = genres[(i - 1) % genres.length] ?? 'Eclectic'
    stations.push({
      id: `station-mock-${String(i).padStart(3, '0')}`,
      name: `Moon Substation ${i}`,
      type: i === 1 ? 'bgm' : 'radio',
      streamUrl: `http://127.0.0.1:3000/stream/${i}`,
      genre,
      icon: '📡',
      country: 'GLOBAL',
      description: `Synthetic mock broadcast station #${i}`,
      active: true,
    })
  }

  return stations
}

/**
 * Generates a mock Sentinel OSINT intelligence signal.
 */
export function createMockSignal(overrides: Partial<SentinelSignal> = {}): SentinelSignal {
  const urgency = overrides.urgencyScore ?? 75
  const sentiment = urgency >= 80 ? 'critical' : urgency >= 50 ? 'alert' : 'neutral'

  return {
    id: `sig-${Date.now()}`,
    externalId: `ext-${Date.now()}`,
    title: 'Seismic and environmental anomaly detected in Pacific sector',
    url: 'https://sentinel.internal/signals/anomaly-01',
    platform: 'usgs',
    sentiment,
    urgencyScore: urgency,
    summary: 'Automated clustering correlates shallow earthquake with undersea sensor reports.',
    status: 'new',
    detectedAt: new Date().toISOString(),
    ...overrides,
  }
}
