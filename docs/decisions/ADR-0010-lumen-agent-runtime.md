# ADR-0010 — LUMEN Agent Framework and Worker Boundary

- **Status:** PROPOSED — pending explicit owner ratification.
- **Date:** 2026-10-27.
- **Scope:** Proposed framework package and internal worker runtime inside MoonWitness XV.
- **Research:** [LUMEN deep research](../research/LUMEN-framework-deep-research.md).
- **Architecture draft:** [LUMEN contract](../architecture/LUMEN.md).
- **Task plan:** [M41](../milestones/M41.md).

## 1. Context

MoonWitness XV needs a framework-owned execution layer if it is to support inspectable agents and workflows rather than embedding agent logic into ORBIT, Headquarters, the model gateway or ARSY routes. The current AI execution/planning milestone M29 is still planning work and its lease/handoff tasks are not evidence of a shipped runtime. No LUMEN package or runtime app exists at the baseline SHA.

The architectural challenge is to create a framework that can be tested and used independently without duplicating the XV Hub, identity, model routing, canonical task status or data ownership. Reliability and security are more important than maximizing the number of agent features in the first release.

## 2. Proposed decision

Subject to owner ratification:

1. Name the framework **LUMEN**, package **@moonwitness/lumen**, at **packages/lumen**.
2. Add a separately runnable internal worker application **apps/lumen-runtime**, package **@moonwitness/lumen-runtime**. Both remain in the current monorepo initially.
3. Build the framework's agent loop, tool contracts/registry/policy hooks, bounded step runner, lifecycle and developer-facing API in TypeScript from scratch.
4. Keep ARSY as the single API/identity/authorization and canonical run/task-state owner. The runtime only claims and executes authorized work through accepted ARSY/M29 contracts; LUMEN creates no database tables or direct PostgreSQL connection.
5. Keep AI Gateway as the single model/provider routing authority. LUMEN must not bypass it or own provider credentials/catalog.
6. Keep Headquarters/100CENTER as the human decision and audit surface; keep ORBIT as presentation/inspection only.
7. Start with one agent per run, sequential versioned steps, bounded tools/retries/time/budget, explicit checkpoint and resume semantics, and human approval before consequential side effects.
8. Use standard schema-validation, testing and telemetry tooling. Do not introduce a new database, Redis, a general-purpose external workflow service, arbitrary shell execution, long-term memory/vector storage or a Rust rewrite in v1.
9. Document at-least-once execution and idempotency boundaries. Never promise exactly-once side effects against arbitrary external systems.
10. Treat the worker as a separately buildable/deployable process, not a second Hub or public task-management API. A separate GitHub repository requires a future extraction ADR.

## 3. Alternatives considered

| Alternative | Assessment |
|---|---|
| Put execution logic in ORBIT | Rejected: a frontend must not become the execution authority or expose privileged tool paths. |
| Add agent loops directly to ARSY routes | Rejected for the runtime execution loop: it couples long-running work to the Hub process and route lifecycle. ARSY still owns request, authorization, canonical run state and control contracts. |
| Only create a framework library | Viable for a first pure package prototype, but insufficient for the requested separately runnable process and worker lifecycle; create the app as a later gated milestone task, not as an API/Hub. |
| Create an entirely new backend/Hub and database | Rejected: duplicates identity, API, schema authority, operations and deployment semantics. |
| Adopt Mastra as a dependency | Rejected for the framework core because the stated goal is a MoonWitness-owned framework from scratch. Use public documentation as a reference checklist instead. |
| Use Temporal/Inngest as the workflow runtime now | Deferred: strong reference implementations for durable execution, but adding one now expands infrastructure and shifts ownership away from the intended framework. Reconsider if M41 complexity or reliability evidence shows the bounded design is insufficient. |
| Use Graphile Worker/another PostgreSQL queue by default | Deferred: do not introduce queue-owned tables or a parallel persistence contract without an accepted ownership decision. |
| Implement all workflow replay and multi-agent delegation immediately | Rejected: excessive scope before the single-run failure/recovery/approval contract is proven. |
| Start in Rust | Rejected for the initial XV integration: current packages and runtime are TypeScript; Rust should be justified by profiling or concrete isolation requirements. |

## 4. Consequences

### Positive
- Reusable framework API is separable from its worker process.
- ARSY remains the single authority for identity, authorization and run state.
- AI provider routing, human approval, source provenance and UI responsibilities remain in their accepted boundaries.
- A focused MVP can be proved with a single agent and testable state transitions.

### Costs and risks
- A dependable step runner still requires explicit work for fencing, checkpointing, versioning, idempotency, cancellation and crash recovery.
- The real worker cannot be integrated until the applicable M28/M29 contracts and gates are verified.
- The proposal deliberately excludes multi-agent swarm, general memory and arbitrary-code tools from the first release.
- A separately deployed worker adds operational cost, telemetry, configuration and rollback duties that must be evidenced rather than presumed.

## 5. Security and reliability requirements

- Authorization occurs in code and the owner service, not only in model prompts.
- Tool registry is allowlisted with validated schemas, least privilege, resource limits and side-effect classification.
- Human approval binds to the exact run, tool/version and validated argument hash; stale or changed requests fail closed.
- Worker leases are fenced; a stale worker cannot write canonical results.
- Side-effect retries use idempotency where supported; uncertain outcomes remain explicit.
- Sensitive prompt/tool payloads are excluded from default traces/logs.
- No arbitrary shell/network/file tool is enabled in the first release.
- Workflow versions and checkpoint compatibility are explicit; no implicit replay after incompatible code changes.

## 6. Ratification and implementation conditions

This ADR remains **PROPOSED** until explicitly accepted by the owner. M41-01 records ratification. Before live runtime integration, complete the relevant M29 lease/handoff contracts and M28 ARSY compatibility gates. The M41 tasks must use isolated test adapters before those gates are met and must not claim production behavior early.

This proposal does not create LUMEN code, a new service, a database migration or deployment. The sole task register remains [TODO.md](../../TODO.md).
