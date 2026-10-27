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
      pkg: '@moonwitness/arsy',
      port: PORTS.hub,
      // ARSY resolves its port through these aliases; pin the canonical one so
      // the probed port is exactly the port the hub binds.
      envPortKeys: ['ARSY_PORT', 'RADIO_PORT'],
      portPinKey: 'ARSY_PORT',
      color: '#00e5ff',
      icon: 'RD',
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
      icon: 'DK',
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
      icon: 'HQ',
      description: 'Next.js Mission Control, Station Management & World Monitor 3-Tier Drilldown',
      url: `http://localhost:${PORTS.headquarters}`,
      healthEndpoint: `http://localhost:${PORTS.headquarters}`,
    },
    {
      tag: 'ai',
      name: 'AI Gateway Router',
      pkg: '@moonwitness/aigateway',
      port: PORTS.aigateway,
      envPortKeys: ['AI_GATEWAY_PORT'],
      portPinKey: 'AI_GATEWAY_PORT',
      color: '#f59e0b',
      icon: 'AI',
      description: 'Zero-failure cascading AI gateway (Gemini, Groq, OpenRouter, Ollama, Heuristic)',
      url: `http://localhost:${PORTS.aigateway}/v1/models`,
      healthEndpoint: `http://localhost:${PORTS.aigateway}/health`,
    },
    {
      tag: 'skylink',
      name: 'SKYLINK Communication',
      pkg: '@moonwitness/skylink',
      port: PORTS.skylink,
      // SKYLINK reads the generic PORT, which `.env` pins to the hub's 3000 for
      // ARSY only. Injecting the cockpit-resolved PORT per child keeps its bind
      // port on 3005 and makes the probe honest for this service.
      portPinKey: 'PORT',
      color: '#00e5ff',
      icon: 'SL',
      description: 'Bounded D18 control plane and provider adapters; operator UI still planned',
      url: `http://localhost:${PORTS.skylink}/health`,
      healthEndpoint: `http://localhost:${PORTS.skylink}/health`,
    },
    {
      tag: 'echolog',
      name: 'ECHOLOG Storage',
      pkg: '@moonwitness/echolog',
      port: PORTS.echolog,
      envPortKeys: ['ECHOLOG_PORT'],
      portPinKey: 'ECHOLOG_PORT',
      color: '#10b981',
      icon: 'EL',
      description: 'Bounded D19 content-addressed storage; filesystem driver plus S3-compatible subset',
      url: `http://localhost:${PORTS.echolog}/health`,
      healthEndpoint: `http://localhost:${PORTS.echolog}/health`,
    },
    {
      tag: 'orbit',
      name: 'ORBIT Spatial Ops',
      pkg: '@moonwitness/orbit',
      port: PORTS.orbit,
      color: '#a855f7',
      icon: 'OR',
      description: 'Spatial 3D/2D operations frontend on simulated fixtures (M40)',
      url: `http://localhost:${PORTS.orbit}`,
      healthEndpoint: `http://localhost:${PORTS.orbit}`,
    },
    {
      tag: 'sentinel',
      name: 'Sentinel Worker',
      pkg: '@moonwitness/sentinel',
      type: 'worker',
      color: '#10b981',
      icon: 'SN',
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
