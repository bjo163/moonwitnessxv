#!/bin/sh
# Database dump sidecar for docker-compose.yml (the `backup` service).
#
#   sh /backup.sh loop              the interval loop the compose service runs
#   sh /backup.sh one [tag]         one on-demand dump, path printed on stdout
#   sh /backup.sh pre-migration     same, with the tag spelled by the argument
#
# libpq reads PG*, which compose maps from the POSTGRES_* bootstrap identity.
#
# Every mode shares one discipline: write "<final>.part", rename only on a
# non-empty success. A dump killed mid-write would otherwise look fresh to the
# freshness healthcheck (and to rotation) while being unusable. The path is
# literal because compose mounts the volume there and the healthcheck reads the
# same glob — apps/radio/test/compose-contract.test.ts holds both to it.

# `one`/tag mode prints the committed path on stdout, so a failure must not
# pollute it: errors go to stderr and still land in `docker compose logs`.
set -eu

# $1: a tag for an on-demand snapshot, empty for the routine interval dump.
dump() {
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  if [ -n "${1:-}" ]; then
    file="/backups/$PGDATABASE-$stamp-$1.dump"
  else
    file="/backups/$PGDATABASE-$stamp.dump"
  fi
  part="$file.part"

  if pg_dump -Fc -f "$part" 2>/tmp/pgdump.err && [ -s "$part" ]; then
    mv "$part" "$file"
    echo "$file"
    return 0
  fi

  rm -f "$part"
  echo "pg_dump failed: $(cat /tmp/pgdump.err)" >&2
  return 1
}

rotate() {
  # keep the BACKUP_KEEP newest committed dumps; a .part never matches the glob
  ls -1t /backups/*.dump 2>/dev/null | tail -n +$((${BACKUP_KEEP:-48} + 1)) | xargs -r rm -f
}

sweep_parts() {
  # a container killed between dump and rename leaves its .part behind
  find /backups -name '*.part' -mmin +60 -delete 2>/dev/null || true
}

case "${1:-loop}" in
  loop)
    mkdir -p /backups
    while true; do
      if committed=$(dump ""); then
        echo "written $committed ($(wc -c < "$committed") bytes)"
        rotate
      fi
      sweep_parts
      sleep "${BACKUP_INTERVAL_SECONDS:-3600}"
    done
    ;;
  one)
    shift
    dump "${1:-manual}"
    ;;
  *)
    # the docs/decisions/M04-02 recipe: /backup.sh manual-pre-migration
    dump "$1"
    ;;
esac
