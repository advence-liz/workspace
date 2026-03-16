# 随心飞特价行程爬虫分析工具

<div align="center">

✈️ 一个基于 Web 的爬虫分析工具，用于分析和规划随心飞的特价航班行程

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-e0234e.svg)](https://nestjs.com/)

</div>

## 📖 项目简介

本工具专为海南航空"随心飞"产品设计，提供以下核心功能：

### 🎯 核心功能

#### 1️⃣ 目的地查询
根据起点和时间范围，快速查询所有可到达的目的地，并展示：
- 最低价格
- 可用航班数量
- 可飞日期列表
- 支持按价格、日期排序

#### 2️⃣ 智能行程规划
支持多城市中转的智能路径规划，提供：
- Top 10 最优行程方案
- 价格、时长、中转次数综合评分
- 可视化行程时间轴
- 灵活的中转时间设置

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 一键启动

```bash
# 克隆项目
cd flight-crawler

# 运行启动脚本
chmod +x start.sh
./start.sh
```

启动成功后访问：**http://localhost:5173**

详细说明请查看 [快速开始指南](./docs/QUICK_START.md)

## 📁 项目结构

```
flight-crawler/
├── backend/          # NestJS 后端服务
│   ├── src/
│   │   ├── modules/
│   │   │   ├── flight/      # 航班查询模块
│   │   │   ├── crawler/     # 爬虫模块
│   │   │   └── route/       # 路径规划模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/         # React 前端应用
│   ├── src/
│   │   ├── api/             # API 封装
│   │   ├── components/      # 公共组件
│   │   ├── pages/           # 页面组件
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── docs/            # 文档目录
│   ├── REQUIREMENTS.md      # 需求文档
│   ├── CRAWLER_ANALYSIS.md  # 爬虫技术分析
│   ├── DEPLOYMENT.md        # 部署指南
│   └── QUICK_START.md       # 快速开始
├── start.sh         # 启动脚本
└── README.md        # 项目说明（本文档）
```

## 🛠 技术栈

### 后端
- **框架**: NestJS + TypeScript
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: TypeORM
- **爬虫**: Puppeteer
- **定时任务**: @nestjs/schedule

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 库**: Ant Design
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **图表**: ECharts

## 📚 文档

- [📋 需求文档](./docs/REQUIREMENTS.md) - 详细的功能需求和技术方案
- [🕷️ 爬虫分析](./docs/CRAWLER_ANALYSIS.md) - 爬虫实现原理和反爬策略
- [🚀 快速开始](./docs/QUICK_START.md) - 快速上手指南
- [📦 部署指南](./docs/DEPLOYMENT.md) - 生产环境部署说明

## 🎨 功能截图

### 目的地查询
![目的地查询](./docs/screenshots/destination-query.png)

### 智能行程规划
![行程规划](./docs/screenshots/route-planner.png)

## 🔧 开发指南

### 本地开发

```bash
# 后端开发
cd backend
npm run dev

# 前端开发
cd frontend
npm run dev
```

### 构建生产版本

```bash
# 后端构建
cd backend
npm run build

# 前端构建
cd frontend
npm run build
```

### API 接口

#### 查询目的地
```
GET /api/flights/destinations
参数: origin, startDate, endDate, flightType
```

#### 查询航班
```
GET /api/flights
参数: origin, destination, startDate, endDate
```

#### 规划路线
```
POST /api/routes/plan
Body: { origin, destination, departureDate, maxTransfers }
```

#### 触发爬虫
```
POST /api/crawler/trigger
```

## ⚠️ 注意事项

### 合规性
- 本项目仅供学习和个人使用
- 请遵守目标网站的 robots.txt 规则
- 控制爬取频率，避免对服务器造成压力
- 不得用于商业用途

### 爬虫策略
- 请求频率: 每次请求间隔 0.5-2 秒
- User-Agent 伪装
- 随机延迟
- 错误重试机制

## 🐛 常见问题

**Q: 查询不到航班数据？**
A: 首次使用需要点击"更新数据"按钮触发爬虫任务。

**Q: 爬虫任务失败？**
A: 检查网络连接和目标网站可访问性，查看后端日志排查问题。

**Q: 前端无法连接后端？**
A: 检查后端是否正常启动，确认 CORS 配置正确。

更多问题请查看 [快速开始指南](./docs/QUICK_START.md#常见问题)

## 📈 开发计划

- [x] Phase 1: MVP 基础功能
  - [x] 项目初始化
  - [x] 爬虫模块开发
  - [x] 目的地查询功能
  - [x] 基础 Web 界面

- [x] Phase 2: 核心功能
  - [x] 智能行程规划
  - [x] 路径规划算法
  - [x] 数据可视化

- [ ] Phase 3: 优化完善
  - [ ] 性能优化
  - [ ] 用户系统
  - [ ] 通知功能
  - [ ] 移动端适配

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

Claude - AI 助手

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

Made with ❤️ by Claude

</div>
