# M22-04 — WhatsApp QR/session lifecycle and disabled-default review

- **Task:** M22-04, review WhatsApp QR/session lifecycle and disabled-default behavior.
- **Worker:** `/root/m22_04_whatsapp`.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `7625bf8f94e33e02709bfec64bcac7f69363cd29`.
- **Prerequisite:** M03-07 is checked in TODO at the captured baseline.
- **Task-owned code paths:** none; this is a read-only lifecycle review and evidence report.
- **Report:** this file.
- **Result SHA:** pending integration; no commit or TODO edit was made.

## Lifecycle and access review

- `WHATSAPP_ENABLED` and `WHATSAPP_AUTO_CONNECT` both default to `false`. The Radio channel factory returns `null` while disabled, before constructing `WhatsAppClient`; when enabled, connection still requires the explicit admin `start` action unless `WHATSAPP_AUTO_CONNECT=true` is deliberately configured.
- The Hub loads channel factories once, registers only non-null channels, and closes registered channels at shutdown. The standalone optional `@moonwitness/whatsapp` HTTP plugin is not mounted by `apps/radio`; the Hub exposes the single `/api/v1/channels` control plane.
- The channels module applies `requireAdmin` before status/detail, start, logout, send, and broadcast routes. A channel status can contain a pairing QR and JID, so the negative test checks anonymous access to such synthetic detail returns 401 without either value in the response; an authenticated admin can read the same synthetic detail. Logs announce QR readiness without logging the QR payload.
- The configured default auth directory is `./data/whatsapp-auth`; `.gitignore` currently ignores root `/data/` and any `auth_info_baileys/` directory. The actual ignore check found root `data/whatsapp-auth/creds.json` ignored, but `apps/radio/data/whatsapp-auth/creds.json` **not ignored**. Because the relative auth path depends on process working directory, this is a real credential-hygiene gap. Integrator assigned the narrow ignore remediation to M01-06; M22-04 does not edit the shared `.gitignore`.
- **Recheck after M01-06 integration:** `.gitignore` now includes `**/data/whatsapp-auth/`. `git check-ignore --no-index --quiet` returned 0 for both root and `apps/radio/data/whatsapp-auth/creds.json`; it returned 1 for `.env.example`, as intended. No credentials existed or were created/read.
- No WhatsApp auth/session directory existed at any of the four checked root or Radio locations. Tests used only synthetic QR/JID strings; no real WhatsApp connection, QR, credential, or external service was accessed.

## Changes and evidence

The checked-in config schema provides source evidence that `WHATSAPP_ENABLED` and `WHATSAPP_AUTO_CONNECT` default to false; the factory short-circuit and admin-only hook are source-reviewed. Existing tests exercise the empty channel list under disabled config, anonymous 401 for the control plane, and the same route/compatibility shape. No runtime, test, or API files were changed for this task.

Commands run on the shared dirty worktree:

- `pnpm --filter @moonwitness/radio exec tsx --test test/channels.test.ts test/m28-09-compatibility.test.ts` — exit 0; 4 tests passed, 0 failed, 0 skipped.
- `git check-ignore --no-index data/whatsapp-auth/creds.json auth_info_baileys/creds.json` — both root paths were ignored.
- `git check-ignore --no-index apps/radio/data/whatsapp-auth/creds.json` — not ignored (exit 1); M01-06 must add a narrow pattern such as `**/data/whatsapp-auth/` or otherwise make the configured auth path unambiguously ignored.
- `git check-ignore --no-index --quiet data/whatsapp-auth/creds.json` and the same command for `apps/radio/data/whatsapp-auth/creds.json` — exit 0 for both after the M01-06 ignore pattern was integrated.
- `git check-ignore --no-index --quiet .env.example` — exit 1 (not ignored), as intended.
- A PowerShell `Test-Path` check for root/Radio `data/whatsapp-auth` and `auth_info_baileys` directories returned `False` for all four; no credentials were created or read.

## Limits and rollback

This proves default configuration, factory opt-out, control-plane route authorization, and synthetic QR/JID projection boundaries. It does not connect to WhatsApp, exercise a real QR or Baileys reconnect/logout exchange, or validate credentials on disk. The ignore gap was remediated in the shared tree; retain the focused check above in CI review.

Rollback by removing this report. The production channel implementation, tests, and auth/config contracts remain unchanged.
