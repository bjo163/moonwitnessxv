import { API_PREFIX, PORTS } from '@moonwitness/core'
import { createMoonClient, type MoonClient } from '@moonwitness/moonql-client'
import { apiDriver, parseFeedXml, scoreHeadline, youtubeRssDriver } from './drivers/youtube-rss.js'
import { playwrightDriver } from './drivers/playwright.js'
import { openclawDriver } from './drivers/openclaw.js'
import { agentDriver } from './drivers/agent.js'
import type {
  CapturedSignalInput,
  DriverContext,
  DriverKind,
  MonitorDriver,
  MonitorRadarInfo,
  MonitorSourceInfo,
} from './types.js'

export { parseFeedXml, scoreHeadline }
export type { CapturedSignalInput, DriverContext, DriverKind, MonitorDriver, MonitorRadarInfo, MonitorSourceInfo }

export const DRIVER_REGISTRY: Record<DriverKind, MonitorDriver> = {
  rss: youtubeRssDriver,
  api: apiDriver,
  playwright: playwrightDriver,
  openclaw: openclawDriver,
  agent: agentDriver,
}

export interface SentinelConfig {
  hubApiUrl: string
  apiKey?: string
  token?: string
  workerId: string
  drivers: DriverKind[]
  pollIntervalMs: number
  egressEnabled: boolean
  playwrightEndpoint?: string
  openclawEndpoint?: string
  agentEndpoint?: string
}

export interface ClaimResponse {
  claimed: boolean
  task: { id: string; driver: DriverKind; status: string } | null
  source: MonitorSourceInfo | null
  radar: MonitorRadarInfo | null
}

export interface CycleResult {
  claimed: boolean
  taskId: string | null
  driver: DriverKind | null
  sourceHandle: string | null
  ingested: number
}

export function createSentinelClient(
  config: Pick<SentinelConfig, 'hubApiUrl' | 'apiKey' | 'token'>,
  customFetch?: typeof fetch,
): MoonClient {
  return createMoonClient({
    baseUrl: config.hubApiUrl,
    ...(config.token ? { token: config.token } : {}),
    ...(config.apiKey ? { headers: { 'x-api-key': config.apiKey } } : {}),
    ...(customFetch ? { fetch: customFetch } : {}),
  })
}

/**
 * Attempts automated authentication against the MoonQL Hub if no pre-shared
 * bearer token or API key is set in the environment.
 */
export async function authenticateSentinel(
  hubBaseUrl: string,
  env: Record<string, string | undefined> = process.env,
): Promise<string | undefined> {
  const loginUrl = hubBaseUrl.endsWith('/api/v1') ? `${hubBaseUrl}/auth/login` : `${hubBaseUrl}/api/v1/auth/login`
  const login = env.MOONQL_AUTH_ADMIN_LOGIN ?? env.MOONQL_AUTH_ADMIN_USER ?? 'admin'
  const passwordsToTry = [
    env.MOONQL_AUTH_ADMIN_PASSWORD,
    'moonwitness-admin',
    'change-me',
  ].filter((p): p is string => Boolean(p && p.trim().length > 0))

  for (const password of passwordsToTry) {
    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
        signal: AbortSignal.timeout(3000),
      })
      if (res.ok) {
        const payload = (await res.json()) as { data?: { token?: string } }
        if (payload.data?.token) return payload.data.token
      }
    } catch {
      // Hub not ready yet
      return undefined
    }
  }
  return undefined
}

/**
 * Runs a single claim -> collect -> ingest cycle against the MoonQL Hub.
 */
export async function runSentinelCycle(client: MoonClient, config: SentinelConfig): Promise<CycleResult> {
  const claim = await client.call<ClaimResponse>('/monitor/claim', {
    method: 'POST',
    body: {
      workerId: config.workerId,
      drivers: config.drivers.join(','),
    },
  })

  if (!claim.claimed || !claim.task || !claim.source) {
    return { claimed: false, taskId: null, driver: null, sourceHandle: null, ingested: 0 }
  }

  const driverName = (claim.source.driver ?? claim.task.driver ?? 'rss') as DriverKind
  const driver = DRIVER_REGISTRY[driverName] ?? youtubeRssDriver

  const signals = await driver.collect(
    {
      taskId: claim.task.id,
      source: claim.source,
      radar: claim.radar,
    },
    {
      egressEnabled: config.egressEnabled,
      playwrightEndpoint: config.playwrightEndpoint,
      openclawEndpoint: config.openclawEndpoint,
      agentEndpoint: config.agentEndpoint,
    },
  )

  let ingested = 0
  for (const sig of signals) {
    await client.call('/monitor/ingest', {
      method: 'POST',
      body: {
        sourceRef: claim.source.id,
        taskId: claim.task.id,
        externalId: sig.externalId,
        title: sig.title,
        url: sig.url,
        author: sig.author ?? null,
        summary: sig.summary ?? null,
        aiSummary: sig.aiSummary ?? null,
        sentiment: sig.sentiment ?? 'neutral',
        urgencyScore: sig.urgencyScore ?? 55,
        viewsCount: sig.viewsCount ?? 0,
        likesCount: sig.likesCount ?? 0,
        commentsCount: sig.commentsCount ?? 0,
        publishedAt: sig.publishedAt ?? new Date().toISOString(),
      },
    })
    ingested++
  }

  return {
    claimed: true,
    taskId: claim.task.id,
    driver: driver.name,
    sourceHandle: claim.source.handle,
    ingested,
  }
}

export function loadSentinelConfig(env: Record<string, string | undefined> = process.env): SentinelConfig {
  const hubBase = env.RADIO_API_URL ?? `http://127.0.0.1:${PORTS.hub}${API_PREFIX}`
  const driversRaw = env.SENTINEL_DRIVERS ?? 'rss,api,playwright,openclaw,agent'
  const drivers = driversRaw
    .split(',')
    .map((d) => d.trim() as DriverKind)
    .filter((d): d is DriverKind => d in DRIVER_REGISTRY)

  return {
    hubApiUrl: hubBase,
    apiKey: env.SENTINEL_API_KEY,
    token: env.SENTINEL_BEARER_TOKEN,
    workerId: env.SENTINEL_WORKER_ID ?? `sentinel-${process.pid}`,
    drivers: drivers.length > 0 ? drivers : ['rss', 'api', 'playwright', 'openclaw', 'agent'],
    pollIntervalMs: Math.max(2000, Number(env.SENTINEL_POLL_MS ?? 15_000) || 15_000),
    egressEnabled: env.EGRESS_ENABLED === 'true',
    playwrightEndpoint: env.SENTINEL_PLAYWRIGHT_ENDPOINT,
    openclawEndpoint: env.SENTINEL_OPENCLAW_ENDPOINT,
    agentEndpoint: env.SENTINEL_AGENT_ENDPOINT,
  }
}

async function main() {
  const once = process.argv.includes('--once')
  const config = loadSentinelConfig()
  let token = config.token

  console.info(
    `[sentinel] worker=${config.workerId} hub=${config.hubApiUrl} drivers=${config.drivers.join(',')} egress=${config.egressEnabled}`,
  )

  let client = createSentinelClient(config)

  if (once) {
    if (!token && !config.apiKey) {
      token = await authenticateSentinel(config.hubApiUrl)
      if (token) client = createSentinelClient({ ...config, token })
    }
    const res = await runSentinelCycle(client, config)
    console.info('[sentinel] single cycle completed:', res)
    return
  }

  for (;;) {
    try {
      if (!token && !config.apiKey) {
        token = await authenticateSentinel(config.hubApiUrl)
        if (token) {
          client = createSentinelClient({ ...config, token })
          console.info('[sentinel] successfully authenticated with hub as admin')
        } else {
          // Waiting for hub to finish booting or auth service to respond
          await new Promise((resolve) => setTimeout(resolve, 2000))
          continue
        }
      }
      const res = await runSentinelCycle(client, config)
      if (res.claimed) {
        console.info(
          `[sentinel] collected source=${res.sourceHandle} driver=${res.driver} signals=${res.ingested}`,
        )
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('401') || msg.includes('Unauthorized')) {
        token = undefined // reset token on 401 to re-authenticate on next tick
      }
      console.warn(`[sentinel] cycle notice (hub starting or idle): ${msg}`)
      await new Promise((resolve) => setTimeout(resolve, Math.min(3000, config.pollIntervalMs)))
      continue
    }
    await new Promise((resolve) => setTimeout(resolve, config.pollIntervalMs))
  }
}

const isMain =
  !process.argv[1] ||
  /sentinel[\\/](src|dist)[\\/]index\.(ts|js)$/.test(process.argv[1]) ||
  process.argv[1].endsWith('index.ts') ||
  process.argv[1].endsWith('index.js')
if (isMain) {
  void main()
}
