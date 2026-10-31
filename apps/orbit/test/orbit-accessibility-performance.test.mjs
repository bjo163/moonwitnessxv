import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isWebGLAvailable } from '../src/components/spatial/WebGLDetector.ts'
import { SIMULATED_OPERATIONS } from '../src/fixtures/simulated-operations.ts'

const testDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(testDir, '..')

test('M40-04: isWebGLAvailable fails safe to false in server/test environments without throwing', () => {
  // In Node.js environment, window/document are undefined
  const available = isWebGLAvailable()
  assert.equal(available, false, 'isWebGLAvailable must return false safely in non-browser environment')
})

test('M40-04: OrbitWebGLFallback component exists and enforces accessible 2D layout', () => {
  // ADR-0017: the 2D fallback is MoonUI's `WebGLFallbackView`.
  const fallbackPath = resolve(appRoot, '../../packages/moonui/src/surfaces/orbit.tsx')
  assert.ok(existsSync(fallbackPath), 'the 2D fallback view must live in MoonUI')

  const content = readFileSync(fallbackPath, 'utf8')
  assert.ok(content.includes('webglFallbackActive'), 'Must render fallback title badge')
  assert.ok(content.includes('keyboardNavigationGuide'), 'Must render keyboard navigation guide')
  assert.ok(content.includes('provenanceSimulated'), 'Must explicitly render simulated provenance')
  assert.ok(content.includes('role="region"'), 'Must define accessible ARIA region')
})

test('M40-04: View mode switcher supports both 3D spatial and 2D accessible modes', () => {
  const viewportPath = resolve(appRoot, 'src/components/OrbitSpatialViewport.tsx')
  const workspacePath = resolve(appRoot, 'src/components/OrbitOperationsWorkspace.tsx')

  const vpContent = readFileSync(viewportPath, 'utf8')
  const wsContent = readFileSync(workspacePath, 'utf8')

  assert.ok(vpContent.includes("viewMode === 'accessible'"), 'Viewport must branch on accessible view mode')
  assert.ok(vpContent.includes('WebGLFallbackView'), 'Viewport must render fallback when in 2D mode')
  assert.ok(vpContent.includes('onViewModeChange'), 'Viewport must render the accessible view mode switcher')
  assert.ok(wsContent.includes('setViewMode'), 'Workspace must manage viewMode state')
})

test('M40-04: Zero reliance on sound or audio triggers across ORBIT', () => {
  const srcDir = resolve(appRoot, 'src')
  const forbiddenAudioTerms = ['AudioContext', 'new Audio(', '<audio', 'webkitAudioContext', '.play()']

  const checkFiles = [
    resolve(srcDir, 'app/page.tsx'),
    resolve(srcDir, 'components/OrbitSpatialViewport.tsx'),
    resolve(srcDir, 'components/OrbitNodeInspector.tsx'),
    resolve(srcDir, 'components/OrbitOperationsWorkspace.tsx'),
    resolve(srcDir, 'components/OrbitWebGLFallback.tsx'),
    resolve(srcDir, 'components/spatial/OrbitScene.tsx'),
  ]

  for (const file of checkFiles) {
    if (!existsSync(file)) continue
    const content = readFileSync(file, 'utf8')
    for (const term of forbiddenAudioTerms) {
      assert.equal(
        content.includes(term),
        false,
        `${file} must not contain audio element or sound trigger "${term}"`
      )
    }
  }
})

test('M40-04: Zero reliance on color alone: all status states convey explicit textual labels', () => {
  for (const ws of SIMULATED_OPERATIONS.workstations) {
    assert.ok(
      ['STANDALONE', 'OFFLINE', 'DEGRADED', 'MAINTENANCE'].includes(ws.status),
      `Workstation ${ws.id} must have explicit string status text`
    )
  }

  for (const agent of SIMULATED_OPERATIONS.agents) {
    assert.ok(
      ['IDLE', 'EXECUTING', 'WAITING_APPROVAL', 'PAUSED', 'FAILED'].includes(agent.state),
      `Agent ${agent.id} must have explicit string state text`
    )
  }

  const inspectorPath = resolve(appRoot, 'src/components/OrbitNodeInspector.tsx')
  const content = readFileSync(inspectorPath, 'utf8')
  assert.ok(content.includes('{agent.state}'), 'Inspector must render explicit textual state label')
  assert.ok(content.includes('{workstation.status}'), 'Inspector must render explicit textual status label')
})

test('M40-04: Full keyboard accessibility attributes in 2D list and inspector', () => {
  const workspacePath = resolve(appRoot, 'src/components/OrbitOperationsWorkspace.tsx')
  const inspectorPath = resolve(appRoot, 'src/components/OrbitNodeInspector.tsx')

  const wsContent = readFileSync(workspacePath, 'utf8')
  const inspContent = readFileSync(inspectorPath, 'utf8')

  // Check keyboard navigation in 2D list items
  assert.ok(wsContent.includes('tabIndex={0}'), 'Interactive list items must be keyboard-focusable')
  assert.ok(wsContent.includes('role="button"'), 'Interactive list items must declare button role')
  assert.ok(wsContent.includes('aria-pressed='), 'Interactive list items must report aria-pressed state')
  assert.ok(wsContent.includes("e.key === 'Enter' || e.key === ' '"), 'Items must support Enter/Space activation')

  // Check Escape handler in inspector
  assert.ok(inspContent.includes("e.key === 'Escape'"), 'Inspector must close on Escape keypress')
  assert.ok(inspContent.includes('aria-label={copy.closeInspector}'), 'Close button must have aria-label')
})

test('M40-04: Responsive CSS rules for mobile breakpoints (390px, 768px)', () => {
  const cssPath = resolve(appRoot, 'src/app/globals.css')
  const css = readFileSync(cssPath, 'utf8')

  assert.ok(
    css.includes('@media (max-width: 768px)'),
    'globals.css must include 768px tablet/mobile breakpoint'
  )
  assert.ok(
    css.includes('@media (max-width: 480px)'),
    'globals.css must include 480px narrow mobile breakpoint'
  )
  assert.ok(
    css.includes('grid-template-columns: 1fr'),
    'globals.css must reflow 2D grid to single column on mobile'
  )
})

test('M40-04: 3D performance and GPU memory disposal gates', () => {
  const scenePath = resolve(appRoot, 'src/components/spatial/OrbitScene.tsx')
  const badgePath = resolve(appRoot, 'src/components/spatial/HologramBadge.tsx')
  const linesPath = resolve(appRoot, 'src/components/spatial/ConnectionLines.tsx')
  const controlsPath = resolve(appRoot, 'src/components/spatial/BoundedOrbitControls.tsx')

  const scene = readFileSync(scenePath, 'utf8')
  const badge = readFileSync(badgePath, 'utf8')
  const lines = readFileSync(linesPath, 'utf8')
  const controls = readFileSync(controlsPath, 'utf8')

  // Performance budget limits
  assert.ok(scene.includes('dpr={[1, 2]}'), 'Canvas must clamp DPR to [1, 2] to prevent mobile GPU throttling')
  assert.ok(
    scene.includes("frameloop={prefersReducedMotion ? 'demand' : 'always'}"),
    'Scene must throttle frameloop to on-demand when reduced motion is preferred'
  )

  // Memory disposal hooks
  assert.ok(badge.includes('texture?.dispose()'), 'HologramBadge must dispose CanvasTexture on unmount')
  assert.ok(lines.includes('geometry.dispose()'), 'ConnectionLines must dispose BufferGeometry on unmount')
  assert.ok(controls.includes('controls.dispose()'), 'BoundedOrbitControls must dispose OrbitControls on unmount')
})
