import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseIcyTitle, parseIcyBlock, fetchIcyMetadata } from '@moonwitness/core'

test('parseIcyTitle: splits standard hyphen delimiter', () => {
  const result = parseIcyTitle('Kavinsky - Nightcall')
  assert.equal(result.artist, 'Kavinsky')
  assert.equal(result.title, 'Nightcall')
})

test('parseIcyTitle: handles en-dash and em-dash delimiters', () => {
  const enDash = parseIcyTitle('Gunship – Tech Noir')
  assert.equal(enDash.artist, 'Gunship')
  assert.equal(enDash.title, 'Tech Noir')

  const emDash = parseIcyTitle('Carpenter Brut — Turbo Killer')
  assert.equal(emDash.artist, 'Carpenter Brut')
  assert.equal(emDash.title, 'Turbo Killer')
})

test('parseIcyTitle: returns full title when no artist delimiter is present', () => {
  const result = parseIcyTitle('Cyberpunk Synth Wave Vol 4')
  assert.equal(result.artist, null)
  assert.equal(result.title, 'Cyberpunk Synth Wave Vol 4')
})

test('parseIcyBlock: parses StreamTitle and StreamUrl keys', () => {
  const block = "StreamTitle='The Midnight - Sunset';StreamUrl='https://moonwitness.media';"
  const parsed = parseIcyBlock(block)
  assert.equal(parsed.StreamTitle, 'The Midnight - Sunset')
  assert.equal(parsed.StreamUrl, 'https://moonwitness.media')
})

test('fetchIcyMetadata: refuses SSRF / private targets before network fetch', async () => {
  await assert.rejects(
    async () => fetchIcyMetadata('http://localhost:5432/stream'),
    /refused private target localhost/,
  )
})

test('fetchIcyMetadata: extracts metadata from mock ICY response body', async () => {
  const metaint = 16
  const audioChunk = new Uint8Array(metaint).fill(65) // 16 bytes of dummy audio
  const metaString = "StreamTitle='Perturbator - Future Club';"
  const metaBytes = new TextEncoder().encode(metaString)
  // length byte: ceil(metaBytes.length / 16)
  const lenBlocks = Math.ceil(metaBytes.length / 16)
  const paddedMeta = new Uint8Array(lenBlocks * 16)
  paddedMeta.set(metaBytes)

  const payload = new Uint8Array(metaint + 1 + paddedMeta.length)
  payload.set(audioChunk, 0)
  payload[metaint] = lenBlocks
  payload.set(paddedMeta, metaint + 1)

  const mockResponse = new Response(payload, {
    status: 200,
    headers: {
      'icy-name': 'Moonwave FM',
      'icy-genre': 'Synthwave',
      'icy-br': '320',
      'icy-metaint': String(metaint),
    },
  })

  const mockFetch = async () => mockResponse

  const meta = await fetchIcyMetadata('https://streaming.example.com/live', { fetchFn: mockFetch as unknown as typeof fetch })
  assert.ok(meta)
  assert.equal(meta.artist, 'Perturbator')
  assert.equal(meta.title, 'Future Club')
  assert.equal(meta.stationName, 'Moonwave FM')
  assert.equal(meta.genre, 'Synthwave')
  assert.equal(meta.bitrate, 320)
})
