# M33-05 — Private poster access and attribution evidence

**Task:** M33-05 — Verify private poster access and attribution

**Status:** scoped synthetic contract; runtime verification blocked; integrator review pending

**Baseline:** branch `dev`, worktree SHA `b2cac4a526c688a843f9df1d66a5cd880c823e89`

**Remote refs observed:** `origin/dev` = `b2cac4a526c688a843f9df1d66a5cd880c823e89`; `origin/main` = `6230df2cf226856bf6af091053e33e19e4424234`

**Prerequisite:** M33-04 is checked in TODO at exact specification SHA `c62b8c6a4ed259ab87f6606198f084a4ae891beb`.

**Worker:** M33-05 task agent

**Reviewer:** integrator pending; this report does not self-approve or change task status.

## Scope and inspected reality

The three claimed paths are the M33-05 contract, its in-memory synthetic validator, and this evidence report:

- `docs/design/M33-05-private-poster-access-attribution.md`
- `scripts/check-m33-05-private-poster-contract.mjs`
- `docs/audit/M33-05-private-poster-access-attribution.md`

Inspected `apps/dock/src/ui/client/GeneratorStudio.tsx`, M33-03/M33-04 contracts, ECHOLOG's accepted ADR-0007 and current route behavior. The existing Dock generator is a public demo and has no private poster/version store or D08 review flow. ECHOLOG provides bytes/storage and does not decide rights or per-poster access. Its S3 endpoint has one configured bucket credential without per-object policy; its D06 private-witness marker is not a general poster ACL. No M33 runtime implementation or real poster/source rights evidence was found or created.

## Positive evidence

Command run:

```text
node scripts/check-m33-05-private-poster-contract.mjs
```

Observed result (exit 0):

```text
M33-05 private poster/access attribution contract: PASS
synthetic positive: exact scene/render/object, scoped rights, private decision and required credit accepted
negative vectors rejected: anonymous request, principal mismatch, decision for another render, revoked rights, download without download scope, missing required credit, public credit outside publication scope, public publication absent, object bytes changed
real-media/access verification: BLOCKED (no approved source, operational D08, or private delivery integration)
```

The positive fixture proves only the synthetic policy function accepts a complete exact-digest, private-scope vector and returns the scoped synthetic attribution. No bytes are read.

## Negative evidence and limits

The validator rejects unauthenticated/stale identity, a mismatched principal, stale render decision, revoked rights, missing action scope, incomplete attribution, private-to-public credit escalation, missing public publication approval, and object digest drift. These are in-memory vectors, not D00/D08/ECHOLOG integration tests or application access tests.

Additional checks executed: `node --check scripts/check-m33-05-private-poster-contract.mjs` passed; a PowerShell trailing-whitespace scan over the three claimed files passed. No application build, browser, database, S3 client, D00/D08 service, or deployment was run.

Private poster delivery remains blocked: a trusted server-side adapter with a current D00/D08 check before every exact-object read has not been implemented or exercised. Do not send the shared ECHOLOG/S3 credential or durable grant to a browser. Public publication remains blocked on M18/D08 gates. Real attribution and consent values remain unverified; no rights or consent claim is made.

## Security, rollback and next step

No credentials, private witness payloads, real source content or identity data were used. Rollback is removal of these three new files only. No TODO status was changed, no commit/push was made, and no tests beyond the listed Node validator were run. Integrator review is required; runtime verification remains blocked until a real authorized poster/source, operational D08 decision path, and private server delivery integration are available.
