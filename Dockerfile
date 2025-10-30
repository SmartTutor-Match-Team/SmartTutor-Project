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

# เปิดพอร์ต
EXPOSE 3000

# Start server
CMD ["pnpm", "start"]
