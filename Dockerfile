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
# Every workspace member's manifest, DERIVED from the build context instead of
# listed here. `pnpm install --frozen-lockfile` demands a manifest for every
# `importers:` entry of the lockfile, and the hand-written list drifted twice —
# while BuildKit cannot preserve `<dir>/package.json` structure through one glob
# COPY. A read-only bind mount of the context plus a find loop makes the set
# self-maintaining: adding a package now costs zero Dockerfile edits.
FROM base AS deps
# The root package.json declares a `prepare` lifecycle that runs this script on
# every install. The image build is not a Git work tree, so the script itself
# exits 0 — but only if it exists: the deps stages copy manifests, not scripts/,
# and a missing file failed `pnpm install` with MODULE_NOT_FOUND.
COPY scripts/setup-git-hooks.mjs ./scripts/
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN --mount=type=bind,source=.,target=/ctx,readonly \
    cd /ctx \
    && find apps packages -mindepth 2 -maxdepth 2 -name package.json | while read -r m; do \
         mkdir -p "/repo/$(dirname "$m")" && cp "/ctx/$m" "/repo/$m"; \
       done
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Build (project references compile packages then the app) ----
FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/arsy ./apps/arsy
# One copy for the whole library tree. An explicit per-package list is exactly
# what fell behind when @moonwitness/moonql-monitor joined the workspace, and
# `tsc -b` needs every project in apps/arsy's reference graph. .dockerignore
# keeps node_modules, dist and .next out of the context: this is sources only.
COPY packages ./packages
# The SDK generator is compiled as an ARSY tool and imports the shared CLI,
# which is a dev dependency rather than an ARSY runtime package. Build it first
# so the project-reference compiler can resolve its declarations; then compile
# the hub without pulling unrelated app builds into this image.
RUN pnpm --filter @moonwitness/cli build && pnpm --filter @moonwitness/arsy build

# ---- Production deps only ----
# same derivation rule as `deps`: --prod still has to see every importer
FROM base AS prod-deps
COPY scripts/setup-git-hooks.mjs ./scripts/
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN --mount=type=bind,source=.,target=/ctx,readonly \
    cd /ctx \
    && find apps packages -mindepth 2 -maxdepth 2 -name package.json | while read -r m; do \
         mkdir -p "/repo/$(dirname "$m")" && cp "/ctx/$m" "/repo/$m"; \
       done
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
COPY --from=build /repo/packages/moonql-journey/dist packages/moonql-journey/dist
COPY --from=build /repo/packages/moonql-actors/dist packages/moonql-actors/dist
COPY --from=build /repo/packages/moonql-graph/dist packages/moonql-graph/dist
COPY --from=build /repo/packages/moonql-research/dist packages/moonql-research/dist
COPY --from=build /repo/packages/skylink-whatsapp/dist packages/skylink-whatsapp/dist
COPY --from=build /repo/packages/denpa/dist packages/denpa/dist
COPY --from=build /repo/apps/arsy/dist apps/arsy/dist
EXPOSE 3000
CMD ["node", "apps/arsy/dist/server.js"]
