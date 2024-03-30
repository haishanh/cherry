ARG COMMIT_SHA=""

FROM --platform=${TARGETPLATFORM:-linux/amd64} node:20-bookworm-slim AS init
RUN corepack enable && pnpm version

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


FROM init as deps
WORKDIR /app
RUN mkdir -p src/assets
COPY ./scripts ./scripts
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile


FROM init as modules
WORKDIR /app
RUN mkdir -p src/assets
COPY ./scripts ./scripts
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile


FROM init AS builder
ARG COMMIT_SHA
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json svelte.config.js vite.config.js ./
COPY ./static ./static
COPY ./src ./src
COPY --from=modules /app/src ./src
RUN pnpm sync && \
    pnpm build && \
    pnpm bundle:cli


FROM init AS base

ENV PUID="1001" PGID="1001" PORT="5173" BODY_SIZE_LIMIT="52428800"

RUN addgroup --system --gid ${PGID} nodejs
RUN adduser --system --uid ${PUID} -G nodejs -h /home/nodejs -s /bin/bash nodejs

WORKDIR /app
ENV NODE_ENV production

COPY --from=modules --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/.svelte-kit ./.svelte-kit
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/build ./build
COPY --from=builder /app/cherry /usr/local/bin/cherry
