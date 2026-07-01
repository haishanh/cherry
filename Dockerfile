ARG COMMIT_SHA=""

ARG NODE_IMAGE_TAG="24-trixie-slim"

FROM node:${NODE_IMAGE_TAG} AS init
RUN corepack enable && pnpm --version

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


FROM init AS deps
WORKDIR /app
RUN mkdir -p src/assets
COPY ./scripts ./scripts
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile


FROM deps AS modules
RUN pnpm prune --prod


FROM init AS builder
ARG COMMIT_SHA
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json vite.config.js postcss.config.mjs ./
COPY ./static ./static
COPY ./src ./src
COPY --from=modules /app/src ./src
RUN pnpm sync && \
    pnpm build && \
    pnpm bundle:cli


FROM init AS base
WORKDIR /app
ENV NODE_ENV=production
COPY --from=modules --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/build ./build
COPY --from=builder --chown=nodejs:nodejs /app/cherry /app/cherry


FROM node:${NODE_IMAGE_TAG}
ARG S6_OVERLAY_VERSION=3.2.1.0
ARG SIGNAL_TOKENIZER_VERSION=0.2.2
ARG TARGETARCH
ARG APP_UID=1001
ARG APP_GID=1001
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates \
    curl \
    nginx \
    libnginx-mod-http-brotli-static \
    libnginx-mod-http-brotli-filter \
    xz-utils \
    procps \
    sqlite3 && \
    rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    case "${TARGETARCH}" in \
      amd64) s6_arch="x86_64" ;; \
      arm64) s6_arch="aarch64" ;; \
      *) echo "Unsupported TARGETARCH for s6-overlay: ${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    curl -fL "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz" -o /tmp/s6-overlay-noarch.tar.xz; \
    curl -fL "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-${s6_arch}.tar.xz" -o /tmp/s6-overlay-${s6_arch}.tar.xz; \
    tar -C / -Jxpf /tmp/s6-overlay-noarch.tar.xz; \
    tar -C / -Jxpf /tmp/s6-overlay-${s6_arch}.tar.xz; \
    rm -f /tmp/s6-overlay-noarch.tar.xz /tmp/s6-overlay-${s6_arch}.tar.xz

COPY docker/rootfs /

ENV PORT="5173" BODY_SIZE_LIMIT="52428800"

RUN addgroup --gid ${APP_GID} nodejs
RUN adduser --uid ${APP_UID} --gid ${APP_GID} --home /home/nodejs --shell /bin/bash nodejs

WORKDIR /app
ENV NODE_ENV=production
COPY --from=base --chown=nodejs:nodejs /app/ /app/
RUN ln -sf /app/cherry /usr/local/bin/cherry
RUN set -eux; \
    case "${TARGETARCH}" in \
      amd64) signal_target="x86_64-unknown-linux-gnu" ;; \
      arm64) signal_target="aarch64-unknown-linux-gnu" ;; \
      *) echo "Unsupported TARGETARCH: ${TARGETARCH}. Build haishanh/Signal-FTS5-Extension from source for this architecture." >&2; exit 1 ;; \
    esac; \
    archive="signal-tokenizer-v${SIGNAL_TOKENIZER_VERSION}-${signal_target}.tar.gz"; \
    curl -fL "https://github.com/haishanh/Signal-FTS5-Extension/releases/download/v${SIGNAL_TOKENIZER_VERSION}/${archive}" -o "/tmp/${archive}"; \
    mkdir -p /tmp/signal-tokenizer /app/db; \
    tar -xzf "/tmp/${archive}" -C /tmp/signal-tokenizer; \
    libpath="$(find /tmp/signal-tokenizer -type f -name 'libsignal_tokenizer.so' -print -quit)"; \
    test -n "${libpath}"; \
    cp "${libpath}" /app/db/libsignal_tokenizer.so; \
    rm -rf /tmp/signal-tokenizer "/tmp/${archive}"
EXPOSE 8000
VOLUME [ "/data" ]
ENTRYPOINT [ "/init" ]
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s CMD healthcheck
