# ใช้ Node 20 LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json และ pnpm lockfile
COPY package.json pnpm-lock.yaml* ./

# ติดตั้ง pnpm
RUN npm install -g pnpm

# ติดตั้ง dependencies
RUN pnpm install

# Copy source code ทั้งหมด
COPY . .

# ติดตั้ง Prisma CLI (ถ้าโปรเจกต์ใช้ Prisma)
RUN pnpm prisma generate

# เปิดพอร์ตที่แอปใช้
EXPOSE 3000

# เริ่ม server
CMD ["pnpm", "start"]
