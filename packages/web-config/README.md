# @moonwitness/web-config

The shared half of the two Next.js app configs (`apps/dock`, `apps/headquarters`).

It exists so those configs — and the dock's edge middleware — import one door
instead of reaching into repo-root `scripts/` by relative path. Owning this in a
package is also what lets `Dockerfile.web` stop copying `scripts/` into the
runtime image just so `next start` can read a config file.

## Public surface

| Export | Purpose |
| --- | --- |
| `loadRootEnv(cwd, { skip })` | Fill `process.env` from `<repo>/.env` without overwriting what the shell or compose decided. Skips `NODE_ENV` by default; returns `false` in images, where there is no `.env` to read. |
| `securityHeaders`, `SECURITY_HEADERS`, `NON_FRAMING_HEADERS`, `embedOrigins`, `EMBED_PATH` | Re-exported from **`@moonwitness/core`**, which owns the CSP/framing rules. This package adds nothing to them. |

## Ownership rule

The header vocabulary lives in `@moonwitness/core`, because the Fastify hub, the
dock middleware and both Next configs must not be able to disagree about framing.
If you are adding a header or a CSP directive, change it there — never here.
