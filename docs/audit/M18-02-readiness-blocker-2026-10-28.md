# M18-02 readiness and blocker audit — 2026-10-28

## Finding

M18-02 remains **open** in `TODO.md` at the audited `dev` baseline. The repository already contains (1) D01 edition and translation license/rights metadata with a fail-closed raw-text gate, (2) D06 private witness consent records and private-media access checks, and (3) M14 human review records for D05 research claims. These are real but separate, differently scoped mechanisms. The inspected implementation does **not** establish one authoritative, durable decision that binds an exact edition/body or media version, applicable rights/consent scope and evidence, and an authorized reviewer decision to a publication artifact. Therefore the full acceptance criterion, “No unknown-rights byte published,” is not proven across a publication path.

This audit does not claim that no consent or review data exists, nor that the existing D01 text gate is ineffective. It identifies the unimplemented cross-domain governance/publication evidence required to close M18-02.

## Baseline and method

- Repository: `Z:\project\moonradio`; branch `dev`.
- HEAD: `1190a037c1fa42ccf83ba8c95a76c10ea48627e1` (`docs(todo): close M33-03 at exact spec evidence`).
- `git ls-remote origin refs/heads/dev` returned the same SHA; the audited baseline was pushed.
- `git status --short --branch` showed `dev...origin/dev` plus pre-existing dirty and untracked work in Cockpit, Dock, Headquarters, UI audit artifacts, and witness prototype files. This audit did not alter or stage those files.
- Inspected task state and packets for M18-01/02/03/04/06; D01/D06/D08 domain assignment; M14 decision and review implementation; current Corpus, Witness and Research source; and the M16-04 audit.
- Read-only commands used included `git status --short --branch`, `git rev-parse HEAD`, `git ls-remote origin refs/heads/dev`, `git log -1 --oneline`, `Select-String` over `TODO.md`, `Get-Content` over task/decision/audit documents, `Test-Path apps/dock/src/data/queries/research.ts`, and targeted `rg -n` searches over the source paths named below. No tests, builds, database queries, deployments, or migrations were run.

The M18-02 packet points to `apps/dock/src/data/queries/research.ts`; `Test-Path` returned `False`. That target is stale and was not used to infer current behavior. The current implementation review instead followed the owning packages and observed paths below.

## What exists today

### D01 Corpus: edition and body/translation rights metadata

`packages/moonql-corpus/src/index.ts` defines `corpus_editions` with `rightsStatus`, `licenseName`, source URI, provenance digest, and editor/publisher fields. `corpus_translations` also carries rights status and license name. The reader path requires the exact `RIGHTS_EXACT_VERSION_CLEARED` state to serialize raw source text; otherwise it withholds text and returns safe metadata. This is meaningful fail-closed behavior for the inspected D01 text-reader path.

These fields and the gate do not themselves prove the legal basis, exact licensed version, permitted uses, source-holder authority, evidence authenticity, reviewer identity/decision, or D08 publication approval. Seed/default metadata is not independent rights verification. This audit did not inspect external source documents or validate any real-world license claim.

### D06 Witness: consent and private media controls

`packages/moonql-witness/src/index.ts` defines `witness_consent_records` (non-REST) with subject, consent type, scope, status, opaque `evidenceRef`, recorder and time/expiry fields. An admin-only consent endpoint records rows. The inspected active media authorization checks accept granted `PRIVATE_ARCHIVE` or `INTERNAL` scopes; testimony ingestion requires such consent and marks the ECHOLOG object private. Authenticated private-media authorization and short-lived grants enforce that private access path.

Thus a D06 consent store and private-media ACL path exist. The `evidenceRef` is a pointer, not proof that the referenced evidence was verified. The inspected gate is for private/internal access; it does not amount to a public-media release approval and does not bind an authorized D08 sign-off to a specific publication derivative. Do not interpret this finding as absence of consent records or as proof that any real testimony is publishable.

### M14 Research: named reviewer records

`packages/moonql-research/src/review-subsystem.ts` stores named human review actors, evidence SHA, state/version, decisions, timestamps and append-only events for D05 research cases/claims/hypotheses. The M14 decision (`docs/decisions/M14-01-review-workflow.md`) explicitly keeps publication unavailable; review is not copyright/license clearance. Its objects and evidence hashes concern research claims, not D01 edition/body licenses, D06 media consent, or a D08 release artifact. M14 therefore provides reviewer/audit patterns and records, but cannot be treated as M18-02's authoritative publication-rights evidence.

## Remaining contract and evidence gap

The domain map (`docs/decisions/M02-02-domain-assignments.md`) assigns publication governance to planned D08 (`@moonwitness/governance`), with `release_manifests`, `rights_approvals`, `editorial_signoffs` and `takedown_logs`. The source search found these names in the planning map and a denial test that asserts guessed D08 model names do not resolve; no implemented D08 store or authoritative publication projection was found. M18-03 is explicitly a pure manifest contract, not wired to a D08 store, route or publication. M18-04 is likewise an in-process lifecycle contract, not a durable store/route/projection integration.

To establish the M18-02 acceptance criterion, the owner decision and implementation still need an authoritative, durable link among:

1. the exact edition/body or media object/derivative version and its content digest;
2. the applicable license/rights grant, allowed use/scope, source and reviewable evidence reference, with status and any expiry/revocation;
3. for media, the relevant D06 consent record and its explicit scope, tied to the exact object/derivative being considered;
4. a named, authorized rights/editorial reviewer decision with immutable audit evidence and scope; and
5. the publication/read projection that consults this authority and demonstrably withholds bytes if any required state, binding, evidence, permission or approval is absent, stale, mismatched, withdrawn or revoked.

The existing D01 gate supports a narrower claim: the inspected Corpus raw-text reader denies rows without its exact cleared status. It does not demonstrate the M18-wide publication invariant for media and other projections, and a status value alone is not proof of rights. No D08 model/store/projection was identified in the audited tree.

## Inputs and decision gates before implementation can close

- Repository owner/architecture decision on D08's accepted implementation contract, persistence owner and integration point. Do not create another SQL/data owner or silently promote D05/D06 stores into D08 authority.
- Exact, authorized source/edition/body version and rights-holder/license evidence, including the allowed publication uses and territory/term where applicable. No such real-world legal evidence was supplied or verified for this audit.
- If media is in scope: the authorized consent evidence and the intended public/derivative scope for each exact media object; current private/internal D06 grants do not establish this.
- A named authorized human rights/editorial reviewer and the review/evidence retention, expiry, withdrawal and correction rules. M14's research reviewers cannot be presumed to hold that authority.
- A real publication projection/consumer integration target so positive and negative tests can verify byte withholding and exact approved-version release. The current M18-03 pure manifest alone is not that integration.

## Rights, privacy and evidence limits

Only repository source, task/decision documents and repository metadata were inspected. No private witness payload, testimony, consent document, real license/source document, production database, secret, external bucket, or live publication was accessed. No rights-holder, consent subject, or reviewer claim was independently contacted or verified. Seeds/spec fixtures and code contracts are not treated as real authorization evidence. This document records a technical readiness/blocker assessment, not legal advice or a determination that any particular work is cleared.

No source or TODO file was changed. No test/build was run. The only requested output is this new audit artifact; no commit or push was made.
