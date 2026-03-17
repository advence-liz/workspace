# 机场管理功能说明文档

## 功能概述

机场管理是一个独立的功能模块，用于管理随心飞爬虫系统中的机场数据。支持查看、编辑、删除机场信息，以及查看机场关联的航班统计。

## 核心特性

### 1. 分页查询
- **功能**：查询所有机场数据，支持分页展示
- **参数**：
  - `page`：页码（默认 1）
  - `pageSize`：每页数量（默认 10，支持 10/20/50/100）
  - `city`：城市名称（模糊搜索）
  - `name`：机场名称（模糊搜索）
  - `enableCrawl`：启用状态（true/false）
  - `sortBy`：排序字段（name/city/discoveredAt/updatedAt）
  - `sortOrder`：排序顺序（ASC/DESC）
- **API 端点**：`GET /api/airports/paginated`

### 2. 编辑机场
- **功能**：修改机场的基本信息
- **可编辑字段**：
  - 机场名称
  - 所在城市
  - 启用状态（启用/禁用）
- **API 端点**：`PUT /api/airports/:id`
- **快速切换**：在表格中直接使用 Switch 组件切换启用状态，无需打开编辑框

### 3. 删除机场
- **功能**：删除单个或多个机场
- **删除方式**：
  - **单条删除**：点击表格中的"删除"按钮
  - **批量删除**：勾选多个机场，点击"批量删除"按钮
- **安全机制**：删除前需二次确认
- **API 端点**：
  - 单条删除：`DELETE /api/airports/:id`
  - 批量删除：`POST /api/airports/batch-delete`

### 4. 机场统计
- **功能**：查看机场关联的航班统计信息
- **统计内容**：
  - 作为出发地的航班数
  - 作为目的地的航班数
  - 总关联航班数
- **访问方式**：点击表格中的"统计"按钮
- **API 端点**：`GET /api/airports/:id/stats`

### 5. 数据导出
- **功能**：将机场数据导出为 Excel 文件
- **导出内容**：
  - 机场名
  - 城市
  - 启用状态
  - 发现时间
  - 更新时间
- **文件名格式**：`机场数据_YYYY-MM-DD_HH-mm-ss.xlsx`
- **导出范围**：当前筛选结果

## 页面布局

### 统计卡片区（顶部）
显示 4 个统计卡片：
- **总机场数**：数据库中所有机场数量
- **启用数**：启用爬虫的机场数量
- **禁用数**：禁用爬虫的机场数量
- **关联航班**：当前分页结果中的机场数量

### 筛选表单区
支持按以下条件筛选：
- 机场名称（模糊搜索）
- 所在城市（模糊搜索）
- 启用状态（启用/禁用）
- 操作按钮：查询、重置

### 操作按钮区
- **导出 Excel**：导出当前筛选结果
- **批量删除**：删除选中的机场（选中后显示）

### 数据表格区
展示机场数据，支持：
- 分页（可自定义每页数量）
- 排序（点击列头排序）
- 行选择（勾选复选框）
- 快速操作：
  - **统计**：查看航班统计
  - **编辑**：打开编辑框
  - **删除**：删除该机场

## 使用场景

### 场景 1：查看所有机场
1. 打开机场管理页面
2. 默认显示所有机场的第一页（每页 10 条）
3. 可通过分页按钮翻页查看更多

### 场景 2：查找特定城市的机场
1. 在"城市"输入框输入城市名（如"北京"）
2. 点击"查询"按钮
3. 表格显示该城市的所有机场

### 场景 3：禁用某个机场的爬虫
1. 在表格中找到该机场
2. 直接点击启用状态 Switch 组件
3. 状态立即更新为"禁用"

### 场景 4：查看机场的航班统计
1. 在表格中找到该机场
2. 点击"统计"按钮
3. 弹出统计信息窗口，显示：
   - 作为出发地的航班数
   - 作为目的地的航班数
   - 总航班数

### 场景 5：批量删除机场
1. 在表格中勾选多个机场
2. 点击"批量删除"按钮
3. 确认删除
4. 机场被删除，表格自动刷新

### 场景 6：导出机场数据
1. 可选：先筛选需要导出的机场
2. 点击"导出 Excel"按钮
3. 自动下载 Excel 文件

## 技术细节

### 后端架构
```
AirportController (6 个端点)
    ↓
AirportService (6 个业务方法)
    ↓
Airport Repository + Flight Repository
    ↓
SQLite 数据库
```

### 前端架构
```
AirportManagement.tsx (主页面)
    ↓
airport.ts (API 调用层)
    ↓
Axios HTTP 客户端
    ↓
Backend API
```

### 数据模型
```typescript
Airport {
  id: number;              // 主键
  name: string;            // 机场名称（如"北京首都"）
  city: string;            // 所在城市
  enableCrawl: boolean;    // 是否启用爬虫
  discoveredAt: Date;      // 发现时间
  updatedAt: Date;         // 最后更新时间
}

AirportStats {
  airportId: number;
  airportName: string;
  city: string;
  enableCrawl: boolean;
  totalFlights: number;           // 总航班数
  asOriginCount: number;          // 作为出发地的航班数
  asDestinationCount: number;     // 作为目的地的航班数
}
```

## API 参考

### 1. 分页查询机场
```
GET /api/airports/paginated?page=1&pageSize=10&city=北京
```

**响应示例**：
```json
{
  "airports": [
    {
      "id": 1,
      "name": "北京首都",
      "city": "北京",
      "enableCrawl": true,
      "discoveredAt": "2026-03-16T16:19:05.000Z",
      "updatedAt": "2026-03-16T16:19:05.000Z"
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 10
}
```

### 2. 查询单条机场
```
GET /api/airports/1
```

### 3. 获取机场统计
```
GET /api/airports/1/stats
```

**响应示例**：
```json
{
  "airportId": 1,
  "airportName": "北京首都",
  "city": "北京",
  "enableCrawl": true,
  "totalFlights": 278,
  "asOriginCount": 130,
  "asDestinationCount": 148
}
```

### 4. 更新机场
```
PUT /api/airports/1
Content-Type: application/json

{
  "enableCrawl": false,
  "name": "北京首都T3",
  "city": "北京"
}
```

### 5. 删除机场
```
DELETE /api/airports/1
```

### 6. 批量删除机场
```
POST /api/airports/batch-delete
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

## 常见问题

### Q1: 如何快速禁用某个机场的爬虫？
**A**: 在表格中直接点击启用状态 Switch 组件，无需打开编辑框。

### Q2: 删除机场后会发生什么？
**A**: 机场被删除，但关联的航班数据不会被删除。下次爬虫运行时，如果发现新的机场，会重新创建。

### Q3: 如何查看某个机场有多少航班？
**A**: 点击表格中的"统计"按钮，查看该机场作为出发地和目的地的航班数统计。

### Q4: 导出的 Excel 文件包含哪些信息？
**A**: 包含机场名、城市、启用状态、发现时间、更新时间 5 列。

### Q5: 可以编辑哪些机场信息？
**A**: 可以编辑机场名称、所在城市和启用状态。

## 与航班管理的关系

| 功能 | 航班管理 | 机场管理 |
|-----|---------|---------|
| 主要对象 | 航班数据 | 机场数据 |
| 管理粒度 | 单条航班 | 单个机场 |
| 筛选维度 | 5 个（出发地、目的地、日期等） | 3 个（名称、城市、状态） |
| 特殊功能 | 日期范围筛选 | 启用状态快速切换 + 航班统计 |
| 数据来源 | 爬虫自动保存 | 爬虫自动发现 |

## 相关文档

- [航班管理功能](./FLIGHT_MANAGEMENT_FEATURE.md)
- [数据管理功能](./DATA_MANAGEMENT_FEATURE.md)
- [爬虫分析](./CRAWLER_ANALYSIS.md)
