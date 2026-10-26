import { NextResponse } from 'next/server'
import { fetchIcyMetadata } from '@moonwitness/core'
import { getStation } from '@/data/queries/catalog'

export const dynamic = 'force-dynamic'

// Short in-memory cache to avoid slamming broadcaster streams
const cache = new Map<string, { data: unknown; expiresAt: number }>()

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params
  const now = Date.now()
  const cached = cache.get(id)
  if (cached && cached.expiresAt > now) {
    return NextResponse.json({ ok: true, data: cached.data }, { headers: { 'cache-control': 'public, max-age=15' } })
  }

  try {
    const detail = await getStation(id)
    if (!detail?.station?.streamUrl) {
      return NextResponse.json({ ok: false, error: 'station not found' }, { status: 404 })
    }

    const meta = await fetchIcyMetadata(detail.station.streamUrl, { timeoutMs: 3000 })
    const payload = meta ?? {
      artist: null,
      title: detail.station.name,
      rawTitle: detail.station.name,
      stationName: detail.station.name,
      genre: detail.station.genre ?? 'Radio',
      bitrate: null,
      url: null,
    }

    cache.set(id, { data: payload, expiresAt: now + 15_000 })
    return NextResponse.json({ ok: true, data: payload }, { headers: { 'cache-control': 'public, max-age=15' } })
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 })
  }
}
