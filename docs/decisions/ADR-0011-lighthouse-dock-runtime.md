# ADR-0011 — LIGHTHOUSE runs inside Dock; no extra frontend

**Status: ACCEPTED — owner ratification 2026-10-28** (recorded in [M31-01](../audit/M31-01-brand-hierarchy-proposal.md), option A). This decision fixes the runtime boundary of the public LIGHTHOUSE gateway. It does not create a brand, domain, route, deployment, rights clearance or religious authority.

## Context

The owner ratified the hierarchy: MoonWitness XV is the program, A-L-L-A-H / Empire of the Light is the narrative vision, LIGHTHOUSE is the public gateway experience, and `a-l-l-a-h.com` is its intended entry point after separate ownership, DNS/TLS and release checks. [ADR-0004](ADR-0004-empire-surfaces.md) §6 already states that LIGHTHOUSE stays within Dock initially and gains no independent owner, schema or deployment. [M31-02](../design/M31-02-gateway-journeys.md) inventoried the gateway journeys against Dock at baseline `a54198b`.

M31-03 is the decision leaf that had to choose between reusing Dock and building an additional frontend before copy (M31-04) or tests (M31-05) could be written.

## Decision

1. **Dock is the LIGHTHOUSE runtime.** The gateway is delivered inside the existing `apps/dock` Next.js application, using its routing, locale middleware, design system and chrome. No `apps/lighthouse` workspace, second Next.js app, second API, second database, identity store or deployment artifact is created for LIGHTHOUSE.
2. **The gateway may remove, never widen.** A scoped preview may exclude surfaces from the public entry experience. It may not add Headquarters/100CENTER, Cockpit, ORBIT, SKYLINK, ECHOLOG or ARSY/D00 identity routes, and it may not replace a rights-denial notice with placeholder prose that implies withheld data exists.
3. **Existing deployment stays authoritative.** The `dock` service in `docker-compose.yml` (`Dockerfile.web`, `APP=dock`, port 3001) remains the one public web deployment path. LIGHTHOUSE does not add a Compose service or port.
4. **Copy and metadata are a later leaf.** M31-04 owns `id`/`en` gateway copy and metadata, including whether a LIGHTHOUSE label sits beside the current `MOONWITNESS` heading. M31-05 owns the executable link, permission and offline-fallback tests.
5. **Separation is revisited only by a new ADR.** If a future requirement genuinely cannot be met inside Dock, it needs its own decision with identity, deployment, cost and rollback review — not an implicit split.

## Options considered

| Option | Decision | Reason |
|---|---|---|
| Reuse `apps/dock` as the LIGHTHOUSE runtime | **Accepted** | Already owns the public routes, locale negotiation, accessible chrome and a deployment artifact; ADR-0004 §6 and the owner ratification point here; no new authority is introduced. |
| Add a separate LIGHTHOUSE frontend app | Rejected | Duplicates public routing and deployment while adding a second surface to secure, localize and release; no accepted decision requires it. |
| Put the gateway in Headquarters | Rejected | Couples public discovery to the privileged human-governance surface that ADR-0004 §1 keeps restricted. |
| New backend/API/database for the gateway | Rejected | Duplicates ARSY/MoonQL authority and creates a second SQL owner. |

## Constraints and acceptance gates

- **Route facts, not promises.** Any `AVAILABLE` gateway surface must resolve to an existing `apps/dock/src/app/**/page.tsx`; unimplemented surfaces stay non-navigable `PLANNED` statements, as fixed by [M31-02](../design/M31-02-gateway-journeys.md) §4 and [ADR-0009](ADR-0009-public-ui-reference-adoption.md).
- **Locale parity.** Both `/id` and `/en` continue to resolve through the existing middleware rewrite; no locale-specific gateway fork.
- **Privacy.** No link, embed, proxy or description may expose Headquarters, Cockpit, ARSY, SKYLINK, ECHOLOG, private witness material or unreviewed research. The structural check is `scripts/check-m31-03-dock-reuse.mjs`.
- **Rights.** A withheld research or comparative-reader route keeps its denial notice; gateway work may not weaken it.
- **No liveness invention.** No `LIVE` badge, count or domain claim without evidence; `a-l-l-a-h.com` remains planned until DNS/TLS and release gates are verified separately.
- **Verification.** Acceptance is structural evidence at an exact SHA plus focused tests. It is not a browser, Lighthouse, screenshot or deployment result.

## Consequences

- M31-04 and M31-05 work in `apps/dock` and its tests; they must not create a new workspace.
- The gateway inherits Dock's existing limitations, including the duplicate 15-item navigation tracked by M19-03 and the absence of global search.
- A future extra frontend would require a superseding ADR and would not reuse this decision.

**Evidence:** [M31-03 audit](../audit/M31-03-dock-reuse.md) · **Ratification:** [M31-01](../audit/M31-01-brand-hierarchy-proposal.md) · **Journeys:** [M31-02](../design/M31-02-gateway-journeys.md)
