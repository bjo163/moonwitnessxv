# M16-03 — Private witness original and correction lineage

**Task:** M16-03 — Implement immutable original and appended correction lineage

**Baseline:** `7ea03670de9369252d615a80b66d71e37b8fa1d5` (`dev`; M16-02 evidence checked)

**Implementation commits:** `ac5010815418ac1a2355a678f7d52704be4590d2`, follow-up `992b8cdb6a072af2353b0c6093f73df75b64e6c8`

**Verified result SHA:** `992b8cdb6a072af2355a678f7d52704be4590d2`

**Worker:** `/root/m16_03_readiness` under the ratified M29-02 lease

**Independent reviewer:** `/root/m16_03_independent_review`; accepted after contract and ECHOLOG key semantics were reconciled.

## Deliverable

Added the canonical `@moonwitness/witness` D06 addon at `packages/moonql-witness`, registered through ARSY's existing addon wiring and included in the ARSY project references and runtime image. The addon stores a private original record with four independent nullable M16-02 date values (`occurredAt`, `observedAt`, `recordedAt`, `writtenAt`), a revision-1 original, and a separate ECHOLOG object key, digest, size and content-type reference. It stores no raw object bytes or testimony body. `witness_testimonies` and `witness_corrections` use `rest: false`; they are absent from public CRUD routes and the public model catalog.

Corrections append one complete value for exactly one of the four date slots. Sequence `n` records `basedOnRevision: n` and `revisionNumber: n + 1`; corrections never update the original row. Normal model repository update/remove operations on originals and corrections are rejected. ECHOLOG references preserve the exact key: REST may use `sha256/<digest>`, while S3 clients may use an opaque namespace key; the SHA-256 digest remains separately validated. The public API version advances additively from 2.0.0 to 2.1.0, with SDK snapshot/history regenerated.

## Acceptance evidence

At verified result SHA `992b8cdb6a072af2353b0c6093f73df75b64e6c8`:

- Addon, MoonQL client and ARSY builds passed; addon and ARSY typechecks passed.
- Focused M16-03 plus generated-client contract tests — 6/6 passed before the final key-fixture refinement; the final exact-SHA CI ran the full test pipeline successfully.
- `pnpm --filter @moonwitness/arsy exec tsx --test test/workspace-topology.test.ts test/dockerfile-contract.test.ts` — 14/14 passed, including dependency-to-directory Docker runtime mapping.
- `pnpm gen:sdk:check` — passed; generated SDK is up to date.
- Final opaque-key M16-03 focused suite — 2/2 passed; scoped ESLint and `git diff --check` passed.
- Exact GitHub Actions [run 40672642758](https://github.com/bjo163/moonwitnessxv/actions/runs/40672642758) completed successfully for this SHA, including monorepo verification, guarded promotion and release publication. `origin/dev` and `origin/main` both resolve to this SHA.

Tests use synthetic in-memory records only. No live PostgreSQL, ECHOLOG upload/round-trip, browser flow, or deployment was exercised.

## Security, limits and rollback

No real witness content or credential was used. Rights, consent, upload/view ACL, withdrawal and public derivatives remain M16-04 through M16-07; no upload or read route is exposed.

MoonQL model hooks reject normal repository update/delete calls, but internal `removeWhere` and raw-engine access bypass those hooks. This is not a claim of universal database-level immutability; current D06 models have no public route or endpoint. A future internal caller must preserve append-only behavior or add stronger enforcement before such access is introduced.

Rollback is a path-scoped revert of `992b8cd` followed by `ac50108`, including the addon, ARSY wiring, image copy, lockfile and generated API artifacts. No rollback drill was performed. Preserve unrelated worktree changes.

**Next eligible task:** M16-04 — gate upload and viewing by consent and explicit ACL. It must add consent/ACL behavior before any upload or read endpoint is exposed.
