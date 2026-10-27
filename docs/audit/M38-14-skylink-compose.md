# M38-14 — SKYLINK Compose service, integration path and rollback

## Result

- **task_id:** M38-14
- **baseline_sha:** `a079bf778aa53901efe43fac285e661c4add3c7d` (`dev`)
- **working_tree_head:** `a079bf778aa53901efe43fac285e661c4add3c7d`; M38-14 edits are uncommitted and remain reviewable in the shared worktree.
- **result_sha:** pending integration commit; this task did not commit or push.
- **actual_changed_files:** `Dockerfile.skylink`, `docker-compose.yml`, `apps/skylink/test/compose-contract.test.ts`, `apps/skylink/test/control-plane.test.ts`, `apps/arsy/test/skylink-client.test.ts`, `docs/tasks/M38/M38-14.md`, `CHANGELOG.md`, and this audit.

## Runtime and tests

All commands below ran in the Z: `dev` worktree. `DATABASE_URL` came from the ignored local `.env`; its value and all credentials were kept out of output. The PostgreSQL test fixture uses generated account IDs and removes those rows during teardown; it does not truncate D18 data.

| Command | Observed result |
| --- | --- |
| `docker compose config --quiet` with `SKYLINK_SERVICE_KEY` absent | Exit 0; default Compose configuration is accepted with the feature off and no key. |
| `docker compose --profile skylink build skylink` | Exit 0; dedicated image built, including server, UI assets, workspace runtime packages and D18 migration files. |
| `docker compose --profile skylink up -d --no-build skylink` with a process-only synthetic `SKYLINK_SERVICE_KEY` | Container started; database dependency was healthy. |
| `docker compose --profile skylink ps skylink` | `moonwitness-skylink` reported `Up (healthy)` with `127.0.0.1:3005->3005/tcp`. |
| Host `GET http://127.0.0.1:3005/health` | HTTP 200, `{ app: "skylink", port: 3005 }`. |
| `docker compose --profile skylink stop skylink` then `docker compose --profile skylink rm -f skylink` | Container stopped and removed; the database and named volumes were not removed. |
| `pnpm --filter @moonwitness/skylink test` | 16 tests, 16 passed, 0 failed, 0 skipped. Includes the six-service healthcheck contract and DB-backed webhook → authenticated WebSocket → existing UI client callback/message API path, using synthetic fixtures. |
| From `apps/arsy`: `node --env-file-if-exists=../../.env --import tsx --test test/skylink-client.test.ts` | 5 tests, 5 passed. Synthetic enabled path crossed ARSY → SKYLINK → provider fixture, then flag-off local send made no SKYLINK send and left the existing D18 message rows identical. |
| `pnpm --filter @moonwitness/arsy exec tsx --test test/compose-contract.test.ts` | 12 tests, 12 passed; every Compose service has a healthcheck. |
| `pnpm --filter @moonwitness/cockpit exec tsx --test test/cockpit.test.ts` | 9 tests, 9 passed; Cockpit already supervises eight services and includes SKYLINK. |
| `pnpm exec eslint apps/skylink/test/compose-contract.test.ts apps/skylink/test/control-plane.test.ts apps/arsy/test/skylink-client.test.ts` | Exit 0. |

## Security, privacy and limits

- Compose only publishes SKYLINK on loopback by default. ARSY-to-SKYLINK uses the shared secret environment variable; Telegram token and webhook secret are optional environment/secret-manager inputs. No credential values were recorded.
- Telegram has no file-backed session in this integration. SKYLINK does not mount the ARSY `whatsapp-session` volume, and the Compose stack adds no database service.
- Rights/privacy: all provider names and message bodies used for positive/rollback evidence are synthetic fixtures. No real listener, operator, Telegram account, or third-party message content was used or retained in the evidence.
- The provider, webhook and service key in tests are synthetic. Real Telegram delivery, a real Telegram webhook, production deployment, and rendered browser screenshot evidence were not performed. The test invokes the exact existing operator client `openOperatorSocket()` event callback and `fetchMessages()` API function used by the UI; it does not launch a browser.
- SKYLINK is behind the opt-in Compose profile `skylink`; with the profile inactive, ARSY flag-off config does not depend on SKYLINK and accepts an unset service key. To use ARSY with SKYLINK enabled, configure the service key and start the profile service before ARSY. M38-12 performs one registration attempt at ARSY boot, so a simultaneous first boot can miss the registry; automatic retry is outside this packet's permitted runtime-code scope.
- A broader baseline Cockpit run earlier reported 43/44 because of the unrelated dirty progress-locale keys in `apps/cockpit/client`/its locale usage test. The final M38-14 scoped Cockpit config/supervisor test passed 9/9; unrelated UI changes were left untouched.
- **reviewer:** independent review requested from the integrator; pending.
- **rollback:** disable the `skylink` Compose profile and set `SKYLINK_ENABLED=false`; ARSY uses its local channel path. The rollback test confirms no SKYLINK send and preserved D18 rows.
