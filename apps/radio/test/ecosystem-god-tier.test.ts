import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  createQuadTime,
  calculateTemporalDrift,
  validateQuadTimeMonotonicity,
  serializeQuadTimeHeader,
  parseQuadTimeHeader,
  createEpistemicSpan,
  serializeEpistemicTraceHeader,
  parseEpistemicTraceHeader,
} from '@moonwitness/core'
import {
  computeAcousticFingerprint,
  compareFingerprints,
  verifyBroadcastAuthenticity,
} from '@moonwitness/moonql-playlog'
import {
  hybridUnilexSearch,
  generateLocalEmbedding,
  cosineSimilarity,
  type UnilexSearchCandidate,
} from '@moonwitness/moonql-unilex'
import {
  getCachedApiKeyUser,
  setCachedApiKeyUser,
  invalidateKeyCache,
  clearKeyCache,
} from '@moonwitness/moonql-apikeys'

describe('Ecosystem God-Tier Innovations Test Suite', () => {
  describe('1. Quad-Time Epistemic Ledger (Section 21A.1)', () => {
    it('creates normalized 4-dimensional temporal coordinates', () => {
      const now = new Date()
      const t1 = new Date(now.getTime() - 3000)
      const t2 = new Date(now.getTime() - 2000)
      const t3 = new Date(now.getTime() - 1000)
      const t4 = now

      const qt = createQuadTime(t1, t2, t3, t4)
      assert.equal(qt.occurred_at, t1.toISOString())
      assert.equal(qt.observed_at, t2.toISOString())
      assert.equal(qt.recorded_at, t3.toISOString())
      assert.equal(qt.written_at, t4.toISOString())

      const lag = calculateTemporalDrift(qt)
      assert.equal(lag.observationLagMs, 1000)
      assert.equal(lag.ingestionLagMs, 1000)
      assert.equal(lag.sealingLagMs, 1000)
      assert.equal(lag.totalDivergenceMs, 3000)

      const validity = validateQuadTimeMonotonicity(qt)
      assert.equal(validity.valid, true)
    })

    it('detects backwards causal violations in timestamps', () => {
      const invalid = createQuadTime('2026-10-26T12:00:00Z', '2026-10-26T11:00:00Z')
      const check = validateQuadTimeMonotonicity(invalid)
      assert.equal(check.valid, false)
      assert.match(check.violation ?? '', /observed_at .* precedes occurred_at/)
    })

    it('serializes and parses quad-time baggage headers', () => {
      const qt = createQuadTime('2026-10-26T01:00:00.000Z')
      const serialized = serializeQuadTimeHeader(qt)
      assert.match(serialized, /^occ=2026-10-26T01:00:00.000Z;obs=/)

      const parsed = parseQuadTimeHeader(serialized)
      assert.ok(parsed)
      assert.equal(parsed.occurred_at, '2026-10-26T01:00:00.000Z')
    })
  })

  describe('2. Epistemic Distributed Tracing (Section 21A.5)', () => {
    it('generates epistemic span with cryptographic provenance', () => {
      const span = createEpistemicSpan('CANONICAL', {
        provenanceSha: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        rightsStatus: 'RIGHTS_CLEARED',
        reviewerId: 'rev-scholar-001',
      })

      assert.equal(span.epistemicClass, 'CANONICAL')
      assert.equal(span.rightsStatus, 'RIGHTS_CLEARED')
      assert.equal(span.reviewerId, 'rev-scholar-001')
      assert.ok(span.traceId.length > 0)
      assert.ok(span.spanId.length > 0)

      const headers = serializeEpistemicTraceHeader(span)
      assert.ok(headers.traceparent.startsWith('00-'))
      assert.match(headers.baggage, /epistemic_class=CANONICAL/)

      const parsed = parseEpistemicTraceHeader(headers.traceparent, headers.baggage)
      assert.ok(parsed)
      assert.equal(parsed.epistemicClass, 'CANONICAL')
      assert.equal(parsed.rightsStatus, 'RIGHTS_CLEARED')
      assert.equal(parsed.reviewerId, 'rev-scholar-001')
    })
  })

  describe('3. Acoustic Fingerprinting & Authenticity (Section 21A.4)', () => {
    it('computes 64-hex-character acoustic fingerprint from audio frames', () => {
      const dummyPcm = new Uint8Array(4096)
      for (let i = 0; i < dummyPcm.length; i++) {
        dummyPcm[i] = Math.floor(128 + 64 * Math.sin(i / 16))
      }

      const fp = computeAcousticFingerprint(dummyPcm)
      assert.equal(fp.fingerprint.length, 64)
      assert.ok(fp.energyRms > 0)
      assert.ok(fp.confidence > 0)

      // Identical audio yields exact same fingerprint
      const fp2 = computeAcousticFingerprint(dummyPcm)
      assert.equal(fp.fingerprint, fp2.fingerprint)
      assert.equal(compareFingerprints(fp.fingerprint, fp2.fingerprint), 1.0)
      assert.equal(verifyBroadcastAuthenticity(fp.fingerprint, fp2.fingerprint), true)
    })
  })

  describe('4. Hybrid Lexical & Vector Unilex Search (Section 21A.3)', () => {
    it('generates unit-normalized 128-dim local embeddings', () => {
      const vec = generateLocalEmbedding('bismillah rahman rahim')
      assert.equal(vec.length, 128)

      // Verify L2 norm is ~1.0
      let norm = 0
      for (const val of vec) norm += val * val
      assert.ok(Math.abs(Math.sqrt(norm) - 1.0) < 0.01)

      // Cosine similarity of identical strings is ~1.0
      const vec2 = generateLocalEmbedding('bismillah rahman rahim')
      const sim = cosineSimilarity(vec, vec2)
      assert.ok(sim > 0.99)
    })

    it('performs hybrid search weighting lexical and vector similarity', () => {
      const candidates: UnilexSearchCandidate[] = [
        { code: 'TERM-01', label: 'Iman', arabic: 'إيمان', gloss: 'Faith and moral conviction' },
        { code: 'TERM-02', label: 'Amanah', arabic: 'أمانة', gloss: 'Sacred trust and custody' },
        { code: 'TERM-03', label: 'Kitab', arabic: 'كتاب', gloss: 'Scriptural writing or book' },
      ]

      const results = hybridUnilexSearch('Amanah trust', candidates, { alpha: 0.5 })
      assert.ok(results.length > 0)
      assert.equal(results[0]?.code, 'TERM-02') // Amanah ranks first
      assert.ok(results[0].hybridScore > 0.5)
    })
  })

  describe('5. High-Throughput API Key LRU Cache (Section 21A.5)', () => {
    it('caches and retrieves verified API keys with instant invalidation', () => {
      clearKeyCache()

      const dummyHash = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'
      const user = {
        id: 'usr-bot-01',
        roles: ['bot', 'indexer'],
        meta: { keyId: 'key-test-99', name: 'Indexer Bot' },
      }

      setCachedApiKeyUser(dummyHash, user)

      const cached = getCachedApiKeyUser(dummyHash)
      assert.ok(cached)
      assert.equal(cached.id, 'usr-bot-01')
      assert.deepEqual(cached.roles, ['bot', 'indexer'])

      // Instant invalidation by keyId
      invalidateKeyCache('key-test-99')
      assert.equal(getCachedApiKeyUser(dummyHash), null)
    })
  })
})
