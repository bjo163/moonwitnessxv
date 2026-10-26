import type { CapturedSignalInput } from './types.js'

export interface GeoCoordinate {
  lat: number
  lon: number
}

export interface ClusteredThreatZone {
  zoneId: string
  center: GeoCoordinate
  signalCount: number
  highestUrgency: number
  dominantSentiment: string
  signals: CapturedSignalInput[]
}

/** Haversine formula to compute distance in km between two lat/lon coordinates. */
export function haversineDistanceKm(p1: GeoCoordinate, p2: GeoCoordinate): number {
  const R = 6371 // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Cluster geospatial sensor spikes and OSINT signals within a geographic radius.
 */
export function clusterSignalsGeospatially(
  signals: Array<CapturedSignalInput & { coordinates?: GeoCoordinate }>,
  radiusKm = 500,
): ClusteredThreatZone[] {
  const geoSignals = signals.filter((s) => s.coordinates && s.coordinates.lat && s.coordinates.lon)
  const clusters: ClusteredThreatZone[] = []

  for (const s of geoSignals) {
    const coord = s.coordinates!
    let assigned = false

    for (const cluster of clusters) {
      const dist = haversineDistanceKm(cluster.center, coord)
      if (dist <= radiusKm) {
        cluster.signals.push(s)
        cluster.signalCount++
        cluster.highestUrgency = Math.max(cluster.highestUrgency, s.urgencyScore ?? 0)
        if (s.sentiment === 'critical') cluster.dominantSentiment = 'critical'
        assigned = true
        break
      }
    }

    if (!assigned) {
      clusters.push({
        zoneId: `zone-${clusters.length + 1}-${Math.round(coord.lat)}_${Math.round(coord.lon)}`,
        center: coord,
        signalCount: 1,
        highestUrgency: s.urgencyScore ?? 0,
        dominantSentiment: s.sentiment || 'neutral',
        signals: [s],
      })
    }
  }

  return clusters.sort((a, b) => b.highestUrgency - a.highestUrgency)
}
