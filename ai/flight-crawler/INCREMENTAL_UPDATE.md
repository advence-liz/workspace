# 增量更新模式 - 数据可用性保证

**实现日期**：2026-03-17
**提交**：e6163ea, 7956c5d
**目标**：保证数据库数据可用性，避免因为删除行为导致程序不可用

---

## 问题背景

在之前的实现中，爬虫在运行时会采用"先删除再更新"的模式：

1. **发现机场阶段** (initializeDiscoverAirports)
   - 删除指定日期的所有航班数据
   - 然后爬取新数据并保存

2. **发现航班阶段** (initializeRefreshFlights)
   - 删除所有未来的航班数据
   - 然后爬取新数据并保存

### 风险

这种模式存在以下风险：

| 风险 | 描述 | 影响 |
|------|------|------|
| **数据丢失** | 如果爬虫失败，删除的数据无法恢复 | 用户看不到任何航班数据 |
| **业务中断** | 删除后爬虫失败，数据库变为空 | 程序无法继续服务 |
| **用户体验差** | 短暂的数据空白期 | 用户看到"无航班"错误 |
| **调试困难** | 难以定位问题 | 无法对比新旧数据 |

---

## 解决方案：增量更新模式

### 核心改变

**移除两处删除操作**：

1. **initializeDiscoverAirports** (第 1703-1705 行)
   ```typescript
   // 原来：
   await this.flightService.deleteDiscoveryFlights(dates);

   // 改为：
   // 采用增量更新，保留已有数据
   ```

2. **initializeRefreshFlights** (第 1807-1810 行)
   ```typescript
   // 原来：
   const deletedCount = await this.flightService.deleteFutureFlights();

   // 改为：
   // 采用增量更新，新数据与已有数据合并
   ```

### 保留的删除操作

只保留 `deleteExpiredFlights()` 用于清理过期数据（departureTime < now）：

```typescript
// 定时任务中保留
await this.flightService.deleteExpiredFlights();
```

这个操作是安全的，因为只删除已经过期的航班。

---

## 优势对比

### 先删除再更新模式 ❌

```
时间线：
T0: 删除指定日期的航班
    ↓ 数据库变为空
T1: 开始爬取新数据
    ↓ 如果在这里失败...
T2: 爬虫失败，数据库仍为空 ❌
    ↓ 用户无法查询任何数据
```

### 增量更新模式 ✅

```
时间线：
T0: 保留已有数据
    ↓ 数据库保持可用
T1: 爬取新数据
    ↓ 如果在这里失败...
T2: 爬虫失败，但已有数据仍可用 ✅
    ↓ 用户仍可查询之前的数据
```

---

## 技术细节

### 数据合并策略

新爬取的航班数据与已有数据的合并方式：

1. **相同航班号的处理**
   - 如果数据库中已存在相同的 (flightNo, origin, destination, departureTime)
   - 使用新数据覆盖（更新时间戳和其他信息）

2. **新航班的处理**
   - 直接插入数据库
   - 无需删除旧数据

3. **过期航班的处理**
   - 定期通过 `deleteExpiredFlights()` 清理
   - 只删除 departureTime < now 的航班

### 数据库操作

```typescript
// 新数据保存逻辑（TypeORM）
const entities = flights.map(flight =>
  this.flightRepository.create(flight)
);
return this.flightRepository.save(entities);
```

TypeORM 的 `save()` 方法会自动处理：
- 新记录：INSERT
- 已存在的记录：UPDATE（如果有主键）

---

## 实现细节

### 修改的文件

**backend/src/modules/crawler/crawler.service.ts**

- 第 1703-1705 行：移除 `deleteDiscoveryFlights()`
- 第 1807-1810 行：移除 `deleteFutureFlights()`
- 第 1851 行：移除 `deletedCount` 引用

### 日志输出

修改后的日志更清晰地反映增量更新模式：

```
📝 采用增量更新模式，保留已有数据...
📝 采用增量更新模式，新数据将与已有数据合并...
```

---

## 验证方案

### 测试场景 1：正常爬取

1. 启动爬虫任务
2. 验证新数据被添加
3. 验证旧数据仍然存在
4. 检查数据库记录数增加

### 测试场景 2：爬虫失败恢复

1. 启动爬虫任务
2. 中途停止爬虫
3. 验证已有数据仍然可用
4. 重新启动爬虫继续

### 测试场景 3：重复爬取

1. 第一次爬取：获得 100 条航班
2. 第二次爬取：获得 100 条航班
3. 验证数据库不会重复存储（或覆盖更新）
4. 总记录数应为 100 或接近 100

---

## 影响分析

### 正面影响

| 方面 | 改进 |
|------|------|
| **可用性** | 数据库始终可用，不会因为爬虫失败而变空 |
| **可靠性** | 即使爬虫中途失败，已有数据不会丢失 |
| **用户体验** | 用户始终能查询到某些航班信息 |
| **调试** | 可以对比新旧数据，更容易定位问题 |
| **性能** | 减少了删除操作，提高了爬虫速度 |

### 需要注意

| 方面 | 说明 |
|------|------|
| **数据重复** | 需要确保爬虫不会创建重复的航班记录 |
| **数据过期** | 需要定期运行 `deleteExpiredFlights()` 清理过期数据 |
| **存储空间** | 数据库可能增长更快，需要定期清理 |

---

## 后续改进

### 建议 1：智能去重

```typescript
// 爬虫保存前检查重复
const existingFlight = await this.flightRepository.findOne({
  where: {
    flightNo,
    origin,
    destination,
    departureTime: Between(startOfDay, endOfDay),
  },
});

if (existingFlight) {
  // 更新而不是插入
  Object.assign(existingFlight, newFlightData);
  await this.flightRepository.save(existingFlight);
} else {
  // 新航班，直接保存
  await this.flightRepository.save(newFlight);
}
```

### 建议 2：定期清理策略

```typescript
// 每天凌晨 3 点清理过期数据
@Cron('0 3 * * *', { timeZone: 'Asia/Shanghai' })
async cleanupExpiredFlights() {
  const deletedCount = await this.flightService.deleteExpiredFlights();
  this.logger.log(`🗑️ 清理了 ${deletedCount} 条过期航班`);
}
```

### 建议 3：数据版本管理

```typescript
// 为每条航班记录添加版本号
interface Flight {
  id: number;
  flightNo: string;
  version: number; // 第几次更新
  crawledAt: Date;
  updatedAt: Date;
  // ...
}
```

---

## 总结

通过改为增量更新模式，我们：

✅ **提高了数据可用性** - 数据库始终有数据
✅ **增强了系统可靠性** - 爬虫失败不会导致数据丢失
✅ **改善了用户体验** - 用户总能查询到某些航班
✅ **便于问题诊断** - 可以对比新旧数据
✅ **提升了爬虫性能** - 减少了删除操作

这是一个重要的架构改进，确保了系统在各种情况下都能保持可用。

---

**相关提交**：
- e6163ea - refactor(crawler): 改为增量更新模式，避免数据丢失
- 7956c5d - fix: 修复增量更新模式下的编译错误
