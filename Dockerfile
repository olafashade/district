FROM node:20.18-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

RUN apk update && apk add --no-cache \
  openssl \
  openssl-dev \
  libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN rm -rf node_modules

RUN pnpm install

COPY . .

RUN npx prisma generate

RUN rm -rf .next && pnpm run build

FROM node:20.18-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

RUN apk update && apk add --no-cache \
  openssl \
  openssl-dev \
  libc6-compat \
  fontconfig \
  font-liberation

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

RUN rm -rf node_modules

RUN pnpm install --prod --ignore-scripts

COPY --from=builder /app .

RUN npx prisma generate

EXPOSE 5004

CMD ["pnpm", "start"]