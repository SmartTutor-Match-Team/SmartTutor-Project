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

# Copy .env file
COPY .env .env

# Some tools (and tsconfig.json) expect `./.svelte-kit/tsconfig.json` to exist.
# Create a minimal placeholder so `pnpm prisma generate` and other steps won't fail
# when they read/extend the project-level `tsconfig.json` which references it.
RUN mkdir -p .svelte-kit \
	&& printf '%s' '{"compilerOptions":{"module":"ESNext","moduleResolution":"bundler"}}' > .svelte-kit/tsconfig.json

# Generate Prisma client first so the build (which may import Prisma client types) succeeds
RUN pnpm prisma generate

# SvelteKit build
RUN pnpm build

# เปิดพอร์ต
EXPOSE 3000

# Start server
CMD ["pnpm", "start"]
