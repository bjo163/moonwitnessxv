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
# same glob — apps/arsy/test/compose-contract.test.ts holds both to it.

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

s3_configured() {
  [ -n "${BACKUP_S3_ENDPOINT:-}" ] || [ -n "${BACKUP_S3_BUCKET:-}" ] || [ -n "${BACKUP_S3_ACCESS_KEY_ID:-}" ] || [ -n "${BACKUP_S3_SECRET_ACCESS_KEY:-}" ]
}

s3_sync() {
  # ECHOLOG supports bounded, single-object S3 calls only. aws s3api put-object
  # never switches to multipart; list pagination is handled by the CLI and each
  # expired key is deleted with its own DeleteObject request.
  if ! s3_configured; then return 0; fi
  : "${BACKUP_S3_ENDPOINT:?S3 backup configuration is incomplete}"
  : "${BACKUP_S3_BUCKET:?S3 backup configuration is incomplete}"
  : "${BACKUP_S3_ACCESS_KEY_ID:?S3 backup configuration is incomplete}"
  : "${BACKUP_S3_SECRET_ACCESS_KEY:?S3 backup configuration is incomplete}"
  : "${BACKUP_S3_MAX_OBJECT_BYTES:=52428800}"
  : "${BACKUP_S3_KEEP:=90}"
  size=$(wc -c < "$1" | tr -d ' ')
  case "$BACKUP_S3_MAX_OBJECT_BYTES" in ''|*[!0-9]*) echo "invalid S3 backup size limit" >&2; return 1;; esac
  case "$BACKUP_S3_KEEP" in ''|*[!0-9]*|0) echo "invalid S3 backup retention count" >&2; return 1;; esac
  if [ "$size" -gt "$BACKUP_S3_MAX_OBJECT_BYTES" ]; then echo "backup exceeds configured ECHOLOG object limit; local dump retained" >&2; return 1; fi
  prefix="${BACKUP_S3_PREFIX:-moonwitness-backups}"
  stream_prefix="$prefix/$PGDATABASE/"
  key="$stream_prefix$(basename "$1")"
  export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY_ID" AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY"
  export AWS_DEFAULT_REGION="${BACKUP_S3_REGION:-us-east-1}" AWS_EC2_METADATA_DISABLED=true
  aws --no-cli-pager --endpoint-url "$BACKUP_S3_ENDPOINT" s3api put-object --bucket "$BACKUP_S3_BUCKET" --key "$key" --body "$1" --content-type application/octet-stream >/dev/null || { echo "ECHOLOG PutObject failed; local dump retained" >&2; return 1; }
  # Ask AWS CLI for JSON so its paginator combines every page first, then sort
  # the complete result. Text-output JMESPath queries sort each page separately.
  objects=$(aws --no-cli-pager --endpoint-url "$BACKUP_S3_ENDPOINT" s3api list-objects-v2 --bucket "$BACKUP_S3_BUCKET" --prefix "$stream_prefix" --output json) || { echo "ECHOLOG ListObjectsV2 failed; local dump retained" >&2; return 1; }
  ordered_keys=$(printf '%s\n' "$objects" | jq -r '(.Contents // []) | sort_by(.LastModified) | reverse | .[].Key | @base64') || { echo "ECHOLOG ListObjectsV2 response was invalid; local dump retained" >&2; return 1; }
  count=0
  # Base64 lines keep spaces and control characters in S3 keys intact. The
  # database sub-prefix prevents this stream pruning another database's data.
  for key_b64 in $ordered_keys; do
    old_key=$(printf '%s' "$key_b64" | base64 -d) || { echo "ECHOLOG key decoding failed; local dump retained" >&2; return 1; }
    case "$old_key" in
      "$stream_prefix$PGDATABASE-"[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]T[0-9][0-9][0-9][0-9][0-9][0-9]Z.dump|"$stream_prefix$PGDATABASE-"[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]T[0-9][0-9][0-9][0-9][0-9][0-9]Z-*.dump) ;;
      *) continue ;;
    esac
    count=$((count + 1))
    if [ "$count" -le "$BACKUP_S3_KEEP" ]; then continue; fi
    aws --no-cli-pager --endpoint-url "$BACKUP_S3_ENDPOINT" s3api delete-object --bucket "$BACKUP_S3_BUCKET" --key "$old_key" >/dev/null || { echo "ECHOLOG DeleteObject failed; local dump retained" >&2; return 1; }
  done
  date -u +%s > /backups/.remote-success
  echo "ECHOLOG backup synced; retained $((count < BACKUP_S3_KEEP ? count : BACKUP_S3_KEEP)) objects"
}

case "${1:-loop}" in
  loop)
    mkdir -p /backups
    while true; do
      if committed=$(dump ""); then
        echo "written $committed ($(wc -c < "$committed") bytes)"
        s3_sync "$committed" || true
        rotate
      fi
      sweep_parts
      sleep "${BACKUP_INTERVAL_SECONDS:-3600}"
    done
    ;;
  one)
    shift
    committed=$(dump "${1:-manual}")
    echo "$committed"
    s3_sync "$committed"
    ;;
  *)
    # the docs/decisions/M04-02 recipe: /backup.sh manual-pre-migration
    committed=$(dump "$1")
    echo "$committed"
    s3_sync "$committed"
    ;;
esac
