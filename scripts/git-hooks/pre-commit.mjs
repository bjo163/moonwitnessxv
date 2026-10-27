#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { exit } from 'node:process'

try {
  const stagedFilesRaw = execSync('git diff --cached --name-only', { encoding: 'utf8' })
  const stagedFiles = stagedFilesRaw.split('\n').map((f) => f.trim()).filter(Boolean)

  if (stagedFiles.length === 0) {
    exit(0)
  }

  // 1. Guard against committing secret files
  const FORBIDDEN_FILE_PATTERNS = [
    /^\.env(\..+)?$/i,
    /\.pem$/i,
    /\.key$/i,
    /id_rsa/i,
    /secrets?\.(json|ya?ml|ts)$/i,
  ]

  // `.env.example` is a committed template, not a credential file; .gitignore
  // deliberately un-ignores it.
  const ALLOWED_EXCEPTIONS = [/^\.env\.(example|template|sample)$/i]

  for (const file of stagedFiles) {
    if (ALLOWED_EXCEPTIONS.some((pattern) => pattern.test(file))) {
      continue
    }
    for (const pattern of FORBIDDEN_FILE_PATTERNS) {
      if (pattern.test(file)) {
        console.error(`\n\x1b[31m[GIT GATE: PRE-COMMIT BLOCKED]\x1b[0m`)
        console.error(`Attempting to commit a forbidden secret or environment file: "${file}"`)
        console.error('Never commit raw secret files or environment configurations to Git.\n')
        exit(1)
      }
    }
  }

  // 2. Run high-speed UI token consistency check (< 1 second)
  console.log('\x1b[36m[GIT GATE: PRE-COMMIT]\x1b[0m Validating MoonUI token purity...')
  const repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim()
  execSync(`node "${join(repoRoot, 'scripts', 'check-ui-consistency.mjs')}"`, { stdio: 'inherit' })

  exit(0)
} catch {
  console.error('\n\x1b[31m[GIT GATE: PRE-COMMIT FAILED]\x1b[0m Pre-commit quality checks failed.')
  exit(1)
}
