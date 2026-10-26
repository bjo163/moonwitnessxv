# SKYLINK — communication surface contract

**Status: ACCEPTED boundaries (ADR-0006); M38-07 health-only skeleton exists.** Provider integrations, D18 storage and operator UI remain planned, not shipped. This file records the target contract, not complete service behaviour. Source of truth for the decision: [ADR-0006](../decisions/ADR-0006-skylink-communication-surface.md). Task status: [TODO](../../TODO.md#m38--skylink-multi-channel-communication-surface).

## What it is

`apps/skylink` / `@moonwitness/skylink` — a **bounded standalone service**, port **3005**, owning domain **D18 Messages & Channels**. It speaks Fastify REST + WebSocket, serves its own operator UI, and is the only place provider sessions live. It is **not** a second Hub: no generic model/catalog REST, no addon registry, no publishing or approval engine, no graph database.

Dependency direction is one-way: `other apps → API/WS → SKYLINK → providers`, and `ARSY/SIGNAL → API/WS → SKYLINK`. SKYLINK never calls ARSY to deliver a message.

## Data ownership (D18)

Schema `skylink` in the single Postgres instance, owned solely by `@moonwitness/skylink-store`: `channel_accounts`, `conversations`, `messages`, `delivery_attempts`. Migrations are applied only by SKYLINK with `schemaFilter: ['skylink']`. This is the single accepted second SQL owner; the guard test keeps `drizzle-orm`/`postgres` importers to exactly `{packages/moonql, packages/skylink-store}`.

`channel_accounts.auth_ref` is a **reference** to secret material, never the credential. Provider auth lives in the ignored auth directory (compose volume `whatsapp-session`).

## Identity

D00 stays in ARSY. SKYLINK issues no sessions and never becomes an identity provider. Two authorization modes, per route:

- `x-skylink-key` — scoped service credential for ARSY and other apps.
- `Authorization: Bearer <ARSY session token>` — operator UI; SKYLINK validates upstream against ARSY with a short cache.

Cookies are deliberately not used: the browser ignores ports, and `localhost` vs `127.0.0.1` already caused a real bug in this repo.

## Surfaces

- REST: `POST /api/v1/send`, `POST /api/v1/broadcast`, `GET /api/v1/channels`, `POST /api/v1/channels/:id/start|logout`, `GET /api/v1/conversations`, `GET /api/v1/conversations/:id/messages`, `POST /api/v1/webhooks/:provider`, `GET /health`.
- WS `/ws`: `message.inbound`, `message.outbound`, `channel.state`, `channel.qr`, `conversation.updated`. Authenticate on the first frame. A pairing QR is never logged.
- Webhooks are untrusted input: signature/secret verified before parsing, and every outbound fetch goes through `@moonwitness/core` egress guard with `skylink` on the deny list.

## Providers

WhatsApp first (`@whiskeysockets/baileys` pinned `7.0.0-rc14`, unofficial protocol, disabled by default, 6.7.24 documented as rollback), then Telegram (grammY, official Bot API). Later Discord, Instagram, Messenger and X each need their own permissions review. Provider payloads are normalized into the D18 envelope; no provider-native shape leaks into the public contract.

## Retention and privacy

`messages.raw` stores provider payloads only under an explicit retention window and PII classification recorded in the D18 model contract before any real conversation is stored. Deletion must be possible per conversation.

## ARSY integration

ARSY keeps `/api/v1/channels` as an admin proxy only. The in-process channel factory is replaced behind `SKYLINK_ENABLED` (default **off**); flag off must reproduce today's behaviour exactly. `apps/radio/src/lib/channels.ts` `ChannelManager` must reject duplicate channel ids instead of silently overwriting them.
