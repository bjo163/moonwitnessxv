import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PORTS } from '@moonwitness/core'
import type { MoondeckConfig } from './types.js'

export const DEFAULT_CONFIG: MoondeckConfig = {
  title: 'Moondeck // Mission Cockpit',
  port: PORTS.cockpit,
  window: {
    width: 1400,
    height: 880,
  },
  services: [
    {
      tag: 'radio',
      name: 'Radio Core Hub',
      pkg: '@moonwitness/radio',
      port: PORTS.hub,
      color: '#00e5ff',
      icon: '📻',
      description: 'Fastify Hub, OpenAPI Swagger, SQLite/Postgres DB & Plugin Engine',
      url: `http://localhost:${PORTS.hub}`,
      healthEndpoint: `http://localhost:${PORTS.hub}/api/v1/health`,
    },
    {
      tag: 'dock',
      name: 'Public Radio Dock',
      pkg: '@moonwitness/dock',
      port: PORTS.dock,
      color: '#ff2a85',
      icon: '🚢',
      description: 'Next.js Station Player, Weekly Schedule & Live Intercept Radar Feed',
      url: `http://localhost:${PORTS.dock}`,
      healthEndpoint: `http://localhost:${PORTS.dock}`,
    },
    {
      tag: 'hq',
      name: 'Command Headquarters',
      pkg: '@moonwitness/headquarters',
      port: PORTS.headquarters,
      color: '#3b82f6',
      icon: '🏛️',
      description: 'Next.js Mission Control, Station Management & World Monitor 3-Tier Drilldown',
      url: `http://localhost:${PORTS.headquarters}`,
      healthEndpoint: `http://localhost:${PORTS.headquarters}`,
    },
    {
      tag: 'ai',
      name: 'AI Gateway Router',
      pkg: '@moonwitness/aigateway',
      port: PORTS.aigateway,
      color: '#f59e0b',
      icon: '🧠',
      description: 'Zero-failure cascading AI gateway (Gemini, Groq, OpenRouter, Ollama, Heuristic)',
      url: `http://localhost:${PORTS.aigateway}/v1/models`,
      healthEndpoint: `http://localhost:${PORTS.aigateway}/health`,
    },
    {
      tag: 'sentinel',
      name: 'Sentinel Worker',
      pkg: '@moonwitness/sentinel',
      type: 'worker',
      color: '#10b981',
      icon: '🛰️',
      description: 'Autonomous Poller Daemon (YouTube RSS, Playwright, OpenClaw, AI Agent Driver)',
      url: `http://localhost:${PORTS.headquarters}/world-monitor`,
    },
  ],
}

export function defineMoondeckConfig(config: MoondeckConfig): MoondeckConfig {
  return config
}

export async function loadMoondeckConfig(customPath?: string): Promise<MoondeckConfig> {
  const candidates = customPath
    ? [customPath]
    : [
        resolve(process.cwd(), 'moondeck.config.ts'),
        resolve(process.cwd(), 'moondeck.config.js'),
        resolve(process.cwd(), 'moondeck.config.mjs'),
        resolve(process.cwd(), 'apps/cockpit/src/moondeck.config.ts'),
        resolve(process.cwd(), 'apps/cockpit/dist/moondeck.config.js'),
      ]

  for (const file of candidates) {
    if (existsSync(file)) {
      try {
        const mod = (await import(pathToFileURL(file).href)) as { default?: MoondeckConfig; config?: MoondeckConfig }
        const loaded = mod.default ?? mod.config
        if (loaded && typeof loaded === 'object') {
          return {
            ...DEFAULT_CONFIG,
            ...loaded,
            services: Array.isArray(loaded.services) && loaded.services.length > 0 ? loaded.services : DEFAULT_CONFIG.services,
          }
        }
      } catch {
        // Fall back to default config if dynamic import fails
      }
    }
  }

  return DEFAULT_CONFIG
}
