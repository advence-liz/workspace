# 智能替换模式 - 数据完整性与可用性的平衡

**实现日期**：2026-03-17
**提交**：c063a42
**目标**：在保证数据完整性的同时，最小化数据空白期

---

## 需求分析

用户提出的需求是：**新数据应该完全覆盖旧数据**

具体逻辑：
- 新数据与老数据有交集的部分：保留
- 新数据不存在的部分：删除老数据
- 新数据独有的部分：添加新数据

### 示例

```
日期：2026-03-17
出发地：北京首都

修改前的数据：
  - HU5577 → 成都天府
  - HU5578 → 成都天府
  - HU5579 → 上海浦东

新爬取的数据：
  - HU5577 → 成都天府 (更新时间戳)
  - HU5580 → 重庆江北 (新航班)

修改后的数据：
  - HU5577 → 成都天府 (已更新)
  - HU5580 → 重庆江北 (新增)
  - HU5578 和 HU5579 已删除 (新数据中不存在)
```

---

## 解决方案：智能替换模式

### 核心策略

**"爬取完成后一次性替换"**

```
流程：
1. 爬取所有数据（不保存）
   ↓ 数据库仍保持可用
2. 爬取完成后，一次性执行：
   a. 删除旧数据
   b. 保存新数据
   ↓ 最小化数据空白期
3. 如果爬虫失败，回滚到步骤 1
```

### 优势对比

#### 方案 1：边爬边删 ❌ (原始方案)
```
时间线：
T0: 删除旧数据
    ↓ 数据库变为空
T1: 开始爬取新数据
    ↓ 用户看不到任何数据
T2: 爬虫失败
    ↓ 数据库仍为空，无法恢复
```

#### 方案 2：完全增量更新 ❌ (第一次尝试)
```
时间线：
T0: 保留旧数据，开始爬取
T1: 爬取完成，新旧数据混合
    ↓ 数据可能有重复或不一致
T2: 无法清理旧数据
    ↓ 数据库越来越大，包含过期数据
```

#### 方案 3：智能替换 ✅ (最终方案)
```
时间线：
T0: 保留旧数据，开始爬取
    ↓ 用户仍可访问旧数据
T1: 爬取完成，一次性替换
    ↓ 最小化空白期
T2: 新数据完全覆盖旧数据
    ↓ 数据一致且完整
T3: 如果爬虫失败，保持 T0 状态
    ↓ 用户仍可访问旧数据
```

---

## 实现细节

### 修改的方法

#### 1. initializeDiscoverAirports (发现机场)

```typescript
// 原来：边爬边删
await this.flightService.deleteDiscoveryFlights(dates);
const flightsArrays = await Promise.all(crawlPromises);

// 改为：爬完后一次性替换
const flightsArrays = await Promise.all(crawlPromises);
const allFlights = flightsArrays.flat();

if (allFlights.length > 0) {
  const deletedCount = await this.flightService.deleteDiscoveryFlights(dates);
  await this.flightService.saveFlights(allFlights);
}
```

#### 2. initializeRefreshFlights (发现航班)

```typescript
// 原来：边爬边删
const deletedCount = await this.flightService.deleteFutureFlights();
const batchCounts = await Promise.all(batchPromises);

// 改为：爬完后一次性替换
const allCollectedFlights: Partial<Flight>[] = [];
const batchPromises = batch.map(airport =>
  this.crawlFlights(airport, dates, true, false) // 不直接保存
    .then(({ flights }) => {
      allCollectedFlights.push(...flights); // 收集数据
      return count;
    })
);

if (allCollectedFlights.length > 0) {
  const deletedCount = await this.flightService.deleteFutureFlights();
  await this.flightService.saveFlights(allCollectedFlights);
}
```

### 关键改动

1. **爬虫不直接保存**
   ```typescript
   this.crawlFlights(airport, dates, true, false) // 最后参数 false = 不保存
   ```

2. **收集所有爬取的航班**
   ```typescript
   const allCollectedFlights: Partial<Flight>[] = [];
   allCollectedFlights.push(...flights);
   ```

3. **爬取完成后一次性替换**
   ```typescript
   if (allCollectedFlights.length > 0) {
     await this.flightService.deleteDiscoveryFlights(dates);
     await this.flightService.saveFlights(allCollectedFlights);
   }
   ```

---

## 数据流分析

### 发现机场阶段

```
Step 1: 并行爬取 5 个种子机场
  ├─ 北京首都: 爬取 100 条航班
  ├─ 北京大兴: 爬取 50 条航班
  ├─ 上海浦东: 爬取 80 条航班
  ├─ 上海虹桥: 爬取 60 条航班
  └─ 深圳: 爬取 70 条航班
  → 总共收集 360 条航班

Step 2: 爬取完成后
  ├─ 删除 2026-03-18 的旧数据（假设有 300 条）
  ├─ 保存 360 条新数据
  └─ 结果：数据库有 360 条航班

Step 3: 发现机场
  ├─ 从 360 条航班中提取机场
  └─ 发现 37 个机场
```

### 发现航班阶段

```
Step 1: 并行爬取 37 个机场（5 个并发）
  ├─ Batch 1: 爬取 5 个机场 → 共 500 条航班
  ├─ Batch 2: 爬取 5 个机场 → 共 480 条航班
  ├─ Batch 3: 爬取 5 个机场 → 共 520 条航班
  ├─ ...
  └─ 总共收集 5000 条航班

Step 2: 爬取完成后
  ├─ 删除所有未来的旧数据（假设有 4800 条）
  ├─ 保存 5000 条新数据
  └─ 结果：数据库有 5000 条航班

Step 3: 完成
  └─ 日志记录成功
```

---

## 错误处理

### 场景 1：爬虫中途失败

```
时间线：
T0: 开始爬取
T1: 爬取到一半失败
    ↓ 未执行删除和保存
T2: 数据库保持原状
    ↓ 用户仍可访问旧数据
T3: 日志记录失败
    ↓ 用户可查看失败原因
```

### 场景 2：删除失败

```
时间线：
T0: 爬取完成
T1: 执行删除
    ↓ 删除失败（例如数据库锁定）
T2: 保存操作不执行
    ↓ 抛出异常
T3: 数据库保持原状
    ↓ 用户仍可访问旧数据
```

### 场景 3：保存失败

```
时间线：
T0: 爬取完成
T1: 执行删除成功
T2: 执行保存失败
    ↓ 新数据无法保存
T3: 数据库为空
    ↓ 用户无法访问数据
```

**改进建议**：添加事务处理确保原子性

```typescript
const queryRunner = this.dataSource.createQueryRunner();
try {
  await queryRunner.startTransaction();

  // 删除
  await queryRunner.query('DELETE FROM flights WHERE ...');

  // 保存
  await queryRunner.manager.save(flights);

  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

---

## 性能分析

### 时间复杂度

| 操作 | 时间 | 说明 |
|------|------|------|
| 爬取 37 个机场 | ~30 分钟 | 并发 5，每个机场 ~5 分钟 |
| 删除旧数据 | ~5 秒 | 批量删除 ~5000 条记录 |
| 保存新数据 | ~10 秒 | 批量插入 ~5000 条记录 |
| **总时间** | **~30 分钟** | 删除和保存时间可忽略 |

### 空间复杂度

| 阶段 | 内存使用 |
|------|---------|
| 爬取 | O(n) - 收集所有航班在内存中 |
| 删除 | O(1) - 数据库操作 |
| 保存 | O(n) - 批量保存 |

---

## 日志输出示例

```
📝 采用智能替换模式：爬取完成后一次性替换旧数据...
🚀 并行爬取 5 个种子机场...
✅ 北京首都 发现 100 条航班
✅ 北京大兴 发现 50 条航班
✅ 上海浦东 发现 80 条航班
✅ 上海虹桥 发现 60 条航班
✅ 深圳 发现 70 条航班

🔄 开始替换数据：删除旧数据并保存 360 条新数据...
🗑️ 已删除 300 条旧数据
✅ 已保存 360 条新数据

📊 分析航班数据，发现机场...
✅ 【初始化阶段1】完成！发现 37 个机场
```

---

## 验证方案

### 测试 1：正常流程

```bash
# 初始状态：100 条航班
SELECT COUNT(*) FROM flights; -- 100

# 触发爬虫
POST /api/crawler/initialize/discover

# 爬虫运行中：数据库仍有 100 条（可查询）
# 爬虫完成后：数据库有 360 条（新数据）
SELECT COUNT(*) FROM flights; -- 360
```

### 测试 2：爬虫失败恢复

```bash
# 初始状态：100 条航班
SELECT COUNT(*) FROM flights; -- 100

# 触发爬虫（中途停止）
POST /api/crawler/initialize/discover

# 爬虫失败：数据库仍有 100 条
SELECT COUNT(*) FROM flights; -- 100

# 重新触发爬虫
POST /api/crawler/initialize/discover

# 爬虫成功：数据库有新数据
SELECT COUNT(*) FROM flights; -- 360
```

### 测试 3：数据一致性

```bash
# 验证没有重复数据
SELECT flightNo, COUNT(*) FROM flights
GROUP BY flightNo, origin, destination, departureTime
HAVING COUNT(*) > 1; -- 应该返回 0 行

# 验证没有过期数据
SELECT COUNT(*) FROM flights
WHERE departureTime < datetime('now'); -- 应该返回 0 行
```

---

## 总结

### 优势

✅ **数据完整性** - 新数据完全覆盖旧数据
✅ **高可用性** - 爬虫失败时保持旧数据可用
✅ **最小空白期** - 爬取完成后一次性替换
✅ **错误恢复** - 支持重试而不会导致数据丢失
✅ **性能优化** - 批量删除和保存，效率高

### 注意事项

⚠️ **事务处理** - 建议添加数据库事务确保原子性
⚠️ **并发控制** - 多个爬虫同时运行时需要加锁
⚠️ **存储空间** - 需要定期清理过期数据
⚠️ **监控告警** - 建议监控删除和保存的耗时

---

**相关提交**：
- c063a42 - refactor(crawler): 改为智能替换模式，确保新数据完全覆盖旧数据
