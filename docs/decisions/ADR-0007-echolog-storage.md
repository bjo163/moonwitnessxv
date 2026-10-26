# ADR-0007 — ECHOLOG: standalone object storage and attachments
**Status: ACCEPTED — owner ratification, 27 October 2026.** The owner confirmed M39 and ADR-0007 in this Codex work session. Acceptance records a decision only; it does not prove implementation, and it authorizes no code, schema or deployment beyond the conditions below.

## Decision

**ECHOLOG is a standalone, stateless storage service for objects and attachments.** It owns domain **D19 Object Storage & Attachments**, runs on port **3006**, and is a bounded service — **not** a second Hub.

- **Name:** `ECHOLOG` — matches W07 in the sibling Empire repository's `data/organization/wings10.json`: `W07 | ECHOLOG | team: FIELD RECORDERS | area: Observation & Documentation | primaryPillar: TRUTH_GUIDANCE | proposedLeadPersonaSlot: GOD-050`, with lead persona `GOD-050 | FIELD WITNESS | "Mencatat temuan lapangan secara akurat" | dept D02 SIGNAL RUNNERS`. Registry status stays `PROPOSED_NOT_ASSIGNED`, `unitType: HUMAN_OPERATIONS_WING`, and `authorityLimit: NO_SUPERNATURAL_OR_DIVINE_AUTHORITY`; this is a source-name reference only. ECHOLOG is a software service and never an office, an angelic identity or an access authority.
- **Existing slot:** [BLUEPRINT.md](../../BLUEPRINT.md) already states *"Approved asset storage owns one immutable version of consented media/source bytes; XV stores metadata/digests. No public private-archive dumps."* This ADR gives that slot a name and an owner.
- **Workspace identity:** `apps/echolog` / `@moonwitness/echolog`, plus `@moonwitness/echolog-core` for contracts, drivers and digest verification.
- **Dependency direction:** `other apps → API → ECHOLOG → storage driver`. ECHOLOG never calls ARSY to persist bytes, and no consumer ever holds driver credentials.

## Statelessness is mandatory, not stylistic

ADR-0006 states *"No third SQL owner is authorized"* and its guard test pins the `drizzle-orm`/`postgres` importers to exactly `{packages/moonql, packages/skylink-store}`. **ECHOLOG therefore owns no tables and imports no SQL driver.** Object metadata lives in a JSON sidecar beside each object (and in S3 object metadata/tags on the `s3` driver): `filename`, `content_type`, `size`, `digest`, `uploader`, `created_at`, `retention_until`, `legal_hold`, `scan{pending|clean|infected|skipped}`, `tags`.

If SQL metadata ever becomes necessary, it requires a **new ADR that withdraws this clause** — never a silent schema.

## Storage model

- **Key scheme:** `sha256/<digest>` — content-addressed, **write-once**, immutable. Re-uploading identical bytes is a no-op that returns the same key (dedupe for free).
- **Drivers:** `fs` (default; dev and small deployments) then `s3` (any S3-compatible endpoint: MinIO, R2, AWS S3). MinIO is an **optional profiled compose service**, not a requirement.
- **Uploads pass through the service:** stream to a temp key, hash while writing, enforce size/MIME allow-list, then commit atomically (rename on `fs`, copy on `s3`) and write the sidecar. Verification therefore happens **before** the object becomes permanent.
- **Downloads use short-lived presigned grants** (TTL ≤5 min) or a streamed `fs` response. Presign is never used for upload in v1.
- **Bytes never enter Postgres.** No `bytea`.
- **Retention/legal hold:** `DELETE` is refused with `409` while `legal_hold` is set or retention has not elapsed; a separate admin GC pass removes expired objects and reports those it held back.

## Boundary and non-authorizations

| ECHOLOG owns | ECHOLOG does **not** own |
|---|---|
| object bytes, digest, size, MIME, retention, legal hold, quota, download grants | rights/consent (D08), identity/sessions (D00), `media_manifests` (D07), artifact/passage metadata (D01), message rows (D18) |

1. **Identity stays D00/ARSY.** ECHOLOG issues no sessions. Operator UI uses `Authorization: Bearer <ARSY session>` validated upstream with a short cache; services use a scoped `x-echolog-key`.
2. **Consumers store references only** — `{object_key, digest, size, content_type}`. Attachment-to-message links stay in D18 (`messages.media[]`).
3. **No credentials in the database or in consumers.** Driver credentials live only in ECHOLOG's environment.
4. **All inbound bytes are untrusted:** internal keys are `sha256/<hex>` only, original filenames are sanitized before `Content-Disposition`, and outbound fetches use the `@moonwitness/core` egress guard with `echolog` on the deny list.
5. **No public archive dumps:** private by default, access only through a grant.

## Non-goals for v1

Writing an S3 server from scratch · split/multipart uploads · CDN or edge caching · active antivirus (the `scan` slot records `skipped`) · image transforms or thumbnails · SQL metadata queries · home-made per-object encryption (rely on disk/bucket encryption).

## Documents that must change with this decision

`TODO.md` (M39 rows, group map, target-register count), `docs/vision/MASTER_VISION_NARRATIVE_XV.md` (naming separation, runtime table, W07 cross-reference, domain list), `BLUEPRINT.md` (surface + D19), `docs/decisions/M02-02-domain-assignments.md` (D19 row), `docs/architecture/APPS.md` (six historical directories, M38-07 health-only SKYLINK as the current seventh, planned ECHOLOG eighth), `docs/architecture/ECHOLOG.md` (new contract), `docs/architecture/SECURITY.md` (credentials, allow-lists, presign TTL, retention), `MASTER_DESIGN.md` and `docs/design/APPS.md` (surface semantics), `README.md` (current inventory, planned ECHOLOG target and an objects/attachments section), plus milestone/task packets and the monorepo-boundary skill.

## Consequences

- **Accepted cost:** one more process (port 3006) and, for real S3, one optional storage container. No new database.
- **Accepted cost:** metadata queries require listing objects or reading sidecars; acceptable while no consumer needs search.
- **Accepted risk:** the `fs` driver ties durability to one volume — production must use `s3` or a backed-up volume.
- **Rejected:** SQL metadata (withdraws ADR-0006's closed SQL-owner set for no current need); bytes in Postgres `bytea`; bytes on the ARSY disk (ARSY restart would fail uploads and mix domain owners); a hand-written S3 server (sigv4/multipart/conditional-write bug surface far exceeds the value); presigned uploads in v1 (digest verification becomes two-phase with more failure states); D07 as the byte owner (it owns manifests, not bytes); naming this service `RAINMAKERS` (W02/GOD-017 is food and basic-needs provisioning), `HAVEN`, `LEDGER PUNK` or `ASSETS` (sanctuary/audit/generic; `rocksoul-assets` already names a visual-source family).

## Acceptance conditions

1. **Satisfied at ratification (27 October 2026).** Owner ratified this ADR and registers **D19** with ECHOLOG as its sole owner; the D19 row is written by M39-04.
2. `TODO.md` gains milestone M39 with unchecked rows; historical checkboxes are never rewritten.
3. The closed SQL-owner set `{packages/moonql, packages/skylink-store}` remains true after every ECHOLOG task; the guard test is never weakened to admit a third owner.
4. Rollback is demonstrated: stopping the service leaves existing objects intact and consumers fall back to local files or a no-op.
5. M38 (SKYLINK) state is re-checked before any consumer handoff; ECHOLOG may be built in parallel because it touches no existing app.
