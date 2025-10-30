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

# สร้างไฟล์ tsconfig.json ชั่วคราว
RUN mkdir -p .svelte-kit && printf '%s' '{"compilerOptions":{"module":"ESNext","moduleResolution":"bundler"}}' > .svelte-kit/tsconfig.json

# Build SvelteKit (ยังไม่ connect DB)
RUN pnpm build

# ไม่ generate Prisma ตอน build
# Prisma generate + run จะทำตอน container run

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy build, node_modules, prisma
COPY --from=0 /app/build ./build
COPY --from=0 /app/node_modules ./node_modules
COPY --from=0 /app/prisma ./prisma
COPY --from=0 /app/prisma/src/generated ./prisma/src/generated

EXPOSE 3000

# Run Prisma generate และ start server ตอน container run
CMD ["sh", "-c", "pnpm prisma generate && pnpm start"]
