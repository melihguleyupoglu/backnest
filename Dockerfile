FROM node:18-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-lock.yaml package.json ./

RUN pnpm install

COPY . .

RUN pnpm exec prisma generate

RUN pnpm build

ENV NODE_ENV=production

CMD ["node", "dist/main"]