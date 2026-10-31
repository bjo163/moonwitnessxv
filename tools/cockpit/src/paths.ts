import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Walk up from this module until the workspace manifest is found. The public
 * asset directory cannot be used for this: when the Vite bundle wins the
 * lookup, `resolve(publicDir, '../../..')` lands on `apps/`, not the repo root.
 */
export function findRepoRoot(): string {
  let curr = dirname(fileURLToPath(import.meta.url))
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(curr, 'pnpm-workspace.yaml'))) return curr
    curr = dirname(curr)
  }
  return process.cwd()
}

/** Absolute path of the sole task/status register. */
export function resolveRegisterPath(root: string = findRepoRoot()): string {
  return join(root, 'TODO.md')
}
