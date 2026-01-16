FROM node:20.19-alpine AS builder

# Enable pnpm
RUN corepack enable 

RUN apk update && apk add --no-cache \
  openssl \
  openssl-dev \
  libc6-compat

WORKDIR /app

COPY package.json ./

RUN rm -rf node_modules

RUN npm install

COPY . .

RUN npx prisma generate

RUN rm -rf .next && npm run build

FROM node:20.19-alpine AS runner

RUN corepack enable

RUN apk update && apk add --no-cache \
  openssl \
  openssl-dev \
  libc6-compat \
  fontconfig \
  font-liberation

WORKDIR /app

COPY --from=builder /app/package.json ./

RUN rm -rf node_modules

RUN npm install --prod --ignore-scripts

COPY --from=builder /app .

RUN npx prisma generate

EXPOSE 7004

CMD ["npm", "start"]