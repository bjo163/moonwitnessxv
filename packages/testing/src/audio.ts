/**
 * Synthetic Audio Generators for Audio DSP & Playback Testing
 */

/**
 * Generates an 8-bit unsigned synthetic PCM sine wave buffer.
 */
export function generateSyntheticPcm(
  frequencyHz = 440,
  durationMs = 1000,
  sampleRate = 44100
): Uint8Array {
  const numSamples = Math.floor((sampleRate * durationMs) / 1000)
  const buffer = new Uint8Array(numSamples)
  const angularFreq = 2 * Math.PI * frequencyHz

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const sample = Math.sin(angularFreq * t)
    // Scale -1.0..1.0 to 0..255 (128 center silence)
    buffer[i] = Math.floor(128 + 127 * sample)
  }

  return buffer
}

/**
 * Generates an ICY metadata chunk containing StreamTitle payload.
 */
export function generateMockIcyMetadata(artist: string, title: string): Uint8Array {
  const str = `StreamTitle='${artist} - ${title}';`
  const byteLen = str.length
  // ICY metadata length byte is ceil(byteLen / 16)
  const lengthByte = Math.ceil(byteLen / 16)
  const paddedLen = lengthByte * 16

  const result = new Uint8Array(1 + paddedLen)
  result[0] = lengthByte

  const encoder = new TextEncoder()
  const encoded = encoder.encode(str)
  result.set(encoded, 1)

  return result
}
