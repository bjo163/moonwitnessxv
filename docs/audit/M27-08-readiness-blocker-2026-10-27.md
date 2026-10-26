# M27-08 preview manifest readiness check

**Checked source SHA:** `62ff7e97bf64eeba1289ff6e7fa80a4e054f9283`
**Date:** 2026-10-27 · **Reviewer:** root integrator

## Result

M27-08 remains **blocked by M19-19** in the release ordering (T5). M19-08 and M05-09 are closed, but the Research projection still lacks an approved D08 public view. M19-19 keeps the public Research route fail-closed with a withholding notice. Do not freeze a preview manifest until this predecessor is satisfied; any eventual manifest must explicitly exclude or withhold Research, private witness material, and other unapproved content.

The current candidate tree is also not a frozen release SHA: M38/M39 implementation work is continuing. When M19-19 closes, M27-08 must create a committed manifest/runbook with a precise candidate SHA, an included-route list, excluded feature list, and positive/negative checks. The checked-out documentation had no `docs/tasks/M27/M27-08.md` packet and no dedicated preview manifest/runbook; the existing restore runbook covers database recovery, while [RELEASE.md](../architecture/RELEASE.md) only defines release evidence states.

The README's former statement that Dock has no end-to-end bilingual route evidence contradicted the closed M19-09..18 evidence, so it now distinguishes those route checks from still-unverified Docker/Compose readiness and publication. This correction does not claim a public deployment.

## Evidence inspected

- [TODO M27-08 and T5](../../TODO.md): the release path places M19-19 before M27-08; the M27-08 row now names M19-19 as a prerequisite.
- [M19-19 withholding audit](M19-19-research-public-withholding.md): no approved D08 public projection is available; Research remains withheld.
- M19-08 and M05-09 are checked with their evidence links in `TODO.md`.
- [M27 milestone context](../milestones/M27.md): entry requires prerequisites and rights/security decisions; exit requires exact-SHA tests and human review.
- [Release evidence contract](../architecture/RELEASE.md): build, deployment readiness, verified deployment, and human release acceptance are distinct states.

No deployment, publication, or external write was attempted. Resume M27-08 only after M19-19 is satisfied and the candidate SHA is clean and immutable.
