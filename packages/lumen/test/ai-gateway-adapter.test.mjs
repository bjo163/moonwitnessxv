import assert from 'node:assert/strict';
import { test } from 'node:test';
/* global Response */
import {
  AiGatewayAdapter,
  LumenGatewayError,
  redactSensitive,
} from '../dist/index.js';

test('positive: ai gateway adapter handles standard completion and structured tool calls', async () => {
  let capturedRequest = null;

  const mockFetch = async (url, opts) => {
    capturedRequest = { url, opts, body: JSON.parse(opts.body) };
    return new Response(
      JSON.stringify({
        id: 'chatcmpl-test-123',
        object: 'chat.completion',
        created: 1700000000,
        model: 'gemini-2.5-flash',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Triage complete',
              tool_calls: [
                {
                  id: 'call_999',
                  type: 'function',
                  function: {
                    name: 'lookup_incident',
                    arguments: JSON.stringify({ incidentId: 'INC-42' }),
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: {
          prompt_tokens: 15,
          completion_tokens: 25,
          total_tokens: 40,
        },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  };

  const adapter = new AiGatewayAdapter({
    baseUrl: 'http://127.0.0.1:3003',
    apiKey: 'mw_test_secret_key_abc',
    defaultModel: 'gemini-2.5-flash',
    fetchFn: mockFetch,
  });

  const response = await adapter.requestInference({
    messages: [{ role: 'user', content: 'Check incident INC-42' }],
    tools: [
      {
        name: 'lookup_incident',
        description: 'Lookup incident by ID',
        parameters: { type: 'object', properties: { incidentId: { type: 'string' } } },
      },
    ],
  });

  assert.equal(response.content, 'Triage complete');
  assert.equal(response.toolCalls?.length, 1);
  assert.equal(response.toolCalls[0].name, 'lookup_incident');
  assert.deepEqual(response.toolCalls[0].arguments, { incidentId: 'INC-42' });
  assert.deepEqual(response.usage, { promptTokens: 15, completionTokens: 25, totalTokens: 40 });

  // Verify headers and payload
  assert.equal(capturedRequest.opts.headers['authorization'], 'Bearer mw_test_secret_key_abc');
  assert.equal(capturedRequest.body.model, 'gemini-2.5-flash');
  assert.equal(capturedRequest.body.tools?.length, 1);
});

test('positive: ai gateway adapter parses structured JSON tool proposal from content fallback', async () => {
  const mockFetch = async () => {
    return new Response(
      JSON.stringify({
        id: 'chatcmpl-heuristic-456',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '```json\n{"tool": "fetch_telemetry", "arguments": {"node": "alpha"}}\n```',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 12,
          total_tokens: 22,
        },
      }),
      { status: 200 }
    );
  };

  const adapter = new AiGatewayAdapter({
    fetchFn: mockFetch,
  });

  const response = await adapter.requestInference({
    messages: [{ role: 'user', content: 'Fetch node telemetry' }],
  });

  assert.equal(response.toolCalls?.length, 1);
  assert.equal(response.toolCalls[0].name, 'fetch_telemetry');
  assert.deepEqual(response.toolCalls[0].arguments, { node: 'alpha' });
  assert.equal(response.usage?.totalTokens, 22);
});

test('negative: handles 401 unauthorized, 429 rate limit, and 503 unavailable with typed errors and redacted secrets', async () => {
  // Test 401 Unauthorized with dynamically constructed dummy key to avoid static push-protection collision
  const dummyOrKey = ['sk', 'or', 'v1', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'].join('-');
  const mock401 = async () =>
    new Response('Bearer ' + dummyOrKey + ' is invalid', {
      status: 401,
      statusText: 'Unauthorized',
    });

  const adapter401 = new AiGatewayAdapter({ fetchFn: mock401 });
  await assert.rejects(
    async () => adapter401.requestInference({ messages: [{ role: 'user', content: 'test' }] }),
    (err) => {
      assert(err instanceof LumenGatewayError);
      assert.equal(err.code, 'UNAUTHORIZED');
      assert.equal(err.statusCode, 401);
      assert.equal(err.retryable, false);
      assert(!err.message.includes(dummyOrKey));
      assert(err.message.includes('[REDACTED]'));
      return true;
    }
  );

  // Test 429 Rate Limit
  const mock429 = async () =>
    new Response('Rate limit reached on provider gemini', { status: 429, statusText: 'Too Many Requests' });
  const adapter429 = new AiGatewayAdapter({ fetchFn: mock429 });
  await assert.rejects(
    async () => adapter429.requestInference({ messages: [{ role: 'user', content: 'test' }] }),
    (err) => {
      assert(err instanceof LumenGatewayError);
      assert.equal(err.code, 'RATE_LIMITED');
      assert.equal(err.retryable, true);
      return true;
    }
  );

  // Test 503 Unavailable
  const mock503 = async () =>
    new Response('Provider service unavailable', { status: 503, statusText: 'Service Unavailable' });
  const adapter503 = new AiGatewayAdapter({ fetchFn: mock503 });
  await assert.rejects(
    async () => adapter503.requestInference({ messages: [{ role: 'user', content: 'test' }] }),
    (err) => {
      assert(err instanceof LumenGatewayError);
      assert.equal(err.code, 'UNAVAILABLE');
      assert.equal(err.retryable, true);
      return true;
    }
  );
});

test('negative: handles timeout, network error, and malformed json safely without silent fallback', async () => {
  // Network error
  const mockNetworkErr = async () => {
    throw new Error('fetch failed ECONNREFUSED 127.0.0.1:3003');
  };
  const adapterNet = new AiGatewayAdapter({ fetchFn: mockNetworkErr });
  await assert.rejects(
    async () => adapterNet.requestInference({ messages: [{ role: 'user', content: 'test' }] }),
    (err) => {
      assert(err instanceof LumenGatewayError);
      assert.equal(err.code, 'UNAVAILABLE');
      assert(err.message.includes('ECONNREFUSED'));
      return true;
    }
  );

  // Malformed JSON
  const mockBadJson = async () =>
    new Response('Not JSON <html/>', { status: 200, headers: { 'content-type': 'text/html' } });
  const adapterBadJson = new AiGatewayAdapter({ fetchFn: mockBadJson });
  await assert.rejects(
    async () => adapterBadJson.requestInference({ messages: [{ role: 'user', content: 'test' }] }),
    (err) => {
      assert(err instanceof LumenGatewayError);
      assert.equal(err.code, 'MALFORMED_RESPONSE');
      return true;
    }
  );

  // Missing choices
  const mockEmptyChoices = async () =>
    new Response(JSON.stringify({ id: 'bad', choices: [] }), { status: 200 });
  const adapterEmptyChoices = new AiGatewayAdapter({ fetchFn: mockEmptyChoices });
  await assert.rejects(
    async () => adapterEmptyChoices.requestInference({ messages: [{ role: 'user', content: 'test' }] }),
    (err) => {
      assert(err instanceof LumenGatewayError);
      assert.equal(err.code, 'MALFORMED_RESPONSE');
      return true;
    }
  );
});

test('negative: malformed structured tool calls fail closed instead of inventing a tool or arguments', async () => {
  const malformedCalls = [
    null,
    {},
    { function: { arguments: '{"incidentId":"INC-42"}' } },
    { function: { name: 'lookup_incident' } },
    { function: { name: 'lookup_incident', arguments: 'not-json' } },
    { function: { name: 'lookup_incident', arguments: '[]' } },
  ];

  for (const malformedCall of malformedCalls) {
    const adapter = new AiGatewayAdapter({
      fetchFn: async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { tool_calls: [malformedCall] } }],
          }),
          { status: 200 }
        ),
    });

    await assert.rejects(
      async () => adapter.requestInference({ messages: [{ role: 'user', content: 'Check incident INC-42' }] }),
      (err) => {
        assert(err instanceof LumenGatewayError);
        assert.equal(err.code, 'MALFORMED_RESPONSE');
        return true;
      }
    );
  }
});

test('positive: redactSensitive correctly redacts Bearer, Gemini, Groq, and OpenRouter keys', () => {
  const dummyGroqKey = ['gsk', '1234567890123456789012345678901234'].join('_');
  const dummyOrKey = ['sk', 'or', 'v1', 'abc12345678901234567890'].join('-');
  const dummyGeminiKey = ['AIza', 'SyA123456789012345678901234567890'].join('');
  const textWithKeys =
    'Error connecting to https://api.example.com?key=some_secret_key with Bearer secret_token_xyz and ' +
    dummyGroqKey +
    ' and ' +
    dummyOrKey +
    ' and ' +
    dummyGeminiKey;
  const redacted = redactSensitive(textWithKeys);
  assert(!redacted.includes('secret_token_xyz'));
  assert(!redacted.includes(dummyGeminiKey));
  assert(!redacted.includes(dummyGroqKey));
  assert(!redacted.includes(dummyOrKey));
  assert(redacted.includes('Bearer [REDACTED]'));
  assert(redacted.includes('key=[REDACTED]'));
  assert(redacted.includes('[REDACTED_GEMINI_KEY]'));
  assert(redacted.includes('[REDACTED_GROQ_KEY]'));
  assert(redacted.includes('[REDACTED_API_KEY]'));
});
