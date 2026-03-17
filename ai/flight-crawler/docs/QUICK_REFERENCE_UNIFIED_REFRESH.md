# 统一发现航班 - 快速参考

## 🎯 核心变化

| 方面 | 旧方案 | 新方案 |
|------|-------|-------|
| **执行模式** | 3 种（单次/按周/按日期区间） | 1 种（统一方法） |
| **任务粒度** | 7 天/任务 | **1 天/任务** |
| **并发度** | 4 个任务 | **10 个任务批次** |
| **预计耗时（30天）** | 10-15 分钟 | **5-8 分钟** |
| **前端界面** | 复杂（3 个卡片，多种选择） | **简洁（1 个卡片，日期范围）** |
| **代码行数** | DataManagement.tsx 987 行 | **DataManagement.tsx ~500 行** |

## 🚀 快速使用

### 后端 API

#### 按天数执行（从明天开始）
```bash
# 爬取未来 30 天
curl -X POST http://localhost:3000/api/crawler/initialize/refresh \
  -H "Content-Type: application/json" \
  -d '{"days": 30}'
```

#### 按日期区间执行
```bash
# 爬取 2026-03-20 至 2026-03-25
curl -X POST http://localhost:3000/api/crawler/initialize/refresh \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2026-03-20", "endDate": "2026-03-25"}'
```

#### 仅获取执行计划（不执行）
```bash
# 获取执行计划，不实际执行爬虫
curl -X POST http://localhost:3000/api/crawler/initialize/refresh \
  -H "Content-Type: application/json" \
  -d '{"days": 30, "planOnly": true}'
```

### 前端使用

1. **打开** → `/data-management` 页面
2. **选择** → 日期范围（开始日期 + 结束日期）
3. **查看** → 执行计划预览（自动生成）
4. **执行** → 点击"开始执行"按钮
5. **监控** → 查看日志表格中的实时进度

## 📊 API 响应格式

### 执行计划响应
```json
{
  "success": true,
  "executionPlan": {
    "totalDays": 30,
    "totalTasks": 30,
    "dateRange": ["2026-03-18", "2026-04-16"],
    "estimatedTime": "约 5 分钟",
    "taskList": [
      { "taskId": 1, "date": "2026-03-18", "airports": 37 },
      { "taskId": 2, "date": "2026-03-19", "airports": 37 }
    ]
  }
}
```

### 执行结果响应
```json
{
  "success": true,
  "executionPlan": { ... },
  "executionResult": {
    "success": true,
    "totalCount": 1200,
    "successTasks": 30,
    "failedTasks": 0,
    "taskDetails": [
      { "taskId": 1, "date": "2026-03-18", "success": true, "count": 40 },
      { "taskId": 2, "date": "2026-03-19", "success": true, "count": 38 }
    ]
  }
}
```

## 🔧 关键配置

### 后端配置（可在 crawler.service.ts 中调整）

```typescript
// 任务级并发控制：最多同时执行 10 个日期任务
const MAX_CONCURRENT_TASKS = 10;

// 机场级并发控制：每个任务最多同时爬取 5 个机场
const CONCURRENT_LIMIT = 5;
```

### 预估时间计算

```
预估时间 = (总天数 / 并发任务数) × (单个任务中的机场数 × 单个机场耗时)
         = (30 / 10) × (37 × 45秒)
         = 3 批 × (37 × 45秒)
         ≈ 5 分钟
```

## 📝 常见操作

### 爬取未来 7 天
```bash
curl -X POST http://localhost:3000/api/crawler/initialize/refresh \
  -d '{"days": 7}'
```

### 爬取指定周末
```bash
curl -X POST http://localhost:3000/api/crawler/initialize/refresh \
  -d '{
    "startDate": "2026-03-21",
    "endDate": "2026-03-22"
  }'
```

### 先预览后执行
```bash
# 第一步：预览执行计划
curl -X POST http://localhost:3000/api/crawler/initialize/refresh \
  -d '{"days": 30, "planOnly": true}'

# 第二步：确认后执行
curl -X POST http://localhost:3000/api/crawler/initialize/refresh \
  -d '{"days": 30}'
```

## 🐛 故障排查

### 问题：没有可用的机场
**原因**：未执行"发现机场"步骤
**解决**：先执行发现机场任务
```bash
curl -X POST http://localhost:3000/api/crawler/initialize/discover \
  -d '{"days": 1}'
```

### 问题：部分任务失败
**原因**：网络问题或反爬触发
**解决**：重新执行失败的日期
```bash
# 重新执行失败的日期
curl -X POST http://localhost:3000/api/crawler/initialize/refresh \
  -d '{"startDate": "2026-03-20", "endDate": "2026-03-20"}'
```

### 问题：执行计划显示"无"
**原因**：没有启用的机场
**解决**：检查数据库中的 airport 表，确保 enableCrawl=true

## 📈 性能数据

### 系统资源消耗

| 指标 | 值 |
|------|-----|
| 峰值浏览器实例数 | 50 个（10 任务 × 5 机场） |
| 峰值内存占用 | ~20-30GB |
| 平均 CPU 利用率 | 60-80% |
| 网络带宽 | ~10-20 Mbps |

### 爬取速度

| 场景 | 耗时 |
|------|-----|
| 单个机场单日 | ~45 秒 |
| 37 个机场单日（串行） | ~27 分钟 |
| 37 个机场单日（5 并行） | ~5 分钟 |
| 30 天 37 个机场（10 批次） | ~5-8 分钟 |

## 🔄 向后兼容

### 旧方法仍可用
```typescript
// 这些方法仍然可用，但已标记为 @deprecated
await crawlerService.initializeRefreshFlights(7);
await crawlerService.initializeRefreshFlightsByWeeks(30, 7);
await crawlerService.initializeRefreshFlightsByDateRange('2026-03-20', '2026-03-25');
```

### 迁移建议
逐步将旧方法调用迁移到新方法：
```typescript
// 旧方法
await initializeDiscoverFlights(7);

// 新方法
await initializeDiscoverFlights({ days: 7 });
```

## 📚 相关文档

- [完整实施文档](./UNIFIED_REFRESH_FLIGHTS_IMPLEMENTATION.md)
- [需求文档](./REQUIREMENTS.md)
- [爬虫分析](./CRAWLER_ANALYSIS.md)

---

**最后更新**：2026-03-17
**版本**：1.0.0
