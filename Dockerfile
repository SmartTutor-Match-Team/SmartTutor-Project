# ใช้ Node 20 LTS image (statical linked)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json และ pnpm lockfile (ถ้ามี)
COPY package.json pnpm-lock.yaml* ./

# ติดตั้ง pnpm
RUN npm install -g pnpm

# ติดตั้ง dependencies
RUN pnpm install

# Copy source code
COPY . .

# เปิดพอร์ตที่ต้องใช้ (ถ้ามี server)
EXPOSE 3000

# Command เริ่ม server (ปรับตามโปรเจกต์)
CMD ["pnpm", "start"]
