# Audit Report: M41-06 — Add the existing AI Gateway adapter

**Status:** CLOSED
**Date:** 2026-10-27
**Target:** Milestone M41 / Task M41-06
**Reviewer:** Owner Review & AI Gateway Boundary Reviewer

---

## 1. Summary of Changes

Implemented `AiGatewayAdapter` in `packages/lumen/src/adapters/ai-gateway.ts` conforming strictly to LUMEN's `ModelGatewayPort` and MoonWitness's existing AI Gateway (`apps/aigateway`) OpenAI-compatible `/v1/chat/completions` API.

Key technical achievements:
1. **Zero Secret Leakage:** Designed and implemented `redactSensitive()` to sanitize Bearer tokens, query API keys, Google Gemini keys, Groq keys, and OpenAI/OpenRouter keys from any error payloads before error generation.
2. **Typed Error Mapping:** Encapsulated HTTP and network failures into `LumenGatewayError` with typed error codes (`UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`, `UNAVAILABLE`, `TIMEOUT`, `CANCELLED`, `MALFORMED_RESPONSE`, `BAD_REQUEST`, `GATEWAY_ERROR`) and accurate `retryable` status flags.
3. **Structured Tool Proposal Parsing:** Supported both native OpenAI-compatible `choice.message.tool_calls` and fallback structured JSON blocks in `choice.message.content` for providers without native function-calling.
4. **Usage Metadata Extraction:** Extracted `promptTokens`, `completionTokens`, and `totalTokens` from gateway response usage metadata without inventing unverified token metrics.
5. **Architectural Isolation:** Maintained monorepo boundaries—no direct imports from `apps/aigateway` into `packages/lumen`. Provider selection, credential persistence, and cascading fallback logic remain strictly owned by `apps/aigateway`.

---

## 2. Inspected Gateway Paths & Baseline

- `apps/aigateway/src/server.ts`: Fastify route `/v1/chat/completions`
- `apps/aigateway/src/types.ts`: `ChatCompletionRequest`, `ChatCompletionResponse`, `ChatMessage`, `CompletionUsage`
- `apps/aigateway/src/router.ts`: Free-first cascading router (Gemini -> Groq -> OpenRouter -> Ollama -> Heuristic)
- `apps/aigateway/src/providers/*.ts`: Provider adapters with standard timeouts

---

## 3. Test Verification & Results

Suite executed:
`pnpm --filter @moonwitness/lumen test`

Results:
```
✔ positive: agent loop finishes directly when model returns final answer
✔ positive: agent loop executes allowlisted tool and continues to final completion
✔ negative: reject unknown tool proposed by model
✔ negative: stop when max iterations exhausted
✔ negative: stop with CANCELLED on AbortSignal
✔ negative: pause run when tool requires human approval
✔ positive: ai gateway adapter handles standard completion and structured tool calls
✔ positive: ai gateway adapter parses structured JSON tool proposal from content fallback
✔ negative: handles 401 unauthorized, 429 rate limit, and 503 unavailable with typed errors and redacted secrets
✔ negative: handles timeout, network error, and malformed json safely without silent fallback
✔ positive: redactSensitive correctly redacts Bearer, Gemini, Groq, and OpenRouter keys
✔ positive: @moonwitness/lumen exports documented public entries and ports
✔ negative: importing package causes no network/timer/server side effects and rejects invalid inputs
✔ positive: registered tool passes schema check and executes under trusted capabilities
✔ negative: reject unknown tool, missing capabilities, malformed args, and approval bypass
ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ duration_ms 10191.7627
```

---

## 4. Contract Limitations & Boundaries Preserved

- The gateway does not currently support streaming tool calls; inference is handled via buffered JSON request/response.
- Direct provider credentials or SDKs are strictly prohibited in `packages/lumen`.
- Deadlines and cancellations are enforced cooperatively via `AbortController` and `timeoutMs`.
