#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { exit } from 'node:process'

const commitMsgFile = process.argv[2]
if (!commitMsgFile) {
  exit(0)
}

const msg = readFileSync(commitMsgFile, 'utf8').trim()

// Ignore automatic merge, revert, or release commits
if (
  msg.startsWith('Merge ') ||
  msg.startsWith('Revert ') ||
  /^v[0-9]+\.[0-9]+\.[0-9]+/.test(msg) ||
  msg.startsWith('Release v')
) {
  exit(0)
}

// Conventional Commits pattern:
// type(scope)!: subject
const CONVENTIONAL_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-zA-Z0-9_\-\.\/]+\))?(!)?: .+/

const firstLine = msg.split('\n')[0].trim()

if (!CONVENTIONAL_REGEX.test(firstLine)) {
  console.error('\n\x1b[31m[GIT GATE: COMMIT-MSG REJECTED]\x1b[0m')
  console.error(`Invalid commit message: "${firstLine}"\n`)
  console.error('All commits in MoonWitness XV must follow the Conventional Commits format:')
  console.error('  <type>(<optional-scope>): <subject>\n')
  console.error('Allowed types:')
  console.error('  feat     - New user or system feature (bumps MINOR)')
  console.error('  fix      - Bug fix or correction (bumps PATCH)')
  console.error('  perf     - Performance optimization (bumps PATCH)')
  console.error('  docs     - Documentation changes')
  console.error('  refactor - Code changes that neither fix a bug nor add a feature')
  console.error('  style    - Formatting, punctuation, whitespace')
  console.error('  test     - Adding or correcting tests')
  console.error('  build    - Build system or external dependencies')
  console.error('  ci       - CI configuration files and scripts')
  console.error('  chore    - Maintenance tasks or general updates')
  console.error('  revert   - Explicitly authorized reversal of a previous commit')
  console.error('\nBreaking change indicator:')
  console.error('  feat!: breaking change (bumps MAJOR)')
  console.error('\nExamples:')
  console.error('  feat(moonui): add interactive audio spectrum canvas')
  console.error('  fix(dock): restore roving tab keyboard focus')
  console.error('  docs(m01): document release lifecycle contract\n')
  exit(1)
}

exit(0)
