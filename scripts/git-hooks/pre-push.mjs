#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { exit } from 'node:process'

const ALLOWED_BRANCHES = ['dev', 'main']

function block(lines) {
  console.error('\n\x1b[31m[GIT GATE: PRE-PUSH BLOCKED]\x1b[0m')
  for (const line of lines) console.error(line)
  console.error('')
  exit(1)
}

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function gitOk(args) {
  try {
    execFileSync('git', args, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const currentBranch = git(['rev-parse', '--abbrev-ref', 'HEAD'])

if (currentBranch && !ALLOWED_BRANCHES.includes(currentBranch)) {
  block([
    `Branch discipline violation: current branch is "${currentBranch}".`,
    'Repository policy permits only "dev" and "main".',
    'Switch to "dev", cherry-pick your changes, and delete this branch.'
  ])
}

// git feeds "<local-ref> <local-oid> <remote-ref> <remote-oid>" per pushed ref.
const refLines = readFileSync(0, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

for (const refLine of refLines) {
  const fields = refLine.split(/\s+/)
  if (fields.length < 4) continue
  const [localRef, localOid, remoteRef, remoteOid] = fields

  if (remoteRef.startsWith('refs/tags/')) continue

  const remoteBranch = remoteRef.replace('refs/heads/', '')
  if (!ALLOWED_BRANCHES.includes(remoteBranch)) {
    block([
      `Push target "${remoteRef}" is outside the dev/main integration path.`,
      'Repository policy permits only "dev" and "main".'
    ])
  }

  const isDelete = /^0+$/.test(localOid)
  const isNewBranch = /^0+$/.test(remoteOid)
  if (isDelete || isNewBranch) continue

  if (localRef !== remoteRef) {
    block([
      `Pushing "${localRef}" onto "${remoteRef}" would rewrite "${remoteBranch}".`,
      'Push the branch under its own name.'
    ])
  }

  // A missing object (shallow clone) cannot be judged; GitHub still rejects the
  // non-fast-forward push, so only a proven rewrite is blocked here.
  if (!gitOk(['cat-file', '-e', `${remoteOid}^{commit}`])) continue
  if (!gitOk(['cat-file', '-e', `${localOid}^{commit}`])) continue

  try {
    execFileSync('git', ['merge-base', '--is-ancestor', remoteOid, localOid], {
      stdio: 'ignore'
    })
  } catch {
    block([
      `Force push detected on "${remoteBranch}": ${remoteOid.slice(0, 10)} is not an ancestor of ${localOid.slice(0, 10)}.`,
      'Rebase or merge so the push fast-forwards, or reset the branch to origin.',
      'Published history is never rewritten.'
    ])
  }
}

exit(0)
