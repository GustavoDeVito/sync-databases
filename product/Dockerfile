FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn install; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --no-frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

COPY prisma ./prisma/
RUN npx prisma generate

FROM node:20-alpine AS builder

RUN apk update

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]