FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages ./packages
COPY apps/api/tsconfig.json ./

RUN pnpm --filter api build

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]