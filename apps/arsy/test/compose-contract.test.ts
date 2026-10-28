import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Contracts the compose file has to keep, written down as assertions because every
 * one of them has already been broken once:
 *
 * - a service without a healthcheck is a service whose failure nobody notices;
 * - a service that talks to Postgres has to be given the database name it talks to
 *   (`$PGDATABASE` exists only in `backup`, which is how the runbook ended up
 *   querying the wrong database);
 * - a dump written straight to its final name looks fresh while it is half-written.
 *
 * The file is read as text on purpose: no YAML dependency, no claim to parse YAML —
 * only to hold a few lines to their word.
 */

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
// These guards anchor on line starts, and git may hand this checkout CRLF (it
// says so in its own warnings). Normalize at the read, or a contract either
// throws on a stray \r or quietly matches nothing.
const readRepoText = (rel: string): string => readFileSync(`${ROOT}/${rel}`, 'utf8').replace(/\r\n/g, '\n')
const compose = readRepoText('docker-compose.yml')
const runbook = readRepoText('docs/runbook-restore.md')
const backupDockerfile = readRepoText('Dockerfile.backup')
// The dump algorithm moved out of the compose `command:` block into a script, so
// the service the stack runs and the on-demand snapshot the recovery docs call
// share one copy of it. The invariants below now guard that file — read RAW,
// because line endings are the thing being asserted there, not an artefact.
const backupScript = readFileSync(`${ROOT}/scripts/db-backup.sh`, 'utf8')

/** service name -> its block, from `services:` to the next top-level key */
function services(): Map<string, string> {
  const lines = compose.split(/\r?\n/)
  const start = lines.findIndex((line) => /^services:\s*$/.test(line))
  assert.ok(start >= 0, 'docker-compose.yml has a services: block')

  const out = new Map<string, string>()
  let name: string | null = null
  let body: string[] = []
  for (const line of lines.slice(start + 1)) {
    const header = /^ {2}([a-z][a-z0-9_-]*):\s*$/.exec(line)
    if (header) {
      if (name) out.set(name, body.join('\n'))
      name = header[1]!
      body = []
      continue
    }
    if (/^\S/.test(line)) {
      // back at column 0: the next top-level key (volumes:, networks:)
      if (name) out.set(name, body.join('\n'))
      break
    }
    if (name) body.push(line)
  }
  return out
}

const blocks = services()

test('compose: every service declares a healthcheck', () => {
  assert.ok(blocks.size >= 5, `only found ${blocks.size} services`)
  const missing = [...blocks].filter(([, block]) => !/^\s{4}healthcheck:/m.test(block)).map(([name]) => name)
  assert.deepEqual(missing, [], `services without a healthcheck: ${missing.join(', ')}`)
})

test('compose: no MinIO service — ECHOLOG serves its own bounded S3 endpoint (ADR-0007 Amendment 1)', () => {
  assert.ok(!blocks.has('echolog-minio'), 'the retired MinIO service must not come back')
  assert.doesNotMatch(compose, /minio/i, 'docker-compose.yml still mentions MinIO')
})

test('compose: the database name each service dials is actually defined for it', () => {
  const db = blocks.get('db')
  assert.ok(db, 'db service exists')
  // the container that hosts the database is bootstrapped by POSTGRES_DB
  assert.match(db, /POSTGRES_DB:/, 'db is given the database name it creates')
  assert.match(db, /pg_isready[^\n]*POSTGRES_DB/, 'and its healthcheck probes that database, not the default one')

  const backup = blocks.get('backup')
  assert.ok(backup, 'backup service exists')
  // pg_dump/pg_restore read PG*, so the sidecar must be given PGDATABASE
  assert.match(backup, /PGDATABASE:\s*\$\{POSTGRES_DB/, 'backup maps POSTGRES_DB to PGDATABASE')

  const arsy = blocks.get('arsy')
  assert.ok(arsy, 'canonical arsy service exists')
  assert.match(arsy, /DATABASE_URL:.*POSTGRES_DB/, 'the hub dials the database by name')
})

test('compose: the legacy radio DNS name aliases the one ARSY Hub service', () => {
  const arsy = blocks.get('arsy')
  assert.ok(arsy, 'canonical arsy service exists')
  assert.equal(blocks.has('radio'), false, 'a second radio service must not exist')
  assert.match(arsy, /aliases:[\s\S]*?\n\s+- radio\b/, 'radio resolves as a compatibility alias on the same service')
  assert.match(arsy, /container_name:\s*moonwitness\b/, 'the existing Hub container identity is retained')
  assert.match(compose, /depends_on:\n\s+arsy:\n\s+condition: service_healthy/, 'BFFs wait for the canonical ARSY service')
  assert.match(compose, /RADIO_API_URL:\s*http:\/\/radio:3000\$\{API_PREFIX/, 'legacy consumers continue through the radio alias')
})

test('root workflows and dev runner select ARSY and retain the radio transition alias', () => {
  const manifest = JSON.parse(readRepoText('package.json')) as { scripts: Record<string, string> }
  const runner = readRepoText('scripts/dev.mjs')
  assert.match(runner, /import \{ ALIASES, APPS \} from '\.\/apps\.registry\.mjs'/, 'the runner consumes the registry, not a private app list')
  assert.match(manifest.scripts.build ?? '', /--filter @moonwitness\/arsy build/)
  assert.match(manifest.scripts.test ?? '', /--filter @moonwitness\/arsy test/)
  assert.match(manifest.scripts['gen:sdk:check'] ?? '', /--filter @moonwitness\/arsy/)
  assert.equal(manifest.scripts['dev:radio'], 'pnpm --filter @moonwitness/arsy dev')
  // The runner now spawns from one registry (scripts/apps.registry.mjs); the
  // transition alias moved there with it, so the intent is asserted at the
  // source of truth instead of against literal lines in scripts/dev.mjs.
  const registry = readRepoText('scripts/apps.registry.mjs')
  assert.match(registry, /tag: 'arsy',\s*pkg: '@moonwitness\/arsy'/)
  assert.match(registry, /ALIASES = \{ radio: 'arsy' \}/)
})

test('compose: the backup runs the shared script, mounted read-only', () => {
  const backup = blocks.get('backup')
  assert.ok(backup, 'backup service exists')

  // no second copy of the dump algorithm living in the compose file
  assert.match(backup, /command: \["sh", "\/backup\.sh", "loop"\]/, 'the service runs scripts/db-backup.sh')
  assert.doesNotMatch(backup, /pg_dump -Fc/, 'and does not inline its own dump command')
  assert.match(backup, /\.\/scripts\/db-backup\.sh:\/backup\.sh:ro/, 'the script is mounted, not baked into an image')
  assert.match(backup, /Dockerfile\.backup/, 'the backup image includes AWS CLI without changing the database image')
  assert.match(backup, /BACKUP_S3_SECRET_ACCESS_KEY:/, 'remote credentials are passed at runtime from environment')
  // freshness is judged on committed dumps only, in the container that writes them
  assert.match(backup, /healthcheck:[\s\S]*ls -1t \/backups\/\*\.dump/, 'freshness is judged on committed dumps only')
})

test('backup script: ECHOLOG uses only bounded single-object S3 API operations', () => {
  assert.match(backupScript, /s3api put-object/, 'one PutObject uploads each committed dump')
  assert.match(backupScript, /s3api list-objects-v2/, 'retention enumerates objects')
  assert.match(backupScript, /s3api delete-object/, 'retention deletes one object per request')
  assert.match(backupScript, /stream_prefix="\$prefix\/\$PGDATABASE\/"/, 'retention is scoped to one database stream')
  assert.match(backupScript, /--output json/, 'AWS CLI combines paginated results before sorting')
  assert.match(backupScript, /sort_by\(\.LastModified\) \| reverse \| \.\[\]\.Key \| @base64/, 'retention globally orders and safely encodes keys')
  assert.match(backupScript, /case "\$old_key" in[\s\S]*\[0-9\]\[0-9\]\[0-9\]\[0-9\]\[0-9\]\[0-9\]\[0-9\]\[0-9\]T/, 'retention only counts generated timestamped dump keys')
  assert.match(backupDockerfile, /apk add --no-cache aws-cli jq/, 'backup image contains the S3 client and safe JSON key parser')
  assert.doesNotMatch(backupScript, /aws\s+s3\s+(cp|rm)\b/, 'high-level transfer commands may use unsupported multipart/batch APIs')
  assert.match(backupScript, /-gt "\$BACKUP_S3_MAX_OBJECT_BYTES"/, 'oversized dumps fail before upload')
  assert.match(backupScript, /S3 backup configuration is incomplete/, 'partial credential/configuration fails closed')
  assert.match(backupScript, /local dump retained/, 'remote failures leave the committed local dump available')
  assert.match(backupScript, /\.remote-success/, 'remote freshness is recorded only after upload and retention succeed')
})

test('backup script: writes through a .part file and renames on success', () => {
  assert.ok(backupScript.startsWith('#!/bin/sh'), 'must run under the POSIX shell the postgres image ships')
  // a CRLF checkout turns every line into `command\r` for /bin/sh: on this host
  // that is the difference between a backup sidecar and a crash loop.
  assert.ok(!backupScript.includes('\r'), 'db-backup.sh must stay LF: /bin/sh reads CRLF as part of the command')

  // no direct write to the final name: that is the half-dump bug
  assert.doesNotMatch(backupScript, /pg_dump[^\n]*-f\s+"\$file"/, 'pg_dump must not write the final name directly')
  assert.match(backupScript, /part="\$file\.part"/, 'the temp name is derived from the final one, on the same volume')
  assert.match(backupScript, /pg_dump[^\n]*-f\s+"\$part"/, 'pg_dump writes the temp file')
  assert.match(backupScript, /mv\s+"\$part"\s+"\$file"/, 'the rename is the commit point')
  assert.match(backupScript, /rm -f "\$part"/, 'a failed dump is removed, not left to look fresh')
  // rotation and freshness both look at *.dump, which a .part never matches
  assert.match(backupScript, /ls -1t \/backups\/\*\.dump/, 'rotation counts committed dumps only')
  assert.match(backupScript, /-name '\*\.part'[^\n]*-delete/, 'an orphaned .part is swept')
})

test('backup script: the on-demand mode the recovery docs call exists', () => {
  // docs/decisions/M04-02-migration-rollback-plan.md asks for a tagged snapshot
  // before a destructive migration; a mode that is not there is a recipe that fails
  // at the worst possible moment.
  assert.match(backupScript, /^ {2}one\)/m, '`one` is an explicit mode')
  assert.match(backupScript, /^ {2}\*\)/m, 'a bare tag falls through to a tagged dump')
  assert.match(backupScript, /file="\/backups\/\$PGDATABASE-\$stamp-\$1\.dump"/, 'the tag lands in the file name')
})

test('compose: db can read the dumps its rollback recipe restores from', () => {
  const db = blocks.get('db')
  assert.ok(db, 'db service exists')
  // docs/audit/M04-06-schema-upgrade-rollback.md runs pg_restore on /backups
  // inside this container; the volume used to be mounted in `backup` only.
  assert.match(db, /db-backups:\/backups:ro/, 'the same volume is visible, read-only')
  assert.match(compose, /^\s{2}db-backups:\s*$/m, 'the backup volume is declared')
})

test('compose: the backup volume exists and is mounted at /backups', () => {
  assert.match(compose, /^volumes:\s*$/m, 'there is a volumes: section')
  assert.match(compose, /^\s{2}db-backups:\s*$/m, 'the backup volume is declared')
  assert.match(blocks.get('backup') ?? '', /db-backups:\/backups/, 'and mounted where the script writes')
})

test('compose: a probe never glues a slash onto a prefix that already has one', () => {
  // API_PREFIX carries its own leading slash (`/api/v1`). Writing `${base}/$` +
  // `{API_PREFIX}` produced `http://127.0.0.1:3000//api/v1/health/ready`: the hub
  // answered on the host while every container stayed unhealthy, because the
  // probe 404s and dock/headquarters gate on it.
  assert.doesNotMatch(compose, /127\.0\.0\.1:3000\/\$\{API_PREFIX/, 'no separator before an API_PREFIX that starts with /')
  assert.match(compose, /127\.0\.0\.1:3000\$\{API_PREFIX:-\/api\/v1\}\/health\/ready/, 'the hub probes the real readiness path')
  assert.doesNotMatch(compose, /radio:3000\/\$\{API_PREFIX/, 'the BFF compatibility alias dials the prefix without an extra separator')
})

test('runbook: no step asks the db container for a variable it does not have', () => {
  // `$PGDATABASE` is exported by the backup sidecar only; inside `db` it is unset
  // and libpq silently falls back to "database = user", so the command "works"
  // against the wrong database.
  assert.doesNotMatch(runbook, /exec db[\s\S]{0,200}PGDATABASE/, 'PGDATABASE is not available inside the db container')
  assert.doesNotMatch(runbook, /-d postgres\b/, 'pg_stat_activity must be read against the database being restored')
  assert.match(runbook, /-d "\$POSTGRES_DB"/, 'the restore and the checks name the database explicitly')
})
