ARG COMMIT_SHA=""

# alpine 3.18, https://github.com/just-containers/s6-overlay 2.2.03
FROM --platform=${TARGETPLATFORM:-linux/amd64} ghcr.io/crazy-max/alpine-s6:3.18-2.2.0.3 AS init

RUN apk upgrade && apk --update --no-cache add \
  bash \
  nodejs \
  npm \
  nginx \
  nginx-mod-http-brotli \
  sqlite && \
  npm i -g pnpm

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

FROM --platform=${TARGETPLATFORM:-linux/amd64} crazymax/yasu:latest AS yasu
FROM init AS base

ENV PUID="1001" PGID="1001" PORT="5173" BODY_SIZE_LIMIT="52428800"

COPY --from=yasu / /
COPY docker/rootfs /
RUN addgroup --system --gid ${PGID} nodejs
RUN adduser --system --uid ${PUID} -G nodejs -h /home/nodejs -s /bin/bash nodejs

WORKDIR /app
ENV NODE_ENV production

COPY --from=modules --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/.svelte-kit ./.svelte-kit
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/build ./build
COPY --from=builder /app/cherry /usr/local/bin/cherry

EXPOSE 8000
VOLUME [ "/data" ]

ENTRYPOINT [ "/init" ]

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s CMD healthcheck
