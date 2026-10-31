# ADR-0019 — Withdraw the ISP & Network Operations vertical (D20)

**Status: ACCEPTED — owner instruction, 31 October 2026.** This supersedes [ADR-0018](ADR-0018-isp-network-operations.md). It records a removal decision; it is not implementation, production or deployment evidence.

## Context

ADR-0018 accepted D20 as an XV domain and authorised a Go RADIUS runtime plus a private operator console. The vertical was subsequently implemented as `packages/moonql-isp` (15 models, tenant-scoped endpoints), `apps/isp-radius` (RADIUS/RadSec protocol runtime) and `apps/isp-console` (private Next.js operator surface), under milestone M51.

The owner reviewed the result on 31 October 2026 and concluded that the ISP/network vertical does not belong to this system's scope. The requirement it serves — subscriber, RADIUS and PPPoE operations for an external ISP product — has no consumer inside XV: no public surface, no reviewer workflow, and no reference from the Signal, Source, Research, Story or Journey domains. Two M51 leaves (`M51-05` billing integration, `M51-08` runtime/CI/recovery proof) were never closed, so the vertical was never a shippable capability.

This is the failure mode the repository already names elsewhere: a surface maintained ahead of any consumer. Removing it is consistent with the rule that a workspace earns `apps/<name>` only when it owns a distinct deployment boundary, a distinct runtime, and users that exist today.

## Decision

1. **Withdraw D20 from XV.** The domain, its models, its endpoints and its two applications are removed.
2. Remove `apps/isp-radius`, `apps/isp-console`, `packages/moonql-isp`, the `isp` MoonQL addon registration, the `isp-alerts` ARSY module and library, and the M51 governance scripts and planning tests.
3. **ADR-0018 is SUPERSEDED, not deleted.** Its body remains the record of what was accepted on 30 October 2026. `docs/milestones/M51.md`, the eight `docs/tasks/M51/*` packets and `docs/architecture/ISP_NETWORK.md` are retained with an explicit withdrawal banner.
4. **No replacement owner is created.** Withdrawing a domain does not transfer its tables, routes or identity to another package. ARSY remains the only Hub and MoonQL remains the only SQL owner besides `@moonwitness/skylink-store`.
5. **No automatic data destruction.** Removing an addon does not drop tables. MoonQL auto-sync is additive by construction (`packages/moonql/src/sync.ts`: `CREATE TABLE` and `ADD COLUMN` only, never `DROP` or type alteration).
6. MWX-ISP remains a separate owned product outside XV. This decision does not change that repository.

## Consequences

- The workspace set drops from 13 apps / 36 packages to 11 apps / 35 packages. Remaining apps: `arsy`, `dock`, `headquarters`, `cockpit`, `aigateway`, `sentinel`, `skylink`, `echolog`, `orbit`, `empire-web`, `lumen-runtime`.
- Ports 3008 and 3009 are retired. Compose drops from 11 services to 10.
- In any existing database, the 15 `isp_*` tables and their rows remain, orphaned and unread. They are no longer described by any published schema, so nothing lists, reads or writes them.
- The published `_schema` loses 15 models and the `/isp/**` and `/isp-radius/**` endpoints. `packages/moonql-client/src/generated.ts` must be regenerated; Headquarters' schema-driven sidebar loses the ISP group without a page change.
- Radius password hashing/verification helpers and the fake-NAS protocol tests no longer exist. No code with those properties remains, so ADR-0018's acceptance conditions are void rather than satisfied — they must never be cited as completed evidence.
- `TODO.md` M51 keeps all eight rows and their original checkboxes. Checked rows retain their pinned SHAs; `M51-05` and `M51-08` stay unchecked. The milestone header records the withdrawal so no task in it is started.
- **31 October 2026 (later in the same release):** the Cockpit moved to `tools/cockpit` and the ORBIT Compose service was removed, so the shipped tree is 10 app workspaces under `apps/` plus `tools/cockpit`, 35 packages, and 9 Compose services. The counts in this section describe this ADR's own step, not the final tree.

## Verification

- `pnpm apps` lists 11 apps and no `isp-*` entry.
- `pnpm verify` passes (build, `ui:check`, lint, `gen:sdk:check`, tests, `build:web`).
- `docker compose config` parses with 10 services.
- A residual-reference scan finds `isp-console` / `isp-radius` / `moonql-isp` only under `docs/**` and `CHANGELOG.md`.

## Appendix — orphaned tables (non-normative)

Existing databases may still contain, with their rows intact:

`isp_tenants`, `isp_operator_grants`, `isp_service_grants`, `isp_radius_users`, `isp_radius_profiles`, `isp_nas`, `isp_network_nodes`, `isp_access_bindings`, `isp_sessions`, `isp_session_actions`, `isp_accounting_events`, `isp_monitor_targets`, `isp_incidents`, `isp_syslog_events`, `isp_ipam_pools`.

Dropping them is a separate, owner-approved operational act. No script in this repository performs it, and nothing in the application depends on the tables being present or absent. Any such operation must be preceded by `scripts/db-backup.sh` and a verified restore, exactly like every other destructive schema change.
