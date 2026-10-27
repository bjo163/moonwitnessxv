/**
 * apps/orbit/src/components/spatial/WebGLDetector.ts
 *
 * Deterministic client capability check for WebGL/WebGL2 support.
 * Returns false safely in SSR, server components, or when GPU context fails.
 */

export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')

    const hasContext = Boolean(gl)
    if (gl && 'getExtension' in gl) {
      // Loose context check
      return hasContext
    }
    return hasContext
  } catch {
    return false
  }
}
