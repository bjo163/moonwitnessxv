# M31-01 — Brand hierarchy and public domain purpose proposal

**Status: PROPOSED — not owner-ratified.** This artifact records a recommendation for review. It does not approve a domain, brand change, public route, deployment, rights status, or production claim.

## Evidence reviewed

- `README.md` § “Ecosystem direction” describes Empire of the Light / `a-l-l-a-h.com` as a planned LIGHTHOUSE experience that initially reuses Dock. It explicitly says the ecosystem is planned, not deployed.
- `BLUEPRINT.md` §2A.1 assigns the proposed LIGHTHOUSE experience to `apps/dock` and describes its purpose as a gateway for `a-l-l-a-h.com`; the same row says domain ownership, DNS, and TLS are unverified. §2A says Lighthouse reuses Dock until a reviewed decision.
- Accepted [ADR-0004](../decisions/ADR-0004-empire-surfaces.md) says LIGHTHOUSE stays within Dock initially and that proposed spaces receive no independent owner, schema, or deployment by default. This accepts an architectural boundary, not a LIGHTHOUSE brand or public launch.
- The [Master Vision Narrative](../vision/MASTER_VISION_NARRATIVE_XV.md) presents A-L-L-A-H / Empire of the Light as project vision and labels itself a public-safe synthesis, not an approved religious canon, system ADR, or production report.
- `MASTER_DESIGN.md` does not define a LIGHTHOUSE/domain brand hierarchy.
- `TODO.md` records M19-10 and M19-11 as closed. The present Dock landing page is branded `MOONWITNESS`; source search found no `LIGHTHOUSE` or `a-l-l-a-h.com` identifier in `apps/dock/src`.

## Recommendation for owner decision

1. **Repository/program umbrella:** MoonWitness XV remains the name of the software program and repository.
2. **Project vision:** A-L-L-A-H / Empire of the Light remains a narrative vision label. It does not claim religious authority, approval of source material, or a shipped product.
3. **Public experience:** LIGHTHOUSE is the proposed public gateway experience, initially implemented within the existing Dock application. Dock remains its technical runtime and public source-first reading surface; no separate LIGHTHOUSE app, backend, identity owner, or database is implied.
4. **Domain purpose:** if the owner confirms the plan and verifies control and DNS/TLS, `a-l-l-a-h.com` would be the public entry point for LIGHTHOUSE's reviewed public content. It must not expose Headquarters, ARSY, private witness material, unreviewed research, or content without the required release/rights gate. The repository currently proves none of the domain ownership, DNS, TLS, or publication conditions.

The recommendation is consistent with the current planning documents, but it is not yet a decision. The owner must confirm or revise the relationship between the A-L-L-A-H / Empire of the Light vision, the LIGHTHOUSE experience, Dock as its runtime, and the intended use of `a-l-l-a-h.com` before this task can be marked decided.

## Acceptance checks performed

- **Positive evidence:** local document review found the proposed LIGHTHOUSE → Dock → `a-l-l-a-h.com` relationship in README, BLUEPRINT and ADR-0004, while preserving each source's planning/acceptance qualification. M19-10 and M19-11 are checked in TODO as the prerequisites.
- **Negative evidence:** `rg -n -i "lighthouse|a-l-l-a-h.com" apps/dock/src` returned no matches. The actual landing page currently says `MOONWITNESS`, so the proposal does not claim LIGHTHOUSE branding, domain routing, or deployment exists.
- No source code, route, URL, DNS setting, or brand text was changed. No application test or deployment was run; this is a decision proposal only.

## Owner ratification prompt

Choose whether to:

- **A — Confirm the recommendation:** MoonWitness XV is the program; A-L-L-A-H / Empire of the Light is the vision; LIGHTHOUSE is the public gateway within Dock; `a-l-l-a-h.com` is its intended entry point after separate ownership and release checks; or
- **B — Revise it:** provide the desired hierarchy and public purpose for the domain.

Until that decision is recorded, keep M31-01 open and treat all names/domain purpose above as proposed.
