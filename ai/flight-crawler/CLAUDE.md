# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

随心飞特价行程爬虫分析工具 - 基于 NestJS + React 的全栈应用，用于爬取和分析海南航空"随心飞"产品的航班数据，提供目的地查询和智能行程规划功能。

## 技术栈

### 后端 (backend/)
- **框架**: NestJS 10 + TypeScript (Strict mode)
- **数据库**: SQLite (开发环境) / PostgreSQL (生产环境)
- **ORM**: TypeORM - 实体自动同步 (synchronize: true)
- **爬虫**: Puppeteer - 模拟浏览器操作
- **定时任务**: @nestjs/schedule - 定时爬取数据
- **架构**: 模块化设计，遵循 NestJS DI 模式

### 前端 (frontend/)
- **框架**: React 18 + TypeScript + Vite
- **UI 库**: Ant Design 5
- **路由**: React Router v6
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **图表**: ECharts (echarts-for-react)
- **日期处理**: dayjs

## 常用命令

### 开发环境
```bash
# 一键启动 (推荐)
./start.sh

# 后端开发
cd backend
npm run dev          # 启动开发服务器 (端口 3000)
npm run build        # 构建生产版本
npm run test         # 运行测试
npm run lint         # ESLint 检查

# 前端开发
cd frontend
npm run dev          # 启动开发服务器 (端口 5173)
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # ESLint 检查
```

### 数据库
- 开发环境使用 SQLite，数据库文件位于 `backend/data/flight-crawler.db`
- TypeORM 自动同步模式已启用 (synchronize: true)，实体变更会自动更新数据库结构
- 生产环境需切换到 PostgreSQL 并关闭 synchronize
- **重要**: 修改 Entity 后无需手动创建迁移，TypeORM 会自动同步表结构

### 测试与代码质量
```bash
# 后端
cd backend
npm run test          # 运行 Jest 测试
npm run lint          # ESLint 检查
npm run format        # Prettier 格式化

# 前端
cd frontend
npm run lint          # ESLint 检查
```

## 核心架构

### 后端模块结构

#### 1. Flight Module (航班查询模块)
- **Entity**: `Flight` - 航班数据实体，包含航班号、起降时间、价格、权益卡类型等
- **Service**: `FlightService` - 提供航班查询和数据管理功能
  - `queryDestinations()` - 查询所有可达目的地，包含往返航班信息（去程/返程航班数量、可用日期）
  - `queryFlights()` - 查询指定航线的航班列表
  - `queryRoundTripFlights()` - 查询往返航班详情（同时返回去程和返程航班列表）
  - `saveFlights()` - 批量保存航班数据
  - `deleteExpiredFlights()` - 清理过期航班数据
- **Controller**: `FlightController` - REST API 端点
  - `GET /api/flights/destinations` - 目的地查询（包含往返信息）
  - `GET /api/flights` - 航班查询
  - `GET /api/flights/round-trip` - 往返航班详情查询

#### 2. Crawler Module (爬虫模块)
- 使用 Puppeteer 爬取海南航空随心飞页面
- 目标网站: https://m.hnair.com/hnams/plusMember/ableAirlineQuery
- **爬取策略**:
  - 只爬取 **666权益卡航班** 和 **2666权益卡航班**
  - 分别选择权益卡类型进行爬取（双重循环：日期 × 权益卡类型）
  - 自动选择出发地和权益卡类型
  - 只保存有明确目的地的航班（有航线就代表可以特价购买）
- **反爬策略**: 请求头伪装、随机延迟 (0.5-2秒)、频率控制
- **定时任务**: 每日凌晨自动更新数据
- **Controller**: `CrawlerController` - 提供数据管理接口
  - `POST /api/crawler/initialize/discover` - 发现机场（支持自定义天数 1-7 天，默认 1 天）
  - `POST /api/crawler/initialize/refresh` - 发现航班（支持自定义天数 1-30 天，默认 7 天）
  - `POST /api/crawler/trigger` - 一键初始化（自动执行发现机场和发现航班）
  - `GET /api/crawler/debug?origin=北京首都&date=2026-03-19` - 调试爬虫（按日期爬取指定出发地，不保存到数据库）

#### 3. Route Module (路径规划模块)
- **Service**: `RouteService` - 智能行程规划核心算法
  - **算法**: DFS (深度优先搜索) 查找所有可行路径
  - **约束条件**: 最大中转次数、中转停留时间范围 (默认 2-24 小时)
  - **评分机制**: 综合考虑价格 (50%)、总耗时 (30%)、中转次数 (20%)
  - `planRoute()` - 规划行程，返回 Top 10 最优方案
  - `buildGraph()` - 构建航班图 (城市节点 + 航班边)
  - `findAllRoutes()` - DFS 递归搜索所有路径
  - `calculateScore()` - 计算路径评分
- **Controller**: `RouteController` - REST API 端点
  - `POST /api/routes/plan` - 行程规划

### 前端页面结构

#### 1. DestinationQuery (目的地查询页面)
- 路由: `/` 和 `/destination`
- 功能: 输入起点和日期范围，查询所有可达目的地
- 展示:
  - 表格显示目的地、权益标签、去程/返程航班数量、可用日期
  - "可往返"标签标识支持往返的目的地
  - 点击"查看详情"显示完整的往返航班信息（分段展示去程和返程）

#### 2. RoutePlanner (行程规划页面)
- 路由: `/route-planner`
- 功能: 输入起点、终点、出发日期，规划最优行程
- 展示: 时间轴可视化行程、价格对比、中转信息

#### 3. DataManagement (数据管理页面)
- 路由: `/data-management`
- 功能: 管理航班数据的爬取和更新
- 特性:
  - 一键初始化：自动执行发现机场和发现航班
  - 发现机场：支持自定义天数（1-7 天），默认 1 天
  - 发现航班：支持自定义天数（1-30 天），默认 7 天
  - 可视化执行流程（Steps 组件）
  - 实时统计数据展示
  - 详细的使用说明和注意事项

#### 4. Layout (布局组件)
- 使用 Ant Design Layout 组件
- 提供页面导航和统一布局
- 导航菜单：目的地查询、行程规划、数据管理

### API 层设计

前端 API 封装位于 `frontend/src/api/`:
- `index.ts` - Axios 实例配置 (baseURL: http://localhost:3000)
- `flight.ts` - 航班相关 API 调用
- `route.ts` - 路径规划相关 API 调用

## 数据模型

### Flight Entity 关键字段
```typescript
{
  id: number;               // 主键
  flightNo: string;         // 航班号
  origin: string;           // 出发地
  destination: string;      // 目的地
  departureTime: Date;      // 起飞时间
  arrivalTime: Date;        // 到达时间
  price: number;            // 价格
  cardType: string;         // 权益卡类型 (666权益卡航班/2666权益卡航班)
  crawledAt: Date;          // 爬取时间
}
```

### 权益卡类型说明
- **666权益卡航班**: 海南航空 666 元权益卡可兑换的特价航班
- **2666权益卡航班**: 海南航空 2666 元权益卡可兑换的特价航班
- **数据来源**: 爬虫分别爬取两种权益卡类型，确保数据准确性
- **查询默认行为**: 默认查询所有权益卡航班（666 + 2666），可指定单一类型

### Route Planning 数据流
1. 用户输入 → `PlanRouteDto` (origin, destination, departureDate, maxTransfers)
2. 查询相关航班 → 构建航班图 (城市为节点，航班为边)
3. DFS 搜索所有路径 → 过滤不满足中转时间约束的路径
4. 计算评分 → 排序 → 返回 Top 10 方案

## 开发注意事项

### 后端开发
- **严格遵循 NestJS 依赖注入模式**: Service 注入到 Controller，Repository 注入到 Service
- **DTO 验证**: 使用 `class-validator` 装饰器进行参数校验
- **模块划分**: 新功能应创建独立 Module (包含 Entity, Service, Controller, DTO)
- **数据库查询**: 优先使用 TypeORM Repository API，复杂查询使用 QueryBuilder
- **日志记录**: 使用 NestJS Logger 记录关键操作和错误

### 前端开发
- **组件风格**: 统一使用 React 函数式组件 + Hooks
- **状态管理**: 简单状态用 `useState`，全局状态用 Zustand
- **样式**: 优先使用 Ant Design 组件，自定义样式使用 CSS Modules 或内联样式
- **API 调用**: 统一通过 `src/api/` 层调用，避免在组件中直接使用 axios
- **路由**: 使用 React Router v6 的 `<Routes>` 和 `<Route>` 组件
- **日期处理**: 统一使用 dayjs（Ant Design 5 默认日期库）

### 爬虫开发
- **合规性**: 仅用于个人学习，控制请求频率，遵守 robots.txt
- **权益卡爬取**:
  - 循环爬取 666 和 2666 两种权益卡类型
  - 在页面上自动选择对应的权益卡类型按钮
  - 每种权益卡类型单独爬取，确保数据准确
- **数据过滤**:
  - 只保存有明确目的地的航班（`destination` 不为空且不等于 `origin`）
  - 有航线就代表可以特价购买
  - 过滤掉无效或不完整的数据
- **错误处理**: 实现重试机制 (最多 3 次)，记录失败日志
- **增量更新**: 仅爬取未来 30 天航班，删除过期数据
- **注意**: 由于需要爬取两种权益卡，请求次数会翻倍，需要更严格的频率控制

## 环境配置

### 后端环境变量 (backend/.env)
```bash
# 应用配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_TYPE=sqlite
DB_DATABASE=./data/flight-crawler.db

# 爬虫配置
CRAWLER_HEADLESS=true
CRAWLER_TIMEOUT=30000
CRAWLER_MAX_RETRIES=3

# CORS 配置
CORS_ORIGIN=http://localhost:5173
```
**注意**: 首次启动时会自动从 `.env.example` 复制创建 `.env` 文件

### 前端环境变量
- API Base URL 硬编码在 `frontend/src/api/index.ts`
- 生产环境需修改为实际后端地址

## 项目启动流程

1. **依赖安装**: `start.sh` 自动检查并安装前后端依赖
2. **环境配置**: 自动复制 `.env.example` 为 `.env`
3. **数据库初始化**: TypeORM 自动创建数据库和表结构
4. **服务启动**: 后端 (3000 端口) → 前端 (5173 端口)
5. **首次使用**: 需手动触发爬虫任务 (`POST /api/crawler/trigger`) 获取初始数据

### 手动启动（开发调试）
```bash
# 终端 1: 启动后端
cd backend && npm run dev

# 终端 2: 启动前端
cd frontend && npm run dev
```

## 常见问题

### 查询不到航班数据
- 首次使用需触发爬虫任务更新数据
- 检查数据库文件是否存在 (`backend/data/flight-crawler.db`)

### 爬虫任务失败
- 检查网络连接和目标网站可访问性
- 查看后端日志排查错误
- 可能触发反爬机制，需调整请求频率

### 前端无法连接后端
- 确认后端服务已启动 (端口 3000)
- 检查 CORS 配置是否正确
- 确认 API Base URL 配置正确

## 文档参考

### 入门
- [快速开始](./docs/QUICK_START.md) - 快速上手指南
- [需求文档](./docs/REQUIREMENTS.md) - 详细功能需求和技术方案
- [项目总结](./docs/PROJECT_SUMMARY.md) - 已完成功能全览

### 功能说明
- [数据管理](./docs/DATA_MANAGEMENT_FEATURE.md) - 数据管理界面和自定义时间范围
- [航班管理](./docs/FLIGHT_MANAGEMENT_FEATURE.md) - 航班数据 CRUD 管理
- [机场管理](./docs/AIRPORT_MANAGEMENT_FEATURE.md) - 机场数据管理
- [往返航班](./docs/ROUND_TRIP_FEATURE.md) - 往返航班查询功能
- [执行日志](./docs/CRAWLER_LOG_FEATURE.md) - 日志记录和查询
- [日志清理](./docs/LOG_CLEANUP_FEATURE.md) - 日志清理和存储管理

### 爬虫技术
- [爬虫分析](./docs/CRAWLER_ANALYSIS.md) - 实现原理和反爬策略
- [日期机制](./docs/CRAWLER_DATE_MECHANISM.md) - 页面日期处理逻辑
- [爬虫配置](./docs/CRAWLER_SETUP.md) - 调试和配置步骤
- [按日期调试](./docs/DEBUG_CRAWLER_BY_DATE.md) - 调试特定日期和出发地
- [城市机场识别](./docs/CITY_AIRPORT_IDENTIFICATION.md) - 城市名和机场名识别流程

### 部署
- [部署指南](./docs/DEPLOYMENT.md) - 生产环境部署说明
