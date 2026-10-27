/**
 * apps/orbit/src/fixtures/simulated-operations.ts
 *
 * Deterministic offline fixtures for ORBIT local development.
 *
 * INVARIANT: Every record is explicitly marked `provenance: 'SIMULATED'`.
 * Local development MUST operate with ARSY completely offline,
 * and UI components MUST explicitly render simulated indicators.
 *
 * Grounded in the typed projection contract from M40-05.
 */

import { projectOperationalState } from '../lib/projections/operational-projection.ts'
import type {
  WorkstationProjection,
  AgentProjection,
  TaskProjection,
  TraceProjection,
  OrbitStateProjection,
} from '../lib/projections/types.ts'

export type WorkstationNode = WorkstationProjection
export type AgentNode = AgentProjection
export type OperationTask = TaskProjection
export type OperationsTrace = TraceProjection
export type OrbitOperationalState = OrbitStateProjection

export const RAW_SIMULATED_FEED = {
  connectionStatus: 'SIMULATED_LOCAL',
  dataSource: 'Local Deterministic Simulation Engine (ARSY offline)',
  lastSyncTimestamp: '2026-10-27T12:00:00.000Z',
  workstations: [
    {
      id: 'ws-alpha-01',
      name: 'Station Alpha · Core Orchestration Node',
      zone: 'alpha',
      status: 'STANDALONE',
      provenance: 'SIMULATED',
      agentIds: ['agent-lumen-01'],
      position: [0, 0, 0],
      lastHeartbeat: '2026-10-27T12:00:00.000Z',
    },
    {
      id: 'ws-beta-01',
      name: 'Station Beta · Sentinel Surveillance Array',
      zone: 'beta',
      status: 'STANDALONE',
      provenance: 'SIMULATED',
      agentIds: ['agent-sentinel-01'],
      position: [-4, 0, -2],
      lastHeartbeat: '2026-10-27T11:59:45.000Z',
    },
    {
      id: 'ws-gamma-01',
      name: 'Station Gamma · Echolog Object Vault',
      zone: 'gamma',
      status: 'STANDALONE',
      provenance: 'SIMULATED',
      agentIds: ['agent-echolog-01'],
      position: [4, 0, -2],
      lastHeartbeat: '2026-10-27T11:59:30.000Z',
    },
  ],
  agents: [
    {
      id: 'agent-lumen-01',
      name: 'Lumen-Runtime Worker Alpha',
      role: 'Sequential Autonomous Task Executor',
      workstationId: 'ws-alpha-01',
      state: 'WAITING_APPROVAL',
      provenance: 'SIMULATED',
      currentTaskId: 'task-sec-401',
      executionCycle: 14,
      leaseStatus: 'ACQUIRED',
      stepCount: 8,
      checkpointVersion: '1.0.0',
    },
    {
      id: 'agent-sentinel-01',
      name: 'Sentinel Autonomous Radar Crawler',
      role: 'World Monitor Stream Ingestor',
      workstationId: 'ws-beta-01',
      state: 'EXECUTING',
      provenance: 'SIMULATED',
      currentTaskId: 'task-rad-102',
      executionCycle: 342,
      leaseStatus: 'ACQUIRED',
      stepCount: 42,
      checkpointVersion: '1.0.0',
    },
    {
      id: 'agent-echolog-01',
      name: 'Echolog Object Buffer Daemon',
      role: 'Attachment Verifier & Content Hash Validator',
      workstationId: 'ws-gamma-01',
      state: 'IDLE',
      provenance: 'SIMULATED',
      currentTaskId: null,
      executionCycle: 88,
      leaseStatus: 'NONE',
      stepCount: 0,
      checkpointVersion: '1.0.0',
    },
  ],
  taskQueue: [
    {
      id: 'task-sec-401',
      title: 'Execute privileged credential rotation for agent bridge',
      priority: 'CRITICAL',
      status: 'APPROVAL_REQUIRED',
      provenance: 'SIMULATED',
      assignedAgentId: 'agent-lumen-01',
      createdAt: '2026-10-27T11:58:00.000Z',
      approvalPayload: {
        action: 'credential.rotate',
        requestedRole: 'SECURITY_AUDITOR',
        reason: 'Periodic rotation of internal worker token across isolated IPC boundary',
      },
    },
    {
      id: 'task-rad-102',
      title: 'Poll radar transmission stream from ARSY live feed',
      priority: 'NORMAL',
      status: 'RUNNING',
      provenance: 'SIMULATED',
      assignedAgentId: 'agent-sentinel-01',
      createdAt: '2026-10-27T11:55:00.000Z',
    },
    {
      id: 'task-echo-088',
      title: 'Verify content hashes for pending audio attachments',
      priority: 'LOW',
      status: 'QUEUED',
      provenance: 'SIMULATED',
      assignedAgentId: null,
      createdAt: '2026-10-27T11:50:00.000Z',
    },
  ],
  recentTraces: [
    {
      id: 'tr-001',
      timestamp: '2026-10-27T11:59:58.000Z',
      level: 'INFO',
      source: 'lumen-runtime',
      message: 'Step 8 execution completed; boundary check paused awaiting human approval.',
      provenance: 'SIMULATED',
    },
    {
      id: 'tr-002',
      timestamp: '2026-10-27T11:59:45.000Z',
      level: 'INFO',
      source: 'sentinel',
      message: 'Radar stream polled 4 items; SHA-256 deduplication verified.',
      provenance: 'SIMULATED',
    },
    {
      id: 'tr-003',
      timestamp: '2026-10-27T11:59:30.000Z',
      level: 'WARN',
      source: 'orbit-client',
      message: 'ARSY primary WebSocket offline; rendered fallback with SIMULATED fixture state.',
      provenance: 'SIMULATED',
    },
  ],
}

/**
 * Normalized operational state projected through the pure projection engine.
 */
export const SIMULATED_OPERATIONS: OrbitOperationalState = projectOperationalState(
  RAW_SIMULATED_FEED,
  { defaultProvenance: 'SIMULATED' }
)
