# 往返航班查询功能说明

## 功能概述

在目的地查询页面中，新增了往返航班的展示功能，用户可以：
1. 在目的地列表中直观地看到哪些目的地支持往返
2. 查看每个目的地的去程和返程航班数量及可用日期
3. 点击"查看详情"按钮，查看完整的往返航班信息

## 功能实现

### 后端改动

#### 1. 数据模型扩展 (`destination-result.dto.ts`)

```typescript
export class DestinationResultDto {
  destination: string;
  flightCount: number;              // 去程航班数量
  availableDates: string[];         // 去程可用日期
  cardTypes: string[];              // 权益卡类型
  hasReturn: boolean;               // 是否有返程航班（新增）
  returnFlightCount?: number;       // 返程航班数量（新增）
  returnAvailableDates?: string[];  // 返程可用日期（新增）
}

export class RoundTripFlightsDto {
  outboundFlights: Flight[];        // 去程航班列表（新增）
  returnFlights: Flight[];          // 返程航班列表（新增）
}
```

#### 2. FlightService 改进

**`queryDestinations()` 方法增强**：
- 查询去程航班后，自动查询返程航班信息
- 对每个目的地，查询从目的地返回起点的航班
- 统计返程航班数量和可用日期
- 标记是否支持往返（`hasReturn`）

**新增 `queryRoundTripFlights()` 方法**：
- 同时查询去程和返程航班详情
- 应用相同的日期范围和权益卡类型过滤
- 返回完整的往返航班列表

#### 3. 新增 API 端点

```
GET /api/flights/round-trip
参数：
  - origin: 出发地
  - destination: 目的地
  - startDate: 开始日期
  - endDate: 结束日期
  - flightType: 权益卡类型（可选）

响应：
{
  "outboundFlights": [...],  // 去程航班数组
  "returnFlights": [...]     // 返程航班数组
}
```

### 前端改动

#### 1. 目的地列表展示优化

**新增列**：
- **目的地列**：显示"可往返"标签（绿色 Tag）
- **去程航班列**：显示航班数量和可用日期天数
- **返程航班列**（新增）：
  - 有返程：显示航班数量和可用日期天数
  - 无返程：显示"无返程"（灰色文字）

#### 2. 航班详情 Modal 改进

**分段展示**：
- **去程航班区域**：
  - 标题：`去程航班：起点 → 目的地`
  - 表格展示所有去程航班
  - 分页显示（每页 5 条）

- **返程航班区域**：
  - 标题：`返程航班：目的地 → 起点`
  - 表格展示所有返程航班
  - 无返程时显示"暂无返程航班"提示

**Modal 标题**：`起点 ⇄ 目的地 - 往返航班详情`

## 使用场景

### 场景 1：快速筛选可往返目的地

用户在目的地列表中可以一眼看到哪些城市支持往返：
- 带有"可往返"绿色标签的目的地表示可以往返
- 返程航班列显示具体的返程航班数量

### 场景 2：对比去程和返程航班

用户点击"查看详情"后，可以在同一个页面中：
- 对比去程和返程的航班时间
- 选择合适的往返航班组合
- 查看不同日期的航班选择

### 场景 3：规划往返行程

用户可以根据往返航班信息：
- 确认目的地是否支持当天往返
- 查看不同日期的往返航班密度
- 规划合理的出行时间

## 技术亮点

1. **智能查询优化**：
   - 在目的地查询阶段就完成返程航班统计
   - 避免前端多次请求
   - 提升用户体验

2. **数据一致性**：
   - 去程和返程应用相同的日期范围和权益卡类型过滤
   - 确保查询结果的一致性

3. **UI 友好**：
   - 清晰的视觉标识（"可往返"标签）
   - 分段展示去程和返程，避免混淆
   - 无返程时的友好提示

## 测试示例

### 测试 1：查询目的地（包含往返信息）

```bash
curl "http://localhost:3000/api/flights/destinations?origin=北京首都&startDate=2026-03-16&endDate=2026-04-16&flightType=全部"
```

**预期结果**：
```json
{
  "destinations": [
    {
      "destination": "广州",
      "flightCount": 7,
      "availableDates": ["2026-03-17", ...],
      "cardTypes": ["666权益卡航班", "2666权益卡航班"],
      "hasReturn": true,
      "returnFlightCount": 14,
      "returnAvailableDates": ["2026-03-17", ...]
    }
  ]
}
```

### 测试 2：查询往返航班详情

```bash
curl "http://localhost:3000/api/flights/round-trip?origin=北京首都&destination=广州&startDate=2026-03-17&endDate=2026-03-20&flightType=全部"
```

**预期结果**：
```json
{
  "outboundFlights": [
    {
      "flightNo": "HU7815",
      "origin": "北京首都",
      "destination": "广州",
      "departureTime": "2026-03-17T12:30:00.000Z",
      ...
    }
  ],
  "returnFlights": [
    {
      "flightNo": "HU7814",
      "origin": "广州",
      "destination": "北京首都",
      "departureTime": "2026-03-17T12:15:00.000Z",
      ...
    }
  ]
}
```

## 后续优化建议

1. **往返组合推荐**：
   - 自动推荐合理的往返航班组合
   - 根据时间间隔和价格评分

2. **往返日期灵活性**：
   - 支持去程和返程设置不同的日期范围
   - 适应更多出行场景

3. **往返价格展示**：
   - 如果有价格信息，显示往返总价
   - 提供价格排序功能

4. **日历视图**：
   - 在日历上直观展示往返航班的可用日期
   - 方便用户选择最佳出行日期

## 文件变更清单

### 后端
- `backend/src/modules/flight/dto/destination-result.dto.ts` - 扩展 DTO
- `backend/src/modules/flight/flight.service.ts` - 增强查询逻辑
- `backend/src/modules/flight/flight.controller.ts` - 新增 API 端点

### 前端
- `frontend/src/api/flight.ts` - 新增 API 调用方法
- `frontend/src/pages/DestinationQuery.tsx` - UI 改进

## 总结

往返航班查询功能为用户提供了更完整的航班信息，使得行程规划更加便捷。通过在目的地列表中直接展示往返信息，用户可以快速筛选出符合需求的目的地，并通过详情页面查看完整的往返航班信息。
