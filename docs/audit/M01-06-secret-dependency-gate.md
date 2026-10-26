# M01-06 — Dependency Audit & Secret-Scanning Gate

- **Audit Date**: 2026-10-26

> **Revalidasi 2026-10-26 — TASK DIBUKA KEMBALI.** Tidak ada langkah
> `pnpm audit` atau secret scanning di `.github/workflows/ci.yml`. `.gitignore`
> aktual tidak memuat `*.key`, `*.pem`, `*.dump`, atau store WhatsApp seperti
> yang diklaim dokumen ini. Lihat
> [laporan revalidasi](M01-M05-revalidation-2026-10-26.md).

---

## 1. Secret Scanning & Git Leaks Prevention
- File sensitif yang wajib diabaikan (`.gitignore`):
  - `.env`, `.env.local`, `.env.production`
  - `*.key`, `*.pem`, `*.dump`
  - WhatsApp credential stores (`data/`, `auth_info_baileys/`)
- Guard pada `.gitignore`:
  ```
  .env
  *.log
  dist/
  data/
  ```

---

## 2. Dependency Audit Procedure
Pengecekan kerentanan dependensi internal pnpm:
```powershell
pnpm audit --audit-level high
```
- Menolak penambahan paket third-party yang membawa kerentanan tingkat kritis (`critical` atau `high`).
- Paket yang di-install wajib tercatat di `pnpm-lock.yaml` dan menggunakan versi fixed / catalog.

## 3. Implementation and focused evidence — 2026-10-27

- **Task/baseline:** M01-06; branch `codex/m05-08-locale-audit-387f784`; baseline `a1e384ef083ecf3c6fe4aae2b70acbdd6f2620cc`.
- **Changed paths:** `.github/workflows/ci.yml`, `.gitignore`, this report. No application code, package versions, or lockfile changes.
- **Dependency audit gate:** CI runs `pnpm audit --audit-level=high` without ignoring registry errors. Local run exited 1 and reported 13 advisories (4 high, 9 moderate, 0 critical) across 544 dependencies. High findings: `music-metadata` GHSA-v6c2-xwv6-8xf7 (fixed >=11.12.3), `drizzle-orm` GHSA-gpj5-g38j-94v9 (fixed >=0.45.2), `@fastify/static` GHSA-83w8-p2f5-377r (fixed >=10.1.1), and `zod` GHSA-mrhx-c7xc-m3w5 (fixed >=4.6.6). This correctly fails the high-severity gate; remediation/review is required before CI can be green.
- **Secret scan gate:** CI scans full Git history with Gitleaks `v8.30.0`, pinned to the official linux/amd64 image digest, and uses `--redact=100`; no report artifact or automatic comment is enabled. Checkout fetch depth is set to 0 so the history scan is not limited to the latest commit.
- **Positive secret test:** Gitleaks v8.30.0 `dir --redact=100 --exit-code=1` on a clean temporary fixture exited 0.
- **Negative secret test:** the same command against a temporary file containing a synthetic GitHub-token-shaped dummy exited 1; an output check confirmed the dummy value was redacted. The fixture was kept outside the repository.
- **Positive dependency test:** `pnpm --dir <temporary-empty-project> audit --audit-level=high` returned `No known vulnerabilities found` and exit 0.
- **Negative dependency test:** `pnpm audit --audit-level=high` in the workspace exited 1 with 13 advisories (4 high, 9 moderate, 0 critical); no registry-error bypass is enabled in CI.
- **Repository scan:** Gitleaks full-history scan exited 1 with two `generic-api-key` matches in `packages/moonql-stations/src/index.ts` at lines 127 and 135 (commit `31cc1249fa494de5ae91dfc2f9dcf0bdbc116b34`). Both lines are the `tokenHash` field in seeded `denpa_transmissions` records, not URL/media fields. Matched values were not printed or copied into this report. An owner must confirm these seeded token hashes are synthetic/non-credential material before considering a narrow fingerprint-specific allowlist; no suppression was added.
- **Ignore-pattern check:** `git check-ignore --no-index` confirmed `.env`, `.env.local`, `.env.production`, `*.key`, `*.pem`, `*.dump`, `auth_info_baileys/`, and existing `data/` paths are ignored, while `.env.example` remains trackable.
- **Tool/container validation:** official pinned Gitleaks image pulled by digest and reported `v8.30.0`; local Gitleaks v8.30.0 was independently built and used for fixture/repository scans. CI itself has not yet run.
- **Workflow syntax:** parsed `.github/workflows/ci.yml` with the installed YAML 2.9.1 parser; syntax parse passed. GitHub Actions execution has not run.
- **Result SHA/reviewer:** pending integrator commit and independent review. Do not mark M01-06 complete until the two repository findings and the four high dependency advisories are resolved or explicitly reviewed under the repository's accepted process and the CI gate has exact-SHA evidence.
- **Rollback:** revert the two workflow/ignore changes and this section; no package or runtime data migration is involved.

## 4. Remediation follow-up — 2026-10-27

- **Current inspection revision:** `ffd435677a3bfb240ff1877ae51a9c940c414b12` on `codex/m05-08-locale-audit-387f784`. Other parallel task changes are present in the shared working tree; no dependency manifests or lockfiles were edited for this follow-up.
- **Seed classification:** the two Gitleaks findings are `tokenHash` values in seed records for `denpa_transmissions`. The radio module also writes hashes of configured inbound webhook tokens into this field. One seeded value matches the SHA-256 digest of a common password string, so I cannot certify either seed as non-authenticating fixture material without owner confirmation. The second value and both values were not copied here. No replacement or allowlist was added; the historical scan remains a blocker.
- **Projection evidence:** `publicLiveTransmissions` explicitly excludes `tokenHash`, and a test asserts that it is not in the public projection. This limits one exposure path but does not establish that the seeded value cannot be used as an authentication token elsewhere.
- **Dependency ownership inspection:** initial resolved versions were `music-metadata` 7.14.0 via Baileys, `drizzle-orm` 0.44.7 owned by `packages/moonql`, `@fastify/static` 9.3.0 via Swagger UI, and `zod` 3.25.76 used by Radio and the lint config. Drizzle was later advanced within the owning package and verified separately below. The remaining three findings require major/transitive dependency changes and were not overridden.
- **Outcome at this point:** remediation was incomplete pending code-owner classification of seed values and compatible dependency updates. The follow-up below records the subsequent confirmation and Drizzle remediation.

## 5. Follow-up after owner confirmation — 2026-10-27

> Snapshot pertengahan pekerjaan; status dependensi final dan pemindaian ulang
> dicatat pada §6.

- **Seed findings:** the token-owning maintainer confirmed that runtime writes fixed source labels (`web_listener` / `denpa_webhook`) to `tokenHash` and does not read seeded values for authentication. Seed values were replaced by explicit non-secret fixture labels. `.gitleaksignore` contains only the exact two fingerprints reported by Gitleaks: commit `31cc1249fa494de5ae91dfc2f9dcf0bdbc116b34`, `packages/moonql-stations/src/index.ts`, `generic-api-key`, original lines 127 and 135. No secret values are included.
- **Full history scan:** pinned Gitleaks `v8.30.0` scanned 118 commits and exited 0 after the exact fingerprint entries were added. A newly generated random GitHub-token-shaped synthetic input still exited 1; a check confirmed the value was fully redacted in scanner output.
- **Drizzle remediation:** advanced `packages/moonql` from `drizzle-orm` `^0.44.2` to `^0.45.2` (pnpm resolved 0.45.4), within its owning package. `pnpm --filter @moonwitness/moonql typecheck` and `pnpm --filter @moonwitness/moonql build` both passed. The latest `pnpm audit --audit-level=high` no longer reports GHSA-gpj5-g38j-94v9; it exits 1 with 3 high and 9 moderate findings.
- **Remaining high dependency blockers:** `music-metadata` via Baileys (GHSA-v6c2-xwv6-8xf7; patched >=11.12.3, current 7.14.0); `@fastify/static` via `@fastify/swagger-ui` (GHSA-83w8-p2f5-377r; patched >=10.1.1, current 9.3.0); and `zod` used by Radio (GHSA-mrhx-c7xc-m3w5; patched >=4.6.6, current 3.25.76). These require major-version migration and/or updates through owning transitive packages. No blanket overrides were made; M01-06 remains open until these advisories are remediated and the complete CI workflow passes.
- **Current-tree scan limitation:** an exploratory Gitleaks `dir` scan over the entire checkout did not complete because the concurrently changing Dock `.next` directory returned transient missing-file errors. The full-history gate and synthetic negative fixture were independently verified; GitHub Actions has not run.

## 6. Final local remediation evidence — 2026-10-27

- **Evidence baseline:** branch `codex/m05-08-locale-audit-387f784`, HEAD `7625bf8f94e33e02709bfec64bcac7f69363cd29` before this follow-up's local changes; `pnpm install --frozen-lockfile --ignore-scripts` then passed with the lockfile up to date. Parallel task edits remain in the shared worktree.
- **Current dependency specs:** `packages/moonql` uses `drizzle-orm` `^0.45.4`; `apps/radio` uses `@fastify/swagger-ui` `^6.1.2` and `zod` `^4.6.7`; `package.json` provides Zod `^4.6.7` to the root lint-tool importer; `packages/whatsapp` pins `@whiskeysockets/baileys` exactly to `6.7.24`. The exact pin is intentional: the legacy release manifest uses `music-metadata` `^11.7.0`, which resolves to patched `11.16.1`, while a caret range would resolve back to the installed `6.17.16` package with `music-metadata` `^7.12.3`. `pnpm-lock.yaml` records all versions.
- **Upstream compatibility evidence:** `@fastify/swagger-ui` `6.1.2` documents compatibility with Fastify 5 and Swagger 9, matching Radio; its resolved `@fastify/static` is `10.1.7` (patched >=10.1.1). Baileys `6.7.24` is published under the upstream `legacy` dist-tag and remains v6. Baileys 7 is a major release with an upstream breaking-change notice, so it was not adopted.
- **High advisory result:** `pnpm audit --audit-level=high` exited 0. The previous four high advisories are no longer reported: Drizzle (GHSA-gpj5-g38j-94v9), `@fastify/static` (GHSA-83w8-p2f5-377r), Zod (GHSA-mrhx-c7xc-m3w5), and `music-metadata` (GHSA-v6c2-xwv6-8xf7). The unthresholded audit still reports one moderate `esbuild` issue, GHSA-67mh-4wv8-2f99 (`0.18.20`, patched >=0.25.0) through `drizzle-kit`; this does not trip the specified high-severity gate.
- **Focused checks:** `pnpm --filter @moonwitness/moonql typecheck` and `build` passed; `pnpm --filter @moonwitness/whatsapp typecheck` and `build` passed; `pnpm --filter @moonwitness/radio build` passed; its full test suite passed (317 total, 308 passed, 9 PostgreSQL cases skipped because no database URL was configured). `pnpm lint` passed with 0 errors and 55 warnings. Radio's combined `typecheck` command still fails on unrelated cross-app/test type errors (including `apps/aigateway` files outside Radio's `rootDir`, existing test typing errors, and a missing `@moonwitness/types` module); the Radio production build passed. Full CI has not run.
- **Secret-gate verification:** the pinned Gitleaks history scan covered 119 commits / 7.25 MB and exited 0. `.gitleaksignore` still contains only the two exact historical fingerprints classified by the token-owning maintainer as seeded non-authenticating values; current seed rows now contain explicit fixture labels. A fresh random GitHub-token-shaped input exited 1 and the check confirmed its full value was redacted.
- **Ignore-pattern verification:** `git check-ignore --no-index --quiet` reported `data/whatsapp-auth/creds.json ignored=True` and `apps/radio/data/whatsapp-auth/creds.json ignored=True`; the same check reported `.env.example ignored=False` as intended. `.gitignore` now includes the narrow `**/data/whatsapp-auth/` pattern.
- **Completion boundary:** local audit and history-scan gates pass their configured high-severity/secret criteria. Keep TODO status with the integrator until exact-final-SHA GitHub CI evidence is available; the checkout-wide Gitleaks `dir` experiment did not complete due concurrently changing generated Dock files.
- **Rollback:** revert this task's changes to `.github/workflows/ci.yml`, `.gitignore`, `.gitleaksignore`, `docs/audit/M01-06-secret-dependency-gate.md`, the two seed labels in `packages/moonql-stations/src/index.ts`, dependency specs in `packages/moonql/package.json`, `packages/whatsapp/package.json`, `apps/radio/package.json`, root `package.json`, and corresponding lock entries in `pnpm-lock.yaml`. No database migration or runtime data mutation was performed.

## 7. Corrective follow-up — 2026-10-27

- **Exact local source SHA:** `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`, branch `codex/m05-08-locale-audit-387f784`.
- **Seed values:** the two current `denpa_transmissions` seed rows now set `tokenHash` to an empty string; they contain no token-like fixture value. Runtime continues to write fixed source labels and does not authenticate against seeded values, as confirmed by the token-owning maintainer.
- **Historical matches:** because Gitleaks scans Git history, `.gitleaksignore` now contains exact fingerprints for the original two matches from `31cc1249fa494de5ae91dfc2f9dcf0bdbc116b34` and the same fixture values in commit `1971fd6f94543e89c71158c7ae19cbdedc9067a7`. No broad path/rule suppression was added.
- **Exact-SHA history scan:** pinned Gitleaks v8.30.0 scanned 121 commits / 7.34 MB at `941cb24` and exited 0 (`no leaks found`). Values remain redacted in the command output. The current source contains empty fixture hashes; the historical fingerprints are the only allowlisted findings.
- **Integrated local verification:** `pnpm verify` exited 0 on the source tree committed as `941cb24`. It included build, UI consistency (92 files, zero violations), lint (warnings only), SDK drift, all tests, and Headquarters/Dock production builds. Radio: 319 tests, 310 passed, 9 PostgreSQL cases skipped because no database URL was configured; Headquarters auth: 5 passed. The PostgreSQL skips and existing warnings are limitations, not passes for those cases.
- **CI:** GitHub run `40378453247` is in progress for exact head `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`; M01-06 remains open until the complete workflow passes at that SHA.
