# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json .npmrc ./

# @bimo-dk/* packages are public on npmjs.com — no auth required.
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Workaround for @bimo-dk/nexus-client@0.1.0: the RegistryClient ctor
# throws "token is required" when called from the browser without a
# NEXUS_TOKEN, violating the trust-boundary model (token never reaches
# the browser; the gateway injects it). Patch the installed bundle so
# an empty token logs a warning and continues. Drop once nexus-client
# republishes with the fix.
RUN for f in node_modules/@bimo-dk/nexus-client/dist/index.cjs node_modules/@bimo-dk/nexus-client/dist/index.mjs; do \
      sed -i \
        -e 's/throw new Error("RegistryClient: token is required")/console.warn("[nexus-client] no token; gateway injects")/g' \
        -e 's|options\.registryUrl\.replace(/\\/\$/, "")|options.registryUrl.replace(/\\/\$/, "").replace(/\\/api\$/, "")|g' \
        "$f"; \
    done

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src

# VITE_NEXUS_TOKEN is read at runtime by the entrypoint, not baked in.
RUN npm run build:prod

FROM nginx:alpine
RUN apk add --no-cache wget curl jq

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
