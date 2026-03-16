# 执行日志功能说明

## 🎯 功能概述

为"发现机场"和"发现航班"功能添加了详细的执行日志记录，记录每次执行的参数、结果详情、执行状态等信息，并提供日志查询和统计功能。

---

## ✨ 核心功能

### 1. 自动日志记录 ✅

**记录时机**：
- 发现机场开始时创建日志
- 发现航班开始时创建日志
- 执行完成后更新日志（成功或失败）

**记录内容**：
- 任务类型（发现机场/发现航班/一键初始化）
- 执行状态（执行中/成功/失败）
- 爬取天数
- 发现的机场数量
- 爬取的航班数量
- 详细信息（JSON 格式）
- 错误信息（如果失败）
- 开始时间、结束时间、执行时长

### 2. 日志查询 ✅

**查询功能**：
- 按任务类型筛选
- 按执行状态筛选
- 分页查询
- 按时间倒序排列

**显示信息**：
- 任务类型
- 状态标签
- 爬取天数
- 机场数/航班数
- 执行时长
- 执行时间

### 3. 日志详情 ✅

**详情内容**：
- 基本信息（任务类型、状态、天数）
- 统计数据（机场数、航班数、执行时长）
- 时间信息（开始时间、结束时间）
- 详细信息（JSON 格式展示）
- 错误信息（如果失败）

### 4. 统计信息 ✅

**统计指标**：
- 总执行次数
- 成功次数
- 失败次数
- 执行中次数
- 今日执行次数

---

## 🔧 技术实现

### 后端实现

#### 1. 数据库实体

**文件**: `backend/src/modules/crawler/entities/crawler-log.entity.ts`

```typescript
@Entity('crawler_logs')
export class CrawlerLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  taskType: CrawlerTaskType; // 任务类型

  @Column({ type: 'varchar', length: 20 })
  status: CrawlerTaskStatus; // 执行状态

  @Column({ type: 'int', nullable: true })
  days: number; // 爬取天数

  @Column({ type: 'int', default: 0 })
  airportCount: number; // 机场数量

  @Column({ type: 'int', default: 0 })
  flightCount: number; // 航班数量

  @Column({ type: 'text', nullable: true })
  details: string; // 详细信息（JSON）

  @Column({ type: 'text', nullable: true })
  errorMessage: string; // 错误信息

  @Column({ type: 'datetime', nullable: true })
  startTime: Date; // 开始时间

  @Column({ type: 'datetime', nullable: true })
  endTime: Date; // 结束时间

  @Column({ type: 'int', nullable: true })
  duration: number; // 执行时长（秒）

  @CreateDateColumn()
  createdAt: Date;
}
```

**枚举类型**：
```typescript
export enum CrawlerTaskType {
  DISCOVER_AIRPORTS = 'discover_airports',
  REFRESH_FLIGHTS = 'refresh_flights',
  FULL_INITIALIZE = 'full_initialize',
}

export enum CrawlerTaskStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}
```

#### 2. 日志记录逻辑

**文件**: `backend/src/modules/crawler/crawler.service.ts`

**辅助方法**：
- `createCrawlerLog()` - 创建日志记录
- `updateCrawlerLog()` - 更新日志记录
- `completeCrawlerLog()` - 完成日志记录（计算时长）

**集成点**：
- `initializeDiscoverAirports()` - 发现机场时记录
- `initializeRefreshFlights()` - 发现航班时记录

**记录的详细信息**：

发现机场：
```json
{
  "seedAirports": ["北京首都", "北京大兴", ...],
  "seedAirportResults": {
    "北京首都": 120,
    "北京大兴": 80,
    ...
  },
  "discoveredAirports": ["北京首都", "上海浦东", ...],
  "dateRange": ["2026-03-17", "2026-03-18", ...]
}
```

发现航班：
```json
{
  "airports": ["北京首都", "上海浦东", ...],
  "airportResults": {
    "北京首都": 350,
    "上海浦东": 420,
    ...
  },
  "dateRange": ["2026-03-17", "2026-03-18", ...],
  "deletedCount": 1500
}
```

#### 3. 查询接口

**文件**: `backend/src/modules/crawler/crawler.controller.ts`

**API 端点**：
- `GET /api/crawler/logs` - 查询日志列表
- `GET /api/crawler/logs/:id` - 获取日志详情
- `GET /api/crawler/logs-stats` - 获取统计信息

**查询参数**：
```typescript
export class QueryLogsDto {
  taskType?: CrawlerTaskType;  // 任务类型
  status?: CrawlerTaskStatus;   // 执行状态
  page?: number;                // 页码
  pageSize?: number;            // 每页数量
}
```

### 前端实现

#### 1. API 封装

**文件**: `frontend/src/api/flight.ts`

**接口定义**：
```typescript
export interface CrawlerLog {
  id: number;
  taskType: 'discover_airports' | 'refresh_flights' | 'full_initialize';
  status: 'running' | 'success' | 'failed';
  days?: number;
  airportCount: number;
  flightCount: number;
  details?: string;
  errorMessage?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
}

export const queryCrawlerLogs = (params?: QueryLogsParams): Promise<QueryLogsResponse>;
export const getCrawlerLogDetail = (id: number): Promise<CrawlerLog>;
export const getCrawlerLogStats = (): Promise<LogStats>;
```

#### 2. 数据管理页面集成

**文件**: `frontend/src/pages/DataManagement.tsx`

**新增功能**：
- 执行日志卡片
- 日志列表表格
- 日志筛选（任务类型、状态）
- 日志详情 Modal
- 统计信息展示

**自动刷新**：
- 执行发现机场后自动刷新日志
- 执行发现航班后自动刷新日志
- 执行一键初始化后自动刷新日志

---

## 📊 界面展示

### 执行日志卡片

```
┌─────────────────────────────────────────────────────────────┐
│ 📜 执行日志                                                  │
│                       总执行次数 | 成功 | 失败 | 今日执行   │
│                          125    |  120 |   5  |    3       │
├─────────────────────────────────────────────────────────────┤
│ [任务类型 ▼] [状态 ▼]                                       │
├─────────────────────────────────────────────────────────────┤
│ 任务类型    │ 状态  │ 天数 │ 机场数 │ 航班数 │ 时长 │ 时间 │
├─────────────────────────────────────────────────────────────┤
│ 发现航班    │ 成功  │ 7天  │ 15个   │ 1,500 │ 8分  │ ...  │
│ 发现机场    │ 成功  │ 1天  │ 15个   │ 120   │ 2分  │ ...  │
│ 发现航班    │ 失败  │ 30天 │ 0个    │ 0     │ 1分  │ ...  │
└─────────────────────────────────────────────────────────────┘
```

### 日志详情 Modal

```
┌─────────────────────────────────────────────────────────────┐
│ 执行日志详情                                         [关闭] │
├─────────────────────────────────────────────────────────────┤
│ 任务类型：发现航班          │ 状态：成功 ✓                 │
│ 爬取天数：7 天              │ 发现机场：15 个               │
│ 爬取航班：1,500 条          │ 执行时长：8:32 分:秒         │
│ 开始时间：2026-03-16 10:00:00                               │
│ 结束时间：2026-03-16 10:08:32                               │
├─────────────────────────────────────────────────────────────┤
│ 详细信息：                                                  │
│ {                                                           │
│   "airports": ["北京首都", "上海浦东", ...],                │
│   "airportResults": {                                       │
│     "北京首都": 350,                                        │
│     "上海浦东": 420,                                        │
│     ...                                                     │
│   },                                                        │
│   "dateRange": ["2026-03-17", ...],                        │
│   "deletedCount": 1200                                     │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 使用示例

### 1. 查询所有日志

```bash
curl http://localhost:3000/api/crawler/logs?page=1&pageSize=10
```

**响应**：
```json
{
  "logs": [
    {
      "id": 1,
      "taskType": "refresh_flights",
      "status": "success",
      "days": 7,
      "airportCount": 15,
      "flightCount": 1500,
      "startTime": "2026-03-16T10:00:00.000Z",
      "endTime": "2026-03-16T10:08:32.000Z",
      "duration": 512,
      "createdAt": "2026-03-16T10:00:00.000Z"
    }
  ],
  "total": 125,
  "page": 1,
  "pageSize": 10
}
```

### 2. 按任务类型筛选

```bash
curl "http://localhost:3000/api/crawler/logs?taskType=discover_airports&page=1&pageSize=10"
```

### 3. 按状态筛选

```bash
curl "http://localhost:3000/api/crawler/logs?status=failed&page=1&pageSize=10"
```

### 4. 获取日志详情

```bash
curl http://localhost:3000/api/crawler/logs/1
```

**响应**：
```json
{
  "id": 1,
  "taskType": "refresh_flights",
  "status": "success",
  "days": 7,
  "airportCount": 15,
  "flightCount": 1500,
  "details": "{\"airports\":[\"北京首都\",\"上海浦东\"],\"airportResults\":{\"北京首都\":350,\"上海浦东\":420},\"dateRange\":[\"2026-03-17\"],\"deletedCount\":1200}",
  "startTime": "2026-03-16T10:00:00.000Z",
  "endTime": "2026-03-16T10:08:32.000Z",
  "duration": 512,
  "createdAt": "2026-03-16T10:00:00.000Z"
}
```

### 5. 获取统计信息

```bash
curl http://localhost:3000/api/crawler/logs-stats
```

**响应**：
```json
{
  "total": 125,
  "successCount": 120,
  "failedCount": 5,
  "runningCount": 0,
  "todayCount": 3
}
```

---

## 📋 数据库表结构

### crawler_logs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| taskType | VARCHAR(50) | 任务类型 |
| status | VARCHAR(20) | 执行状态 |
| days | INT | 爬取天数 |
| airportCount | INT | 机场数量 |
| flightCount | INT | 航班数量 |
| details | TEXT | 详细信息（JSON） |
| errorMessage | TEXT | 错误信息 |
| startTime | DATETIME | 开始时间 |
| endTime | DATETIME | 结束时间 |
| duration | INT | 执行时长（秒） |
| createdAt | DATETIME | 创建时间 |

**索引**：
- `idx_taskType_createdAt` - (taskType, createdAt)
- `idx_status_createdAt` - (status, createdAt)

---

## 💡 使用场景

### 场景 1：追踪执行历史

**需求**：查看过去一周的执行记录

**操作**：
1. 访问数据管理页面
2. 滚动到"执行日志"卡片
3. 查看日志列表
4. 点击"详情"查看具体信息

### 场景 2：排查失败原因

**需求**：查看为什么某次执行失败了

**操作**：
1. 筛选状态为"失败"
2. 找到对应的日志记录
3. 点击"详情"
4. 查看错误信息

### 场景 3：性能分析

**需求**：分析不同天数的执行时长

**操作**：
1. 查看日志列表的"执行时长"列
2. 对比不同天数的执行时间
3. 优化爬取策略

### 场景 4：统计分析

**需求**：了解系统运行情况

**操作**：
1. 查看页面顶部的统计信息
2. 了解总执行次数、成功率
3. 查看今日执行情况

---

## 📝 文件变更清单

### 后端文件（5 个）

- ✅ `backend/src/modules/crawler/entities/crawler-log.entity.ts` - 新增实体
- ✅ `backend/src/modules/crawler/crawler.module.ts` - 注册实体
- ✅ `backend/src/modules/crawler/crawler.service.ts` - 添加日志逻辑
- ✅ `backend/src/modules/crawler/crawler.controller.ts` - 添加查询接口
- ✅ `backend/src/modules/crawler/dto/query-logs.dto.ts` - 新增 DTO

### 前端文件（2 个）

- ✅ `frontend/src/api/flight.ts` - 添加日志 API
- ✅ `frontend/src/pages/DataManagement.tsx` - 添加日志展示

### 文档文件（1 个）

- ✅ `docs/CRAWLER_LOG_FEATURE.md` - 本文档

---

## ⚠️ 注意事项

### 数据库迁移

- TypeORM 自动同步模式会自动创建 `crawler_logs` 表
- 生产环境需要手动创建表或使用迁移脚本

### 日志清理

- 建议定期清理旧日志（如保留最近 3 个月）
- 可以添加定时任务自动清理

### 性能考虑

- 日志表会随时间增长
- 建议添加分页查询
- 考虑添加日志归档功能

---

## 🚀 后续优化建议

1. **日志导出**
   - 支持导出为 CSV/Excel
   - 方便离线分析

2. **日志清理**
   - 定时清理旧日志
   - 支持手动清理

3. **实时进度**
   - WebSocket 实时推送执行进度
   - 显示当前爬取的机场

4. **日志归档**
   - 自动归档历史日志
   - 压缩存储

5. **告警通知**
   - 失败时发送通知
   - 邮件/短信提醒

---

## ✨ 总结

执行日志功能为数据管理提供了完整的可追溯性：

- 📝 **自动记录**：无需手动操作，自动记录每次执行
- 🔍 **详细信息**：记录完整的执行参数和结果
- 📊 **统计分析**：提供多维度的统计信息
- 🐛 **问题排查**：快速定位失败原因
- 📈 **性能优化**：分析执行时长，优化策略

---

**开发者**: Claude
**版本**: v1.3.0
**日期**: 2026-03-16
