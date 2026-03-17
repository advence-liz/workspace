# 航班管理功能实施文档

## 概述

本文档描述了航班管理功能的完整实施，包括后端 API 扩展和前端页面开发。该功能提供了一个独立的航班管理界面，用户可以查看、编辑、删除和导出航班数据。

## 功能特性

### 核心功能
- ✅ **查看航班数据**：分页展示航班信息，支持排序
- ✅ **编辑航班信息**：通过模态框编辑航班的各个字段
- ✅ **删除航班数据**：支持单条删除和批量删除
- ✅ **筛选和搜索**：多维度筛选（出发地、目的地、日期、权益卡、航班号）
- ✅ **导出数据**：导出为 Excel 文件，包含所有航班信息
- ✅ **实时统计**：显示总航班数、今日航班、权益卡分类统计

### 用户体验优化
- 二次确认机制：删除操作前需二次确认
- 权益卡类型标签：不同颜色区分权益卡类型
- 加载状态提示：表格加载中显示加载状态
- 实时反馈：所有操作都有成功/失败提示
- 批量操作计数：显示已选择的行数

## 技术架构

### 后端架构

```
Flight Module
├── DTO 层
│   ├── query-flights-pagination.dto.ts    (分页查询参数)
│   ├── update-flight.dto.ts               (更新航班参数)
│   └── batch-delete-flights.dto.ts        (批量删除参数)
├── Service 层
│   ├── queryFlightsWithPagination()       (分页查询)
│   ├── findFlightById()                   (查询单条)
│   ├── updateFlight()                     (更新)
│   ├── deleteFlight()                     (删除单条)
│   └── batchDeleteFlights()               (批量删除)
└── Controller 层
    ├── GET /flights/paginated             (分页查询)
    ├── GET /flights/:id                   (查询单条)
    ├── PUT /flights/:id                   (更新)
    ├── DELETE /flights/:id                (删除单条)
    └── POST /flights/batch-delete         (批量删除)
```

### 前端架构

```
FlightManagement.tsx
├── 状态管理
│   ├── flights[]                          (航班列表)
│   ├── pagination                         (分页信息)
│   ├── filters                            (筛选条件)
│   ├── sorter                             (排序条件)
│   ├── selectedRowKeys[]                  (选中行)
│   └── stats                              (统计数据)
├── 组件结构
│   ├── 统计卡片 (Row + Col + Statistic)
│   ├── 筛选表单 (Form + Select + DatePicker)
│   ├── 数据表格 (Table with rowSelection)
│   └── 编辑模态框 (Modal + Form)
└── API 调用
    ├── queryFlightsWithPagination()
    ├── updateFlight()
    ├── deleteFlight()
    ├── batchDeleteFlights()
    └── getAvailableCities()
```

## 权益卡类型说明

### 权益卡类型的业务含义

海南航空随心飞产品提供两种权益卡类型，对应不同的消费等级和可兑换航班范围：

| 数据库值 | 说明 | 可兑换航班 | UI 显示 |
|---------|------|----------|--------|
| **666权益卡航班** | 基础权益卡可兑换的航班 | 666会员 ✅<br>2666会员 ✅ | 蓝色 Tag |
| **2666权益卡航班** | 高级权益卡专享的航班 | 666会员 ❌<br>2666会员 ✅ | 绿色 Tag |
| **666权益卡航班,2666权益卡航班** | 两种权益卡都可兑换的航班 | 666会员 ✅<br>2666会员 ✅ | 两个 Tag（蓝色 + 绿色） |

### 权益卡等级关系

- **2666权益卡 > 666权益卡**（高级权益卡）
- 2666权益卡会员可以兑换所有航班（包括两种类型）
- 666权益卡会员只能兑换"666权益卡航班"

### UI 显示设计

在表格中，权益卡类型按逗号分割后以 tag 的形式显示：

**单个权益卡类型**：
- **666权益卡航班** → 显示为 `[蓝色: 666权益卡航班]`
- **2666权益卡航班** → 显示为 `[绿色: 2666权益卡航班]`

**多个权益卡类型（用逗号分割）**：
- **666权益卡航班,2666权益卡航班** → 显示为 `[蓝色: 666权益卡航班] [绿色: 2666权益卡航班]`

这样的设计既保留了完整的权益卡信息，又通过颜色区分了不同的权益卡类型。

### 使用场景示例

**场景 1**：查询 666 权益卡会员可以兑换的航班
- 筛选条件：权益卡类型 = "666权益卡航班"
- 结果：显示所有 666 权益卡会员可以兑换的航班

**场景 2**：查询 2666 权益卡专享的航班
- 筛选条件：权益卡类型 = "2666权益卡航班"
- 结果：显示仅 2666 权益卡会员可以兑换的航班

**场景 3**：查询所有可用航班
- 筛选条件：权益卡类型 = "全部"
- 结果：显示所有航班（包括两种类型）

## 实施细节

### 后端 API 端点

#### 1. 分页查询航班
**端点**：`GET /api/flights/paginated`

**请求参数**：
```typescript
{
  page?: number;                // 页码（默认 1）
  pageSize?: number;            // 每页数量（默认 10）
  origin?: string;              // 出发地
  destination?: string;         // 目的地
  startDate?: string;           // 开始日期（YYYY-MM-DD）
  endDate?: string;             // 结束日期（YYYY-MM-DD）
  cardType?: string;            // 权益卡类型
  flightNo?: string;            // 航班号（模糊搜索）
  sortBy?: 'departureTime' | 'arrivalTime' | 'flightNo' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}
```

**响应**：
```typescript
{
  flights: Flight[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### 2. 查询单条航班
**端点**：`GET /api/flights/:id`

**响应**：
```typescript
{
  id: number;
  flightNo: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  availableSeats?: number;
  aircraftType?: string;
  cardType: string;
  crawledAt: Date;
}
```

#### 3. 更新航班
**端点**：`PUT /api/flights/:id`

**请求体**：
```typescript
{
  flightNo?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;      // ISO 8601 格式
  arrivalTime?: string;        // ISO 8601 格式
  availableSeats?: number;
  aircraftType?: string;
  cardType?: string;
}
```

**响应**：
```typescript
{
  message: string;
  flight: Flight;
}
```

#### 4. 删除单条航班
**端点**：`DELETE /api/flights/:id`

**响应**：
```typescript
{
  success: boolean;
  message: string;
}
```

#### 5. 批量删除航班
**端点**：`POST /api/flights/batch-delete`

**请求体**：
```typescript
{
  ids: number[];  // 至少 1 个 ID
}
```

**响应**：
```typescript
{
  success: boolean;
  deletedCount: number;
  message: string;
}
```

### 前端页面组件

#### 统计卡片
显示四个关键指标：
- **总航班数**：所有航班的总数
- **今日航班**：出发日期为今天的航班数
- **666权益卡航班**：666权益卡航班数量（666和2666权益卡会员都可以兑换）
- **2666权益卡航班**：2666权益卡航班数量（仅2666权益卡会员可以兑换）

#### 筛选表单
支持以下筛选维度：
- **出发地**：下拉选择（支持搜索）
- **目的地**：下拉选择（支持搜索）
- **日期范围**：日期范围选择器
- **权益卡类型**：下拉选择，包含以下选项：
  - 全部
  - 666权益卡航班
  - 2666权益卡航班
- **航班号**：文本输入（模糊搜索）

#### 数据表格
显示以下列：
- **航班号**：粗体显示，支持排序
- **出发地**：文本
- **目的地**：文本
- **起飞时间**：格式化为 YYYY-MM-DD HH:mm，支持排序
- **到达时间**：格式化为 YYYY-MM-DD HH:mm，支持排序
- **权益卡类型**：两个 tag 组合显示
  - 666权益卡航班：蓝色"666" + 灰色"权益卡航班"
  - 2666权益卡航班：绿色"2666" + 灰色"权益卡航班"
- **可用座位**：数字或"-"
- **操作**：编辑、删除按钮

#### 编辑模态框
包含以下表单字段：
- 航班号（必填）
- 出发地（必填）
- 目的地（必填）
- 起飞时间（必填，带时间选择器）
- 到达时间（必填，带时间选择器）
- 权益卡类型（必填，下拉选择）
- 可用座位（可选，数字输入）
- 机型（可选，文本输入）

### 数据流

#### 初始加载
1. 页面挂载时调用 `loadCities()`，获取城市列表
2. 同时调用 `loadFlights()`，获取第一页航班数据
3. 更新统计数据

#### 筛选操作
1. 用户填写筛选条件，点击"查询"
2. 调用 `handleFilter()` 保存筛选条件
3. 调用 `loadFlights(1, pageSize, newFilters, sorter)`
4. 返回第 1 页的筛选结果

#### 编辑操作
1. 用户点击某行的"编辑"按钮
2. 调用 `handleEdit()` 打开模态框，填充表单
3. 用户修改信息，点击"保存"
4. 调用 `updateFlight()` 提交更新
5. 成功后关闭模态框，刷新表格

#### 删除操作
1. 用户点击某行的"删除"按钮
2. 弹出二次确认对话框
3. 用户确认后调用 `deleteFlight()`
4. 成功后刷新表格

#### 批量删除操作
1. 用户选中多行（勾选复选框）
2. 点击"批量删除"按钮
3. 弹出二次确认对话框（显示选中数量）
4. 用户确认后调用 `batchDeleteFlights()`
5. 成功后清空选中，刷新表格

#### 导出操作
1. 用户点击"导出 Excel"按钮
2. 调用 `handleExport()`
3. 将当前表格数据转换为 Excel 格式
4. 生成文件名：`航班数据_YYYY-MM-DD_HHmmss.xlsx`
5. 自动下载

## 文件清单

### 新增文件
| 文件路径 | 说明 | 行数 |
|---------|------|------|
| `backend/src/modules/flight/dto/query-flights-pagination.dto.ts` | 分页查询 DTO | 40 |
| `backend/src/modules/flight/dto/update-flight.dto.ts` | 更新航班 DTO | 30 |
| `backend/src/modules/flight/dto/batch-delete-flights.dto.ts` | 批量删除 DTO | 10 |
| `frontend/src/pages/FlightManagement.tsx` | 航班管理页面 | 600+ |

### 修改文件
| 文件路径 | 修改内容 | 行数 |
|---------|---------|------|
| `backend/src/modules/flight/flight.service.ts` | 新增 5 个方法 | +120 |
| `backend/src/modules/flight/flight.controller.ts` | 新增 5 个端点 | +80 |
| `frontend/src/api/flight.ts` | 新增 5 个 API 方法 | +50 |
| `frontend/src/App.tsx` | 添加路由 | +2 |
| `frontend/src/components/Layout.tsx` | 添加菜单项 | +5 |
| `frontend/package.json` | 安装 xlsx 依赖 | +2 |

## 测试用例

### 测试 1：分页和筛选
1. 打开 `/flight-management` 页面
2. 选择筛选条件（出发地、目的地、日期范围）
3. 点击"查询"按钮
4. **预期结果**：
   - ✅ 表格显示符合条件的航班
   - ✅ 分页信息正确
   - ✅ 统计卡片数据更新

### 测试 2：编辑航班
1. 点击某条航班的"编辑"按钮
2. 修改航班信息（如起飞时间）
3. 点击"保存"
4. **预期结果**：
   - ✅ 提示"更新成功"
   - ✅ 表格数据自动刷新
   - ✅ 修改后的数据正确显示

### 测试 3：删除航班
1. 点击某条航班的"删除"按钮
2. 确认删除
3. **预期结果**：
   - ✅ 提示"删除成功"
   - ✅ 表格数据自动刷新
   - ✅ 该航班不再显示

### 测试 4：批量删除
1. 选中多条航班（勾选复选框）
2. 点击"批量删除"按钮
3. 确认删除
4. **预期结果**：
   - ✅ 提示"成功删除 X 条航班"
   - ✅ 表格数据自动刷新
   - ✅ 选中的航班全部删除

### 测试 5：导出功能
1. 筛选出部分航班
2. 点击"导出 Excel"按钮
3. **预期结果**：
   - ✅ 自动下载 Excel 文件
   - ✅ 文件名包含时间戳
   - ✅ Excel 内容与表格一致

### 测试 6：排序功能
1. 点击表格列头（起飞时间、到达时间、航班号）
2. **预期结果**：
   - ✅ 表格数据按指定列排序
   - ✅ 支持升序/降序切换
   - ✅ 排序箭头正确显示

## 性能考虑

### 数据库查询优化
- 使用 TypeORM QueryBuilder 构建高效的查询
- 支持分页查询，避免一次加载大量数据
- 时间范围查询使用数据库级别的 BETWEEN 操作符

### 前端性能优化
- 使用 React 函数式组件和 Hooks
- 状态管理使用 useState，避免不必要的重新渲染
- 表格使用虚拟滚动（Ant Design Table 内置）
- Excel 导出使用流式处理

## 安全考虑

### 输入验证
- 后端使用 `class-validator` 装饰器验证所有输入
- 分页参数验证：page >= 1, pageSize >= 1
- 日期参数验证：有效的日期格式
- 批量删除验证：至少包含 1 个 ID

### SQL 注入防护
- 使用 TypeORM QueryBuilder，自动参数化查询
- 模糊搜索使用参数绑定，避免直接字符串拼接

### 数据保护
- 删除操作前需二次确认
- 批量删除操作需二次确认
- 所有修改操作都有日志记录（TypeORM UpdateDateColumn）

## 扩展性

### 可扩展的设计
1. **新增筛选条件**：在 DTO 中新增字段，在 Service 中添加查询条件
2. **新增表格列**：在 Flight 实体中新增字段，在表格列配置中添加
3. **新增操作**：在 Controller 中新增端点，在前端页面中添加按钮

### 性能瓶颈
- 大数据量下的分页查询：已通过分页机制解决
- Excel 导出大文件：可考虑使用流式导出库（如 exceljs）
- 频繁的排序操作：可添加数据库索引优化

## 已知限制

1. **Excel 导出行数限制**：当前表格显示的行数（最多 100 行/页）
   - 解决方案：可添加"导出全部"选项，分批导出

2. **实时更新**：编辑后需要手动刷新
   - 解决方案：可添加 WebSocket 实时推送

3. **并发编辑**：不支持冲突检测
   - 解决方案：可添加版本号字段，实现乐观锁

## 相关文档

- [项目 CLAUDE.md](../CLAUDE.md) - 项目技术栈和开发规范
- [快速开始指南](./QUICK_START.md) - 项目快速上手
- [爬虫分析文档](./CRAWLER_ANALYSIS.md) - 爬虫实现原理

## 更新日志

### v1.0.0 (2026-03-17)
- ✅ 实现完整的航班管理功能
- ✅ 支持分页查询、筛选、排序
- ✅ 支持编辑、删除、批量删除
- ✅ 支持 Excel 导出
- ✅ 实时统计数据展示
