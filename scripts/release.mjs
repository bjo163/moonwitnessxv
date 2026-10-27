#!/usr/bin/env node
// SemVer bumper + changelog generator for the MoonWitness XV monorepo.
//
//   node scripts/release.mjs            bump root version + prepend CHANGELOG.md
//   node scripts/release.mjs --dry-run  preview only, nothing is written
//   node scripts/release.mjs --tag      also create the annotated tag locally
//   node scripts/release.mjs --ci       read-only: tag + publish a GitHub Release
//
// `--ci` never touches the working tree: CI has no commit step, so a file write
// there would produce a tag whose commit still carries the previous version.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const shouldTag = args.includes('--tag')
const isCi = args.includes('--ci')

function git(gitArgs, { optional = false } = {}) {
  try {
    return execFileSync('git', gitArgs, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', optional ? 'ignore' : 'inherit'],
    }).trim()
  } catch (err) {
    if (optional) return ''
    const detail = (err.stderr?.toString() || err.message).trim()
    console.error(`\x1b[31m✖ git ${gitArgs.join(' ')} failed\x1b[0m\n${detail}`)
    process.exit(1)
  }
}

function gitOk(gitArgs) {
  try {
    execFileSync('git', gitArgs, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const latestTag = git(['describe', '--tags', '--abbrev=0'], { optional: true })

const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'))
const currentVersion = rootPkg.version || '1.0.0'

// The published tags are the release numbering; the root manifest is reconciled
// against them by the next local `pnpm release` run.
const tagVersion = latestTag ? latestTag.replace(/^v/, '') : ''
const invalidTag = tagVersion !== '' && !/^\d+\.\d+\.\d+$/.test(tagVersion)
if (invalidTag) {
  console.error(`\x1b[31m✖ Latest tag ${latestTag} is not a plain vX.Y.Z release tag.\x1b[0m`)
  console.error('Pre-release suffixes are reviewed manually; refusing to bump from it.')
  process.exit(1)
}

console.log(`\n\x1b[36m🌙 MOONWITNESS XV — AUTOMATED RELEASE & VERSION BUMPER\x1b[0m`)
console.log(`  Mode            : \x1b[33m${isCi ? 'ci (read-only)' : isDryRun ? 'dry-run' : 'local'}\x1b[0m`)
console.log(`  package.json    : \x1b[33m${currentVersion}\x1b[0m`)
console.log(`  Latest Git tag  : \x1b[33m${latestTag || '(none)'}\x1b[0m`)

const headSha = git(['rev-parse', 'HEAD'])
const logRange = latestTag ? `${latestTag}..HEAD` : 'HEAD'
const gitLogOutput = git(['log', logRange, '--pretty=format:%H\x1f%s\x1f%an'], {
  optional: true
})

if (!gitLogOutput) {
  console.log('\n\x1b[32mNo new commits found since the last tag. Nothing to release.\x1b[0m\n')
  process.exit(0)
}

const rawCommits = gitLogOutput
  .split('\n')
  .map((line) => {
    const [hash, subject, author] = line.split('\x1f')
    return { hash: (hash || '').trim(), subject: (subject || '').trim(), author: (author || '').trim() }
  })
  .filter((c) => c.hash && c.subject)

console.log(`  Commits scanned : \x1b[32m${rawCommits.length}\x1b[0m`)

let bumpLevel = 'patch'
let hasBreaking = false
let hasFeat = false
let hasFix = false

const categorized = {
  features: [],
  fixes: [],
  perf: [],
  refactor: [],
  docs: [],
  maintenance: [],
}

const CONVENTIONAL_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\(([^)]+)\))?(!)?:\s*(.+)$/i

for (const commit of rawCommits) {
  const match = commit.subject.match(CONVENTIONAL_REGEX)
  const isBreaking =
    commit.subject.includes('BREAKING CHANGE') ||
    commit.subject.includes('!:') ||
    (match && match[3] === '!')

  if (isBreaking) hasBreaking = true

  if (!match) {
    categorized.maintenance.push({
      scope: '',
      desc: commit.subject,
      hash: commit.hash.slice(0, 7),
    })
    continue
  }

  const type = match[1].toLowerCase()
  const item = { scope: match[2] || '', desc: match[4].trim(), hash: commit.hash.slice(0, 7) }

  if (type === 'feat') {
    hasFeat = true
    categorized.features.push(item)
  } else if (type === 'fix') {
    hasFix = true
    categorized.fixes.push(item)
  } else if (type === 'perf') {
    categorized.perf.push(item)
  } else if (type === 'refactor') {
    categorized.refactor.push(item)
  } else if (type === 'docs') {
    categorized.docs.push(item)
  } else {
    categorized.maintenance.push(item)
  }
}

if (hasBreaking) {
  bumpLevel = 'major'
} else if (hasFeat) {
  bumpLevel = 'minor'
} else if (hasFix || categorized.perf.length > 0) {
  bumpLevel = 'patch'
} else {
  // Only docs/chore-style commits. Without any tag yet the repository stays at
  // its declared 1.0.0 baseline; afterwards every release-worthy push is a patch.
  bumpLevel = !latestTag && currentVersion === '1.0.0' ? 'initial' : 'patch'
}

function bumpSemVer(version, level) {
  if (level === 'initial') return version
  const [major, minor, patch] = version.split('.').map(Number)
  if (level === 'major') return `${major + 1}.0.0`
  if (level === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

const baseVersion = tagVersion || currentVersion
const nextVersion = bumpSemVer(baseVersion, bumpLevel)
const nextTag = `v${nextVersion}`

console.log(`  Bump level      : \x1b[35m${bumpLevel.toUpperCase()}\x1b[0m`)
console.log(`  Target version  : \x1b[32m${nextVersion}\x1b[0m (\x1b[33m${nextTag}\x1b[0m)\n`)

const today = new Date().toISOString().slice(0, 10)
let releaseNotes = `## [${nextVersion}] - ${today}\n\n`

function appendSection(title, list) {
  if (list.length === 0) return ''
  let sec = `### ${title}\n`
  for (const item of list) {
    const scopePrefix = item.scope ? `**${item.scope}:** ` : ''
    sec += `- ${scopePrefix}${item.desc} (${item.hash})\n`
  }
  return `${sec}\n`
}

releaseNotes += appendSection('Features', categorized.features)
releaseNotes += appendSection('Bug Fixes', categorized.fixes)
releaseNotes += appendSection('Performance Improvements', categorized.perf)
releaseNotes += appendSection('Refactoring & Architecture', categorized.refactor)
releaseNotes += appendSection('Documentation', categorized.docs)
releaseNotes += appendSection('Maintenance & CI', categorized.maintenance)

const plainNotes = [
  `Release ${nextTag} from ${headSha.slice(0, 10)}.`,
  '',
  ...[
    ['Features', categorized.features],
    ['Bug Fixes', categorized.fixes],
    ['Performance Improvements', categorized.perf],
    ['Refactoring & Architecture', categorized.refactor],
    ['Documentation', categorized.docs],
    ['Maintenance & CI', categorized.maintenance],
  ].flatMap(([title, list]) =>
    list.length === 0
      ? []
      : [`### ${title}`, ...list.map((i) => `- ${i.scope ? `**${i.scope}:** ` : ''}${i.desc} (${i.hash})`), '']
  ),
  'Generated from commit history by `scripts/release.mjs --ci`.',
].join('\n')

if (isDryRun) {
  console.log('--- PREVIEW RELEASE NOTES ---')
  console.log(releaseNotes.trim())
  console.log('-----------------------------\n')
  console.log('\x1b[33m[DRY RUN]\x1b[0m No files were modified and no Git tags were created.\n')
  process.exit(0)
}

if (isCi) {
  console.log(
    '\x1b[33m[CI]\x1b[0m Read-only mode: CHANGELOG.md and package.json are never written from a workflow.\n'
  )

  if (!latestTag) {
    console.log(
      'No baseline tag exists, so the commit range for a release is undefined.\n' +
        'Create the first tag once by hand (`git tag -a v1.0.0 <sha> && git push origin v1.0.0`); ' +
        'automatic releases start from the tag after that.\n'
    )
    process.exit(0)
  }

  const tagsAtHead = git(['tag', '--points-at', 'HEAD'], { optional: true })
  if (tagsAtHead) {
    console.log(`HEAD already carries ${tagsAtHead.split('\n').join(', ')}; nothing to publish.\n`)
    process.exit(0)
  }

  if (gitOk(['rev-parse', '--verify', '--quiet', `refs/tags/${nextTag}`])) {
    console.error(`\x1b[31m✖ Tag ${nextTag} already exists but HEAD is not its commit.\x1b[0m`)
    console.error('Published tags are never moved; bump manually or fix the history reference.')
    process.exit(1)
  }

  if (rootPkg.version !== nextVersion) {
    console.log(
      `  \x1b[33mNote\x1b[0m: package.json still reads ${rootPkg.version}; the root manifest is ` +
        'reconciled by the next local `pnpm release` run.\n'
    )
  }

  git(['tag', '-a', nextTag, '-m', `Release ${nextTag}`])
  console.log(`✔ Created Git Tag \x1b[32m${nextTag}\x1b[0m at ${headSha.slice(0, 10)}`)

  git(['push', 'origin', `refs/tags/${nextTag}`])
  console.log(`✔ Pushed \x1b[32m${nextTag}\x1b[0m to origin`)

  const workDir = mkdtempSync(join(tmpdir(), 'moonwitness-release-'))
  const notesPath = join(workDir, 'NOTES.md')
  try {
    writeFileSync(notesPath, `${plainNotes}\n`, 'utf8')
    execFileSync('gh', ['release', 'create', nextTag, '--target', headSha, '--title', nextTag, '--notes-file', notesPath], {
      stdio: 'inherit',
    })
    console.log(`✔ Published GitHub Release \x1b[32m${nextTag}\x1b[0m`)
  } catch (err) {
    console.error(`\x1b[31m✖ GitHub Release could not be published: ${err.message}\x1b[0m`)
    console.error(`The tag ${nextTag} was already pushed; delete it before retrying this step.`)
    process.exit(1)
  } finally {
    rmSync(workDir, { recursive: true, force: true })
  }

  console.log(`\n\x1b[32m✨ Release ${nextTag} published.\x1b[0m\n`)
  process.exit(0)
}

// Local release: the reviewed CHANGELOG entries stay authoritative, the release
// section is inserted below `## [Unreleased]`.
const changelogPath = 'CHANGELOG.md'
let currentChangelog = ''
try {
  currentChangelog = readFileSync(changelogPath, 'utf8')
} catch {
  currentChangelog = '# Changelog\n\n## [Unreleased]\n\n'
}

const unreleasedMarker = '## [Unreleased]\n'
let updatedChangelog = ''
if (currentChangelog.includes(unreleasedMarker)) {
  const parts = currentChangelog.split(unreleasedMarker)
  updatedChangelog = `${parts[0]}${unreleasedMarker}\n${releaseNotes}${parts[1].trimStart()}`
} else {
  updatedChangelog = `# Changelog\n\n## [Unreleased]\n\n${releaseNotes}${currentChangelog}`
}

writeFileSync(changelogPath, updatedChangelog, 'utf8')
console.log(`✔ Updated \x1b[32m${changelogPath}\x1b[0m with release [${nextVersion}]`)

rootPkg.version = nextVersion
writeFileSync('package.json', `${JSON.stringify(rootPkg, null, 2)}\n`, 'utf8')
console.log(`✔ Updated \x1b[32mpackage.json\x1b[0m version to ${nextVersion}`)

if (shouldTag) {
  if (gitOk(['rev-parse', '--verify', '--quiet', `refs/tags/${nextTag}`])) {
    console.error(`\x1b[31m✖ Tag ${nextTag} already exists; not moving a published tag.\x1b[0m`)
    process.exit(1)
  }
  git(['tag', '-a', nextTag, '-m', `Release ${nextTag}`])
  console.log(`✔ Created Git Tag \x1b[32m${nextTag}\x1b[0m locally (not pushed)`)
}

console.log('\n\x1b[32m✨ Release preparation completed. Commit the version and changelog changes on dev.\x1b[0m\n')
