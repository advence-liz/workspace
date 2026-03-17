# 修复并行任务数据相互覆盖问题

## 问题描述

当前并行执行多个爬虫任务时，存在数据相互覆盖的问题：

### 期望行为
- 任务1爬取3月18-24日 → 只删除3月18-24日的旧数据 → 保存新数据
- 任务2爬取3月25-31日 → 只删除3月25-31日的旧数据 → 保存新数据
- 最终数据库包含：3月18-24日 + 3月25-31日 + ... 完整的30天数据

### 实际行为
- 任务1完成 → 删除所有未来数据 → 保存3月18-24日
- 任务2完成 → 删除所有未来数据（包括任务1的数据）→ 保存3月25-31日
- 最终数据库只包含：最后完成任务的数据

## 根本原因

### 问题代码

**文件**: `backend/src/modules/crawler/crawler.service.ts:2218`

```typescript
// 当前实现：删除所有未来数据
const deletedCount = await this.flightService.deleteFutureFlights();
```

**文件**: `backend/src/modules/flight/flight.service.ts:235-244`

```typescript
async deleteFutureFlights(): Promise<number> {
  const now = new Date();
  const result = await this.flightRepository
    .createQueryBuilder()
    .delete()
    .where('departureTime >= :now', { now })  // ⚠️ 删除所有未来的航班
    .execute();
  return result.affected || 0;
}
```

**问题**: `deleteFutureFlights()` 删除所有 `departureTime >= NOW()` 的航班，不区分任务的日期范围。

## 修复方案

### 方案1: 使用现有的 `deleteDiscoveryFlights()` 方法（推荐）⭐

**优点**:
- 代码已存在，只需修改调用方式
- 逻辑清晰，按日期范围精确删除
- 不影响其他功能

**修改步骤**:

#### 1. 修改 `executeWeekTaskWithoutLock()` 方法

**文件**: `backend/src/modules/crawler/crawler.service.ts`

**位置**: 第2215-2222行

**修改前**:
```typescript
// 爬取完成后，删除旧数据并保存新数据（一次性操作，最小化空白期）
if (allCollectedFlights.length > 0) {
  this.logger.log(`🔄 开始替换数据：删除旧数据并保存 ${allCollectedFlights.length} 条新数据...`);
  const deletedCount = await this.flightService.deleteFutureFlights();
  this.logger.log(`🗑️ 已删除 ${deletedCount} 条旧数据`);
  await this.flightService.saveFlights(allCollectedFlights);
  this.logger.log(`✅ 已保存 ${allCollectedFlights.length} 条新数据`);
}
```

**修改后**:
```typescript
// 爬取完成后，删除本任务日期范围的旧数据并保存新数据
this.logger.log(`🔄 开始替换数据：删除 ${dates[0]} 至 ${dates[dates.length - 1]} 的旧数据...`);

// 先删除本任务日期范围的旧数据（无论是否爬到新数据）
const deletedCount = await this.flightService.deleteDiscoveryFlights(dates);
this.logger.log(`🗑️ 已删除 ${deletedCount} 条旧数据（日期范围: ${dates[0]} ~ ${dates[dates.length - 1]}）`);

// 如果爬到了新数据，则保存
if (allCollectedFlights.length > 0) {
  await this.flightService.saveFlights(allCollectedFlights);
  this.logger.log(`✅ 已保存 ${allCollectedFlights.length} 条新数据`);
} else {
  this.logger.warn(`⚠️ 本任务未爬取到数据，已清空该日期范围的旧数据`);
}
```

**关键改动**:
1. 使用 `deleteDiscoveryFlights(dates)` 替代 `deleteFutureFlights()`
2. 删除逻辑移到 `if` 外面，即使没爬到数据也要删除旧数据
3. 明确记录删除的日期范围

---

### 方案2: 添加新的按日期范围删除方法

如果不想修改 `deleteDiscoveryFlights()` 的语义，可以新增一个方法：

**文件**: `backend/src/modules/flight/flight.service.ts`

**添加新方法**:
```typescript
/**
 * 删除指定日期范围的航班数据（用于按周任务精确清理）
 * @param startDate 开始日期（包含）
 * @param endDate 结束日期（包含）
 * @returns 删除的记录数
 */
async deleteFlightsByDateRange(startDate: string, endDate: string): Promise<number> {
  const startOfDay = new Date(startDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await this.flightRepository
    .createQueryBuilder()
    .delete()
    .where('departureTime >= :start AND departureTime <= :end', {
      start: startOfDay,
      end: endOfDay,
    })
    .execute();

  return result.affected || 0;
}
```

**调用方式**:
```typescript
const deletedCount = await this.flightService.deleteFlightsByDateRange(
  dates[0],
  dates[dates.length - 1]
);
```

---

## 测试验证

### 测试步骤

1. 应用修复后，重新执行30天任务：
```bash
curl -X POST "http://localhost:3000/api/crawler/initialize/refresh-by-weeks" \
  -H "Content-Type: application/json" \
  -d '{"totalDays": 30, "daysPerTask": 7}'
```

2. 等待所有任务完成（约7-8分钟）

3. 验证数据完整性：
```bash
# 查看每天的数据量
sqlite3 "/Users/liz/liz/workspace/ai/flight-crawler/backend/data/flight-crawler.db" \
  "SELECT DATE(departureTime) as date, COUNT(*) as count
   FROM flights
   GROUP BY DATE(departureTime)
   ORDER BY date;"

# 验证日期范围
sqlite3 "/Users/liz/liz/workspace/ai/flight-crawler/backend/data/flight-crawler.db" \
  "SELECT MIN(DATE(departureTime)), MAX(DATE(departureTime)), COUNT(*)
   FROM flights;"
```

### 预期结果

**修复前**:
- 数据库只有最后完成任务的日期范围数据
- 示例：只有4月15-16日（178条）

**修复后**:
- 数据库包含完整的30天数据
- 示例：3月18日-4月16日（约5000-8000条）
- 每个日期都有数据分布

---

## 风险评估

### 低风险 ✅

- 修改范围小，只涉及删除逻辑
- `deleteDiscoveryFlights()` 方法已存在且经过测试
- 不影响其他功能（发现机场、单次执行等）

### 回滚方案

如果修复后出现问题，可以立即回滚：

```typescript
// 恢复原代码
if (allCollectedFlights.length > 0) {
  const deletedCount = await this.flightService.deleteFutureFlights();
  await this.flightService.saveFlights(allCollectedFlights);
}
```

---

## 额外优化建议

### 1. 添加数据完整性检查

在所有任务完成后，验证数据完整性：

```typescript
// 在 initializeRefreshFlightsByWeeks() 的 finally 块中
const stats = await this.flightService.getFlightStatsByDateRange(
  firstDate,
  lastDate
);

this.logger.log(`📊 数据完整性检查: ${stats.totalDays}天中有 ${stats.daysWithData}天有数据`);
if (stats.daysWithData < stats.totalDays) {
  this.logger.warn(`⚠️ 数据不完整！缺少 ${stats.totalDays - stats.daysWithData} 天的数据`);
}
```

### 2. 添加任务协调机制

记录每个任务的日期范围，避免重复爬取：

```typescript
// 在任务开始前检查是否有其他任务正在处理相同日期范围
const overlappingTask = await this.checkOverlappingTask(dates);
if (overlappingTask) {
  this.logger.warn(`⚠️ 日期范围 ${dates[0]}-${dates[dates.length-1]} 正在被任务 ${overlappingTask.id} 处理`);
  return { success: false, count: 0 };
}
```

---

## 总结

**当前问题**: 并行任务使用 `deleteFutureFlights()` 删除所有未来数据，导致相互覆盖。

**修复方案**: 使用 `deleteDiscoveryFlights(dates)` 按任务的日期范围精确删除。

**修改文件**:
- `backend/src/modules/crawler/crawler.service.ts` (第2215-2222行)

**修改行数**: 约10行代码

**预期效果**:
- 并行任务不再相互覆盖
- 数据库包含完整的30天数据
- 每个任务独立管理自己的日期范围

**建议**: 立即应用修复，并进行完整测试。
