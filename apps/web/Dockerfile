FROM node:22-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY packages ./packages

RUN pnpm --filter web build

FROM caddy:2-alpine

COPY --from=builder /app/apps/web/dist /srv 

EXPOSE 80
EXPOSE 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"] 