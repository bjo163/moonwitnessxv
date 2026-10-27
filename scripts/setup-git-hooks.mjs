#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { exit } from 'node:process'

function git(gitArgs) {
  try {
    return execFileSync('git', gitArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') {
  console.log('[hooks] not a Git work tree; core.hooksPath left unchanged')
  exit(0)
}

if (!existsSync('.githooks') || !statSync('.githooks').isDirectory()) {
  console.log('[hooks] .githooks/ missing; core.hooksPath left unchanged')
  exit(0)
}

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'inherit' })
  console.log('[hooks] core.hooksPath = .githooks')
} catch {
  console.log('[hooks] could not set core.hooksPath; local gates are inactive')
}
