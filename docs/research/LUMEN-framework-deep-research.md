# LUMEN — Agent Framework Deep Research

**Date:** 27 October 2026  
**Status:** Research synthesis for proposed ADR-0010; not an accepted architecture decision and not implementation evidence.  
**Repository context:** [MoonWitness XV](https://github.com/bjo163/moonwitnessxv), current branch policy is documented in AGENTS.md.

## Executive finding

LUMEN should be designed as a **MoonWitness-owned agent framework package plus a separately runnable internal worker application**, both initially inside the XV pnpm monorepo:

- Framework: **packages/lumen**, package name **@moonwitness/lumen**.
- Worker application: **apps/lumen-runtime**, package name **@moonwitness/lumen-runtime**.
- The worker is not a second public API, Hub, identity provider, database owner, model router, or UI.
- ARSY remains the source of authorization and canonical run/task state. The LUMEN worker executes runs only through approved ARSY contracts.
- The AI Gateway remains responsible for model/provider routing. LUMEN consumes its existing internal interface; it must not silently bypass it.
- PostgreSQL/MoonQL remains behind the existing ownership boundary. LUMEN must not connect directly to the database or create its own canonical tables.
- Implement the agent framework itself from scratch in TypeScript, while reusing standard schema validation, transport, testing and telemetry libraries.

This two-part shape gives LUMEN a reusable library API and an independently deployable process without creating a second Hub. It does **not** mean two databases, two task ledgers, or a new GitHub repository.

## Research method and limits

This review compared current official documentation for Mastra, Temporal, Inngest, Graphile Worker, OpenTelemetry, and OWASP's LLM security guidance. The material is useful for learning established designs and failure modes; it is not a benchmark proving that one library is universally best. No performance measurements have been run for LUMEN, and no LUMEN source code exists in the inspected XV tree.

Sources were reviewed on 27 October 2026. Revalidate mutable docs and package versions when a task actually installs dependencies.

## Comparison: what to learn and what not to duplicate

| Reference | What it contributes | LUMEN decision |
|---|---|---|
| [Mastra framework](https://mastra.ai/docs/guides/overview) | TypeScript agent lifecycle, tools, workflow patterns, context/memory, human-in-the-loop and observability | Use as a capability checklist and behavior reference. Do not take Mastra as a runtime dependency; build LUMEN's core contracts and execution loop. |
| [Mastra human-in-the-loop](https://mastra.ai/docs/agents/human-in-the-loop) | An approval boundary must suspend a tool before its side effect; resumed state must be persisted | Adopt the safety principle. Approval must be bound to the exact run, tool version and validated arguments, and validated by the trusted governance service. |
| [Temporal TypeScript SDK](https://docs.temporal.io/develop/typescript) and [workflow task replay](https://docs.temporal.io/tasks) | Clear separation of workflow, activity and worker; event history, replay, cancellation, timeout and versioning patterns | Learn the durable-execution model. Do not claim Temporal-level replay semantics until LUMEN implements and verifies them. Do not introduce a separate Temporal service for the first release without an explicit later decision. |
| [Inngest durable execution](https://www.inngest.com/docs/durable-execution) and [best practices](https://www.inngest.com/docs/durable-execution/best-practices) | Persisted step results, stable step IDs, step boundaries, idempotency, retry classification, timeout and cancellation practices | Adopt explicit versioned steps and persisted results. Treat side effects as at-least-once unless the target system provides a proven stronger contract. Do not promise exactly-once external effects. Do not add Inngest as a dependency in v1. |
| [Graphile Worker](https://github.com/graphile/worker) | Mature PostgreSQL-backed job queue patterns and separate worker processes | Do not add a parallel queue/schema by default: XV's ownership contract does not authorize LUMEN to become another SQL owner. Reconsider only if an explicit ADR gives a queue adapter a compatible, reviewed ownership boundary. |
| [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/) and [semantic conventions](https://opentelemetry.io/docs/specs/semconv/) | Trace correlation and standard telemetry naming; support for Node.js LTS | Use standard traces and metrics from the first useful execution path. Keep prompts, user content, secrets and tool payloads out of telemetry by default. |
| [OWASP LLM01 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) and [LLM06 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) | Model outputs and external content can manipulate tool choices; excess capability/permission/autonomy creates risk | Enforce authorization outside prompts: allowlisted tools, schemas, server-side policy, least privilege, resource budgets, and human approval for consequential operations. |

## Findings that materially change the design

### 1. A framework package and a runnable worker are different products

The package should contain contracts and orchestration logic with injected ports. It should not start an HTTP server, connect to PostgreSQL, read application secrets, or import ARSY internals merely by being imported.

The app should host the execution loop as a long-running worker process, with its own lifecycle, configuration, health/readiness evidence and deployable artifact. It exposes **no public task-management API**. If diagnostics require an HTTP listener, the port must be internal-only and accepted during implementation; do not reserve a public port now.

Both remain in the same monorepo until a future extraction decision. A standalone process does not require a separate repository.

### 2. Build an agent runtime, not a replacement for every workflow platform

A general-purpose durable workflow engine is a substantial distributed-systems product. Its hard parts include recovery after a crash between a side effect and result persistence, workflow version changes, cancellation races, stale workers, replay determinism, payload growth, and operational visibility.

The first LUMEN release should implement **a bounded, explicit step runner**:
- Single agent per run and sequential steps first.
- Stable, versioned workflow and step identifiers.
- Persist each completed model/tool result before advancing.
- On recovery, reuse a persisted completed result; do not repeat a successful model call just because a worker restarted.
- Re-execute only according to a reviewed retry policy.
- Use a lease with expiry and a monotonically increasing fencing/version token. Stale workers must be unable to commit a result after losing their lease.
- Pause and release the worker when waiting for a human or external input; resume via a new authorized claim, not by retaining an unbounded process in memory.

Do not implement arbitrary TypeScript workflow replay that assumes arbitrary code is deterministic. Do not claim durable replay until restart, deployment compatibility and failure-injection tests prove it.

### 3. Exactly-once external side effects are not a v1 promise

A process may successfully send an external request and crash before it records the response. A retry may therefore call the external system again. LUMEN should document at-least-once execution and require:
- Stable idempotency keys derived from the business operation/run/step, not the retry attempt.
- Idempotent adapters where supported and deduplication at the receiving owner.
- Persisted step outcomes and bounded retry policies.
- Explicit compensation for reversible operations when truly available.
- A blocked/unknown result when the runtime cannot determine whether a side effect happened.

No framework can guarantee that an arbitrary external side effect happened exactly once merely because it stored a checkpoint.

### 4. ARSY must remain the authority for run state and permissions

LUMEN must not create its own canonical task table, identity system, public API, model catalog or approval database. The runtime should use a narrow, authenticated adapter to ARSY for claim/lease, canonical status transitions, event append, checkpoint references, cancellation and approval state. The exact endpoints and schemas do not exist as an accepted LUMEN contract yet; implementation must inspect and complete M29/M28 gates rather than inventing routes.

The worker receives trusted authorization context from ARSY. User IDs, roles, tenant IDs and permissions supplied inside model-generated arguments are untrusted. Each state-changing request must be authorized by the owner service.

### 5. Security policy must be executable code, not prompt text

The model proposes actions; LUMEN validates proposals; trusted owners authorize actions; tool implementations perform only their bounded operation.

Every tool definition should declare at least:
- Stable ID and version.
- Input and output schemas.
- Permission/capability requirement.
- Side-effect classification: read-only, reversible write or consequential/irreversible write.
- Timeout, retry classification and resource limits.
- Idempotency requirements.
- Whether explicit human approval is always or conditionally required.

Use an allowlist. Do not ship arbitrary shell execution, arbitrary Python, open-ended filesystem access or unrestricted URL fetching in v1. Treat retrieved text, documents, web pages and tool output as untrusted data. Redact credentials and sensitive content before traces/logs. A prompt injection must not grant new permission.

For approval, bind the decision to the exact run ID, tool ID/version, validated argument hash, expiry and trusted approver identity. Any changed arguments, expired approval or mismatched identity invalidates the approval. LUMEN cannot self-approve; Headquarters/100CENTER remains the human decision surface.

### 6. Context and memory must retain source distinctions

MoonWitness is source-first: source text, evidence, witness, interpretation, hypothesis and fiction are not interchangeable. LUMEN context should support typed segments with source references, edition/version where relevant, provenance, trust classification and permission scope. Generated text must not be silently upgraded to verified fact.

Do **not** build long-term memory, embeddings, vector storage, corpus ownership or a universal RAG engine into v1. Start with an injected context builder/interface and explicit conversation/context identifiers supplied by the owning application. Add storage and retrieval adapters only when a source/rights contract and a tested use case exist.

### 7. One agent first; multi-agent is a later feature

Start with one agent, sequential tool calls, bounded retries and a small workflow definition. Multi-agent delegation adds lease ownership, nested budgets, provenance propagation, cancellation fan-out, approval propagation and loop/recursion risks. It should begin only after a single run survives failure injection, an approval pause/resume cycle and recovery after process restart.

### 8. TypeScript is the correct first implementation language for XV

The existing repo uses TypeScript, pnpm, Node.js >=24 <25, Fastify and shared typed contracts. TypeScript minimizes cross-language adapters for LUMEN's first integration. A future Rust component should be justified by measured profiling or a concrete process-isolation/sandbox requirement, not by assumed performance gains. Do not create parallel TypeScript and Rust execution loops.

## Proposed MVP boundary

**In scope**
- Publicly exported typed definitions and dependency-injected ports.
- One-agent execution loop with hard iteration/time/token/cost limits.
- Tool registry, schema validation, policy checks and tool result normalization.
- Existing AI Gateway adapter, not a model-provider router.
- Explicit sequential workflow steps with stable IDs/versioning.
- ARSY lease/run/event/checkpoint client adapter after contracts are accepted.
- Pause/approval/resume through trusted governance state.
- Bounded retry, timeout, cancellation and idempotency semantics.
- Trace/metrics correlation, event redaction, error classification and test harness.
- Separately runnable internal worker app with a controlled shutdown/readiness contract.

**Explicitly out of scope**
- Second Hub, public task API, direct database access or a new SQL owner.
- Redis or a new queue service for day one.
- New model/provider routing layer or provider credentials distributed to tools.
- Arbitrary shell/OS execution, unrestricted code interpreter or broad network/file tools.
- Long-term semantic memory, embeddings, universal corpus ingestion and its own database.
- Multi-agent swarm, browser automation or automatic publishing/irreversible actions.
- Promise of exactly-once external side effects or Temporal-equivalent replay before evidence exists.
- Rust rewrite before profiling demonstrates a bottleneck or isolation requirement.
- A separate GitHub repository or a claim of deployment/production readiness.

## Required contracts before live integration

1. M29 lease/handoff contract has accepted schema, ownership, fencing-token and stale-worker behavior.
2. M28 ARSY compatibility/integration gates required by the chosen adapter have exact-SHA evidence.
3. Run status and step outcome are separated from event/trace records.
4. Checkpoint schema/versioning, event ordering, payload limits and retention are explicit.
5. Approval is authorized by the trusted owner and bound to exact tool arguments.
6. Retries classify transient/permanent failures, have bounded backoff and budget limits, and document uncertain side-effect outcomes.
7. Failure-injection tests cover killed workers, lease expiry, duplicate delivery, stale writers, timeout, cancellation and resume.
8. Telemetry can be enabled without capturing sensitive payloads by default.
9. The runtime has no public task-management API and no browser-accessible credentials.
10. The package and worker can build/test separately; deployment is not claimed until a real deploy/smoke/rollback is observed.

## Open decisions intentionally left for ADR/task review

- Exact ARSY endpoint/event/checkpoint schema: must be derived from the accepted M29/M28 contracts.
- Whether an internal health endpoint is needed and, if so, how it is bound and monitored.
- Storage/payload retention limits and when large artifacts use ECHOLOG references.
- Which tool categories are allowed in the first real use case; no tool is implicitly trusted.
- Future extraction into a separate repository or use of Rust: both require separate evidence and decisions.

## Reference links

- Mastra guides: https://mastra.ai/docs/guides/overview
- Mastra human-in-the-loop: https://mastra.ai/docs/agents/human-in-the-loop
- Mastra observability: https://mastra.ai/docs/observability/overview
- Temporal TypeScript SDK: https://docs.temporal.io/develop/typescript
- Temporal workflow replay: https://docs.temporal.io/tasks
- Inngest durable execution: https://www.inngest.com/docs/durable-execution
- Inngest durable execution best practices: https://www.inngest.com/docs/durable-execution/best-practices
- Graphile Worker: https://github.com/graphile/worker
- OpenTelemetry JavaScript: https://opentelemetry.io/docs/languages/js/
- OpenTelemetry semantic conventions: https://opentelemetry.io/docs/specs/semconv/
- OWASP LLM01:2025 Prompt Injection: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
- OWASP LLM06:2025 Excessive Agency: https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
