# FROM --platform=$TARGETPLATFORM node:16-alpine AS deps
# RUN apk add --no-cache libc6-compat
# WORKDIR /app
# COPY package.json yarn.lock ./
# RUN yarn

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
RUN npm i -g yarn

FROM init as deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn

FROM init as modules
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production

# FROM --platform=$TARGETPLATFORM node:16-alpine AS builder
FROM init AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json svelte.config.js ./
COPY ./static ./static
COPY ./src ./src
RUN yarn build

FROM crazymax/yasu:latest AS yasu
FROM init AS base

ENV PUID="1000" PGID="1000" DOCKER_PGID="1001"

COPY --from=yasu / /
COPY docker/rootfs /
RUN addgroup --system --gid ${PGID} nodejs
RUN adduser --system --uid ${PUID} -G nodejs -h /home/nodejs -s /bin/bash nodejs
# see also fix-perms script
RUN addgroup --gid ${DOCKER_PGID} docker
RUN addgroup nodejs docker

# install docker
RUN curl -fsSL "https://download.docker.com/linux/static/stable/x86_64/docker-20.10.9.tgz" \
  | tar -xzvf - docker/docker -C . --strip-components 1 && mv docker /usr/bin/docker

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
