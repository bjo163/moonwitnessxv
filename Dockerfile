# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:24-slim AS base
# two instructions: PATH cannot reference PNPM_HOME while it is being defined
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
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
COPY packages/whatsapp/package.json packages/whatsapp/
COPY packages/denpa/package.json packages/denpa/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Build (project references compile packages then the app) ----
FROM deps AS build
COPY tsconfig.base.json ./
COPY apps/radio ./apps/radio
COPY packages/core ./packages/core
COPY packages/moonql ./packages/moonql
COPY packages/moonql-client ./packages/moonql-client
COPY packages/moonui ./packages/moonui
COPY packages/moonql-base ./packages/moonql-base
COPY packages/moonql-auth ./packages/moonql-auth
COPY packages/moonql-stations ./packages/moonql-stations
COPY packages/moonql-schedule ./packages/moonql-schedule
COPY packages/moonql-playlog ./packages/moonql-playlog
COPY packages/moonql-apikeys ./packages/moonql-apikeys
COPY packages/moonql-settings ./packages/moonql-settings
COPY packages/moonql-ops ./packages/moonql-ops
COPY packages/moonql-corpus ./packages/moonql-corpus
COPY packages/moonql-unilex ./packages/moonql-unilex
COPY packages/moonql-ontology ./packages/moonql-ontology
COPY packages/moonql-actors ./packages/moonql-actors
COPY packages/whatsapp ./packages/whatsapp
COPY packages/denpa ./packages/denpa
RUN pnpm build

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
COPY packages/whatsapp/package.json packages/whatsapp/
COPY packages/denpa/package.json packages/denpa/
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
COPY --from=build /repo/packages/moonql-corpus/dist packages/moonql-corpus/dist
COPY --from=build /repo/packages/moonql-unilex/dist packages/moonql-unilex/dist
COPY --from=build /repo/packages/moonql-ontology/dist packages/moonql-ontology/dist
COPY --from=build /repo/packages/moonql-actors/dist packages/moonql-actors/dist
COPY --from=build /repo/packages/whatsapp/dist packages/whatsapp/dist
COPY --from=build /repo/packages/denpa/dist packages/denpa/dist
COPY --from=build /repo/apps/radio/dist apps/radio/dist
EXPOSE 3000
CMD ["node", "apps/radio/dist/server.js"]
