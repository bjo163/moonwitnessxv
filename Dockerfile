# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:24-slim AS base
# two instructions: PATH cannot reference PNPM_HOME while it is being defined
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
# a cold corepack fetch must never stop to ask: in a build with no TTY a prompt
# is indistinguishable from a hang
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /repo

# ---- Install deps (needs only manifests for a locked, cached layer) ----
# EVERY workspace manifest must be present or `pnpm install --frozen-lockfile`
# fails: apps/* and packages/* are all workspace members.
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/radio/package.json apps/radio/
COPY apps/dock/package.json apps/dock/
COPY apps/headquarters/package.json apps/headquarters/
COPY packages/core/package.json packages/core/
COPY packages/moonql/package.json packages/moonql/
COPY packages/moonql-client/package.json packages/moonql-client/
COPY packages/moonui/package.json packages/moonui/
COPY packages/moonql-base/package.json packages/moonql-base/
COPY packages/moonql-auth/package.json packages/moonql-auth/
COPY packages/moonql-stations/package.json packages/moonql-stations/
COPY packages/moonql-schedule/package.json packages/moonql-schedule/
COPY packages/moonql-playlog/package.json packages/moonql-playlog/
COPY packages/moonql-apikeys/package.json packages/moonql-apikeys/
COPY packages/moonql-settings/package.json packages/moonql-settings/
COPY packages/moonql-ops/package.json packages/moonql-ops/
COPY packages/moonql-corpus/package.json packages/moonql-corpus/
COPY packages/moonql-unilex/package.json packages/moonql-unilex/
COPY packages/moonql-ontology/package.json packages/moonql-ontology/
COPY packages/moonql-actors/package.json packages/moonql-actors/
COPY packages/moonql-graph/package.json packages/moonql-graph/
COPY packages/moonql-research/package.json packages/moonql-research/
COPY packages/whatsapp/package.json packages/whatsapp/
COPY packages/denpa/package.json packages/denpa/
# The remaining workspace members. This list is pnpm-lock.yaml's `importers:`
# block, not a convenience: `--frozen-lockfile` refuses to install when an
# importer has no manifest, so one forgotten line fails every image build.
# apps/radio/test/dockerfile-contract.test.ts holds both stages to it.
COPY apps/aigateway/package.json apps/aigateway/
COPY apps/cockpit/package.json apps/cockpit/
COPY apps/sentinel/package.json apps/sentinel/
COPY packages/cli/package.json packages/cli/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/moonql-monitor/package.json packages/moonql-monitor/
COPY packages/testing/package.json packages/testing/
COPY packages/types/package.json packages/types/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Build (project references compile packages then the app) ----
FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/radio ./apps/radio
# One copy for the whole library tree. An explicit per-package list is exactly
# what fell behind when @moonwitness/moonql-monitor joined the workspace, and
# `tsc -b` needs every project in apps/radio's reference graph. .dockerignore
# keeps node_modules, dist and .next out of the context: this is sources only.
COPY packages ./packages
# radio's tsconfig references its whole graph, so this single `tsc -b` compiles
# the libraries it needs and then the hub — no cockpit Vite pass, no dev-only
# libs, and none of the app builds the root `pnpm build` would demand.
RUN pnpm --filter @moonwitness/radio build

# ---- Production deps only ----
FROM base AS prod-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/radio/package.json apps/radio/
COPY apps/dock/package.json apps/dock/
COPY apps/headquarters/package.json apps/headquarters/
COPY packages/core/package.json packages/core/
COPY packages/moonql/package.json packages/moonql/
COPY packages/moonql-client/package.json packages/moonql-client/
COPY packages/moonui/package.json packages/moonui/
COPY packages/moonql-base/package.json packages/moonql-base/
COPY packages/moonql-auth/package.json packages/moonql-auth/
COPY packages/moonql-stations/package.json packages/moonql-stations/
COPY packages/moonql-schedule/package.json packages/moonql-schedule/
COPY packages/moonql-playlog/package.json packages/moonql-playlog/
COPY packages/moonql-apikeys/package.json packages/moonql-apikeys/
COPY packages/moonql-settings/package.json packages/moonql-settings/
COPY packages/moonql-ops/package.json packages/moonql-ops/
COPY packages/moonql-corpus/package.json packages/moonql-corpus/
COPY packages/moonql-unilex/package.json packages/moonql-unilex/
COPY packages/moonql-ontology/package.json packages/moonql-ontology/
COPY packages/moonql-actors/package.json packages/moonql-actors/
COPY packages/moonql-graph/package.json packages/moonql-graph/
COPY packages/moonql-research/package.json packages/moonql-research/
COPY packages/whatsapp/package.json packages/whatsapp/
COPY packages/denpa/package.json packages/denpa/
# same completeness rule as `deps`: --prod still resolves every importer
COPY apps/aigateway/package.json apps/aigateway/
COPY apps/cockpit/package.json apps/cockpit/
COPY apps/sentinel/package.json apps/sentinel/
COPY packages/cli/package.json packages/cli/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/moonql-monitor/package.json packages/moonql-monitor/
COPY packages/testing/package.json packages/testing/
COPY packages/types/package.json packages/types/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

# ---- Runtime ----
FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
# Keep the workspace layout: root manifests + package.jsons + built dist + prod deps
COPY --from=prod-deps /repo ./
COPY --from=build /repo/packages/core/dist packages/core/dist
COPY --from=build /repo/packages/moonql/dist packages/moonql/dist
# moonql ships its migrations folder; the app applies them at boot
COPY --from=build /repo/packages/moonql/migrations packages/moonql/migrations
COPY --from=build /repo/packages/moonql-base/dist packages/moonql-base/dist
COPY --from=build /repo/packages/moonql-auth/dist packages/moonql-auth/dist
COPY --from=build /repo/packages/moonql-stations/dist packages/moonql-stations/dist
COPY --from=build /repo/packages/moonql-schedule/dist packages/moonql-schedule/dist
COPY --from=build /repo/packages/moonql-playlog/dist packages/moonql-playlog/dist
COPY --from=build /repo/packages/moonql-apikeys/dist packages/moonql-apikeys/dist
COPY --from=build /repo/packages/moonql-settings/dist packages/moonql-settings/dist
COPY --from=build /repo/packages/moonql-ops/dist packages/moonql-ops/dist
# a declared dependency of the hub, not an optional addon: without this dist the
# container dies at import time, long after a green build
COPY --from=build /repo/packages/moonql-monitor/dist packages/moonql-monitor/dist
COPY --from=build /repo/packages/moonql-corpus/dist packages/moonql-corpus/dist
COPY --from=build /repo/packages/moonql-unilex/dist packages/moonql-unilex/dist
COPY --from=build /repo/packages/moonql-ontology/dist packages/moonql-ontology/dist
COPY --from=build /repo/packages/moonql-actors/dist packages/moonql-actors/dist
COPY --from=build /repo/packages/moonql-graph/dist packages/moonql-graph/dist
COPY --from=build /repo/packages/moonql-research/dist packages/moonql-research/dist
COPY --from=build /repo/packages/whatsapp/dist packages/whatsapp/dist
COPY --from=build /repo/packages/denpa/dist packages/denpa/dist
COPY --from=build /repo/apps/radio/dist apps/radio/dist
EXPOSE 3000
CMD ["node", "apps/radio/dist/server.js"]
