# ReviewPilot server image (deployed to Fly.io, see fly.toml). The action bundle is copied
# as committed (CI keeps it in sync with its source); only the server is built here.
FROM node:24-slim AS build
WORKDIR /src
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json packages/server/
RUN pnpm install --frozen-lockfile --filter @reviewpilot/server
COPY packages/server packages/server
RUN pnpm --filter @reviewpilot/server build

FROM node:24-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /src/packages/server/dist/server.mjs ./server.mjs
COPY packages/action/dist/index.mjs ./action.mjs
ENV NODE_ENV=production
CMD ["node", "server.mjs"]
