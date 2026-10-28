# M27-18 — Preview acceptance vs full-stack M27 release gate

**Status:** release-scope contract (specification only; it is not evidence and it approves no release).
**Task:** M27-18 (P0/D2, governance). **Canonical task state:** [TODO.md](../../TODO.md) — this document does not check, uncheck or re-scope any task.
**Authoring baseline:** `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` on `dev` (2026-10-28).
**Companion validator:** [`scripts/check-m27-18-preview-vs-fullstack.mjs`](../../scripts/check-m27-18-preview-vs-fullstack.mjs).
**Audit record:** [`docs/audit/M27-18-preview-vs-fullstack.md`](../audit/M27-18-preview-vs-fullstack.md).
**Related authority:** [Delivery and release evidence](../architecture/RELEASE.md) owns the general state vocabulary; [M27 milestone](../milestones/M27.md) owns milestone context; accepted ADRs own decisions.

---

## 1. Purpose, authority and non-goals

M27 contains two different acceptance questions that must never be merged:

1. **Gate P — PREVIEW acceptance**: may a bilingual public *preview* of the already-shipped Dock routes (`/id`, `/en`) be shown, at one exact source SHA, using only the evidence classes that scope actually needs?
2. **Gate F — FULL-STACK M27 acceptance**: has the *whole* XV M27 release matrix been executed and observed at one exact source SHA, including persistence, container images, browser journeys, backup restore, rights gates and a human release go/no-go?

A preview is a bounded, reversible demonstration. A full-stack acceptance is a release decision. Passing Gate P never advances Gate F, and Gate F never inherits Gate P's run artefacts.

This document defines the two gates, their entry criteria, required evidence and prohibited claims. It performs **no** deployment, starts **no** service, runs **no** CI and records **no** pass result. Configuration validity, a green unrelated CI job, or a successful local build is not deployment and is not acceptance.

**Authoring observation at the baseline SHA:** `TODO.md` lists **M27-12 and M27-16 unchecked**, so neither gate has been entered and no acceptance state is claimed anywhere in this repository by this task. The dependency cell for M27-18 (`M27-12,M27-16`) therefore names evidence that does not yet exist; this document defines what that evidence must be and cannot substitute for it.

### 1.1 The exact-SHA rule

Every gate decision and every "closed" M27 leaf cites the **exact 40-character SHA** of the source commit and the **observed** evidence produced at that SHA. Branch names, tags, "latest", image tags without digests, and remembered results are not exact-SHA evidence. Inference is not observation. A commit or rebuild after the evidence run produces a new SHA and invalidates the gate until the evidence is regenerated at that SHA.

---

## 2. Release states used by both gates

These states follow [RELEASE.md](../architecture/RELEASE.md); `PREVIEW_ACCEPTED` is the scoped state this contract adds. Adding it here does not modify RELEASE.md and does not create a second status register.

| State | Meaning | Who may claim it |
|---|---|---|
| `CI_VERIFIED` | The named CI lanes for the declared scope passed on the exact SHA. | The lane's owner, from the CI run log. |
| `BUILD_VERIFIED` | The named build or image build actually completed at the SHA, with logs and, for images, digests. | Release engineering, from build logs. |
| `DEPLOYMENT_READY` | Manifest, configuration, secrets policy, rollback target and health checks exist for the exact SHA; nothing has been deployed by this state. | Release engineering, from reviewed configuration plus negative checks. |
| `DEPLOYED_VERIFIED` | A real HTTPS/revision check against the running environment returned the expected SHA, routes and headers, with access logs. | DevOps, from observed request/response evidence. |
| `PREVIEW_ACCEPTED` | A named human accepted the bounded preview scope at the exact SHA, knowing what is excluded. | Preview owner plus human reviewer. |
| `RELEASE_ACCEPTED` | A named human held the M27-07 release go/no-go after Gate F evidence passed. | Release manager, recorded in M27-07. |

No state implies a later state. `DEPLOYED_VERIFIED` for a preview host is not production deployment. `PREVIEW_ACCEPTED` is not `RELEASE_ACCEPTED`.

---

## Gate P — PREVIEW acceptance

**Scope:** the shipped bilingual public routes of Dock (`/id` and `/en`), their navigation, health and public data projection, plus the explicit withholding surfaces that replace unapproved content. Nothing else.

**Outcome when accepted:** the preview may be described as a *bilingual public preview at the exact SHA*, with its included routes and excluded features named, and with `PREVIEW_ACCEPTED` recorded by a named human. No production claim follows.

### P.1 Entry criteria

- [ ] M27-08 has frozen a preview manifest at one exact SHA that lists included public routes, excluded draft/private features, and non-goals; Research is either covered by an approved D08 public projection or explicitly withheld.
- [ ] M27-12 route, locale, header and health evidence exists at that same SHA for both `/id` and `/en`.
- [ ] M27-16 public URL and ACL negative matrix exists at that same SHA, showing anonymous denial for draft sources, hypotheses, mandates and unapproved exports.
- [ ] M27-13 deployment playbook and the preview Compose topology are reviewed; no database, HQ, Cockpit or AI port is publicly reachable by default.
- [ ] Rights, consent and review status for every route and asset inside the preview scope is recorded; restricted or rights-unknown material is absent or withheld.
- [ ] A named human preview go/no-go is scheduled and will review the evidence, not a summary of it.
- [ ] A rollback target for the preview environment is identified and reachable.

If any criterion is missing, Gate P is **not entered**. A missing criterion is recorded as a gap, not as "passed with a note".

### P.2 Required evidence artefacts

Preview needs only these six classes; their absence is a gate failure, and their presence outside this list does not expand the claim.

- `EV-SHA` — the exact 40-character source SHA, identical in every artefact below, plus the manifest commit that names it.
- `EV-MANIFEST` — the frozen preview manifest: included routes, excluded features, non-goals and the excluded-module statement.
- `EV-BUILD` — actual scoped build log for the preview artifact (Dock, and HQ only if HQ is inside preview scope) at the same SHA; a local dev server is not a build.
- `EV-BROWSER` — observed HTTP/browser evidence for `/id` and `/en` (status, locale, canonical/`hreflang`, navigation, degraded/offline state) and the anonymous-denial negative cases from M27-16.
- `EV-RIGHTS` — the public projection/withholding record proving that no restricted, unreviewed or rights-unknown source is served in preview scope.
- `EV-HUMAN` — a named scoped preview go/no-go record that cites the evidence artefacts and the exact SHA.

Preview deliberately does **not** require PostgreSQL restore, the full image matrix, SDK drift, lint/typecheck or the complete test suite; those belong to Gate F. It also cannot borrow a Gate F result: evidence is environment- and SHA-specific.

### P.3 Claims and prohibitions

- MAY CLAIM: `CI_VERIFIED` for the scoped preview lanes, `BUILD_VERIFIED` for the preview artifact, and `PREVIEW_ACCEPTED` at the exact SHA.
- MUST NOT CLAIM: `DEPLOYED_VERIFIED` for production, `RELEASE_ACCEPTED`, production deployment, full XV or M27-01–07 completion, database restore or off-host backup verification, or any unshipped Empire module.

A preview acceptance does not imply production deployment. Preview evidence cannot be promoted to Gate F: it must not certify unshipped Empire modules, and it must not be cited as evidence for PG, Docker image, restore, SDK or full browser-journey classes. A preview that is later rebuilt, reconfigured or moved to another host is a new run at a new SHA.

---

## Gate F — FULL-STACK M27 acceptance

**Scope:** the whole XV M27 release matrix at one frozen SHA: all required applications and packages, the Hub persistence layer, production images and Compose topology, bilingual public journeys plus denied-role journeys, backup restore, rights/consent/research gates, rollback/resume, and the human release go/no-go.

**Outcome when accepted:** `RELEASE_ACCEPTED` may be recorded by the M27-07 human reviewer, naming the exact SHA, the included feature manifest and the remaining risks. Even then, "accepted" is not a claim that every ecosystem module is implemented.

### F.1 Entry criteria

- [ ] M27-01 has frozen the intended release feature set and exact commit manifest; experimental or optional features are excluded unless separately accepted.
- [ ] The milestone prerequisites M01, M03, M04, M08, M14, M18, M19, M20, M22 and M28 are checked with valid evidence per TODO.
- [ ] Every M27-08–19 scoped task has its own exact-SHA evidence; Gate P, if accepted, is necessary but not sufficient.
- [ ] Rights, consent, research review and AI-scope decisions are recorded for everything the manifest includes.
- [ ] A named release manager, a human M27-07 go/no-go slot, and a tested rollback/resume target exist.
- [ ] The candidate SHA is clean and immutable for the duration of the matrix; unrelated dirty paths are excluded from the release manifest.

### F.2 Required evidence artefacts

All thirteen classes are required. A Gate F record missing any one of them is incomplete, regardless of how many other classes passed.

- `EV-SHA` — the exact 40-character release SHA recorded in every artefact, plus the M27-01 manifest that names it.
- `EV-MANIFEST` — the frozen full release manifest: included apps/routes/features, excluded experimental features, and non-goals.
- `EV-BUILD` — observed `pnpm build` and `pnpm build:web` logs at the SHA covering libs, ARSY, Dock and HQ.
- `EV-LINT-TYPECHECK` — observed `pnpm lint` and `pnpm typecheck` results at the SHA.
- `EV-TESTS` — observed test-suite results at the SHA, including the focused positive and negative tests named by each accepted M27 leaf.
- `EV-SDK` — observed `pnpm gen:sdk:check` result proving generated client and route schema agree at the SHA.
- `EV-PG` — PostgreSQL-backed run evidence at the SHA: migrations applied, queries exercised, and Hub behavior verified against a real database rather than an in-memory substitute.
- `EV-DOCKER` — observed production image builds (`pnpm verify:docker` or the task-recorded equivalent) with image digests, plus the reviewed Compose topology and port-exposure negative checks.
- `EV-BROWSER` — browser E2E for the bilingual public journeys (`/id`, `/en`) and the denied-role journeys, including anonymous denial of draft/unreleased data, at the SHA.
- `EV-RESTORE` — an isolated backup restore with row-count/index/manifest integrity verification and the recorded restore runbook and limitations.
- `EV-RIGHTS` — the licensing, consent, research-review and AI-scope gate records proving no unreviewed or rights-unknown raw source is publicly served.
- `EV-ROLLBACK` — an exercised rollback or resume target: previous image pinned, database restore path tested in isolation, and observed outcome recorded.
- `EV-HUMAN` — the M27-07 human release go/no-go record, naming the SHA, risks and decision; no agent may self-approve.

### F.3 Claims and prohibitions

- MAY CLAIM: `CI_VERIFIED`, `BUILD_VERIFIED`, `DEPLOYMENT_READY`, `DEPLOYED_VERIFIED` only with M27-14 observed HTTPS/Coolify logs, and `RELEASE_ACCEPTED` only after the M27-07 human go/no-go.
- MUST NOT CLAIM: unshipped Empire modules as implemented, deployment before observed access evidence, restore verification before the M27-04/M27-15 evidence, rights clearance before the M27-05 evidence, or Gate P artefacts reused as Gate F evidence.

Gate F is a release decision about the manifest, not a certification of the roadmap. Modules outside the manifest remain planned even after a full-stack acceptance, and any "closed" M27 leaf still cites its own exact SHA plus observed evidence.

---

## 3. Promotion, invalidation and closure records

1. **No promotion of evidence.** Gate P and Gate F are separate runs. Build, browser, database and restore evidence are environment- and SHA-specific and must be regenerated for Gate F.
2. **No promotion of scope.** Gate P covers only the routes and assets named in its manifest. Gate F may not treat the preview manifest as the release manifest.
3. **Invalidation.** Any new commit, rebuild, configuration change or environment change invalidates the affected evidence. A gate is reopened until every required class is re-observed at the new SHA.
4. **Closure record.** Every closed M27 leaf and every accepted gate records, in a reviewable file: `task_id`, `gate` (`PREVIEW` or `FULLSTACK`), exact 40-character SHA, environment, the command actually run, the observed output or artefact path, the evidence class, the reviewer, the date, the rollback action and the limitations. Placeholder values, future-dated results and summarised "all green" statements are invalid.
5. **TODO ownership.** Only the integrator checks a TODO leaf, and only after reviewing the closure record. This document never edits TODO.

---

## 4. Honesty and failure rules

- Configuration success is not deployment success; a green CI lane is not a release; a preview is not production.
- Missing, expired or unreadable evidence means the gate is **not entered**, never "passed conditionally".
- A recorded negative result blocks the gate until the cause is fixed and the class is re-run.
- Secrets, environment values and private witness material never appear in evidence artefacts, logs or release notes.
- Roles, rights and scope are not widened to make a gate pass.

---

## 5. Limitations of this contract

- It defines gates and evidence classes; it does not execute them, and it provides no pass result for either gate.
- It does not modify TODO, RELEASE.md, CI, Compose, Dockerfiles or deployment configuration.
- At the authoring baseline no gate has been entered: M27-12 and M27-16 are open, and the preview/full-stack evidence classes they own do not yet exist.
- The validator proves the contract is internally consistent and rejects tampered gate definitions; it does not prove any runtime, deployment or rights claim.

---

## 6. Machine-checked gate manifest

The block below is the machine-readable form of §§Gate P–Gate F. The validator requires it to agree with the prose headings, evidence bullets and claim lines above, and rejects a preview gate that claims production, a full-stack gate missing an evidence class, or a gate without an exact-SHA requirement.

<!-- M27-18 CONTRACT MANIFEST BEGIN -->
```json
{
  "schema": "moonwitness-m27-18-release-acceptance/1",
  "task": "M27-18",
  "contract_version": 1,
  "sha_length": 40,
  "gates": {
    "PREVIEW": {
      "heading": "## Gate P — PREVIEW acceptance",
      "production_claim": false,
      "deployment_claim": "preview-only",
      "exact_sha_required": true,
      "required_evidence": [
        "EV-SHA",
        "EV-MANIFEST",
        "EV-BUILD",
        "EV-BROWSER",
        "EV-RIGHTS",
        "EV-HUMAN"
      ],
      "may_claim": [
        "CI_VERIFIED for scoped preview lanes",
        "BUILD_VERIFIED for the preview artifact",
        "PREVIEW_ACCEPTED at the exact SHA"
      ],
      "must_not_claim": [
        "production deployment",
        "DEPLOYED_VERIFIED for production",
        "RELEASE_ACCEPTED",
        "full XV or M27-01..07 completion",
        "database restore or off-host backup verification",
        "unshipped Empire modules"
      ]
    },
    "FULLSTACK": {
      "heading": "## Gate F — FULL-STACK M27 acceptance",
      "production_claim": true,
      "deployment_claim": "observed-only",
      "exact_sha_required": true,
      "required_evidence": [
        "EV-SHA",
        "EV-MANIFEST",
        "EV-BUILD",
        "EV-LINT-TYPECHECK",
        "EV-TESTS",
        "EV-SDK",
        "EV-PG",
        "EV-DOCKER",
        "EV-BROWSER",
        "EV-RESTORE",
        "EV-RIGHTS",
        "EV-ROLLBACK",
        "EV-HUMAN"
      ],
      "may_claim": [
        "CI_VERIFIED",
        "BUILD_VERIFIED",
        "DEPLOYMENT_READY",
        "DEPLOYED_VERIFIED only with M27-14 observed HTTPS and Coolify logs",
        "RELEASE_ACCEPTED only after the M27-07 human go/no-go"
      ],
      "must_not_claim": [
        "unshipped Empire modules as implemented",
        "deployment before observed access evidence",
        "restore before M27-04 and M27-15 evidence",
        "rights clearance before M27-05 evidence",
        "Gate P artefacts reused as Gate F evidence"
      ]
    }
  },
  "evidence_classes": {
    "EV-SHA": "Exact 40-character source SHA repeated in every artefact, plus the manifest commit that names it.",
    "EV-MANIFEST": "Frozen manifest naming included routes, apps and features, excluded features and non-goals.",
    "EV-BUILD": "Observed build logs at the SHA; preview may scope this to the preview artifact only.",
    "EV-LINT-TYPECHECK": "Observed lint and typecheck results at the SHA.",
    "EV-TESTS": "Observed test-suite results at the SHA, including each accepted leaf's focused tests.",
    "EV-SDK": "Observed generated SDK and route-schema agreement check at the SHA.",
    "EV-PG": "PostgreSQL-backed run and migration evidence at the SHA.",
    "EV-DOCKER": "Production image builds with digests, reviewed Compose topology and port-exposure negatives.",
    "EV-BROWSER": "Bilingual public and denied-role browser journeys, including anonymous denial cases.",
    "EV-RESTORE": "Isolated backup restore with row, index and manifest integrity verification.",
    "EV-RIGHTS": "Licensing, consent, research-review and AI-scope gate records for the included scope.",
    "EV-ROLLBACK": "Exercised rollback or resume target with observed outcome and recorded limitations.",
    "EV-HUMAN": "Named human go/no-go record citing evidence artefacts and the exact SHA."
  }
}
```
<!-- M27-18 CONTRACT MANIFEST END -->
