# M46-15 package ownership inventory

Derived by `scripts/check-m46-15-package-ownership.mjs` from each workspace manifest and the first
authoritative document that states an ownership relation about it. Not a second owner registry:
the linked document stays the authority, and `UNKNOWN` is reported instead of a guess.

| workspace | package | owner / boundary document | dependency direction (internal workspaces) |
| --- | --- | --- | --- |
| packages/cli | @moonwitness/cli | `docs/architecture/APPS.md` · architecture contract | packages/core, packages/types |
| packages/core | @moonwitness/core | `docs/decisions/ADR-0006-skylink-communication-surface.md` · accepted ADR | — |
| packages/denpa | @moonwitness/denpa | `docs/decisions/M02-02-domain-assignments.md` · accepted ADR | packages/core |
| packages/echolog-core | @moonwitness/echolog-core | `docs/decisions/M02-02-domain-assignments.md` · accepted ADR | — |
| packages/eslint-config | @moonwitness/eslint-config | UNKNOWN | — |
| packages/governance | @moonwitness/governance | `docs/architecture/ORBIT.md` · architecture contract | — |
| packages/lumen | @moonwitness/lumen | `docs/architecture/APPS.md` · architecture contract | — |
| packages/moonql | @moonwitness/moonql | `docs/architecture/ECHOLOG.md` · architecture contract | packages/core |
| packages/moonql-actors | @moonwitness/moonql-actors | UNKNOWN | packages/core, packages/moonql |
| packages/moonql-apikeys | @moonwitness/moonql-apikeys | `docs/decisions/M02-02-domain-assignments.md` · accepted ADR | packages/core, packages/moonql, packages/moonql-auth |
| packages/moonql-auth | @moonwitness/moonql-auth | `docs/decisions/M02-02-domain-assignments.md` · accepted ADR | packages/core, packages/moonql |
| packages/moonql-base | @moonwitness/moonql-base | UNKNOWN | packages/moonql |
| packages/moonql-client | @moonwitness/moonql-client | `docs/decisions/M34-02-moonlab-hq-desk-decision.md` · accepted ADR | packages/core |
| packages/moonql-corpus | @moonwitness/moonql-corpus | `docs/decisions/M20-02-role-scoped-review-queue.md` · accepted ADR | packages/core, packages/moonql |
| packages/moonql-graph | @moonwitness/moonql-graph | UNKNOWN | packages/core, packages/moonql, packages/moonql-ontology |
| packages/moonql-journey | @moonwitness/moonql-journey | UNKNOWN | packages/core, packages/moonql |
| packages/moonql-monitor | @moonwitness/moonql-monitor | `docs/decisions/M20-02-role-scoped-review-queue.md` · accepted ADR | packages/core, packages/moonql |
| packages/moonql-ontology | @moonwitness/moonql-ontology | UNKNOWN | packages/core, packages/moonql |
| packages/moonql-ops | @moonwitness/moonql-ops | `docs/decisions/M02-02-domain-assignments.md` · accepted ADR | packages/core, packages/moonql |
| packages/moonql-playlog | @moonwitness/moonql-playlog | `docs/decisions/M02-02-domain-assignments.md` · accepted ADR | packages/core, packages/moonql |
| packages/moonql-research | @moonwitness/moonql-research | `docs/decisions/M20-02-role-scoped-review-queue.md` · accepted ADR | packages/core, packages/moonql |
| packages/moonql-schedule | @moonwitness/moonql-schedule | `docs/decisions/M02-02-domain-assignments.md` · accepted ADR | packages/core, packages/moonql |
| packages/moonql-settings | @moonwitness/moonql-settings | UNKNOWN | packages/moonql |
| packages/moonql-stations | @moonwitness/moonql-stations | `docs/decisions/M02-02-domain-assignments.md` · accepted ADR | packages/core, packages/moonql |
| packages/moonql-unilex | @moonwitness/moonql-unilex | `docs/planning/PACKAGE_OWNER_ONBOARDING.md` · planning contract | packages/core, packages/moonql |
| packages/moonql-witness | @moonwitness/witness | `docs/decisions/M02-02-domain-assignments.md` · accepted ADR | packages/core, packages/moonql, packages/moonql-auth, packages/moonql-base |
| packages/moonui | @moonwitness/moonui | `docs/decisions/ADR-0014-moonui-skin-contract.md` · accepted ADR | packages/core |
| packages/review-grants | @moonwitness/review-grants | `docs/planning/PACKAGE_OWNER_ONBOARDING.md` · planning contract | — |
| packages/skylink-core | @moonwitness/skylink-core | UNKNOWN | — |
| packages/skylink-store | @moonwitness/skylink-store | `docs/architecture/ECHOLOG.md` · architecture contract | — |
| packages/skylink-telegram | @moonwitness/skylink-telegram | UNKNOWN | packages/skylink-core, packages/skylink-store |
| packages/skylink-whatsapp | @moonwitness/skylink-whatsapp | UNKNOWN | — |
| packages/testing | @moonwitness/testing | UNKNOWN | packages/core, packages/types |
| packages/types | @moonwitness/types | `docs/decisions/M20-02-role-scoped-review-queue.md` · accepted ADR | — |
| packages/web-config | @moonwitness/web-config | `docs/decisions/M34-02-moonlab-hq-desk-decision.md` · accepted ADR | packages/core |
| apps/aigateway | @moonwitness/aigateway | `docs/architecture/SECURITY.md` · architecture contract | packages/core |
| apps/arsy | @moonwitness/arsy | `docs/architecture/APPS.md` · architecture contract | apps/aigateway, packages/cli, packages/core, packages/denpa, packages/moonql, packages/moonql-actors, packages/moonql-apikeys, packages/moonql-auth, packages/moonql-base, packages/moonql-client, packages/moonql-corpus, packages/moonql-graph, packages/moonql-journey, packages/moonql-monitor, packages/moonql-ontology, packages/moonql-ops, packages/moonql-playlog, packages/moonql-research, packages/moonql-schedule, packages/moonql-settings, packages/moonql-stations, packages/moonql-unilex, packages/moonui, apps/sentinel, packages/skylink-whatsapp, packages/testing, packages/moonql-witness |
| apps/cockpit | @moonwitness/cockpit | `docs/architecture/SECURITY.md` · architecture contract | packages/core, packages/moonql-client, packages/moonui |
| apps/dock | @moonwitness/dock | `docs/decisions/ADR-0011-lighthouse-dock-runtime.md` · accepted ADR | packages/core, packages/moonql-client, packages/moonui, packages/web-config |
| apps/echolog | @moonwitness/echolog | `docs/architecture/APPS.md` · architecture contract | packages/echolog-core, packages/moonql, packages/moonql-auth, packages/moonui |
| apps/empire-web | @moonwitness/empire-web | `docs/architecture/APPS.md` · architecture contract | packages/moonui |
| apps/headquarters | @moonwitness/headquarters | `docs/decisions/M02-01-disambiguation-registry.md` · accepted ADR | packages/core, packages/moonql-client, packages/moonui, packages/web-config |
| apps/lumen-runtime | @moonwitness/lumen-runtime | `docs/architecture/APPS.md` · architecture contract | packages/lumen |
| apps/orbit | @moonwitness/orbit | `docs/architecture/APPS.md` · architecture contract | packages/core, packages/moonql-client, packages/moonui, packages/web-config |
| apps/sentinel | @moonwitness/sentinel | UNKNOWN | packages/core, packages/moonql-client |
| apps/skylink | @moonwitness/skylink | `docs/architecture/APPS.md` · architecture contract | packages/moonql, packages/moonql-auth, packages/moonui, packages/skylink-core, packages/skylink-store, packages/skylink-telegram |

## Exceptions: workspaces with no documented owner

- `packages/eslint-config` (`@moonwitness/eslint-config`) — no authoritative document states an ownership relation for it.
- `packages/moonql-actors` (`@moonwitness/moonql-actors`) — no authoritative document states an ownership relation for it.
- `packages/moonql-base` (`@moonwitness/moonql-base`) — no authoritative document states an ownership relation for it.
- `packages/moonql-graph` (`@moonwitness/moonql-graph`) — no authoritative document states an ownership relation for it.
- `packages/moonql-journey` (`@moonwitness/moonql-journey`) — no authoritative document states an ownership relation for it.
- `packages/moonql-ontology` (`@moonwitness/moonql-ontology`) — no authoritative document states an ownership relation for it.
- `packages/moonql-settings` (`@moonwitness/moonql-settings`) — no authoritative document states an ownership relation for it.
- `packages/skylink-core` (`@moonwitness/skylink-core`) — no authoritative document states an ownership relation for it.
- `packages/skylink-telegram` (`@moonwitness/skylink-telegram`) — no authoritative document states an ownership relation for it.
- `packages/skylink-whatsapp` (`@moonwitness/skylink-whatsapp`) — no authoritative document states an ownership relation for it.
- `packages/testing` (`@moonwitness/testing`) — no authoritative document states an ownership relation for it.
- `apps/sentinel` (`@moonwitness/sentinel`) — no authoritative document states an ownership relation for it.
