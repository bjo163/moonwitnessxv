# LUMEN — Agent Framework and Runtime Boundary

**Status:** ACCEPTED architecture under ADR-0010 (ratified 27 October 2026); implementation remains planned under M41.  
**Implementation:** not present. Proposed delivery plan: [M41](../milestones/M41.md); [canonical task status](../../TODO.md).  
**Research basis:** [LUMEN deep research](../research/LUMEN-framework-deep-research.md).

## Purpose

LUMEN is proposed as a MoonWitness-owned TypeScript agent framework whose core orchestration code is written from scratch, paired with an independently runnable internal worker application. It is intended to make agent runs inspectable, bounded, recoverable and governed—not to claim that an AI model is an authority over source truth or human decisions.

**Proposed identifiers**
- Framework package: `packages/lumen`, package `@moonwitness/lumen`.
- Runtime application: `apps/lumen-runtime`, package `@moonwitness/lumen-runtime`.
- Language/toolchain: repository TypeScript conventions, Node.js `>=24 <25`, pnpm workspace.
- Repository boundary: the current MoonWitness XV monorepo. No new GitHub repository is proposed in M41.

“Standalone” means the internal worker can be built and deployed as a separate process. It does not mean a second public Hub, database, identity provider or canonical task ledger. The prior Master Vision tension regarding extending ARSY was explicitly resolved in M41-01 / ADR-0010 on 27 October 2026: a worker-only process is authorized under the strict condition that it owns no API/data authority, creates no database tables, and operates solely through canonical ARSY/M29 task contracts.

## Ownership boundaries

| Concern | Owner |
|---|---|
| User/API identity, permissions and canonical run/task state | Existing D00/ARSY contracts |
| Model/provider selection, credentials and provider adapters | Existing AI Gateway |
| Agent loop, tool-call validation, bounded step execution and lifecycle coordination | Proposed `@moonwitness/lumen` |
| Process lifecycle, worker polling/claim, startup/readiness and shutdown | Proposed `apps/lumen-runtime` |
| Human decisions, approval identity, review and audit | Headquarters / 100CENTER through trusted ARSY/governance contracts |
| Agent/workstation/task visualization | ORBIT frontend; never an execution authority |
| Persistence implementation and canonical schema | Existing approved data owner through ARSY/MoonQL; no direct LUMEN DB ownership |
| Shared UI, authentication session and locale conventions | Existing MoonUI and D00/ARSY contract |

LUMEN may request work only from an authorized run contract. It must not accept public browser task-management requests, expose ARSY service credentials, start another Hub, route directly to model providers, self-approve, publish automatically, or invent live agent state.

## Component shape

### Framework package

The package exports typed definitions and dependency-injected interfaces. It must be possible to import, build and test the package without starting an HTTP server, connecting to a database, loading secrets or depending on private ARSY/Headquarters internals.

Target modules (not a command to create every folder up front):
- agent definition/version and bounded execution loop;
- tool definition, registry, schema validation and policy hooks;
- explicit workflow/step definition and state transition rules;
- run context, deadline, cancellation and budget;
- checkpoint/result interfaces;
- approval request/result contracts;
- execution event types, error taxonomy and redaction hooks;
- adapters exposed through narrow public exports.

Avoid fragmenting the initial package into `lumen-core`, `lumen-types`, `lumen-worker` library packages before an actual second consumer justifies them.

### Runtime application

The runtime app depends on `@moonwitness/lumen` and approved adapters only. It runs the worker lifecycle in a separate process, claims authorized work through ARSY, reports state via the same contract, and shuts down safely on termination. It must not expose a public task CRUD API. The required health/readiness transport and bind address are an implementation decision; no public port is reserved here.

The runtime should be testable with fake ARSY/gateway adapters while the real M28/M29 integration gates are open. Simulated adapters must be identified as test fixtures and never reported as LIVE.

## Run lifecycle and recovery semantics

### State model

Proposed non-terminal states:
- `QUEUED`
- `LEASED`
- `RUNNING`
- `WAITING_APPROVAL`
- `WAITING_INPUT`
- `RETRY_WAIT`

Proposed terminal states:
- `SUCCEEDED`
- `FAILED`
- `CANCELLED`
- `TIMED_OUT`
- `BLOCKED`

The state owner must validate every transition. A worker's local status or trace is not canonical. The final state vocabulary and mapping must reconcile with ARSY/M29 contracts before implementation; do not silently force unknown or future states into success.

### Lease and fencing

A claim must return a run ID, lease ID/epoch or fencing token, expiry, authorized context, and the contract/version needed by the worker. The worker heartbeats while active. Once the lease expires or a newer lease wins, stale workers must not append canonical results or change run state. Use optimistic version checks or equivalent fencing in the owner service.

Waiting for approval/input releases worker capacity. Resume creates or reclaims an authorized runnable state; it must not depend on a process's in-memory callback remaining alive.

### Steps, checkpoints and retries

Every workflow step has a stable ID and an explicit workflow-definition version. Persist a successful step's result/checkpoint before advancing. On recovery, use saved outcomes for completed steps; do not repeat successful model calls solely because the worker restarted.

Retries are bounded and classify transient versus permanent failures. Use deadlines, bounded exponential backoff with jitter, attempt caps and run/tool budgets. Every side-effecting operation uses a stable idempotency key where supported. State clearly that delivery/execution may be at-least-once and arbitrary external effects are not guaranteed exactly once.

Before implementation, define how incompatible workflow versions are handled for in-flight runs. No implicit schema replay or silent rerun of old steps.

## Agent, model and tool contracts

- One agent per run and sequential steps for the first release.
- A hard iteration cap, overall deadline, per-tool timeout, bounded concurrency, and model/token/cost budgets when the gateway supplies trustworthy usage data.
- The only model access is through an adapter to the existing AI Gateway; no provider secrets or new routing table within LUMEN.
- Tool calls are model proposals, not permissions.
- Tool definitions declare stable ID/version, input/output schema, permission requirements, side-effect class, timeout, retry behavior, idempotency requirements and approval policy.
- Registry is allowlisted; unknown tools and malformed arguments fail closed.
- No unrestricted shell, filesystem, browser or arbitrary network execution in v1.
- Tool output and retrieved content are untrusted input. A prompt or external document cannot grant permission or change a tool's policy.

## Human approval

Consequential/restricted tool calls must suspend **before** their side effect. Approval must be verified by the trusted owner and bound to the run ID, tool ID/version, validated argument hash, scope, expiry and authorized approver. Any changed arguments or stale/mismatched approval invalidates the decision.

Headquarters/100CENTER remains the approval UI and decision owner. LUMEN cannot approve itself, infer approval from a natural-language response, bypass an expired decision or publish automatically.

## Context, provenance and memory

LUMEN does not own the Corpus, source registry, user profile, conversation database, ontology or memory database. Applications pass an authorized context through a typed interface. Context segments should retain source reference, edition/version where applicable, trust classification, authorization scope and provenance.

Keep source statements, evidence, witness testimony, interpretation, hypothesis and fiction distinct. Do not upgrade model-generated content to verified truth. Long-term memory, embeddings, vector storage and general-purpose RAG are outside v1 until a source/rights-aware use case and data-owner contract are accepted.

## Observability and privacy

Use OpenTelemetry traces and metrics for run, step, gateway call, tool call, lease recovery and approval correlation. The default telemetry policy must not capture raw prompts, full model outputs, private witness content, tool payloads, credentials or direct identifiers. Any content capture is opt-in, redacted, access-controlled and retention-limited.

Trace/event IDs and timestamps must permit causal inspection; they do not replace canonical status, audited decisions or checkpoint persistence. Report usage only from trustworthy gateway/runtime data, never invented counters.

## Dependencies and boundaries

- TypeScript, current pnpm workspace and existing Node range.
- Existing AI Gateway adapter.
- Existing ARSY typed contract/client when M28/M29 prerequisites are verified.
- Existing storage authority through ARSY; no direct PostgreSQL connection and no LUMEN-owned tables.
- Standard schema validation and test libraries under current repo conventions.
- OpenTelemetry instrumentation; use standard conventions where applicable.
- Future MCP, extra tool providers, long-term memory, multi-agent delegation, sandbox executors and Rust components require their own scoped review when needed.

## Explicit non-goals

- A second Hub or public business API.
- Independent identity, database, SQL ownership, model catalog or approval system.
- Redis, a new job queue service or a second persistence system for day one.
- Full general-purpose workflow replay engine in the first release.
- Multi-agent swarm, autonomous publication or irreversible tools.
- Exactly-once external side effects.
- Rust rewrite without profiling or a concrete isolation need.
- A separate GitHub repository or a claim of deployment/production readiness.

## Release gates

M41 cannot declare a release until:
1. ADR-0010 is ratified (accepted 27 October 2026) and M29 contracts are verified.
2. Required ARSY compatibility gates for real claim/status/checkpoint integration have exact-SHA evidence.
3. The package builds and runs isolated contract/unit tests; runtime has separate checks and safe shutdown.
4. Positive and negative tests cover invalid transitions, denied tools, stale leases, duplicate delivery, timeouts, cancellation, retry classification, approval expiry and restart recovery.
5. Side effects use idempotency contracts or clearly surface uncertain outcomes; no exactly-once promise.
6. Tracing/redaction/budget limits are exercised without exposing sensitive data.
7. The runtime has no public task API or direct database ownership; ORBIT remains presentation-only.
8. Real deployment, smoke and rollback are evidenced separately from unit tests.

See the [M41 plan](../milestones/M41.md) and individual task packets. A planned contract is not evidence that a worker or feature exists.
