# M04-05 — Off-Host Backup Copy & Retention Path

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-05
- **Status**: OPEN — IMPLEMENTASI TERSEDIA, VERIFIKASI OFF-HOST BELUM DILAKUKAN (update 2026-10-28)
- **Auditor**: Revalidasi otomatis 2026-10-26; update implementasi oleh integrator 2026-10-28

> **Temuan historis 2026-10-26:** dokumen ini masih berupa strategi. Saat itu tidak ada
> implementasi target off-host, jadwal retensi/prune, atau test yang dijalankan.
> Backup yang ada hanya berada di volume Docker host yang sama dengan database. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

## Current implementation status — 2026-10-28

Code slice for the ECHOLOG S3-compatible target landed at exact source SHA
`69d024a2d9c2928f7340da0872dc2fb2e9ea7113` and was promoted to `main` by CI run
[40713370198](https://github.com/bjo163/moonwitnessxv/actions/runs/40713370198)
with release tag `v2.11.0`. It adds a dedicated backup image with AWS CLI and
`jq`; the sidecar makes single-object `PutObject`, lists all pages before a
global `LastModified` sort, then sends individual `DeleteObject` operations.
Retention is limited to timestamped dumps under a per-database prefix. Partial
configuration and oversize dumps fail closed; upload failures preserve the
local dump. The marker for remote freshness is updated only after upload and
retention finish.

Observed local verification before the source commit:

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/arsy exec tsx --test test/compose-contract.test.ts` | 13/13 passed |
| `docker compose config --quiet` | exit 0 |
| `git diff --check -- .env.example apps/arsy/test/compose-contract.test.ts docker-compose.yml docs/runbook-restore.md scripts/db-backup.sh Dockerfile.backup` | exit 0 |
| CI run `40713370198` at exact SHA above | monorepo verification and promotion succeeded |

**Still unverified:** no ECHOLOG backup endpoint on a separate host, secret
access, remote retention run, download from the recovery host, or restore drill
has been performed. `docker info --format '{{.ServerVersion}}'` failed because
the Docker Engine named pipe was unavailable, so the image was not built
locally. `bash -n scripts/db-backup.sh` could not run because this Windows host's
WSL shim has no `/bin/bash`. CI does not prove those runtime conditions.
M04-05 therefore remains **OPEN** until the off-host upload, retention, and
restore are demonstrated on separate hosts with the approved ECHOLOG endpoint.

---

## 1. Single Host Vulnerability Analysis

The default Docker Compose setup mounts `moonwitness_db_backups` on the host running the database container.
- If the virtual machine or hardware host suffers disk failure, the database AND the backups are destroyed simultaneously.
- A backup that lives exclusively on the same host cannot be considered a valid disaster recovery solution.

---

## 2. Off-Host Sync Strategy

1. **Secondary Storage Target**:
   - Encrypted Object Storage (Cloud Storage / S3 / R2) or isolated secondary backup node via SSH/rsync.

2. **Automated Synchronization Job**:
   - The backup sidecar or a systemd timer on the host executes an off-host push immediately following dump generation:
   ```bash
   # Sync latest dump to off-host storage
   rclone copy /backups/ remote:moonwitness-backups/ \
     --include "*.dump" \
     --max-age 24h
   ```

3. **Retention Policy (Grandfather-Father-Son)**:
   - **Hourly dumps**: Kept for 48 hours on local volume (`BACKUP_KEEP: 48`).
   - **Daily snapshots**: Kept for 30 days off-host.
   - **Weekly snapshots**: Kept for 12 weeks off-host.
   - **Monthly archives**: Kept for 1 year off-host.

4. **Retention Pruning Test**:
   - Pruning script tested to ensure old dumps older than retention window are deleted without deleting recent chains.
