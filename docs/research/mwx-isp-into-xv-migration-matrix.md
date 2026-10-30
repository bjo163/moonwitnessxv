# MWX-ISP → MoonWitness XV migration matrix

**Source baseline:** `Z:\project\mwx-isp`, commit `ab8a512b468c4a9b979418f8b05720a58651ebfe`, `dev`. The source worktree has uncommitted EAP/TEAP changes; this matrix does not include them. Feature names/statuses come from that commit's `docs/feature-checklist.md`. No database rows, production secrets, environment files or customer content are imported.

The source checklist has 32 feature IDs: TR-F001–TR-F024 and TR-F026–TR-F033. **TR-F025 is absent** from the source checklist and is not inferred here.

| Source feature | XV owner / surface | Migration decision |
|---|---|---|
| TR-F001 RADIUS authentication | D20; `apps/isp-radius` | Reuse the Go packet pipeline; ARSY resolves NAS, policy, subscriber binding and reply attributes. |
| TR-F002 RADIUS accounting | D20; `apps/isp-radius` | ARSY stores idempotent accounting; acknowledge only after durable success. |
| TR-F003 RadSec | D20; `apps/isp-radius` | Keep TLS protocol in Go; use secret-file certificate references and handshake tests. |
| TR-F004 EAP authentication | D20; `apps/isp-radius` | Map supported committed methods; exclude unconfigured/disabled handlers. |
| TR-F005 Vendor attributes | D20; Go runtime | Reuse reviewed dictionaries/parsers and preserve explicit vendor coverage. |
| TR-F006 Authentication policy | D20 + D15 | D20 evaluates technical policy using D15 subscription state; no duplicate subscription record. |
| TR-F007 RADIUS users | D20 | Store technical credential/policy reference; keep secrets private. |
| TR-F008 RADIUS profiles | D20 | Store network policy separately from the commercial package in D15. |
| TR-F009 Nodes and NAS | D20 | Tenant-scoped inventory; persist NAS secret references only. |
| TR-F010 Sessions and disconnect | D20 | Persist action/audit before CoA or Disconnect; test fake NAS outcomes. |
| TR-F011 Accounting query | D20 | Private, tenant-scoped query with bounded pagination and retention. |
| TR-F012 Admin REST API | ARSY / MoonQL | Custom typed routes; no second REST Hub or direct Go database API. |
| TR-F013 Management frontend | `apps/isp-console` | Rebuild with Next.js, BFF, MoonUI and Empire skin; do not copy React Admin/MUI. |
| TR-F014 Runtime configuration | D20 + Go service config | Typed allowlisted settings; secrets remain mounted files or secret references. |
| TR-F015 Dashboard and metrics | D20 read models + console | Show source/freshness; no invented counts or live status. |
| TR-F016 Operators and login | D00 | Reuse XV sessions and scoped grants; migrate no source passwords. |
| TR-F017 PostgreSQL / SQLite | MoonQL / ARSY | Use the existing Postgres owner. Do not add SQLite or another SQL owner. |
| TR-F018 Web/API/health | ARSY, Go runtime, console | Use ARSY API, service readiness and app BFF; no new generic backend. |
| TR-F019 CLI tools | Go service tooling | Keep only local development/operations commands required to run the runtime. |
| TR-F020 Build/deployment | XV workspace and CI | Add Go 1.26 build/test, Docker/Compose and documented rollback. |
| TR-F021 RFC/vendor dictionaries | Go runtime | Include only reviewed protocol/reference data needed by accepted handlers. |
| TR-F022 Security/quality | All owning packages | Add positive/negative, tenant, fuzz-regression and secret-redaction evidence. |
| TR-F023 Bilingual documentation site | XV docs | Adapt operator/developer instructions into repository docs; no separate mdBook runtime. |
| TR-F024 Go documentation conventions | Go runtime | Preserve exported API and package documentation standards. |
| TR-F026 Certificate management | D20 + Go runtime | Keep certificate references and rotation/failure evidence; no certificate bytes in Git. |
| TR-F027 Customers/packages/subscriptions | D15 | Canonical commercial records; D20 stores technical bindings by stable ID. |
| TR-F028 Invoices/payments/enforcement | D15/D16/D20 | D15 invoice, D16 manual payment, D20 access action. No online gateway. |
| TR-F029 Branding/dashboard | D13 + console | Use fixed Empire MoonUI tokens and honest operational read models; no tenant CSS. |
| TR-F030 WhatsApp operator alerts | D18 / SKYLINK | Send through SKYLINK after its M38 integration gate; no copied WhatsApp client. |
| TR-F031 Network monitoring | D20 | Registered targets only, read-only probes, explicit freshness and tenant scope. |
| TR-F032 First-install sample records | D15/D20 | Synthetic, visibly labeled fixtures behind explicit development/demo seeding. |
| TR-F033 Multi-tenant operations | D00 + D15/D16/D20 | D20 owns ISP tenant scope; D00 grants scope; all queries/jobs enforce tenant isolation. |

## Acceptance

- Every source feature ID above occurs once and has one canonical owner or a named XV surface.
- No feature row maps SQLite, user login, invoices, payments, or customer records to a second owner.
- TR-F025 remains explicitly absent; the source's non-goals remain excluded.
- Any feature dependent on M35, M37, M38 or production access remains gated until its owner evidence exists.
