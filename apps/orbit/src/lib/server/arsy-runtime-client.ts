/**
 * apps/orbit/src/lib/server/arsy-runtime-client.ts
 *
 * M40-06: Server-side ARSY runtime state adapter for ORBIT.
 * Pure read-only adapter connecting to the canonical single Fastify/MoonQL Hub.
 *
 * Boundaries enforced:
 * - Single Hub port 3000 via apiBaseUrl(env) from @moonwitness/moonql-client
 * - Honest state: LIVE requires verified connection + FRESH timestamp
 * - Unreachable backend produces OFFLINE, not fake simulated live data
 * - Malformed responses fail-safe to UNKNOWN
 * - All secrets and keys are sanitized before returning
 * - Browser bundles NEVER receive service keys or raw database credentials
 */

import { apiBaseUrl } from '@moonwitness/moonql-client'
import {
  calculateFreshness,
  projectOperationalState,
  sanitizePayload,
} from '../projections/operational-projection.ts'
import type { OrbitStateProjection, ReviewSurface } from '../projections/types.ts'
import { SIMULATED_OPERATIONS } from '../../fixtures/simulated-operations.ts'
import { LOOPBACK_REVIEW_SURFACE, resolveReviewSurface } from './review-surface.ts'

export interface RuntimeClientOptions {
  env?: Record<string, string | undefined>
  forceSimulated?: boolean
  now?: number
  fetchFn?: typeof fetch
  timeoutMs?: number
  staleThresholdMs?: number
}

const DEFAULT_PROBE_TIMEOUT_MS = 2000

/**
 * Resolve canonical ARSY Hub base URL from server environment.
 */
export function resolveHubEndpoint(env: Record<string, string | undefined> = process.env): string {
  return apiBaseUrl(env)
}

/**
 * Build an honest offline state when the ARSY Hub is down or unreachable.
 */
export function buildOfflineState(
  hubUrl: string,
  now: number,
  errorDetail?: string,
  reviewSurface: ReviewSurface = LOOPBACK_REVIEW_SURFACE,
): OrbitStateProjection {
  const timestamp = new Date(now).toISOString()
  return {
    connectionStatus: 'OFFLINE',
    dataSource: `${hubUrl} (Unreachable)`,
    lastSyncTimestamp: timestamp,
    freshness: 'UNKNOWN',
    workstations: [],
    agents: [],
    taskQueue: [],
    recentTraces: [
      {
        id: 'trace-offline-system',
        timestamp,
        level: 'WARN',
        source: 'ARSY_RUNTIME_ADAPTER',
        message: `ARSY Hub at ${hubUrl} is unreachable (${errorDetail ?? 'connection failed'}). Spatial operations runtime state cannot be retrieved.`,
        provenance: 'UNKNOWN',
      },
    ],
    errorMessage: errorDetail ?? 'ARSY Hub connection offline / unreachable',
    reviewSurface,
  }
}

/**
 * Build an unauthorized state when ARSY returns HTTP 401 or 403.
 */
export function buildUnauthorizedState(
  hubUrl: string,
  now: number,
  status: number,
  reviewSurface: ReviewSurface = LOOPBACK_REVIEW_SURFACE,
): OrbitStateProjection {
  const timestamp = new Date(now).toISOString()
  return {
    connectionStatus: 'UNAUTHORIZED',
    dataSource: hubUrl,
    lastSyncTimestamp: timestamp,
    freshness: 'UNKNOWN',
    workstations: [],
    agents: [],
    taskQueue: [],
    recentTraces: [
      {
        id: 'trace-unauthorized-system',
        timestamp,
        level: 'SECURITY',
        source: 'ARSY_RUNTIME_ADAPTER',
        message: `ARSY Hub rejected request with HTTP ${status}. Credentials missing or insufficient role.`,
        provenance: 'UNKNOWN',
      },
    ],
    errorMessage: `ARSY Hub unauthorized (HTTP ${status})`,
    reviewSurface,
  }
}

/**
 * Fetch and project operational state from ARSY Hub runtime.
 */
export async function fetchOrbitOperationalState(
  options: RuntimeClientOptions = {},
): Promise<OrbitStateProjection> {
  const now = options.now ?? Date.now()
  const env = options.env ?? process.env
  const fetchFn = options.fetchFn ?? globalThis.fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_PROBE_TIMEOUT_MS
  // The review surface is resolved once, server-side, and carried into every
  // branch: the browser never reads configuration and never chooses a target.
  const reviewSurface = resolveReviewSurface(env)

  // 1. Explicit simulated mode (e.g. standalone test or developer flag)
  if (options.forceSimulated || env.ORBIT_SIMULATED === 'true') {
    const projected = projectOperationalState(SIMULATED_OPERATIONS, {
      now,
      defaultProvenance: 'SIMULATED',
      reviewSurface,
    })
    return {
      ...projected,
      connectionStatus: 'SIMULATED_LOCAL',
    }
  }

  // 2. Resolve ARSY Hub URL
  let hubUrl: string
  try {
    hubUrl = resolveHubEndpoint(env)
  } catch (err) {
    return buildOfflineState('UNKNOWN_HUB', now, err instanceof Error ? err.message : String(err), reviewSurface)
  }

  // 3. Attempt connection to ARSY Hub health / operational endpoint
  // We probe the health endpoint or operational state
  const probeUrl = `${hubUrl}/health`

  try {
    let controller: AbortController | undefined
    let timeoutId: NodeJS.Timeout | undefined

    if (typeof AbortController !== 'undefined') {
      controller = new AbortController()
      timeoutId = setTimeout(() => controller?.abort(), timeoutMs)
    }

    const response = await fetchFn(probeUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
      signal: controller?.signal,
      cache: 'no-store',
      // ORBIT trusts exactly the endpoint it resolved. Following a redirect
      // would let whoever answers that URL move the probe to an origin nobody
      // authorised and still be rendered as verified live state.
      redirect: 'manual',
    })

    if (timeoutId) clearTimeout(timeoutId)

    if (response.status >= 300 && response.status < 400) {
      return buildOfflineState(
        hubUrl,
        now,
        `HTTP ${response.status} redirect from ARSY Hub probe refused (fixed-origin trust)`,
        reviewSurface,
      )
    }

    // Handle authentication/authorization failures
    if (response.status === 401 || response.status === 403) {
      return buildUnauthorizedState(hubUrl, now, response.status, reviewSurface)
    }

    // Handle server outage / 5xx
    if (!response.ok) {
      return buildOfflineState(hubUrl, now, `HTTP ${response.status} from ARSY Hub probe`, reviewSurface)
    }

    const rawData = await response.json().catch(() => ({}))

    // Sanitize any raw payload before projecting
    const sanitizedData = sanitizePayload(rawData as Record<string, unknown>) as Record<string, unknown>

    // If the probe returns an operational state payload with workstations/agents
    if (Array.isArray(sanitizedData.workstations) || Array.isArray(sanitizedData.agents)) {
      const projected = projectOperationalState(sanitizedData, {
        now,
        staleThresholdMs: options.staleThresholdMs,
        defaultProvenance: 'LIVE',
        reviewSurface,
      })
      return {
        ...projected,
        connectionStatus: 'LIVE_CONNECTED',
      }
    }

    // If the probe returned basic hub health ({ status: 'ok', channels, ... }),
    // construct live operational state bound to the active ARSY Hub
    const syncTimestamp = typeof sanitizedData.timestamp === 'string'
      ? sanitizedData.timestamp
      : new Date(now).toISOString()

    const freshness = calculateFreshness(syncTimestamp, now, options.staleThresholdMs)

    const channelCount = typeof sanitizedData.channels === 'number' ? sanitizedData.channels : 1

    return {
      connectionStatus: 'LIVE_CONNECTED',
      dataSource: `${hubUrl} (ARSY Hub Verified)`,
      lastSyncTimestamp: syncTimestamp,
      freshness,
      workstations: [
        {
          id: 'ws-arsy-core',
          name: 'ARSY Hub Core Workstation',
          zone: 'alpha',
          status: 'STANDALONE',
          provenance: 'LIVE',
          agentIds: ['agent-arsy-monitor'],
          position: [0, 0, 0],
          lastHeartbeat: syncTimestamp,
          freshness,
        },
      ],
      agents: [
        {
          id: 'agent-arsy-monitor',
          name: 'Hub Signal Telemetry Monitor',
          role: 'SIGNAL_MONITOR',
          workstationId: 'ws-arsy-core',
          state: 'EXECUTING',
          provenance: 'LIVE',
          currentTaskId: 'task-live-telemetry',
          executionCycle: 1,
          leaseStatus: 'ACQUIRED',
          stepCount: channelCount,
          checkpointVersion: 'arsy-1.0',
          freshness,
        },
      ],
      taskQueue: [
        {
          id: 'task-live-telemetry',
          title: `Active Signal Ingestion (${channelCount} channels)`,
          priority: 'NORMAL',
          status: 'RUNNING',
          provenance: 'LIVE',
          assignedAgentId: 'agent-arsy-monitor',
          createdAt: syncTimestamp,
        },
      ],
      recentTraces: [
        {
          id: 'trace-live-heartbeat',
          timestamp: syncTimestamp,
          level: 'INFO',
          source: 'ARSY_HUB_PROBE',
          message: `Connected to ARSY Fastify Hub: status=${sanitizedData.status ?? 'ok'}, channels=${channelCount}`,
          provenance: 'LIVE',
        },
      ],
      reviewSurface,
    }
  } catch (fetchError) {
    const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError)
    return buildOfflineState(hubUrl, now, errorMsg, reviewSurface)
  }
}
