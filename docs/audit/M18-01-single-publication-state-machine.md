# M18-01 — Single publication state machine for text, testimony, and story

- **Task:** M18-01 (P1), specify one human publication path with per-type rights vetoes.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `dc82e7920d3dc61e9ae4a41b137f05d2516f9dab`.
- **Remote baseline observed:** `origin/main` and `origin/dev` both resolve to `d8c5bfa2e61f7d797d9478de0522514048a93886`.
- **Prerequisites:** M14-07 and M07-07 are checked in TODO. Their current behavior was inspected in `packages/moonql-research/src/review.ts`, `packages/moonql-corpus/src/index.ts`, and their Radio tests.
- **Artifact status:** specification for integrator and D08 owner review; this file does not add or amend an accepted ADR and does not claim the D08 publishing service exists.
- **Changed path:** this report only. No application code, schema, source content, consent record, or TODO status changed.

## Specified path

ADR-0003 supplies one common editorial path for all publishable material:

```text
DRAFT → IN_REVIEW → APPROVED_WITHIN_SCOPE → PUBLISHED
```

One named human reviewer makes the approval decision; a bot, AI, score, pilot, or content owner cannot publish by itself. The transition to `PUBLISHED` has a shared approval gate and a type-specific rights gate. A failed or missing gate leaves the item unpublished. Publication is limited to the approved scope and exact reviewed revision. This is a specification for the later D08 implementation, not a claim that the current Research release-verdict endpoint publishes content: M14-07 explicitly keeps `publicationAvailable: false`.

| Content type | Rights/consent veto before public release | Current accepted basis and implementation limit |
|---|---|---|
| Text and translations | Exact edition/version must be cleared for the intended public use. Unknown, restricted, or metadata-only rights do not authorize text bytes. | ADR-0003's `rightsStatus` and M07-04/M08-05. The Corpus projection returns metadata only for a rights-unknown edition or translation. M18-02 still needs to store durable license and reviewer evidence. |
| Personal testimony | Explicit consent must cover the requested public scope. A withdrawn item is excluded. Identifiable testimony involving a minor is never public; witness policy requires anonymization/redaction before editorial review for vulnerable subjects. | Accepted ADR-0003 and ratified M03-06. This acceptance does not itself supply the missing D06 consent-record schema or D08 enforcement. |
| Story, image, music, and derivative media | Rights/provenance for the exact original and derivative asset must be recorded and clear for the public scope. A draft or unlicensed asset is never public. **The D07 Story release gate remains closed until M17 is complete and its release criteria are evidenced.** | ADR-0003 covers original creative work and isolated raw assets; M17-06 requires media license/manifests and M17-07 requires unpublished drafts to remain private. All M17-01…07 rows remain open in TODO, so this specification authorizes no public Story release. |

Withdrawal, correction, takedown, and appeal behavior stays with M18-04; immutable revision manifests and the current-version pointer stay with M18-03. Neither should invent an alternate approval path. Where the accepted policy does not yet define a record or operation, fail closed and leave the item unpublished until the owning task implements it. Raw source bytes and private witness material stay outside public Git.

## Evidence and verification

- Positive gate evidence: `pnpm --filter @moonwitness/radio exec tsx --test test/mizan.test.ts test/corpus-reader.test.ts` — exit 0, 13 passed, 0 failed. M14-07 demonstrates the fully reviewed, exact-SHA, counterevidence-resolved, MIZAN-bound, paired-pilot case can be **eligible for later governance review** while publication stays false; the same suite also verifies a cleared source edition can be read through its allowed projection.
- Negative gate evidence: the same command verifies an incomplete review remains ineligible with `COUNTEREVIDENCE_MISSING` and `PILOT_NEEDS_TWO_INDEPENDENT_ANNOTATIONS`; it also verifies rights-unknown editions and translations expose no text bytes. The M14 endpoint reports `publicationAvailable: false` in both cases.
- Prerequisite evidence: `pnpm --filter @moonwitness/radio exec tsx --test test/mizan.test.ts test/corpus-ingestion.test.ts` — exit 0, 9 passed, 0 failed, including M07-07 idempotent ingestion and rights-status capture plus M14-07 release-criteria coverage. Public byte withholding is verified by the M08-05 cases in the primary command above.
- `git diff --check -- docs/audit/M18-01-single-publication-state-machine.md` — pending final diff review.

## Security, rights, and limitations

This artifact derives the common workflow and vetoes from accepted ADR-0003, ratified M03-06, and existing Corpus/Research behavior; it does not grant rights, infer consent, expose any real source, or declare fictional Story material licensed. Existing Research reviews are administrator-only, and their `eligible` result is not a publication authorization. D08 publication enforcement, D06 consent storage, Story media manifests, and Story's M17 release acceptance remain unimplemented/open; no integration or production publication is claimed.

**Rollback:** remove this specification file. It changes no runtime behavior or stored data.

**Result SHA:** pending integrator integration/review. **Next eligible:** M18-02 and M18-03 should implement this gate's evidence storage and immutable release boundary; M19-19 must remain blocked until M18-01 is reviewed and closed and D08's approved projection exists.
