import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SIMULATED_OPERATIONS } from '../src/fixtures/simulated-operations.ts'
import { SPATIAL_TOKENS } from '../src/components/spatial/tokens.ts'

const testDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(testDir, '..')

/** Recursively collect all files under a directory */
function getAllFiles(dir, fileList = []) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) {
      getAllFiles(p, fileList)
    } else {
      fileList.push(p)
    }
  }
  return fileList
}

test('M40-03: Zero external 3D model files in apps/orbit (100% procedural Three.js)', () => {
  const allFiles = getAllFiles(appRoot)
  const forbiddenExts = ['.gltf', '.glb', '.obj', '.fbx', '.dae', '.3ds', '.stl']
  const foundModels = allFiles.filter((f) =>
    forbiddenExts.some((ext) => f.toLowerCase().endsWith(ext))
  )

  assert.equal(
    foundModels.length,
    0,
    `Found forbidden external 3D model assets: ${foundModels.join(', ')}`
  )
})

test('M40-03: Dynamic import boundary with ssr: false', () => {
  const viewportPath = resolve(appRoot, 'src/components/OrbitSpatialViewport.tsx')
  assert.ok(existsSync(viewportPath), 'OrbitSpatialViewport.tsx must exist')

  const content = readFileSync(viewportPath, 'utf8')
  assert.ok(content.includes('dynamic('), 'Must use Next.js dynamic import')
  assert.ok(content.includes('ssr: false'), 'Must enforce ssr: false to prevent WebGL SSR crashes')
  assert.ok(content.includes('spatialLoading'), 'Must display accessible loading fallback')
})

test('M40-03: Every simulated fixture and 3D badge carries SIMULATED provenance', () => {
  // Check fixture data
  for (const ws of SIMULATED_OPERATIONS.workstations) {
    assert.equal(ws.provenance, 'SIMULATED', `Workstation ${ws.id} must be SIMULATED`)
  }
  for (const agent of SIMULATED_OPERATIONS.agents) {
    assert.equal(agent.provenance, 'SIMULATED', `Agent ${agent.id} must be SIMULATED`)
  }
  for (const task of SIMULATED_OPERATIONS.taskQueue) {
    assert.equal(task.provenance, 'SIMULATED', `Task ${task.id} must be SIMULATED`)
  }

  // Check 3D mesh components
  const workstationMeshPath = resolve(appRoot, 'src/components/spatial/WorkstationMesh.tsx')
  const agentMeshPath = resolve(appRoot, 'src/components/spatial/AgentMesh.tsx')
  const hologramBadgePath = resolve(appRoot, 'src/components/spatial/HologramBadge.tsx')

  const wsMesh = readFileSync(workstationMeshPath, 'utf8')
  const agMesh = readFileSync(agentMeshPath, 'utf8')
  const badge = readFileSync(hologramBadgePath, 'utf8')

  assert.ok(wsMesh.includes('HologramBadge'), 'WorkstationMesh must render HologramBadge')
  assert.ok(agMesh.includes('HologramBadge'), 'AgentMesh must render HologramBadge')
  assert.ok(badge.includes('[SIMULATED]'), 'HologramBadge must render [SIMULATED] badge')
})

test('M40-03: Deterministic two-way selection contract and safe fallback', () => {
  const wsAlpha = SIMULATED_OPERATIONS.workstations.find((w) => w.id === 'ws-alpha-01')
  assert.ok(wsAlpha, 'ws-alpha-01 must exist')
  assert.equal(wsAlpha.zone, 'alpha')
  assert.equal(wsAlpha.status, 'STANDALONE')

  const agentLumen = SIMULATED_OPERATIONS.agents.find((a) => a.id === 'agent-lumen-01')
  assert.ok(agentLumen, 'agent-lumen-01 must exist')
  assert.equal(agentLumen.workstationId, 'ws-alpha-01')
  assert.equal(agentLumen.state, 'WAITING_APPROVAL')

  // Invalid ID resolution fails safely
  const invalidWs = SIMULATED_OPERATIONS.workstations.find((w) => w.id === 'ws-invalid-99')
  const invalidAg = SIMULATED_OPERATIONS.agents.find((a) => a.id === 'agent-invalid-99')
  assert.equal(invalidWs, undefined)
  assert.equal(invalidAg, undefined)
})

test('M40-03: Approval handoff contract for WAITING_APPROVAL agent', () => {
  const waitingAgent = SIMULATED_OPERATIONS.agents.find((a) => a.state === 'WAITING_APPROVAL')
  assert.ok(waitingAgent, 'At least one agent must be in WAITING_APPROVAL state')
  assert.ok(waitingAgent.currentTaskId, 'Waiting agent must have an assigned task ID')

  const task = SIMULATED_OPERATIONS.taskQueue.find((t) => t.id === waitingAgent.currentTaskId)
  assert.ok(task, 'Assigned task must exist in taskQueue')
  assert.ok(task.approvalPayload, 'Task must contain approvalPayload')
  assert.ok(task.approvalPayload.action, 'approvalPayload must include action')
  assert.ok(task.approvalPayload.requestedRole, 'approvalPayload must include requestedRole')

  // Inspector component renders approval notice and HQ link
  const inspectorPath = resolve(appRoot, 'src/components/OrbitNodeInspector.tsx')
  const inspectorContent = readFileSync(inspectorPath, 'utf8')
  assert.ok(
    inspectorContent.includes('approvalRequiredNotice'),
    'Inspector must render approval notice'
  )
  assert.ok(
    inspectorContent.includes('orbit-handoff-link'),
    'Inspector must render the HQ review handoff link'
  )
})

test('M40-03: Reduced motion compliance halts auto-rotation', () => {
  const controlsPath = resolve(appRoot, 'src/components/spatial/BoundedOrbitControls.tsx')
  const scenePath = resolve(appRoot, 'src/components/spatial/OrbitScene.tsx')
  const agentMeshPath = resolve(appRoot, 'src/components/spatial/AgentMesh.tsx')

  const controls = readFileSync(controlsPath, 'utf8')
  const scene = readFileSync(scenePath, 'utf8')
  const agent = readFileSync(agentMeshPath, 'utf8')

  assert.ok(
    scene.includes('prefers-reduced-motion'),
    'OrbitScene must listen for prefers-reduced-motion media query'
  )
  assert.ok(
    scene.includes('autoRotate={!prefersReducedMotion}'),
    'OrbitControls autoRotate must be disabled when reduced motion is preferred'
  )
  assert.ok(
    agent.includes('if (prefersReducedMotion)'),
    'AgentMesh must halt dynamic orbital math and freeze on static position when reduced motion is preferred'
  )
  assert.ok(
    controls.includes('maxPolarAngle'),
    'BoundedOrbitControls must clamp maxPolarAngle to prevent clipping under floor'
  )
})

test('M40-03: Design token purity in spatial scene', () => {
  // Validate that SPATIAL_TOKENS match standard MoonUI palette
  assert.equal(SPATIAL_TOKENS.cyan, '#00d4ff')
  assert.equal(SPATIAL_TOKENS.ok, '#00e676')
  assert.equal(SPATIAL_TOKENS.accent, '#ffd400')
  assert.equal(SPATIAL_TOKENS.pink, '#ff007a')
  assert.equal(SPATIAL_TOKENS.hot, '#ff1e56')
  assert.equal(SPATIAL_TOKENS.moon, '#7c3aed')
  assert.equal(SPATIAL_TOKENS.muted, '#8e879f')
  assert.equal(SPATIAL_TOKENS.border, '#252038')
  assert.equal(SPATIAL_TOKENS.surface, '#13101d')
  assert.equal(SPATIAL_TOKENS.surface2, '#1b172a')
  assert.equal(SPATIAL_TOKENS.ink, '#07060b')
  assert.equal(SPATIAL_TOKENS.fg, '#f7f4ec')
})
