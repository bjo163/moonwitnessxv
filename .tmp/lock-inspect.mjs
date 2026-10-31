import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const split = (text) => text.replace(/\r\n/g, '\n').split('\n')
const now = split(readFileSync('pnpm-lock.yaml', 'utf8'))
const head = split(execFileSync('git', ['show', 'HEAD:pnpm-lock.yaml'], { encoding: 'utf8', maxBuffer: 64e6 }))

function block(lines, key) {
  const i = lines.indexOf(key)
  if (i < 0) return null
  let j = i + 1
  while (j < lines.length && !/^  \S/.test(lines[j])) j += 1
  return lines.slice(i, j)
}

const ispBlock = block(now, '  packages/moonql-isp:')
console.log('=== moonql-isp importer (worktree) ===')
console.log((ispBlock ?? ['ABSENT']).join('\n'))
console.log('=== head has key?', head.includes('  packages/moonql-isp:'))
const headIsp = block(head, '  packages/moonql-journey:')
console.log('=== neighbour moonql-journey (head) ===')
console.log((headIsp ?? ['ABSENT']).join('\n'))
