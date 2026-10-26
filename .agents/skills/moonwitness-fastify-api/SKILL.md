---
name: moonwitness-fastify-api
description: Inspect and prepare authorized changes to the existing MoonWitness XV Fastify API using its route, plugin, schema, error, and test patterns.
---

# MoonWitness XV Fastify API

Use for a separately authorized API/backend change in the existing `apps/radio` service. This skill documents observed conventions; it does not authorize an endpoint, security change, migration, or TODO task.

## Inspect the current route path

Read the target module plus [the app bootstrap](../../../apps/radio/src/app.ts), [module loader](../../../apps/radio/src/lib/loader.ts), [config schema](../../../apps/radio/src/config.ts), and nearest route/plugin/test. Check `apps/radio/package.json`, its TypeScript config, `TODO.md`, and the relevant task packet before editing.

The loader registers each module folder under `${prefix}/${folder}`; the app registers MoonQL REST using the configured API prefix/version before handwritten modules. Existing module routes define local paths such as `/transmit`; do not duplicate a prefix or invent a path. The central app bootstraps MoonQL once, loads plugins, channels, and modules, then awaits `ready()`.

## Follow observed contracts

- Use Fastify route options with the established JSON Schema and request typing pattern. The DENPA route pairs a schema with a `FastifyRequest<{ Body: ... }>` handler; inspect whether the target package uses the same provider before copying it.
- Keep configuration parsed centrally in `apps/radio/src/config.ts`; do not read arbitrary `process.env` inside feature addons. The Hub passes addons an allowlisted environment slice.
- Use the existing MoonQL API for persistence. Addons do not import Fastify directly, and app/addon code subject to central lint restrictions must not import Drizzle/Postgres. Check the target path against `eslint.config.mjs`.
- Reuse existing auth/ACL plugins and route policy after inspecting the concrete route. Do not assume a route is protected because it lives behind a frontend, or invent middleware behavior.
- Preserve the API prefix, generated REST paths, response envelope, and established status/body contracts unless a separately authorized architecture decision allows a change.
- Handle async failures deliberately. The central error handler exposes messages for deliberate HTTP errors with a status code and substitutes `Internal Server Error` for unexpected errors. Do not send raw internal exceptions, secrets, or environment values yourself.

For an intentional fire-and-forget callback, use the local pattern only when the owning API requires it: explicitly detach with `void` and attach a rejection handler. Otherwise await the operation and let the framework's established error path handle it.

## Focused evidence in authorized work

Radio tests use `node:test`, `node:assert/strict`, build an app, call `app.inject()`, and close it with `t.after`. When the task is authorized, add positive and negative behavior tests at the narrow owning package and preserve the existing response shape. `apps/radio/package.json` defines `typecheck` as source plus test TypeScript checks and `test` as `tsx --test ...`; inspect scripts before running. This preparation did not execute either.

Do not create a second Hub, bypass the declared package API, broaden auth, change ACL defaults, or add a database migration under this guidance. If route ownership, authorization, source rights, or backward compatibility is unclear, report the exact ambiguity and stop before implementation.
