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

## Source feature migration

`docs/research/mwx-isp-into-xv-migration-matrix.md` maps the accepted MWX-ISP feature checklist at the pinned source SHA. Reuse the Go protocol pipeline and compatible reference dictionaries after dependency/security review. Translate persistence and business APIs into MoonQL/ARSY. Rebuild the operator surface with MoonUI. Do not migrate source database rows or runtime secrets.

The source's unsupported/hidden product directions remain outside this contract: payment gateway, public customer portal, captive portal/onboarding, reseller marketplace and router configuration writes. Registered-target monitoring stays read-only.

## Service operation

- Add a synthetic fixture mode for local development; every fixture and sample row is labeled `SIMULATED`.
- Authentication denies new access when ARSY or the NAS secret is unavailable. Accounting packets receive no success response until ARSY confirms durable idempotent storage.
- Billing suspension follows D15/D16 state and the documented grace period. A manual suspension wins over payment automation. The action and audit event commit before any network packet is sent.
- Monitoring reports `UNKNOWN`, `STALE`, `OFFLINE` and errors in words. A missing probe is never displayed as a healthy state.
- Docker/Compose and the app registry must expose only the approved protocol ports; do not attach a public hostname until the deployment/access-tier gates are accepted.
