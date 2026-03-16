# 部署指南

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 本地开发

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite
DB_DATABASE=./data/flight-crawler.db
CRAWLER_HEADLESS=true
CRAWLER_TIMEOUT=30000
CORS_ORIGIN=http://localhost:5173
```

### 3. 启动服务

```bash
# 启动后端（终端1）
cd backend
npm run dev

# 启动前端（终端2）
cd frontend
npm run dev
```

访问 http://localhost:5173 即可使用应用。

## 生产部署

### 1. 构建项目

```bash
# 构建后端
cd backend
npm run build

# 构建前端
cd ../frontend
npm run build
```

### 2. 使用 PM2 部署后端

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start dist/main.js --name flight-crawler-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs flight-crawler-backend
```

### 3. 使用 Nginx 部署前端

创建 Nginx 配置文件 `/etc/nginx/sites-available/flight-crawler`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /path/to/flight-crawler/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/flight-crawler /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Docker 部署（推荐）

### 1. 创建 Dockerfile（后端）

`backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 2. 创建 Dockerfile（前端）

`frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. 创建 docker-compose.yml

项目根目录创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_DATABASE=/data/flight-crawler.db
    volumes:
      - ./data:/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### 4. 启动服务

```bash
docker-compose up -d
```

## 数据库迁移

### 切换到 PostgreSQL

1. 安装 PostgreSQL 驱动：

```bash
cd backend
npm install pg
```

2. 修改 `.env`:

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=flight_crawler
```

3. 更新 `app.module.ts` 中的 TypeORM 配置。

## 定时任务

在 `backend/src/modules/crawler/crawler.service.ts` 中添加定时任务：

```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Cron(CronExpression.EVERY_DAY_AT_2AM)
async handleCron() {
  this.logger.log('开始定时爬取任务');
  await this.triggerCrawl();
}
```

## 监控和日志

### 使用 PM2 监控

```bash
pm2 monit
```

### 日志管理

```bash
# 查看实时日志
pm2 logs flight-crawler-backend --lines 100

# 清空日志
pm2 flush
```

## 性能优化

1. **启用 Gzip 压缩**（Nginx）
2. **使用 CDN** 加速静态资源
3. **数据库索引优化**
4. **Redis 缓存**（可选）
5. **负载均衡**（高并发场景）

## 安全建议

1. 使用 HTTPS
2. 配置防火墙规则
3. 定期备份数据库
4. 限制 API 请求频率
5. 使用环境变量管理敏感信息

## 故障排查

### 后端无法启动

- 检查端口是否被占用
- 检查数据库连接
- 查看日志文件

### 前端无法访问后端

- 检查 CORS 配置
- 检查 Nginx 代理配置
- 检查防火墙规则

### 爬虫失败

- 检查网络连接
- 检查目标网站是否可访问
- 查看爬虫日志

---

**更新时间**: 2026-03-16
