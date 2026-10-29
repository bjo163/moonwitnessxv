# M31-01 — Brand hierarchy and public domain purpose (proposal)

> **Superseded in part by [ADR-0016](../decisions/ADR-0016-public-domain-map.md) (accepted 2026-10-29).** The owner assigned `a-l-l-a-h.com` to `apps/empire-web` (the static pilot) and `moonwitness.biz.id` to Dock, with an explicit access tier per hostname. The proposal below stays as the rationale of record for the LIGHTHOUSE-outside-this-decision question; where it says `a-l-l-a-h.com` is the address of LIGHTHOUSE inside Dock, ADR-0016 supersedes it. Dock remains the canonical LIGHTHOUSE runtime (ADR-0011).

**State: proposed, pending owner review.** This document records a bounded proposal for M31-01. It is not an accepted decision, launch announcement, domain claim, or final marketing copy. TODO remains the task-status authority; M31-01 is still open until its owner reviews evidence and the integrator records any status change.

## Evidence reviewed

- `TODO.md` M31: milestone is **PLANNED**, with LIGHTHOUSE described as an Empire public gateway; M31-01 is an open leaf dependent on M19-10 and M19-11.
- `TODO.md` M19-10 and M19-11, and their audit reports: Indonesian/English Dock landing content is bilingual, preserves approved mission framing, voluntary participation, avoids invented metrics and unsupported live-AI claims, and labels planned concepts. These audits do not establish a public domain deployment.
- `BLUEPRINT.md` §2A.1: LIGHTHOUSE is a proposed landing experience within Dock and a gateway purpose for `a-l-l-a-h.com`; domain, DNS and TLS are unverified. Dock (`apps/dock`) is the existing public source-first reading/discovery runtime. The Blueprint describes the first release slice as a truthful bilingual landing with Empire context, existing/pilot/planned labels, voluntary participation, and README/contact/privacy/source links.
- `BLUEPRINT.md` §2A: present app/runtime ownership and status labels are explicit; directory presence does not certify production.
- `MASTER_DESIGN.md`: owns shared UI semantics; this proposal leaves UI behavior and visual design to later tasks.
- `docs/decisions/ADR-0004-empire-application-boundaries.md`: LIGHTHOUSE stays within Dock initially; accepting a frontend boundary does not imply shipment or grant another domain/data/identity owner. (The ADR's approved ORBIT boundary does not approve LIGHTHOUSE deployment.)
- `apps/dock/src/app/page.tsx` at baseline: Dock's current home page loads `homePayload()` and renders radio/discovery content, with an offline fallback. This is evidence of the present Dock runtime/page, not evidence of a LIGHTHOUSE page or any `a-l-l-a-h.com` configuration. The source file was inspected, not edited.

## Proposed hierarchy and purpose

1. **MoonWitness XV** — the umbrella program and repository-level ecosystem name. It describes the program, not a promise that every named surface is shipped or available.
2. **LIGHTHOUSE** — proposed public gateway experience for introducing the MoonWitness XV / Empire context and directing visitors to truthful, evidence-backed destinations. Keep it within the existing Dock application unless a later reviewed decision establishes otherwise.
3. **Dock** — the current application and runtime owner (`apps/dock`) for public reading and discovery. Dock is the implementation surface; LIGHTHOUSE is a proposed experience/purpose, not a second app, service, identity, or data owner.
4. **`a-l-l-a-h.com`** — proposed public address for that gateway, subject to owner confirmation and separate domain, DNS, TLS, deployment, and operational verification. No ownership or control is established by repository text.

The proposed visitor-facing purpose is a bilingual (`id`/`en`) landing that truthfully introduces the program and Empire context; distinguishes existing capabilities from pilots and planned concepts; invites voluntary participation without pressure or implied spiritual mandate; and provides working links to source, README, contact, and privacy information. The actual page content, routes, links, metadata, and deployment remain unverified here and belong to later scoped work/review.

## Guardrails and rejected interpretations

- Do not call LIGHTHOUSE launched, live, deployed, or available based on this proposal or repository files.
- Do not claim MoonWitness XV owns or controls `a-l-l-a-h.com`; do not infer registrar, DNS, certificate, hosting, or deployment state.
- Do not present planned Empire concepts as existing products, imply that all Empire systems operate, or invent metrics, users, capabilities, or readiness.
- Do not imply divine authorization, guaranteed outcomes, required participation, or an obligation to join. Participation remains voluntary.
- Do not treat LIGHTHOUSE as a new standalone app, second Dock, backend, identity provider, data owner, or publishing authority absent a separately reviewed decision.
- Do not treat Dock's current radio/discovery homepage or its conditional live-data rendering as proof that the proposed gateway experience exists.

## Verification boundary

Domain registration/ownership, DNS records, TLS certificate, hosting, deployment, production route behavior, and working destination links were not checked and are **unverified**. The proposal cannot support a launch or domain-ownership claim. No task-specific runnable test exists for a document-only proposal; no tests or application scripts were run. This is a research/design artifact only, pending owner review and the packet's positive/negative evidence requirements.

## Owner review and acceptance

**Review question:** Does the owner accept this hierarchy and the proposed purpose of `a-l-l-a-h.com` as a bilingual, truthful MoonWitness XV / Empire gateway experience within Dock, subject to the stated voluntary-participation, status-labeling, and verification limits?

- [ ] Accept as written
- [ ] Accept with edits recorded below
- [ ] Reject; return for revision

Owner: ____________________  Date: __________  Exact reviewed SHA: ____________________

Edits / rationale / evidence required before any public-domain or launch claim:

____________________________________________________________________________

____________________________________________________________________________
