# M34-03 — Source-linked case and hypothesis draft specification evidence

**Task:** M34-03 — Specify source-linked case and hypothesis drafts.
**Baseline `dev` SHA:** `8a105edead6f7afb616c89079ca5975108f85719`.
**Worker:** `/root/m34_03_scope` under ratified M29-02 task lease.
**Claimed and actual paths:** `docs/planning/M34-03-case-draft-spec.md`; `docs/audit/M34-03-case-draft-evidence.md`. No TODO or source-code path is in scope.

## Evidence inspected

- M34-02 is checked in TODO and chooses a private Headquarters desk; D05 remains in the existing ARSY/MoonQL addon, and Dock must remain fail-closed pending M34-04.
- Accepted M34-02 clauses D3–D8 require server-side Hub authorization, explicit intent endpoints for governed transitions, four-eyes review, and no public raw Research read.
- ADR-0003 and M14-01 preserve source rights/consent boundaries and named-human review; publication remains unavailable even after review eligibility.
- At baseline, `packages/moonql-research/src/index.ts` already defines source-linked case/hypothesis fields and an explicit `POST /research/hypotheses/register` validator. The case model has no dedicated registration endpoint, and raw Research REST models must not be treated as a safe HQ workflow or public projection.
- The current hypothesis registration handler checks the case digest and optional frame ownership but does not explicitly compare a supplied citation key to the case citation. The spec requires that check before the future desk exposes registration.
- The current hypothesis registration request also accepts `proposedBy` in its body and copies it into the draft. That is a provenance gap: the future workflow must derive and bind the named actor from authenticated Hub context; M14-01 requires named actors and M34-02 D7 preserves four-eyes review without a new role.
- The specification therefore defines HQ UI route names as proposals only and explicitly leaves case registration unavailable until an intent endpoint receives separate review. It invents no source, rights, text, or production behavior.

## Acceptance scenarios and checks

The spec contains nine positive/negative scenarios: a synthetic case shape fixture (not a case write operation); hypothesis binding with server-derived proposer identity; missing source; mismatched citation/frame/digest; unknown/restricted rights; self-validation; spoofed proposer; generic model writes; and anonymous public read. Source text is not embedded; synthetic digest placeholders are explicitly non-evidence.

Commands and checks run:

- The integrator supplied baseline `dev` SHA `8a105edead6f7afb616c89079ca5975108f85719`; pre-write `git status --short -- docs/planning/M34-03-case-draft-spec.md docs/audit/M34-03-case-draft-evidence.md` had no output, confirming both claimed paths were clean. Subsequent `git branch --show-current` returned `dev` and `git rev-parse HEAD` still returned `8a105edead6f7afb616c89079ca5975108f85719`.
- `Get-Content docs/tasks/M34/M34-03.md`, `Get-Content docs/decisions/M34-02-moonlab-hq-desk-decision.md`, `Get-Content docs/decisions/ADR-0003-source-rights-and-consent.md`, and `Get-Content docs/decisions/M14-01-review-workflow.md` — inspected task and accepted boundaries.
- `rg --files packages/moonql-research apps/arsy/test | rg '(research.*test|index\.ts|seed\.ts)$'` — found the Research addon source/seed and ARSY `research.test.ts`; no package-local research test directory exists.
- `rg -n 'research_cases|research_hypotheses|evidenceSha|proposedBy|/research/hypotheses/register|validateHypothesisRow' packages/moonql-research/src/index.ts apps/arsy/test/research.test.ts` — inspected field and handler implementation, including the citation-match gap above.
- A read-only `validateTaskRegister` invocation with tracked Markdown files plus the two new artifacts — 360 task rows parsed, 0 diagnostics in either new document.
- A PowerShell trailing-whitespace scan of both new artifacts — no matches.

No runtime test was executed: this deliverable is a design contract, and existing tests cannot verify a not-yet-built HQ route or case intent endpoint. At original inspection baseline `8a105edead6f7afb616c89079ca5975108f85719`, the hypothesis route accepted `proposedBy` from the request body; the later integrator review baseline is `4eb54542211fce107aa553438c1076569c894ef8` and does not change the source-inspection claim. An independent reviewer checked the final spec against accepted policy and current source at `4eb5454` and found no remaining blocker; exact-SHA CI for the integrated artifact is still required before TODO closure. Citation-match validation, server-derived proposer identity, and a case intent endpoint need focused positive/negative runtime tests before implementation/UI work can claim those behaviors.

## Limitations, rollback, next task

- No code, route, database, rights clearance, public projection, live provider or deployment was changed or exercised.
- Existing M34-02 chose `/research/*` as the working namespace but deferred exact URLs to M34-03; this artifact proposes route names without claiming they exist.
- Rollback is limited to removing these two documentation files if review rejects them; no other paths need reversal.
- Next eligible task after M34-03: M34-04, specify the D08 released Research projection. M19-19 remains ineligible for closure until that projection is accepted and tested; Dock stays fail-closed meanwhile.
