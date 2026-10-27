import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { z } from 'zod';

// Test-only authoritative contract. Runtime packages do not export or persist it.
const sha256 = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const reference = z.string().min(1).max(512);
const evidence = z.object({
  schemaVersion: z.literal('1.0.0'),
  candidate: z.object({
    candidateRef: reference,
    kind: z.enum(['CLAIM', 'EDIT', 'TOOL_CALL']),
    status: z.literal('AI_SUGGESTION'),
  }).strict(),
  model: z.object({
    provider: reference,
    modelId: reference,
    modelRevision: reference.optional(),
    gatewayRequestRef: reference,
  }).strict(),
  prompt: z.object({
    templateRef: reference,
    version: reference,
    sha256,
  }).strict(),
  provenance: z.array(z.object({
    sourceRef: reference,
    editionRef: reference.optional(),
    contentSha256: sha256,
    authorizationRef: reference,
  }).strict()).min(1),
  consent: z.object({
    decisionRef: reference,
    state: z.enum(['GRANTED', 'DENIED', 'WITHDRAWN', 'UNKNOWN']),
    scopeRef: reference,
    observedAt: z.string().datetime({ offset: true }),
  }).strict(),
  output: z.object({
    outputRef: reference,
    outputSha256: sha256,
  }).strict(),
  toolCalls: z.array(z.object({
    lumenRunId: reference,
    lumenStepId: z.string().regex(/^step_[1-9][0-9]*_.+$/),
    lumenEventId: reference,
    toolId: reference,
    toolVersion: reference,
    argumentSha256: sha256,
    approvalRef: reference.optional(),
  }).strict()),
}).strict();

const valid = {
  schemaVersion: '1.0.0',
  candidate: { candidateRef: 'candidate:abc123', kind: 'CLAIM', status: 'AI_SUGGESTION' },
  model: { provider: 'openai', modelId: 'model-x', gatewayRequestRef: 'gateway:req-123' },
  prompt: { templateRef: 'prompt:claim', version: '3', sha256: `sha256:${'a'.repeat(64)}` },
  provenance: [{ sourceRef: 'source:42', editionRef: 'edition:7', contentSha256: `sha256:${'b'.repeat(64)}`, authorizationRef: 'rights:snapshot-9' }],
  consent: { decisionRef: 'consent:snapshot-4', state: 'GRANTED', scopeRef: 'scope:claim-draft', observedAt: '2026-10-27T00:00:00Z' },
  output: { outputRef: 'output:hash-only', outputSha256: `sha256:${'c'.repeat(64)}` },
  toolCalls: [{ lumenRunId: 'run_001', lumenStepId: 'step_1_run_001', lumenEventId: 'event_001', toolId: 'draft-claim', toolVersion: '1', argumentSha256: `sha256:${'d'.repeat(64)}` }],
};

test('published JSON Schema matches authoritative Zod contract', async () => {
  const published = JSON.parse(await readFile(new URL('../../docs/architecture/schemas/ai-candidate-evidence.v1.schema.json', import.meta.url), 'utf8'));
  assert.deepEqual(published, z.toJSONSchema(evidence, { target: 'draft-2020-12' }));
});

test('positive fixture records model, prompt, provenance, consent, output and LUMEN tool references', () => {
  assert.equal(evidence.safeParse(valid).success, true);
});

test('positive fixture permits provenance sources without an edition reference', () => {
  const record = structuredClone(valid);
  delete record.provenance[0].editionRef;
  assert.equal(evidence.safeParse(record).success, true);
});

test('negative fixtures reject missing consent, malformed hashes, and raw prompt content', () => {
  const noConsent = structuredClone(valid); delete noConsent.consent;
  assert.equal(evidence.safeParse(noConsent).success, false);
  const badHash = structuredClone(valid); badHash.prompt.sha256 = 'not-a-hash';
  assert.equal(evidence.safeParse(badHash).success, false);
  const rawPrompt = structuredClone(valid); rawPrompt.prompt.text = 'private prompt bytes';
  assert.equal(evidence.safeParse(rawPrompt).success, false);
});

test('denied, withdrawn, and unknown consent remain evidence states, not approval', () => {
  for (const state of ['DENIED', 'WITHDRAWN', 'UNKNOWN']) {
    const record = structuredClone(valid); record.consent.state = state;
    assert.equal(evidence.safeParse(record).success, true);
  }
});
