# ISP & Network Operations — D20

**Status:** Accepted boundary under [ADR-0018](../decisions/ADR-0018-isp-network-operations.md); implementation and production use remain gated by M51 evidence.

## Owners

| Data | Canonical owner | Consumers |
|---|---|---|
| User identity, service credentials, roles and tenant grants | D00 / ARSY | ISP console and RADIUS runtime |
| ISP/RT-RW Net organization and network access state | D20 / `@moonwitness/moonql-isp` | ARSY, RADIUS runtime, operator console |
| Customer, commercial package, subscription and invoice | D15 / ARSY | D20 stores stable references and technical access bindings |
| Manual payment and reconciliation record | D16 / ARSY | D20 consumes settled/suspended policy state |
| Message delivery | D18 / SKYLINK | D20 submits notification intent after M38 integration |

One record has one owner. D20 stores no duplicate customer profile, invoice, payment, login or NAS shared secret. Tenant grants reference D20 organization IDs as opaque scope IDs and are enforced by ARSY on every operator read/write and background job.

## API and service boundary

- `packages/moonql-isp` declares D20 models with generic auto-REST disabled for tenant-sensitive records. Custom ARSY endpoints enforce D00 identity, tenant grants, validation and audit.
- Operator-authored D20 records reach the existing ops audit trail. The machine-written telemetry tables (`isp_sessions`, `isp_accounting_events`, `isp_monitor_targets`, `isp_syslog_events`) are themselves the event record and opt out of a second audit row per write.
- `POST /api/v1/isp-radius/nas/resolve` resolves a source NAS and returns only the protocol runtime's minimum tenant/NAS decision and a secret reference; the secret value itself is never returned.
- `POST /api/v1/isp-radius/authorize` returns an allow/deny result and bounded RADIUS reply attributes for one request.
- `POST /api/v1/isp-radius/accounting` records one accounting event idempotently and returns success only after the durable write.
- `GET /api/v1/isp-radius/session-actions?nasId=…` hands the runtime the persisted CoA/Disconnect actions that are still retryable for that NAS, and `POST /api/v1/isp-radius/session-actions` records one ACK/NAK/timeout result against the server-side attempt limit.
- These service routes require the D00 machine role `isp-radius`; they do not accept a browser session as a substitute. Operator routes use D00 session identity plus a tenant-scoped capability grant.
- `apps/isp-radius` binds RADIUS UDP 1812/1813 and RadSec TCP 2083 as configured. It has health/readiness checks but no business REST API or SQL access. It reads NAS secrets from mounted secret files and never logs credentials or raw authentication material.
- `apps/isp-console` calls only its server-side BFF; browser code never receives ARSY or RADIUS service credentials.

## Runtime configuration and protocol boundary

`apps/isp-radius` is configured entirely by environment values that name files and
listeners, never by a value that carries a secret:

| Variable | Meaning | Default |
|---|---|---|
| `ISP_ARSY_URL` | ARSY origin the D20 service routes live under; the adapter appends `/api/v1` when the URL carries no path | required |
| `ISP_ARSY_KEY_FILE` | mounted file holding the D00 service key with the `isp-radius` role | required |
| `ISP_SECRETS_DIR` | mounted directory the NAS shared-secret references resolve inside | required |
| `ISP_RADIUS_AUTH_ADDR` / `ISP_RADIUS_ACCT_ADDR` | UDP 1812/1813 bind addresses; must differ | `127.0.0.1:1812` / `127.0.0.1:1813` |
| `ISP_RADSEC_ADDR` + `ISP_RADSEC_CERT_FILE` / `_KEY_FILE` / `_CA_FILE` | RadSec TCP 2083 and its three mounted TLS files; all four or none | unset |
| `ISP_MSG_AUTHENTICATOR` | `disabled`, `warn` or `enforce` for the RFC 3579/2869 attribute | `warn` |
| `ISP_COA_TIMEOUT` / `ISP_ACTION_POLL_INTERVAL` / `ISP_ARSY_TIMEOUT` | one Dynamic Authorization attempt window, the action poll cadence (200ms–60s) and the ARSY call budget | `5s` / `2s` / `4s` |
| `ISP_HEALTH_ADDR` | liveness/readiness listener | `127.0.0.1:8081` |

Startup fails closed when the process cannot tell which ARSY it talks to or where
its secrets live, so it never opens a protocol listener it cannot serve honestly.
Readiness reports each declared listener plus a live ARSY probe; liveness only says
the health socket answers.

What the runtime deliberately does **not** carry from the reviewed MWX-ISP source:

- No EAP method state machines and no vendor attribute dictionaries. The runtime
  authenticates the PAP credential the NAS protected with the shared secret and
  answers with the bounded profile attributes ARSY returns; anything richer belongs
  to the tenant's ARSY profile and its NAS configuration.
- No `Disconnect-Cause` or `Operator-Name` on a CoA/Disconnect-Request. RFC 5176 §3
  identifies the target with NAS and session attributes only (NAS-Identifier plus
  Acct-Session-Id and User-Name), and the classic one-octet RADIUS type field cannot
  even carry attribute 419, so a request that "sent" it silently sent nothing.
- No Message-Authenticator shortcut on Dynamic Authorization: RFC 5176 §3.4 digests
  a CoA/Disconnect-Request with the Request Authenticator considered to be sixteen
  zero octets, which is a different rule from an Access-Request.
- No SQL, no business REST and no durable cache. The only in-memory state is a
  bounded view of which NAS identifiers this process has served and where their
  sessions arrived, which the action runner uses instead of a second NAS inventory.

Message-Authenticator handling is the RADIUS/UDP hardening lever for CVE-2024-3596
("BlastRADIUS"); RadSec remains the only transport that protects the whole
conversation, and it trusts a peer only when its certificate chains to the
configured CA bundle and the leaf is in date when the port opens.

## Monitoring measures and the alert leg

Read-only health observation lives in the `isp` addon (`packages/moonql-isp/src/probes.ts`,
`monitoring.ts`), not in the Go protocol runtime: a probe is a question about a
management address, and the runtime owns protocol listeners only.

- **Registered targets only.** The sweep reads `isp_monitor_targets` filtered to
  `enabled: true`, at most 200 rows per tick, and aims each measure at the address the
  operator stored for their own node. There is no discovery, no port sweep, no subnet
  walk and no router configuration write; pausing a target leaves its last measurement
  on the row untouched rather than rewriting it as a fresh state.
- **Three measures, and only two that can answer here.** `http-read` treats a 2xx as
  `healthy`, any other status as `degraded` (an answer at all means the node is up; a
  wrong answer is a sick service) and a transport failure as `unreachable`. `icmp`
  needs the platform ping helper, because a Node process cannot open a raw socket.
  `snmp-read` is reported as `unknown`: an SNMP read requires a community string, and
  D20 is exactly the place this platform forbids a device credential.
- **`unknown` is not a verdict.** A measurement this runtime could not perform — no
  ICMP helper, no credential source, an address the measure cannot express, an
  unregistered probe kind — never opens an incident and never pages anyone. Freshness
  is reported independently of incident state: `checkedAt` and `status` are written for
  every attempted target, and the health view derives `fresh`/`stale`/`never-checked`
  from the target's own `freshnessSeconds`, which is deliberately separate from the
  sweep cadence.
- **Incidents are tenant- and node-scoped.** `unreachable` opens a `critical` incident
  and `degraded` a `major` one, keyed on `tenantRef` plus `nodeRef`; a repeat tick does
  not open a second incident for the same open problem, and a healthy tick resolves
  exactly that incident. Nothing in another tenant's scope is read or written.
- **Alerting is the D18 leg, and it stays outside D20.** `CronDef.run` sees the orm but
  never a channel, so the sweep only records facts. `apps/arsy/src/lib/isp-alerts.ts`
  and the route-less `isp-alerts` module own delivery: one intent per incident through
  the channel manager, `notifyState`/`notifyAttempts`/`notifiedAt`/`notifyDetail` written
  back on the incident row, and the attempt count capped at three before the row is
  marked `failed`. A messenger that refuses leaves the row `pending`, so a restart does
  not silence an operator who was never told; a missing destination is treated as an
  unconfigured operator choice and burns no attempt. Only incidents still `open` are
  revisited, so an incident that recovered before delivery is not announced after the
  fact. SKYLINK has no idempotency key, so deduplication is this module's single
  serialized queue plus the row state — no second WhatsApp client exists anywhere in
  the path.

Synthetic fixtures in the tests use injected fetch and ping dependencies and a fake
messenger; no test contacts a network target or a real chat provider, and live delivery
remains gated by M38.

## Source feature migration

`docs/research/mwx-isp-into-xv-migration-matrix.md` maps the accepted MWX-ISP feature checklist at the pinned source SHA. Reuse the Go protocol pipeline and compatible reference dictionaries after dependency/security review. Translate persistence and business APIs into MoonQL/ARSY. Rebuild the operator surface with MoonUI. Do not migrate source database rows or runtime secrets.

The source's unsupported/hidden product directions remain outside this contract: payment gateway, public customer portal, captive portal/onboarding, reseller marketplace and router configuration writes. Registered-target monitoring stays read-only.

## Service operation

- Add a synthetic fixture mode for local development; every fixture and sample row is labeled `SIMULATED`.
- Authentication denies new access when ARSY or the NAS secret is unavailable. Accounting packets receive no success response until ARSY confirms durable idempotent storage.
- Billing suspension follows D15/D16 state and the documented grace period. A manual suspension wins over payment automation. The action and audit event commit before any network packet is sent.
- Monitoring reports `UNKNOWN`, `STALE`, `OFFLINE` and errors in words. A missing probe is never displayed as a healthy state.
- Docker/Compose and the app registry must expose only the approved protocol ports; do not attach a public hostname until the deployment/access-tier gates are accepted.
