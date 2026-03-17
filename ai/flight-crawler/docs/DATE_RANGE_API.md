# 日期区间查询功能文档

**功能**: 支持按指定日期区间爬取航班数据

**版本**: v2.0

**更新日期**: 2026-03-17

---

## 🎯 功能概述

新增了按日期区间爬取航班数据的功能，用户可以指定具体的起始日期和结束日期，系统会自动拆分任务并行执行。

### 核心特性

✅ **灵活的日期区间**: 支持指定任意起止日期
✅ **自动任务拆分**: 根据 `daysPerTask` 自动拆分成多个并行任务
✅ **按天精确删除**: 每个任务只删除自己日期范围的旧数据
✅ **并行执行**: 多个任务同时执行，提升效率
✅ **数据完整性**: 保证所有日期的数据都正确保存

---

## 🚀 API 接口

### 1. 按日期区间爬取（新增）

**接口**: `POST /api/crawler/initialize/refresh-by-date-range`

**请求参数**:

```json
{
  "startDate": "2026-03-20",    // 必填，开始日期（格式：YYYY-MM-DD）
  "endDate": "2026-03-25",      // 必填，结束日期（格式：YYYY-MM-DD）
  "daysPerTask": 3              // 可选，每个任务的天数，默认 7
}
```

**响应示例**:

```json
{
  "message": "航班发现完成！日期区间 2026-03-20 至 2026-03-25，总计爬取 950 条航班，分 2 个任务执行",
  "success": true,
  "totalCount": 950,
  "tasks": [
    {
      "taskIndex": 1,
      "startDate": "2026-03-20",
      "endDate": "2026-03-22",
      "days": 3,
      "success": true,
      "count": 480
    },
    {
      "taskIndex": 2,
      "startDate": "2026-03-23",
      "endDate": "2026-03-25",
      "days": 3,
      "success": true,
      "count": 470
    }
  ]
}
```

---

### 2. 按天数爬取（原有功能）

**接口**: `POST /api/crawler/initialize/refresh-by-weeks`

**请求参数**:

```json
{
  "totalDays": 30,     // 可选，总天数，默认 30
  "daysPerTask": 7     // 可选，每个任务的天数，默认 7
}
```

**说明**: 从明天开始计算，爬取未来 N 天的数据

---

## 📝 使用示例

### 示例 1: 爬取指定3天数据

```bash
curl -X POST "http://localhost:3000/api/crawler/initialize/refresh-by-date-range" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-03-23",
    "endDate": "2026-03-25",
    "daysPerTask": 2
  }'
```

**效果**:
- 任务1: 爬取 3月23-24日（2天）
- 任务2: 爬取 3月25日（1天）
- 并行执行，总耗时约 4-5 分钟

---

### 示例 2: 爬取一周数据，每天一个任务

```bash
curl -X POST "http://localhost:3000/api/crawler/initialize/refresh-by-date-range" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-03-20",
    "endDate": "2026-03-26",
    "daysPerTask": 1
  }'
```

**效果**:
- 7个任务并行执行
- 每个任务爬取1天数据
- 总耗时约 4-5 分钟

---

### 示例 3: 爬取一个月数据

```bash
curl -X POST "http://localhost:3000/api/crawler/initialize/refresh-by-date-range" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-03-18",
    "endDate": "2026-04-17",
    "daysPerTask": 7
  }'
```

**效果**:
- 5个任务并行执行（7+7+7+7+3天）
- 总耗时约 7-8 分钟

---

### 示例 4: 补充爬取缺失日期

```bash
# 假设发现 3月20-22日 的数据有问题，需要重新爬取
curl -X POST "http://localhost:3000/api/crawler/initialize/refresh-by-date-range" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-03-20",
    "endDate": "2026-03-22",
    "daysPerTask": 3
  }'
```

**效果**:
- 1个任务爬取 3月20-22日
- 旧数据会被删除，替换为新数据

---

## 🔄 与原有功能的对比

| 功能 | 按天数爬取 | 按日期区间爬取 |
|------|-----------|---------------|
| API路径 | `/refresh-by-weeks` | `/refresh-by-date-range` |
| 日期指定方式 | 相对天数（从明天开始） | 绝对日期（指定起止日期） |
| 适用场景 | 定期全量更新 | 补充特定日期、灵活查询 |
| 参数 | `totalDays`, `daysPerTask` | `startDate`, `endDate`, `daysPerTask` |
| 示例 | 爬取未来30天 | 爬取3月20-25日 |

---

## 💡 使用场景

### 场景 1: 补充历史数据

```bash
# 发现3月15-18日的数据缺失，补充爬取
curl -X POST ".../refresh-by-date-range" \
  -d '{"startDate": "2026-03-15", "endDate": "2026-03-18", "daysPerTask": 2}'
```

### 场景 2: 更新特定日期

```bash
# 3月20日的航班有变动，重新爬取
curl -X POST ".../refresh-by-date-range" \
  -d '{"startDate": "2026-03-20", "endDate": "2026-03-20", "daysPerTask": 1}'
```

### 场景 3: 灵活的日期范围

```bash
# 只需要爬取下周的数据（3月24-30日）
curl -X POST ".../refresh-by-date-range" \
  -d '{"startDate": "2026-03-24", "endDate": "2026-03-30", "daysPerTask": 3}'
```

### 场景 4: 测试验证

```bash
# 快速测试，只爬取2天数据
curl -X POST ".../refresh-by-date-range" \
  -d '{"startDate": "2026-03-23", "endDate": "2026-03-24", "daysPerTask": 1}'
```

---

## 📊 任务拆分逻辑

### 拆分规则

**输入**: `startDate`, `endDate`, `daysPerTask`

**步骤**:
1. 生成日期列表：从 `startDate` 到 `endDate` 的所有日期
2. 按 `daysPerTask` 拆分成多个任务
3. 每个任务爬取一个连续的日期范围

### 示例

**输入**:
```json
{
  "startDate": "2026-03-20",
  "endDate": "2026-03-25",
  "daysPerTask": 3
}
```

**日期列表**:
```
["2026-03-20", "2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24", "2026-03-25"]
总共 6 天
```

**任务拆分**:
```
任务1: ["2026-03-20", "2026-03-21", "2026-03-22"]  (3天)
任务2: ["2026-03-23", "2026-03-24", "2026-03-25"]  (3天)
```

**执行方式**: 2个任务并行执行

---

## ⚠️ 注意事项

### 1. 日期格式

- ✅ 正确: `"2026-03-20"`
- ❌ 错误: `"2026/03/20"`, `"20-03-2026"`, `"2026-3-20"`

### 2. 日期范围

- `startDate` 必须 ≤ `endDate`
- 建议单次爬取不超过 30 天
- 日期范围过大会增加执行时间

### 3. 并发限制

- 系统同一时间只能运行一个批量任务
- 如果有任务正在运行，新任务会被拒绝
- 可以通过 `/api/crawler/logs-stats` 查看任务状态

### 4. 数据覆盖

- 每次爬取会**删除**指定日期范围的旧数据
- 确保不会误删其他日期的数据
- 数据按天维度完全独立

---

## 🔍 监控和验证

### 查看任务状态

```bash
curl "http://localhost:3000/api/crawler/logs-stats" | jq '.'
```

### 查看任务列表

```bash
curl "http://localhost:3000/api/crawler/logs?page=1&pageSize=10" | jq '.'
```

### 验证数据

```bash
# 查看数据库中的日期分布
sqlite3 /path/to/flight-crawler.db \
  "SELECT DATE(departureTime), COUNT(*) FROM flights GROUP BY DATE(departureTime);"
```

---

## 🚀 性能参考

| 日期范围 | 任务数 | daysPerTask | 预计耗时 |
|---------|--------|-------------|----------|
| 1天 | 1 | 1 | ~4分钟 |
| 3天 | 3 | 1 | ~4-5分钟 |
| 7天 | 1 | 7 | ~6-7分钟 |
| 7天 | 7 | 1 | ~4-5分钟 |
| 30天 | 5 | 7 | ~7-8分钟 |

**说明**:
- 并行执行时，总耗时约等于最长任务的耗时
- 单个任务耗时取决于日期范围和机场数量
- 建议 `daysPerTask` 设置为 1-7 天

---

## 📝 错误处理

### 错误 1: 日期格式错误

**请求**:
```json
{"startDate": "2026/03/20", "endDate": "2026-03-25"}
```

**响应**:
```json
{
  "success": false,
  "message": "航班发现失败",
  "totalCount": 0,
  "tasks": []
}
```

### 错误 2: 开始日期晚于结束日期

**请求**:
```json
{"startDate": "2026-03-25", "endDate": "2026-03-20"}
```

**响应**:
```json
{
  "success": false,
  "message": "航班发现失败",
  "totalCount": 0,
  "tasks": []
}
```

### 错误 3: 任务正在运行

**响应**:
```json
{
  "success": false,
  "message": "航班发现失败",
  "totalCount": 0,
  "tasks": []
}
```

**解决**: 等待当前任务完成后再提交新任务

---

## 🎉 总结

### 新功能优势

✅ **灵活性**: 可以指定任意日期区间
✅ **精确性**: 按天维度精确控制
✅ **高效性**: 并行执行，速度快
✅ **可靠性**: 数据完整，无覆盖
✅ **易用性**: API 简单，参数清晰

### 推荐用法

- **日常更新**: 使用 `/refresh-by-weeks`，爬取未来30天
- **补充数据**: 使用 `/refresh-by-date-range`，指定缺失日期
- **灵活查询**: 使用 `/refresh-by-date-range`，按需爬取

---

**文档版本**: v2.0
**最后更新**: 2026-03-17
**状态**: ✅ 生产就绪
