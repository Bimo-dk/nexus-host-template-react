# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json .npmrc ./

RUN --mount=type=secret,id=node_auth_token,required=true \
    NODE_AUTH_TOKEN=$(cat /run/secrets/node_auth_token) \
    npm install --no-audit --no-fund

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src

RUN --mount=type=secret,id=nexus_token \
    VITE_NEXUS_TOKEN=$(cat /run/secrets/nexus_token 2>/dev/null || echo "dev-token") \
    npm run build:prod

FROM nginx:alpine
RUN apk add --no-cache wget curl jq

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
