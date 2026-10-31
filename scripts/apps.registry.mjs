/**
 * The runner-side inventory of every app that exists in this monorepo.
 *
 * Why this file exists: the dev runner, the port sweeper and the docs each used
 * to carry their own copy of "which apps run and on what port". A new app was
 * therefore added three or four times by hand, and it drifted: ORBIT ran on 3007
 * while `pnpm ports:free` still only knew 3000–3006, and the Cockpit never
 * learned that SKYLINK, ECHOLOG or ORBIT exist.
 *
 * Rules encoded here:
 *   - `dev: false`  → listed, printed, never spawned (a scaffold is not a server).
 *   - `supervised`  → the Cockpit may start/stop it; the Cockpit never supervises itself.
 *   - `port`        → must also exist in `PORTS` (packages/core/src/workspace.ts);
 *                     `apps/arsy/test/env-contract.test.ts` proves that.
 *
 * Plain ESM with no imports on purpose: `pnpm ports:free` has to work on a clean
 * checkout before `build:libs`, so this module must not depend on built output.
 */

export const APPS = [
  {
    tag: 'arsy',
    pkg: '@moonwitness/arsy',
    port: 3000,
    kind: 'service',
    dev: true,
    supervised: true,
    name: 'ARSY Hub · Radio/SIGNAL Core & ORM',
    desc: 'Core Fastify hub, ORM REST engine, SSE on-air stream, & OpenAPI docs',
    url: 'http://localhost:3000',
    health: '/api/v1/health',
    keys: ['0', 'r'],
    color: 'cyan',
  },
  {
    tag: 'dock',
    pkg: '@moonwitness/dock',
    port: 3001,
    kind: 'web',
    dev: true,
    supervised: true,
    name: 'Public Radio Dock',
    desc: 'Public radio station player, schedule grid, & World Monitor radar ticker',
    url: 'http://localhost:3001',
    health: '/',
    keys: ['1', 'd'],
    color: 'magenta',
  },
  {
    tag: 'hq',
    pkg: '@moonwitness/headquarters',
    port: 3002,
    kind: 'web',
    dev: true,
    supervised: true,
    name: 'Command Headquarters (HQ)',
    desc: 'Mission control admin, station CRUD, ops telemetry, & World Monitor 3-Tier',
    url: 'http://localhost:3002',
    health: '/',
    keys: ['2', 'h'],
    color: 'blue',
  },
  {
    tag: 'ai',
    pkg: '@moonwitness/aigateway',
    port: 3003,
    kind: 'service',
    dev: true,
    supervised: true,
    name: 'AI Gateway Router',
    desc: 'Free-first OpenAI chat completions (Gemini, Groq, OpenRouter, Ollama, Heuristic)',
    url: 'http://localhost:3003/v1/models',
    health: '/health',
    keys: ['5', 'a'],
    color: 'yellow',
  },
  {
    tag: 'cockpit',
    pkg: '@moonwitness/cockpit',
    // Local operator tooling, not a deployable product surface: it lives in tools/.
    root: 'tools',
    port: 3004,
    kind: 'web',
    dev: true,
    // The operator console must never supervise itself.
    supervised: false,
    name: 'Moondeck GUI Cockpit',
    desc: 'Technician console: logs, ports, media, ledger and Mission Progress',
    url: 'http://localhost:3004',
    health: '/',
    keys: ['6', 'g'],
    color: 'magenta',
  },
  {
    tag: 'skylink',
    pkg: '@moonwitness/skylink',
    port: 3005,
    kind: 'service',
    dev: true,
    supervised: true,
    env: { PORT: '3005' },
    name: 'SKYLINK Communication Service',
    desc: 'Bounded D18 control plane and provider adapters; operator UI still planned',
    url: 'http://localhost:3005/health',
    health: '/health',
    keys: ['7', 'k'],
    color: 'cyan',
  },
  {
    tag: 'echolog',
    pkg: '@moonwitness/echolog',
    port: 3006,
    kind: 'service',
    dev: true,
    supervised: true,
    env: { ECHOLOG_PORT: '3006' },
    // ECHOLOG reads its own port; inheriting the Radio PORT would bind the hub's.
    deleteEnv: ['PORT'],
    name: 'ECHOLOG Storage Service',
    desc: 'Bounded D19 content-addressed storage; filesystem driver plus S3 subset',
    url: 'http://localhost:3006/health',
    health: '/health',
    keys: ['8'],
    color: 'green',
  },
  {
    tag: 'orbit',
    pkg: '@moonwitness/orbit',
    kind: 'web',
    // Parked: the app and its tests stay in apps/orbit, but nothing spawns or
    // deploys it until M40 is scheduled again. Same treatment as lumen-runtime.
    dev: false,
    supervised: false,
    name: 'ORBIT · Spatial Agent Operations',
    desc: 'Spatial 3D/2D agent operations frontend (fixtures, ARSY read-only); parked',
    url: null,
    keys: [],
    color: 'cyan',
    note: 'parked (M40 unscheduled): run manually with `pnpm --filter @moonwitness/orbit dev`',
  },
  {
    tag: 'empire-web',
    pkg: '@moonwitness/empire-web',
    port: 3010,
    kind: 'web',
    dev: true,
    // Isolated static pilot; the Cockpit may start its local preview (ADR-0012).
    supervised: true,
    name: 'A-L-L-A-H.COM Empire Gateway Pilot',
    desc: 'Bilingual static gateway pilot; no backend or private data owner',
    url: 'http://localhost:3010',
    health: '/',
    keys: [],
    color: 'yellow',
  },
  {
    tag: 'sentinel',
    pkg: '@moonwitness/sentinel',
    kind: 'worker',
    dev: true,
    supervised: true,
    name: 'Sentinel Worker Agent',
    desc: 'Autonomous radar scraper & poller (YouTube RSS, Playwright, OpenClaw, AI Agent)',
    url: null,
    keys: [],
    color: 'green',
  },
  {
    tag: 'lumen-runtime',
    pkg: '@moonwitness/lumen-runtime',
    kind: 'worker',
    // Scaffold: has tests, has no `dev` script. Listed so its absence is stated.
    dev: false,
    supervised: false,
    name: 'LUMEN Agent Runtime',
    desc: 'Planned internal worker (M41); no dev server yet',
    url: null,
    keys: [],
    color: 'yellow',
    note: 'no dev script yet (M41 planned)',
  },
]

/** Apps the runner can actually spawn. */
export const RUNNABLE = APPS.filter((app) => app.dev)

/** Apps that own a TCP port (workers never do). */
export const PORTED = APPS.filter((app) => typeof app.port === 'number')

/** Tag aliases accepted on the command line. */
export const ALIASES = { radio: 'arsy' }

export function appByTag(tag) {
  const resolved = ALIASES[tag] ?? tag
  return APPS.find((app) => app.tag === resolved)
}

/** Deterministic display order: ported apps first, by port, then workers. */
export const ORDERED = [...PORTED].sort((a, b) => a.port - b.port).concat(
  APPS.filter((app) => typeof app.port !== 'number'),
)
