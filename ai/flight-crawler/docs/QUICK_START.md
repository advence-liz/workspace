# 快速开始指南

## 📋 前置要求

确保你的系统已安装：
- Node.js >= 18.0.0
- npm >= 9.0.0

检查版本：
```bash
node -v
npm -v
```

## 🚀 快速启动

### 方式一：自动化脚本（推荐）

```bash
# 克隆项目（如果是从 Git）
# git clone <repository-url>
cd flight-crawler

# 运行启动脚本
chmod +x start.sh
./start.sh
```

### 方式二：手动启动

#### 1. 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

#### 2. 配置环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件（可选，默认配置即可使用）：
```env
PORT=3000
NODE_ENV=development
DB_DATABASE=./data/flight-crawler.db
CORS_ORIGIN=http://localhost:5173
```

#### 3. 启动服务

**终端 1 - 启动后端：**
```bash
cd backend
npm run dev
```

看到以下输出表示后端启动成功：
```
🚀 应用已启动: http://localhost:3000
📚 API 文档: http://localhost:3000/api
```

**终端 2 - 启动前端：**
```bash
cd frontend
npm run dev
```

看到以下输出表示前端启动成功：
```
  ➜  Local:   http://localhost:5173/
```

#### 4. 访问应用

在浏览器中打开：**http://localhost:5173**

## 📖 功能使用

### 功能 1：目的地查询

1. 点击顶部菜单 "目的地查询"
2. 输入出发地（如：北京）
3. 选择日期范围（如：2026-04-01 至 2026-04-30）
4. 选择航班类型（可选）
5. 点击 "查询" 按钮
6. 查看所有可达目的地及最低价格

**注意**：首次使用需要先点击 "更新数据" 按钮触发爬虫获取航班数据。

### 功能 2：智能行程规划

1. 点击顶部菜单 "行程规划"
2. 输入出发地和目的地（如：北京 → 三亚）
3. 选择出发日期
4. 设置最大中转次数（默认 2 次）
5. 设置停留时间范围（默认 2-24 小时）
6. 点击 "开始规划" 按钮
7. 查看推荐的行程方案

## 🔧 常见问题

### Q1: 后端启动失败，提示端口被占用

**解决方法**：
```bash
# 查找占用 3000 端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

或修改 `.env` 文件中的 `PORT` 为其他端口。

### Q2: 前端无法连接后端

**检查项**：
1. 后端是否正常启动（http://localhost:3000/api）
2. 检查浏览器控制台是否有 CORS 错误
3. 确认 `.env` 中的 `CORS_ORIGIN` 配置正确

### Q3: 查询不到航班数据

**原因**：数据库中没有数据。

**解决方法**：
1. 点击 "目的地查询" 页面的 "更新数据" 按钮
2. 等待爬虫任务完成（可能需要几分钟）
3. 重新查询

### Q4: 爬虫任务失败

**可能原因**：
1. 目标网站不可访问
2. 网络连接问题
3. 反爬虫机制

**解决方法**：
1. 检查网络连接
2. 查看后端日志（终端输出）
3. 稍后重试

### Q5: Puppeteer 安装失败

**解决方法**：
```bash
# macOS
brew install chromium

# 或设置环境变量跳过下载
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

## 📁 项目结构

```
flight-crawler/
├── backend/              # NestJS 后端
│   ├── src/
│   │   ├── modules/
│   │   │   ├── flight/   # 航班模块
│   │   │   ├── crawler/  # 爬虫模块
│   │   │   └── route/    # 路径规划模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/             # React 前端
│   ├── src/
│   │   ├── api/          # API 封装
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── docs/                 # 文档
│   ├── REQUIREMENTS.md   # 需求文档
│   ├── CRAWLER_ANALYSIS.md  # 爬虫分析
│   ├── DEPLOYMENT.md     # 部署指南
│   └── QUICK_START.md    # 快速开始（本文档）
└── README.md             # 项目说明
```

## 🛠 开发工具

### API 测试

使用 Postman 或 curl 测试 API：

```bash
# 查询目的地
curl "http://localhost:3000/api/flights/destinations?origin=北京&startDate=2026-04-01&endDate=2026-04-30"

# 规划路线
curl -X POST http://localhost:3000/api/routes/plan \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "北京",
    "destination": "三亚",
    "departureDate": "2026-05-01",
    "maxTransfers": 2
  }'
```

### 数据库查看

数据库文件位置：`backend/data/flight-crawler.db`

使用 SQLite 客户端查看：
```bash
# 安装 sqlite3
brew install sqlite3  # macOS

# 查看数据
sqlite3 backend/data/flight-crawler.db
> SELECT * FROM flights LIMIT 10;
```

## 📚 进一步学习

- [需求文档](./REQUIREMENTS.md) - 了解完整功能需求
- [爬虫分析](./CRAWLER_ANALYSIS.md) - 了解爬虫实现原理
- [部署指南](./DEPLOYMENT.md) - 了解生产环境部署

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**祝你使用愉快！✈️**
