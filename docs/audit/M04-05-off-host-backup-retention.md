# M04-05 — Off-Host Backup Copy & Retention Path

- **Milestone**: M04 Database continuity and recovery
- **Task**: M04-05
- **Status**: RENCANA — TASK DIBUKA KEMBALI (revalidasi 2026-10-26)
- **Auditor**: Revalidasi otomatis 2026-10-26

> **Revalidasi 2026-10-26:** dokumen ini masih berupa strategi. Tidak ada
> implementasi `rclone`, target off-host, jadwal retensi/prune, atau test yang
> dijalankan. Backup yang ada hanya berada di volume Docker host yang sama
> dengan database. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

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
