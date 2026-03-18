# ── Stage 1: 构建 ──────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: 运行 ──────────────────────────────────────────────
FROM node:20-slim AS runner

# 安装 Puppeteer / Chrome 所需的系统依赖
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-cjk \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 告诉 Puppeteer 使用系统 Chrome，不要自行下载
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# 只安装生产依赖
COPY package*.json ./
RUN npm ci --omit=dev

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 数据目录（SQLite 文件持久化）
RUN mkdir -p /app/data /app/logs

EXPOSE 3000

CMD ["node", "dist/main.js"]
