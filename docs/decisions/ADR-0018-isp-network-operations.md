# ADR-0018 — ISP & Network Operations in MoonWitness XV

**Status: ACCEPTED — owner authorization by the explicit implementation request, 30 October 2026.** This records an architecture decision; it is not implementation, production or deployment evidence.

## Context

The Master Vision lists ISP subscriber, RADIUS and PPPoE capability as engineering heritage, not as an automatic XV import. The user has authorized adapting the owned MWX-ISP product into XV. MWX-ISP is a Go application with its own database and administration UI. XV uses ARSY/MoonQL as its canonical business-data owner and has no D20 entry yet.

Source code baseline: `Z:\project\mwx-isp` at `ab8a512b468c4a9b979418f8b05720a58651ebfe`. The source worktree contains uncommitted RADIUS EAP/TEAP changes; they are excluded from this decision and any initial port.

## Decision

1. Add **D20 ISP & Network Operations**, persisted through ARSY/MoonQL in the existing Postgres instance. D20 is not a third SQL owner or a second Hub.
2. D20 owns ISP/RT-RW Net organizations and tenant scope, RADIUS identities/profiles, NAS and network-node records, subscription-to-access bindings, RADIUS accounting/session state, IPAM/ODP references, registered-target health observations, incidents and syslog records.
3. D00 owns human and machine principals, sessions, roles and tenant-scoped grants. D15 owns ISP customers, commercial packages, subscriptions and invoices. D16 owns manual payment records and finance reconciliation. D20 references D15/D16 IDs and does not copy their customer, invoice or payment records. This mapping accepts only the ISP vertical; broader WORKS commerce, legal-merchant, gateway and real-money release decisions remain under M35.
4. Add `packages/moonql-isp` for D20 models and typed internal endpoints, and `apps/isp-radius` as a Go protocol runtime. The Go runtime handles RADIUS/RadSec, EAP/vendor protocol behavior and CoA/Disconnect transport; it has no SQL driver, durable business store, user login or generic REST model API. All durable state and access decisions are made by ARSY.
5. The runtime calls scoped ARSY endpoints under `/api/v1/isp-radius/*` using a D00 service credential with the single `isp-radius` role. Operator routes use D00 session authorization and a tenant-scoped grant. No service credential or NAS shared secret is returned to a browser.
6. Persist only NAS secret references in D20. `apps/isp-radius` reads the corresponding secret from a mounted secret directory; rotation, missing-secret and stale-reference states fail closed and never log secret values. The secret directory is operator-managed in this phase.
7. Add `apps/isp-console`, a private Next.js operator surface that uses server-side BFF calls to ARSY, MoonUI, the Empire skin and `id`/`en`. Do not add operator links or ISP data to public Dock. Describe the service in Empire WORKS as practical connectivity operations; it is not a fictional Story Universe record or a claim of live service.
8. D20 emits operator-notification requests through SKYLINK after its existing M38 integration gate. Do not add a second WhatsApp provider client.

## Runtime and data behavior

- Authentication: ARSY resolves the NAS, tenant, subscription state, RADIUS profile and policy; the Go runtime only translates the decision to a protocol response. If ARSY is unavailable, deny new authentication.
- Accounting: ARSY acknowledges an accounting packet only after idempotent durable storage; otherwise the runtime does not acknowledge it so the NAS can retry.
- Suspension and session actions: the business decision and audit record are persisted before CoA/Disconnect is sent. Manual suspension is never undone by payment automation. ACK, NAK, timeout and retry remain visible.
- Monitoring is limited to explicitly registered and authorized targets and is read-only. No scanning or device configuration writes.
- Payment entry is manual; no online gateway, custody, public customer portal or captive-portal onboarding is added.

## Consequences and gates

- The RADIUS packet pipeline and vendor behavior may be adapted from the pinned Go source. Go database repositories, GORM models, source admin API and React Admin/MUI UI are not copied as XV owners. Their accepted feature behavior is mapped to D00/D15/D16/D20 and MoonUI.
- Additive MoonQL schema/API changes require focused migration and tenant-isolation evidence. Existing public APIs and the D09 Signal domain remain unchanged.
- D15/D16 operational billing must pass M35's applicable commercial/finance gates before real transactions or public claims. Cross-app session, locale and tenant grants use the M37 contract. Real notification delivery waits for M38. A real NAS pilot requires a separate operator go/no-go and recovery proof.
- A rollback disables the RADIUS runtime and operator app, leaves canonical XV records intact, and restores no copied database. No source customer data, environment file, credential or production NAS secret is migrated.

## Acceptance conditions

The implementation milestone must map every accepted MWX-ISP feature ID to one XV owner; prove positive and negative tenant/API behavior; exercise a fake NAS for authentication, accounting and session actions; verify billing idempotency and manual-suspension precedence; build the Go runtime and both XV apps; and demonstrate rollback and backup/restore before a real NAS pilot.
