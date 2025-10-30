FROM node:20

WORKDIR /app

# Copy package.json และ lockfile
COPY package.json pnpm-lock.yaml* ./

# ติดตั้ง pnpm
RUN npm install -g pnpm

# ติดตั้ง dependencies
RUN pnpm install

# Copy source code
COPY . .

# รัน build SvelteKit ก่อน Prisma
RUN pnpm build

# Prisma generate
RUN pnpm prisma generate

# เปิดพอร์ต
EXPOSE 3000

# Start server
CMD ["pnpm", "start"]
