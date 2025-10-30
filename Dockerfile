FROM node:20

WORKDIR /app

# Copy package.json และ lockfile
COPY package.json pnpm-lock.yaml* ./

# ติดตั้ง pnpm
RUN npm install -g pnpm

# ติดตั้ง dependencies
RUN pnpm install

# Copy source code ทั้งหมด
COPY . .

# SvelteKit build
RUN pnpm build

# Prisma generate ก่อน SvelteKit build
RUN pnpm prisma generate

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/build ./build
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/prisma/src/generated ./prisma/src/generated

# เปิดพอร์ต
EXPOSE 5173

# Start server
CMD ["pnpm", "start"]
