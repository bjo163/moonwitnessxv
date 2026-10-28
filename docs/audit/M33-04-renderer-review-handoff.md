# M33-04 — Renderer and human-review handoff evidence

**Task:** M33-04 — Specify single renderer and HQ review handoff

**Status:** scoped specification; integrator review required; no TODO status changed

**Baseline/verification branch and SHA:** `dev` / `1190a037c1fa42ccf83ba8c95a76c10ea48627e1`

**Remote refs observed:** `origin/dev` = `1190a037c1fa42ccf83ba8c95a76c10ea48627e1`; `origin/main` = `32060943102120428bff26849601c2c760f851ca`

**Worker:** M16 final security review agent, assigned M33-04 leaf

**Reviewer:** unassigned; integrator review required

**Commit/push:** none

## 1. Scope and files

This leaf specifies one renderer protocol and a human review handoff to D08, while leaving host selection non-binding because M33-02's `HOST-HQ` is not ratified. It creates no renderer implementation, schema, route, UI, ADR, or TODO status change.

| Kind | Path |
|---|---|
| Contract specification | `docs/design/M33-04-single-renderer-review-handoff.md` |
| Contract validator and synthetic vectors | `scripts/check-m33-04-render-review-contract.mjs` |
| This evidence report | `docs/audit/M33-04-renderer-review-handoff.md` |

These three new paths are the full claimed scope. The working tree already contained unrelated changes from parallel work; they were preserved. No real media or rights evidence was added.

## 2. Inspection and contract choices

- M33-03 is closed at `b4386e2786342c685a61262467b61b6e12e33f95`; its D07 immutable-version, per-asset rights/consent gates and M18-03 rights vocabulary remain prerequisites. Real-source verification remains blocked.
- M33-02 is closed at `a7b71c0` as a recommendation only: `HOST-HQ` is recommended, not ratified. This artifact specifies a host-neutral handoff and does not choose HQ or a separate app.
- The real `apps/dock/src/ui/client/GeneratorStudio.tsx` uses a deterministic SVG generator with clipboard/SVG/PNG export handlers. `apps/dock/test` has no focused GeneratorStudio/SHADOW test file; tests found are for unrelated UI surfaces. The current generator is a public demo, with no private scene/version store or D08 review flow.
- The contract chooses one versioned renderer protocol (shared by preview/export) rather than a technology or deployment location. It records scene input digest, renderer/version, options digest, output digest and dimensions; only the existing demo's SVG and PNG MIME formats are allowed in this specification.
- The handoff binds D00-resolved author/reviewer, exact scene-version digest, M33-03 gate receipt, renderer output receipt, D08 decision and exact scope. D07/ARSY owns scene metadata, D00 identity, D08 rights/consent/review/publication, and ECHOLOG bytes. No one ownership boundary is duplicated.

## 3. Positive evidence

Command executed:

```text
node scripts/check-m33-04-render-review-contract.mjs
```

Observed result (exit 0):

```text
M33-04 renderer/review contract: PASS
synthetic positive: exact scene, renderer receipt, rights gate and distinct D08 reviewer bind successfully
negative vectors rejected: render digest mismatch, absent/unknown/scoped/revoked rights, withdrawn consent, self-review, missing D00 reviewer authorization, output mismatch, disallowed format
real-media validation: BLOCKED (synthetic fixtures only; no source or rights evidence supplied)
```

The positive fixture uses synthetic refs/digests only. It tests contract binding, not a real renderer, D08 service, export, or approval.

## 4. Negative evidence

The validator rejects synthetic cases for mismatched render input/version digest; absent rights receipt; `RIGHTS_UNKNOWN`; wrong rights scope; revocation signal; withdrawn consent; self-review; missing D00 reviewer authorization; reviewer/output digest mismatch; and an HTML output MIME type. No private or real source bytes are used.

Additional checks executed:

```text
node --check scripts/check-m33-04-render-review-contract.mjs
PowerShell trailing-whitespace scan over the three added files
```

Both passed. No application test, build, database, browser, or deployment was run; this was a docs/contract validator only.

## 5. Security, rights, and privacy

The handoff cannot bypass M33-03: exact-version rights/consent evidence and scope are required, and D08 remains the decision owner. Renderer outputs are derived artifacts, not source-rights grants. The contract bars arbitrary network fetch/executable SVG, makes review four-eyes, binds the review to the exact version and renderer output, and separates approval from publication. Real-media validation is **BLOCKED** until a real source/version, M33-03 rights/consent evidence, and an authorized D08 environment are available. No rights claim is made.

## 6. Rollback and result identity

Rollback is deleting these three new files only. No commit was created; the integrator owns the commit SHA and TODO closure. Exact file blob identities (not commit SHAs): specification `2cb6f080a42c340e0517bba46f4c3183eefd6656`; validator `0a9a7a5a0b47c18053476d709fa5da3f8a3ca04d`. The audit blob identity is in the integrator handoff.

## 7. Limitations and next eligible task

- This is a protocol specification and fixture validator, not implementation or proof of runtime authorization, deterministic rendering, rights service availability, media safety, accessibility, or publication.
- Canonical serialization, storage contracts, D08 operations, server-side authorization, and production renderer implementation remain future owner work.
- Host placement remains conditional on owner ratification of M33-02. Real-media tests remain blocked pending actual rights and consent evidence.
- **Next eligible:** integrator review. M33-05 can proceed as a scoped specification/verification task only when it preserves M33-03 privacy/rights gates and M33-04's exact-version handoff; real poster access validation remains blocked without approved real media/evidence.
