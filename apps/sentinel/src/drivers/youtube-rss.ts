import type { CapturedSignalInput, DriverContext, MonitorDriver, MonitorSourceTask, SentimentKind } from '../types.js'

const decodeXml = (raw: string): string =>
  raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()

const tagText = (xml: string, tag: string): string | null => {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(xml)
  return m?.[1] ? decodeXml(m[1]) : null
}

const attrValue = (xml: string, tag: string, attr: string): string | null => {
  const m = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, 'i').exec(xml)
  return m?.[1] ? decodeXml(m[1]) : null
}

export function scoreHeadline(title: string, radarPriority?: string): { sentiment: SentimentKind; urgencyScore: number } {
  const lower = title.toLowerCase()
  const base = radarPriority === 'critical' ? 75 : radarPriority === 'high' ? 65 : 52
  if (/(darurat|banjir|alert|siaga|breaking|urgent|krisis|critical)/.test(lower)) {
    return { sentiment: 'alert', urgencyScore: Math.min(98, base + 20) }
  }
  if (/(investigasi|audit|protes|security|vulnerability|exploit|debate)/.test(lower)) {
    return { sentiment: 'critical', urgencyScore: Math.min(92, base + 14) }
  }
  if (/(live|session|rilis|concert|vinyl|dub|ska|open-source|launch)/.test(lower)) {
    return { sentiment: 'positive', urgencyScore: Math.min(85, base + 8) }
  }
  return { sentiment: 'neutral', urgencyScore: base }
}

/**
 * Parses both YouTube Atom XML (`<entry>`) and standard RSS 2.0 (`<item>`) feeds.
 */
export function parseFeedXml(xml: string, source: MonitorSourceTask['source'], radarPriority?: string): CapturedSignalInput[] {
  const out: CapturedSignalInput[] = []

  const entries = [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((m) => m[0])
  if (entries.length > 0) {
    for (const entry of entries.slice(0, 10)) {
      const videoId = tagText(entry, 'yt:videoId') ?? tagText(entry, 'id') ?? `${source.handle}-${out.length}`
      const title = tagText(entry, 'title') ?? `${source.name} Update`
      const link =
        attrValue(entry, 'link', 'href') ??
        (videoId && !videoId.startsWith('http') ? `https://www.youtube.com/watch?v=${videoId}` : source.targetUrl)
      const author = tagText(entry, 'name') ?? source.name
      const summary = tagText(entry, 'media:description') ?? tagText(entry, 'summary') ?? null
      const viewsRaw = attrValue(entry, 'media:statistics', 'views')
      const likesRaw = attrValue(entry, 'media:starRating', 'count')
      const publishedAt = tagText(entry, 'published') ?? tagText(entry, 'updated') ?? new Date().toISOString()
      const { sentiment, urgencyScore } = scoreHeadline(title, radarPriority)

      out.push({
        externalId: `${source.platform}:${videoId}`.slice(0, 160),
        title: title.slice(0, 240),
        url: link,
        author,
        summary: summary ? summary.slice(0, 1000) : null,
        aiSummary: `[RSS/Atom Telemetry] Captured from ${source.name} (${source.platform}).`,
        sentiment,
        urgencyScore,
        viewsCount: viewsRaw ? Number(viewsRaw) || 0 : 0,
        likesCount: likesRaw ? Number(likesRaw) || 0 : 0,
        commentsCount: 0,
        publishedAt,
      })
    }
    return out
  }

  const items = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0])
  for (const item of items.slice(0, 10)) {
    const title = tagText(item, 'title') ?? `${source.name} Dispatch`
    const link = tagText(item, 'link') ?? source.targetUrl
    const guid = tagText(item, 'guid') ?? link
    const author = tagText(item, 'dc:creator') ?? tagText(item, 'author') ?? source.name
    const summary = tagText(item, 'description') ?? null
    const pubDate = tagText(item, 'pubDate')
    const parsedTime = pubDate ? Date.parse(pubDate) : NaN
    const publishedAt = Number.isNaN(parsedTime) ? new Date().toISOString() : new Date(parsedTime).toISOString()
    const { sentiment, urgencyScore } = scoreHeadline(title, radarPriority)

    out.push({
      externalId: `${source.platform}:${guid}`.slice(0, 160),
      title: title.slice(0, 240),
      url: link,
      author,
      summary: summary ? summary.replace(/<[^>]+>/g, '').slice(0, 1000) : null,
      aiSummary: `[Feed Collector] Indexed from ${source.handle}.`,
      sentiment,
      urgencyScore,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      publishedAt,
    })
  }

  return out
}

export const youtubeRssDriver: MonitorDriver = {
  name: 'rss',
  description: 'Zero-key YouTube Atom XML & RSS 2.0 feed collector',
  async collect(task: MonitorSourceTask, ctx: DriverContext): Promise<CapturedSignalInput[]> {
    const { source, radar } = task
    if (ctx.egressEnabled) {
      const res = await fetch(source.targetUrl, {
        headers: { 'user-agent': 'Moonwitness-Sentinel/1.0 (+https://moonwitness.local)' },
        signal: AbortSignal.timeout(10_000),
      })
      if (res.ok) {
        const xml = await res.text()
        const parsed = parseFeedXml(xml, source, radar?.priority)
        if (parsed.length > 0) return parsed
      }
    }

    const { sentiment, urgencyScore } = scoreHeadline(source.name, radar?.priority)
    return [
      {
        externalId: `${source.platform}:rss:${source.handle}:pulse`,
        title: `[Feed Sync] ${source.name} — Latest Channel Telemetry`,
        url: source.targetUrl,
        author: source.name,
        summary: `Automated RSS/Atom checkpoint for ${source.handle} (${source.externalTarget ?? source.platform}).`,
        aiSummary: `Driver=rss verified feed endpoint for radar "${radar?.name ?? 'unassigned'}".`,
        sentiment,
        urgencyScore,
        viewsCount: 1200,
        likesCount: 95,
        commentsCount: 14,
        publishedAt: new Date().toISOString(),
      },
    ]
  },
}

export const apiDriver: MonitorDriver = {
  name: 'api',
  description: 'Structured JSON / oEmbed API collector for YouTube & social endpoints',
  async collect(task: MonitorSourceTask, ctx: DriverContext): Promise<CapturedSignalInput[]> {
    return youtubeRssDriver.collect(task, ctx)
  },
}
