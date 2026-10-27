import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  LumenTelemetrySink,
  TokenBudgetManager,
  executeAgentLoop,
} from '../dist/index.js';

test('positive: correlated spans and metrics tracking with accurate duration and trace correlation', async () => {
  let currentTime = new Date('2026-10-27T12:00:00Z');
  const clock = () => currentTime;

  const endedSpans = [];
  const sink = new LumenTelemetrySink({
    clockFn: clock,
    onSpanEnded: (s) => endedSpans.push(s),
  });

  const runId = 'run-trace-001';

  // Start parent span (Run Execution)
  const rootSpanId = sink.startSpan({
    name: 'agent.run_execution',
    runId,
    attributes: { workflowVersion: '1.0.0', tenant: 'tenant_omega' },
  });

  // Advance clock by 150ms
  currentTime = new Date(currentTime.getTime() + 150);

  // Start child span (Model Gateway call)
  const childSpanId = sink.startSpan({
    name: 'gateway.chat_completion',
    runId,
    parentSpanId: rootSpanId,
    attributes: { model: 'gemini-2.5-flash' },
  });

  // Advance clock by 250ms
  currentTime = new Date(currentTime.getTime() + 250);

  // End child span
  sink.endSpan(childSpanId, {
    status: 'OK',
    attributes: { promptTokens: 40, completionTokens: 60 },
  });

  // Advance clock by 50ms
  currentTime = new Date(currentTime.getTime() + 50);

  // End parent span
  sink.endSpan(rootSpanId, {
    status: 'OK',
  });

  const completed = sink.getCompletedSpans();
  assert.equal(completed.length, 2);

  const child = completed[0];
  const root = completed[1];

  assert.equal(child.name, 'gateway.chat_completion');
  assert.equal(child.durationMs, 250);
  assert.equal(child.parentSpanId, rootSpanId);
  assert.equal(child.traceId, root.traceId); // Both share identical run trace ID!

  assert.equal(root.name, 'agent.run_execution');
  assert.equal(root.durationMs, 450); // 150 + 250 + 50
  assert.equal(root.status, 'OK');
});

test('negative: sensitive fields and secret tokens are excluded/redacted by policy', async () => {
  const sink = new LumenTelemetrySink();
  const runId = 'run-redact-test';
  const dummyGemini = ['AIza', 'SyA00000000000000000000000000000000'].join('');
  const dummyGroq = ['gsk', '1234567890123456789012345678901234'].join('_');

  // Span with API key in attribute
  const spanId = sink.startSpan({
    name: 'tool.dispatch',
    runId,
    attributes: {
      authHeader: 'Bearer secret_super_token_99999999999',
      endpoint: 'https://gateway.internal?key=' + dummyGemini,
    },
  });

  sink.endSpan(spanId, {
    error: {
      code: 'AUTH_FAILED',
      message: 'Failed to authenticate with token ' + dummyGroq,
    },
  });

  const spans = sink.getCompletedSpans();
  assert.equal(spans.length, 1);
  const span = spans[0];

  assert(!String(span.attributes.authHeader).includes('secret_super_token_99999999999'));
  assert(String(span.attributes.authHeader).includes('Bearer [REDACTED]'));
  assert(String(span.attributes.endpoint).includes('key=[REDACTED]'));
  assert(!String(span.error?.message).includes(dummyGroq));
  assert(String(span.error?.message).includes('[REDACTED_GROQ_KEY]'));

  // Event emission with sensitive prompt
  await sink.emitEvent({
    eventId: 'evt_1',
    runId,
    timestamp: new Date().toISOString(),
    eventType: 'USER_INPUT',
    data: {
      rawPrompt: 'Classified secret intel prompt content',
      token: 'jwt_secret_token_123',
      normalInfo: 'Processing batch 42',
    },
  });

  const events = sink.getEmittedEvents();
  assert.equal(events.length, 1);
  assert.equal(events[0].data.rawPrompt, '[REDACTED_BY_POLICY]');
  assert.equal(events[0].data.token, '[REDACTED_BY_POLICY]');
  assert.equal(events[0].data.normalInfo, 'Processing batch 42');
});

test('negative: token budget manager halts loop when budget is exhausted', async () => {
  const budget = new TokenBudgetManager({ maxTokens: 100 });
  assert.equal(await budget.getRemainingBudget(), 100);

  // Consume 60 tokens
  const ok1 = await budget.consumeBudget(60);
  assert.equal(ok1, true);
  assert.equal(await budget.getRemainingBudget(), 40);

  // Consume 40 tokens (hits cap)
  const ok2 = await budget.consumeBudget(40);
  assert.equal(ok2, true);
  assert.equal(await budget.getRemainingBudget(), 0);
  assert.equal(budget.isExhausted(), true);

  // Attempting to consume more tokens fails
  const ok3 = await budget.consumeBudget(10);
  assert.equal(ok3, false);

  // Integration with agent loop: loop with exhausted budget halts immediately
  const mockGateway = {
    async requestInference() {
      return { content: 'Should not reach here' };
    },
  };

  const loopResult = await executeAgentLoop({
    run: {
      runId: 'run-budget-exhausted',
      workflowVersion: '1.0.0',
      status: 'CLAIMED',
      currentStepIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    context: {
      tenantId: 'tenant_test',
      userId: 'user_test',
      capabilities: ['*'],
    },
    gateway: mockGateway,
    budget,
  });

  assert.equal(loopResult.finalStatus, 'FAILED');
  assert.equal(loopResult.error?.code, 'BUDGET_EXHAUSTED');
  assert(loopResult.error?.message.includes('budget exhausted'));
});

test('positive: telemetry disabled produces no overhead and stores no spans', async () => {
  const sink = new LumenTelemetrySink({ enabled: false });

  const spanId = sink.startSpan({ name: 'disabled_span', runId: 'run_off' });
  assert.equal(spanId, 'noop-span-id');

  sink.endSpan(spanId, { status: 'OK' });
  await sink.emitEvent({
    eventId: 'evt_off',
    runId: 'run_off',
    timestamp: new Date().toISOString(),
    eventType: 'TEST',
    data: { foo: 'bar' },
  });

  assert.equal(sink.getCompletedSpans().length, 0);
  assert.equal(sink.getEmittedEvents().length, 0);
});
