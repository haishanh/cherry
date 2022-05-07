# FROM --platform=${BUILDPLATFORM:-linux/amd64} crazymax/alpine-s6:3.15-2.2.0.3 AS init
FROM crazymax/alpine-s6:3.15-2.2.0.3 AS init
RUN apk --update --no-cache add \
  libc6-compat \
  bash \
  ca-certificates \
  curl \
  nginx \
  sqlite \
  nodejs \
  npm
RUN npm i -g pnpm

FROM init as deps
WORKDIR /app
RUN mkdir -p src/assets
COPY ./scripts ./scripts
COPY package.json pnpm-lock.yaml ./
RUN pnpm i

FROM init as modules
WORKDIR /app
RUN mkdir -p src/assets
COPY ./scripts ./scripts
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --prod

# FROM --platform=$TARGETPLATFORM node:16-alpine AS builder
FROM init AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json svelte.config.js ./
COPY ./static ./static
COPY ./src ./src
COPY --from=modules /app/src ./src

RUN pnpm build

FROM crazymax/yasu:latest AS yasu
FROM init AS base

ENV PUID="1000" PGID="1000"

COPY --from=yasu / /
COPY docker/rootfs /
RUN addgroup --system --gid ${PGID} nodejs
RUN adduser --system --uid ${PUID} -G nodejs -h /home/nodejs -s /bin/bash nodejs

WORKDIR /app
ENV NODE_ENV production

# COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.bin/svelte-kit ./node_modules/.bin/svelte-kit

# /app/node_modules/better-sqlite3/build/Release/better_sqlite3.node
# RUN yarn add better-sqlite3

COPY --from=modules --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/.svelte-kit ./.svelte-kit
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/build ./build

EXPOSE 8000
VOLUME [ "/data" ]

ENTRYPOINT [ "/init" ]

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s \
  CMD healthcheck
