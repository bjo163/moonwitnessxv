# ADR-0006 — SKYLINK: standalone multi-channel communication surface
**Status: PROPOSED, owner ratification required.** This ADR does not authorize implementation, new schemas, deployment, or TODO status changes on its own. It records a decision for ratification and the conditions under which it may be built.

## Decision

**SKYLINK is a standalone communication service, not a Hub module and not a second Hub.**

- **Name:** `SKYLINK` — from the existing local registry [`empireofthelight/data/organization/wings10.json`](file:///z:/project/empireofthelight/data/organization/wings10.json) `W01 | SKYLINK | team: SIGNAL COURIERS | area: Transmission & Knowledge | primaryPillar: TRUTH_GUIDANCE | proposedLeadPersonaSlot: GOD-049`. Registry status is `PROPOSED_NOT_ASSIGNED` and `authorityLimit: NO_SUPERNATURAL_OR_DIVINE_AUTHORITY`; SKYLINK is a human operations identity and never a religious, angelic or access authority.
- **Slot resolution:** the Empire V5 horizon registry entry `id: "phonny"`, `type: "communication-surface"`, `projectStatus: "NAME_UNCONFIRMED"`, `dependency: "confirm product name and access scope"` is **resolved by this ADR to SKYLINK**. `PHONNY` is not adopted as a product name because it reads as "phony" in English, which conflicts with the Prime Code truth discipline. Marking that registry entry resolved is a separate owner edit in the Empire repository.
- **Domain:** a new **D18 Messages & Channels** domain. Messaging records belong to D18 and are owned by SKYLINK alone. D09 Signal keeps stations, schedules, playlogs and DENPA and **must not regress**; `channels` semantics move to D18 by explicit migration, not by duplication.
- **Workspace identity:** `apps/skylink` / `@moonwitness/skylink`, port **3005**, plus provider adapters `@moonwitness/skylink-<provider>`. Public/end-user label follows the existing brand hierarchy: **MOONWITNESS** stays prominent, SKYLINK is the internal and architectural name.
- **Dependency direction:** `other apps → API → SKYLINK → providers`, and `ARSY/SIGNAL → API → SKYLINK`. SKYLINK **never** calls ARSY to deliver a message, and ARSY stops constructing provider clients in-process.

## Boundary and non-authorizations

1. SKYLINK is a bounded service with exactly one domain. It is **not** a second REST Hub: no generic model/catalog REST, no addon registry, no graph database, no second publishing or approval engine.
2. **Identity stays D00/ARSY.** No second login system. The SKYLINK operator UI validates an existing ARSY session; service-to-service calls use a scoped service credential. SKYLINK never issues account sessions and never becomes an identity provider.
3. **One Postgres instance, one owner per schema.** SKYLINK gets a dedicated schema with migrations that only it applies. No new database container. No model is written by two owners.
4. **Credentials never live in the database.** Provider auth material stays in a secret-backed auth directory (the existing compose volume `whatsapp-session` is the intended home). D18 stores a secret reference only.
5. Inbound provider payloads are untrusted input: every webhook is signature/secret verified, and any outbound fetch of provider- or user-supplied URLs goes through the existing `@moonwitness/core` egress guard, with `skylink` added to the deny list.
6. Raw provider payload retention, PII classification, retention window and deletion path must be written in the D18 model contract before any real conversation is stored.

## Providers

| Order | Provider | Transport | Rationale |
|---|---|---|---|
| 1 | **Telegram** | grammY 1.46, Bot API (official) | Proves the abstraction with zero ToS risk |
| 2 | **WhatsApp** | `@whiskeysockets/baileys` **7.0.0-rc14** (current `latest`; repo today pins `legacy` 6.7.24) | Owner-selected. Unofficial protocol: pin the exact version, isolate behind the adapter, document the 6.7.24 rollback, and plan WhatsApp Business Cloud API as the supported path before public release |
| later | Discord, Instagram, Messenger, X | Official bot/webhook APIs | Each needs its own permissions review before a token is issued |

## Consequences

- **Accepted cost:** messaging survives ARSY restarts, and provider churn is contained in one service. This is the only reason to justify a new service rather than a Hub module.
- **Accepted cost:** one more process, one more port, one more compose service, and a real cross-service contract to test.
- **Accepted risk:** Baileys is an unofficial WhatsApp Web client — account bans and ToS exposure remain possible and are the owner's operational risk, not a bug to fix in code.
- **Rejected:** keeping providers in-process inside ARSY (cannot be standalone, keeps provider churn in the Hub); a Next.js BFF that owns sockets (wrong runtime for long-lived connections, and it would become a second backend); storing conversations inside D09 (mixes two owners); a second database container (duplicates operational burden for one domain); adopting `PHONNY` as the shipped name (naming contradiction above).

## Acceptance conditions (all required before implementation starts)

1. Owner ratifies this ADR and registers **D18** with SKYLINK as its sole owner.
2. `TODO.md` gains a new milestone with unchecked rows; historical checkboxes are never rewritten. The integrator writes those rows.
3. M22 (README-proof: Radio must not regress) and M28 (ARSY rename) states are re-checked at the working SHA; the ARSY integration step is scheduled so it does not collide with the rename paths.
4. A feature flag (default **off**) lets ARSY fall back to the current in-process channel until SKYLINK passes its own gates.
5. Rollback is demonstrated: flag off restores today's behaviour with no data loss for messages already recorded in D18.

## Evidence this ADR stands on

`wings10.json` (W01 SKYLINK, `schemaVersion 1.0.0`), `technology-horizons.v5.json` (phonny `communication-surface`, `NAME_UNCONFIRMED`), `docs/decisions/M02-02-domain-assignments.md` (D09 currently owns `channels`), `BLUEPRINT.md` (one owner per domain; no second REST hub/login/graph; D09 must not regress), `docs/audit/M22-04-whatsapp-lifecycle.md` (disabled-by-default, admin-only control plane, credential-ignore remediation), `packages/core/src/workspace.ts` (`PORTS` 3000–3004 used; 3005 free).
