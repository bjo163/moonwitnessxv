import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateSyntheticPcm,
  generateMockIcyMetadata,
  assertQuadTimeMonotonic,
  createMockCitation,
  generateMockStations,
  createMockSignal,
} from '@moonwitness/testing'
import {
  freeMonorepoPorts,
  checkMonorepoServices,
  printHelp,
  runCli,
} from '@moonwitness/cli'
// ARSY depends on @moonwitness/core, which owns the same QuadTime contract;
// @moonwitness/types is not an ARSY dependency, so it cannot be resolved here.
import type { QuadTime } from '@moonwitness/core'

describe('@moonwitness/testing harness', () => {
  it('generates synthetic 8-bit PCM audio with valid buffer dimensions and values', () => {
    const sampleRate = 8000
    const durationMs = 100 // 800 samples
    const pcm = generateSyntheticPcm(440, durationMs, sampleRate)

    assert.equal(pcm.length, 800)
    assert.ok(pcm instanceof Uint8Array)

    // Verify samples are bounded in 0..255 and oscillate around 128
    let min = 255
    let max = 0
    for (const sample of pcm) {
      if (sample < min) min = sample
      if (sample > max) max = sample
    }
    assert.ok(min < 128, 'PCM minimum should be below center silence 128')
    assert.ok(max > 128, 'PCM maximum should be above center silence 128')
  })

  it('generates valid ICY metadata frames with 16-byte boundary padding', () => {
    const artist = 'Moon Ensemble'
    const title = 'Lofi Odyssey'
    const frame = generateMockIcyMetadata(artist, title)

    const expectedStr = `StreamTitle='${artist} - ${title}';`
    const lengthByte = frame[0]
    assert.ok(typeof lengthByte === 'number' && lengthByte > 0)
    assert.equal(lengthByte, Math.ceil(expectedStr.length / 16))
    assert.equal(frame.length, 1 + lengthByte * 16)

    const decoded = new TextDecoder().decode(frame.slice(1, 1 + expectedStr.length))
    assert.equal(decoded, expectedStr)
  })

  it('asserts causal monotonic time coordinates in QuadTime', () => {
    const validQt: QuadTime = {
      occurred_at: '2026-10-26T12:00:00.000Z',
      observed_at: '2026-10-26T12:00:01.000Z',
      recorded_at: '2026-10-26T12:00:02.000Z',
      written_at: '2026-10-26T12:00:03.000Z',
    }

    assert.doesNotThrow(() => {
      assertQuadTimeMonotonic(validQt)
    })

    const acausalQt: QuadTime = {
      occurred_at: '2026-10-26T12:00:00.000Z',
      observed_at: '2026-10-26T11:59:00.000Z', // 1 minute in the past!
      recorded_at: '2026-10-26T12:00:02.000Z',
      written_at: '2026-10-26T12:00:03.000Z',
    }

    assert.throws(
      () => {
        assertQuadTimeMonotonic(acausalQt)
      },
      /Causal violation/,
    )
  })

  it('creates mock passage citations with default and custom attributes', () => {
    const defaultCitation = createMockCitation()
    assert.equal(defaultCitation.licenseStatus, 'RIGHTS_CLEARED')
    assert.ok(defaultCitation.urn.includes('work-quran'))

    const customCitation = createMockCitation({
      workCode: 'work-tanakh',
      citation: 'Gen 1:1',
      licenseStatus: 'PUBLIC_DOMAIN',
    })
    assert.equal(customCitation.workCode, 'work-tanakh')
    assert.equal(customCitation.citation, 'Gen 1:1')
    assert.equal(customCitation.licenseStatus, 'PUBLIC_DOMAIN')
  })

  it('generates mock stations and sentinel signals correctly', () => {
    const stations = generateMockStations(3)
    assert.equal(stations.length, 3)
    assert.equal(stations[0]?.type, 'bgm')
    assert.equal(stations[1]?.type, 'radio')

    const signal = createMockSignal({ urgencyScore: 92 })
    assert.equal(signal.sentiment, 'critical')
    assert.equal(signal.urgencyScore, 92)
  })
})

describe('@moonwitness/cli suite', () => {
  it('frees mock unallocated port without errors', () => {
    const result = freeMonorepoPorts([59998])
    assert.ok(Array.isArray(result.freed))
    assert.ok(Array.isArray(result.errors))
  })

  it('checks 5 canonical monorepo microservice ports', async () => {
    const services = await checkMonorepoServices()
    assert.equal(services.length, 5)
    const ports = services.map((s) => s.port)
    assert.deepEqual(ports, [3000, 3001, 3002, 3003, 3004])

    for (const service of services) {
      assert.ok(['ONLINE', 'OFFLINE'].includes(service.status))
      assert.ok(service.url.startsWith('http://127.0.0.1:'))
    }
  })

  it('runs CLI help commands without exception', async () => {
    assert.doesNotThrow(() => {
      printHelp()
    })

    await assert.doesNotReject(async () => {
      await runCli(['help'])
    })
  })
})
