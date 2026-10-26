import { assertPublicHttpUrl } from './web-fetch.js'

export interface IcyMetadata {
  artist: string | null
  title: string
  rawTitle: string
  stationName: string | null
  genre: string | null
  bitrate: number | null
  url: string | null
}

/**
 * Extracts and splits `StreamTitle='Artist - Title';` into structured artist and title.
 */
export function parseIcyTitle(rawTitle: string): { artist: string | null; title: string } {
  const cleaned = rawTitle.trim()
  if (!cleaned) return { artist: null, title: 'Live Broadcast' }

  // Check for common artist/title separators: " - ", " – ", " — "
  const splitIndex = cleaned.search(/\s[-–—]\s/)
  if (splitIndex > 0) {
    const artist = cleaned.slice(0, splitIndex).trim()
    const title = cleaned.slice(splitIndex + 3).trim()
    if (artist && title) {
      return { artist, title }
    }
  }

  return { artist: null, title: cleaned }
}

/**
 * Extracts metadata dictionary from raw ICY metadata block string.
 * Example: "StreamTitle='Perturbator - Future Club';StreamUrl='https://moonwitness.media';"
 */
export function parseIcyBlock(block: string): Record<string, string> {
  const result: Record<string, string> = {}
  const regex = /([a-zA-Z0-9]+)='([^']*)';/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(block)) !== null) {
    if (match[1] && match[2] !== undefined) {
      result[match[1]] = match[2]
    }
  }
  return result
}

export interface FetchIcyOptions {
  timeoutMs?: number
  fetchFn?: typeof fetch
  maxAudioBytes?: number
}

/**
 * Fetches stream headers and sniffs the first ICY metadata chunk with bounds & SSRF safety.
 * Aborts connection as soon as first title is received or timeout is reached.
 */
export async function fetchIcyMetadata(
  streamUrl: string,
  options: FetchIcyOptions = {},
): Promise<IcyMetadata | null> {
  // SSRF Layer 1 check
  assertPublicHttpUrl(streamUrl)

  const timeoutMs = options.timeoutMs ?? 3500
  const fetchFn = options.fetchFn ?? fetch
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetchFn(streamUrl, {
      method: 'GET',
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': 'Moonwitness-AudioProbe/1.0 (+https://moonwitness.media)',
      },
      signal: controller.signal,
    })

    if (!res.ok && res.status !== 206) {
      return null
    }

    const stationName = res.headers.get('icy-name')
    const genre = res.headers.get('icy-genre')
    const bitrateStr = res.headers.get('icy-br')
    const bitrate = bitrateStr ? Number.parseInt(bitrateStr, 10) || null : null
    const url = res.headers.get('icy-url')
    const metaintHeader = res.headers.get('icy-metaint')
    const metaint = metaintHeader ? Number.parseInt(metaintHeader, 10) : 0

    let rawTitle = ''

    if (metaint > 0 && res.body) {
      const reader = res.body.getReader()
      let totalBytesRead = 0
      let audioBufferCount = 0
      let metaLength = 0
      const metaChunks: Uint8Array[] = []
      let readingMeta = false

      try {
        while (totalBytesRead < (options.maxAudioBytes ?? 65536)) {
          const { value, done } = await reader.read()
          if (done || !value) break

          let offset = 0
          while (offset < value.length) {
            if (!readingMeta) {
              const neededAudio = metaint - audioBufferCount
              const available = value.length - offset
              if (available < neededAudio) {
                audioBufferCount += available
                offset += available
              } else {
                offset += neededAudio
                audioBufferCount = 0
                // Next byte is meta length byte (length in 16-byte blocks)
                if (offset < value.length) {
                  const lenByte = value[offset]
                  offset += 1
                  if (lenByte !== undefined) {
                    metaLength = lenByte * 16
                    if (metaLength > 0) {
                      readingMeta = true
                      metaChunks.length = 0
                    }
                  }
                }
              }
            } else {
              const currentMetaRead = metaChunks.reduce((acc, c) => acc + c.length, 0)
              const neededMeta = metaLength - currentMetaRead
              const available = value.length - offset
              const toTake = Math.min(available, neededMeta)
              metaChunks.push(value.slice(offset, offset + toTake))
              offset += toTake

              if (currentMetaRead + toTake >= metaLength) {
                // Done reading metadata block!
                const fullMetaBytes = new Uint8Array(metaLength)
                let p = 0
                for (const chunk of metaChunks) {
                  fullMetaBytes.set(chunk, p)
                  p += chunk.length
                }
                const metaString = new TextDecoder('utf-8').decode(fullMetaBytes)
                const parsed = parseIcyBlock(metaString)
                if (parsed.StreamTitle) {
                  rawTitle = parsed.StreamTitle
                }
                // We got the metadata, terminate stream immediately
                break
              }
            }
          }

          if (rawTitle) break
          totalBytesRead += value.length
        }
      } finally {
        await reader.cancel().catch(() => {})
      }
    }

    const { artist, title } = parseIcyTitle(rawTitle || stationName || 'Live Audio Stream')

    return {
      artist,
      title,
      rawTitle: rawTitle || title,
      stationName,
      genre,
      bitrate,
      url,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
