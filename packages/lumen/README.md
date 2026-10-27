# @moonwitness/lumen

> Private internal agent framework for MoonWitness XV.
> Bounded, deterministic, recoverable, forward-compatible with frontier models (AGI/ASI-ready).

## Overview

`@moonwitness/lumen` is a pure framework library located at `packages/lumen`. It provides the primitives, ports, and execution engine for single-agent deterministic task execution in the MoonWitness XV ecosystem.

### Architectural Invariants

As ratified in [ADR-0010](../../docs/decisions/ADR-0010-lumen-agent-runtime.md):
- **No SQL Tables / No Direct Database:** LUMEN owns zero database tables and imports neither `postgres` nor `drizzle-orm`. ARSY remains the sole canonical persistence owner for runs, tasks, and state.
- **No Direct Third-Party Provider SDKs:** Model inference is strictly routed through MoonWitness's central AI Gateway (`apps/aigateway`) conforming to the OpenAI-compatible `/v1/chat/completions` contract.
- **No Self-Approval:** Restricted or consequential actions require explicit human approval via Headquarters/100CENTER before execution.
- **Deny-by-Default:** Only allowlisted tools with validated schemas and matching trusted capability context can execute.

---

## Architecture: Ports & Adapters

LUMEN employs a clean hexagonal architecture where all external capabilities are dependency-injected via typed ports:

| Port | Purpose | Default / Provided Adapter |
|---|---|---|
| `ModelGatewayPort` | Agnostic frontier model inference | `AiGatewayAdapter` (connecting to `apps/aigateway`) |
| `ToolRegistryPort` | Allowlisted tool registration & policy evaluation | `ToolRegistry` (strictly checked against trusted context) |
| `RunControlPort` | Run claiming, monotonic lease fencing & lifecycle | `ArsyLeaseAdapter` (fenced leases, heartbeat, failover) |
| `CheckpointPort` | Durable snapshot save/load & restart recovery | `ArsyLeaseAdapter` (semver compatibility validation) |
| `ApprovalGatePort` | Human-in-the-loop review for restricted tools | `ApprovalGateAdapter` (SHA-256 argument binding) |
| `EventSinkPort` | Correlated distributed telemetry & event audit | `LumenTelemetrySink` (OpenTelemetry-compatible spans) |
| `BudgetPort` | Token & cost cap enforcement | `TokenBudgetManager` (strict budget limits) |
| `ClockPort` | Time tracking and deterministic testing | Default system clock or injected fake clock |

---

## Quickstart

```typescript
import {
  AiGatewayAdapter,
  ApprovalGateAdapter,
  ArsyLeaseAdapter,
  LumenTelemetrySink,
  TokenBudgetManager,
  ToolRegistry,
  executeAgentLoop,
} from '@moonwitness/lumen';

// 1. Setup Tool Registry with Capability Requirements
const toolRegistry = new ToolRegistry();
toolRegistry.registerTool({
  name: 'query_station_metric',
  version: '1.0.0',
  description: 'Query operational metric for a MoonWitness station',
  sideEffect: 'READ_ONLY',
  requiredCapabilities: ['station:read'],
  requiresApproval: false,
  parameters: {
    stationId: { type: 'string', required: true },
  },
  async execute(args) {
    return { stationId: args.stationId, active: true, dbLevel: -18 };
  },
});

// 2. Setup Adapters
const gateway = new AiGatewayAdapter({ baseUrl: 'http://127.0.0.1:3003' });
const arsy = new ArsyLeaseAdapter();
const telemetry = new LumenTelemetrySink();
const budget = new TokenBudgetManager({ maxTokens: 5000 });

// 3. Execute Bounded Agent Loop
const result = await executeAgentLoop({
  run: {
    runId: 'run-example-001',
    workflowVersion: '1.0.0',
    status: 'CLAIMED',
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  context: {
    tenantId: 'tenant_alpha',
    userId: 'user_operator',
    capabilities: ['station:read'],
    systemPrompt: 'You are an autonomous station monitoring agent.',
  },
  gateway,
  tools: toolRegistry,
  events: telemetry,
  budget,
  maxIterations: 5,
  timeoutMs: 30_000,
});

if (result.finalStatus === 'COMPLETED') {
  console.log('Result:', result.finalContent);
}
```

---

## Testing

```bash
pnpm --filter @moonwitness/lumen test
```
All unit tests run in isolation with zero timer leaks, network side-effects, or open ports.
