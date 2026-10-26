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
const compose = readFileSync(`${ROOT}/docker-compose.yml`, 'utf8')
const runbook = readFileSync(`${ROOT}/docs/runbook-restore.md`, 'utf8')

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

  const radio = blocks.get('radio')
  assert.ok(radio, 'radio service exists')
  assert.match(radio, /DATABASE_URL:.*POSTGRES_DB/, 'the hub dials the database by name')
})

test('compose: the backup writes through a .part file and renames on success', () => {
  const backup = blocks.get('backup')
  assert.ok(backup, 'backup service exists')

  // no direct write to the final name: that is the half-dump bug
  assert.doesNotMatch(backup, /pg_dump[^\n]*-f\s+"\$\$\{file\}"/, 'pg_dump must not write the final name directly')
  assert.match(backup, /part="\$\$\{file\}\.part"/, 'the temp name is derived from the final one, on the same volume')
  assert.match(backup, /pg_dump[^\n]*-f\s+"\$\$part"/, 'pg_dump writes the temp file')
  assert.match(backup, /mv\s+"\$\$part"\s+"\$\$\{file\}"/, 'the rename is the commit point')
  assert.match(backup, /rm -f "\$\$part"/, 'a failed dump is removed, not left to look fresh')
  // rotation and freshness both look at *.dump, which a .part never matches
  assert.match(backup, /ls -1t \/backups\/\*\.dump/, 'rotation counts committed dumps only')
  assert.match(backup, /healthcheck:[\s\S]*ls -1t \/backups\/\*\.dump/, 'freshness is judged on committed dumps only')
})

test('compose: the backup volume exists and is mounted at /backups', () => {
  assert.match(compose, /^volumes:\s*$/m, 'there is a volumes: section')
  assert.match(compose, /^\s{2}db-backups:\s*$/m, 'the backup volume is declared')
  assert.match(blocks.get('backup') ?? '', /db-backups:\/backups/, 'and mounted where the script writes')
})

test('runbook: no step asks the db container for a variable it does not have', () => {
  // `$PGDATABASE` is exported by the backup sidecar only; inside `db` it is unset
  // and libpq silently falls back to "database = user", so the command "works"
  // against the wrong database.
  assert.doesNotMatch(runbook, /exec db[\s\S]{0,200}PGDATABASE/, 'PGDATABASE is not available inside the db container')
  assert.doesNotMatch(runbook, /-d postgres\b/, 'pg_stat_activity must be read against the database being restored')
  assert.match(runbook, /-d "\$POSTGRES_DB"/, 'the restore and the checks name the database explicitly')
})
